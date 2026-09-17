/* Ajustes de Bakano: sube el tamaño de letra de toda la entrega de Andersson.
   El sitio trae ~1400 tamaños en px repartidos en 35 formatos, así que en vez de
   sobrescribir selectores se reescribe el tamaño ya calculado de cada elemento.

   Dos cosas importantes:
   - Se escribe en rem sobre una base de 16, así que si el usuario agranda la
     letra en su navegador (Ctrl + o Configuración → Apariencia → Tamaño de
     fuente) todo el sitio crece con él. En px no crecía.
   - La curva es la misma que usa la app Vue (src/): la letra chica sube mucho,
     la grande casi nada, y de 40px para arriba solo se pasa a rem sin cambiar
     el tamaño, para no romper los titulares.
   Se mide todo antes de escribir para que los tamaños en em no se multipliquen. */
(function () {
  var SALTAR = 'svg, canvas, script, style, noscript, #portada-jugable, .bmhero, .intro';
  var BASE = 16, TOPE = 40;
  var original = new WeakMap();

  function objetivo(px, bono) {
    return px >= TOPE ? px : px + bono * (TOPE - px) / (TOPE - 8);
  }

  function restaurar(els) {
    for (var i = 0; i < els.length; i++) {
      var o = original.get(els[i]);
      if (o) { els[i].style.fontSize = o.fs; els[i].style.lineHeight = o.lh; }
    }
  }

  function escalar(els) {
    var bono = window.innerWidth < 650 ? 6.5 : 8, cambios = [];
    for (var i = 0; i < els.length; i++) {
      var e = els[i];
      if (e.closest(SALTAR)) continue;
      var cs = getComputedStyle(e), px = parseFloat(cs.fontSize);
      if (!px) continue;
      var n = objetivo(px, bono);
      // el alto de línea en px quedaría apretado con la letra nueva: se pasa a proporción
      var lh = parseFloat(cs.lineHeight);
      cambios.push([e, Math.round(n / BASE * 1000) / 1000, isNaN(lh) ? null : Math.max(lh / px, 1.2)]);
    }
    for (i = 0; i < cambios.length; i++) {
      var c = cambios[i], el = c[0];
      if (!original.has(el)) original.set(el, { fs: el.style.fontSize, lh: el.style.lineHeight });
      el.style.fontSize = c[1] + 'rem';
      if (c[2]) el.style.lineHeight = String(c[2]);
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
