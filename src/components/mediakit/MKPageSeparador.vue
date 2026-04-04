<template>
  <div class="mk-sep" ref="sepEl">

    <!-- Scrolling ticker -->
    <div class="mk-sep__ticker" aria-hidden="true">
      <div class="mk-sep__ticker-track">
        <!-- Two identical halves so translateX(-50%) loops seamlessly -->
        <span v-for="n in 12" :key="`a${n}`">¿QUÉ MISMO HACEMOS?&nbsp;&nbsp;·&nbsp;&nbsp;</span>
        <span v-for="n in 12" :key="`b${n}`">¿QUÉ MISMO HACEMOS?&nbsp;&nbsp;·&nbsp;&nbsp;</span>
      </div>
    </div>

    <!-- Main content -->
    <div class="mk-sep__inner">
      <h2 class="mk-sep__title" ref="titleEl">
        <span class="mk-sep__word">¿Qué</span>
        <span class="mk-sep__word">mismo</span>
        <span class="mk-sep__word mk-sep__word--accent">hacemos?</span>
      </h2>

      <div class="mk-sep__tags" ref="tagsEl">
        <span class="mk-sep__tag" v-for="tag in tags" :key="tag.text" :class="tag.mod">
          <i :class="tag.icon" />
          {{ tag.text }}
        </span>
      </div>

      <p class="mk-sep__body" ref="bodyEl">
        El noticiero más viral de Ecuador — lunes a viernes en 5 plataformas.
        Comerciales cinematográficos con IA, auspicio en Spotify, leads directos con Plan PYMES
        y contenido culinario en ambos canales.
        Todo desde <strong>88.7 millones</strong> de alcance mensual.
      </p>

      <button class="mk-sep__cta" ref="ctaEl" @click="openModal">
        <i class="fa-solid fa-rocket"></i>
        Quiero publicidad con ustedes
      </button>
    </div>

    <!-- Bottom ticker (reverse) -->
    <div class="mk-sep__ticker mk-sep__ticker--reverse" aria-hidden="true">
      <div class="mk-sep__ticker-track">
        <span v-for="n in 8" :key="`c${n}`">88M DE ALCANCE&nbsp;&nbsp;·&nbsp;&nbsp;LEADS REALES&nbsp;&nbsp;·&nbsp;&nbsp;COMERCIAL IA&nbsp;&nbsp;·&nbsp;&nbsp;PERIODISMO VIRAL&nbsp;&nbsp;·&nbsp;&nbsp;</span>
        <span v-for="n in 8" :key="`d${n}`">88M DE ALCANCE&nbsp;&nbsp;·&nbsp;&nbsp;LEADS REALES&nbsp;&nbsp;·&nbsp;&nbsp;COMERCIAL IA&nbsp;&nbsp;·&nbsp;&nbsp;PERIODISMO VIRAL&nbsp;&nbsp;·&nbsp;&nbsp;</span>
      </div>
    </div>

  </div>
</template>

<script setup lang="ts">
import { ref, onMounted } from 'vue'
import { gsap } from 'gsap'
import { ScrollTrigger } from 'gsap/ScrollTrigger'
import { useLeadModal } from '@/composables/useLeadModal'

gsap.registerPlugin(ScrollTrigger)

const { openModal } = useLeadModal()

const sepEl  = ref<HTMLElement | null>(null)
const titleEl = ref<HTMLElement | null>(null)
const tagsEl  = ref<HTMLElement | null>(null)
const bodyEl  = ref<HTMLElement | null>(null)
const ctaEl   = ref<HTMLElement | null>(null)

const tags = [
  { text: 'Periodismo Viral',    icon: 'fa-solid fa-newspaper',  mod: '' },
  { text: 'Comercial con IA',    icon: 'fa-solid fa-robot',      mod: 'mk-sep__tag--accent' },
  { text: 'Plan PYMES · Leads',  icon: 'fa-solid fa-bolt',       mod: '' },
  { text: 'Podcast Spotify',     icon: 'fa-brands fa-spotify',   mod: '' },
  { text: 'Contenido Culinario', icon: 'fa-solid fa-utensils',   mod: '' },
]

onMounted(() => {
  const words = Array.from(titleEl.value?.querySelectorAll('.mk-sep__word') ?? [])
  const tagEls = Array.from(tagsEl.value?.querySelectorAll('.mk-sep__tag') ?? [])

  gsap.set([...words, ...tagEls, bodyEl.value, ctaEl.value].filter(Boolean), { autoAlpha: 0, y: 30 })

  ScrollTrigger.create({
    trigger: sepEl.value,
    start: 'top 80%',
    once: true,
    onEnter: () => {
      if (words.length) gsap.to(words, {
        autoAlpha: 1, y: 0, duration: 0.7, stagger: 0.12,
        ease: 'power3.out',
      })
      if (tagEls.length) gsap.to(tagEls, {
        autoAlpha: 1, y: 0, duration: 0.5, stagger: 0.08,
        ease: 'power2.out', delay: 0.4,
      })
      gsap.to(bodyEl.value, {
        autoAlpha: 1, y: 0, duration: 0.6, ease: 'power2.out', delay: 0.7,
      })
      gsap.to(ctaEl.value, {
        autoAlpha: 1, y: 0, duration: 0.6, ease: 'power2.out', delay: 0.95,
      })
    },
  })
})
</script>

