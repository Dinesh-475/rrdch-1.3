/**
 * RRDCH — appointments.routes.js
 * Public booking, tracking, queue status, cancel, reschedule, and slot availability.
 */
const router = require('express').Router();
const db     = require('../database');
const { emitAdminRealtime } = require('../utils/socketHandlers');
const { authMiddleware } = require('../middleware/auth.middleware');
const { genAppointmentId, genTokenNo } = require('../utils/tokenGenerator');
const { validate, appointmentRules } = require('../middleware/validate.middleware');

/** POST /api/appointments/book — public, no auth required */
router.post('/book', validate(appointmentRules), (req, res) => {
  const { patient_name, patient_phone, dept_id, date, time_slot, chief_complaint } = req.body;

  // Count today's appointments for this department to get token number
  db.get(
    'SELECT COUNT(*) as c FROM appointments WHERE dept_id = ? AND date = ?',
    [dept_id, date],
    (err, row) => {
      if (err) return res.status(500).json({ ok: false, msg: 'DB error.' });
      const tokenNum = (row.c || 0) + 1;
      const id       = genAppointmentId();
      const token_no = genTokenNo(tokenNum);

      db.run(
        `INSERT INTO appointments (id,token_no,patient_name,patient_phone,dept_id,date,time_slot,chief_complaint,status,queue_position,created_at)
         VALUES (?,?,?,?,?,?,?,?,'booked',?,datetime('now'))`,
        [id, token_no, patient_name, patient_phone, dept_id, date, time_slot, chief_complaint || '', tokenNum],
        function(err) {
          if (err) return res.status(500).json({ ok: false, msg: 'Failed to book appointment.' });
          emitAdminRealtime('appointment_booked', {
            id,
            token_no,
            dept_id,
            date,
            time_slot,
            patient_name,
          });
          res.json({
            ok: true,
            msg: 'Appointment booked successfully!',
            data: { id, token_no, patient_name, dept_id, date, time_slot }
          });
        }
      );
    }
  );
});

/** GET /api/appointments/track?token=A-042 or ?phone=9876543210 */
router.get('/track', (req, res) => {
  const { token, phone } = req.query;
  if (!token && !phone)
    return res.status(400).json({ ok: false, msg: 'Provide token or phone.' });

  const sql = token
    ? 'SELECT a.*, d.name as dept_name FROM appointments a LEFT JOIN departments d ON a.dept_id=d.id WHERE a.token_no = ? ORDER BY a.created_at DESC LIMIT 5'
    : 'SELECT a.*, d.name as dept_name FROM appointments a LEFT JOIN departments d ON a.dept_id=d.id WHERE a.patient_phone = ? ORDER BY a.created_at DESC LIMIT 5';

  db.all(sql, [token || phone], (err, rows) => {
    if (err) return res.status(500).json({ ok: false, msg: 'DB error.' });
    if (!rows.length) return res.status(404).json({ ok: false, msg: 'No appointments found.' });
    res.json({ ok: true, data: rows });
  });
});

/** GET /api/appointments/queue/:dept_id — live queue for a department */
router.get('/queue/:dept_id', (req, res) => {
  const today = new Date().toISOString().split('T')[0];
  db.all(
    `SELECT token_no, patient_name, status, queue_position, time_slot
     FROM appointments WHERE dept_id = ? AND date = ?
     AND status NOT IN ('cancelled','done','no_show') ORDER BY queue_position ASC, token_no ASC`,
    [req.params.dept_id, today],
    (err, rows) => {
      if (err) return res.status(500).json({ ok: false, msg: 'DB error.' });
      const now_serving = rows.find(r => r.status === 'in_queue' || r.status === 'called');
      res.json({
        ok: true,
        data: {
          now_serving: now_serving ? now_serving.token_no : 'N/A',
          next_5: rows.filter(r => r.status === 'confirmed').slice(0, 5).map(r => r.token_no),
          waiting_count: rows.length,
          queue: rows
        }
      });
    }
  );
});

/** GET /api/appointments/slots?date=2026-04-20&dept_id=1 */
router.get('/slots', (req, res) => {
  const { date, dept_id } = req.query;
  if (!date || !dept_id) return res.status(400).json({ ok: false, msg: 'date and dept_id required.' });
  const allSlots = ['9:00 AM','9:30 AM','10:00 AM','10:30 AM','11:00 AM','11:30 AM',
                    '12:00 PM','2:00 PM','2:30 PM','3:00 PM','3:30 PM','4:00 PM'];
  db.all(
    'SELECT time_slot FROM appointments WHERE date = ? AND dept_id = ? AND status != "cancelled"',
    [date, dept_id],
    (err, booked) => {
      if (err) return res.status(500).json({ ok: false, msg: 'DB error.' });
      const bookedSlots = booked.map(b => b.time_slot);
      const slots = allSlots.map(s => ({ slot: s, available: !bookedSlots.includes(s) }));
      res.json({ ok: true, data: slots });
    }
  );
});

/** PUT /api/appointments/:id/cancel — auth required, patient cancels own */
router.put('/:id/cancel', authMiddleware, (req, res) => {
  db.get('SELECT * FROM appointments WHERE id = ?', [req.params.id], (err, appt) => {
    if (err || !appt) return res.status(404).json({ ok: false, msg: 'Appointment not found.' });
    db.run(
      'UPDATE appointments SET status = "cancelled", updated_at = datetime("now") WHERE id = ?',
      [req.params.id],
      function(err) {
        if (err) return res.status(500).json({ ok: false, msg: 'Failed to cancel.' });
        res.json({ ok: true, msg: 'Appointment cancelled.' });
      }
    );
  });
});

/** PUT /api/appointments/:id/reschedule */
router.put('/:id/reschedule', authMiddleware, (req, res) => {
  const { date, time_slot } = req.body;
  if (!date || !time_slot) return res.status(400).json({ ok: false, msg: 'New date and time_slot required.' });
  db.run(
    'UPDATE appointments SET date = ?, time_slot = ?, status = "booked", updated_at = datetime("now") WHERE id = ?',
    [date, time_slot, req.params.id],
    function(err) {
      if (err) return res.status(500).json({ ok: false, msg: 'Failed to reschedule.' });
      res.json({ ok: true, msg: 'Appointment rescheduled.' });
    }
  );
});

module.exports = router;
