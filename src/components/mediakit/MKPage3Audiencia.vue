<template>
  <section class="mk-section p3" ref="heroEl">
    <div class="p3__hero" ref="heroEl">
      <div class="p3__hero-photo"></div>
      <div class="p3__hero-overlay"></div>
      <div class="p3__hero-text" ref="heroTextEl">
        <div class="p3__eyebrow">Audiencia</div>
        <h2 class="p3__hero-title">
          45 MILLONES DE VISTAS MENSUALES<br>LO QUE TU INVERSIÓN ALCANZA
        </h2>
      </div>
    </div>

    <div class="p3__grid" ref="gridEl">
      <div class="p3__card" v-for="card in cards" :key="card.label">
        <i :class="card.icon" class="p3__card-icon"></i>
        <div class="p3__card-n">{{ card.number }}</div>
        <div class="p3__card-l">{{ card.label }}</div>
        <div class="p3__card-s">{{ card.sub }}</div>
        <div class="p3__card-rule"></div>
      </div>
    </div>
  </section>
</template>

<script setup lang="ts">
import { ref, onMounted } from 'vue'
import { gsap } from 'gsap'
import { ScrollTrigger } from 'gsap/ScrollTrigger'

gsap.registerPlugin(ScrollTrigger)

const heroEl     = ref<HTMLElement | null>(null)
const heroTextEl = ref<HTMLElement | null>(null)
const gridEl     = ref<HTMLElement | null>(null)

const cards = [
  { number: '1.07M',  label: 'Vistas/día TikTok',        sub: '95.4% audiencia recurrente · pico de 3.6M en un solo día.', icon: 'fa-brands fa-tiktok' },
  { number: '100K',   label: 'Vistas/día YouTube',        sub: 'CTR del 9.93% · promedio de 20 min por vista. Audiencia que termina lo que empieza.', icon: 'fa-brands fa-youtube' },
  { number: '317K',   label: 'Espectadores/día Facebook', sub: '1.55M interacciones en 65 días.', icon: 'fa-brands fa-facebook' },
  { number: '47.5K',  label: 'Clics directos Instagram',  sub: 'Clics directos en enlace en 65 días. Tráfico real.', icon: 'fa-brands fa-instagram' },
  { number: '100K+',  label: 'Horas en Spotify / 90 días',sub: '100,460 horas de consumo — escuchan completo. 85,000 oyentes.', icon: 'fa-brands fa-spotify' },
  { number: '+390K',  label: 'Nuevos seguidores / 90 días',sub: 'En todas las plataformas combinadas — sin publicidad pagada.', icon: 'fa-solid fa-users' },
]

onMounted(() => {
  // Hero parallax
  ScrollTrigger.create({
    trigger: heroEl.value,
    start: 'top bottom',
    end: 'bottom top',
    scrub: true,
    onUpdate: (self) => {
      const photo = heroEl.value?.querySelector('.p3__hero-photo') as HTMLElement
      if (photo) gsap.set(photo, { yPercent: self.progress * 20 })
    },
  })

  // Hero text entrance
  gsap.from(heroTextEl.value?.children ?? [], {
    scrollTrigger: { trigger: heroEl.value, start: 'top 75%', once: true },
    y: 40, opacity: 0, stagger: 0.15, duration: 0.9, ease: 'power3.out',
  })

  // Grid cards stagger
  gsap.from('.p3__card', {
    scrollTrigger: { trigger: gridEl.value, start: 'top 80%', once: true },
    y: 50, opacity: 0, stagger: { amount: 0.7, from: 'start' },
    duration: 0.7, ease: 'power3.out',
  })

  // Card rule expansion
  gsap.from('.p3__card-rule', {
    scrollTrigger: { trigger: gridEl.value, start: 'top 75%', once: true },
    scaleX: 0, transformOrigin: 'left',
    stagger: 0.1, duration: 0.8, ease: 'power2.out',
    delay: 0.3,
  })
})
</script>

<style lang="scss" scoped>
.p3 {
  background: #080808;
  overflow: hidden;

  &__hero {
    position: relative;
    height: 55vh;
    min-height: 360px;
    overflow: hidden;
  }

  &__hero-photo {
    position: absolute;
    inset: -10%;
    background: url('/images/p3-hero.png') center / cover no-repeat;
    will-change: transform;
  }

  &__hero-overlay {
    position: absolute;
    inset: 0;
    background: linear-gradient(
      to bottom,
      rgba(8,8,8,0.3) 0%,
      rgba(8,8,8,0.85) 100%
    );
  }

  &__hero-text {
    position: absolute;
    bottom: 48px;
    left: 60px;
    right: 60px;
    z-index: 2;
  }

  &__eyebrow {
    font-family: 'DM Sans', sans-serif;
    font-size: 11px;
    letter-spacing: 0.35em;
    text-transform: uppercase;
    color: var(--mk-gold);
    font-weight: 700;
    margin-bottom: 16px;
  }

  &__hero-title {
    font-family: 'Bebas Neue', sans-serif;
    font-size: clamp(36px, 5vw, 72px);
    line-height: 0.95;
    color: var(--mk-cream);
  }

  &__grid {
    display: grid;
    grid-template-columns: repeat(3, 1fr);
    gap: 0;
    padding: 0;

    @media (max-width: 768px) {
      grid-template-columns: 1fr 1fr;
    }

    @media (max-width: 480px) {
      grid-template-columns: 1fr;
    }
  }

  &__card {
    padding: clamp(28px, 4vw, 44px) clamp(20px, 4vw, 40px);
    border-right: 1px solid rgba(245,242,237,0.06);
    border-bottom: 1px solid rgba(245,242,237,0.06);
    position: relative;
    overflow: hidden;
    transition: background 0.4s;

    &:hover {
      background: rgba(200, 57, 43, 0.04);
      .p3__card-rule { background: var(--mk-red); }
    }

    &:nth-child(3n) { border-right: none; }
    &:nth-child(n+4) { border-bottom: none; }

    @media (max-width: 768px) {
      &:nth-child(3n) { border-right: 1px solid rgba(245,242,237,0.06); }
      &:nth-child(2n) { border-right: none; }
      &:nth-child(n+4) { border-bottom: 1px solid rgba(245,242,237,0.06); }
      &:nth-child(n+5) { border-bottom: none; }
    }

    @media (max-width: 480px) {
      border-right: none !important;
      &:last-child { border-bottom: none; }
    }
  }

  &__card-icon {
    font-size: 22px;
    color: var(--mk-gold);
    opacity: 0.7;
    margin-bottom: 12px;
    display: block;
  }

  &__card-n {
    font-family: 'Bebas Neue', sans-serif;
    font-size: clamp(44px, 5vw, 64px);
    color: var(--mk-cream);
    line-height: 1;
    margin-bottom: 8px;
  }

  &__card-l {
    font-family: 'DM Sans', sans-serif;
    font-weight: 700;
    font-size: 13px;
    letter-spacing: 0.05em;
    text-transform: uppercase;
    color: var(--mk-gold);
    margin-bottom: 10px;
  }

  &__card-s {
    font-family: 'DM Sans', sans-serif;
    font-size: 15px;
    color: var(--mk-dim);
    line-height: 1.6;
    margin-bottom: 16px;
  }

  &__card-rule {
    height: 2px;
    width: 40px;
    background: rgba(245,242,237,0.15);
    transition: background 0.3s;
  }
}
</style>
