const rrdchHeaderHTML = `
<!-- TOP BAR: Contact & Quick Links -->
<div class="header-top-bar">
  <div class="top-bar-inner">
    <div class="top-contact">
      <span>📞 +91-80-2843 7150, +91-80-2843 7468 & +91 9901559955</span>
      <span>✉️ principalrrdch@gmail.com</span>
    </div>
    <div class="top-links">
      <div class="top-links-row-1">
        <a href="#">ERP</a> | <a href="#">ESI</a> | <a href="#">Accreditation ▾</a> | <a href="#">DCI</a> | <a href="#">Brochure ▾</a> | <a href="#">Recognitions</a> | <a href="#">Committee ▾</a> | <a href="#">Schedule ▾</a> | <a href="#">Newsletter</a> | <a href="/feedback.html">Feedback</a> | <a href="#">Career</a>
      </div>
      <div class="top-links-row-2">
        <a href="#">Webmail</a> | <a href="#"><strong>*NAAC*</strong></a> | <a href="#"><strong>*NIRF*</strong></a> | <a href="#">Circulars</a> | <a href="#">E-Content</a> | <a href="#"><strong>*ONLINE FEES*</strong></a> | <a href="#">FEE (Terms)</a>
      </div>
    </div>
  </div>
</div>

<!-- TICKER (Announcements) -->
<div class="header-ticker">
  <div class="ticker-scroll">
    <span class="ticker-content">🚨 Admissions are invited from eligible candidates for Certificate Course in Implantology 2026-27. Interested candidates send your application to: pgrrdc@gmail.com 🚨 | Ph.D Entrance Exam Notification - Check details below</span>
  </div>
</div>

<!-- MAIN BRANDING & BADGES ROW -->
<div class="header-brand-badges">
  <div class="brand-badges-inner">
    <!-- Left: Logo & Titles -->
    <a href="/index.html" class="brand-logo-area">
      <!-- You can put the real RRDCH logo image here. I am using a textual rendering placeholder matching the style -->
      <div class="brand-emblem">RR</div>
      <div class="brand-titles">
        <div class="main-title">RajaRajeswari<br>Dental College & Hospital</div>
        <div class="sub-title">RECOGNIZED BY DENTAL COUNCIL OF INDIA & GOVT. OF INDIA<br>AFFILIATED TO RAJIVGANDHI UNIVERSITY OF HEALTH SCIENCE, BANGALORE</div>
      </div>
    </a>
    
    <!-- Right: Accreditations Block -->
    <div class="badges-area">
      <div class="badges-grid">
        <!-- Using high quality SVG/transparent badge links -->
        <img src="https://upload.wikimedia.org/wikipedia/commons/thumb/c/cd/NABH_logo.svg/100px-NABH_logo.svg.png" alt="NABH" class="accred-badge">
        <img src="https://upload.wikimedia.org/wikipedia/en/thumb/e/ef/National_Assessment_and_Accreditation_Council_logo.jpg/100px-National_Assessment_and_Accreditation_Council_logo.jpg" alt="NAAC" class="accred-badge" style="mix-blend-mode: multiply; border-radius: 50%; border: 2px solid white; background: white;">
        <img src="https://upload.wikimedia.org/wikipedia/commons/thumb/1/1a/ISO_9001-2015_Certified.png/100px-ISO_9001-2015_Certified.png" alt="ISO" class="accred-badge">
        <img src="https://upload.wikimedia.org/wikipedia/en/thumb/8/87/IAO_logo.png/100px-IAO_logo.png" alt="IAO" class="accred-badge">
        <img src="https://upload.wikimedia.org/wikipedia/en/thumb/5/52/Royal_College_of_Physicians_and_Surgeons_of_Glasgow_Coat_of_Arms.png/100px-Royal_College_of_Physicians_and_Surgeons_of_Glasgow_Coat_of_Arms.png" alt="Glasgow" class="accred-badge" style="background:#fff;padding:2px;border-radius:4px;">
        <div class="accred-badge fallback-badge">SLMC</div>
      </div>
      <div class="badges-subtitle">Recognised by Royal College of Physicians and Surgeons of Glasgow, UK for part 1 & 2 MFDS Examinations</div>
    </div>
  </div>
</div>

<!-- PRIMARY NAVIGATION -->
<nav class="header-main-nav">
  <div class="main-nav-inner">
    <ul class="nav-menu">
      <li><a href="/index.html">Home</a></li>
      <li><a href="/about.html">About Us ▾</a></li>
      <li><a href="/admissions.html">Courses Offered ▾</a></li>
      <li><a href="/departments.html">Department ▾</a></li>
      <li><a href="/admissions.html">Academics ▾</a></li>
      <li><a href="/about.html">Facilities ▾</a></li>
      <li><a href="/events.html">News & Events</a></li>
      <li><a href="#">Gallery ▾</a></li>
      <li><a href="#">Alumni</a></li>
      <li><a href="/contact.html">Contact us</a></li>
      <li><a href="/login.html" style="color:var(--gold);font-weight:700;">Portals</a></li>
    </ul>
    <div class="nav-search">
      <input type="text" placeholder="Search">
      <button>Search</button>
    </div>
  </div>
</nav>
`;

// Auto-inject header into #rrdch-header element
document.addEventListener("DOMContentLoaded", () => {
  const headerMount = document.getElementById("rrdch-header");
  if(headerMount) {
    headerMount.innerHTML = rrdchHeaderHTML;
    
    // Auto-active link highlight logic based on path
    const path = window.location.pathname;
    const links = headerMount.querySelectorAll('.nav-menu a');
    links.forEach(l => {
      // Very basic exact matching for this demo
      if(l.getAttribute('href') === path || 
         (path === '/' && l.getAttribute('href') === '/index.html')) {
        l.classList.add('active');
      }
    });

    // We can also bind language/dark toggle if needed here, but keeping it focused on the screenshot.
  }
});
