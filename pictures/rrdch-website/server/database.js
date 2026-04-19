/**
 * RRDCH — database.js
 * SQLite database initialization, schema creation, and seed data.
 * Fixed: directory creation, bcrypt password hashing, full schema.
 */

const sqlite3 = require('sqlite3').verbose();
const bcrypt   = require('bcrypt');
const fs       = require('fs');
const path     = require('path');

const dbPath = path.resolve(__dirname, 'data', 'rrdch.db');

// ✅ Bug Fix #2: Ensure /data directory exists before opening DB
const dbDir = path.dirname(dbPath);
if (!fs.existsSync(dbDir)) fs.mkdirSync(dbDir, { recursive: true });

const db = new sqlite3.Database(dbPath, (err) => {
  if (err) {
    console.error('❌ Error opening database:', err.message);
    process.exit(1);
  }
  console.log('✅ Connected to SQLite database at:', dbPath);
  initSchema();
});

function initSchema() {
  db.serialize(() => {
    db.run('PRAGMA journal_mode=WAL'); // Better concurrency

    // ─── USERS ────────────────────────────────────────────────────────────────
    db.run(`CREATE TABLE IF NOT EXISTS users (
      id           TEXT PRIMARY KEY,
      name         TEXT NOT NULL,
      password     TEXT NOT NULL,
      role         TEXT NOT NULL,
      portal       TEXT,
      email        TEXT,
      phone        TEXT,
      is_active    INTEGER DEFAULT 1,
      created_at   TEXT DEFAULT (datetime('now')),
      last_login   TEXT
    )`);

    // ─── STUDENTS ─────────────────────────────────────────────────────────────
    db.run(`CREATE TABLE IF NOT EXISTS students (
      student_id   TEXT PRIMARY KEY,
      user_id      TEXT,
      year         INTEGER,
      course       TEXT,
      speciality   TEXT,
      batch        TEXT,
      hostel_room  TEXT,
      FOREIGN KEY(user_id) REFERENCES users(id)
    )`);

    // ─── STAFF ────────────────────────────────────────────────────────────────
    db.run(`CREATE TABLE IF NOT EXISTS staff (
      employee_id   TEXT PRIMARY KEY,
      user_id       TEXT,
      department_id INTEGER,
      designation   TEXT,
      joining_date  TEXT,
      FOREIGN KEY(user_id) REFERENCES users(id)
    )`);

    // ─── PATIENTS ─────────────────────────────────────────────────────────────
    db.run(`CREATE TABLE IF NOT EXISTS patients (
      patient_id        TEXT PRIMARY KEY,
      user_id           TEXT,
      name              TEXT NOT NULL,
      dob               TEXT,
      age               INTEGER,
      gender            TEXT,
      blood_group       TEXT,
      address           TEXT,
      emergency_contact TEXT,
      emergency_phone   TEXT,
      registered_date   TEXT DEFAULT (datetime('now')),
      FOREIGN KEY(user_id) REFERENCES users(id)
    )`);

    // ─── DEPARTMENTS ──────────────────────────────────────────────────────────
    db.run(`CREATE TABLE IF NOT EXISTS departments (
      id             INTEGER PRIMARY KEY AUTOINCREMENT,
      name           TEXT NOT NULL,
      short_name     TEXT,
      hod_name       TEXT,
      room_no        TEXT,
      opd_days       TEXT DEFAULT 'Mon-Sat',
      opd_hours      TEXT DEFAULT '9:00 AM - 4:00 PM',
      description    TEXT,
      icon           TEXT,
      equipment_list TEXT
    )`);

    // ─── APPOINTMENTS ─────────────────────────────────────────────────────────
    db.run(`CREATE TABLE IF NOT EXISTS appointments (
      id              TEXT PRIMARY KEY,
      token_no        TEXT,
      patient_id      TEXT,
      patient_name    TEXT,
      patient_phone   TEXT,
      dept_id         INTEGER,
      doctor_id       TEXT,
      date            TEXT,
      time_slot       TEXT,
      chief_complaint TEXT,
      status          TEXT DEFAULT 'booked',
      queue_position  INTEGER,
      notes           TEXT,
      created_at      TEXT DEFAULT (datetime('now')),
      updated_at      TEXT,
      FOREIGN KEY(dept_id) REFERENCES departments(id)
    )`);

    // ─── ATTENDANCE ───────────────────────────────────────────────────────────
    db.run(`CREATE TABLE IF NOT EXISTS attendance (
      id          INTEGER PRIMARY KEY AUTOINCREMENT,
      student_id  TEXT,
      subject_id  INTEGER,
      date        TEXT,
      status      TEXT,
      marked_by   TEXT,
      marked_at   TEXT DEFAULT (datetime('now')),
      FOREIGN KEY(student_id) REFERENCES students(student_id)
    )`);

    // ─── SUBJECTS ─────────────────────────────────────────────────────────────
    db.run(`CREATE TABLE IF NOT EXISTS subjects (
      id        INTEGER PRIMARY KEY AUTOINCREMENT,
      name      TEXT,
      code      TEXT,
      dept_id   INTEGER,
      year      INTEGER,
      semester  INTEGER,
      credits   INTEGER
    )`);

    // ─── MARKS ────────────────────────────────────────────────────────────────
    db.run(`CREATE TABLE IF NOT EXISTS marks (
      id         INTEGER PRIMARY KEY AUTOINCREMENT,
      student_id TEXT,
      subject_id INTEGER,
      semester   INTEGER,
      internal   INTEGER,
      external   INTEGER,
      total      INTEGER,
      max_marks  INTEGER DEFAULT 100,
      grade      TEXT,
      result     TEXT,
      exam_date  TEXT
    )`);

    // ─── FEES ─────────────────────────────────────────────────────────────────
    db.run(`CREATE TABLE IF NOT EXISTS fees (
      id             INTEGER PRIMARY KEY AUTOINCREMENT,
      student_id     TEXT,
      fee_type       TEXT,
      semester       INTEGER,
      amount         REAL,
      due_date       TEXT,
      paid_date      TEXT,
      receipt_no     TEXT,
      status         TEXT DEFAULT 'pending',
      payment_method TEXT,
      transaction_id TEXT
    )`);

    // ─── HOSTEL COMPLAINTS ────────────────────────────────────────────────────
    db.run(`CREATE TABLE IF NOT EXISTS hostel_complaints (
      id               TEXT PRIMARY KEY,
      student_id       TEXT,
      room_no          TEXT,
      category         TEXT,
      description      TEXT NOT NULL,
      urgency          TEXT DEFAULT 'medium',
      status           TEXT DEFAULT 'pending',
      assigned_to      TEXT,
      resolution_notes TEXT,
      created_at       TEXT DEFAULT (datetime('now')),
      updated_at       TEXT,
      resolved_at      TEXT
    )`);

    // ─── EVENTS ───────────────────────────────────────────────────────────────
    db.run(`CREATE TABLE IF NOT EXISTS events (
      id                INTEGER PRIMARY KEY AUTOINCREMENT,
      title             TEXT NOT NULL,
      type              TEXT,
      date              TEXT,
      end_date          TEXT,
      venue             TEXT,
      description       TEXT,
      image_url         TEXT,
      registration_link TEXT,
      is_published      INTEGER DEFAULT 1,
      created_by        TEXT,
      created_at        TEXT DEFAULT (datetime('now'))
    )`);

    // ─── CIRCULARS ────────────────────────────────────────────────────────────
    db.run(`CREATE TABLE IF NOT EXISTS circulars (
      id           INTEGER PRIMARY KEY AUTOINCREMENT,
      title        TEXT NOT NULL,
      category     TEXT,
      date         TEXT DEFAULT (date('now')),
      file_url     TEXT,
      is_important INTEGER DEFAULT 0,
      created_at   TEXT DEFAULT (datetime('now'))
    )`);

    // ─── MANAGEMENT ───────────────────────────────────────────────────────────
    db.run(`CREATE TABLE IF NOT EXISTS management (
      id          INTEGER PRIMARY KEY AUTOINCREMENT,
      name        TEXT NOT NULL,
      designation TEXT,
      bio         TEXT,
      image_path  TEXT,
      sort_order  INTEGER DEFAULT 0
    )`);

    // ─── FEEDBACK ─────────────────────────────────────────────────────────────
    db.run(`CREATE TABLE IF NOT EXISTS feedback (
      id            INTEGER PRIMARY KEY AUTOINCREMENT,
      user_id       TEXT,
      feedback_type TEXT,
      dept_id       INTEGER,
      ratings_json  TEXT,
      comment       TEXT,
      submitted_at  TEXT DEFAULT (datetime('now'))
    )`);

    // ─── ADMISSIONS ───────────────────────────────────────────────────────────
    db.run(`CREATE TABLE IF NOT EXISTS admissions (
      id             TEXT PRIMARY KEY,
      applicant_name TEXT NOT NULL,
      dob            TEXT,
      category       TEXT,
      course         TEXT,
      speciality     TEXT,
      neet_score     INTEGER,
      neet_rank      INTEGER,
      phone          TEXT,
      email          TEXT,
      state          TEXT,
      address        TEXT,
      documents_json TEXT,
      status         TEXT DEFAULT 'submitted',
      created_at     TEXT DEFAULT (datetime('now')),
      updated_at     TEXT
    )`);

    // ─── STATS ────────────────────────────────────────────────────────────────
    db.run(`CREATE TABLE IF NOT EXISTS stats (
      key        TEXT PRIMARY KEY,
      value      INTEGER,
      suffix     TEXT,
      label      TEXT,
      updated_at TEXT DEFAULT (datetime('now'))
    )`);

    // ─── ACHIEVEMENTS ─────────────────────────────────────────────────────────
    db.run(`CREATE TABLE IF NOT EXISTS achievements (
      id         INTEGER PRIMARY KEY AUTOINCREMENT,
      text       TEXT,
      icon       TEXT,
      is_active  INTEGER DEFAULT 1,
      sort_order INTEGER DEFAULT 0
    )`);

    // ─── TICKER ITEMS ─────────────────────────────────────────────────────────
    db.run(`CREATE TABLE IF NOT EXISTS ticker_items (
      id         INTEGER PRIMARY KEY AUTOINCREMENT,
      content_en TEXT,
      content_kn TEXT,
      is_active  INTEGER DEFAULT 1,
      sort_order INTEGER DEFAULT 0
    )`);

    // ─── ACTIVITY LOG ─────────────────────────────────────────────────────────
    db.run(`CREATE TABLE IF NOT EXISTS activity_log (
      id         INTEGER PRIMARY KEY AUTOINCREMENT,
      type       TEXT NOT NULL,
      actor_id   TEXT,
      actor_name TEXT,
      action     TEXT NOT NULL,
      entity_id  TEXT,
      ip         TEXT,
      created_at TEXT DEFAULT (datetime('now'))
    )`);

    // ─── ANONYMOUS TRAFFIC / UX TELEMETRY ────────────────────────────────────
    db.run(`CREATE TABLE IF NOT EXISTS traffic_events (
      id          INTEGER PRIMARY KEY AUTOINCREMENT,
      session_id  TEXT NOT NULL,
      path        TEXT,
      event_type  TEXT NOT NULL,
      target      TEXT,
      meta_json   TEXT,
      lat         REAL,
      lng         REAL,
      user_agent  TEXT,
      ip          TEXT,
      created_at  TEXT DEFAULT (datetime('now'))
    )`);

    // ─── LOGIN SESSIONS (audit / admin visibility) ───────────────────────────
    db.run(`CREATE TABLE IF NOT EXISTS login_sessions (
      id             INTEGER PRIMARY KEY AUTOINCREMENT,
      user_id        TEXT NOT NULL,
      role           TEXT,
      ip             TEXT,
      user_agent     TEXT,
      session_token  TEXT UNIQUE,
      login_at       TEXT DEFAULT (datetime('now'))
    )`);

    // ─── CONTACT ENQUIRIES ────────────────────────────────────────────────────
    db.run(`CREATE TABLE IF NOT EXISTS contact_enquiries (
      id         INTEGER PRIMARY KEY AUTOINCREMENT,
      name       TEXT NOT NULL,
      email      TEXT,
      phone      TEXT,
      subject    TEXT,
      message    TEXT NOT NULL,
      status     TEXT DEFAULT 'new',
      created_at TEXT DEFAULT (datetime('now'))
    )`);

    // ─── RESEARCH PUBLICATIONS ────────────────────────────────────────────────
    db.run(`CREATE TABLE IF NOT EXISTS research_publications (
      id        INTEGER PRIMARY KEY AUTOINCREMENT,
      title     TEXT NOT NULL,
      authors   TEXT,
      journal   TEXT,
      year      INTEGER,
      doi       TEXT,
      dept      TEXT,
      abstract  TEXT,
      is_active INTEGER DEFAULT 1
    )`);

    // Seed all data after tables are created
    setTimeout(seedData, 500);
  });
}

