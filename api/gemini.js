const { json, env, readJsonBody } = require("./_lib/core");

module.exports = async function handler(req, res) {
  if (req.method !== "POST") return json(res, 405, { ok: false, msg: "Method not allowed." });

  const key = env("GEMINI_API_KEY");
  if (!key) return json(res, 500, { ok: false, msg: "Gemini key is not configured on server." });

  const body = readJsonBody(req);
  const mode = body.mode;
  const input = String(body.input || "").trim();
  if (!mode || !input) return json(res, 400, { ok: false, msg: "mode and input are required." });

  let prompt = "";
  if (mode === "symptom-checker") {
    prompt =
      "You are a dental triage assistant for RRDCH hospital in Bangalore. " +
      "A patient describes their problem: " + input + ". " +
      "Respond ONLY with valid raw JSON having exact keys: " +
      "condition (string), department (string), urgency (Routine|Soon|Urgent|Emergency), advice (string).";
  } else if (mode === "site-assistant") {
    prompt =
      "You are the official AI assistant for Rajarajeshwari Dental College and Hospital (RRDCH). " +
      "Use plain text only, no markdown, no HTML. Keep responses concise and factual. " +
      "Question: " + input;
  } else {
    return json(res, 400, { ok: false, msg: "Unsupported mode." });
  }

  try {
    const geminiUrl =
      "https://generativelanguage.googleapis.com/v1beta/models/gemini-1.5-flash:generateContent?key=" +
      encodeURIComponent(key);
    const response = await fetch(geminiUrl, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ contents: [{ parts: [{ text: prompt }] }] }),
    });
    const data = await response.json();
    if (!response.ok || data.error) {
      throw new Error(data?.error?.message || "Gemini API failed.");
    }

    let text = data?.candidates?.[0]?.content?.parts?.[0]?.text || "";
    text = String(text).replace(/```json/gi, "").replace(/```/g, "").trim();

    if (mode === "symptom-checker") {
      const parsed = JSON.parse(text);
      const out = {
        condition: String(parsed.condition || ""),
        department: String(parsed.department || ""),
        urgency: String(parsed.urgency || "Routine"),
        advice: String(parsed.advice || ""),
      };
      if (!out.condition || !out.department || !out.advice) {
        throw new Error("Malformed symptom-checker response from model.");
      }
      return json(res, 200, { ok: true, data: out });
    }
    const plainText = text.replace(/<[^>]+>/g, "").replace(/\*\*/g, "").trim();
    return json(res, 200, { ok: true, data: { text: plainText } });
  } catch (error) {
    return json(res, 500, { ok: false, msg: error.message || "AI request failed." });
  }
};
