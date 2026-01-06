// login.js
const crypto = require('crypto');
const bcrypt = require('bcrypt');
const jwt = require('jsonwebtoken');

/**
 * ฟังก์ชันตรวจจับประเภทอุปกรณ์จาก User-Agent
 */
function detectDeviceType(userAgent) {
    if (!userAgent) return null;

    const ua = userAgent.toLowerCase();

    // ตรวจสอบ Mobile
    if (/(android|webos|iphone|ipad|ipod|blackberry|iemobile|opera mini)/i.test(ua)) {
        // แยก Tablet จาก Mobile
        if (/(ipad|android(?!.*mobile)|tablet)/i.test(ua)) {
            return 'tablet';
        }
        return 'mobile';
    }

    // Desktop
    return 'desktop';
}

/**
 * POST /api/login
 * ระบบ Login สำหรับ Inspection Management
 */
function setupLoginRoutes(app, db, db3) {

    // ============================================================
    // Login Endpoint (Main System)
    // ============================================================
    app.post('/api/login', async (req, res) => {
        try {
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
                if (err) {
                    console.error('Database error:', err);
                    return res.status(500).json({ error: 'Database error' });
                }

                if (results.length === 0) {
                    return res.status(401).json({ error: 'ไม่พบผู้ใช้' });
                }

                const user = results[0];
                const storedHash = user.pass2 && user.pass2.startsWith('$2') ? user.pass2 : user.password;

                const handleLoginSuccess = () => {
                    // อัปเดตเวลา login ล่าสุด
                    db.query(
                        'UPDATE u_user SET u_last_login = NOW() WHERE user_key = ?',
                        [user.user_key],
                        (err2) => {
                            if (err2) console.error('Update last login error:', err2);
                        }
                    );

                    // ตรวจสอบว่ามีตาราง user_attendance_logs หรือไม่
                    db.query('SHOW TABLES LIKE "user_attendance_logs"', (checkErr, tables) => {
                        if (!checkErr && tables.length > 0) {
                            // ✅ ดึงข้อมูล IP, User-Agent และ detect device type
                            const ipAddress = req.ip || req.connection.remoteAddress || req.headers['x-forwarded-for'];
                            const userAgent = req.headers['user-agent'];
                            const deviceType = detectDeviceType(userAgent);

                            const logSql = `
                INSERT INTO user_attendance_logs (
                  user_key, 
                  branch_id, 
                  login_at, 
                  ip_address, 
                  user_agent,
                  device_type,
                  status
                ) VALUES (?, ?, NOW(), ?, ?, ?, 'active')
              `;

                            db.query(
                                logSql,
                                [user.user_key, branch, ipAddress, userAgent, deviceType],
                                (logErr) => {
                                    if (logErr) console.error('Login log error:', logErr);
                                }
                            );
                        }
                    });

                    const JWT_SECRET = process.env.JWT_SECRET || 'dev-secret-key';
                    const payload = {
                        user_key: user.user_key,
                    }
                    const accessToken = jwt.sign(payload, JWT_SECRET);

                    // ส่งข้อมูล user กลับ
                    res.json({
                        user_key: user.user_key,
                        name: user.name,
                        lastname: user.lastname,
                        username: user.username,
                        user_class: user.user_class,
                        user_type: user.user_type,
                        branch_log: user.branch_log,
                        user_photo: user.user_photo,
                        user_language: user.user_language,
                        bed_view: user.bed_view,
                        system_font_size: user.system_font_size,
                        email: user.email,
                        department: user.department,
                        api_token: user.api_token,
                        u_role: user.u_role,
                        accessToken
                    });
                };

                // ตรวจสอบรหัสผ่าน
                if (storedHash && storedHash.startsWith('$2')) {
                    // bcrypt
                    const isMatch = await bcrypt.compare(password, storedHash);
                    if (!isMatch) {
                        return res.status(401).json({ error: 'รหัสผ่านไม่ถูกต้อง' });
                    }
                    handleLoginSuccess();
                } else {
                    // md5 (legacy)
                    const md5Hash = crypto.createHash('md5').update(password).digest('hex');
                    const isMatch = (md5Hash === storedHash);
                    if (!isMatch) {
                        return res.status(401).json({ error: 'รหัสผ่านไม่ถูกต้อง' });
                    }
                    handleLoginSuccess();
                }
            });

        } catch (error) {
            console.error('Login error:', error);
            res.status(500).json({ error: 'Server error' });
        }
    });

    // ============================================================
    // Logout Endpoint (Main System)
    // ============================================================
    app.post('/api/logout', (req, res) => {
        const { user_key } = req.body || {};

        if (!user_key) {
            return res.status(400).json({ error: 'ไม่พบ user_key' });
        }

        // อัปเดตเวลา logout
        const sql = `UPDATE u_user SET u_last_logout = NOW() WHERE user_key = ?`;

        db.query(sql, [user_key], (err, result) => {
            if (err) {
                console.error('Database error:', err);
                return res.status(500).json({ error: 'Database error' });
            }

            if (result.affectedRows === 0) {
                return res.status(404).json({ error: 'ไม่พบผู้ใช้' });
            }

            // ตรวจสอบว่ามีตาราง user_attendance_logs หรือไม่
            db.query('SHOW TABLES LIKE "user_attendance_logs"', (checkErr, tables) => {
                if (!checkErr && tables.length > 0) {
                    // อัปเดต logout log
                    const logSql = `
            UPDATE user_attendance_logs 
            SET logout_at = NOW(), 
                status = 'logged_out',
                logout_reason = 'manual',
                session_duration = TIMESTAMPDIFF(SECOND, login_at, NOW())
            WHERE user_key = ? 
              AND logout_at IS NULL
            ORDER BY login_at DESC 
            LIMIT 1
          `;

                    db.query(logSql, [user_key], (logErr) => {
                        if (logErr) console.error('Logout log error:', logErr);
                    });
                }
            });

            res.json({ message: 'ออกจากระบบสำเร็จ' });
        });
    });

    // ============================================================
    // Login สำหรับระบบ PM (login2)
    // ============================================================
    app.post('/api/login2', async (req, res) => {
        try {
            const { username, password, branch } = req.body || {};

            if (!username || !password || !branch) {
                return res.status(400).json({ error: 'กรุณากรอกข้อมูลให้ครบถ้วน' });
            }

            const sql = `
        SELECT * FROM u_user 
        WHERE username = ? 
          AND user_status = 1
      `;

            db3.query(sql, [username], async (err, results) => {
                if (err) return res.status(500).json({ error: 'Database error' });
                if (results.length === 0) return res.status(401).json({ error: 'ไม่พบผู้ใช้' });

                const user = results[0];
                const storedHash = user.password;

                const handleLoginSuccess = () => {
                    // อัปเดตเวลา login ล่าสุด
                    db3.query(
                        'UPDATE u_user SET u_last_login = NOW() WHERE user_key = ?',
                        [user.user_key],
                        (err2) => {
                            if (err2) console.error('Update last login error:', err2);
                        }
                    );

                    // ตรวจสอบว่ามีตาราง user_attendance_logs หรือไม่
                    db3.query('SHOW TABLES LIKE "user_attendance_logs"', (checkErr, tables) => {
                        if (!checkErr && tables.length > 0) {
                            // ✅ ดึงข้อมูล IP, User-Agent และ detect device type
                            const ipAddress = req.ip || req.connection.remoteAddress || req.headers['x-forwarded-for'];
                            const userAgent = req.headers['user-agent'];
                            const deviceType = detectDeviceType(userAgent);

                            const logSql = `
                INSERT INTO user_attendance_logs (
                  user_key, 
                  branch_id, 
                  login_at, 
                  ip_address, 
                  user_agent,
                  device_type,
                  status
                ) VALUES (?, ?, NOW(), ?, ?, ?, 'active')
              `;

                            db3.query(
                                logSql,
                                [user.user_key, branch, ipAddress, userAgent, deviceType],
                                (logErr) => {
                                    if (logErr) console.error('Login2 log error:', logErr);
                                }
                            );
                        }
                    });

                    // ส่งข้อมูล user กลับ
                    res.json({
                        user_key: user.user_key,
                        name: user.name,
                        lastname: user.lastname,
                        username: user.username,
                        user_class: user.user_class,
                        user_type: user.user_type,
                        branch_log: user.branch_log,
                        user_photo: user.user_photo,
                        u_role: user.u_role,
                        user_language: user.user_language
                    });
                };

                // ตรวจสอบรหัสผ่าน
                if (storedHash.startsWith('$2')) {
                    const isMatch = await bcrypt.compare(password, storedHash);
                    if (!isMatch) return res.status(401).json({ error: 'รหัสผ่านไม่ถูกต้อง' });
                    handleLoginSuccess();
                } else {
                    const md5Hash = crypto.createHash('md5').update(password).digest('hex');
                    const isMatch = (md5Hash === storedHash);
                    if (!isMatch) return res.status(401).json({ error: 'รหัสผ่านไม่ถูกต้อง' });
                    handleLoginSuccess();
                }
            });

        } catch (error) {
            console.error('Login2 error:', error);
            res.status(500).json({ error: 'Server error' });
        }
    });

    // ============================================================
    // Logout สำหรับระบบ PM (logout2)
    // ============================================================
    app.post('/api/logout2', (req, res) => {
        const { user_key } = req.body || {};

        if (!user_key) {
            return res.status(400).json({ error: 'ไม่พบ user_key' });
        }

        // อัปเดตเวลา logout
        const sql = `UPDATE u_user SET u_last_logout = NOW() WHERE user_key = ?`;

        db3.query(sql, [user_key], (err, result) => {
            if (err) {
                console.error('Database error:', err);
                return res.status(500).json({ error: 'Database error' });
            }

            if (result.affectedRows === 0) {
                return res.status(404).json({ error: 'ไม่พบผู้ใช้' });
            }

            // ตรวจสอบว่ามีตาราง user_attendance_logs หรือไม่
            db3.query('SHOW TABLES LIKE "user_attendance_logs"', (checkErr, tables) => {
                if (!checkErr && tables.length > 0) {
                    // อัปเดต logout log
                    const logSql = `
            UPDATE user_attendance_logs 
            SET logout_at = NOW(), 
                status = 'logged_out',
                logout_reason = 'manual',
                session_duration = TIMESTAMPDIFF(SECOND, login_at, NOW())
            WHERE user_key = ? 
              AND logout_at IS NULL
            ORDER BY login_at DESC 
            LIMIT 1
          `;

                    db3.query(logSql, [user_key], (logErr) => {
                        if (logErr) console.error('Logout2 log error:', logErr);
                    });
                }
            });

            res.json({ message: 'ออกจากระบบสำเร็จ' });
        });
    });
}

module.exports = { setupLoginRoutes };