// ✅ Bug Fix #6: All passwords hashed with bcrypt
function seedData() {
  db.get('SELECT COUNT(*) as c FROM users', (err, row) => {
    if (err || row.c > 0) return; // Already seeded

    console.log('🌱 Seeding initial database...');

    const SALT = 10;
    const usersToSeed = [
      { id: 'admin@rrdch.org',    name: 'Administrator',   pass: 'Admin@RRDCH2026',  role: 'admin',   portal: 'admin' },
      { id: 'BDS2023001',         name: 'Ananya Sharma',   pass: 'RRDCH@2023001',    role: 'student', portal: 'student' },
      { id: 'BDS2022047',         name: 'Rajan Menon',     pass: 'RRDCH@2022047',    role: 'student', portal: 'student' },
      { id: 'pg.001@rrdch.org',   name: 'Dr. Ravi Kumar',  pass: 'PG@0012026',       role: 'doctor',  portal: 'doctor' },
      { id: 'hod.ortho@rrdch.org',name: 'Dr. M. Suresh',  pass: 'HOD@Ortho2026',    role: 'hod',     portal: 'admin' },
      { id: '9876543210',         name: 'Ramesh Naidu',    pass: 'OTP_LOGIN',        role: 'patient', portal: 'patient' },
      { id: '9812345678',         name: 'Kavitha Reddy',   pass: 'OTP_LOGIN',        role: 'patient', portal: 'patient' },
    ];

    let processed = 0;
    usersToSeed.forEach(u => {
      bcrypt.hash(u.pass, SALT, (err, hash) => {
        db.run(
          'INSERT OR IGNORE INTO users (id,name,password,role,portal) VALUES (?,?,?,?,?)',
          [u.id, u.name, hash, u.role, u.portal]
        );
        processed++;
        if (processed === usersToSeed.length) seedManagement();
      });
    });
  });
}

