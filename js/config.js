// js/config.js — RRDCH Supabase Configuration
// Real keys loaded from environment (embedded at build time or set directly)
window.RRDCH_CONFIG = {
    SUPABASE_URL: "https://hbalflsjvtovtmmypdvv.supabase.co",
    SUPABASE_ANON_KEY: "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImhiYWxmbHNqdnRvdnRtbXlwZHZ2Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3NzY1MDc1OTcsImV4cCI6MjA5MjA4MzU5N30.iq60dhhWA8oqwNHQr6R4hvnCDKNBZ-sP-1A2PXxkkRU",
    GEMINI_API_KEY: "AIzaSyBhCpDnWo8u_GdHfu7ermBLbnABuOJVA4U",
    DEMO_MODE: true // Falls back to demo creds if Supabase auth fails
};

// Initialize Supabase client globally
(function initSupabase() {
    const cfg = window.RRDCH_CONFIG;
    if (typeof supabase !== 'undefined' && cfg.SUPABASE_URL && cfg.SUPABASE_ANON_KEY) {
        window.sb = supabase.createClient(cfg.SUPABASE_URL, cfg.SUPABASE_ANON_KEY, {
            auth: {
                persistSession: true,
                storageKey: 'rrdch_supabase_session'
            },
            realtime: { params: { eventsPerSecond: 10 } }
        });
        console.log('[RRDCH] Supabase client initialized ✓');
    } else {
        console.warn('[RRDCH] Supabase not loaded or config missing — demo mode only');
        window.sb = null;
    }
})();

// Demo credential map — used as fallback when Supabase is unavailable
window.RRDCH_DEMO_USERS = {
    patient:  { id: 'PAT001', email: 'patient@rrdch.in', password: 'patient123', name: 'Demo Patient', redirect: 'patients.html' },
    doctor:   { email: 'doctor@rrdch.in',  password: 'doctor123',  name: 'Dr. Roshan M.',   redirect: 'doctor-portal.html' },
    student:  { id: 'stu2024001', email: 'student@rrdch.in', password: 'Student@2024', name: 'Demo Student', redirect: 'students.html' },
    admin:    { email: 'admin@rrdch.in',   password: 'admin123',   name: 'System Admin',    redirect: 'admin-portal.html' }
};
