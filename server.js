/* require('dotenv').config(); */
const crypto = require('crypto');
const bcrypt = require('bcrypt');
const express = require('express');
const cors = require('cors');
const db = require('./db');
const axios = require('axios'); // ✅ เพิ่ม axios
const dayjs = require('dayjs');
const path = require('path');
const app = express();
const PORT = process.env.PORT || 5000;
const { swaggerUi, swaggerSpec } = require('./swagger');

//รูปภาพ test report
const multer = require('multer');
const sharp = require('sharp');
const fs = require('fs');
const upload = multer({ storage: multer.memoryStorage() });

app.use(cors());
app.use(express.json());

process.on('uncaughtException', err => {
  console.error('Uncaught Exception:', err);
});

process.on('unhandledRejection', err => {
  console.error('Unhandled Rejection:', err);
});

// ✅ Swagger UI
app.use('/api-docs', swaggerUi.serve, swaggerUi.setup(swaggerSpec));

// ✅ เสิร์ฟไฟล์ภาพจาก public/img_upload
app.use('/img', express.static(path.join(__dirname, 'public', 'img_upload')));

app.get('/', (req, res) => {
  res.json({
    service: 'Inspection Management API',
    version: '1.0.0',
    status: 'running',
    uptime: process.uptime(),
    timestamp: new Date().toISOString()
  });
});

app.get('/health', (req, res) => res.status(200).send("OK"));

// 🔄 BC API - ใช้ axios
const { getBcAccessToken } = require('./bcAuth');

// 🔧 ช่วยสร้าง `$filter=Document_No eq 'SO-001' or ...`
function buildDocumentNoFilter(orderNos = []) {
  if (!orderNos.length) return "";
  const conditions = orderNos
    .map(no => `Document_No eq '${no.replace(/'/g, "''")}'`)
    .join(' or ');
  return `$filter=${conditions}`;
}

// 🔧 แบ่ง array เป็นชุดย่อย
function chunkArray(array, size) {
  const result = [];
  for (let i = 0; i < array.length; i += size) {
    result.push(array.slice(i, i + size));
  }
  return result;
}

app.post('/api/bc/data', async (req, res) => {
  const selectedYear = req.body.year || new Date().getFullYear();
  const selectedMonth = req.body.month; // << เพิ่มตรงนี้
  const branch = req.body.branch;

  // กำหนดวันที่เริ่ม/สิ้นสุด
  let startDate = `${selectedYear}-01-01`;
  let endDate = `${selectedYear}-12-31`;

  if (selectedMonth) {
    const paddedMonth = selectedMonth.padStart(2, '0');
    const start = new Date(`${selectedYear}-${paddedMonth}-01`);
    const end = new Date(start.getFullYear(), start.getMonth() + 1, 0); // สิ้นเดือน
    startDate = start.toISOString();      // ได้ '2024-07-01T00:00:00.000Z'
    endDate = end.toISOString();
  }

  try {
    const token = await getBcAccessToken();

    // ✅ ดึงเฉพาะช่วงวันที่ตามปี + เดือน
    const orderUrl = `https://api.businesscentral.dynamics.com/v2.0/${process.env.BC_TENANT_ID}/${process.env.BC_ENVIRONMENT}/ODataV4/Company('${process.env.BC_COMPANY_NAME}')/ServiceOrderList?$orderby=Order_Date desc&$filter=Status eq 'pending' and Order_Date ge ${startDate} and Order_Date le ${endDate} and Service_Order_Type ne 'ADD'`;

    const orderRes = await axios.get(orderUrl, {
      headers: {
        Authorization: `Bearer ${token}`,
        Accept: 'application/json'
      }
    });

    const allOrders = orderRes.data.value;


    // 2. ดึงรายการที่ inspect แล้วจาก MySQL
    const existingOrders = await new Promise((resolve, reject) => {
      db.query(
        'SELECT insp_service_order FROM tbl_inspection_list WHERE YEAR(insp_created_at) = ?',
        [selectedYear],
        (err, results) => {
          if (err) reject(err);
          else resolve(results.map(r => r.insp_service_order));
        }
      );
    });

    // 3. กรองเฉพาะรายการใหม่ + ตรง branch
    const filteredOrders = allOrders.filter(order =>
      !existingOrders.includes(order.No) &&
      (!branch || order.USVT_ResponsibilityCenter === branch)
    );

    const orderNos = filteredOrders.map(order => order.No);
    if (orderNos.length === 0) return res.json([]); // ไม่มีรายการใหม่

    // 4. แบ่ง batch แล้วดึง ServiceItemLines แยก
    const orderChunks = chunkArray(orderNos, 30); // ปลอดภัยประมาณ 30 รายการต่อชุด
    let allItems = [];

    for (const chunk of orderChunks) {
      const filter = buildDocumentNoFilter(chunk);
      const itemUrl = `https://api.businesscentral.dynamics.com/v2.0/${process.env.BC_TENANT_ID}/${process.env.BC_ENVIRONMENT}/ODataV4/Company('${process.env.BC_COMPANY_NAME}')/ServiceItemLines?${filter}`;

      const itemRes = await axios.get(itemUrl, {
        headers: {
          Authorization: `Bearer ${token}`,
          Accept: 'application/json'
        }
      });

      allItems = allItems.concat(itemRes.data.value);
    }

    // 5. รวมข้อมูล
    const joined = filteredOrders.map(order => {
      const relatedItems = allItems.filter(item => item.Document_No === order.No);
      return {
        ...order,
        Service_Item_No: relatedItems[0]?.Service_Item_No || '',
        Item_No: relatedItems[0]?.Item_No || '',
        // serviceItems: relatedItems // 👈 ถ้ายังไม่ต้องใช้เต็มชุด สามารถคอมเมนต์ไว้
      };
    });

    res.json(joined);
  } catch (err) {
    console.error('BC API JOIN Error:', err.message || err);
    res.status(500).json({ error: 'เกิดข้อผิดพลาดในการดึงข้อมูลจาก BC' });
  }

});

// 🔐 LOGIN
app.post('/api/login', (req, res) => {
  const { username, password, branch } = req.body || {};

  if (!username || !password || !branch) {
    return res.status(400).json({ error: 'กรุณากรอกข้อมูลให้ครบถ้วน' });
  }

  const sql = `
    SELECT * FROM u_user 
    WHERE username = ? 
      AND user_status = 1
  `;

  db.query(sql, [username], (err, results) => {
    if (err) return res.status(500).json({ error: 'Database error' });
    if (results.length === 0) return res.status(401).json({ error: 'ไม่พบผู้ใช้' });

    const user = results[0];
    const storedHash = user.password;

    // ✅ ตรวจรหัสผ่านแบบ async ด้วย .then()
    if (storedHash.startsWith('$2')) {
      bcrypt.compare(password, storedHash)
        .then((isMatch) => {
          if (!isMatch) return res.status(401).json({ error: 'รหัสผ่านไม่ถูกต้อง' });

          // ✅ สำเร็จ
          res.json({
            user_key: user.user_key,
            name: user.name,
            lastname: user.lastname,
            username: user.username,
            user_class: user.user_class,
            user_type: user.user_type,
            branch_log: user.branch_log,
            user_photo: user.user_photo
          });
        })
        .catch((err2) => {
          console.error('Password check error:', err2);
          res.status(500).json({ error: 'Server error' });
        });

    } else {
      // 🔒 เช็ครหัสแบบ MD5 เดิม
      const md5Hash = crypto.createHash('md5').update(password).digest('hex');
      const isMatch = (md5Hash === storedHash);

      if (!isMatch) return res.status(401).json({ error: 'รหัสผ่านไม่ถูกต้อง' });

      // ✅ สำเร็จ
      res.json({
        user_key: user.user_key,
        name: user.name,
        lastname: user.lastname,
        username: user.username,
        user_class: user.user_class,
        user_type: user.user_type,
        branch_log: user.branch_log,
        user_photo: user.user_photo
      });
    }
  });
});

/* 001-start-POST-inspection */
app.post('/api/inspection', (req, res) => {
  const {
    name,
    cusNo,
    branch,
    priority,
    sale_quote,
    service_order,
    service_type,
    service_item,
    document_date,
    motor_code,
    user_id
  } = req.body;

  const insp_station_now = 'Start';

  const insertSql = `
    INSERT INTO tbl_inspection_list (
      insp_customer_no,
      insp_customer_name,
      insp_branch,
      insp_priority,
      insp_sale_quote,
      insp_service_order,
      insp_service_type,
      insp_service_item,
      insp_document_date,
      insp_motor_code,
      insp_station_now
    ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
  `;

  db.query(
    insertSql,
    [cusNo, name, branch, priority, sale_quote, service_order, service_type, service_item, document_date, motor_code, insp_station_now],
    (err, result) => {
      if (err) {
        console.error('Insert Error:', err);
        return res.status(500).json({ error: 'ไม่สามารถบันทึกข้อมูลได้' });
      }

      const inspectionId = result.insertId;

      const logSql = `
        INSERT INTO logs_project (
          lpj_project_id,
          lpj_user_id,
          lpj_action,
          lpj_note
        ) VALUES (?, ?, 'OPEN_PROJECT', ?)
      `;

      const logNote = `สร้าง inspection ใหม่: ${sale_quote} / ${service_order}`;

      db.query(logSql, [inspectionId, user_id, logNote], (logErr) => {
        if (logErr) {
          console.error('Log Error:', logErr);
        }

        const selectSql = `
          SELECT insp_no FROM tbl_inspection_list WHERE insp_id = ?
        `;

        db.query(selectSql, [inspectionId], (selectErr, rows) => {
          if (selectErr || rows.length === 0) {
            console.error('Select insp_no Error:', selectErr);
            return res.json({ success: true, id: inspectionId });
          }

          const inspNo = rows[0].insp_no;
          res.json({ success: true, id: inspectionId, insp_no: inspNo });
        });
      });
    }
  );
});

