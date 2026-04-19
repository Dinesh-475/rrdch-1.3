// Lightweight backend connector for static pages.
(function initRRDCHBackend() {
  const isLocal = !window.location.hostname || window.location.hostname === "localhost" || window.location.hostname === "127.0.0.1" || window.location.protocol === "file:";
  const API_BASE = isLocal
    ? "http://localhost:3000/api"
    : "/api";
  const TOKEN_KEY = "rrdch_token";
  const DOCTOR_SESSION_KEY = "rrdch_doctor_session";

  function getToken() {
    return localStorage.getItem(TOKEN_KEY) || "";
  }

  function setToken(token) {
    if (token) localStorage.setItem(TOKEN_KEY, token);
  }

  function getDoctorSession() {
    return localStorage.getItem(DOCTOR_SESSION_KEY) || "";
  }

  function setDoctorSession(token) {
    if (token) localStorage.setItem(DOCTOR_SESSION_KEY, token);
  }

  async function request(path, options = {}) {
    const headers = Object.assign({ "Content-Type": "application/json" }, options.headers || {});
    const token = getToken();
    if (token) headers.Authorization = "Bearer " + token;
    const res = await fetch(API_BASE + path, Object.assign({}, options, { headers }));
    const data = await res.json().catch(function() { return { ok: false, msg: "Invalid server response." }; });
    if (!res.ok || data.ok === false) {
      throw new Error(data.msg || "Request failed.");
    }
    return data;
  }

  function normalizeDeptName(name) {
    const key = (name || "").toLowerCase();
    if (key.includes("oral surgery")) return "Oral & Maxillofacial Surgery";
    if (key.includes("orthodontics")) return "Orthodontics & Dentofacial Orthopedics";
    if (key.includes("periodontology")) return "Periodontology";
    if (key.includes("conservative")) return "Conservative Dentistry & Endodontics";
    if (key.includes("general")) return "Public Health Dentistry";
    return name || "";
  }

  let cachedDepartments = null;
  async function getDepartments() {
    if (cachedDepartments) return cachedDepartments;
    try {
      const res = await request("/public/departments", { method: "GET" });
      cachedDepartments = res.data || [];
    } catch (e) {
      // Static fallback for pure-static mode.
      cachedDepartments = [
        { id: 1, name: "Oral Surgery" },
        { id: 2, name: "Orthodontics" },
        { id: 3, name: "General Dentistry" },
        { id: 4, name: "Periodontology" },
        { id: 5, name: "Conservative Dentistry & Endodontics" },
        { id: 6, name: "Pedodontics" },
        { id: 7, name: "Implantology" }
      ];
    }
    return cachedDepartments;
  }

  async function getDeptIdByName(name) {
    const departments = await getDepartments();
    const normalized = normalizeDeptName(name);
    const match = departments.find(function(d) {
      const n = (d.name || "").toLowerCase();
      return n.includes(normalized.toLowerCase()) || normalized.toLowerCase().includes(n);
    });
    return match ? match.id : null;
  }

  async function doctorRequest(path, options = {}) {
    const headers = Object.assign({ "Content-Type": "application/json" }, options.headers || {});
    const session = getDoctorSession();
    if (session) headers.Authorization = "Bearer " + session;
    const res = await fetch("/api/doctor/" + path, Object.assign({}, options, { headers }));
    const data = await res.json().catch(function() { return { ok: false, msg: "Invalid server response." }; });
    if (!res.ok || data.ok === false) throw new Error(data.msg || "Doctor request failed.");
    return data;
  }

  async function doctorLogin(doctorId, password) {
    const data = await doctorRequest("login", {
      method: "POST",
      body: JSON.stringify({ doctorId, password }),
      headers: {}, // no bearer required for login
    });
    if (data?.data?.token) setDoctorSession(data.data.token);
    return data;
  }

  async function trackVisit(payload) {
    const res = await fetch("/api/track", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(payload || {}),
    });
    const data = await res.json().catch(function() { return { ok: false, msg: "Invalid server response." }; });
    if (!res.ok || data.ok === false) throw new Error(data.msg || "Tracking failed.");
    return data;
  }

  window.RRDCH_BACKEND = {
    API_BASE,
    request,
    getToken,
    setToken,
    getDoctorSession,
    setDoctorSession,
    getDepartments,
    getDeptIdByName,
    doctorRequest,
    doctorLogin,
    trackVisit,
  };
})();