<style lang="scss" scoped>
.mk-sep {
  background: #0d0d0d;
  border-top: 1px solid rgba(200, 57, 43, 0.2);
  border-bottom: 1px solid rgba(200, 57, 43, 0.2);
  overflow: hidden;
  padding: 0;
}

/* ── Ticker ─────────────────────────────────────── */
.mk-sep__ticker {
  background: var(--mk-red, #c8392b);
  padding: 10px 0;
  overflow: hidden;
  display: flex; /* ensures track starts at left edge with no gap */

  &--reverse .mk-sep__ticker-track {
    animation-direction: reverse;
    animation-duration: 40s;
  }
}

.mk-sep__ticker-track {
  display: flex;
  flex-wrap: nowrap;
  width: max-content;
  animation: sep-marquee 22s linear infinite;
  will-change: transform;

  span {
    font-family: 'DM Sans', sans-serif;
    font-size: 11px;
    font-weight: 700;
    letter-spacing: 0.2em;
    color: rgba(245, 242, 237, 0.9);
    text-transform: uppercase;
    white-space: nowrap;
    flex-shrink: 0;
  }
}

@keyframes sep-marquee {
  from { transform: translateX(0); }
  to   { transform: translateX(-50%); }
}

/* ── Inner content ──────────────────────────────── */
.mk-sep__inner {
  padding: 52px 24px 56px;
  max-width: 640px;
  margin: 0 auto;
  text-align: center;

  @media (min-width: 768px) {
    padding: 72px 40px 80px;
  }
}

.mk-sep__title {
  display: flex;
  flex-direction: column;
  align-items: center;
  margin: 0 0 36px;
  gap: 0;
}

.mk-sep__word {
  font-family: 'Bebas Neue', sans-serif;
  font-size: clamp(52px, 15vw, 100px);
  line-height: 0.9;
  letter-spacing: 0.03em;
  color: var(--mk-cream, #f5f2ed);
  display: block;
  visibility: hidden; /* controlled by GSAP */

  &--accent {
    color: var(--mk-red, #c8392b);
    -webkit-text-stroke: 0px;
  }
}

/* ── Tags/pills ─────────────────────────────────── */
.mk-sep__tags {
  display: flex;
  flex-wrap: wrap;
  gap: 10px;
  justify-content: center;
  margin-bottom: 28px;
}

.mk-sep__tag {
  display: inline-flex;
  align-items: center;
  gap: 7px;
  padding: 8px 16px;
  border: 1px solid rgba(245, 242, 237, 0.15);
  border-radius: 100px;
  font-family: 'DM Sans', sans-serif;
  font-size: 13px;
  font-weight: 500;
  color: rgba(245, 242, 237, 0.75);
  background: rgba(245, 242, 237, 0.04);
  letter-spacing: 0.03em;
  visibility: hidden; /* controlled by GSAP */

  i { font-size: 12px; color: var(--mk-gold, #c9a84c); }

  &--accent {
    border-color: rgba(200, 57, 43, 0.4);
    color: rgba(245, 242, 237, 0.9);
    background: rgba(200, 57, 43, 0.08);
    i { color: var(--mk-red, #c8392b); }
  }
}

/* ── Body ───────────────────────────────────────── */
.mk-sep__body {
  font-family: 'DM Sans', sans-serif;
  font-size: 15px;
  line-height: 1.75;
  color: rgba(245, 242, 237, 0.55);
  max-width: 480px;
  margin: 0 auto 32px;
  visibility: hidden; /* controlled by GSAP */

  strong {
    color: var(--mk-cream, #f5f2ed);
    font-weight: 600;
  }
}

.mk-sep__cta {
  display: inline-flex;
  align-items: center;
  gap: 10px;
  padding: 16px 36px;
  background: var(--mk-red, #c8392b);
  border: 2px solid var(--mk-red, #c8392b);
  border-radius: 4px;
  color: var(--mk-cream, #f5f2ed);
  font-family: 'DM Sans', sans-serif;
  font-size: 15px;
  font-weight: 700;
  letter-spacing: 0.05em;
  cursor: pointer;
  transition: background 0.25s, color 0.25s, transform 0.25s;
  visibility: hidden; /* controlled by GSAP */

  i { font-size: 0.9em; }

  &:hover {
    background: transparent;
    color: var(--mk-red, #c8392b);
    transform: translateY(-2px);
  }
}
</style>
