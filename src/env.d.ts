/// <reference types="vite/client" />

declare module '@/periodismo/scripts/*' {
  /** Cada script del artifact se envolvió en una función de inicialización. */
  const init: () => void
  export default init
}

interface Window {
  /** Data de casos y personas que consume el script de portada. */
  __BM_HOME_DATA?: unknown
  /** API del juego WebGL de la portada, expuesta por BMGame.mount(). */
  portadaJugable?: { destroy?: () => void } & Record<string, unknown>
}
