<template>
  <section class="mk-section p4" ref="sectionEl">
    <!-- Left: Andersson y Moni -->
    <div class="p4__half p4__half--left" ref="leftEl">
      <div class="p4__photo p4__photo--1"></div>
      <div class="p4__overlay p4__overlay--l"></div>
      <div class="p4__content">
        <div class="p4__who">Andersson y Moni Boscán</div>
        <div class="p4__handle">@ANDERSSONBOSCAN</div>
        <div class="p4__bars">
          <div class="p4__bar-row" v-for="p in platformsLeft" :key="p.name" ref="barRowsLeft">
            <div class="p4__bar-name"><i :class="p.icon"></i> {{ p.name }}</div>
            <div class="p4__bar-track">
              <div class="p4__bar-fill" :data-width="p.width" style="width:0%"></div>
            </div>
            <div class="p4__bar-meta">
              <div class="p4__bar-n">{{ p.n }}</div>
              <div class="p4__bar-l">{{ p.label }}</div>
            </div>
          </div>
        </div>
      </div>
    </div>

    <!-- Divider -->
    <div class="p4__divider" ref="dividerEl"></div>

    <!-- Right: Mónica -->
    <div class="p4__half p4__half--right" ref="rightEl">
      <div class="p4__photo p4__photo--2"></div>
      <div class="p4__overlay p4__overlay--r"></div>
      <div class="p4__content">
        <div class="p4__who">Mónica Velásquez</div>
        <div class="p4__handle">@MONICAVELASQUEZ</div>
        <div class="p4__bars">
          <div class="p4__bar-row" v-for="p in platformsRight" :key="p.name">
            <div class="p4__bar-name"><i :class="p.icon"></i> {{ p.name }}</div>
            <div class="p4__bar-track">
              <div class="p4__bar-fill" :data-width="p.width" style="width:0%"></div>
            </div>
            <div class="p4__bar-meta">
              <div class="p4__bar-n">{{ p.n }}</div>
              <div class="p4__bar-l">{{ p.label }}</div>
            </div>
          </div>
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
const leftEl    = ref<HTMLElement | null>(null)
const rightEl   = ref<HTMLElement | null>(null)
const dividerEl = ref<HTMLElement | null>(null)

const platformsLeft = [
  { name: 'TikTok',      n: '910K',  label: 'seguidores',   width: 100, icon: 'fa-brands fa-tiktok' },
  { name: 'YouTube',     n: '191K',  label: 'suscriptores', width: 21,  icon: 'fa-brands fa-youtube' },
  { name: 'Instagram',   n: '191K',  label: 'seguidores',   width: 21,  icon: 'fa-brands fa-instagram' },
  { name: 'X (Twitter)', n: '404K',  label: 'verificado',   width: 44,  icon: 'fa-brands fa-x-twitter' },
  { name: 'Facebook',    n: '100K+', label: 'seguidores',   width: 11,  icon: 'fa-brands fa-facebook' },
  { name: 'Spotify',     n: '85K',   label: 'oyentes/mes',  width: 9,   icon: 'fa-brands fa-spotify' },
]

const platformsRight = [
  { name: 'TikTok',    n: '420K', label: 'seguidores',   width: 100, icon: 'fa-brands fa-tiktok' },
  { name: 'YouTube',   n: '85K',  label: 'suscriptores', width: 20,  icon: 'fa-brands fa-youtube' },
  { name: 'Instagram', n: '95K',  label: 'seguidores',   width: 23,  icon: 'fa-brands fa-instagram' },
  { name: 'Facebook',  n: '60K',  label: 'seguidores',   width: 14,  icon: 'fa-brands fa-facebook' },
]

