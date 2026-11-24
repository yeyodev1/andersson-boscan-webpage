// GET /api/tiktok/accounts  → cuentas vinculadas (SOLO metadata, nunca el token).
// Abierto a propósito: no revela secretos. El token para automatizar sale de
// access-token.ts, que exige TIKTOK_API_SECRET.
import { tiktokColl, type VReq, type VRes } from './_lib'

export default async function handler(req: VReq, res: VRes) {
  res.setHeader('Cache-Control', 'no-store')
  if (req.method !== 'GET') return res.status(405).json({ error: 'Usa GET' })

  try {
    const col = await tiktokColl()
    const docs = await col.find({}).toArray()
    const data = docs.map((d) => ({
      open_id: d.open_id,
      display_name: d.display_name,
      username: d.display_name, // user.info.basic no entrega username
      avatar_url: d.avatar_url,
      connected: true,
      access_expires_at: d.access_expires_at,
      refresh_expires_at: d.refresh_expires_at,
    }))
    return res.status(200).json({ success: true, data })
  } catch (e) {
    return res.status(500).json({ error: (e as Error)?.message ?? 'Error al leer cuentas' })
  }
}
