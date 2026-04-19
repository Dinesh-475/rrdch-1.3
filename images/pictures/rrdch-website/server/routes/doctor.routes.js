/**
 * RRDCH — doctor.routes.js
 * PG Doctor portal: schedule, patient list, case logs, status updates.
 */
const router = require('express').Router();
const db     = require('../database');
const { authMiddleware, roleGuard } = require('../middleware/auth.middleware');

const guard = [authMiddleware, roleGuard('doctor', 'hod', 'admin')];

/** GET /api/doctor/schedule — today's appointments */
router.get('/schedule', guard, (req, res) => {
  const today = new Date().toISOString().split('T')[0];
  db.all(
    `SELECT a.*, d.name as dept_name FROM appointments a
     LEFT JOIN departments d ON a.dept_id = d.id
     WHERE a.date = ? AND a.status NOT IN ('cancelled')
     ORDER BY a.time_slot ASC`,
    [today],
    (err, rows) => {
      if (err) return res.status(500).json({ ok: false, msg: err.message });
      res.json({ ok: true, data: rows });
    }
  );
});

/** PUT /api/doctor/appointments/:id/status */
router.put('/appointments/:id/status', guard, (req, res) => {
  const { status, notes } = req.body;
  const validStatuses = ['confirmed', 'in_queue', 'called', 'done', 'no_show'];
  if (!validStatuses.includes(status))
    return res.status(400).json({ ok: false, msg: `Invalid status. Must be one of: ${validStatuses.join(', ')}` });

  db.run(
    `UPDATE appointments SET status = ?, notes = COALESCE(?,notes), updated_at = datetime('now') WHERE id = ?`,
    [status, notes, req.params.id],
    function(err) {
      if (err) return res.status(500).json({ ok: false, msg: err.message });
      if (this.changes === 0) return res.status(404).json({ ok: false, msg: 'Appointment not found.' });
      res.json({ ok: true, msg: 'Status updated.' });
    }
  );
});

/** GET /api/doctor/patients?search=ramesh&dept_id=3 */
router.get('/patients', guard, (req, res) => {
  const { search, dept_id } = req.query;
  let sql = `SELECT DISTINCT patient_name, patient_phone, dept_id, MAX(date) as last_visit, COUNT(*) as visits
             FROM appointments WHERE status = 'done'`;
  const params = [];
  if (search) { sql += ' AND (patient_name LIKE ? OR patient_phone LIKE ?)'; params.push(`%${search}%`, `%${search}%`); }
  if (dept_id) { sql += ' AND dept_id = ?'; params.push(dept_id); }
  sql += ' GROUP BY patient_phone ORDER BY last_visit DESC LIMIT 50';
  db.all(sql, params, (err, rows) => {
    if (err) return res.status(500).json({ ok: false, msg: err.message });
    res.json({ ok: true, data: rows });
  });
});

/** GET /api/doctor/patients/:phone — full case history */
router.get('/patients/:phone', guard, (req, res) => {
  db.all(
    `SELECT a.*, d.name as dept_name FROM appointments a
     LEFT JOIN departments d ON a.dept_id = d.id
     WHERE a.patient_phone = ? ORDER BY a.date DESC`,
    [req.params.phone],
    (err, rows) => {
      if (err) return res.status(500).json({ ok: false, msg: err.message });
      res.json({ ok: true, data: rows });
    }
  );
});

/** POST /api/doctor/case-log */
router.post('/case-log', guard, (req, res) => {
  const { appointment_id, notes } = req.body;
  if (!appointment_id || !notes)
    return res.status(400).json({ ok: false, msg: 'appointment_id and notes required.' });
  db.run(
    `UPDATE appointments SET notes = ?, updated_at = datetime('now') WHERE id = ?`,
    [notes, appointment_id],
    function(err) {
      if (err) return res.status(500).json({ ok: false, msg: err.message });
      res.json({ ok: true, msg: 'Case log saved.' });
    }
  );
});

module.exports = router;
