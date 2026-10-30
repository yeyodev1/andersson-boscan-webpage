// Servidor MCP del sitio: deja que Andersson lea, cambie y publique la web
// desde Claude (claude.ai → Conectores) sin terminal ni cuenta de GitHub.
//
// URL: https://boscanymoni.com/api/mcp/<MCP_CLAVE>. La clave larga va en la
// ruta y es lo único que protege el conector; se entrega en /mcp tras el
// código. Cada cambio es un commit a main vía API de GitHub (GITHUB_TOKEN) y
// Vercel lo despliega solo; si el build falla, sigue en línea la versión
// anterior.
//
// Transporte MCP "streamable HTTP" sin estado: cada POST trae un mensaje
// JSON-RPC y se responde en JSON. No hay SSE.
//
// Los archivos que no son texto (fotos, audios) no caben en una herramienta:
// entran por api/subir.ts (página /mcp o sandbox de Claude) o por URL, y aquí
// solo se enlaza su blob de git en el commit.
import { createHmac, timingSafeEqual } from 'node:crypto'

type Req = {
  method?: string
  query: Record<string, string | string[] | undefined>
  body?: unknown
}
type Res = {
  status(code: number): Res
  setHeader(name: string, value: string): void
  json(body: unknown): void
  end(body?: string): void
}

const REPO = 'yeyodev1/andersson-boscan-webpage'
const RAMA = process.env.MCP_RAMA || 'main' // MCP_RAMA solo para pruebas
const SITIO = 'https://boscanymoni.com'
const VERSION_PROTOCOLO = '2025-06-18'

// Lo que el conector no puede tocar: infraestructura, el propio conector y la
// clave de IndexNow. Todo lo que corre en el build de Vercel (config de Vite,
// dependencias, vercel.json) queda fuera: ahí se leen las variables de
// entorno, incluido GITHUB_TOKEN.
const BLOQUEADAS = [
  'api/', '.github/', '.claude/', 'scripts/', 'node_modules/', 'dist/', '.env',
  'vite.config', 'package.json', 'pnpm-lock.yaml', 'pnpm-workspace.yaml', '.npmrc', 'tsconfig', 'vercel.json',
  'public/periodismo/6e60fdfa0d2c5fad49aa11dbf1d063a5.txt',
]

const REF_SUBIDAS = 'subidas/pendientes' // la escribe api/subir.ts
const MAX_BYTES = 25_000_000
const BINARIO = /\.(jpe?g|png|webp|gif|avif|ico|bmp|tiff?|heic|mp3|m4a|aac|wav|ogg|opus|flac|mp4|m4v|webm|mov|pdf|zip|woff2?|ttf|otf|eot)$/i

