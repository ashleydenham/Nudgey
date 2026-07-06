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
})();
