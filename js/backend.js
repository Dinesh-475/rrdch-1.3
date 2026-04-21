// backend.js — RRDCH Supabase-direct connector (no Node server required)
(function initRRDCHBackend() {
  const SUPABASE_URL = 'https://hbalflsjvtovtmmypdvv.supabase.co';
  const SUPABASE_KEY = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImhiYWxmbHNqdnRvdnRtbXlwZHZ2Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3NzY1MDc1OTcsImV4cCI6MjA5MjA4MzU5N30.iq60dhhWA8oqwNHQr6R4hvnCDKNBZ-sP-1A2PXxkkRU';
  const TOKEN_KEY = 'rrdch_token';
  const DOCTOR_SESSION_KEY = 'rrdch_doctor_session';

  // No localhost server. API_BASE kept for backwards compat but unused.
  const API_BASE = SUPABASE_URL;

  function getToken() { return localStorage.getItem(TOKEN_KEY) || ''; }
  function setToken(token) { if (token) localStorage.setItem(TOKEN_KEY, token); }
  function getDoctorSession() { return localStorage.getItem(DOCTOR_SESSION_KEY) || ''; }
  function setDoctorSession(token) { if (token) localStorage.setItem(DOCTOR_SESSION_KEY, token); }

  // Generic Supabase REST helper
  async function supabaseRequest(table, options = {}) {
    const method = options.method || 'GET';
    const url = `${SUPABASE_URL}/rest/v1/${table}${options.query || ''}`;
    const headers = {
      'apikey': SUPABASE_KEY,
      'Authorization': 'Bearer ' + SUPABASE_KEY,
      'Content-Type': 'application/json',
      'Prefer': options.prefer || 'return=representation'
    };
    try {
      const res = await fetch(url, { method, headers, body: options.body });
      if (!res.ok) return { ok: false, data: null };
      const data = await res.json().catch(() => ({}));
      return { ok: true, data };
    } catch (e) {
      console.warn('[RRDCH] Supabase request failed:', e);
      return { ok: false, data: null };
    }
  }

  // Backwards-compat request stub (won't 404 — just returns fallback)
  async function request(path, options = {}) {
    console.warn('[RRDCH] backend.request() called for', path, '— using Supabase directly instead.');
    return { ok: true, data: [] };
  }

  // Doctor login via Supabase
  async function doctorLogin(email, password) {
    if (window.sb) {
      try {
        const { data, error } = await window.sb.auth.signInWithPassword({ email, password });
        if (!error && data.user) {
          setDoctorSession(data.session?.access_token || 'demo-token');
          return { ok: true, data: { token: data.session?.access_token } };
        }
      } catch (e) {}
    }
    // Demo fallback
    if (email === 'doctor@rrdch.in' && password === 'doctor123') {
      setDoctorSession('demo-token');
      return { ok: true, data: { token: 'demo-token' } };
    }
    throw new Error('Invalid credentials.');
  }

  // No-op track (was calling /api/track)
  async function trackVisit(payload) {
    if (window.sb) {
      try { await window.sb.from('admin_audit_log').insert({ action: 'page_visit', ...payload }); } catch (_) {}
    }
    return { ok: true };
  }

  // Doctor request (was calling /api/doctor/:path)
  async function doctorRequest(path, options = {}) {
    // Route to Supabase equivalents
    if (path === 'login') return doctorLogin(options._email, options._password);
    return { ok: true, data: [] };
  }

  function normalizeDeptName(name) {
    const key = (name || '').toLowerCase();
    if (key.includes('oral surgery')) return 'Oral & Maxillofacial Surgery';
    if (key.includes('orthodontics')) return 'Orthodontics & Dentofacial Orthopedics';
    if (key.includes('periodontology')) return 'Periodontology';
    if (key.includes('conservative')) return 'Conservative Dentistry & Endodontics';
    if (key.includes('general')) return 'Public Health Dentistry';
    return name || '';
  }

  let cachedDepartments = null;
  async function getDepartments() {
    if (cachedDepartments) return cachedDepartments;
    // Try Supabase first
    const res = await supabaseRequest('opd_queue', { query: '?select=department', method: 'GET' });
    if (res.ok && res.data && res.data.length > 0) {
      cachedDepartments = [...new Set(res.data.map(r => r.department).filter(Boolean))].map((n, i) => ({ id: i + 1, name: n }));
    } else {
      cachedDepartments = [
        { id: 1, name: 'Oral Surgery' },
        { id: 2, name: 'Orthodontics' },
        { id: 3, name: 'General Dentistry' },
        { id: 4, name: 'Periodontology' },
        { id: 5, name: 'Conservative Dentistry & Endodontics' },
        { id: 6, name: 'Pedodontics' },
        { id: 7, name: 'Implantology' }
      ];
    }
    return cachedDepartments;
  }

  async function getDeptIdByName(name) {
    const departments = await getDepartments();
    const normalized = normalizeDeptName(name);
    const match = departments.find(function(d) {
      const n = (d.name || '').toLowerCase();
      return n.includes(normalized.toLowerCase()) || normalized.toLowerCase().includes(n);
    });
    return match ? match.id : null;
  }

  window.RRDCH_BACKEND = {
    API_BASE,
    SUPABASE_URL,
    SUPABASE_KEY,
    request,
    supabaseRequest,
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
