# RRDCH — MASTER BUILD PROMPT
## Hyprlan Webathon 2026 | Complete Engineering Specification
### Version 2.0 — Real Data Edition | April 2026

---

> **HOW TO USE THIS PROMPT:**
> Feed this document section-by-section to Claude, Cursor, or GitHub Copilot.
> Always start by sharing `RRDCH.init` so the AI knows the project state.
> Always share `RRDCH_DATA_SHEET.md` for verified real data.
> **DO NOT generate code from memory — use the data sheet as the source of truth.**

---

## ═══════════════════════════════════════
## PHASE 0 — BUG FIXES (DO THIS FIRST)
## ═══════════════════════════════════════

**Instruction to AI:** Before writing any new code, fix all 15 bugs listed in `RRDCH.init → SECTION 5`. Do not proceed to Phase 1 until all 15 bugs pass manual verification. Output a fixed version of `server.js`, `database.js`, and `package.json` only.

### Critical Fix Checklist:
- [ ] `database.js`: Add `fs.mkdirSync()` for DB directory creation
- [ ] `database.js`: Install `bcrypt`, hash all seed passwords with `bcrypt.hashSync(password, 10)`
- [ ] `server.js`: Replace ALL `db.prepare().run()` with `db.run(sql, params, callback)` pattern
- [ ] `server.js`: Fix login to use `bcrypt.compare()` — never compare plaintext
- [ ] `server.js`: Add `asyncHandler` wrapper and global error middleware for Express v4
- [ ] `server.js`: Guard all `io.emit()` calls with `if (io) { ... }`
- [ ] `server.js`: Throw hard error if `JWT_SECRET` missing from env
- [ ] `package.json`: Pin Express to `"^4.18.2"` (remove v5)
- [ ] `package.json`: Add `"start": "node server.js"` and `"dev": "nodemon server.js"`
- [ ] `.env`: Create with PORT, JWT_SECRET, NODE_ENV, EMAIL_USER, EMAIL_PASS
- [ ] `.gitignore`: Add `.env`, `node_modules/`, `*.db`, `uploads/`

---

## ═══════════════════════════════════════
## PHASE 1 — DESIGN SYSTEM (assets/css/main.css)
## ═══════════════════════════════════════

**Instruction to AI:** Generate the complete `assets/css/main.css`. This file must be 100% complete before any HTML page is generated. Every CSS variable below MUST be defined. This is the single source of truth for all styling.

### Design Philosophy
"Medical authority meets South Indian academic prestige."
Deep navy = institutional trust. Gold = heritage and excellence. Teal = clinical modernity. Cream backgrounds reduce eye strain (clinically relevant). Playfair Display headings convey academic gravitas.

### :root CSS Variables (ALL REQUIRED)

```css
/* ── BRAND COLORS ── */
--color-navy:        #1B3A6B;
--color-navy-dark:   #0F2347;
--color-navy-light:  #2D5AA0;
--color-gold:        #C8A951;
--color-gold-light:  #E8C96A;
--color-teal:        #2E86AB;
--color-teal-light:  #4DA6C8;
--color-cream:       #FAF7F2;
--color-warm-white:  #FFFEF9;

/* ── SEMANTIC COLORS ── */
--color-success:     #27AE60;
--color-warning:     #E67E22;
--color-danger:      #E74C3C;
--color-info:        #3498DB;

/* ── TEXT ── */
--color-text:        #1A1A2E;
--color-text-muted:  #6B7280;
--color-border:      #E5E7EB;

/* ── DARK MODE OVERRIDES (on [data-theme="dark"] or prefers-color-scheme: dark) ── */
/* --color-cream → #0D1117 */
/* --color-warm-white → #161B22 */
/* --color-text → #F0F6FC */
/* --color-border → #30363D */
/* --color-text-muted → #8B949E */

/* ── TYPOGRAPHY ── */
--font-display:  'Playfair Display', Georgia, serif;
--font-body:     'Inter', system-ui, sans-serif;
--font-kannada:  'Noto Sans Kannada', sans-serif;

--font-hero:   clamp(2.25rem, 5vw, 3rem);
--font-h1:     clamp(1.75rem, 3vw, 2.25rem);
--font-h2:     clamp(1.5rem, 2.5vw, 1.875rem);
--font-h3:     1.375rem;
--font-body:   1rem;
--font-small:  0.875rem;
--font-xs:     0.75rem;

/* ── SPACING (8px grid) ── */
--space-1:  4px;   --space-2:  8px;   --space-3:  12px;
--space-4:  16px;  --space-5:  20px;  --space-6:  24px;
--space-8:  32px;  --space-10: 40px;  --space-12: 48px;
--space-16: 64px;  --space-20: 80px;  --space-24: 96px;

/* ── BORDERS ── */
--radius-sm:   6px;
--radius:      10px;
--radius-lg:   16px;
--radius-xl:   24px;
--radius-pill: 100px;

/* ── SHADOWS ── */
--shadow-sm:   0 1px 3px rgba(27,58,107,0.08);
--shadow-md:   0 4px 16px rgba(27,58,107,0.12);
--shadow-lg:   0 8px 32px rgba(27,58,107,0.18);
--shadow-xl:   0 16px 64px rgba(27,58,107,0.24);
--shadow-gold: 0 4px 24px rgba(200,169,81,0.35);

/* ── TRANSITIONS ── */
--transition:      0.2s cubic-bezier(0.4, 0, 0.2, 1);
--transition-slow: 0.4s cubic-bezier(0.4, 0, 0.2, 1);
```

