import { ref, computed, watch } from 'vue'
import {
  AD_BUDGETS, AD_CATEGORIES, AD_RULES, recommendProducts,
  type AdGoal, type AdDuration, type AdProduct, type BrandSafety,
} from '@/config/adProducts'
import { GhlWebhookService } from '@/services/GhlWebhookService'

export type Lane = 'A' | 'B' | 'C'   // A autoservicio · B asistida asincrónica · C cuenta estratégica
export type DecisionPower = 'decision_maker' | 'co_decision_maker' | 'influencer' | ''
export type ExclusivityConflict = 'none' | 'possible' | 'unknown' | ''
export type FunnelStage = 'hero' | 'goal' | 'duration' | 'details' | 'result' | 'checkout' | 'briefing' | 'done'

export interface FunnelState {
  stage: FunnelStage
  goal: AdGoal | ''
  duration: AdDuration | 0
  brand: string
  website: string
  category: string
  country: string
  start_date: string
  budget: string
  role: string
  decision_power: DecisionPower
  exclusivity_conflict: ExclusivityConflict
  special_notes: string
  selected_product: string
  // contacto
  first_name: string
  last_name: string
  email: string
  phone: string
  accepted_terms: boolean
  // briefing
  brief_message: string
  brief_assets: string
  brief_notes: string
  // resultado del envío
  submitted_lane: Lane | ''
}

const STORAGE_KEY = 'ad_funnel_state'
const CONTACT_KEY = 'mk_contact_given'
/** Llave del candado del calendario: solo el carril C la escribe (ver AgendarView) */
export const ZOOM_KEY = 'ad_zoom_unlocked'
/** Etapas ya empujadas a GHL, para no repetirlas en cada paso */
const STAGE_KEY = 'ad_stage_sent'

const defaults = (): FunnelState => ({
  stage: 'hero',
  goal: '', duration: 0,
  brand: '', website: '', category: '', country: 'Ecuador', start_date: '', budget: '',
  role: '', decision_power: '', exclusivity_conflict: '', special_notes: '',
  selected_product: '',
  first_name: '', last_name: '', email: '', phone: '',
  accepted_terms: false,
  brief_message: '', brief_assets: '', brief_notes: '',
  submitted_lane: '',
})

function load(): FunnelState {
  try {
    const raw = localStorage.getItem(STORAGE_KEY)
    if (raw) return { ...defaults(), ...JSON.parse(raw) }
  } catch { /* ignore */ }
  const s = defaults()
  try {
    const c = localStorage.getItem(CONTACT_KEY)
    if (c) {
      const d = JSON.parse(c)
      s.first_name = d.nombre ?? ''
      s.last_name  = d.apellido ?? ''
      s.email      = d.correo ?? ''
      s.phone      = d.telefono ?? ''
    }
  } catch { /* ignore */ }
  return s
}

// Singleton: el estado sobrevive a la apertura/cierre del chat y a recargas.
const state = ref<FunnelState>(load())
const sending = ref(false)
const sendError = ref('')

watch(state, (v) => {
  try { localStorage.setItem(STORAGE_KEY, JSON.stringify(v)) } catch { /* ignore */ }
}, { deep: true })

// ── Analítica (handoff v3 §11) ────────────────────────────────
export function trackAdEvent(event: string, payload: Record<string, unknown> = {}) {
  const w = window as unknown as { dataLayer?: Record<string, unknown>[] }
  w.dataLayer = w.dataLayer ?? []
  w.dataLayer.push({ event, ...payload, ts: Date.now() })
  if (import.meta.env.DEV) console.debug('[ad-event]', event, payload)
}

