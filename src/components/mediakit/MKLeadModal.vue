<template>
  <Teleport to="body">
    <Transition name="modal-fade">
      <div v-if="isOpen" class="lm-overlay" @click.self="tryClose">

        <!-- ── CONFIRM CLOSE DIALOG ── -->
        <Transition name="modal-fade">
          <div v-if="showConfirm" class="lm-confirm-overlay" @click.self="showConfirm = false">
            <div class="lm-confirm">
              <div class="lm-confirm-icon"><i class="fa-solid fa-triangle-exclamation"></i></div>
              <p class="lm-confirm-title">¿Estás seguro de cerrar?</p>
              <p class="lm-confirm-sub">Se borrarán todos los datos ingresados.</p>
              <div class="lm-confirm-btns">
                <button class="lm-btn-ghost" @click="showConfirm = false">Seguir llenando</button>
                <button class="lm-btn-danger" @click="forceClose">Sí, cerrar</button>
              </div>
            </div>
          </div>
        </Transition>

        <div class="lm-card-wrapper">
          <button class="lm-close" @click="tryClose" aria-label="Cerrar">
            <i class="fa-solid fa-xmark"></i>
          </button>

          <div class="lm-card" :class="{ blurred: showConfirm }" ref="cardEl">

            <!-- Steps indicator -->
            <div class="lm-steps" v-if="step < 3">
              <div class="lm-step" :class="{ active: step >= 1, done: step > 1 }"><span>1</span></div>
              <div class="lm-step-line" :class="{ done: step > 1 }"></div>
              <div class="lm-step" :class="{ active: step >= 2 }"><span>2</span></div>
            </div>

            <!-- ── STEP 1 ── -->
            <Transition name="slide-up" mode="out-in">
              <div v-if="step === 1" key="s1" class="lm-body">
                <div class="lm-eyebrow">Paso 1 de 2</div>
                <h2 class="lm-title">CUÉNTANOS<br>SOBRE TI</h2>
                <p class="lm-subtitle">Solo nos tomará un momento</p>

                <div class="lm-grid">
                  <input v-model="form.nombre"   type="text"  class="lm-input" placeholder="Tu nombre"   />
                  <input v-model="form.apellido" type="text"  class="lm-input" placeholder="Tu apellido" />
                  <input v-model="form.correo"   type="email" class="lm-input lm-input--full" placeholder="Correo electrónico" />

                  <!-- Phone with country code -->
                  <div class="lm-phone-wrap lm-input--full">
                    <div class="lm-phone-flag">{{ selectedCountry?.flag }}</div>
                    <select v-model="countryDial" class="lm-phone-select">
                      <option v-for="c in countryCodes" :key="c.country + c.dial" :value="c.dial">
                        {{ c.flag }} {{ c.name }} ({{ c.dial }})
                      </option>
                    </select>
                    <span class="lm-phone-dial">{{ countryDial }}</span>
                    <input
                      v-model="phoneNumber"
                      type="tel"
                      class="lm-phone-input"
                      placeholder="Número celular"
                    />
                  </div>
                </div>

                <div v-if="step1Error" class="lm-error">
                  <i class="fa-solid fa-triangle-exclamation"></i> {{ step1Error }}
                </div>

                <button class="lm-btn-primary" @click="goToStep2" :disabled="sendingContact">
                  <span v-if="!sendingContact">Siguiente <i class="fa-solid fa-arrow-right"></i></span>
                  <span v-else><i class="fa-solid fa-circle-notch fa-spin"></i> Un momento…</span>
                </button>
              </div>
            </Transition>

            <!-- ── STEP 2 ── -->
            <Transition name="slide-up" mode="out-in">
              <div v-if="step === 2" key="s2" class="lm-body">
                <div class="lm-eyebrow">Paso 2 de 2</div>
                <h2 class="lm-title">UN PASO<br>MÁS</h2>
                <p class="lm-subtitle">Para darte la mejor propuesta</p>

                <div class="lm-field-label">¿Cómo te describes?</div>
                <div class="lm-cards">
                  <button
                    v-for="opt in tipoOpts"
                    :key="opt.value"
                    type="button"
                    class="lm-card-opt"
                    :class="{ selected: form.tipo_cliente === opt.value }"
                    @click="form.tipo_cliente = opt.value"
                  >
                    <i :class="opt.icon" class="lm-card-icon"></i>
                    <span>{{ opt.label }}</span>
                  </button>
                </div>

                <Transition name="slide-up">
                  <div v-if="form.tipo_cliente === 'otro'" class="lm-otro-wrap">
                    <input
                      v-model="form.tipo_cliente_otro"
                      type="text"
                      class="lm-input lm-input--full"
                      placeholder="Cuéntanos un poco más sobre ti…"
                    />
                  </div>
                </Transition>

                <div class="lm-field-label">¿Cuándo quieres recibir respuesta?</div>
                <div class="lm-pills">
                  <button
                    v-for="opt in tiempoOpts"
                    :key="opt.value"
                    type="button"
                    class="lm-pill"
                    :class="{ selected: form.tiempo_respuesta === opt.value }"
                    @click="form.tiempo_respuesta = opt.value"
                  >{{ opt.label }}</button>
                </div>

                <div class="lm-field-label">¿Cuál es tu objetivo principal?</div>
                <div class="lm-pills">
                  <button
                    v-for="opt in objetivoOpts"
                    :key="opt.value"
                    type="button"
                    class="lm-pill"
                    :class="{ selected: form.objetivo === opt.value }"
                    @click="form.objetivo = opt.value"
                  >{{ opt.label }}</button>
                </div>

                <div class="lm-field-label">¿Presupuesto mensual aproximado?</div>
                <div class="lm-pills">
                  <button
                    v-for="opt in presupuestoOpts"
                    :key="opt.value"
                    type="button"
                    class="lm-pill"
                    :class="{ selected: form.presupuesto === opt.value }"
                    @click="form.presupuesto = opt.value"
                  >{{ opt.label }}</button>
                </div>

                <div v-if="errorMsg" class="lm-error">
                  <i class="fa-solid fa-triangle-exclamation"></i> {{ errorMsg }}
                </div>

                <div class="lm-btn-row">
                  <button class="lm-btn-ghost" @click="step = 1">
                    <i class="fa-solid fa-arrow-left"></i> Volver
                  </button>
                  <button class="lm-btn-primary" @click="handleSubmit" :disabled="loading">
                    <span v-if="!loading">Enviar solicitud <i class="fa-solid fa-paper-plane"></i></span>
                    <span v-else><i class="fa-solid fa-circle-notch fa-spin"></i> Enviando…</span>
                  </button>
                </div>
              </div>
            </Transition>

            <!-- ── STEP 3: SUCCESS ── -->
            <Transition name="slide-up" mode="out-in">
              <div v-if="step === 3" key="s3" class="lm-body lm-success">
                <i class="fa-solid fa-circle-check lm-success-icon"></i>
                <h2 class="lm-title lm-title--success">¡TODO<br>LISTO!</h2>
                <template v-if="!wasDisqualified">
                  <p class="lm-subtitle lm-subtitle--success">
                    Tu perfil califica para una llamada estratégica con Andersson.<br>
                    ¡Agenda tu espacio ahora!
                  </p>
                  <button class="lm-btn-primary" @click="goToAgenda">
                    Agenda tu llamada <i class="fa-solid fa-calendar-check"></i>
                  </button>
                  <button class="lm-btn-ghost lm-btn--sm" @click="forceClose">Ahora no</button>
                </template>
                <template v-else>
                  <p class="lm-subtitle lm-subtitle--success">
                    Hemos recibido tu información.<br>
                    ¡Gracias por tu interés en nuestros servicios!
                  </p>
                  <button class="lm-btn-ghost" @click="forceClose">Cerrar</button>
                </template>
              </div>
            </Transition>

          </div><!-- /lm-card -->
        </div><!-- /lm-card-wrapper -->
      </div>
    </Transition>
  </Teleport>
