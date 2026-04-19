const crypto = require("crypto");

function json(res, status, payload) {
  res.status(status).setHeader("Content-Type", "application/json");
  res.send(JSON.stringify(payload));
}

function readJsonBody(req) {
  if (req.body && typeof req.body === "object") return req.body;
  if (!req.body || typeof req.body !== "string") return {};
  try {
    return JSON.parse(req.body);
  } catch {
    return {};
  }
}

function env(name, fallback = "") {
  return process.env[name] || fallback;
}

function supabaseBaseUrl() {
  const raw = env("SUPABASE_URL");
  if (!raw) return "";
  if (raw.includes("supabase.co") && raw.includes("/dashboard/")) {
    const ref = raw.split("/").pop();
    return `https://${ref}.supabase.co`;
  }
  return raw.replace(/\/+$/, "");
}

async function supabase(path, options = {}) {
  const base = supabaseBaseUrl();
  const key = env("SUPABASE_SERVICE_ROLE_KEY");
  if (!base || !key) throw new Error("Supabase server env missing.");
  const url = `${base}/rest/v1/${path}`;
  const headers = Object.assign(
    {
      apikey: key,
      Authorization: `Bearer ${key}`,
      "Content-Type": "application/json",
      Prefer: "return=representation",
    },
    options.headers || {}
  );
  const response = await fetch(url, Object.assign({}, options, { headers }));
  const data = await response.json().catch(() => null);
  if (!response.ok) {
    const message = data && data.message ? data.message : `Supabase request failed (${response.status})`;
    throw new Error(message);
  }
  return data;
}

const DOCTORS = {
  DR001: { password: env("DR001_PASSWORD", "DR001"), doctor: "Dr. Priya Sharma", department: "Orthodontics" },
  DR002: { password: env("DR002_PASSWORD", "DR002"), doctor: "Dr. Arvind Menon", department: "Oral Surgery" },
  DR003: { password: env("DR003_PASSWORD", "DR003"), doctor: "Dr. Sunita Rao", department: "Pedodontics" },
};

function secret() {
  return env("DOCTOR_SESSION_SECRET", "rrdch-doctor-secret");
}

function signSession(payload) {
  const body = Buffer.from(JSON.stringify(payload), "utf8").toString("base64url");
  const sig = crypto.createHmac("sha256", secret()).update(body).digest("base64url");
  return `${body}.${sig}`;
}

function verifySession(token) {
  if (!token || !token.includes(".")) return null;
  const [body, sig] = token.split(".");
  const expected = crypto.createHmac("sha256", secret()).update(body).digest("base64url");
  if (sig !== expected) return null;
  try {
    const payload = JSON.parse(Buffer.from(body, "base64url").toString("utf8"));
    if (!payload.exp || Date.now() > payload.exp) return null;
    return payload;
  } catch {
    return null;
  }
}

function parseAuth(req) {
  const auth = req.headers.authorization || "";
  const token = auth.startsWith("Bearer ") ? auth.slice(7) : "";
  return verifySession(token);
}

module.exports = {
  json,
  env,
  readJsonBody,
  supabase,
  DOCTORS,
  signSession,
  parseAuth,
};