### Required Component Classes in main.css
Every HTML page uses these — define them all:

1. **`.ticker-bar`** — gold `LIVE` badge, navy background, CSS marquee animation 30s
2. **`.navbar`** — sticky, transparent → navy on scroll, logo + links + right-side controls
3. **`.navbar.scrolled`** — shrunk height, shadow, solid navy/white bg
4. **`.nav-dropdown`** — mega menu for Departments (10 items) and Portals (4 items)
5. **`.hamburger`** — 3-line → X animation on toggle
6. **`.mobile-menu`** — full-screen overlay, staggered link fade-in
7. **`.hero-section`** — split layout, gradient bg, tooth pattern SVG overlay at 4% opacity
8. **`.stats-counter-strip`** — navy gradient, 5 animated counters with gold numbers
9. **`.card`** — cream bg, 4px navy top border, hover: `translateY(-6px)` + shadow-xl
10. **`.card:hover`** — gold top border replaces navy
11. **`.btn-primary`** — gold bg, navy text, scale(1.03) on hover
12. **`.btn-secondary`** — navy bg, white text
13. **`.btn-outline`** — transparent, navy border → gold on hover
14. **`.floating-label`** — label animates up on input focus
15. **`.input-valid`** — green checkmark SVG, green border
16. **`.input-error`** — red border, shake animation keyframe
17. **`.step-wizard`** — 3-step progress bar with animated fill
18. **`.portal-card`** — 2×2 grid, role-specific accent color, Enter Portal CTA
19. **`.dept-card`** — flip animation on hover (front: services, back: HOD + timing)
20. **`.achievements-marquee`** — auto-scroll, pause on hover
21. **`.scroll-to-top`** — gold circle, bottom-right, fade in after 300px
22. **`.emergency-banner`** — red border, dismissible, persistent
23. **`.social-proof-ticker`** — subtle bottom bar with rotating messages
24. **`.modal-overlay`** — focus-trapped, backdrop blur
25. **`.sidebar-layout`** — portal dashboard: fixed sidebar + scrollable main content
26. **`.notification-bell`** — red badge count, dropdown on click
27. **`.status-badge`** — pill badges for appointment statuses (booked/confirmed/done etc.)
28. **`.queue-display`** — 3-column live queue panel
29. **`.timeline`** — vertical timeline for history/treatment history pages
30. **`.footer`** — 3-column + copyright bar with accreditation logos

### Accessibility Requirements (WCAG AA)
- All body text: minimum 4.5:1 contrast ratio against background
- Large text (18px+ or 14px+ bold): minimum 3:1 contrast ratio
- All interactive elements: visible `:focus-visible` ring (2px solid gold, 2px offset)
- `.sr-only` class for skip-to-content link
- `[data-theme="dark"]` media-query-respecting dark mode with no FOUC
- `body.lang-kn` applies `--font-kannada` to all text nodes

---

## ═══════════════════════════════════════
## PHASE 2 — GLOBAL JS (assets/js/main.js + assets/js/lang.js)
## ═══════════════════════════════════════

### main.js — Must Handle:

