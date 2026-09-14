/* Expedientes: reproductores propios, barras de finanzas, red de relaciones */
(function () {
  'use strict';
  const $ = (s, c) => (c || document).querySelector(s);
  const $$ = (s, c) => [...(c || document).querySelectorAll(s)];

  /* Videos alojados: un solo reproductor activo a la vez; si falta el archivo, se ofrece el enlace original */
  const vids = $$('.vid');
  vids.forEach((v) => {
    const video = $('video', v), play = $('.vid__play', v);
    if (!video) return;
    /* Sin el archivo alojado, el mismo botón abre el video de YouTube dentro de la ficha:
       el sitio funciona igual aunque el servidor no guarde los videos. */
    const aYoutube = () => {
      const id = (v.dataset.yt || '').split('v=')[1];
      if (!id) return;
      const marco = $('.vid__frame', v);
      marco.innerHTML = '<iframe src="https://www.youtube-nocookie.com/embed/' + id +
        '?autoplay=1&rel=0" title="Video" frameborder="0" allow="accelerometer; autoplay; clipboard-write;' +
        ' encrypted-media; picture-in-picture" allowfullscreen loading="lazy"></iframe>';
      v.classList.add('is-playing', 'is-youtube');
    };
    video.addEventListener('error', () => { v.classList.add('is-missing'); }, { once: true });
    const start = () => { vids.forEach((o) => { const ov = $('video', o); if (ov && ov !== video) { ov.pause(); } }); v.classList.add('is-playing'); video.play(); };
    play.addEventListener('click', () => { if (v.classList.contains('is-missing') || !video.currentSrc) { aYoutube(); } else { start(); } });
    video.addEventListener('pause', () => { if (video.currentTime === 0) v.classList.remove('is-playing'); });
  });

  /* Barras de finanzas */
  const fin = $('.xfin');
  if (fin) {
    const rows = $$('div', fin), max = Math.max(...rows.map((r) => parseFloat(r.dataset.v)));
    new IntersectionObserver((es, o) => { if (!es[0].isIntersecting) return; o.disconnect(); rows.forEach((r, i) => setTimeout(() => $('i', r).style.setProperty('--w', (parseFloat(r.dataset.v) / max * 100) + '%'), i * 200)); }, { threshold: .4 }).observe(fin);
  }

  /* Red de relaciones */
  const raw = $('#red-data') && $('#red-data').textContent.trim();
  const data = raw && raw !== 'null' ? JSON.parse(raw) : null;
  const stage = $('.fmod--red .net__stage') || $('.net__stage:not(.net__stage--hero)') || $('.net__stage');
  if (data && stage) {
    const PAL = ['#A8121F', '#D4A24C', '#5B5F66', '#3B7A57', '#0A0A0A'];
    const groups = Object.keys(data.grupos), color = (g) => PAL[groups.indexOf(g) % PAL.length];
    const NS = 'http://www.w3.org/2000/svg', svg = document.createElementNS(NS, 'svg'); svg.setAttribute('viewBox', '0 0 900 640');
    const gE = document.createElementNS(NS, 'g'), gN = document.createElementNS(NS, 'g'); svg.append(gE, gN);
    const byId = {}; data.nodos.forEach((n) => (byId[n.id] = n));
    const edges = data.aristas.map((e) => {
      const a = byId[e.a], b = byId[e.b], p = document.createElementNS(NS, 'path');
      const mx = (a.x + b.x) / 2 + (a.y - b.y) * .15, my = (a.y + b.y) / 2 + (b.x - a.x) * .15;
      p.setAttribute('d', 'M' + a.x + ' ' + a.y + ' Q' + mx + ' ' + my + ' ' + b.x + ' ' + b.y); p.setAttribute('class', 'edge'); if (e.estatus) p.setAttribute('data-estatus', e.estatus); gE.appendChild(p); return { el: p, ...e };
    });
    const nodes = data.nodos.map((n, i) => {
      const r = 16 + n.peso * 8, g = document.createElementNS(NS, 'g'); g.setAttribute('class', 'node'); g.setAttribute('transform', 'translate(' + n.x + ' ' + n.y + ')');
      g.style.animation = 'nfloat ' + (5 + (i % 4)) + 's ease-in-out ' + (-i * .7) + 's infinite alternate';
      const c = document.createElementNS(NS, 'circle'); c.setAttribute('r', r); c.setAttribute('stroke', color(n.grupo)); g.appendChild(c);
      const t = document.createElementNS(NS, 'text'); t.setAttribute('class', 'initials'); t.textContent = n.nombre.replace(/[^A-Za-zÁÉÍÓÚÑ ]/g, '').split(' ').filter(Boolean).map((w) => w[0]).join('').slice(0, 2); g.appendChild(t);
      const l = document.createElementNS(NS, 'text'); l.setAttribute('y', r + 16); l.setAttribute('text-anchor', 'middle'); l.textContent = n.nombre; g.appendChild(l);
      g.addEventListener('mouseenter', () => focus(n.id)); g.addEventListener('mouseleave', () => focus(null)); g.addEventListener('click', () => { focus(n.id, true); describe(n.id); });
      gN.appendChild(g); return { el: g, ...n };
    });
    stage.appendChild(svg);
    const st = document.createElement('style'); st.textContent = '@keyframes nfloat{from{translate:0 -4px}to{translate:0 4px}}'; document.head.appendChild(st);
    let pinned = null;
    function focus(id, pin) {
      if (pin) pinned = id; else if (pinned) id = pinned;
      nodes.forEach((n) => { n.el.classList.toggle('is-on', id === n.id); n.el.classList.toggle('is-off', !!id && id !== n.id && !edges.some((e) => (e.a === id && e.b === n.id) || (e.b === id && e.a === n.id))); });
      edges.forEach((e) => { const on = !!id && (e.a === id || e.b === id); e.el.classList.toggle('is-on', on); e.el.classList.toggle('is-off', !!id && !on); });
    }
    const panel = $('.net__panel');
    function describe(id) {
      const n = byId[id], rel = edges.filter((e) => e.a === id || e.b === id).map((e) => '<li><b>' + byId[e.a === id ? e.b : e.a].nombre + '</b>' + e.t + '</li>').join('');
      panel.innerHTML = '<span class="kicker">' + data.grupos[n.grupo] + '</span><h3>' + n.nombre + '</h3><p class="rol">' + n.rol + '</p><ul>' + rel + '</ul>';
    }
    const leg = $('.net__legend'); if (leg) leg.innerHTML = groups.map((g) => '<span><i style="background:' + color(g) + '"></i>' + data.grupos[g] + '</span>').join('');
    const first = data.nodos.reduce((a, b) => (b.peso > a.peso ? b : a)); describe(first.id); focus(first.id, true);
  }
})();
