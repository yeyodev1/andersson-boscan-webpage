<template>
  <div class="ag-root">

    <!-- ── REDIRECT NOTICE (no data) ── -->
    <Transition name="ag-success-fade">
      <div v-if="redirecting" class="ag-success">
        <div class="ag-success__inner">
          <div class="ag-success__icon" style="border-color:rgba(201,168,76,0.3);color:#c9a84c;">
            <i class="fa-solid fa-circle-info"></i>
          </div>
          <p class="ag-success__eyebrow">UN MOMENTO</p>
          <h1 class="ag-success__title" style="font-size:clamp(2rem,5vw,3.5rem)">PRIMERO<br>COMPLETA TU PERFIL</h1>
          <p class="ag-success__sub">
            Para agendar una llamada, necesitamos conocerte un poco.
            Te redirigimos al inicio en unos segundos…
          </p>
          <div class="ag-success__actions">
            <button class="ag-btn-primary" @click="router.push('/')">
              <i class="fa-solid fa-house"></i> Ir al inicio ahora
            </button>
          </div>
        </div>
        <div class="ag-success__bg-lines" aria-hidden="true">
          <span v-for="n in 6" :key="n" />
        </div>
      </div>
    </Transition>

    <!-- ── SUCCESS SCREEN ── -->
    <Transition name="ag-success-fade">
      <div v-if="booked" class="ag-success">
        <div class="ag-success__inner">
          <div class="ag-success__icon">
            <i class="fa-solid fa-calendar-check"></i>
          </div>
          <p class="ag-success__eyebrow">¡CONFIRMADO!</p>
          <h1 class="ag-success__title">TU LLAMADA<br>ESTÁ AGENDADA</h1>
          <p class="ag-success__sub">
            Pronto nos pondremos en contacto contigo para preparar juntos<br>
            la mejor estrategia de comunicación para tu marca.
          </p>
          <div class="ag-success__details" v-if="bookedName">
            <span class="ag-success__label">Confirmado para</span>
            <span class="ag-success__value">{{ bookedName }}</span>
          </div>
          <div class="ag-success__actions">
            <button class="ag-btn-primary" @click="router.push('/')">
              <i class="fa-solid fa-house"></i> Volver al Media Kit
            </button>
          </div>
          <p class="ag-success__note">
            Revisa tu correo — recibirás una confirmación con todos los detalles.
          </p>
        </div>
        <div class="ag-success__bg-lines" aria-hidden="true">
          <span v-for="n in 6" :key="n" />
        </div>
      </div>
    </Transition>

    <!-- ── CALENDAR ── -->
    <div v-show="!booked && !redirecting" class="ag-inner">
      <MKHeader :active-section="-1" />

      <section class="ag-hero">
        <p class="ag-eyebrow">SIGUIENTE PASO</p>
        <h1 class="ag-title">AGENDA TU<br>LLAMADA ESTRATÉGICA</h1>
        <p class="ag-subtitle">
          Selecciona el horario que mejor se adapte a ti. La llamada dura aproximadamente 45 minutos.
        </p>
      </section>

      <div class="ag-divider" />

      <div class="ag-calendar-wrap">
        <iframe
          ref="iframeEl"
          :src="calendarUrl"
          :style="{ height: iframeHeight + 'px' }"
          class="ag-iframe"
          frameborder="0"
          scrolling="yes"
        />
        <!-- Fallback manual trigger -->
        <p class="ag-fallback-hint">
          ¿Ya agendaste pero no ves confirmación?
          <button class="ag-fallback-btn" @click="triggerBooked(null)">Ver pantalla de confirmación</button>
        </p>
      </div>
    </div>

    <MKFooter v-show="!booked && !redirecting" />
  </div>
</template>

<script setup lang="ts">
import { computed, ref, onMounted, onUnmounted } from 'vue'
import { useRoute, useRouter } from 'vue-router'
import MKFooter from '@/components/mediakit/MKFooter.vue'
import MKHeader from '@/components/mediakit/MKHeader.vue'

const route = useRoute()
const router = useRouter()
const iframeEl    = ref<HTMLIFrameElement | null>(null); void iframeEl
const iframeHeight = ref(1100)
const booked      = ref(false)
const bookedName  = ref('')
const redirecting = ref(false)

function triggerBooked(name: string | null) {
  bookedName.value = name ?? ((route.query.firstName as string) ?? '')
  booked.value = true
  window.scrollTo({ top: 0, behavior: 'smooth' })
}