/* 002-GET-Motor */
app.get('/api/motors', (req, res) => {
  db.query(
    'SELECT motor_code, motor_name FROM list_motor_type WHERE is_active = 1',
    (err, results) => {
      if (err) {
        console.error('Query motor error:', err);
        return res.status(500).json({ error: 'ไม่สามารถดึง motor ได้' });
      }
      res.json(results);
    }
  );
});

function createStepEndpoint(path, stationList, label) {
  app.get(path, (req, res) => {
    const placeholders = stationList.map(() => '?').join(', '); // eg: ?, ?, ?
    const sql = `
      SELECT 
        i.*, 
        tr.trp_service_order, 
        tr.trp_motor_code, 
        tr.trp_customer, 
        tr.trp_tag_no, 
        tr.trp_team,
        mt1.motor_name AS insp_motor_name,
        mt2.motor_name AS trp_motor_name
      FROM tbl_inspection_list i
      LEFT JOIN form_test_report tr ON i.insp_no = tr.insp_no
      LEFT JOIN list_motor_type mt1 ON i.insp_motor_code = mt1.motor_code
      LEFT JOIN list_motor_type mt2 ON tr.trp_motor_code = mt2.motor_code
      WHERE (
        i.insp_station_now IN (${placeholders})
        OR (
          i.insp_station_prev IN (${placeholders})
          AND i.insp_station_accept = '0'
        )
      )
      ORDER BY i.insp_created_at DESC
    `;

    db.query(sql, [...stationList, ...stationList], (err, results) => {
      if (err) {
        console.error(`Query error for ${label}:`, err);
        return res.status(500).json({ error: `ไม่สามารถดึง Step${label} ได้` });
      }

      const formatted = results.map(row => ({
        ...row,
        insp_document_date: row.insp_document_date
          ? dayjs(row.insp_document_date).format("YYYY-MM-DD")
          : null,
        insp_created_at: row.insp_created_at
          ? dayjs(row.insp_created_at).format("YYYY-MM-DD HH:mm:ss")
          : null
      }));

      res.json(formatted);
    });
  });
}

// ใช้งาน DRY Function สำหรับแต่ละ Station
createStepEndpoint('/api/StepQA', ['QA', 'QA final', 'QA appr'], 'QA');
createStepEndpoint('/api/StepME', ['ME', 'ME Final'], 'ME');
createStepEndpoint('/api/StepPlanning', ['PLANNING'], 'Planning');
createStepEndpoint('/api/StepCS', ['CS', 'CS Prove'], 'CS');

/* 004-station 001 */
app.post("/api/send_station001", (req, res) => {
  const { insp_id, next_station, user_id } = req.body;

  // 1. อัปเดต inspection หลัก
  const updateSql = `
    UPDATE tbl_inspection_list 
    SET insp_station_prev = insp_station_now, 
        insp_station_now = ?, 
        insp_station_accept = '0',
        insp_status = 'In Progress', 
        inspection_updated_at = NOW() 
    WHERE insp_id = ?
  `;

  db.query(updateSql, [next_station, insp_id], (err, result) => {
    if (err) {
      console.error("Update error:", err);
      return res.status(500).json({ error: "ไม่สามารถอัปเดตสถานีได้" });
    }

    // 2. Insert log เข้า logs_inspection_stations
    const insertLogSql = `
      INSERT INTO logs_inspection_stations (
        insp_id,
        station_step,
        station_name,
        station_status,
        station_timestamp,
        created_at,
        user_id
      ) VALUES (?, ?, ?, ?, NOW(), NOW(), ?)
    `;

    db.query(
      insertLogSql,
      [insp_id, '1', next_station, 'In Progress', user_id],
      (err2) => {
        if (err2) {
          console.error("Log insert error:", err2);
          return res.status(500).json({ error: "บันทึก timeline ไม่สำเร็จ" });
        }

        res.json({ success: true });
      }
    );
  });
});

/* 004-station 002 */
app.post("/api/accept_station", (req, res) => {
  const { insp_id, user_id } = req.body;

  // 1. ดึงข้อมูลสถานีปัจจุบันก่อน
  const getStationSql = `
    SELECT insp_station_now 
    FROM tbl_inspection_list 
    WHERE insp_id = ?
  `;

  db.query(getStationSql, [insp_id], (err, results) => {
    if (err || results.length === 0) {
      console.error("Fetch station error:", err);
      return res.status(500).json({ error: "ไม่พบข้อมูลสถานีหรือเกิดข้อผิดพลาด" });
    }

    const currentStation = results[0].insp_station_now;

    // 2. อัปเดต inspection หลัก
    const updateSql = `
      UPDATE tbl_inspection_list 
      SET insp_station_accept = '2', 
          inspection_updated_at = NOW() 
      WHERE insp_id = ?
    `;

    db.query(updateSql, [insp_id], (err2) => {
      if (err2) {
        console.error("Update error:", err2);
        return res.status(500).json({ error: "ไม่สามารถอัปเดตสถานีได้" });
      }

      // 3. Insert log เข้า logs_inspection_stations โดยใช้ currentStation
      const insertLogSql = `
        INSERT INTO logs_inspection_stations (
          insp_id,
          station_step,
          station_name,
          station_status,
          station_timestamp,
          created_at,
          user_id
        ) VALUES (?, ?, ?, ?, NOW(), NOW(), ?)
      `;

      db.query(
        insertLogSql,
        [insp_id, '2', currentStation, 'In Progress', user_id],
        (err3) => {
          if (err3) {
            console.error("Log insert error:", err3);
            return res.status(500).json({ error: "บันทึก timeline ไม่สำเร็จ" });
          }

          res.json({ success: true });
        }
      );
    });
  });
});

/* 005-list-station */
app.get("/api/list_station", (req, res) => {
  const sql = `SELECT station_code, station_name FROM list_station WHERE is_active = 1 ORDER BY station_name`;

  db.query(sql, (err, results) => {
    if (err) {
      console.error("Query station error:", err);
      return res.status(500).json({ error: "ไม่สามารถดึงรายการสถานีได้" });
    }
    res.json(results);
  });
});

// 006- GET /api/inspection/:id
app.get("/api/inspection/:id", (req, res) => {
  const { id } = req.params;

  const sql = `
  SELECT 
  i.insp_id,
  i.insp_no,
  i.insp_customer_name,
  i.insp_customer_no,
  i.insp_sale_quote,
  i.insp_service_order,
  i.insp_service_type,
  i.insp_service_item,
  i.insp_document_date,
  i.insp_status,
  i.insp_created_at,
  i.insp_motor_code,
  mt1.motor_name AS insp_motor_name,         -- ✅ motor จาก insp
  i.insp_station_user,
  i.insp_station_now,
  i.insp_station_prev,
  i.inspection_updated_at,
  i.insp_incoming_date,
  i.insp_final_date,
  tr.trp_motor_code,
  mt2.motor_name AS trp_motor_name           -- ✅ motor จาก test report
FROM tbl_inspection_list i
LEFT JOIN form_test_report tr ON i.insp_no = tr.insp_no
LEFT JOIN list_motor_type mt1 ON i.insp_motor_code = mt1.motor_code
LEFT JOIN list_motor_type mt2 ON tr.trp_motor_code = mt2.motor_code
WHERE i.insp_no = ?

`;


  db.query(sql, [id], (err, results) => {
    if (err) {
      console.error("Database error:", err);
      return res.status(500).json({ error: "เกิดข้อผิดพลาดในการเชื่อมต่อฐานข้อมูล" });
    }

    if (results.length === 0) {
      return res.status(404).json({ error: "ไม่พบข้อมูลใบงานนี้" });
    }

    res.json(results[0]); // ✅ ส่งแถวเดียว
  });
});

// ⬇️ FormTestReport
app.get('/api/forms/FormTestReport/:insp_no', (req, res) => {
  const { insp_no } = req.params;
  db.query(`
    SELECT 
      ins.*, 
      tr.*, 
      updater.name AS updated_by_name,
      creator.name AS created_by_name
    FROM tbl_inspection_list ins
    LEFT JOIN form_test_report tr ON ins.insp_no = tr.insp_no
    LEFT JOIN u_user updater ON tr.updated_by = updater.user_key
    LEFT JOIN u_user creator ON tr.created_by = creator.user_key
    WHERE ins.insp_no = ?
  `, [insp_no], (err, rows) => {
    if (err) {
      console.error("GET form_test_report error:", err);
      return res.status(500).json({ error: "Internal Server Error" });
    }

    if (rows.length === 0) return res.json(null);

    const row = rows[0];

    // ✅ แปลงวันที่
    if (row.updated_at) {
      row.updated_at = dayjs(row.updated_at).format('DD/MM/YYYY HH:mm');
    }
    if (row.insp_created_at) {
      row.insp_created_at = dayjs(row.insp_created_at).format('DD/MM/YYYY HH:mm');
    }

    // ✅ ดักกรณีไม่มี updated_by → ใช้ created_by → ถ้าไม่มีอีก ใส่ "K/A"
    if (!row.updated_by_name) {
      row.updated_by_name = row.created_by_name || "K/A";
    }

    res.json(row);
  });
});