</template>

<script setup lang="ts">
import { ref, computed, watch } from 'vue'
import { onMounted, onUnmounted } from 'vue'
import axios from 'axios'
import { gsap } from 'gsap'
import { useRouter } from 'vue-router'
import { useLeadModal } from '@/composables/useLeadModal'

const router = useRouter()

const { isOpen, closeModal } = useLeadModal()

const cardEl         = ref<HTMLElement | null>(null)
const step           = ref(1)
const loading        = ref(false)
const sendingContact = ref(false)
const step1Error     = ref('')
const errorMsg       = ref('')
const showConfirm    = ref(false)
const wasDisqualified = ref(false)

// ── PHONE ─────────────────────────────────────────────────────
const countryDial  = ref('+593')
const phoneNumber  = ref('')

interface Country { country: string; dial: string; flag: string; name: string }

const countryCodes: Country[] = [
  { country: 'EC', dial: '+593', flag: '🇪🇨', name: 'Ecuador' },
  { country: 'CO', dial: '+57',  flag: '🇨🇴', name: 'Colombia' },
  { country: 'VE', dial: '+58',  flag: '🇻🇪', name: 'Venezuela' },
  { country: 'MX', dial: '+52',  flag: '🇲🇽', name: 'México' },
  { country: 'US', dial: '+1',   flag: '🇺🇸', name: 'EE.UU.' },
  { country: 'CA', dial: '+1',   flag: '🇨🇦', name: 'Canadá' },
  { country: 'ES', dial: '+34',  flag: '🇪🇸', name: 'España' },
  { country: 'AR', dial: '+54',  flag: '🇦🇷', name: 'Argentina' },
  { country: 'CL', dial: '+56',  flag: '🇨🇱', name: 'Chile' },
  { country: 'PE', dial: '+51',  flag: '🇵🇪', name: 'Perú' },
  { country: 'PA', dial: '+507', flag: '🇵🇦', name: 'Panamá' },
  { country: 'CR', dial: '+506', flag: '🇨🇷', name: 'Costa Rica' },
  { country: 'GT', dial: '+502', flag: '🇬🇹', name: 'Guatemala' },
  { country: 'DO', dial: '+1',   flag: '🇩🇴', name: 'R. Dominicana' },
  { country: 'BO', dial: '+591', flag: '🇧🇴', name: 'Bolivia' },
  { country: 'PY', dial: '+595', flag: '🇵🇾', name: 'Paraguay' },
  { country: 'UY', dial: '+598', flag: '🇺🇾', name: 'Uruguay' },
  { country: 'PR', dial: '+1',   flag: '🇵🇷', name: 'Puerto Rico' },
]

