/**
 * RRDCH — admin.routes.js
 * Full admin CMS: dashboard analytics, user CRUD, appointments management,
 * hostel complaints management, content CMS (events, ticker, achievements).
 */
const router = require('express').Router();
const db     = require('../database');
const bcrypt = require('bcrypt');
const { authMiddleware, roleGuard } = require('../middleware/auth.middleware');
const { emitDbChange }             = require('../utils/socketHandlers');
const { validate, circularRules, eventRules } = require('../middleware/validate.middleware');

const guard = [authMiddleware, roleGuard('admin', 'hod')];

const DEMO_SEED_PASSWORDS = [
  { id: 'admin@rrdch.org', role: 'admin', name: 'Administrator', password: 'Admin@RRDCH2026' },
  { id: 'BDS2023001', role: 'student', name: 'Ananya Sharma', password: 'RRDCH@2023001' },
  { id: 'BDS2022047', role: 'student', name: 'Rajan Menon', password: 'RRDCH@2022047' },
  { id: 'pg.001@rrdch.org', role: 'doctor', name: 'Dr. Ravi Kumar', password: 'PG@0012026' },
  { id: 'hod.ortho@rrdch.org', role: 'hod', name: 'Dr. M. Suresh', password: 'HOD@Ortho2026' },
  { id: '9876543210', role: 'patient', name: 'Ramesh Naidu', password: 'OTP 123456 (patient login)' },
  { id: '9812345678', role: 'patient', name: 'Kavitha Reddy', password: 'OTP 123456 (patient login)' },
];

/** GET /api/admin/demo-credentials — localhost / explicit demo only (never enable in production) */
router.get('/demo-credentials', guard, (req, res) => {
  const allow = process.env.NODE_ENV === 'development' || process.env.SHOW_DEMO_CREDS === '1';
  if (!allow) return res.status(403).json({ ok: false, msg: 'Demo credential list is disabled.' });
  res.json({ ok: true, data: DEMO_SEED_PASSWORDS, note: 'Password hashes are stored with bcrypt; these are the seeded demo secrets for local testing.' });
});

/** GET /api/admin/login-sessions */
router.get('/login-sessions', guard, (req, res) => {
  const limit = Math.min(parseInt(req.query.limit, 10) || 80, 200);
  db.all(
    `SELECT id, user_id, role, ip, user_agent, session_token, login_at
     FROM login_sessions ORDER BY login_at DESC LIMIT ?`,
    [limit],
    (err, rows) => {
      if (err) return res.status(500).json({ ok: false, msg: err.message });
      res.json({ ok: true, data: rows });
    }
  );
});

/** GET /api/admin/operations-summary — pending + recent for admin console */
router.get('/operations-summary', guard, (req, res) => {
  const tasks = [
    new Promise((r) =>
      db.get(
        `SELECT COUNT(*) as c FROM admissions WHERE status IN ('submitted','pending_review')`,
        [],
        (e, row) => r(row?.c || 0)
      )
    ),
    new Promise((r) =>
      db.get(`SELECT COUNT(*) as c FROM contact_enquiries WHERE status = 'new'`, [], (e, row) => r(row?.c || 0))
    ),
    new Promise((r) =>
      db.get(`SELECT COUNT(*) as c FROM hostel_complaints WHERE status = 'pending'`, [], (e, row) => r(row?.c || 0))
    ),
    new Promise((r) =>
      db.all(
        `SELECT id, applicant_name, course, phone, status, created_at FROM admissions
         WHERE status IN ('submitted','pending_review') ORDER BY created_at DESC LIMIT 8`,
        [],
        (e, rows) => r(rows || [])
      )
    ),
    new Promise((r) =>
      db.all(
        `SELECT id, name, subject, status, created_at FROM contact_enquiries WHERE status = 'new' ORDER BY created_at DESC LIMIT 8`,
        [],
        (e, rows) => r(rows || [])
      )
    ),
    new Promise((r) =>
      db.all(
        `SELECT id, student_id, room_no, category, urgency, status, created_at FROM hostel_complaints
         WHERE status = 'pending' ORDER BY created_at DESC LIMIT 8`,
        [],
        (e, rows) => r(rows || [])
      )
    ),
  ];
  Promise.all(tasks).then(
    ([pending_admissions, pending_contacts, pending_complaints, admissions_rows, contacts_rows, complaints_rows]) => {
      res.json({
        ok: true,
        data: {
          counts: {
            pending_admissions,
            pending_contacts,
            pending_complaints,
            pending_total: pending_admissions + pending_contacts + pending_complaints,
          },
          admissions: admissions_rows,
          contacts: contacts_rows,
          complaints: complaints_rows,
        },
      });
    }
  );
});