```javascript
// 1. AOS INIT
AOS.init({ duration: 700, once: true, easing: 'ease-out-cubic', offset: 80 });

// 2. NAVBAR SCROLL BEHAVIOR
// Add/remove .scrolled class on <nav> when window.scrollY > 80

// 3. DARK MODE TOGGLE
// - Toggle data-theme="dark" on <html>
// - Persist in localStorage('rrdch_theme')
// - Swap sun ↔ moon icon with 360deg rotation animation
// - No flash on load: read localStorage and apply BEFORE DOMContentLoaded

// 4. SCROLL-TO-TOP BUTTON
// - Show/hide based on scrollY > 300
// - Smooth scroll to top on click

// 5. ANIMATED COUNTERS
// - Use IntersectionObserver on .stats-counter-strip
// - When visible: count up each .counter-value from 0 to its data-target
// - Duration: 2000ms, easing: easeOutExpo

// 6. MOBILE HAMBURGER MENU
// - Toggle .mobile-menu.open
// - Staggered link animation: nth-child delay 0.1s per item
// - Close on overlay click and ESC key

// 7. EMERGENCY BANNER
// - Show if localStorage('rrdch_emergency_dismissed') !== 'true'
// - Dismiss button sets localStorage and removes element

// 8. SOCIAL PROOF TICKER
// - setInterval 5000ms rotating through array of messages

// 9. MODAL SYSTEM
// - openModal(id), closeModal(id) functions
// - Focus trap within modal
// - Close on ESC and backdrop click

// 10. FORM VALIDATION HELPERS
// - validateRequired(fields) → returns boolean
// - showToast(msg, type) → uses Toastify.js
// - type: 'success' | 'error' | 'info'
```

### lang.js — Kannada/English Toggle System:

```javascript
// COMPLETE IMPLEMENTATION REQUIRED:

const LANG_KEY = 'rrdch_lang';

function applyLang(lang) {
  // 1. Update all elements with data-en and data-kn attributes
  document.querySelectorAll('[data-en]').forEach(el => {
    el.textContent = lang === 'kn' ? el.dataset.kn : el.dataset.en;
  });

  // 2. Update all placeholder attributes
  document.querySelectorAll('[data-placeholder-en]').forEach(el => {
    el.placeholder = lang === 'kn' ? el.dataset.placeholderKn : el.dataset.placeholderEn;
  });

  // 3. Toggle font family on body
  document.body.classList.toggle('lang-kn', lang === 'kn');

  // 4. Update <html lang> attribute
  document.documentElement.lang = lang === 'kn' ? 'kn' : 'en';

  // 5. Update toggle button text
  const toggleBtn = document.getElementById('langToggle');
  if (toggleBtn) toggleBtn.textContent = lang === 'kn' ? 'English' : 'ಕನ್ನಡ';

  // 6. Save to localStorage
  localStorage.setItem(LANG_KEY, lang);
}

// Apply saved lang on page load (before DOMContentLoaded)
const savedLang = localStorage.getItem(LANG_KEY) || 'en';
applyLang(savedLang);

// Toggle handler
document.getElementById('langToggle')?.addEventListener('click', () => {
  const current = localStorage.getItem(LANG_KEY) || 'en';
  applyLang(current === 'en' ? 'kn' : 'en');
});
```

### KANNADA COVERAGE RULE:
**Every single visible text node on every page MUST have both `data-en` and `data-kn` attributes.**
This includes: nav links, headings, button labels, form labels, form placeholders, card text, footer text, ticker messages, toast messages, badge labels, tab labels.

Use the translations in `RRDCH_DATA_SHEET.md → Kannada Translations` section.
For any string not in the data sheet, use Google Translate (Kannada) and add it.

---

## ═══════════════════════════════════════
## PHASE 3 — HOME PAGE (index.html)
## ═══════════════════════════════════════

**Data Source:** Use ONLY real data from `RRDCH_DATA_SHEET.md`. Do NOT use lorem ipsum anywhere.