const selectedCountry = computed(() =>
  countryCodes.find(c => c.dial === countryDial.value) ?? countryCodes[0]
)

const fullPhone = computed(() => {
  // Strip leading zero from local number (international convention)
  // Ecuador: 0995254965 + +593 → +593995254965 (not +5930995254965)
  const local = phoneNumber.value.replace(/^0+/, '')
  return `${countryDial.value}${local}`
})

async function detectCountry() {
  try {
    const res  = await fetch('https://ipapi.co/json/')
    const data = await res.json()
    const match = countryCodes.find(c => c.country === data.country_code)
    if (match) countryDial.value = match.dial
  } catch {
    // keep default Ecuador
  }
}

// ── SMART PHONE PARSER ────────────────────────────────────────
// If user types/pastes a full number like "+593 995254965" or "00593995254965",
// auto-detect the country code, update the selector, and keep only the local number.
function parseFullPhone(raw: string) {
  // Normalize: remove spaces, dashes, dots, parentheses
  let normalized = raw.replace(/[\s\-().]/g, '')

  // Handle "00..." international prefix → convert to "+"
  if (normalized.startsWith('00')) normalized = '+' + normalized.slice(2)

  if (!normalized.startsWith('+')) return // not a full international number, leave as-is

  // Sort dial codes longest-first to avoid "+1" matching before "+1809"
  const sorted = [...countryCodes].sort((a, b) => b.dial.length - a.dial.length)
  const match = sorted.find(c => normalized.startsWith(c.dial))

  if (!match) return // unknown country code, leave as-is

  const localRaw = normalized.slice(match.dial.length)
  const local = localRaw.replace(/^0+/, '') // strip leading zero

  countryDial.value = match.dial
  phoneNumber.value = local
}

watch(phoneNumber, (val) => {
  // Only attempt parse if input looks like a full international number
  const clean = val.replace(/[\s\-().]/g, '')
  if (clean.startsWith('+') || clean.startsWith('00')) {
    parseFullPhone(val)
  }
})

