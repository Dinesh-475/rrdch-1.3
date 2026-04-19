/**
 * RRDCH — public.routes.js
 * All public (no auth) GET endpoints.
 */
const router = require('express').Router();
const db     = require('../database');
const { emitAdminRealtime } = require('../utils/socketHandlers');

/** GET /api/public/stats */
router.get('/stats', (req, res) => {
  db.all('SELECT * FROM stats ORDER BY rowid', [], (err, rows) => {
    if (err) return res.status(500).json({ ok: false, msg: 'Error fetching stats' });
    res.json({ ok: true, data: rows });
  });
});

/** GET /api/public/achievements */
router.get('/achievements', (req, res) => {
  db.all('SELECT * FROM achievements WHERE is_active = 1 ORDER BY sort_order', [], (err, rows) => {
    if (err) return res.status(500).json({ ok: false, msg: 'Error fetching achievements' });
    res.json({ ok: true, data: rows });
  });
});

/** GET /api/public/ticker */
router.get('/ticker', (req, res) => {
  db.all('SELECT * FROM ticker_items WHERE is_active = 1 ORDER BY sort_order', [], (err, rows) => {
    if (err) return res.status(500).json({ ok: false, msg: 'Error fetching ticker' });
    res.json({ ok: true, data: rows });
  });
});

/** GET /api/public/departments */
router.get('/departments', (req, res) => {
  db.all('SELECT * FROM departments ORDER BY id', [], (err, rows) => {
    if (err) return res.status(500).json({ ok: false, msg: 'Error fetching departments' });
    res.json({ ok: true, data: rows });
  });
});

/** GET /api/public/departments/:id */
router.get('/departments/:id', (req, res) => {
  db.get('SELECT * FROM departments WHERE id = ?', [req.params.id], (err, row) => {
    if (err) return res.status(500).json({ ok: false, msg: 'Error' });
    if (!row) return res.status(404).json({ ok: false, msg: 'Department not found' });
    res.json({ ok: true, data: row });
  });
});

/** GET /api/public/events */
router.get('/events', (req, res) => {
  const { type } = req.query;
  let sql = 'SELECT * FROM events WHERE is_published = 1';
  const params = [];
  if (type && type !== 'all') { sql += ' AND type = ?'; params.push(type); }
  sql += ' ORDER BY date ASC';
  db.all(sql, params, (err, rows) => {
    if (err) return res.status(500).json({ ok: false, msg: 'Error fetching events' });
    res.json({ ok: true, data: rows });
  });
});

/** GET /api/public/events/:id */
router.get('/events/:id', (req, res) => {
  db.get('SELECT * FROM events WHERE id = ? AND is_published = 1', [req.params.id], (err, row) => {
    if (err) return res.status(500).json({ ok: false, msg: 'Error' });
    if (!row) return res.status(404).json({ ok: false, msg: 'Event not found' });
    res.json({ ok: true, data: row });
  });
});

/** GET /api/public/news — top 10 announcements from events table */
router.get('/news', (req, res) => {
  db.all('SELECT * FROM events WHERE is_published = 1 ORDER BY created_at DESC LIMIT 10', [], (err, rows) => {
    if (err) return res.status(500).json({ ok: false, msg: 'Error' });
    res.json({ ok: true, data: rows });
  });
});

/** GET /api/public/circulars */
router.get('/circulars', (req, res) => {
  db.all('SELECT * FROM circulars ORDER BY date DESC, is_important DESC LIMIT 20', [], (err, rows) => {
    if (err) return res.status(500).json({ ok: false, msg: 'Error fetching circulars' });
    res.json({ ok: true, data: rows });
  });
});

/** GET /api/public/management */
router.get('/management', (req, res) => {
  db.all('SELECT * FROM management ORDER BY sort_order ASC', [], (err, rows) => {
    if (err) return res.status(500).json({ ok: false, msg: 'Error fetching management' });
    res.json({ ok: true, data: rows });
  });
});

/** GET /api/public/config — keys for maps only; Gemini stays server-side */
router.get('/config', (req, res) => {
  res.json({
    ok: true,
    data: {
      geminiEnabled: Boolean(process.env.GEMINI_API_KEY),
      geminiModel: process.env.GEMINI_MODEL || 'gemini-2.0-flash',
      googleMapsApiKey: process.env.GOOGLE_MAPS_API_KEY || '',
      maptilerApiKey: process.env.MAPTILER_API_KEY || '',
      campusCoords: { lat: 12.9279, lng: 77.4713 }
    }
  });
});