app.post('/api/forms/FormTestReport/:insp_no', (req, res) => {
  const { insp_no } = req.params;
  const payload = req.body;
  const user_id = payload.userKey;

  const normalizeDate = (value) => {
    if (!value || value === '') return null;
    try {
      return new Date(value).toISOString().slice(0, 19).replace('T', ' ');
    } catch {
      return null;
    }
  };

  const mapFields = (data) => ({
    trp_motor_code: data.motorCode,
    trp_service_order: data.serviceOrder,
    trp_service_item: data.serviceItem,
    trp_id_text: data.id,
    trp_project_no: data.projectNo,
    trp_customer_no: data.cusNo,
    trp_so_id: data.soId,
    trp_customer: data.customer,
    trp_erp_mat: data.erpMat,
    trp_job_no: data.jobNo,
    trp_tag_no: data.tagNo,
    trp_prq_no: data.prqNo,
    trp_team: data.team,
    trp_attention: data.attention,
    trp_location: data.location,
    trp_service_type: data.serviceType,
    trp_urgency: data.urgency,
    trp_approve_date: normalizeDate(data.approveDate),
    trp_incoming_date: normalizeDate(data.incomingDate),
    trp_final_date: normalizeDate(data.finalDate),
    trp_report_date: normalizeDate(data.reportDate),
    trp_direction: data.direction,
    trp_note: data.note
  });

  db.query("SELECT * FROM form_test_report WHERE insp_no = ?", [insp_no], (err, existing) => {
    if (err) {
      console.error("POST form_testreport error (select):", err);
      return res.status(500).json({ error: "Internal Server Error" });
    }

    const saveAndSendStation = () => {
      if (payload.stationNow === 'Start' && payload.stationTo) {
        // ✅ ดึง insp_id จากตาราง inspection
        db.query("SELECT insp_id FROM tbl_inspection_list WHERE insp_no = ?", [insp_no], (errFind, result) => {
          if (errFind || result.length === 0) {
            console.error("หา insp_id ไม่เจอ:", errFind);
            return res.status(500).json({ error: "ไม่พบข้อมูล insp_id" });
          }

          const insp_id = result[0].insp_id;

          const stationPayload = {
            insp_id: insp_id,
            next_station: payload.stationTo,
            user_id: user_id
          };

          // จากนั้นเขียน update + insert timeline ตามเดิม
          db.query(`
        UPDATE tbl_inspection_list 
        SET insp_station_prev = insp_station_now, 
            insp_station_now = ?, 
            insp_status = 'In Progress', 
            inspection_updated_at = NOW() 
        WHERE insp_id = ?
      `, [stationPayload.next_station, stationPayload.insp_id], (errUpdate) => {
            if (errUpdate) {
              console.error("Update error (station):", errUpdate);
              return res.status(500).json({ error: "ไม่สามารถอัปเดตสถานีได้" });
            }

            db.query(`
          INSERT INTO logs_inspection_stations (
            insp_id,
            station_step,
            station_name,
            station_status,
            station_timestamp,
            created_at,
            user_id
          ) VALUES (?, ?, ?, ?, NOW(), NOW(), ?)
        `, [stationPayload.insp_id, '001', stationPayload.next_station, 'In Progress', stationPayload.user_id], (errInsert) => {
              if (errInsert) {
                console.error("Log insert error (station):", errInsert);
                return res.status(500).json({ error: "บันทึก timeline ไม่สำเร็จ" });
              }

              return res.json({ success: true });
            });
          });
        });
      } else {
        return res.json({ success: true });
      }
    };


    if (existing.length > 0) {
      const updateData = {
        ...mapFields(payload),
        updated_by: user_id,
        updated_at: new Date()
      };
      db.query("UPDATE form_test_report SET ? WHERE insp_no = ?", [updateData, insp_no], (err2) => {
        if (err2) {
          console.error("POST form_testreport error (update):", err2);
          return res.status(500).json({ error: "Internal Server Error" });
        }
        saveAndSendStation();
      });
    } else {
      const insertData = {
        ...mapFields(payload),
        insp_no,
        created_by: user_id,
        created_at: new Date()
      };
      db.query("INSERT INTO form_test_report SET ?", [insertData], (err3) => {
        if (err3) {
          console.error("POST form_testreport error (insert):", err3);
          return res.status(500).json({ error: "Internal Server Error" });
        }
        saveAndSendStation();
      });
    }
  });
});

app.post('/api/upload', upload.single('file'), async (req, res) => {
  try {
    const { inspNo } = req.body;
    if (!inspNo || !req.file) {
      return res.status(400).json({ error: 'Missing inspNo or file' });
    }

    const fileName = req.file.originalname.replace(/\s+/g, '_').replace(/[^a-zA-Z0-9._-]/g, '');
    const outputPath = path.join(__dirname, 'public', 'img_upload', fileName);

    // ✅ ตรวจสอบชื่อไฟล์ซ้ำ
    if (fs.existsSync(outputPath)) {
      return res.status(409).json({ error: 'ไฟล์นี้มีอยู่แล้ว' });
    }

    // ✅ บีบอัดและบันทึก
    await sharp(req.file.buffer)
      .jpeg({ quality: 70 })
      .toFile(outputPath);

    // ✅ เพิ่มชื่อรูปเข้า trp_img_name
    const updateSql = `
      UPDATE form_test_report
      SET trp_img_name = TRIM(BOTH ',' FROM CONCAT_WS(',', trp_img_name, ?))
      WHERE insp_no = ?
    `;
    db.query(updateSql, [fileName, inspNo], (err) => {
      if (err) {
        console.error("DB update error:", err);
        return res.status(500).json({ error: 'Database update failed' });
      }
      res.json({ success: true, filename: fileName });
    });

  } catch (err) {
    console.error("Upload error:", err);
    res.status(500).json({ error: 'Image upload failed' });
  }
});

app.delete('/api/upload', (req, res) => {
  const { filename, inspNo } = req.body;
  const filePath = path.join(__dirname, 'public', 'img_upload', filename);

  fs.unlink(filePath, (err) => {
    if (err) {
      console.error("Delete file error:", err);
      return res.status(500).json({ error: 'Delete failed' });
    }

    // ลบชื่อภาพออกจาก trp_img_name
    const updateSql = `
      UPDATE form_test_report
      SET trp_img_name = REPLACE(CONCAT(',', trp_img_name, ','), CONCAT(',', ?, ','), ',')
      WHERE insp_no = ?
    `;
    db.query(updateSql, [filename, inspNo], (err2) => {
      if (err2) {
        console.error("DB update after delete failed:", err2);
        return res.status(500).json({ error: 'DB update failed' });
      }
      res.json({ success: true });
    });
  });
});

// ⬇️ FormMotorNameplate
app.get('/api/forms/FormMotorNameplate/:insp_id', (req, res) => {
  const { insp_id } = req.params;
  db.query(`
    SELECT * FROM tbl_inspection_list ins    
    LEFT JOIN form_motor_nameplate mn
    ON ins.insp_id = mn.insp_id
    WHERE insp_id = ?
    `, [insp_id], (err, rows) => {
    if (err) {
      console.error("GET form_motor_nameplate error:", err);
      return res.status(500).json({ error: "Internal Server Error" });
    }
    res.json(rows.length > 0 ? rows[0] : null);
  });
});

app.post('/api/forms/FormMotorNameplate/:insp_id', (req, res) => {
  const { insp_id } = req.params;
  const payload = req.body;
  const user_id = req.session?.user_id || 0;

  db.query("SELECT * FROM form_motornameplate WHERE insp_id = ?", [insp_id], (err, existing) => {
    if (err) {
      console.error("POST form_motornameplate error (select):", err);
      return res.status(500).json({ error: "Internal Server Error" });
    }
    if (existing.length > 0) {
      db.query("UPDATE form_motornameplate SET ?, updated_by=?, updated_at=NOW() WHERE insp_id = ?", [payload, user_id, insp_id], (err2) => {
        if (err2) {
          console.error("POST form_motornameplate error (update):", err2);
          return res.status(500).json({ error: "Internal Server Error" });
        }
        res.json({ success: true });
      });
    } else {
      db.query("INSERT INTO form_motornameplate SET ?, insp_id=?, created_by=?, created_at=NOW()", [payload, insp_id, user_id], (err3) => {
        if (err3) {
          console.error("POST form_motornameplate error (insert):", err3);
          return res.status(500).json({ error: "Internal Server Error" });
        }
        res.json({ success: true });
      });
    }
  });
});

// ⬇️ FormStaticTest
app.get('/api/forms/FormStaticTest/:insp_id', (req, res) => {
  const { insp_id } = req.params;
  db.query("SELECT * FROM form_statictest WHERE insp_id = ?", [insp_id], (err, rows) => {
    if (err) {
      console.error("GET form_statictest error:", err);
      return res.status(500).json({ error: "Internal Server Error" });
    }
    res.json(rows.length > 0 ? rows[0] : null);
  });
});

