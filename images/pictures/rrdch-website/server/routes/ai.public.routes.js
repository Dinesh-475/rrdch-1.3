/**
 * Public AI routes — Gemini proxied server-side (no API key to browser).
 */
const router = require('express').Router();
const { guideChat, symptomChat } = require('../utils/gemini');

function parseBody(req) {
  const { messages, pageContext } = req.body || {};
  return { messages, pageContext };
}

router.post('/guide', async (req, res) => {
  try {
    const { messages, pageContext } = parseBody(req);
    const text = await guideChat({ messages, pageContext });
    res.json({ ok: true, text });
  } catch (e) {
    console.error('[ai/guide]', e.message);
    res.status(e.status || 500).json({ ok: false, msg: e.message || 'AI error' });
  }
});

router.post('/symptom', async (req, res) => {
  try {
    const { messages } = parseBody(req);
    const text = await symptomChat({ messages });
    res.json({ ok: true, text });
  } catch (e) {
    console.error('[ai/symptom]', e.message);
    res.status(e.status || 500).json({ ok: false, msg: e.message || 'AI error' });
  }
});

module.exports = router;
