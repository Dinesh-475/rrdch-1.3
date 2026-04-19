const { json, readJsonBody, supabase } = require("./_lib/core");

module.exports = async function handler(req, res) {
  if (req.method !== "POST") return json(res, 405, { ok: false, msg: "Method not allowed." });
  const body = readJsonBody(req);
  const name = String(body.name || "").trim();
  const phone = String(body.phone || "").trim();
  const email = String(body.email || "").trim();
  const course = String(body.course || "").trim();
  const query = String(body.query || "").trim();

  if (!name || !phone || !email || !course || !query) {
    return json(res, 400, { ok: false, msg: "All fields are required." });
  }
  if (!/^\d{10}$/.test(phone)) {
    return json(res, 400, { ok: false, msg: "Phone must be a 10-digit number." });
  }

  try {
    const inserted = await supabase("admission_enquiries", {
      method: "POST",
      body: JSON.stringify([{
        name,
        phone,
        email,
        course,
        query,
        status: "new",
        created_at: new Date().toISOString(),
      }]),
    });
    return json(res, 200, { ok: true, data: { id: inserted?.[0]?.id || null } });
  } catch (error) {
    return json(res, 500, { ok: false, msg: error.message || "Failed to submit admission enquiry." });
  }
};

