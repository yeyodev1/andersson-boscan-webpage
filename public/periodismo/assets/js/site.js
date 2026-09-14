/* Comportamientos compartidos: revelado por scroll, barra de progreso, nav activa */
(function () {
  'use strict';
  const reduce = window.matchMedia('(prefers-reduced-motion: reduce)').matches;

  // Revelado
  const io = new IntersectionObserver((entries) => {
    entries.forEach((e) => {
      if (e.isIntersecting) { e.target.classList.add('in'); io.unobserve(e.target); }
    });
  }, { rootMargin: '0px 0px -8% 0px', threshold: 0.08 });
  document.querySelectorAll('.reveal, [data-stagger], .tl, .net').forEach((el) => io.observe(el));
  document.querySelectorAll('[data-stagger]').forEach((g) => {
    [...g.children].forEach((c, i) => { c.style.transitionDelay = (i * 70) + 'ms'; });
  });

  // Barra de progreso de lectura
  const bar = document.querySelector('.progress > i');
  if (bar) {
    const upd = () => {
      const h = document.documentElement;
      const p = h.scrollTop / (h.scrollHeight - h.clientHeight);
      bar.style.width = (Math.max(0, Math.min(1, p)) * 100) + '%';
    };
    addEventListener('scroll', upd, { passive: true }); upd();
  }

  // Nav activa por sección
  const links = [...document.querySelectorAll('.topbar__nav a[href^="#"]')];
  if (links.length) {
    const secs = links.map((a) => document.querySelector(a.getAttribute('href'))).filter(Boolean);
    const nio = new IntersectionObserver((entries) => {
      entries.forEach((e) => {
        if (e.isIntersecting) {
          links.forEach((a) => a.classList.toggle('is-active', a.getAttribute('href') === '#' + e.target.id));
        }
      });
    }, { rootMargin: '-40% 0px -55% 0px' });
    secs.forEach((s) => nio.observe(s));
  }

  // Paralaje suave en figuras
  const pf = [...document.querySelectorAll('[data-parallax] img')];
  if (pf.length && !reduce) {
    let ticking = false;
    const run = () => {
      const vh = innerHeight;
      pf.forEach((img) => {
        const r = img.getBoundingClientRect();
        if (r.bottom < 0 || r.top > vh) return;
        const t = (r.top + r.height / 2 - vh / 2) / vh; // -1..1
        img.style.transform = 'translateY(' + (t * -24).toFixed(1) + 'px) scale(1.06)';
      });
      ticking = false;
    };
    addEventListener('scroll', () => { if (!ticking) { requestAnimationFrame(run); ticking = true; } }, { passive: true });
    run();
  }

  // Contadores
  const counters = document.querySelectorAll('[data-count]');
  const cio = new IntersectionObserver((entries) => {
    entries.forEach((e) => {
      if (!e.isIntersecting) return;
      cio.unobserve(e.target);
      const el = e.target, end = parseFloat(el.dataset.count), dec = parseInt(el.dataset.dec || '0', 10);
      const suf = el.dataset.suffix || '', dur = 1600, t0 = performance.now();
      const fmt = (v) => v.toLocaleString('es-EC', { minimumFractionDigits: dec, maximumFractionDigits: dec });
      const step = (now) => {
        const p = Math.min(1, (now - t0) / dur), ease = 1 - Math.pow(1 - p, 4);
        el.innerHTML = fmt(end * ease) + (suf ? '<small>' + suf + '</small>' : '');
        if (p < 1) requestAnimationFrame(step);
      };
      reduce ? (el.innerHTML = fmt(end) + (suf ? '<small>' + suf + '</small>' : '')) : requestAnimationFrame(step);
    });
  }, { threshold: 0.5 });
  counters.forEach((c) => cio.observe(c));
})();

/* Cada investigación abre por el principio, no donde quedó la lectura anterior */
(function () {
  try { if ('scrollRestoration' in history) history.scrollRestoration = 'manual'; } catch (e) {}
  try { sessionStorage.removeItem('__frame_scroll'); } catch (e) {}
  var arriba = function () { if (!location.hash) window.scrollTo(0, 0); };
  arriba();
  document.addEventListener('DOMContentLoaded', arriba);
  window.addEventListener('load', function () { arriba(); setTimeout(arriba, 60); setTimeout(arriba, 300); });
})();
