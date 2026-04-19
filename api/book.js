const { json, readJsonBody, supabase } = require("./_lib/core");

function makeToken() {
  const n = Math.floor(Math.random() * 900) + 100;
  return `A-${n}`;
}

async function refreshQueueSummary(department, doctorName = "Doctor", avg = 8) {
  const visits = await supabase(
    `opd_visits?department=eq.${encodeURIComponent(department)}&order=scheduled_at.asc`,
    { method: "GET", headers: { Prefer: undefined } }
  );
  const waiting = visits.filter((v) => v.status === "waiting").length;
  const ongoing = visits.find((v) => v.status === "ongoing");
  const current = ongoing ? ongoing.token : (visits[0] ? visits[0].token : null);

  await supabase(`opd_queue?department=eq.${encodeURIComponent(department)}`, {
    method: "PATCH",
    body: JSON.stringify({
      department,
      doctor_name: doctorName,
      current_token: current,
      total_waiting: waiting,
      est_wait_minutes: waiting * avg,
      status: "open",
      updated_at: new Date().toISOString(),
    }),
  }).catch(async () => {
    await supabase("opd_queue", {
      method: "POST",
      body: JSON.stringify([{
        department,
        doctor_name: doctorName,
        current_token: current,
        total_waiting: waiting,
        est_wait_minutes: waiting * avg,
        status: "open",
      }]),
    });
  });
}

module.exports = async function handler(req, res) {
  if (req.method !== "POST") return json(res, 405, { ok: false, msg: "Method not allowed." });
  const body = readJsonBody(req);
  const patientName = String(body.patientName || "").trim();
  const department = String(body.department || "").trim();
  const doctor = String(body.doctor || "Doctor").trim();
  const date = String(body.date || "").trim();
  const time = String(body.time || "").trim();
  const reason = String(body.reason || "").trim();
  const phone = String(body.phone || "").trim();
  if (!patientName || !department || !date || !time) {
    return json(res, 400, { ok: false, msg: "patientName, department, date and time are required." });
  }

  try {
    const token = makeToken();
    const row = await supabase("opd_visits", {
      method: "POST",
      body: JSON.stringify([{
        token,
        department,
        patient_name: patientName,
        phone,
        reason,
        status: "waiting",
        scheduled_at: `${date}T00:00:00.000Z`,
      }]),
    });

    await refreshQueueSummary(department, doctor);

    const appointment = {
      token,
      patientName,
      department,
      doctor,
      date,
      time,
      reason,
    };
    return json(res, 200, { ok: true, data: { appointment, visit: row?.[0] || null } });
  } catch (error) {
    return json(res, 500, { ok: false, msg: error.message || "Booking failed." });
  }
};