onMounted(() => {
  const tl = gsap.timeline({
    scrollTrigger: { trigger: sectionEl.value, start: 'top 70%', once: true },
    defaults: { ease: 'power3.out' },
  })

  tl.from(leftEl.value, { x: -60, opacity: 0, duration: 1 })
    .from(dividerEl.value, { scaleY: 0, transformOrigin: 'top', duration: 0.8 }, '-=0.6')
    .from(rightEl.value, { x: 60, opacity: 0, duration: 1 }, '-=0.8')

  // Animate progress bars
  ScrollTrigger.create({
    trigger: sectionEl.value,
    start: 'top 60%',
    once: true,
    onEnter: () => {
      document.querySelectorAll('.p4__bar-fill').forEach((bar) => {
        const w = (bar as HTMLElement).dataset.width + '%'
        gsap.to(bar, { width: w, duration: 1.2, ease: 'power2.out', delay: 0.4 })
      })
    },
  })
})
</script>

<style lang="scss" scoped>
.p4 {
  min-height: 100vh;
  display: flex;
  overflow: hidden;
  background: #080808;

  @media (max-width: 768px) {
    flex-direction: column;
  }

  &__half {
    position: relative;
    flex: 1;
    display: flex;
    align-items: flex-end;
    overflow: hidden;

    @media (max-width: 768px) {
      min-height: 50vh;
    }
  }

  &__photo {
    position: absolute;
    inset: 0;
    background-size: cover;
    background-position: center 15%;
    transition: transform 0.6s ease;

    &--1 { background-image: url('/images/p4-photo-1.png'); }
    &--2 { background-image: url('/images/p4-photo-2.jpg'); }
  }

  &__half:hover &__photo {
    transform: scale(1.03);
  }

  &__overlay {
    position: absolute;
    inset: 0;

    &--l {
      background: linear-gradient(
        to right, rgba(8,8,8,0.1) 0%, rgba(8,8,8,0.7) 100%
      ),
      linear-gradient(to top, rgba(8,8,8,0.95) 0%, transparent 50%);
    }

    &--r {
      background: linear-gradient(
        to left, rgba(8,8,8,0.1) 0%, rgba(8,8,8,0.7) 100%
      ),
      linear-gradient(to top, rgba(8,8,8,0.95) 0%, transparent 50%);
    }
  }

  &__content {
    position: relative;
    z-index: 2;
    padding: 0 clamp(20px, 5vw, 40px) clamp(32px, 6vw, 60px);
    width: 100%;
  }

  &__who {
    font-family: 'DM Sans', sans-serif;
    font-size: 11px;
    letter-spacing: 0.3em;
    text-transform: uppercase;
    color: var(--mk-gold);
    font-weight: 700;
    margin-bottom: 6px;
  }

  &__handle {
    font-family: 'Bebas Neue', sans-serif;
    font-size: clamp(28px, 3.5vw, 44px);
    color: var(--mk-cream);
    margin-bottom: 32px;
    letter-spacing: 0.02em;
  }

  &__bars {
    display: flex;
    flex-direction: column;
    gap: 16px;
  }

  &__bar-row {
    display: grid;
    grid-template-columns: 72px 1fr auto;
    align-items: center;
    gap: 12px;
  }

  &__bar-name {
    font-family: 'DM Sans', sans-serif;
    font-size: 12px;
    color: var(--mk-dim);
    font-weight: 500;
  }

  &__bar-track {
    height: 3px;
    background: rgba(245,242,237,0.1);
    border-radius: 2px;
    overflow: hidden;
  }

  &__bar-fill {
    height: 100%;
    background: linear-gradient(to right, var(--mk-red), var(--mk-gold));
    border-radius: 2px;
    will-change: width;
  }

  &__bar-n {
    font-family: 'Bebas Neue', sans-serif;
    font-size: 20px;
    color: var(--mk-cream);
    line-height: 1;
    text-align: right;
  }

  &__bar-l {
    font-family: 'DM Sans', sans-serif;
    font-size: 10px;
    color: var(--mk-dimmer);
    text-align: right;
  }

  &__divider {
    width: 1px;
    background: rgba(245,242,237,0.12);
    flex-shrink: 0;
    align-self: stretch;
    margin: 80px 0;

    @media (max-width: 768px) {
      width: 100%;
      height: 1px;
      margin: 0 20px;
      align-self: auto;
    }
  }
}
</style>
