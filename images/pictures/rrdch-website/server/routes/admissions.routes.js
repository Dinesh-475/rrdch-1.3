/**
 * RRDCH — admissions.routes.js
 * POST /api/admissions/apply — submit application
 * GET  /api/admissions/status — track by application ID
 */
const router = require('express').Router();
const db     = require('../database');
const { genAdmissionId } = require('../utils/tokenGenerator');
const { emitAdminRealtime } = require('../utils/socketHandlers');

/** POST /api/admissions/apply */
router.post('/apply', (req, res) => {
  const { applicant_name, dob, category, course, speciality, neet_score, neet_rank,
          phone, email, state, address } = req.body;
  if (!applicant_name || !course || !phone)
    return res.status(400).json({ ok: false, msg: 'Name, course, and phone are required.' });
  const id = genAdmissionId();
  db.run(
    `INSERT INTO admissions (id,applicant_name,dob,category,course,speciality,neet_score,neet_rank,phone,email,state,address,status)
     VALUES (?,?,?,?,?,?,?,?,?,?,?,?,'pending_review')`,
    [id, applicant_name, dob, category, course, speciality, neet_score, neet_rank, phone, email, state, address],
    function(err) {
      if (err) return res.status(500).json({ ok: false, msg: 'Failed to submit application.' });
      emitAdminRealtime('admission_submitted', {
        id,
        applicant_name,
        course,
        phone,
      });
      res.json({ ok: true, msg: 'Application submitted successfully! An administrator will review it shortly.', data: { id } });
    }
  );
});

/** GET /api/admissions/status?id=APP-2026-00001 */
router.get('/status', (req, res) => {
  const { id } = req.query;
  if (!id) return res.status(400).json({ ok: false, msg: 'Application ID required.' });
  db.get('SELECT id, applicant_name, course, status, created_at, updated_at FROM admissions WHERE id = ?', [id], (err, row) => {
    if (err) return res.status(500).json({ ok: false, msg: err.message });
    if (!row) return res.status(404).json({ ok: false, msg: 'Application not found.' });
    res.json({ ok: true, data: row });
  });
});

module.exports = router;