/** GET /api/admin/users/:id/detail — profile + sessions + role-specific rows */
router.get('/users/:id/detail', guard, (req, res) => {
  const uid = req.params.id;
  db.get(
    `SELECT id, name, role, portal, email, phone, is_active, created_at, last_login,
            '(bcrypt hash stored)' as password_note
     FROM users WHERE id = ?`,
    [uid],
    (err, user) => {
      if (err) return res.status(500).json({ ok: false, msg: err.message });
      if (!user) return res.status(404).json({ ok: false, msg: 'User not found.' });

      const demo = DEMO_SEED_PASSWORDS.find((d) => d.id === uid);
      const extra = {};
      const finish = () => {
        res.json({
          ok: true,
          data: {
            user,
            demo_password_hint: demo && (process.env.NODE_ENV === 'development' || process.env.SHOW_DEMO_CREDS === '1') ? demo.password : null,
            ...extra,
          },
        });
      };

      db.all(
        `SELECT id, ip, user_agent, login_at, session_token FROM login_sessions WHERE user_id = ? ORDER BY login_at DESC LIMIT 40`,
        [uid],
        (e, sessions) => {
          extra.sessions = sessions || [];
          if (user.role === 'student') {
            db.get('SELECT * FROM students WHERE student_id = ? OR user_id = ?', [uid, uid], (e2, st) => {
              extra.student = st || null;
              finish();
            });
          } else if (user.role === 'patient') {
            db.get('SELECT * FROM patients WHERE patient_id = ? OR user_id = ?', [uid, uid], (e2, pt) => {
              extra.patient = pt || null;
              db.get(
                `SELECT COUNT(*) as c FROM appointments WHERE patient_phone = ?`,
                [uid],
                (e3, row) => {
                  extra.appointment_count = row?.c ?? 0;
                  finish();
                }
              );
            });
          } else {
            finish();
          }
        }
      );
    }
  );
});

// ─── DASHBOARD ANALYTICS ──────────────────────────────────────────────────────

/** GET /api/admin/dashboard */
router.get('/dashboard', guard, (req, res) => {
  const today = new Date().toISOString().split('T')[0];
  Promise.all([
    new Promise(r => db.get('SELECT COUNT(*) as c FROM appointments WHERE date = ?', [today], (e,row) => r(row?.c || 0))),
    new Promise(r => db.get('SELECT COUNT(*) as c FROM users WHERE role = "student"', [], (e,row) => r(row?.c || 0))),
    new Promise(r => db.get('SELECT COUNT(*) as c FROM appointments WHERE status = "booked" OR status = "confirmed"', [], (e,row) => r(row?.c || 0))),
    new Promise(r => db.get('SELECT COUNT(*) as c FROM hostel_complaints WHERE status = "pending"', [], (e,row) => r(row?.c || 0))),
  ]).then(([patients_today, students, pending_appts, pending_complaints]) => {
    res.json({ ok: true, data: { patients_today, students, pending_appts, pending_complaints } });
  });
});