const INSTRUCCIONES = `Conector del sitio boscanymoni.com (Andersson Boscán y Mónica Velásquez). Quien lo usa es Andersson: no es programador. Háblale corto, en español y sin jerga.

Cómo trabajar:
1. Antes de cambiar algo, ubica el archivo (buscar_texto / ver_archivos) y léelo entero con leer_archivo. Nunca adivines el contenido.
2. Explica en 2-4 viñetas qué vas a cambiar, en palabras de lo que se ve en la página. Si ya dijo "publícalo" junto con el pedido, no vuelvas a preguntar.
3. publicar_cambios guarda todo en un solo paso y la web se actualiza sola en 1-2 minutos. Luego llama a estado_publicacion hasta que diga "en línea" o "falló", y dale el enlace exacto de la página.
4. Si falló: el sitio sigue mostrando la versión anterior (no se rompe nada). Lee el error probable, corrígelo con otro publicar_cambios o usa deshacer_ultima_publicacion.
5. Si un envío es demasiado grande y falla, divídelo en varios publicar_cambios.

Se puede cambiar todo el sitio: textos, diseño (HTML, CSS, JS), fotos, audios, la portada y el sitio de investigaciones. Solo quedan fuera: ${BLOQUEADAS.join(', ')}.

Fotos, audios, tipografías, PDF y demás archivos que no son texto (máximo 25 MB cada uno):
- Andersson los sube en https://boscanymoni.com/mcp con su código: archivos sueltos, una carpeta o un .zip (hasta 4 MB por archivo; las fotos más pesadas se achican solas). Tú los ves con ver_subidas y los publicas con {ruta, subida}; "subida" puede ser una carpeta entera.
- Si están en internet, o en Google Drive / Dropbox compartidos como "cualquier persona con el enlace": {ruta, desde_url}.
- Si los generaste en tu entorno de código: pide enlace_de_subida, súbelos con el comando que te da y publícalos con {ruta, blob}. Si tu entorno no tiene salida a internet, entrégale a Andersson un .zip y pídele que lo suba en /mcp.
- Un archivo pequeño que generes tú (un ícono): {ruta, base64}.
- Nunca conviertas una foto o una miniatura a .svg ni la escribas como texto para esquivar esto: las redes no muestran vista previa de un .svg.
- Videos: no se suben al sitio (pesan demasiado). Van en YouTube y se embeben con <iframe src="https://www.youtube-nocookie.com/embed/ID_DEL_VIDEO" loading="lazy" allowfullscreen title="…"></iframe>.
- En la web, mejor .webp o .jpg de menos de 500 KB.

Sitio de investigaciones (public/periodismo/, se ve en boscanymoni.com/periodismo/):
- Lo genera Andersson con su build.py. Si te da los archivos generados, publícalos tal cual en vez de reescribirlos.
- Cada nota tiene su propia identidad visual: investigaciones/<slug>/index.html carga las hojas comunes (base.css, exp.css, fmt-base.css) y una propia, assets/css/fmt/<formato>.css, que solo usa esa nota. Para cambiar el diseño de una nota toca su página o su fmt; nunca edites las hojas comunes por una sola nota ni reutilices el fmt de otra. Una nota nueva lleva su fmt nuevo.
- Usa rutas relativas como las demás páginas (../../assets/…).
- Al publicar, el conector pasa solo las URLs absolutas a /periodismo/ y enlaza los ajustes de letra grande (/ajustes-periodismo/): no los agregues ni los quites.
- Nota nueva: además de su carpeta (y su transcripcion/ si la tiene), agrégala donde salen las demás. Busca con buscar_texto (carpeta "public/periodismo") el slug de otra nota y añade la nueva en esos mismos lugares (portada de periodismo, sitemap.xml, feed.xml, llms.txt, pies de las notas), y también en public/llms.txt y public/llms-full.txt. Todo en un solo publicar_cambios.
- Las carpetas de expedientes de la portada principal (boscanymoni.com) están en src/views/PortadaView.vue: agrega ahí la nota solo si Andersson lo pide.

Reglas del resto del sitio (Vue 3 + TypeScript + SCSS, en src/):
- Precios, productos y formatos de publicidad viven SOLO en src/config/catalogo.ts. Respuestas del chat de publicidad: src/config/respuestas.ts.
- Tamaños de letra siempre en rem, nunca px.
- No uses "ad", "ads", "publicidad", "banner" ni "sponsor" en nombres de archivo ni clases CSS (los bloqueadores de anuncios los cortan).
- Marca: "Boscán & La Moni" o "Andersson Boscán y Mónica Velásquez". Nunca "Andersson y Moni Boscán".
- Página nueva: crea la vista en src/views/ y su ruta en src/router/index.ts (con meta title y description) con publicar_cambios, y en el mismo pedido llama a habilitar_pagina con la ruta. Sin habilitar_pagina la página da 404 en producción.
- Mira CLAUDE.md (leer_archivo) si dudas de cómo está armado algo.`

