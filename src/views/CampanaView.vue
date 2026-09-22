<template>
  <div class="pub">
    <header class="pub__bar">
      <RouterLink to="/" class="pub__brand">Boscán <span>&amp;</span> La Moni</RouterLink>
      <nav class="pub__nav">
        <RouterLink to="/media-kit">Media kit</RouterLink>
        <button type="button" @click="chat.open()">Tengo una pregunta</button>
      </nav>
    </header>

    <Transition :name="`stage-${dir}`" mode="out-in" @after-leave="toTop">
    <!-- ══ HERO ═══════════════════════════════════════════════ -->
    <section v-if="state.stage === 'hero'" class="pub__hero">
      <p class="pub__eyebrow">Publicidad</p>
      <h1>Publicidad con<br>Boscán <span>&amp;</span> La Moni</h1>
      <p class="pub__lead">
        No necesitas una reunión para empezar.<br>
        Dinos qué quieres conseguir y te mostraremos la campaña que mejor encaja.
      </p>
      <div class="pub__hero-ctas">
        <button class="btn btn--dark" type="button" @click="start">Armar mi campaña <span>→</span></button>
        <button class="pub__link" type="button" @click="chat.open()">Tengo una pregunta</button>
      </div>
      <ul class="pub__proof">
        <li><strong>88,7M</strong> impresiones / mes</li>
        <li><strong>926K</strong> seguidores TikTok</li>
        <li><strong>22</strong> episodios / mes</li>
        <li><strong>5</strong> plataformas</li>
      </ul>
      <p v-if="hasProgress" class="pub__resume">
        Tienes una campaña a medio armar. <button type="button" @click="resume">Continuar donde la dejé →</button>
      </p>
    </section>

    <!-- ══ CONFIGURADOR ═══════════════════════════════════════ -->
    <section v-else-if="isConfig" class="pub__wrap">
      <div class="meter" aria-hidden="true"><span :style="{ transform: `scaleX(${(stepIndex + 1) / 4})` }"></span></div>
      <ol class="steps" aria-label="Progreso">
        <li :class="{ on: state.stage === 'goal', done: stepIndex > 0 }">Objetivo</li>
        <li :class="{ on: state.stage === 'duration', done: stepIndex > 1 }">Duración</li>
        <li :class="{ on: state.stage === 'details', done: stepIndex > 2 }">Tu marca</li>
        <li :class="{ on: stepIndex >= 3 }">Recomendación</li>
      </ol>

      <Transition :name="`step-${dir}`" mode="out-in">
      <!-- Paso 1 -->
      <div v-if="state.stage === 'goal'" class="card">
        <h2>¿Qué quieres conseguir?</h2>
        <div class="opts">
          <button
            v-for="(g, i) in AD_GOALS" :key="g.value" type="button"
            class="opt" :class="{ on: state.goal === g.value }" :style="{ '--i': i }" :disabled="picking"
            @click="pickGoal(g.value)"
          >
            <span class="opt__t">{{ g.label }}</span>
            <span class="opt__h">{{ g.hint }}</span>
          </button>
        </div>
      </div>

      <!-- Paso 2 -->
      <div v-else-if="state.stage === 'duration'" class="card">
        <h2>¿Durante cuánto tiempo?</h2>
        <div class="opts opts--3">
          <button
            v-for="(d, i) in AD_DURATIONS" :key="d.value" type="button"
            class="opt" :class="{ on: state.duration === d.value }" :style="{ '--i': i }" :disabled="picking"
            @click="pickDuration(d.value)"
          >
            <span class="opt__t">{{ d.label }}</span>
            <span class="opt__h">{{ d.hint }}</span>
          </button>
        </div>
        <button class="back" type="button" @click="go('goal')">← Cambiar objetivo</button>
      </div>

      <!-- Paso 3 -->
      <form v-else-if="state.stage === 'details'" class="card" @submit.prevent="submitDetails">
        <h2>Datos mínimos para recomendarte bien</h2>
        <Fill :done="detailsFill.done" :total="detailsFill.total" />
        <div class="grid">
          <label>Marca / empresa<input v-model.trim="state.brand" type="text" required placeholder="Nombre comercial" /></label>
          <label>Web o Instagram<input v-model.trim="state.website" type="text" placeholder="https://… o @usuario" /></label>
          <label>Categoría
            <select v-model="state.category" required>
              <option value="" disabled>Elige una</option>
              <option v-for="c in AD_CATEGORIES" :key="c.value" :value="c.value">{{ c.label }}</option>
            </select>
          </label>
          <label>País principal
            <select v-model="state.country">
              <option v-for="c in AD_COUNTRIES" :key="c" :value="c">{{ c }}</option>
            </select>
          </label>
          <label>Fecha tentativa de inicio<input v-model="state.start_date" type="date" :min="today" /></label>
          <label>Presupuesto mensual estimado
            <select v-model="state.budget" required>
              <option value="" disabled>Elige un rango</option>
              <option v-for="b in AD_BUDGETS" :key="b.value" :value="b.value">{{ b.label }}</option>
            </select>
          </label>
          <template v-if="state.duration >= 6">
            <label>Tu cargo<input v-model.trim="state.role" type="text" required placeholder="Ej. Gerente de marketing" /></label>
            <label>¿Eres quien decide la compra?
              <select v-model="state.decision_power" required>
                <option value="" disabled>Elige</option>
                <option value="decision_maker">Sí, decido yo</option>
                <option value="co_decision_maker">Participo en la decisión</option>
                <option value="influencer">No, la decide otra persona</option>
              </select>
            </label>
            <label>¿Compites con alguna marca que ya nos auspicia?
              <select v-model="state.exclusivity_conflict" required>
                <option value="" disabled>Elige</option>
                <option value="none">No, que yo sepa</option>
                <option value="possible">Puede ser, revísenlo</option>
                <option value="unknown">No lo sé</option>
              </select>
            </label>
          </template>
          <label v-if="state.goal === 'especial'" class="grid__full">Cuéntanos qué tienes en mente
            <textarea v-model.trim="state.special_notes" rows="3" placeholder="Formato, idea, fecha…"></textarea>
          </label>
        </div>
        <div class="row">
          <button class="back" type="button" @click="go('duration')">← Atrás</button>
          <button class="btn btn--dark" type="submit" :disabled="thinking">
            <template v-if="thinking"><i class="spin" aria-hidden="true"></i> Armando tu recomendación</template>
            <template v-else>Ver mi recomendación <span>→</span></template>
          </button>
        </div>
      </form>
      </Transition>
    </section>

    <!-- ══ RESULTADO ══════════════════════════════════════════ -->
    <section v-else-if="state.stage === 'result'" class="pub__wrap pub__wrap--wide">
      <p class="pub__eyebrow">Recomendación para {{ state.brand }}</p>
      <h2 class="pub__h2">{{ resultTitle }}</h2>
      <p class="pub__muted">{{ laneCopy }}</p>

      <div v-if="needsManualReview" class="notice">
        Tu campaña necesita una revisión rápida antes del pago. Ya tenemos toda tu información; no necesitas agendar una reunión.
      </div>

      <div class="products">
        <article
          v-for="(p, i) in recommendations" :key="p.product_id"
          class="prod" :style="{ '--i': i }" :class="{ on: selectedProduct?.product_id === p.product_id }"
          @click="state.selected_product = p.product_id"
        >
          <header>
            <span v-if="p.featured" class="prod__tag">Más solicitado</span>
            <h3>{{ p.name }}</h3>
            <p class="prod__result">{{ p.result }}</p>
          </header>
          <div class="prod__price">{{ formatPrice(p) }}</div>
          <dl>
            <dt>Entregables</dt>
            <dd><ul><li v-for="d in p.deliverables" :key="d">{{ d }}</li></ul></dd>
            <dt>Plataformas</dt><dd>{{ p.platforms.join(' · ') }}</dd>
            <dt>Frecuencia</dt><dd>{{ p.frequency }}</dd>
            <dt>Producción</dt><dd>{{ p.production_included ? 'Incluida' : 'No incluida' }}<span v-if="p.production_note"> · {{ p.production_note }}</span></dd>
            <dt>Revisiones</dt><dd>{{ p.revision_limit }}</dd>
            <dt>Métricas</dt><dd>{{ p.metrics_included.join(' · ') }}</dd>
            <dt>Alcance</dt><dd>{{ p.reach }}</dd>
            <dt>Disponibilidad</dt><dd>{{ p.availability }}</dd>
          </dl>
          <p v-if="p.min_months && state.duration < p.min_months" class="prod__warn">Requiere mínimo {{ p.min_months }} meses.</p>
          <footer>
            <button class="btn btn--dark btn--full" type="button" @click.stop="choose(p.product_id)">{{ ctaFor(p) }} <span>→</span></button>
            <button class="pub__link" type="button" @click.stop="chat.open()">Tengo una pregunta</button>
          </footer>
        </article>
      </div>

      <p v-if="recommendations.length === 0" class="pub__muted">No encontramos un formato estándar para esa combinación. Pregúntanos y lo resolvemos por escrito.</p>
      <button class="back" type="button" @click="go('details')">← Ajustar datos</button>
    </section>

    <!-- ══ CHECKOUT / PROPUESTA / KEY ACCOUNT ═════════════════ -->
    <section v-else-if="state.stage === 'checkout'" class="pub__wrap">
      <p class="pub__eyebrow">{{ lane === 'A' ? 'Comprar ahora' : lane === 'B' ? 'Recibir propuesta' : 'Cuenta estratégica' }}</p>
      <h2 class="pub__h2">{{ checkoutTitle }}</h2>

      <div class="summary">
        <div><span>Formato</span><strong>{{ selectedProduct?.name }}</strong></div>
        <div><span>Duración</span><strong>{{ state.duration }} mes{{ state.duration > 1 ? 'es' : '' }}</strong></div>
        <div><span>Inicio</span><strong>{{ state.start_date || 'Por definir' }}</strong></div>
        <div><span>Total estimado</span><strong>{{ contractValue ? 'USD ' + contractValue.toLocaleString('es-EC') : 'A cotizar' }}</strong></div>
      </div>

      <form class="card" @submit.prevent="submit">
        <Fill :done="checkoutFill.done" :total="checkoutFill.total" />
        <div class="grid">
          <label>Nombre<input v-model.trim="state.first_name" type="text" required /></label>
          <label>Apellido<input v-model.trim="state.last_name" type="text" required /></label>
          <label>Correo<input v-model.trim="state.email" type="email" required /></label>
          <label>WhatsApp<input v-model.trim="state.phone" type="tel" required placeholder="+593…" /></label>
        </div>
        <label class="check">
          <input v-model="state.accepted_terms" type="checkbox" required />
          <span>Acepto los <RouterLink to="/terminos-y-condiciones" target="_blank">términos y condiciones</RouterLink> y la <RouterLink to="/politica-de-privacidad" target="_blank">política de privacidad</RouterLink>.</span>
        </label>
        <p v-if="lane === 'A'" class="pub__fine">
          {{ needsManualReview
            ? 'Revisamos tu campaña y, si todo está bien, te enviamos el enlace de pago al correo. No necesitas agendar nada.'
            : 'Al confirmar te enviamos al correo el enlace de pago y los términos. Después completas un briefing corto aquí mismo.' }}
        </p>
        <p v-else-if="lane === 'B'" class="pub__fine">
          Generamos tu propuesta con estos datos. Andersson o Mónica la revisan en su próximo bloque comercial y la recibes por correo para firmar y pagar en línea. Sin reunión.
        </p>
        <p v-else class="pub__fine">
          Tu cuenta califica para una llamada de cierre de 25 minutos con Boscán &amp; La Moni. Al confirmar se habilita el calendario con tus datos ya cargados.
        </p>
        <div class="row">
          <button class="back" type="button" @click="go('result')">← Volver</button>
          <button class="btn btn--dark" type="submit" :disabled="sending">
            <template v-if="sending"><i class="spin" aria-hidden="true"></i> Enviando</template>
            <template v-else>{{ submitLabel }} <span>→</span></template>
          </button>
        </div>
        <button class="pub__link pub__link--center" type="button" @click="chat.open()">Tengo una pregunta antes de continuar</button>
      </form>
    </section>

    <!-- ══ BRIEFING (carril A) ═══════════════════════════════ -->
    <section v-else-if="state.stage === 'briefing'" class="pub__wrap">
      <p class="pub__eyebrow">Paso final</p>
      <h2 class="pub__h2">Briefing de tu campaña</h2>
      <p class="pub__muted">Tres respuestas y arrancamos producción.</p>
      <form class="card" @submit.prevent="finishBriefing">
        <label class="grid__full">¿Cuál es el mensaje clave que la audiencia debe recordar?
          <textarea v-model.trim="state.brief_message" rows="3" required></textarea>
        </label>
        <label class="grid__full">Enlaces a tus assets (logo, producto, referencias)
          <textarea v-model.trim="state.brief_assets" rows="2" placeholder="Drive, Dropbox, WeTransfer…"></textarea>
        </label>
        <label class="grid__full">Notas para el equipo
          <textarea v-model.trim="state.brief_notes" rows="2" placeholder="Qué evitar, tono, fechas clave…"></textarea>
        </label>
        <div class="row row--end">
          <button class="btn btn--dark" type="submit" :disabled="sending"><template v-if="sending"><i class="spin" aria-hidden="true"></i> Enviando</template>
            <template v-else>Enviar briefing <span>→</span></template></button>
        </div>
      </form>
    </section>

    <!-- ══ DONE ═══════════════════════════════════════════════ -->
    <section v-else class="pub__wrap pub__done">
      <svg class="tick" viewBox="0 0 52 52" aria-hidden="true"><circle cx="26" cy="26" r="24" /><path d="M15 27l7 7 15-16" /></svg>
      <p class="pub__eyebrow">Listo</p>
      <h2 class="pub__h2">{{ doneTitle }}</h2>
      <p class="pub__muted">{{ doneCopy }}</p>
      <div class="row row--center">
        <RouterLink v-if="state.submitted_lane === 'C'" :to="`/agendar?${agendarQuery}`" class="btn btn--dark">
          Reservar 25 min con Boscán &amp; La Moni <span>→</span>
        </RouterLink>
        <RouterLink to="/" class="btn btn--ghost">Volver al inicio</RouterLink>
      </div>
      <button class="pub__link pub__link--center" type="button" @click="restart">Armar otra campaña</button>
    </section>
    </Transition>

    <footer class="pub__foot">
      <span>Eureka Productions Cía. Ltda. · Toronto</span>
      <span><RouterLink to="/terminos-y-condiciones">Términos</RouterLink> · <RouterLink to="/politica-de-privacidad">Privacidad</RouterLink></span>
    </footer>

    <ChatConsultas />
  </div>