### Required Sections (in order):
1. **Ticker Bar** — Live OPD status, today's patient count, upcoming events, admission alerts. All items bilingual.
2. **Navbar** — Logo from `https://www.rrdch.org/wp-content/uploads/2013/05/rrdch-logo.png` + fallback text "RRDCH"
3. **Emergency Banner** — "Severe dental pain? Call: 080-28437150 (24/7 Emergency)"
4. **Hero Section** — Split layout. Left: NAAC badge, H1, sub, 2 CTAs. Right: animated stats card. Navy-to-teal diagonal gradient. SVG tooth pattern overlay (opacity 4%). Floating 🦷 with CSS float animation.
5. **Stats Counter Strip** — 5 counters: 34+ Years | 350 Chairs | 1,00,000+ Patients | 100% Placement | 9 MDS Specialities
6. **Why RRDCH Cards** — 6 USP cards. Use REAL achievements from data sheet. Gold icons.
7. **Quick Portal Cards** — 4 role cards (Patient/Student/Doctor/Admin). JWT-aware redirects.
8. **Departments Preview** — All 10 departments, horizontal scroll mobile, flip card hover.
9. **Appointment Quick-Book** — Inline booking form. Flatpickr date (block Sundays). Token generation on submit.
10. **News & Events** — Left: 5 news items. Right: upcoming events mini-calendar. Use REAL events from data sheet.
11. **Achievements Marquee** — Auto-scroll, pausable. Real achievements from data sheet. No fake records.
12. **Virtual Tour CTA** — Full-width section → `/virtual-tour.html`
13. **Hospital Directions** — Google Maps iframe (12.9279, 77.4713). Real directions from data sheet.
14. **Testimonials** — 3 rotating testimonials. Anonymised (e.g., "Kavitha R., Mysore Road").
15. **Partners/Accreditation Strip** — NAAC, DCI, RGUHS, ISO, IAO, HLAT, Glasgow Royal College, NIRF logos.
16. **Footer** — 3-column + bottom bar. All accreditation logos. OPD hours: Mon–Sat 9AM–5PM.

### NAAC Display Note:
Do NOT display "NAAC A Grade" as a standalone claim. Display: "NAAC Accredited Institution" or "NAAC Accredited (Grade A — Cycle 2)". See data sheet correction section.

---

## ═══════════════════════════════════════
## PHASE 4 — CORE PUBLIC PAGES
## ═══════════════════════════════════════

### Page Build Order (priority for hackathon):
1. `appointments.html` — Highest judge value (interactive, real-time)
2. `departments.html` — 10 department cards with real data
3. `about.html` — Timeline (real dates), leadership, campus gallery
4. `admissions.html` — Course table (real fees), application form
5. `events.html` — FullCalendar.js with real RRDCH events
6. `login.html` — Role-based login with demo credentials
7. `contact.html` — Form + map + directions
8. `virtual-tour.html` — Pannellum or fallback gallery
9. `feedback.html` — 4-tab feedback forms
10. `research.html` — Publications, research areas
11. `students.html` — Public academic info
12. `syllabus.html` — Course selector + accordion
13. `hostel-complaints.html` — Public complaint form + tracking

### appointments.html — Detailed Spec:
**Part A — 3-Step Booking Wizard:**
- Progress bar with step indicator (Step 1 of 3)
- Step 1: Full Name, Age (numeric), Gender (radio), Phone, Email, Patient ID (optional)
- Step 2: Department (all 10 in dropdown), Date (Flatpickr, disable Sundays + past dates), Time Slot (radio grid: 9AM, 9:30AM ... 4PM, mark filled slots as disabled), Chief Complaint (textarea), Referral source
- Step 3: Summary card showing all entries. Confirm button submits.
- On submit: modal with Token #A-XXX, date, time, dept, "Add to Google Calendar" deep link, print button
- Toast: "Appointment confirmed! Your token is #A-042"

