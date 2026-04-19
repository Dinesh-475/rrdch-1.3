/**
 * Anonymous usage telemetry (page views, tracked clicks, optional geo).
 */
const router = require('express').Router();
const db = require('../database');

router.post('/', (req, res) => {
  const { sessionId, path, events, geo } = req.body || {};
  if (!sessionId || typeof sessionId !== 'string' || sessionId.length > 120) {
    return res.status(400).json({ ok: false, msg: 'sessionId required' });
  }
  if (!Array.isArray(events) || events.length === 0) {
    return res.status(400).json({ ok: false, msg: 'events required' });
  }
  const batch = events.slice(0, 48);
  const ua = (req.get('user-agent') || '').slice(0, 400);
  const ip = (req.ip || '').slice(0, 64);
  const p = typeof path === 'string' ? path.slice(0, 500) : '';
  const lat = geo && typeof geo.lat === 'number' ? geo.lat : null;
  const lng = geo && typeof geo.lng === 'number' ? geo.lng : null;

  let pending = batch.length;
  let failed = false;

  const done = (err) => {
    if (err) failed = true;
    pending -= 1;
    if (pending === 0) {
      if (failed) return res.status(500).json({ ok: false, msg: 'Store error' });
      res.json({ ok: true, received: batch.length });
    }
  };

  batch.forEach((ev) => {
    const type = typeof ev.type === 'string' ? ev.type.slice(0, 64) : 'event';
    const target = ev.target != null ? String(ev.target).slice(0, 200) : null;
    let metaJson = null;
    try {
      metaJson = JSON.stringify(ev.meta && typeof ev.meta === 'object' ? ev.meta : {});
    } catch {
      metaJson = '{}';
    }
    db.run(
      `INSERT INTO traffic_events (session_id, path, event_type, target, meta_json, lat, lng, user_agent, ip)
       VALUES (?,?,?,?,?,?,?,?,?)`,
      [sessionId, p, type, target, metaJson, lat, lng, ua, ip],
      done
    );
  });
});

module.exports = router;
