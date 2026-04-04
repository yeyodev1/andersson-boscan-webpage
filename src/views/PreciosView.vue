<template>
  <div class="pv">

    <!-- ── HEADER ───────────────────────────────────────────────── -->
    <div class="pv__topbar">
      <router-link to="/" class="pv__back">
        <i class="fa-solid fa-arrow-left"></i> Volver al Media Kit
      </router-link>
      <div class="pv__brand">BOSCÁN &amp; LA MONI · 2026</div>
    </div>

    <!-- ── GATE: contact form ────────────────────────────────────── -->
    <Transition name="pv-fade" mode="out-in">
      <div v-if="!unlocked" key="gate" class="pv__gate">
        <div class="pv__gate-card">
          <div class="pv__gate-eyebrow">Tarifas 2026</div>
          <h1 class="pv__gate-title">TARIFAS &amp;<br>FORMATOS</h1>
          <p class="pv__gate-sub">
            Para acceder a nuestra tabla de tarifas, déjanos tus datos.
            Te responderemos en menos de 24 horas con una propuesta personalizada.
          </p>

          <div class="pv__gate-form">
            <div class="pv__gate-row">
              <div class="pv__field">
                <label class="pv__label">Nombre</label>
                <input v-model="gform.nombre" class="pv__input" type="text" placeholder="Tu nombre" />
              </div>
              <div class="pv__field">
                <label class="pv__label">Apellido</label>
                <input v-model="gform.apellido" class="pv__input" type="text" placeholder="Tu apellido" />
              </div>
            </div>
            <div class="pv__field">
              <label class="pv__label">Correo electrónico</label>
              <input v-model="gform.correo" class="pv__input" type="email" placeholder="tu@empresa.com" />
            </div>
            <div class="pv__field">
              <label class="pv__label">Teléfono</label>
              <input v-model="gform.telefono" class="pv__input" type="tel" placeholder="+593 999 000 000" />
            </div>
            <div class="pv__field pv__field--confirm">
              <label class="pv__label pv__label--confirm">
                <i class="fa-solid fa-building"></i>
                Para continuar, escribe el nombre de tu marca o empresa:
              </label>
              <div class="pv__input-wrap">
                <input
                  v-model="gform.empresa"
                  class="pv__input"
                  :class="{ 'pv__input--ok': empresaOk }"
                  type="text"
                  placeholder="Ej: Coca-Cola Ecuador, Clínica San Francisco…"
                />
                <i v-if="empresaOk" class="fa-solid fa-circle-check pv__input-ok-icon"></i>
              </div>
            </div>

            <div v-if="gateError" class="pv__error">
              <i class="fa-solid fa-triangle-exclamation"></i> {{ gateError }}
            </div>

            <button class="pv__btn" :disabled="!canSubmit || sending" @click="submitGate">
              <span v-if="!sending">
                Ver tarifas <i class="fa-solid fa-arrow-right"></i>
              </span>
              <span v-else>
                <i class="fa-solid fa-circle-notch fa-spin"></i> Un momento…
              </span>
            </button>
          </div>

          <p class="pv__gate-note">
            <i class="fa-solid fa-lock"></i>
            Tus datos son confidenciales y nunca se comparten con terceros.
          </p>
        </div>
      </div>
    </Transition>

    <!-- ── PRICES: full table ────────────────────────────────────── -->
    <Transition name="pv-fade" mode="out-in">
      <div v-if="unlocked" key="prices" class="pv__prices">
        <div class="pv__prices-hero">
          <div class="pv__prices-eyebrow">Tarifas 2026 · Eurekaproductions</div>
          <h1 class="pv__prices-title">FORMATOS &amp;<br>TARIFAS</h1>
          <p class="pv__prices-sub">
            Todas las tarifas son en USD. Los paquetes de larga duración tienen condiciones especiales.
            Escríbenos para una propuesta personalizada.
          </p>
        </div>

        <div class="pv__table-wrap">
          <table class="pv__table">
            <thead>
              <tr>
                <th>Formato</th>
                <th>Descripción</th>
                <th>Alcance</th>
                <th class="pv__th-price">Tarifa (USD)</th>
              </tr>
            </thead>
            <tbody>
              <tr v-for="row in pricingRows" :key="row.name" :class="{ 'pv__tr-star': row.star }">
                <td>
                  <div class="pv__tf-name">
                    <span v-if="row.star" class="pv__star-badge">⭐ Destacado</span>
                    {{ row.name }}
                  </div>
                </td>
                <td class="pv__tf-desc">{{ row.desc }}</td>
                <td class="pv__tf-reach">{{ row.reach }}</td>
                <td class="pv__tf-price-cell">
                  <div class="pv__price">{{ row.price }}</div>
                  <div class="pv__price-unit">{{ row.unit }}</div>
                </td>
              </tr>
            </tbody>
          </table>
        </div>

        <div class="pv__footnotes">
          <div class="pv__fn">
            <i class="fa-solid fa-circle-info"></i>
            Los paquetes multicanal y contratos ≥ 3 meses tienen hasta 20% de descuento.
          </div>
          <div class="pv__fn">
            <i class="fa-solid fa-circle-info"></i>
            Contrato mínimo de 6 meses para el Comercial IA y el paquete de video culinario.
          </div>
        </div>

        <div class="pv__cta-section">
          <p class="pv__cta-text">¿Lista para dar el siguiente paso?</p>
          <p class="pv__cta-sub">
            {{ storedContact ? `Hola de nuevo, ${storedContact.nombre}. Agenda tu llamada directamente.` : 'Agenda una llamada estratégica con el equipo.' }}
          </p>
          <button class="pv__btn pv__btn--cta" @click="goToMeeting">
            <i class="fa-solid fa-calendar-check"></i>
            {{ storedContact ? 'Agendar mi llamada →' : 'Agendar una llamada →' }}
          </button>
          <div class="pv__emails">
            <a href="mailto:andersson@otr.com.ec" class="pv__email">
              <i class="fa-solid fa-envelope"></i> andersson@otr.com.ec
            </a>
            <a href="mailto:monica@otr.com.ec" class="pv__email">
              <i class="fa-solid fa-envelope"></i> monica@otr.com.ec
            </a>
          </div>
        </div>
      </div>
    </Transition>

  </div>
