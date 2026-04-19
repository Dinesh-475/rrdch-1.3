/**
 * RRDCH — patient.routes.js
 * Patient portal: my appointments, history, follow-up request.
 */
const router = require('express').Router();
const db     = require('../database');
const { authMiddleware, roleGuard } = require('../middleware/auth.middleware');

const guard = [authMiddleware, roleGuard('patient', 'admin')];

/** GET /api/patient/appointments */
router.get('/appointments', guard, (req, res) => {
  const phone = req.user.id; // patient ID is their phone
  db.all(
    `SELECT a.*, d.name as dept_name FROM appointments a
     LEFT JOIN departments d ON a.dept_id = d.id
     WHERE a.patient_phone = ? ORDER BY a.date DESC`,
    [phone],
    (err, rows) => {
      if (err) return res.status(500).json({ ok: false, msg: err.message });
      res.json({ ok: true, data: rows });
    }
  );
});

/** GET /api/patient/history */
router.get('/history', guard, (req, res) => {
  const phone = req.user.id;
  db.all(
    `SELECT a.*, d.name as dept_name FROM appointments a
     LEFT JOIN departments d ON a.dept_id = d.id
     WHERE a.patient_phone = ? AND a.status = 'done' ORDER BY a.date DESC`,
    [phone],
    (err, rows) => {
      if (err) return res.status(500).json({ ok: false, msg: err.message });
      res.json({ ok: true, data: rows });
    }
  );
});

/** POST /api/patient/followup */
router.post('/followup', guard, (req, res) => {
  const { appointment_id, note } = req.body;
  if (!appointment_id) return res.status(400).json({ ok: false, msg: 'appointment_id required.' });
  db.run(
    `UPDATE appointments SET notes = ?, updated_at = datetime('now') WHERE id = ?`,
    [`FOLLOW-UP REQUESTED: ${note || ''}`, appointment_id],
    function(err) {
      if (err) return res.status(500).json({ ok: false, msg: err.message });
      res.json({ ok: true, msg: 'Follow-up request submitted.' });
    }
  );
});

module.exports = router;