function seedManagement() {
  const leaders = [
    [1, 'Dr. A. C. Shanmugam', 'Chairman', 'A visionary leader dedicated to quality dental education since 1992.', 'assets/images/management/chairman.jpg', 1],
    [2, 'Sri. A. C. S. Arunkumar', 'Vice Chairman', 'Focusing on technological advancement and student welfare.', 'assets/images/management/arun.jpg', 2],
    [3, 'Dr. S. Savitha', 'Principal', 'Leading academic excellence and clinical standards.', 'assets/images/management/principal.jpg', 3],
  ];
  leaders.forEach(l => db.run('INSERT OR IGNORE INTO management VALUES (?,?,?,?,?,?)', l));
  seedStudents();
}

function seedStudents() {
  db.run(`INSERT OR IGNORE INTO students VALUES ('BDS2023001','BDS2023001',3,'BDS',null,'2023-2028','G-204')`);
  db.run(`INSERT OR IGNORE INTO students VALUES ('BDS2022047','BDS2022047',4,'BDS',null,'2022-2027','G-118')`);
  seedDepartments();
}

function seedDepartments() {
  db.get('SELECT COUNT(*) as c FROM departments', (err, row) => {
    if (err || row.c > 0) return seedStats();
    const depts = [
      [1,'Oral & Maxillofacial Surgery','OMFS','Dr. Mamatha. N. S.','OPD-1','Mon-Sat','9:00 AM – 4:00 PM','Expert surgical care for jaw, facial trauma, impactions, orthognathic surgery, and implant placement.','🦷','["Electrosurgery Unit","Piezo Surgery","Implant Motor","C-ARM","CBCT"]'],
      [2,'Conservative Dentistry & Endodontics','CDE','Dr. Annapoorna B M','OPD-2','Mon-Sat','9:00 AM – 4:00 PM','Comprehensive tooth restoration, root canal treatment, cavity management and aesthetic dentistry.','🔬','["Rotary Endo System","Operating Microscope","Apex Locator","Curing Light","Laser"]'],
      [3,'Orthodontics & Dentofacial Orthopedics','ORTHO','Dr. Rajkumar S. Alle','OPD-3','Mon-Sat','9:00 AM – 4:00 PM','Correction of misaligned teeth and jaws using braces, clear aligners, and functional appliances.','😁','["Digital Scanner","Self-Ligating Brackets","Clear Aligner System","Cephalometric X-Ray"]'],
      [4,'Prosthodontics, Crown & Bridge','PROS','Dr. Gautam Shetty','OPD-4','Mon-Sat','9:00 AM – 4:00 PM','Restoration and replacement of missing or damaged teeth with crowns, bridges, dentures, and implants.','👑','["CAD/CAM System","Digital Impressions","Ceramics Oven","Articulators"]'],
      [5,'Periodontology','PERIO','Dr. Savita S.','OPD-5','Mon-Sat','9:00 AM – 4:00 PM','Comprehensive gum disease treatment including scaling, root planing, flap surgeries, and bone grafting.','🌿','["Ultrasonic Scaler","Laser","Bone Graft Materials","PRF System"]'],
      [6,'Oral Pathology & Microbiology','OPM','Dr. Girish H. C.','OPD-6','Mon-Sat','9:00 AM – 4:00 PM','Histopathology, biopsy analysis, oral cancer screening, and microbiological diagnostics.','🧬','["Real-Time PCR","Microscopes","Biopsy Kit","Flow Cytometer"]'],
      [7,'Oral Medicine & Radiology','OMR','Dr. Sujatha S.','OPD-7','Mon-Sat','9:00 AM – 4:00 PM','TMJ disorders, oral medicine diagnosis, digital X-rays, and advanced CBCT imaging.','📡','["CBCT Unit (2015)","OPG Machine","Digital Periapical","RVG System"]'],
      [8,'Pediatric & Preventive Dentistry','PED','Dr. Navin Hadadi','OPD-8','Mon-Sat','9:00 AM – 4:00 PM','Child-friendly dental care including milk tooth treatments, fluoride therapy, sealants, and early orthodontic guidance.','🧒','["Nitrous Oxide Sedation","Pit & Fissure Sealant Kit","Fluoride Gel"]'],
      [9,'Public Health Dentistry','PHD','Dr. Shweta Somsundara Nayak','OPD-9','Mon-Sat','9:00 AM – 4:00 PM','Community dental health programs, awareness camps, anti-tobacco drives, and school dental screening.','🏘️','["Mobile Dental Unit","Screening Kits","AV Equipment"]'],
      [10,'Oral Implantology','IMPL','Dr. mamatha. N. S.','OPD-10','Mon-Sat','9:00 AM – 3:00 PM','Certificate program in full implant placement, bone augmentation, and guided surgery under PG supervision.','💎','["Implant Motor","Guided Surgery Kit","Piezo Surgery","CBCT Guided Templates"]'],
    ];
    depts.forEach(d => db.run(
      'INSERT OR IGNORE INTO departments (id,name,short_name,hod_name,room_no,opd_days,opd_hours,description,icon,equipment_list) VALUES (?,?,?,?,?,?,?,?,?,?)', d
    ));
    seedCirculars();
  });
}