**Part B — Appointment Tracker:**
- Input: Token ID OR Phone number
- Shows: 5-step status pipeline with active step highlighted
- Steps: Booked → Confirmed → In Queue (#X) → Called → Done
- Cancel/Reschedule buttons (future appointments only)

**Part C — Live OPD Queue Panel:**
- Auto-refresh every 30s via setInterval
- 3 columns: Now Serving | Next 5 Tokens | Total Waiting Count
- Color codes: green=active, gold=next, grey=waiting
- Uses mock data initially, wires to `/api/appointments/queue/:dept_id` in backend phase

---

## ═══════════════════════════════════════
## PHASE 5 — PORTAL PAGES
## ═══════════════════════════════════════

### Auth Pattern for All Portals:
```javascript
// At top of every portal JS file:
function checkAuth(requiredRole) {
  const token = localStorage.getItem('rrdch_token');
  if (!token) { window.location.href = '/login.html'; return null; }
  try {
    const payload = JSON.parse(atob(token.split('.')[1]));
    if (payload.role !== requiredRole) { window.location.href = '/login.html'; return null; }
    if (payload.exp < Date.now() / 1000) {
      localStorage.removeItem('rrdch_token');
      window.location.href = '/login.html';
      return null;
    }
    return payload;
  } catch { window.location.href = '/login.html'; return null; }
}
```

### portals/student.html:
- Sidebar: Dashboard | Attendance | Results | Fee Payment | Timetable | Syllabus | Hostel | Profile
- Dashboard: "Good morning, Ananya! 👋" + quick stats (Attendance %, Pending Fees, Next Exam)
- Attendance: Table with color coding (≥75%=green, 65–75%=orange, <75%=red + alert banner). Month calendar view.
- Results: Semester selector → Marks table → GPA calculator
- Fee Payment: Dues table → Mock Razorpay modal → Receipt download
- Timetable: Weekly grid Mon–Sat 8AM–5PM, color-coded by subject
- Syllabus: Year/Semester selector → Subject accordion → PDF download links
- Hostel Complaints: Submit form (Category, Description, Urgency, Room No.) + Complaints history table with status badges

### portals/patient.html:
- Sidebar: My Appointments | Book New | Treatment History | Prescriptions | Profile
- My Appointments: Cards with Token/Dept/Date/Time/Status/Doctor, Cancel/Reschedule for future only
- Live Queue: "Your position: #3" with 30s setInterval update, animated progress bar
- Treatment History: Timeline view (Date | Dept | Treatment | Doctor | Next Appt)

### portals/doctor.html (PG Doctor):
- Sidebar: Today's Schedule | Patient List | Case Logs | CDE Log | Profile
- Today's Schedule: Timeline of appointments. Mark: [Arrived] [In Chair] [Done] [No Show]
- Patient List: Searchable table with filters
- CDE Log: Add programs, total hours tracker, bar chart (required vs completed)

### portals/admin.html:
- Sidebar: Overview | Users | Appointments | Events CMS | Announcements | Admissions | Complaints | Analytics
- Overview: 4 stat cards + 4 Chart.js charts (OPD line, dept pie, admissions bar, attendance trend)
- Users: Full CRUD table, Add User modal, role filter, activate/deactivate toggle
- Appointments: Filterable table, assign doctor, export CSV
- Events CMS: Add/Edit/Delete events (syncs to events.html calendar)
- Hostel Complaints: Inbox table, assign staff, update status

---

## ═══════════════════════════════════════
## PHASE 6 — BACKEND (server/ directory)
## ═══════════════════════════════════════

### server.js — Entry Point Requirements:
```javascript
require('dotenv').config();
if (!process.env.JWT_SECRET) throw new Error('JWT_SECRET not set in .env');

// Startup log (judge-visible):
console.log(`🚀 RRDCH Backend running on http://localhost:${process.env.PORT || 3000}`);
console.log(`📊 Database: ${dbPath}`);
console.log(`🔐 JWT: Configured`);
console.log(`🔌 Socket.IO: Ready`);
```

### database.js — All Tables Required:
See full schema in the original master prompt PDF. Tables to create:
`users`, `students`, `staff`, `patients`, `departments`, `appointments`,
`attendance`, `subjects`, `marks`, `fees`, `hostel_complaints`, `events`,
`feedback`, `admissions`, `stats`, `achievements`, `ticker_items`

### Seed Data — USE REAL DATA:
- All 10 departments with real names, descriptions, OPD hours (9AM–4PM Mon–Sat)
- Users: admin@rrdch.org, BDS2023001, pg.001@rrdch.org, two patient phone numbers
- 10 sample events using REAL RRDCH event types from data sheet
- Stats: 34 (years), 350 (chairs), 600 (daily patients), 100 (placement %), 9 (MDS specs)
- 8 achievements from data sheet (no fake Guinness record — data sheet has verified ones)
- 5 ticker items (real: OPD open status, admission enquiry number, next CDE event)

### Route File Pattern:
```javascript
// Every route file must follow this pattern:
const router = require('express').Router();
const db = require('../database');
const { body, validationResult } = require('express-validator');
const { authMiddleware, roleGuard } = require('../middleware/auth.middleware');
const asyncHandler = fn => (req, res, next) => Promise.resolve(fn(req,res,next)).catch(next);

// All DB calls use callback pattern:
db.run(sql, params, function(err) { ... });
db.get(sql, params, (err, row) => { ... });
db.all(sql, params, (err, rows) => { ... });

module.exports = router;
```

### Socket.IO Queue Simulation:
```javascript
// In utils/socketHandlers.js
// Runs every 30 seconds:
setInterval(() => {
  // 1. Find oldest 'in_queue' appointment per department
  // 2. Move it to 'called'
  // 3. Move next 'confirmed' to 'in_queue', assign queue_position
  // 4. Emit 'queue_update' to room `dept_${dept_id}`
  io.to(`dept_${dept_id}`).emit('queue_update', {
    dept_id,
    now_serving: tokenNo,
    next_5: nextTokens,
    waiting_count: waitingCount
  });
}, 30000);
```

---

## ═══════════════════════════════════════
## PHASE 7 — AI SYMPTOM CHECKER (assets/js/symptom-checker.js)
## ═══════════════════════════════════════

### ⚠️ API KEY PROMPT:
Before generating this file, ask the user:
"Please provide your ANTHROPIC_API_KEY. It will be embedded in frontend JS for the hackathon demo. Note: in production, this call should be proxied through your backend."

### Implementation:

```javascript
// Floating chat button — injected into every page via main.js
// Renders a chat modal when clicked

const SYSTEM_PROMPT = `You are a dental health assistant for RRDCH (Rajarajeswari Dental College and Hospital), Bengaluru. A patient is describing their dental symptoms.

Your job:
1. Listen to the symptoms described
2. Suggest which RRDCH department they should visit from these 10:
   - Oral & Maxillofacial Surgery (jaw pain, swelling, extractions)
   - Conservative Dentistry & Endodontics (tooth pain, cavities, root canal)
   - Orthodontics & Dentofacial Orthopedics (crooked teeth, braces)
   - Prosthodontics, Crown & Bridge (missing teeth, dentures)
   - Periodontology (gum bleeding, loose teeth)
   - Oral Pathology & Microbiology (oral sores, white/red patches)
   - Oral Medicine & Radiology (jaw clicking, facial pain)
   - Pedodontics & Preventive Dentistry (children under 14)
   - Public Health Dentistry (general prevention, community)
   - Oral Implantology (want dental implants)
3. Give brief first-aid advice if pain is severe
4. NEVER diagnose, NEVER prescribe medications
5. Always end by: "Please book an appointment at RRDCH: Call +91-9743277777 or visit rrdch.org"
6. Keep response under 150 words. Be empathetic and clear.
7. If asked in Kannada, respond in Kannada.`;

async function sendSymptomMessage(userMessage, conversationHistory) {
  const response = await fetch('https://api.anthropic.com/v1/messages', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json', 'x-api-key': ANTHROPIC_API_KEY, 'anthropic-version': '2023-06-01' },
    body: JSON.stringify({
      model: 'claude-sonnet-4-20250514',
      max_tokens: 500,
      system: SYSTEM_PROMPT,
      messages: conversationHistory
    })
  });
  const data = await response.json();
  return data.content[0].text;
}
```

### Chat UI Requirements:
- Floating teal button, bottom-right (above scroll-to-top), `🤖` or tooth icon
- Modal: 400px wide, chat bubble interface, typing indicator animation
- User bubbles: right-aligned, navy bg. Assistant bubbles: left-aligned, cream bg.
- Below each assistant response: `[Book Appointment at RRDCH →]` button
- Conversation persists during session (array in memory)
- Bilingual: if Kannada mode active, initial greeting in Kannada

---

## ═══════════════════════════════════════
## PHASE 8 — PWA (manifest.json + sw.js)
## ═══════════════════════════════════════

### manifest.json:
```json
{
  "name": "RRDCH — Rajarajeswari Dental College & Hospital",
  "short_name": "RRDCH",
  "description": "Book appointments, track OPD queue, access student & patient portals",
  "theme_color": "#1B3A6B",
  "background_color": "#FAF7F2",
  "display": "standalone",
  "orientation": "portrait-primary",
  "start_url": "/index.html",
  "scope": "/",
  "lang": "en-IN",
  "icons": [
    { "src": "assets/icons/icon-192.png", "sizes": "192x192", "type": "image/png", "purpose": "any maskable" },
    { "src": "assets/icons/icon-512.png", "sizes": "512x512", "type": "image/png", "purpose": "any maskable" }
  ],
  "shortcuts": [
    { "name": "Book Appointment", "url": "/appointments.html", "icons": [{"src": "assets/icons/icon-192.png", "sizes": "192x192"}] },
    { "name": "Student Portal", "url": "/portals/student.html", "icons": [{"src": "assets/icons/icon-192.png", "sizes": "192x192"}] }
  ]
}
```

### sw.js — Cache Strategy:
- Cache-first for: CSS, JS, fonts, images
- Network-first for: API calls (`/api/*`)
- Offline fallback: serve `/offline.html` if network fails
- Cache name: `rrdch-v1`
- "Add to Home Screen" banner: show after 3rd visit (track in localStorage)

---

## ═══════════════════════════════════════
## PHASE 9 — RESPONSIVE & ACCESSIBILITY AUDIT
## ═══════════════════════════════════════

### Breakpoints:
- Mobile: 375px (iPhone SE — minimum target)
- Tablet: 768px
- Desktop: 1280px
- Wide: 1440px+

### Mobile Requirements:
- Hamburger menu replaces navbar links
- Stats strip: single column scroll
- Department cards: single column
- Portal sidebar: collapsible drawer (hamburger icon)
- Appointment wizard: single column stacked
- Tables: horizontal scroll with sticky first column
- All touch targets: minimum 44×44px

### Accessibility Checklist:
- `<html lang="en">` (updated to `lang="kn"` when Kannada active)
- Skip-to-content: `<a href="#main" class="sr-only">Skip to main content</a>`
- All images: meaningful `alt` text (not "image" or filename)
- All form inputs: associated `<label for="...">` elements
- Error messages: `role="alert"` attribute
- Modal dialogs: focus trap + ESC to close + `aria-modal="true"`
- Icon-only buttons: `aria-label` attribute
- Color not the only indicator of state (add text/icon)
- Keyboard navigation: logical tab order, no keyboard traps

---

## ═══════════════════════════════════════
## PHASE 10 — DEPLOYMENT
## ═══════════════════════════════════════

### Frontend → GitHub Pages:
1. Push all HTML/CSS/JS to public repo `rrdch-webathon-2026`
2. Settings → Pages → Branch: main → Folder: / (root) → Save
3. Live URL: `https://[username].github.io/rrdch-webathon-2026/`
4. Update all API base URL references:
```javascript
const API_BASE = window.location.hostname === 'localhost'
  ? 'http://localhost:3000'
  : 'https://rrdch-backend.up.railway.app'; // update with actual URL
```

### Backend → Railway.app (Free):
1. Create account at railway.app
2. New Project → Deploy from GitHub → select backend repo
3. Add environment variables: JWT_SECRET, PORT=3000, NODE_ENV=production, EMAIL_USER, EMAIL_PASS
4. Railway auto-detects `npm start`
5. Note deployed URL → update `API_BASE` in frontend

### CORS config for production:
```javascript
app.use(cors({
  origin: [
    `https://[username].github.io`,
    'http://localhost:5500',
    'http://localhost:3000'
  ],
  credentials: true,
  methods: ['GET', 'POST', 'PUT', 'DELETE']
}));
```

---

## ═══════════════════════════════════════
## CDN LINKS — INCLUDE IN EVERY HTML <head>
## ═══════════════════════════════════════

```html
<!-- Fonts -->
<link rel="preconnect" href="https://fonts.googleapis.com">
<link href="https://fonts.googleapis.com/css2?family=Playfair+Display:ital,wght@0,600;0,700;1,600&family=Inter:wght@300;400;500;600;700&family=Noto+Sans+Kannada:wght@400;500;600&display=swap" rel="stylesheet">

<!-- Font Awesome 6 -->
<link rel="stylesheet" href="https://cdnjs.cloudflare.com/ajax/libs/font-awesome/6.5.0/css/all.min.css">

<!-- AOS -->
<link rel="stylesheet" href="https://unpkg.com/aos@2.3.1/dist/aos.css">
<script src="https://unpkg.com/aos@2.3.1/dist/aos.js" defer></script>

<!-- Toastify -->
<link rel="stylesheet" href="https://cdn.jsdelivr.net/npm/toastify-js/src/toastify.min.css">
<script src="https://cdn.jsdelivr.net/npm/toastify-js" defer></script>

<!-- Flatpickr (appointments page only) -->
<link rel="stylesheet" href="https://cdn.jsdelivr.net/npm/flatpickr/dist/flatpickr.min.css">
<script src="https://cdn.jsdelivr.net/npm/flatpickr" defer></script>

<!-- FullCalendar (events page only) -->
<link href="https://cdn.jsdelivr.net/npm/fullcalendar@6.1.11/index.global.min.css" rel="stylesheet">
<script src="https://cdn.jsdelivr.net/npm/fullcalendar@6.1.11/index.global.min.js" defer></script>

<!-- Pannellum (virtual-tour page only) -->
<link rel="stylesheet" href="https://cdn.jsdelivr.net/npm/pannellum@2.5.6/build/pannellum.css">
<script src="https://cdn.jsdelivr.net/npm/pannellum@2.5.6/build/pannellum.js" defer></script>

<!-- Chart.js (portals only) -->
<script src="https://cdn.jsdelivr.net/npm/chart.js" defer></script>

<!-- PWA manifest + theme -->
<link rel="manifest" href="/manifest.json">
<meta name="theme-color" content="#1B3A6B">

<!-- Critical CSS inline (embed :root variables + above-fold critical styles here) -->
<style>/* critical CSS here */</style>

