/**
 * RRDCH — feedback.routes.js
 * POST /api/feedback — submit feedback (public)
 */
const router = require('express').Router();
const db     = require('../database');
const { emitAdminRealtime } = require('../utils/socketHandlers');

/** POST /api/feedback */
router.post('/', (req, res) => {
  const { user_id, feedback_type, dept_id, ratings_json, comment } = req.body;
  if (!feedback_type) return res.status(400).json({ ok: false, msg: 'feedback_type required.' });
  db.run(
    'INSERT INTO feedback (user_id,feedback_type,dept_id,ratings_json,comment) VALUES (?,?,?,?,?)',
    [user_id, feedback_type, dept_id, JSON.stringify(ratings_json), comment],
    function(err) {
      if (err) return res.status(500).json({ ok: false, msg: err.message });
      emitAdminRealtime('feedback_submitted', {
        id: this.lastID,
        feedback_type,
      });
      res.json({ ok: true, msg: 'Thank you! Your feedback has been submitted.' });
    }
  );
});

module.exports = router;