// ── FORM DATA ─────────────────────────────────────────────────
const form = ref({
  nombre: '',
  apellido: '',
  correo: '',
  tiempo_respuesta: '',
  tipo_cliente: '',
  tipo_cliente_otro: '',
  objetivo: '',
  presupuesto: '',
})

const hasData = computed(() =>
  form.value.nombre || form.value.apellido || form.value.correo ||
  phoneNumber.value || form.value.tipo_cliente || form.value.objetivo || form.value.presupuesto
)

// ── OPTIONS ───────────────────────────────────────────────────
const tiempoOpts = [
  { value: 'inmediato',    label: 'Lo antes posible' },
  { value: '1_2_dias',     label: 'En 1-2 días' },
  { value: 'esta_semana',  label: 'Esta semana' },
  { value: 'sin_urgencia', label: 'Sin urgencia' },
]

const tipoOpts = [
  { value: 'marca',       label: 'Marca establecida',    icon: 'fa-solid fa-building-columns' },
  { value: 'agencia',     label: 'Agencia de marketing', icon: 'fa-solid fa-bullhorn' },
  { value: 'emprendedor', label: 'Emprendedor',           icon: 'fa-solid fa-seedling' },
  { value: 'otro',        label: 'Otro',                  icon: 'fa-solid fa-user' },
]

const objetivoOpts = [
  { value: 'ventas',          label: 'Más ventas' },
  { value: 'awareness',       label: 'Brand awareness' },
  { value: 'lanzamiento',     label: 'Lanzamiento' },
  { value: 'posicionamiento', label: 'Posicionamiento' },
]

const presupuestoOpts = [
  { value: 'menos_500',  label: '< $500' },
  { value: '500_1500',   label: '$500 – $1.5k' },
  { value: '1500_3000',  label: '$1.5k – $3k' },
  { value: 'mas_3000',   label: '$3k+' },
]

// ── CLOSE LOGIC ───────────────────────────────────────────────
function tryClose() {
  if (step.value === 3) { forceClose(); return }
  if (hasData.value) { showConfirm.value = true } else { forceClose() }
}

function forceClose() {
  showConfirm.value = false
  closeModal()
}

// ── SCORE ─────────────────────────────────────────────────────
// Disqualify ONLY if presupuesto = menos_500 (budget below minimum service $1,500)
// sin_urgencia with good budget still qualifies → Nurture pipeline
function calcScore(): { score: number; pipeline: string; tag: string; disqualified: boolean; disqualify_reason: string } {
  const p  = form.value.presupuesto
  const tr = form.value.tiempo_respuesta

  if (p === 'menos_500') {
    return {
      score: 0,
      pipeline: 'Descalificado',
      tag: 'mk-descalificado',
      disqualified: true,
      disqualify_reason: 'Presupuesto menor a $500 — por debajo del mínimo de servicios ($1,500)',
    }
  }

  let score = 0
  if (p === 'mas_3000')       score += 40
  else if (p === '1500_3000') score += 30
  else if (p === '500_1500')  score += 20
  else if (p === 'menos_500') score += 10  // low budget but has urgency — still qualifies

  const t = form.value.tipo_cliente
  if (t === 'marca')            score += 20
  else if (t === 'agencia')     score += 15
  else if (t === 'emprendedor') score += 10

  if (tr === 'inmediato')        score += 20
  else if (tr === '1_2_dias')    score += 15
  else if (tr === 'esta_semana') score += 10
  // sin_urgencia = 0 pts (but not disqualified unless combined with menos_500)

  let pipeline = 'Nurture'
  let tag = 'mk-lead-frio'
  if (score >= 60)      { pipeline = 'Ventas Activas'; tag = 'mk-lead-caliente' }
  else if (score >= 35) { pipeline = 'Seguimiento';    tag = 'mk-lead-tibio' }

  return { score, pipeline, tag, disqualified: false, disqualify_reason: '' }
}

// ── NAVIGATE TO AGENDA ───────────────────────────────────────
function goToAgenda() {
  const params = new URLSearchParams({
    firstName: form.value.nombre,
    lastName:  form.value.apellido,
    email:     form.value.correo,
    phone:     fullPhone.value,
  })
  forceClose()
  router.push(`/agendar?${params.toString()}`)
}