<!-- Main CSS -->
<link rel="stylesheet" href="/assets/css/main.css">
```

---

## ═══════════════════════════════════════
## JUDGE CHECKLIST — 45 POINTS
## ═══════════════════════════════════════

Track this as you build. Aim for 40+/45 in 8 hours.

### PUBLIC FEATURES (15 pts):
- [ ] 1. Appointment booking — 3-step wizard + token confirmation
- [ ] 2. Appointment tracking — by token/phone
- [ ] 3. Live OPD queue — real-time or simulated 30s refresh
- [ ] 4. Live ticker — OPD status + announcements (bilingual)
- [ ] 5. Virtual 360° tour — Pannellum or image gallery fallback
- [ ] 6. FullCalendar.js — with filter and event modals
- [ ] 7. Kannada toggle — 100% coverage, localStorage persistent
- [ ] 8. Dark mode — localStorage persistent, smooth transition
- [ ] 9. Google Maps — with directions
- [ ] 10. All 10 departments — real data, treatments, Book CTA
- [ ] 11. Admissions — real fees/courses, form, status tracker
- [ ] 12. Feedback — all 4 audience types
- [ ] 13. Research — real publications count, research areas
- [ ] 14. Contact — form + confirmation
- [ ] 15. Responsive — 375px + 768px + 1280px

### STUDENT FEATURES (10 pts):
- [ ] 16. Attendance — subject-wise % + calendar
- [ ] 17. Low attendance alert — <75% red badge
- [ ] 18. Results — marks table + GPA calculator
- [ ] 19. Fee dues — mock payment flow
- [ ] 20. Timetable — weekly grid
- [ ] 21. Syllabus — accordion + PDF download
- [ ] 22. Hostel complaint — submit + track
- [ ] 23. Student dashboard — quick stats

### PATIENT FEATURES (5 pts):
- [ ] 24. Patient portal — appointment history
- [ ] 25. Real-time queue position

### DOCTOR/ADMIN FEATURES (5 pts):
- [ ] 26. Doctor portal — schedule + patient status
- [ ] 27. Admin — Chart.js dashboard charts
- [ ] 28. Admin — user CRUD
- [ ] 29. Admin — events + announcements CMS
- [ ] 30. Admin — complaints management

### TECHNICAL EXCELLENCE (10 pts):
- [ ] 31. JWT auth — role-based routing
- [ ] 32. Socket.IO — real-time events
- [ ] 33. AI Symptom Checker — Claude API
- [ ] 34. Express REST API — all endpoints working
- [ ] 35. SQLite — all tables + seed data
- [ ] 36. Form validation — toast notifications
- [ ] 37. AOS animations — throughout
- [ ] 38. Animated counters — homepage
- [ ] 39. Print-friendly appointment slip
- [ ] 40. PWA — manifest + service worker

### DESIGN EXCELLENCE (5 pts):
- [ ] 41. Navy-Gold-Teal — consistently applied
- [ ] 42. Playfair Display + (Noto Sans Kannada when KN active)
- [ ] 43. REAL RRDCH data — no lorem ipsum
- [ ] 44. Mobile hamburger — overlay animation
- [ ] 45. NAAC, DCI, RGUHS badges displayed

---

*Prompt v2.0 | Data sourced from rrdch.org, Wikipedia, NAAC AQAR 2021-22, NIRF, EduDunia, CollegeBatch*
*Real data corrections applied — see RRDCH_DATA_SHEET.md for full notes*