</template>

<script setup lang="ts">
import { computed, onMounted, ref, watch } from 'vue'
import ChatConsultas from '@/components/campana/ChatConsultas.vue'
import Fill from '@/components/campana/Relleno.vue'
import { useAdFunnel, trackAdEvent } from '@/composables/useCampana'
import { useAdChat } from '@/composables/useConsultas'
import {
  AD_GOALS, AD_DURATIONS, AD_CATEGORIES, AD_COUNTRIES, AD_BUDGETS, formatPrice,
  type AdGoal, type AdDuration, type AdProduct,
} from '@/config/catalogo'

const funnel = useAdFunnel()
const {
  state, sending, recommendations, selectedProduct, contractValue,
  lane, needsManualReview, agendarQuery, go, reset, submitCheckout, submitBriefing,
} = funnel
const chat = useAdChat()

const today = new Date().toISOString().slice(0, 10)

const isConfig  = computed(() => ['goal', 'duration', 'details'].includes(state.value.stage))
const stepIndex = computed(() => ['goal', 'duration', 'details', 'result'].indexOf(state.value.stage))
const hasProgress = computed(() => !!state.value.goal)

// ── Movimiento ───────────────────────────────────────────────────
// La dirección decide hacia dónde se desliza el paso: adelante entra por la
// derecha, atrás por la izquierda.
const ORDER = ['hero', 'goal', 'duration', 'details', 'result', 'checkout', 'briefing', 'done']
const dir = ref<'fwd' | 'back'>('fwd')
watch(() => state.value.stage, (to, from) => {
  dir.value = ORDER.indexOf(to) >= ORDER.indexOf(from) ? 'fwd' : 'back'
})
function toTop() {
  if (window.scrollY > 80) window.scrollTo({ top: 0, behavior: 'smooth' })
}