</template>

<script setup lang="ts">
import { ref, computed, onMounted } from 'vue'
import { useRouter } from 'vue-router'
import axios from 'axios'

const router = useRouter()
const STORAGE_KEY = 'mk_contact_given'

const unlocked       = ref(false)
const sending        = ref(false)
const gateError      = ref('')
const storedContact  = ref<{ nombre: string; apellido: string; correo: string; telefono: string } | null>(null)

const gform = ref({
  nombre:   '',
  apellido: '',
  correo:   '',
  telefono: '',
  empresa:  '',
})

const empresaOk = computed(() => gform.value.empresa.trim().length >= 3)

const canSubmit = computed(() =>
  gform.value.nombre.trim() &&
  gform.value.apellido.trim() &&
  gform.value.correo.trim() &&
  gform.value.telefono.trim() &&
  empresaOk.value
)

onMounted(() => {
  const stored = localStorage.getItem(STORAGE_KEY)
  if (stored) {
    try {
      const data = JSON.parse(stored)
      storedContact.value = data
      if (data.nombre)   gform.value.nombre   = data.nombre
      if (data.apellido) gform.value.apellido = data.apellido
      if (data.correo)   gform.value.correo   = data.correo
      if (data.telefono) gform.value.telefono = data.telefono
      unlocked.value = true
    } catch {
      unlocked.value = true
    }
  }
})

function goToMeeting() {
  const contact = storedContact.value ?? {
    nombre:   gform.value.nombre,
    apellido: gform.value.apellido,
    correo:   gform.value.correo,
    telefono: gform.value.telefono,
  }
  const params = new URLSearchParams({
    firstName: contact.nombre   || '',
    lastName:  contact.apellido || '',
    email:     contact.correo   || '',
    phone:     contact.telefono || '',
  })
  router.push(`/agendar?${params.toString()}`)
}

async function submitGate() {
  gateError.value = ''
  sending.value = true
  try {
    await axios.post(
      import.meta.env.VITE_GHL_WEBHOOK_CONTACT as string,
      {
        firstName:  gform.value.nombre,
        lastName:   gform.value.apellido,
        email:      gform.value.correo,
        phone:      gform.value.telefono,
        empresa:    gform.value.empresa,
        source:     'Página de Tarifas 2026',
        page_url:   window.location.href,
        timestamp:  new Date().toISOString(),
      }
    )
  } catch {
    // Non-blocking: unlock anyway
  } finally {
    sending.value = false
  }

  localStorage.setItem(STORAGE_KEY, JSON.stringify({
    nombre:   gform.value.nombre,
    apellido: gform.value.apellido,
    correo:   gform.value.correo,
    telefono: gform.value.telefono,
  }))

  unlocked.value = true
}