/** GET /api/admin/analytics — chart data */
router.get('/analytics', guard, (req, res) => {
  Promise.all([
    // OPD patients last 14 days
    new Promise(r => db.all(
      `SELECT date, COUNT(*) as count FROM appointments WHERE date >= date('now', '-14 days') GROUP BY date ORDER BY date`,
      [], (e, rows) => r(rows || [])
    )),
    // Department distribution
    new Promise(r => db.all(
      `SELECT d.name, COUNT(a.id) as count FROM appointments a JOIN departments d ON a.dept_id=d.id GROUP BY a.dept_id`,
      [], (e, rows) => r(rows || [])
    )),
    // Admissions by month
    new Promise(r => db.all(
      `SELECT strftime('%Y-%m', created_at) as month, COUNT(*) as count FROM admissions GROUP BY month ORDER BY month DESC LIMIT 6`,
      [], (e, rows) => r(rows || [])
    )),
  ]).then(([opd_trend, dept_distribution, admissions_trend]) => {
    res.json({ ok: true, data: { opd_trend, dept_distribution, admissions_trend } });
  });
});

/** GET /api/admin/traffic-summary — aggregated site telemetry (no raw IPs) */
router.get('/traffic-summary', guard, (req, res) => {
  const days = Math.min(Math.max(parseInt(req.query.days, 10) || 7, 1), 90);
  const since = new Date(Date.now() - days * 86400000).toISOString().slice(0, 10) + ' 00:00:00';

  db.get(
    `SELECT COUNT(*) AS total_events, COUNT(DISTINCT session_id) AS unique_sessions
     FROM traffic_events WHERE created_at >= ?`,
    [since],
    (err, totals) => {
      if (err) return res.status(500).json({ ok: false, msg: err.message });
      db.all(
        `SELECT path, COUNT(*) AS count FROM traffic_events WHERE created_at >= ? GROUP BY path ORDER BY count DESC LIMIT 35`,
        [since],
        (e2, byPath) => {
          if (e2) return res.status(500).json({ ok: false, msg: e2.message });
          db.all(
            `SELECT event_type, COUNT(*) AS count FROM traffic_events WHERE created_at >= ? GROUP BY event_type ORDER BY count DESC`,
            [since],
            (e3, byType) => {
              if (e3) return res.status(500).json({ ok: false, msg: e3.message });
              db.all(
                `SELECT target, COUNT(*) AS count FROM traffic_events
                 WHERE created_at >= ? AND target IS NOT NULL AND TRIM(target) != ''
                 GROUP BY target ORDER BY count DESC LIMIT 45`,
                [since],
                (e4, topTargets) => {
                  if (e4) return res.status(500).json({ ok: false, msg: e4.message });
                  db.get(
                    `SELECT COUNT(*) AS c FROM traffic_events
                     WHERE created_at >= ? AND event_type = 'geo' AND target = 'granted'`,
                    [since],
                    (e5, geoRow) => {
                      if (e5) return res.status(500).json({ ok: false, msg: e5.message });
                      res.json({
                        ok: true,
                        data: {
                          period_days: days,
                          since,
                          totals: totals || { total_events: 0, unique_sessions: 0 },
                          by_path: byPath || [],
                          by_event_type: byType || [],
                          top_targets: topTargets || [],
                          geo_opt_in_count: geoRow?.c || 0,
                        },
                      });
                    }
                  );
                }
              );
            }
          );
        }
      );
    }
  );
});

/** GET /api/admin/activity — audit trail */
router.get('/activity', guard, (req, res) => {
  const limit = parseInt(req.query.limit) || 25;
  db.all(
    `SELECT * FROM activity_log ORDER BY created_at DESC LIMIT ?`,
    [Math.min(limit, 100)],
    (err, rows) => {
      if (err) return res.status(500).json({ ok: false, msg: err.message });
      res.json({ ok: true, data: rows });
    }
  );
});

/** POST /api/admin/activity — log an action (internal use, also callable from other routes) */
router.post('/activity', guard, (req, res) => {
  const { type, action, entity_id } = req.body;
  if (!type || !action) return res.status(400).json({ ok: false, msg: 'type and action required.' });
  db.run(
    `INSERT INTO activity_log (type,actor_id,actor_name,action,entity_id,ip) VALUES (?,?,?,?,?,?)`,
    [type, req.user.id, req.user.name, action, entity_id || null, req.ip],
    function(err) {
      if (err) return res.status(500).json({ ok: false, msg: err.message });
      res.json({ ok: true, id: this.lastID });
    }
  );
});

