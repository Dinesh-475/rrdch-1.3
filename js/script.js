/**
 * RRDCH Global JS — Shared across all pages
 * Handles: Navigation, Language, Carousel, Scroll animations,
 *          Accessibility Toolbar, Floating Chat, Animated Stats, Dept Search
 */

const translations = {
  en: {
    site_title: "Rajarajeshwari Dental College and Hospital",
    site_subtitle: "Bangalore • Est. 1992 • RGUHS • DCI",
    nav_home: "Home",
    nav_about: "About Us",
    nav_admissions: "Admissions",
    nav_departments: "Departments",
    nav_academics: "Academics",
    nav_admission_enquiry: "Admission Enquiry (2026–2027)",
    nav_admission_enquiry_short: "Admission Enquiry",
    nav_contact: "Contact",
    nav_portal: "Portal",
    nav_patients: "Patient",
    nav_patient_care: "Patient Care",
    nav_students: "Student",
    nav_doctors: "Doctor",
    nav_students_portal: "Student Portal",
    nav_explore: "Explore",
    nav_menu: "Menu",
    nav_main_menu: "Main Menu",
    nav_close: "Close",
    btn_book: "Book Appointment",
    ticker_opd: "🦷 OPD queue updates available in Patient Portal",
    ticker_symposium: "📅 Annual Dental Symposium – Registrations Open",
    ticker_emergency: "🚨 Emergency Dental Care is Available 24/7",
    ticker_implant: "📋 Certificate Course in Implantology (2026–2027) — pgrrdc@gmail.com",
    ticker_admission: "Admission Enquiry (2026–2027) — Apply Now",
    about_trust: "Trust",
    about_management: "Management",
    about_governing: "Governing Council",
    about_vision: "Vision and Mission",
    dept_omr: "Oral Medicine and Radiology",
    dept_pros: "Prosthodontics and Crown & Bridge",
    dept_omfs: "Oral and Maxillofacial Surgery",
    dept_perio: "Periodontology",
    dept_endo: "Conservative Dentistry and Endodontics",
    dept_ortho: "Orthodontics and Dentofacial Orthopedics",
    dept_phd: "Public Health Dentistry",
    dept_path: "Oral and Maxillofacial Pathology",
    dept_implant: "Implantology",
    dept_research: "Research and Publications",
    dept_pain: "Orofacial Pain",
    footer_address: "No. 14, Ramohalli Cross, Kumbalgodu,<br>Mysore Road, Bangalore - 560074.",
    footer_ph: "Ph:",
    footer_email: "Email:",
    footer_academics: "Academics",
    footer_hospital: "Hospital Services",
    footer_book: "Book Appointment",
    footer_doctor: "Doctor Dashboard",
    footer_copy: "&copy; 2026 Rajarajeshwari Dental College and Hospital. All rights reserved.",
    hero_title1: "Rajarajeshwari Dental", hero_title2: "College &amp; Hospital",
    hero_desc: "Established to provide premier dental education and unparalleled patient care, fostering the next generation of healthcare professionals.",
    card_patients: "Patient Portal", card_patients_desc: "Book appointments, track queue status, and access records.",
    card_students: "Student Portal", card_students_desc: "Access syllabus, complain to hostel, and view events.",
    card_doctors: "Doctor Dashboard", card_doctors_desc: "Manage patient schedules, track live updates, and follow-ups."
    ,
    contact_title: "Contact Us",
    contact_subtitle: "Get in touch with Rajarajeshwari Dental College and Hospital.",
    contact_reach: "Reach Out to Us",
    contact_address_label: "Address",
    contact_phone_label: "Phone Numbers",
    contact_email_label: "Email Address",
    contact_send: "Send a Message",
    contact_full_name: "Full Name",
    contact_email: "Email Address",
    contact_subject: "Subject",
    contact_topic_select: "Select Topic",
    contact_topic_admissions: "Admissions",
    contact_topic_feedback: "Hospital Feedback",
    contact_topic_general: "General Inquiry",
    contact_message: "Message",
    contact_send_btn: "Send Message",
    contact_success: "Thank you! Your message has been submitted successfully."
    ,
    admissions_title: "Admissions 2026-27",
    admissions_subtitle: "Join our prestigious institution and shape the future of healthcare.",
    admissions_enquiry_btn: "Admission Enquiry",
    admissions_fee_btn: "Fee Structure",
    admissions_view_notification: "View Notification",
    admissions_apply_now: "Apply Now"
  },
  kn: {
    site_title: "ರಾಜರಾಜೇಶ್ವರಿ ದಂತ ಕಾಲೇಜು ಮತ್ತು ಆಸ್ಪತ್ರೆ",
    site_subtitle: "ಬೆಂಗಳೂರು • ಸ್ಥಾಪನೆ 1992 • RGUHS • DCI",
    nav_home: "ಮುಖಪುಟ",
    nav_about: "ನಮ್ಮ ಬಗ್ಗೆ",
    nav_admissions: "ಪ್ರವೇಶಗಳು",
    nav_departments: "ವಿಭಾಗಗಳು",
    nav_academics: "ಶೈಕ್ಷಣಿಕ",
    nav_admission_enquiry: "ಪ್ರವೇಶ ವಿಚಾರಣೆ (2026–2027)",
    nav_admission_enquiry_short: "ಪ್ರವೇಶ ವಿಚಾರಣೆ",
    nav_contact: "ಸಂಪರ್ಕ",
    nav_portal: "ಪೋರ್ಟಲ್",
    nav_patients: "ರೋಗಿ",
    nav_patient_care: "ರೋಗಿ ಸೇವೆಗಳು",
    nav_students: "ವಿದ್ಯಾರ್ಥಿ",
    nav_doctors: "ವೈದ್ಯ",
    nav_students_portal: "ವಿದ್ಯಾರ್ಥಿ ಪೋರ್ಟಲ್",
    nav_explore: "ಅನ್ವೇಷಿಸಿ",
    nav_menu: "ಮೆನು",
    nav_main_menu: "ಮುಖ್ಯ ಮೆನು",
    nav_close: "ಮುಚ್ಚಿ",
    btn_book: "ಅಪಾಯಿಂಟ್ಮೆಂಟ್ ಬುಕ್ ಮಾಡಿ",
    ticker_opd: "🦷 OPD ಕ್ಯೂ ಅಪ್ಡೇಟ್‌ಗಳು ರೋಗಿ ಪೋರ್ಟಲ್‌ನಲ್ಲಿ ಲಭ್ಯ",
    ticker_symposium: "📅 ವಾರ್ಷಿಕ ದಂತ ಸಮ್ಮೇಳನ – ನೋಂದಣಿ ಆರಂಭ",
    ticker_emergency: "🚨 24/7 ತುರ್ತು ದಂತ ಚಿಕಿತ್ಸೆ ಲಭ್ಯ",
    ticker_implant: "📋 ಇಂಪ್ಲಾಂಟಾಲಜಿ ಪ್ರಮಾಣಪತ್ರ ಕೋರ್ಸ್ (2026–2027) — pgrrdc@gmail.com",
    ticker_admission: "ಪ್ರವೇಶ ವಿಚಾರಣೆ (2026–2027) — ಈಗ ಅರ್ಜಿ ಸಲ್ಲಿಸಿ",
    about_trust: "ಟ್ರಸ್ಟ್",
    about_management: "ನಿರ್ವಹಣೆ",
    about_governing: "ಆಡಳಿತ ಮಂಡಳಿ",
    about_vision: "ದೃಷ್ಟಿ ಮತ್ತು ಧ್ಯೇಯ",
    dept_omr: "ಓರಲ್ ಮೆಡಿಸಿನ್ ಮತ್ತು ರೇಡಿಯಾಲಜಿ",
    dept_pros: "ಪ್ರೋಸ್ಥೊಡಾಂಟಿಕ್ಸ್ ಮತ್ತು ಕ್ರೌನ್ & ಬ್ರಿಡ್ಜ್",
    dept_omfs: "ಓರಲ್ ಮತ್ತು ಮ್ಯಾಕ್ಸಿಲೊಫೇಷಿಯಲ್ ಶಸ್ತ್ರಚಿಕಿತ್ಸೆ",
    dept_perio: "ಪಿರಿಯೋಡೊಂಟಾಲಜಿ",
    dept_endo: "ಕನ್ಸರ್ವೇಟಿವ್ ಡೆಂಟಿಸ್ಟ್ರಿ ಮತ್ತು ಎಂಡೊಡಾಂಟಿಕ್ಸ್",
    dept_ortho: "ಆರ್ಥೋಡಾಂಟಿಕ್ಸ್ ಮತ್ತು ಡೆಂಟೋಫೇಷಿಯಲ್ ಆರ್ಥೋಪೆಡಿಕ್ಸ್",
    dept_phd: "ಪಬ್ಲಿಕ್ ಹೆಲ್ತ್ ಡೆಂಟಿಸ್ಟ್ರಿ",
    dept_path: "ಓರಲ್ ಮತ್ತು ಮ್ಯಾಕ್ಸಿಲೊಫೇಷಿಯಲ್ ಪಥಾಲಜಿ",
    dept_implant: "ಇಂಪ್ಲಾಂಟಾಲಜಿ",
    dept_research: "ಸಂಶೋಧನೆ ಮತ್ತು ಪ್ರಕಟಣೆಗಳು",
    dept_pain: "ಓರೋಫೇಷಿಯಲ್ ಪೇನ್",
    footer_address: "ನಂ. 14, ರಾಮೋಹಳ್ಳಿ ಕ್ರಾಸ್, ಕುಂಬಳಗೋಡು,<br>ಮೈಸೂರು ರಸ್ತೆ, ಬೆಂಗಳೂರು - 560074.",
    footer_ph: "ಫೋನ್:",
    footer_email: "ಇಮೇಲ್:",
    footer_academics: "ಶೈಕ್ಷಣಿಕ",
    footer_hospital: "ಆಸ್ಪತ್ರೆ ಸೇವೆಗಳು",
    footer_book: "ಅಪಾಯಿಂಟ್ಮೆಂಟ್ ಬುಕ್ ಮಾಡಿ",
    footer_doctor: "ವೈದ್ಯ ಡ್ಯಾಶ್‌ಬೋರ್ಡ್",
    footer_copy: "&copy; 2026 ರಾಜರಾಜೇಶ್ವರಿ ದಂತ ಕಾಲೇಜು ಮತ್ತು ಆಸ್ಪತ್ರೆ. ಎಲ್ಲಾ ಹಕ್ಕುಗಳು ಕಾಯ್ದಿರಿಸಲಾಗಿದೆ.",
    hero_title1: "ರಾಜರಾಜೇಶ್ವರಿ ದಂತ", hero_title2: "ಕಾಲೇಜು ಮತ್ತು ಆಸ್ಪತ್ರೆ",
    hero_desc: "ಉನ್ನತ ಮಟ್ಟದ ದಂತ ಶಿಕ್ಷಣ ಮತ್ತು ಸಾಟಿಯಿಲ್ಲದ ರೋಗಿಗಳ ಆರೈಕೆಯನ್ನು ಒದಗಿಸಲು ಸ್ಥಾಪಿಸಲಾಗಿದೆ.",
    card_patients: "ರೋಗಿಗಳ ಪೋರ್ಟಲ್", card_patients_desc: "ಅಪಾಯಿಂಟ್ಮೆಂಟ್ ಕಾಯ್ದಿರಿಸಿ, ಕ್ಯೂ ಟ್ರ್ಯಾಕ್ ಮಾಡಿ.",
    card_students: "ವಿದ್ಯಾರ್ಥಿ ಪೋರ್ಟಲ್", card_students_desc: "ಪಠ್ಯಕ್ರಮ, ಹಾಸ್ಟೆಲ್ ದೂರು ಮತ್ತು ವೇಳಾಪಟ್ಟಿ ವೀಕ್ಷಿಸಿ.",
    card_doctors: "ವೈದ್ಯರ ಡ್ಯಾಶ್‌ಬೋರ್ಡ್", card_doctors_desc: "ರೋಗಿಗಳ ವೇಳಾಪಟ್ಟಿ, ನವೀಕರಣಗಳನ್ನು ನಿರ್ವಹಿಸಿ."
    ,
    contact_title: "ಸಂಪರ್ಕಿಸಿ",
    contact_subtitle: "ರಾಜರಾಜೇಶ್ವರಿ ದಂತ ಕಾಲೇಜು ಮತ್ತು ಆಸ್ಪತ್ರೆಯನ್ನು ಸಂಪರ್ಕಿಸಿ.",
    contact_reach: "ನಮ್ಮನ್ನು ಸಂಪರ್ಕಿಸಿ",
    contact_address_label: "ವಿಳಾಸ",
    contact_phone_label: "ದೂರವಾಣಿ ಸಂಖ್ಯೆ",
    contact_email_label: "ಇಮೇಲ್",
    contact_send: "ಸಂದೇಶ ಕಳುಹಿಸಿ",
    contact_full_name: "ಪೂರ್ಣ ಹೆಸರು",
    contact_email: "ಇಮೇಲ್ ವಿಳಾಸ",
    contact_subject: "ವಿಷಯ",
    contact_topic_select: "ವಿಷಯ ಆಯ್ಕೆಮಾಡಿ",
    contact_topic_admissions: "ಪ್ರವೇಶಗಳು",
    contact_topic_feedback: "ಆಸ್ಪತ್ರೆ ಪ್ರತಿಕ್ರಿಯೆ",
    contact_topic_general: "ಸಾಮಾನ್ಯ ವಿಚಾರಣೆ",
    contact_message: "ಸಂದೇಶ",
    contact_send_btn: "ಸಂದೇಶ ಕಳುಹಿಸಿ",
    contact_success: "ಧನ್ಯವಾದಗಳು! ನಿಮ್ಮ ಸಂದೇಶವನ್ನು ಯಶಸ್ವಿಯಾಗಿ ಸಲ್ಲಿಸಲಾಗಿದೆ."
    ,
    admissions_title: "ಪ್ರವೇಶಗಳು 2026-27",
    admissions_subtitle: "ನಮ್ಮ ಪ್ರತಿಷ್ಠಿತ ಸಂಸ್ಥೆಯಲ್ಲಿ ಸೇರಿ ಮತ್ತು ಆರೋಗ್ಯ ಸೇವೆಯ ಭವಿಷ್ಯ ರೂಪಿಸಿ.",
    admissions_enquiry_btn: "ಪ್ರವೇಶ ವಿಚಾರಣೆ",
    admissions_fee_btn: "ಫೀಸ್ ವಿವರ",
    admissions_view_notification: "ಸೂಚನೆ ವೀಕ್ಷಿಸಿ",
    admissions_apply_now: "ಈಗ ಅರ್ಜಿ ಸಲ್ಲಿಸಿ"
  }
};