// ─── CONTACT ENQUIRIES ─────────────────────────────────────────────────────────

/** POST /api/public/contact — submit a contact enquiry (public, no auth) */
router.post('/contact', (req, res) => {
  const { name, email, phone, subject, message } = req.body;
  if (!name || !message)
    return res.status(400).json({ ok: false, msg: 'Name and message are required.' });
  if (message.length < 10)
    return res.status(400).json({ ok: false, msg: 'Message must be at least 10 characters.' });
  db.run(
    `INSERT INTO contact_enquiries (name,email,phone,subject,message) VALUES (?,?,?,?,?)`,
    [name.trim(), email || null, phone || null, subject || 'General Enquiry', message.trim()],
    function(err) {
      if (err) return res.status(500).json({ ok: false, msg: 'Failed to save enquiry.' });
      const eid = this.lastID;
      emitAdminRealtime('contact_enquiry', {
        id: eid,
        name: name.trim(),
        subject: subject || 'General Enquiry',
      });
      res.json({ ok: true, msg: 'Thank you! We will contact you within 24 hours.', id: eid });
    }
  );
});

// ─── RESEARCH ──────────────────────────────────────────────────────────────────

/** GET /api/public/research — return all active publications */
router.get('/research', (req, res) => {
  const { dept, year } = req.query;
  let sql = 'SELECT * FROM research_publications WHERE is_active = 1';
  const params = [];
  if (dept && dept !== 'all') { sql += ' AND dept = ?'; params.push(dept); }
  if (year)                   { sql += ' AND year = ?';  params.push(parseInt(year)); }
  sql += ' ORDER BY year DESC, id DESC';
  db.all(sql, params, (err, rows) => {
    if (err) return res.status(500).json({ ok: false, msg: err.message });
    res.json({ ok: true, data: rows });
  });
});

// ─── STUDENT LIFE STATS ────────────────────────────────────────────────────────

/** GET /api/public/student-stats — aggregate numbers for students.html */
router.get('/student-stats', (req, res) => {
  Promise.all([
    new Promise(r => db.get('SELECT COUNT(*) as c FROM users WHERE role="student"', [], (e, row) => r(row?.c || 0))),
    new Promise(r => db.get('SELECT COUNT(*) as c FROM users WHERE role="doctor"', [],  (e, row) => r(row?.c || 0))),
    new Promise(r => db.get('SELECT COUNT(*) as c FROM hostel_complaints WHERE status="resolved"', [], (e, row) => r(row?.c || 0))),
    new Promise(r => db.get('SELECT COUNT(*) as c FROM admissions WHERE status="accepted"', [], (e, row) => r(row?.c || 0))),
  ]).then(([students, faculty, complaints_resolved, admissions_accepted]) => {
    res.json({
      ok: true,
      data: {
        total_students: students,
        total_faculty: faculty,
        complaints_resolved,
        admissions_accepted,
        // static institutional data
        bds_seats: 100,
        mds_specialities: 9,
        placement_rate: '100%',
        nirf_rank: 34,
      }
    });
  });
});

// ─── COURSES ──────────────────────────────────────────────────────────────────

