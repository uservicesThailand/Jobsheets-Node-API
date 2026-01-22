// server.js
/* require('dotenv').config(); */
const bcrypt = require("bcrypt");
const express = require("express");
const cors = require("cors");
const { db, db2, db3 } = require("./db");
const { setupLoginRoutes } = require("./login");
const axios = require("axios");
const dayjs = require("dayjs");
const path = require("path");
const http = require("http");
const routes = require("./routes");

const app = express();
const PORT = process.env.PORT || 5000;

// Swagger
const { swaggerUi, swaggerSpec } = require("./config/swagger");

// CORS: ใช้โดเมนจริงจาก ENV (คอมมาคั่นได้), dev fallback เป็น localhost
const allowedOrigins =
  process.env.FRONTEND_ORIGIN?.split(",").map((s) => s.trim()) || [];

app.use(
  cors({
    origin: allowedOrigins,
    methods: ["GET", "POST", "PUT", "PATCH", "DELETE", "OPTIONS"],
    credentials: true,
  }),
);

app.use(express.json());
app.use("/api", routes);

setupLoginRoutes(app, db, db3);

/* ดึง print */
/**
 * GET /api/report/inspection/:insp_no
 * ดึงข้อมูลรายงานตาม Inspection No
 */

app.get("/inspection/:insp_no", (req, res) => {
  const { insp_no } = req.params;
  if (!insp_no) {
    return res.status(400).json({ error: "missing insp_no" });
  }

  const sql = `
    SELECT 
      t.insp_id,
      t.insp_no,
      t.insp_customer_no,
      t.insp_customer_name,
      t.insp_sale_quote,
      t.insp_service_order,
      t.insp_service_item,
      t.insp_service_type,
      t.insp_status,
      t.insp_created_at,
      t.insp_motor_code,
      t.insp_priority,
      t.insp_station_user,
      t.insp_station_now,
      t.insp_station_accept,
      t.insp_station_prev,
      t.insp_document_date,
      t.inspection_updated_at,
      t.insp_incoming_date,
      t.insp_final_date,
      t.insp_branch,
      t.insp_urgent,
      u.name       AS station_user_name,
      u.lastname   AS station_user_lastname
    FROM tbl_inspection_list AS t
    LEFT JOIN u_user AS u 
      ON u.user_key = t.insp_station_user   -- ถ้า column นี้ไม่ใช่ user_key ให้ปรับตามจริง
    WHERE t.insp_no = ?
    LIMIT 1
  `;

  db.query(sql, [insp_no], (err, rows) => {
    if (err) {
      console.error("GET report/inspection by insp_no error:", err);
      return res.status(500).json({ error: "Internal Server Error" });
    }
    if (!rows || rows.length === 0) {
      return res.status(404).json({ error: "not found" });
    }
    return res.json(rows[0]);
  });
});

// ─────────────────────────────────────────────────────────────────────────────
// HTTP server + Socket.IO
const server = http.createServer(app);
const { Server } = require("socket.io");

const io = new Server(server, {
  cors: {
    origin: allowedOrigins,
    methods: ["GET", "POST"],
    credentials: true,
  },
  transports: ["websocket", "polling"],
  pingInterval: 25000,
  pingTimeout: 20000,
  path: "/socket.io",
});

// ให้ route ต่าง ๆ ใช้งาน io ได้
app.set("io", io);

// ── Socket.IO
io.on("connection", (socket) => {
  // auto-join จาก auth
  const authUserKey = socket.handshake?.auth?.userKey;
  if (authUserKey) {
    const room = `user:${String(authUserKey)}`;
    socket.join(room);
    console.log(`[WS] ${socket.id} auto-joined ${room}`);
  }

  // รองรับวิธีเดิม: client ส่ง 'join' มา
  socket.on("join", (userKey) => {
    if (!userKey) return;
    const room = `user:${String(userKey)}`;
    socket.join(room);
    /* console.log(`[WS] ${socket.id} joined ${room}`); */
  });

  socket.on("disconnect", (reason) => {
    console.log("[WS] disconnected:", socket.id, reason);
  });
});

// ─────────────────────────────────────────────────────────────────────────────
// Upload (multer + sharp + fs) with safer config
const multer = require("multer");
const sharp = require("sharp");
const fs = require("fs");
// กำหนด storage สำหรับ multer (เก็บไฟล์ชั่วคราว)
const storage = multer.memoryStorage();
const upload = multer({
  storage: storage,
  limits: {
    fileSize: 10 * 1024 * 1024, // จำกัด 10MB
  },
  fileFilter: (req, file, cb) => {
    const allowedTypes = /jpeg|jpg|png|webp/;
    const extname = allowedTypes.test(
      path.extname(file.originalname).toLowerCase(),
    );
    const mimetype = allowedTypes.test(file.mimetype);

    if (mimetype && extname) {
      return cb(null, true);
    } else {
      cb(new Error("รองรับเฉพาะไฟล์รูปภาพ (JPEG, PNG, WebP)"));
    }
  },
});

// ─────────────────────────────────────────────────────────────────────────────
// Global process error logs
process.on("uncaughtException", (err) => {
  console.error("Uncaught Exception:", err);
});

process.on("unhandledRejection", (err) => {
  console.error("Unhandled Rejection:", err);
});

// ─────────────────────────────────────────────────────────────────────────────
// Utils (BC)
const { getBcAccessToken } = require("./bcAuth");

function buildDocumentNoFilter(orderNos = []) {
  if (!orderNos.length) return "";
  const conditions = orderNos
    .map((no) => `Document_No eq '${String(no).replace(/'/g, "''")}'`)
    .join(" or ");
  return `$filter=${conditions}`;
}

function chunkArray(array, size) {
  const result = [];
  for (let i = 0; i < array.length; i += size) {
    result.push(array.slice(i, i + size));
  }
  return result;
}

// ─────────────────────────────────────────────────────────────────────────────
// Swagger & Static
app.use("/api-docs", swaggerUi.serve, swaggerUi.setup(swaggerSpec));
app.use("/img", express.static(path.join(__dirname, "public", "img_upload")));
app.use("/uploads", express.static(path.join(__dirname, "public", "uploads")));

// Health
app.get("/", (req, res) => {
  res.json({
    service: "Inspection Management API",
    version: "1.0.0",
    status: "running",
    uptime: process.uptime(),
    timestamp: new Date().toISOString(),
  });
});

app.get("/health", (req, res) => res.status(200).send("OK"));

// ─────────────────────────────────────────────────────────────────────────────
// Notify Followers (ปรับใช้ array rooms + user: prefix)
const notifyFollowers = (insp_id) => {
  const getFollowersSql = `
    SELECT user_key
    FROM tbl_inspection_follow
    WHERE insp_id = ? AND is_active = 1
  `;
  db.query(getFollowersSql, [insp_id], (err, followers = []) => {
    if (err) {
      console.error("[WS] followers err:", err);
      return;
    }
    if (!followers.length) return;

    const getDataSql = `
      SELECT insp_id, insp_no, insp_service_order, insp_customer_name, inspection_updated_at
      FROM tbl_inspection_list
      WHERE insp_id = ?
    `;
    db.query(getDataSql, [insp_id], (err2, rows = []) => {
      if (err2 || !rows.length) return;
      const data = rows[0];
      const rooms = followers.map(({ user_key }) => `user:${user_key}`);
      io.to(rooms).emit("notification", data);
      console.log(`[WS] notify ${rooms.length} followers for insp ${insp_id}`);
    });
  });
};

// ─────────────────────────────────────────────────────────────────────────────
// BC API Join
app.post("/api/bc/data", async (req, res) => {
  const selectedYear = req.body.year || new Date().getFullYear();
  const selectedMonth = req.body.month;
  const branch = req.body.branch;

  let startDate = `${selectedYear}-01-01T00:00:00.000Z`;
  let endDate = `${selectedYear}-12-31T23:59:59.999Z`;

  if (selectedMonth) {
    const paddedMonth = String(selectedMonth).padStart(2, "0");
    const start = new Date(`${selectedYear}-${paddedMonth}-01T00:00:00.000Z`);
    const end = new Date(start.getFullYear(), start.getMonth() + 1, 0);
    startDate = start.toISOString();
    // set to end-of-day UTC
    end.setHours(23, 59, 59, 999);
    endDate = end.toISOString();
  }

  try {
    const token = await getBcAccessToken();

    const orderUrl =
      `https://api.businesscentral.dynamics.com/v2.0/${process.env.BC_TENANT_ID}/${process.env.BC_ENVIRONMENT}` +
      `/ODataV4/Company('${process.env.BC_COMPANY_NAME}')/ServiceOrderList` +
      `?$orderby=Order_Date desc&$filter=Status eq 'pending' and Order_Date ge ${startDate} and Order_Date le ${endDate} and Service_Order_Type ne 'ADD'`;

    const orderRes = await axios.get(orderUrl, {
      headers: {
        Authorization: `Bearer ${token}`,
        Accept: "application/json",
      },
    });

    const allOrders = orderRes.data.value;

    const existingOrders = await new Promise((resolve, reject) => {
      db.query(
        "SELECT insp_service_order FROM tbl_inspection_list WHERE YEAR(insp_created_at) = ?",
        [selectedYear],
        (err, results) => {
          if (err) reject(err);
          else resolve(results.map((r) => r.insp_service_order));
        },
      );
    });

    const filteredOrders = allOrders.filter(
      (order) =>
        !existingOrders.includes(order.No) &&
        (!branch || order.USVT_ResponsibilityCenter === branch),
    );

    const orderNos = filteredOrders.map((order) => order.No);
    if (!orderNos.length) return res.json([]);

    const orderChunks = chunkArray(orderNos, 30);
    let allItems = [];

    for (const chunk of orderChunks) {
      const filter = buildDocumentNoFilter(chunk);
      const itemUrl =
        `https://api.businesscentral.dynamics.com/v2.0/${process.env.BC_TENANT_ID}/${process.env.BC_ENVIRONMENT}` +
        `/ODataV4/Company('${process.env.BC_COMPANY_NAME}')/ServiceItemLines?${filter}`;

      const itemRes = await axios.get(itemUrl, {
        headers: {
          Authorization: `Bearer ${token}`,
          Accept: "application/json",
        },
      });

      allItems = allItems.concat(itemRes.data.value);
    }

    const joined = filteredOrders.map((order) => {
      const relatedItems = allItems.filter(
        (item) => item.Document_No === order.No,
      );
      return {
        ...order,
        Service_Item_No: relatedItems[0]?.Service_Item_No || "",
        Item_No: relatedItems[0]?.Item_No || "",
      };
    });

    res.json(joined);
  } catch (err) {
    console.error("BC API JOIN Error:", err?.message || err);
    res.status(500).json({ error: "เกิดข้อผิดพลาดในการดึงข้อมูลจาก BC" });
  }
});

//_______________________________________________________________________________
// Logout Endpoint
app.post("/api/logout", (req, res) => {
  const { user_key } = req.body || {};

  if (!user_key) {
    return res.status(400).json({ error: "ไม่พบ user_key" });
  }

  const sql = `UPDATE u_user SET u_last_logout = NOW() WHERE user_key = ?`;

  db.query(sql, [user_key], (err, result) => {
    if (err) {
      console.error("Database error:", err);
      return res.status(500).json({ error: "Database error" });
    }

    if (result.affectedRows === 0) {
      return res.status(404).json({ error: "ไม่พบผู้ใช้" });
    }

    res.json({ message: "ออกจากระบบสำเร็จ" });
  });
});
// ====== แทรกในไฟล์แอปหลัก (หลังจาก app.use(express.json()) และมีตัวแปร db แล้ว) ======

// ✅ Middleware ตรวจสิทธิ์ admin/developer จาก X-User-Key
function requireAdminOrDev(req, res, next) {
  const adminKey = req.header("X-User-Key");
  if (!adminKey) return res.status(401).json({ error: "Unauthorized" });

  const sql = `SELECT u_role FROM u_user WHERE user_key = ? AND user_status = 1`;
  db.query(sql, [adminKey], (err, rows) => {
    if (err) return res.status(500).json({ error: "Database error" });
    if (!rows.length) return res.status(401).json({ error: "Unauthorized" });

    const role = String(rows[0].u_role || "").toLowerCase();
    if (role === "admin" || role === "developer") return next();
    return res.status(403).json({ error: "Forbidden" });
  });
}

// ─────────────────────────────────────────────────────────────────────────────
// ADMIN: ลิสต์ผู้ใช้ (ค้นหาได้ด้วย ?q=)
// GET /api/admin/users
app.get("/api/admin/users", requireAdminOrDev, (req, res) => {
  const q = (req.query.q || "").trim();
  const like = `%${q}%`;
  const sql = `
    SELECT 
      user_key, name, lastname, username, user_photo, user_class, bed_view,
      user_language, u_email, user_status, user_type, u_department,
      branch_log, u_add_date, u_add_by, u_update_date, line_id, u_tel,
      u_last_login, u_last_logout, u_role
    FROM u_user
    WHERE (? = '' 
           OR username LIKE ? 
           OR name LIKE ? 
           OR lastname LIKE ?
           OR u_email LIKE ?
           OR branch_log LIKE ?)
    ORDER BY (u_last_login IS NULL), u_last_login DESC, username ASC
  `;
  const params = [q, like, like, like, like, like];

  db.query(sql, params, (err, rows) => {
    if (err) {
      console.error(
        "Database error (/api/admin/users):",
        err.sqlMessage || err,
      );
      return res.status(500).json({ error: "Database error" });
    }
    res.json(rows);
  });
});

// ─────────────────────────────────────────────────────────────────────────────
// ADMIN: เพิ่มผู้ใช้ใหม่ (รหัสผ่านเข้ารหัสเป็น bcrypt เท่านั้น)
// POST /api/admin/users
app.post("/api/admin/users", requireAdminOrDev, async (req, res) => {
  try {
    const {
      name,
      lastname,
      username,
      password,
      user_photo = null,
      user_class = 0,
      bed_view = null,
      user_language = null,
      u_email = null,
      user_status = 1,
      user_type = null,
      u_department = null,
      branch_log = null,
      u_add_by = null,
      line_id = null,
      u_tel = null,
      u_role = "user",
    } = req.body || {};

    if (!username || !password || !name) {
      return res
        .status(400)
        .json({ error: "กรอก name, username, password ให้ครบ" });
    }
    if (password.length < 6) {
      return res
        .status(400)
        .json({ error: "รหัสผ่านต้องอย่างน้อย 6 ตัวอักษร" });
    }

    // ห้าม username ซ้ำ
    db.query(
      `SELECT user_key FROM u_user WHERE username = ? LIMIT 1`,
      [username],
      async (err, rows) => {
        if (err) return res.status(500).json({ error: "Database error" });
        if (rows.length) return res.status(409).json({ error: "username ซ้ำ" });

        const salt = await bcrypt.genSalt(10);
        const hash = await bcrypt.hash(password, salt);

        const insertSql = `
        INSERT INTO u_user
        (name, lastname, username, password, user_photo, user_class, bed_view,
         user_language, u_email, user_status, user_type, u_department, branch_log,
         u_add_date, u_add_by, u_update_date, line_id, u_tel, u_role)
        VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, NOW(), ?, NOW(), ?, ?, ?)
      `;
        const params = [
          name || null,
          lastname || null,
          username,
          hash,
          user_photo,
          +user_class || 0,
          bed_view,
          user_language,
          u_email,
          +user_status || 1,
          user_type,
          u_department,
          branch_log,
          u_add_by,
          line_id,
          u_tel,
          u_role,
        ];

        db.query(insertSql, params, (err2, result) => {
          if (err2) return res.status(500).json({ error: "Database error" });
          res.status(201).json({ user_key: result.insertId });
        });
      },
    );
  } catch (e) {
    console.error(e);
    res.status(500).json({ error: "Server error" });
  }
});

// ─────────────────────────────────────────────────────────────────────────────
// ADMIN: แก้ไขข้อมูลผู้ใช้/เปิดปิดการใช้งาน/เปลี่ยน role
// PATCH /api/admin/users/:user_key
app.patch("/api/admin/users/:user_key", requireAdminOrDev, (req, res) => {
  const { user_key } = req.params;
  const allowed = [
    "name",
    "lastname",
    "user_photo",
    "user_class",
    "bed_view",
    "user_language",
    "u_email",
    "user_status",
    "user_type",
    "u_department",
    "branch_log",
    "u_add_by",
    "line_id",
    "u_tel",
    "u_role",
  ];

  const fields = [];
  const params = [];
  allowed.forEach((k) => {
    if (Object.prototype.hasOwnProperty.call(req.body, k)) {
      fields.push(`${k} = ?`);
      params.push(req.body[k]);
    }
  });
  if (!fields.length)
    return res.status(400).json({ error: "No updatable fields" });

  fields.push(`u_update_date = NOW()`);
  const sql = `UPDATE u_user SET ${fields.join(", ")} WHERE user_key = ?`;
  params.push(user_key);

  db.query(sql, params, (err, result) => {
    if (err) return res.status(500).json({ error: "Database error" });
    if (result.affectedRows === 0)
      return res.status(404).json({ error: "User not found" });
    res.json({ message: "updated" });
  });
});

// ─────────────────────────────────────────────────────────────────────────────
// ADMIN: เปลี่ยนรหัสผ่าน (bcrypt)
// PATCH /api/admin/users/:user_key/password
app.patch(
  "/api/admin/users/:user_key/password",
  requireAdminOrDev,
  async (req, res) => {
    try {
      const { user_key } = req.params;
      const { new_password } = req.body || {};
      if (!new_password || new_password.length < 6) {
        return res
          .status(400)
          .json({ error: "new_password อย่างน้อย 6 ตัวอักษร" });
      }

      const salt = await bcrypt.genSalt(10);
      const hash = await bcrypt.hash(new_password, salt);

      db.query(
        `UPDATE u_user SET password = ?, u_update_date = NOW() WHERE user_key = ?`,
        [hash, user_key],
        (err, result) => {
          if (err) return res.status(500).json({ error: "Database error" });
          if (result.affectedRows === 0)
            return res.status(404).json({ error: "User not found" });
          res.json({ message: "password updated" });
        },
      );
    } catch (e) {
      console.error(e);
      res.status(500).json({ error: "Server error" });
    }
  },
);

// ─────────────────────────────────────────────────────────────────────────────
// (ตัวเลือก) ADMIN: ลบผู้ใช้
// DELETE /api/admin/users/:user_key
app.delete("/api/admin/users/:user_key", requireAdminOrDev, (req, res) => {
  const { user_key } = req.params;
  db.query(
    `DELETE FROM u_user WHERE user_key = ?`,
    [user_key],
    (err, result) => {
      if (err) return res.status(500).json({ error: "Database error" });
      if (result.affectedRows === 0)
        return res.status(404).json({ error: "User not found" });
      res.json({ message: "deleted" });
    },
  );
});

// ─────────────────────────────────────────────────────────────────────────────
// 001-start-POST-inspection
app.post("/api/inspection", (req, res) => {
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
    user_id,
  } = req.body;

  const insp_station_now = "Start";

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
    [
      cusNo,
      name,
      branch,
      priority,
      sale_quote,
      service_order,
      service_type,
      service_item,
      document_date,
      motor_code,
      insp_station_now,
    ],
    (err, result) => {
      if (err) {
        console.error("Insert Error:", err);
        return res.status(500).json({ error: "ไม่สามารถบันทึกข้อมูลได้" });
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
          console.error("Log Error:", logErr);
        }

        const selectSql = `
          SELECT insp_no FROM tbl_inspection_list WHERE insp_id = ?
        `;

        db.query(selectSql, [inspectionId], (selectErr, rows) => {
          if (selectErr || rows.length === 0) {
            console.error("Select insp_no Error:", selectErr);
            return res.json({ success: true, id: inspectionId });
          }

          const inspNo = rows[0].insp_no;
          res.json({ success: true, id: inspectionId, insp_no: inspNo });
        });
      });
    },
  );
});

// ─────────────────────────────────────────────────────────────────────────────
// 002-GET-Motor
app.get("/api/motors", (req, res) => {
  db.query(
    "SELECT motor_code, motor_name FROM list_motor_type WHERE is_active = 1",
    (err, results) => {
      if (err) {
        console.error("Query motor error:", err);
        return res.status(500).json({ error: "ไม่สามารถดึง motor ได้" });
      }
      res.json(results);
    },
  );
});

