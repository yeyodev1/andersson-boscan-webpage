/* DESTAPE · portada jugable para el celular en vertical.
 * La resortera queda abajo y se dispara hacia arriba: el muro de la corrupción cuelga del techo y baja un poco
 * con cada tiro. Adentro hay cajas fuertes con pruebas; al romperlas, el documento cae hasta la resortera.
 * Se gana al juntar todas las pruebas; se pierde si el muro llega a la cinta. Rebotar en las paredes vale.
 * Cada personaje conserva su poder: La Moni acelera al tocar la pantalla, Andersson pega doble y atraviesa lo que rompe
 * y Hachi estalla al primer golpe (o al tocar). Lo que se muestra es visual; las descripciones van en el
 * árbol de accesibilidad. */
(function (global) {
'use strict';
const clamp = (v, a, b) => Math.max(a, Math.min(b, v));
const CREW = ['moni', 'andersson', 'hachi'];
const NAMES = { moni: 'La Moni', andersson: 'Andersson', hachi: 'Hachi' };
const WORDS = ['BRIBES', 'LAUNDERING', 'IMPUNITY', 'CONTRACTS', 'CHECKS', 'FRONTMEN'];
const MAT = {
  vidrio: { hp: 1, fill: 'rgba(170,214,226,.78)', edge: '#6FA3B3' },
  madera: { hp: 2, fill: '#C89B62', edge: '#8A6438' },
  piedra: { hp: 3, fill: '#A8A39A', edge: '#6E6A62' },
  caja: { hp: 3, fill: '#2E3135', edge: '#15171A' },
  letrero: { hp: 3, fill: '#F3EBD8', edge: '#8F8670' }
};
const PATHS = {
  sound: 'M11 5 6 9H3v6h3l5 4z M15 8q6 4 0 8 M18 5q10 7 0 14', mute: 'M11 5 6 9H3v6h3l5 4z M16 9l6 6m0-6-6 6',
  pause: 'M8 5v14M16 5v14', play: 'm7 4 12 8-12 8z', reset: 'M4 9a8 8 0 1 1 0 7 M4 3v6h6', down: 'M12 4v16m-6-6 6 6 6-6',
  hand: 'M9 20c-1-3-5-5-4-7 1-1 3 1 4 2V5c0-3 3-3 3 0v6c2-3 4-2 4 0 4-2 5 0 5 3 0 3-2 5-2 7'
};
const svg = (k) => '<svg viewBox="0 0 24 24" aria-hidden="true"><path d="' + PATHS[k] + '"/></svg>';
const DOC = '<svg viewBox="0 0 20 24" aria-hidden="true"><path d="M3 1h10l5 5v17H3z"/><path d="M13 1v5h5M6 11h9M6 15h9M6 19h6"/></svg>';

// los sprites viven junto al script: la ruta sale de su propio src, así sirve igual en /periodismo/ y en /periodismo/en/
const BASE = (document.currentScript && document.currentScript.src.replace(/[^/]*$/, '')) || 'assets/game/';
function rng(seed) { let s = seed >>> 0; return () => { s = (s * 1664525 + 1013904223) >>> 0; return s / 4294967296; }; }

function mount(root, opts) {
  opts = opts || {};
  const archive = String(opts.archiveHref || '#mesa').replace(/[&"<>]/g, (c) => ({ '&': '&amp;', '"': '&quot;', '<': '&lt;', '>': '&gt;' }[c]));
  const base = opts.base || BASE;
  root.classList.add('bmv');
  root.innerHTML =
    '<div class="bmv__stage">' +
    '<canvas class="bmv__canvas" role="img" aria-label="Vertical game: launch La Moni, Andersson or Hachi upward to break the wall of corruption and collect the evidence"></canvas>' +
    '<div class="bmv__hud"><div class="bmv__docs" aria-hidden="true"></div><div class="bmv__tools">' +
    '<button type="button" class="bmv__icon" data-do="sound" aria-label="Turn sound on" aria-pressed="false">' + svg('mute') + '</button>' +
    '<button type="button" class="bmv__icon" data-do="pause" aria-label="Pause game" aria-pressed="false">' + svg('pause') + '</button>' +
    '<button type="button" class="bmv__icon" data-do="reset" aria-label="Start over">' + svg('reset') + '</button></div></div>' +
    '<div class="bmv__crew" role="group" aria-label="Choose a character">' + CREW.map((k) =>
      '<button type="button" class="bmv__who" data-who="' + k + '" aria-label="Launch ' + NAMES[k] + '" aria-pressed="false"><img src="' + base + 'sprites/' + k + '_pie.webp" alt=""></button>').join('') + '</div>' +
    '<a class="bmv__icon bmv__archive" href="' + archive + '" aria-label="Skip the game and go to the investigations">' + svg('down') + '</a>' +
    '<div class="bmv__hint" aria-hidden="true">' + svg('hand') + '</div>' +
    '<div class="bmv__sello" aria-hidden="true"><b></b><button type="button" class="bmv__otra" data-do="next"></button></div>' +
    '<div class="bmv__sr" role="status" aria-live="polite" aria-atomic="true"></div></div>';
  const $ = (s) => root.querySelector(s), $$ = (s) => [...root.querySelectorAll(s)];
  const stage = $('.bmv__stage'), canvas = $('.bmv__canvas'), ctx = canvas.getContext('2d');
  const reduce = matchMedia('(prefers-reduced-motion: reduce)').matches;
  const img = {};
  CREW.forEach((k) => ['pie', 'vuelo'].forEach((p) => { const i = new Image(); i.src = base + 'sprites/' + k + '_' + p + '.webp'; img[k + p] = i; }));

  let W = 0, H = 0, dpr = 1, bw = 0, bh = 0, R = 0, G = 0, VMAX = 0;
  let level = 0, bricks = [], docs = [], parts = [], shot = null, selected = 'moni', phase = 'aim';
  let drag = null, wallY = 0, wallTarget = 0, step = 0, dangerY = 0, collected = 0, total = 0, shots = 0;
  let sound = false, audio = null, paused = false, onscreen = true, raf = 0, last = 0, destroyed = false, hinted = false, flash = 0;
  const sling = () => ({ x: W / 2, y: H - Math.max(86, H * .14) });

  function status(t) { $('.bmv__sr').textContent = t; }
  function beep(type) {
    if (!sound) return;
    try {
      if (!audio) audio = new (global.AudioContext || global.webkitAudioContext)();
      audio.resume();
      const o = audio.createOscillator(), g = audio.createGain(), t = audio.currentTime;
      const f = { hit: 320, rompe: 180, prueba: 880, boom: 90, lanza: 520, gana: 660, pierde: 140 }[type] || 300;
      o.type = type === 'boom' || type === 'rompe' ? 'sawtooth' : 'triangle';
      o.frequency.setValueAtTime(f, t); o.frequency.exponentialRampToValueAtTime(Math.max(40, f * (type === 'gana' ? 2 : .5)), t + .18);
      g.gain.setValueAtTime(.12, t); g.gain.exponentialRampToValueAtTime(.001, t + .22);
      o.connect(g).connect(audio.destination); o.start(t); o.stop(t + .24);
    } catch (e) { /* sin audio */ }
  }

  // ------------------------------------------------------------------ nivel
  function build(n) {
    const r = rng(17 + n * 101), rows = 5 + n, cols = 7;
    bricks = []; docs = []; parts = []; collected = 0; shots = 0;
    const cajas = new Set();
    while (cajas.size < 3 + n) cajas.add(Math.floor(r() * (rows - 1)) * cols + Math.floor(r() * cols) + cols);
    for (let row = 0; row < rows; row++) {
      if (row === 0) {
        // la fila de arriba lleva el letrero de la trama, entre dos bloques de piedra
        const word = WORDS[(n * 2 + Math.floor(r() * 2)) % WORDS.length];
        bricks.push({ c: 0, row, w: 2, m: 'piedra' }, { c: 2, row, w: 3, m: 'letrero', word }, { c: 5, row, w: 2, m: 'piedra' });
        continue;
      }
      for (let c = 0; c < cols; c++) {
        const id = row * cols + c;
        if (!cajas.has(id) && r() < .12 + n * .02) continue;   // huecos para rebotar adentro
        const p = r(), m = cajas.has(id) ? 'caja' : p < .38 ? 'vidrio' : p < .78 ? 'madera' : 'piedra';
        bricks.push({ c, row, w: 1, m });
      }
    }
    bricks.forEach((b) => { b.hp = MAT[b.m].hp; b.max = b.hp; b.hit = 0; b.shake = 0; });
    total = bricks.filter((b) => b.m === 'caja').length;
    layout(true);
    phase = 'aim'; shot = null; pick(CREW[0]);
    drawDocs(); hideSello();
    status('Level ' + (n + 1) + '. There are ' + total + ' pieces of evidence in the wall. Drag down and release to shoot.');
  }
  function layout(reset) {
    const rect = stage.getBoundingClientRect();
    W = Math.max(280, rect.width); H = Math.max(420, rect.height);
    dpr = Math.min(2, global.devicePixelRatio || 1);
    canvas.width = Math.round(W * dpr); canvas.height = Math.round(H * dpr);
    canvas.style.width = W + 'px'; canvas.style.height = H + 'px';
    ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
    bw = W / 7; bh = Math.round(bw * .56); R = bw * .3;
    G = H * 1.05; VMAX = Math.sqrt(2 * G * H) * 1.32;
    dangerY = sling().y - R * 3.6;
    const rows = Math.max(...bricks.map((b) => b.row)) + 1;
    if (reset) {
      wallY = 62; wallTarget = wallY;
      // el muro toca la cinta en diez tiros en el primer nivel, nueve en el segundo y ocho en el tercero
      step = Math.max(6, (dangerY - (wallY + rows * bh)) / (10 - level));
    }
  }
  const box = (b) => ({ x: b.c * bw + 1.5, y: wallY + b.row * bh + 1.5, w: b.w * bw - 3, h: bh - 3 });

  // ------------------------------------------------------------------ personajes
  function pick(k) {
    if (phase !== 'aim') return;
    selected = k;
    $$('.bmv__who').forEach((b) => { const on = b.dataset.who === k; b.classList.toggle('is-on', on); b.setAttribute('aria-pressed', on ? 'true' : 'false'); });
  }
  function next() { pick(CREW[(CREW.indexOf(selected) + 1) % CREW.length]); }

  // ------------------------------------------------------------------ tiro
  function aimVector() {
    if (!drag) return null;
    let dx = drag.x0 - drag.x, dy = drag.y0 - drag.y;      // se dispara al revés de lo que se arrastra
    const len = Math.hypot(dx, dy); if (len < 10) return null;
    let ang = Math.atan2(dy, dx);                            // hacia arriba: ángulo negativo
    if (dy > 0) ang = dx < 0 ? -Math.PI + .2 : -.2;
    ang = clamp(ang, -Math.PI + .2, -.2);
    const pow = clamp(len / (H * .28), .3, 1);
    return { vx: Math.cos(ang) * VMAX * pow, vy: Math.sin(ang) * VMAX * pow, pow, len: Math.min(len, R * 3.2), ang };
  }
  function predict(v) {
    const s = sling(), pts = []; let x = s.x, y = s.y - R * 1.1, vx = v.vx, vy = v.vy;
    const g = G * (selected === 'andersson' ? 1.3 : 1);
    for (let i = 0; i < 90; i++) {
      const dt = 1 / 60; vy += g * dt; x += vx * dt; y += vy * dt;
      if (x < R) { x = R; vx = -vx; } if (x > W - R) { x = W - R; vx = -vx; } if (y < R) { y = R; vy = -vy; }
      if (i % 3 === 0) pts.push([x, y]);
      if (bricks.some((b) => { const q = box(b); return x > q.x - R && x < q.x + q.w + R && y > q.y - R && y < q.y + q.h + R; })) { pts.push([x, y, 1]); break; }
      if (y > H) break;
    }
    return pts;
  }
  function launch(v) {
    const s = sling();
    shot = { k: selected, x: s.x, y: s.y - R * 1.1, vx: v.vx, vy: v.vy, age: 0, used: false, pierce: 0, g: G * (selected === 'andersson' ? 1.3 : 1), last: null };
    phase = 'fly'; shots++; hinted = true; root.classList.add('is-played');
    beep('lanza'); status(NAMES[selected] + ' in the air.' + (selected === 'andersson' ? '' : ' Tap the screen to use their power.'));
  }
  function power() {
    if (!shot || shot.used) return;
    shot.used = true;
    if (shot.k === 'moni') {
      const sp = Math.hypot(shot.vx, shot.vy) || 1, f = VMAX * 1.15 / sp;
      shot.vx *= f; shot.vy *= f; shot.pierce = .45; shot.dash = .45; beep('lanza');
    } else if (shot.k === 'hachi') boom(shot.x, shot.y);
  }
  function boom(x, y) {
    const rad = bw * 1.4;
    bricks.forEach((b) => { const q = box(b), cx = clamp(x, q.x, q.x + q.w), cy = clamp(y, q.y, q.y + q.h); if (Math.hypot(cx - x, cy - y) < rad) damage(b, 2); });
    burst(x, y, '#F2B33D', 26, rad); flash = .25; beep('boom');
    shot = null; endTurn();
  }
  function damage(b, n) {
    if (b.hp <= 0) return;
    b.hp -= n; b.shake = .2;
    if (b.hp > 0) { beep('hit'); return; }
    const q = box(b);
    burst(q.x + q.w / 2, q.y + q.h / 2, MAT[b.m].fill, reduce ? 6 : 14, bw * .6);
    beep('rompe');
    if (b.m === 'caja') docs.push({ x: q.x + q.w / 2, y: q.y + q.h / 2, vy: H * .05, t: 0, rot: 0 });
  }
  function burst(x, y, color, n, spread) {
    for (let i = 0; i < n; i++) { const a = Math.random() * Math.PI * 2, s = (.3 + Math.random()) * spread * 2.2; parts.push({ x, y, vx: Math.cos(a) * s, vy: Math.sin(a) * s - spread, life: .6 + Math.random() * .4, color, sz: 2 + Math.random() * 4 }); }
  }
  let settleT = 0;
  function endTurn() { phase = 'settle'; settleT = .28; }

  // ------------------------------------------------------------------ simulación
  function update(dt) {
    if (flash > 0) flash -= dt;
    bricks.forEach((b) => { if (b.shake > 0) b.shake -= dt; });
    parts.forEach((p) => { p.vy += G * .6 * dt; p.x += p.vx * dt; p.y += p.vy * dt; p.life -= dt; });
    parts = parts.filter((p) => p.life > 0);
    const s = sling();
    docs.forEach((d) => {
      d.t += dt; d.vy = Math.min(d.vy + H * .5 * dt, H * .42); d.y += d.vy * dt; d.x += Math.sin(d.t * 5) * 30 * dt; d.rot = Math.sin(d.t * 4) * .5;
      d.x += (s.x - d.x) * clamp((d.y - (s.y - H * .45)) / (H * .45), 0, 1) * dt * 3;  // las pruebas caen hacia la resortera
      if (d.y > s.y - R) { d.done = true; collected++; drawDocs(); beep('prueba'); status('Evidence recovered: ' + collected + ' of ' + total + '.'); }
    });
    docs = docs.filter((d) => !d.done);
    if (total && collected >= total && !docs.length && (phase === 'aim' || phase === 'settle' || phase === 'wall')) return win();
    if (phase === 'settle' && (settleT -= dt) <= 0) {
      bricks = bricks.filter((b) => b.hp > 0);
      if (bricks.length) wallTarget = wallY + step;
      phase = 'wall';
    }
    if (phase === 'wall') {
      wallY = Math.min(wallTarget, wallY + step * dt * 3);
      if (wallY >= wallTarget - .01) {
        wallY = wallTarget;
        if (collected >= total && !docs.length && total) return win();
        if (bricks.some((b) => b.hp > 0 && box(b).y + bh > dangerY)) return lose();
        phase = 'aim'; next();
      }
    }
    if (!shot || phase !== 'fly') return;
    const sub = 3;
    for (let i = 0; i < sub && shot; i++) stepShot(dt / sub);
  }
  function stepShot(dt) {
    const p = shot; p.age += dt; if (p.pierce > 0) p.pierce -= dt; if (p.dash > 0) p.dash -= dt;
    p.vy += p.g * dt * (p.dash > 0 ? .2 : 1); p.x += p.vx * dt; p.y += p.vy * dt;
    if (p.x < R) { p.x = R; p.vx = Math.abs(p.vx) * .92; beep('hit'); }
    if (p.x > W - R) { p.x = W - R; p.vx = -Math.abs(p.vx) * .92; beep('hit'); }
    if (p.y < R) { p.y = R; p.vy = Math.abs(p.vy) * .9; beep('hit'); }
    for (const b of bricks) {
      if (b.hp <= 0) continue;
      const q = box(b), cx = clamp(p.x, q.x, q.x + q.w), cy = clamp(p.y, q.y, q.y + q.h), dx = p.x - cx, dy = p.y - cy, d = Math.hypot(dx, dy);
      if (d >= R) continue;
      if (p.k === 'hachi') return boom(p.x, p.y);
      if (p.last === b && p.age - b.hit < .12) continue;
      p.last = b; b.hit = p.age;
      const dmg = p.k === 'andersson' ? 2 : 1;
      damage(b, dmg);
      if (b.hp <= 0 && (p.k === 'andersson' || p.pierce > 0)) continue;   // sigue de largo por lo que rompe
      // rebote: normal desde el punto más cercano del bloque
      let nx = dx, ny = dy, nl = d;
      if (nl < .001) { nx = 0; ny = p.vy > 0 ? -1 : 1; nl = 1; }
      nx /= nl; ny /= nl;
      const dot = p.vx * nx + p.vy * ny;
      if (dot < 0) { p.vx -= 2 * dot * nx; p.vy -= 2 * dot * ny; p.vx *= .88; p.vy *= .88; }
      p.x = cx + nx * (R + .5); p.y = cy + ny * (R + .5);
      break;
    }
    if (p.y > H + R * 2 || p.age > 5.5) { shot = null; endTurn(); }
  }
  function win() {
    phase = 'end';
    beep('gana'); burst(W / 2, H * .4, '#C8102E', reduce ? 10 : 40, bw * 1.4);
    showSello('gana', level < 2 ? 'Uncovered' : 'Case uncovered', level < 2 ? '→' : '↺');
    status(level < 2 ? 'Uncovered. You collected all ' + total + ' pieces of evidence. Tap for the next level.' : 'Case uncovered: you collected all the evidence across the three levels.');
  }
  function lose() {
    phase = 'end'; beep('pierde');
    showSello('pierde', 'Shelved', '↺');
    status('Shelved: the wall reached the tape. Tap to try again.');
  }
  function showSello(cls, txt, btn) {
    const s = $('.bmv__sello'); s.className = 'bmv__sello is-on is-' + cls; s.querySelector('b').textContent = txt;
    const o = s.querySelector('.bmv__otra'); o.textContent = btn; o.setAttribute('aria-label', cls === 'gana' && level < 2 ? 'Next level' : 'Play again');
  }
  function hideSello() { $('.bmv__sello').className = 'bmv__sello'; }
  function drawDocs() {
    $('.bmv__docs').innerHTML = Array.from({ length: total }, (_, i) => '<i class="' + (i < collected ? 'is-on' : '') + '">' + DOC + '</i>').join('');
  }

  // ------------------------------------------------------------------ dibujo
  function roundRect(x, y, w, h, r) { ctx.beginPath(); ctx.moveTo(x + r, y); ctx.arcTo(x + w, y, x + w, y + h, r); ctx.arcTo(x + w, y + h, x, y + h, r); ctx.arcTo(x, y + h, x, y, r); ctx.arcTo(x, y, x + w, y, r); ctx.closePath(); }
  function drawBrick(b) {
    const q = box(b), M = MAT[b.m], k = b.shake > 0 ? Math.sin(b.shake * 90) * 2 : 0;
    ctx.save(); ctx.translate(k, 0);
    roundRect(q.x, q.y, q.w, q.h, b.m === 'vidrio' ? 3 : 2); ctx.fillStyle = M.fill; ctx.fill();
    ctx.lineWidth = 1.5; ctx.strokeStyle = M.edge; ctx.stroke();
    ctx.save(); roundRect(q.x, q.y, q.w, q.h, 2); ctx.clip();
    if (b.m === 'madera') { ctx.strokeStyle = 'rgba(90,60,25,.35)'; ctx.lineWidth = 1; for (let i = 1; i < 4; i++) { ctx.beginPath(); ctx.moveTo(q.x, q.y + q.h * i / 4); ctx.bezierCurveTo(q.x + q.w * .3, q.y + q.h * i / 4 - 3, q.x + q.w * .7, q.y + q.h * i / 4 + 3, q.x + q.w, q.y + q.h * i / 4); ctx.stroke(); } }
    if (b.m === 'piedra') { ctx.fillStyle = 'rgba(60,58,52,.25)'; for (let i = 0; i < 6; i++) ctx.fillRect(q.x + ((b.c * 37 + i * 53) % q.w), q.y + ((b.row * 29 + i * 17) % q.h), 3, 2); }
    if (b.m === 'vidrio') { ctx.strokeStyle = 'rgba(255,255,255,.75)'; ctx.lineWidth = 2; ctx.beginPath(); ctx.moveTo(q.x + 6, q.y + q.h - 6); ctx.lineTo(q.x + q.w * .45, q.y + 5); ctx.stroke(); }
    if (b.m === 'caja') {
      const cx = q.x + q.w / 2, cy = q.y + q.h / 2;
      ctx.strokeStyle = '#4A4F55'; ctx.lineWidth = 2; ctx.strokeRect(q.x + 4, q.y + 4, q.w - 8, q.h - 8);
      ctx.beginPath(); ctx.arc(cx, cy, Math.min(q.h, q.w) * .26, 0, Math.PI * 2); ctx.fillStyle = '#B9A06A'; ctx.fill();
      ctx.strokeStyle = '#2E3135'; ctx.lineWidth = 1.5; ctx.beginPath(); ctx.moveTo(cx, cy); ctx.lineTo(cx + Math.min(q.h, q.w) * .2, cy - 2); ctx.stroke();
    }
    if (b.m === 'letrero') {
      ctx.fillStyle = '#B3121C'; ctx.font = '800 ' + Math.round(q.h * .5) + 'px "Barlow Condensed", "Arial Narrow", sans-serif';
      ctx.textAlign = 'center'; ctx.textBaseline = 'middle'; ctx.fillText(b.word, q.x + q.w / 2, q.y + q.h / 2 + 1, q.w - 10);
    }
    // grietas según el daño
    const dmg = 1 - b.hp / b.max;
    if (dmg > 0) {
      ctx.strokeStyle = b.m === 'caja' ? 'rgba(255,255,255,.5)' : 'rgba(25,20,15,.6)'; ctx.lineWidth = 1.2; ctx.beginPath();
      const cx = q.x + q.w * .5, cy = q.y + q.h * .5, n = dmg > .5 ? 6 : 3;
      for (let i = 0; i < n; i++) { const a = i * 2.1 + b.c; ctx.moveTo(cx, cy); ctx.lineTo(cx + Math.cos(a) * q.w * .45, cy + Math.sin(a) * q.h * .6); }
      ctx.stroke();
    }
    ctx.restore(); ctx.restore();
  }
  function drawChar(k, x, y, flying, ang) {
    const i = img[k + (flying ? 'vuelo' : 'pie')]; if (!i.complete || !i.naturalWidth) { ctx.beginPath(); ctx.arc(x, y, R, 0, Math.PI * 2); ctx.fillStyle = '#B3121C'; ctx.fill(); return; }
    ctx.save(); ctx.translate(x, y);
    if (flying) { const w = R * 3.6, h = w * i.naturalHeight / i.naturalWidth; ctx.rotate(ang); ctx.drawImage(i, -w / 2, -h / 2, w, h); }
    else { const h = R * 4.2, w = h * i.naturalWidth / i.naturalHeight; ctx.drawImage(i, -w / 2, -h * .62, w, h); }
    ctx.restore();
  }
  function draw() {
    ctx.clearRect(0, 0, W, H);
    // la cinta: hasta dónde puede bajar el muro
    ctx.save(); ctx.translate(0, dangerY); ctx.fillStyle = 'rgba(245,210,10,.92)'; ctx.fillRect(0, -5, W, 10);
    ctx.fillStyle = '#111'; for (let x = -10; x < W; x += 22) { ctx.beginPath(); ctx.moveTo(x, -5); ctx.lineTo(x + 10, -5); ctx.lineTo(x + 4, 5); ctx.lineTo(x - 6, 5); ctx.fill(); }
    ctx.restore();
    bricks.forEach((b) => { if (b.hp > 0) drawBrick(b); });
    // pruebas que caen
    docs.forEach((d) => { ctx.save(); ctx.translate(d.x, d.y); ctx.rotate(d.rot); ctx.fillStyle = '#FBF8F0'; ctx.strokeStyle = '#1D1D1B'; ctx.lineWidth = 1.2; ctx.fillRect(-9, -12, 18, 24); ctx.strokeRect(-9, -12, 18, 24); ctx.strokeStyle = '#B3121C'; ctx.beginPath(); for (let j = -5; j <= 7; j += 4) { ctx.moveTo(-5, j); ctx.lineTo(5, j); } ctx.stroke(); ctx.restore(); });
    const s = sling(), v = phase === 'aim' ? aimVector() : null;
    // trayectoria
    if (v) {
      const pts = predict(v);
      pts.forEach((p, i) => { ctx.beginPath(); ctx.arc(p[0], p[1], p[2] ? 6 : Math.max(1.5, 3.4 - i * .06), 0, Math.PI * 2); ctx.fillStyle = p[2] ? 'rgba(179,18,28,.0)' : 'rgba(251,246,236,.92)'; ctx.fill(); if (p[2]) { ctx.strokeStyle = '#B3121C'; ctx.lineWidth = 2; ctx.stroke(); } });
    }
    // resortera
    const fork = R * 2.1, py = s.y + R * .6;
    const pull = v ? { x: s.x - Math.cos(v.ang) * v.len, y: s.y - R * 1.1 - Math.sin(v.ang) * v.len } : { x: s.x, y: s.y - R * 1.1 };
    ctx.lineCap = 'round';
    ctx.strokeStyle = '#6B4524'; ctx.lineWidth = 9; ctx.beginPath(); ctx.moveTo(s.x, H); ctx.lineTo(s.x, py); ctx.moveTo(s.x, py); ctx.lineTo(s.x - fork, s.y - R * 1.2); ctx.moveTo(s.x, py); ctx.lineTo(s.x + fork, s.y - R * 1.2); ctx.stroke();
    ctx.strokeStyle = '#3B2414'; ctx.lineWidth = 3;
    if (phase === 'aim') { ctx.beginPath(); ctx.moveTo(s.x - fork, s.y - R * 1.2); ctx.lineTo(pull.x, pull.y + R * .6); ctx.lineTo(s.x + fork, s.y - R * 1.2); ctx.stroke(); drawChar(selected, pull.x, pull.y, false, 0); }
    else { ctx.beginPath(); ctx.moveTo(s.x - fork, s.y - R * 1.2); ctx.lineTo(s.x + fork, s.y - R * 1.2); ctx.stroke(); }
    if (shot) drawChar(shot.k, shot.x, shot.y, true, Math.atan2(shot.vy, shot.vx) * .35);
    parts.forEach((p) => { ctx.globalAlpha = clamp(p.life, 0, 1); ctx.fillStyle = p.color; ctx.fillRect(p.x, p.y, p.sz, p.sz); });
    ctx.globalAlpha = 1;
    if (flash > 0) { ctx.fillStyle = 'rgba(255,240,200,' + (flash * 1.6) + ')'; ctx.fillRect(0, 0, W, H); }
    root.classList.toggle('is-hint', !hinted && phase === 'aim');
  }

  // ------------------------------------------------------------------ bucle
  function frame(t) {
    raf = 0; if (destroyed) return;
    const dt = Math.min(.033, (t - last) / 1000 || 0); last = t;
    if (!paused && onscreen) { update(dt); draw(); }
    if (onscreen && !paused) raf = requestAnimationFrame(frame);
  }
  function wake() { if (!raf && !destroyed) { last = performance.now(); raf = requestAnimationFrame(frame); } }

  // ------------------------------------------------------------------ entrada
  const local = (e) => { const r = canvas.getBoundingClientRect(); return { x: e.clientX - r.left, y: e.clientY - r.top }; };
  canvas.addEventListener('pointerdown', (e) => {
    if (paused) return;
    if (phase === 'fly') { power(); return; }
    if (phase !== 'aim') return;
    const p = local(e); drag = { x0: p.x, y0: p.y, x: p.x, y: p.y, id: e.pointerId };
    canvas.setPointerCapture(e.pointerId); e.preventDefault();
  });
  canvas.addEventListener('pointermove', (e) => { if (!drag || e.pointerId !== drag.id) return; const p = local(e); drag.x = p.x; drag.y = p.y; e.preventDefault(); });
  const release = (e) => { if (!drag || e.pointerId !== drag.id) return; const v = aimVector(); drag = null; if (v && phase === 'aim') launch(v); };
  canvas.addEventListener('pointerup', release); canvas.addEventListener('pointercancel', () => { drag = null; });
  $$('.bmv__who').forEach((b) => b.addEventListener('click', () => pick(b.dataset.who)));
  $('[data-do=sound]').addEventListener('click', (e) => { sound = !sound; const b = e.currentTarget; b.innerHTML = svg(sound ? 'sound' : 'mute'); b.setAttribute('aria-pressed', String(sound)); b.setAttribute('aria-label', sound ? 'Mute' : 'Turn sound on'); beep('lanza'); });
  $('[data-do=pause]').addEventListener('click', (e) => { paused = !paused; const b = e.currentTarget; b.innerHTML = svg(paused ? 'play' : 'pause'); b.setAttribute('aria-pressed', String(paused)); b.setAttribute('aria-label', paused ? 'Resume game' : 'Pause game'); root.classList.toggle('is-paused', paused); wake(); });
  $('[data-do=reset]').addEventListener('click', () => { level = 0; build(level); wake(); });
  $('[data-do=next]').addEventListener('click', () => { if ($('.bmv__sello').classList.contains('is-gana') && level < 2) level++; else if ($('.bmv__sello').classList.contains('is-gana')) level = 0; build(level); wake(); });

  const io = new IntersectionObserver((es) => { onscreen = es[0].isIntersecting; if (onscreen) wake(); }, { threshold: .05 });
  io.observe(stage);
  const ro = new ResizeObserver(() => { const w = W, h = H; layout(false); if (Math.abs(w - W) > 40) { const rows = Math.max(...bricks.map((b) => b.row), 0) + 1; step = Math.max(6, (dangerY - (wallY + rows * bh)) / (10 - level)); } draw(); });
  ro.observe(stage);

  build(0); wake();
  return {
    ready: Promise.resolve(true),
    pause: () => { paused = true; root.classList.add('is-paused'); },
    resume: () => { paused = false; root.classList.remove('is-paused'); wake(); },
    reset: () => { level = 0; build(0); wake(); },
    getState: () => ({ shot: shot ? [Math.round(shot.x), Math.round(shot.y), Math.round(shot.vx), Math.round(shot.vy)] : null, vertical: true, level: level + 1, phase, selected, shots, collected, total, bricks: bricks.filter((b) => b.hp > 0).length, wallY: Math.round(wallY), dangerY: Math.round(dangerY) }),
    positions() {
      const r = canvas.getBoundingClientRect(), s = sling(), who = root.querySelector('.bmv__who[data-who=andersson]').getBoundingClientRect();
      return { unit: 1, moni: { x: r.left + s.x, y: r.top + s.y - R * 1.4 }, andersson: { x: who.left + who.width / 2, y: who.top + who.height / 2 }, hMoni: R * 3.4, hAndersson: who.height * .9 };
    },
    debug: opts.debug ? { launchAt: (deg, pow) => { const a = -deg * Math.PI / 180; launch({ vx: Math.cos(a) * VMAX * pow, vy: Math.sin(a) * VMAX * pow }); }, power, step: (sec) => { for (let i = 0; i < sec * 60; i++) update(1 / 60); draw(); } } : null,
    destroy() { destroyed = true; if (raf) cancelAnimationFrame(raf); io.disconnect(); ro.disconnect(); if (audio) audio.close(); root.innerHTML = ''; root.classList.remove('bmv', 'is-played', 'is-paused', 'is-hint'); }
  };
}

global.BMVertical = { mount, usar: () => matchMedia('(max-width: 760px) and (orientation: portrait)').matches };
})(window);