/** GET /api/public/courses — list all academic programs */
router.get('/courses', (req, res) => {
  const courses = [
    // PhD Programs
    { id: 'phd-omfs', name: "Ph.D in Oral & Maxillofacial Surgery", type: "DOCTORAL", duration: "3 Years", dept: "OMFS", seats: 4, fees: "₹1,50,000/year", description: "Advanced research in surgical treatment of diseases of the head, neck, face, jaws." },
    { id: 'phd-perio', name: "Ph.D in Periodontology", type: "DOCTORAL", duration: "3 Years", dept: "Periodontics", seats: 3, fees: "₹1,50,000/year", description: "Research in prevention and treatment of diseases of supporting tissues of teeth." },
    { id: 'phd-pros', name: "Ph.D in Prosthodontics", type: "DOCTORAL", duration: "3 Years", dept: "Prosthodontics", seats: 3, fees: "₹1,50,000/year", description: "Advanced study in restoration and replacement of missing teeth." },
    { id: 'phd-ortho', name: "Ph.D in Orthodontics", type: "DOCTORAL", duration: "3 Years", dept: "Orthodontics", seats: 3, fees: "₹1,50,000/year", description: "Research in correction of dental and facial irregularities." },
    // MDS Programs
    { id: 'mds-cons', name: "MDS - Conservative Dentistry & Endodontics", type: "POSTGRADUATE", duration: "3 Years", dept: "Conservative", seats: 6, fees: "₹6,25,000/year", description: "Specialized training in preservation of natural teeth." },
    { id: 'mds-path', name: "MDS - Oral Pathology & Microbiology", type: "POSTGRADUATE", duration: "3 Years", dept: "Oral Pathology", seats: 4, fees: "₹5,75,000/year", description: "Study of diseases affecting oral and maxillofacial regions." },
    { id: 'mds-pedo', name: "MDS - Paedodontics", type: "POSTGRADUATE", duration: "3 Years", dept: "Paedodontics", seats: 4, fees: "₹6,00,000/year", description: "Comprehensive care for children's dental health." },
    { id: 'mds-phd', name: "MDS - Public Health Dentistry", type: "POSTGRADUATE", duration: "3 Years", dept: "Public Health", seats: 3, fees: "₹5,50,000/year", description: "Community-based dental care and preventive dentistry." },
    { id: 'mds-omfs', name: "MDS - Oral & Maxillofacial Surgery", type: "POSTGRADUATE", duration: "3 Years", dept: "OMFS", seats: 6, fees: "₹7,00,000/year", description: "Surgical management of oral and maxillofacial conditions." },
    { id: 'mds-ortho', name: "MDS - Orthodontics", type: "POSTGRADUATE", duration: "3 Years", dept: "Orthodontics", seats: 5, fees: "₹6,50,000/year", description: "Diagnosis and treatment of malocclusions." },
    { id: 'mds-perio', name: "MDS - Periodontics", type: "POSTGRADUATE", duration: "3 Years", dept: "Periodontics", seats: 5, fees: "₹6,25,000/year", description: "Management of diseases of gingiva and supporting structures." },
    { id: 'mds-pros', name: "MDS - Prosthodontics", type: "POSTGRADUATE", duration: "3 Years", dept: "Prosthodontics", seats: 5, fees: "₹6,25,000/year", description: "Restoration and replacement of teeth with crowns, bridges." },
    // BDS
    { id: 'bds', name: "Bachelor of Dental Surgery (BDS)", type: "UNDERGRADUATE", duration: "4 Years + 1 Yr Internship", dept: "All Departments", seats: 100, fees: "₹3,50,000/year", description: "Comprehensive undergraduate program covering all aspects of dental sciences." },
    // Certificate
    { id: 'cert-implant', name: "Certificate in Dental Implantology", type: "CERTIFICATE", duration: "1 Year", dept: "Implantology", seats: 10, fees: "₹1,00,000", description: "Intensive training in placement and restoration of dental implants." },
    { id: 'cert-aesthetic', name: "Certificate in Aesthetic Dentistry", type: "CERTIFICATE", duration: "6 Months", dept: "Conservative", seats: 15, fees: "₹75,000", description: "Advanced techniques in smile design and cosmetic restorations." },
    { id: 'cert-oral-surg', name: "Certificate in Minor Oral Surgery", type: "CERTIFICATE", duration: "6 Months", dept: "OMFS", seats: 12, fees: "₹60,000", description: "Training in extractions, biopsy procedures." },
    { id: 'cert-endo', name: "Certificate in Advanced Endodontics", type: "CERTIFICATE", duration: "6 Months", dept: "Conservative", seats: 12, fees: "₹65,000", description: "Microscopic endodontics and retreatment procedures." }
  ];

  const { type } = req.query;
  let result = courses;
  if (type) {
    result = courses.filter(c => c.type === type.toUpperCase());
  }

  res.json({ ok: true, data: result, count: result.length });
});

