// js/api.js — Unified AI helper (server-side Gemini proxy)
(function() {
    const RRDCH_SYSTEM_PROMPT = `You are the official AI assistant for Rajarajeshwari Dental College and Hospital (RRDCH), Bangalore.

Key Facts:
- Address: 14 Ramohalli Cross, Mysore Road, Kumbalgodu, Bangalore 560074
- Phone: 080-28437150
- Email: info@rrdch.org, principalrrdch@gmail.com
- Established: 1992
- Affiliated to RGUHS, Recognized by DCI
- Accreditations: NABH, NAAC A+, ISO 9001:2015
- Courses: BDS (5 years), MDS (3 years), PhD, Certificate courses
- Departments: Oral Surgery, Orthodontics, Periodontology, Conservative Dentistry & Endodontics, Prosthodontics, Oral Medicine & Radiology, Pedodontics, Public Health Dentistry, Implantology, Orofacial Pain, Oral Pathology & Microbiology
- OPD: Monday–Saturday, 9 AM–5 PM
- Emergency dental care: 24/7
- Facilities: 250+ dental chairs, digital X-ray, CBCT scanner, hostel, digital library, gymnasium, sports, transport, Wi-Fi campus

Instructions:
- Keep answers concise (2-3 sentences).
- Be friendly and reassuring.
- If unsure, direct users to call 080-28437150.
- Respond in the same language as the user.
- Never invent information not listed above.`;

    /**
     * Send a request to Gemini 1.5 Flash.
     * @param {string} userMessage — The user's message
     * @param {Array} history — Chat history array [{role, parts}]
     * @param {string} [systemOverride] — Optional system prompt override
     * @param {boolean} [jsonMode] — If true, request JSON output
     * @returns {Promise<{text: string, error: string|null}>}
     */
    window.askGemini = async function(userMessage, history = [], systemOverride = null, jsonMode = false) {
        const systemText = systemOverride || RRDCH_SYSTEM_PROMPT;
        const merged = jsonMode ? userMessage : `${systemText}\n\n${history.map(h => h.parts?.[0]?.text || "").join("\n")}\n${userMessage}`;
        try {
            const res = await fetch("/api/gemini", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({
                    mode: jsonMode ? "symptom-checker" : "site-assistant",
                    input: merged
                })
            });
            const data = await res.json();
            if (!res.ok || data.ok === false) {
                return { text: null, error: data.msg || 'API error' };
            }
            const text = jsonMode ? JSON.stringify(data.data || {}) : (data.data?.text || "");
            if (!text) {
                return { text: null, error: 'Empty response from AI.' };
            }
            return { text, error: null };
        } catch (e) {
            return { text: null, error: 'Network error. Please try again.' };
        }
    };

    window.RRDCH_SYSTEM_PROMPT = RRDCH_SYSTEM_PROMPT;
})();
