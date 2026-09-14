/* Ajustes de Bakano: agranda la letra pequeña de la entrega de Andersson ("letra de lupa").
   Los tamaños del sitio están en px y repartidos en 35 formatos, así que en vez de
   sobrescribir cientos de selectores se escala cada tamaño computado por debajo de 20px.
   Se mide todo antes de escribir para que los tamaños en em no se multipliquen. */
(function () {
  var SALTAR = 'svg, canvas, script, style, noscript, #portada-jugable, .bmhero, .intro, .topbar, .fnav';
  var original = new WeakMap();

  function objetivo(s, angosto) {
    if (s >= 20) return s;
    return Math.min(angosto ? 18 : 20, Math.max(s * 1.3, angosto ? 14 : 15));
  }

  function restaurar(els) {
    for (var i = 0; i < els.length; i++) {
      var o = original.get(els[i]);
      if (o) { els[i].style.fontSize = o.fs; els[i].style.lineHeight = o.lh; }
    }
  }

  function escalar(els) {
    var angosto = window.innerWidth < 650, cambios = [];
    for (var i = 0; i < els.length; i++) {
      var e = els[i];
      if (e.closest(SALTAR)) continue;
      var cs = getComputedStyle(e), s = parseFloat(cs.fontSize), n = objetivo(s, angosto);
      if (n === s) continue;
      var lh = parseFloat(cs.lineHeight);
      cambios.push([e, n, isNaN(lh) ? null : Math.max(lh * n / s, n * 1.2)]);
    }
    for (i = 0; i < cambios.length; i++) {
      var c = cambios[i], el = c[0];
      if (!original.has(el)) original.set(el, { fs: el.style.fontSize, lh: el.style.lineHeight });
      el.style.fontSize = c[1] + 'px';
      if (c[2]) el.style.lineHeight = c[2] + 'px';
    }
  }

  function todo() {
    var els = document.body.querySelectorAll('*');
    restaurar(els);
    escalar(els);
    window.dispatchEvent(new Event('resize')); // los hilos del corcho se recalculan con el nuevo alto
  }

  var ancho = window.innerWidth, t = 0;
  window.addEventListener('resize', function () {
    if (window.innerWidth === ancho) return;
    ancho = window.innerWidth;
    clearTimeout(t); t = setTimeout(todo, 200);
  });

  new MutationObserver(function (muts) {
    var nuevos = [];
    muts.forEach(function (m) {
      m.addedNodes.forEach(function (n) {
        if (n.nodeType !== 1) return;
        nuevos.push(n);
        nuevos.push.apply(nuevos, n.querySelectorAll('*'));
      });
    });
    if (nuevos.length) escalar(nuevos);
  }).observe(document.body, { childList: true, subtree: true });

  todo();
})();
