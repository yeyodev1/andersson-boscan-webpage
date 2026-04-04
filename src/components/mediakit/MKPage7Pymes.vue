<template>
  <section class="mk-section p7" ref="sectionEl">
    <div class="p7__photo-col">
      <div class="p7__photo-img"></div>
      <div class="p7__photo-fade"></div>
    </div>

    <div class="p7__content" ref="contentEl">
      <div class="p7__badge-wrap" ref="badgeEl">
        <span class="p7__badge-dot"></span>
        <span class="p7__label">Para PYMEs</span>
        <span class="p7__badge-sep">·</span>
        <span class="p7__badge-sub">Resultado medible</span>
      </div>
      <h2 class="p7__title" ref="titleEl">PUBLICIDAD REAL<br><span class="p7__title-accent">LEADS REALES</span></h2>
      <p class="p7__body">
        El único formato donde el cliente recibe contactos directos — no impresiones.
        Andersson y Moni menciona tu marca en el Reel y pide comentar una palabra clave.
        El comentario activa la automatización: cada persona recibe al instante un DM con el link de tu negocio.
      </p>

      <div class="p7__flow" ref="flowEl">
        <div class="p7__step" v-for="step in steps" :key="step.n">
          <div class="p7__step-n">
            <i :class="step.icon" class="p7__step-icon"></i>
          </div>
          <div class="p7__step-body">
            <div class="p7__step-title">{{ step.title }}</div>
            <div class="p7__step-sub">{{ step.sub }}</div>
          </div>
          <div class="p7__step-connector" v-if="step.n !== '03'"></div>
        </div>
      </div>

      <div class="p7__cta-wrap" ref="priceWrapEl">
        <div class="p7__reach">100K+ reproducciones · 200–500 leads directos · CPL de $3–$8 vs $15–$45 de Meta Ads</div>
        <button class="p7__cta-btn" @click="openModal">
          <i class="fa-solid fa-arrow-right"></i> Consultar disponibilidad
        </button>
      </div>
    </div>
  </section>
</template>

<script setup lang="ts">
import { ref, onMounted } from 'vue'
import { useLeadModal } from '@/composables/useLeadModal'
const { openModal } = useLeadModal()
import { gsap } from 'gsap'
import { ScrollTrigger } from 'gsap/ScrollTrigger'

gsap.registerPlugin(ScrollTrigger)

const sectionEl  = ref<HTMLElement | null>(null)
const titleEl    = ref<HTMLElement | null>(null)
const flowEl     = ref<HTMLElement | null>(null)
const priceWrapEl = ref<HTMLElement | null>(null)
const badgeEl    = ref<HTMLElement | null>(null)

const steps = [
  {
    n: '01',
    icon: 'fa-brands fa-instagram',
    title: 'Andersson y Moni menciona tu marca en el Reel',
    sub: 'Pide a la audiencia comentar una palabra clave específica de tu campaña.',
  },
  {
    n: '02',
    icon: 'fa-solid fa-bolt',
    title: 'El comentario activa la automatización',
    sub: 'Cada persona que comenta recibe al instante un DM automático con el link de tu negocio o WhatsApp.',
  },
  {
    n: '03',
    icon: 'fa-brands fa-whatsapp',
    title: 'El lead llega directo a tu WhatsApp o sitio web',
    sub: 'Sin fricción. Tú recibes el contacto calificado — sin intermediarios.',
  },
  {
    n: '04',
    icon: 'fa-solid fa-chart-bar',
    title: '200–500 leads directos por campaña',
    sub: 'CPL de $3–$8 vs $15–$45 del promedio de Meta Ads. Pagas por personas que ya quieren saber más.',
  },
]

onMounted(() => {
  // Photo parallax
  ScrollTrigger.create({
    trigger: sectionEl.value,
    start: 'top bottom',
    end: 'bottom top',
    scrub: true,
    onUpdate: (self) => {
      const photo = sectionEl.value?.querySelector('.p7__photo-img') as HTMLElement
      if (photo) gsap.set(photo, { yPercent: self.progress * 20 })
    },
  })

  const tl = gsap.timeline({
    scrollTrigger: { trigger: sectionEl.value, start: 'top 70%', once: true },
    defaults: { ease: 'power3.out' },
  })

  tl.from('.p7__photo-col', { x: -60, opacity: 0, duration: 1 })
    .from(badgeEl.value, { y: 20, opacity: 0, duration: 0.6 }, '-=0.7')
    .from(titleEl.value, { y: 40, opacity: 0, duration: 0.9 }, '-=0.5')
    .from('.p7__body', { y: 20, opacity: 0, duration: 0.6 }, '-=0.5')
    .from('.p7__step', {
      y: 30, opacity: 0, stagger: 0.2, duration: 0.7,
    }, '-=0.3')
    .from(priceWrapEl.value, { y: 20, opacity: 0, duration: 0.7 }, '-=0.2')

  // Animate step connectors
  gsap.from('.p7__step-connector', {
    scrollTrigger: { trigger: flowEl.value, start: 'top 75%', once: true },
    scaleY: 0, transformOrigin: 'top', stagger: 0.2, duration: 0.5, ease: 'power2.out',
    delay: 0.5,
  })
})
</script>