// ─────────────────────────────────────────────────────────────────────────────
// DRY list endpoints
function createStepEndpoint(path, stationList, label) {
  app.get(path, (req, res) => {
    const { branch = "" } = req.query;
    const placeholders = stationList.map(() => "?").join(", ");

    // ใช้ let เพราะจะมีการต่อสตริงเพิ่ม
    let sql = `
      SELECT 
        i.*, 
        mn.fmn_power,
        mn.fmn_power_unit,
        tr.trp_service_order, 
        tr.trp_motor_code, 
        tr.trp_customer AS trp_customer_name,
        tr.trp_tag_no, 
        tr.trp_team,
        mt1.motor_name AS insp_motor_name
      FROM tbl_inspection_list i
      LEFT JOIN form_test_report tr ON i.insp_no = tr.insp_no
      LEFT JOIN form_motor_nameplate mn ON i.insp_no = mn.insp_no
      LEFT JOIN list_motor_type mt1 ON i.insp_motor_code = mt1.motor_code
      WHERE (
        i.insp_station_now IN (${placeholders})
        OR (
          i.insp_station_prev IN (${placeholders})
          AND i.insp_station_accept = '0'
        )
      )
    `;

    // ใช้ const ได้ เพราะเรา push (mutation) ไม่ได้ reassign ตัวแปร
    const params = [...stationList, ...stationList];

    // ใส่ branch filter หลังจบกลุ่ม WHERE หลัก
    if (branch) {
      sql += ` AND i.insp_branch = ?`;
      params.push(branch);
    }
    sql += ` GROUP BY i.insp_id`;
    sql += ` ORDER BY i.insp_created_at DESC, i.inspection_updated_at DESC`;

    db.query(sql, params, (err, results) => {
      if (err) {
        console.error(`Query error for ${label}:`, err);
        return res.status(500).json({ error: `ไม่สามารถดึง Step${label} ได้` });
      }

      const formatted = results.map((row) => ({
        ...row,
        insp_document_date: row.insp_document_date
          ? dayjs(row.insp_document_date).format("YYYY-MM-DD")
          : null,
        insp_created_at: row.insp_created_at
          ? dayjs(row.insp_created_at).format("YYYY-MM-DD HH:mm:ss")
          : null,
      }));

      res.json(formatted);
    });
  });
}

createStepEndpoint(
  "/api/StepQA",
  ["QA BLANK", "QA Incoming", "QA final", "QA appr"],
  "QA Incomming",
);
createStepEndpoint("/api/StepME", ["ME", "ME Final"], "ME");
createStepEndpoint("/api/StepPlanning", ["PLANNING"], "Planning");
createStepEndpoint("/api/StepCS", ["CS", "CS Prove"], "CS");
createStepEndpoint("/api/StepQC", ["QC Incoming", "QC Final"], "QC Incoming");
createStepEndpoint("/api/StepReport", ["Report", "End"], "Going");

// ─────────────────────────────────────────────────────────────────────────────
app.post("/api/manpower", (req, res) => {
  const { insp_no, manpower } = req.body;

  // Validate input

  //ให้ดักที่ frontend แทนเนื่องจาก manpower อาจจะมีค่าว่างได้ถ้ายังไม่แน่ใจ
  /* if (!insp_no || manpower === undefined || manpower === null) {
    return res.status(400).json({
      error: 'กรุณาระบุข้อมูลให้ครบถ้วน'
    });
  } */

  const updateManpower = `
    UPDATE tbl_inspection_list
    SET insp_station_manpower = ?,
        inspection_updated_at = NOW()
    WHERE insp_no = ?
  `;

  db.query(updateManpower, [manpower, insp_no], (err, result) => {
    if (err) {
      console.error("Update error:", err);
      return res.status(500).json({
        error: "ไม่สามารถอัปเดตจำนวนคนได้",
      });
    }

    // ตรวจสอบว่ามีการ update จริงหรือไม่
    if (result.affectedRows === 0) {
      return res.status(404).json({
        error: "ไม่พบข้อมูลที่ต้องการอัปเดต",
      });
    }

    // ส่ง response สำเร็จ
    res.json({
      success: true,
      message: "อัปเดตจำนวนคนสำเร็จ",
      affectedRows: result.affectedRows,
    });
  });
});

// Stations
app.post("/api/send_station001", (req, res) => {
  const { insp_id, insp_no, next_station, user_id, manpower } = req.body;

  const updateSql = `
    UPDATE tbl_inspection_list 
    SET insp_station_prev = insp_station_now, 
        insp_station_now = ?, 
        insp_station_accept = '0',
        insp_status = 'In Progress', 
        inspection_updated_at = NOW(),
        insp_station_manpower = NULL
    WHERE insp_id = ?
  `;

  db.query(updateSql, [next_station, insp_id], (err) => {
    if (err) {
      console.error("Update error:", err);
      return res.status(500).json({ error: "ไม่สามารถอัปเดตสถานีได้" });
    }

    // หา station_step สูงสุดปัจจุบัน
    const getMaxStepSql = `
      SELECT COALESCE(MAX(station_step), 0) AS current_max_step 
      FROM logs_inspection_stations 
      WHERE insp_id = ?
    `;

    db.query(getMaxStepSql, [insp_id], (err1, result) => {
      if (err1) {
        console.error("Get max step error:", err1);
        return res.status(500).json({ error: "ไม่สามารถหา step ปัจจุบันได้" });
      }

      const currentMaxStep = result[0].current_max_step;
      const nextStep = currentMaxStep + 1;

      // Update manpower ให้สถานีก่อนหน้า (station_step ปัจจุบัน)
      if (currentMaxStep > 0) {
        const updateManpowerSql = `
          UPDATE logs_inspection_stations 
          SET station_manpower = ? 
          WHERE insp_id = ? 
            AND station_step = ?
        `;

        db.query(
          updateManpowerSql,
          [manpower, insp_id, currentMaxStep],
          (err2) => {
            if (err2) {
              console.error("Manpower update error:", err2);
              // ไม่ return เพราะไม่ให้ manpower error หยุด flow หลัก
            }
          },
        );
      }

      // Insert log ใหม่ด้วย station_step ถัดไป
      const insertLogSql = `
        INSERT INTO logs_inspection_stations (
          insp_id,
          insp_no,
          station_step,
          station_name,
          station_status,
          station_timestamp,
          station_manpower,
          created_at,
          user_id
        ) VALUES (?, ?, ?, ?, ?, NOW(), NULL, NOW(), ?)
      `;

      db.query(
        insertLogSql,
        [insp_id, insp_no, nextStep, next_station, "PENDING", user_id],
        (err3) => {
          if (err3) {
            console.error("Log insert error:", err3);
            return res.status(500).json({ error: "บันทึก timeline ไม่สำเร็จ" });
          }
          notifyFollowers(insp_id);
          res.json({ success: true });
        },
      );
    });
  });
});

app.post("/api/accept_station", (req, res) => {
  const { insp_no, insp_id, user_id } = req.body;

  const getStationSql = `
    SELECT insp_station_now 
    FROM tbl_inspection_list 
    WHERE insp_id = ?
  `;

  db.query(getStationSql, [insp_id], (err, results) => {
    if (err || results.length === 0) {
      console.error("Fetch station error:", err);
      return res
        .status(500)
        .json({ error: "ไม่พบข้อมูลสถานีหรือเกิดข้อผิดพลาด" });
    }

    const currentStation = results[0].insp_station_now;

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

      // หา station_step สูงสุดปัจจุบัน
      const getMaxStepSql = `
        SELECT COALESCE(MAX(station_step), 0) AS current_max_step 
        FROM logs_inspection_stations 
        WHERE insp_id = ?
      `;

      db.query(getMaxStepSql, [insp_id], (err3, stepResult) => {
        if (err3) {
          console.error("Get max step error:", err3);
          return res
            .status(500)
            .json({ error: "ไม่สามารถหา step ปัจจุบันได้" });
        }

        const currentMaxStep = stepResult[0].current_max_step;
        const nextStep = currentMaxStep + 1;

        const insertLogSql = `
          INSERT INTO logs_inspection_stations (
            insp_id,
            insp_no,
            station_step,
            station_name,
            station_status,
            station_timestamp,
            created_at,
            user_id
          ) VALUES (?, ?, ?, ?, ?, NOW(), NOW(), ?)
        `;

        db.query(
          insertLogSql,
          [insp_id, insp_no, nextStep, currentStation, "accepted", user_id],
          (err4) => {
            if (err4) {
              console.error("Log insert error:", err4);
              return res
                .status(500)
                .json({ error: "บันทึก timeline ไม่สำเร็จ" });
            }

            notifyFollowers(insp_id);
            res.json({ success: true });
          },
        );
      });
    });
  });
});

app.post("/api/rework_station", (req, res) => {
  const { insp_id, insp_no, prev_station, now_station, user_id } = req.body;

  const updateSql = `
    UPDATE tbl_inspection_list 
    SET insp_station_prev = ?, 
        insp_station_now = ?, 
        insp_station_accept = '0',
        insp_status = 'In Progress', 
        inspection_updated_at = NOW(),
        insp_station_manpower = NULL
    WHERE insp_id = ?
  `;

  db.query(updateSql, [now_station, prev_station, insp_id], (err) => {
    if (err) {
      console.error("Update error:", err);
      return res.status(500).json({ error: "ไม่สามารถอัปเดตสถานีได้" });
    }

    // NOTE: หา station_step สูงสุดปัจจุบัน
    const getMaxStepSql = `
      SELECT COALESCE(MAX(station_step), 0) AS current_max_step 
      FROM logs_inspection_stations 
      WHERE insp_id = ?
    `;

    db.query(getMaxStepSql, [insp_id], (err1, result) => {
      if (err1) {
        console.error("Get max step error:", err1);
        return res.status(500).json({ error: "ไม่สามารถหา step ปัจจุบันได้" });
      }

      const currentMaxStep = result[0].current_max_step;
      const nextStep = currentMaxStep + 1;

      // Insert log ใหม่ด้วย station_step ถัดไป
      const insertLogSql = `
        INSERT INTO logs_inspection_stations (
          insp_id,
          insp_no,
          station_step,
          station_name,
          station_status,
          station_timestamp,
          station_manpower,
          created_at,
          user_id
        ) VALUES (?, ?, ?, ?, ?, NOW(), NULL, NOW(), ?)
      `;

      db.query(
        insertLogSql,
        [insp_id, insp_no, nextStep, prev_station, "REWORK", user_id],
        (err3) => {
          if (err3) {
            console.error("Log insert error:", err3);
            return res.status(500).json({ error: "บันทึก timeline ไม่สำเร็จ" });
          }
          notifyFollowers(insp_id);
          res.json({ success: true });
        },
      );
    });
  });
});

// ─────────────────────────────────────────────────────────────────────────────
// Lookups & APIs…
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
  i.insp_urgent,
  mt1.motor_name AS insp_motor_name,
  i.insp_station_user,
  i.insp_station_accept,
  i.insp_station_now,
  i.insp_station_prev,
  i.inspection_updated_at,
  i.insp_incoming_date,
  i.insp_final_date
FROM tbl_inspection_list i
LEFT JOIN form_test_report tr ON i.insp_no = tr.insp_no
LEFT JOIN list_motor_type mt1 ON i.insp_motor_code = mt1.motor_code
WHERE i.insp_no = ?
`;

  db.query(sql, [id], (err, results) => {
    if (err) {
      console.error("Database error:", err);
      return res
        .status(500)
        .json({ error: "เกิดข้อผิดพลาดในการเชื่อมต่อฐานข้อมูล" });
    }
    if (results.length === 0) {
      return res.status(404).json({ error: "ไม่พบข้อมูลใบงานนี้" });
    }
    res.json(results[0]);
  });
});

// ─────────────────────────────────────────────────────────────────────────────
// Update Motor Type
app.put("/api/inspection/:insp_id/motor-type", async (req, res) => {
  const { insp_id } = req.params;
  const { motorCode } = req.body;

  if (!motorCode) {
    return res.status(400).json({ error: "กรุณาระบุ motor_name" });
  }

  try {


    // ดึง motor_code เดิมเพื่อเก็บใน insp_motor_prev
    const [currentRows] = await db.promise().query(
      "SELECT insp_motor_code FROM tbl_inspection_list WHERE insp_id = ?",
      [insp_id]
    );

    if (currentRows.length === 0) {
      return res.status(404).json({ error: "ไม่พบข้อมูล inspection นี้" });
    }

    const prevMotorCode = currentRows[0].insp_motor_code;

    // อัพเดท motor_code ใหม่ และเก็บค่าเดิมใน insp_motor_prev
    await db.promise().query(
      `UPDATE tbl_inspection_list
       SET insp_motor_code = ?,
           insp_motor_prev = ?,
           inspection_updated_at = NOW()
       WHERE insp_id = ?`,
      [motorCode, prevMotorCode, insp_id]
    );

    res.json({
      success: true,
      message: "อัพเดท motor type สำเร็จ",
      data: {
        insp_id,
        new_motor_code: motorCode,
        prev_motor_code: prevMotorCode
      }
    });

  } catch (err) {
    console.error("Update motor type error:", err);
    res.status(500).json({ error: "เกิดข้อผิดพลาดในการอัพเดทข้อมูล" });
  }
});

// ─────────────────────────────────────────────────────────────────────────────
// FormTestReport (บันทึกแล้วส่งสถานีถ้าจำเป็น)
app.get("/api/forms/FormTestReport/:insp_no", (req, res) => {
  const { insp_no } = req.params;
  db.query(
    `
    SELECT 
      ins.*, 
      tr.*, 
      CONCAT_WS(' ', updater.name, updater.lastname) AS updatedBy,
      CONCAT_WS(' ', creator.name, creator.lastname) AS createdBy
    FROM tbl_inspection_list ins
    LEFT JOIN form_test_report tr ON ins.insp_no = tr.insp_no
    LEFT JOIN u_user updater ON tr.updated_by = updater.user_key
    LEFT JOIN u_user creator ON tr.created_by = creator.user_key
    WHERE ins.insp_no = ?
    `,
    [insp_no],
    (err, rows) => {
      if (err) {
        console.error("GET form_test_report error:", err);
        return res.status(500).json({ error: "Internal Server Error" });
      }

      if (!rows.length) return res.json(null);

      let row = rows[0];

      if (row.updated_at) {
        row.updatedAt = row.updated_at;
        row.createdAt = row.created_at;
      }

      if (row.insp_created_at) {
        row.insp_created_at = dayjs(row.insp_created_at).format(
          "DD/MM/YYYY HH:mm",
        );
      }

      row.updatedBy = row.updatedBy || row.createdBy || null;

      const { created_by, updated_by, updated_at, created_at, ...cleanRow } =
        row;

      res.json(cleanRow);
    },
  );
});

app.post("/api/forms/FormTestReport/:insp_no", (req, res) => {
  const { insp_no } = req.params;
  const payload = req.body;
  const user_id = payload.userKey || req.session?.user_id || 0;

  const normalizeDate = (value) => {
    if (!value || value === "") return null;
    try {
      return new Date(value).toISOString().slice(0, 19).replace("T", " ");
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
    trp_note: data.note,
  });

  db.query(
    "SELECT * FROM form_test_report WHERE insp_no = ?",
    [insp_no],
    (err, existing) => {
      if (err) {
        console.error("POST form_testreport error (select):", err);
        return res.status(500).json({ error: "Internal Server Error" });
      }

      const updateMotorCode = (callback) => {
        if (!payload.motorCode) {
          return callback();
        }
        db.query(
          `UPDATE tbl_inspection_list
           SET insp_motor_prev = insp_motor_code,
               insp_motor_code = ?
           WHERE insp_no = ?`,
          [payload.motorCode, insp_no],
          (errMotor) => {
            if (errMotor) {
              console.error("Update motor code error:", errMotor);
            }
            callback();
          }
        );
      };

      const saveAndSendStation = () => {
        if (payload.stationNow === "Start" && payload.stationTo) {
          db.query(
            "SELECT insp_id FROM tbl_inspection_list WHERE insp_no = ?",
            [insp_no],
            (errFind, result) => {
              if (errFind || result.length === 0) {
                console.error("หา insp_id ไม่เจอ:", errFind);
                return res.status(500).json({ error: "ไม่พบข้อมูล insp_id" });
              }

              const insp_id = result[0].insp_id;

              db.query(
                `
            UPDATE tbl_inspection_list 
            SET insp_station_prev = insp_station_now, 
                insp_station_now = ?, 
                insp_status = 'In Progress', 
                inspection_updated_at = NOW() 
            WHERE insp_id = ?
            `,
                [payload.stationTo, insp_id],
                (errUpdate) => {
                  if (errUpdate) {
                    console.error("Update error (station):", errUpdate);
                    return res
                      .status(500)
                      .json({ error: "ไม่สามารถอัปเดตสถานีได้" });
                  }

                  db.query(
                    `
                INSERT INTO logs_inspection_stations (
                  insp_id,
                  insp_no,
                  station_step,
                  station_name,
                  station_status,
                  station_timestamp,
                  created_at,
                  user_id
                ) VALUES (?, ?, ?, ?, ?, NOW(), NOW(), ?)
                `,
                    [
                      insp_id,
                      insp_no,
                      "1",
                      payload.stationTo,
                      "OPEN MOTOR",
                      user_id,
                    ],
                    (errInsert) => {
                      if (errInsert) {
                        console.error("Log insert error (station):", errInsert);
                        return res
                          .status(500)
                          .json({ error: "บันทึก timeline ไม่สำเร็จ" });
                      }

                      notifyFollowers(insp_id);
                      return res.json({ success: true });
                    },
                  );
                },
              );
            },
          );
        } else {
          return res.json({ success: true });
        }
      };

      if (existing.length > 0) {
        const updateData = {
          ...mapFields(payload),
          updated_by: user_id,
          updated_at: new Date(),
        };
        db.query(
          "UPDATE form_test_report SET ? WHERE insp_no = ?",
          [updateData, insp_no],
          (err2) => {
            if (err2) {
              console.error("POST form_testreport error (update):", err2);
              return res.status(500).json({ error: "Internal Server Error" });
            }
            updateMotorCode(() => saveAndSendStation());
          },
        );
      } else {
        const insertData = {
          ...mapFields(payload),
          insp_no,
          created_by: user_id,
          created_at: new Date(),
        };
        db.query("INSERT INTO form_test_report SET ?", [insertData], (err3) => {
          if (err3) {
            console.error("POST form_testreport error (insert):", err3);
            return res.status(500).json({ error: "Internal Server Error" });
          }
          updateMotorCode(() => saveAndSendStation());
        });
      }
    },
  );
});

// ─────────────────────────────────────────────────────────────────────────────
// Upload endpoints
app.post("/api/upload2", upload.single("file"), async (req, res) => {
  try {
    const { inspNo } = req.body;
    if (!inspNo || !req.file) {
      return res.status(400).json({ error: "Missing inspNo or file" });
    }

    // sanitize filename
    const safeOriginal = req.file.originalname
      .replace(/\s+/g, "_")
      .replace(/[^a-zA-Z0-9._-]/g, "");
    const fileName = safeOriginal || `img_${Date.now()}.jpg`;
    const outputPath = path.join(__dirname, "public", "img_upload", fileName);

    if (fs.existsSync(outputPath)) {
      return res.status(409).json({ error: "ไฟล์นี้มีอยู่แล้ว" });
    }

    await sharp(req.file.buffer).jpeg({ quality: 70 }).toFile(outputPath);

    const updateSql = `
      UPDATE form_test_report
      SET trp_img_name = TRIM(BOTH ',' FROM CONCAT_WS(',', trp_img_name, ?))
      WHERE insp_no = ?
    `;
    db.query(updateSql, [fileName, inspNo], (err) => {
      if (err) {
        console.error("DB update error:", err);
        return res.status(500).json({ error: "Database update failed" });
      }
      res.json({ success: true, filename: fileName });
    });
  } catch (err) {
    console.error("Upload error:", err);
    res.status(500).json({ error: "Image upload failed" });
  }
});

app.delete("/api/upload2", (req, res) => {
  const { filename, inspNo } = req.body;
  const filePath = path.join(__dirname, "public", "img_upload", filename);

  fs.unlink(filePath, (err) => {
    if (err) {
      console.error("Delete file error:", err);
      return res.status(500).json({ error: "Delete failed" });
    }

    const updateSql = `
      UPDATE form_test_report
      SET trp_img_name = REPLACE(CONCAT(',', trp_img_name, ','), CONCAT(',', ?, ','), ',')
      WHERE insp_no = ?
    `;
    db.query(updateSql, [filename, inspNo], (err2) => {
      if (err2) {
        console.error("DB update after delete failed:", err2);
        return res.status(500).json({ error: "DB update failed" });
      }
      res.json({ success: true });
    });
  });
});

// ─────────────────────────────────────────────────────────────────────────────
// Forms (เติม fallback user_id)
function withUserId(req) {
  return req.body?.userKey || req.session?.user_id || 0;
}

// ─────────────────────────────────────────────────────────────────────────────
// FormMotorNameplate (insert ใหม่เสมอ + GET ดึงแถวล่าสุด ด้วย insp_no)
app.get("/api/forms/FormMotorNameplate/:insp_no", (req, res) => {
  const { insp_no } = req.params;
  if (!insp_no) return res.status(400).json({ error: "missing insp_no" });

  const sql = `
  SELECT 
    fmn.*,  
    fmn.created_at as createdAt,
    fmn.updated_at as updatedAt,
    CONCAT_WS(' ', updater.name, updater.lastname) AS updatedBy,
    CONCAT_WS(' ', creator.name, creator.lastname) AS createdBy
  FROM form_motor_nameplate AS fmn
  LEFT JOIN u_user AS updater ON fmn.created_by = updater.user_key
  LEFT JOIN u_user AS creator ON fmn.updated_by = creator.user_key
  WHERE fmn.insp_no = ?
  ORDER BY COALESCE(fmn.updated_at, fmn.created_at) DESC, fmn.mnp_id DESC
  LIMIT 1
