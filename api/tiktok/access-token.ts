// GET /api/tiktok/access-token[?open_id=...]
// Header obligatorio:  Authorization: Bearer <TIKTOK_API_SECRET>
//
// ESTE es el endpoint que usa la automatización: devuelve un access_token
// siempre fresco (lo refresca solo si venció). Sin open_id, usa la única cuenta.
import { authorized, freshAccessToken, tiktokColl, type VReq, type VRes } from './_lib'

export default async function handler(req: VReq, res: VRes) {
  res.setHeader('Cache-Control', 'no-store')
  if (req.method !== 'GET') return res.status(405).json({ error: 'Usa GET' })
  if (!authorized(req)) return res.status(401).json({ error: 'No autorizado' })

  try {
    let openId = String(req.query?.open_id ?? '').trim()
    if (!openId) {
      const first = await (await tiktokColl()).findOne({})
      if (!first) return res.status(404).json({ error: 'No hay cuentas vinculadas' })
      openId = first.open_id
    }
    const token = await freshAccessToken(openId)
    return res.status(200).json({ success: true, open_id: openId, access_token: token })
  } catch (e) {
    return res.status(502).json({ error: (e as Error)?.message ?? 'Error al obtener el token' })
  }
}
