<template>
  <section class="mk-section p2" ref="sectionEl">
    <div class="p2__photo-col" ref="photoColEl">
      <div class="p2__photo-img"></div>
      <div class="p2__photo-fade"></div>
    </div>

    <div class="p2__content" ref="contentEl">
      <div class="p2__label" ref="labelEl">Por qué todos hablan de ellos</div>
      <h2 class="p2__title" ref="titleEl">
        EL PROGRAMA<br>MÁS VIRAL<br>DE LATAM
      </h2>

      <div class="p2__stats" ref="statsEl">
        <div class="p2__stat" v-for="stat in stats" :key="stat.num">
          <div class="p2__stat-n">{{ stat.num }}</div>
          <div class="p2__stat-body">
            <div class="p2__stat-title">{{ stat.title }}</div>
            <div class="p2__stat-sub">{{ stat.sub }}</div>
          </div>
        </div>
      </div>

      <div class="p2__awards" ref="awardsEl">
        <div class="p2__awards-label">Reconocimientos</div>
        <div class="p2__awards-text">
          Premio Nacional de Periodismo Digital · Candidato Emmy Latino
          · Mejor contenido noticioso · TikTok Awards Latam
        </div>
      </div>
    </div>
  </section>
</template>

<script setup lang="ts">
import { ref, onMounted } from 'vue'
import { gsap } from 'gsap'
import { ScrollTrigger } from 'gsap/ScrollTrigger'

gsap.registerPlugin(ScrollTrigger)

const sectionEl = ref<HTMLElement | null>(null)
const photoColEl = ref<HTMLElement | null>(null)
const labelEl    = ref<HTMLElement | null>(null)
const titleEl    = ref<HTMLElement | null>(null)
const awardsEl   = ref<HTMLElement | null>(null)

const stats = [
  {
    num: '#1',
    title: 'Programa noticioso matutino más seguido',
    sub: 'Lunes a viernes en YouTube, Facebook, Instagram, TikTok y Spotify. 22 episodios al mes sin interrupciones.',
  },
  {
    num: '766K',
    title: 'Vistas diarias en TikTok',
    sub: 'Tasa de alcance del 84% diario — uno de los ratios más altos del periodismo latinoamericano.',
  },
  {
    num: '13.7M',
    title: 'Vistas semanales en Instagram',
    sub: 'Alcance orgánico que multiplica 70× la base de seguidores. Sin publicidad pagada.',
  },
]

onMounted(() => {
  const tl = gsap.timeline({
    scrollTrigger: {
      trigger: sectionEl.value,
      start: 'top 70%',
      once: true,
    },
    defaults: { ease: 'power3.out' },
  })

  tl.from(photoColEl.value, { x: -80, opacity: 0, duration: 1.2 })
    .from(labelEl.value, { y: 20, opacity: 0, duration: 0.6 }, '-=0.8')
    .from(titleEl.value, { y: 50, opacity: 0, duration: 0.9 }, '-=0.5')
    .from('.p2__stat', { y: 30, opacity: 0, stagger: 0.15, duration: 0.7 }, '-=0.5')
    .from(awardsEl.value, { y: 20, opacity: 0, duration: 0.6 }, '-=0.3')
})
</script>

<style lang="scss" scoped>
.p2 {
  min-height: 100vh;
  display: flex;
  align-items: stretch;
  background: #080808;
  overflow: hidden;

  @media (max-width: 768px) {
    flex-direction: column;
  }

  &__photo-col {
    position: relative;
    width: 42%;
    flex-shrink: 0;

    @media (max-width: 768px) {
      width: 100%;
      height: 40vh;
      flex-shrink: 0;
      position: relative;
    }
  }

  &__photo-img {
    position: absolute;
    inset: 0;
    background: url('/images/p2-photo.png') center top / cover no-repeat;
  }

  &__photo-fade {
    position: absolute;
    inset: 0;
    background: linear-gradient(to right, transparent 50%, #080808 100%),
                linear-gradient(to top, #080808 0%, transparent 30%);

    @media (max-width: 768px) {
      background: linear-gradient(to bottom, transparent 40%, #080808 100%);
    }
  }

  &__content {
    position: relative;
    z-index: 2;
    flex: 1;
    display: flex;
    flex-direction: column;
    justify-content: center;
    padding: 80px 60px 80px 40px;

    @media (max-width: 768px) {
      padding: 32px 24px 48px;
    }
  }

  &__label {
    font-family: 'DM Sans', sans-serif;
    font-size: 11px;
    letter-spacing: 0.35em;
    text-transform: uppercase;
    color: var(--mk-gold);
    font-weight: 700;
    margin-bottom: 20px;
  }

  &__title {
    font-family: 'Bebas Neue', sans-serif;
    font-size: clamp(48px, 6vw, 88px);
    line-height: 0.92;
    color: var(--mk-cream);
    margin-bottom: 48px;
  }

  &__stats {
    display: flex;
    flex-direction: column;
    gap: 32px;
    margin-bottom: 40px;
  }

  &__stat {
    display: flex;
    gap: 24px;
    align-items: flex-start;
    padding-bottom: 32px;
    border-bottom: 1px solid rgba(245,242,237,0.08);

    &:last-child { border-bottom: none; padding-bottom: 0; }
  }

  &__stat-n {
    font-family: 'Bebas Neue', sans-serif;
    font-size: clamp(36px, 4.5vw, 60px);
    color: var(--mk-red);
    line-height: 1;
    min-width: clamp(60px, 12vw, 90px);
    flex-shrink: 0;
  }

  &__stat-title {
    font-family: 'DM Sans', sans-serif;
    font-weight: 700;
    font-size: 15px;
    color: var(--mk-cream);
    margin-bottom: 6px;
  }

  &__stat-sub {
    font-family: 'DM Sans', sans-serif;
    font-size: 13px;
    color: var(--mk-dim);
    line-height: 1.6;
  }

  &__awards {
    border-top: 1px solid rgba(245,242,237,0.1);
    padding-top: 24px;
  }

  &__awards-label {
    font-family: 'DM Sans', sans-serif;
    font-size: 10px;
    letter-spacing: 0.3em;
    text-transform: uppercase;
    color: var(--mk-gold);
    margin-bottom: 10px;
  }

  &__awards-text {
    font-family: 'DM Sans', sans-serif;
    font-size: 13px;
    color: var(--mk-dimmer);
    line-height: 1.7;
  }
}
</style>
