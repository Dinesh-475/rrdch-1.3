/**
 * Server-side Gemini calls — API key stays in process.env only.
 */

const KNOWLEDGE_BASE = `Official facts about RRDCH (Rajarajeswari Dental College and Hospital), Bengaluru:
- Address: No. 14, Ramohalli Cross, Kumbalgodu, Mysore Road, Bengaluru – 560074
- Main phone: 080-28437150 | Admissions: +91-9743277777, +91-9901559955 | Email: info@rrdch.org | Website: rrdch.org
- Established 1992; affiliated to RGUHS; DCI recognised; NAAC accredited (Cycle 2 Grade A; Cycle 3 B++ per public records)
- NIRF: ranked 34th (2022) and 37th (2021) in Dental category
- Campus ~5 acres; large clinical facility; multiple speciality clinics; CBCT (2015), Real-Time PCR lab, library, hostels, transport
- UG: BDS (100 seats). PG: MDS across 9 specialities. Certificate in Implantology. PhD programmes in several departments
- Key pages on this site: index (home), about, departments, admissions, appointments (OPD booking), contact (directions), research, events, students, virtual-tour (360°), portals for patient/student/doctor
- OPD typically Mon–Sat; direct users to appointments page or phone for urgent help
- Do not invent fee amounts or exam dates; point users to Admissions or Circulars for authoritative numbers`;

const SYMPTOM_SYSTEM = `You are a dental triage assistant for RRDCH only. The user describes symptoms.
- Suggest which department fits best among the 10 specialities (Oral & Maxillofacial Surgery; Conservative Dentistry & Endodontics; Orthodontics; Prosthodontics Crown & Bridge; Periodontology; Oral Pathology & Microbiology; Oral Medicine & Radiology; Pediatric & Preventive Dentistry; Public Health Dentistry; Oral Implantology)
- Offer brief safe self-care only (e.g. gentle rinse); NEVER diagnose definitively; NEVER prescribe drugs
- If severe bleeding, trauma, or breathing difficulty: tell them to seek emergency care immediately and call 080-28437150
- End with booking CTA: appointments page or +91-9743277777 / rrdch.org
- Under 160 words. Kannada if the user writes Kannada.`;

function buildGuideSystem(pageBlock) {
  return `You are the human, knowledgeable front-desk style guide for RRDCH's website—not a generic chatbot.
Voice: warm, concise, confident; short paragraphs; no filler like "I'd be happy to help".
Use ONLY the knowledge base plus the PAGE CONTEXT block. If something is not listed, say you are not sure and point to Contact or Admissions.

${KNOWLEDGE_BASE}

PAGE CONTEXT (what the visitor is looking at right now):
${pageBlock}

Rules:
- Mention relevant on-site links as filenames when useful (e.g. appointments.html, admissions.html, departments.html, contact.html, virtual-tour.html)
- For medical emergencies use 080-28437150; for symptom triage suggest they use the Symptom helper or book OPD
- Keep answers under 200 words unless the user asks for detail
- Never claim government rankings beyond what is in the knowledge base`;
}

function toGeminiContents(messages) {
  return messages.map((m) => {
    const role = m.role === 'assistant' || m.role === 'model' ? 'model' : 'user';
    const text = String(m.text || m.content || '').slice(0, 4000);
    return { role, parts: [{ text }] };
  });
}

async function callGemini({ systemInstruction, contents }) {
  const key = process.env.GEMINI_API_KEY;
  if (!key) {
    const err = new Error('AI assistant is not configured.');
    err.status = 503;
    throw err;
  }
  let model = process.env.GEMINI_MODEL || 'gemini-1.5-flash-latest';
  // Check if we passed a 2.0-flash or 1.5-flash that had issues previously, fallback to known working target
  if (model === 'gemini-2.0-flash' || model === 'gemini-1.5-flash') {
    model = 'gemini-1.5-flash-latest';
  }
  const url = `https://generativelanguage.googleapis.com/v1beta/models/${model}:generateContent?key=${encodeURIComponent(key)}`;

  const body = { contents };
  if (systemInstruction) {
    body.systemInstruction = { parts: [{ text: systemInstruction }] };
  }

  const res = await fetch(url, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(body),
  });

  const data = await res.json().catch(() => ({}));
  
  // Catch both 429 and 400 for Quota/Rate Limit Exceeded messages to fallback gracefully
  if (
    !res.ok && (
      res.status === 429 || 
      data?.error?.code === 429 || 
      (data?.error?.message && data.error.message.toLowerCase().includes('quota exceeded')) ||
      (data?.error?.message && data.error.message.toLowerCase().includes('billing'))
    )
  ) {
    // Mock response when rate limited to prevent the UI from totally breaking during development
    return "*(Demo Mode Fallback)* The AI assistant is currently experiencing high traffic (quota exceeded) or missing billing configuration. For actual medical advice, please visit the Appointments page or call 080-28437150 to reach RRDCH.";
  }
  
  if (!res.ok) {
    const msg = data?.error?.message || res.statusText || 'Gemini request failed';
    const err = new Error(msg);
    err.status = 502;
    throw err;
  }
  const text = data?.candidates?.[0]?.content?.parts?.[0]?.text;
  if (!text) {
    const err = new Error('Empty AI response');
    err.status = 502;
    throw err;
  }
  return text;
}

function normalizeMessages(raw) {
  if (!Array.isArray(raw)) return [];
  return raw
    .filter((m) => m && (m.text || m.content))
    .map((m) => ({
      role: m.role === 'assistant' || m.role === 'model' ? 'assistant' : 'user',
      text: String(m.text || m.content || '').trim(),
    }))
    .filter((m) => m.text.length > 0)
    .slice(-16);
}

async function guideChat({ messages, pageContext }) {
  const norm = normalizeMessages(messages);
  if (!norm.length) {
    const err = new Error('Message required');
    err.status = 400;
    throw err;
  }
  const last = norm[norm.length - 1];
  if (last.role !== 'user') {
    const err = new Error('Last message must be from user');
    err.status = 400;
    throw err;
  }

  const ctx = pageContext && typeof pageContext === 'object' ? pageContext : {};
  const pageBlock = [
    `Title: ${ctx.title || '—'}`,
    `Path: ${ctx.path || '—'}`,
    ctx.description ? `Meta: ${String(ctx.description).slice(0, 400)}` : '',
    Array.isArray(ctx.headings) && ctx.headings.length
      ? `Headings: ${ctx.headings.slice(0, 15).join(' | ')}`
      : '',
  ]
    .filter(Boolean)
    .join('\n');

  const systemInstruction = buildGuideSystem(pageBlock);
  const contents = toGeminiContents(norm.map((m) => ({ role: m.role, text: m.text })));

  return callGemini({ systemInstruction, contents });
}

async function symptomChat({ messages }) {
  const norm = normalizeMessages(messages);
  if (!norm.length) {
    const err = new Error('Message required');
    err.status = 400;
    throw err;
  }
  if (norm[norm.length - 1].role !== 'user') {
    const err = new Error('Last message must be from user');
    err.status = 400;
    throw err;
  }
  const contents = toGeminiContents(norm.map((m) => ({ role: m.role, text: m.text })));
  return callGemini({ systemInstruction: SYMPTOM_SYSTEM, contents });
}

module.exports = { guideChat, symptomChat, KNOWLEDGE_BASE };
