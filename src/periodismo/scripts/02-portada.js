/* Extraído del artifact "Investigaciones · Boscán & La Moni"; envuelto para el ciclo de vida de Vue. */
export default function init() {
  /* Portada: fotos sueltas que se desplazan con el cursor, objetos que caen sobre la mesa, hilo rojo, cronología, libro de sentencias */
  (function () {
    'use strict';
    const $ = (s, c) => (c || document).querySelector(s), $$ = (s, c) => [...(c || document).querySelectorAll(s)];
    const reduce = matchMedia('(prefers-reduced-motion: reduce)').matches;
    const data = window.__BM_HOME_DATA || JSON.parse($('#home-data').textContent);

    /* Fotos sueltas: la mesa se inclina con el cursor; cada foto se mueve según su profundidad */
    const cab = $('.cabecera'), prints = $$('.print');
    if (cab && prints.length && !reduce) {
      let tx = 0, ty = 0, cx = 0, cy = 0, raf = 0;
      const tick = () => { cx += (tx - cx) * .08; cy += (ty - cy) * .08; prints.forEach((p) => { const d = parseFloat(p.dataset.depth || 1); p.style.setProperty('--px', (cx * 28 * d).toFixed(1) + 'px'); p.style.setProperty('--py', (cy * 20 * d).toFixed(1) + 'px'); }); if (Math.abs(tx - cx) > .001 || Math.abs(ty - cy) > .001) raf = requestAnimationFrame(tick); else raf = 0; };
      cab.addEventListener('mousemove', (e) => { const r = cab.getBoundingClientRect(); tx = (e.clientX - r.left) / r.width - .5; ty = (e.clientY - r.top) / r.height - .5; if (!raf) raf = requestAnimationFrame(tick); });
      cab.addEventListener('mouseleave', () => { tx = 0; ty = 0; if (!raf) raf = requestAnimationFrame(tick); });
      // al bajar, las fotos se separan del titular
      addEventListener('scroll', () => { const y = Math.min(1, scrollY / innerHeight); prints.forEach((p, i) => { p.style.opacity = String(1 - y * 1.2); p.style.translate = '0 ' + (y * (60 + i * 25)) + 'px'; }); }, { passive: true });
    }

    /* Objetos sobre la mesa: caen y se asientan al entrar en pantalla */
    const objs = $$('.obj');
    if (objs.length) {
      const io = new IntersectionObserver((es) => es.forEach((e) => { if (e.isIntersecting) { e.target.classList.add('in'); io.unobserve(e.target); } }), { rootMargin: '0px 0px -8% 0px', threshold: .08 });
      objs.forEach((o) => io.observe(o));
    }

    /* Hilos sobre el corcho: unen los expedientes que comparten nombres */
    const corcho = $('.mesa__corcho'), hilos = $('.mesa__hilos');
    if (corcho && hilos && data.red) {
      const draw = () => {
        const R = corcho.getBoundingClientRect(); if (R.width < 520) { hilos.innerHTML = ''; return; }
        hilos.setAttribute('viewBox', '0 0 ' + R.width + ' ' + R.height);
        const pin = (slug) => { const o = corcho.querySelector('.obj[data-slug="' + slug + '"]'); if (!o) return null; const r = o.getBoundingClientRect(); return { x: r.left - R.left + r.width / 2, y: r.top - R.top + 18 }; };
        const personas = data.red.personas.filter((p) => p.casos.length > 1).sort((a, b) => b.casos.length - a.casos.length).slice(0, 7);
        let d = '';
        personas.forEach((p, k) => {
          const pts = p.casos.map(pin).filter(Boolean); if (pts.length < 2) return;
          for (let i = 1; i < pts.length; i++) { const a = pts[i - 1], b = pts[i], sag = 18 + k * 9; d += 'M' + a.x + ' ' + a.y + ' Q' + ((a.x + b.x) / 2) + ' ' + (Math.max(a.y, b.y) + sag) + ' ' + b.x + ' ' + b.y + ' '; }
        });
        hilos.innerHTML = '<path d="' + d + '"/>';
      };
      draw(); addEventListener('resize', draw); setTimeout(draw, 800); setTimeout(draw, 2500);
    }

    /* Hilo rojo: expedientes en el anillo exterior, personas en el interior */
    const stage = $('.red__stage'), panel = $('.red__panel');
    if (stage && data.red) {
      const NS = 'http://www.w3.org/2000/svg', W = 1000, H = 750, cx = W / 2, cy = H / 2;
      const svg = document.createElementNS(NS, 'svg'); svg.setAttribute('viewBox', '0 0 ' + W + ' ' + H);
      const gE = document.createElementNS(NS, 'g'), gN = document.createElementNS(NS, 'g'); svg.append(gE, gN);
      const casos = data.red.casos, personas = data.red.personas;
      casos.forEach((c, i) => { const a = -Math.PI / 2 + i / casos.length * Math.PI * 2; c.x = cx + Math.cos(a) * 340; c.y = cy + Math.sin(a) * 305; });
      personas.forEach((p, i) => { const a = -Math.PI / 2 + i / personas.length * Math.PI * 2 + .3; const r = 120 + (i % 3) * 45; p.x = cx + Math.cos(a) * r; p.y = cy + Math.sin(a) * r * .9; });
      const byC = {}; casos.forEach((c) => (byC[c.slug] = c));
      const edges = [];
      personas.forEach((p) => p.casos.forEach((s) => { const c = byC[s]; if (!c) return; const l = document.createElementNS(NS, 'path'); const mx = (p.x + c.x) / 2 + (p.y - c.y) * .08, my = (p.y + c.y) / 2 + (c.x - p.x) * .08; l.setAttribute('d', 'M' + p.x + ' ' + p.y + ' Q' + mx + ' ' + my + ' ' + c.x + ' ' + c.y); l.setAttribute('fill', 'none'); l.setAttribute('class', 'edge'); gE.appendChild(l); edges.push({ el: l, p: p.id, c: s }); }));
      const nodes = [];
      const mk = (n, tipo) => {
        const g = document.createElementNS(NS, 'g'); g.setAttribute('class', 'nodo nodo--' + tipo); g.setAttribute('transform', 'translate(' + n.x + ' ' + n.y + ')');
        const r = tipo === 'caso' ? 9 : (n.foto ? 26 : 14);
        const c = document.createElementNS(NS, 'circle'); c.setAttribute('r', r); c.setAttribute('class', 'ring'); g.appendChild(c);
        if (n.foto) { const im = document.createElementNS(NS, 'image'); im.setAttribute('href', n.foto); im.setAttribute('x', -r + 3); im.setAttribute('y', -r + 3); im.setAttribute('width', (r - 3) * 2); im.setAttribute('height', (r - 3) * 2); im.setAttribute('preserveAspectRatio', 'xMidYMid slice'); g.appendChild(im); }
        const t = document.createElementNS(NS, 'text'); t.setAttribute('y', r + 15); t.textContent = n.corto || n.nombre || n.titulo; g.appendChild(t);
        g.setAttribute('tabindex', '0'); g.setAttribute('role', tipo === 'caso' ? 'link' : 'button'); g.setAttribute('aria-label', (tipo === 'caso' ? 'Abrir ' : 'Ver conexiones de ') + (n.nombre || n.titulo));
        g.addEventListener('keydown', (e) => { if (e.key === 'Enter' || e.key === ' ') { e.preventDefault(); g.dispatchEvent(new Event('click')); } });
        g.addEventListener('focus', () => focus(n, tipo)); g.addEventListener('blur', () => focus(null));
        g.addEventListener('mouseenter', () => focus(n, tipo)); g.addEventListener('mouseleave', () => focus(null));
        g.addEventListener('click', () => { if (tipo === 'caso') location.href = n.url; else { pinned = n; focus(n, tipo); describe(n); } });
        gN.appendChild(g); nodes.push({ el: g, n, tipo }); return g;
      };
      casos.forEach((c) => mk(c, 'caso')); personas.forEach((p) => mk(p, 'persona'));
      stage.appendChild(svg);
      let pinned = null;
      function focus(n, tipo) {
        if (!n && pinned) { n = pinned; tipo = 'persona'; }
        if (!n) { nodes.forEach((x) => x.el.classList.remove('is-on', 'is-off')); edges.forEach((e) => e.el.classList.remove('is-on', 'is-off')); return; }
        const onC = new Set(), onP = new Set();
        if (tipo === 'persona') { onP.add(n.id); n.casos.forEach((s) => onC.add(s)); }
        else { onC.add(n.slug); personas.forEach((p) => { if (p.casos.includes(n.slug)) onP.add(p.id); }); }
        nodes.forEach((x) => { const on = x.tipo === 'caso' ? onC.has(x.n.slug) : onP.has(x.n.id); x.el.classList.toggle('is-on', on); x.el.classList.toggle('is-off', !on); });
        edges.forEach((e) => { const on = tipo === 'persona' ? e.p === n.id : e.c === n.slug; e.el.classList.toggle('is-on', on); e.el.classList.toggle('is-off', !on); });
      }
      function describe(p) {
        const lis = p.casos.map((s) => byC[s]).filter(Boolean).map((c) => '<li><a href="' + c.url + '"><b>' + c.anio + '</b><span>' + c.titulo + '</span></a></li>').join('');
        panel.innerHTML = (p.foto ? '<img class="foto" src="' + p.foto + '" alt="">' : '') + '<span class="kicker">' + p.rol + '</span><h3>' + p.nombre + '</h3><p>' + p.nota + '</p><ul>' + lis + '</ul>' + (p.credito ? '<small>Foto: ' + p.credito + '</small>' : '');
      }
      const first = personas.reduce((a, b) => (b.casos.length > a.casos.length ? b : a)); pinned = first; focus(first, 'persona'); describe(first);
      const sel = $('#hilo-sel');
      if (sel) { personas.slice().sort((a, b) => a.nombre.localeCompare(b.nombre)).forEach((p) => { const o = document.createElement('option'); o.value = p.id; o.textContent = p.nombre; sel.appendChild(o); }); sel.addEventListener('change', () => { const p = personas.find((x) => x.id === sel.value); if (p) { pinned = p; focus(p, 'persona'); describe(p); panel.scrollIntoView({ block: 'nearest', behavior: 'smooth' }); } }); }
    }

    /* Cronología: el hilo se tiende con el scroll */
    const lp = $('.linea__path'), lw = $('.linea__wrap');
    if (lp && lw) {
      const h = lw.offsetHeight; lp.setAttribute('d', 'M2 0 V' + h); lp.style.strokeDasharray = h; lp.style.strokeDashoffset = h; lp.style.animation = 'none';
      const upd = () => { const r = lw.getBoundingClientRect(); const p = Math.min(1, Math.max(0, (innerHeight * .7 - r.top) / r.height)); lp.style.strokeDashoffset = h * (1 - p); };
      addEventListener('scroll', upd, { passive: true }); upd();
    }

    /* Libro de sentencias: filtro por desenlace */
    const chips = $$('.libro__chips button'), items = $$('.libro__list li');
    const status = $('.libro__status');
    chips.forEach((c) => c.addEventListener('click', () => { chips.forEach((x) => { const on = x === c; x.classList.toggle('is-on', on); x.setAttribute('aria-pressed', on ? 'true' : 'false'); }); const k = c.dataset.c; let n = 0; items.forEach((li) => { const hide = k !== 'todos' && li.dataset.c !== k; li.classList.toggle('is-hidden', hide); if (!hide) n++; }); if (status) status.textContent = n + (n === 1 ? ' investigación' : ' investigaciones') + (k === 'todos' ? '' : ' con este desenlace'); }));
  })();

  /* Intro de apertura: foto real → figuras del juego → su lugar en la resortera */
  (function () {
    const intro = document.getElementById('intro');
    if (!intro || matchMedia('(prefers-reduced-motion: reduce)').matches) { if (intro) intro.classList.add('is-done'); return; }
    const foto = intro.querySelector('.intro__foto'), figM = intro.querySelector('.intro__fig--m'), figA = intro.querySelector('.intro__fig--a'), marca = intro.querySelector('.intro__marca');
    const E = 'cubic-bezier(.16,1,.3,1)';
    let done = false;
    const finish = () => { if (done) return; done = true; intro.style.pointerEvents = 'none'; intro.animate([{ opacity: 1 }, { opacity: 0 }], { duration: 180, fill: 'forwards' }); setTimeout(() => intro.classList.add('is-done'), 220); };
    setTimeout(finish, 1900);
    intro.addEventListener('click', finish);
    // 1) la foto respira
    foto.animate([{ transform: 'scale(1.08)' }, { transform: 'scale(1.0)' }], { duration: 700, easing: E, fill: 'forwards' });
    marca.animate([{ opacity: 0, transform: 'translate(-50%, 12px)' }, { opacity: 1, transform: 'translate(-50%, 0)' }], { duration: 320, delay: 60, easing: E, fill: 'forwards' });
    // 2) la foto se funde con las figuras
    setTimeout(() => {
      foto.animate([{ opacity: 1, filter: 'blur(0)' }, { opacity: 0, filter: 'blur(14px)' }], { duration: 300, easing: 'ease-out', fill: 'forwards' });
      marca.animate([{ opacity: 1 }, { opacity: 0 }], { duration: 220, fill: 'forwards' });
      [figM, figA].forEach((f, i) => f.animate([{ opacity: 0, transform: 'translate(-50%, -50%) scale(1.15)' }, { opacity: 1, transform: 'translate(-50%, -50%) scale(1)' }], { duration: 300, delay: i * 40, easing: E, fill: 'forwards' }));
    }, 450);
    // 3) las figuras vuelan a su sitio en el juego
    setTimeout(() => {
      const api = window.portadaJugable, pos = api && api.positions ? api.positions() : null;
      const fly = (f, target, h) => {
        const r = f.getBoundingClientRect(), cx = r.left + r.width / 2, cy = r.top + r.height / 2;
        const s = target ? Math.max(.08, h / r.height) : .2, dx = target ? target.x - cx : 0, dy = target ? target.y - cy : 0;
        return f.animate([{ transform: 'translate(-50%, -50%) scale(1)', opacity: 1 }, { transform: 'translate(calc(-50% + ' + dx + 'px), calc(-50% + ' + dy + 'px)) scale(' + s + ')', opacity: target ? 1 : 0 }], { duration: 460, easing: 'cubic-bezier(.4,0,.2,1)', fill: 'forwards' });
      };
      intro.animate([{ background: '#1b1a17' }, { background: 'rgba(27,26,23,0)' }], { duration: 380, delay: 80, fill: 'forwards' });
      fly(figM, pos && pos.moni, pos ? pos.hMoni : 0);
      const a = fly(figA, pos && pos.andersson, pos ? pos.hAndersson : 0);
      a.onfinish = () => setTimeout(finish, 40);
      setTimeout(finish, 900);
    }, 780);
  })();

}
