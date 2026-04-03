<template>
  <section class="mk-section p1" ref="sectionEl">
    <div class="p1__bg" ref="bgEl"></div>
    <div class="p1__overlay"></div>
    <div class="p1__top-rule" ref="ruleEl"></div>

    <div class="p1__content" ref="contentEl">
      <div class="p1__eyebrow" ref="eyebrowEl">Media Kit · EUREKA Media EC · 2026</div>
      <h1 class="p1__title" ref="titleEl">
        BOSCÁN<span class="amp"> &amp; </span><span class="moni">LA MONI</span>
      </h1>
      <p class="p1__tagline" ref="taglineEl">"Cuento historias que otros no." — Andersson y Moni Boscán</p>

      <div class="p1__ctas" ref="ctasEl">
        <button class="p1__cta p1__cta--ghost" @click="scrollToSection('perfil')">
          <i class="fa-solid fa-users"></i>
          Quiero saber quiénes son
        </button>
        <button class="p1__cta p1__cta--solid" @click="scrollToSection('form')">
          <i class="fa-solid fa-handshake"></i>
          Quiero publicidad con ustedes
        </button>
      </div>

      <div class="p1__stats">
        <div class="p1__stat" v-for="(stat, i) in stats" :key="stat.label" :class="{ 'p1__stat--last': i === stats.length - 1 }">
          <div class="p1__stat-icon-wrap">
            <i :class="stat.icon" class="p1__stat-icon"></i>
          </div>
          <div class="p1__stat-body">
            <div class="p1__stat-n">{{ stat.number }}</div>
            <div class="p1__stat-l">{{ stat.label }}</div>
          </div>
        </div>
      </div>

      <div class="p1__foot" ref="footEl">
        <div class="p1__byline">Periodismo · Investigación · Toronto, Canadá</div>
        <div class="p1__emails">
          <span class="p1__email">andersson@otr.com.ec</span>
          <span class="p1__email">monica@otr.com.ec</span>
        </div>
      </div>
    </div>

    <div class="p1__scroll-hint" ref="scrollHintEl">
      <span>Descubre más</span>
      <div class="p1__scroll-line"></div>
    </div>
  </section>
</template>

<script setup lang="ts">
import { ref, onMounted } from 'vue'
import { gsap } from 'gsap'
import { ScrollTrigger } from 'gsap/ScrollTrigger'
import { ScrollToPlugin } from 'gsap/ScrollToPlugin'
import { useLeadModal } from '@/composables/useLeadModal'

gsap.registerPlugin(ScrollTrigger, ScrollToPlugin)

const { openModal } = useLeadModal()
const sectionEl = ref<HTMLElement | null>(null)
const bgEl = ref<HTMLElement | null>(null)
const ruleEl = ref<HTMLElement | null>(null)
const eyebrowEl = ref<HTMLElement | null>(null)
const titleEl = ref<HTMLElement | null>(null)
const taglineEl = ref<HTMLElement | null>(null)
const ctasEl = ref<HTMLElement | null>(null)
const footEl = ref<HTMLElement | null>(null)
const scrollHintEl = ref<HTMLElement | null>(null)

function scrollToSection(target: 'perfil' | 'form') {
  if (target === 'form') { openModal(); return }
  const el = document.querySelector('.p2')
  if (el) gsap.to(window, { duration: 1, scrollTo: el, ease: 'power3.inOut' })
}

const stats = [
  { number: '88.7M', label: 'Alcance mensual',   icon: 'fa-solid fa-globe' },
  { number: '500K',  label: 'Reprod. diarias',   icon: 'fa-solid fa-play' },
  { number: '910K',  label: 'TikTok AB',         icon: 'fa-brands fa-tiktok' },
  { number: '404K',  label: 'X verificado',      icon: 'fa-brands fa-x-twitter' },
  { number: '9',     label: 'Formatos de pauta', icon: 'fa-solid fa-layer-group' },
]

