/* Extraído del artifact "Investigaciones · Boscán & La Moni"; envuelto para el ciclo de vida de Vue. */
export default function init() {
  try { var pj = document.getElementById('portada-jugable'); window.portadaJugable = BMGame.mount(pj, { archiveHref: '#mesa', debug: false }); pj.appendChild(document.getElementById('titulo-juego').content.cloneNode(true)); } catch (e) { console.warn('portada jugable', e); }

}
