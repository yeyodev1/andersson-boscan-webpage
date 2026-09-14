/* Narrativa por capítulos: rail activo y tiempo de lectura */
(function () {
  'use strict';
  const caps = [...document.querySelectorAll('.cap')], rail = document.querySelector('.nrail ol');
  if (!rail || !caps.length) return;
  caps.forEach((c) => {
    const li = document.createElement('li');
    li.innerHTML = '<a href="#' + c.id + '"><b>' + c.dataset.n + '</b><span>' + c.dataset.title + '</span></a>';
    rail.appendChild(li);
  });
  const words = document.querySelector('.nmain').textContent.trim().split(/\s+/).length;
  const t = document.querySelector('.nrail__time'); if (t) t.textContent = Math.max(1, Math.round(words / 210)) + ' min de lectura';
  const as = [...rail.querySelectorAll('a')];
  const io = new IntersectionObserver((es) => {
    es.forEach((e) => { if (e.isIntersecting) as.forEach((a) => a.classList.toggle('is-active', a.getAttribute('href') === '#' + e.target.id)); });
  }, { rootMargin: '-15% 0px -70% 0px' });
  caps.forEach((c) => io.observe(c));
})();