// ── STEP 1 → fire webhook contact ────────────────────────────
async function goToStep2() {
  step1Error.value = ''
  const f = form.value
  if (!f.nombre || !f.apellido || !f.correo || !phoneNumber.value) {
    step1Error.value = 'Por favor completa todos los campos.'
    return
  }
  sendingContact.value = true
  try {
    await axios.post(
      import.meta.env.VITE_GHL_WEBHOOK_CONTACT as string,
      {
        firstName:  f.nombre,
        lastName:   f.apellido,
        email:      f.correo,
        phone:      fullPhone.value,
        source:     'Media Kit 2026 — Step 1',
        page_url:   window.location.href,
        timestamp:  new Date().toISOString(),
      }
    )
  } catch {
    // Non-blocking: proceed even if webhook fails
  } finally {
    sendingContact.value = false
  }
  step.value = 2
}

// ── STEP 2 → fire webhook opportunity ────────────────────────
async function handleSubmit() {
  errorMsg.value = ''
  loading.value = true
  const { score, pipeline, tag, disqualified, disqualify_reason } = calcScore()
  wasDisqualified.value = disqualified
  const tipo = form.value.tipo_cliente === 'otro' && form.value.tipo_cliente_otro
    ? `otro: ${form.value.tipo_cliente_otro}`
    : form.value.tipo_cliente
  try {
    await axios.post(
      import.meta.env.VITE_GHL_WEBHOOK_OPPORTUNITY as string,
      {
        // ── Identificación del contacto (para buscar en GHL) ──
        firstName:            form.value.nombre,
        lastName:             form.value.apellido,
        email:                form.value.correo,
        phone:                fullPhone.value,

        // ── Datos de calificación ──────────────────────────────
        tipo_cliente:         tipo,
        objetivo:             form.value.objetivo,
        presupuesto:          form.value.presupuesto,
        tiempo_respuesta:     form.value.tiempo_respuesta,

        // ── Datos de oportunidad para GHL ─────────────────────
        opportunityName:      `${form.value.nombre} ${form.value.apellido} — Media Kit`,
        pipelineName:         pipeline,          // "Ventas Activas" | "Seguimiento" | "Nurture"
        pipelineStage:        pipeline === 'Ventas Activas' ? 'Nuevo Lead Caliente'
                            : pipeline === 'Seguimiento'    ? 'Nuevo Lead Tibio'
                            :                                 'Lead Frío',
        opportunityStatus:    'open',
        monetaryValue:        form.value.presupuesto === 'mas_3000'    ? 3000
                            : form.value.presupuesto === '1500_3000'   ? 1500
                            : form.value.presupuesto === '500_1500'    ? 500
                            :                                             0,

        // ── Tags y scoring ────────────────────────────────────
        tags:                 [tag, 'media-kit-2026', `presupuesto-${form.value.presupuesto}`],
        qualification_score:  score,
        disqualified,
        disqualify_reason,

        // ── Metadata ─────────────────────────────────────────
        source:               'Media Kit 2026 — Andersson y Moni',
        page_url:             window.location.href,
        timestamp:            new Date().toISOString(),
      }
    )
    step.value = 3
  } catch {
    errorMsg.value = 'Hubo un problema al enviar. Por favor intenta de nuevo.'
  } finally {
    loading.value = false
  }
}

// ── RESET ─────────────────────────────────────────────────────
function resetForm() {
  step.value = 1
  step1Error.value = ''
  errorMsg.value = ''
  showConfirm.value = false
  phoneNumber.value = ''
  Object.assign(form.value, {
    nombre: '', apellido: '', correo: '',
    tiempo_respuesta: '', tipo_cliente: '', tipo_cliente_otro: '',
    objetivo: '', presupuesto: '',
  })
}

watch(isOpen, (val) => {
  if (val) {
    resetForm()
    detectCountry()
    setTimeout(() => {
      if (cardEl.value) {
        gsap.fromTo(cardEl.value,
          { scale: 0.92, opacity: 0, y: 30 },
          { scale: 1, opacity: 1, y: 0, duration: 0.45, ease: 'power3.out' }
        )
      }
    }, 10)
  }
})

