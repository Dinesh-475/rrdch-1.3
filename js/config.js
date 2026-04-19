// js/config.js
window.RRDCH_CONFIG = {
    SUPABASE_URL: "YOUR_SUPABASE_URL",
    SUPABASE_ANON_KEY: "YOUR_SUPABASE_ANON_KEY"
};

// Initialize Supabase client globally if library is loaded
if (
    typeof supabase !== 'undefined' &&
    window.RRDCH_CONFIG.SUPABASE_URL &&
    window.RRDCH_CONFIG.SUPABASE_ANON_KEY &&
    !window.RRDCH_CONFIG.SUPABASE_URL.startsWith("YOUR_")
) {
    window.sb = supabase.createClient(window.RRDCH_CONFIG.SUPABASE_URL, window.RRDCH_CONFIG.SUPABASE_ANON_KEY);
}