const reduceMotion = typeof window !== 'undefined' && window.matchMedia('(prefers-reduced-motion: reduce)').matches
const wait = (ms: number) => new Promise(r => setTimeout(r, reduceMotion ? 0 : ms))

/** Deja ver la opción marcada un instante antes de pasar al siguiente paso */
const picking = ref(false)
/** Pausa corta al calcular la recomendación: sin ella el salto se siente vacío */
const thinking = ref(false)

const filled = (v: unknown) => v !== '' && v !== null && v !== undefined && v !== false
const detailsFill = computed(() => {
  const s = state.value
  const req: unknown[] = [s.brand, s.category, s.budget]
  if (s.duration >= 6) req.push(s.role, s.decision_power, s.exclusivity_conflict)
  return { done: req.filter(filled).length, total: req.length }
})
const checkoutFill = computed(() => {
  const s = state.value
  const req: unknown[] = [s.first_name, s.last_name, s.email, s.phone, s.accepted_terms]
  return { done: req.filter(filled).length, total: req.length }
})

function start() { go('goal') }
function resume() { go(state.value.goal && state.value.duration ? (state.value.brand ? 'result' : 'details') : 'goal') }
function restart() { reset(); go('hero') }

async function pickGoal(g: AdGoal) {
  if (picking.value) return
  picking.value = true
  state.value.goal = g
  trackAdEvent('ad_goal_selected', { goal: g })
  await wait(280)
  picking.value = false
  go('duration')
}
async function pickDuration(d: AdDuration) {
  if (picking.value) return
  picking.value = true
  state.value.duration = d
  await wait(280)
  picking.value = false
  go('details')
}
async function submitDetails() {
  if (thinking.value) return
  thinking.value = true
  state.value.selected_product = ''
  await wait(850)
  thinking.value = false
  go('result')
}
function choose(id: string) {
  state.value.selected_product = id
  go('checkout')
}