let currentLang = 'en';

document.addEventListener('DOMContentLoaded', () => {
  // Public shell (only on public pages that include public-shell.js)
  if (document.body && document.body.dataset && document.body.dataset.publicPage === "true") {
    window.RRDCH_PUBLIC_SHELL?.render({ pageId: document.body.dataset.pageId || "" });
  }

  initAnimations();
  initLanguageToggle();
  initForms();
  initQueueSystem();
  initCarousel();
  initActiveNav();
  initPopupNav();
  initAnimatedStats();
  initDeptSearch();
  injectAccessibilityToolbar();
  injectChatWidget();
  restoreA11yPreferences();
  initPublicNavScrollFX();
  initHeroParallax();
  initHeroScrollCue();

  window.RRDCH_I18N?.apply();
});

// ════════ NAVIGATION ════════
function initActiveNav() {
  const currentPath = window.location.pathname.split('/').pop() || 'index.html';
  document.querySelectorAll('.nav-links .nav-link, [data-nav-link]').forEach(link => {
    const linkPath = link.getAttribute('href')?.split('#')[0];
    if (linkPath === currentPath && linkPath !== '') link.classList.add('active');
  });
}

function initPopupNav() {
  document.querySelectorAll('.has-popup').forEach(toggle => {
    toggle.addEventListener('click', (e) => {
      e.preventDefault();
      const parent = toggle.parentElement;
      document.querySelectorAll('.popup-nav-item.open').forEach(item => {
        if (item !== parent) item.classList.remove('open');
      });
      parent.classList.toggle('open');
    });
  });
  document.addEventListener('click', (e) => {
    if (!e.target.closest('.popup-nav-item')) {
      document.querySelectorAll('.popup-nav-item.open').forEach(item => item.classList.remove('open'));
    }
  });
}

