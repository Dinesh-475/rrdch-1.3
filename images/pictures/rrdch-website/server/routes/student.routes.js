/**
 * RRDCH — student.routes.js
 * All student portal endpoints (role: student).
 */
const router = require('express').Router();
const db     = require('../database');
const { authMiddleware, roleGuard } = require('../middleware/auth.middleware');
const { genComplaintId } = require('../utils/tokenGenerator');
const { validate, complaintRules } = require('../middleware/validate.middleware');
const { emitAdminRealtime } = require('../utils/socketHandlers');

const guard = [authMiddleware, roleGuard('student', 'admin')];

/** GET /api/student/attendance — subject-wise summary */
router.get('/attendance', guard, (req, res) => {
  const sid = req.user.id;
  db.all(
    `SELECT s.id, s.name, s.code, s.credits,
       SUM(CASE WHEN a.status='P' THEN 1 ELSE 0 END) as attended,
       COUNT(a.id) as total,
       CASE WHEN COUNT(a.id) > 0 THEN
         ROUND(100.0 * SUM(CASE WHEN a.status='P' THEN 1 ELSE 0 END) / COUNT(a.id), 1)
       ELSE 0 END as percentage
     FROM subjects s
     LEFT JOIN attendance a ON s.id = a.subject_id AND a.student_id = ?
     WHERE s.year = (SELECT year FROM students WHERE student_id = ?)
     GROUP BY s.id`,
    [sid, sid],
    (err, rows) => {
      if (err) return res.status(500).json({ ok: false, msg: err.message });
      res.json({ ok: true, data: rows });
    }
  );
});

/** GET /api/student/attendance/calendar?month=2026-04 */
router.get('/attendance/calendar', guard, (req, res) => {
  const sid = req.user.id;
  const month = req.query.month || new Date().toISOString().slice(0, 7);
  db.all(
    `SELECT date, status FROM attendance WHERE student_id = ? AND date LIKE ? ORDER BY date`,
    [sid, `${month}%`],
    (err, rows) => {
      if (err) return res.status(500).json({ ok: false, msg: err.message });
      res.json({ ok: true, data: rows });
    }
  );
});

/** GET /api/student/results?semester=4 */
router.get('/results', guard, (req, res) => {
  const sid = req.user.id;
  const sem = req.query.semester || 4;
  db.all(
    `SELECT m.*, s.name as subject_name, s.code, s.credits
     FROM marks m JOIN subjects s ON m.subject_id = s.id
     WHERE m.student_id = ? AND m.semester = ?`,
    [sid, sem],
    (err, rows) => {
      if (err) return res.status(500).json({ ok: false, msg: err.message });
      res.json({ ok: true, data: rows });
    }
  );
});

/** GET /api/student/fees */
router.get('/fees', guard, (req, res) => {
  const sid = req.user.id;
  db.all('SELECT * FROM fees WHERE student_id = ? ORDER BY due_date DESC', [sid], (err, rows) => {
    if (err) return res.status(500).json({ ok: false, msg: err.message });
    res.json({ ok: true, data: rows });
  });
});

/** POST /api/student/fees/pay — mock Razorpay */
router.post('/fees/pay', guard, (req, res) => {
  const { fee_id } = req.body;
  const receipt_no = `RCT-${Date.now()}`;
  db.run(
    `UPDATE fees SET status='paid', paid_date=date('now'), receipt_no=?, payment_method='razorpay', transaction_id=? WHERE id=?`,
    [receipt_no, `rzp_${Date.now()}`, fee_id],
    function(err) {
      if (err) return res.status(500).json({ ok: false, msg: err.message });
      emitAdminRealtime('fee_paid', {
        student_id: req.user.id,
        fee_id,
        receipt_no,
      });
      res.json({ ok: true, msg: 'Payment successful!', data: { receipt_no } });
    }
  );
});

/** GET /api/student/timetable */
router.get('/timetable', guard, (req, res) => {
  // Static timetable data (would be DB-driven in production)
  const timetable = {
    Monday:    [{ time:'8-9',   sub:'Oral Surgery',       room:'OT-1'  },{ time:'9-10',  sub:'Conservative',    room:'Lab-2' },{ time:'10-11', sub:'Break', room:'' },{ time:'11-13', sub:'Clinical Posting',room:'OPD'  }],
    Tuesday:   [{ time:'8-9',   sub:'Orthodontics',       room:'LH-1'  },{ time:'9-10',  sub:'Prosthodontics',  room:'Lab-3' },{ time:'10-11', sub:'Break', room:'' },{ time:'11-13', sub:'Clinical Posting',room:'OPD'  }],
    Wednesday: [{ time:'8-9',   sub:'Oral Pathology',     room:'LH-2'  },{ time:'9-10',  sub:'Periodontology',  room:'Lab-1' },{ time:'10-11', sub:'Break', room:'' },{ time:'11-13', sub:'Clinical Posting',room:'OPD'  }],
    Thursday:  [{ time:'8-9',   sub:'Conservative',       room:'LH-1'  },{ time:'9-10',  sub:'Oral Surgery',    room:'OT-1'  },{ time:'10-11', sub:'Break', room:'' },{ time:'11-13', sub:'Clinical Posting',room:'OPD'  }],
    Friday:    [{ time:'8-9',   sub:'Prosthodontics',     room:'Lab-3' },{ time:'9-10',  sub:'Orthodontics',    room:'LH-2'  },{ time:'10-11', sub:'Break', room:'' },{ time:'11-13', sub:'Seminar / Journal Club',room:'LH-3'}],
    Saturday:  [{ time:'8-9',   sub:'Community Camp / PHD',room:'PHD'  },{ time:'9-11',  sub:'Skills Lab',      room:'Sim-Lab'},{ time:'11-12', sub:'Tutorial',room:'LH-1'    }],
  };
  res.json({ ok: true, data: timetable });
});

/** GET /api/student/syllabus?year=3&semester=5 */
router.get('/syllabus', guard, (req, res) => {
  const { year = 3, semester = 5 } = req.query;
  db.all('SELECT * FROM subjects WHERE year = ? AND semester = ?', [year, semester], (err, rows) => {
    if (err) return res.status(500).json({ ok: false, msg: err.message });
    res.json({ ok: true, data: rows });
  });
});

/** POST /api/student/complaints */
router.post('/complaints', guard, validate(complaintRules), (req, res) => {
  const { room_no, category, description, urgency } = req.body;
  const id = genComplaintId();
  db.run(
    `INSERT INTO hostel_complaints (id,student_id,room_no,category,description,urgency,status) VALUES (?,?,?,?,?,?,?)`,
    [id, req.user.id, room_no, category, description, urgency || 'medium', 'pending'],
    function(err) {
      if (err) return res.status(500).json({ ok: false, msg: err.message });
      emitAdminRealtime('hostel_complaint', {
        id,
        student_id: req.user.id,
        room_no,
        category,
        urgency: urgency || 'medium',
      });
      res.json({ ok: true, msg: 'Complaint submitted.', data: { id } });
    }
  );
});

/** GET /api/student/complaints */
router.get('/complaints', guard, (req, res) => {
  db.all(
    'SELECT * FROM hostel_complaints WHERE student_id = ? ORDER BY created_at DESC',
    [req.user.id],
    (err, rows) => {
      if (err) return res.status(500).json({ ok: false, msg: err.message });
      res.json({ ok: true, data: rows });
    }
  );
});

module.exports = router;
