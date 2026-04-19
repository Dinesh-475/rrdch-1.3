// ==========================================
// RRDCH — Global JavaScript
// ==========================================

function rrdchAssetPath(rel) {
  rel = String(rel || '').replace(/^\//, '');
  if ((window.location.pathname || '').includes('/portals/')) return '../' + rel;
  return rel;
}

// --- Dark Mode ---
const darkToggle = document.getElementById('darkToggle');
const html = document.documentElement;

function initTheme() {
  const saved = localStorage.getItem('rrdch_theme') || 'light';
  html.setAttribute('data-theme', saved);
  if (darkToggle) darkToggle.textContent = saved === 'dark' ? '☀️' : '🌙';
}

if (darkToggle) {
  darkToggle.addEventListener('click', () => {
    const current = html.getAttribute('data-theme');
    const next = current === 'dark' ? 'light' : 'dark';
    html.setAttribute('data-theme', next);
    localStorage.setItem('rrdch_theme', next);
    darkToggle.textContent = next === 'dark' ? '☀️' : '🌙';
  });
}

// --- Language Toggle (Google Translate) ---
const langBtn = document.getElementById('langToggle');

function readCookie(name) {
  const c = document.cookie.split(';');
  for(let i=0; i<c.length; i++) {
    const pair = c[i].trim().split('=');
    if(pair[0] === name) return pair[1];
  }
  return null;
}

const currentLangCookie = readCookie('googtrans');
let lang = 'en';
if (currentLangCookie && currentLangCookie.includes('/kn')) {
  lang = 'kn';
}

function applyLang() {
  if (langBtn) {
    langBtn.textContent = lang === 'kn' ? 'EN' : 'ಕನ್ನಡ';
  }
}

if (langBtn) {
  langBtn.addEventListener('click', () => {
    lang = lang === 'en' ? 'kn' : 'en';
    if (lang === 'kn') {
      document.cookie = 'googtrans=/en/kn; path=/';
      document.cookie = 'googtrans=/en/kn; domain=' + window.location.hostname + '; path=/';
    } else {
      document.cookie = 'googtrans=/en/en; path=/';
      document.cookie = 'googtrans=/en/en; domain=' + window.location.hostname + '; path=/';
      // clear cookie
      document.cookie = 'googtrans=; expires=Thu, 01 Jan 1970 00:00:00 UTC; path=/;';
      document.cookie = 'googtrans=; expires=Thu, 01 Jan 1970 00:00:00 UTC; domain=' + window.location.hostname + '; path=/;';
    }
    window.location.reload();
  });
}

// Inject Google Translate script if not already there
if (!document.getElementById('google_translate_script')) {
  const script = document.createElement('script');
  script.id = 'google_translate_script';
  script.src = 'https://translate.google.com/translate_a/element.js?cb=googleTranslateElementInit';
  document.head.appendChild(script);

  window.googleTranslateElementInit = function() {
    new google.translate.TranslateElement({pageLanguage: 'en', includedLanguages: 'kn', autoDisplay: false}, 'google_translate_element');
  };

  const gtDiv = document.createElement('div');
  gtDiv.id = 'google_translate_element';
  gtDiv.style.display = 'none';
  document.body.appendChild(gtDiv);

  // Hide the Google Translate banner
  const style = document.createElement('style');
  style.innerHTML = `
    .skiptranslate iframe,
    .VIpgJd-ZVi9od-ORHb-OEVmcd,
    #goog-gt-tt { display: none !important; }
    body { top: 0 !important; }
  `;
  document.head.appendChild(style);
}

// --- Navbar Scroll Effect ---
const navbar = document.querySelector('.navbar');
if (navbar) {
  window.addEventListener('scroll', () => {
    navbar.classList.toggle('scrolled', window.scrollY > 30);
  }, { passive: true });
}

// --- Hamburger Menu ---
const hamburger = document.getElementById('hamburger');
const navMenu = document.getElementById('navMenu');
if (hamburger && navMenu) {
  hamburger.addEventListener('click', (e) => {
    e.stopPropagation();
    const open = navMenu.classList.toggle('open');
    hamburger.classList.toggle('open', open);
  });
  document.addEventListener('click', e => {
    if (!hamburger.contains(e.target) && !navMenu.contains(e.target)) {
      navMenu.classList.remove('open');
      hamburger.classList.remove('open');
    }
  });
}

// --- Animated Counter ---
function animateCounter(el) {
  const target = parseFloat(el.dataset.target);
  const suffix = el.dataset.suffix || '';
  const prefix = el.dataset.prefix || '';
  const duration = 1500;
  const start = performance.now();

  function step(now) {
    const progress = Math.min((now - start) / duration, 1);
    const ease = 1 - Math.pow(1 - progress, 3);
    const val = Math.round(ease * target * 10) / 10;
    el.textContent = prefix + (Number.isInteger(target) ? Math.round(ease * target) : val) + suffix;
    if (progress < 1) requestAnimationFrame(step);
  }
  requestAnimationFrame(step);
}

// --- Intersection Observer for animations ---
const observer = new IntersectionObserver((entries) => {
  entries.forEach(entry => {
    if (entry.isIntersecting) {
      entry.target.classList.add('visible');
      if (entry.target.dataset.target) animateCounter(entry.target);
      observer.unobserve(entry.target);
    }
  });
}, { threshold: 0.15 });

document.querySelectorAll('.animate-on-scroll, [data-target]').forEach(el => observer.observe(el));

// --- Toast Notifications ---
function showToast(msg, type = 'success') {
  let container = document.querySelector('.toast-container');
  if (!container) {
    container = document.createElement('div');
    container.className = 'toast-container';
    document.body.appendChild(container);
  }
  const toast = document.createElement('div');
  const icon = type === 'success' ? '✅' : type === 'error' ? '❌' : 'ℹ️';
  toast.className = `toast ${type}`;
  toast.innerHTML = `<span>${icon}</span><span>${msg}</span>`;
  container.appendChild(toast);
  setTimeout(() => toast.remove(), 4000);
}
window.showToast = showToast;

// --- Tabs ---
document.querySelectorAll('.tab-btn').forEach(btn => {
  btn.addEventListener('click', () => {
    const group = btn.closest('[data-tabs]');
    const target = btn.dataset.tab;
    group.querySelectorAll('.tab-btn').forEach(b => b.classList.remove('active'));
    group.querySelectorAll('.tab-content').forEach(c => c.classList.remove('active'));
    btn.classList.add('active');
    const panel = group.querySelector(`[data-tab-panel="${target}"]`);
    if (panel) panel.classList.add('active');
  });
});

// --- Sidebar mobile toggle ---
const sidebarToggle = document.getElementById('sidebarToggle');
const sidebar = document.querySelector('.sidebar');
if (sidebarToggle && sidebar) {
  sidebarToggle.addEventListener('click', () => sidebar.classList.toggle('open'));
}

// --- Standard public navbar (consistent order; portals use ../ paths) ---
function initStandardNav() {
  const ul = document.getElementById('navMenu');
  if (!ul || ul.dataset.navSynced === '1') return;
  const portal = window.location.pathname.includes('/portals/');
  const prefix = portal ? '../' : '';
  let file = window.location.pathname.split('/').filter(Boolean).pop();
  if (!file || !file.endsWith('.html')) file = 'index.html';

  const items = [
    { href: 'index.html', label: 'Home', track: 'nav-home' },
    { href: 'about.html', label: 'About', track: 'nav-about' },
    { href: 'departments.html', label: 'Departments', track: 'nav-departments' },
    { href: 'admissions.html', label: 'Admissions', track: 'nav-admissions' },
    { href: 'students.html', label: 'Students', track: 'nav-students' },
    { href: 'appointments.html', label: 'Appointments', track: 'nav-appointments' },
    { href: 'research.html', label: 'Research', track: 'nav-research' },
    { href: 'events.html', label: 'Events', track: 'nav-events' },
    { href: 'virtual-tour.html', label: 'Campus Tour', track: 'nav-tour' },
    { href: 'feedback.html', label: 'Feedback', track: 'nav-feedback' },
    { href: 'contact.html', label: 'Contact', track: 'nav-contact' },
    { href: 'login.html', label: 'Portal Login', track: 'nav-portal-login', portalAccent: true },
  ];

  ul.innerHTML = items
    .map((it) => {
      const href = prefix + it.href;
      const isActive = file === it.href;
      const cls = isActive ? ' class="active"' : '';
      const accent = it.portalAccent ? ' style="color:var(--gold);font-weight:700;"' : '';
      return `<li><a href="${href}" data-track="${it.track}"${cls}${accent}>${it.label}</a></li>`;
    })
    .join('');
  ul.dataset.navSynced = '1';
}

function highlightActiveNav() {
  let currentPath = window.location.pathname.split('/').filter(Boolean).pop() || 'index.html';
  if (!currentPath.endsWith('.html')) currentPath = 'index.html';
  document.querySelectorAll('.navbar-nav a').forEach((link) => {
    link.classList.remove('active');
    const href = link.getAttribute('href') || '';
    const file = href.split('/').pop();
    if (file === currentPath) link.classList.add('active');
  });
}

// --- Smooth scroll for anchor links ---
document.querySelectorAll('a[href^="#"]').forEach(a => {
  a.addEventListener('click', e => {
    const target = document.querySelector(a.getAttribute('href'));
    if (target) {
      e.preventDefault();
      target.scrollIntoView({ behavior: 'smooth', block: 'start' });
    }
  });
});

// Init on load
function observeTranslateLayout() {
  const html = document.documentElement;
  const apply = () => {
    const translated = /\btranslated\b/i.test(html.className);
    html.classList.toggle('rrdch-translated', translated);
  };
  apply();
  try {
    new MutationObserver(apply).observe(html, { attributes: true, attributeFilter: ['class'] });
  } catch (_) {}
}

window.addEventListener('DOMContentLoaded', () => {
  initStandardNav();
  highlightActiveNav();
  observeTranslateLayout();
  if (!document.querySelector('.scroll-progress')) {
    const progress = document.createElement('div');
    progress.className = 'scroll-progress';
    document.body.appendChild(progress);
  }
  initTheme();
  applyLang();
});

window.addEventListener('scroll', () => {
  const docHeight = document.documentElement.scrollHeight - window.innerHeight;
  const pct = docHeight > 0 ? (window.scrollY / docHeight) * 100 : 0;
  const bar = document.querySelector('.scroll-progress');
  if (bar) bar.style.width = `${Math.min(100, Math.max(0, pct))}%`;
}, { passive: true });

// --- Register Service Worker ---
if ('serviceWorker' in navigator) {
  window.addEventListener('load', () => {
    navigator.serviceWorker.register('/sw.js')
      .then(registration => {
        console.log('ServiceWorker registration successful with scope: ', registration.scope);
      }, err => {
        console.log('ServiceWorker registration failed: ', err);
      });
  });
}

// Site assistant (Gemini, server-side) + anonymous traffic signals
if (!document.querySelector('script[data-rrdch-traffic]')) {
  const traffic = document.createElement('script');
  traffic.src = rrdchAssetPath('assets/js/traffic-manager.js');
  traffic.dataset.rrdchTraffic = 'true';
  document.body.appendChild(traffic);
}
if (!document.querySelector('script[data-rrdch-assistant]')) {
  const assist = document.createElement('script');
  assist.src = rrdchAssetPath('assets/js/rrdch-assistant.js');
  assist.dataset.rrdchAssistant = 'true';
  document.body.appendChild(assist);
}