// ════════ CAROUSEL ════════
function initCarousel() {
  const slides = document.querySelectorAll('.slide');
  const dots = document.querySelectorAll('.dot');
  if(slides.length === 0) return;
  let currentSlide = 0;
  function goToSlide(n) {
    slides[currentSlide].classList.remove('active');
    dots[currentSlide]?.classList.remove('active');
    currentSlide = (n + slides.length) % slides.length;
    slides[currentSlide].classList.add('active');
    dots[currentSlide]?.classList.add('active');
  }
  dots.forEach((dot, index) => dot.addEventListener('click', () => goToSlide(index)));
  setInterval(() => goToSlide(currentSlide + 1), 4000);
}

// ════════ SCROLL ANIMATIONS ════════
function initAnimations() {
  const observer = new IntersectionObserver((entries) => {
    entries.forEach(entry => { 
      if(entry.isIntersecting) {
        entry.target.classList.add('is-visible'); 
        observer.unobserve(entry.target); // Run once
      }
    });
  }, { threshold: 0.15, rootMargin: "0px 0px -50px 0px" });
  
  document.querySelectorAll('.animate-on-scroll').forEach(el => observer.observe(el));
}

document.addEventListener('DOMContentLoaded', () => {
    initAnimations();
});

// ════════ LANGUAGE ════════
function initLanguageToggle() {
  const toggleBtn = document.getElementById('langToggle');
  if(!toggleBtn) return;
  // restore persisted language if present
  const persisted = localStorage.getItem("rrdch_lang");
  if (persisted === "kn" || persisted === "en") currentLang = persisted;
  document.documentElement.setAttribute("data-lang", currentLang);
  document.documentElement.setAttribute("lang", currentLang);
  document.getElementById('lang-en')?.classList.toggle('active', currentLang === 'en');
  document.getElementById('lang-kn')?.classList.toggle('active', currentLang === 'kn');

  toggleBtn.addEventListener('click', () => {
    currentLang = currentLang === 'en' ? 'kn' : 'en';
    localStorage.setItem("rrdch_lang", currentLang);
    document.documentElement.setAttribute("data-lang", currentLang);
    document.documentElement.setAttribute("lang", currentLang);
    document.getElementById('lang-en')?.classList.toggle('active', currentLang === 'en');
    document.getElementById('lang-kn')?.classList.toggle('active', currentLang === 'kn');
    window.RRDCH_I18N?.apply();
  });
}

