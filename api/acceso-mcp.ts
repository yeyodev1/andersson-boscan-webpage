// Verifica el código de la página /mcp y, si es correcto, entrega la URL del
// conector MCP. El código (MCP_CODIGO) y la clave del conector (MCP_CLAVE)
// viven solo en las variables de entorno de Vercel: el repo es público.
import { timingSafeEqual } from 'node:crypto'

type Req = { method?: string; body?: any }
type Res = {
  status(code: number): Res
  setHeader(name: string, value: string): void
  json(body: unknown): void
}

function iguales(a: string, b: string) {
  const x = Buffer.from(a)
  const y = Buffer.from(b)
  return x.length === y.length && timingSafeEqual(x, y)
}

export default async function handler(req: Req, res: Res) {
  res.setHeader('Cache-Control', 'no-store')
  if (req.method !== 'POST') return res.status(405).json({ error: 'Usa POST' })

  const codigo = String((typeof req.body === 'string' ? JSON.parse(req.body) : req.body)?.codigo ?? '').trim()
  const real = process.env.MCP_CODIGO ?? ''
  const clave = process.env.MCP_CLAVE ?? ''

  if (!real || !clave) return res.status(503).json({ error: 'El conector todavía no está configurado.' })
  if (!iguales(codigo, real)) {
    // Frena a quien pruebe códigos a ciegas.
    await new Promise((r) => setTimeout(r, 1500))
    return res.status(401).json({ error: 'Código incorrecto.' })
  }
  return res.status(200).json({ url: `https://boscanymoni.com/api/mcp/${clave}` })
}