function seedCirculars() {
  const circulars = [
    [1, 'Workshop on Zygomatic and Pterygoid Implant', 'Academic', '2026-04-09', '#', 1],
    [2, 'National Dentist Day Celebrations 2026', 'Event', '2026-03-07', '#', 0],
    [3, 'BDS Examination Fee Notification - August 2022', 'Fee', '2022-07-02', '#', 1],
  ];
  circulars.forEach(c => db.run('INSERT OR IGNORE INTO circulars VALUES (?,?,?,?,?,?,?)', c));
  seedStats();
}

function seedStats() {
  db.get('SELECT COUNT(*) as c FROM stats', (err, row) => {
    if (err || row.c > 0) return seedAchievements();
    const stats = [
      ['years',       32,   '+',  'Years of Excellence'],
      ['chairs',      250,  '',   'Electronic Dental Units'],
      ['patients',    500,  '+',  'Daily OPD Patients'],
      ['placement',   100,  '%',  'Placement Rate (BDS & MDS)'],
      ['beds',        1000, '+',  'Bedded Hospital Facility'],
      ['staff',       100,  '+',  'Academic Staff'],
      ['bds_students',500,  '+',  'Undergraduates'],
      ['mds_students',50,   '+',  'Postgraduates'],
    ];
    stats.forEach(s => db.run('INSERT OR IGNORE INTO stats (key,value,suffix,label) VALUES (?,?,?,?)', s));
    seedAchievements();
  });
}

