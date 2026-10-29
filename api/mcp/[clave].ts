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
import { timingSafeEqual } from 'node:crypto'

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

// Lo que el conector no puede tocar: la entrega de periodismo se sube con su
// propio flujo, y lo demás es infraestructura o el propio conector. Todo lo
// que corre en el build de Vercel (config de Vite, dependencias, vercel.json)
// queda fuera: ahí se leen las variables de entorno, incluido GITHUB_TOKEN.
const BLOQUEADAS = [
  'public/periodismo/', 'api/', '.github/', '.claude/', 'scripts/', 'node_modules/', 'dist/', '.env',
  'vite.config', 'package.json', 'pnpm-lock.yaml', 'pnpm-workspace.yaml', '.npmrc', 'tsconfig', 'vercel.json',
]

const INSTRUCCIONES = `Conector del sitio boscanymoni.com (Andersson Boscán y Mónica Velásquez). Quien lo usa es Andersson: no es programador. Háblale corto, en español y sin jerga.

Cómo trabajar:
1. Antes de cambiar algo, ubica el archivo (buscar_texto / ver_archivos) y léelo entero con leer_archivo. Nunca adivines el contenido.
2. Explica en 2-4 viñetas qué vas a cambiar, en palabras de lo que se ve en la página. Si ya dijo "publícalo" junto con el pedido, no vuelvas a preguntar.
3. publicar_cambios guarda todo en un solo paso y la web se actualiza sola en 1-2 minutos. Luego llama a estado_publicacion hasta que diga "en línea" o "falló", y dale el enlace exacto de la página.
4. Si falló: el sitio sigue mostrando la versión anterior (no se rompe nada). Lee el error probable, corrígelo con otro publicar_cambios o usa deshacer_ultima_publicacion.

Reglas del proyecto (Vue 3 + TypeScript + SCSS):
- Precios, productos y formatos de publicidad viven SOLO en src/config/catalogo.ts. Respuestas del chat de publicidad: src/config/respuestas.ts.
- Tamaños de letra siempre en rem, nunca px.
- No uses "ad", "ads", "publicidad", "banner" ni "sponsor" en nombres de archivo ni clases CSS (los bloqueadores de anuncios los cortan).
- Marca: "Boscán & La Moni" o "Andersson Boscán y Mónica Velásquez". Nunca "Andersson y Moni Boscán".
- Páginas nuevas (rutas nuevas) no se pueden crear desde aquí: necesitan vercel.json, que está bloqueado. Si lo pide, dile que se lo pida a Diego.
- El sitio de investigaciones (public/periodismo/) no se edita aquí: Andersson lo genera con build.py y lo sube aparte. Si pide corregir una investigación, díselo.
- Archivos bloqueados para este conector: ${BLOQUEADAS.join(', ')}.
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
    description: 'Busca un texto en el código del sitio (p. ej. una frase que se ve en la página), sin distinguir mayúsculas, y devuelve archivo, número de línea y la línea. No busca dentro de public/periodismo/.',
    inputSchema: { type: 'object', properties: { texto: { type: 'string' } }, required: ['texto'] },
    annotations: { readOnlyHint: true },
  },
  {
    name: 'publicar_cambios',
    description: 'Guarda uno o varios cambios en un solo paso y los publica en boscanymoni.com (tarda 1-2 min). Cada cambio es: {ruta, buscar, reemplazar} para cambiar un fragmento exacto (debe aparecer una sola vez), o {ruta, contenido} para escribir el archivo completo o crear uno nuevo.',
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

async function commit(mensaje: string, archivos: { path: string; content: string }[] | null, arbol?: string) {
  // Hasta 3 intentos por si otro cambio entró a main entre medio.
  for (let intento = 0; ; intento++) {
    const ref = await gh(`/repos/${REPO}/git/ref/heads/${RAMA}`)
    const cabeza = await gh(`/repos/${REPO}/git/commits/${ref.object.sha}`)
    const tree = arbol ?? (await gh(`/repos/${REPO}/git/trees`, {
      method: 'POST',
      body: JSON.stringify({
        base_tree: cabeza.tree.sha,
        tree: archivos!.map((a) => ({ path: a.path, mode: '100644', type: 'blob', content: a.content })),
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

// ── Herramientas ─────────────────────────────────────────────────────────

async function ejecutar(nombre: string, a: Record<string, any>): Promise<string> {
  switch (nombre) {
    case 'ver_archivos': {
      const ruta = limpiarRuta(a.ruta)
      const d = await gh(`/repos/${REPO}/contents/${rutaApi(ruta)}?ref=${RAMA}`)
      if (!Array.isArray(d)) return `"${ruta}" es un archivo: usa leer_archivo.`
      return d.map((x: any) => (x.type === 'dir' ? `📁 ${x.path}/` : `   ${x.path}`)).join('\n')
    }
    case 'leer_archivo': {
      const ruta = limpiarRuta(a.ruta)
      const t = await leer(ruta)
      if (t === null) return `No existe "${ruta}".`
      return t.length > 200_000 ? t.slice(0, 200_000) + '\n…(recortado)' : t
    }
    case 'buscar_texto': {
      // GitHub no indexa este repo para su búsqueda de código: se recorre el
      // árbol y se leen los archivos de texto (~75, <1 MB) desde raw.
      const texto = String(a.texto ?? '').toLowerCase()
      if (!texto) throw new ErrorAmable('Falta el texto a buscar.')
      const ref = await gh(`/repos/${REPO}/git/ref/heads/${RAMA}`)
      const arbol = await gh(`/repos/${REPO}/git/trees/${ref.object.sha}?recursive=1`)
      const rutas = (arbol.tree as any[])
        .filter((x) => x.type === 'blob' && x.size < 300_000)
        .map((x) => x.path as string)
        .filter((p) => !p.startsWith('public/periodismo/') && !p.startsWith('pnpm-lock'))
        .filter((p) => /\.(vue|ts|js|scss|css|html|md|txt|json|xml)$/.test(p))
      const hallazgos: string[] = []
      await Promise.all(rutas.map(async (p) => {
        const r = await fetch(`https://raw.githubusercontent.com/${REPO}/${ref.object.sha}/${rutaApi(p)}`, {
          headers: { Authorization: `Bearer ${process.env.GITHUB_TOKEN}` },
        })
        if (!r.ok) return
        ;(await r.text()).split('\n').forEach((linea, i) => {
          if (linea.toLowerCase().includes(texto)) hallazgos.push(`${p}:${i + 1}: ${linea.trim().slice(0, 160)}`)
        })
      }))
      if (!hallazgos.length) return 'Sin resultados. Prueba con un fragmento más corto o revisa con ver_archivos.'
      hallazgos.sort()
      return hallazgos.slice(0, 60).join('\n') + (hallazgos.length > 60 ? `\n…y ${hallazgos.length - 60} más` : '')
    }
    case 'publicar_cambios': {
      const mensaje = String(a.mensaje ?? '').trim()
      if (!mensaje) throw new ErrorAmable('Falta el mensaje del cambio.')
      if (!Array.isArray(a.cambios) || !a.cambios.length) throw new ErrorAmable('No hay cambios.')
      const archivos = new Map<string, string>()
      for (const c of a.cambios) {
        const ruta = limpiarRuta(c.ruta, true)
        if (typeof c.contenido === 'string') {
          archivos.set(ruta, c.contenido)
          continue
        }
        if (typeof c.buscar !== 'string' || typeof c.reemplazar !== 'string')
          throw new ErrorAmable(`En "${ruta}" falta "contenido", o "buscar" y "reemplazar".`)
        const actual = archivos.get(ruta) ?? (await leer(ruta))
        if (actual === null) throw new ErrorAmable(`No existe "${ruta}". Para crearlo usa "contenido".`)
        const veces = actual.split(c.buscar).length - 1
        if (veces !== 1)
          throw new ErrorAmable(`En "${ruta}" el texto a buscar aparece ${veces} veces; tiene que aparecer exactamente una. Vuelve a leer el archivo y usa un fragmento más largo.`)
        archivos.set(ruta, actual.replace(c.buscar, () => c.reemplazar))
      }
      const sha = await commit(mensaje, [...archivos].map(([path, content]) => ({ path, content })))
      return `Guardado (${sha.slice(0, 7)}): ${[...archivos.keys()].join(', ')}.\nVercel lo está publicando; consulta estado_publicacion en ~1 minuto.`
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
