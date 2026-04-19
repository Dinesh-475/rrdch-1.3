const { json, readJsonBody, supabase } = require("./_lib/core");

module.exports = async function handler(req, res) {
  if (req.method !== "POST") return json(res, 405, { ok: false, msg: "Method not allowed." });
  const body = readJsonBody(req);
  const name = String(body.name || "").trim();
  const email = String(body.email || "").trim();
  const subject = String(body.subject || "general").trim();
  const message = String(body.message || "").trim();
  const phone = String(body.phone || "").trim();

  if (!name || !email || !subject || !message) {
    return json(res, 400, { ok: false, msg: "name, email, subject, message are required." });
  }
  if (message.length < 10) {
    return json(res, 400, { ok: false, msg: "Message must be at least 10 characters." });
  }

  try {
    const inserted = await supabase("contact_enquiries", {
      method: "POST",
      body: JSON.stringify([{
        name,
        email,
        phone: phone || null,
        subject,
        message,
        created_at: new Date().toISOString(),
      }]),
    });
    return json(res, 200, { ok: true, data: { id: inserted?.[0]?.id || null } });
  } catch (error) {
    return json(res, 500, { ok: false, msg: error.message || "Failed to submit enquiry." });
  }
};