app.post('/api/forms/FormStaticTest/:insp_id', (req, res) => {
  const { insp_id } = req.params;
  const payload = req.body;
  const user_id = req.session?.user_id || 0;

  db.query("SELECT * FROM form_statictest WHERE insp_id = ?", [insp_id], (err, existing) => {
    if (err) {
      console.error("POST form_statictest error (select):", err);
      return res.status(500).json({ error: "Internal Server Error" });
    }
    if (existing.length > 0) {
      db.query("UPDATE form_statictest SET ?, updated_by=?, updated_at=NOW() WHERE insp_id = ?", [payload, user_id, insp_id], (err2) => {
        if (err2) {
          console.error("POST form_statictest error (update):", err2);
          return res.status(500).json({ error: "Internal Server Error" });
        }
        res.json({ success: true });
      });
    } else {
      db.query("INSERT INTO form_statictest SET ?, insp_id=?, created_by=?, created_at=NOW()", [payload, insp_id, user_id], (err3) => {
        if (err3) {
          console.error("POST form_statictest error (insert):", err3);
          return res.status(500).json({ error: "Internal Server Error" });
        }
        res.json({ success: true });
      });
    }
  });
});

// ⬇️ FormEquipmentTest
app.get('/api/forms/FormEquipmentTest/:insp_id', (req, res) => {
  const { insp_id } = req.params;
  db.query("SELECT * FROM form_equipmenttest WHERE insp_id = ?", [insp_id], (err, rows) => {
    if (err) {
      console.error("GET form_equipmenttest error:", err);
      return res.status(500).json({ error: "Internal Server Error" });
    }
    res.json(rows.length > 0 ? rows[0] : null);
  });
});

app.post('/api/forms/FormEquipmentTest/:insp_id', (req, res) => {
  const { insp_id } = req.params;
  const payload = req.body;
  const user_id = req.session?.user_id || 0;

  db.query("SELECT * FROM form_equipmenttest WHERE insp_id = ?", [insp_id], (err, existing) => {
    if (err) {
      console.error("POST form_equipmenttest error (select):", err);
      return res.status(500).json({ error: "Internal Server Error" });
    }
    if (existing.length > 0) {
      db.query("UPDATE form_equipmenttest SET ?, updated_by=?, updated_at=NOW() WHERE insp_id = ?", [payload, user_id, insp_id], (err2) => {
        if (err2) {
          console.error("POST form_equipmenttest error (update):", err2);
          return res.status(500).json({ error: "Internal Server Error" });
        }
        res.json({ success: true });
      });
    } else {
      db.query("INSERT INTO form_equipmenttest SET ?, insp_id=?, created_by=?, created_at=NOW()", [payload, insp_id, user_id], (err3) => {
        if (err3) {
          console.error("POST form_equipmenttest error (insert):", err3);
          return res.status(500).json({ error: "Internal Server Error" });
        }
        res.json({ success: true });
      });
    }
  });
});

// ⬇️ FormDynamicTest
app.get('/api/forms/FormDynamicTest/:insp_id', (req, res) => {
  const { insp_id } = req.params;
  db.query("SELECT * FROM form_dynamictest WHERE insp_id = ?", [insp_id], (err, rows) => {
    if (err) {
      console.error("GET form_dynamictest error:", err);
      return res.status(500).json({ error: "Internal Server Error" });
    }
    res.json(rows.length > 0 ? rows[0] : null);
  });
});

app.post('/api/forms/FormDynamicTest/:insp_id', (req, res) => {
  const { insp_id } = req.params;
  const payload = req.body;
  const user_id = req.session?.user_id || 0;

  db.query("SELECT * FROM form_dynamictest WHERE insp_id = ?", [insp_id], (err, existing) => {
    if (err) {
      console.error("POST form_dynamictest error (select):", err);
      return res.status(500).json({ error: "Internal Server Error" });
    }
    if (existing.length > 0) {
      db.query("UPDATE form_dynamictest SET ?, updated_by=?, updated_at=NOW() WHERE insp_id = ?", [payload, user_id, insp_id], (err2) => {
        if (err2) {
          console.error("POST form_dynamictest error (update):", err2);
          return res.status(500).json({ error: "Internal Server Error" });
        }
        res.json({ success: true });
      });
    } else {
      db.query("INSERT INTO form_dynamictest SET ?, insp_id=?, created_by=?, created_at=NOW()", [payload, insp_id, user_id], (err3) => {
        if (err3) {
          console.error("POST form_dynamictest error (insert):", err3);
          return res.status(500).json({ error: "Internal Server Error" });
        }
        res.json({ success: true });
      });
    }
  });
});

// ⬇️ FormHousingShaft
app.get('/api/forms/FormHousingShaft/:insp_id', (req, res) => {
  const { insp_id } = req.params;
  db.query("SELECT * FROM form_housingshaft WHERE insp_id = ?", [insp_id], (err, rows) => {
    if (err) {
      console.error("GET form_housingshaft error:", err);
      return res.status(500).json({ error: "Internal Server Error" });
    }
    res.json(rows.length > 0 ? rows[0] : null);
  });
});

app.post('/api/forms/FormHousingShaft/:insp_id', (req, res) => {
  const { insp_id } = req.params;
  const payload = req.body;
  const user_id = req.session?.user_id || 0;

  db.query("SELECT * FROM form_housingshaft WHERE insp_id = ?", [insp_id], (err, existing) => {
    if (err) {
      console.error("POST form_housingshaft error (select):", err);
      return res.status(500).json({ error: "Internal Server Error" });
    }
    if (existing.length > 0) {
      db.query("UPDATE form_housingshaft SET ?, updated_by=?, updated_at=NOW() WHERE insp_id = ?", [payload, user_id, insp_id], (err2) => {
        if (err2) {
          console.error("POST form_housingshaft error (update):", err2);
          return res.status(500).json({ error: "Internal Server Error" });
        }
        res.json({ success: true });
      });
    } else {
      db.query("INSERT INTO form_housingshaft SET ?, insp_id=?, created_by=?, created_at=NOW()", [payload, insp_id, user_id], (err3) => {
        if (err3) {
          console.error("POST form_housingshaft error (insert):", err3);
          return res.status(500).json({ error: "Internal Server Error" });
        }
        res.json({ success: true });
      });
    }
  });
});

// ⬇️ FormRequisition
app.get('/api/forms/FormRequisition/:insp_id', (req, res) => {
  const { insp_id } = req.params;
  db.query("SELECT * FROM form_requisition WHERE insp_id = ?", [insp_id], (err, rows) => {
    if (err) {
      console.error("GET form_requisition error:", err);
      return res.status(500).json({ error: "Internal Server Error" });
    }
    res.json(rows.length > 0 ? rows[0] : null);
  });
});

app.post('/api/forms/FormRequisition/:insp_id', (req, res) => {
  const { insp_id } = req.params;
  const payload = req.body;
  const user_id = req.session?.user_id || 0;

  db.query("SELECT * FROM form_requisition WHERE insp_id = ?", [insp_id], (err, existing) => {
    if (err) {
      console.error("POST form_requisition error (select):", err);
      return res.status(500).json({ error: "Internal Server Error" });
    }
    if (existing.length > 0) {
      db.query("UPDATE form_requisition SET ?, updated_by=?, updated_at=NOW() WHERE insp_id = ?", [payload, user_id, insp_id], (err2) => {
        if (err2) {
          console.error("POST form_requisition error (update):", err2);
          return res.status(500).json({ error: "Internal Server Error" });
        }
        res.json({ success: true });
      });
    } else {
      db.query("INSERT INTO form_requisition SET ?, insp_id=?, created_by=?, created_at=NOW()", [payload, insp_id, user_id], (err3) => {
        if (err3) {
          console.error("POST form_requisition error (insert):", err3);
          return res.status(500).json({ error: "Internal Server Error" });
        }
        res.json({ success: true });
      });
    }
  });
});

// ⬇️ FormBalance
app.get('/api/forms/FormBalance/:insp_id', (req, res) => {
  const { insp_id } = req.params;
  db.query("SELECT * FROM form_balance WHERE insp_id = ?", [insp_id], (err, rows) => {
    if (err) {
      console.error("GET form_balance error:", err);
      return res.status(500).json({ error: "Internal Server Error" });
    }
    res.json(rows.length > 0 ? rows[0] : null);
  });
});

app.post('/api/forms/FormBalance/:insp_id', (req, res) => {
  const { insp_id } = req.params;
  const payload = req.body;
  const user_id = req.session?.user_id || 0;

  db.query("SELECT * FROM form_balance WHERE insp_id = ?", [insp_id], (err, existing) => {
    if (err) {
      console.error("POST form_balance error (select):", err);
      return res.status(500).json({ error: "Internal Server Error" });
    }
    if (existing.length > 0) {
      db.query("UPDATE form_balance SET ?, updated_by=?, updated_at=NOW() WHERE insp_id = ?", [payload, user_id, insp_id], (err2) => {
        if (err2) {
          console.error("POST form_balance error (update):", err2);
          return res.status(500).json({ error: "Internal Server Error" });
        }
        res.json({ success: true });
      });
    } else {
      db.query("INSERT INTO form_balance SET ?, insp_id=?, created_by=?, created_at=NOW()", [payload, insp_id, user_id], (err3) => {
        if (err3) {
          console.error("POST form_balance error (insert):", err3);
          return res.status(500).json({ error: "Internal Server Error" });
        }
        res.json({ success: true });
      });
    }
  });
});

