/**
 * RRDCH — public.routes.js
 * All public (no auth) GET endpoints.
 */
const router = require('express').Router();
const db     = require('../database');
const { emitAdminRealtime } = require('../utils/socketHandlers');

/** GET /api/public/stats */
router.get('/stats', (req, res) => {
  db.all('SELECT * FROM stats ORDER BY rowid', [], (err, rows) => {
    if (err) return res.status(500).json({ ok: false, msg: 'Error fetching stats' });
    res.json({ ok: true, data: rows });
  });
});

/** GET /api/public/achievements */
router.get('/achievements', (req, res) => {
  db.all('SELECT * FROM achievements WHERE is_active = 1 ORDER BY sort_order', [], (err, rows) => {
    if (err) return res.status(500).json({ ok: false, msg: 'Error fetching achievements' });
    res.json({ ok: true, data: rows });
  });
});

/** GET /api/public/ticker */
router.get('/ticker', (req, res) => {
  db.all('SELECT * FROM ticker_items WHERE is_active = 1 ORDER BY sort_order', [], (err, rows) => {
    if (err) return res.status(500).json({ ok: false, msg: 'Error fetching ticker' });
    res.json({ ok: true, data: rows });
  });
});

/** GET /api/public/departments */
router.get('/departments', (req, res) => {
  db.all('SELECT * FROM departments ORDER BY id', [], (err, rows) => {
    if (err) return res.status(500).json({ ok: false, msg: 'Error fetching departments' });
    res.json({ ok: true, data: rows });
  });
});

/** GET /api/public/departments/:id */
router.get('/departments/:id', (req, res) => {
  db.get('SELECT * FROM departments WHERE id = ?', [req.params.id], (err, row) => {
    if (err) return res.status(500).json({ ok: false, msg: 'Error' });
    if (!row) return res.status(404).json({ ok: false, msg: 'Department not found' });
    res.json({ ok: true, data: row });
  });
});

/** GET /api/public/events */
router.get('/events', (req, res) => {
  const { type } = req.query;
  let sql = 'SELECT * FROM events WHERE is_published = 1';
  const params = [];
  if (type && type !== 'all') { sql += ' AND type = ?'; params.push(type); }
  sql += ' ORDER BY date ASC';
  db.all(sql, params, (err, rows) => {
    if (err) return res.status(500).json({ ok: false, msg: 'Error fetching events' });
    res.json({ ok: true, data: rows });
  });
});

/** GET /api/public/events/:id */
router.get('/events/:id', (req, res) => {
  db.get('SELECT * FROM events WHERE id = ? AND is_published = 1', [req.params.id], (err, row) => {
    if (err) return res.status(500).json({ ok: false, msg: 'Error' });
    if (!row) return res.status(404).json({ ok: false, msg: 'Event not found' });
    res.json({ ok: true, data: row });
  });
});

/** GET /api/public/news — top 10 announcements from events table */
router.get('/news', (req, res) => {
  db.all('SELECT * FROM events WHERE is_published = 1 ORDER BY created_at DESC LIMIT 10', [], (err, rows) => {
    if (err) return res.status(500).json({ ok: false, msg: 'Error' });
    res.json({ ok: true, data: rows });
  });
});

/** GET /api/public/circulars */
router.get('/circulars', (req, res) => {
  db.all('SELECT * FROM circulars ORDER BY date DESC, is_important DESC LIMIT 20', [], (err, rows) => {
    if (err) return res.status(500).json({ ok: false, msg: 'Error fetching circulars' });
    res.json({ ok: true, data: rows });
  });
});

/** GET /api/public/management */
router.get('/management', (req, res) => {
  db.all('SELECT * FROM management ORDER BY sort_order ASC', [], (err, rows) => {
    if (err) return res.status(500).json({ ok: false, msg: 'Error fetching management' });
    res.json({ ok: true, data: rows });
  });
});

/** GET /api/public/config — keys for maps only; Gemini stays server-side */
router.get('/config', (req, res) => {
  res.json({
    ok: true,
    data: {
      geminiEnabled: Boolean(process.env.GEMINI_API_KEY),
      geminiModel: process.env.GEMINI_MODEL || 'gemini-2.0-flash',
      googleMapsApiKey: process.env.GOOGLE_MAPS_API_KEY || '',
      maptilerApiKey: process.env.MAPTILER_API_KEY || '',
      campusCoords: { lat: 12.9279, lng: 77.4713 }
    }
  });
});

// ─── CONTACT ENQUIRIES ─────────────────────────────────────────────────────────

/** POST /api/public/contact — submit a contact enquiry (public, no auth) */
router.post('/contact', (req, res) => {
  const { name, email, phone, subject, message } = req.body;
  if (!name || !message)
    return res.status(400).json({ ok: false, msg: 'Name and message are required.' });
  if (message.length < 10)
    return res.status(400).json({ ok: false, msg: 'Message must be at least 10 characters.' });
  db.run(
    `INSERT INTO contact_enquiries (name,email,phone,subject,message) VALUES (?,?,?,?,?)`,
    [name.trim(), email || null, phone || null, subject || 'General Enquiry', message.trim()],
    function(err) {
      if (err) return res.status(500).json({ ok: false, msg: 'Failed to save enquiry.' });
      const eid = this.lastID;
      emitAdminRealtime('contact_enquiry', {
        id: eid,
        name: name.trim(),
        subject: subject || 'General Enquiry',
      });
      res.json({ ok: true, msg: 'Thank you! We will contact you within 24 hours.', id: eid });
    }
  );
});

// ─── RESEARCH ──────────────────────────────────────────────────────────────────

/** GET /api/public/research — return all active publications */
router.get('/research', (req, res) => {
  const { dept, year } = req.query;
  let sql = 'SELECT * FROM research_publications WHERE is_active = 1';
  const params = [];
  if (dept && dept !== 'all') { sql += ' AND dept = ?'; params.push(dept); }
  if (year)                   { sql += ' AND year = ?';  params.push(parseInt(year)); }
  sql += ' ORDER BY year DESC, id DESC';
  db.all(sql, params, (err, rows) => {
    if (err) return res.status(500).json({ ok: false, msg: err.message });
    res.json({ ok: true, data: rows });
  });
});

// ─── STUDENT LIFE STATS ────────────────────────────────────────────────────────

/** GET /api/public/student-stats — aggregate numbers for students.html */
router.get('/student-stats', (req, res) => {
  Promise.all([
    new Promise(r => db.get('SELECT COUNT(*) as c FROM users WHERE role="student"', [], (e, row) => r(row?.c || 0))),
    new Promise(r => db.get('SELECT COUNT(*) as c FROM users WHERE role="doctor"', [],  (e, row) => r(row?.c || 0))),
    new Promise(r => db.get('SELECT COUNT(*) as c FROM hostel_complaints WHERE status="resolved"', [], (e, row) => r(row?.c || 0))),
    new Promise(r => db.get('SELECT COUNT(*) as c FROM admissions WHERE status="accepted"', [], (e, row) => r(row?.c || 0))),
  ]).then(([students, faculty, complaints_resolved, admissions_accepted]) => {
    res.json({
      ok: true,
      data: {
        total_students: students,
        total_faculty: faculty,
        complaints_resolved,
        admissions_accepted,
        // static institutional data
        bds_seats: 100,
        mds_specialities: 9,
        placement_rate: '100%',
        nirf_rank: 34,
      }
    });
  });
});

module.exports = router;
