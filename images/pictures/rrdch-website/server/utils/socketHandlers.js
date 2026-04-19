/**
 * RRDCH — socketHandlers.js
 * Socket.IO event handlers and OPD queue simulation.
 */
const jwt = require('jsonwebtoken');

let ioInstance = null;
let queueSimInterval = null;

/**
 * Initialize Socket.IO with the server instance.
 * @param {object} io - Socket.IO server
 * @param {object} db - SQLite DB
 */
function initSockets(io, db) {
  ioInstance = io;

  io.on('connection', (socket) => {
    console.log(`🔗 Socket connected: ${socket.id}`);

    socket.on('join_admin', () => {
      const token = socket.handshake.query?.token || socket.handshake.auth?.token;
      if (!token || !process.env.JWT_SECRET) return;
      try {
        const u = jwt.verify(token, process.env.JWT_SECRET);
        if (u.role !== 'admin' && u.role !== 'hod') return;
        socket.join('admin_room');
        socket.emit('admin_joined', { ok: true });
      } catch {
        socket.emit('admin_joined', { ok: false });
      }
    });

    // Patient joins their department room for queue updates
    socket.on('join_dept', ({ dept_id }) => {
      socket.join(`dept_${dept_id}`);
      console.log(`Socket ${socket.id} joined dept_${dept_id}`);
    });

    // Student joins personal room for notifications
    socket.on('join_student', ({ student_id }) => {
      socket.join(`student_${student_id}`);
    });

    socket.on('disconnect', () => {
      console.log(`❌ Socket disconnected: ${socket.id}`);
    });
  });

  // Start queue simulation
  startQueueSimulation(io, db);
}

/**
 * Simulates OPD queue advancement every 30 seconds.
 */
function startQueueSimulation(io, db) {
  if (queueSimInterval) clearInterval(queueSimInterval);

  queueSimInterval = setInterval(() => {
    const today = new Date().toISOString().split('T')[0];

    // Get all departments with active appointments today
    db.all(
      `SELECT DISTINCT dept_id FROM appointments WHERE date = ? AND status IN ('booked','confirmed','in_queue','called')`,
      [today],
      (err, depts) => {
        if (err || !depts.length) return;

        depts.forEach(({ dept_id }) => {
          db.all(
            `SELECT * FROM appointments WHERE date = ? AND dept_id = ? AND status IN ('booked','confirmed','in_queue','called') ORDER BY token_no ASC`,
            [today, dept_id],
            (err, appts) => {
              if (err || !appts.length) return;

              const nowServing = appts[0];
              const next5 = appts.slice(1, 6).map(a => a.token_no);
              const waitingCount = appts.length;

              // Emit queue update to department room
              io.to(`dept_${dept_id}`).emit('queue_update', {
                dept_id,
                now_serving: nowServing.token_no,
                next_5: next5,
                waiting_count: waitingCount,
                updated_at: new Date().toISOString(),
              });

              // Advance first 'booked' to 'in_queue'
              if (nowServing.status === 'booked' || nowServing.status === 'confirmed') {
                db.run(
                  `UPDATE appointments SET status = 'in_queue', queue_position = 1, updated_at = datetime('now') WHERE id = ?`,
                  [nowServing.id]
                );
              }
            }
          );
        });
      }
    );
  }, 30000); // every 30 seconds
}

/**
 * Emit a new announcement to all connected clients.
 */
function emitAnnouncement(title, content, type = 'info') {
  if (ioInstance) {
    ioInstance.emit('new_announcement', { title, content, type, time: new Date().toISOString() });
  }
}

/**
 * Emit a DB change event to admin clients.
 */
function emitDbChange(type, message) {
  if (ioInstance) {
    ioInstance.emit('db_changed', { type, message, time: new Date().toISOString() });
  }
}

/** Real-time feed for admin dashboard (join_admin required on client). */
function emitAdminRealtime(event, payload = {}) {
  if (!ioInstance) return;
  ioInstance.to('admin_room').emit('admin_realtime', {
    event,
    payload,
    time: new Date().toISOString(),
  });
}

module.exports = { initSockets, emitAnnouncement, emitDbChange, emitAdminRealtime };