const HERRAMIENTAS = [
  {
    name: 'ver_archivos',
    description: 'Lista archivos y carpetas del proyecto. Sin ruta, muestra la raíz. Útil: src/views (páginas), src/components, src/config, public.',
    inputSchema: { type: 'object', properties: { ruta: { type: 'string', description: 'Carpeta, p. ej. "src/views"' } } },
    annotations: { readOnlyHint: true },
  },
  {
    name: 'leer_archivo',
    description: 'Devuelve el contenido completo de un archivo del proyecto, tal como está publicado.',
    inputSchema: { type: 'object', properties: { ruta: { type: 'string' } }, required: ['ruta'] },
    annotations: { readOnlyHint: true },
  },
  {
    name: 'buscar_texto',
    description: 'Busca un texto en el código del sitio (p. ej. una frase que se ve en la página), sin distinguir mayúsculas, y devuelve archivo, número de línea y la línea. Sin carpeta busca en todo menos public/periodismo/; para el sitio de investigaciones pasa carpeta "public/periodismo".',
    inputSchema: {
      type: 'object',
      properties: { texto: { type: 'string' }, carpeta: { type: 'string', description: 'Opcional: busca solo dentro de esta carpeta.' } },
      required: ['texto'],
    },
    annotations: { readOnlyHint: true },
  },
  {
    name: 'ver_subidas',
    description: 'Lista los archivos que Andersson subió en boscanymoni.com/mcp y todavía no se publican (ruta dentro de las subidas y peso).',
    inputSchema: { type: 'object', properties: {} },
    annotations: { readOnlyHint: true },
  },
  {
    name: 'enlace_de_subida',
    description: 'Da un comando (válido 1 hora) para subir archivos desde tu entorno de código a la web, hasta 4 MB cada uno. Devuelve el "blob" que luego va en publicar_cambios.',
    inputSchema: { type: 'object', properties: {} },
    annotations: { readOnlyHint: true },
  },
  {
    name: 'publicar_cambios',
    description: `Guarda uno o varios cambios en un solo paso y los publica en boscanymoni.com (tarda 1-2 min). Cada cambio lleva "ruta" (archivo del proyecto, p. ej. public/periodismo/assets/img/exp/foto.webp) y una de estas formas:
- {ruta, buscar, reemplazar}: cambia un fragmento exacto de un archivo de texto (debe aparecer una sola vez).
- {ruta, contenido}: escribe completo un archivo de texto (HTML, CSS, JS, SVG…), nuevo o existente.
- {ruta, subida}: pone ahí un archivo de ver_subidas; si "subida" es una carpeta, copia todo su contenido dentro de "ruta".
- {ruta, desde_url}: descarga el archivo de un enlace https (también Google Drive o Dropbox compartidos).
- {ruta, blob}: el sha que devolvió la subida de enlace_de_subida.
- {ruta, base64}: un archivo pequeño en base64.
- {ruta, borrar: true}: elimina el archivo.`,
    inputSchema: {
      type: 'object',
      properties: {
        mensaje: { type: 'string', description: 'Qué cambió, en una línea. Ej.: "fix(publicidad): corrige el correo del pie"' },
        cambios: {
          type: 'array',
          minItems: 1,
          items: {
            type: 'object',
            properties: {
              ruta: { type: 'string' },
              buscar: { type: 'string' },
              reemplazar: { type: 'string' },
              contenido: { type: 'string' },
              subida: { type: 'string' },
              desde_url: { type: 'string' },
              blob: { type: 'string' },
              base64: { type: 'string' },
              borrar: { type: 'boolean' },
            },
            required: ['ruta'],
          },
        },
      },
      required: ['mensaje', 'cambios'],
    },
    annotations: { destructiveHint: false, openWorldHint: true },
  },
  {
    name: 'estado_publicacion',
    description: 'Dice si la última publicación ya está en línea, sigue en proceso o falló, y muestra los últimos cambios publicados.',
    inputSchema: { type: 'object', properties: {} },
    annotations: { readOnlyHint: true },
  },
  {
    name: 'habilitar_pagina',
    description: 'Registra una ruta nueva del sitio en el hosting (vercel.json y public/_redirects) para que no dé 404. Úsala al crear una página nueva. Solo una palabra en minúsculas con guiones, sin barra: p. ej. "eventos".',
    inputSchema: { type: 'object', properties: { ruta: { type: 'string' } }, required: ['ruta'] },
    annotations: { destructiveHint: false },
  },
  {
    name: 'deshacer_ultima_publicacion',
    description: 'Regresa el sitio a como estaba antes del último cambio publicado, y lo publica. Confírmalo con la persona antes de usarla.',
    inputSchema: { type: 'object', properties: {} },
    annotations: { destructiveHint: true },
  },
]

// ── GitHub ────────────────────────────────────────────────────────────────

class ErrorAmable extends Error {}

async function gh(ruta: string, init: RequestInit = {}) {
  const r = await fetch(`https://api.github.com${ruta}`, {
    ...init,
    headers: {
      Authorization: `Bearer ${process.env.GITHUB_TOKEN}`,
      Accept: 'application/vnd.github+json',
      'X-GitHub-Api-Version': '2022-11-28',
      'User-Agent': 'boscanymoni-mcp',
      ...(init.body ? { 'Content-Type': 'application/json' } : {}),
    },
  })
  const datos = r.status === 204 ? null : await r.json().catch(() => null)
  if (!r.ok) {
    const e = new Error(`GitHub ${r.status}: ${(datos as { message?: string })?.message ?? ''}`) as Error & { status: number }
    e.status = r.status
    throw e
  }
  return datos as any
}

function limpiarRuta(ruta: unknown, escribir = false): string {
  const r = String(ruta ?? '').trim().replace(/^\.?\/+/, '').replace(/\/+$/, '')
  if (r.split('/').includes('..')) throw new ErrorAmable('Ruta no válida.')
  if (escribir) {
    if (!r) throw new ErrorAmable('Falta la ruta del archivo.')
    if (BLOQUEADAS.some((b) => r === b.replace(/\/$/, '') || r.startsWith(b)))
      throw new ErrorAmable(`"${r}" está bloqueado para este conector.`)
  }
  return r
}

const rutaApi = (r: string) => r.split('/').map(encodeURIComponent).join('/')
const kb = (bytes: number) => (bytes >= 1e6 ? `${(bytes / 1e6).toFixed(1)} MB` : `${Math.max(1, Math.round(bytes / 1e3))} KB`)

async function leer(ruta: string): Promise<string | null> {
  try {
    const d = await gh(`/repos/${REPO}/contents/${rutaApi(ruta)}?ref=${RAMA}`)
    if (Array.isArray(d)) throw new ErrorAmable(`"${ruta}" es una carpeta: usa ver_archivos.`)
    if (d.content) return Buffer.from(d.content, 'base64').toString('utf8')
    const blob = await gh(`/repos/${REPO}/git/blobs/${d.sha}`)
    return Buffer.from(blob.content, 'base64').toString('utf8')
  } catch (e) {
    if ((e as { status?: number }).status === 404) return null
    throw e
  }
}