`;
  db.query(sql, [insp_no], (err, rows) => {
    if (err) {
      console.error("GET form_motor_nameplate error:", err);
      return res.status(500).json({ error: "Internal Server Error" });
    }
    if (!rows.length) {
      return res.json(null);
    }

    const { created_by, updated_by, created_at, updated_at, ...cleanRow } =
      rows[0];

    return res.json(cleanRow);
  });
});

app.post("/api/forms/FormMotorNameplate/:insp_no", (req, res) => {
  const { insp_no } = req.params;
  if (!insp_no) return res.status(400).json({ error: "missing insp_no" });

  const payload = req.body || {};
  const user_id = req.headers["user_key"];

  const insertData = {
    ...payload, // คาดว่าเป็นฟิลด์ fmn_*
    insp_no,
    created_by: user_id,
    updated_by: user_id,
    created_at: new Date(),
    updated_at: new Date(),
  };

  db.query(
    "INSERT INTO form_motor_nameplate SET ?",
    [insertData],
    (err, result) => {
      if (err) {
        console.error("POST form_motor_nameplate error (insert):", err);
        return res.status(500).json({ error: "Internal Server Error" });
      }
      res.status(201).json({ success: true, mnp_id: result.insertId });
    },
  );
});

// FormStaticTest
app.get("/api/forms/FormStaticTest/:insp_id", (req, res) => {
  const { insp_id } = req.params;
  db.query(
    "SELECT * FROM form_static_test WHERE insp_id = ?",
    [insp_id],
    (err, rows) => {
      if (err) {
        console.error("GET form_static_test error:", err);
        return res.status(500).json({ error: "Internal Server Error" });
      }
      res.json(rows.length > 0 ? rows[0] : null);
    },
  );
});

app.post("/api/forms/FormStaticTest/:insp_id", (req, res) => {
  const { insp_id } = req.params;
  const payload = req.body;
  const user_id = withUserId(req);
  db.query(
    "SELECT * FROM form_static_test WHERE insp_id = ?",
    [insp_id],
    (err, existing) => {
      if (err) {
        console.error("POST form_static_test error (select):", err);
        return res.status(500).json({ error: "Internal Server Error" });
      }
      if (existing.length > 0) {
        db.query(
          "UPDATE form_static_test SET ?, updated_by=?, updated_at=NOW() WHERE insp_id = ?",
          [payload, user_id, insp_id],
          (err2) => {
            if (err2) {
              console.error("POST form_static_test error (update):", err2);
              return res.status(500).json({ error: "Internal Server Error" });
            }
            res.json({ success: true });
          },
        );
      } else {
        db.query(
          "INSERT INTO form_static_test SET ?, insp_id=?, created_by=?, created_at=NOW()",
          [payload, insp_id, user_id],
          (err3) => {
            if (err3) {
              console.error("POST form_static_test error (insert):", err3);
              return res.status(500).json({ error: "Internal Server Error" });
            }
            res.json({ success: true });
          },
        );
      }
    },
  );
});

// FormEquipmentTest
app.get("/api/forms/FormEquipmentTest/:insp_id", (req, res) => {
  const { insp_id } = req.params;
  db.query(
    "SELECT * FROM form_equipment_test WHERE insp_id = ?",
    [insp_id],
    (err, rows) => {
      if (err) {
        console.error("GET form_equipment_test error:", err);
        return res.status(500).json({ error: "Internal Server Error" });
      }
      res.json(rows.length > 0 ? rows[0] : null);
    },
  );
});

app.post("/api/forms/FormEquipmentTest/:insp_id", (req, res) => {
  const { insp_id } = req.params;
  const payload = req.body;
  const user_id = withUserId(req);
  db.query(
    "SELECT * FROM form_equipment_test WHERE insp_id = ?",
    [insp_id],
    (err, existing) => {
      if (err) {
        console.error("POST form_equipment_test error (select):", err);
        return res.status(500).json({ error: "Internal Server Error" });
      }
      if (existing.length > 0) {
        db.query(
          "UPDATE form_equipment_test SET ?, updated_by=?, updated_at=NOW() WHERE insp_id = ?",
          [payload, user_id, insp_id],
          (err2) => {
            if (err2) {
              console.error("POST form_equipment_test error (update):", err2);
              return res.status(500).json({ error: "Internal Server Error" });
            }
            res.json({ success: true });
          },
        );
      } else {
        db.query(
          "INSERT INTO form_equipment_test SET ?, insp_id=?, created_by=?, created_at=NOW()",
          [payload, insp_id, user_id],
          (err3) => {
            if (err3) {
              console.error("POST form_equipment_test error (insert):", err3);
              return res.status(500).json({ error: "Internal Server Error" });
            }
            res.json({ success: true });
          },
        );
      }
    },
  );
});

// FormDynamicTest
app.get("/api/forms/FormDynamicTest/:insp_id", (req, res) => {
  const { insp_id } = req.params;
  db.query(
    "SELECT * FROM form_dynamic_test WHERE insp_id = ?",
    [insp_id],
    (err, rows) => {
      if (err) {
        console.error("GET form_dynamic_test error:", err);
        return res.status(500).json({ error: "Internal Server Error" });
      }
      res.json(rows.length > 0 ? rows[0] : null);
    },
  );
});
app.post("/api/forms/FormDynamicTest/:insp_id", (req, res) => {
  const { insp_id } = req.params;
  const payload = req.body;
  const user_id = withUserId(req);
  db.query(
    "SELECT * FROM form_dynamic_test WHERE insp_id = ?",
    [insp_id],
    (err, existing) => {
      if (err) {
        console.error("POST form_dynamic_test error (select):", err);
        return res.status(500).json({ error: "Internal Server Error" });
      }
      if (existing.length > 0) {
        db.query(
          "UPDATE form_dynamic_test SET ?, updated_by=?, updated_at=NOW() WHERE insp_id = ?",
          [payload, user_id, insp_id],
          (err2) => {
            if (err2) {
              console.error("POST form_dynamic_test error (update):", err2);
              return res.status(500).json({ error: "Internal Server Error" });
            }
            res.json({ success: true });
          },
        );
      } else {
        db.query(
          "INSERT INTO form_dynamic_test SET ?, insp_id=?, created_by=?, created_at=NOW()",
          [payload, insp_id, user_id],
          (err3) => {
            if (err3) {
              console.error("POST form_dynamic_test error (insert):", err3);
              return res.status(500).json({ error: "Internal Server Error" });
            }
            res.json({ success: true });
          },
        );
      }
    },
  );
});

// FormHousingShaft
app.get("/api/forms/FormHousingShaft/:insp_id", (req, res) => {
  const { insp_id } = req.params;
  db.query(
    "SELECT * FROM form_housing_shaft WHERE insp_id = ?",
    [insp_id],
    (err, rows) => {
      if (err) {
        console.error("GET form_housing_shaft error:", err);
        return res.status(500).json({ error: "Internal Server Error" });
      }
      res.json(rows.length > 0 ? rows[0] : null);
    },
  );
});
app.post("/api/forms/FormHousingShaft/:insp_id", (req, res) => {
  const { insp_id } = req.params;
  const payload = req.body;
  const user_id = withUserId(req);
  db.query(
    "SELECT * FROM form_housing_shaft WHERE insp_id = ?",
    [insp_id],
    (err, existing) => {
      if (err) {
        console.error("POST form_housing_shaft error (select):", err);
        return res.status(500).json({ error: "Internal Server Error" });
      }
      if (existing.length > 0) {
        db.query(
          "UPDATE form_housing_shaft SET ?, updated_by=?, updated_at=NOW() WHERE insp_id = ?",
          [payload, user_id, insp_id],
          (err2) => {
            if (err2) {
              console.error("POST form_housing_shaft error (update):", err2);
              return res.status(500).json({ error: "Internal Server Error" });
            }
            res.json({ success: true });
          },
        );
      } else {
        db.query(
          "INSERT INTO form_housing_shaft SET ?, insp_id=?, created_by=?, created_at=NOW()",
          [payload, insp_id, user_id],
          (err3) => {
            if (err3) {
              console.error("POST form_housing_shaft error (insert):", err3);
              return res.status(500).json({ error: "Internal Server Error" });
            }
            res.json({ success: true });
          },
        );
      }
    },
  );
});

// FormRequisition
app.get("/api/forms/FormRequisition/:insp_id", (req, res) => {
  const { insp_id } = req.params;
  db.query(
    "SELECT * FROM form_requisition WHERE insp_id = ?",
    [insp_id],
    (err, rows) => {
      if (err) {
        console.error("GET form_requisition error:", err);
        return res.status(500).json({ error: "Internal Server Error" });
      }
      res.json(rows.length > 0 ? rows[0] : null);
    },
  );
});
app.post("/api/forms/FormRequisition/:insp_id", (req, res) => {
  const { insp_id } = req.params;
  const payload = req.body;
  const user_id = withUserId(req);
  db.query(
    "SELECT * FROM form_requisition WHERE insp_id = ?",
    [insp_id],
    (err, existing) => {
      if (err) {
        console.error("POST form_requisition error (select):", err);
        return res.status(500).json({ error: "Internal Server Error" });
      }
      if (existing.length > 0) {
        db.query(
          "UPDATE form_requisition SET ?, updated_by=?, updated_at=NOW() WHERE insp_id = ?",
          [payload, user_id, insp_id],
          (err2) => {
            if (err2) {
              console.error("POST form_requisition error (update):", err2);
              return res.status(500).json({ error: "Internal Server Error" });
            }
            res.json({ success: true });
          },
        );
      } else {
        db.query(
          "INSERT INTO form_requisition SET ?, insp_id=?, created_by=?, created_at=NOW()",
          [payload, insp_id, user_id],
          (err3) => {
            if (err3) {
              console.error("POST form_requisition error (insert):", err3);
              return res.status(500).json({ error: "Internal Server Error" });
            }
            res.json({ success: true });
          },
        );
      }
    },
  );
});

// FormBalance
app.get("/api/forms/FormBalance/:insp_id", (req, res) => {
  const { insp_id } = req.params;
  db.query(
    "SELECT * FROM form_balance WHERE insp_id = ?",
    [insp_id],
    (err, rows) => {
      if (err) {
        console.error("GET form_balance error:", err);
        return res.status(500).json({ error: "Internal Server Error" });
      }
      res.json(rows.length > 0 ? rows[0] : null);
    },
  );
});
app.post("/api/forms/FormBalance/:insp_id", (req, res) => {
  const { insp_id } = req.params;
  const payload = req.body;
  const user_id = withUserId(req);
  db.query(
    "SELECT * FROM form_balance WHERE insp_id = ?",
    [insp_id],
    (err, existing) => {
      if (err) {
        console.error("POST form_balance error (select):", err);
        return res.status(500).json({ error: "Internal Server Error" });
      }
      if (existing.length > 0) {
        db.query(
          "UPDATE form_balance SET ?, updated_by=?, updated_at=NOW() WHERE insp_id = ?",
          [payload, user_id, insp_id],
          (err2) => {
            if (err2) {
              console.error("POST form_balance error (update):", err2);
              return res.status(500).json({ error: "Internal Server Error" });
            }
            res.json({ success: true });
          },
        );
      } else {
        db.query(
          "INSERT INTO form_balance SET ?, insp_id=?, created_by=?, created_at=NOW()",
          [payload, insp_id, user_id],
          (err3) => {
            if (err3) {
              console.error("POST form_balance error (insert):", err3);
              return res.status(500).json({ error: "Internal Server Error" });
            }
            res.json({ success: true });
          },
        );
      }
    },
  );
});

// FormElectricalServices
app.get("/api/forms/FormElectricalServices/:insp_id", (req, res) => {
  const { insp_id } = req.params;
  db.query(
    "SELECT * FROM form_electrical_services WHERE insp_id = ?",
    [insp_id],
    (err, rows) => {
      if (err) {
        console.error("GET form_electrical_services error:", err);
        return res.status(500).json({ error: "Internal Server Error" });
      }
      res.json(rows.length > 0 ? rows[0] : null);
    },
  );
});
app.post("/api/forms/FormElectricalServices/:insp_id", (req, res) => {
  const { insp_id } = req.params;
  const payload = req.body;
  const user_id = withUserId(req);
  db.query(
    "SELECT * FROM form_electrical_services WHERE insp_id = ?",
    [insp_id],
    (err, existing) => {
      if (err) {
        console.error("POST form_electrical_services error (select):", err);
        return res.status(500).json({ error: "Internal Server Error" });
      }
      if (existing.length > 0) {
        db.query(
          "UPDATE form_electrical_services SET ?, updated_by=?, updated_at=NOW() WHERE insp_id = ?",
          [payload, user_id, insp_id],
          (err2) => {
            if (err2) {
              console.error(
                "POST form_electrical_services error (update):",
                err2,
              );
              return res.status(500).json({ error: "Internal Server Error" });
            }
            res.json({ success: true });
          },
        );
      } else {
        db.query(
          "INSERT INTO form_electrical_services SET ?, insp_id=?, created_by=?, created_at=NOW()",
          [payload, insp_id, user_id],
          (err3) => {
            if (err3) {
              console.error(
                "POST form_electrical_services error (insert):",
                err3,
              );
              return res.status(500).json({ error: "Internal Server Error" });
            }
            res.json({ success: true });
          },
        );
      }
    },
  );
});

// FormInstruments
app.get("/api/forms/FormInstruments/:insp_id", (req, res) => {
  const { insp_id } = req.params;
  const sql = `
    SELECT fi.*, u.name, u.lastname, lc.lc_equipment_name, lc.lc_model, lc.lc_no
    FROM form_instruments AS fi
    LEFT JOIN u_user AS u ON fi.created_by = u.user_key
    LEFT JOIN list_certificate AS lc ON fi.ins_lc_id = lc.lc_id
    WHERE fi.insp_id = ? AND fi.is_deleted = 0
    ORDER BY COALESCE(fi.updated_at, fi.created_at) DESC, fi.ins_id DESC
  `;
  db.query(sql, [insp_id], (err, rows) => {
    if (err) {
      console.error("GET form_instruments error:", err);
      return res.status(500).json({ error: "Internal Server Error" });
    }
    res.json(rows || []);
  });
});

app.post("/api/forms/FormInstruments/:insp_id", (req, res) => {
  const { insp_id } = req.params;
  const payload = req.body;
  const user_id = withUserId(req);
  db.query(
    "SELECT * FROM form_instruments WHERE insp_id = ?",
    [insp_id],
    (err, existing) => {
      if (err) {
        console.error("POST form_instruments error (select):", err);
        return res.status(500).json({ error: "Internal Server Error" });
      }
      if (existing.length > 0) {
        db.query(
          "UPDATE form_instruments SET ?, updated_by=?, updated_at=NOW() WHERE insp_id = ?",
          [payload, user_id, insp_id],
          (err2) => {
            if (err2) {
              console.error("POST form_instruments error (update):", err2);
              return res.status(500).json({ error: "Internal Server Error" });
            }
            res.json({ success: true });
          },
        );
      } else {
        db.query(
          "INSERT INTO form_instruments SET ?, insp_id=?, created_by=?, created_at=NOW()",
          [payload, insp_id, user_id],
          (err3) => {
            if (err3) {
              console.error("POST form_instruments error (insert):", err3);
              return res.status(500).json({ error: "Internal Server Error" });
            }
            res.json({ success: true });
          },
        );
      }
    },
  );
});

// FormCoilBrakeTest
app.get("/api/forms/FormCoilBrakeTest/:insp_id", (req, res) => {
  const { insp_id } = req.params;
  db.query(
    "SELECT * FROM form_coil_brake_test WHERE insp_id = ?",
    [insp_id],
    (err, rows) => {
      if (err) {
        console.error("GET form_coil_brake_test error:", err);
        return res.status(500).json({ error: "Internal Server Error" });
      }
      res.json(rows.length > 0 ? rows[0] : null);
    },
  );
});
app.post("/api/forms/FormCoilBrakeTest/:insp_id", (req, res) => {
  const { insp_id } = req.params;
  const payload = req.body;
  const user_id = withUserId(req);
  db.query(
    "SELECT * FROM form_coil_brake_test WHERE insp_id = ?",
    [insp_id],
    (err, existing) => {
      if (err) {
        console.error("POST form_coil_brake_test error (select):", err);
        return res.status(500).json({ error: "Internal Server Error" });
      }
      if (existing.length > 0) {
        db.query(
          "UPDATE form_coil_brake_test SET ?, updated_by=?, updated_at=NOW() WHERE insp_id = ?",
          [payload, user_id, insp_id],
          (err2) => {
            if (err2) {
              console.error("POST form_coil_brake_test error (update):", err2);
              return res.status(500).json({ error: "Internal Server Error" });
            }
            res.json({ success: true });
          },
        );
      } else {
        db.query(
          "INSERT INTO form_coil_brake_test SET ?, insp_id=?, created_by=?, created_at=NOW()",
          [payload, insp_id, user_id],
          (err3) => {
            if (err3) {
              console.error("POST form_coil_brake_test error (insert):", err3);
              return res.status(500).json({ error: "Internal Server Error" });
            }
            res.json({ success: true });
          },
        );
      }
    },
  );
});

// helper: เซฟ dataURL -> ไฟล์ แล้วคืน URL
function saveDataUrl(dataUrl, filenameBase) {
  if (!dataUrl || typeof dataUrl !== "string") return null;
  const m = dataUrl.match(/^data:(image\/[\w+.-]+);base64,([A-Za-z0-9+/=]+)$/);
  if (!m) return null;
  const mime = m[1];
  const b64 = m[2];
  const ext = (mime.split("/")[1] || "png").toLowerCase();
  const dir = path.join(process.cwd(), "public", "uploads", "signatures");
  fs.mkdirSync(dir, { recursive: true });
  const fname = `${filenameBase}.${ext}`;
  fs.writeFileSync(path.join(dir, fname), Buffer.from(b64, "base64"));
  // ปรับ path ตาม static you serve
  return `/uploads/signatures/${fname}`;
}

const toIso = (v) => (v ? new Date(v).toISOString() : null);
const emptyToNull = (v) => (v === "" ? null : v);

/** GET: ดึงแถวล่าสุดของฟอร์มลายเซ็นตาม insp_no */
app.get("/api/forms/FormApproval/:insp_no", (req, res) => {
  const { insp_no } = req.params;
  if (!insp_no) return res.status(400).json({ error: "missing insp_no" });

  const sql = `
    SELECT 
      fa.*,
      CONCAT_WS(' ', updater.name, updater.lastname) AS updatedBy,
      CONCAT_WS(' ', creator.name, creator.lastname) AS createdBy
    FROM form_approval AS fa
    LEFT JOIN u_user AS updater ON fa.updated_by = updater.user_key
    LEFT JOIN u_user AS creator ON fa.created_by = creator.user_key
    WHERE fa.insp_no = ?
      AND fa.is_deleted = 0
    ORDER BY COALESCE(fa.updated_at, fa.created_at) DESC, fa.apr_id DESC
    LIMIT 1;
  `;

  db.query(sql, [insp_no], (err, rows) => {
    if (err) {
      console.error("GET form_approval error:", err);
      return res.status(500).json({ error: "Internal Server Error" });
    }
    if (!rows.length) return res.json(null);

    const r = rows[0];
    const out = {
      // อิงกับฟอร์มลายเซ็นฝั่งหน้าเว็บ
      incoming_name: r.incoming_name ?? null,
      incoming_date: r.incoming_date,
      incoming_sign: r.incoming_sign_url ?? null,

      final_name: r.final_name ?? null,
      final_date: r.final_date,
      final_sign: r.final_sign_url ?? null,

      mech_name: r.mech_name ?? null,
      mech_date: r.mech_date,
      mech_sign: r.mech_sign_url ?? null,

      approve_name: r.approve_name ?? null,
      approve_date: r.approve_date, // ✅ เติมให้ครบ
      approve_sign: r.approve_sign_url ?? null,

      // context ของเอกสาร
      insp_no: r.insp_no,
      insp_sv: r.insp_sv ?? null,

      // meta สำหรับโชว์/ล็อกการแก้ไข
      meta: {
        apr_id: r.apr_id,
        createdAt: r.created_at,
        updatedAt: r.updated_at,
        createdBy: r.createdBy ?? null,
        updatedBy: r.updatedBy ?? null,
      },
    };

    return res.json(out);
  });
});

/** POST: สร้าง/อัปเดตฟอร์มลายเซ็นตาม insp_no (แถวเดียวต่องาน) */
app.post("/api/forms/FormApproval/:insp_no", (req, res) => {
  const { insp_no } = req.params;
  const userKey = req.headers["user_key"] || req.headers["x-user-key"];
  if (!insp_no) return res.status(400).json({ error: "missing insp_no" });
  if (!userKey) return res.status(400).json({ error: "missing user_key" });

  const p = req.body || {};
  const nowTag = Date.now();

  // สร้าง URL ของลายเซ็น (ถ้ามาเป็น base64 จะถูกแปลง)
  const toUrl = (val, tag) => {
    if (!val) return null;
    if (typeof val === "string" && val.startsWith("data:image/")) {
      return saveDataUrl(val, `${insp_no}-${tag}-${nowTag}`);
    }
    // เป็น URL อยู่แล้ว (http, https, หรือ path เริ่มด้วย /)
    if (
      /^(https?:)?\/\//.test(val) ||
      (typeof val === "string" && val.startsWith("/"))
    ) {
      return val;
    }
    return null;
  };

  // เตรียมค่าวางลงตาราง ('' => NULL)
  const row = {
    insp_no,
    insp_sv: emptyToNull(p.insp_sv),

    incoming_name: emptyToNull(p.incoming_name),
    incoming_date: p.incoming_date ? new Date(p.incoming_date) : null,
    incoming_sign_url: toUrl(p.incoming_sign, "incoming"),

    final_name: emptyToNull(p.final_name),
    final_date: p.final_date ? new Date(p.final_date) : null,
    final_sign_url: toUrl(p.final_sign, "final"),

    mech_name: emptyToNull(p.mech_name),
    mech_date: p.mech_date ? new Date(p.mech_date) : null,
    mech_sign_url: toUrl(p.mech_sign, "mech"),

    approve_name: emptyToNull(p.approve_name),
    approve_date: p.approve_date ? new Date(p.approve_date) : null,
    approve_sign_url: toUrl(p.approve_sign, "approve"),

    updated_by: userKey,
  };

  // หาแถวล่าสุดของงานนี้
  const sqlFind = `
    SELECT apr_id
    FROM form_approval
    WHERE insp_no = ? AND is_deleted = 0
    ORDER BY updated_at DESC, created_at DESC, apr_id DESC
    LIMIT 1
  `;

  db.query(sqlFind, [insp_no], (err, rows) => {
    if (err) {
      console.error("POST form_approval find error:", err);
      return res.status(500).json({ error: "Internal Server Error" });
    }

    if (!rows.length) {
      // INSERT (ครั้งแรกของงานนี้)
      const insertData = { ...row, created_by: userKey };
      const fields = Object.keys(insertData);
      const placeholders = fields.map(() => "?").join(",");
      const sqlIns = `INSERT INTO form_approval (${fields.join(
        ",",
      )}) VALUES (${placeholders})`;
      db.query(
        sqlIns,
        fields.map((k) => insertData[k]),
        (e2, r2) => {
          if (e2) {
            console.error("POST form_approval insert error:", e2);
            return res.status(500).json({ error: "Internal Server Error" });
          }
          // ดึงกลับไปให้ฟรอนต์
          db.query(
            "SELECT * FROM form_approval WHERE apr_id = ?",
            [r2.insertId],
            (e3, r3) => {
              if (e3 || !r3?.length) return res.json(null);
              const x = r3[0];
              return res.json({
                incoming_name: x.incoming_name,
                incoming_date: toIso(x.incoming_date),
                incoming_sign: x.incoming_sign_url,
                final_name: x.final_name,
                final_date: toIso(x.final_date),
                final_sign: x.final_sign_url,
                mech_name: x.mech_name,
                mech_date: toIso(x.mech_date),
                mech_sign: x.mech_sign_url,
                approve_name: x.approve_name,
                approve_date: toIso(x.approve_date),
                approve_sign: x.approve_sign_url,
                insp_no: x.insp_no,
                insp_sv: x.insp_sv,
                meta: {
                  apr_id: x.apr_id,
                  created_at: toIso(x.created_at),
                  updated_at: toIso(x.updated_at),
                  created_by: x.created_by ?? null,
                  updated_by: x.updated_by ?? null,
                },
              });
            },
          );
        },
      );
    } else {
      // UPDATE (แก้ไขแถวล่าสุด)
      const apr_id = rows[0].apr_id;

      // หมายเหตุ: ถ้าไม่อยากล้างรูปเมื่อฟรอนต์ส่งค่าว่าง ให้ใช้ตรรกะเฉพาะเจาะจงที่นี่
      const fields = Object.keys(row)
        .map((k) => `${k} = ?`)
        .join(", ");
      const sqlUpd = `UPDATE form_approval SET ${fields}, updated_at = CURRENT_TIMESTAMP WHERE apr_id = ?`;

      db.query(
        sqlUpd,
        [...Object.keys(row).map((k) => row[k]), apr_id],
        (e2) => {
          if (e2) {
            console.error("POST form_approval update error:", e2);
            return res.status(500).json({ error: "Internal Server Error" });
          }
          db.query(
            "SELECT * FROM form_approval WHERE apr_id = ?",
            [apr_id],
            (e3, r3) => {
              if (e3 || !r3?.length) return res.json(null);
              const x = r3[0];
              return res.json({
                incoming_name: x.incoming_name,
                incoming_date: toIso(x.incoming_date),
                incoming_sign: x.incoming_sign_url,
                final_name: x.final_name,
                final_date: toIso(x.final_date),
                final_sign: x.final_sign_url,
                mech_name: x.mech_name,
                mech_date: toIso(x.mech_date),
                mech_sign: x.mech_sign_url,
                approve_name: x.approve_name,
                approve_date: toIso(x.approve_date),
                approve_sign: x.approve_sign_url,
                insp_no: x.insp_no,
                insp_sv: x.insp_sv,
                meta: {
                  apr_id: x.apr_id,
                  created_at: toIso(x.created_at),
                  updated_at: toIso(x.updated_at),
                  created_by: x.created_by ?? null,
                  updated_by: x.updated_by ?? null,
                },
              });
            },
          );
        },
      );
    }
  });
});

// FormMechanicalServices
app.get("/api/forms/FormMechanicalServices/:insp_id", (req, res) => {
  const { insp_id } = req.params;
  db.query(
    "SELECT * FROM form_mechanical_services WHERE insp_id = ?",
    [insp_id],
    (err, rows) => {
      if (err) {
        console.error("GET form_mechanical_services error:", err);
        return res.status(500).json({ error: "Internal Server Error" });
      }
      res.json(rows.length > 0 ? rows[0] : null);
    },
  );
});
app.post("/api/forms/FormMechanicalServices/:insp_id", (req, res) => {
  const { insp_id } = req.params;
  const payload = req.body;
  const user_id = withUserId(req);
  db.query(
    "SELECT * FROM form_mechanical_services WHERE insp_id = ?",
    [insp_id],
    (err, existing) => {
      if (err) {
        console.error("POST form_mechanical_services error (select):", err);
        return res.status(500).json({ error: "Internal Server Error" });
      }
      if (existing.length > 0) {
        db.query(
          "UPDATE form_mechanical_services SET ?, updated_by=?, updated_at=NOW() WHERE insp_id = ?",
          [payload, user_id, insp_id],
          (err2) => {
            if (err2) {
              console.error(
                "POST form_mechanical_services error (update):",
                err2,
              );
              return res.status(500).json({ error: "Internal Server Error" });
            }
            res.json({ success: true });
          },
        );
      } else {
        db.query(
          "INSERT INTO form_mechanical_services SET ?, insp_id=?, created_by=?, created_at=NOW()",
          [payload, insp_id, user_id],
          (err3) => {
            if (err3) {
              console.error(
                "POST form_mechanical_services error (insert):",
                err3,
              );
              return res.status(500).json({ error: "Internal Server Error" });
            }
            res.json({ success: true });
          },
        );
      }
    },
  );
});

// FormMechanicalInspectionData
app.get("/api/forms/FormMechanicalInspectionData/:insp_id", (req, res) => {
  const { insp_id } = req.params;
  db.query(
    "SELECT * FROM form_mechanical_inspection_data WHERE insp_id = ?",
    [insp_id],
    (err, rows) => {
      if (err) {
        console.error("GET form_mechanical_inspection_data error:", err);
        return res.status(500).json({ error: "Internal Server Error" });
      }
      res.json(rows.length > 0 ? rows[0] : null);
    },
  );
});
app.post("/api/forms/FormMechanicalInspectionData/:insp_id", (req, res) => {
  const { insp_id } = req.params;
  const payload = req.body;
  const user_id = withUserId(req);
  db.query(
    "SELECT * FROM form_mechanical_inspection_data WHERE insp_id = ?",
    [insp_id],
    (err, existing) => {
      if (err) {
        console.error(
          "POST form_mechanical_inspection_data error (select):",
          err,
        );
        return res.status(500).json({ error: "Internal Server Error" });
      }
      if (existing.length > 0) {
        db.query(
          "UPDATE form_mechanical_inspection_data SET ?, updated_by=?, updated_at=NOW() WHERE insp_id = ?",
          [payload, user_id, insp_id],
          (err2) => {
            if (err2) {
              console.error(
                "POST form_mechanical_inspection_data error (update):",
                err2,
              );
              return res.status(500).json({ error: "Internal Server Error" });
            }
            res.json({ success: true });
          },
        );
      } else {
        db.query(
          "INSERT INTO form_mechanical_inspection_data SET ?, insp_id=?, created_by=?, created_at=NOW()",
          [payload, insp_id, user_id],
          (err3) => {
            if (err3) {
              console.error(
                "POST form_mechanical_inspection_data error (insert):",
                err3,
              );
              return res.status(500).json({ error: "Internal Server Error" });
            }
            res.json({ success: true });
          },
        );
      }
    },
  );
});

// FormLaserAlignment
app.get("/api/forms/FormLaserAlignment/:insp_id", (req, res) => {
  const { insp_id } = req.params;
  db.query(
    "SELECT * FROM form_laser_alignment WHERE insp_id = ?",
    [insp_id],
    (err, rows) => {
      if (err) {
        console.error("GET form_laser_alignment error:", err);
        return res.status(500).json({ error: "Internal Server Error" });
      }
      res.json(rows.length > 0 ? rows[0] : null);
    },
  );
});
app.post("/api/forms/FormLaserAlignment/:insp_id", (req, res) => {
  const { insp_id } = req.params;
  const payload = req.body;
  const user_id = withUserId(req);
  db.query(
    "SELECT * FROM form_laser_alignment WHERE insp_id = ?",
    [insp_id],
    (err, existing) => {
      if (err) {
        console.error("POST form_laser_alignment error (select):", err);
        return res.status(500).json({ error: "Internal Server Error" });
      }
      if (existing.length > 0) {
        db.query(
          "UPDATE form_laser_alignment SET ?, updated_by=?, updated_at=NOW() WHERE insp_id = ?",
          [payload, user_id, insp_id],
          (err2) => {
            if (err2) {
              console.error("POST form_laser_alignment error (update):", err2);
              return res.status(500).json({ error: "Internal Server Error" });
            }
            res.json({ success: true });
          },
        );
      } else {
        db.query(
          "INSERT INTO form_laser_alignment SET ?, insp_id=?, created_by=?, created_at=NOW()",
          [payload, insp_id, user_id],
          (err3) => {
            if (err3) {
              console.error("POST form_laser_alignment error (insert):", err3);
              return res.status(500).json({ error: "Internal Server Error" });
            }
            res.json({ success: true });
          },
        );
      }
    },
  );
});

// FormVibrationAfterInstalled
app.get("/api/forms/FormVibrationAfterInstalled/:insp_id", (req, res) => {
  const { insp_id } = req.params;
  db.query(
    "SELECT * FROM form_vibration_after_installed WHERE insp_id = ?",
    [insp_id],
    (err, rows) => {
      if (err) {
        console.error("GET form_vibration_after_installed error:", err);
        return res.status(500).json({ error: "Internal Server Error" });
      }
      res.json(rows.length > 0 ? rows[0] : null);
    },
  );
});
app.post("/api/forms/FormVibrationAfterInstalled/:insp_id", (req, res) => {
  const { insp_id } = req.params;
  const payload = req.body;
  const user_id = withUserId(req);
  db.query(
    "SELECT * FROM form_vibration_after_installed WHERE insp_id = ?",
    [insp_id],
    (err, existing) => {
      if (err) {
        console.error(
          "POST form_vibration_after_installed error (select):",
          err,
        );
        return res.status(500).json({ error: "Internal Server Error" });
      }
      if (existing.length > 0) {
        db.query(
          "UPDATE form_vibration_after_installed SET ?, updated_by=?, updated_at=NOW() WHERE insp_id = ?",
          [payload, user_id, insp_id],
          (err2) => {
            if (err2) {
              console.error(
                "POST form_vibration_after_installed error (update):",
                err2,
              );
              return res.status(500).json({ error: "Internal Server Error" });
            }
            res.json({ success: true });
          },
        );
      } else {
        db.query(
          "INSERT INTO form_vibration_after_installed SET ?, insp_id=?, created_by=?, created_at=NOW()",
          [payload, insp_id, user_id],
          (err3) => {
            if (err3) {
              console.error(
                "POST form_vibration_after_installed error (insert):",
                err3,
              );
              return res.status(500).json({ error: "Internal Server Error" });
            }
            res.json({ success: true });
          },
        );
      }
    },
  );
});

// FormCoreLossHotSpot
app.get("/api/forms/FormCoreLossHotSpot/:insp_id", (req, res) => {
  const { insp_id } = req.params;
  db.query(
    "SELECT * FROM form_core_loss_hot_spot WHERE insp_id = ?",
    [insp_id],
    (err, rows) => {
      if (err) {
        console.error("GET form_core_loss_hot_spot error:", err);
        return res.status(500).json({ error: "Internal Server Error" });
      }
      res.json(rows.length > 0 ? rows[0] : null);
    },
  );
});
app.post("/api/forms/FormCoreLossHotSpot/:insp_id", (req, res) => {
  const { insp_id } = req.params;
  const payload = req.body;
  const user_id = withUserId(req);
  db.query(
    "SELECT * FROM form_core_loss_hot_spot WHERE insp_id = ?",
    [insp_id],
    (err, existing) => {
      if (err) {
        console.error("POST form_core_loss_hot_spot error (select):", err);
        return res.status(500).json({ error: "Internal Server Error" });
      }
      if (existing.length > 0) {
        db.query(
          "UPDATE form_core_loss_hot_spot SET ?, updated_by=?, updated_at=NOW() WHERE insp_id = ?",
          [payload, user_id, insp_id],
          (err2) => {
            if (err2) {
              console.error(
                "POST form_core_loss_hot_spot error (update):",
                err2,
              );
              return res.status(500).json({ error: "Internal Server Error" });
            }
            res.json({ success: true });
          },
        );
      } else {
        db.query(
          "INSERT INTO form_core_loss_hot_spot SET ?, insp_id=?, created_by=?, created_at=NOW()",
          [payload, insp_id, user_id],
          (err3) => {
            if (err3) {
              console.error(
                "POST form_core_loss_hot_spot error (insert):",
                err3,
              );
              return res.status(500).json({ error: "Internal Server Error" });
            }
            res.json({ success: true });
          },
        );
      }
    },
  );
});

// FormRewind
app.get("/api/forms/FormRewind/:insp_id", (req, res) => {
  const { insp_id } = req.params;
  db.query(
    "SELECT * FROM form_rewind WHERE insp_id = ?",
    [insp_id],
    (err, rows) => {
      if (err) {
        console.error("GET form_rewind error:", err);
        return res.status(500).json({ error: "Internal Server Error" });
      }
      res.json(rows.length > 0 ? rows[0] : null);
    },
  );
});
app.post("/api/forms/FormRewind/:insp_id", (req, res) => {
  const { insp_id } = req.params;
  const payload = req.body;
  const user_id = withUserId(req);
  db.query(
    "SELECT * FROM form_rewind WHERE insp_id = ?",
    [insp_id],
    (err, existing) => {
      if (err) {
        console.error("POST form_rewind error (select):", err);
        return res.status(500).json({ error: "Internal Server Error" });
      }
      if (existing.length > 0) {
        db.query(
          "UPDATE form_rewind SET ?, updated_by=?, updated_at=NOW() WHERE insp_id = ?",
          [payload, user_id, insp_id],
          (err2) => {
            if (err2) {
              console.error("POST form_rewind error (update):", err2);
              return res.status(500).json({ error: "Internal Server Error" });
            }
            res.json({ success: true });
          },
        );
      } else {
        db.query(
          "INSERT INTO form_rewind SET ?, insp_id=?, created_by=?, created_at=NOW()",
          [payload, insp_id, user_id],
          (err3) => {
            if (err3) {
              console.error("POST form_rewind error (insert):", err3);
              return res.status(500).json({ error: "Internal Server Error" });
            }
            res.json({ success: true });
          },
        );
      }
    },
  );
});

// FormMachine
app.get("/api/forms/FormMachine/:insp_id", (req, res) => {
  const { insp_id } = req.params;
  db.query(
    "SELECT * FROM form_machine WHERE insp_id = ?",
    [insp_id],
    (err, rows) => {
      if (err) {
        console.error("GET form_machine error:", err);
        return res.status(500).json({ error: "Internal Server Error" });
      }
      res.json(rows.length > 0 ? rows[0] : null);
    },
  );
});
app.post("/api/forms/FormMachine/:insp_id", (req, res) => {
  const { insp_id } = req.params;
  const payload = req.body;
  const user_id = withUserId(req);
  db.query(
    "SELECT * FROM form_machine WHERE insp_id = ?",
    [insp_id],
    (err, existing) => {
      if (err) {
        console.error("POST form_machine error (select):", err);
        return res.status(500).json({ error: "Internal Server Error" });
      }
      if (existing.length > 0) {
        db.query(
          "UPDATE form_machine SET ?, updated_by=?, updated_at=NOW() WHERE insp_id = ?",
          [payload, user_id, insp_id],
          (err2) => {
            if (err2) {
              console.error("POST form_machine error (update):", err2);
              return res.status(500).json({ error: "Internal Server Error" });
            }
            res.json({ success: true });
          },
        );
      } else {
        db.query(
          "INSERT INTO form_machine SET ?, insp_id=?, created_by=?, created_at=NOW()",
          [payload, insp_id, user_id],
          (err3) => {
            if (err3) {
              console.error("POST form_machine error (insert):", err3);
              return res.status(500).json({ error: "Internal Server Error" });
            }
            res.json({ success: true });
          },
        );
      }
    },
  );
});

// FormPartData
app.get("/api/forms/FormPartData/:insp_id", (req, res) => {
  const { insp_id } = req.params;
  db.query(
    "SELECT * FROM form_part_data WHERE insp_id = ?",
    [insp_id],
    (err, rows) => {
      if (err) {
        console.error("GET form_part_data error:", err);
        return res.status(500).json({ error: "Internal Server Error" });
      }
      res.json(rows.length > 0 ? rows[0] : null);
    },
  );
});
app.post("/api/forms/FormPartData/:insp_id", (req, res) => {
  const { insp_id } = req.params;
  const payload = req.body;
  const user_id = withUserId(req);
  db.query(
    "SELECT * FROM form_part_data WHERE insp_id = ?",
    [insp_id],
    (err, existing) => {
      if (err) {
        console.error("POST form_part_data error (select):", err);
        return res.status(500).json({ error: "Internal Server Error" });
      }
      if (existing.length > 0) {
        db.query(
          "UPDATE form_part_data SET ?, updated_by=?, updated_at=NOW() WHERE insp_id = ?",
          [payload, user_id, insp_id],
          (err2) => {
            if (err2) {
              console.error("POST form_part_data error (update):", err2);
              return res.status(500).json({ error: "Internal Server Error" });
            }
            res.json({ success: true });
          },
        );
      } else {
        db.query(
          "INSERT INTO form_part_data SET ?, insp_id=?, created_by=?, created_at=NOW()",
          [payload, insp_id, user_id],
          (err3) => {
            if (err3) {
              console.error("POST form_partdata error (insert):", err3);
              return res.status(500).json({ error: "Internal Server Error" });
            }
            res.json({ success: true });
          },
        );
      }
    },
  );
});

// FormAttachments
app.get("/api/forms/FormAttachments/:insp_id", (req, res) => {
  const { insp_id } = req.params;
  db.query(
    "SELECT * FROM form_attachments WHERE insp_id = ?",
    [insp_id],
    (err, rows) => {
      if (err) {
        console.error("GET form_attachments error:", err);
        return res.status(500).json({ error: "Internal Server Error" });
      }
      res.json(rows.length > 0 ? rows[0] : null);
    },
  );
});
app.post("/api/forms/FormAttachments/:insp_id", (req, res) => {
  const { insp_id } = req.params;
  const payload = req.body;
  const user_id = withUserId(req);
  db.query(
    "SELECT * FROM form_attachments WHERE insp_id = ?",
    [insp_id],
    (err, existing) => {
      if (err) {
        console.error("POST form_attachments error (select):", err);
        return res.status(500).json({ error: "Internal Server Error" });
      }
      if (existing.length > 0) {
        db.query(
          "UPDATE form_attachments SET ?, updated_by=?, updated_at=NOW() WHERE insp_id = ?",
          [payload, user_id, insp_id],
          (err2) => {
            if (err2) {
              console.error("POST form_attachments error (update):", err2);
              return res.status(500).json({ error: "Internal Server Error" });
            }
            res.json({ success: true });
          },
        );
      } else {
        db.query(
          "INSERT INTO form_attachments SET ?, insp_id=?, created_by=?, created_at=NOW()",
          [payload, insp_id, user_id],
          (err3) => {
            if (err3) {
              console.error("POST form_attachments error (insert):", err3);
              return res.status(500).json({ error: "Internal Server Error" });
            }
            res.json({ success: true });
          },
        );
      }
    },
  );
});

// FormPhotoManager
app.get("/api/forms/FormPhotoManager/:insp_id", (req, res) => {
  const { insp_id } = req.params;
  db.query(
    "SELECT * FROM form_photo_manager WHERE insp_id = ?",
    [insp_id],
    (err, rows) => {
      if (err) {
        console.error("GET form_photo_manager error:", err);
        return res.status(500).json({ error: "Internal Server Error" });
      }
      res.json(rows.length > 0 ? rows[0] : null);
    },
  );
});
app.post("/api/forms/FormPhotoManager/:insp_id", (req, res) => {
  const { insp_id } = req.params;
  const payload = req.body;
  const user_id = withUserId(req);
  db.query(
    "SELECT * FROM form_photo_manager WHERE insp_id = ?",
    [insp_id],
    (err, existing) => {
      if (err) {
        console.error("POST form_photo_manager error (select):", err);
        return res.status(500).json({ error: "Internal Server Error" });
      }
      if (existing.length > 0) {
        db.query(
          "UPDATE form_photo_manager SET ?, updated_by=?, updated_at=NOW() WHERE insp_id = ?",
          [payload, user_id, insp_id],
          (err2) => {
            if (err2) {
              console.error("POST form_photo_manager error (update):", err2);
              return res.status(500).json({ error: "Internal Server Error" });
            }
            res.json({ success: true });
          },
        );
      } else {
        db.query(
          "INSERT INTO form_photo_manager SET ?, insp_id=?, created_by=?, created_at=NOW()",
          [payload, insp_id, user_id],
          (err3) => {
            if (err3) {
              console.error("POST form_photo_manager error (insert):", err3);
              return res.status(500).json({ error: "Internal Server Error" });
            }
            res.json({ success: true });
          },
        );
      }
    },
  );
});

// Tag list
app.get("/api/tagList", (req, res) => {
  const { branch = "" } = req.query;

  const params = [];
  let sql = `
    SELECT
      i.*,
      m.motor_name,
      i.insp_motor_code AS effective_motor_code
    FROM tbl_inspection_list AS i
    LEFT JOIN list_motor_type AS m
      ON m.motor_code = i.insp_motor_code
     AND m.is_active = '1'
  `;

  if (branch) {
    sql += ` WHERE i.insp_branch = ?`;
    params.push(branch);
  }

  sql += `
    ORDER BY COALESCE(i.inspection_updated_at, i.insp_created_at) DESC
    LIMIT 1000
  `;

  db.query(sql, params, (err, results) => {
    if (err) {
      console.error("Query error:", err);
      return res.status(500).json({ error: "ไม่สามารถดึง tagList ได้" });
    }
    res.json(results || []);
  });
});

// Company list
app.get("/company/list", (req, res) => {
  const { branch = "" } = req.query; //  รับ branch จาก query string

  let sql = `
    SELECT DISTINCT insp_customer_no, insp_customer_name
    FROM tbl_inspection_list
  `;
  const params = [];

  if (branch) {
    sql += ` WHERE insp_branch = ?`;
    params.push(branch);
  }

  sql += ` ORDER BY insp_customer_name`;

  db.query(sql, params, (err, results) => {
    if (err) {
      console.error("Query error:", err);
      return res.status(500).json({ error: "ไม่สามารถดึง company list ได้" });
    }
    res.json(results);
  });
});

// Search SV
app.post("/api/searchSV", (req, res) => {
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
      console.error("searchSV error:", err);
      return res
        .status(500)
        .json({ error: "ไม่สามารถค้นหาข้อมูลด้วย Service Order ได้" });
    }
    res.json(
      results.map((row) => ({
        ...row,
        insp_created_at: row.insp_created_at?.toISOString().slice(0, 10),
        insp_document_date: row.insp_document_date?.toISOString().slice(0, 10),
      })),
    );
  });
});

// Search Customer
app.post("/api/searchCustomer", (req, res) => {
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
      console.error("searchCustomer error:", err);
      return res
        .status(500)
        .json({ error: "ไม่สามารถค้นหาข้อมูลด้วย Customer No ได้" });
    }
    res.json(
      results.map((row) => ({
        ...row,
        insp_created_at: row.insp_created_at?.toISOString().slice(0, 10),
        insp_document_date: row.insp_document_date?.toISOString().slice(0, 10),
      })),
    );
  });
});

// Station counts (filter by branch if provided)
app.get("/api/station-counts", (req, res) => {
  const { branch = "" } = req.query; // ✅ รับ branch จาก query string

  let sql = `
    SELECT insp_station_now AS station, COUNT(*) AS count
    FROM tbl_inspection_list
  `;
  const params = [];

  // ✅ ถ้ามี branch ให้ filter
  if (branch) {
    sql += ` WHERE insp_branch = ?`;
    params.push(branch);
  }

  sql += ` GROUP BY insp_station_now`;

  db.query(sql, params, (err, results) => {
    if (err) {
      console.error("Query error:", err);
      return res.status(500).json({ error: "ไม่สามารถดึงข้อมูลสถานีได้" });
    }
    res.json(results);
  });
});

// User profile get/update
app.get("/api/user/:id", (req, res) => {
  const userId = req.params.id;
  const sql = `SELECT user_key, name, lastname, u_tel, line_id, u_email, user_photo, user_type, user_language FROM u_user WHERE user_key = ?`;
  db.query(sql, [userId], (err, results) => {
    if (err)
      return res.status(500).json({ error: "ไม่สามารถดึงข้อมูลผู้ใช้ได้" });
    if (results.length === 0)
      return res.status(404).json({ error: "ไม่พบผู้ใช้" });
    res.json(results[0]);
  });
});

app.put("/api/user/:id", (req, res) => {
  const userId = req.params.id;
  const { name, lastname, u_email, u_tel, lineId, user_photo, user_language } =
    req.body;

  const sql = `
    UPDATE u_user 
    SET name = ?, 
        lastname = ?, 
        u_email = ?, 
        u_tel = ?, 
        line_id = ?, 
        user_photo = ?, 
        user_language = ?,
        u_update_date = NOW()
    WHERE user_key = ?
  `;

  db.query(
    sql,
    [
      name,
      lastname,
      u_email,
      u_tel,
      lineId,
      user_photo || null,
      user_language,
      userId,
    ],
    (err) => {
      if (err) return res.status(500).json({ error: "อัปเดตข้อมูลไม่สำเร็จ" });
      res.json({ message: "อัปเดตข้อมูลสำเร็จ" });
    },
  );
});

// Upload profile image
app.post(
  "/api/upload-profile-image/:userId",
  upload.single("image"),
  async (req, res) => {
    try {
      const userId = req.params.userId;
      const file = req.file;
      if (!file) return res.status(400).json({ error: "No file uploaded" });

      const fileName = `user-${userId}.jpg`;
      const outputPath = path.join(__dirname, "public", "img_upload", fileName);

      if (fs.existsSync(outputPath)) fs.unlinkSync(outputPath);

      await sharp(file.buffer)
        .resize(300)
        .jpeg({ quality: 80 })
        .toFile(outputPath);
      res.json({ fileName });
    } catch (err) {
      console.error("Upload failed:", err);
      res.status(500).json({ error: "Upload failed" });
    }
  },
);

// Notifications list with pagination
app.get("/api/notifications/list/:userKey", (req, res) => {
  const userKey = req.params.userKey;
  const page = parseInt(req.query.page) || 1;
  const limit = parseInt(req.query.limit) || 10;
  const offset = (page - 1) * limit;

  const countSql = `
    SELECT COUNT(*) AS total
    FROM tbl_inspection_follow f
    JOIN tbl_inspection_list i ON f.insp_id = i.insp_id
    WHERE f.user_key = ? AND f.is_active = 1
  `;

  const dataSql = `
    SELECT 
      i.insp_id, i.insp_no, i.insp_service_order, i.insp_customer_name, 
      i.inspection_updated_at, f.followed_at
    FROM tbl_inspection_follow f
    JOIN tbl_inspection_list i ON f.insp_id = i.insp_id
    WHERE f.user_key = ? AND f.is_active = 1
    ORDER BY f.followed_at DESC
    LIMIT ? OFFSET ?
  `;

  db.query(countSql, [userKey], (err, countResult) => {
    if (err) {
      console.error("Error counting notifications:", err);
      return res.status(500).json({ error: "Database error (count)" });
    }

    const total = countResult[0].total;

    db.query(dataSql, [userKey, limit, offset], (err2, results) => {
      if (err2) {
        console.error("Error fetching notifications:", err2);
        return res.status(500).json({ error: "Database error (data)" });
      }

      res.json({
        total,
        page,
        totalPages: Math.ceil(total / limit),
        data: results,
      });
    });
  });
});

// Unread notifications
app.get("/api/notifications/:userKey", (req, res) => {
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

// Mark read
app.post("/api/notifications/read", (req, res) => {
  const { user_key, insp_id } = req.body;
  if (!user_key || !insp_id) {
    return res.status(400).json({ error: "Missing user_key or insp_id" });
  }
  const sql = `
    UPDATE tbl_inspection_follow
    SET last_read_at = NOW()
    WHERE user_key = ? AND insp_id = ? AND is_active = 1
  `;
  db.query(sql, [user_key, insp_id], (err) => {
    if (err) {
      console.error("Failed to mark as read:", err);
      return res.status(500).json({ error: "Database error" });
    }
    res.json({ success: true });
  });
});

// Follow / Unfollow / Status
app.post("/api/follow", (req, res) => {
  const { user_key, insp_id, insp_no } = req.body;
  const sql = `
    INSERT INTO tbl_inspection_follow (user_key, insp_id, insp_no, is_active, followed_at)
    VALUES (?, ?, ?, 1, NOW())
    ON DUPLICATE KEY UPDATE is_active = 1, followed_at = NOW()
  `;
  db.query(sql, [user_key, insp_id, insp_no], (err) => {
    if (err) return res.status(500).json({ error: "DB error" });
    res.json({ success: true });
  });
});
app.post("/api/follow/unfollow", (req, res) => {
  const { user_key, insp_id } = req.body;
  const sql = `UPDATE tbl_inspection_follow SET is_active = 0 WHERE user_key = ? AND insp_id = ?`;
  db.query(sql, [user_key, insp_id], (err) => {
    if (err) return res.status(500).json({ error: "DB error" });
    res.json({ success: true });
  });
});
app.get("/api/follow/status", (req, res) => {
  const { user_key, insp_id } = req.query;
  const sql = `
    SELECT is_active FROM tbl_inspection_follow
    WHERE user_key = ? AND insp_id = ?
  `;
  db.query(sql, [user_key, insp_id], (err, results) => {
    if (err) return res.status(500).json({ error: "DB error" });
    const is_following = results.length > 0 && results[0].is_active === 1;
    res.json({ is_following });
  });
});

// Timeline station
app.get("/api/timeline/station", (req, res) => {
  const { insp_id } = req.query;
  if (!insp_id) {
    return res.status(400).json({ error: "กรุณาระบุ insp_id" });
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
      console.error("DB error (stations):", err1);
      return res.status(500).json({ error: "ไม่สามารถดึง timeline ได้" });
    }

    db.query(startSQL, [insp_id], (err2, startRows) => {
      if (err2) {
        console.error("DB error (start):", err2);
        return res
          .status(500)
          .json({ error: "ไม่สามารถดึง start timeline ได้" });
      }

      const timeline = [];

      if (startRows.length > 0) {
        const start = startRows[0];
        timeline.push({
          station_name: "Start",
          station_status: "Created",
          station_note: null,
          timestamp: start.lpj_created_at
            ? dayjs(start.lpj_created_at).format("DD/MM/YYYY HH:mm")
            : "",
          done: true,
          by: start.user_name ? `${start.user_name}` : null,
          photo: start.user_photo || null,
        });
      }

      const mapped = stations.map((row) => ({
        station_step: row.station_step,
        station_name: row.station_name,
        station_status: row.station_status,
        station_note: row.station_note,
        timestamp: row.station_timestamp
          ? dayjs(row.station_timestamp).format("DD/MM/YYYY HH:mm")
          : "",
        done: row.station_status !== "In Progress",
        by: row.user_name ? `${row.user_name}` : null,
        photo: row.user_photo || null,
      }));

      res.json([...timeline, ...mapped]);
    });
  });
});

// Certificates
app.get("/api/certificates", (req, res) => {
  const branch = req.query.branch;
  if (!branch) return res.status(400).json({ error: "missing branch" });

  const sql = `
    SELECT lc.*
    FROM list_certificate lc
    WHERE lc.lc_branch = ?
      AND lc.lc_del = 0
      AND NOT EXISTS (
        SELECT 1
        FROM list_certificate x
        WHERE x.lc_branch = lc.lc_branch
          AND x.lc_del = 0
          AND x.lc_serial = lc.lc_serial
          AND (
            x.lc_date_created > lc.lc_date_created
            OR (x.lc_date_created = lc.lc_date_created AND x.lc_id > lc.lc_id)
          )
      )
    ORDER BY lc.lc_equipment_name ASC, lc.lc_date_created DESC, lc.lc_id DESC
  `;

  db.query(sql, [branch], (err, rows) => {
    if (err) return res.status(500).json({ error: err.code || err.message });
    res.json(rows);
  });
});

// Teams
app.get("/api/teams", (req, res) => {
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

app.get("/api/teams/members", (req, res) => {
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

// ─────────────────────────────────────────────────────────────────────────────
// ToDoList endpoints (ใช้ header: X-User-Key)
function requireUserKey(req, res) {
  const k = req.header("X-User-Key");
  if (!k) {
    res.status(401).json({ error: "missing X-User-Key header" });
    return null;
  }
  return String(k);
}

// GET /api/todolist  — รายการของ user นี้ (ไม่รวมที่ลบ)
app.get("/api/todolist", (req, res) => {
  try {
    const userKey =
      req.get("X-User-Key") || req.query.user_key || req.body?.user_key;
    if (!userKey) return res.json([]); // ❗️ไม่เจอคีย์ → ส่งว่าง แทน 400/500

    const sql = `
      SELECT
        todo_id AS id, title, note, allDay,
        DATE_FORMAT(\`date\`, '%Y-%m-%d') AS \`date\`,
        TIME_FORMAT(\`time\`, '%H:%i:%s') AS \`time\`,
        status, created_at, updated_at
      FROM todolist
      WHERE user_key_add = ? AND is_deleted = 0
      ORDER BY (\`date\` IS NULL), \`date\`,
               (\`time\` IS NULL), \`time\`
    `;
    db.query(sql, [String(userKey)], (err, rows) => {
      if (err) {
        console.error("GET /api/todolist error:", err);
        return res.json([]); // ❗️ง่ายสุด: DB พลาด ก็ส่งว่าง (ชั่วคราว)
      }
      res.json(Array.isArray(rows) ? rows : []);
    });
  } catch (e) {
    console.error("GET /api/todolist fatal:", e);
    res.json([]); // ❗️กันตกทุกกรณี
  }
});

