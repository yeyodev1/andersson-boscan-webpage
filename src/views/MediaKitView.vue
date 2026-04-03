<template>
  <div class="mk-root">
    <MKHeader :active-section="activeSection" />

    <!-- Navigation dots -->
    <nav class="mk-nav" aria-label="Secciones">
      <button
        v-for="(page, i) in pages"
        :key="i"
        class="mk-nav__dot"
        :class="{ active: activeSection === i }"
        :aria-label="page.label"
        @click="scrollTo(i)"
      >
        <span class="mk-nav__tooltip">{{ page.label }}</span>
      </button>
    </nav>

    <MKPage1Cover   ref="s0" />
    <MKPage2Perfil  ref="s1" />
    <MKPage3Audiencia ref="s2" />
    <MKPage4Plataformas ref="s3" />
    <MKPage5Comercial ref="s4" />
    <MKPage6Periodistico ref="s5" />
    <MKPage7Pymes   ref="s6" />
    <MKPage8Culinario ref="s7" />
    <MKPage9Form    ref="s8" />
    <MKPage10CTA    ref="s9" />
    <MKFooter />
    <MKLeadModal />
  </div>
</template>

<script setup lang="ts">
import { ref, onMounted, onUnmounted } from 'vue'
import { gsap } from 'gsap'
import { ScrollTrigger } from 'gsap/ScrollTrigger'
import { ScrollToPlugin } from 'gsap/ScrollToPlugin'

import MKPage1Cover from '@/components/mediakit/MKPage1Cover.vue'
import MKPage2Perfil from '@/components/mediakit/MKPage2Perfil.vue'
import MKPage3Audiencia from '@/components/mediakit/MKPage3Audiencia.vue'
import MKPage4Plataformas from '@/components/mediakit/MKPage4Plataformas.vue'
import MKPage5Comercial from '@/components/mediakit/MKPage5Comercial.vue'
import MKPage6Periodistico from '@/components/mediakit/MKPage6Periodistico.vue'
import MKPage7Pymes from '@/components/mediakit/MKPage7Pymes.vue'
import MKPage8Culinario from '@/components/mediakit/MKPage8Culinario.vue'
import MKPage9Form from '@/components/mediakit/MKPage9Form.vue'
import MKPage10CTA from '@/components/mediakit/MKPage10CTA.vue'
import MKHeader from '@/components/mediakit/MKHeader.vue'
import MKFooter from '@/components/mediakit/MKFooter.vue'
import MKLeadModal from '@/components/mediakit/MKLeadModal.vue'

gsap.registerPlugin(ScrollTrigger, ScrollToPlugin)

const activeSection = ref(0)

const pages = [
  { label: 'Portada' },
  { label: 'Perfil' },
  { label: 'Audiencia' },
  { label: 'Plataformas' },
  { label: 'Comercial IA' },
  { label: 'Periodístico' },
  { label: 'PYMEs' },
  { label: 'Culinario' },
  { label: 'Publicidad' },
  { label: 'Contacto' },
]

function scrollTo(index: number) {
  const sections = document.querySelectorAll('.mk-section')
  if (sections[index]) {
    gsap.to(window, { duration: 0.75, scrollTo: { y: sections[index], offsetY: 64 }, ease: 'power2.inOut' })
  }
}

let triggers: ScrollTrigger[] = []

onMounted(() => {
  const sections = document.querySelectorAll('.mk-section')

  sections.forEach((section, i) => {
    const trigger = ScrollTrigger.create({
      trigger: section,
      start: 'top 55%',
      end: 'bottom 45%',
      onEnter: () => { activeSection.value = i },
      onEnterBack: () => { activeSection.value = i },
    })
    triggers.push(trigger)
  })
})

onUnmounted(() => {
  triggers.forEach(t => t.kill())
  ScrollTrigger.getAll().forEach(t => t.kill())
})
</script>

<style lang="scss">
/* Global mediakit fonts — non-scoped intentional */
@import url('https://fonts.googleapis.com/css2?family=Bebas+Neue&family=DM+Sans:ital,wght@0,300;0,400;0,500;0,700;1,400&family=Playfair+Display:ital,wght@0,700;0,900;1,400&display=swap');

.mk-root {
  background: #080808;
  color: #f5f2ed;
  min-height: 100vh;
  padding-top: 0; /* header is fixed/overlay on hero */
  --mk-red: #c8392b;
  --mk-red-dark: #8a1f14;
  --mk-gold: #c9a84c;
  --mk-cream: #f5f2ed;
  --mk-black: #080808;
  --mk-dim: rgba(245,242,237,0.6);
  --mk-dimmer: rgba(245,242,237,0.38);
}
</style>

<style lang="scss" scoped>
.mk-nav {
  position: fixed;
  right: 28px;
  top: 50%;
  transform: translateY(-50%);
  z-index: 1000;
  display: flex;

  @media (max-width: 768px) {
    display: none;
  }
  flex-direction: column;
  gap: 12px;

  &__dot {
    position: relative;
    width: 8px;
    height: 8px;
    border-radius: 50%;
    background: rgba(245,242,237,0.25);
    border: none;
    cursor: pointer;
    padding: 0;
    transition: background 0.3s, transform 0.3s;

    &.active {
      background: #c8392b;
      transform: scale(1.5);
    }

    &:hover {
      background: rgba(245,242,237,0.7);
      .mk-nav__tooltip { opacity: 1; transform: translateX(-8px); }
    }
  }

  &__tooltip {
    position: absolute;
    right: 20px;
    top: 50%;
    transform: translateY(-50%) translateX(0);
    background: rgba(8,8,8,0.85);
    color: #f5f2ed;
    font-family: 'DM Sans', sans-serif;
    font-size: 11px;
    letter-spacing: 0.08em;
    white-space: nowrap;
    padding: 4px 10px;
    border-radius: 4px;
    opacity: 0;
    pointer-events: none;
    transition: opacity 0.2s, transform 0.2s;
  }
}
</style>
