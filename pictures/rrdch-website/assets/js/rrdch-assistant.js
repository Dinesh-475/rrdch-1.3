/**
 * RRDCH site assistant — campus/guide + symptom triage via server-side Gemini.
 */
(function () {
  if (window.RRDCHAssistantLoaded) return;
  window.RRDCHAssistantLoaded = true;

  let geminiEnabled = false;
  const guideHistory = [];
  const symptomHistory = [];

  function pageContext() {
    const desc = document.querySelector('meta[name="description"]');
    return {
      title: document.title,
      path: window.location.pathname,
      href: window.location.href.split('#')[0],
      description: (desc && desc.content) ? desc.content.slice(0, 500) : '',
      headings: Array.from(document.querySelectorAll('main h1, main h2, .section-header h2, h1, h2'))
        .map((h) => (h.textContent || '').trim())
        .filter(Boolean)
        .slice(0, 20),
    };
  }

  async function postAI(path, body) {
    const res = await fetch(path, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(body),
    });
    const data = await res.json().catch(() => ({}));
    if (!res.ok || !data.ok) {
      throw new Error(data.msg || 'Assistant unavailable');
    }
    return data.text;
  }

  function bubble(text, role) {
    const row = document.createElement('div');
    row.className = 'rrdch-assist-msg ' + (role === 'user' ? 'is-user' : 'is-bot');
    const p = document.createElement('p');
    p.textContent = text;
    row.appendChild(p);
    return row;
  }

  function mountUI() {
    const root = document.createElement('div');
    root.className = 'rrdch-assist';
    root.innerHTML = `
      <button type="button" class="rrdch-assist-fab" aria-expanded="false" aria-controls="rrdchAssistPanel" title="Ask RRDCH">
        <span class="rrdch-assist-fab-icon" aria-hidden="true"></span>
        <span class="rrdch-assist-fab-label">Help</span>
      </button>
      <div id="rrdchAssistPanel" class="rrdch-assist-panel" hidden>
        <header class="rrdch-assist-head">
          <div>
            <div class="rrdch-assist-title">RRDCH desk</div>
            <div class="rrdch-assist-sub">Campus answers &amp; symptom triage</div>
          </div>
          <button type="button" class="rrdch-assist-close" aria-label="Close">&times;</button>
        </header>
        <div class="rrdch-assist-tabs" role="tablist">
          <button type="button" class="rrdch-assist-tab is-active" data-tab="guide" role="tab" aria-selected="true">This page</button>
          <button type="button" class="rrdch-assist-tab" data-tab="symptom" role="tab" aria-selected="false">Dental symptoms</button>
        </div>
        <div class="rrdch-assist-chips" data-chips="guide">
          <button type="button" class="rrdch-chip" data-prefill="What is this page about, and where should I click next?">Page overview</button>
          <button type="button" class="rrdch-chip" data-prefill="How do I book an OPD appointment?">Book OPD</button>
          <button type="button" class="rrdch-chip" data-prefill="BDS and MDS admissions — whom should I contact?">Admissions</button>
          <button type="button" class="rrdch-chip" data-prefill="Campus address, directions, and parking">Directions</button>
        </div>
        <div class="rrdch-assist-chips" data-chips="symptom" hidden>
          <button type="button" class="rrdch-chip" data-prefill="Toothache for two days, worse with hot drinks">Toothache</button>
          <button type="button" class="rrdch-chip" data-prefill="Bleeding gums when brushing">Gum bleeding</button>
          <button type="button" class="rrdch-chip" data-prefill="Child 10 years, cavity in molar">Child patient</button>
        </div>
        <div class="rrdch-assist-thread" data-thread></div>
        <p class="rrdch-assist-disclaimer">Not a substitute for a clinical exam. AI can be wrong — call 080-28437150 for urgent care.</p>
        <div class="rrdch-assist-inputrow">
          <input type="text" class="rrdch-assist-input" autocomplete="off" placeholder="Type a question…" aria-label="Message" />
          <button type="button" class="rrdch-assist-send">Send</button>
        </div>
      </div>
    `;
    document.body.appendChild(root);

    const fab = root.querySelector('.rrdch-assist-fab');
    const panel = root.querySelector('.rrdch-assist-panel');
    const closeBtn = root.querySelector('.rrdch-assist-close');
    const tabs = root.querySelectorAll('.rrdch-assist-tab');
    const chipsGuide = root.querySelector('[data-chips="guide"]');
    const chipsSym = root.querySelector('[data-chips="symptom"]');
    const thread = root.querySelector('[data-thread]');
    const input = root.querySelector('.rrdch-assist-input');
    const sendBtn = root.querySelector('.rrdch-assist-send');

    let mode = 'guide';

    function setMode(next) {
      mode = next;
      tabs.forEach((t) => {
        const on = t.dataset.tab === mode;
        t.classList.toggle('is-active', on);
        t.setAttribute('aria-selected', on ? 'true' : 'false');
      });
      chipsGuide.hidden = mode !== 'guide';
      chipsSym.hidden = mode !== 'symptom';
      thread.innerHTML = '';
      const hist = mode === 'guide' ? guideHistory : symptomHistory;
      hist.forEach((m) => thread.appendChild(bubble(m.text, m.role)));
      input.placeholder = mode === 'guide' ? 'Ask about this site or RRDCH…' : 'Describe symptoms in your own words…';
    }

    function appendLocal(text, role) {
      thread.appendChild(bubble(text, role));
      thread.scrollTop = thread.scrollHeight;
    }

    async function submit() {
      const text = (input.value || '').trim();
      if (!text) return;
      input.value = '';
      const hist = mode === 'guide' ? guideHistory : symptomHistory;
      hist.push({ role: 'user', text });
      appendLocal(text, 'user');

      const typing = document.createElement('div');
      typing.className = 'rrdch-assist-msg is-bot is-typing';
      typing.textContent = '…';
      thread.appendChild(typing);
      thread.scrollTop = thread.scrollHeight;

      try {
        if (!geminiEnabled) {
          throw new Error('Assistant is offline. Run the site from the Node server with GEMINI_API_KEY set.');
        }
        const messages = hist.map((m) => ({ role: m.role, text: m.text }));
        const path = mode === 'guide' ? '/api/public/ai/guide' : '/api/public/ai/symptom';
        const body =
          mode === 'guide'
            ? { messages, pageContext: pageContext() }
            : { messages };
        const reply = await postAI(path, body);
        typing.remove();
        hist.push({ role: 'assistant', text: reply });
        appendLocal(reply, 'assistant');
      } catch (e) {
        typing.remove();
        const msg = e.message || 'Something went wrong.';
        appendLocal(msg, 'assistant');
        hist.pop();
      }
    }

    fab.addEventListener('click', () => {
      const open = panel.hasAttribute('hidden');
      if (open) {
        panel.removeAttribute('hidden');
        fab.setAttribute('aria-expanded', 'true');
        input.focus();
      } else {
        panel.setAttribute('hidden', '');
        fab.setAttribute('aria-expanded', 'false');
      }
    });

    closeBtn.addEventListener('click', () => {
      panel.setAttribute('hidden', '');
      fab.setAttribute('aria-expanded', 'false');
    });

    tabs.forEach((t) =>
      t.addEventListener('click', () => {
        if (t.dataset.tab === 'guide' || t.dataset.tab === 'symptom') setMode(t.dataset.tab);
      })
    );

    root.querySelectorAll('.rrdch-chip').forEach((c) => {
      c.addEventListener('click', () => {
        const pre = c.getAttribute('data-prefill');
        if (pre) {
          input.value = pre;
          submit();
        }
      });
    });

    sendBtn.addEventListener('click', submit);
    input.addEventListener('keydown', (e) => {
      if (e.key === 'Enter') submit();
    });

    setMode('guide');
  }

  fetch('/api/public/config')
    .then((r) => r.json())
    .then((cfg) => {
      geminiEnabled = Boolean(cfg?.data?.geminiEnabled);
      mountUI();
    })
    .catch(() => {
      geminiEnabled = false;
      mountUI();
    });
})();