// content: texto; sha: blob ya guardado en el repo (null = borrar).
type Entrada = { path: string; content?: string; sha?: string | null }

async function commit(mensaje: string, archivos: Entrada[] | null, arbol?: string) {
  // Hasta 3 intentos por si otro cambio entró a main entre medio.
  for (let intento = 0; ; intento++) {
    const ref = await gh(`/repos/${REPO}/git/ref/heads/${RAMA}`)
    const cabeza = await gh(`/repos/${REPO}/git/commits/${ref.object.sha}`)
    const tree = arbol ?? (await gh(`/repos/${REPO}/git/trees`, {
      method: 'POST',
      body: JSON.stringify({
        base_tree: cabeza.tree.sha,
        tree: archivos!.map((a) => ({
          path: a.path, mode: '100644', type: 'blob', ...('content' in a ? { content: a.content } : { sha: a.sha }),
        })),
      }),
    })).sha
    const nuevo = await gh(`/repos/${REPO}/git/commits`, {
      method: 'POST',
      body: JSON.stringify({ message: `${mensaje}\n\nPublicado desde el conector MCP del sitio.`, tree, parents: [cabeza.sha] }),
    })
    try {
      await gh(`/repos/${REPO}/git/refs/heads/${RAMA}`, { method: 'PATCH', body: JSON.stringify({ sha: nuevo.sha }) })
      return nuevo.sha as string
    } catch (e) {
      if ((e as { status?: number }).status !== 422 || intento >= 2) throw e
    }
  }
}

async function crearBlob(datos: Buffer): Promise<string> {
  if (!datos.length) throw new ErrorAmable('El archivo está vacío.')
  if (datos.length > MAX_BYTES)
    throw new ErrorAmable(`El archivo pesa ${(datos.length / 1e6).toFixed(1)} MB; el máximo es 25 MB. Si es un video, va en YouTube.`)
  const b = await gh(`/repos/${REPO}/git/blobs`, {
    method: 'POST',
    body: JSON.stringify({ content: datos.toString('base64'), encoding: 'base64' }),
  })
  return b.sha
}

async function leerBlob(sha: string): Promise<string> {
  const b = await gh(`/repos/${REPO}/git/blobs/${sha}`)
  return Buffer.from(b.content, 'base64').toString('utf8')
}

