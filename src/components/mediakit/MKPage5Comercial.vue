<template>
  <section class="mk-section p5" ref="sectionEl">
    <div class="p5__bg" ref="bgEl"></div>
    <div class="p5__overlay"></div>

    <div class="p5__inner">
      <!-- IA Comercial -->
      <div class="p5__col p5__col--ia" ref="iaColEl">
        <div class="p5__badge"><i class="fa-solid fa-robot"></i> El espacio estrella — solo 5 cupos</div>
        <h2 class="p5__title">COMERCIAL IA<br>ULTRAREALISTA<br>EN EL PROGRAMA</h2>
        <p class="p5__body">
          Producción cinematográfica generada con inteligencia artificial, integrada en el programa de mañanas.
          Tu marca frente a 500,000 personas todos los días en 5 plataformas simultáneas. Mínimo 6 meses.
        </p>
        <ul class="p5__list">
          <li>Producción completa del comercial con IA incluida</li>
          <li>Distribución en YT · FB · IG · TikTok · Spotify cada día</li>
          <li>22 episodios al mes · rotación diaria garantizada</li>
          <li>Reporte mensual de alcance e impresiones</li>
          <li>Solo 5 marcas simultáneas · exclusividad de categoría</li>
        </ul>
        <div class="p5__price-box">
          <div class="p5__price">$3,000</div>
          <div class="p5__price-unit">USD / mes · mínimo 6 meses</div>
        </div>
        <div class="p5__reach">~10M impresiones estimadas por mes</div>
        <div class="p5__cupos"><i class="fa-solid fa-triangle-exclamation"></i> Solo quedan 5 cupos disponibles</div>
      </div>

      <div class="p5__separator" ref="separatorEl"></div>

      <!-- Spotify -->
      <div class="p5__col p5__col--spotify" ref="spotifyColEl">
        <div class="p5__badge p5__badge--gold"><i class="fa-brands fa-spotify"></i> Podcast Boscán · Patrocinador único</div>
        <h2 class="p5__spotify-title">AUSPICIANTE EXCLUSIVO<br>DEL PODCAST BOSCÁN</h2>
        <p class="p5__body">
          Tu marca como único patrocinador de los 22 episodios mensuales en Spotify. Mención al inicio
          de cada episodio. 85,000 oyentes que escuchan completo — 94,900 horas de consumo en los últimos 90 días.
        </p>
        <ul class="p5__list">
          <li>Mención exclusiva al inicio de cada episodio</li>
          <li>Sin competencia — eres el único auspiciante del mes</li>
          <li>+5,341 nuevos seguidores en 90 días — canal en explosión</li>
        </ul>
        <div class="p5__price-box p5__price-box--gold">
          <div class="p5__price p5__price--gold">$1,200</div>
          <div class="p5__price-unit">USD / mes</div>
        </div>
        <div class="p5__spotify-foot">85K reproducciones mensuales verificadas</div>
      </div>
    </div>
  </section>
</template>

<script setup lang="ts">
import { ref, onMounted } from 'vue'
import { gsap } from 'gsap'
import { ScrollTrigger } from 'gsap/ScrollTrigger'

gsap.registerPlugin(ScrollTrigger)

const sectionEl   = ref<HTMLElement | null>(null)
const bgEl        = ref<HTMLElement | null>(null)
const iaColEl     = ref<HTMLElement | null>(null)
const separatorEl = ref<HTMLElement | null>(null)
const spotifyColEl = ref<HTMLElement | null>(null)

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

  tl.from(iaColEl.value, { x: -50, opacity: 0, duration: 1 })
    .from(separatorEl.value, { scaleY: 0, transformOrigin: 'top', duration: 0.8 }, '-=0.5')
    .from(spotifyColEl.value, { x: 50, opacity: 0, duration: 1 }, '-=0.7')
    .from('.p5__price-box', { scale: 0.9, opacity: 0, stagger: 0.15, duration: 0.6 }, '-=0.5')
    .from('.p5__badge', { y: -10, opacity: 0, stagger: 0.1, duration: 0.5 }, 0.2)
})
</script>

<style lang="scss" scoped>
.p5 {
  position: relative;
  min-height: 100vh;
  display: flex;
  align-items: center;
  overflow: hidden;

  &__bg {
    position: absolute;
    inset: -10%;
    background: url('/images/p5-photo.jpg') center / cover no-repeat;
    will-change: transform;
  }

  &__overlay {
    position: absolute;
    inset: 0;
    background: rgba(8,8,8,0.88);
  }

  &__inner {
    position: relative;
    z-index: 2;
    display: flex;
    gap: 0;
    width: 100%;
    padding: clamp(40px, 8vh, 80px) clamp(20px, 5vw, 60px);
    min-height: 100vh;
    align-items: center;

    @media (max-width: 768px) {
      flex-direction: column;
      align-items: stretch;
      padding: 48px 24px;
    }
  }

  &__col {
    flex: 1;
    display: flex;
    flex-direction: column;
    gap: 20px;
  }

  &__separator {
    width: 1px;
    background: rgba(245,242,237,0.12);
    align-self: stretch;
    margin: 0 48px;
    flex-shrink: 0;

    @media (max-width: 768px) {
      width: 100%;
      height: 1px;
      margin: 8px 0 24px;
      align-self: auto;
    }
  }

  &__badge {
    display: inline-flex;
    align-self: flex-start;
    background: rgba(200,57,43,0.15);
    border: 1px solid rgba(200,57,43,0.4);
    color: var(--mk-cream);
    font-family: 'DM Sans', sans-serif;
    font-size: 11px;
    font-weight: 700;
    letter-spacing: 0.05em;
    padding: 6px 14px;
    border-radius: 2px;

    &--gold {
      background: rgba(201,168,76,0.12);
      border-color: rgba(201,168,76,0.4);
    }
  }

  &__title,
  &__spotify-title {
    font-family: 'Bebas Neue', sans-serif;
    font-size: clamp(36px, 4.5vw, 60px);
    line-height: 0.95;
    color: var(--mk-cream);
  }

  &__body {
    font-family: 'DM Sans', sans-serif;
    font-size: 14px;
    color: var(--mk-dim);
    line-height: 1.7;
  }

  &__list {
    list-style: none;
    display: flex;
    flex-direction: column;
    gap: 10px;

    li {
      font-family: 'DM Sans', sans-serif;
      font-size: 13px;
      color: var(--mk-dim);
      padding-left: 18px;
      position: relative;
      line-height: 1.5;

      &::before {
        content: '—';
        position: absolute;
        left: 0;
        color: var(--mk-red);
        font-weight: 700;
      }
    }
  }

  &__price-box {
    display: flex;
    align-items: baseline;
    gap: 12px;
    border-top: 2px solid var(--mk-red);
    padding-top: 20px;
    margin-top: 8px;

    &--gold { border-color: var(--mk-gold); }
  }

  &__price {
    font-family: 'Bebas Neue', sans-serif;
    font-size: clamp(44px, 5vw, 64px);
    color: var(--mk-cream);
    line-height: 1;

    &--gold { color: var(--mk-gold); }
  }

  &__price-unit {
    font-family: 'DM Sans', sans-serif;
    font-size: 13px;
    color: var(--mk-dimmer);
    line-height: 1.4;
  }

  &__reach,
  &__cupos,
  &__spotify-foot {
    font-family: 'DM Sans', sans-serif;
    font-size: 12px;
    letter-spacing: 0.05em;
    color: var(--mk-dimmer);
  }

  &__cupos {
    color: rgba(200,57,43,0.8);
    font-weight: 700;
  }
}
</style>
