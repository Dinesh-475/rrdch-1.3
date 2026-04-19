// Shared AI helpers backed by /api/gemini.
(function initRRDCHAi() {
  function geminiEndpoint() {
    if (window.RRDCH_BACKEND && window.RRDCH_BACKEND.API_BASE) {
      return String(window.RRDCH_BACKEND.API_BASE).replace(/\/$/, "") + "/gemini";
    }
    const isLocal =
      !window.location.hostname ||
      window.location.hostname === "localhost" ||
      window.location.hostname === "127.0.0.1" ||
      window.location.protocol === "file:";
    const origin = isLocal ? "http://localhost:3000" : "";
    return origin + "/api/gemini";
  }

  function isConfigured() {
    return true;
  }

  async function request(mode, input) {
    const res = await fetch(geminiEndpoint(), {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ mode, input }),
    });
    const data = await res.json();
    if (!res.ok || data.ok === false) {
      throw new Error(data.msg || "AI request failed.");
    }
    return data;
  }

  async function askText(systemPrompt, history) {
    const last = history?.[history.length - 1]?.parts?.[0]?.text || "";
    const ctx = window.RRDCH_SITE_CONTEXT || "";
    const merged = `${systemPrompt}\n\nInstitutional context (use for factual answers; do not contradict):\n${ctx}\n\nUser question: ${last}`;
    const data = await request("site-assistant", merged);
    return String(data.data?.text || "I could not generate a response right now.").trim();
  }

  async function askJson(promptText) {
    const data = await request("symptom-checker", promptText);
    return data.data || {};
  }

  window.RRDCH_AI = {
    isConfigured,
    askText,
    askJson,
  };
})();