/** GET /api/public/course/:id — get specific course details */
router.get('/course/:id', (req, res) => {
  const courses = [
    { id: 'phd-omfs', name: "Ph.D in Oral & Maxillofacial Surgery", type: "DOCTORAL", duration: "3 Years", dept: "OMFS", seats: 4, fees: "₹1,50,000/year", eligibility: "MDS in OMFS", description: "Advanced research in surgical treatment of diseases of the head, neck, face, jaws.", careers: ["Academic Professor", "Research Scientist", "Chief Surgeon"], research_areas: ["Trauma Surgery", "Reconstructive Surgery", "Orthognathic Surgery"] },
    { id: 'phd-perio', name: "Ph.D in Periodontology", type: "DOCTORAL", duration: "3 Years", dept: "Periodontics", seats: 3, fees: "₹1,50,000/year", eligibility: "MDS in Periodontics", description: "Research in prevention and treatment of diseases of supporting tissues of teeth.", careers: ["Periodontal Researcher", "Clinical Specialist", "Academic"], research_areas: ["Regenerative Procedures", "Implantology", "Oral Medicine"] },
    { id: 'phd-pros', name: "Ph.D in Prosthodontics", type: "DOCTORAL", duration: "3 Years", dept: "Prosthodontics", seats: 3, fees: "₹1,50,000/year", eligibility: "MDS in Prosthodontics", description: "Advanced study in restoration and replacement of missing teeth.", careers: ["Prosthodontic Specialist", "Maxillofacial Prosthodontist", "Academic"], research_areas: ["Implant Prosthodontics", "Digital Dentistry", "Maxillofacial Rehabilitation"] },
    { id: 'phd-ortho', name: "Ph.D in Orthodontics", type: "DOCTORAL", duration: "3 Years", dept: "Orthodontics", seats: 3, fees: "₹1,50,000/year", eligibility: "MDS in Orthodontics", description: "Research in correction of dental and facial irregularities.", careers: ["Orthodontic Specialist", "Craniofacial Researcher", "Academic"], research_areas: ["Growth Modification", "Invisible Orthodontics", "Surgical Orthodontics"] },
    { id: 'mds-cons', name: "MDS - Conservative Dentistry & Endodontics", type: "POSTGRADUATE", duration: "3 Years", dept: "Conservative", seats: 6, fees: "₹6,25,000/year", eligibility: "BDS with internship", description: "Specialized training in preservation of natural teeth through operative procedures.", careers: ["Endodontist", "Restorative Dentist", "Academic"], subjects: ["Operative Dentistry", "Endodontics", "Dental Materials", "Esthetic Dentistry"] },
    { id: 'mds-path', name: "MDS - Oral Pathology & Microbiology", type: "POSTGRADUATE", duration: "3 Years", dept: "Oral Pathology", seats: 4, fees: "₹5,75,000/year", eligibility: "BDS with internship", description: "Study of diseases affecting oral and maxillofacial regions.", careers: ["Oral Pathologist", "Diagnostic Specialist", "Forensic Odontologist"], subjects: ["Oral Pathology", "Oral Microbiology", "Forensic Odontology", "Immunology"] },
    { id: 'mds-pedo', name: "MDS - Paedodontics", type: "POSTGRADUATE", duration: "3 Years", dept: "Paedodontics", seats: 4, fees: "₹6,00,000/year", eligibility: "BDS with internship", description: "Comprehensive care for children's dental health.", careers: ["Pediatric Dentist", "Special Needs Dentist", "Academic"], subjects: ["Pediatric Dentistry", "Child Psychology", "Preventive Dentistry", "Sedation Techniques"] },
    { id: 'mds-phd', name: "MDS - Public Health Dentistry", type: "POSTGRADUATE", duration: "3 Years", dept: "Public Health", seats: 3, fees: "₹5,50,000/year", eligibility: "BDS with internship", description: "Community-based dental care and preventive dentistry.", careers: ["Public Health Dentist", "Epidemiologist", "Health Administrator"], subjects: ["Dental Public Health", "Epidemiology", "Health Administration", "Biostatistics"] },
    { id: 'mds-omfs', name: "MDS - Oral & Maxillofacial Surgery", type: "POSTGRADUATE", duration: "3 Years", dept: "OMFS", seats: 6, fees: "₹7,00,000/year", eligibility: "BDS with internship", description: "Surgical management of oral and maxillofacial conditions.", careers: ["Oral Surgeon", "Trauma Specialist", "Cosmetic Surgeon"], subjects: ["Oral Surgery", "Anesthesia", "Trauma Management", "Reconstructive Surgery"] },
    { id: 'mds-ortho', name: "MDS - Orthodontics", type: "POSTGRADUATE", duration: "3 Years", dept: "Orthodontics", seats: 5, fees: "₹6,50,000/year", eligibility: "BDS with internship", description: "Diagnosis and treatment of malocclusions.", careers: ["Orthodontist", "Craniofacial Specialist", "Academic"], subjects: ["Orthodontic Theory", "Mechanotherapy", "Craniofacial Growth", "Surgical Orthodontics"] },
    { id: 'mds-perio', name: "MDS - Periodontics", type: "POSTGRADUATE", duration: "3 Years", dept: "Periodontics", seats: 5, fees: "₹6,25,000/year", eligibility: "BDS with internship", description: "Management of diseases of gingiva and supporting structures.", careers: ["Periodontist", "Implantologist", "Clinical Researcher"], subjects: ["Periodontology", "Oral Medicine", "Implantology", "Microbiology"] },
    { id: 'mds-pros', name: "MDS - Prosthodontics", type: "POSTGRADUATE", duration: "3 Years", dept: "Prosthodontics", seats: 5, fees: "₹6,25,000/year", eligibility: "BDS with internship", description: "Restoration and replacement of teeth.", careers: ["Prosthodontist", "Maxillofacial Prosthodontist", "Implantologist"], subjects: ["Complete Dentures", "Removable Partial Dentures", "Fixed Prosthodontics", "Maxillofacial Prosthetics"] },
    { id: 'bds', name: "Bachelor of Dental Surgery (BDS)", type: "UNDERGRADUATE", duration: "4 Years + 1 Yr Internship", dept: "All Departments", seats: 100, fees: "₹3,50,000/year", eligibility: "10+2 with Physics, Chemistry, Biology", description: "Comprehensive undergraduate program covering all aspects of dental sciences.", careers: ["General Dentist", "Private Practitioner", "Government Dental Officer", "MDS Specialization"], subjects: ["Anatomy", "Physiology", "Dental Materials", "Oral Surgery", "Prosthodontics", "Orthodontics", "Periodontics", "Conservative Dentistry", "Oral Medicine", "Paedodontics"] },
    { id: 'cert-implant', name: "Certificate in Dental Implantology", type: "CERTIFICATE", duration: "1 Year", dept: "Implantology", seats: 10, fees: "₹1,00,000", eligibility: "BDS or MDS", description: "Intensive training in placement and restoration of dental implants.", careers: ["Implantologist", "Oral Surgeon", "Prosthodontist"], modules: ["Implant Surgery", "Prosthetic Rehabilitation", "Bone Grafting", "Digital Implant Planning"] },
    { id: 'cert-aesthetic', name: "Certificate in Aesthetic Dentistry", type: "CERTIFICATE", duration: "6 Months", dept: "Conservative", seats: 15, fees: "₹75,000", eligibility: "BDS", description: "Advanced techniques in smile design and cosmetic restorations.", careers: ["Cosmetic Dentist", "Smile Designer", "Private Practitioner"], modules: ["Smile Design", "Veneers", "Teeth Whitening", "Digital Smile Planning"] },
    { id: 'cert-oral-surg', name: "Certificate in Minor Oral Surgery", type: "CERTIFICATE", duration: "6 Months", dept: "OMFS", seats: 12, fees: "₹60,000", eligibility: "BDS", description: "Training in extractions, biopsy procedures.", careers: ["Oral Surgeon", "General Dentist"], modules: ["Exodontia", "Biopsy Techniques", "Wound Management", "Local Anesthesia"] },
    { id: 'cert-endo', name: "Certificate in Advanced Endodontics", type: "CERTIFICATE", duration: "6 Months", dept: "Conservative", seats: 12, fees: "₹65,000", eligibility: "BDS", description: "Microscopic endodontics and retreatment procedures.", careers: ["Endodontist", "Restorative Dentist"], modules: ["Microscopic Endodontics", "Retreatment", "Apical Surgery", "Regenerative Endodontics"] }
  ];

  const course = courses.find(c => c.id === req.params.id);
  if (!course) {
    return res.status(404).json({ ok: false, msg: 'Course not found' });
  }

  res.json({ ok: true, data: course });
});

module.exports = router;