const pricingRows = [
  {
    name:  'Comercial IA Ultrarealista en el Programa',
    desc:  'Producción completa con IA. Distribución en YT · FB · IG · TikTok · Spotify. 22 ep/mes. Mínimo 6 meses. Solo 5 marcas simultáneas.',
    reach: '~10M impresiones/mes',
    price: '$3,000',
    unit:  '/mes',
    star:  true,
  },
  {
    name:  'Diario de Boscán para la Marca',
    desc:  'El intro viral diario de Andersson relata una historia donde tu marca aparece de forma sutil. No parece publicidad — porque no lo es.',
    reach: '~500K reprod.',
    price: '$3,000',
    unit:  'única vez',
    star:  false,
  },
  {
    name:  'TikTok Patrocinado',
    desc:  'Video 30–90 seg. Audiencia 18–35 años. Mayor viralidad del portafolio. Guion por nuestro equipo, aprobado por el tuyo.',
    reach: '~200K reprod.',
    price: '$2,500',
    unit:  'por video',
    star:  false,
  },
  {
    name:  'Video Culinario · 1 video/mes',
    desc:  'Andersson + Mónica. Publicado simultáneamente en ambos canales YT + TikTok.',
    reach: '+1M reprod.',
    price: '$2,000',
    unit:  '/mes',
    star:  false,
  },
  {
    name:  'Video Culinario · Paquete mensual',
    desc:  '2 videos al mes en ambos canales. Mayor exposición y presencia continua. Mínimo 6 meses.',
    reach: '+2M reprod./mes',
    price: '$2,000',
    unit:  '/mes · 2 videos',
    star:  false,
  },
  {
    name:  'Video Dedicado YouTube',
    desc:  'Video completo en el que explicamos algo a la audiencia, alineado a los valores de tu marca.',
    reach: '100K vistas/día canal',
    price: '$1,200',
    unit:  'única vez',
    star:  false,
  },
  {
    name:  'Auspiciante Exclusivo Podcast Boscán · Spotify',
    desc:  'Mención exclusiva al inicio de los 22 episodios del mes. Sin competencia — único auspiciante.',
    reach: '+150K reprod./mes',
    price: '$1,200',
    unit:  '/mes',
    star:  false,
  },
  {
    name:  'Plan PYMEs · Leads Automatizados',
    desc:  'Mención en Reel + automatización de DM. Cada comentario genera un lead directo a tu WhatsApp o sitio web.',
    reach: '200–500 leads directos',
    price: '$1,500',
    unit:  'campaña única',
    star:  false,
  },
  {
    name:  'Mención Stories',
    desc:  'Recomendamos tu producto o servicio en stories si se ajusta a nuestra audiencia.',
    reach: 'Orgánico',
    price: 'Consultar',
    unit:  '',
    star:  false,
  },
]
</script>