async function descargar(enlace: string): Promise<Buffer> {
  let u = enlace.trim()
  const drive = u.match(/drive\.google\.com\/(?:file\/d\/|open\?id=|uc\?(?:.*&)?id=)([\w-]{20,})/)
  if (drive) u = `https://drive.usercontent.google.com/download?id=${drive[1]}&export=download&confirm=t`
  else if (/dropbox\.com\//.test(u)) u = u.replace(/([?&])dl=0\b/, '$1dl=1')
  if (!/^https:\/\//.test(u)) throw new ErrorAmable('El enlace tiene que empezar con https://.')
  const r = await fetch(u, { redirect: 'follow' })
  if (!r.ok) throw new ErrorAmable(`No pude descargar el enlace (respondió ${r.status}). ¿Está compartido como "cualquier persona con el enlace"?`)
  if ((r.headers.get('content-type') ?? '').includes('text/html'))
    throw new ErrorAmable('Ese enlace abre una página, no el archivo. Si es de Google Drive o Dropbox, compártelo como "cualquier persona con el enlace".')
  if (Number(r.headers.get('content-length') ?? 0) > MAX_BYTES)
    throw new ErrorAmable('El archivo pesa más de 25 MB. Si es un video, va en YouTube.')
  return Buffer.from(await r.arrayBuffer())
}

// Lo subido en /mcp (api/subir.ts): ruta dentro de las subidas → blob.
async function leerSubidas(): Promise<{ fecha: string; archivos: Map<string, { sha: string; size: number }> } | null> {
  let ref
  try {
    ref = await gh(`/repos/${REPO}/git/ref/${REF_SUBIDAS}`)
  } catch (e) {
    if ((e as { status?: number }).status === 404) return null
    throw e
  }
  const c = await gh(`/repos/${REPO}/git/commits/${ref.object.sha}`)
  const t = await gh(`/repos/${REPO}/git/trees/${c.tree.sha}?recursive=1`)
  const archivos = new Map<string, { sha: string; size: number }>()
  for (const x of t.tree as any[]) if (x.type === 'blob') archivos.set(x.path, { sha: x.sha, size: x.size })
  return { fecha: c.committer.date, archivos }
}

// Quita de las subidas lo que ya se publicó. Si no queda nada, borra la ref.
async function quitarSubidas(rutas: string[]) {
  const ref = await gh(`/repos/${REPO}/git/ref/${REF_SUBIDAS}`)
  const c = await gh(`/repos/${REPO}/git/commits/${ref.object.sha}`)
  const t = await gh(`/repos/${REPO}/git/trees/${c.tree.sha}?recursive=1`)
  const quedan = (t.tree as any[]).filter((x) => x.type === 'blob' && !rutas.includes(x.path))
  if (!quedan.length) return gh(`/repos/${REPO}/git/refs/${REF_SUBIDAS}`, { method: 'DELETE' })
  const tree = await gh(`/repos/${REPO}/git/trees`, {
    method: 'POST',
    body: JSON.stringify({ tree: quedan.map((x) => ({ path: x.path, mode: '100644', type: 'blob', sha: x.sha })) }),
  })
  const nuevo = await gh(`/repos/${REPO}/git/commits`, {
    method: 'POST',
    body: JSON.stringify({ message: 'subidas publicadas', tree: tree.sha, parents: [c.sha] }),
  })
  await gh(`/repos/${REPO}/git/refs/${REF_SUBIDAS}`, { method: 'PATCH', body: JSON.stringify({ sha: nuevo.sha }) })
}

// Misma firma que api/subir.ts: "<vence>.<hmac>".
function tokenSubida(minutos = 60) {
  const exp = String(Date.now() + minutos * 60_000)
  return `${exp}.${createHmac('sha256', process.env.MCP_CLAVE ?? '').update(`subir:${exp}`).digest('base64url')}`
}

// ── Periodismo ───────────────────────────────────────────────────────────
// Lo mismo que hace scripts/actualizar-periodismo.py con una entrega, aplicado
// a cada página que entra por el conector. Es idempotente.

const RE_URL_PERIODISMO =
  /https:\/\/(?:www\.)?boscanymoni\.com\/(?!(?:periodismo\/|publicidad|media-kit|quienes-somos|agendar|precios|acceso-eureka))/g
const RE_AJUSTES = /[ \t]*<(?:link|script)[^>]*\/ajustes-periodismo\/[^>]*>(?:<\/script>)?\n?/g

export type Versiones = { ajustes: string; encaje: string; letra: string }

export function versionesAjustes(portada: string): Versiones {
  const v = (archivo: string) => portada.match(new RegExp(`${archivo.replace('.', '\\.')}\\?v=(\\d+)`))?.[1] ?? '1'
  return { ajustes: v('ajustes.css'), encaje: v('encaje.css'), letra: v('letra.js') }
}

export const necesitaAjuste = (ruta: string) => ruta.startsWith('public/periodismo/') && /\.(html|xml|txt)$/.test(ruta)

export function ajustarPeriodismo(ruta: string, texto: string, v: Versiones): string {
  if (!necesitaAjuste(ruta)) return texto
  texto = texto.replace(RE_URL_PERIODISMO, `${SITIO}/periodismo/`)
  const portada = ruta === 'public/periodismo/index.html'
  const reportaje = ruta.startsWith('public/periodismo/investigaciones/') && ruta.endsWith('.html')
    && !ruta.split('/').pop()!.startsWith('_')
  if (!(portada || reportaje)) return texto
  const sinAjustes = texto.replace(RE_AJUSTES, '')
  if (!sinAjustes.includes('</head>')) return texto
  const cabecera = `<link rel="stylesheet" href="/ajustes-periodismo/encaje.css?v=${v.encaje}">\n`
    + `<script src="/ajustes-periodismo/letra.js?v=${v.letra}" defer></script>\n`
  if (portada) {
    // En la portada van todos juntos detrás de game.css.
    const link = `<link rel="stylesheet" href="/ajustes-periodismo/ajustes.css?v=${v.ajustes}">\n`
    let hecho = false
    const con = sinAjustes.replace(/(<link[^>]*game\.css[^>]*>\n?)/, (m) => ((hecho = true), m + link + cabecera))
    return hecho ? con : sinAjustes.replace('</head>', link + cabecera + '</head>')
  }
  return sinAjustes.replace('</head>', cabecera + '</head>')
}

// ── Herramientas ─────────────────────────────────────────────────────────

async function ejecutar(nombre: string, a: Record<string, any>): Promise<string> {
  switch (nombre) {
    case 'ver_archivos': {
      const ruta = limpiarRuta(a.ruta)
      const d = await gh(`/repos/${REPO}/contents/${rutaApi(ruta)}?ref=${RAMA}`)
      if (!Array.isArray(d)) return `"${ruta}" es un archivo: usa leer_archivo.`
      return d.map((x: any) => (x.type === 'dir' ? `📁 ${x.path}/` : `   ${x.path}  (${kb(x.size)})`)).join('\n')
    }
    case 'leer_archivo': {
      const ruta = limpiarRuta(a.ruta)
      if (BINARIO.test(ruta)) {
        const d = await gh(`/repos/${REPO}/contents/${rutaApi(ruta)}?ref=${RAMA}`).catch(() => null)
        if (!d) return `No existe "${ruta}".`
        const publica = ruta.startsWith('public/') ? ` Se ve en ${SITIO}/${ruta.slice('public/'.length)}` : ''
        return `"${ruta}" no es texto (${kb(d.size)}).${publica}`
      }
      const t = await leer(ruta)
      if (t === null) return `No existe "${ruta}".`
      return t.length > 200_000 ? t.slice(0, 200_000) + '\n…(recortado)' : t
    }
    case 'buscar_texto': {
      // GitHub no indexa este repo para su búsqueda de código: se recorre el
      // árbol y se leen los archivos de texto desde raw (~75 fuera de
      // periodismo; ~300 dentro).
      const texto = String(a.texto ?? '').toLowerCase()
      if (!texto) throw new ErrorAmable('Falta el texto a buscar.')
      const carpeta = limpiarRuta(a.carpeta)
      const ref = await gh(`/repos/${REPO}/git/ref/heads/${RAMA}`)
      const arbol = await gh(`/repos/${REPO}/git/trees/${ref.object.sha}?recursive=1`)
      const rutas = (arbol.tree as any[])
        .filter((x) => x.type === 'blob' && x.size < 300_000)
        .map((x) => x.path as string)
        .filter((p) => (carpeta ? p.startsWith(`${carpeta}/`) : !p.startsWith('public/periodismo/')) && !p.startsWith('pnpm-lock'))
        .filter((p) => /\.(vue|ts|js|scss|css|html|md|txt|json|xml|svg)$/.test(p))
      const hallazgos: string[] = []
      const cola = [...rutas]
      await Promise.all(Array.from({ length: 24 }, async () => {
        for (let p = cola.shift(); p; p = cola.shift()) {
          const r = await fetch(`https://raw.githubusercontent.com/${REPO}/${ref.object.sha}/${rutaApi(p)}`, {
            headers: { Authorization: `Bearer ${process.env.GITHUB_TOKEN}` },
          })
          if (!r.ok) continue
          ;(await r.text()).split('\n').forEach((linea, i) => {
            if (linea.toLowerCase().includes(texto)) hallazgos.push(`${p}:${i + 1}: ${linea.trim().slice(0, 160)}`)
          })
        }
      }))
      if (!hallazgos.length) return 'Sin resultados. Prueba con un fragmento más corto o revisa con ver_archivos.'
      hallazgos.sort()
      return hallazgos.slice(0, 60).join('\n') + (hallazgos.length > 60 ? `\n…y ${hallazgos.length - 60} más` : '')
    }
    case 'ver_subidas': {
      const s = await leerSubidas()
      if (!s || !s.archivos.size) return 'No hay subidas pendientes. Andersson sube archivos en https://boscanymoni.com/mcp.'
      const lista = [...s.archivos].map(([p, x]) => `   ${p}  (${kb(x.size)})`).join('\n')
      return `Subidas pendientes (última: ${s.fecha.slice(0, 16).replace('T', ' ')} UTC):\n${lista}\n\nPublícalas con publicar_cambios usando {ruta, subida}.`
    }
    case 'enlace_de_subida': {
      const url = `${SITIO}/api/subir?token=${tokenSubida()}`
      return `Válido 1 hora. Por cada archivo (hasta 4 MB):\n\ncurl -sS -X POST -H 'Content-Type: application/octet-stream' --data-binary @ARCHIVO '${url}'\n\nResponde {"sha": "…", "bytes": …}. Ese sha va en publicar_cambios como {ruta, blob: "<sha>"}.\nSi el comando no llega a boscanymoni.com (sin salida a internet), entrégale a Andersson un .zip con los archivos y pídele que lo suba en ${SITIO}/mcp.`
    }
    case 'publicar_cambios': {
      const mensaje = String(a.mensaje ?? '').trim()
      if (!mensaje) throw new ErrorAmable('Falta el mensaje del cambio.')
      if (!Array.isArray(a.cambios) || !a.cambios.length) throw new ErrorAmable('No hay cambios.')
      const textos = new Map<string, string>()
      const blobs = new Map<string, string | null>() // null = borrar
      const usadas: string[] = []
      let subidas: Awaited<ReturnType<typeof leerSubidas>> | undefined
      const ponerBlob = (ruta: string, sha: string | null) => (textos.delete(ruta), blobs.set(ruta, sha))

      for (const c of a.cambios) {
        const ruta = limpiarRuta(c.ruta, true)
        if (c.borrar === true) {
          ponerBlob(ruta, null)
        } else if (typeof c.subida === 'string') {
          subidas ??= await leerSubidas()
          const origen = c.subida.trim().replace(/^\/+|\/+$/g, '')
          const todo = [...(subidas?.archivos.keys() ?? [])]
          const lista = subidas?.archivos.has(origen)
            ? [[ruta, origen]]
            : todo.filter((p) => !origen || p.startsWith(`${origen}/`)).map((p) => [`${ruta}/${p.slice(origen ? origen.length + 1 : 0)}`, p])
          if (!lista.length) throw new ErrorAmable(`No encuentro "${origen}" en las subidas. Revisa con ver_subidas.`)
          for (const [destino, p] of lista) {
            ponerBlob(limpiarRuta(destino, true), subidas!.archivos.get(p)!.sha)
            usadas.push(p)
          }
        } else if (typeof c.desde_url === 'string') {
          ponerBlob(ruta, await crearBlob(await descargar(c.desde_url)))
        } else if (typeof c.blob === 'string') {
          if (!/^[0-9a-f]{40}$/.test(c.blob)) throw new ErrorAmable(`En "${ruta}" el blob no es válido: usa el sha que devolvió la subida.`)
          ponerBlob(ruta, c.blob)
        } else if (typeof c.base64 === 'string') {
          ponerBlob(ruta, await crearBlob(Buffer.from(c.base64, 'base64')))
        } else if (BINARIO.test(ruta)) {
          throw new ErrorAmable(`"${ruta}" no es un archivo de texto: usa subida, desde_url, blob o base64.`)
        } else if (typeof c.contenido === 'string') {
          blobs.delete(ruta)
          textos.set(ruta, c.contenido)
        } else {
          if (typeof c.buscar !== 'string' || typeof c.reemplazar !== 'string')
            throw new ErrorAmable(`En "${ruta}" falta "contenido", o "buscar" y "reemplazar".`)
          const actual = textos.get(ruta) ?? (blobs.has(ruta) ? null : await leer(ruta))
          if (actual === null) throw new ErrorAmable(`No existe "${ruta}". Para crearlo usa "contenido".`)
          const veces = actual.split(c.buscar).length - 1
          if (veces !== 1)
            throw new ErrorAmable(`En "${ruta}" el texto a buscar aparece ${veces} veces; tiene que aparecer exactamente una. Vuelve a leer el archivo y usa un fragmento más largo.`)
          textos.set(ruta, actual.replace(c.buscar, () => c.reemplazar))
        }
      }

      // Páginas de periodismo: URLs bajo /periodismo/ y ajustes de letra,
      // también si llegaron como subida.
      for (const [ruta, sha] of blobs)
        if (sha && necesitaAjuste(ruta)) (blobs.delete(ruta), textos.set(ruta, await leerBlob(sha)))
      if ([...textos.keys()].some(necesitaAjuste)) {
        const v = versionesAjustes((await leer('public/periodismo/index.html')) ?? '')
        for (const [ruta, t] of textos) textos.set(ruta, ajustarPeriodismo(ruta, t, v))
      }

      const entradas: Entrada[] = [
        ...[...textos].map(([path, content]) => ({ path, content })),
        ...[...blobs].map(([path, sha]) => ({ path, sha })),
      ]
      let sha: string
      try {
        sha = await commit(mensaje, entradas)
      } catch (e) {
        if ((e as { status?: number }).status === 422)
          throw new ErrorAmable('GitHub rechazó el cambio: un archivo a borrar no existe o un blob no es válido. Revisa las rutas.')
        throw e
      }
      if (usadas.length) await quitarSubidas(usadas).catch(() => {})
      const nombres = entradas.map((e) => (e.sha === null ? `${e.path} (borrado)` : e.path))
      const resumen = nombres.length > 40 ? `${nombres.slice(0, 40).join(', ')} y ${nombres.length - 40} más` : nombres.join(', ')
      return `Guardado (${sha.slice(0, 7)}): ${resumen}.\nVercel lo está publicando; consulta estado_publicacion en ~1 minuto.`
    }
    case 'estado_publicacion': {
      const [st, log] = await Promise.all([
        gh(`/repos/${REPO}/commits/${RAMA}/status`),
        gh(`/repos/${REPO}/commits?sha=${RAMA}&per_page=5`),
      ])
      const vercel = (st.statuses as any[]).find((s) => /vercel/i.test(s.context))
      const estado = !vercel
        ? 'en proceso (Vercel todavía no empieza)'
        : vercel.state === 'success'
          ? `en línea ✓ — ${SITIO}`
          : vercel.state === 'pending'
            ? 'en proceso…'
            : `falló ✗ — el sitio sigue mostrando la versión anterior. ${vercel.description ?? ''}`
      const ultimos = (log as any[])
        .map((c) => `- ${c.sha.slice(0, 7)} · ${c.commit.author.date.slice(0, 16).replace('T', ' ')} UTC · ${c.commit.message.split('\n')[0]}`)
        .join('\n')
      return `Última publicación: ${estado}\n\nÚltimos cambios:\n${ultimos}`
    }
    case 'habilitar_pagina': {
      // vercel.json está bloqueado (puede cambiar el comando de build); aquí
      // solo se añade una palabra validada a la alternancia de rewrites.
      const ruta = String(a.ruta ?? '').trim().replace(/^\/+|\/+$/g, '')
      if (!/^[a-z0-9]+(-[a-z0-9]+)*$/.test(ruta) || ['api', 'assets', 'periodismo'].includes(ruta))
        throw new ErrorAmable('La ruta tiene que ser una palabra en minúsculas con guiones, p. ej. "eventos".')
      const vercel = (await leer('vercel.json'))!
      const re = /("source": "\/\()([a-z0-9|-]+)(\)",\s*"destination": "\/index\.html")/
      const m = vercel.match(re)
      if (!m) throw new ErrorAmable('No encontré la regla de páginas en vercel.json; avisa a Diego.')
      if (m[2].split('|').includes(ruta)) return `/${ruta} ya estaba habilitada.`
      const redirects = (await leer('public/_redirects'))!
      const lineaMcp = redirects.split('\n').find((l) => l.startsWith('/mcp ')) ?? ''
      const nuevaLinea = `/${ruta}`.padEnd(28) + '/index.html  200'
      const sha = await commit(`chore(hosting): habilita la ruta /${ruta}`, [
        { path: 'vercel.json', content: vercel.replace(re, `$1$2|${ruta}$3`) },
        { path: 'public/_redirects', content: lineaMcp ? redirects.replace(lineaMcp, `${lineaMcp}\n${nuevaLinea}`) : `${redirects.trimEnd()}\n${nuevaLinea}\n` },
      ])
      return `Ruta /${ruta} habilitada (${sha.slice(0, 7)}). Ya puede publicarse la página.`
    }
    case 'deshacer_ultima_publicacion': {
      const ref = await gh(`/repos/${REPO}/git/ref/heads/${RAMA}`)
      const cabeza = await gh(`/repos/${REPO}/git/commits/${ref.object.sha}`)
      const padre = await gh(`/repos/${REPO}/git/commits/${cabeza.parents[0].sha}`)
      const titulo = cabeza.message.split('\n')[0]
      const sha = await commit(`revert: ${titulo}`, null, padre.tree.sha)
      return `Deshecho "${titulo}" (${sha.slice(0, 7)}). Vercel está publicando la versión anterior; consulta estado_publicacion en ~1 minuto.`
    }
  }
  throw new ErrorAmable(`No conozco la herramienta "${nombre}".`)
}

// ── JSON-RPC ─────────────────────────────────────────────────────────────

type Mensaje = { jsonrpc: '2.0'; id?: string | number | null; method?: string; params?: any }

async function responder(m: Mensaje) {
  const ok = (result: unknown) => ({ jsonrpc: '2.0', id: m.id, result })
  switch (m.method) {
    case 'initialize':
      return ok({
        protocolVersion: m.params?.protocolVersion ?? VERSION_PROTOCOLO,
        capabilities: { tools: {} },
        serverInfo: { name: 'boscanymoni', title: 'Sitio boscanymoni.com', version: '1.0.0' },
        instructions: INSTRUCCIONES,
      })
    case 'ping':
      return ok({})
    case 'tools/list':
      return ok({ tools: HERRAMIENTAS })
    case 'tools/call':
      try {
        const texto = await ejecutar(m.params?.name, m.params?.arguments ?? {})
        return ok({ content: [{ type: 'text', text: texto }] })
      } catch (e) {
        const texto = e instanceof ErrorAmable ? e.message : `Error inesperado: ${(e as Error).message}`
        return ok({ content: [{ type: 'text', text: texto }], isError: true })
      }
    default:
      return { jsonrpc: '2.0', id: m.id, error: { code: -32601, message: `Método no soportado: ${m.method}` } }
  }
}

function claveValida(dada: unknown) {
  const real = process.env.MCP_CLAVE ?? ''
  const a = Buffer.from(String(dada ?? ''))
  const b = Buffer.from(real)
  return real.length >= 24 && a.length === b.length && timingSafeEqual(a, b)
}

export default async function handler(req: Req, res: Res) {
  res.setHeader('Cache-Control', 'no-store')
  if (!claveValida(req.query.clave)) return res.status(404).json({ error: 'No encontrado' })
  if (req.method !== 'POST') {
    res.setHeader('Allow', 'POST')
    return res.status(405).json({ error: 'Usa POST (MCP streamable HTTP sin SSE).' })
  }

  const cuerpo = typeof req.body === 'string' ? JSON.parse(req.body) : req.body
  const lote = Array.isArray(cuerpo) ? cuerpo : [cuerpo]
  const respuestas = (await Promise.all(
    lote.map((m: Mensaje) => (m && m.id !== undefined && m.method ? responder(m) : null)),
  )).filter(Boolean)

  if (!respuestas.length) return res.status(202).end()
  res.setHeader('Content-Type', 'application/json')
  return res.status(200).json(Array.isArray(cuerpo) ? respuestas : respuestas[0])
}