// ─── USER MANAGEMENT ──────────────────────────────────────────────────────────

/** GET /api/admin/users */
router.get('/users', guard, (req, res) => {
  const { role } = req.query;
  let sql = 'SELECT id, name, role, portal, email, phone, is_active, created_at, last_login FROM users';
  const params = [];
  if (role && role !== 'all') { sql += ' WHERE role = ?'; params.push(role); }
  sql += ' ORDER BY created_at DESC';
  db.all(sql, params, (err, rows) => {
    if (err) return res.status(500).json({ ok: false, msg: err.message });
    res.json({ ok: true, data: rows });
  });
});

/** POST /api/admin/users */
router.post('/users', guard, (req, res) => {
  const { id, name, password, role, portal, email, phone } = req.body;
  if (!id || !name || !password || !role) return res.status(400).json({ ok: false, msg: 'Missing required fields.' });
  bcrypt.hash(password, 10, (err, hash) => {
    if (err) return res.status(500).json({ ok: false, msg: 'Hash error.' });
    db.run(
      'INSERT INTO users (id,name,password,role,portal,email,phone) VALUES (?,?,?,?,?,?,?)',
      [id, name, hash, role, portal || role, email, phone],
      function(err) {
        if (err) return res.status(500).json({ ok: false, msg: 'User may already exist.' });
        emitDbChange('NEW_USER', `User ${name} (${role}) created.`);
        res.json({ ok: true, msg: 'User created.', data: { id } });
      }
    );
  });
});

/** PUT /api/admin/users/:id */
router.put('/users/:id', guard, (req, res) => {
  const { name, email, phone, role, portal } = req.body;
  db.run(
    'UPDATE users SET name=?,email=?,phone=?,role=?,portal=? WHERE id=?',
    [name, email, phone, role, portal, req.params.id],
    function(err) {
      if (err) return res.status(500).json({ ok: false, msg: err.message });
      res.json({ ok: true, msg: 'User updated.' });
    }
  );
});

/** DELETE /api/admin/users/:id */
router.delete('/users/:id', guard, (req, res) => {
  db.run('DELETE FROM users WHERE id = ?', [req.params.id], function(err) {
    if (err) return res.status(500).json({ ok: false, msg: err.message });
    emitDbChange('DELETE_USER', `User ${req.params.id} deleted.`);
    res.json({ ok: true, msg: 'User deleted.' });
  });
});

/** PUT /api/admin/users/:id/toggle */
router.put('/users/:id/toggle', guard, (req, res) => {
  db.run('UPDATE users SET is_active = CASE WHEN is_active=1 THEN 0 ELSE 1 END WHERE id=?', [req.params.id], function(err) {
    if (err) return res.status(500).json({ ok: false, msg: err.message });
    res.json({ ok: true, msg: 'User status toggled.' });
  });
});

// ─── APPOINTMENTS MANAGEMENT ──────────────────────────────────────────────────

/** GET /api/admin/appointments */
router.get('/appointments', guard, (req, res) => {
  const { date, dept_id, status } = req.query;
  let sql = `SELECT a.*, d.name as dept_name FROM appointments a LEFT JOIN departments d ON a.dept_id=d.id WHERE 1=1`;
  const params = [];
  if (date)    { sql += ' AND a.date = ?';    params.push(date); }
  if (dept_id) { sql += ' AND a.dept_id = ?'; params.push(dept_id); }
  if (status)  { sql += ' AND a.status = ?';  params.push(status); }
  sql += ' ORDER BY a.date DESC, a.token_no ASC LIMIT 200';
  db.all(sql, params, (err, rows) => {
    if (err) return res.status(500).json({ ok: false, msg: err.message });
    res.json({ ok: true, data: rows });
  });
});