<style lang="scss" scoped>
.pv {
  min-height: 100vh;
  background: #080808;
  color: #f5f2ed;
  font-family: 'DM Sans', sans-serif;

  // ── TOPBAR ────────────────────────────────────────────────────
  &__topbar {
    position: sticky;
    top: 0;
    z-index: 100;
    display: flex;
    align-items: center;
    justify-content: space-between;
    padding: 16px clamp(20px, 5vw, 60px);
    background: rgba(8,8,8,0.92);
    backdrop-filter: blur(16px);
    border-bottom: 1px solid rgba(245,242,237,0.07);
  }

  &__back {
    display: inline-flex;
    align-items: center;
    gap: 8px;
    font-size: 13px;
    color: rgba(245,242,237,0.5);
    text-decoration: none;
    transition: color 0.2s;
    &:hover { color: #f5f2ed; }
    i { font-size: 12px; }
  }

  &__brand {
    font-family: 'Bebas Neue', sans-serif;
    font-size: 16px;
    letter-spacing: 0.08em;
    color: rgba(245,242,237,0.3);
  }

  // ── GATE ──────────────────────────────────────────────────────
  &__gate {
    min-height: calc(100vh - 57px);
    display: flex;
    align-items: center;
    justify-content: center;
    padding: clamp(32px, 6vh, 64px) 20px;
  }

  &__gate-card {
    background: #111;
    border: 1px solid rgba(245,242,237,0.08);
    border-radius: 16px;
    padding: clamp(36px, 5vw, 56px);
    max-width: 560px;
    width: 100%;
    box-shadow: 0 32px 80px rgba(0,0,0,0.5);
  }

  &__gate-eyebrow {
    font-size: 11px;
    letter-spacing: 0.35em;
    text-transform: uppercase;
    color: #c9a84c;
    font-weight: 700;
    margin-bottom: 14px;
  }

  &__gate-title {
    font-family: 'Bebas Neue', sans-serif;
    font-size: clamp(2.4rem, 6vw, 3.6rem);
    line-height: 0.95;
    color: #f5f2ed;
    margin: 0 0 16px;
  }

  &__gate-sub {
    font-size: 15px;
    color: rgba(245,242,237,0.5);
    line-height: 1.65;
    margin: 0 0 32px;
  }

  &__gate-form {
    display: flex;
    flex-direction: column;
    gap: 16px;
  }

  &__gate-row {
    display: grid;
    grid-template-columns: 1fr 1fr;
    gap: 16px;
    @media (max-width: 480px) { grid-template-columns: 1fr; }
  }

  &__field {
    display: flex;
    flex-direction: column;
    gap: 6px;

    &--confirm {
      margin-top: 4px;
      padding-top: 20px;
      border-top: 1px solid rgba(245,242,237,0.07);
    }
  }

  &__label {
    font-size: 11px;
    font-weight: 700;
    letter-spacing: 0.15em;
    text-transform: uppercase;
    color: rgba(245,242,237,0.4);

    &--confirm {
      color: rgba(245,242,237,0.55);
      display: flex;
      align-items: center;
      gap: 6px;
      i { color: #c9a84c; }
    }
  }

  &__input-wrap {
    position: relative;
  }

  &__input {
    width: 100%;
    background: #0d0d0d;
    border: 1px solid rgba(245,242,237,0.1);
    border-radius: 8px;
    padding: 14px 16px;
    color: #f5f2ed;
    font-family: 'DM Sans', sans-serif;
    font-size: 15px;
    outline: none;
    box-sizing: border-box;
    transition: border-color 0.2s, box-shadow 0.2s;

    &:focus { border-color: #c9a84c; }
    &::placeholder { color: rgba(245,242,237,0.22); }

    &--ok {
      border-color: #2ecc71;
      padding-right: 44px;
    }
  }

  &__input-ok-icon {
    position: absolute;
    right: 14px;
    top: 50%;
    transform: translateY(-50%);
    color: #2ecc71;
    font-size: 16px;
    pointer-events: none;
  }

  &__error {
    background: rgba(200,57,43,0.1);
    border: 1px solid rgba(200,57,43,0.3);
    border-radius: 8px;
    padding: 12px 16px;
    color: #e87a6e;
    font-size: 14px;
    display: flex;
    align-items: center;
    gap: 8px;
  }

  &__btn {
    width: 100%;
    background: #c8392b;
    border: 2px solid #c8392b;
    border-radius: 8px;
    color: #f5f2ed;
    font-family: 'Bebas Neue', sans-serif;
    font-size: 1.4rem;
    letter-spacing: 0.06em;
    padding: 18px;
    cursor: pointer;
    transition: all 0.25s;
    display: flex;
    align-items: center;
    justify-content: center;
    gap: 10px;
    margin-top: 4px;

    &:hover:not(:disabled) {
      background: transparent;
      color: #c8392b;
    }

    &:disabled {
      opacity: 0.4;
      cursor: not-allowed;
    }

    &--cta {
      max-width: 420px;
      font-size: 1.2rem;
    }
  }

  &__gate-note {
    font-size: 12px;
    color: rgba(245,242,237,0.25);
    text-align: center;
    margin: 16px 0 0;
    display: flex;
    align-items: center;
    justify-content: center;
    gap: 6px;
    i { font-size: 11px; }
  }

  // ── PRICES ────────────────────────────────────────────────────
  &__prices {
    padding-bottom: clamp(60px, 10vh, 100px);
  }

  &__prices-hero {
    padding: clamp(48px, 8vh, 80px) clamp(20px, 6vw, 80px) clamp(32px, 5vh, 56px);
    border-bottom: 1px solid rgba(245,242,237,0.07);
  }

  &__prices-eyebrow {
    font-size: 11px;
    letter-spacing: 0.35em;
    text-transform: uppercase;
    color: #c9a84c;
    font-weight: 700;
    margin-bottom: 14px;
  }

  &__prices-title {
    font-family: 'Bebas Neue', sans-serif;
    font-size: clamp(3rem, 8vw, 6rem);
    line-height: 0.92;
    color: #f5f2ed;
    margin: 0 0 20px;
  }

  &__prices-sub {
    font-size: 16px;
    color: rgba(245,242,237,0.5);
    line-height: 1.65;
    max-width: 600px;
    margin: 0;
  }

  &__table-wrap {
    padding: 0 clamp(20px, 6vw, 80px);
    margin-top: 40px;
    overflow-x: auto;
  }

  &__table {
    width: 100%;
    border-collapse: collapse;
    font-size: 15px;

    th {
      font-size: 11px;
      font-weight: 700;
      letter-spacing: 0.18em;
      text-transform: uppercase;
      color: rgba(245,242,237,0.35);
      padding: 12px 16px;
      text-align: left;
      border-bottom: 2px solid rgba(245,242,237,0.08);
    }

    td {
      padding: 20px 16px;
      border-bottom: 1px solid rgba(245,242,237,0.06);
      vertical-align: top;
    }

    tbody tr {
      transition: background 0.2s;
      &:hover { background: rgba(245,242,237,0.02); }
      &:last-child td { border-bottom: none; }
    }
  }

  &__th-price {
    text-align: right !important;
    white-space: nowrap;
  }

  &__tr-star {
    background: rgba(200,57,43,0.04);
    border-left: 3px solid #c8392b;
  }

  &__star-badge {
    display: inline-block;
    background: rgba(200,57,43,0.15);
    border: 1px solid rgba(200,57,43,0.3);
    border-radius: 3px;
    font-size: 10px;
    font-weight: 700;
    letter-spacing: 0.05em;
    padding: 2px 8px;
    color: #f5f2ed;
    margin-bottom: 4px;
    margin-right: 4px;
  }

  &__tf-name {
    font-weight: 700;
    font-size: 15px;
    color: #f5f2ed;
    line-height: 1.4;
  }

  &__tf-desc {
    font-size: 13px;
    color: rgba(245,242,237,0.45);
    line-height: 1.6;
    max-width: 340px;
  }

  &__tf-reach {
    font-size: 13px;
    color: #c9a84c;
    font-weight: 600;
    white-space: nowrap;
  }

  &__tf-price-cell {
    text-align: right;
    white-space: nowrap;
  }

  &__price {
    font-family: 'Bebas Neue', sans-serif;
    font-size: 1.7rem;
    color: #f5f2ed;
    line-height: 1;
  }

  &__price-unit {
    font-size: 11px;
    color: rgba(245,242,237,0.35);
    letter-spacing: 0.05em;
    margin-top: 3px;
  }

  &__footnotes {
    padding: 28px clamp(20px, 6vw, 80px) 0;
    display: flex;
    flex-direction: column;
    gap: 8px;
  }

  &__fn {
    font-size: 13px;
    color: rgba(245,242,237,0.3);
    display: flex;
    align-items: flex-start;
    gap: 8px;
    i { color: #c9a84c; flex-shrink: 0; margin-top: 2px; }
  }

  &__cta-section {
    margin-top: 56px;
    padding: 56px clamp(20px, 6vw, 80px);
    border-top: 1px solid rgba(245,242,237,0.07);
    display: flex;
    flex-direction: column;
    align-items: flex-start;
    gap: 20px;
  }

  &__cta-text {
    font-family: 'Bebas Neue', sans-serif;
    font-size: clamp(1.8rem, 4vw, 2.8rem);
    color: #f5f2ed;
    margin: 0;
  }

  &__cta-sub {
    font-family: 'DM Sans', sans-serif;
    font-size: 15px;
    color: rgba(245,242,237,0.45);
    margin: 0;
    line-height: 1.5;
  }

  &__emails {
    display: flex;
    gap: 24px;
    flex-wrap: wrap;
  }

  &__email {
    font-size: 14px;
    color: rgba(245,242,237,0.45);
    text-decoration: none;
    display: flex;
    align-items: center;
    gap: 7px;
    transition: color 0.2s;
    &:hover { color: #f5f2ed; }
    i { font-size: 12px; }
  }
}

// ── TRANSITION ────────────────────────────────────────────────
.pv-fade-enter-active,
.pv-fade-leave-active { transition: opacity 0.35s ease, transform 0.35s ease; }
.pv-fade-enter-from   { opacity: 0; transform: translateY(16px); }
.pv-fade-leave-to     { opacity: 0; transform: translateY(-8px); }
</style>
