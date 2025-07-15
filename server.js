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
const port = process.env.PORT || 5000;

//รูปภาพ test report
const multer = require('multer');
const sharp = require('sharp');
const fs = require('fs');
const upload = multer({ storage: multer.memoryStorage() });

app.use(cors());
app.use(express.json());

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

// ✅ ฟังก์ชันช่วยดึง ServiceItemLines แบบ recursive
async function fetchAllServiceItemLines(baseUrl, token) {
  let allItems = [];
  let url = baseUrl;

  while (url) {
    const response = await axios.get(url, {
      headers: {
        Authorization: `Bearer ${token}`,
        Accept: 'application/json'
      }
    });

    allItems = allItems.concat(response.data.value);
    url = response.data['@odata.nextLink']; // ถ้ามีหน้าถัดไป จะใช้ลิงก์นี้
  }

  return allItems;
}

app.post('/api/bc/data', async (req, res) => {
  const selectedYear = req.body.year || new Date().getFullYear();

  const startDate = `${selectedYear}-01-01`;
  const endDate = `${selectedYear}-12-31`;

  try {
    const token = await getBcAccessToken();

    const orderUrl = `https://api.businesscentral.dynamics.com/v2.0/${process.env.BC_TENANT_ID}/${process.env.BC_ENVIRONMENT}/ODataV4/Company('${process.env.BC_COMPANY_NAME}')/ServiceOrderList?$orderby=Order_Date desc&$filter=Status eq 'pending' and Order_Date ge ${startDate} and Order_Date le ${endDate}`;

    const itemUrl = `https://api.businesscentral.dynamics.com/v2.0/${process.env.BC_TENANT_ID}/${process.env.BC_ENVIRONMENT}/ODataV4/Company('${process.env.BC_COMPANY_NAME}')/ServiceItemLines`;

    const [orderRes, items, existingOrders] = await Promise.all([
      axios.get(orderUrl, {
        headers: {
          Authorization: `Bearer ${token}`,
          Accept: 'application/json'
        }
      }),
      fetchAllServiceItemLines(itemUrl, token),
      new Promise((resolve, reject) => {
        db.query('SELECT insp_service_order FROM tbl_inspection_list', (err, results) => {
          if (err) reject(err);
          else resolve(results.map(r => r.insp_service_order));
        });
      })
    ]);

    const orders = orderRes.data.value;
    const filteredOrders = orders.filter(order => !existingOrders.includes(order.No));
    const joined = filteredOrders.map(order => {
      const relatedItems = items.filter(item => item.Document_No === order.No);
      return {
        ...order,
        Service_Item_No: relatedItems.length > 0 ? relatedItems[0].Service_Item_No : '',
        Item_No: relatedItems.length > 0 ? relatedItems[0].Item_No : '',
        serviceItems: relatedItems
      };
    });

    res.json(joined);
  } catch (err) {
    console.error('BC API JOIN Error:', err.message || err);
    res.status(500).json({ error: 'เกิดข้อผิดพลาดในการดึงข้อมูลจาก BC' });
  }
});

// 🔐 LOGIN
app.post('/api/login', async (req, res) => {
  try {
    // ✅ ป้องกัน body undefined
    const { username, password, branch } = req.body || {};

    if (!username || !password || !branch) {
      return res.status(400).json({ error: 'กรุณากรอกข้อมูลให้ครบถ้วน' });
    }

    const sql = `
      SELECT * FROM u_user 
      WHERE username = ? 
        AND user_status = 1
    `;

    db.query(sql, [username], async (err, results) => {
      if (err) return res.status(500).json({ error: 'Database error' });
      if (results.length === 0) return res.status(401).json({ error: 'ไม่พบผู้ใช้' });

      const user = results[0];
      const storedHash = user.password;

      let isMatch = false;

      try {
        if (storedHash.startsWith('$2')) {
          isMatch = await bcrypt.compare(password, storedHash); // ✅ bcrypt
        } else {
          const md5Hash = crypto.createHash('md5').update(password).digest('hex');
          isMatch = (md5Hash === storedHash); // ✅ md5
        }

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
      } catch (err2) {
        console.error('Password check error:', err2);
        res.status(500).json({ error: 'Server error' });
      }
    });
  } catch (e) {
    console.error('Unexpected error:', e);
    res.status(500).json({ error: 'Unexpected error' });
  }
});

