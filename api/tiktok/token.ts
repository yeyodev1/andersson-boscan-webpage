// POST /api/tiktok/token  { code, redirect_uri }
// Intercambia el code del OAuth de TikTok y guarda la cuenta (con refresh_token).
// Solo recibe el code: el client_secret vive en el backend, nunca en el navegador.
import { exchangeCode, parseBody, type VReq, type VRes } from './_lib'

export default async function handler(req: VReq, res: VRes) {
  res.setHeader('Cache-Control', 'no-store')
  if (req.method !== 'POST') return res.status(405).json({ error: 'Usa POST' })

  const body = parseBody(req.body)
  const code = String(body.code ?? '').trim()
  const redirectUri = String(body.redirect_uri ?? '').trim()
  if (!code || !redirectUri) return res.status(400).json({ error: 'Faltan code o redirect_uri' })

  try {
    const r = await exchangeCode(code, redirectUri)
    return res.status(200).json({ success: true, ...r })
  } catch (e) {
    return res.status(502).json({ error: (e as Error)?.message ?? 'Error al vincular la cuenta' })
  }
}