/** PUT /api/admin/appointments/:id */
router.put('/appointments/:id', guard, (req, res) => {
  const { status, doctor_id, notes } = req.body;
  db.run(
    `UPDATE appointments SET status=COALESCE(?,status), doctor_id=COALESCE(?,doctor_id), notes=COALESCE(?,notes), updated_at=datetime('now') WHERE id=?`,
    [status, doctor_id, notes, req.params.id],
    function(err) {
      if (err) return res.status(500).json({ ok: false, msg: err.message });
      res.json({ ok: true, msg: 'Appointment updated.' });
    }
  );
});

// ─── HOSTEL COMPLAINTS ────────────────────────────────────────────────────────

/** GET /api/admin/complaints */
router.get('/complaints', guard, (req, res) => {
  const { status } = req.query;
  let sql = 'SELECT * FROM hostel_complaints';
  const params = [];
  if (status) { sql += ' WHERE status = ?'; params.push(status); }
  sql += ' ORDER BY created_at DESC';
  db.all(sql, params, (err, rows) => {
    if (err) return res.status(500).json({ ok: false, msg: err.message });
    res.json({ ok: true, data: rows });
  });
});

/** PUT /api/admin/complaints/:id */
router.put('/complaints/:id', guard, (req, res) => {
  const { status, assigned_to, resolution_notes } = req.body;
  const resolved_at = status === 'resolved' ? "datetime('now')" : 'resolved_at';
  db.run(
    `UPDATE hostel_complaints SET status=COALESCE(?,status), assigned_to=COALESCE(?,assigned_to), resolution_notes=COALESCE(?,resolution_notes), updated_at=datetime('now'), resolved_at=CASE WHEN ?='resolved' THEN datetime('now') ELSE resolved_at END WHERE id=?`,
    [status, assigned_to, resolution_notes, status, req.params.id],
    function(err) {
      if (err) return res.status(500).json({ ok: false, msg: err.message });
      res.json({ ok: true, msg: 'Complaint updated.' });
    }
  );
});

// ─── CONTENT CMS ─────────────────────────────────────────────────────────────

/** POST /api/admin/events */
router.post('/events', guard, validate(eventRules), (req, res) => {
  const { title, type, date, end_date, venue, description, registration_link } = req.body;
  db.run(
    `INSERT INTO events (title,type,date,end_date,venue,description,registration_link,is_published,created_by) VALUES (?,?,?,?,?,?,?,1,?)`,
    [title, type, date, end_date, venue, description, registration_link, req.user.id],
    function(err) {
      if (err) return res.status(500).json({ ok: false, msg: err.message });
      db.run(`INSERT INTO activity_log (type,actor_id,actor_name,action,entity_id,ip) VALUES ('CREATE',?,?,?,?,?)`,
        [req.user.id, req.user.name, `Created event: ${title}`, String(this.lastID), req.ip]);
      emitDbChange('NEW_EVENT', `Event "${title}" created.`);
      res.json({ ok: true, msg: 'Event created.', data: { id: this.lastID } });
    }
  );
});

/** PUT /api/admin/events/:id */
router.put('/events/:id', guard, (req, res) => {
  const { title, type, date, end_date, venue, description } = req.body;
  db.run(
    'UPDATE events SET title=?,type=?,date=?,end_date=?,venue=?,description=? WHERE id=?',
    [title, type, date, end_date, venue, description, req.params.id],
    function(err) {
      if (err) return res.status(500).json({ ok: false, msg: err.message });
      res.json({ ok: true, msg: 'Event updated.' });
    }
  );
});

/** DELETE /api/admin/events/:id */
router.delete('/events/:id', guard, (req, res) => {
  db.run('DELETE FROM events WHERE id=?', [req.params.id], function(err) {
    if (err) return res.status(500).json({ ok: false, msg: err.message });
    res.json({ ok: true, msg: 'Event deleted.' });
  });
});

/** POST /api/admin/ticker */
router.post('/ticker', guard, (req, res) => {
  const { content_en, content_kn } = req.body;
  if (!content_en) return res.status(400).json({ ok: false, msg: 'content_en required.' });
  db.run('INSERT INTO ticker_items (content_en,content_kn,is_active) VALUES (?,?,1)', [content_en, content_kn], function(err) {
    if (err) return res.status(500).json({ ok: false, msg: err.message });
    res.json({ ok: true, msg: 'Ticker item added.', data: { id: this.lastID } });
  });
});

