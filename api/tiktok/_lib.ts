// Núcleo del backend de TikTok (Content Posting API oficial).
//
// Qué resuelve: el panel /integraciones autoriza la cuenta por OAuth; aquí se
// intercambia el `code` por tokens, se GUARDA el refresh_token y se renueva el
// access_token solo cuando hace falta. Así la automatización nunca usa un token
// vencido ni la cookie de sesión del navegador.
//
// Seguridad: el repo es PÚBLICO. client_secret, MONGODB_URI y TIKTOK_API_SECRET
// viven SOLO en variables de entorno de Vercel. El access_token nunca se expone
// a un endpoint abierto: lo entrega access-token.ts tras validar TIKTOK_API_SECRET.
import { MongoClient, type Collection } from 'mongodb'
import { timingSafeEqual } from 'node:crypto'

const OAUTH_URL = 'https://open.tiktokapis.com/v2/oauth/token/'
// user.info.basic da open_id, display_name y avatar; `username` exige el scope
// user.info.profile (no pedido), así que puede venir vacío.
const USERINFO_URL =
  'https://open.tiktokapis.com/v2/user/info/?fields=open_id,union_id,avatar_url,display_name'
const DB_NAME = 'andersson'
const COLL = 'tiktok_accounts'

export interface TiktokDoc {
  open_id: string
  union_id?: string
  display_name?: string
  avatar_url?: string
  access_token: string
  refresh_token: string
  access_expires_at: number // epoch ms
  refresh_expires_at: number // epoch ms
  scope?: string
  updated_at: number
}

// Tipos mínimos del handler de Vercel (sin @vercel/node, igual que el resto de api/).
export interface VReq {
  method?: string
  body?: unknown
  query?: Record<string, string | string[] | undefined>
  headers: Record<string, string | string[] | undefined>
}
export interface VRes {
  status(code: number): VRes
  setHeader(name: string, value: string): void
  json(body: unknown): void
}

// --- Mongo: conexión reutilizada entre invocaciones (patrón serverless) ---
export async function tiktokColl(): Promise<Collection<TiktokDoc>> {
  const uri = process.env.MONGODB_URI
  if (!uri) throw new Error('MONGODB_URI no está configurado en Vercel')
  const g = globalThis as unknown as { __tiktokMongo?: Promise<MongoClient> }
  if (!g.__tiktokMongo) g.__tiktokMongo = new MongoClient(uri).connect()
  const client = await g.__tiktokMongo
  return client.db(DB_NAME).collection<TiktokDoc>(COLL)
}

// Pura: ¿el token vence dentro de `skewMs`? (auto-verificada en _lib.selfcheck.mjs)
export function isExpired(expiresAt: number, skewMs = 120_000): boolean {
  return Date.now() + skewMs >= expiresAt
}

interface TokenResp {
  access_token: string
  refresh_token: string
  expires_in: number
  refresh_expires_in: number
  open_id: string
  scope?: string
  error?: string
  error_description?: string
}

async function callOAuth(extra: Record<string, string>): Promise<TokenResp> {
  const key = process.env.TIKTOK_CLIENT_KEY ?? ''
  const secret = process.env.TIKTOK_CLIENT_SECRET ?? ''
  if (!key || !secret) throw new Error('TIKTOK_CLIENT_KEY / TIKTOK_CLIENT_SECRET no configurados en Vercel')
  const r = await fetch(OAUTH_URL, {
    method: 'POST',
    headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
    body: new URLSearchParams({ client_key: key, client_secret: secret, ...extra }).toString(),
  })
  const d = (await r.json().catch(() => ({}))) as TokenResp
  if (!r.ok || d.error) throw new Error(`TikTok OAuth ${r.status}: ${d.error ?? ''} ${d.error_description ?? ''}`.trim())
  return d
}

// Campos de token+vencimiento a guardar en cada intercambio/refresco.
function tokenFields(t: TokenResp): Partial<TiktokDoc> {
  const now = Date.now()
  return {
    access_token: t.access_token,
    refresh_token: t.refresh_token,
    access_expires_at: now + t.expires_in * 1000,
    refresh_expires_at: now + t.refresh_expires_in * 1000,
    scope: t.scope,
    updated_at: now,
  }
}

async function getUserInfo(accessToken: string): Promise<Partial<TiktokDoc>> {
  try {
    const r = await fetch(USERINFO_URL, { headers: { Authorization: `Bearer ${accessToken}` } })
    const d = (await r.json().catch(() => ({}))) as { data?: { user?: Record<string, string> } }
    const u = d?.data?.user ?? {}
    return { union_id: u.union_id, display_name: u.display_name, avatar_url: u.avatar_url }
  } catch {
    return {}
  }
}

// Intercambia el `code` del OAuth y hace upsert de la cuenta. Devuelve metadata (sin token).
export async function exchangeCode(code: string, redirectUri: string) {
  const t = await callOAuth({ code, grant_type: 'authorization_code', redirect_uri: redirectUri })
  const profile = await getUserInfo(t.access_token)
  const col = await tiktokColl()
  await col.updateOne(
    { open_id: t.open_id },
    { $set: { open_id: t.open_id, ...profile, ...tokenFields(t) } },
    { upsert: true },
  )
  return { open_id: t.open_id, display_name: profile.display_name }
}

// Devuelve un access_token VÁLIDO, refrescándolo con el refresh_token si venció.
export async function freshAccessToken(openId: string): Promise<string> {
  const col = await tiktokColl()
  const acc = await col.findOne({ open_id: openId })
  if (!acc) throw new Error('Cuenta no vinculada')
  if (!isExpired(acc.access_expires_at)) return acc.access_token
  if (isExpired(acc.refresh_expires_at, 0)) {
    throw new Error('refresh_token vencido: reconectar la cuenta en /integraciones')
  }
  const t = await callOAuth({ grant_type: 'refresh_token', refresh_token: acc.refresh_token })
  await col.updateOne({ open_id: openId }, { $set: tokenFields(t) })
  return t.access_token
}

// Guardia del secreto: solo pasa quien manda `Authorization: Bearer <TIKTOK_API_SECRET>`.
export function authorized(req: VReq): boolean {
  const secret = process.env.TIKTOK_API_SECRET ?? ''
  if (!secret) return false
  const raw = req.headers['authorization']
  const got = (Array.isArray(raw) ? raw[0] : raw ?? '').replace(/^Bearer\s+/i, '')
  const a = Buffer.from(got)
  const b = Buffer.from(secret)
  return a.length === b.length && timingSafeEqual(a, b)
}

export function parseBody(body: unknown): Record<string, unknown> {
  if (typeof body === 'string') {
    try {
      return JSON.parse(body || '{}')
    } catch {
      return {}
    }
  }
  return (body as Record<string, unknown>) ?? {}
}
