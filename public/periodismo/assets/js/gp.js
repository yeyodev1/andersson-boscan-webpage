/* El Gran Padrino: rail de capítulos, audio, cronología, red, perfiles */
(function () {
  'use strict';
  const $ = (s, c) => (c || document).querySelector(s);
  const $$ = (s, c) => [...(c || document).querySelectorAll(s)];

  /* ---- Tipografía editorial: diálogos, líneas de apertura, citas ---- */
  $$('.prose p').forEach((p) => {
    const t = p.textContent.trim();
    if (/^[—–-]/.test(t)) p.classList.add('dialogue');
    else if (t.length < 60 && /[.!?]$/.test(t) && !p.querySelector('a')) p.classList.add('lead-line');
    else if (/^[“"]/.test(t) && t.length > 90 && t.length < 420 && /[”"][^”"]{0,80}$/.test(t)) p.classList.add('quote');
  });
  // figuras anchas: las horizontales muy apaisadas
  $$('.fig img').forEach((img) => {
    const mark = () => { if (img.naturalWidth / img.naturalHeight > 2.2) img.closest('.fig').classList.add('fig--wide'); };
    img.complete ? mark() : img.addEventListener('load', mark);
  });

  /* ---- Rail de capítulos + tiempo de lectura ---- */
  const chapters = $$('.chapter'), rail = $('.rail ol');
  if (rail) {
    chapters.forEach((c, i) => {
      const li = document.createElement('li');
      li.innerHTML = '<a href="#' + c.id + '"><b>' + String(i).padStart(2, '0') + '</b><span>' + c.dataset.title + '</span></a>';
      rail.appendChild(li);
    });
    const words = $('.prose').textContent.trim().split(/\s+/).length;
    const rt = $('.rail__time'); if (rt) rt.textContent = Math.round(words / 210) + ' min de lectura · ' + words.toLocaleString('es-EC') + ' palabras';
    const as = $$('a', rail);
    const rio = new IntersectionObserver((entries) => {
      entries.forEach((e) => { if (e.isIntersecting) as.forEach((a) => a.classList.toggle('is-active', a.getAttribute('href') === '#' + e.target.id)); });
    }, { rootMargin: '-15% 0px -70% 0px' });
    chapters.forEach((c) => rio.observe(c));
  }

  /* ---- Reproductor de audio único: un solo <audio> para toda la página ---- */
  const audio = new Audio(); audio.preload = 'metadata';
  let current = null;
  const fmt = (s) => isFinite(s) && s > 0 ? Math.floor(s / 60) + ':' + String(Math.floor(s % 60)).padStart(2, '0') : '–:––';
  const ICON = '<svg class="ic-play" viewBox="0 0 24 24"><path d="M7 4v16l13-8z"/></svg><svg class="ic-pause" viewBox="0 0 24 24"><path d="M6 4h4v16H6zm8 0h4v16h-4z"/></svg>';
  const players = $$('.player');
  players.forEach((p) => {
    p.dataset.label = p.dataset.title || 'Audio';
    p.innerHTML = '<button class="player__btn" type="button" aria-label="Reproducir ' + p.dataset.label + '" aria-pressed="false">' + ICON + '</button>' +
      '<div class="player__meta"><div class="player__title">' + p.dataset.label + '</div>' +
      '<div class="player__bar" role="presentation"><i></i></div><div class="player__time"><span class="cur">0:00</span><span class="player__wave">' + '<i></i>'.repeat(9) + '</span><span class="dur">–:––</span></div></div>';
    $('.player__btn', p).addEventListener('click', () => toggle(p));
    $('.player__bar', p).addEventListener('click', (e) => {
      if (current !== p || !isFinite(audio.duration)) return;
      const r = e.currentTarget.getBoundingClientRect();
      audio.currentTime = Math.max(0, Math.min(1, (e.clientX - r.left) / r.width)) * audio.duration;
    });
  });
  function paint(p, playing) {
    if (!p) return;
    p.classList.toggle('is-playing', playing);
    const b = $('.player__btn', p);
    if (b) { b.setAttribute('aria-pressed', playing ? 'true' : 'false'); b.setAttribute('aria-label', (playing ? 'Pausar ' : 'Reproducir ') + p.dataset.label); }
  }
  function reset(p) {
    if (!p) return;
    paint(p, false);
    $('.player__bar i', p).style.width = '0%';
    $('.cur', p).textContent = '0:00'; $('.dur', p).textContent = '–:––';
    $('.player__title', p).textContent = p.dataset.label;
  }
  function toggle(p) {
    if (current === p) { audio.paused ? play() : audio.pause(); return; }
    if (current) reset(current);          // solo suena uno a la vez
    current = p;
    $$('video').forEach((v) => v.pause());
    audio.src = p.dataset.src;
    play();
  }
  function play() {
    const pr = audio.play();
    if (pr && pr.catch) pr.catch((err) => {
      if (err && (err.name === 'AbortError' || err.name === 'NotAllowedError')) return; // cambio de pista o autoplay bloqueado
      if (current) $('.player__title', current).textContent = 'No se pudo cargar este audio';
    });
  }
  audio.addEventListener('play', () => { paint(current, true); $$('video').forEach((v) => v.pause()); });
  audio.addEventListener('pause', () => paint(current, false));
  audio.addEventListener('error', () => { if (current) { paint(current, false); $('.player__title', current).textContent = 'No se pudo cargar este audio'; } });
  audio.addEventListener('loadedmetadata', () => { if (current) $('.dur', current).textContent = fmt(audio.duration); });
  audio.addEventListener('timeupdate', () => {
    if (!current) return;
    $('.player__bar i', current).style.width = ((audio.currentTime / audio.duration) * 100 || 0) + '%';
    $('.cur', current).textContent = fmt(audio.currentTime); $('.dur', current).textContent = fmt(audio.duration);
  });
  audio.addEventListener('ended', () => {
    if (!current) return;
    const cola = $$('.player[data-queue="tl"]');
    const next = current.dataset.queue === 'tl' ? cola[cola.indexOf(current) + 1] : null;
    reset(current);
    if (next) { next.scrollIntoView({ behavior: 'smooth', block: 'center' }); toggle(next); }
    else current = null;
  });
  // si arranca un video de la página, el podcast se calla
  $$('video').forEach((v) => v.addEventListener('play', () => { if (!audio.paused) audio.pause(); }));
  const playAll = $('[data-play-all]');
  if (playAll) playAll.addEventListener('click', () => {
    const f = $('.player[data-queue="tl"]');
    if (!f) return;
    f.scrollIntoView({ behavior: 'smooth', block: 'center' });
    if (current === f && !audio.paused) return;
    toggle(f);
  });

  /* ---- Navegación rápida: barra pegajosa + volver arriba ---- */
  const gpnav = $('.gpnav'), totop = $('.totop');
  if (gpnav) {
    const track = $('.gpnav__track', gpnav);
    const links = $$('a', gpnav);
    const secs = links.map((a) => $(a.getAttribute('href'))).filter(Boolean);
    const centrar = (a) => {
      if (!track || track.scrollWidth <= track.clientWidth) return;
      track.scrollTo({ left: a.offsetLeft - track.clientWidth / 2 + a.offsetWidth / 2, behavior: 'smooth' });
    };
    const marcar = (id) => links.forEach((a) => {
      const on = a.getAttribute('href') === '#' + id;
      if (on && !a.classList.contains('is-active')) centrar(a);
      a.classList.toggle('is-active', on);
    });
    const nio = new IntersectionObserver((es) => {
      es.forEach((e) => { if (e.isIntersecting) marcar(e.target.id); });
    }, { rootMargin: '-30% 0px -60% 0px' });
    secs.forEach((x) => nio.observe(x));
    const hero = $('.hero');
    const upd = () => {
      const pasado = hero ? hero.getBoundingClientRect().bottom < 120 : scrollY > 300;
      gpnav.classList.toggle('is-on', pasado);
      if (totop) totop.classList.toggle('is-on', scrollY > innerHeight * 1.2);
    };
    addEventListener('scroll', upd, { passive: true }); addEventListener('resize', upd); upd();
  }
  if (totop) totop.addEventListener('click', () => scrollTo({ top: 0, behavior: 'smooth' }));

  /* ---- Línea de la cronología que se dibuja con el scroll ---- */
  const tlLine = $('.timeline__line i'), tlWrap = $('.timeline');
  if (tlLine) {
    const upd = () => {
      const r = tlWrap.getBoundingClientRect(), vh = innerHeight;
      const p = Math.max(0, Math.min(1, (vh * 0.6 - r.top) / r.height));
      tlLine.style.height = (p * 100) + '%';
    };
    addEventListener('scroll', upd, { passive: true }); upd();
  }

  /* ---- Red de relaciones (SVG) ---- */
  const netData = $('#red-data') && JSON.parse($('#red-data').textContent);
  const stage = $('.net__stage');
  if (netData && stage) {
    const COLORS = { poder: '#A8121F', mafia: '#0A0A0A', operadores: '#D4A24C', electricas: '#5B5F66', petroleo: '#3B7A57' };
    const NS = 'http://www.w3.org/2000/svg', W = 1040, H = 900;
    const svg = document.createElementNS(NS, 'svg'); svg.setAttribute('viewBox', '0 0 ' + W + ' ' + H);
    const defs = document.createElementNS(NS, 'defs'); svg.appendChild(defs);
    const byId = {}; netData.nodos.forEach((n) => (byId[n.id] = n));
    const gE = document.createElementNS(NS, 'g'), gN = document.createElementNS(NS, 'g'); svg.append(gE, gN);
    const edges = netData.aristas.map((e) => {
      const a = byId[e.a], b = byId[e.b];
      const path = document.createElementNS(NS, 'path');
      const mx = (a.x + b.x) / 2 + (a.y - b.y) * 0.18, my = (a.y + b.y) / 2 + (b.x - a.x) * 0.18;
      path.setAttribute('d', 'M' + a.x + ' ' + a.y + ' Q' + mx + ' ' + my + ' ' + b.x + ' ' + b.y);
      path.setAttribute('class', 'edge'); gE.appendChild(path); return { el: path, ...e };
    });
    const nodes = netData.nodos.map((n, i) => {
      const r = 18 + n.peso * 7, g = document.createElementNS(NS, 'g');
      g.setAttribute('class', 'node'); g.setAttribute('transform', 'translate(' + n.x + ' ' + n.y + ')');
      g.style.animation = 'float ' + (5 + (i % 4)) + 's ease-in-out ' + (-i * 0.7) + 's infinite alternate';
      const ring = document.createElementNS(NS, 'circle'); ring.setAttribute('r', r); ring.setAttribute('class', 'ring'); ring.setAttribute('stroke', COLORS[n.grupo]);
      g.appendChild(ring);
      if (n.foto) {
        const cp = document.createElementNS(NS, 'clipPath'); cp.id = 'cp-' + n.id;
        const cc = document.createElementNS(NS, 'circle'); cc.setAttribute('r', r - 3); cp.appendChild(cc); defs.appendChild(cp);
        const im = document.createElementNS(NS, 'image'); im.setAttribute('href', '../../assets/img/gp/' + n.foto);
        im.setAttribute('x', -r + 3); im.setAttribute('y', -r + 3); im.setAttribute('width', 2 * r - 6); im.setAttribute('height', 2 * r - 6);
        im.setAttribute('preserveAspectRatio', 'xMidYMid slice'); im.setAttribute('clip-path', 'url(#cp-' + n.id + ')');
        g.appendChild(im);
      } else {
        const fill = document.createElementNS(NS, 'circle'); fill.setAttribute('r', r - 3); fill.setAttribute('fill', COLORS[n.grupo]); g.appendChild(fill);
        const t = document.createElementNS(NS, 'text'); t.setAttribute('class', 'initials'); t.textContent = n.nombre.split(' ').map((w) => w[0]).join('').slice(0, 2); g.appendChild(t);
      }
      const label = document.createElementNS(NS, 'text'); label.setAttribute('y', r + 16); label.setAttribute('text-anchor', 'middle'); label.textContent = n.nombre; g.appendChild(label);
      g.addEventListener('mouseenter', () => focus(n.id)); g.addEventListener('mouseleave', () => focus(null));
      g.addEventListener('click', () => { focus(n.id, true); describe(n.id); });
      gN.appendChild(g); return { el: g, ...n };
    });
    stage.appendChild(svg);
    const style = document.createElement('style'); style.textContent = '@keyframes float{from{translate:0 -4px}to{translate:0 4px}}'; document.head.appendChild(style);
    let pinned = null;
    function focus(id, pin) {
      if (pin) pinned = id; else if (pinned) id = pinned;
      nodes.forEach((n) => { n.el.classList.toggle('is-on', id === n.id); n.el.classList.toggle('is-off', !!id && id !== n.id && !edges.some((e) => (e.a === id && e.b === n.id) || (e.b === id && e.a === n.id))); });
      edges.forEach((e) => { const on = !!id && (e.a === id || e.b === id); e.el.classList.toggle('is-on', on); e.el.classList.toggle('is-off', !!id && !on); });
    }
    const panel = $('.net__panel');
    function describe(id) {
      const n = byId[id];
      const rel = edges.filter((e) => e.a === id || e.b === id).map((e) => '<li><b>' + byId[e.a === id ? e.b : e.a].nombre + '</b>' + e.t + '</li>').join('');
      panel.innerHTML = '<span class="kicker">' + netData.grupos[n.grupo] + '</span><h3>' + n.nombre + '</h3><p class="rol">' + n.rol + '</p><ul>' + rel + '</ul>';
    }
    stage.addEventListener('mouseleave', () => { if (!pinned) focus(null); });
    describe('carrera'); focus('carrera', true);
    const leg = $('.net__legend'); if (leg) leg.innerHTML = Object.entries(netData.grupos).map(([k, v]) => '<span><i style="background:' + COLORS[k] + '"></i>' + v + '</span>').join('');
  }

  /* ---- Perfiles: filtros + modal ---- */
  const perfiles = $('#perfiles-data') && JSON.parse($('#perfiles-data').textContent);
  const modal = $('.modal');
  if (perfiles && modal) {
    const open = (id) => {
      const p = perfiles.find((x) => x.id === id); if (!p) return;
      $('.modal__img', modal).innerHTML = p.foto ? '<img src="' + p.foto + '" alt="">' : '';
      $('.modal__body', modal).innerHTML = '<span class="badge" data-k="' + kind(p.estatus) + '">' + p.estatus + '</span><h3>' + p.nombre + '</h3>' +
        '<h4>Quién es</h4><p>' + p.bio + '</p><h4>¿Por qué está aquí?</h4><p>' + p.razon + '</p><p class="meta">Actualizado hasta ' + p.actualizado + '</p>';
      modal.classList.add('is-open'); document.body.style.overflow = 'hidden';
    };
    const close = () => { modal.classList.remove('is-open'); document.body.style.overflow = ''; };
    $$('.card').forEach((c) => c.addEventListener('click', () => open(c.dataset.id)));
    $$('.modal__bg, .modal__close', modal).forEach((x) => x.addEventListener('click', close));
    addEventListener('keydown', (e) => { if (e.key === 'Escape') close(); });
    $$('.chip').forEach((ch) => ch.addEventListener('click', () => {
      $$('.chip').forEach((x) => x.classList.toggle('is-active', x === ch));
      const k = ch.dataset.k;
      $$('.card').forEach((c) => c.classList.toggle('is-hidden', k !== 'todos' && c.dataset.k !== k));
    }));
  }
  function kind(s) { s = s.toLowerCase(); return s.includes('asesin') ? 'asesinado' : s.includes('paradero') ? 'paradero' : s.includes('investig') ? 'investigado' : s.includes('funciones') || s.includes('presidente') ? 'funciones' : 'despedido'; }
})();