// ⬇️ FormElectricalServices
app.get('/api/forms/FormElectricalServices/:insp_id', (req, res) => {
  const { insp_id } = req.params;
  db.query("SELECT * FROM form_electricalservices WHERE insp_id = ?", [insp_id], (err, rows) => {
    if (err) {
      console.error("GET form_electricalservices error:", err);
      return res.status(500).json({ error: "Internal Server Error" });
    }
    res.json(rows.length > 0 ? rows[0] : null);
  });
});

app.post('/api/forms/FormElectricalServices/:insp_id', (req, res) => {
  const { insp_id } = req.params;
  const payload = req.body;
  const user_id = req.session?.user_id || 0;

  db.query("SELECT * FROM form_electricalservices WHERE insp_id = ?", [insp_id], (err, existing) => {
    if (err) {
      console.error("POST form_electricalservices error (select):", err);
      return res.status(500).json({ error: "Internal Server Error" });
    }
    if (existing.length > 0) {
      db.query("UPDATE form_electricalservices SET ?, updated_by=?, updated_at=NOW() WHERE insp_id = ?", [payload, user_id, insp_id], (err2) => {
        if (err2) {
          console.error("POST form_electricalservices error (update):", err2);
          return res.status(500).json({ error: "Internal Server Error" });
        }
        res.json({ success: true });
      });
    } else {
      db.query("INSERT INTO form_electricalservices SET ?, insp_id=?, created_by=?, created_at=NOW()", [payload, insp_id, user_id], (err3) => {
        if (err3) {
          console.error("POST form_electricalservices error (insert):", err3);
          return res.status(500).json({ error: "Internal Server Error" });
        }
        res.json({ success: true });
      });
    }
  });
});

// ⬇️ FormInstruments
app.get('/api/forms/FormInstruments/:insp_id', (req, res) => {
  const { insp_id } = req.params;
  db.query("SELECT * FROM form_instruments WHERE insp_id = ?", [insp_id], (err, rows) => {
    if (err) {
      console.error("GET form_instruments error:", err);
      return res.status(500).json({ error: "Internal Server Error" });
    }
    res.json(rows.length > 0 ? rows[0] : null);
  });
});

app.post('/api/forms/FormInstruments/:insp_id', (req, res) => {
  const { insp_id } = req.params;
  const payload = req.body;
  const user_id = req.session?.user_id || 0;

  db.query("SELECT * FROM form_instruments WHERE insp_id = ?", [insp_id], (err, existing) => {
    if (err) {
      console.error("POST form_instruments error (select):", err);
      return res.status(500).json({ error: "Internal Server Error" });
    }
    if (existing.length > 0) {
      db.query("UPDATE form_instruments SET ?, updated_by=?, updated_at=NOW() WHERE insp_id = ?", [payload, user_id, insp_id], (err2) => {
        if (err2) {
          console.error("POST form_instruments error (update):", err2);
          return res.status(500).json({ error: "Internal Server Error" });
        }
        res.json({ success: true });
      });
    } else {
      db.query("INSERT INTO form_instruments SET ?, insp_id=?, created_by=?, created_at=NOW()", [payload, insp_id, user_id], (err3) => {
        if (err3) {
          console.error("POST form_instruments error (insert):", err3);
          return res.status(500).json({ error: "Internal Server Error" });
        }
        res.json({ success: true });
      });
    }
  });
});

// ⬇️ FormCoilBrakeTest
app.get('/api/forms/FormCoilBrakeTest/:insp_id', (req, res) => {
  const { insp_id } = req.params;
  db.query("SELECT * FROM form_coilbraketest WHERE insp_id = ?", [insp_id], (err, rows) => {
    if (err) {
      console.error("GET form_coilbraketest error:", err);
      return res.status(500).json({ error: "Internal Server Error" });
    }
    res.json(rows.length > 0 ? rows[0] : null);
  });
});

app.post('/api/forms/FormCoilBrakeTest/:insp_id', (req, res) => {
  const { insp_id } = req.params;
  const payload = req.body;
  const user_id = req.session?.user_id || 0;

  db.query("SELECT * FROM form_coilbraketest WHERE insp_id = ?", [insp_id], (err, existing) => {
    if (err) {
      console.error("POST form_coilbraketest error (select):", err);
      return res.status(500).json({ error: "Internal Server Error" });
    }
    if (existing.length > 0) {
      db.query("UPDATE form_coilbraketest SET ?, updated_by=?, updated_at=NOW() WHERE insp_id = ?", [payload, user_id, insp_id], (err2) => {
        if (err2) {
          console.error("POST form_coilbraketest error (update):", err2);
          return res.status(500).json({ error: "Internal Server Error" });
        }
        res.json({ success: true });
      });
    } else {
      db.query("INSERT INTO form_coilbraketest SET ?, insp_id=?, created_by=?, created_at=NOW()", [payload, insp_id, user_id], (err3) => {
        if (err3) {
          console.error("POST form_coilbraketest error (insert):", err3);
          return res.status(500).json({ error: "Internal Server Error" });
        }
        res.json({ success: true });
      });
    }
  });
});

// ⬇️ FormApproval
app.get('/api/forms/FormApproval/:insp_id', (req, res) => {
  const { insp_id } = req.params;
  db.query("SELECT * FROM form_approval WHERE insp_id = ?", [insp_id], (err, rows) => {
    if (err) {
      console.error("GET form_approval error:", err);
      return res.status(500).json({ error: "Internal Server Error" });
    }
    res.json(rows.length > 0 ? rows[0] : null);
  });
});

app.post('/api/forms/FormApproval/:insp_id', (req, res) => {
  const { insp_id } = req.params;
  const payload = req.body;
  const user_id = req.session?.user_id || 0;

  db.query("SELECT * FROM form_approval WHERE insp_id = ?", [insp_id], (err, existing) => {
    if (err) {
      console.error("POST form_approval error (select):", err);
      return res.status(500).json({ error: "Internal Server Error" });
    }
    if (existing.length > 0) {
      db.query("UPDATE form_approval SET ?, updated_by=?, updated_at=NOW() WHERE insp_id = ?", [payload, user_id, insp_id], (err2) => {
        if (err2) {
          console.error("POST form_approval error (update):", err2);
          return res.status(500).json({ error: "Internal Server Error" });
        }
        res.json({ success: true });
      });
    } else {
      db.query("INSERT INTO form_approval SET ?, insp_id=?, created_by=?, created_at=NOW()", [payload, insp_id, user_id], (err3) => {
        if (err3) {
          console.error("POST form_approval error (insert):", err3);
          return res.status(500).json({ error: "Internal Server Error" });
        }
        res.json({ success: true });
      });
    }
  });
});

// ⬇️ FormMechanicalServices
app.get('/api/forms/FormMechanicalServices/:insp_id', (req, res) => {
  const { insp_id } = req.params;
  db.query("SELECT * FROM form_mechanicalservices WHERE insp_id = ?", [insp_id], (err, rows) => {
    if (err) {
      console.error("GET form_mechanicalservices error:", err);
      return res.status(500).json({ error: "Internal Server Error" });
    }
    res.json(rows.length > 0 ? rows[0] : null);
  });
});

app.post('/api/forms/FormMechanicalServices/:insp_id', (req, res) => {
  const { insp_id } = req.params;
  const payload = req.body;
  const user_id = req.session?.user_id || 0;

  db.query("SELECT * FROM form_mechanicalservices WHERE insp_id = ?", [insp_id], (err, existing) => {
    if (err) {
      console.error("POST form_mechanicalservices error (select):", err);
      return res.status(500).json({ error: "Internal Server Error" });
    }
    if (existing.length > 0) {
      db.query("UPDATE form_mechanicalservices SET ?, updated_by=?, updated_at=NOW() WHERE insp_id = ?", [payload, user_id, insp_id], (err2) => {
        if (err2) {
          console.error("POST form_mechanicalservices error (update):", err2);
          return res.status(500).json({ error: "Internal Server Error" });
        }
        res.json({ success: true });
      });
    } else {
      db.query("INSERT INTO form_mechanicalservices SET ?, insp_id=?, created_by=?, created_at=NOW()", [payload, insp_id, user_id], (err3) => {
        if (err3) {
          console.error("POST form_mechanicalservices error (insert):", err3);
          return res.status(500).json({ error: "Internal Server Error" });
        }
        res.json({ success: true });
      });
    }
  });
});

// ⬇️ FormMechanicalInspectionData
app.get('/api/forms/FormMechanicalInspectionData/:insp_id', (req, res) => {
  const { insp_id } = req.params;
  db.query("SELECT * FROM form_mechanicalinspectiondata WHERE insp_id = ?", [insp_id], (err, rows) => {
    if (err) {
      console.error("GET form_mechanicalinspectiondata error:", err);
      return res.status(500).json({ error: "Internal Server Error" });
    }
    res.json(rows.length > 0 ? rows[0] : null);
  });
});

