// ai.js — RRDCH AI chatbot using Gemini REST API directly (no server needed)
(function initRRDCHAi() {
  const GEMINI_KEY = 'AIzaSyBhCpDnWo8u_GdHfu7ermBLbnABuOJVA4U';
  const GEMINI_URL = `https://generativelanguage.googleapis.com/v1beta/models/gemini-1.5-flash:generateContent?key=${GEMINI_KEY}`;

  function isConfigured() { return true; }

  async function callGemini(promptText) {
    try {
      const res = await fetch(GEMINI_URL, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ contents: [{ parts: [{ text: promptText }] }] })
      });
      const data = await res.json();
      const text = data?.candidates?.[0]?.content?.parts?.[0]?.text;
      if (!text) throw new Error('Empty response from Gemini');
      return text;
    } catch (e) {
      console.warn('[RRDCH AI] Gemini API error:', e);
      throw new Error('AI request failed. Please try again.');
    }
  }

  async function askText(systemPrompt, history) {
    const last = history?.[history.length - 1]?.parts?.[0]?.text || '';
    const ctx = window.RRDCH_SITE_CONTEXT ? window.RRDCH_SITE_CONTEXT.join ? window.RRDCH_SITE_CONTEXT.join('\n') : String(window.RRDCH_SITE_CONTEXT) : '';
    const merged = `${systemPrompt}\n\nInstitutional context (RRDCH Bangalore — use for factual answers):\n${ctx}\n\nUser question: ${last}`;
    const text = await callGemini(merged);
    // Log to Supabase if available
    if (window.sb) {
      try { await window.sb.from('chatbot_sessions').insert({ query: last, response: text, mode: 'site-assistant', urgency: 'Routine', created_at: new Date().toISOString() }); } catch (_) {}
    }
    return text.trim();
  }

  async function askJson(promptText) {
    const sysPrompt = `You are a dental triage assistant for RRDCH Bangalore. Analyze the patient's symptoms and respond ONLY with a JSON object in this exact format:
{
  "urgency": "Routine" | "Soon" | "Urgent" | "Emergency",
  "department": "Department Name",
  "advice": "Brief patient-friendly advice",
  "selfCare": ["tip1", "tip2"]
}
Patient symptoms: ${promptText}`;
    const text = await callGemini(sysPrompt);
    // Extract JSON from response
    const match = text.match(/\{[\s\S]*\}/);
    if (match) {
      try {
        const parsed = JSON.parse(match[0]);
        // Log to Supabase
        if (window.sb) {
          try { await window.sb.from('chatbot_sessions').insert({ query: promptText, mode: 'symptom-checker', urgency: parsed.urgency || 'Routine', department: parsed.department || '', created_at: new Date().toISOString() }); } catch (_) {}
        }
        return parsed;
      } catch (_) {}
    }
    return { urgency: 'Routine', department: 'General Dentistry', advice: text, selfCare: [] };
  }

  window.RRDCH_AI = {
    isConfigured,
    askText,
    askJson,
    callGemini,
  };
})();
