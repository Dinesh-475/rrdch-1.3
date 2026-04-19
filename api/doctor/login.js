const { json, readJsonBody, DOCTORS, signSession } = require("../_lib/core");

module.exports = async function handler(req, res) {
  if (req.method !== "POST") return json(res, 405, { ok: false, msg: "Method not allowed." });
  const body = readJsonBody(req);
  const doctorId = String(body.doctorId || "").toUpperCase();
  const password = String(body.password || "");
  const doc = DOCTORS[doctorId];
  if (!doc || password !== doc.password) {
    return json(res, 401, { ok: false, msg: "Invalid doctor credentials." });
  }
  const payload = {
    doctorId,
    doctor: doc.doctor,
    department: doc.department,
    exp: Date.now() + 12 * 60 * 60 * 1000,
  };
  const token = signSession(payload);
  return json(res, 200, { ok: true, data: { token, doctor: doc.doctor, department: doc.department } });
};