app.post('/api/forms/FormMechanicalInspectionData/:insp_id', (req, res) => {
  const { insp_id } = req.params;
  const payload = req.body;
  const user_id = req.session?.user_id || 0;

  db.query("SELECT * FROM form_mechanicalinspectiondata WHERE insp_id = ?", [insp_id], (err, existing) => {
    if (err) {
      console.error("POST form_mechanicalinspectiondata error (select):", err);
      return res.status(500).json({ error: "Internal Server Error" });
    }
    if (existing.length > 0) {
      db.query("UPDATE form_mechanicalinspectiondata SET ?, updated_by=?, updated_at=NOW() WHERE insp_id = ?", [payload, user_id, insp_id], (err2) => {
        if (err2) {
          console.error("POST form_mechanicalinspectiondata error (update):", err2);
          return res.status(500).json({ error: "Internal Server Error" });
        }
        res.json({ success: true });
      });
    } else {
      db.query("INSERT INTO form_mechanicalinspectiondata SET ?, insp_id=?, created_by=?, created_at=NOW()", [payload, insp_id, user_id], (err3) => {
        if (err3) {
          console.error("POST form_mechanicalinspectiondata error (insert):", err3);
          return res.status(500).json({ error: "Internal Server Error" });
        }
        res.json({ success: true });
      });
    }
  });
});

// ⬇️ FormLaserAlignment
app.get('/api/forms/FormLaserAlignment/:insp_id', (req, res) => {
  const { insp_id } = req.params;
  db.query("SELECT * FROM form_laseralignment WHERE insp_id = ?", [insp_id], (err, rows) => {
    if (err) {
      console.error("GET form_laseralignment error:", err);
      return res.status(500).json({ error: "Internal Server Error" });
    }
    res.json(rows.length > 0 ? rows[0] : null);
  });
});

app.post('/api/forms/FormLaserAlignment/:insp_id', (req, res) => {
  const { insp_id } = req.params;
  const payload = req.body;
  const user_id = req.session?.user_id || 0;

  db.query("SELECT * FROM form_laseralignment WHERE insp_id = ?", [insp_id], (err, existing) => {
    if (err) {
      console.error("POST form_laseralignment error (select):", err);
      return res.status(500).json({ error: "Internal Server Error" });
    }
    if (existing.length > 0) {
      db.query("UPDATE form_laseralignment SET ?, updated_by=?, updated_at=NOW() WHERE insp_id = ?", [payload, user_id, insp_id], (err2) => {
        if (err2) {
          console.error("POST form_laseralignment error (update):", err2);
          return res.status(500).json({ error: "Internal Server Error" });
        }
        res.json({ success: true });
      });
    } else {
      db.query("INSERT INTO form_laseralignment SET ?, insp_id=?, created_by=?, created_at=NOW()", [payload, insp_id, user_id], (err3) => {
        if (err3) {
          console.error("POST form_laseralignment error (insert):", err3);
          return res.status(500).json({ error: "Internal Server Error" });
        }
        res.json({ success: true });
      });
    }
  });
});

// ⬇️ FormVibrationAfterInstalled
app.get('/api/forms/FormVibrationAfterInstalled/:insp_id', (req, res) => {
  const { insp_id } = req.params;
  db.query("SELECT * FROM form_vibrationafterinstalled WHERE insp_id = ?", [insp_id], (err, rows) => {
    if (err) {
      console.error("GET form_vibrationafterinstalled error:", err);
      return res.status(500).json({ error: "Internal Server Error" });
    }
    res.json(rows.length > 0 ? rows[0] : null);
  });
});

app.post('/api/forms/FormVibrationAfterInstalled/:insp_id', (req, res) => {
  const { insp_id } = req.params;
  const payload = req.body;
  const user_id = req.session?.user_id || 0;

  db.query("SELECT * FROM form_vibrationafterinstalled WHERE insp_id = ?", [insp_id], (err, existing) => {
    if (err) {
      console.error("POST form_vibrationafterinstalled error (select):", err);
      return res.status(500).json({ error: "Internal Server Error" });
    }
    if (existing.length > 0) {
      db.query("UPDATE form_vibrationafterinstalled SET ?, updated_by=?, updated_at=NOW() WHERE insp_id = ?", [payload, user_id, insp_id], (err2) => {
        if (err2) {
          console.error("POST form_vibrationafterinstalled error (update):", err2);
          return res.status(500).json({ error: "Internal Server Error" });
        }
        res.json({ success: true });
      });
    } else {
      db.query("INSERT INTO form_vibrationafterinstalled SET ?, insp_id=?, created_by=?, created_at=NOW()", [payload, insp_id, user_id], (err3) => {
        if (err3) {
          console.error("POST form_vibrationafterinstalled error (insert):", err3);
          return res.status(500).json({ error: "Internal Server Error" });
        }
        res.json({ success: true });
      });
    }
  });
});

// ⬇️ FormCoreLossHotSpot
app.get('/api/forms/FormCoreLossHotSpot/:insp_id', (req, res) => {
  const { insp_id } = req.params;
  db.query("SELECT * FROM form_corelosshotspot WHERE insp_id = ?", [insp_id], (err, rows) => {
    if (err) {
      console.error("GET form_corelosshotspot error:", err);
      return res.status(500).json({ error: "Internal Server Error" });
    }
    res.json(rows.length > 0 ? rows[0] : null);
  });
});

app.post('/api/forms/FormCoreLossHotSpot/:insp_id', (req, res) => {
  const { insp_id } = req.params;
  const payload = req.body;
  const user_id = req.session?.user_id || 0;

  db.query("SELECT * FROM form_corelosshotspot WHERE insp_id = ?", [insp_id], (err, existing) => {

    if (err) {
      console.error("POST form_corelosshotspot error (select):", err);
      return res.status(500).json({ error: "Internal Server Error" });
    }

    if (existing.length > 0) {
      db.query("UPDATE form_corelosshotspot SET ?, updated_by=?, updated_at=NOW() WHERE insp_id = ?", [payload, user_id, insp_id], (err2) => {
        if (err2) {
          console.error("POST form_corelosshotspot error (update):", err2);
          return res.status(500).json({ error: "Internal Server Error" });
        }
        res.json({ success: true });
      });
    } else {
      db.query("INSERT INTO form_corelosshotspot SET ?, insp_id=?, created_by=?, created_at=NOW()", [payload, insp_id, user_id], (err3) => {
        if (err3) {
          console.error("POST form_corelosshotspot error (insert):", err3);
          return res.status(500).json({ error: "Internal Server Error" });
        }
        res.json({ success: true });
      });
    }
  });
});

// ⬇️ FormRewind
app.get('/api/forms/FormRewind/:insp_id', (req, res) => {
  const { insp_id } = req.params;
  db.query("SELECT * FROM form_rewind WHERE insp_id = ?", [insp_id], (err, rows) => {
    if (err) {
      console.error("GET form_rewind error:", err);
      return res.status(500).json({ error: "Internal Server Error" });
    }
    res.json(rows.length > 0 ? rows[0] : null);
  });
});

app.post('/api/forms/FormRewind/:insp_id', (req, res) => {
  const { insp_id } = req.params;
  const payload = req.body;
  const user_id = req.session?.user_id || 0;

  db.query("SELECT * FROM form_rewind WHERE insp_id = ?", [insp_id], (err, existing) => {
    if (err) {
      console.error("POST form_rewind error (select):", err);
      return res.status(500).json({ error: "Internal Server Error" });
    }
    if (existing.length > 0) {
      db.query("UPDATE form_rewind SET ?, updated_by=?, updated_at=NOW() WHERE insp_id = ?", [payload, user_id, insp_id], (err2) => {
        if (err2) {
          console.error("POST form_rewind error (update):", err2);
          return res.status(500).json({ error: "Internal Server Error" });
        }
        res.json({ success: true });
      });
    } else {
      db.query("INSERT INTO form_rewind SET ?, insp_id=?, created_by=?, created_at=NOW()", [payload, insp_id, user_id], (err3) => {
        if (err3) {
          console.error("POST form_rewind error (insert):", err3);
          return res.status(500).json({ error: "Internal Server Error" });
        }
        res.json({ success: true });
      });
    }
  });
});

// ⬇️ FormMachine
app.get('/api/forms/FormMachine/:insp_id', (req, res) => {
  const { insp_id } = req.params;
  db.query("SELECT * FROM form_machine WHERE insp_id = ?", [insp_id], (err, rows) => {
    if (err) {
      console.error("GET form_machine error:", err);
      return res.status(500).json({ error: "Internal Server Error" });
    }
    res.json(rows.length > 0 ? rows[0] : null);
  });
});

app.post('/api/forms/FormMachine/:insp_id', (req, res) => {
  const { insp_id } = req.params;
  const payload = req.body;
  const user_id = req.session?.user_id || 0;

  db.query("SELECT * FROM form_machine WHERE insp_id = ?", [insp_id], (err, existing) => {
    if (err) {
      console.error("POST form_machine error (select):", err);
      return res.status(500).json({ error: "Internal Server Error" });
    }
    if (existing.length > 0) {
      db.query("UPDATE form_machine SET ?, updated_by=?, updated_at=NOW() WHERE insp_id = ?", [payload, user_id, insp_id], (err2) => {
        if (err2) {
          console.error("POST form_machine error (update):", err2);
          return res.status(500).json({ error: "Internal Server Error" });
        }
        res.json({ success: true });
      });
    } else {
      db.query("INSERT INTO form_machine SET ?, insp_id=?, created_by=?, created_at=NOW()", [payload, insp_id, user_id], (err3) => {
        if (err3) {
          console.error("POST form_machine error (insert):", err3);
          return res.status(500).json({ error: "Internal Server Error" });
        }
        res.json({ success: true });
      });
    }
  });
});

