import { ref, watch } from 'vue'
import { findAnswer, AD_ESCALATION_MESSAGE, AD_KNOWLEDGE } from '@/config/adKnowledge'
import { GhlWebhookService } from '@/services/GhlWebhookService'
import { useAdFunnel, trackAdEvent } from '@/composables/useAdFunnel'

export interface ChatMessage {
  role: 'user' | 'assistant' | 'system'
  text: string
  ts: number
  /** El asistente no supo responder: muestra el formulario de escalamiento */
  escalate?: boolean
}

const STORAGE_KEY = 'ad_chat'

const isOpen   = ref(false)
const messages = ref<ChatMessage[]>([])
const escalating = ref(false)
const escalated  = ref(false)
const sending    = ref(false)

try {
  const raw = localStorage.getItem(STORAGE_KEY)
  if (raw) {
    const d = JSON.parse(raw)
    messages.value = d.messages ?? []
    escalated.value = !!d.escalated
  }
} catch { /* ignore */ }

watch([messages, escalated], () => {
  try { localStorage.setItem(STORAGE_KEY, JSON.stringify({ messages: messages.value, escalated: escalated.value })) } catch { /* ignore */ }
}, { deep: true })

const WELCOME = 'Hola. Respondo al instante sobre tarifas, formatos, plataformas, tiempos y pagos. Si algo se sale de eso, lo pasamos a Andersson o Mónica y te contestan por escrito. ¿Qué quieres saber?'

export function useAdChat() {
  const funnel = useAdFunnel()

  function open() {
    isOpen.value = true
    if (messages.value.length === 0) {
      messages.value.push({ role: 'assistant', text: WELCOME, ts: Date.now() })
    }
    trackAdEvent('ad_question_opened', { stage: funnel.state.value.stage })
  }
  function close() { isOpen.value = false }
  function toggle() { isOpen.value ? close() : open() }

  function ask(text: string) {
    const q = text.trim()
    if (!q) return
    messages.value.push({ role: 'user', text: q, ts: Date.now() })
    const hit = findAnswer(q)
    setTimeout(() => {
      if (hit) {
        messages.value.push({ role: 'assistant', text: hit.answer, ts: Date.now() })
        trackAdEvent('ad_question_ai_resolved', { id: hit.id })
      } else {
        messages.value.push({ role: 'assistant', text: AD_ESCALATION_MESSAGE, ts: Date.now(), escalate: true })
        escalating.value = true
      }
    }, 350)
  }

  async function escalate(data: { first_name: string; company: string; email: string; whatsapp: string; question: string }) {
    sending.value = true
    const transcript = messages.value
      .filter(m => m.role !== 'system')
      .map(m => `${m.role === 'user' ? 'Cliente' : 'Asistente'}: ${m.text}`)
      .join('\n')

    const ctx = funnel.contextSummary()
    // Completar datos del funnel con lo que llega del formulario
    if (!funnel.state.value.first_name) funnel.state.value.first_name = data.first_name
    if (!funnel.state.value.email)      funnel.state.value.email = data.email
    if (!funnel.state.value.brand)      funnel.state.value.brand = data.company
    if (!funnel.state.value.phone && data.whatsapp) funnel.state.value.phone = data.whatsapp
    funnel.saveContact()

    await GhlWebhookService.contact({
      ...ctx,
      firstName: data.first_name || ctx.firstName,
      email: data.email || ctx.email,
      phone: data.whatsapp || ctx.phone,
      empresa: data.company || ctx.empresa,
      tags: ['pregunta-humana-publicidad'],
      ad_question_status: 'pending',
      ad_ai_resolved: false,
      ad_human_review_required: true,
      pregunta: data.question,
      chat_transcript: transcript,
      source: 'Publicidad — Tengo una pregunta',
    })
    await funnel.syncStage('Pregunta pendiente', ['pregunta-humana-publicidad'])
    sending.value = false
    escalating.value = false
    escalated.value = true
    messages.value.push({
      role: 'assistant',
      text: `Listo, ${data.first_name}. Tu pregunta quedó en la cola de Andersson y Mónica. Te respondemos por ${data.whatsapp ? 'WhatsApp o correo' : 'correo'} en el próximo bloque comercial. Puedes seguir armando tu campaña mientras tanto.`,
      ts: Date.now(),
    })
    trackAdEvent('ad_question_human_escalated', { priority: ctx.ad_question_priority })
  }

  function clear() {
    messages.value = [{ role: 'assistant', text: WELCOME, ts: Date.now() }]
    escalating.value = false
    escalated.value = false
  }

  const suggestions = AD_KNOWLEDGE.slice(0, 5).map(k => k.question)

  return { isOpen, messages, escalating, escalated, sending, suggestions, open, close, toggle, ask, escalate, clear }
}
