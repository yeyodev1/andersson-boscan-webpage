/**
 * Ciclo de vida de la sección Investigaciones.
 *
 * El artifact original era un documento suelto: su CSS toca `html`, `body` y
 * `:root`, y sus scripts se ejecutaban al parsearse. Aquí el CSS se inyecta y
 * se retira con la vista (para que no se filtre a Media Kit ni a Publicidad) y
 * los scripts se inicializan en orden después de que Vue montó el marcado.
 */
import uaDefaults from './styles/_ua-defaults.css?inline'
import base from './styles/00-base.css?inline'
import mesa from './styles/01-mesa.css?inline'
import hero from './styles/02-hero.css?inline'
import objetos from './styles/03-objetos.css?inline'

import homeData from './data/home-data.json'
import structuredData from './data/structured-data.json'

import initComportamientos from '@/periodismo/scripts/01-comportamientos.js'
import initPortada from '@/periodismo/scripts/02-portada.js'
import initBm3d from '@/periodismo/scripts/03-bm3d.js'
import initFisica from '@/periodismo/scripts/04-fisica.js'
import initAvatares from '@/periodismo/scripts/05-avatares.js'
import initEscenografia from '@/periodismo/scripts/06-escenografia.js'
import initJuego from '@/periodismo/scripts/07-juego.js'
import initMontaje from '@/periodismo/scripts/08-mount.js'

const STYLE_ID = 'periodismo-estilos'
const FUENTES_ID = 'periodismo-fuentes'

/**
 * Las familias que el artifact cargaba desde su <head>. Sin esto la portada
 * usa fallbacks con otras métricas y el titular se desborda del recorte.
 */
const FUENTES: Array<[string, Record<string, string>]> = [
  ['link', { rel: 'preconnect', href: 'https://fonts.googleapis.com' }],
  ['link', { rel: 'preconnect', href: 'https://fonts.gstatic.com', crossorigin: '' }],
  ['link', { rel: 'stylesheet', href: 'https://fonts.googleapis.com/css2?family=Fraunces:ital,opsz,wght,SOFT@0,9..144,300..900,0..100;1,9..144,300..900,0..100&family=Source+Serif+4:ital,opsz,wght@0,8..60,300..700;1,8..60,300..700&family=IBM+Plex+Sans:wght@300;400;500;600&family=IBM+Plex+Mono:wght@400;500&family=Barlow+Condensed:wght@700;800;900&family=Oswald:wght@500;700&family=Anton&family=Playfair+Display:ital,wght@0,700;0,900;1,400&family=JetBrains+Mono:wght@700&family=Courier+Prime:wght@700&family=Special+Elite&family=Cormorant+Garamond:wght@600&family=Manrope:wght@800&family=Newsreader:opsz,wght@6..72,500&family=Libre+Baskerville:wght@700&family=Barlow+Semi+Condensed:wght@900&family=Caveat:wght@500;700&display=swap' }],
  ['link', { rel: 'stylesheet', href: 'https://fonts.googleapis.com/css2?family=Bodoni+Moda:opsz,wght@6..96,500..700&display=swap' }],
]
const LD_ID = 'periodismo-structured-data'

export function montarEstilos(): void {
  if (document.getElementById(STYLE_ID)) return

  FUENTES.forEach(([tag, attrs], i) => {
    const el = document.createElement(tag)
    el.dataset.periodismo = FUENTES_ID
    el.id = `${FUENTES_ID}-${i}`
    Object.entries(attrs).forEach(([k, v]) => el.setAttribute(k, v))
    document.head.appendChild(el)
  })
  const el = document.createElement('style')
  el.id = STYLE_ID
  el.textContent = [uaDefaults, base, mesa, hero, objetos].join('\n')
  document.head.appendChild(el)

  const ld = document.createElement('script')
  ld.id = LD_ID
  ld.type = 'application/ld+json'
  ld.textContent = JSON.stringify(structuredData)
  document.head.appendChild(ld)
}

export function desmontarEstilos(): void {
  document.getElementById(STYLE_ID)?.remove()
  document.getElementById(LD_ID)?.remove()
  document.querySelectorAll(`[data-periodismo="${FUENTES_ID}"]`).forEach((el) => el.remove())
}

export function montarScripts(): void {
  window.__BM_HOME_DATA = homeData
  // El orden es el del documento original: las librerías 3D antes del juego.
  initBm3d()
  initFisica()
  initAvatares()
  initEscenografia()
  initJuego()
  initComportamientos()
  initPortada()
  initMontaje()
}

export function desmontarScripts(): void {
  try {
    window.portadaJugable?.destroy?.()
  } catch {
    /* el juego pudo no llegar a montarse */
  }
  delete window.portadaJugable
  delete window.__BM_HOME_DATA
}