// Lightweight DOM i18n applier (public pages + any page using data-i18n)
window.RRDCH_I18N = {
  apply: function(root = document) {
    const lang = (localStorage.getItem("rrdch_lang") === "kn") ? "kn" : "en";
    currentLang = lang;
    root.querySelectorAll('[data-i18n]').forEach(el => {
      const key = el.getAttribute('data-i18n');
      const val = translations[lang] && translations[lang][key] ? translations[lang][key] : "";
      if (!val) return;
      // Allow HTML for a small set (addresses, copyright)
      if (key.startsWith("footer_") || key.startsWith("ticker_") || key === "site_title" || key === "footer_address") {
        el.innerHTML = val;
      } else {
        el.textContent = val.replace(/&amp;/g, "&");
      }
    });
  }
};

// ════════ FORMS ════════
function initForms() {
  document.querySelectorAll('form[data-validate="true"]').forEach(form => {
    form.addEventListener('submit', (e) => {
      e.preventDefault();
      let isValid = true;
      form.querySelectorAll('[required]').forEach(input => {
        if(!input.value.trim()) { input.classList.add('is-invalid'); isValid = false; }
        else input.classList.remove('is-invalid');
      });
      if(isValid) {
        const btn = form.querySelector('button[type="submit"]');
        const origText = btn.innerHTML;
        btn.innerHTML = 'Processing...'; btn.disabled = true;
        setTimeout(() => {
          form.style.display = 'none';
          const successDiv = document.createElement('div');
          successDiv.className = 'success-message';
          if (form.id === 'bookingForm') {
            const dr = form.querySelector('#doctor')?.value;
            const date = form.querySelector('#date')?.value;
            successDiv.innerHTML = `
              <div class="success-icon"><i class="lucide-check">✓</i></div>
              <h3>Booking Confirmed!</h3>
              <p>Your appointment has been successfully scheduled.</p>
              <div class="appointment-ticket">
                <div class="ticket-row"><span>Token No:</span> <strong>#RRD-402</strong></div>
                <div class="ticket-row"><span>Doctor:</span> <strong>${dr || 'Assigned Dr'}</strong></div>
                <div class="ticket-row"><span>Date:</span> <strong>${date || 'Today'}</strong></div>
                <div class="ticket-row"><span>Est. Time:</span> <strong>10:30 AM</strong></div>
              </div>
              <button class="btn btn-primary" style="margin-top: 1rem" onclick="location.reload()">Done</button>`;
          } else {
            successDiv.innerHTML = `
              <div class="success-icon"><i class="lucide-check">✓</i></div>
              <h3>Submitted Successfully!</h3>
              <p>Your request has been recorded.</p>
              <button class="btn btn-outline" style="margin-top: 1rem" onclick="location.reload()">Done</button>`;
          }
          form.parentNode.appendChild(successDiv);
        }, 1500);
      }
    });
    form.querySelectorAll('.form-control').forEach(input => {
      input.addEventListener('input', () => input.classList.remove('is-invalid'));
    });
  });
}