onMounted(() => {
  const tl = gsap.timeline({ defaults: { ease: 'power3.out' } })

  // Entrance
  tl.from(ruleEl.value, { scaleX: 0, transformOrigin: 'left', duration: 1.2 })
    .from(eyebrowEl.value, { y: 20, opacity: 0, duration: 0.6 }, '-=0.6')
    .from(titleEl.value, { y: 60, opacity: 0, duration: 1, ease: 'power4.out' }, '-=0.3')
    .from(taglineEl.value, { y: 20, opacity: 0, duration: 0.7 }, '-=0.5')
    .from(ctasEl.value, { y: 20, opacity: 0, duration: 0.7 }, '-=0.3')
    .from('.p1__stat', { y: 30, opacity: 0, stagger: 0.1, duration: 0.6 }, '-=0.4')
    .from(footEl.value, { y: 20, opacity: 0, duration: 0.6 }, '-=0.3')
    .from(scrollHintEl.value, { opacity: 0, duration: 0.8 }, '-=0.2')

  // Scroll hint loop
  gsap.to('.p1__scroll-line', {
    scaleY: 0.3,
    transformOrigin: 'bottom',
    repeat: -1,
    yoyo: true,
    duration: 1.2,
    ease: 'power1.inOut',
  })

  // Parallax on scroll
  ScrollTrigger.create({
    trigger: sectionEl.value,
    start: 'top top',
    end: 'bottom top',
    scrub: true,
    onUpdate: (self) => {
      if (bgEl.value) {
        gsap.set(bgEl.value, { yPercent: self.progress * 30 })
      }
    },
  })
})
</script>