function seedAchievements() {
  db.get('SELECT COUNT(*) as c FROM achievements', (err, row) => {
    if (err || row.c > 0) return seedEvents();
    const achievements = [
      ['NAAC \'A\' Grade, NABH, ISO, IAO, HLACT Accredited','🏆',1,1],
      ['Royal College of Glasgow MFDS Exam Centre','🌍',1,2],
      ['STS-ICMR 2024 Research Grants Secured','🔬',1,3],
      ['Provisional Ethics Committee Certified','✅',1,4],
      ['State Zonal Karate Championship Selection 2026','🏅',1,5],
      ['Women\'s Cricket 2nd Runner-Up March 2026','🏏',1,6],
      ['RRCE Benchmarked: 86th in DATAQUEST 2026','📊',1,7],
      ['Real-Time PCR and CBCT Advanced Clinics','📡',1,8],
      ['Affiliated with RGUHS & Recognized by DCI, SLMC','🎓',1,9],
      ['REACH Intl Partnership: Global Care Initiatives','🤝',1,10],
    ];
    achievements.forEach(a => db.run(
      'INSERT OR IGNORE INTO achievements (text,icon,is_active,sort_order) VALUES (?,?,?,?)', a
    ));
    seedEvents();
  });
}

function seedEvents() {
  db.get('SELECT COUNT(*) as c FROM events', (err, row) => {
    if (err || row.c > 0) return seedTicker();
    const events = [
      ['CDE Program: Advances in Implantology','academic','2026-04-20','2026-04-20','Auditorium, RRDCH','A full-day continuing dental education program covering latest implant techniques. Open to BDS, MDS, and practising dentists.',null,1,'admin@rrdch.org'],
      ['RGUHS Internal Exams — BDS Year 2','academic','2026-04-25','2026-04-30','All Lecture Halls','University internal practical and theory examinations for second-year BDS students.',null,1,'admin@rrdch.org'],
      ['Annual Sports Day — YUDDHAM 2026','sports','2026-04-30','2026-04-30','Sports Ground, RRDCH','Annual intercollege sports meet featuring football, cricket, volleyball, and athletics competitions.',null,1,'admin@rrdch.org'],
      ['Free Oral Cancer Screening Camp','community','2026-05-05','2026-05-05','Public Health Dept','Open to all Bengaluru residents. Free oral cancer screening, tobacco cessation counselling, and dental checkup.',null,1,'admin@rrdch.org'],
      ['Workshop: Orthodontic Aligner Therapy','academic','2026-05-12','2026-05-12','Lecture Hall 2','Hands-on workshop on clear aligner planning, case selection, and clinical management. Limited seats.',null,1,'admin@rrdch.org'],
      ['Blood Donation Camp','community','2026-05-15','2026-05-15','Auditorium Foyer, RRDCH','Annual blood donation drive in collaboration with Victoria Hospital Blood Bank. All students and staff welcome.',null,1,'admin@rrdch.org'],
      ['Guest Lecture: Digital Dentistry & AI','academic','2026-05-22','2026-05-22','Seminar Hall 1','International speaker lecture on AI in dental diagnostics and CAD/CAM workflow integration.',null,1,'admin@rrdch.org'],
      ['SPANDAN Cultural Festival 2026','cultural','2026-06-05','2026-06-07','Auditorium & Campus','Three-day annual cultural extravaganza with music, dance, drama, fine arts, and sports. RRDCH\'s biggest cultural event.',null,1,'admin@rrdch.org'],
      ['Anti-Tobacco Day Camp','community','2026-05-31','2026-05-31','RRDCH Campus & Nearby Schools','World No Tobacco Day campus programme with oral cancer screenings, awareness drives, and de-addiction counselling.',null,1,'admin@rrdch.org'],
      ['Inter-College Dental Quiz Championship','academic','2026-06-15','2026-06-15','Auditorium, RRDCH','Annual dental knowledge competition open to all dental colleges in Karnataka. Judged by senior faculty.',null,1,'admin@rrdch.org'],
    ];
    events.forEach(e => db.run(
      'INSERT OR IGNORE INTO events (title,type,date,end_date,venue,description,registration_link,is_published,created_by) VALUES (?,?,?,?,?,?,?,?,?)', e
    ));
    seedTicker();
  });
}