<style lang="scss" scoped>
.p7 {
  min-height: 100vh;
  display: flex;
  background: #080808;
  overflow: hidden;

  @media (max-width: 768px) {
    flex-direction: column;
  }

  &__photo-col {
    position: relative;
    width: 40%;
    flex-shrink: 0;

    @media (max-width: 768px) {
      width: 100%;
      height: 35vh;
      flex-shrink: 0;
    }
  }

  &__photo-img {
    position: absolute;
    inset: 0;
    background: url('/images/p7-photo.png') center / cover no-repeat;
    will-change: transform;
  }

  &__photo-fade {
    position: absolute;
    inset: 0;
    background: linear-gradient(to right, transparent 60%, #080808 100%),
                linear-gradient(to top, #080808 0%, transparent 25%);

    @media (max-width: 768px) {
      background: linear-gradient(to bottom, transparent 40%, #080808 100%);
    }
  }

  &__content {
    flex: 1;
    display: flex;
    flex-direction: column;
    justify-content: center;
    padding: 80px 60px 80px 40px;
    position: relative;
    z-index: 2;

    @media (max-width: 768px) {
      padding: 32px 24px 48px;
    }
  }

  /* Badge / label row */
  &__badge-wrap {
    display: inline-flex;
    align-items: center;
    gap: 8px;
    margin-bottom: 20px;
    background: rgba(201, 168, 76, 0.08);
    border: 1px solid rgba(201, 168, 76, 0.25);
    border-radius: 100px;
    padding: 7px 16px 7px 10px;
  }

  &__badge-dot {
    width: 8px;
    height: 8px;
    border-radius: 50%;
    background: var(--mk-gold);
    flex-shrink: 0;
    position: relative;
    animation: p7-dot-pulse 1.8s ease-in-out infinite;

    &::after {
      content: '';
      position: absolute;
      inset: -4px;
      border-radius: 50%;
      border: 1.5px solid var(--mk-gold);
      animation: p7-ring-pulse 1.8s ease-in-out infinite;
    }
  }

  &__label {
    font-family: 'DM Sans', sans-serif;
    font-size: 11px;
    letter-spacing: 0.25em;
    text-transform: uppercase;
    color: var(--mk-gold);
    font-weight: 700;
  }

  &__badge-sep {
    font-family: 'DM Sans', sans-serif;
    font-size: 11px;
    color: rgba(201, 168, 76, 0.4);
  }

  &__badge-sub {
    font-family: 'DM Sans', sans-serif;
    font-size: 11px;
    letter-spacing: 0.15em;
    text-transform: uppercase;
    color: rgba(201, 168, 76, 0.65);
    font-weight: 500;
  }

  &__title-accent {
    color: var(--mk-red);
  }

  &__title {
    font-family: 'Bebas Neue', sans-serif;
    font-size: clamp(40px, 5vw, 72px);
    line-height: 0.95;
    color: var(--mk-cream);
    margin-bottom: 20px;
  }

  &__body {
    font-family: 'DM Sans', sans-serif;
    font-size: 16px;
    color: var(--mk-dim);
    line-height: 1.7;
    margin-bottom: 40px;
  }

  &__flow {
    display: flex;
    flex-direction: column;
    gap: 0;
    margin-bottom: 40px;
    position: relative;
  }

  &__step {
    display: flex;
    gap: 20px;
    align-items: flex-start;
    padding-bottom: 28px;
    position: relative;
  }

  &__step-n {
    min-width: 44px;
    flex-shrink: 0;
  }

  &__step-icon {
    font-size: 28px;
    color: var(--mk-red);
    line-height: 1;
    display: block;
  }

  &__step-title {
    font-family: 'DM Sans', sans-serif;
    font-weight: 700;
    font-size: 16px;
    color: var(--mk-cream);
    margin-bottom: 6px;
  }

  &__step-sub {
    font-family: 'DM Sans', sans-serif;
    font-size: 15px;
    color: var(--mk-dim);
    line-height: 1.6;
  }

  &__step-connector {
    position: absolute;
    left: 21px;
    bottom: 0;
    top: 36px;
    width: 1px;
    background: linear-gradient(to bottom, var(--mk-red), transparent);
  }

  &__price-wrap {
    border-top: 1px solid rgba(245,242,237,0.1);
    padding-top: 28px;
  }

  &__price-bar {
    display: flex;
    align-items: center;
    gap: 24px;
    margin-bottom: 12px;
  }

  &__price-n {
    font-family: 'Bebas Neue', sans-serif;
    font-size: clamp(44px, 5vw, 64px);
    color: var(--mk-cream);
    line-height: 1;
  }

  &__price-unit {
    font-family: 'DM Sans', sans-serif;
    font-weight: 700;
    font-size: 14px;
    color: var(--mk-cream);
    margin-bottom: 4px;
  }

  &__price-label {
    font-family: 'DM Sans', sans-serif;
    font-size: 12px;
    color: var(--mk-dimmer);
  }

  &__reach {
    font-family: 'DM Sans', sans-serif;
    font-size: 12px;
    color: var(--mk-dimmer);
  }

  &__cta-wrap {
    display: flex;
    flex-direction: column;
    gap: 16px;
    margin-top: 32px;
    padding-top: 28px;
    border-top: 1px solid rgba(245,242,237,0.08);
  }

  &__cta-btn {
    display: inline-flex;
    align-items: center;
    gap: 10px;
    padding: 14px 32px;
    background: var(--mk-red);
    border: 2px solid var(--mk-red);
    border-radius: 4px;
    color: var(--mk-cream);
    font-family: 'DM Sans', sans-serif;
    font-size: 14px;
    font-weight: 700;
    letter-spacing: 0.08em;
    text-transform: uppercase;
    cursor: pointer;
    transition: all 0.25s;
    align-self: flex-start;

    &:hover {
      background: transparent;
      color: var(--mk-red);
      transform: translateX(4px);
    }
  }
}

@keyframes p7-dot-pulse {
  0%, 100% { opacity: 1; transform: scale(1); }
  50%       { opacity: 0.6; transform: scale(0.85); }
}

@keyframes p7-ring-pulse {
  0%   { transform: scale(1); opacity: 0.7; }
  70%  { transform: scale(2.2); opacity: 0; }
  100% { transform: scale(2.2); opacity: 0; }
}
</style>
