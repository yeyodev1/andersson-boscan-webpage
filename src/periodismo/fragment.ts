/**
 * Utilidades para montar los fragmentos HTML extraídos del artifact
 * "Investigaciones · Boscán & La Moni" dentro de componentes Vue,
 * conservando el marcado original tal cual.
 */

/** Devuelve el contenido interno de un fragmento cuyo nodo raíz es único. */
export function innerOf(raw: string): string {
  const s = raw.trim()
  const open = s.indexOf('>')
  const close = s.lastIndexOf('</')
  if (open < 0 || close < 0 || close < open) return s
  return s.slice(open + 1, close)
}

/** Devuelve los atributos del nodo raíz de un fragmento. */
export function attrsOf(raw: string): Record<string, string> {
  const s = raw.trim()
  const tag = s.slice(0, s.indexOf('>'))
  const attrs: Record<string, string> = {}
  const re = /([a-zA-Z_:][-a-zA-Z0-9_:.]*)(?:="([^"]*)")?/g
  let m: RegExpExecArray | null
  let first = true
  while ((m = re.exec(tag))) {
    if (first) { first = false; continue } // nombre de la etiqueta
    const name = m[1]
    if (!name) continue
    attrs[name] = m[2] ?? ''
  }
  return attrs
}

/** Carga los 35 expedientes ordenados por su número de archivo. */
export function expedientes(): string[] {
  const mods = import.meta.glob('./html/expedientes/*.html', { query: '?raw', import: 'default', eager: true })
  return Object.keys(mods).sort().map((k) => mods[k] as string)
}

/**
 * Devuelve el contenido interno del primer <div> que abre con `startTag`,
 * contando anidamiento para encontrar su cierre.
 */
export function innerOfBlock(raw: string, startTag: string): string {
  const a = raw.indexOf(startTag)
  if (a < 0) throw new Error(`Fragmento sin bloque ${startTag}`)
  const from = raw.indexOf('>', a) + 1
  const re = /<div\b|<\/div>/g
  re.lastIndex = from
  let depth = 1
  let m: RegExpExecArray | null
  while ((m = re.exec(raw))) {
    depth += m[0] === '</div>' ? -1 : 1
    if (depth === 0) return raw.slice(from, m.index)
  }
  throw new Error(`Bloque ${startTag} sin cierre`)
}
