<template>
  <section class="mk-section p6" ref="sectionEl">
    <div class="p6__photo-col">
      <div class="p6__photo"></div>
      <div class="p6__photo-overlay"></div>
    </div>

    <div class="p6__content" ref="contentEl">
      <div class="p6__eyebrow">Contenido periodístico</div>
      <h2 class="p6__title" ref="titleEl">FORMATOS<br>EDITORIALES</h2>

      <div class="p6__formats" ref="formatsEl">
        <!-- Star format -->
        <div class="p6__format p6__format--star">
          <div class="p6__format-head">
            <div class="p6__format-tag">Formato más solicitado · ~500K reproducciones</div>
          </div>
          <div class="p6__format-title">Diario de Boscán creado para la marca</div>
          <div class="p6__format-desc">
            Andersson y Moni construye un relato periodístico real donde tu marca aparece de forma sutil
            y orgánica. No parece publicidad — porque no lo es.
          </div>
        </div>

        <div class="p6__format" v-for="fmt in formats" :key="fmt.tag">
          <div class="p6__format-head">
            <div class="p6__format-tag">{{ fmt.tag }}</div>
          </div>
          <div class="p6__format-title">{{ fmt.title }}</div>
          <div class="p6__format-desc">{{ fmt.desc }}</div>
        </div>
      </div>

      <button class="p6__cta-btn" @click="openModal">
        <i class="fa-solid fa-arrow-right"></i> Solicitar propuesta editorial
      </button>
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
const titleEl   = ref<HTMLElement | null>(null)

const formats = [
  {
    tag: 'TikTok patrocinado · 910K seguidores',
    title: 'TikTok patrocinado Andersson y Moni',
    desc: 'Video original producido para TikTok con mención de marca integrada. 910K seguidores · 766K vistas/día.',
  },
  {
    tag: 'YouTube mención · X post',
    title: 'Mención YouTube / Post en X',
    desc: '60–90 seg en investigación (permanente) o post en X con 404K verificado.',
  },
  {
    tag: 'Instagram · Facebook',
    title: 'Post Instagram / Facebook',
    desc: 'Publicación de marca en Instagram (13.7M vistas/sem) o Facebook (42.4M imp./año).',
  },
]

onMounted(() => {
  const tl = gsap.timeline({
    scrollTrigger: { trigger: sectionEl.value, start: 'top 70%', once: true },
    defaults: { ease: 'power3.out' },
  })

  tl.from('.p6__photo', { scale: 1.1, duration: 1.4 })
    .from(titleEl.value, { y: 40, opacity: 0, duration: 0.9 }, '-=1')
    .from('.p6__format', { y: 40, opacity: 0, stagger: 0.15, duration: 0.7 }, '-=0.5')
    .from('.p6__cta-btn', { y: 20, opacity: 0, duration: 0.6 }, '-=0.2')
})
</script>

<style lang="scss" scoped>
.p6 {
  min-height: 100vh;
  display: flex;
  background: #080808;
  overflow: hidden;

  @media (max-width: 768px) {
    flex-direction: column;
  }

  &__photo-col {
    position: relative;
    width: 38%;
    flex-shrink: 0;

    @media (max-width: 768px) {
      width: 100%;
      height: 35vh;
      flex-shrink: 0;
    }
  }

  &__photo {
    position: absolute;
    inset: 0;
    background: url('/images/p6-photo.png') center / cover no-repeat;
    will-change: transform;
  }

  &__photo-overlay {
    position: absolute;
    inset: 0;
    background: linear-gradient(to right, transparent 50%, #080808 100%);

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

  &__eyebrow {
    font-family: 'DM Sans', sans-serif;
    font-size: 11px;
    letter-spacing: 0.35em;
    text-transform: uppercase;
    color: var(--mk-gold);
    font-weight: 700;
    margin-bottom: 16px;
  }

  &__title {
    font-family: 'Bebas Neue', sans-serif;
    font-size: clamp(40px, 5vw, 72px);
    line-height: 0.95;
    color: var(--mk-cream);
    margin-bottom: 40px;
  }

  &__formats {
    display: flex;
    flex-direction: column;
    gap: 0;
  }

  &__format {
    padding: 24px 0;
    border-bottom: 1px solid rgba(245,242,237,0.08);

    &:last-child { border-bottom: none; }

    &--star {
      border-left: 3px solid var(--mk-red);
      padding-left: 20px;
      margin-left: -20px;
      background: rgba(200,57,43,0.04);
      padding-top: 20px;
      padding-bottom: 20px;
      margin-bottom: 8px;
    }
  }

  &__format-head {
    display: flex;
    justify-content: space-between;
    align-items: flex-start;
    gap: 16px;
    margin-bottom: 8px;
  }

  &__format-tag {
    font-family: 'DM Sans', sans-serif;
    font-size: 10px;
    letter-spacing: 0.2em;
    text-transform: uppercase;
    color: var(--mk-gold);
    font-weight: 700;
  }

  &__format-title {
    font-family: 'DM Sans', sans-serif;
    font-weight: 700;
    font-size: 15px;
    color: var(--mk-cream);
    margin-bottom: 6px;
  }

  &__format-desc {
    font-family: 'DM Sans', sans-serif;
    font-size: 13px;
    color: var(--mk-dim);
    line-height: 1.6;
  }

  &__cta-btn {
    display: inline-flex;
    align-items: center;
    gap: 10px;
    margin-top: 32px;
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

    &:hover {
      background: transparent;
      color: var(--mk-red);
      transform: translateY(-2px);
    }
  }
}
</style>
