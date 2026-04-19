/**
 * RRDCH — tokenGenerator.js
 * Generates unique IDs for appointments, complaints, and admissions.
 */

/**
 * Generate appointment ID: APT-YYYYMMDD-XXXXX
 */
function genAppointmentId() {
  const d = new Date();
  const date = `${d.getFullYear()}${String(d.getMonth()+1).padStart(2,'0')}${String(d.getDate()).padStart(2,'0')}`;
  const rand = String(Math.floor(Math.random() * 99999)).padStart(5, '0');
  return `APT-${date}-${rand}`;
}

/**
 * Generate OPD token number: A-001 to A-999
 * @param {number} n - Sequential number for the day
 */
function genTokenNo(n) {
  return `A-${String(n).padStart(3, '0')}`;
}

/**
 * Generate hostel complaint ID: HC-YYYYMMDD-XXX
 */
function genComplaintId() {
  const d = new Date();
  const date = `${d.getFullYear()}${String(d.getMonth()+1).padStart(2,'0')}${String(d.getDate()).padStart(2,'0')}`;
  const rand = String(Math.floor(Math.random() * 999)).padStart(3, '0');
  return `HC-${date}-${rand}`;
}

/**
 * Generate admission application ID: APP-YYYY-XXXXX
 */
function genAdmissionId() {
  const year = new Date().getFullYear();
  const rand = String(Math.floor(Math.random() * 99999)).padStart(5, '0');
  return `APP-${year}-${rand}`;
}

/**
 * Generate patient ID: PT-YYYY-XXXXX
 */
function genPatientId() {
  const year = new Date().getFullYear();
  const rand = String(Math.floor(Math.random() * 99999)).padStart(5, '0');
  return `PT-${year}-${rand}`;
}

module.exports = { genAppointmentId, genTokenNo, genComplaintId, genAdmissionId, genPatientId };