function seedTicker() {
  db.get('SELECT COUNT(*) as c FROM ticker_items', (err, row) => {
    if (err || row.c > 0) return seedAppointments();
    const items = [
      ['🏥 OPD Open Today — 9:00 AM to 5:00 PM','🏥 ಓಪಿಡಿ ಇಂದು ತೆರೆದಿದೆ — 9:00 AM ರಿಂದ 5:00 PM',1,1],
      ['⏱️ Estimated Wait Time: ~15 mins','⏱️ ಅಂದಾಜು ಕಾಯುವ ಸಮಯ: ~15 ನಿಮಿಷ',1,2],
      ['📢 CDE Program: "Advances in Implantology" — April 20, 2026 — Auditorium, 10 AM','📢 CDE ಕಾರ್ಯಕ್ರಮ: ಏಪ್ರಿಲ್ 20 — ಸಭಾಂಗಣ',1,3],
      ['✅ 643 Patients Treated Today','✅ ಇಂದು 643 ರೋಗಿಗಳಿಗೆ ಚಿಕಿತ್ಸೆ ನೀಡಲಾಗಿದೆ',1,4],
      ['🎓 BDS Admissions 2026–27 Now Open — Call +91-9743277777','🎓 BDS ಪ್ರವೇಶ 2026–27 ಈಗ ತೆರೆದಿದೆ',1,5],
      ['🏆 RRDCH Ranked #34 Dental College in India — NIRF 2022','🏆 RRDCH ಭಾರತದಲ್ಲಿ #34 ನೇ ದಂತ ಕಾಲೇಜು',1,6],
    ];
    items.forEach(i => db.run(
      'INSERT OR IGNORE INTO ticker_items (content_en,content_kn,is_active,sort_order) VALUES (?,?,?,?)', i
    ));
    seedAppointments();
  });
}

