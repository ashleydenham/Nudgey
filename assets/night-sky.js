/* ==========================================================================
   Doyle Cleaning Co — night-sky.js
   A live canvas night sky for the hero bands.

   - Deterministic starfield: seeded PRNG (mulberry32), so every visitor
     sees the *same* sky on the same page. It's our sky, not random noise.
   - Three parallax depth layers that drift gently with the pointer.
   - Per-star twinkle on individual sine phases; ~1 in 8 stars is teal.
   - A shooting star every 12–24 seconds with a fading trail.
   - Crescent moon with a soft breathing glow, drawn with composite ops.
   - Respectful engineering: DPR-aware (capped at 2), ResizeObserver,
     rendering pauses when the hero leaves the viewport or the tab hides.
   - Progressive enhancement: without JS (or with reduced motion) the CSS
     starfield fallback stays; this script swaps it for the live canvas.
   ========================================================================== */
(function () {
  'use strict';

  var reduce = window.matchMedia && matchMedia('(prefers-reduced-motion: reduce)');
  if (!window.requestAnimationFrame || !('ResizeObserver' in window)) return;
  if (reduce && reduce.matches) return;

  // Deterministic 32-bit PRNG — same seed, same sky.
  function mulberry32(a) {
    return function () {
      a |= 0; a = (a + 0x6D2B79F5) | 0;
      var t = Math.imul(a ^ (a >>> 15), 1 | a);
      t = (t + Math.imul(t ^ (t >>> 7), 61 | t)) ^ t;
      return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
    };
  }

  var pointer = { x: 0, y: 0, tx: 0, ty: 0 };
  addEventListener('pointermove', function (e) {
    pointer.tx = (e.clientX / innerWidth) - 0.5;
    pointer.ty = (e.clientY / innerHeight) - 0.5;
  }, { passive: true });

  function Sky(hero, seed) {
    var canvas = document.createElement('canvas');
    canvas.className = 'sky-canvas';
    canvas.setAttribute('aria-hidden', 'true');
    hero.insertBefore(canvas, hero.firstChild);
    hero.classList.add('sky-live');

    var ctx = canvas.getContext('2d');
    var w = 0, h = 0, dpr = 1;
    var stars = [];
    var meteor = null;
    var nextMeteorAt = 0;
    var running = false, rafId = 0, lastT = 0;

    var LAYERS = [
      { depth: 0.30, density: 1 / 26000 },
      { depth: 0.60, density: 1 / 20000 },
      { depth: 1.00, density: 1 / 15000 },
    ];

    function build() {
      var rnd = mulberry32(seed);
      stars = [];
      LAYERS.forEach(function (L) {
        var n = Math.min(90, Math.round(w * h * L.density));
        for (var i = 0; i < n; i++) {
          stars.push({
            x: rnd(), y: rnd() * 0.92,
            r: (0.5 + rnd() * 0.9) * L.depth,
            base: 0.25 + rnd() * 0.5,
            speed: 0.4 + rnd() * 1.1,        // twinkle speed (rad/s)
            phase: rnd() * Math.PI * 2,
            teal: rnd() < 0.12,
            depth: L.depth,
          });
        }
      });
    }

    function resize() {
      var rect = hero.getBoundingClientRect();
      if (rect.width === 0 || rect.height === 0) return;
      w = rect.width; h = rect.height;
      dpr = Math.min(2, window.devicePixelRatio || 1);
      canvas.width = Math.round(w * dpr);
      canvas.height = Math.round(h * dpr);
      ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
      build();
    }

    function spawnMeteor(t, rnd) {
      var goingRight = Math.random() < 0.5;
      meteor = {
        x: w * (0.15 + Math.random() * 0.7),
        y: h * (0.08 + Math.random() * 0.25),
        vx: (goingRight ? 1 : -1) * (0.28 + Math.random() * 0.12) * w / 1000,
        vy: (0.10 + Math.random() * 0.06) * h / 100,
        born: t, life: 900,
      };
      nextMeteorAt = t + 12000 + Math.random() * 12000;
    }

    function drawMoon(t) {
      var mx = w * 0.84, my = h * 0.24, r = Math.min(34, h * 0.11);
      // crescent first: full disc, then cut with destination-out
      ctx.save();
      ctx.beginPath(); ctx.arc(mx, my, r, 0, 7);
      ctx.fillStyle = 'rgba(233,238,242,0.92)'; ctx.fill();
      ctx.globalCompositeOperation = 'destination-out';
      ctx.beginPath(); ctx.arc(mx + r * 0.45, my - r * 0.35, r * 0.88, 0, 7);
      ctx.fill();
      // glow painted *behind* the crescent so the cut never punches through it
      ctx.globalCompositeOperation = 'destination-over';
      var breathe = 0.10 + 0.04 * Math.sin(t / 4000);
      var glow = ctx.createRadialGradient(mx, my, r * 0.6, mx, my, r * 3.2);
      glow.addColorStop(0, 'rgba(233,238,242,' + breathe + ')');
      glow.addColorStop(1, 'rgba(233,238,242,0)');
      ctx.fillStyle = glow;
      ctx.beginPath(); ctx.arc(mx, my, r * 3.2, 0, 7); ctx.fill();
      ctx.restore();
    }

    function frame(t) {
      if (!running) return;
      rafId = requestAnimationFrame(frame);
      if (t - lastT < 1000 / 45) return;   // ~45fps is plenty for a sky
      lastT = t;

      pointer.x += (pointer.tx - pointer.x) * 0.04;
      pointer.y += (pointer.ty - pointer.y) * 0.04;

      ctx.clearRect(0, 0, w, h);
      drawMoon(t);

      for (var i = 0; i < stars.length; i++) {
        var s = stars[i];
        var a = s.base * (0.65 + 0.35 * Math.sin(t / 1000 * s.speed + s.phase));
        var px = s.x * w - pointer.x * 16 * s.depth;
        var py = s.y * h - pointer.y * 10 * s.depth;
        ctx.beginPath();
        ctx.arc(px, py, s.r, 0, 7);
        ctx.fillStyle = s.teal
          ? 'rgba(127,224,216,' + a.toFixed(3) + ')'
          : 'rgba(255,255,255,' + a.toFixed(3) + ')';
        ctx.fill();
      }

      if (!meteor && t > nextMeteorAt) spawnMeteor(t);
      if (meteor) {
        var age = t - meteor.born;
        if (age > meteor.life) { meteor = null; }
        else {
          var k = 1 - age / meteor.life;                 // fades out
          var mx2 = meteor.x + meteor.vx * age;
          var my2 = meteor.y + meteor.vy * age;
          var tail = 90;
          var g = ctx.createLinearGradient(mx2, my2, mx2 - meteor.vx * tail * 6, my2 - meteor.vy * tail * 6);
          g.addColorStop(0, 'rgba(255,255,255,' + (0.8 * k).toFixed(3) + ')');
          g.addColorStop(1, 'rgba(255,255,255,0)');
          ctx.strokeStyle = g; ctx.lineWidth = 1.4; ctx.lineCap = 'round';
          ctx.beginPath();
          ctx.moveTo(mx2, my2);
          ctx.lineTo(mx2 - meteor.vx * tail * 6, my2 - meteor.vy * tail * 6);
          ctx.stroke();
        }
      }
    }

    function setRunning(on) {
      if (on === running) return;
      running = on;
      if (on) { nextMeteorAt = performance.now() + 4000 + Math.random() * 8000; rafId = requestAnimationFrame(frame); }
      else cancelAnimationFrame(rafId);
    }

    new ResizeObserver(resize).observe(hero);
    resize();

    var visible = true;
    new IntersectionObserver(function (entries) {
      visible = entries[0].isIntersecting;
      setRunning(visible && document.visibilityState === 'visible');
    }).observe(hero);
    document.addEventListener('visibilitychange', function () {
      setRunning(visible && document.visibilityState === 'visible');
    });

    this.destroy = function () {
      setRunning(false);
      canvas.remove();
      hero.classList.remove('sky-live');
    };
  }

  var skies = [];
  document.querySelectorAll('.hero, .page-hero').forEach(function (hero, i) {
    skies.push(new Sky(hero, 20260 + i * 101));
  });

  // If the user turns on reduced motion mid-session, hand back the static sky.
  if (reduce && reduce.addEventListener) {
    reduce.addEventListener('change', function (e) {
      if (e.matches) { skies.forEach(function (s) { s.destroy(); }); skies = []; }
    });
  }
})();
