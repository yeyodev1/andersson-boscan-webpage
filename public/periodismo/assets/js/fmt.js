/* Comportamientos por formato: nav activa, tipeo, scrolly de video, animaciones al entrar, mapa, red en portada */
(function () {
  'use strict';
  const $ = (s, c) => (c || document).querySelector(s), $$ = (s, c) => [...(c || document).querySelectorAll(s)];
  const reduce = matchMedia('(prefers-reduced-motion: reduce)').matches;
  const data = (() => { try { return JSON.parse($('#fmt-data').textContent); } catch (e) { return {}; } })();

  /* Nav de capítulos activa */
  const links = $$('.fnav a[href^="#"]');
  if (links.length) {
    const secs = links.map((a) => $(a.getAttribute('href'))).filter(Boolean);
    const io = new IntersectionObserver((es) => es.forEach((e) => { if (e.isIntersecting) links.forEach((a) => a.classList.toggle('is-active', a.getAttribute('href') === '#' + e.target.id)); }), { rootMargin: '-25% 0px -60% 0px' });
    secs.forEach((s) => io.observe(s));
  }

  /* Elementos animados al entrar ([data-anim] añade .in) */
  const aio = new IntersectionObserver((es) => es.forEach((e) => { if (e.isIntersecting) { e.target.classList.add('in'); aio.unobserve(e.target); } }), { threshold: .25 });
  $$('[data-anim]').forEach((el) => aio.observe(el));

  /* Tipeo de títulos y prompts */
  $$('[data-type]').forEach((el) => {
    if (reduce) return;
    const html = el.innerHTML; el.innerHTML = ''; el.style.opacity = 1; el.style.transform = 'none'; el.style.animation = 'none';
    const tmp = document.createElement('div'); tmp.innerHTML = html;
    const nodes = []; (function walk(n) { n.childNodes.forEach((c) => { if (c.nodeType === 3) [...c.textContent].forEach((ch) => nodes.push({ ch, em: n.nodeName === 'EM' })); else walk(c); }); })(tmp);
    let i = 0, cur = null;
    const tick = () => {
      if (i >= nodes.length) return;
      const n = nodes[i++];
      if (n.em) { if (!cur || cur.nodeName !== 'EM') { cur = document.createElement('em'); el.appendChild(cur); } cur.textContent += n.ch; }
      else { cur = null; el.appendChild(document.createTextNode(n.ch)); }
      setTimeout(tick, n.ch === ' ' ? 40 : 55);
    };
    setTimeout(tick, 400);
  });

  /* Terminal: imprime líneas del libro mayor */
  const term = $('[data-term]');
  if (term) { const out = $$('.term__line', term); out.forEach((l, i) => { l.style.opacity = 0; setTimeout(() => { l.style.transition = 'opacity .2s'; l.style.opacity = 1; }, 2200 + i * 380); }); }

  /* Scrolly: el video fijo cambia según la entrega visible */
  const sc = $('[data-scrolly]');
  if (sc) {
    const video = $('video', sc), label = $('.scrolly__label', sc), play = $('.scrolly__play', sc), steps = $$('.step', sc);
    let cur = steps[0] && steps[0].dataset.video;
    const set = (s) => { const src = s.dataset.video; if (src === cur) return; cur = src; video.pause(); video.src = src + '.mp4'; video.poster = src + '.jpg'; video.load(); sc.classList.remove('is-playing'); label.innerHTML = '<b>Entrega ' + s.dataset.n + '</b><span>' + $('h3', s).textContent + '</span>'; steps.forEach((x) => x.classList.toggle('is-on', x === s)); };
    const sio = new IntersectionObserver((es) => es.forEach((e) => { if (e.isIntersecting) set(e.target); }), { rootMargin: '-45% 0px -45% 0px' });
    steps.forEach((s) => sio.observe(s)); if (steps[0]) steps[0].classList.add('is-on');
    play.addEventListener('click', () => { sc.classList.add('is-playing'); video.controls = true; video.muted = false; video.play(); });
  }

  /* Diario: resalta ciudades del mapa según la entrada visible */
  const dia = $('[data-diario]');
  if (dia) {
    const cities = $$('[data-city]', dia), ents = $$('.entrada', dia);
    const badge = document.createElement('div'); badge.className = 'diario__fecha'; document.body.appendChild(badge);
    const on = (e) => { const tm = e.querySelector('time'); if (tm) { badge.textContent = e.querySelector('.entrada__dia').textContent + ' · ' + tm.textContent; badge.classList.add('is-on'); } const c = (e.dataset.cities || '').split(' ').filter(Boolean); cities.forEach((g) => g.classList.toggle('is-on', c.includes(g.dataset.city))); ents.forEach((x) => x.classList.toggle('is-on', x === e)); };
    const dio = new IntersectionObserver((es) => es.forEach((e) => { if (e.isIntersecting) on(e.target); }), { rootMargin: '-30% 0px -40% 0px' });
    ents.forEach((e) => dio.observe(e)); if (ents[0]) on(ents[0]);
    const hide = new IntersectionObserver((es) => es.forEach((e) => badge.classList.toggle('is-on', e.isIntersecting)), { threshold: 0 }); hide.observe(dia);
  }

  /* Documental: los enlaces #v-ID abren el video correspondiente */
  $$('.vid').forEach((v) => { const id = (v.dataset.yt || '').split('v=')[1]; if (id) v.id = 'v-' + id; });
  $$('a[href^="#v-"]').forEach((a) => a.addEventListener('click', (ev) => { const t = $(a.getAttribute('href')); if (!t) return; ev.preventDefault(); t.scrollIntoView({ behavior: 'smooth', block: 'center' }); setTimeout(() => { const p = $('.vid__play', t); if (p) p.click(); }, 700); }));

  /* Organigrama: la red de la portada reutiliza el módulo (exp.js dibuja en .net__stage); aquí solo clonamos al hero */
  const heroStage = $('.net__stage--hero'), modStage = $('.fmod--red .net__stage svg');
  if (heroStage && modStage) { const c = modStage.cloneNode(true); c.classList.add('net--hero'); heroStage.appendChild(c); }

  /* Recibo: sonido visual de impresión (líneas aparecen una a una) */
  $$('.ticket').forEach((t) => { const rows = $$('.ticket__row', t); const tio = new IntersectionObserver((es) => { if (!es[0].isIntersecting) return; tio.disconnect(); rows.forEach((r, i) => setTimeout(() => r.classList.add('in'), i * 160)); }, { threshold: .3 }); tio.observe(t); });

  /* Chat: burbujas aparecen en orden */
  $$('.conv').forEach((c) => { const b = $$('.burbuja', c); const cio = new IntersectionObserver((es) => { if (!es[0].isIntersecting) return; cio.disconnect(); b.forEach((x, i) => setTimeout(() => x.classList.add('in'), i * 260)); }, { threshold: .3 }); cio.observe(c); });
})();

/* Lightbox del material: abre la foto completa con su pie */
(function () {
  var g = document.querySelector('[data-galeria]');
  if (!g) return;
  var lb = document.createElement('dialog');
  lb.className = 'lbx';
  lb.innerHTML = '<button class="lbx__cerrar" type="button" aria-label="Cerrar">×</button><figure><img alt=""><figcaption></figcaption></figure>';
  document.body.appendChild(lb);
  var img = lb.querySelector('img'), cap = lb.querySelector('figcaption');
  document.addEventListener('click', function (e) {
    var b = e.target.closest('.galeria__btn');
    if (b) { img.src = b.dataset.full; img.alt = b.dataset.pie || ''; cap.textContent = b.dataset.pie || ''; lb.showModal(); return; }
    if (e.target.closest('.lbx__cerrar') || e.target === lb) lb.close();
  });
})();