// POST /api/todolist  — สร้างใหม่
app.post("/api/todolist", (req, res) => {
  const userKey = requireUserKey(req, res);
  if (!userKey) return;

  const { title, note, date, time, allDay } = req.body || {};
  if (!title || !String(title).trim()) {
    return res.status(400).json({ error: "กรุณากรอก Title" });
  }
  const sql = `
    INSERT INTO todolist (title, note, date, time, status, user_key_add, allDay)
    VALUES (?, ?, ?, ?, 'pending', ?, ?)
  `;
  db.query(
    sql,
    [title.trim(), note || null, date || null, time || null, userKey, allDay],
    (err, result) => {
      if (err) return res.status(500).json({ error: "Database error" });
      res.json({
        id: result.insertId,
        title: title.trim(),
        note: note || null,
        date: date || null,
        time: time || null,
        status: "pending",
      });
    },
  );
});

// PUT /api/todolist/:id  — แก้ไข
app.put("/api/todolist/:id", (req, res) => {
  const userKey = requireUserKey(req, res);
  if (!userKey) return;

  const id = parseInt(req.params.id, 10);
  const { title, note, date, time, allDay } = req.body || {};
  if (!id) return res.status(400).json({ error: "invalid id" });
  if (!title || !String(title).trim()) {
    return res.status(400).json({ error: "กรุณากรอก Title" });
  }

  const sql = `
    UPDATE todolist
    SET title = ?, note = ?, date = ?, time = ?,  allDay = ?
    WHERE todo_id = ? AND user_key_add = ? AND is_deleted = 0
  `;
  db.query(
    sql,
    [
      title.trim(),
      note || null,
      date || null,
      time || null,
      allDay,
      id,
      userKey,
    ],
    (err, result) => {
      if (err) return res.status(500).json({ error: "Database error" });
      if (result.affectedRows === 0)
        return res.status(404).json({ error: "ไม่พบรายการ หรือไม่มีสิทธิ์" });

      res.json({
        id,
        title: title.trim(),
        note: note || null,
        date: date || null,
        time: time || null,
      });
    },
  );
});