// ════════ QUEUE SYSTEM (fallback) ════════
function initQueueSystem() {
  const queueElement = document.getElementById('dynamicQueue');
  if(queueElement) {
    let queuePos = 3;
    setInterval(() => {
      if(Math.random() > 0.8 && queuePos > 0) {
        queuePos--;
        queueElement.innerHTML = queuePos === 0 ? "It's your turn!" : `You are <strong>#${queuePos}</strong> in line.`;
        queueElement.parentElement.classList.add('pulse');
        setTimeout(() => queueElement.parentElement.classList.remove('pulse'), 2000);
      }
    }, 5000);
  }
}

// ════════ ANIMATED STATS ════════
function initAnimatedStats() {
  const sections = document.querySelectorAll('.stats-section');
  if (sections.length === 0) return;
  const observer = new IntersectionObserver((entries) => {
    entries.forEach(entry => {
      if (entry.isIntersecting) {
        entry.target.querySelectorAll('.stat-number').forEach(el => {
          const target = +el.getAttribute('data-target');
          let count = 0;
          const updateCount = () => {
            const inc = target / 50;
            if (count < target) { count += inc; el.innerText = Math.ceil(count); setTimeout(updateCount, 30); }
            else el.innerText = target;
          };
          updateCount();
        });
        observer.unobserve(entry.target);
      }
    });
  }, { threshold: 0.5 });
  sections.forEach(sec => observer.observe(sec));
}