/* 001-start-POST-inspection */
app.post('/api/inspection', async (req, res) => {
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

/* 003-GET-QA */
app.get('/api/Step1', (req, res) => {
  db.query(
    'SELECT * FROM tbl_inspection_list WHERE insp_status IS NULL AND insp_station_now = "Start" ORDER BY insp_created_at DESC',
    (err, results) => {
      if (err) {
        console.error('Query error:', err);
        return res.status(500).json({ error: 'ไม่สามารถดึง Step1 ได้' });
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
    }
  );
});

/* 004-station */
app.post("/api/send_station001", (req, res) => {
  const { insp_id, next_station, user_id } = req.body;

  // 1. อัปเดต inspection หลัก
  const updateSql = `
    UPDATE tbl_inspection_list 
    SET insp_station_prev = insp_station_now, 
        insp_station_now = ?, 
        insp_status = 'In Progress', 
        inspection_updated_at = NOW() 
    WHERE insp_id = ?
  `;

  db.query(updateSql, [next_station, insp_id], (err, result) => {
    if (err) {
      console.error("Update error:", err);
      return res.status(500).json({ error: "ไม่สามารถอัปเดตสถานีได้" });
    }

    // 2. Insert log เข้า tbl_inspection_stations
    const insertLogSql = `
      INSERT INTO tbl_inspection_stations (
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
      [insp_id, '001', next_station, 'In Progress', user_id],
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
      insp_id,
      insp_no,
      insp_customer_name,
      insp_customer_no,
      insp_sale_quote,
      insp_service_order,
      insp_service_type,
      insp_document_date,
      insp_status,
      insp_created_at,
      insp_motor_code,
      insp_station_user,
      insp_station_now,
      insp_station_prev,
      inspection_updated_at,
      insp_incoming_date,
      insp_final_date
    FROM tbl_inspection_list
    WHERE insp_no = ?
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
     SELECT * FROM tbl_inspection_list ins
    LEFT JOIN form_test_report tr
    ON ins.insp_no = tr.insp_no
    WHERE ins.insp_no = ?
    `, [insp_no], (err, rows) => {
    if (err) {
      console.error("GET form_test_report error:", err);
      return res.status(500).json({ error: "Internal Server Error" });
    }
    res.json(rows.length > 0 ? rows[0] : null);
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
        res.json({ success: true });
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
        res.json({ success: true });
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
  db.query("SELECT * FROM form_photomanager WHERE insp_id = ?", [insp_id], (err, rows) => {
    if (err) {
      console.error("GET form_photomanager error:", err);
      return res.status(500).json({ error: "Internal Server Error" });
    }
    res.json(rows.length > 0 ? rows[0] : null);
  });
});

app.post('/api/forms/FormPhotoManager/:insp_id', (req, res) => {
  const { insp_id } = req.params;
  const payload = req.body;
  const user_id = req.session?.user_id || 0;

  db.query("SELECT * FROM form_photomanager WHERE insp_id = ?", [insp_id], (err, existing) => {
    if (err) {
      console.error("POST form_photomanager error (select):", err);
      return res.status(500).json({ error: "Internal Server Error" });
    }
    if (existing.length > 0) {
      db.query("UPDATE form_photomanager SET ?, updated_by=?, updated_at=NOW() WHERE insp_id = ?", [payload, user_id, insp_id], (err2) => {
        if (err2) {
          console.error("POST form_photomanager error (update):", err2);
          return res.status(500).json({ error: "Internal Server Error" });
        }
        res.json({ success: true });
      });
    } else {
      db.query("INSERT INTO form_photomanager SET ?, insp_id=?, created_by=?, created_at=NOW()", [payload, insp_id, user_id], (err3) => {
        if (err3) {
          console.error("POST form_photomanager error (insert):", err3);
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
// ✅ Listen ทั้งเครือข่าย
app.listen(port, '0.0.0.0', () => {
  console.log(`API เริ่มทำงานที่ http://0.0.0.0:${port}`);
});
