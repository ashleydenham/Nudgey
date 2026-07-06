/* ==========================================================================
   Doyle Cleaning Co — chat assistant (draft)

   PHASE 2 (current): a constrained, RULE-BASED FAQ assistant. Every answer
   below is pre-written and reviewable — the assistant cannot invent claims,
   quote prices, or make commitments, which keeps it safe under Australian
   Consumer Law. Anything it can't answer is handed off to the contact form.

   PHASE 3 (later): swap the body of `getBotReply()` for a call to a Grok/xAI
   (or Claude) API. IMPORTANT: the API key must NOT live in this file — it
   would be exposed to every visitor. Put it behind a small serverless
   endpoint (e.g. /api/chat) that injects the key server-side and applies a
   system prompt with guardrails ("never quote prices or guarantee insurance/
   clearances; hand off to the team for anything specific"). Then replace the
   rule lookup with:  const r = await fetch('/api/chat', {...}); return r.text;
   ========================================================================== */
(function () {
  'use strict';

  var KB = [
    {
      test: /(service|offer|clean what|type of clean|what do you)/i,
      reply: "We're a commercial cleaning business with two core services: ongoing after-hours cleaning for offices, retail and medical spaces, and end-of-lease (make-good) vacate cleans. Want a quote for either one?"
    },
    {
      test: /(after hours|out of hours|business hours|disrupt|overnight|evening)/i,
      reply: "Yes — our commercial cleaning is done outside your operating hours so your business is never disrupted. Tell us your hours on the contact form and we'll work around them."
    },
    {
      test: /(end of lease|vacate|make good|make-good|moving out|bond)/i,
      reply: "Our end-of-lease / vacate cleans are a full make-good clean for commercial tenants handing back a lease — offices, warehouses and retail fit-outs. Send us the site details for a quote."
    },
    {
      test: /(quote|price|cost|how much|estimate|charge)/i,
      reply: "Every site is different, so we quote individually rather than list prices. Head to the Contact page (or tap 'Get a quote') with your site size and hours, and Ashley or Bradley will get back to you with a clear, upfront quote."
    },
    {
      test: /(insur|liab|police|clearance|vetted|nda|confidential|privacy)/i,
      reply: "Trust matters to us: we're an owner-operated business and can provide details of our public liability insurance and clearances, and we're happy to sign an NDA for sensitive sites. For specifics, please reach out via the Contact page so we can share the right documents."
    },
    {
      test: /(area|location|suburb|where|region|servic(e|ing) area)/i,
      reply: "Our service area is being finalised — pop your suburb into the contact form and we'll confirm whether we can reach you."
    },
    {
      test: /(hour|open|available|when can|time)/i,
      reply: "Our operating hours are being finalised. In the meantime, leave your details on the Contact page and we'll be in touch to arrange a time."
    },
    {
      test: /(job|work|career|employ|hiring|apply|vacanc)/i,
      reply: "We'd love to hear from you — see our Careers page. We're an inclusive, equal-opportunity business. You can register your interest through the contact form there."
    },
    {
      test: /(login|portal|invoice|pay|payment|account)/i,
      reply: "Our client portal for managing bookings and paying invoices is coming soon. For now, please use the Contact page and we'll help you directly."
    },
    {
      test: /(who|owner|about|ashley|bradley|founder)/i,
      reply: "Doyle Cleaning Co is owner-operated by Ashley and Bradley, who bring backgrounds in healthcare-facilities management, compliance and hospitality standards. There's more on the About page."
    },
    {
      test: /(hello|hi|hey|good (morning|afternoon|evening))/i,
      reply: "Hi there! I'm the Doyle Cleaning Co assistant. I can help with our services, quotes, and getting in touch. What are you after?"
    },
    {
      test: /(thank|cheers|ta|appreciate)/i,
      reply: "You're welcome! Anything else I can help with?"
    }
  ];

  var FALLBACK = "I'm a simple assistant for now, so I might not have that answer. The quickest way to get a proper response is the Contact page — Ashley or Bradley will personally get back to you. Would you like me to point you there?";

  var QUICK = [
    { label: 'Our services', text: 'What services do you offer?' },
    { label: 'Get a quote', text: 'How do I get a quote?' },
    { label: 'After-hours cleaning', text: 'Do you clean after hours?' },
    { label: 'Insurance & NDAs', text: 'Are you insured and do you sign NDAs?' }
  ];

  function getBotReply(message) {
    for (var i = 0; i < KB.length; i++) {
      if (KB[i].test.test(message)) return KB[i].reply;
    }
    return FALLBACK;
  }

  // ---- UI ----
  function el(tag, cls, html) {
    var e = document.createElement(tag);
    if (cls) e.className = cls;
    if (html != null) e.innerHTML = html;
    return e;
  }

  var launcher = el('button', 'chat-launcher');
  launcher.type = 'button';
  launcher.setAttribute('aria-label', 'Open chat assistant');
  launcher.innerHTML = '<svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" aria-hidden="true"><path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z"/></svg> Chat with us';

  var panel = el('div', 'chat-panel');
  panel.setAttribute('role', 'dialog');
  panel.setAttribute('aria-label', 'Doyle Cleaning Co chat assistant');
  panel.innerHTML =
    '<div class="chat-head"><div><strong>Doyle Assistant</strong><span>Typically replies via the contact form</span></div>' +
    '<button class="chat-close" type="button" aria-label="Close chat">&times;</button></div>' +
    '<div class="chat-body" id="chatBody" aria-live="polite"></div>' +
    '<div class="chat-quick" id="chatQuick"></div>' +
    '<form class="chat-input" id="chatForm"><label class="visually-hidden" for="chatText" style="position:absolute;width:1px;height:1px;overflow:hidden;clip:rect(0 0 0 0);">Your message</label>' +
    '<input id="chatText" type="text" autocomplete="off" placeholder="Type a message…" /><button type="submit">Send</button></form>' +
    '<p class="chat-note">Automated assistant — for anything specific, Ashley or Bradley will reply personally.</p>';

  document.body.appendChild(launcher);
  document.body.appendChild(panel);

  var body = panel.querySelector('#chatBody');
  var quick = panel.querySelector('#chatQuick');
  var chatForm = panel.querySelector('#chatForm');
  var input = panel.querySelector('#chatText');
  var greeted = false;

  function addMsg(text, who) {
    var m = el('div', 'chat-msg ' + who);
    m.textContent = text;
    body.appendChild(m);
    body.scrollTop = body.scrollHeight;
  }

  function botRespond(text) {
    // Small delay so it reads like a reply, not an instant echo.
    setTimeout(function () { addMsg(getBotReply(text), 'bot'); }, 350);
  }

  function renderQuick() {
    quick.innerHTML = '';
    QUICK.forEach(function (q) {
      var b = el('button', null, q.label);
      b.type = 'button';
      b.addEventListener('click', function () {
        addMsg(q.label, 'user');
        botRespond(q.text);
      });
      quick.appendChild(b);
    });
  }

  function openPanel() {
    panel.classList.add('open');
    launcher.style.display = 'none';
    if (!greeted) {
      addMsg("Hi! I'm the Doyle Cleaning Co assistant. Ask me about our services, quotes or getting in touch.", 'bot');
      renderQuick();
      greeted = true;
    }
    input.focus();
  }
  function closePanel() {
    panel.classList.remove('open');
    launcher.style.display = 'inline-flex';
    launcher.focus();
  }

  launcher.addEventListener('click', openPanel);
  panel.querySelector('.chat-close').addEventListener('click', closePanel);
  document.addEventListener('keydown', function (e) {
    if (e.key === 'Escape' && panel.classList.contains('open')) closePanel();
  });

  chatForm.addEventListener('submit', function (e) {
    e.preventDefault();
    var text = input.value.trim();
    if (!text) return;
    addMsg(text, 'user');
    input.value = '';
    botRespond(text);
  });
})();