// ════════ DEPARTMENT SEARCH ════════
function initDeptSearch() {
  const searchInput = document.getElementById('deptSearch');
  if(!searchInput) return;
  const cards = Array.from(document.querySelectorAll('.dept-card'));
  const noResults = document.getElementById('deptNoResults');
  const tagWrap = document.getElementById('deptTagFilters');
  let activeTag = 'all';

  function applyFilters() {
    const term = (searchInput.value || '').toLowerCase().trim();
    let visibleCount = 0;
    cards.forEach(card => {
      const text = (card.innerText + ' ' + (card.dataset.tags || '') + ' ' + (card.dataset.keywords || '')).toLowerCase();
      const tags = (card.dataset.tags || '').toLowerCase().split(/\s+/);
      const matchesSearch = !term || text.includes(term);
      const matchesTag = activeTag === 'all' || tags.includes(activeTag);
      const show = matchesSearch && matchesTag;
      card.style.display = show ? '' : 'none';
      card.style.boxShadow = show ? '0 0 0 1px rgba(42,111,151,0.18)' : '';
      if (show) visibleCount++;
    });
    if (noResults) noResults.style.display = visibleCount === 0 ? 'block' : 'none';
  }

  searchInput.addEventListener('input', applyFilters);
  if (tagWrap) {
    tagWrap.addEventListener('click', (e) => {
      const btn = e.target.closest('[data-tag]');
      if (!btn) return;
      activeTag = btn.dataset.tag || 'all';
      tagWrap.querySelectorAll('[data-tag]').forEach(b => b.classList.remove('active'));
      btn.classList.add('active');
      applyFilters();
    });
  }
  applyFilters();
}

// ════════════════════════════════════════════════
//  ACCESSIBILITY TOOLBAR (injected dynamically)
// ════════════════════════════════════════════════
function injectAccessibilityToolbar() {
  /* Top accessibility strip removed per UX — keep API for any legacy onclick handlers. */
}

window._a11yFontSize = 100;

window.a11yFontChange = function(delta) {
  window._a11yFontSize = Math.max(80, Math.min(140, window._a11yFontSize + delta));
  document.documentElement.style.fontSize = window._a11yFontSize + "%";
  localStorage.setItem("a11y_font", window._a11yFontSize);
};

window.a11yToggle = function(className, btnId) {
  document.body.classList.toggle(className);
  const on = document.body.classList.contains(className);
  localStorage.setItem("a11y_" + className, on);
  document.getElementById(btnId)?.classList.toggle("active", on);
};

function restoreA11yPreferences() {
  const f = localStorage.getItem("a11y_font");
  if (f) { window._a11yFontSize = +f; document.documentElement.style.fontSize = f + "%"; }
}

function initPublicNavScrollFX() {
  const nav = document.querySelector(".header-minimal");
  if (!nav) return;
  function onScroll() {
    const y = window.scrollY || document.documentElement.scrollTop;
    nav.classList.toggle("is-scrolled", y > 16);
    if (y > 16) {
      nav.style.boxShadow = '0 4px 24px rgba(0,0,0,0.12)';
    } else {
      nav.style.boxShadow = '';
    }
  }
  window.addEventListener("scroll", onScroll, { passive: true });
  onScroll();
}

function initHeroParallax() {
  const heroImg = document.querySelector(".hero-image-container > img");
  if (!heroImg) return;
  if (window.matchMedia("(prefers-reduced-motion: reduce)").matches) return;
  let ticking = false;
  window.addEventListener("scroll", () => {
    if (ticking) return;
    ticking = true;
    requestAnimationFrame(() => {
      const y = window.scrollY || 0;
      const t = Math.min(1, y / 500);
      heroImg.style.transform = "scale(" + (1 + t * 0.05) + ") translate3d(0," + (y * 0.06) + "px,0)";
      ticking = false;
    });
  }, { passive: true });
}

function initHeroScrollCue() {
  document.querySelectorAll(".hero-scroll-cue").forEach((btn) => {
    btn.addEventListener("click", () => {
      const sel = btn.getAttribute("data-scroll-target") || "#about";
      const el = document.querySelector(sel);
      el?.scrollIntoView({ behavior: "smooth", block: "start" });
    });
  });
}