/** GET /api/admin/admissions */
router.get('/admissions', guard, (req, res) => {
  const { status } = req.query;
  let sql = 'SELECT * FROM admissions';
  const params = [];
  if (status) { sql += ' WHERE status = ?'; params.push(status); }
  sql += ' ORDER BY created_at DESC';
  db.all(sql, params, (err, rows) => {
    if (err) return res.status(500).json({ ok: false, msg: err.message });
    res.json({ ok: true, data: rows });
  });
});

/** PUT /api/admin/admissions/:id/status */
router.put('/admissions/:id/status', guard, (req, res) => {
  const { status } = req.body;
  db.run(
    `UPDATE admissions SET status=?, updated_at=datetime('now') WHERE id=?`,
    [status, req.params.id],
    function(err) {
      if (err) return res.status(500).json({ ok: false, msg: err.message });
      res.json({ ok: true, msg: 'Application status updated.' });
    }
  );
});

/** GET /api/admin/feedback */
router.get('/feedback', guard, (req, res) => {
  db.all('SELECT * FROM feedback ORDER BY submitted_at DESC LIMIT 100', [], (err, rows) => {
    if (err) return res.status(500).json({ ok: false, msg: err.message });
    res.json({ ok: true, data: rows });
  });
});

// ─── CONTACT ENQUIRIES (ADMIN) ─────────────────────────────────────────────────

/** GET /api/admin/enquiries */
router.get('/enquiries', guard, (req, res) => {
  const { status } = req.query;
  let sql = 'SELECT * FROM contact_enquiries';
  const params = [];
  if (status) { sql += ' WHERE status = ?'; params.push(status); }
  sql += ' ORDER BY created_at DESC LIMIT 100';
  db.all(sql, params, (err, rows) => {
    if (err) return res.status(500).json({ ok: false, msg: err.message });
    res.json({ ok: true, data: rows });
  });
});

/** PUT /api/admin/enquiries/:id/status */
router.put('/enquiries/:id/status', guard, (req, res) => {
  const { status } = req.body; // 'new' | 'in_progress' | 'resolved'
  if (!status) return res.status(400).json({ ok: false, msg: 'status required.' });
  db.run('UPDATE contact_enquiries SET status = ? WHERE id = ?', [status, req.params.id], function(err) {
    if (err) return res.status(500).json({ ok: false, msg: err.message });
    if (this.changes === 0) return res.status(404).json({ ok: false, msg: 'Enquiry not found.' });
    res.json({ ok: true, msg: 'Enquiry updated.' });
  });
});

// ─── RESEARCH PUBLICATIONS (ADMIN) ────────────────────────────────────────────

/** GET /api/admin/research */
router.get('/research', guard, (req, res) => {
  db.all('SELECT * FROM research_publications ORDER BY year DESC', [], (err, rows) => {
    if (err) return res.status(500).json({ ok: false, msg: err.message });
    res.json({ ok: true, data: rows });
  });
});

/** POST /api/admin/research */
router.post('/research', guard, (req, res) => {
  const { title, authors, journal, year, doi, dept, abstract } = req.body;
  if (!title) return res.status(400).json({ ok: false, msg: 'Title is required.' });
  db.run(
    `INSERT INTO research_publications (title,authors,journal,year,doi,dept,abstract) VALUES (?,?,?,?,?,?,?)`,
    [title, authors, journal, year, doi, dept, abstract],
    function(err) {
      if (err) return res.status(500).json({ ok: false, msg: err.message });
      db.run(`INSERT INTO activity_log (type,actor_id,actor_name,action,entity_id,ip) VALUES ('CREATE',?,?,?,?,?)`,
        [req.user.id, req.user.name, `Added publication: ${title}`, String(this.lastID), req.ip]);
      res.status(201).json({ ok: true, msg: 'Publication added.', data: { id: this.lastID } });
    }
  );
});

