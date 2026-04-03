<template>
  <section class="mk-section p-form pf" ref="sectionEl">

    <!-- ── VIDEO HERO ─────────────────────────────────────────── -->
    <div class="pf__video-wrap" ref="videoWrapEl">
      <video class="pf__video" :src="videoSrc" autoplay muted loop playsinline />
      <div class="pf__video-overlay" ref="overlayEl"></div>
      <div class="pf__video-text" ref="videoTextEl">
        <div class="pf__eyebrow">TRABAJA CON NOSOTROS</div>
        <h2 class="pf__video-headline">
          TU MARCA, NUESTRA<br>
          <span>AUDIENCIA</span>
        </h2>
        <p class="pf__video-sub">88.7M de alcance mensual te esperan</p>
      </div>
    </div>

    <!-- ── CTA SECTION ───────────────────────────────────────── -->
    <div class="pf__cta-section" ref="ctaSectionEl">
      <p class="pf__cta-sub">Tu marca frente a 88.7 millones de personas al mes.</p>
      <h2 class="pf__cta-title">¿HABLAMOS DE TU<br><span>PRÓXIMA CAMPAÑA?</span></h2>
      <button class="pf__cta-btn" @click="openModal">
        <i class="fa-solid fa-handshake"></i>
        Quiero publicitar con Boscán &amp; La Moni
      </button>
    </div>

  </section>
</template>

<script setup lang="ts">
import { ref, onMounted, onUnmounted } from 'vue'
import videoSrc from '@/assets/videos/andersonvideo.mp4'
import { gsap } from 'gsap'
import { ScrollTrigger } from 'gsap/ScrollTrigger'
import { useLeadModal } from '@/composables/useLeadModal'

gsap.registerPlugin(ScrollTrigger)

const { openModal } = useLeadModal()
const sectionEl   = ref<HTMLElement | null>(null)
const videoWrapEl = ref<HTMLElement | null>(null)
const overlayEl   = ref<HTMLElement | null>(null)
const videoTextEl = ref<HTMLElement | null>(null)
const ctaSectionEl = ref<HTMLElement | null>(null)

const triggers: ScrollTrigger[] = []

onMounted(() => {
  // 3D rotation scroll effect — video tilts as you scroll through
  if (videoWrapEl.value) {
    gsap.set(videoWrapEl.value, { transformPerspective: 1000 })
    const t1 = gsap.fromTo(
      videoWrapEl.value,
      { rotateY: 10, scale: 1.05 },
      {
        rotateY: -10,
        scale: 1.0,
        ease: 'none',
        scrollTrigger: {
          trigger: sectionEl.value,
          start: 'top bottom',
          end: 'bottom top',
          scrub: 1.5,
        },
      },
    )
    if (t1.scrollTrigger) triggers.push(t1.scrollTrigger)
  }

  // Overlay parallax
  gsap.fromTo(
    overlayEl.value,
    { opacity: 0.78 },
    {
      opacity: 0.45,
      ease: 'none',
      scrollTrigger: {
        trigger: sectionEl.value,
        start: 'top bottom',
        end: 'center top',
        scrub: true,
      },
    },
  )

  // Video text entrance
  gsap.fromTo(
    videoTextEl.value,
    { opacity: 0, y: 40 },
    {
      opacity: 1, y: 0, duration: 1, ease: 'power3.out',
      scrollTrigger: {
        trigger: videoWrapEl.value,
        start: 'top 80%',
        toggleActions: 'play none none none',
      },
    },
  )

  // CTA section entrance
  gsap.fromTo(
    ctaSectionEl.value,
    { opacity: 0, y: 40 },
    {
      opacity: 1, y: 0, duration: 1, ease: 'power3.out',
      scrollTrigger: {
        trigger: ctaSectionEl.value,
        start: 'top 85%',
        toggleActions: 'play none none none',
      },
    },
  )
})

onUnmounted(() => {
  triggers.forEach(t => t.kill())
})
</script>

<style scoped lang="scss">
.pf {
  background: #080808;
  color: var(--mk-cream, #f5f2ed);
  overflow: hidden;
}

.pf__video-wrap {
  position: relative;
  width: 100%;
  height: 100vh;
  overflow: hidden;
  transform-origin: center center;
}

.pf__video {
  position: absolute;
  inset: 0;
  width: 100%;
  height: 100%;
  object-fit: cover;
  display: block;
}

.pf__video-overlay {
  position: absolute;
  inset: 0;
  background: #080808;
  opacity: 0.65;
  pointer-events: none;
}

.pf__video-text {
  position: absolute;
  inset: 0;
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  text-align: center;
  padding: 0 24px;
  z-index: 2;
  opacity: 0;
}

.pf__eyebrow {
  font-family: 'DM Sans', sans-serif;
  font-size: clamp(0.65rem, 1.2vw, 0.85rem);
  letter-spacing: 0.28em;
  color: var(--mk-gold, #c9a84c);
  text-transform: uppercase;
  margin-bottom: 16px;
}

.pf__video-headline {
  font-family: 'Bebas Neue', sans-serif;
  font-size: clamp(3rem, 9vw, 7rem);
  line-height: 1.0;
  color: var(--mk-cream, #f5f2ed);
  margin: 0 0 20px;

  span { color: var(--mk-red, #c8392b); }
}

.pf__video-sub {
  font-family: 'DM Sans', sans-serif;
  font-size: clamp(1rem, 2vw, 1.4rem);
  color: rgba(245,242,237,0.75);
  margin: 0;
}

/* ── CTA SECTION ── */
.pf__cta-section {
  display: flex;
  flex-direction: column;
  align-items: center;
  text-align: center;
  padding: clamp(64px, 10vw, 120px) clamp(20px, 5vw, 60px);
  background: #080808;
}

.pf__cta-sub {
  font-family: 'DM Sans', sans-serif;
  font-size: clamp(12px, 1.4vw, 15px);
  letter-spacing: 0.14em;
  text-transform: uppercase;
  color: var(--mk-gold, #c9a84c);
  margin: 0 0 14px;
}

.pf__cta-title {
  font-family: 'Bebas Neue', sans-serif;
  font-size: clamp(3rem, 7vw, 6rem);
  line-height: 0.95;
  color: var(--mk-cream, #f5f2ed);
  margin: 0 0 40px;
  span { color: var(--mk-red, #c8392b); }
}

.pf__cta-btn {
  display: inline-flex;
  align-items: center;
  gap: 12px;
  padding: 20px 48px;
  background: var(--mk-red, #c8392b);
  border: 2px solid var(--mk-red, #c8392b);
  border-radius: 4px;
  color: var(--mk-cream, #f5f2ed);
  font-family: 'DM Sans', sans-serif;
  font-size: clamp(13px, 1.4vw, 15px);
  font-weight: 700;
  letter-spacing: 0.06em;
  text-transform: uppercase;
  cursor: pointer;
  transition: all 0.3s ease;

  i { font-size: 1em; }

  &:hover {
    background: transparent;
    color: var(--mk-red, #c8392b);
    transform: translateY(-3px);
    box-shadow: 0 12px 32px rgba(200,57,43,0.3);
  }
}
</style>