// PATCH /api/todolist/:id/status  — เปลี่ยนสถานะ (pending/done)
app.patch("/api/todolist/:id/status", (req, res) => {
  const userKey = requireUserKey(req, res);
  if (!userKey) return;

  const id = parseInt(req.params.id, 10);
  const { status } = req.body || {};
  if (!id) return res.status(400).json({ error: "invalid id" });
  if (!["pending", "done"].includes(status)) {
    return res.status(400).json({ error: "invalid status" });
  }

  const sql = `
    UPDATE todolist
    SET status = ?
    WHERE todo_id = ? AND user_key_add = ? AND is_deleted = 0
  `;
  db.query(sql, [status, id, userKey], (err, result) => {
    if (err) return res.status(500).json({ error: "Database error" });
    if (result.affectedRows === 0)
      return res.status(404).json({ error: "ไม่พบรายการ หรือไม่มีสิทธิ์" });
    res.json({ id, status });
  });
});

// DELETE /api/todolist/:id  — ลบแบบ soft delete
app.delete("/api/todolist/:id", (req, res) => {
  const userKey = requireUserKey(req, res);
  if (!userKey) return;

  const id = parseInt(req.params.id, 10);
  if (!id) return res.status(400).json({ error: "invalid id" });

  const sql = `
    UPDATE todolist
    SET is_deleted = 1
    WHERE todo_id = ? AND user_key_add = ?
  `;
  db.query(sql, [id, userKey], (err, result) => {
    if (err) return res.status(500).json({ error: "Database error" });
    if (result.affectedRows === 0)
      return res.status(404).json({ error: "ไม่พบรายการ หรือไม่มีสิทธิ์" });
    res.json({ id, deleted: true });
  });
});

