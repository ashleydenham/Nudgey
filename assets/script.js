/* Doyle Cleaning Co — shared UI script (nav + quote form) */
(function () {
  'use strict';

  // Mobile menu toggle
  var toggle = document.getElementById('menuToggle');
  var links = document.getElementById('navLinks');
  if (toggle && links) {
    toggle.addEventListener('click', function () {
      var isOpen = links.classList.toggle('open');
      toggle.setAttribute('aria-expanded', isOpen ? 'true' : 'false');
    });
    links.querySelectorAll('a').forEach(function (a) {
      a.addEventListener('click', function () {
        links.classList.remove('open');
        toggle.setAttribute('aria-expanded', 'false');
      });
    });
    // Close on Escape
    document.addEventListener('keydown', function (e) {
      if (e.key === 'Escape' && links.classList.contains('open')) {
        links.classList.remove('open');
        toggle.setAttribute('aria-expanded', 'false');
        toggle.focus();
      }
    });
  }

  // Quote form (draft: no backend yet — shows a confirmation state only)
  var form = document.getElementById('quoteForm');
  var statusEl = document.getElementById('formStatus');
  if (form && statusEl) {
    form.addEventListener('submit', function (e) {
      e.preventDefault();
      statusEl.classList.add('show');
      statusEl.setAttribute('tabindex', '-1');
      statusEl.focus();
      form.reset();
    });
  }

  // Theme toggle (initial theme is applied by an inline <head> snippet to avoid a flash)
  var root = document.documentElement;
  var themeBtn = document.getElementById('themeToggle');
  if (themeBtn) {
    themeBtn.addEventListener('click', function () {
      var next = root.dataset.theme === 'dark' ? 'light' : 'dark';
      root.dataset.theme = next;
      try { localStorage.setItem('doyle-theme', next); } catch (e) {}
    });
  }

  // Auto-update the copyright year
  document.querySelectorAll('.js-year').forEach(function (el) {
    el.textContent = new Date().getFullYear();
  });

  // Scroll reveal — skipped entirely for reduced-motion or missing IntersectionObserver,
  // so content is always visible without JS or when motion is reduced.
  var prefersReduced = window.matchMedia && window.matchMedia('(prefers-reduced-motion: reduce)').matches;
  if (!prefersReduced && 'IntersectionObserver' in window) {
    var sel = '.service-card, .feature-card, .product-card, .founder-card, .role-card, .industry-item, .testimonial, .step, .info-strip, .cta-banner';
    var items = Array.prototype.slice.call(document.querySelectorAll(sel));
    var io = new IntersectionObserver(function (entries) {
      entries.forEach(function (e) {
        if (e.isIntersecting) { e.target.classList.add('in'); io.unobserve(e.target); }
      });
    }, { threshold: 0.12, rootMargin: '0px 0px -40px 0px' });
    items.forEach(function (el) {
      el.classList.add('reveal');
      var idx = el.parentElement ? Array.prototype.indexOf.call(el.parentElement.children, el) : 0;
      el.style.transitionDelay = (Math.min(idx, 4) * 60) + 'ms';
      io.observe(el);
    });
  }
})();