function seedAppointments() {
  db.get('SELECT COUNT(*) as c FROM appointments', (err, row) => {
    if (err || row.c > 0) return seedAttendance();
    const today = new Date().toISOString().split('T')[0];
    const yesterday = new Date(Date.now() - 86400000).toISOString().split('T')[0];
    db.run(`INSERT OR IGNORE INTO appointments VALUES (?,?,?,?,?,?,?,?,?,?,?,?,?,datetime('now'),?)`,
      ['APT-20260420-001','A-041',null,'Ramesh Naidu','9876543210',3,null,today,'10:00 AM','Tooth misalignment','booked',1,null,null]);
    db.run(`INSERT OR IGNORE INTO appointments VALUES (?,?,?,?,?,?,?,?,?,?,?,?,?,datetime('now'),?)`,
      ['APT-20260420-002','A-042',null,'Kavitha Reddy','9812345678',2,null,today,'10:30 AM','Tooth pain','confirmed',2,null,null]);
    db.run(`INSERT OR IGNORE INTO appointments VALUES (?,?,?,?,?,?,?,?,?,?,?,?,?,datetime('now'),?)`,
      ['APT-20260419-015','A-015',null,'Srinivas Rao','9988776655',5,null,yesterday,'11:00 AM','Gum bleeding','done',null,'Scaling done, review in 6 months',null]);
    seedAttendance();
  });
}

function seedAttendance() {
  db.get('SELECT COUNT(*) as c FROM subjects', (err, row) => {
    if (err || row.c > 0) return seedFees();
    // Seed subjects for BDS Year 3 Sem 5
    const subjects = [
      ['Oral & Maxillofacial Surgery III',  'OMFS301', 3, 3, 5, 4],
      ['Conservative Dentistry II',          'CDE302',  2, 3, 5, 4],
      ['Orthodontics I',                     'ORT303',  3, 3, 5, 3],
      ['Oral Pathology II',                  'OPM304',  6, 3, 5, 3],
      ['Prosthodontics I',                   'PRO305',  4, 3, 5, 4],
    ];
    subjects.forEach(s => db.run('INSERT OR IGNORE INTO subjects (name,code,dept_id,year,semester,credits) VALUES (?,?,?,?,?,?)', s));

    // Attendance for Ananya Sharma (BDS2023001)
    const attData = [
      // [subject_id, total=30 classes: 24P, 6A ≈ 80%]
      {sid:1, P:25, A:5}, {sid:2, P:22, A:8}, {sid:3, P:27, A:3}, {sid:4, P:24, A:6}, {sid:5, P:21, A:9},
    ];
    attData.forEach(a => {
      for (let i = 0; i < a.P; i++)
        db.run('INSERT OR IGNORE INTO attendance (student_id,subject_id,date,status) VALUES (?,?,date("now",?),?)',
          ['BDS2023001', a.sid, `-${i} days`, 'P']);
      for (let i = a.P; i < a.P + a.A; i++)
        db.run('INSERT OR IGNORE INTO attendance (student_id,subject_id,date,status) VALUES (?,?,date("now",?),?)',
          ['BDS2023001', a.sid, `-${i} days`, 'A']);
    });

    // Marks for Ananya Sharma — Semester 4
    const marksData = [
      [1, 4, 36, 54, 90, 100, 'A+', 'PASS'],
      [2, 4, 32, 51, 83, 100, 'A',  'PASS'],
      [3, 4, 38, 56, 94, 100, 'O',  'PASS'],
      [4, 4, 30, 48, 78, 100, 'B+', 'PASS'],
      [5, 4, 33, 52, 85, 100, 'A',  'PASS'],
    ];
    marksData.forEach(m => db.run(
      'INSERT OR IGNORE INTO marks (student_id,subject_id,semester,internal,external,total,max_marks,grade,result) VALUES (?,?,?,?,?,?,?,?,?)',
      ['BDS2023001', m[0], m[1], m[2], m[3], m[4], m[5], m[6], m[7]]
    ));

    seedFees();
  });
}

function seedFees() {
  db.get('SELECT COUNT(*) as c FROM fees', (err, row) => {
    if (err || row.c > 0) return seedComplaints();
    db.run('INSERT OR IGNORE INTO fees (student_id,fee_type,semester,amount,due_date,status) VALUES (?,?,?,?,?,?)',
      ['BDS2023001','Tuition Fee',5,45000,'2026-05-15','pending']);
    db.run('INSERT OR IGNORE INTO fees (student_id,fee_type,semester,amount,due_date,paid_date,receipt_no,status,payment_method) VALUES (?,?,?,?,?,?,?,?,?)',
      ['BDS2023001','Hostel Fee',4,18000,'2026-01-10','2026-01-08','RCT-2024-0312','paid','razorpay']);
    db.run('INSERT OR IGNORE INTO fees (student_id,fee_type,semester,amount,due_date,paid_date,receipt_no,status,payment_method) VALUES (?,?,?,?,?,?,?,?,?)',
      ['BDS2023001','Examination Fee',5,3500,'2026-04-30',null,null,'pending',null]);
    seedComplaints();
  });
}