// บันทึกหรืออัพเดทจำนวนฟอร์ม
app.post("/api/forms/scm-number", (req, res) => {
  const { insp_no, number } = req.body;

  // Validate input
  if (!insp_no || number === undefined || number === null) {
    return res.status(400).json({
      error: "กรุณาระบุ insp_no และ number",
    });
  }

  // ตรวจสอบว่ามีข้อมูลอยู่แล้วหรือไม่
  const checkSql = "SELECT scm_num_id FROM form_scm_number WHERE insp_no = ?";

  db3.query(checkSql, [insp_no], (err, results) => {
    if (err) {
      console.error("Check error:", err);
      return res.status(500).json({ error: "ไม่สามารถตรวจสอบข้อมูลได้" });
    }

    if (results.length > 0) {
      // อัพเดทข้อมูลเดิม
      const updateSql = `
        UPDATE form_scm_number 
        SET number = ?, 
            created_date = NOW() 
        WHERE insp_no = ?
      `;

      db3.query(updateSql, [number, insp_no], (err2) => {
        if (err2) {
          console.error("Update error:", err2);
          return res.status(500).json({ error: "ไม่สามารถอัปเดตข้อมูลได้" });
        }

        res.json({
          success: true,
          message: "อัปเดตจำนวนฟอร์มสำเร็จ",
          action: "updated",
        });
      });
    } else {
      // สร้างข้อมูลใหม่
      const insertSql = `
        INSERT INTO form_scm_number (number, insp_no, created_date) 
        VALUES (?, ?, NOW())
      `;

      db3.query(insertSql, [number, insp_no], (err2, result) => {
        if (err2) {
          console.error("Insert error:", err2);
          return res.status(500).json({ error: "ไม่สามารถบันทึกข้อมูลได้" });
        }

        res.json({
          success: true,
          message: "บันทึกจำนวนฟอร์มสำเร็จ",
          action: "created",
          id: result.insertId,
        });
      });
    }
  });
});

// ดึงข้อมูลจำนวนฟอร์ม
app.get("/api/forms/scm-number/:insp_no", (req, res) => {
  const { insp_no } = req.params;

  const sql = "SELECT * FROM form_scm_number WHERE insp_no = ?";

  db3.query(sql, [insp_no], (err, results) => {
    if (err) {
      console.error("Get error:", err);
      return res.status(500).json({ error: "ไม่สามารถดึงข้อมูลได้" });
    }

    if (results.length === 0) {
      return res.json({ data: null });
    }

    res.json({ data: results[0] });
  });
});

// ดึงข้อมูล form_scm_inspection_headers ตาม insp_no
app.get("/api/forms/form_scm_inspection_headers/:insp_no", (req, res) => {
  const { insp_no } = req.params;

  const sql = `
    SELECT 
      tag_no,
      created_at,
      updated_at
    FROM form_scm_inspection_headers
    WHERE insp_no = ? 
    ORDER BY created_at DESC
  `;

  db3.query(sql, [insp_no], (err, results) => {
    if (err) {
      console.error("Get driven equipment error:", err);
      return res.status(500).json({
        success: false,
        error: "ไม่สามารถดึงข้อมูลได้",
        message: err.message,
      });
    }

    // ถ้าไม่มีข้อมูล
    if (results.length === 0) {
      return res.json({
        success: true,
        data: [],
        count: 0,
        message: "ไม่พบข้อมูล",
      });
    }

    // ส่งข้อมูลกลับ
    res.json({
      success: true,
      data: results,
      count: results.length,
      insp_no: insp_no,
    });
  });
});

/* -----------------------------------------------------------------------------
การจัดการรูปภาพ 
*/
// สร้างโฟลเดอร์สำหรับเก็บรูป
const UPLOAD_DIR = path.join(__dirname, "uploads");
fs.mkdirSync(UPLOAD_DIR, { recursive: true });

// Mock Database (ในโปรเจคจริงใช้ MySQL, PostgreSQL, MongoDB ฯลฯ)
const imageDatabase = [];

// 1. Endpoint สำหรับอัพโหลดไฟล์และบีบอัด
app.post("/api/upload", upload.single("image"), async (req, res) => {
  try {
    if (!req.file) {
      return res.status(400).json({ error: "กรุณาเลือกไฟล์รูปภาพ" });
    }

    const timestamp = Date.now();
    const randomStr = Math.random().toString(36).substring(2, 8);
    const ext = path.extname(req.file.originalname).toLowerCase();

    // ใช้นามสกุลเดิมหรือแปลงเป็น .jpg
    const filename = `${timestamp}-${randomStr}.jpg`;
    const filepath = path.join(UPLOAD_DIR, filename);

    // บีบอัดเป็น JPEG (ได้ผลจริง)
    await sharp(req.file.buffer)
      .resize(1920, 1920, {
        // จำกัดขนาดสูงสุด (optional)
        fit: "inside",
        withoutEnlargement: true,
      })
      .jpeg({
        quality: 80, // 🎯 ลดคุณภาพ 20% = ไฟล์เล็กลง 50-70%
        progressive: true, // โหลดเร็วขึ้น
        mozjpeg: true, // บีบอัดดีกว่า
      })
      .toFile(filepath);

    // เช็คขนาดไฟล์ที่บันทึก
    const stats = await fs.promises.stat(filepath);
    const compressionRatio = ((1 - stats.size / req.file.size) * 100).toFixed(
      1,
    );

    res.json({
      success: true,
      message: "อัพโหลดสำเร็จ",
      data: {
        filename: filename,
        path: `/uploads/${filename}`,
        originalName: req.file.originalname,
        originalSize: req.file.size,
        compressedSize: stats.size,
        savedSpace: `${compressionRatio}%`,
      },
    });
  } catch (error) {
    console.error("Upload error:", error);
    res.status(500).json({
      error: "เกิดข้อผิดพลาดในการอัพโหลด",
      details: error.message,
    });
  }
});

// 2. Endpoint สำหรับบันทึกโปรเจคลงฐานข้อมูล
app.post("/api/form-scm-images", async (req, res) => {
  try {
    const {
      inspNo,
      inspSV,
      before_image_1_path,
      before_image_2_path,
      before_image_3_path,
      after_image_1_path,
      after_image_2_path,
      after_image_3_path,
    } = req.body;

    if (!inspNo || !inspSV) {
      return res.status(400).json({ error: "กรุณาระบุ inspNo และ inspSV" });
    }

    if (
      !before_image_1_path &&
      !before_image_2_path &&
      !before_image_3_path &&
      !after_image_1_path &&
      !after_image_2_path &&
      !after_image_3_path
    ) {
      return res
        .status(400)
        .json({ error: "กรุณาอัพโหลดรูปภาพอย่างน้อย 1 รูป" });
    }

    // ตรวจสอบว่ามี record อยู่แล้วหรือไม่
    const checkQuery =
      "SELECT id FROM form_scm_images WHERE insp_no = ? AND insp_sv = ?";
    const [existing] = await db3
      .promise()
      .execute(checkQuery, [inspNo, inspSV]);

    let result;

    if (existing.length > 0) {
      // Update record ที่มีอยู่
      const updateQuery = `
        UPDATE form_scm_images 
        SET 
          before_image_1_path = ?,
          before_image_2_path = ?,
          before_image_3_path = ?,
          after_image_1_path = ?,
          after_image_2_path = ?,
          after_image_3_path = ?
        WHERE insp_no = ? AND insp_sv = ?
      `;

      [result] = await db3
        .promise()
        .execute(updateQuery, [
          before_image_1_path,
          before_image_2_path,
          before_image_3_path,
          after_image_1_path,
          after_image_2_path,
          after_image_3_path,
          inspNo,
          inspSV,
        ]);

      res.json({
        success: true,
        message: "อัปเดตข้อมูลสำเร็จ",
        data: {
          id: existing[0].id,
          inspNo,
          inspSV,
          action: "updated",
        },
      });
    } else {
      // Insert record ใหม่
      const insertQuery = `
        INSERT INTO form_scm_images 
        (insp_no, insp_sv, before_image_1_path, before_image_2_path, before_image_3_path, 
         after_image_1_path, after_image_2_path, after_image_3_path, created_at)
        VALUES (?, ?, ?, ?, ?, ?, ?, ?, NOW())
      `;

      [result] = await db3
        .promise()
        .execute(insertQuery, [
          inspNo,
          inspSV,
          before_image_1_path,
          before_image_2_path,
          before_image_3_path,
          after_image_1_path,
          after_image_2_path,
          after_image_3_path,
        ]);

      res.json({
        success: true,
        message: "บันทึกโปรเจคสำเร็จ",
        data: {
          id: result.insertId,
          inspNo,
          inspSV,
          action: "created",
        },
      });
    }
  } catch (error) {
    console.error("Save project error:", error);
    res.status(500).json({
      error: "เกิดข้อผิดพลาดในการบันทึกข้อมูล",
      details: error.message,
    });
  }
});

// API สำหรับบันทึกรูปภาพหลายรูป
app.post("/api/save-images-location", async (req, res) => {
  try {
    const {
      inspNo,
      inspSV,
      userKey,
      customerName,
      customerNo,
      imagePaths,
      location,
    } = req.body;

    if (!inspNo || !inspSV) {
      return res.status(400).json({ error: "กรุณาระบุ inspNo และ inspSV" });
    }

    if (!imagePaths || imagePaths.length === 0) {
      return res.status(400).json({ error: "กรุณาระบุ imagePaths" });
    }

    const insertedIds = [];

    // Insert แต่ละรูป
    for (const imagePath of imagePaths) {
      const insertQuery = `
        INSERT INTO images_location 
        (insp_no, insp_sv, user_key, customer_name, customer_no, image_path, location, created_at)
        VALUES (?, ?, ?, ?, ?, ?, ?, NOW())
      `;

      const [result] = await db3
        .promise()
        .execute(insertQuery, [
          inspNo,
          inspSV,
          userKey,
          customerName,
          customerNo,
          imagePath,
          location || "SCM",
        ]);

      insertedIds.push(result.insertId);
    }

    res.json({
      success: true,
      message: "บันทึกรูปภาพสำเร็จ",
      data: {
        count: insertedIds.length,
        ids: insertedIds,
        inspNo,
        inspSV,
      },
    });
  } catch (error) {
    console.error("Save images error:", error);
    res.status(500).json({
      error: "เกิดข้อผิดพลาดในการบันทึกข้อมูล",
      details: error.message,
    });
  }
});

// API สำหรับบันทึก/อัปเดต description ของรูปภาพ
app.put("/api/update-image-description", async (req, res) => {
  try {
    const { id, description } = req.body;

    if (!id) {
      return res.status(400).json({ error: "กรุณาระบุ id ของรูปภาพ" });
    }

    const updateQuery = `
      UPDATE images_location 
      SET img_description = ?, updatedAt = NOW()
      WHERE id = ?
    `;

    const [result] = await db3
      .promise()
      .execute(updateQuery, [description || null, id]);

    if (result.affectedRows === 0) {
      return res.status(404).json({ error: "ไม่พบรูปภาพที่ต้องการอัปเดต" });
    }

    res.json({
      success: true,
      message: "บันทึก description สำเร็จ",
      data: {
        id,
        description,
      },
    });
  } catch (error) {
    console.error("Update description error:", error);
    res.status(500).json({
      error: "เกิดข้อผิดพลาดในการบันทึก description",
      details: error.message,
    });
  }
});

// API สำหรับอัพเดทรูปภาพเป็น del = 1 (soft delete)
app.put("/api/update-image-location/del", async (req, res) => {
  try {
    console.log("Request body:", req.body); // 🔍 Debug ดูข้อมูลที่รับ

    const { id } = req.body;

    if (!id) {
      console.log("Error: No ID provided"); // 🔍 Debug
      return res.status(400).json({
        success: false,
        error: "กรุณาระบุ ID ของรูปภาพ",
      });
    }

    // ตรวจสอบว่ามีรูปภาพนี้อยู่ในระบบหรือไม่
    const checkQuery = "SELECT * FROM images_location WHERE id = ?";
    const [existing] = await db3.promise().execute(checkQuery, [id]);

    console.log("Found images:", existing.length); // 🔍 Debug

    if (existing.length === 0) {
      return res.status(404).json({
        success: false,
        error: "ไม่พบรูปภาพที่ต้องการอัพเดท",
      });
    }

    // อัพเดท del = 1
    const updateQuery = `
      UPDATE images_location 
      SET del = 1, updatedAt = NOW()
      WHERE id = ?
    `;

    const [updateResult] = await db3.promise().execute(updateQuery, [id]);
    console.log("Update result:", updateResult); // 🔍 Debug

    // ดึงข้อมูลที่อัพเดทแล้ว
    const [updated] = await db3
      .promise()
      .execute("SELECT * FROM images_location WHERE id = ?", [id]);

    res.json({
      success: true,
      message: "ลบรูปภาพสำเร็จ (soft delete)",
      data: updated[0],
    });
  } catch (error) {
    console.error("Update image error:", error);
    res.status(500).json({
      success: false,
      error: "เกิดข้อผิดพลาดในการอัพเดทข้อมูล",
      details: error.message,
    });
  }
});

// ========================================
// API 1: กู้คืนรูปภาพทีละรูป (del = 0)
// ========================================
app.put("/api/restore-image", async (req, res) => {
  try {
    console.log("📥 Request body:", req.body);

    const { id } = req.body;

    // ตรวจสอบ input
    if (!id) {
      console.log("❌ Error: No ID provided");
      return res.status(400).json({
        success: false,
        error: "กรุณาระบุ ID ของรูปภาพ",
      });
    }

    // ตรวจสอบว่ามีรูปภาพนี้อยู่ในระบบและถูกลบหรือไม่
    const checkQuery = "SELECT * FROM images_location WHERE id = ? AND del = 1";
    const [existing] = await db3.promise().execute(checkQuery, [id]);

    console.log("🔍 Found deleted images:", existing.length);

    if (existing.length === 0) {
      return res.status(404).json({
        success: false,
        error: "ไม่พบรูปภาพที่ถูกลบ",
      });
    }

    // อัพเดท del = 0 (กู้คืน)
    const updateQuery = `
      UPDATE images_location 
      SET del = 0, updatedAt = NOW()
      WHERE id = ?
    `;

    const [updateResult] = await db3.promise().execute(updateQuery, [id]);
    console.log("✅ Update result:", updateResult);

    // ดึงข้อมูลที่อัพเดทแล้ว
    const [updated] = await db3
      .promise()
      .execute("SELECT * FROM images_location WHERE id = ?", [id]);

    res.json({
      success: true,
      message: "กู้คืนรูปภาพสำเร็จ",
      data: updated[0],
    });
  } catch (error) {
    console.error("❌ Restore image error:", error);
    res.status(500).json({
      success: false,
      error: "เกิดข้อผิดพลาดในการกู้คืนข้อมูล",
      details: error.message,
    });
  }
});

// ========================================
// API 2: กู้คืนรูปภาพทั้งหมดของ insp_no (del = 0)
// ========================================
app.put("/api/restore-all-images", async (req, res) => {
  try {
    console.log("📥 Request body:", req.body);

    const { inspNo } = req.body;

    // ตรวจสอบ input
    if (!inspNo) {
      console.log("❌ Error: No inspNo provided");
      return res.status(400).json({
        success: false,
        error: "กรุณาระบุ Inspection Number",
      });
    }

    // ตรวจสอบว่ามีรูปภาพที่ถูกลบหรือไม่
    const checkQuery =
      "SELECT * FROM images_location WHERE insp_no = ? AND del = 1";
    const [deletedImages] = await db3.promise().execute(checkQuery, [inspNo]);

    console.log(
      `🔍 Found ${deletedImages.length} deleted images for inspNo: ${inspNo}`,
    );

    if (deletedImages.length === 0) {
      return res.status(404).json({
        success: false,
        error: "ไม่พบรูปภาพที่ถูกลบสำหรับ Inspection Number นี้",
      });
    }

    // อัพเดท del = 0 สำหรับทุกรูปของ insp_no นี้
    const updateQuery = `
      UPDATE images_location 
      SET del = 0, updatedAt = NOW()
      WHERE insp_no = ? AND del = 1
    `;

    const [updateResult] = await db3.promise().execute(updateQuery, [inspNo]);
    console.log(`✅ Restored ${updateResult.affectedRows} images`);

    res.json({
      success: true,
      message: `กู้คืนรูปภาพทั้งหมดสำเร็จ`,
      data: {
        restoredCount: updateResult.affectedRows,
        inspNo: inspNo,
      },
    });
  } catch (error) {
    console.error("❌ Restore all images error:", error);
    res.status(500).json({
      success: false,
      error: "เกิดข้อผิดพลาดในการกู้คืนข้อมูล",
      details: error.message,
    });
  }
});

// API สำหรับดึงรูปภาพที่ถูกลบ (del = 1)
app.get("/api/deleted-images/:inspNo", async (req, res) => {
  try {
    const { inspNo } = req.params;

    const query = `
      SELECT * FROM images_location 
      WHERE insp_no = ? AND del = 1
      ORDER BY createdAt DESC
    `;

    const [deletedImages] = await db3.promise().execute(query, [inspNo]);

    res.json({
      success: true,
      data: deletedImages,
      count: deletedImages.length,
    });
  } catch (error) {
    console.error("Get deleted images error:", error);
    res.status(500).json({
      success: false,
      error: "เกิดข้อผิดพลาดในการดึงข้อมูล",
      details: error.message,
    });
  }
});

// 3. Endpoint สำหรับดึงข้อมูลโปรเจคตาม inspNo และ inspSV
// Endpoint สำหรับดึงข้อมูลรูปภาพ SCM ตาม inspNo
app.get("/api/forms/FormScmImage/:inspNo", async (req, res) => {
  try {
    const { inspNo } = req.params;
    const { location } = req.query;

    if (!inspNo) {
      return res.status(400).json({
        success: false,
        error: "กรุณาระบุ inspNo",
      });
    }

    // สร้าง query แบบ dynamic ตาม location
    let query = `
      SELECT * FROM images_location 
      WHERE insp_no = ?
    `;
    let params = [inspNo];

    // เช็คว่า location มีค่าและไม่ใช่ string ว่าง
    if (location && location.trim() !== "") {
      // ถ้ามี location ให้กรองเฉพาะ location นั้น
      query += ` AND location = ?`;
      params.push(location.trim());
    } else {
      // ถ้าไม่มี location ให้ดึงทั้ง SCM และ SCMHeader
      query += ` AND (location = 'SCM' OR location = 'SCMHeader')`;
    }

    query += ` ORDER BY created_at ASC`;

    // ✅ แก้ตรงนี้ - ใช้ params แทน [inspNo]
    const [rows] = await db3.promise().execute(query, params);

    if (rows.length === 0) {
      return res.json({
        success: true,
        data: null, // เปลี่ยนเป็น null เพื่อให้เช็คง่ายในหน้าบ้าน
        message: "ไม่พบข้อมูลรูปภาพ",
      });
    }

    res.json({
      success: true,
      data: rows,
    });
  } catch (error) {
    console.error("Get SCM images error:", error);
    res.status(500).json({
      success: false,
      error: "เกิดข้อผิดพลาดในการดึงข้อมูล",
      details: error.message,
    });
  }
});

