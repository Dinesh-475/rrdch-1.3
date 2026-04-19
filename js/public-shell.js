// Shared public-site shell renderer (public pages only).
(function initPublicShell() {
  const LANG_KEY = "rrdch_lang";

  function getLang() {
    const raw = (localStorage.getItem(LANG_KEY) || "").trim();
    return raw === "kn" ? "kn" : "en";
  }

  function setLang(lang) {
    const next = lang === "kn" ? "kn" : "en";
    localStorage.setItem(LANG_KEY, next);
    document.documentElement.setAttribute("data-lang", next);
    document.documentElement.setAttribute("lang", next);
    return next;
  }

  function ensureLangAttributeEarly() {
    const lang = getLang();
    document.documentElement.setAttribute("data-lang", lang);
    document.documentElement.setAttribute("lang", lang);
  }

  function removeIfExists(sel) {
    document.querySelectorAll(sel).forEach((n) => n.remove());
  }

  function renderShell({ pageId }) {
    ensureLangAttributeEarly();
    document.body.classList.add("public-page");

    // Remove duplicated legacy public shell pieces (we re-inject)
    removeIfExists(".announcement-bar");
    removeIfExists(".top-identity-header");
    removeIfExists("nav.navbar");
    removeIfExists("footer.footer");

    const shell = document.createElement("div");
    shell.id = "rrdch-public-shell";
    shell.innerHTML = `
      <div class="top-identity-header">
        <div class="container identity-container">
          <div class="identity-brand">
            <img src="images/logo.png" alt="RRDCH Logo" class="identity-logo">
            <div class="identity-text">
              <h1 data-i18n="site_title">Rajarajeshwari Dental College and Hospital</h1>
              <div style="font-size:0.82rem; color:#94a3b8; font-weight:600;" data-i18n="site_subtitle">Bangalore • Est. 1992 • RGUHS • DCI</div>
            </div>
          </div>
          <div class="nav-actions">
            <button class="lang-toggle" id="langToggle">
              <span id="lang-en">EN</span> | <span id="lang-kn">ಕನ್ನಡ</span>
            </button>
          </div>
        </div>
      </div>

      <div class="nav-shell-wrap" id="navShellWrap">
      <nav class="navbar" id="mainPublicNav">
        <a href="index.html" class="nav-brand">
          <img src="images/logo.png" alt="RRDCH Logo" class="nav-logo">
        </a>
        <button class="mobile-toggle" id="mobileToggle" type="button" aria-label="Open menu">☰</button>
        <ul class="nav-links unified-nav">
          <li class="nav-item"><a href="index.html" class="nav-link" data-i18n="nav_home">Home</a></li>

          <li class="nav-item popup-nav-item">
            <a href="#" class="nav-link has-popup" data-i18n="nav_about">About Us</a>
            <div class="popup-menu">
              <a href="about.html#trust" class="popup-item" data-i18n="about_trust">Trust</a>
              <a href="about.html#management" class="popup-item" data-i18n="about_management">Management</a>
              <a href="about.html#governing" class="popup-item" data-i18n="about_governing">Governing Council</a>
              <a href="about.html#vision" class="popup-item" data-i18n="about_vision">Vision and Mission</a>
            </div>
          </li>

          <li class="nav-item popup-nav-item">
            <a href="departments.html" class="nav-link has-popup" data-i18n="nav_departments">Departments</a>
            <div class="popup-menu mega-menu">
              <a href="departments.html" class="popup-item" data-i18n="dept_omr">Oral Medicine and Radiology</a>
              <a href="departments.html" class="popup-item" data-i18n="dept_pros">Prosthodontics and Crown & Bridge</a>
              <a href="departments.html" class="popup-item" data-i18n="dept_omfs">Oral and Maxillofacial Surgery</a>
              <a href="departments.html" class="popup-item" data-i18n="dept_perio">Periodontology</a>
              <a href="departments.html" class="popup-item" data-i18n="dept_endo">Conservative Dentistry and Endodontics</a>
              <a href="departments.html" class="popup-item" data-i18n="dept_ortho">Orthodontics and Dentofacial Orthopedics</a>
              <a href="departments.html" class="popup-item" data-i18n="dept_phd">Public Health Dentistry</a>
              <a href="departments.html" class="popup-item" data-i18n="dept_path">Oral and Maxillofacial Pathology</a>
              <a href="departments.html" class="popup-item" data-i18n="dept_implant">Implantology</a>
              <a href="departments.html" class="popup-item" data-i18n="dept_research">Research and Publications</a>
              <a href="departments.html" class="popup-item" data-i18n="dept_pain">Orofacial Pain</a>
            </div>
          </li>

          <li class="nav-item popup-nav-item">
            <a href="admissions.html" class="nav-link has-popup" data-i18n="nav_academics">Academics</a>
            <div class="popup-menu">
              <a href="admission_enquiry.html" class="popup-item" data-i18n="nav_admission_enquiry">Admission Enquiry (2026–2027)</a>
              <a href="admissions.html" class="popup-item" data-i18n="nav_admissions">Admissions</a>
            </div>
          </li>

          <li class="nav-item"><a href="admissions.html" class="nav-link" data-i18n="nav_admissions">Admissions</a></li>
          <li class="nav-item"><a href="contact.html" class="nav-link" data-i18n="nav_contact">Contact</a></li>

          <li class="nav-item popup-nav-item">
            <a href="#" class="nav-link has-popup" data-i18n="nav_portal">Portal</a>
            <div class="popup-menu">
              <a href="students.html" class="popup-item" data-i18n="nav_students">Student</a>
              <a href="patients.html" class="popup-item" data-i18n="nav_patients">Patient</a>
              <a href="doctors.html" class="popup-item" data-i18n="nav_doctors">Doctor</a>
            </div>
          </li>
        </ul>
      </nav>
      </div>
    `;

    // Footer
    const footer = document.createElement("footer");
    footer.className = "footer";
    footer.innerHTML = `
      <div class="footer-grid">
        <div class="footer-brand">
          <img src="images/logo.png" alt="RRDCH Logo" class="footer-logo">
          <p data-i18n="footer_address">No. 14, Ramohalli Cross, Kumbalgodu,<br>Mysore Road, Bangalore - 560074.</p>
          <div style="margin-top: 1rem;">
            <strong data-i18n="footer_ph">Ph:</strong> +91 80 2843 7150<br>
            <strong data-i18n="footer_email">Email:</strong> principalrrdch@gmail.com
          </div>
        </div>
        <div class="footer-links">
          <h4 data-i18n="footer_academics">Academics</h4>
          <ul>
            <li><a href="admissions.html" data-i18n="nav_admissions">Admissions</a></li>
            <li><a href="departments.html" data-i18n="nav_departments">Departments</a></li>
            <li><a href="students.html" data-i18n="nav_students_portal">Student Portal</a></li>
          </ul>
        </div>
        <div class="footer-links">
          <h4 data-i18n="footer_hospital">Hospital Services</h4>
          <ul>
            <li><a href="patients.html" data-i18n="footer_book">Book Appointment</a></li>
            <li><a href="patients.html" data-i18n="nav_patients">Patient Portal</a></li>
            <li><a href="doctors.html" data-i18n="footer_doctor">Doctor Dashboard</a></li>
          </ul>
        </div>
      </div>
      <div class="footer-bottom">
        <p data-i18n="footer_copy">&copy; 2026 Rajarajeshwari Dental College and Hospital. All rights reserved.</p>
      </div>
    `;

    // Insert shell and footer around existing content
    document.body.prepend(shell);
    document.body.appendChild(footer);

    // Active nav highlight
    const currentPath = window.location.pathname.split("/").pop() || "index.html";
    document.querySelectorAll(".nav-links .nav-link").forEach((a) => {
      const linkPath = (a.getAttribute("href") || "").split("#")[0];
      if (linkPath && linkPath === currentPath) a.classList.add("active");
    });

    // Toggle state + persistence
    const toggleBtn = document.getElementById("langToggle");
    const applyToggleUI = () => {
      const lang = getLang();
      document.getElementById("lang-en")?.classList.toggle("active", lang === "en");
      document.getElementById("lang-kn")?.classList.toggle("active", lang === "kn");
    };
    applyToggleUI();
    toggleBtn?.addEventListener("click", () => {
      const next = getLang() === "en" ? "kn" : "en";
      setLang(next);
      applyToggleUI();
      window.RRDCH_I18N?.apply();
    });

    // Mobile toggle (simple)
    const mobileToggle = document.getElementById("mobileToggle");
    const navLinks = shell.querySelector(".nav-links");
    mobileToggle?.addEventListener("click", () => navLinks?.classList.toggle("open"));

    // Popup menu wiring
    document.querySelectorAll(".has-popup").forEach((toggle) => {
      toggle.addEventListener("click", (e) => {
        e.preventDefault();
        const parent = toggle.parentElement;
        document.querySelectorAll(".popup-nav-item.open").forEach((item) => {
          if (item !== parent) item.classList.remove("open");
        });
        parent.classList.toggle("open");
      });
    });
    document.addEventListener("click", (e) => {
      if (!e.target.closest(".popup-nav-item")) {
        document.querySelectorAll(".popup-nav-item.open").forEach((item) => item.classList.remove("open"));
      }
    });

    // Allow page to opt-in to a11y/chat injection via existing script.js hooks.
    window.RRDCH_PUBLIC_SHELL = window.RRDCH_PUBLIC_SHELL || {};
    window.RRDCH_PUBLIC_SHELL.pageId = pageId || "";
  }

  // Expose
  window.RRDCH_PUBLIC_SHELL = window.RRDCH_PUBLIC_SHELL || {};
  window.RRDCH_PUBLIC_SHELL.render = renderShell;
  window.RRDCH_PUBLIC_SHELL.getLang = getLang;
  window.RRDCH_PUBLIC_SHELL.setLang = setLang;

  // Set language attribute as early as possible even before DOMContentLoaded.
  ensureLangAttributeEarly();
})();