function onKeydown(e: KeyboardEvent) {
  if (e.key === 'Escape') {
    if (showConfirm.value) { showConfirm.value = false; return }
    tryClose()
  }
}
onMounted(() => window.addEventListener('keydown', onKeydown))
onUnmounted(() => window.removeEventListener('keydown', onKeydown))
</script>

<style lang="scss" scoped>
.lm-overlay {
  position: fixed;
  inset: 0;
  z-index: 2000;
  background: rgba(8,8,8,0.88);
  backdrop-filter: blur(20px);
  display: flex;
  align-items: center;
  justify-content: center;
  padding: 20px;
}

// ── CONFIRM OVERLAY ───────────────────────────────────────────
.lm-confirm-overlay {
  position: fixed;
  inset: 0;
  z-index: 2100;
  background: rgba(8,8,8,0.55);
  backdrop-filter: blur(14px);
  -webkit-backdrop-filter: blur(14px);
  display: flex;
  align-items: center;
  justify-content: center;
  padding: 20px;
}

.lm-confirm {
  background: #161616;
  border: 1px solid rgba(245,242,237,0.1);
  border-radius: 12px;
  padding: clamp(28px, 5vw, 44px);
  max-width: 400px;
  width: 100%;
  display: flex;
  flex-direction: column;
  align-items: center;
  text-align: center;
  gap: 12px;
  box-shadow: 0 32px 80px rgba(0,0,0,0.6);
}

.lm-confirm-icon {
  font-size: 2.5rem;
  color: #c9a84c;
  margin-bottom: 4px;
}

.lm-confirm-title {
  font-family: 'Bebas Neue', sans-serif;
  font-size: clamp(1.6rem, 4vw, 2.2rem);
  color: #f5f2ed;
  margin: 0;
  line-height: 1;
}

.lm-confirm-sub {
  font-family: 'DM Sans', sans-serif;
  font-size: 14px;
  color: rgba(245,242,237,0.5);
  margin: 0 0 8px;
}

.lm-confirm-btns {
  display: flex;
  gap: 12px;
  flex-wrap: wrap;
  justify-content: center;
}

