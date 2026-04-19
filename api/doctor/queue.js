const { json, parseAuth, supabase } = require("../_lib/core");

module.exports = async function handler(req, res) {
  if (req.method !== "GET") return json(res, 405, { ok: false, msg: "Method not allowed." });
  const auth = parseAuth(req);
  if (!auth) return json(res, 401, { ok: false, msg: "Unauthorized." });

  try {
    const dept = encodeURIComponent(auth.department);
    const visits = await supabase(
      `opd_visits?department=eq.${dept}&order=scheduled_at.asc`,
      { method: "GET", headers: { Prefer: undefined } }
    );
    const waiting = visits.filter((v) => v.status === "waiting").length;
    const completed = visits.filter((v) => v.status === "completed").length;
    const ongoing = visits.find((v) => v.status === "ongoing") || null;
    return json(res, 200, {
      ok: true,
      data: {
        department: auth.department,
        doctor: auth.doctor,
        visits,
        summary: {
          nowServing: ongoing ? ongoing.token : null,
          waiting,
          completed,
          total: visits.length,
        },
      },
    });
  } catch (error) {
    return json(res, 500, { ok: false, msg: error.message || "Queue load failed." });
  }
};