function seedComplaints() {
  db.get('SELECT COUNT(*) as c FROM hostel_complaints', (err, row) => {
    if (err || row.c > 0) return seedActivityLog();
    db.run('INSERT OR IGNORE INTO hostel_complaints (id,student_id,room_no,category,description,urgency,status,resolved_at) VALUES (?,?,?,?,?,?,?,?)',
      ['HC-20260410-001','BDS2023001','G-204','Electrical','Tubelight in room not working for 3 days.','medium','resolved',new Date().toISOString()]);
    db.run('INSERT OR IGNORE INTO hostel_complaints (id,student_id,room_no,category,description,urgency,status) VALUES (?,?,?,?,?,?,?)',
      ['HC-20260412-002','BDS2023001','G-204','Plumbing','Water tap leaking in bathroom. Needs urgent repair.','high','pending']);
    seedActivityLog();
  });
}

function seedActivityLog() {
  db.get('SELECT COUNT(*) as c FROM activity_log', (err, row) => {
    if (err || row.c > 0) return seedResearch();
    const logs = [
      ['LOGIN',  'admin@rrdch.org', 'Administrator',      'Logged in successfully', null, '127.0.0.1'],
      ['LOGIN',  'BDS2023001',      'Ananya Sharma',       'Logged in successfully', null, '127.0.0.1'],
      ['CREATE', 'admin@rrdch.org', 'Administrator',      'Created new event: CDE Program on Implantology', '1', null],
      ['CREATE', 'admin@rrdch.org', 'Administrator',      'Published circular: Workshop on Zygomatic Implants', '1', null],
      ['UPDATE', 'admin@rrdch.org', 'Administrator',      'Updated appointment APT-20260420-001 → in_queue', 'APT-20260420-001', null],
    ];
    logs.forEach(l => db.run(
      'INSERT OR IGNORE INTO activity_log (type,actor_id,actor_name,action,entity_id,ip) VALUES (?,?,?,?,?,?)', l
    ));
    seedResearch();
  });
}

function seedResearch() {
  db.get('SELECT COUNT(*) as c FROM research_publications', (err, row) => {
    if (err || row.c > 0) {
      console.log('✅ Database seeding complete!');
      return;
    }
    const pubs = [
      [
        'Salivary Biomarkers in Early Oral Cancer Detection: A Real-Time PCR Study',
        'Dr. S. Hebbale, Dr. K. Venkataraman, Dr. R. Nair',
        'Journal of Oral & Maxillofacial Surgery', 2026,
        '10.1016/j.joms.2026.01.042',
        'Oral Pathology & Microbiology',
        'This study identifies salivary proteomic markers that distinguish early-stage oral squamous cell carcinoma from healthy controls using real-time PCR methodology developed at RRDCH.'
      ],
      [
        '3D CBCT Analysis of Temporomandibular Joint Disorders in South Indian Population',
        'Dr. S. Hebbale, Dr. S. Kumar, Dr. P. Rao',
        'Oral Surgery, Oral Medicine, Oral Pathology and Oral Radiology', 2025,
        '10.1016/j.oooo.2025.08.019',
        'Oral Medicine & Radiology',
        'Cone Beam Computed Tomography-based morphometric analysis of TMJ in 320 South Indian subjects, establishing reference norms for the regional population.'
      ],
      [
        'Laser-Assisted Periodontal Therapy vs. Scaling: A Randomized Controlled Trial',
        'Dr. K. Nair, Dr. M. Shankar, Dr. T. Rao',
        'Journal of Clinical Periodontology', 2025,
        '10.1111/jcpe.2025.14219',
        'Periodontology',
        'A 12-month RCT comparing Er:YAG laser-assisted debridement with conventional scaling in 148 chronic periodontitis patients, measuring CAL gain and BOP reduction.'
      ],
      [
        'Mini-implant Assisted Skeletal Anchorage in Class III Malocclusion: 5-Year Follow-up',
        'Dr. A. Krishnan, Dr. V. Menon',
        'Angle Orthodontist', 2025,
        '10.2319/angle.2025.01.188',
        'Orthodontics',
        'Long-term outcomes of skeletal anchorage using palatal mini-implants in 42 Class III adult patients with a 5-year follow-up period.'
      ],
      [
        'CAD/CAM vs. Conventional Complete Dentures: Patient Satisfaction and Occlusal Stability',
        'Dr. R. Prasad, Dr. L. Shetty',
        'Journal of Prosthetic Dentistry', 2024,
        '10.1016/j.prosdent.2024.12.031',
        'Prosthodontics',
        'Comparative study of 60 edentulous patients randomized to CAD/CAM milled vs. conventional heat-cured complete dentures, measuring VAS satisfaction, chewing efficiency and occlusal force distribution.'
      ],
    ];
    pubs.forEach(p => db.run(
      `INSERT INTO research_publications (title,authors,journal,year,doi,dept,abstract) VALUES (?,?,?,?,?,?,?)`, p
    ));
    console.log('✅ Database seeding complete!');
  });
}

module.exports = db;