function onMessage(e: MessageEvent) {
  if (!e.data) return

  // GHL height resize (object format)
  if (typeof e.data === 'object' && !Array.isArray(e.data) && e.data.type === 'booking-app' && e.data.height) {
    iframeHeight.value = Math.max(900, e.data.height + 120)
    return
  }

  // GHL booking complete (array format): ['msgsndr-booking-complete', { calendarId, fingerprint }]
  if (Array.isArray(e.data) && e.data[0] === 'msgsndr-booking-complete') {
    const name = (route.query.firstName as string) ?? ''
    triggerBooked(name)
  }
}

onMounted(() => {
  window.addEventListener('message', onMessage)

  const hasQueryData = !!(route.query.firstName || route.query.email || route.query.phone)
  const stored = localStorage.getItem('mk_contact_given')

  if (!hasQueryData && !stored) {
    // No contact data at all — redirect to home
    redirecting.value = true
    setTimeout(() => router.push('/'), 3000)
    return
  }

  // If we have localStorage data but no query params, pre-fill from storage
  if (!hasQueryData && stored) {
    try {
      const data = JSON.parse(stored)
      const params = new URLSearchParams({
        firstName: data.nombre   || '',
        lastName:  data.apellido || '',
        email:     data.correo   || '',
        phone:     data.telefono || '',
      })
      router.replace(`/agendar?${params.toString()}`)
    } catch { /* keep going without prefill */ }
  }
})
onUnmounted(() => window.removeEventListener('message', onMessage))

const calendarUrl = computed(() => {
  const base = 'https://api.leadconnectorhq.com/widget/booking/nTTnsK8xbyunduMneyc3'
  const params = new URLSearchParams()
  const first = route.query.firstName as string | undefined
  const last  = route.query.lastName  as string | undefined
  if (first || last) params.set('name', [first, last].filter(Boolean).join(' '))
  if (route.query.email) params.set('email', route.query.email as string)
  if (route.query.phone) params.set('phone', route.query.phone as string)
  const qs = params.toString()
  return qs ? `${base}?${qs}` : base
})
</script>

