const { json, parseAuth, readJsonBody, supabase } = require("../_lib/core");

async function fetchDeptVisits(department) {
  return supabase(
    `opd_visits?department=eq.${encodeURIComponent(department)}&order=scheduled_at.asc`,
    { method: "GET", headers: { Prefer: undefined } }
  );
}

async function updateQueueSummary(department, doctorName, avgTreatTime, visits) {
  const waiting = visits.filter((v) => v.status === "waiting").length;
  const ongoing = visits.find((v) => v.status === "ongoing");
  const currentToken = ongoing ? ongoing.token : (visits[0] ? visits[0].token : null);
  const est = waiting * (Number(avgTreatTime) || 8);

  await supabase(
    `opd_queue?department=eq.${encodeURIComponent(department)}`,
    {
      method: "PATCH",
      body: JSON.stringify({
        doctor_name: doctorName,
        current_token: currentToken,
        total_waiting: waiting,
        est_wait_minutes: est,
        status: "open",
        updated_at: new Date().toISOString(),
      }),
    }
  );
}

module.exports = async function handler(req, res) {
  if (req.method !== "POST") return json(res, 405, { ok: false, msg: "Method not allowed." });
  const auth = parseAuth(req);
  if (!auth) return json(res, 401, { ok: false, msg: "Unauthorized." });
  const body = readJsonBody(req);
  const action = String(body.action || "");

  try {
    let visits = await fetchDeptVisits(auth.department);

    if (action === "next") {
      const ongoing = visits.find((v) => v.status === "ongoing");
      if (ongoing) {
        await supabase(`opd_visits?id=eq.${ongoing.id}`, {
          method: "PATCH",
          body: JSON.stringify({ status: "waiting", updated_at: new Date().toISOString() }),
        });
      }
      visits = await fetchDeptVisits(auth.department);
      const next = visits.find((v) => v.status === "waiting");
      if (next) {
        await supabase(`opd_visits?id=eq.${next.id}`, {
          method: "PATCH",
          body: JSON.stringify({ status: "ongoing", updated_at: new Date().toISOString() }),
        });
      }
    } else if (action === "complete") {
      const ongoing = visits.find((v) => v.status === "ongoing");
      if (ongoing) {
        await supabase(`opd_visits?id=eq.${ongoing.id}`, {
          method: "PATCH",
          body: JSON.stringify({ status: "completed", updated_at: new Date().toISOString() }),
        });
      }
      visits = await fetchDeptVisits(auth.department);
      const next = visits.find((v) => v.status === "waiting");
      if (next) {
        await supabase(`opd_visits?id=eq.${next.id}`, {
          method: "PATCH",
          body: JSON.stringify({ status: "ongoing", updated_at: new Date().toISOString() }),
        });
      }
    } else if (action === "saveNotes") {
      const visitId = Number(body.visitId || 0);
      const notes = String(body.notes || "");
      if (!visitId) return json(res, 400, { ok: false, msg: "visitId is required for saveNotes." });
      await supabase(`opd_visits?id=eq.${visitId}`, {
        method: "PATCH",
        body: JSON.stringify({ notes, updated_at: new Date().toISOString() }),
      });
    } else if (action === "updateAvgTreatTime") {
      // handled in summary calc only
    } else {
      return json(res, 400, { ok: false, msg: "Unsupported action." });
    }

    visits = await fetchDeptVisits(auth.department);
    await updateQueueSummary(auth.department, auth.doctor, body.avgTreatTime, visits);
    const waiting = visits.filter((v) => v.status === "waiting").length;
    const completed = visits.filter((v) => v.status === "completed").length;
    const ongoing = visits.find((v) => v.status === "ongoing") || null;

    return json(res, 200, {
      ok: true,
      data: {
        visits,
        summary: {
          nowServing: ongoing ? ongoing.token : null,
          waiting,
          completed,
          total: visits.length,
          avgTreatTime: Number(body.avgTreatTime) || 8,
        },
      },
    });
  } catch (error) {
    return json(res, 500, { ok: false, msg: error.message || "Queue action failed." });
  }
};