// ⬇️ FormPartData
app.get('/api/forms/FormPartData/:insp_id', (req, res) => {
  const { insp_id } = req.params;
  db.query("SELECT * FROM form_partdata WHERE insp_id = ?", [insp_id], (err, rows) => {
    if (err) {
      console.error("GET form_partdata error:", err);
      return res.status(500).json({ error: "Internal Server Error" });
    }
    res.json(rows.length > 0 ? rows[0] : null);
  });
});

app.post('/api/forms/FormPartData/:insp_id', (req, res) => {
  const { insp_id } = req.params;
  const payload = req.body;
  const user_id = req.session?.user_id || 0;

  db.query("SELECT * FROM form_partdata WHERE insp_id = ?", [insp_id], (err, existing) => {
    if (err) {
      console.error("POST form_partdata error (select):", err);
      return res.status(500).json({ error: "Internal Server Error" });
    }
    if (existing.length > 0) {
      db.query("UPDATE form_partdata SET ?, updated_by=?, updated_at=NOW() WHERE insp_id = ?", [payload, user_id, insp_id], (err2) => {
        if (err2) {
          console.error("POST form_partdata error (update):", err2);
          return res.status(500).json({ error: "Internal Server Error" });
        }
        res.json({ success: true });
      });
    } else {
      db.query("INSERT INTO form_partdata SET ?, insp_id=?, created_by=?, created_at=NOW()", [payload, insp_id, user_id], (err3) => {
        if (err3) {
          console.error("POST form_partdata error (insert):", err3);
          return res.status(500).json({ error: "Internal Server Error" });
        }
        res.json({ success: true });
      });
    }
  });
});

// ⬇️ FormAttachments
app.get('/api/forms/FormAttachments/:insp_id', (req, res) => {
  const { insp_id } = req.params;
  db.query("SELECT * FROM form_attachments WHERE insp_id = ?", [insp_id], (err, rows) => {
    if (err) {
      console.error("GET form_attachments error:", err);
      return res.status(500).json({ error: "Internal Server Error" });
    }
    res.json(rows.length > 0 ? rows[0] : null);
  });
});

app.post('/api/forms/FormAttachments/:insp_id', (req, res) => {
  const { insp_id } = req.params;
  const payload = req.body;
  const user_id = req.session?.user_id || 0;

  db.query("SELECT * FROM form_attachments WHERE insp_id = ?", [insp_id], (err, existing) => {
    if (err) {
      console.error("POST form_attachments error (select):", err);
      return res.status(500).json({ error: "Internal Server Error" });
    }
    if (existing.length > 0) {
      db.query("UPDATE form_attachments SET ?, updated_by=?, updated_at=NOW() WHERE insp_id = ?", [payload, user_id, insp_id], (err2) => {
        if (err2) {
          console.error("POST form_attachments error (update):", err2);
          return res.status(500).json({ error: "Internal Server Error" });
        }
        res.json({ success: true });
      });
    } else {
      db.query("INSERT INTO form_attachments SET ?, insp_id=?, created_by=?, created_at=NOW()", [payload, insp_id, user_id], (err3) => {
        if (err3) {
          console.error("POST form_attachments error (insert):", err3);
          return res.status(500).json({ error: "Internal Server Error" });
        }
        res.json({ success: true });
      });
    }
  });
});

// ⬇️ FormPhotoManager
app.get('/api/forms/FormPhotoManager/:insp_id', (req, res) => {
  const { insp_id } = req.params;
  db.query("SELECT * FROM form_photo_manager WHERE insp_id = ?", [insp_id], (err, rows) => {
    if (err) {
      console.error("GET form_photo_manager error:", err);
      return res.status(500).json({ error: "Internal Server Error" });
    }
    res.json(rows.length > 0 ? rows[0] : null);
  });
});

app.post('/api/forms/FormPhotoManager/:insp_id', (req, res) => {
  const { insp_id } = req.params;
  const payload = req.body;
  const user_id = req.session?.user_id || 0;

  db.query("SELECT * FROM form_photo_manager WHERE insp_id = ?", [insp_id], (err, existing) => {
    if (err) {
      console.error("POST form_photo_manager error (select):", err);
      return res.status(500).json({ error: "Internal Server Error" });
    }
    if (existing.length > 0) {
      db.query("UPDATE form_photo_manager SET ?, updated_by=?, updated_at=NOW() WHERE insp_id = ?", [payload, user_id, insp_id], (err2) => {
        if (err2) {
          console.error("POST form_photo_manager error (update):", err2);
          return res.status(500).json({ error: "Internal Server Error" });
        }
        res.json({ success: true });
      });
    } else {
      db.query("INSERT INTO form_photo_manager SET ?, insp_id=?, created_by=?, created_at=NOW()", [payload, insp_id, user_id], (err3) => {
        if (err3) {
          console.error("POST form_photo_manager error (insert):", err3);
          return res.status(500).json({ error: "Internal Server Error" });
        }
        res.json({ success: true });
      });
    }
  });
});

/* 00-Tag-List-All */
app.get('/api/tagList', (req, res) => {
  const sql = `
    SELECT i.*, m.motor_name
    FROM tbl_inspection_list i
    LEFT JOIN list_motor_type m ON i.insp_motor_code = m.motor_code
    WHERE m.is_active = '1'
   ORDER BY COALESCE(i.inspection_updated_at, i.insp_created_at) DESC
    LIMIT 1000
  `;

  db.query(sql, (err, results) => {
    if (err) {
      console.error('Query error:', err);
      return res.status(500).json({ error: 'ไม่สามารถดึง tagList ได้' });
    }
    res.json(results);
  });
});

/* 150768831-company-list */
app.get('/company/list', (req, res) => {
  const sql = `
    SELECT DISTINCT insp_customer_no, insp_customer_name
FROM tbl_inspection_list
ORDER BY insp_customer_name
  `;

  db.query(sql, (err, results) => {
    if (err) {
      console.error('Query error:', err);
      return res.status(500).json({ error: 'ไม่สามารถดึง company list ได้' });
    }
    res.json(results);
  });
});

/* 150768845 Search by Service Order (SV) */
app.post('/api/searchSV', (req, res) => {
  const { order_id } = req.body;

  const sql = `
    SELECT 
      insp_no,
      insp_customer_name,
      insp_service_order,
      insp_status,
      insp_created_at,
      insp_document_date,
      insp_station_now,
      insp_branch
    FROM tbl_inspection_list
    WHERE insp_service_order = ?
    ORDER BY insp_created_at DESC
  `;

  db.query(sql, [order_id], (err, results) => {
    if (err) {
      console.error('searchSV error:', err);
      return res.status(500).json({ error: 'ไม่สามารถค้นหาข้อมูลด้วย Service Order ได้' });
    }
    res.json(results.map(row => ({
      ...row,
      insp_created_at: row.insp_created_at?.toISOString().slice(0, 10),
      insp_document_date: row.insp_document_date?.toISOString().slice(0, 10)
    })));

  });
});

/* 150768846 Search by Customer No (CT) */
app.post('/api/searchCustomer', (req, res) => {
  const { company_code } = req.body;

  const sql = `
    SELECT 
      insp_no,
      insp_customer_name,
      insp_service_order,
      insp_status,
      insp_document_date,
      insp_created_at,
      insp_station_now,
      insp_branch
    FROM tbl_inspection_list
    WHERE insp_customer_no = ?
    ORDER BY insp_created_at DESC
  `;

  db.query(sql, [company_code], (err, results) => {
    if (err) {
      console.error('searchCustomer error:', err);
      return res.status(500).json({ error: 'ไม่สามารถค้นหาข้อมูลด้วย Customer No ได้' });
    }
    res.json(results.map(row => ({
      ...row,
      insp_created_at: row.insp_created_at?.toISOString().slice(0, 10),
      insp_document_date: row.insp_document_date?.toISOString().slice(0, 10)
    })));

  });
});

// 150768928 GET /api/station-counts
app.get('/api/station-counts', (req, res) => {
  const sql = `
    SELECT insp_station_now AS station, COUNT(*) AS count
    FROM tbl_inspection_list
    GROUP BY insp_station_now
  `;
  db.query(sql, (err, results) => {
    if (err) {
      console.error('Query error:', err);
      return res.status(500).json({ error: 'ไม่สามารถดึงข้อมูลสถานีได้' });
    }
    res.json(results);
  });
});

// 1507681313 ดึงข้อมูลโปรไฟล์
app.get('/api/user/:id', (req, res) => {
  const userId = req.params.id;
  const sql = `SELECT user_key, name, lastname, u_tel, line_id, u_email, user_photo, user_type FROM u_user WHERE user_key = ?`;

  db.query(sql, [userId], (err, results) => {
    if (err) return res.status(500).json({ error: 'ไม่สามารถดึงข้อมูลผู้ใช้ได้' });
    if (results.length === 0) return res.status(404).json({ error: 'ไม่พบผู้ใช้' });
    res.json(results[0]);
  });
});