// ════════════════════════════════════════════════
//  FLOATING CHAT WIDGET (injected dynamically)
// ════════════════════════════════════════════════
function injectChatWidget() {
  if (document.getElementById('chatBubble')) return; // already exists

  // Inject styles
  if (!document.getElementById('chat-styles')) {
    const style = document.createElement('style');
    style.id = 'chat-styles';
    style.textContent = `
      #chatBubble { position:fixed; bottom:24px; right:24px; width:64px; height:64px; background:linear-gradient(145deg,#1e3a5f,#2A6F97); border-radius:50%; display:flex; align-items:center; justify-content:center; cursor:pointer; box-shadow:0 10px 28px rgba(15,23,42,0.35), 0 0 0 1px rgba(255,255,255,0.12) inset; z-index:9999; transition:transform 0.35s cubic-bezier(0.34,1.56,0.64,1), box-shadow 0.3s ease; color:white; touch-action:manipulation; -webkit-tap-highlight-color:transparent; }
      #chatBubble:hover { transform:scale(1.06) translateY(-4px); box-shadow:0 14px 36px rgba(42,111,151,0.45); }
      #chatBubble:active { transform:scale(0.96); }
      #chatBubble .chatbot-mark { width:38px; height:38px; display:block; object-fit:contain; border-radius:10px; filter:drop-shadow(0 1px 2px rgba(0,0,0,0.2)); }
      #chatPanel { display:none; opacity:0; pointer-events:none; position:fixed; bottom:100px; right:24px; width:380px; max-height:80vh; height:550px; background:white; border-radius:24px; box-shadow:0 15px 50px rgba(0,0,0,0.15); z-index:9998; flex-direction:column; overflow:hidden; border:1px solid rgba(226,232,240,0.8); transform:translateY(20px) scale(0.95); transition:all 0.3s cubic-bezier(0.4,0,0.2,1); }
      #chatPanel.active { opacity:1; pointer-events:all; transform:translateY(0) scale(1); }
      .chat-header { background:linear-gradient(135deg,#1A365D,#2A6F97); color:white; padding:1.25rem 1.5rem; display:flex; justify-content:space-between; align-items:center; }
      .chat-messages { flex:1; overflow-y:auto; padding:1.25rem; display:flex; flex-direction:column; gap:0.75rem; background:#f8fafc; }
      .chat-msg { padding:0.85rem 1.15rem; border-radius:16px; font-size:0.92rem; line-height:1.6; max-width:85%; box-shadow:0 2px 5px rgba(0,0,0,0.05); animation:chatFadeIn 0.3s ease; white-space:pre-wrap; word-wrap:break-word; }
      .chat-msg.bot { background:white; border:1px solid #e2e8f0; align-self:flex-start; color:#1e293b; border-bottom-left-radius:4px; }
      .chat-msg.user { background:linear-gradient(135deg,#2A6F97,#4A8DB5); color:white; align-self:flex-end; border-bottom-right-radius:4px; }
      .chat-input-area { padding:1rem; background:white; border-top:1px solid #e2e8f0; display:flex; gap:0.75rem; align-items:center; }
      .chat-input-area input { flex:1; padding:0.8rem 1.2rem; border:1px solid #cbd5e1; border-radius:24px; font-size:0.95rem; outline:none; transition:0.2s; background:#f8fafc; }
      .chat-input-area input:focus { border-color:#2A6F97; background:white; box-shadow:0 0 0 3px rgba(42,111,151,0.1); }
      .chat-send-btn { background:#2A6F97; color:white; border:none; width:42px; height:42px; border-radius:50%; cursor:pointer; display:flex; align-items:center; justify-content:center; transition:0.2s; flex-shrink:0; }
      .chat-send-btn:hover { background:#1A365D; transform:scale(1.05); }
      .typing-indicator { display:flex; gap:4px; align-items:center; padding:10px 15px; background:white; border-radius:16px; border-bottom-left-radius:4px; border:1px solid #e2e8f0; width:max-content; box-shadow:0 2px 5px rgba(0,0,0,0.05); animation:chatFadeIn 0.3s ease; }
      .typing-dot { width:6px; height:6px; background:#94a3b8; border-radius:50%; animation:typingBounce 1.4s infinite ease-in-out both; }
      .typing-dot:nth-child(1) { animation-delay:-0.32s; }
      .typing-dot:nth-child(2) { animation-delay:-0.16s; }
      @keyframes typingBounce { 0%,80%,100% { transform:scale(0); } 40% { transform:scale(1); } }
      @keyframes chatFadeIn { from { opacity:0; transform:translateY(10px); } to { opacity:1; transform:translateY(0); } }
      @keyframes wave { 0%,60%,100% { transform:rotate(0deg); } 10%,30% { transform:rotate(14deg); } 20%,40% { transform:rotate(-8deg); } 50% { transform:rotate(10deg); } }
      @media (max-width:480px) { #chatPanel { width:calc(100vw - 24px); right:12px; bottom:90px; height:70vh; border-radius:16px; } }
    `;
    document.head.appendChild(style);
  }

  // Bubble
  const bubble = document.createElement('div');
  bubble.id = 'chatBubble';
  bubble.title = 'Ask RRDCH AI Assistant';
  bubble.innerHTML = '<img class="chatbot-mark" src="images/chat-assistant-robot.png" width="38" height="38" alt="" role="presentation">';
  bubble.onclick = toggleChatPanel;
  document.body.appendChild(bubble);

  // Panel
  const panel = document.createElement('div');
  panel.id = 'chatPanel';
  panel.innerHTML = `
    <div class="chat-header">
      <div style="display:flex;align-items:center;gap:0.65rem;">
        <img src="images/chat-assistant-robot.png" width="36" height="36" alt="" style="border-radius:10px;object-fit:cover;box-shadow:0 2px 8px rgba(0,0,0,0.15);">
        <div>
        <div style="font-weight:700; font-size:1.05rem;">RRDCH Assistant</div>
        <div style="font-size:0.78rem; opacity:0.85; margin-top:2px;">AI guide • Campus &amp; services</div>
        </div>
      </div>
      <button onclick="toggleChatPanel()" style="background:rgba(255,255,255,0.2); border:none; color:white; width:32px; height:32px; border-radius:50%; cursor:pointer; font-size:1.2rem; display:flex; align-items:center; justify-content:center;">✕</button>
    </div>
    <div id="chatMessages" class="chat-messages">
      <div class="chat-msg bot">Hello — I am the RRDCH assistant. Ask about admissions, departments, patient booking, campus facilities, or contact details. I use official institute information when available.</div>
    </div>
    <div class="chat-input-area">
      <input id="chatInput" type="text" placeholder="Type your question..." onkeydown="if(event.key==='Enter') sendChatMessage()">
      <button class="chat-send-btn" onclick="sendChatMessage()">
        <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" style="width:20px;height:20px;"><line x1="22" y1="2" x2="11" y2="13"></line><polygon points="22 2 15 22 11 13 2 9 22 2"></polygon></svg>
      </button>
    </div>
  `;
  document.body.appendChild(panel);
}

