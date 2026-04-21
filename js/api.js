// js/api.js — Unified AI helper using Gemini REST API directly (no server needed)
(function() {
    const GEMINI_KEY = 'AIzaSyBhCpDnWo8u_GdHfu7ermBLbnABuOJVA4U';
    const GEMINI_URL = `https://generativelanguage.googleapis.com/v1beta/models/gemini-1.5-flash:generateContent?key=${GEMINI_KEY}`;

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
     * Send a message to Gemini 1.5 Flash directly from the browser.
     * @param {string} userMessage
     * @param {Array} history
     * @param {string|null} systemOverride
     * @param {boolean} jsonMode
     * @returns {Promise<{text: string, error: string|null}>}
     */
    window.askGemini = async function(userMessage, history = [], systemOverride = null, jsonMode = false) {
        const systemText = systemOverride || RRDCH_SYSTEM_PROMPT;
        const historyText = (history || []).map(h => h.parts?.[0]?.text || '').filter(Boolean).join('\n');
        const fullPrompt = jsonMode
            ? userMessage
            : `${systemText}\n\n${historyText ? 'Conversation history:\n' + historyText + '\n\n' : ''}User: ${userMessage}`;

        try {
            const res = await fetch(GEMINI_URL, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    contents: [{ parts: [{ text: fullPrompt }] }],
                    generationConfig: jsonMode ? { responseMimeType: 'application/json' } : {}
                })
            });
            const data = await res.json();
            if (!res.ok || data.error) {
                return { text: null, error: data.error?.message || 'Gemini API error' };
            }
            const text = data?.candidates?.[0]?.content?.parts?.[0]?.text;
            if (!text) return { text: null, error: 'Empty response from AI.' };

            // Log session to Supabase
            if (window.sb) {
                try { await window.sb.from('chatbot_sessions').insert({ query: userMessage, response: text, mode: jsonMode ? 'symptom-checker' : 'site-assistant', urgency: 'Routine', created_at: new Date().toISOString() }); } catch (_) {}
            }
            return { text, error: null };
        } catch (e) {
            return { text: null, error: 'Network error. Please try again.' };
        }
    };

    window.RRDCH_SYSTEM_PROMPT = RRDCH_SYSTEM_PROMPT;
})();
