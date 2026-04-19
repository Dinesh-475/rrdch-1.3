/**
 * RRDCH traffic & behaviour signals — batches anonymous events with optional geolocation.
 * Uses querySelectorAll for declarative tracking hooks: [data-track], [data-section].
 */
(function () {
  const SESSION_KEY = 'rrdch_session_id';
  const API = '/api/public/telemetry';

  function sessionId() {
    try {
      let id = sessionStorage.getItem(SESSION_KEY);
      if (!id) {
        id = 'rd_' + Math.random().toString(36).slice(2) + '_' + Date.now().toString(36);
        sessionStorage.setItem(SESSION_KEY, id);
      }
      return id;
    } catch {
      return 'rd_fallback_' + Date.now();
    }
  }

  const sid = sessionId();
  let userCoords = null;
  const queue = [];
  let flushTimer = null;
  let flushing = false;

  function scheduleFlush() {
    if (flushTimer) return;
    flushTimer = setTimeout(flush, 3500);
  }

  function flush() {
    clearTimeout(flushTimer);
    flushTimer = null;
    if (!queue.length || flushing) return;
    flushing = true;
    const batch = queue.splice(0, 40);
    const payload = {
      sessionId: sid,
      path: window.location.pathname + window.location.search,
      geo: userCoords,
      events: batch,
    };
    const body = JSON.stringify(payload);
    const done = () => {
      flushing = false;
      if (queue.length) scheduleFlush();
    };

    fetch(API, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body,
      keepalive: true,
    })
      .catch(() => {})
      .finally(done);
  }

  function enqueue(ev) {
    queue.push(Object.assign({ ts: Date.now() }, ev));
    if (queue.length >= 14) flush();
    else scheduleFlush();
  }

  function collectHeadings() {
    const sel = 'main h1, main h2, article h1, article h2, .section-header h2, h1, h2';
    return Array.from(document.querySelectorAll(sel))
      .map((el) => (el.textContent || '').trim())
      .filter(Boolean)
      .slice(0, 18);
  }

  function bindTrackedClicks() {
    document.querySelectorAll('[data-track]').forEach((el) => {
      el.addEventListener(
        'click',
        () => {
          const label = el.getAttribute('data-track') || (el.textContent || '').trim().slice(0, 120);
          enqueue({
            type: 'click_track',
            target: label,
            meta: { tag: el.tagName, href: el.getAttribute('href') || null },
          });
        },
        { passive: true }
      );
    });
  }

  function bindSectionViews() {
    const sections = document.querySelectorAll('[data-section]');
    if (!sections.length) return;

    const io = new IntersectionObserver(
      (entries) => {
        entries.forEach((en) => {
          if (!en.isIntersecting || en.target.dataset.rrdchSeen) return;
          en.target.dataset.rrdchSeen = '1';
          enqueue({
            type: 'section_view',
            target: en.target.getAttribute('data-section') || en.target.id || 'section',
            meta: { ratio: Math.round((en.intersectionRatio || 0) * 100) / 100 },
          });
        });
      },
      { threshold: [0.25, 0.5] }
    );

    sections.forEach((s) => io.observe(s));
  }

  function requestGeoOnce() {
    if (!navigator.geolocation) return;
    navigator.geolocation.getCurrentPosition(
      (pos) => {
        userCoords = {
          lat: pos.coords.latitude,
          lng: pos.coords.longitude,
          accuracy: pos.coords.accuracy,
        };
        enqueue({ type: 'geo', target: 'granted', meta: { accuracy: pos.coords.accuracy } });
      },
      () => enqueue({ type: 'geo', target: 'denied_or_error', meta: {} }),
      { enableHighAccuracy: false, timeout: 9000, maximumAge: 600000 }
    );
  }

  window.addEventListener(
    'visibilitychange',
    () => {
      if (document.visibilityState === 'hidden') flush();
    },
    { passive: true }
  );
  window.addEventListener('pagehide', flush, { passive: true });

  window.addEventListener('DOMContentLoaded', () => {
    enqueue({
      type: 'pageview',
      target: document.title || 'untitled',
      meta: {
        referrer: document.referrer || '',
        headings: collectHeadings(),
        lang: document.documentElement.lang || 'en',
      },
    });

    bindTrackedClicks();
    bindSectionViews();
    requestGeoOnce();
  });

  window.RRDCHTraffic = { enqueue, flush, get userCoords() { return userCoords; }, get sessionId() { return sid; } };
})();