<style scoped lang="scss">
.ag-root {
  background: #080808;
  color: var(--mk-cream, #f5f2ed);
  min-height: 100vh;
  display: flex;
  flex-direction: column;
}

/* ── SUCCESS SCREEN ──────────────────────────────── */
.ag-success {
  position: fixed;
  inset: 0;
  z-index: 2000;
  background: #080808;
  display: flex;
  align-items: center;
  justify-content: center;
  overflow: hidden;

  &__inner {
    position: relative;
    z-index: 2;
    text-align: center;
    padding: 2rem 1.5rem;
    max-width: 640px;
  }

  &__icon {
    width: 80px;
    height: 80px;
    border-radius: 50%;
    background: rgba(200,57,43,0.12);
    border: 1px solid rgba(200,57,43,0.3);
    display: flex;
    align-items: center;
    justify-content: center;
    margin: 0 auto 2rem;
    font-size: 2rem;
    color: #c8392b;
  }

  &__eyebrow {
    font-family: 'DM Sans', sans-serif;
    font-size: 0.75rem;
    letter-spacing: 0.25em;
    color: #c9a84c;
    margin: 0 0 1rem;
  }

  &__title {
    font-family: 'Bebas Neue', sans-serif;
    font-size: clamp(3rem, 8vw, 6rem);
    line-height: 1;
    letter-spacing: 0.04em;
    color: #f5f2ed;
    margin: 0 0 1.5rem;
  }

  &__sub {
    font-family: 'DM Sans', sans-serif;
    font-size: 1.05rem;
    line-height: 1.7;
    color: rgba(245,242,237,0.7);
    margin: 0 0 2rem;
  }

  &__details {
    display: inline-flex;
    flex-direction: column;
    align-items: center;
    gap: 4px;
    background: rgba(245,242,237,0.05);
    border: 1px solid rgba(245,242,237,0.1);
    border-radius: 8px;
    padding: 12px 24px;
    margin-bottom: 2rem;
  }

  &__label {
    font-family: 'DM Sans', sans-serif;
    font-size: 0.72rem;
    letter-spacing: 0.15em;
    color: rgba(245,242,237,0.4);
    text-transform: uppercase;
  }

  &__value {
    font-family: 'DM Sans', sans-serif;
    font-size: 1rem;
    font-weight: 500;
    color: #f5f2ed;
    text-transform: capitalize;
  }

  &__actions {
    margin-bottom: 1.5rem;
  }

  &__note {
    font-family: 'DM Sans', sans-serif;
    font-size: 0.82rem;
    color: rgba(245,242,237,0.35);
    margin: 0;
  }

  /* Decorative bg lines */
  &__bg-lines {
    position: absolute;
    inset: 0;
    z-index: 1;
    pointer-events: none;
    span {
      position: absolute;
      left: 50%;
      top: 50%;
      width: 1px;
      background: linear-gradient(to bottom, transparent, rgba(200,57,43,0.15), transparent);
      transform-origin: top center;
      &:nth-child(1) { height: 60vh; transform: translateX(-50%) rotate(0deg); }
      &:nth-child(2) { height: 55vh; transform: translateX(-50%) rotate(30deg); }
      &:nth-child(3) { height: 55vh; transform: translateX(-50%) rotate(60deg); }
      &:nth-child(4) { height: 60vh; transform: translateX(-50%) rotate(90deg); }
      &:nth-child(5) { height: 55vh; transform: translateX(-50%) rotate(120deg); }
      &:nth-child(6) { height: 55vh; transform: translateX(-50%) rotate(150deg); }
    }
  }
}

.ag-success-fade-enter-active { transition: opacity 0.6s ease, transform 0.6s ease; }
.ag-success-fade-enter-from   { opacity: 0; transform: scale(1.03); }

/* ── CALENDAR PAGE ───────────────────────────────── */
.ag-inner {
  flex: 1;
  width: 100%;
  max-width: 1100px;
  margin: 0 auto;
  padding: 5rem 1.25rem 4rem; /* top offset for fixed MKHeader */
  box-sizing: border-box;
}

.ag-hero {
  text-align: center;
  margin-bottom: 2.5rem;
}

.ag-eyebrow {
  font-family: 'DM Sans', sans-serif;
  font-size: 0.8rem;
  letter-spacing: 0.2em;
  color: var(--mk-gold, #c9a84c);
  text-transform: uppercase;
  margin: 0 0 0.75rem;
}

.ag-title {
  font-family: 'Bebas Neue', sans-serif;
  font-size: clamp(2.5rem, 6vw, 4.5rem);
  line-height: 1.05;
  letter-spacing: 0.04em;
  color: var(--mk-cream, #f5f2ed);
  margin: 0 0 1.25rem;
}

.ag-subtitle {
  font-family: 'DM Sans', sans-serif;
  font-size: 1rem;
  line-height: 1.6;
  color: rgba(245, 242, 237, 0.7);
  max-width: 560px;
  margin: 0 auto;
}

.ag-divider {
  height: 1px;
  background: var(--mk-red, #c8392b);
  margin-bottom: 2.5rem;
  opacity: 0.6;
}

.ag-calendar-wrap { width: 100%; }

.ag-iframe {
  width: 100%;
  border: none;
  display: block;
  border-radius: 8px;
  transition: height 0.3s ease;
  background: #fff;
  overflow: auto;
  -webkit-overflow-scrolling: touch; /* smooth scroll on iOS */
}

.ag-fallback-hint {
  text-align: center;
  margin-top: 1.5rem;
  font-family: 'DM Sans', sans-serif;
  font-size: 0.8rem;
  color: rgba(245,242,237,0.25);
}

.ag-fallback-btn {
  background: none;
  border: none;
  color: rgba(245,242,237,0.4);
  font-family: 'DM Sans', sans-serif;
  font-size: 0.8rem;
  cursor: pointer;
  text-decoration: underline;
  padding: 0;
  margin-left: 4px;
  &:hover { color: rgba(245,242,237,0.7); }
}

.ag-btn-primary {
  display: inline-flex;
  align-items: center;
  gap: 10px;
  background: #c8392b;
  color: #f5f2ed;
  border: none;
  border-radius: 6px;
  font-family: 'DM Sans', sans-serif;
  font-size: 0.95rem;
  font-weight: 500;
  padding: 14px 28px;
  cursor: pointer;
  transition: background 0.2s;
  &:hover { background: #a82e21; }
}

@media (max-width: 640px) {
  .ag-inner { padding: 1.5rem 1rem 3rem; }
  .ag-topbar { margin-bottom: 2rem; }
  .ag-hero { margin-bottom: 2rem; }
}
</style>
