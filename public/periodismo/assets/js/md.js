/* La Mancha Dorada: mancha que crece, tira de días, barras, gota de mercurio, lightbox */
(function () {
  'use strict';
  const $ = (s, c) => (c || document).querySelector(s);
  const $$ = (s, c) => [...(c || document).querySelectorAll(s)];
  const reduce = matchMedia('(prefers-reduced-motion: reduce)').matches;

  /* Diálogos en cursiva */
  $$('.entrega__text p').forEach((p) => { if (/^[—–-]/.test(p.textContent.trim())) p.classList.add('dialogue'); });

  /* La mancha dorada crece con el scroll del hero */
  const hero = $('.mdhero');
  if (hero && !reduce) {
    const upd = () => {
      const h = hero.offsetHeight, p = Math.max(0, Math.min(1, scrollY / (h * 0.8)));
      hero.style.setProperty('--stain', p.toFixed(3));
    };
    addEventListener('scroll', upd, { passive: true }); upd();
  }

  /* Tira de días activa */
  const dayLinks = $$('.days a'), entregas = $$('.entrega');
  if (dayLinks.length) {
    const io = new IntersectionObserver((es) => {
      es.forEach((e) => {
        if (!e.isIntersecting) return;
        dayLinks.forEach((a) => a.classList.toggle('is-active', a.getAttribute('href') === '#' + e.target.id));
        const act = $('.days a.is-active'); if (act) act.scrollIntoView({ block: 'nearest', inline: 'center', behavior: 'smooth' });
      });
    }, { rootMargin: '-30% 0px -55% 0px' });
    entregas.forEach((s) => io.observe(s));
  }

  /* Barras de mercurio */
  const bars = $('.bars');
  if (bars) {
    const max = Math.max(...$$('.bar', bars).map((b) => parseFloat(b.dataset.v)));
    new IntersectionObserver((es, o) => {
      if (!es[0].isIntersecting) return; o.disconnect();
      $$('.bar', bars).forEach((b, i) => setTimeout(() => { $('.bar__fill', b).style.width = (parseFloat(b.dataset.v) / max * 100) + '%'; }, i * 220));
    }, { threshold: 0.4 }).observe(bars);
  }

  /* Tira de rastros: se dibuja al entrar */
  const rastros = $('.rastros');
  if (rastros) new IntersectionObserver((es, o) => { if (es[0].isIntersecting) { rastros.classList.add('in'); o.disconnect(); } }, { threshold: 0.3 }).observe(rastros);

  /* Gota de mercurio que recorre los pasos */
  const proc = $('.proceso'), bead = $('.bead');
  if (proc && bead) {
    const pasos = $$('.paso', proc);
    const setStep = (k) => {
      pasos.forEach((p, i) => p.classList.toggle('is-on', i <= k));
      const p = pasos[k]; if (!p) return;
      bead.style.left = (p.offsetLeft + 0) + 'px';
    };
    let cur = -1;
    const upd = () => {
      const r = proc.getBoundingClientRect(), vh = innerHeight;
      const t = Math.max(0, Math.min(1, (vh * 0.75 - r.top) / (r.height + vh * 0.3)));
      const k = Math.min(pasos.length - 1, Math.floor(t * pasos.length));
      if (k !== cur) { cur = k; setStep(k); }
    };
    addEventListener('scroll', upd, { passive: true }); addEventListener('resize', upd); upd();
  }

  /* Lightbox de facsímiles */
  const lb = $('.lb');
  if (lb) {
    const img = $('img', lb), cap = $('.lb__cap', lb);
    const open = (src, t) => { img.src = src; cap.textContent = t || ''; lb.classList.add('is-open'); document.body.style.overflow = 'hidden'; };
    const close = () => { lb.classList.remove('is-open'); document.body.style.overflow = ''; img.src = ''; };
    $$('[data-full]').forEach((a) => a.addEventListener('click', (e) => { e.preventDefault(); open(a.dataset.full, a.dataset.cap); }));
    $('.lb__close', lb).addEventListener('click', close);
    lb.addEventListener('click', (e) => { if (e.target === lb) close(); });
    addEventListener('keydown', (e) => { if (e.key === 'Escape') close(); });
  }
})();