export function useAdFunnel() {
  const monthlyBudget = computed(() =>
    AD_BUDGETS.find(b => b.value === state.value.budget)?.monthly ?? 0)

  const brandSafety = computed<BrandSafety>(() =>
    AD_CATEGORIES.find(c => c.value === state.value.category)?.brand_safety ?? 'manual_review')

  const recommendations = computed<AdProduct[]>(() => {
    if (!state.value.goal || !state.value.duration) return []
    return recommendProducts(state.value.goal, state.value.duration, monthlyBudget.value)
  })

  const selectedProduct = computed<AdProduct | null>(() =>
    recommendations.value.find(p => p.product_id === state.value.selected_product)
    ?? recommendations.value[0] ?? null)

  const contractValue = computed(() => {
    const p = selectedProduct.value
    if (!p || p.price === null) return 0
    if (p.price_unit === 'mes') return p.price * (state.value.duration || 1)
    return p.price
  })

  /** Regla del calendario (handoff v3 §6) */
  const calendarAccess = computed(() =>
    monthlyBudget.value >= AD_RULES.strategic_monthly_budget &&
    (state.value.duration || 0) >= AD_RULES.strategic_min_months &&
    brandSafety.value === 'approved' &&
    ['decision_maker', 'co_decision_maker'].includes(state.value.decision_power))

  const lane = computed<Lane>(() => {
    if (calendarAccess.value) return 'C'
    if ((state.value.duration || 0) >= 6) return 'B'
    return 'A'
  })

  const needsManualReview = computed(() => brandSafety.value !== 'approved')

  const questionPriority = computed(() => lane.value === 'C' ? 1 : lane.value === 'B' ? 2 : 3)

  /**
   * Empuja la etapa del pipeline a GHL en cuanto se conoce el correo, con dedupe.
   * Sin este push temprano GHL no puede recordar carritos abandonados: el tag
   * `checkout-abandonado` lo aplica un workflow sobre las oportunidades que se
   * quedan en "Checkout iniciado".
   */
  async function syncStage(stage: string, tags: string[] = []): Promise<boolean> {
    const s = state.value
    if (!s.email) return false
    let sent: string[] = []
    try { sent = JSON.parse(localStorage.getItem(STAGE_KEY) || '[]') } catch { /* ignore */ }
    if (sent.includes(stage)) return false

    const ok = await GhlWebhookService.opportunity({
      ...basePayload(),
      opportunityName: `${s.brand || s.first_name} — ${selectedProduct.value?.name ?? 'Publicidad'} · ${s.duration || '?'}m`,
      pipelineName: lane.value === 'C' ? AD_RULES.pipeline_strategic : AD_RULES.pipeline_name,
      pipelineStage: stage,
      opportunityStatus: 'open',
      monetaryValue: contractValue.value,
      tags,
      ad_checkout_status: 'in_progress',
    })
    try { localStorage.setItem(STAGE_KEY, JSON.stringify([...sent, stage])) } catch { /* ignore */ }
    return ok
  }

  function go(stage: FunnelStage) {
    state.value.stage = stage
    if (stage === 'goal') {
      trackAdEvent('ad_funnel_started')
      syncStage('Configurador iniciado')
    }
    if (stage === 'result') {
      trackAdEvent('ad_recommendation_viewed', { products: recommendations.value.map(p => p.product_id), lane: lane.value })
      syncStage('Recomendación generada')
    }
    if (stage === 'checkout') {
      trackAdEvent(lane.value === 'A' ? 'ad_checkout_started' : 'ad_proposal_requested', { lane: lane.value })
      syncStage('Checkout iniciado / propuesta enviada')
    }
  }

  function reset() {
    state.value = defaults()
    try {
      localStorage.removeItem(STAGE_KEY)
      localStorage.removeItem(ZOOM_KEY)
    } catch { /* ignore */ }
  }

  function saveContact() {
    try {
      localStorage.setItem(CONTACT_KEY, JSON.stringify({
        nombre: state.value.first_name, apellido: state.value.last_name,
        correo: state.value.email, telefono: state.value.phone,
      }))
    } catch { /* ignore */ }
  }

  function basePayload() {
    const s = state.value
    const p = selectedProduct.value
    return {
      firstName: s.first_name, lastName: s.last_name, email: s.email, phone: s.phone,
      empresa: s.brand,
      ad_goal: s.goal,
      ad_product: p?.product_id ?? '',
      ad_product_name: p?.name ?? '',
      ad_monthly_budget: monthlyBudget.value,
      ad_duration_months: s.duration,
      ad_contract_value: contractValue.value,
      ad_start_date: s.start_date,
      ad_category: s.category,
      ad_country: s.country,
      ad_website: s.website,
      ad_role: s.role,
      ad_decision_power: s.decision_power,
      ad_brand_safety: brandSafety.value,
      ad_exclusivity_conflict: s.exclusivity_conflict || 'unknown',
      ad_zoom_eligible: calendarAccess.value,
      ad_lane: lane.value,
      ad_special_notes: s.special_notes,
      source: 'Publicidad Boscán & La Moni — web',
    }
  }

  /** Envía la compra (A), propuesta (B) o precalificación (C) a GHL */
  async function submitCheckout(): Promise<boolean> {
    sendError.value = ''
    sending.value = true
    saveContact()
    const l = lane.value
    const s = state.value
    const tags = [
      l === 'A' ? 'publicidad-self-serve' : s.duration === 12 ? 'publicidad-12m' : 'publicidad-6m',
      ...(l === 'C' ? ['publicidad-key-account', 'zoom-desbloqueado'] : []),
      ...(needsManualReview.value ? ['brand-safety-revision'] : []),
    ]
    const stage = l === 'A'
      ? (needsManualReview.value ? 'Pregunta pendiente' : 'Pago pendiente')
      : l === 'B' ? 'Checkout iniciado / propuesta enviada' : 'Preguntas / precalificación completa'

    const ok = await GhlWebhookService.opportunity({
      ...basePayload(),
      opportunityName: `${s.brand || s.first_name} — ${selectedProduct.value?.name ?? 'Publicidad'} · ${s.duration}m`,
      pipelineName: l === 'C' ? AD_RULES.pipeline_strategic : AD_RULES.pipeline_name,
      pipelineStage: stage,
      opportunityStatus: 'open',
      monetaryValue: contractValue.value,
      tags,
      ad_checkout_status: l === 'A' ? 'payment_pending' : l === 'B' ? 'proposal_requested' : 'zoom_unlocked',
      ad_human_review_required: l !== 'A' || needsManualReview.value,
      ad_question_priority: questionPriority.value,
      lead_summary: [
        `📢 PUBLICIDAD — carril ${l}`,
        `Marca: ${s.brand} (${s.website || 'sin web'})`,
        `Objetivo: ${s.goal} · Duración: ${s.duration} mes(es)`,
        `Producto: ${selectedProduct.value?.name ?? '-'} · ${contractValue.value ? 'USD ' + contractValue.value : 'consultar'}`,
        `Presupuesto: ${monthlyBudget.value}/mes · Categoría: ${s.category} (${brandSafety.value})`,
        `País: ${s.country} · Inicio: ${s.start_date || '-'}`,
        `Cargo: ${s.role || '-'} · Decide: ${s.decision_power || '-'}`,
        `Notas: ${s.special_notes || '-'}`,
      ].join('\n'),
    })
    sending.value = false
    if (!ok && import.meta.env.PROD) {
      // No bloquear al cliente: registramos y seguimos.
      sendError.value = ''
    }
    s.submitted_lane = l
    syncZoomKey()
    trackAdEvent(l === 'A' ? 'ad_purchase_completed' : l === 'B' ? 'ad_proposal_requested' : 'ad_zoom_unlocked', { lane: l, value: contractValue.value })
    return true
  }

  /** El carril C deja la llave del calendario; los demás la quitan */
  function syncZoomKey() {
    try {
      if (calendarAccess.value) localStorage.setItem(ZOOM_KEY, '1')
      else localStorage.removeItem(ZOOM_KEY)
    } catch { /* ignore */ }
  }

  /** Briefing post-compra (carril A) */
  async function submitBriefing(): Promise<boolean> {
    sending.value = true
    const s = state.value
    await GhlWebhookService.opportunity({
      ...basePayload(),
      pipelineName: AD_RULES.pipeline_name,
      pipelineStage: 'Briefing completo',
      tags: ['publicidad-self-serve', 'briefing-completo'],
      ad_checkout_status: 'briefing_complete',
      brief_message: s.brief_message,
      brief_assets: s.brief_assets,
      brief_notes: s.brief_notes,
      lead_summary: [
        `📝 BRIEFING — ${s.brand}`,
        `Mensaje clave: ${s.brief_message}`,
        `Assets: ${s.brief_assets || '-'}`,
        `Notas: ${s.brief_notes || '-'}`,
      ].join('\n'),
    })
    sending.value = false
    return true
  }

  /** Query string para /agendar con todo lo ya recogido */
  const agendarQuery = computed(() => {
    const s = state.value
    const q = new URLSearchParams({
      firstName: s.first_name, lastName: s.last_name, email: s.email, phone: s.phone,
    })
    return q.toString()
  })

  /** Resumen del contexto para adjuntar en preguntas del chat */
  function contextSummary() {
    const s = state.value
    return {
      ad_funnel_stage: s.stage,
      ad_product: selectedProduct.value?.product_id ?? '',
      ad_monthly_budget: monthlyBudget.value,
      ad_duration_months: s.duration,
      ad_goal: s.goal,
      ad_lane: lane.value,
      ad_question_priority: questionPriority.value,
      empresa: s.brand,
      firstName: s.first_name, lastName: s.last_name, email: s.email, phone: s.phone,
    }
  }

  return {
    state, sending, sendError,
    monthlyBudget, brandSafety, recommendations, selectedProduct, contractValue,
    calendarAccess, lane, needsManualReview, questionPriority, agendarQuery,
    go, reset, saveContact, syncStage, submitCheckout, submitBriefing, contextSummary,
  }
}