async function submit() {
  await submitCheckout()
  if (lane.value === 'A' && !needsManualReview.value) go('briefing')
  else go('done')
}
async function finishBriefing() {
  await submitBriefing()
  go('done')
}

const resultTitle = computed(() =>
  recommendations.value.length > 1 ? 'Dos formatos que encajan. Elige uno.' : 'El formato que encaja.')

const laneCopy = computed(() => {
  if (lane.value === 'A') return 'Campaña puntual: se compra aquí mismo, sin reunión.'
  if (lane.value === 'B') return 'Contrato de varios meses: te enviamos una propuesta automática, revisada por Andersson o Mónica, para firmar y pagar en línea.'
  return 'Tu cuenta califica como estratégica. Completamos tus datos y al final se habilita una llamada de cierre de 25 minutos.'
})

const primaryCta = computed(() =>
  lane.value === 'A' ? 'Comprar ahora' : lane.value === 'B' ? 'Recibir propuesta' : 'Continuar')

/** Un formato sin precio fijo o fuera de autoservicio no se "compra": se cotiza */
function ctaFor(p: AdProduct) {
  if (lane.value === 'A' && (!p.self_serve_enabled || p.price === null)) return 'Pedir cotización'
  return primaryCta.value
}

const checkoutTitle = computed(() =>
  lane.value === 'A' ? 'Confirma y te enviamos el pago.' : lane.value === 'B' ? 'Tu propuesta, sin reunión.' : 'Último paso antes de la llamada.')