/** DELETE /api/admin/research/:id */
router.delete('/research/:id', guard, (req, res) => {
  db.run('UPDATE research_publications SET is_active = 0 WHERE id = ?', [req.params.id], function(err) {
    if (err) return res.status(500).json({ ok: false, msg: err.message });
    if (this.changes === 0) return res.status(404).json({ ok: false, msg: 'Publication not found.' });
    res.json({ ok: true, msg: 'Publication removed.' });
  });
});

// ─── CIRCULARS CMS ────────────────────────────────────────────────────────────

/** GET /api/admin/circulars — all circulars (admin view, includes unpublished) */
router.get('/circulars', guard, (req, res) => {
  const { category } = req.query;
  let sql = 'SELECT * FROM circulars';
  const params = [];
  if (category && category !== 'all') { sql += ' WHERE category = ?'; params.push(category); }
  sql += ' ORDER BY date DESC, is_important DESC';
  db.all(sql, params, (err, rows) => {
    if (err) return res.status(500).json({ ok: false, msg: err.message });
    res.json({ ok: true, data: rows });
  });
});

/** POST /api/admin/circulars */
router.post('/circulars', guard, validate(circularRules), (req, res) => {
  const { title, category, date, file_url, is_important } = req.body;
  db.run(
    `INSERT INTO circulars (title,category,date,file_url,is_important) VALUES (?,?,?,?,?)`,
    [title, category, date || new Date().toISOString().split('T')[0], file_url || '#', is_important ? 1 : 0],
    function(err) {
      if (err) return res.status(500).json({ ok: false, msg: err.message });
      db.run(`INSERT INTO activity_log (type,actor_id,actor_name,action,entity_id,ip) VALUES ('CREATE',?,?,?,?,?)`,
        [req.user.id, req.user.name, `Published circular: ${title}`, String(this.lastID), req.ip]);
      emitDbChange('NEW_CIRCULAR', `Circular "${title}" published.`);
      res.status(201).json({ ok: true, msg: 'Circular created.', data: { id: this.lastID } });
    }
  );
});

/** PUT /api/admin/circulars/:id */
router.put('/circulars/:id', guard, validate(circularRules), (req, res) => {
  const { title, category, date, file_url, is_important } = req.body;
  db.run(
    `UPDATE circulars SET title=COALESCE(?,title), category=COALESCE(?,category), date=COALESCE(?,date),
     file_url=COALESCE(?,file_url), is_important=COALESCE(?,is_important) WHERE id=?`,
    [title, category, date, file_url, is_important !== undefined ? (is_important ? 1 : 0) : null, req.params.id],
    function(err) {
      if (err) return res.status(500).json({ ok: false, msg: err.message });
      if (this.changes === 0) return res.status(404).json({ ok: false, msg: 'Circular not found.' });
      db.run(`INSERT INTO activity_log (type,actor_id,actor_name,action,entity_id,ip) VALUES ('UPDATE',?,?,?,?,?)`,
        [req.user.id, req.user.name, `Updated circular ID ${req.params.id}`, req.params.id, req.ip]);
      res.json({ ok: true, msg: 'Circular updated.' });
    }
  );
});

/** DELETE /api/admin/circulars/:id */
router.delete('/circulars/:id', guard, (req, res) => {
  db.run('DELETE FROM circulars WHERE id = ?', [req.params.id], function(err) {
    if (err) return res.status(500).json({ ok: false, msg: err.message });
    if (this.changes === 0) return res.status(404).json({ ok: false, msg: 'Circular not found.' });
    db.run(`INSERT INTO activity_log (type,actor_id,actor_name,action,entity_id,ip) VALUES ('DELETE',?,?,?,?,?)`,
      [req.user.id, req.user.name, `Deleted circular ID ${req.params.id}`, req.params.id, req.ip]);
    emitDbChange('DELETE_CIRCULAR', `Circular ID ${req.params.id} deleted.`);
    res.json({ ok: true, msg: 'Circular deleted.' });
  });
});

module.exports = router;