.lm-btn-danger {
  background: #c8392b;
  border: 1px solid #c8392b;
  border-radius: 6px;
  color: #f5f2ed;
  font-family: 'DM Sans', sans-serif;
  font-size: 13px;
  font-weight: 700;
  padding: 12px 24px;
  cursor: pointer;
  transition: all 0.2s;
  &:hover { background: #a82d22; border-color: #a82d22; }
}

// ── CARD WRAPPER ──────────────────────────────────────────────
.lm-card-wrapper {
  position: relative;
  width: 100%;
  max-width: 540px;
  margin-top: 20px;
}

.lm-close {
  position: absolute;
  top: -18px;
  right: -18px;
  width: 36px;
  height: 36px;
  border-radius: 50%;
  background: #1a1a1a;
  border: 1px solid rgba(245,242,237,0.15);
  color: rgba(245,242,237,0.6);
  font-size: 13px;
  cursor: pointer;
  display: flex;
  align-items: center;
  justify-content: center;
  transition: all 0.25s;
  z-index: 10;
  box-shadow: 0 4px 16px rgba(0,0,0,0.4);
  &:hover {
    background: rgba(200,57,43,0.2);
    border-color: rgba(200,57,43,0.5);
    color: #f5f2ed;
    transform: rotate(90deg);
  }
}

.lm-card {
  background: #111;
  border: 1px solid rgba(245,242,237,0.08);
  border-radius: 12px;
  padding: clamp(32px, 5vw, 52px);
  width: 100%;
  max-height: 85vh;
  overflow-y: auto;
  box-sizing: border-box;
  scrollbar-width: thin;
  scrollbar-color: rgba(245,242,237,0.1) transparent;
  transition: filter 0.3s ease;

  &.blurred {
    filter: blur(4px);
    pointer-events: none;
  }
}

// ── STEPS ─────────────────────────────────────────────────────
.lm-steps {
  display: flex;
  align-items: center;
  margin-top: 8px;
  margin-bottom: 36px;
}

.lm-step {
  width: 28px;
  height: 28px;
  border-radius: 50%;
  border: 2px solid rgba(245,242,237,0.2);
  display: flex;
  align-items: center;
  justify-content: center;
  font-family: 'DM Sans', sans-serif;
  font-size: 12px;
  font-weight: 700;
  color: rgba(245,242,237,0.3);
  transition: all 0.3s;
  flex-shrink: 0;
  &.active { border-color: #c8392b; color: #f5f2ed; background: rgba(200,57,43,0.15); }
  &.done   { border-color: #c8392b; background: #c8392b; color: #f5f2ed; }
}

.lm-step-line {
  flex: 1;
  height: 2px;
  background: rgba(245,242,237,0.1);
  transition: background 0.3s;
  &.done { background: #c8392b; }
}

// ── BODY ──────────────────────────────────────────────────────
.lm-body { display: flex; flex-direction: column; }

.lm-eyebrow {
  font-family: 'DM Sans', sans-serif;
  font-size: 11px;
  letter-spacing: 0.3em;
  text-transform: uppercase;
  color: #c9a84c;
  margin-bottom: 10px;
}

.lm-title {
  font-family: 'Bebas Neue', sans-serif;
  font-size: clamp(2.2rem, 5vw, 3rem);
  line-height: 0.95;
  color: #f5f2ed;
  margin: 0 0 8px;
  &--success { text-align: center; }
}

.lm-subtitle {
  font-family: 'DM Sans', sans-serif;
  font-size: 13px;
  color: rgba(245,242,237,0.5);
  margin: 0 0 24px;
  &--success { text-align: center; line-height: 1.6; }
}

// ── GRID + INPUTS ─────────────────────────────────────────────
.lm-grid {
  display: grid;
  grid-template-columns: 1fr 1fr;
  gap: 12px;
  margin-bottom: 20px;
  @media (max-width: 480px) { grid-template-columns: 1fr; }
}

.lm-input {
  background: #0d0d0d;
  border: 1px solid rgba(245,242,237,0.1);
  border-radius: 6px;
  padding: 13px 16px;
  color: #f5f2ed;
  font-family: 'DM Sans', sans-serif;
  font-size: 0.9rem;
  width: 100%;
  box-sizing: border-box;
  outline: none;
  transition: border-color 0.2s;
  &:focus { border-color: #c9a84c; }
  &::placeholder { color: rgba(245,242,237,0.28); }
  &--full { grid-column: 1 / -1; }
}

// ── PHONE FIELD ───────────────────────────────────────────────
.lm-phone-wrap {
  display: flex;
  align-items: center;
  background: #0d0d0d;
  border: 1px solid rgba(245,242,237,0.1);
  border-radius: 6px;
  overflow: hidden;
  transition: border-color 0.2s;
  position: relative;
  grid-column: 1 / -1;

  &:focus-within { border-color: #c9a84c; }
}

.lm-phone-flag {
  font-size: 18px;
  padding: 0 0 0 14px;
  flex-shrink: 0;
  pointer-events: none;
  line-height: 1;
}

.lm-phone-select {
  position: absolute;
  inset: 0;
  opacity: 0;
  cursor: pointer;
  z-index: 2;
  width: 100px;
}

.lm-phone-dial {
  font-family: 'DM Sans', sans-serif;
  font-size: 0.88rem;
  font-weight: 600;
  color: rgba(245,242,237,0.55);
  padding: 0 4px 0 6px;
  flex-shrink: 0;
  pointer-events: none;
  user-select: none;
}

.lm-phone-input {
  flex: 1;
  background: transparent;
  border: none;
  border-left: 1px solid rgba(245,242,237,0.08);
  color: #f5f2ed;
  font-family: 'DM Sans', sans-serif;
  font-size: 0.9rem;
  padding: 13px 16px;
  outline: none;
  margin-left: 4px;
  &::placeholder { color: rgba(245,242,237,0.28); }
}

// ── FIELD LABEL ───────────────────────────────────────────────
.lm-field-label {
  font-family: 'DM Sans', sans-serif;
  font-size: 11px;
  font-weight: 700;
  letter-spacing: 0.2em;
  text-transform: uppercase;
  color: rgba(245,242,237,0.45);
  margin-bottom: 10px;
  margin-top: 4px;
}

// ── PILLS ─────────────────────────────────────────────────────
.lm-pills {
  display: flex;
  flex-wrap: wrap;
  gap: 8px;
  margin-bottom: 20px;
}

.lm-pill {
  padding: 8px 18px;
  border-radius: 100px;
  border: 1px solid rgba(245,242,237,0.15);
  background: transparent;
  color: rgba(245,242,237,0.65);
  font-family: 'DM Sans', sans-serif;
  font-size: 13px;
  cursor: pointer;
  transition: all 0.2s;
  &:hover { border-color: rgba(245,242,237,0.4); color: #f5f2ed; }
  &.selected { background: #c8392b; border-color: #c8392b; color: #f5f2ed; }
}

// ── CARDS ─────────────────────────────────────────────────────
.lm-cards {
  display: grid;
  grid-template-columns: 1fr 1fr;
  gap: 10px;
  margin-bottom: 12px;
  @media (max-width: 400px) { grid-template-columns: 1fr; }
}

.lm-card-opt {
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 8px;
  padding: 16px 12px;
  border: 1px solid rgba(245,242,237,0.1);
  border-radius: 8px;
  background: rgba(245,242,237,0.02);
  color: rgba(245,242,237,0.6);
  font-family: 'DM Sans', sans-serif;
  font-size: 13px;
  cursor: pointer;
  transition: all 0.2s;
  text-align: center;
  &:hover { border-color: rgba(245,242,237,0.3); color: #f5f2ed; }
  &.selected {
    border-color: #c8392b;
    background: rgba(200,57,43,0.12);
    color: #f5f2ed;
    .lm-card-icon { color: #c9a84c; }
  }
}

.lm-card-icon {
  font-size: 22px;
  color: rgba(201,168,76,0.6);
  transition: color 0.2s;
}

.lm-otro-wrap { margin-bottom: 20px; }

// ── ERROR ─────────────────────────────────────────────────────
.lm-error {
  background: rgba(200,57,43,0.1);
  border: 1px solid rgba(200,57,43,0.3);
  border-radius: 6px;
  padding: 12px 16px;
  color: #e87a6e;
  font-family: 'DM Sans', sans-serif;
  font-size: 13px;
  display: flex;
  align-items: center;
  gap: 8px;
  margin-bottom: 16px;
}

// ── BUTTONS ───────────────────────────────────────────────────
.lm-btn-primary {
  width: 100%;
  background: #c8392b;
  border: 2px solid #c8392b;
  border-radius: 6px;
  color: #f5f2ed;
  font-family: 'Bebas Neue', sans-serif;
  font-size: clamp(1.1rem, 2.5vw, 1.35rem);
  letter-spacing: 0.06em;
  padding: 16px;
  cursor: pointer;
  transition: all 0.25s;
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 10px;
  margin-top: 8px;
  &:hover:not(:disabled) { background: transparent; color: #c8392b; }
  &:disabled { opacity: 0.55; cursor: not-allowed; }
}

.lm-btn-ghost {
  background: transparent;
  border: 1px solid rgba(245,242,237,0.15);
  border-radius: 6px;
  color: rgba(245,242,237,0.55);
  font-family: 'DM Sans', sans-serif;
  font-size: 13px;
  padding: 12px 20px;
  cursor: pointer;
  transition: all 0.2s;
  display: inline-flex;
  align-items: center;
  gap: 8px;
  &:hover { border-color: rgba(245,242,237,0.4); color: #f5f2ed; }
  &.lm-btn--sm { font-size: 11px; padding: 8px 16px; margin-top: 8px; }
}

.lm-btn-row {
  display: flex;
  gap: 12px;
  margin-top: 8px;
  .lm-btn-primary { flex: 1; }
}

// ── SUCCESS ───────────────────────────────────────────────────
.lm-success {
  align-items: center;
  text-align: center;
  padding: 16px 0;
}

.lm-success-icon {
  font-size: clamp(3rem, 8vw, 4.5rem);
  color: #c9a84c;
  margin-bottom: 16px;
}

// ── TRANSITIONS ───────────────────────────────────────────────
.modal-fade-enter-active, .modal-fade-leave-active { transition: opacity 0.3s ease; }
.modal-fade-enter-from, .modal-fade-leave-to { opacity: 0; }

.slide-up-enter-active, .slide-up-leave-active { transition: all 0.28s ease; }
.slide-up-enter-from { opacity: 0; transform: translateY(18px); }
.slide-up-leave-to   { opacity: 0; transform: translateY(-12px); }
</style>