const submitLabel = computed(() =>
  lane.value === 'A' ? (needsManualReview.value ? 'Enviar para revisión' : 'Comprar ahora')
  : lane.value === 'B' ? 'Recibir propuesta' : 'Habilitar calendario')

const doneTitle = computed(() => {
  const l = state.value.submitted_lane
  if (l === 'A') return needsManualReview.value ? 'Recibido. Revisamos y te escribimos.' : 'Campaña confirmada.'
  if (l === 'B') return 'Propuesta en camino.'
  return 'Calendario habilitado.'
})
const doneCopy = computed(() => {
  const l = state.value.submitted_lane
  if (l === 'A') return needsManualReview.value
    ? 'Tu campaña pasa por una revisión rápida. Si todo está bien, recibes el enlace de pago por correo en el próximo bloque comercial.'
    : 'Te enviamos al correo el enlace de pago, los términos y el estado de producción. Con el briefing listo, arrancamos.'
  if (l === 'B') return 'Andersson o Mónica revisan tu propuesta en su próximo bloque comercial. La recibes por correo con firma y pago en línea. Si tienes dudas mientras tanto, usa "Tengo una pregunta".'
  return 'Elige un espacio de 25 minutos. Ya tenemos todos tus datos: la llamada es para cerrar, no para empezar de cero.'
})

onMounted(() => {
  // Si venimos con progreso y estamos en un paso incompleto, no saltar el hero.
  if (state.value.stage === 'done' && !state.value.submitted_lane) state.value.stage = 'hero'
})
</script>

<style lang="scss" scoped>
$red: #c8392b;
$ink: #0b0b0b;
$muted: rgba(11,11,11,.58);
$line: rgba(0,0,0,.09);

.pub {
  min-height: 100svh; display: flex; flex-direction: column; background: #fbfbfa; color: $ink;
  font-family: 'DM Sans', sans-serif; -webkit-font-smoothing: antialiased;

  &__bar {
    // altura mínima y no fija: si el usuario agranda la letra del navegador, la
    // barra crece y el menú baja de línea en vez de salirse de la pantalla
    position: sticky; top: 0; z-index: 50; min-height: 56px; display: flex; align-items: center; justify-content: space-between;
    flex-wrap: wrap; gap: 8px 16px; padding: 8px clamp(16px, 3vw, 40px);
    background: rgba(251,251,250,.85); backdrop-filter: blur(10px); border-bottom: 1px solid $line;
  }
  &__brand { font-family: 'Playfair Display', serif; font-size: 1.52rem; color: inherit; text-decoration: none; span { color: $red; } }
  &__nav {
    display: flex; align-items: center; flex-wrap: wrap; gap: 8px 22px;
    a, button { font: inherit; font-size: 1.14rem; letter-spacing: .2em; text-transform: uppercase; color: $muted; text-decoration: none; background: none; border: 0; cursor: pointer; &:hover { color: $red; } }
    button { color: $ink; }
  }

  &__eyebrow { font-size: 1.14rem; letter-spacing: .3em; text-transform: uppercase; color: $red; margin: 0 0 14px; }
  &__h2 { font-family: 'Playfair Display', serif; font-weight: 500; font-size: clamp(1.84rem, 3.4vw, 2.5rem); line-height: 1.1; margin: 0 0 10px; }
  &__muted { color: $muted; margin: 0 0 26px; max-width: 60ch; line-height: 1.55; }
  &__fine { font-size: 1.23rem; color: $muted; line-height: 1.55; margin: 14px 0 0; }

  &__hero {
    flex: 1; display: flex; flex-direction: column; align-items: center; justify-content: center; text-align: center;
    padding: clamp(60px, 10vh, 120px) 20px 60px;
    h1 { font-family: 'Playfair Display', serif; font-weight: 500; font-size: clamp(2.41rem, 6vw, 4.75rem); line-height: 1.02; margin: 0 0 22px; letter-spacing: -.01em; span { color: $red; } }
  }
  &__lead { font-size: clamp(1.38rem, 1.5vw, 1.52rem); line-height: 1.55; color: rgba(11,11,11,.72); margin: 0 0 36px; }
  &__hero-ctas { display: flex; flex-direction: column; align-items: center; gap: 16px; }
  &__proof {
    list-style: none; padding: 0; margin: 60px 0 0; display: flex; flex-wrap: wrap; justify-content: center; gap: 10px 36px;
    font-size: 1.19rem; letter-spacing: .12em; text-transform: uppercase; color: $muted;
    strong { display: block; font-family: 'Playfair Display', serif; font-size: 1.84rem; color: $ink; letter-spacing: 0; text-transform: none; margin-bottom: 2px; }
  }
  &__resume {
    margin-top: 36px; font-size: 1.23rem; color: $muted;
    button { font: inherit; background: none; border: 0; color: $ink; text-decoration: underline; cursor: pointer; }
  }
  &__link {
    font: inherit; font-size: 1.19rem; letter-spacing: .14em; text-transform: uppercase; color: $muted; background: none; border: 0; cursor: pointer;
    border-bottom: 1px solid transparent; padding-bottom: 2px; &:hover { color: $red; border-color: $red; }
    &--center { display: block; margin: 18px auto 0; }
  }

  &__wrap { width: min(760px, 92vw); margin: 0 auto; padding: clamp(36px, 6vh, 64px) 0 80px; flex: 1; &--wide { width: min(1040px, 92vw); } }
  &__done { text-align: center; .pub__muted { margin-left: auto; margin-right: auto; } }

  &__foot {
    display: flex; justify-content: space-between; flex-wrap: wrap; gap: 8px; padding: 18px clamp(16px, 3vw, 40px); padding-right: max(210px, 3vw);
    border-top: 1px solid $line; font-size: 1.14rem; letter-spacing: .12em; text-transform: uppercase; color: $muted;
    a { color: inherit; text-decoration: none; &:hover { color: $red; } }
  }
}

