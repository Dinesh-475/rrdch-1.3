/**
 * RRDCH — validate.middleware.js
 * Reusable server-side validation helpers.
 * Usage: router.post('/route', validate(rules), handler)
 */

/**
 * Build a validation middleware from a rules object.
 * Each key maps to field rules: required, minLen, maxLen, regex, isInt, min, max, isDate
 * @param {Object} rules
 */
const validate = (rules) => (req, res, next) => {
  const body   = req.body;
  const errors = [];

  for (const [field, r] of Object.entries(rules)) {
    const val = body[field];
    const isEmpty = val === undefined || val === null || String(val).trim() === '';

    if (r.required && isEmpty) {
      errors.push(`'${field}' is required.`);
      continue; // skip further checks for this field
    }

    if (isEmpty) continue; // optional field not provided — skip

    const str = String(val).trim();

    if (r.minLen && str.length < r.minLen)
      errors.push(`'${field}' must be at least ${r.minLen} characters.`);

    if (r.maxLen && str.length > r.maxLen)
      errors.push(`'${field}' must not exceed ${r.maxLen} characters.`);

    if (r.regex && !r.regex.test(str))
      errors.push(r.regexMsg || `'${field}' format is invalid.`);

    if (r.isInt) {
      const n = parseInt(str, 10);
      if (isNaN(n)) { errors.push(`'${field}' must be a number.`); continue; }
      if (r.min !== undefined && n < r.min) errors.push(`'${field}' must be ≥ ${r.min}.`);
      if (r.max !== undefined && n > r.max) errors.push(`'${field}' must be ≤ ${r.max}.`);
    }

    if (r.isDate && isNaN(Date.parse(str)))
      errors.push(`'${field}' must be a valid date (YYYY-MM-DD).`);
  }

  if (errors.length)
    return res.status(400).json({ ok: false, msg: errors[0], errors });

  next();
};

// ─── Pre-built rule sets ──────────────────────────────────────────────────────

const appointmentRules = {
  patient_name:    { required: true,  maxLen: 100 },
  patient_phone:   { required: true,  regex: /^\d{10}$/, regexMsg: "'patient_phone' must be a 10-digit number." },
  dept_id:         { required: true,  isInt: true, min: 1 },
  date:            { required: true,  isDate: true },
  chief_complaint: { required: false, maxLen: 500 },
};

const admissionRules = {
  applicant_name: { required: true,  maxLen: 100 },
  dob:            { required: true,  isDate: true },
  phone:          { required: true,  regex: /^\d{10}$/, regexMsg: "'phone' must be a 10-digit number." },
  email:          { required: false, regex: /^[^\s@]+@[^\s@]+\.[^\s@]+$/, regexMsg: "'email' format is invalid." },
  neet_score:     { required: false, isInt: true, min: 0, max: 720 },
  course:         { required: true },
};

const complaintRules = {
  category:    { required: true, maxLen: 50 },
  description: { required: true, minLen: 10, maxLen: 1000 },
  urgency:     { required: false, regex: /^(low|medium|high)$/, regexMsg: "'urgency' must be low, medium, or high." },
};

const feedbackRules = {
  feedback_type: { required: true, maxLen: 50 },
  comment:       { required: false, maxLen: 500 },
};

const circularRules = {
  title:    { required: true, maxLen: 200 },
  category: { required: true, maxLen: 50 },
  date:     { required: false, isDate: true },
};

const eventRules = {
  title: { required: true, maxLen: 200 },
  date:  { required: true, isDate: true },
  type:  { required: false, maxLen: 50 },
  venue: { required: false, maxLen: 200 },
};

module.exports = {
  validate,
  appointmentRules,
  admissionRules,
  complaintRules,
  feedbackRules,
  circularRules,
  eventRules,
};
