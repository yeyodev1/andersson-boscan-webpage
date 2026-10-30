// Recibe archivos (fotos, audios, CSS, HTML…) para el conector MCP: Claude no
// puede mandar bytes por una herramienta, así que entran por aquí.
//
// Dos pasos, sin publicar nada:
//  1. POST con el archivo crudo → se guarda como blob
//     de git en el repo y se devuelve su sha.
//  2. POST JSON {archivos: [{ruta, sha}]} → se anotan en refs/subidas/pendientes,
//     una referencia fuera de las ramas: no despliega ni sale en GitHub. De ahí
//     los toma el conector (ver_subidas, publicar_cambios con "subida").
// Autoriza el código de /mcp (cabecera x-codigo) o el token temporal de la
// herramienta enlace_de_subida (?token=), para subir desde el sandbox de Claude
// (ahí basta el paso 1: el conector acepta el sha directo).
// Tope: 4.5 MB por petición (Vercel). Los videos van a YouTube.
import { createHmac, timingSafeEqual } from 'node:crypto'

type Req = AsyncIterable<Buffer> & {
  method?: string
  headers: Record<string, string | string[] | undefined>
  query: Record<string, string | string[] | undefined>
  body?: any
}
type Res = {
  status(code: number): Res
  setHeader(name: string, value: string): void
  json(body: unknown): void
}

const REPO = 'yeyodev1/andersson-boscan-webpage'
const REF_SUBIDAS = 'subidas/pendientes'
const MAX_BYTES = 4_400_000

async function gh(ruta: string, init: RequestInit = {}) {
  const r = await fetch(`https://api.github.com${ruta}`, {
    ...init,
    headers: {
      Authorization: `Bearer ${process.env.GITHUB_TOKEN}`,
      Accept: 'application/vnd.github+json',
      'X-GitHub-Api-Version': '2022-11-28',
      'User-Agent': 'boscanymoni-subidas',
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

function iguales(a: string, b: string) {
  const x = Buffer.from(a)
  const y = Buffer.from(b)
  return x.length === y.length && timingSafeEqual(x, y)
}

// Misma firma que tokenSubida() en api/mcp/[clave].ts: "<vence>.<hmac>".
const firma = (exp: string) =>
  createHmac('sha256', process.env.MCP_CLAVE ?? '').update(`subir:${exp}`).digest('base64url')

function autorizado(req: Req) {
  const codigo = String(req.headers['x-codigo'] ?? '').trim()
  if (codigo && process.env.MCP_CODIGO) return iguales(codigo, process.env.MCP_CODIGO)
  const [exp, f] = String(req.query.token ?? '').split('.')
  return !!exp && !!f && Number(exp) > Date.now() && (process.env.MCP_CLAVE ?? '').length >= 24 && iguales(f, firma(exp))
}

// Ruta relativa dentro de las subidas: sin "..", sin barra inicial.
function rutaSubida(ruta: unknown) {
  const r = String(ruta ?? '').trim().replace(/\\/g, '/').replace(/^\/+/, '')
  const partes = r.split('/')
  if (!r || r.length > 300 || partes.some((p) => !p || p === '.' || p === '..')) return null
  return r
}

export default async function handler(req: Req, res: Res) {
  res.setHeader('Cache-Control', 'no-store')
  if (req.method !== 'POST') return res.status(405).json({ error: 'Usa POST' })
  if (!process.env.GITHUB_TOKEN || !process.env.MCP_CLAVE)
    return res.status(503).json({ error: 'La subida todavía no está configurada.' })
  if (!autorizado(req)) {
    await new Promise((r) => setTimeout(r, 1500))
    return res.status(401).json({ error: 'Código incorrecto o enlace vencido.' })
  }

  try {
    const tipo = String(req.headers['content-type'] ?? '')

    // Paso 2: anotar en las subidas pendientes.
    if (tipo.includes('application/json')) {
      const cuerpo = typeof req.body === 'string' ? JSON.parse(req.body) : req.body
      const archivos = (Array.isArray(cuerpo?.archivos) ? cuerpo.archivos : [])
        .map((a: any) => ({ path: rutaSubida(a?.ruta), sha: String(a?.sha ?? '') }))
      if (!archivos.length || archivos.some((a: any) => !a.path || !/^[0-9a-f]{40}$/.test(a.sha)))
        return res.status(400).json({ error: 'Lista de archivos no válida.' })

      for (let intento = 0; ; intento++) {
        let previo: any = null
        try {
          const ref = await gh(`/repos/${REPO}/git/ref/${REF_SUBIDAS}`)
          previo = await gh(`/repos/${REPO}/git/commits/${ref.object.sha}`)
        } catch (e) {
          if ((e as { status?: number }).status !== 404) throw e
        }
        const tree = await gh(`/repos/${REPO}/git/trees`, {
          method: 'POST',
          body: JSON.stringify({
            ...(previo ? { base_tree: previo.tree.sha } : {}),
            tree: archivos.map((a: any) => ({ path: a.path, mode: '100644', type: 'blob', sha: a.sha })),
          }),
        })
        const commit = await gh(`/repos/${REPO}/git/commits`, {
          method: 'POST',
          body: JSON.stringify({ message: `subida: ${archivos.length} archivo(s)`, tree: tree.sha, parents: previo ? [previo.sha] : [] }),
        })
        try {
          if (previo) await gh(`/repos/${REPO}/git/refs/${REF_SUBIDAS}`, { method: 'PATCH', body: JSON.stringify({ sha: commit.sha, force: true }) })
          else await gh(`/repos/${REPO}/git/refs`, { method: 'POST', body: JSON.stringify({ ref: `refs/${REF_SUBIDAS}`, sha: commit.sha }) })
          return res.status(200).json({ ok: true, archivos: archivos.map((a: any) => a.path) })
        } catch (e) {
          if ((e as { status?: number }).status !== 422 || intento >= 2) throw e
        }
      }
    }

    // Paso 1: el archivo crudo.
    const trozos: Buffer[] = []
    let total = 0
    for await (const t of req) {
      total += t.length
      if (total > MAX_BYTES) return res.status(413).json({ error: 'El archivo pesa más de 4 MB.' })
      trozos.push(t)
    }
    if (!total) return res.status(400).json({ error: 'El archivo llegó vacío.' })
    const blob = await gh(`/repos/${REPO}/git/blobs`, {
      method: 'POST',
      body: JSON.stringify({ content: Buffer.concat(trozos).toString('base64'), encoding: 'base64' }),
    })
    return res.status(200).json({ sha: blob.sha, bytes: total })
  } catch (e) {
    const status = (e as { status?: number }).status
    const limite = status === 403 || status === 429
    return res.status(limite ? 429 : 502).json({
      error: limite ? 'GitHub pidió una pausa. Espera un minuto y vuelve a intentar.' : 'No se pudo guardar el archivo.',
    })
  }
}
