// DELETE /api/tiktok/accounts/:openId  → desvincula una cuenta del panel.
// Solo borra la fila local (no revoca en TikTok); volver a vincular es inmediato.
import { tiktokColl, type VReq, type VRes } from '../_lib.js'

export default async function handler(req: VReq, res: VRes) {
  res.setHeader('Cache-Control', 'no-store')
  if (req.method !== 'DELETE') return res.status(405).json({ error: 'Usa DELETE' })

  const openId = String(req.query?.openId ?? '').trim()
  if (!openId) return res.status(400).json({ error: 'Falta openId' })

  try {
    const col = await tiktokColl()
    await col.deleteOne({ open_id: openId })
    return res.status(200).json({ success: true })
  } catch (e) {
    return res.status(500).json({ error: (e as Error)?.message ?? 'Error al eliminar' })
  }
}