// Chat state
window._chatHistory = [];

window.toggleChatPanel = function() {
  const p = document.getElementById("chatPanel");
  if (!p) return;
  const isActive = p.classList.contains("active");
  if (isActive) {
    p.classList.remove("active");
    setTimeout(() => { p.style.display = "none"; }, 300);
  } else {
    p.style.display = "flex";
    requestAnimationFrame(() => { requestAnimationFrame(() => { p.classList.add("active"); }); });
    setTimeout(() => document.getElementById("chatInput")?.focus(), 350);
  }
};

window.sendChatMessage = async function() {
  const inp = document.getElementById("chatInput");
  const msg = inp.value.trim();
  if (!msg) return;

  appendChatMsg(msg, "user");
  inp.value = "";
  
  const loader = document.createElement("div");
  loader.className = "loading-msg";
  loader.innerHTML = '<div class="typing-indicator"><div class="typing-dot"></div><div class="typing-dot"></div><div class="typing-dot"></div></div>';
  const container = document.getElementById("chatMessages");
  container.appendChild(loader);
  container.scrollTop = container.scrollHeight;

  window._chatHistory.push({ role: "user", parts: [{ text: msg }] });

  try {
    let text = "";
    if (window.RRDCH_AI && typeof window.RRDCH_AI.askText === "function") {
      text = await window.RRDCH_AI.askText("RRDCH site assistant", window._chatHistory);
    } else {
      const ep = (function () {
        if (window.RRDCH_BACKEND && window.RRDCH_BACKEND.API_BASE) {
          return String(window.RRDCH_BACKEND.API_BASE).replace(/\/$/, "") + "/gemini";
        }
        const isLocal = !window.location.hostname || window.location.hostname === "localhost" || window.location.hostname === "127.0.0.1" || window.location.protocol === "file:";
        return (isLocal ? "http://localhost:3000" : "") + "/api/gemini";
      })();
      const res = await fetch(ep, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ mode: "site-assistant", input: msg })
      });
      const data = await res.json();
      if (!res.ok || data.ok === false) throw new Error(data.msg || "AI unavailable");
      text = String(data.data?.text || "").trim();
    }
    loader.remove();
    appendChatMsg(text || "I could not generate a response right now.", "bot");
    window._chatHistory.push({ role: "model", parts: [{ text: text }] });
    if (window._chatHistory.length > 10) window._chatHistory = window._chatHistory.slice(-10);
  } catch (e) {
    loader.remove();
    appendChatMsg("I'm having trouble connecting right now. Please try again or call 080-28437150.", "bot");
    window._chatHistory.pop();
  }
};

function appendChatMsg(text, type) {
  const container = document.getElementById("chatMessages");
  const div = document.createElement("div");
  div.className = "chat-msg " + type;
  div.textContent = text;
  container.appendChild(div);
  container.scrollTop = container.scrollHeight;
  return div;
}
