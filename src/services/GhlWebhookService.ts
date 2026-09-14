/**
 * Envío a webhooks de GoHighLevel (contacto y oportunidad).
 * Son URLs externas (no pasan por APIBase). Nunca bloquean el flujo:
 * cualquier error se traga y se reporta como `false`.
 */

const CONTACT_URL     = import.meta.env.VITE_GHL_WEBHOOK_CONTACT as string | undefined
const OPPORTUNITY_URL = import.meta.env.VITE_GHL_WEBHOOK_OPPORTUNITY as string | undefined

async function post(url: string | undefined, payload: Record<string, unknown>): Promise<boolean> {
  if (!url || url.includes('PENDIENTE')) {
    if (import.meta.env.DEV) console.info('[GHL] webhook no configurado, payload:', payload)
    return false
  }
  try {
    const res = await fetch(url, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(payload),
    })
    return res.ok
  } catch {
    return false
  }
}

export const GhlWebhookService = {
  contact: (payload: Record<string, unknown>) => post(CONTACT_URL, {
    ...payload,
    page_url:  typeof window !== 'undefined' ? window.location.href : '',
    timestamp: new Date().toISOString(),
  }),
  opportunity: (payload: Record<string, unknown>) => post(OPPORTUNITY_URL, {
    ...payload,
    page_url:  typeof window !== 'undefined' ? window.location.href : '',
    timestamp: new Date().toISOString(),
  }),
}
