// public-shell.js — RRDCH Shared Header + Drawer + Footer
(function initPublicShell() {
  const LANG_KEY = "rrdch_lang";

  function getLang() {
    return (localStorage.getItem(LANG_KEY) || "").trim() === "kn" ? "kn" : "en";
  }

  function setLang(lang) {
    const next = lang === "kn" ? "kn" : "en";
    localStorage.setItem(LANG_KEY, next);
    document.documentElement.setAttribute("data-lang", next);
    document.documentElement.setAttribute("lang", next);
    return next;
  }

  function removeIfExists(selector) {
    document.querySelectorAll(selector).forEach((n) => n.remove());
  }

  function markCurrentPath(root) {
    const currentPath = window.location.pathname.split("/").pop() || "index.html";
    root.querySelectorAll("a[href]").forEach((link) => {
      const lp = (link.getAttribute("href") || "").split("#")[0];
      if (lp && lp === currentPath) link.classList.add("active");
    });
  }

  function renderShell({ pageId }) {
    // Clean up lang
    const lang = getLang();
    document.documentElement.setAttribute("data-lang", lang);
    document.documentElement.setAttribute("lang", lang);

    document.body.classList.add("public-page", "public-shell-mounted");
    if (pageId) document.body.classList.add(`page-${pageId.replace(/[^a-z0-9]/gi, "-").toLowerCase()}`);

    // ─────────────────────────────────────────────
    //  NEWTON'S CRADLE LOADER — inject on all shell pages (skip if index.html already has one)
    // ─────────────────────────────────────────────
    if (!document.getElementById("global-skeleton")) {
      const spinnerStyle = document.createElement("style");
      spinnerStyle.textContent = `
        #global-skeleton {
          position: fixed; inset: 0; z-index: 999999;
          background: rgba(12, 26, 52, 0.97);
          display: flex; align-items: center; justify-content: center;
          pointer-events: all;
          transition: opacity 0.7s cubic-bezier(0.4,0,0.2,1), visibility 0.7s ease;
        }
        #global-skeleton.hidden { opacity: 0; visibility: hidden; pointer-events: none; }
        .rrdch-newtons-cradle {
          --uib-size: 80px; --uib-speed: 1.2s; --uib-color: #c39c5b;
          position: relative; display: flex;
          align-items: center; justify-content: center;
          width: var(--uib-size); height: var(--uib-size);
        }
        .rrdch-newtons-cradle__dot {
          position: relative; display: flex; align-items: center;
          height: 100%; width: 25%; transform-origin: center top;
        }
        .rrdch-newtons-cradle__dot::after {
          content: ''; display: block; width: 100%; height: 25%;
          border-radius: 50%; background-color: var(--uib-color);
        }
        .rrdch-newtons-cradle__dot:first-child { animation: rrdch-swing var(--uib-speed) linear infinite; }
        .rrdch-newtons-cradle__dot:last-child  { animation: rrdch-swing2 var(--uib-speed) linear infinite; }
        @keyframes rrdch-swing {
          0%  { transform: rotate(0deg);  animation-timing-function: ease-out; }
          25% { transform: rotate(70deg); animation-timing-function: ease-in;  }
          50% { transform: rotate(0deg);  animation-timing-function: linear;   }
        }
        @keyframes rrdch-swing2 {
          0%  { transform: rotate(0deg);   animation-timing-function: linear;   }
          50% { transform: rotate(0deg);   animation-timing-function: ease-out; }
          75% { transform: rotate(-70deg); animation-timing-function: ease-in;  }
        }
      `;
      document.head.appendChild(spinnerStyle);

      const spinnerEl = document.createElement("div");
      spinnerEl.id = "global-skeleton";
      spinnerEl.innerHTML = `
        <div class="rrdch-newtons-cradle">
          <div class="rrdch-newtons-cradle__dot"></div>
          <div class="rrdch-newtons-cradle__dot"></div>
          <div class="rrdch-newtons-cradle__dot"></div>
          <div class="rrdch-newtons-cradle__dot"></div>
        </div>
      `;
      document.body.insertBefore(spinnerEl, document.body.firstChild);

      const hideSkeleton = () => setTimeout(() => {
        const skel = document.getElementById("global-skeleton");
        if (skel) skel.classList.add("hidden");
      }, 450);

      if (document.readyState === "complete") {
        hideSkeleton();
      } else {
        window.addEventListener("load", hideSkeleton);
      }
      setTimeout(() => {
        const skel = document.getElementById("global-skeleton");
        if (skel) skel.classList.add("hidden");
      }, 6000);
    }

    // Remove any previous shells
    removeIfExists("#rrdch-public-shell");
    removeIfExists("footer.footer");


    // ─────────────────────────────────────────────
    //  SHELL HTML — Announcement ticker + Header + Drawer
    // ─────────────────────────────────────────────
    const shell = document.createElement("div");
    shell.id = "rrdch-public-shell";
    shell.innerHTML = `


      <!-- Top Micro-bar -->
      <div class="cu-micro-bar">
        <span>Rajarajeshwari Dental College & Hospital | Bengaluru Campus</span>
        <div class="micro-links">
          <a href="contact.html">Contact</a> | <a href="admission_enquiry.html">Admissions</a> | <a href="portal.html" class="login-btn-micro">LOGIN</a>
        </div>
      </div>

      <!-- Social Media Floating Strip -->
      <div class="social-media-strip">
        <a href="#" aria-label="Facebook"><i data-lucide="facebook" width="18" height="18"></i></a>
        <a href="#" aria-label="X (Twitter)">
          <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M4 4l11.733 16h4.267l-11.733 -16z"/><path d="M4 20l6.768 -6.768m2.46 -2.46l6.772 -6.772"/></svg>
        </a>
        <a href="#" aria-label="YouTube"><i data-lucide="youtube" width="18" height="18"></i></a>
        <a href="#" aria-label="Instagram"><i data-lucide="instagram" width="18" height="18"></i></a>
        <a href="#" aria-label="LinkedIn"><i data-lucide="linkedin" width="18" height="18"></i></a>
      </div>

      <!-- Floating Header (Slanted Logo + Floating Buttons) -->
      <header class="header-floating" id="siteHeader">
        <a href="index.html" class="header-brand-slanted">
          <img src="images/logo.png" alt="RRDCH Logo">
        </a>
        <div class="header-actions">
          <a href="portal.html" class="header-login-btn">LOGIN</a>
          <button
            class="menu-trigger-odd"
            id="menuToggleBtn"
            type="button"
            aria-controls="siteDrawer"
            aria-expanded="false"
            aria-label="Open main menu"
          >
            MENU
            <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true">
              <line x1="3" y1="6"  x2="21" y2="6"/>
              <line x1="3" y1="12" x2="21" y2="12"/>
              <line x1="3" y1="18" x2="21" y2="18"/>
            </svg>
          </button>
        </div>
      </header>

      <!-- Drawer Backdrop -->
      <div class="cu-drawer-backdrop" id="drawerBackdrop"></div>

      <!-- Split-Screen Drawer -->
      <div class="cu-drawer-container" id="siteDrawer" role="dialog" aria-modal="true" aria-label="Main navigation menu" aria-hidden="true">

        <!-- LEFT: Icon Grid -->
        <div class="cu-drawer-left" id="drawerLeft">
          <div class="cu-grid-nav">
            <a href="admission_enquiry.html" class="cu-grid-item">
              <div class="cu-grid-icon">
                <svg width="26" height="26" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round"><path d="M22 10v6M2 10l10-5 10 5-10 5z"/><path d="M6 12v5c3 3 9 3 12 0v-5"/></svg>
              </div>
              ADMISSION
            </a>
            <a href="departments.html" class="cu-grid-item">
              <div class="cu-grid-icon">
                <svg width="26" height="26" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round"><path d="M9 11l3 3L22 4"/><path d="M21 12v7a2 2 0 01-2 2H5a2 2 0 01-2-2V5a2 2 0 012-2h11"/></svg>
              </div>
              EXAMINATION
            </a>
            <a href="students.html" class="cu-grid-item">
              <div class="cu-grid-icon">
                <svg width="26" height="26" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round"><rect x="2" y="3" width="20" height="14" rx="2"/><path d="M8 21h8M12 17v4"/></svg>
              </div>
              ONLINE CLASSES
            </a>
            <a href="departments.html" class="cu-grid-item">
              <div class="cu-grid-icon">
                <svg width="26" height="26" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round"><path d="M8 2v4M16 2v4M3 10h18M5 4h14a2 2 0 012 2v14a2 2 0 01-2 2H5a2 2 0 01-2-2V6a2 2 0 012-2z"/></svg>
              </div>
              DOCTORAL
            </a>
            <a href="students.html" class="cu-grid-item">
              <div class="cu-grid-icon">
                <svg width="26" height="26" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round"><path d="M17 21v-2a4 4 0 00-4-4H5a4 4 0 00-4 4v2"/><circle cx="9" cy="7" r="4"/><path d="M23 21v-2a4 4 0 00-3-3.87M16 3.13a4 4 0 010 7.75"/></svg>
              </div>
              STUDENT COUNCIL
            </a>
            <a href="students.html" class="cu-grid-item">
              <div class="cu-grid-icon">
                <svg width="26" height="26" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round"><rect x="2" y="7" width="20" height="14" rx="2"/><path d="M16 21V5a2 2 0 00-2-2h-4a2 2 0 00-2 2v16"/></svg>
              </div>
              PLACEMENTS
            </a>
            <a href="contact.html" class="cu-grid-item">
              <div class="cu-grid-icon">
                <svg width="26" height="26" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round"><path d="M3 9l9-7 9 7v11a2 2 0 01-2 2H5a2 2 0 01-2-2z"/><polyline points="9 22 9 12 15 12 15 22"/></svg>
              </div>
              HOSTEL &amp; DINING
            </a>
            <a href="contact.html" class="cu-grid-item">
              <div class="cu-grid-icon">
                <svg width="26" height="26" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round"><circle cx="12" cy="12" r="10"/><path d="M12 2a15.3 15.3 0 014 10 15.3 15.3 0 01-4 10 15.3 15.3 0 01-4-10 15.3 15.3 0 014-10z"/><path d="M2 12h20"/></svg>
              </div>
              ALUMNI
            </a>
            <a href="departments.html" class="cu-grid-item">
              <div class="cu-grid-icon">
                <svg width="26" height="26" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round"><path d="M4 19.5A2.5 2.5 0 016.5 17H20"/><path d="M6.5 2H20v20H6.5A2.5 2.5 0 014 19.5v-15A2.5 2.5 0 016.5 2z"/></svg>
              </div>
              LIBRARY
            </a>
            <a href="departments.html" class="cu-grid-item">
              <div class="cu-grid-icon">
                <svg width="26" height="26" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round"><path d="M3 9l9-7 9 7v11a2 2 0 01-2 2H5a2 2 0 01-2-2z"/></svg>
              </div>
              CENTRES
            </a>
            <a href="about.html" class="cu-grid-item">
              <div class="cu-grid-icon">
                <svg width="26" height="26" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round"><circle cx="12" cy="8" r="6"/><path d="M15.477 12.89L17 22l-5-3-5 3 1.523-9.11"/></svg>
              </div>
              ACCREDITATIONS
            </a>
            <a href="contact.html" class="cu-grid-item">
              <div class="cu-grid-icon">
                <svg width="26" height="26" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round"><circle cx="12" cy="12" r="5"/><line x1="12" y1="1" x2="12" y2="3"/><line x1="12" y1="21" x2="12" y2="23"/><line x1="4.22" y1="4.22" x2="5.64" y2="5.64"/><line x1="18.36" y1="18.36" x2="19.78" y2="19.78"/><line x1="1" y1="12" x2="3" y2="12"/><line x1="21" y1="12" x2="23" y2="12"/><line x1="4.22" y1="19.78" x2="5.64" y2="18.36"/><line x1="18.36" y1="5.64" x2="19.78" y2="4.22"/></svg>
              </div>
              SDG CELL
            </a>
          </div>
        </div>

        <!-- RIGHT: Nav Menu -->
        <div class="cu-drawer-right" id="drawerRight">
          <div class="cu-drawer-header">
            <h2>MAIN MENU</h2>
            <button class="cu-drawer-close" id="drawerCloseBtn" type="button" aria-label="Close menu">
              <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round"><line x1="18" y1="6" x2="6" y2="18"/><line x1="6" y1="6" x2="18" y2="18"/></svg>
            </button>
          </div>

          <div class="cu-drawer-actions">
            <a href="admissions.html"      class="cu-drawer-btn admission">ADMISSION</a>
            <a href="departments.html"     class="cu-drawer-btn examination">DEPARTMENTS</a>
          </div>

          <div class="cu-drawer-links">
            <div class="cu-accordion">
              <a href="index.html" class="cu-accordion-btn" style="text-decoration:none;">
                Home
                <span class="icon">
                  <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round"><polyline points="9 18 15 12 9 6"/></svg>
                </span>
              </a>
            </div>
            <div class="cu-accordion">
              <a href="about.html" class="cu-accordion-btn" style="text-decoration:none;">
                About Us
                <span class="icon">
                  <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round"><polyline points="9 18 15 12 9 6"/></svg>
                </span>
              </a>
            </div>
            <div class="cu-accordion">
              <a href="departments.html" class="cu-accordion-btn" style="text-decoration:none;">
                Academics &amp; Departments
                <span class="icon">
                  <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round"><polyline points="9 18 15 12 9 6"/></svg>
                </span>
              </a>
            </div>
            <div class="cu-accordion">
              <a href="admissions.html" class="cu-accordion-btn" style="text-decoration:none;">
                Admissions 2026–27
                <span class="icon">
                  <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round"><polyline points="9 18 15 12 9 6"/></svg>
                </span>
              </a>
            </div>
            <div class="cu-accordion">
              <a href="patients.html" class="cu-accordion-btn" style="text-decoration:none;">
                Patient Portal
                <span class="icon">
                  <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round"><polyline points="9 18 15 12 9 6"/></svg>
                </span>
              </a>
            </div>
            <div class="cu-accordion">
              <a href="students.html" class="cu-accordion-btn" style="text-decoration:none;">
                Student Portal
                <span class="icon">
                  <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round"><polyline points="9 18 15 12 9 6"/></svg>
                </span>
              </a>
            </div>
            <div class="cu-accordion">
              <a href="doctors.html" class="cu-accordion-btn" style="text-decoration:none;">
                Doctor Dashboard
                <span class="icon">
                  <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round"><polyline points="9 18 15 12 9 6"/></svg>
                </span>
              </a>
            </div>
            <div class="cu-accordion">
              <a href="contact.html" class="cu-accordion-btn" style="text-decoration:none;">
                Contact Us
                <span class="icon">
                  <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round"><polyline points="9 18 15 12 9 6"/></svg>
                </span>
              </a>
            </div>
          </div>

          <a href="contact.html#careers" class="cu-career-btn">CAREERS (JOB OPENINGS)</a>
        </div>
      </div>
    `;

    // ─────────────────────────────────────────────
    //  FOOTER HTML
    // ─────────────────────────────────────────────
    const footer = document.createElement("footer");
    footer.className = "footer";
    footer.innerHTML = `
      <div class="footer-grid">
        <div class="footer-brand">
          <img src="images/logo.png" alt="RRDCH Logo" class="footer-logo">
          <p>No. 14, Ramohalli Cross, Kumbalgodu,<br>Mysore Road, Bangalore - 560074.</p>
          <div class="footer-contact-meta">
            <strong>Ph:</strong> +91 80 2843 7150<br>
            <strong>Email:</strong> principalrrdch@gmail.com
          </div>
          <div style="margin-top:24px; display:flex; gap:16px;">
            <a href="https://facebook.com/rrdch" style="color:rgba(255,255,255,0.7); transition:color 0.2s;" onmouseover="this.style.color=\'var(--cu-gold)\';" onmouseout="this.style.color=\'rgba(255,255,255,0.7)\';"><i data-lucide="facebook" width="22" height="22"></i></a>
            <a href="https://twitter.com/rrdch" style="color:rgba(255,255,255,0.7); transition:color 0.2s;" onmouseover="this.style.color=\'var(--cu-gold)\';" onmouseout="this.style.color=\'rgba(255,255,255,0.7)\';">
              <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M4 4l11.733 16h4.267l-11.733 -16z"/><path d="M4 20l6.768 -6.768m2.46 -2.46l6.772 -6.772"/></svg>
            </a>
            <a href="https://youtube.com/rrdch" style="color:rgba(255,255,255,0.7); transition:color 0.2s;" onmouseover="this.style.color=\'var(--cu-gold)\';" onmouseout="this.style.color=\'rgba(255,255,255,0.7)\';"><i data-lucide="youtube" width="22" height="22"></i></a>
            <a href="https://instagram.com/rrdch" style="color:rgba(255,255,255,0.7); transition:color 0.2s;" onmouseover="this.style.color=\'var(--cu-gold)\';" onmouseout="this.style.color=\'rgba(255,255,255,0.7)\';"><i data-lucide="instagram" width="22" height="22"></i></a>
            <a href="https://linkedin.com/company/rrdch" style="color:rgba(255,255,255,0.7); transition:color 0.2s;" onmouseover="this.style.color=\'var(--cu-gold)\';" onmouseout="this.style.color=\'rgba(255,255,255,0.7)\';"><i data-lucide="linkedin" width="22" height="22"></i></a>
          </div>
        </div>
        <div class="footer-links">
          <h4>Academics</h4>
          <ul>
            <li><a href="admissions.html">Admissions</a></li>
            <li><a href="admission_enquiry.html">Admission Enquiry</a></li>
            <li><a href="departments.html">Departments</a></li>
          </ul>
        </div>
        <div class="footer-links">
          <h4>Hospital</h4>
          <ul>
            <li><a href="patients.html">Book Appointment</a></li>
            <li><a href="patients.html">Patient Care</a></li>
            <li><a href="doctors.html">Doctor Dashboard</a></li>
          </ul>
        </div>
        <div class="footer-links">
          <h4>Explore</h4>
          <ul>
            <li><a href="about.html">About Us</a></li>
            <li><a href="students.html">Student Portal</a></li>
            <li><a href="contact.html">Contact</a></li>
          </ul>
        </div>
      </div>
      <div class="footer-bottom">
        <p>© 2026 Rajarajeshwari Dental College and Hospital. All rights reserved.</p>
      </div>
    `;

    // ─── Inject into DOM ───
    document.body.prepend(shell);
    document.body.appendChild(footer);

    markCurrentPath(shell);
    markCurrentPath(footer);

    // ─────────────────────────────────────────────
    //  DRAWER OPEN / CLOSE LOGIC
    // ─────────────────────────────────────────────
    const menuBtn      = shell.querySelector("#menuToggleBtn");
    const drawer       = shell.querySelector("#siteDrawer");
    const backdrop     = shell.querySelector("#drawerBackdrop");
    const closeBtn     = shell.querySelector("#drawerCloseBtn");
    const drawerLeft   = shell.querySelector("#drawerLeft");
    const drawerRight  = shell.querySelector("#drawerRight");

    function openDrawer() {
      document.body.classList.add("nav-drawer-open");
      drawer.setAttribute("aria-hidden", "false");
      menuBtn.setAttribute("aria-expanded", "true");
      // Focus trap — focus first link inside drawer
      setTimeout(() => {
        drawerRight.querySelector("a, button")?.focus();
      }, 420);
    }

    function closeDrawer() {
      document.body.classList.remove("nav-drawer-open");
      drawer.setAttribute("aria-hidden", "true");
      menuBtn.setAttribute("aria-expanded", "false");
      menuBtn.focus();
    }

    menuBtn?.addEventListener("click", () => {
      if (document.body.classList.contains("nav-drawer-open")) closeDrawer();
      else openDrawer();
    });

    closeBtn?.addEventListener("click", closeDrawer);
    backdrop?.addEventListener("click", closeDrawer);

    // Close on any link click inside drawer
    drawer.querySelectorAll("a[href]").forEach((link) => {
      link.addEventListener("click", () => setTimeout(closeDrawer, 80));
    });

    // Keyboard: Escape
    document.addEventListener("keydown", (e) => {
      if (e.key === "Escape" && document.body.classList.contains("nav-drawer-open")) {
        closeDrawer();
      }
    });

    // ─────────────────────────────────────────────
    //  SCROLL FX — deepen header shadow on scroll
    // ─────────────────────────────────────────────
    const header = shell.querySelector("#siteHeader");
    let scrollTicking = false;
    window.addEventListener("scroll", () => {
      if (scrollTicking) return;
      scrollTicking = true;
      requestAnimationFrame(() => {
        const y = window.scrollY || 0;
        if (header) {
          header.style.boxShadow = y > 20
            ? "0 4px 28px rgba(0,0,0,0.14)"
            : "0 2px 12px rgba(0,0,0,0.06)";
        }
        scrollTicking = false;
      });
    }, { passive: true });

    // ─────────────────────────────────────────────
    //  RE-INIT LUCIDE icons for dynamically created shell
    // ─────────────────────────────────────────────
    if (window.lucide) {
      window.lucide.createIcons();
    } else {
      window.addEventListener("load", () => {
        if (window.lucide) window.lucide.createIcons();
      });
    }

    // ─── Expose API ───
    window.RRDCH_PUBLIC_SHELL = window.RRDCH_PUBLIC_SHELL || {};
    window.RRDCH_PUBLIC_SHELL.pageId      = pageId || "";
    window.RRDCH_PUBLIC_SHELL.openDrawer  = openDrawer;
    window.RRDCH_PUBLIC_SHELL.closeDrawer = closeDrawer;
  }

  // ─── Public API ───
  window.RRDCH_PUBLIC_SHELL = window.RRDCH_PUBLIC_SHELL || {};
  window.RRDCH_PUBLIC_SHELL.render  = renderShell;
  window.RRDCH_PUBLIC_SHELL.getLang = getLang;
  window.RRDCH_PUBLIC_SHELL.setLang = setLang;

  // Apply lang early
  const _lang = getLang();
  document.documentElement.setAttribute("data-lang", _lang);
  document.documentElement.setAttribute("lang", _lang);
})();
