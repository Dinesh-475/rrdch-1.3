/**
 * RRDCH — server.js
 * Main Express server entry point.
 * Fixed: sqlite3 async API, bcrypt login, Express v4, asyncHandler, JWT expiry, Socket.IO guards.
 */
require('dotenv').config();

// ✅ Bug Fix #7: Crash loudly if JWT_SECRET is missing
if (!process.env.JWT_SECRET) {
  console.error('❌ FATAL: JWT_SECRET is not set in .env');
  process.exit(1);
}

const express  = require('express');
const cors     = require('cors');
const path     = require('path');
const http     = require('http');
const socketIo = require('socket.io');
const morgan   = require('morgan');
const rateLimit = require('express-rate-limit');

const db = require('./server/database');
const { initSockets } = require('./server/utils/socketHandlers');

const app    = express();
const server = http.createServer(app);

// ✅ Bug Fix #4: io guard — initialized before any route can call it
const io = socketIo(server, {
  cors: { origin: '*', methods: ['GET', 'POST'] }
});

const PORT = process.env.PORT || 3000;

// ─── MIDDLEWARE ───────────────────────────────────────────────────────────────
app.disable('x-powered-by');
app.set('trust proxy', 1);

app.use(cors({
  origin: ['http://localhost:3000', 'http://localhost:5500', 'http://127.0.0.1:5500',
           'https://rrdch-webathon-2026.github.io'],
  credentials: true,
  methods: ['GET', 'POST', 'PUT', 'DELETE'],
}));
app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(morgan('dev'));

const apiLimiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  max: 500,
  standardHeaders: true,
  legacyHeaders: false
});
app.use('/api', apiLimiter);

const aiLimiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  max: 120,
  standardHeaders: true,
  legacyHeaders: false,
  message: { ok: false, msg: 'Too many AI requests. Please wait a few minutes.' }
});
const telemetryLimiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  max: 400,
  standardHeaders: true,
  legacyHeaders: false
});

// Serve frontend static files
app.use(express.static(__dirname, {
  etag: true,
  maxAge: '1d',
  setHeaders: (res, filePath) => {
    if (/\.(html)$/i.test(filePath)) {
      res.setHeader('Cache-Control', 'no-cache');
      return;
    }
    if (/\.(js|css|png|jpg|jpeg|gif|svg|webp|ico)$/i.test(filePath)) {
      res.setHeader('Cache-Control', 'public, max-age=86400');
    }
  }
}));

app.get('/api/health', (req, res) => {
  res.json({ ok: true, status: 'healthy', timestamp: new Date().toISOString() });
});

// ─── API ROUTES ───────────────────────────────────────────────────────────────
app.use('/api/auth',         require('./server/routes/auth.routes'));
app.use('/api/public/ai',    aiLimiter, require('./server/routes/ai.public.routes'));
app.use('/api/public/telemetry', telemetryLimiter, require('./server/routes/telemetry.routes'));
app.use('/api/public',       require('./server/routes/public.routes'));
app.use('/api/appointments', require('./server/routes/appointments.routes'));
app.use('/api/patient',      require('./server/routes/patient.routes'));
app.use('/api/student',      require('./server/routes/student.routes'));
app.use('/api/doctor',       require('./server/routes/doctor.routes'));
app.use('/api/admin',        require('./server/routes/admin.routes'));
app.use('/api/admissions',   require('./server/routes/admissions.routes'));
app.use('/api/feedback',     require('./server/routes/feedback.routes'));

// ─── SOCKET.IO REAL-TIME ──────────────────────────────────────────────────────
initSockets(io, db);

// ─── FALLBACK ─────────────────────────────────────────────────────────────────
// ✅ Bug Fix #10: Express v5 compatible catch-all (4 args signature for error handler)
app.get('*', (req, res) => {
  // Only fall back for non-API routes
  if (req.path.startsWith('/api/')) {
    return res.status(404).json({ ok: false, msg: 'API endpoint not found.' });
  }
  res.sendFile(path.join(__dirname, 'index.html'));
});

// ✅ Bug Fix #10: Global error handler (Express v4/v5 compatible — 4 args)
app.use((err, req, res, next) => {  // eslint-disable-line no-unused-vars
  console.error('🔥 Unhandled error:', err.stack);
  res.status(500).json({ ok: false, msg: err.message || 'Internal server error' });
});

// ─── START ────────────────────────────────────────────────────────────────────
server.listen(PORT, () => {
  console.log(`\n🚀 RRDCH Backend running → http://localhost:${PORT}`);
  console.log(`📡 Socket.IO real-time enabled`);
  console.log(`🗄️  Database: ${require('path').resolve(__dirname, 'server/data/rrdch.db')}`);
  console.log(`\n── Demo Credentials ────────────────────────────────`);
  console.log(`  Admin:    admin@rrdch.org     / Admin@RRDCH2026`);
  console.log(`  Student:  BDS2023001           / RRDCH@2023001`);
  console.log(`  Doctor:   pg.001@rrdch.org     / PG@0012026`);
  console.log(`  Patient:  9876543210            / OTP: 123456`);
  console.log(`────────────────────────────────────────────────────\n`);
});
