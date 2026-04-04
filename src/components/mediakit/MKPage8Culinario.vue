<template>
  <section class="mk-section p8" ref="sectionEl">
    <div class="p8__bg" ref="bgEl"></div>
    <div class="p8__overlay"></div>

    <div class="p8__inner">
      <div class="p8__left" ref="leftEl">
        <div class="p8__badge">Andersson y Moni + Mónica · Ambos canales</div>
        <h2 class="p8__title">CONTENIDO<br>CULINARIO</h2>
        <p class="p8__desc">
          Dos periodistas de investigación que también cocinan. Publicado simultáneamente en ambos canales.
          Una marca, dos audiencias, más de un millón de reproducciones.
        </p>
      </div>

      <div class="p8__right" ref="rightEl">
        <div class="p8__option" v-for="opt in options" :key="opt.label" :class="{ 'p8__option--gold': opt.gold }">

          <div class="p8__opt-label" :style="opt.gold ? { color: 'var(--mk-gold)' } : {}">{{ opt.label }}</div>
          <div class="p8__opt-row">
            <div class="p8__opt-desc">{{ opt.desc }}</div>
          </div>
          <div class="p8__opt-reach">{{ opt.reach }}</div>
        </div>
        <button class="p8__cta-btn" @click="openModal">
          <i class="fa-solid fa-arrow-right"></i> Me interesa este formato
        </button>
      </div>
    </div>
  </section>
</template>

<script setup lang="ts">
import { ref, onMounted } from 'vue'
import { gsap } from 'gsap'
import { ScrollTrigger } from 'gsap/ScrollTrigger'
import { useLeadModal } from '@/composables/useLeadModal'

gsap.registerPlugin(ScrollTrigger)

const { openModal } = useLeadModal()
const sectionEl = ref<HTMLElement | null>(null)
const bgEl      = ref<HTMLElement | null>(null)
const leftEl    = ref<HTMLElement | null>(null)

const options = [
  {
    label: 'Opción A · Video único',
    desc: '1 video al mes con mención de marca. Publicado en ambos canales YT + TikTok.',
    reach: '+1M reproducciones totales promedio por video',
    gold: false,
  },
  {
    label: 'Opción B · Paquete mensual · Mínimo 6 meses',
    desc: '2 videos al mes con mención de marca. Mayor exposición y presencia continua.',
    reach: '+2M reproducciones totales promedio al mes',
    gold: true,
  },
]

onMounted(() => {
  // Parallax
  ScrollTrigger.create({
    trigger: sectionEl.value,
    start: 'top bottom',
    end: 'bottom top',
    scrub: true,
    onUpdate: (self) => {
      if (bgEl.value) gsap.set(bgEl.value, { yPercent: self.progress * 25 })
    },
  })

  const tl = gsap.timeline({
    scrollTrigger: { trigger: sectionEl.value, start: 'top 70%', once: true },
    defaults: { ease: 'power3.out' },
  })

  tl.from(leftEl.value?.children ?? [], { y: 40, opacity: 0, stagger: 0.15, duration: 0.8 })
    .from('.p8__option', { y: 40, opacity: 0, stagger: 0.2, duration: 0.8 }, '-=0.4')
    .from('.p8__opt-price', { scale: 0.8, opacity: 0, stagger: 0.15, duration: 0.5 }, '-=0.3')
})
</script>

<style lang="scss" scoped>
.p8 {
  position: relative;
  min-height: 100vh;
  display: flex;
  align-items: center;
  overflow: hidden;

  &__bg {
    position: absolute;
    inset: -10%;
    background: url('/images/p8-photo.png') center / cover no-repeat;
    will-change: transform;
  }

  &__overlay {
    position: absolute;
    inset: 0;
    background: rgba(8,8,8,0.85);
  }

  &__inner {
    position: relative;
    z-index: 2;
    display: flex;
    gap: 60px;
    padding: clamp(40px, 8vh, 80px) clamp(20px, 5vw, 60px);
    width: 100%;
    align-items: center;

    @media (max-width: 768px) {
      flex-direction: column;
      gap: 32px;
      align-items: stretch;
    }
  }

  &__left {
    flex: 1;
    display: flex;
    flex-direction: column;
    gap: 20px;
  }

  &__badge {
    display: inline-flex;
    align-self: flex-start;
    background: rgba(200,57,43,0.12);
    border: 1px solid rgba(200,57,43,0.35);
    color: var(--mk-cream);
    font-family: 'DM Sans', sans-serif;
    font-size: 11px;
    font-weight: 700;
    letter-spacing: 0.05em;
    padding: 6px 14px;
    border-radius: 2px;
  }

  &__title {
    font-family: 'Bebas Neue', sans-serif;
    font-size: clamp(48px, 6vw, 80px);
    line-height: 0.9;
    color: var(--mk-cream);
  }

  &__desc {
    font-family: 'DM Sans', sans-serif;
    font-size: 15px;
    color: var(--mk-dim);
    line-height: 1.7;
  }

  &__right {
    flex: 1;
    display: flex;
    flex-direction: column;
    gap: 20px;
  }

  &__option {
    padding: 24px;
    border: 1px solid rgba(245,242,237,0.1);
    border-radius: 4px;
    background: rgba(245,242,237,0.03);
    transition: border-color 0.3s, background 0.3s;

    &:hover {
      border-color: rgba(245,242,237,0.2);
      background: rgba(245,242,237,0.05);
    }

    &--gold {
      border-color: rgba(201,168,76,0.35) !important;
      background: rgba(201,168,76,0.06) !important;

      &:hover {
        border-color: rgba(201,168,76,0.55) !important;
      }
    }
  }

  &__opt-label {
    font-family: 'DM Sans', sans-serif;
    font-size: 11px;
    letter-spacing: 0.2em;
    text-transform: uppercase;
    color: var(--mk-dimmer);
    font-weight: 700;
    margin-bottom: 12px;
  }

  &__opt-row {
    display: flex;
    justify-content: space-between;
    align-items: flex-start;
    gap: 16px;
    margin-bottom: 12px;
  }

  &__opt-desc {
    font-family: 'DM Sans', sans-serif;
    font-size: 13px;
    color: var(--mk-dim);
    line-height: 1.6;
    flex: 1;
  }

  &__opt-pricing {
    text-align: right;
    flex-shrink: 0;
  }

  &__opt-price {
    font-family: 'Bebas Neue', sans-serif;
    font-size: 36px;
    color: var(--mk-cream);
    line-height: 1;

    &--gold { color: var(--mk-gold); }
  }

  &__opt-unit {
    font-family: 'DM Sans', sans-serif;
    font-size: 11px;
    color: var(--mk-dimmer);
  }

  &__opt-reach {
    font-family: 'DM Sans', sans-serif;
    font-size: 12px;
    color: rgba(200,57,43,0.7);
    font-weight: 500;
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
    margin-top: 24px;

    &:hover {
      background: transparent;
      color: var(--mk-red);
      transform: translateY(-2px);
      box-shadow: 0 8px 24px rgba(200,57,43,0.25);
    }
  }
}
</style>