<style lang="scss" scoped>
.p1 {
  position: relative;
  min-height: 100vh;
  display: flex;
  align-items: flex-end;
  overflow: hidden;

  &__bg {
    position: absolute;
    inset: -10%;
    background: url('/images/p1-cover.png') center / cover no-repeat;
    will-change: transform;
  }

  &__overlay {
    position: absolute;
    inset: 0;
    background: linear-gradient(
      to top,
      rgba(8,8,8,0.95) 0%,
      rgba(8,8,8,0.55) 45%,
      rgba(8,8,8,0.2) 100%
    );
  }

  &__top-rule {
    position: absolute;
    top: 0;
    left: 0;
    right: 0;
    height: 4px;
    background: var(--mk-red);
    transform-origin: left;
  }

  &__content {
    position: relative;
    z-index: 2;
    width: 100%;
    min-width: 0;
    padding: 0 clamp(16px, 5vw, 60px) clamp(40px, 8vh, 80px);
    box-sizing: border-box;
  }

  &__eyebrow {
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
    font-size: clamp(48px, 13vw, 160px);
    line-height: 0.9;
    letter-spacing: 0.01em;
    color: var(--mk-cream);
    margin-bottom: 24px;

    .amp {
      color: var(--mk-red);
    }

    .moni {
      color: var(--mk-gold);
    }
  }

  &__tagline {
    font-family: 'Playfair Display', serif;
    font-style: italic;
    font-size: clamp(13px, 3vw, 20px);
    color: var(--mk-dim);
    margin-bottom: 32px;
    max-width: 100%;
  }

  // ── STATS ─────────────────────────────────────────────────────
  &__stats {
    display: grid;
    grid-template-columns: repeat(5, 1fr);
    gap: 0;
    margin-bottom: 40px;
    border-top: 1px solid rgba(245,242,237,0.1);
    border-bottom: 1px solid rgba(245,242,237,0.1);
    width: 100%;
    min-width: 0;

    @media (max-width: 1024px) {
      grid-template-columns: 1fr 1fr;
      border-top: 1px solid rgba(245,242,237,0.1);
      border-bottom: none;
      gap: 0;
    }
  }

  &__stat {
    display: flex;
    align-items: center;
    gap: 12px;
    padding: 16px 12px;
    border-right: 1px solid rgba(245,242,237,0.1);
    min-width: 0;

    &:last-child { border-right: none; }

    @media (max-width: 1024px) {
      padding: 16px 14px;
      border-right: none;
      border-bottom: 1px solid rgba(245,242,237,0.1);

      // 5th card spans full row
      &--last { grid-column: 1 / -1; }
    }
  }

  &__stat-icon-wrap {
    width: 34px;
    height: 34px;
    border-radius: 8px;
    background: rgba(201,168,76,0.08);
    border: 1px solid rgba(201,168,76,0.18);
    display: flex;
    align-items: center;
    justify-content: center;
    flex-shrink: 0;
  }

  &__stat-icon {
    font-size: 13px;
    color: var(--mk-gold);
  }

  &__stat-body {
    display: flex;
    flex-direction: column;
    min-width: 0;
    overflow: hidden;
  }

  &__stat-n {
    font-family: 'Bebas Neue', sans-serif;
    font-size: clamp(18px, 2.2vw, 30px);
    color: var(--mk-cream);
    line-height: 1;
    letter-spacing: 0.02em;
  }

  &__stat-l {
    font-family: 'DM Sans', sans-serif;
    font-size: 9px;
    letter-spacing: 0.1em;
    text-transform: uppercase;
    color: var(--mk-gold);
    margin-top: 3px;
    opacity: 0.8;
    white-space: nowrap;
    overflow: hidden;
    text-overflow: ellipsis;
  }

  &__foot {
    display: flex;
    align-items: flex-start;
    gap: 16px;
    flex-wrap: wrap;
  }

  &__byline {
    font-family: 'DM Sans', sans-serif;
    font-size: 13px;
    color: var(--mk-dimmer);
    letter-spacing: 0.08em;
  }

  &__emails {
    display: flex;
    gap: 16px;
    flex-wrap: wrap;
  }

  &__email {
    font-family: 'DM Sans', sans-serif;
    font-size: 13px;
    color: var(--mk-dim);
    border-bottom: 1px solid rgba(245,242,237,0.2);
    padding-bottom: 2px;
  }

  &__scroll-hint {
    position: absolute;
    bottom: 40px;
    right: clamp(16px, 4vw, 48px);
    display: flex;
    flex-direction: column;
    align-items: center;
    gap: 12px;
    z-index: 2;

    @media (max-width: 1024px) { display: none; }

    span {
      font-family: 'DM Sans', sans-serif;
      font-size: 10px;
      letter-spacing: 0.25em;
      text-transform: uppercase;
      color: var(--mk-dimmer);
      writing-mode: vertical-rl;
    }
  }

  &__scroll-line {
    width: 1px;
    height: 60px;
    background: linear-gradient(to bottom, var(--mk-red), transparent);
  }

  // ── CTAs ─────────────────────────────────────────────────────
  &__ctas {
    display: flex;
    gap: 16px;
    margin-bottom: 40px;
    flex-wrap: wrap;
  }

  &__cta {
    display: inline-flex;
    align-items: center;
    gap: 10px;
    padding: 14px 28px;
    border-radius: 4px;
    font-family: 'DM Sans', sans-serif;
    font-size: 14px;
    font-weight: 700;
    letter-spacing: 0.06em;
    text-transform: uppercase;
    cursor: pointer;
    transition: all 0.3s ease;

    i { font-size: 13px; }

    &--ghost {
      background: transparent;
      border: 1px solid rgba(245,242,237,0.35);
      color: var(--mk-cream);

      &:hover {
        border-color: var(--mk-gold);
        color: var(--mk-gold);
        background: rgba(201,168,76,0.07);
        transform: translateY(-2px);
      }
    }

    &--solid {
      background: var(--mk-red);
      border: 1px solid var(--mk-red);
      color: var(--mk-cream);

      &:hover {
        background: #a82d22;
        border-color: #a82d22;
        transform: translateY(-2px);
        box-shadow: 0 8px 24px rgba(200,57,43,0.35);
      }
    }
  }
}
</style>
