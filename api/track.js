const { json, readJsonBody, supabase } = require("./_lib/core");

module.exports = async function handler(req, res) {
  if (req.method !== "POST") return json(res, 405, { ok: false, msg: "Method not allowed." });
  const body = readJsonBody(req);
  const token = String(body.token || "").trim();
  const phone = String(body.phone || "").trim();
  if (!token && !phone) return json(res, 400, { ok: false, msg: "token or phone is required." });

  try {
    let path = "opd_visits?select=token,department,patient_name,phone,status,scheduled_at,notes&order=scheduled_at.desc&limit=1";
    if (token) path += `&token=eq.${encodeURIComponent(token)}`;
    if (!token && phone) path += `&phone=eq.${encodeURIComponent(phone)}`;
    const rows = await supabase(path, { method: "GET", headers: { Prefer: undefined } });
    if (!rows.length) return json(res, 404, { ok: false, msg: "No visit found." });
    return json(res, 200, { ok: true, data: rows[0] });
  } catch (error) {
    return json(res, 500, { ok: false, msg: error.message || "Tracking failed." });
  }
};