.btn {
  display: inline-flex; align-items: center; gap: 14px; padding: 16px 28px; border-radius: 8px; border: 1px solid $ink;
  font-family: 'Cormorant Garamond', serif; font-weight: 600; text-transform: uppercase; letter-spacing: .18em; font-size: 1.38rem;
  cursor: pointer; text-decoration: none; transition: transform .3s cubic-bezier(.2,.8,.2,1), box-shadow .3s ease;
  span { transition: transform .3s cubic-bezier(.2,.8,.2,1); }
  &:hover { transform: translateY(-2px); span { transform: translateX(6px); } }
  &:disabled { opacity: .55; cursor: default; transform: none; }
  &--dark { background: $ink; color: #fff; box-shadow: 0 14px 30px rgba(0,0,0,.18); }
  &--ghost { background: transparent; color: $ink; }
  &--full { width: 100%; justify-content: center; }
}

.steps {
  list-style: none; padding: 0; margin: 0 0 32px; display: flex; gap: 6px;
  li {
    flex: 1; font-size: 1.12rem; letter-spacing: .18em; text-transform: uppercase; color: rgba(11,11,11,.35); padding-top: 10px; border-top: 2px solid rgba(0,0,0,.08);
    &.done { border-color: $ink; color: $ink; }
    &.on { border-color: $red; color: $ink; }
  }
}

.card {
  background: #fff; border: 1px solid $line; border-radius: 14px; padding: clamp(22px, 3vw, 36px); box-shadow: 0 10px 30px rgba(0,0,0,.04);
  h2 { font-family: 'Playfair Display', serif; font-weight: 500; font-size: clamp(1.66rem, 2.6vw, 2.03rem); margin: 0 0 22px; line-height: 1.15; }
}

.opts {
  display: grid; grid-template-columns: repeat(2, 1fr); gap: 12px;
  &--3 { grid-template-columns: repeat(3, 1fr); }
  @media (max-width: 640px) { grid-template-columns: 1fr !important; }
}
.opt {
  text-align: left; background: #fbfbfa; border: 1px solid $line; border-radius: 10px; padding: 18px 18px 16px; cursor: pointer; font: inherit; color: inherit;
  display: flex; flex-direction: column; gap: 6px; transition: border-color .2s, transform .2s, box-shadow .2s;
  &:hover { border-color: $ink; transform: translateY(-2px); box-shadow: 0 10px 24px rgba(0,0,0,.06); }
  &.on { border-color: $red; box-shadow: 0 0 0 1px $red inset; }
  &__t { font-family: 'Playfair Display', serif; font-size: 1.42rem; line-height: 1.2; }
  &__h { font-size: 1.21rem; color: $muted; line-height: 1.45; }
}

.grid {
  display: grid; grid-template-columns: repeat(2, 1fr); gap: 16px 18px;
  @media (max-width: 640px) { grid-template-columns: 1fr; }
  &__full { grid-column: 1 / -1; }
}
label {
  display: flex; flex-direction: column; gap: 6px; font-size: 1.16rem; letter-spacing: .1em; text-transform: uppercase; color: $muted;
  input, select, textarea {
    font: inherit; font-family: 'DM Sans', sans-serif; font-size: 1.33rem; letter-spacing: 0; text-transform: none; color: $ink;
    padding: 12px 14px; border: 1px solid rgba(0,0,0,.14); border-radius: 8px; background: #fff; outline: none;
    &:focus { border-color: $ink; }
  }
  textarea { resize: vertical; }
}
.check {
  flex-direction: row; align-items: flex-start; gap: 10px; margin-top: 18px; text-transform: none; letter-spacing: 0; font-size: 1.23rem; color: rgba(11,11,11,.75);
  input { width: 16px; height: 16px; margin-top: 2px; }
  a { color: $ink; }
}
.row {
  display: flex; align-items: center; justify-content: space-between; gap: 14px; margin-top: 26px; flex-wrap: wrap;
  &--end { justify-content: flex-end; } &--center { justify-content: center; }
}
.back { font: inherit; font-size: 1.19rem; letter-spacing: .12em; text-transform: uppercase; color: $muted; background: none; border: 0; cursor: pointer; padding: 8px 0; margin-top: 18px; &:hover { color: $ink; } }
.row .back { margin-top: 0; }

.notice { background: #fff6f5; border: 1px solid rgba(200,57,43,.25); color: #7a1f15; border-radius: 10px; padding: 14px 16px; font-size: 1.28rem; line-height: 1.5; margin-bottom: 22px; }

.products { display: grid; grid-template-columns: repeat(auto-fit, minmax(300px, 1fr)); gap: 18px; margin-bottom: 8px; }
.prod {
  background: #fff; border: 1px solid $line; border-radius: 16px; padding: clamp(20px, 2.6vw, 30px); display: flex; flex-direction: column; gap: 16px; cursor: pointer;
  transition: border-color .2s, box-shadow .25s, transform .25s;
  &:hover { transform: translateY(-3px); box-shadow: 0 18px 40px rgba(0,0,0,.07); }
  &.on { border-color: $ink; }
  h3 { font-family: 'Playfair Display', serif; font-weight: 500; font-size: 1.66rem; margin: 6px 0 4px; line-height: 1.15; }
  &__tag { font-size: 1.09rem; letter-spacing: .2em; text-transform: uppercase; color: $red; }
  &__result { color: $muted; font-size: 1.28rem; margin: 0; line-height: 1.45; }
  &__price { font-family: 'Playfair Display', serif; font-size: 1.84rem; padding: 12px 0; border-top: 1px solid $line; border-bottom: 1px solid $line; }
  &__warn { font-size: 1.21rem; color: $red; margin: 0; }
  // Etiqueta arriba y valor abajo: con la letra en rem una columna fija de
  // etiquetas se desborda sobre los valores al agrandar el texto.
  dl { margin: 0; display: flex; flex-direction: column; font-size: 1.26rem; line-height: 1.45;
    dt { font-size: 1.12rem; letter-spacing: .14em; text-transform: uppercase; color: $muted; margin-top: .9rem;
      &:first-child { margin-top: 0; } }
    dd { margin: .15rem 0 0; ul { margin: 0; padding-left: 1.1em; } }
  }
  footer { margin-top: auto; display: flex; flex-direction: column; align-items: center; gap: 12px; }
}

.summary {
  display: grid; grid-template-columns: repeat(auto-fit, minmax(140px, 1fr)); gap: 12px; margin: 0 0 22px;
  div { background: #fff; border: 1px solid $line; border-radius: 10px; padding: 12px 14px; display: flex; flex-direction: column; gap: 4px;
    span { font-size: 1.09rem; letter-spacing: .16em; text-transform: uppercase; color: $muted; } strong { font-weight: 500; font-size: 1.28rem; } }
}
// ── Movimiento ───────────────────────────────────────────────────
$ease: cubic-bezier(.2,.8,.2,1);

// Cambio de etapa (hero → configurador → resultado → checkout…)
.stage-fwd-enter-active, .stage-back-enter-active { transition: opacity .45s $ease, transform .45s $ease, filter .45s $ease; }
.stage-fwd-leave-active, .stage-back-leave-active { transition: opacity .22s ease-in, transform .22s ease-in, filter .22s ease-in; }
.stage-fwd-enter-from  { opacity: 0; transform: translateY(24px); filter: blur(4px); }
.stage-fwd-leave-to    { opacity: 0; transform: translateY(-14px); filter: blur(3px); }
.stage-back-enter-from { opacity: 0; transform: translateY(-24px); filter: blur(4px); }
.stage-back-leave-to   { opacity: 0; transform: translateY(14px); filter: blur(3px); }

// Pasos del configurador: adelante entra por la derecha, atrás por la izquierda
.step-fwd-enter-active, .step-back-enter-active { transition: opacity .4s $ease, transform .4s $ease; }
.step-fwd-leave-active, .step-back-leave-active { transition: opacity .2s ease-in, transform .2s ease-in; }
.step-fwd-enter-from  { opacity: 0; transform: translateX(40px); }
.step-fwd-leave-to    { opacity: 0; transform: translateX(-28px); }
.step-back-enter-from { opacity: 0; transform: translateX(-40px); }
.step-back-leave-to   { opacity: 0; transform: translateX(28px); }

// Barra de avance continua sobre las etiquetas de pasos
.meter {
  height: 3px; border-radius: 3px; background: rgba(0,0,0,.07); overflow: hidden; margin-bottom: -2px;
  span { display: block; height: 100%; background: $red; transform-origin: left; transition: transform .6s $ease; }
}
.steps li { transition: color .35s ease, border-color .35s ease; }

// Entrada escalonada: `backwards` y no `both`, para que al terminar la
// animación no pise el transform del hover.
@keyframes rise { from { opacity: 0; transform: translateY(16px); } to { opacity: 1; transform: none; } }

.opt {
  position: relative;
  animation: rise .5s $ease backwards; animation-delay: calc(var(--i, 0) * 70ms + 120ms);
  &:disabled { cursor: default; }
  &:disabled:not(.on) { opacity: .5; transform: none; box-shadow: none; }
  &.on::after {
    content: ''; position: absolute; inset: -1px; border-radius: inherit; border: 2px solid $red; pointer-events: none;
    animation: ring .55s ease-out forwards;
  }
  &.on .opt__t { color: $red; }
  .opt__t { transition: color .2s ease; }
}
@keyframes ring { from { opacity: .9; transform: scale(1); } to { opacity: 0; transform: scale(1.06); } }

.grid > * { animation: rise .45s $ease backwards; }
@for $n from 1 through 12 {
  .grid > :nth-child(#{$n}) { animation-delay: #{80 + $n * 45}ms; }
}
label {
  transition: color .2s ease;
  &:focus-within { color: $ink; }
  input, select, textarea { transition: border-color .2s ease, box-shadow .25s ease; }
  input:focus, select:focus, textarea:focus { box-shadow: 0 0 0 4px rgba(200,57,43,.1); }
}

.summary > div { animation: rise .45s $ease backwards; }
@for $n from 1 through 4 {
  .summary > :nth-child(#{$n}) { animation-delay: #{60 + $n * 60}ms; }
}

.prod { animation: rise .6s $ease backwards; animation-delay: calc(var(--i, 0) * 140ms + 200ms); }
.notice { animation: rise .45s $ease backwards .1s; }

.pub__hero > * { animation: rise .7s $ease backwards; }
@for $n from 1 through 6 {
  .pub__hero > :nth-child(#{$n}) { animation-delay: #{$n * 90}ms; }
}

// Spinner de botón
.spin {
  width: 1em; height: 1em; border-radius: 50%; border: 2px solid rgba(255,255,255,.3); border-top-color: #fff;
  animation: spin .7s linear infinite;
}
@keyframes spin { to { transform: rotate(360deg); } }
.btn:disabled:has(.spin) { opacity: .85; }

// Check final que se dibuja
.tick {
  width: 64px; height: 64px; margin: 0 auto 18px; display: block;
  circle, path { fill: none; stroke-width: 2.5; stroke-linecap: round; stroke-linejoin: round; }
  circle { stroke: rgba(200,57,43,.25); stroke-dasharray: 151; stroke-dashoffset: 151; animation: draw .6s $ease forwards .15s; }
  path { stroke: $red; stroke-dasharray: 36; stroke-dashoffset: 36; animation: draw .4s $ease forwards .6s; }
}
@keyframes draw { to { stroke-dashoffset: 0; } }

@media (prefers-reduced-motion: reduce) {
  .stage-fwd-enter-active, .stage-back-enter-active, .stage-fwd-leave-active, .stage-back-leave-active,
  .step-fwd-enter-active, .step-back-enter-active, .step-fwd-leave-active, .step-back-leave-active { transition: opacity .15s linear; }
  .stage-fwd-enter-from, .stage-fwd-leave-to, .stage-back-enter-from, .stage-back-leave-to,
  .step-fwd-enter-from, .step-fwd-leave-to, .step-back-enter-from, .step-back-leave-to { transform: none; filter: none; }
  .opt, .grid > *, .summary > div, .prod, .notice, .pub__hero > *, .opt.on::after { animation: none; }
  .tick circle, .tick path { animation: none; stroke-dashoffset: 0; }
  .meter span { transition: none; }
}
</style>