// 1507681314 อัปเดตข้อมูลโปรไฟล์
app.put('/api/user/:id', (req, res) => {
  const userId = req.params.id;
  const { name, lastname, u_email, u_tel, lineId, user_photo } = req.body;

  const sql = `
    UPDATE u_user 
    SET name = ?, lastname = ?, u_email = ?, u_tel = ?, line_id = ?, user_photo = ?, u_update_date = NOW()
    WHERE user_key = ?
  `;

  db.query(sql, [name, lastname, u_email, u_tel, lineId, user_photo || null, userId], (err, result) => {
    if (err) return res.status(500).json({ error: 'อัปเดตข้อมูลไม่สำเร็จ' });
    res.json({ message: 'อัปเดตข้อมูลสำเร็จ' });
  });
});

// 1507681325 อัปโหลดภาพโปรไฟล์
app.post('/api/upload-profile-image/:userId', upload.single('image'), async (req, res) => {
  try {
    const userId = req.params.userId;
    const file = req.file;

    if (!file) return res.status(400).json({ error: 'No file uploaded' });

    const fileName = `user-${userId}.jpg`;
    const outputPath = path.join(__dirname, 'public', 'img_upload', fileName);

    // ลบไฟล์เดิมก่อน (ถ้ามี)
    if (fs.existsSync(outputPath)) fs.unlinkSync(outputPath);

    // บีบอัดและบันทึกใหม่
    await sharp(file.buffer)
      .resize(300)
      .jpeg({ quality: 80 })
      .toFile(outputPath);

    res.json({ fileName });
  } catch (err) {
    console.error('Upload failed:', err);
    res.status(500).json({ error: 'Upload failed' });
  }
});

/* 1607681321 ระบบแจ้งเตือน การติดตาม*/
app.get('/api/notifications/:userKey', (req, res) => {
  const userKey = req.params.userKey;

  const sql = `
        SELECT i.insp_id, i.insp_no, i.insp_service_order, i.insp_customer_name, i.inspection_updated_at
        FROM tbl_inspection_follow f
        JOIN tbl_inspection_list i ON f.insp_id = i.insp_id
        WHERE f.user_key = ?
          AND f.is_active = 1
          AND (f.last_read_at IS NULL OR i.inspection_updated_at > f.last_read_at)
          AND i.inspection_updated_at IS NOT NULL	
    `;

  db.query(sql, [userKey], (err, results) => {
    if (err) {
      console.error("Error fetching notifications:", err);
      return res.status(500).json({ error: "Database error" });
    }
    res.json(results);
  });
});

/* 1607681338 ระบบแจ้งเตือน การติดตาม อ่านแล้ว*/
app.post('/api/notifications/read', (req, res) => {
  const { user_key, insp_id } = req.body;

  if (!user_key || !insp_id) {
    return res.status(400).json({ error: 'Missing user_key or insp_id' });
  }

  const sql = `
        UPDATE tbl_inspection_follow
        SET last_read_at = NOW()
        WHERE user_key = ? AND insp_id = ? AND is_active = 1
    `;

  db.query(sql, [user_key, insp_id], (err, result) => {
    if (err) {
      console.error('Failed to mark as read:', err);
      return res.status(500).json({ error: 'Database error' });
    }

    res.json({ success: true });
  });
});

/* 1607681344 ระบบแจ้งเตือน การติดตาม-กดติดตาม*/
app.post('/api/follow', (req, res) => {
  const { user_key, insp_id, insp_no } = req.body;
  const sql = `
        INSERT INTO tbl_inspection_follow (user_key, insp_id, insp_no, is_active, followed_at)
        VALUES (?, ?, ?, 1, NOW())
        ON DUPLICATE KEY UPDATE is_active = 1, followed_at = NOW()
    `;
  db.query(sql, [user_key, insp_id, insp_no], (err) => {
    if (err) return res.status(500).json({ error: 'DB error' });
    res.json({ success: true });
  });
});

/* 1607681345 ระบบแจ้งเตือน การติดตาม-เลิกติดตาม*/
app.post('/api/follow/unfollow', (req, res) => {
  const { user_key, insp_id } = req.body;
  const sql = `UPDATE tbl_inspection_follow SET is_active = 0 WHERE user_key = ? AND insp_id = ?`;
  db.query(sql, [user_key, insp_id], (err) => {
    if (err) return res.status(500).json({ error: 'DB error' });
    res.json({ success: true });
  });
});

/* 1607681346 ระบบแจ้งเตือน การติดตาม-ตรวจสถานะติดตาม*/
app.get('/api/follow/status', (req, res) => {
  const { user_key, insp_id } = req.query;
  const sql = `
        SELECT is_active FROM tbl_inspection_follow
        WHERE user_key = ? AND insp_id = ?
    `;
  db.query(sql, [user_key, insp_id], (err, results) => {
    if (err) return res.status(500).json({ error: 'DB error' });
    const is_following = results.length > 0 && results[0].is_active === 1;
    res.json({ is_following });
  });
});


/* 210768804 สถานะ timeline station */
app.get('/api/timeline/station', (req, res) => {
  const { insp_id } = req.query;

  if (!insp_id) {
    return res.status(400).json({ error: 'กรุณาระบุ insp_id' });
  }

  const stationSQL = `
    SELECT 
      s.*, 
      u.name AS user_name,
      u.lastname AS user_lastname,
      u.user_photo
    FROM logs_inspection_stations s
    LEFT JOIN u_user u ON s.user_id = u.user_key
    WHERE s.insp_id = ?
    ORDER BY s.station_timestamp ASC
  `;

  const startSQL = `
    SELECT 
      lpj_created_at, 
      lpj_user_id,
      u.name AS user_name,
      u.lastname AS user_lastname,
      u.user_photo
    FROM logs_project l
    LEFT JOIN u_user u ON l.lpj_user_id = u.user_key
    WHERE lpj_project_id = ?
    ORDER BY lpj_created_at ASC
    LIMIT 1
  `;

  db.query(stationSQL, [insp_id], (err1, stations) => {
    if (err1) {
      console.error('DB error (stations):', err1);
      return res.status(500).json({ error: 'ไม่สามารถดึง timeline ได้' });
    }

    db.query(startSQL, [insp_id], (err2, startRows) => {
      if (err2) {
        console.error('DB error (start):', err2);
        return res.status(500).json({ error: 'ไม่สามารถดึง start timeline ได้' });
      }

      const timeline = [];

      // ⬅️ เพิ่มจุดเริ่มต้น
      if (startRows.length > 0) {
        const start = startRows[0];
        timeline.push({
          station_name: 'Start',
          station_status: 'Created',
          station_note: null,
          timestamp: start.lpj_created_at
            ? dayjs(start.lpj_created_at).format('DD/MM/YYYY HH:mm')
            : '',
          done: true,
          by: start.user_name ? `${start.user_name}` : null,
          /*  by: start.user_name ? `${start.user_name} ${start.user_lastname}` : null, */
          photo: start.user_photo || null,
        });
      }

      // ➕ ต่อด้วย station จริง
      const mapped = stations.map(row => ({
        station_step: row.station_step,
        station_name: row.station_name,
        station_status: row.station_status,
        station_note: row.station_note,
        timestamp: row.station_timestamp
          ? dayjs(row.station_timestamp).format('DD/MM/YYYY HH:mm')
          : '',
        done: row.station_status !== 'In Progress',
        by: row.user_name ? `${row.user_name}` : null,
        /*  by: row.user_name ? `${row.user_name} ${row.user_lastname}` : null, */
        photo: row.user_photo || null,
      }));

      res.json([...timeline, ...mapped]);
    });
  });
});

// 2207681451 instrument and certificates
app.get('/api/certificates', (req, res) => {
  const branch = req.query.branch;
  const sql = `
    SELECT *
    FROM list_certificate
    WHERE lc_branch = ? AND lc_del = 0
    ORDER BY lc_equipment_name ASC
  `;
  db.query(sql, [branch], (err, results) => {
    if (err) return res.status(500).json({ error: err });
    res.json(results);
  });
});

// 3072568832 team
app.get('/api/teams', (req, res) => {
  const branch = req.query.branch;
  const sql = `
    SELECT 
      t.team_name
    FROM 
      list_teams t
    WHERE t.team_branch = ?
  `;

  db.query(sql, [branch], (err, results) => {
    if (err) return res.status(500).json({ error: err });
    res.json(results);
  });
});

// 3072568927 team/members
app.get('/api/teams/members', (req, res) => {
  const branch = req.query.branch;
  const sql = `
    SELECT 
      t.team_name,
      u.name,
      u.lastname,
      u.user_photo,
      tm.tm_role,
      t.team_color
    FROM 
      tbl_team_members tm
    JOIN 
      list_teams t ON tm.tm_team_id = t.team_id
    JOIN 
      u_user u ON tm.tm_user_id = u.user_key
    WHERE t.team_branch = ?
    ORDER BY t.team_name, tm.tm_role
  `;

  db.query(sql, [branch], (err, results) => {
    if (err) return res.status(500).json({ error: err });
    res.json(results);
  });
});

// ✅ Listen ทั้งเครือข่าย
/* app.listen(port, '0.0.0.0', () => {
  console.log(`API เริ่มทำงานที่ http://0.0.0.0:${port}`);
});
 */

app.listen(PORT, () => console.log('Server running on port', PORT));