// 4. Endpoint สำหรับดึงรายการโปรเจคทั้งหมด
app.get("/api/form-scm-images", async (req, res) => {
  try {
    const query = "SELECT * FROM form_scm_images ORDER BY created_at DESC";
    const [rows] = await db3.promise().execute(query);

    res.json({
      success: true,
      data: rows,
    });
  } catch (error) {
    console.error("Get projects error:", error);
    res.status(500).json({
      error: "เกิดข้อผิดพลาดในการดึงข้อมูล",
      details: error.message,
    });
  }
});

// 4. เสิร์ฟไฟล์รูปภาพ (static files)
app.use("/uploads", express.static(UPLOAD_DIR));

// 5. Endpoint สำหรับลบโปรเจค
app.delete("/api/form-scm-images/:id", async (req, res) => {
  try {
    const { id } = req.params;

    // ดึงข้อมูลรูปภาพก่อนลบเพื่อลบไฟล์
    const selectQuery = "SELECT * FROM form_scm_images WHERE id = ?";
    const [rows] = await db3.promise().execute(selectQuery, [id]);

    if (rows.length === 0) {
      return res.status(404).json({
        success: false,
        message: "ไม่พบข้อมูล",
      });
    }

    const project = rows[0];

    // ลบไฟล์รูปภาพ
    const imagePaths = [
      project.before_image_1_path,
      project.before_image_2_path,
      project.before_image_3_path,
      project.after_image_1_path,
      project.after_image_2_path,
      project.after_image_3_path,
    ];

    imagePaths.forEach((imagePath) => {
      if (imagePath) {
        const filename = imagePath.replace("/uploads/", "");
        const filepath = path.join(UPLOAD_DIR, filename);
        if (fs.existsSync(filepath)) {
          fs.unlinkSync(filepath);
        }
      }
    });

    // ลบข้อมูลจากฐานข้อมูล
    const deleteQuery = "DELETE FROM form_scm_images WHERE id = ?";
    await db3.promise().execute(deleteQuery, [id]);

    res.json({
      success: true,
      message: "ลบข้อมูลสำเร็จ",
    });
  } catch (error) {
    console.error("Delete project error:", error);
    res.status(500).json({
      error: "เกิดข้อผิดพลาดในการลบข้อมูล",
      details: error.message,
    });
  }
});

// API สำหรับลบไฟล์รูปภาพ
app.delete("/api/delete-image", async (req, res) => {
  try {
    const { path: imagePath } = req.body;

    if (!imagePath) {
      return res.status(400).json({
        success: false,
        message: "ไม่พบ path ของรูปภาพ",
      });
    }

    // แปลง path เป็น filename
    const filename = imagePath.replace("/uploads/", "");
    const filepath = path.join(UPLOAD_DIR, filename);

    // ตรวจสอบว่าไฟล์มีอยู่จริง
    if (fs.existsSync(filepath)) {
      // ลบไฟล์
      fs.unlinkSync(filepath);

      res.json({
        success: true,
        message: "ลบไฟล์สำเร็จ",
      });
    } else {
      res.json({
        success: true,
        message: "ไม่พบไฟล์ (อาจถูกลบไปแล้ว)",
      });
    }
  } catch (error) {
    console.error("Delete image error:", error);
    res.status(500).json({
      success: false,
      error: "เกิดข้อผิดพลาดในการลบไฟล์",
      details: error.message,
    });
  }
});

// Endpoint เดิม - ส่งเฉพาะ has_row = 0
app.get("/api/formList", (req, res) => {
  const { branch = "", year } = req.query;
  console.log("branch:" + branch);
  console.log("year:" + year);

  const params = [];
  let sql = `
    SELECT
      i.id AS insp_id,
      i.mt_id AS insp_no,
      i.customer AS insp_customer_name,
      i.sq AS insp_sale_quote,
      i.sv AS insp_service_order,
      i.incoming_date AS insp_created_at,
      f.form_name AS motor_name
    FROM u_inspection AS i
    LEFT JOIN u_form AS f
      ON f.form_type = i.type_form
    WHERE i.del = 0
    AND i.cancel = 0
  `;

  if (branch) {
    const branchCode = branch.startsWith("U") ? branch.substring(1) : branch;
    sql += ` AND LEFT(i.mt_id, 2) = ?`;
    params.push(branchCode);
  }

  if (year) {
    sql += ` AND YEAR(i.incoming_date) = ?`;
    params.push(year);
  }

  sql += `
    ORDER BY i.last_update DESC
    LIMIT 10000
  `;

  db2.query(sql, params, (err, results) => {
    if (err) {
      console.error("Query error:", err);
      return res.status(500).json({ error: "ไม่สามารถดึง tagList ได้" });
    }

    if (results.length === 0) {
      return res.json([]);
    }

    // ดึง service_order ทั้งหมดมาเช็คครั้งเดียว
    const serviceOrders = results.map((r) => r.insp_service_order);

    const checkSql = `
      SELECT DISTINCT insp_service_order 
      FROM tbl_inspection_list 
      WHERE insp_service_order IN (?)
    `;

    db3.query(checkSql, [serviceOrders], (err, checkResults) => {
      if (err) {
        console.error("Error checking db3:", err);
        return res
          .status(500)
          .json({ error: "ไม่สามารถตรวจสอบข้อมูลใน db3 ได้" });
      }

      // สร้าง Set ของ service_order ที่มีอยู่ใน db3
      const existingOrders = new Set(
        checkResults.map((r) => r.insp_service_order),
      );

      // กรองเฉพาะที่ไม่มีใน db3 (has_row = 0)
      const filteredResults = results
        .filter((row) => !existingOrders.has(row.insp_service_order))
        .map((row) => ({ ...row, has_row: 0 }));

      res.json(filteredResults);
    });
  });
});

// Endpoint ใหม่ - ส่งเฉพาะ has_row = 1
app.get("/api/formListSynced", (req, res) => {
  const { branch = "", year } = req.query;
  const params = [];

  let sql = `
    SELECT
      i.id AS insp_id,
      i.mt_id AS insp_no,
      i.customer AS insp_customer_name,
      i.sq AS insp_sale_quote,
      i.sv AS insp_service_order,
      i.incoming_date AS insp_created_at,
      f.form_name AS motor_name
    FROM u_inspection AS i
    LEFT JOIN u_form AS f ON f.form_type = i.type_form
    WHERE i.del = 0 AND i.cancel = 0
  `;

  if (branch) {
    const branchCode = branch.startsWith("U") ? branch.substring(1) : branch;
    sql += ` AND LEFT(i.mt_id, 2) = ?`;
    params.push(branchCode);
  }

  if (year) {
    sql += ` AND YEAR(i.incoming_date) = ?`;
    params.push(year);
  }

  sql += ` ORDER BY i.last_update DESC LIMIT 10000`;

  db2.query(sql, params, (err, results) => {
    if (err) {
      console.error("Query error:", err);
      return res.status(500).json({ error: "ไม่สามารถดึง tagList ได้" });
    }

    if (results.length === 0) {
      return res.json([]);
    }

    // ดึง service_order ทั้งหมดมาเช็คครั้งเดียว
    const serviceOrders = results.map((r) => r.insp_service_order);

    const checkSql = `
      SELECT DISTINCT insp_service_order 
      FROM tbl_inspection_list 
      WHERE insp_service_order IN (?)
    `;

    db3.query(checkSql, [serviceOrders], (err, checkResults) => {
      if (err) {
        console.error("Error checking db3:", err);
        return res
          .status(500)
          .json({ error: "ไม่สามารถตรวจสอบข้อมูลใน db3 ได้" });
      }

      // สร้าง Set สำหรับการค้นหาที่เร็ว
      const existingOrders = new Set(
        checkResults.map((r) => r.insp_service_order),
      );

      // กรองและเพิ่ม has_row
      const filteredResults = results
        .filter((row) => existingOrders.has(row.insp_service_order))
        .map((row) => ({ ...row, has_row: 1 }));

      res.json(filteredResults);
    });
  });
});

/* ฟอร์ม  FormSquirrelCageMotor.jsx*/
// POST: บันทึกฟอร์ม Squirrel Cage Motor ทั้งหมด
// ฟังก์ชันช่วยแปลง callback -> Promise

function queryAsync(connection, sql, params) {
  return new Promise((resolve, reject) => {
    connection.query(sql, params, (err, results) => {
      if (err) return reject(err);
      resolve(results);
    });
  });
}

app.get("/api/forms/FormSquirrelCageMotor/:insp_no", async (req, res) => {
  try {
    const { insp_no } = req.params;

    if (!insp_no) {
      return res
        .status(400)
        .json({ success: false, error: "insp_no is required" });
    }

    const sqlMain = `
      SELECT ih.*, fmn.*, de.*, gi.*, rt.*, lt.*, tsb.*, st.*
      FROM form_scm_inspection_headers ih
      LEFT JOIN form_motor_nameplate fmn ON ih.insp_no = fmn.insp_no
      LEFT JOIN form_scm_driven_equipment de ON ih.insp_no = de.insp_no
      LEFT JOIN form_scm_general_info gi ON ih.insp_no = gi.insp_no
      LEFT JOIN form_scm_resistance_tests rt ON ih.insp_no = rt.insp_no
      LEFT JOIN form_scm_inductance_tests lt ON ih.insp_no = lt.insp_no
      LEFT JOIN form_scm_temp_sensors_bearing tsb ON ih.insp_no = tsb.insp_no
      LEFT JOIN form_scm_standstill_test st ON ih.insp_no = st.insp_no
      WHERE ih.insp_no = ?
    `;

    // ใช้ Promise.all กับฟังก์ชันที่ return Promise
    const [
      mainData,
      generalChecks,
      insulationTests,
      heaters,
      tempSensorsStator,
    ] = await Promise.all([
      queryAsync(db3, sqlMain, [insp_no]),
      queryAsync(
        db3,
        "SELECT * FROM form_scm_general_checks WHERE insp_no = ? ORDER BY scm_gc_id",
        [insp_no],
      ),
      queryAsync(
        db3,
        "SELECT * FROM form_scm_insulation_tests WHERE insp_no = ? ORDER BY scm_it_id",
        [insp_no],
      ),
      queryAsync(
        db3,
        "SELECT * FROM form_scm_heaters WHERE insp_no = ? ORDER BY scm_h_unit_no",
        [insp_no],
      ),
      queryAsync(
        db3,
        "SELECT * FROM form_scm_temp_sensors_stator WHERE insp_no = ? ORDER BY scm_tss_element_no",
        [insp_no],
      ),
    ]);

    if (mainData.length === 0) {
      return res.status(404).json({
        success: false,
        error: "Inspection not found",
        insp_no,
      });
    }

    res.json({
      success: true,
      data: {
        ...mainData[0],
        generalChecks: generalChecks || [],
        insulationTests: insulationTests || [],
        heaters: heaters || [],
        tempSensorsStator: tempSensorsStator || [],
        updated_at: mainData[0].updated_at || mainData[0].created_at,
      },
    });
  } catch (error) {
    console.error("Error in /api/scm/inspection-complete:", error);
    res.status(500).json({
      success: false,
      error: error.message,
    });
  }
});

// POST endpoint แก้ไข
// ฟังก์ชันช่วยแปลง callback -> Promise
function queryAsync(connection, sql, params) {
  return new Promise((resolve, reject) => {
    connection.query(sql, params, (err, results) => {
      if (err) return reject(err);
      resolve(results);
    });
  });
}

// Helper function: แปลงค่าว่างเป็น NULL และจัดการวันที่
const toNullIfEmpty = (value) => {
  if (value === "" || value === undefined || value === null) return null;

  // ตรวจสอบว่าเป็น Date object
  if (value instanceof Date && !isNaN(value.getTime())) {
    return formatDate(value);
  }

  // ตรวจสอบว่าเป็น ISO 8601 string (2025-09-29T17:00:00.000Z)
  if (
    typeof value === "string" &&
    /^\d{4}-\d{2}-\d{2}T\d{2}:\d{2}:\d{2}/.test(value)
  ) {
    const dateValue = new Date(value);
    if (!isNaN(dateValue.getTime())) {
      return formatDate(dateValue);
    }
  }

  return value;
};

// ฟังก์ชันแปลงวันที่เป็น yyyy-mm-dd
const formatDate = (date) => {
  const year = date.getFullYear();
  const month = String(date.getMonth() + 1).padStart(2, "0");
  const day = String(date.getDate()).padStart(2, "0");
  return `${year}-${month}-${day}`;
};

app.post("/api/scm/inspection-save", async (req, res) => {
  let connection;

  try {
    connection = await new Promise((resolve, reject) => {
      db3.getConnection((err, conn) => {
        if (err) return reject(err);
        resolve(conn);
      });
    });

    await new Promise((resolve, reject) => {
      connection.beginTransaction((err) => {
        if (err) return reject(err);
        resolve();
      });
    });

    const {
      insp_no,
      insp_sv,
      created_by,
      updated_by,
      header,
      motorNameplate,
      drivenEquipment,
      generalInfo,
      generalChecks,
      insulationTests,
      resistanceTests,
      inductanceTests,
      tempSensorsBearing,
      heaters,
      tempSensorsStator,
      standstillTest,
    } = req.body;

    if (!insp_no) {
      await new Promise((resolve) => connection.rollback(() => resolve()));
      return res
        .status(400)
        .json({ success: false, error: "insp_no is required" });
    }

    // ========================================
    // 1. ตรวจสอบ tbl_inspection_list
    // ========================================
    const inspectionList = await queryAsync(
      connection,
      "SELECT insp_id FROM tbl_inspection_list WHERE insp_no = ?",
      [insp_no],
    );

    if (inspectionList.length === 0) {
      const insertResult = await queryAsync(
        connection,
        "INSERT INTO tbl_inspection_list (insp_no, insp_service_order, insp_customer_no, insp_customer_name, insp_created_at) VALUES (?, ?, ?, ?, NOW())",
        [
          insp_no,
          toNullIfEmpty(insp_sv),
          toNullIfEmpty(header?.customer_no),
          toNullIfEmpty(header?.customer_name),
        ],
      );

      // เพิ่มการตรวจสอบว่า INSERT สำเร็จ
      if (!insertResult.affectedRows || insertResult.affectedRows === 0) {
        throw new Error("Failed to insert into tbl_inspection_list");
      }

      console.log(
        "Inserted insp_no:",
        insp_no,
        "Insert ID:",
        insertResult.insertId,
      );
    }
    // ========================================
    // 2. Inspection Headers
    // ========================================
    const existingHeader = await queryAsync(
      connection,
      "SELECT scm_ih_id FROM form_scm_inspection_headers WHERE insp_no = ?",
      [insp_no],
    );

    // กำหนดค่า default สำหรับ overall_status
    const overallStatus = header?.overall_status || "N";

    if (existingHeader.length === 0) {
      await queryAsync(
        connection,
        `
        INSERT INTO form_scm_inspection_headers 
        (insp_no, insp_sv, customer_name, job_no, inspection_date, attention, 
         tag_no, equipment_name, conclusion, recommendation, overall_status,
         inspector_name, inspector_signature, inspection_completed_date, created_by)
        VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
      `,
        [
          insp_no,
          toNullIfEmpty(insp_sv),
          toNullIfEmpty(header?.customer_name),
          toNullIfEmpty(header?.job_no),
          toNullIfEmpty(header?.inspection_date),
          toNullIfEmpty(header?.attention),
          toNullIfEmpty(header?.tag_no),
          toNullIfEmpty(header?.equipment_name),
          toNullIfEmpty(header?.conclusion),
          toNullIfEmpty(header?.recommendation),
          overallStatus,
          toNullIfEmpty(header?.inspector_name),
          toNullIfEmpty(header?.inspector_signature),
          toNullIfEmpty(header?.inspection_completed_date),
          created_by,
        ],
      );
    } else {
      await queryAsync(
        connection,
        `
        UPDATE form_scm_inspection_headers 
        SET customer_name = ?, job_no = ?, inspection_date = ?, attention = ?,
            tag_no = ?, equipment_name = ?, conclusion = ?, recommendation = ?,
            overall_status = ?, inspector_name = ?, inspector_signature = ?,
            inspection_completed_date = ?, updated_by = ?, updated_at = NOW()
        WHERE insp_no = ?
      `,
        [
          toNullIfEmpty(header?.customer_name),
          toNullIfEmpty(header?.job_no),
          toNullIfEmpty(header?.inspection_date),
          toNullIfEmpty(header?.attention),
          toNullIfEmpty(header?.tag_no),
          toNullIfEmpty(header?.equipment_name),
          toNullIfEmpty(header?.conclusion),
          toNullIfEmpty(header?.recommendation),
          overallStatus,
          toNullIfEmpty(header?.inspector_name),
          toNullIfEmpty(header?.inspector_signature),
          toNullIfEmpty(header?.inspection_completed_date),
          updated_by,
          insp_no,
        ],
      );
    }

    // ========================================
    // 3. Motor Nameplate
    // ========================================
    if (motorNameplate) {
      const existingNameplate = await queryAsync(
        connection,
        "SELECT mnp_id FROM form_motor_nameplate WHERE insp_no = ?",
        [insp_no],
      );

      if (existingNameplate.length === 0) {
        await queryAsync(
          connection,
          `
          INSERT INTO form_motor_nameplate 
          (insp_no, insp_sv, fmn_manufacture, fmn_model, fmn_type, fmn_ser_no,
           fmn_frame, fmn_power, fmn_power_unit, fmn_speed, fmn_speed_unit,
           fmn_voltage, fmn_current, fmn_frequency, fmn_insulation_class,
           fmn_design, fmn_temp_rise_class, fmn_duty, fmn_cos_phi,
           fmn_ip, fmn_sf, fmn_de_bearing, fmn_nde_bearing, fmn_note, created_by)
          VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
        `,
          [
            insp_no,
            toNullIfEmpty(insp_sv),
            toNullIfEmpty(motorNameplate.manufacture),
            toNullIfEmpty(motorNameplate.model),
            toNullIfEmpty(motorNameplate.type),
            toNullIfEmpty(motorNameplate.ser_no),
            toNullIfEmpty(motorNameplate.frame),
            toNullIfEmpty(motorNameplate.power),
            motorNameplate.power_unit || "kW",
            toNullIfEmpty(motorNameplate.speed),
            motorNameplate.speed_unit || "RPM",
            toNullIfEmpty(motorNameplate.voltage),
            toNullIfEmpty(motorNameplate.current),
            toNullIfEmpty(motorNameplate.frequency),
            toNullIfEmpty(motorNameplate.insulation_class),
            toNullIfEmpty(motorNameplate.design),
            toNullIfEmpty(motorNameplate.temp_rise_class),
            toNullIfEmpty(motorNameplate.duty),
            toNullIfEmpty(motorNameplate.cos_phi),
            toNullIfEmpty(motorNameplate.ip),
            toNullIfEmpty(motorNameplate.sf),
            toNullIfEmpty(motorNameplate.de_bearing),
            toNullIfEmpty(motorNameplate.nde_bearing),
            toNullIfEmpty(motorNameplate.note),
            created_by,
          ],
        );
      } else {
        await queryAsync(
          connection,
          `
          UPDATE form_motor_nameplate 
          SET fmn_manufacture = ?, fmn_model = ?, fmn_type = ?, fmn_ser_no = ?,
              fmn_frame = ?, fmn_power = ?, fmn_power_unit = ?, fmn_speed = ?,
              fmn_speed_unit = ?, fmn_voltage = ?, fmn_current = ?, fmn_frequency = ?,
              fmn_insulation_class = ?, fmn_design = ?, fmn_temp_rise_class = ?,
              fmn_duty = ?, fmn_cos_phi = ?, fmn_ip = ?, fmn_sf = ?,
              fmn_de_bearing = ?, fmn_nde_bearing = ?, fmn_note = ?, updated_by = ?,
              updated_at = NOW()
          WHERE insp_no = ?
        `,
          [
            toNullIfEmpty(motorNameplate.manufacture),
            toNullIfEmpty(motorNameplate.model),
            toNullIfEmpty(motorNameplate.type),
            toNullIfEmpty(motorNameplate.ser_no),
            toNullIfEmpty(motorNameplate.frame),
            toNullIfEmpty(motorNameplate.power),
            motorNameplate.power_unit || "kW",
            toNullIfEmpty(motorNameplate.speed),
            motorNameplate.speed_unit || "RPM",
            toNullIfEmpty(motorNameplate.voltage),
            toNullIfEmpty(motorNameplate.current),
            toNullIfEmpty(motorNameplate.frequency),
            toNullIfEmpty(motorNameplate.insulation_class),
            toNullIfEmpty(motorNameplate.design),
            toNullIfEmpty(motorNameplate.temp_rise_class),
            toNullIfEmpty(motorNameplate.duty),
            toNullIfEmpty(motorNameplate.cos_phi),
            toNullIfEmpty(motorNameplate.ip),
            toNullIfEmpty(motorNameplate.sf),
            toNullIfEmpty(motorNameplate.de_bearing),
            toNullIfEmpty(motorNameplate.nde_bearing),
            toNullIfEmpty(motorNameplate.note),
            updated_by,
            insp_no,
          ],
        );
      }
    }

    // ========================================
    // 4. Driven Equipment
    // ========================================
    if (drivenEquipment) {
      const existingDriven = await queryAsync(
        connection,
        "SELECT scm_de_id FROM form_scm_driven_equipment WHERE insp_no = ?",
        [insp_no],
      );

      if (existingDriven.length === 0) {
        await queryAsync(
          connection,
          `
          INSERT INTO form_scm_driven_equipment 
          (insp_no, scm_de_equipment_type, scm_de_manufactory, scm_de_tag_no,
           scm_de_speed, scm_de_speed_unit, scm_de_de_bearing, scm_de_nde_bearing, created_by)
          VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)
        `,
          [
            insp_no,
            toNullIfEmpty(drivenEquipment.equipment_type),
            toNullIfEmpty(drivenEquipment.manufactory),
            toNullIfEmpty(drivenEquipment.tag_no),
            toNullIfEmpty(drivenEquipment.speed),
            drivenEquipment.speed_unit || "RPM",
            toNullIfEmpty(drivenEquipment.de_bearing),
            toNullIfEmpty(drivenEquipment.nde_bearing),
            created_by,
          ],
        );
      } else {
        await queryAsync(
          connection,
          `
          UPDATE form_scm_driven_equipment 
          SET scm_de_equipment_type = ?, scm_de_manufactory = ?, scm_de_tag_no = ?,
              scm_de_speed = ?, scm_de_speed_unit = ?, scm_de_de_bearing = ?,
              scm_de_nde_bearing = ?, updated_by = ?, updated_at = NOW()
          WHERE insp_no = ?
        `,
          [
            toNullIfEmpty(drivenEquipment.equipment_type),
            toNullIfEmpty(drivenEquipment.manufactory),
            toNullIfEmpty(drivenEquipment.tag_no),
            toNullIfEmpty(drivenEquipment.speed),
            drivenEquipment.speed_unit || "RPM",
            toNullIfEmpty(drivenEquipment.de_bearing),
            toNullIfEmpty(drivenEquipment.nde_bearing),
            updated_by,
            insp_no,
          ],
        );
      }
    }

    // ========================================
    // 5. General Info
    // ========================================
    if (generalInfo) {
      const existingGI = await queryAsync(
        connection,
        "SELECT scm_gi_id FROM form_scm_general_info WHERE insp_no = ?",
        [insp_no],
      );

      if (existingGI.length === 0) {
        await queryAsync(
          connection,
          `
          INSERT INTO form_scm_general_info 
          (insp_no, scm_gi_motor_type_mv, scm_gi_motor_type_lv, scm_gi_motor_type_special,
           scm_gi_mounting_flange, scm_gi_mounting_foot, scm_gi_connection_coupling,
           scm_gi_connection_gearbox, scm_gi_connection_vbelt, created_by)
          VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
        `,
          [
            insp_no,
            generalInfo.motor_type_mv ? 1 : 0,
            generalInfo.motor_type_lv ? 1 : 0,
            generalInfo.motor_type_special ? 1 : 0,
            generalInfo.mounting_flange ? 1 : 0,
            generalInfo.mounting_foot ? 1 : 0,
            generalInfo.connection_coupling ? 1 : 0,
            generalInfo.connection_gearbox ? 1 : 0,
            generalInfo.connection_vbelt ? 1 : 0,
            created_by,
          ],
        );
      } else {
        await queryAsync(
          connection,
          `
          UPDATE form_scm_general_info 
          SET scm_gi_motor_type_mv = ?, scm_gi_motor_type_lv = ?, scm_gi_motor_type_special = ?,
              scm_gi_mounting_flange = ?, scm_gi_mounting_foot = ?, scm_gi_connection_coupling = ?,
              scm_gi_connection_gearbox = ?, scm_gi_connection_vbelt = ?, updated_by = ?, updated_at = NOW()
          WHERE insp_no = ?
        `,
          [
            generalInfo.motor_type_mv ? 1 : 0,
            generalInfo.motor_type_lv ? 1 : 0,
            generalInfo.motor_type_special ? 1 : 0,
            generalInfo.mounting_flange ? 1 : 0,
            generalInfo.mounting_foot ? 1 : 0,
            generalInfo.connection_coupling ? 1 : 0,
            generalInfo.connection_gearbox ? 1 : 0,
            generalInfo.connection_vbelt ? 1 : 0,
            updated_by,
            insp_no,
          ],
        );
      }
    }

    // ========================================
    // 6. General Checks (DELETE then INSERT)
    // ========================================
    if (generalChecks && generalChecks.length > 0) {
      await queryAsync(
        connection,
        "DELETE FROM form_scm_general_checks WHERE insp_no = ?",
        [insp_no],
      );

      for (const check of generalChecks) {
        await queryAsync(
          connection,
          `
          INSERT INTO form_scm_general_checks 
          (insp_no, scm_gc_check_item, scm_gc_status, scm_gc_remarks, created_by)
          VALUES (?, ?, ?, ?, ?)
        `,
          [
            insp_no,
            toNullIfEmpty(check.check_item),
            check.status || null,
            toNullIfEmpty(check.remarks),
            created_by,
          ],
        );
      }
    }

    // ========================================
    // 6. Standstill Test
    // ========================================
    if (standstillTest) {
      const existingST = await queryAsync(
        connection,
        "SELECT scm_st_id FROM form_scm_standstill_test WHERE insp_no = ?",
        [insp_no],
      );

      if (existingST.length === 0) {
        await queryAsync(
          connection,
          `
      INSERT INTO form_scm_standstill_test 
      (insp_no, scm_st_application, scm_st_not_application, 
       scm_st_winding_include_cable, scm_st_winding_exclude_cable, created_by)
      VALUES (?, ?, ?, ?, ?, ?)
    `,
          [
            insp_no,
            standstillTest.application ? 1 : 0,
            standstillTest.not_application ? 1 : 0,
            standstillTest.winding_include_cable ? 1 : 0,
            standstillTest.winding_exclude_cable ? 1 : 0,
            created_by,
          ],
        );
      } else {
        await queryAsync(
          connection,
          `
      UPDATE form_scm_standstill_test 
      SET scm_st_application = ?, scm_st_not_application = ?,
          scm_st_winding_include_cable = ?, scm_st_winding_exclude_cable = ?,
          updated_by = ?, updated_at = NOW()
      WHERE insp_no = ?
    `,
          [
            standstillTest.application ? 1 : 0,
            standstillTest.not_application ? 1 : 0,
            standstillTest.winding_include_cable ? 1 : 0,
            standstillTest.winding_exclude_cable ? 1 : 0,
            updated_by,
            insp_no,
          ],
        );
      }
    }
    // ========================================
    // 7. Insulation Tests (DELETE then INSERT)
    // ========================================
    if (insulationTests && insulationTests.length > 0) {
      await queryAsync(
        connection,
        "DELETE FROM form_scm_insulation_tests WHERE insp_no = ?",
        [insp_no],
      );

      for (const test of insulationTests) {
        await queryAsync(
          connection,
          `
          INSERT INTO form_scm_insulation_tests 
          (insp_no, scm_it_test_voltage, scm_it_phase_marking, scm_it_resistance_1min_c,
           scm_it_resistance_1min_40c, scm_it_resistance_10min_c, scm_it_resistance_10min_40c,
           scm_it_polarization_index, scm_it_winding_temp, scm_it_note, created_by)
          VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
        `,
          [
            insp_no,
            toNullIfEmpty(test.test_voltage),
            toNullIfEmpty(test.phase_marking),
            toNullIfEmpty(test.resistance_1min_c),
            toNullIfEmpty(test.resistance_1min_40c),
            toNullIfEmpty(test.resistance_10min_c),
            toNullIfEmpty(test.resistance_10min_40c),
            toNullIfEmpty(test.polarization_index),
            toNullIfEmpty(test.winding_temp),
            toNullIfEmpty(test.note),
            created_by,
          ],
        );
      }
    }

    // ========================================
    // 8. Resistance Tests
    // ========================================
    if (resistanceTests) {
      const existingRT = await queryAsync(
        connection,
        "SELECT scm_rt_id FROM form_scm_resistance_tests WHERE insp_no = ?",
        [insp_no],
      );

      if (existingRT.length === 0) {
        await queryAsync(
          connection,
          `
          INSERT INTO form_scm_resistance_tests 
          (insp_no, scm_rt_test_unit, scm_rt_resistance_uv, scm_rt_resistance_uw,
           scm_rt_resistance_vw, scm_rt_result_status, created_by)
          VALUES (?, ?, ?, ?, ?, ?, ?)
        `,
          [
            insp_no,
            resistanceTests.test_unit || "",
            toNullIfEmpty(resistanceTests.resistance_uv),
            toNullIfEmpty(resistanceTests.resistance_uw),
            toNullIfEmpty(resistanceTests.resistance_vw),
            resistanceTests.result_status || null,
            created_by,
          ],
        );
      } else {
        await queryAsync(
          connection,
          `
          UPDATE form_scm_resistance_tests 
          SET scm_rt_test_unit = ?, scm_rt_resistance_uv = ?, scm_rt_resistance_uw = ?,
              scm_rt_resistance_vw = ?, scm_rt_result_status = ?, updated_by = ?, updated_at = NOW()
          WHERE insp_no = ?
        `,
          [
            resistanceTests.test_unit || "",
            toNullIfEmpty(resistanceTests.resistance_uv),
            toNullIfEmpty(resistanceTests.resistance_uw),
            toNullIfEmpty(resistanceTests.resistance_vw),
            resistanceTests.result_status || null,
            updated_by,
            insp_no,
          ],
        );
      }
    }

    // ========================================
    // 9. Inductance Tests
    // ========================================
    if (inductanceTests) {
      const existingLT = await queryAsync(
        connection,
        "SELECT scm_lt_id FROM form_scm_inductance_tests WHERE insp_no = ?",
        [insp_no],
      );

      if (existingLT.length === 0) {
        await queryAsync(
          connection,
          `
          INSERT INTO form_scm_inductance_tests 
          (insp_no, scm_lt_test_unit, scm_lt_inductance_uv, scm_lt_inductance_uw,
           scm_lt_inductance_vw, scm_lt_result_status, created_by)
          VALUES (?, ?, ?, ?, ?, ?, ?)
        `,
          [
            insp_no,
            inductanceTests.test_unit || "",
            toNullIfEmpty(inductanceTests.inductance_uv),
            toNullIfEmpty(inductanceTests.inductance_uw),
            toNullIfEmpty(inductanceTests.inductance_vw),
            inductanceTests.result_status || null,
            created_by,
          ],
        );
      } else {
        await queryAsync(
          connection,
          `
          UPDATE form_scm_inductance_tests 
          SET scm_lt_test_unit = ?, scm_lt_inductance_uv = ?, scm_lt_inductance_uw = ?,
              scm_lt_inductance_vw = ?, scm_lt_result_status = ?, updated_by = ?, updated_at = NOW()
          WHERE insp_no = ?
        `,
          [
            inductanceTests.test_unit || "",
            toNullIfEmpty(inductanceTests.inductance_uv),
            toNullIfEmpty(inductanceTests.inductance_uw),
            toNullIfEmpty(inductanceTests.inductance_vw),
            inductanceTests.result_status || null,
            updated_by,
            insp_no,
          ],
        );
      }
    }

    // ========================================
    // 10. Temperature Sensors Bearing
    // ========================================
    if (tempSensorsBearing) {
      const existingTSB = await queryAsync(
        connection,
        "SELECT scm_tsb_id FROM form_scm_temp_sensors_bearing WHERE insp_no = ?",
        [insp_no],
      );

      if (existingTSB.length === 0) {
        await queryAsync(
          connection,
          `
          INSERT INTO form_scm_temp_sensors_bearing 
          (insp_no, scm_tsb_de_connection_no1, scm_tsb_de_connection_no2, scm_tsb_de_resistance,
           scm_tsb_nde_connection_no1, scm_tsb_nde_connection_no2, scm_tsb_nde_resistance,
           scm_tsb_sensor_type, scm_tsb_result_status, created_by)
          VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
        `,
          [
            insp_no,
            toNullIfEmpty(tempSensorsBearing.de_connection_no1),
            toNullIfEmpty(tempSensorsBearing.de_connection_no2),
            toNullIfEmpty(tempSensorsBearing.de_resistance),
            toNullIfEmpty(tempSensorsBearing.nde_connection_no1),
            toNullIfEmpty(tempSensorsBearing.nde_connection_no2),
            toNullIfEmpty(tempSensorsBearing.nde_resistance),
            toNullIfEmpty(tempSensorsBearing.sensor_type),
            tempSensorsBearing.result_status || null,
            created_by,
          ],
        );
      } else {
        await queryAsync(
          connection,
          `
          UPDATE form_scm_temp_sensors_bearing 
          SET scm_tsb_de_connection_no1 = ?, scm_tsb_de_connection_no2 = ?, scm_tsb_de_resistance = ?,
              scm_tsb_nde_connection_no1 = ?, scm_tsb_nde_connection_no2 = ?, scm_tsb_nde_resistance = ?,
              scm_tsb_sensor_type = ?, scm_tsb_result_status = ?, updated_by = ?, updated_at = NOW()
          WHERE insp_no = ?
        `,
          [
            toNullIfEmpty(tempSensorsBearing.de_connection_no1),
            toNullIfEmpty(tempSensorsBearing.de_connection_no2),
            toNullIfEmpty(tempSensorsBearing.de_resistance),
            toNullIfEmpty(tempSensorsBearing.nde_connection_no1),
            toNullIfEmpty(tempSensorsBearing.nde_connection_no2),
            toNullIfEmpty(tempSensorsBearing.nde_resistance),
            toNullIfEmpty(tempSensorsBearing.sensor_type),
            tempSensorsBearing.result_status || null,
            updated_by,
            insp_no,
          ],
        );
      }
    }

    // ========================================
    // 11. Heaters (DELETE then INSERT)
    // ========================================
    if (heaters && heaters.length > 0) {
      await queryAsync(
        connection,
        "DELETE FROM form_scm_heaters WHERE insp_no = ?",
        [insp_no],
      );

      for (const heater of heaters) {
        await queryAsync(
          connection,
          `
          INSERT INTO form_scm_heaters 
          (insp_no, scm_h_unit_no, scm_h_connection_no1, scm_h_connection_no2, scm_h_resistance, created_by)
          VALUES (?, ?, ?, ?, ?, ?)
        `,
          [
            insp_no,
            heater.unit_no,
            toNullIfEmpty(heater.connection_no1),
            toNullIfEmpty(heater.connection_no2),
            toNullIfEmpty(heater.resistance),
            created_by,
          ],
        );
      }
    }

    // ========================================
    // 12. Temperature Sensors Stator (DELETE then INSERT)
    // ========================================
    if (tempSensorsStator && tempSensorsStator.length > 0) {
      await queryAsync(
        connection,
        "DELETE FROM form_scm_temp_sensors_stator WHERE insp_no = ?",
        [insp_no],
      );

      for (const sensor of tempSensorsStator) {
        await queryAsync(
          connection,
          `
          INSERT INTO form_scm_temp_sensors_stator 
          (insp_no, scm_tss_element_no, scm_tss_connection_no1, scm_tss_connection_no2,
           scm_tss_resistance, scm_tss_sensor_type, scm_tss_result_status, created_by)
          VALUES (?, ?, ?, ?, ?, ?, ?, ?)
        `,
          [
            insp_no,
            sensor.element_no,
            toNullIfEmpty(sensor.connection_no1),
            toNullIfEmpty(sensor.connection_no2),
            toNullIfEmpty(sensor.resistance),
            toNullIfEmpty(sensor.sensor_type),
            sensor.result_status || null,
            created_by,
          ],
        );
      }
    }

    await new Promise((resolve, reject) => {
      connection.commit((err) => {
        if (err) return reject(err);
        resolve();
      });
    });

    res.json({
      success: true,
      message: "Inspection saved successfully",
      insp_no,
    });
  } catch (error) {
    if (connection) {
      await new Promise((resolve) => connection.rollback(() => resolve()));
    }
    console.error("Error in /api/scm/inspection-save:", error);
    res.status(500).json({
      success: false,
      error: error.message,
    });
  } finally {
    if (connection) connection.release();
  }
});
/* ---------------------------------------------------------------------------------- */
/* ---------------------------------------------------------------------------------- */
/* ---------------------------------------------------------------------------------- */
/* ---------------------------------------------------------------------------------- */
/* ---------------------------------------------------------------------------------- */
/* ---------------------------------------------------------------------------------- */
/* ---------------------------------------------------------------------------------- */
/* ----------------------------------------------------------------- ด้านล่างคืออันเก่า */
/* ดึง print */
/**
 * GET /api/report/inspection/:insp_no
 * ดึงข้อมูลรายงานตาม Inspection No
 */
app.get("/api/inspectionPM/:id", (req, res) => {
  const { id } = req.params;

  const sql = `
   SELECT
      i.id AS inspID,
      i.entityid AS insp_customer_no,
      i.mt_id AS insp_no,
      i.jobno AS insp_jobNo,
      i.attention AS insp_attention,
      i.mt_id AS insp_no,
      i.customer AS insp_customer_name,
      i.sq AS insp_sale_quote,
      i.sv AS insp_service_order,
      i.incoming_date AS insp_document_date,
      f.form_name AS insp_motor_name
    FROM u_inspection AS i
    LEFT JOIN u_form AS f
      ON f.form_type = i.type_form
WHERE i.mt_id = ?
`;

  db2.query(sql, [id], (err, results) => {
    if (err) {
      console.error("Database error:", err);
      return res
        .status(500)
        .json({ error: "เกิดข้อผิดพลาดในการเชื่อมต่อฐานข้อมูล" });
    }
    if (results.length === 0) {
      return res.status(404).json({ error: "ไม่พบข้อมูลใบงานนี้" });
    }
    res.json(results[0]);
  });
});

// ─────────────────────────────────────────────────────────────────────────────
// Global process error logs
process.on("uncaughtException", (err) => {
  console.error("Uncaught Exception:", err);
});
process.on("unhandledRejection", (err) => {
  console.error("Unhandled Rejection:", err);
});

// ─────────────────────────────────────────────────────────────────────────────
app.use("/img", express.static(path.join(__dirname, "public", "img_upload")));
app.use("/uploads", express.static(path.join(__dirname, "public", "uploads")));

// Health
app.get("/", (req, res) => {
  res.json({
    service: "Inspection Management API",
    version: "1.0.0",
    status: "running",
    uptime: process.uptime(),
    timestamp: new Date().toISOString(),
  });
});
app.get("/health", (req, res) => res.status(200).send("OK"));

//_______________________________________________________________________________
// Logout Endpoint
/* app.post('/api/logout', (req, res) => {
  const { user_key } = req.body || {};

  if (!user_key) {
    return res.status(400).json({ error: 'ไม่พบ user_key' });
  }

  const sql = `UPDATE u_user SET u_last_logout = NOW() WHERE user_key = ?`;

  db3.query(sql, [user_key], (err, result) => {
    if (err) {
      console.error('Database error:', err);
      return res.status(500).json({ error: 'Database error' });
    }

    if (result.affectedRows === 0) {
      return res.status(404).json({ error: 'ไม่พบผู้ใช้' });
    }

    res.json({ message: 'ออกจากระบบสำเร็จ' });
  });
}); */
/* ระบบPM-form */

// ─────────────────────────────────────────────────────────────────────────────
// Listen
server.listen(PORT, () => console.log(`Server running on port ${PORT}`));

/*
Scaling note:
- ถ้ารันหลาย instance ให้เปิด Redis adapter:
  const { createAdapter } = require('@socket.io/redis-adapter');
  const { createClient } = require('redis');
  const pub = createClient({ url: process.env.REDIS_URL });
  const sub = pub.duplicate();
  await Promise.all([pub.connect(), sub.connect()]);
  io.adapter(createAdapter(pub, sub));

Azure:
- เปิด WebSockets ใน App Service
- ถ้ามี proxy/front door ต้องส่งผ่าน header Upgrade/Connection
*/
