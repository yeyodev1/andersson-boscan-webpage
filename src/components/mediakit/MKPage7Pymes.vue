<template>
  <section class="mk-section p7" ref="sectionEl">
    <div class="p7__photo-col">
      <div class="p7__photo-img"></div>
      <div class="p7__photo-fade"></div>
    </div>

    <div class="p7__content" ref="contentEl">
      <div class="p7__label">Para PYMEs · Resultado medible</div>
      <h2 class="p7__title" ref="titleEl">PUBLICIDAD REAL<br>LEADS REALES</h2>
      <p class="p7__body">
        El único formato donde el cliente recibe contactos directos — no impresiones. Andersson y Moni
        menciona tu negocio a la mitad de un Reel y la audiencia se convierte en clientes potenciales
        automáticamente.
      </p>

      <div class="p7__flow" ref="flowEl">
        <div class="p7__step" v-for="step in steps" :key="step.n">
          <div class="p7__step-n">
            <i :class="step.icon" class="p7__step-icon"></i>
          </div>
          <div class="p7__step-body">
            <div class="p7__step-title">{{ step.title }}</div>
            <div class="p7__step-sub">{{ step.sub }}</div>
          </div>
          <div class="p7__step-connector" v-if="step.n !== '03'"></div>
        </div>
      </div>

      <div class="p7__price-wrap" ref="priceWrapEl">
        <div class="p7__price-bar">
          <div class="p7__price-n">$1,500</div>
          <div class="p7__price-txt">
            <div class="p7__price-unit">USD · Reel + automatización incluida</div>
            <div class="p7__price-label">Para PYMEs · Leads directos a WhatsApp</div>
          </div>
        </div>
        <div class="p7__reach">~200K reproducciones estimadas · CPL $3–$8 vs $15–$45 Meta Ads</div>
      </div>
    </div>
  </section>
</template>

<script setup lang="ts">
import { ref, onMounted } from 'vue'
import { gsap } from 'gsap'
import { ScrollTrigger } from 'gsap/ScrollTrigger'

gsap.registerPlugin(ScrollTrigger)

const sectionEl  = ref<HTMLElement | null>(null)
const titleEl    = ref<HTMLElement | null>(null)
const flowEl     = ref<HTMLElement | null>(null)
const priceWrapEl = ref<HTMLElement | null>(null)

const steps = [
  {
    n: '01',
    icon: 'fa-brands fa-instagram',
    title: 'Andersson y Moni menciona tu marca en el Reel',
    sub: 'A la mitad del video pide comentar una palabra clave específica de tu campaña.',
  },
  {
    n: '02',
    icon: 'fa-solid fa-bolt',
    title: 'El comentario activa la automatización',
    sub: 'Cada persona que comenta la palabra recibe al instante un mensaje directo automático.',
  },
  {
    n: '03',
    icon: 'fa-brands fa-whatsapp',
    title: 'El lead llega a tu WhatsApp o sitio web',
    sub: 'El DM automático contiene el link de tu negocio. Tú recibes el contacto calificado.',
  },
]

onMounted(() => {
  // Photo parallax
  ScrollTrigger.create({
    trigger: sectionEl.value,
    start: 'top bottom',
    end: 'bottom top',
    scrub: true,
    onUpdate: (self) => {
      const photo = sectionEl.value?.querySelector('.p7__photo-img') as HTMLElement
      if (photo) gsap.set(photo, { yPercent: self.progress * 20 })
    },
  })

  const tl = gsap.timeline({
    scrollTrigger: { trigger: sectionEl.value, start: 'top 70%', once: true },
    defaults: { ease: 'power3.out' },
  })

  tl.from('.p7__photo-col', { x: -60, opacity: 0, duration: 1 })
    .from(titleEl.value, { y: 40, opacity: 0, duration: 0.9 }, '-=0.7')
    .from('.p7__body', { y: 20, opacity: 0, duration: 0.6 }, '-=0.5')
    .from('.p7__step', {
      y: 30, opacity: 0, stagger: 0.2, duration: 0.7,
    }, '-=0.3')
    .from(priceWrapEl.value, { y: 20, opacity: 0, duration: 0.7 }, '-=0.2')

  // Animate step connectors
  gsap.from('.p7__step-connector', {
    scrollTrigger: { trigger: flowEl.value, start: 'top 75%', once: true },
    scaleY: 0, transformOrigin: 'top', stagger: 0.2, duration: 0.5, ease: 'power2.out',
    delay: 0.5,
  })
})
</script>

<style lang="scss" scoped>
.p7 {
  min-height: 100vh;
  display: flex;
  background: #080808;
  overflow: hidden;

  @media (max-width: 768px) {
    flex-direction: column;
  }

  &__photo-col {
    position: relative;
    width: 40%;
    flex-shrink: 0;

    @media (max-width: 768px) {
      width: 100%;
      height: 35vh;
      flex-shrink: 0;
    }
  }

  &__photo-img {
    position: absolute;
    inset: 0;
    background: url('/images/p7-photo.png') center / cover no-repeat;
    will-change: transform;
  }

  &__photo-fade {
    position: absolute;
    inset: 0;
    background: linear-gradient(to right, transparent 60%, #080808 100%),
                linear-gradient(to top, #080808 0%, transparent 25%);

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

  &__label {
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
    margin-bottom: 20px;
  }

  &__body {
    font-family: 'DM Sans', sans-serif;
    font-size: 14px;
    color: var(--mk-dim);
    line-height: 1.7;
    margin-bottom: 40px;
  }

  &__flow {
    display: flex;
    flex-direction: column;
    gap: 0;
    margin-bottom: 40px;
    position: relative;
  }

  &__step {
    display: flex;
    gap: 20px;
    align-items: flex-start;
    padding-bottom: 28px;
    position: relative;
  }

  &__step-n {
    min-width: 44px;
    flex-shrink: 0;
  }

  &__step-icon {
    font-size: 28px;
    color: var(--mk-red);
    line-height: 1;
    display: block;
  }

  &__step-title {
    font-family: 'DM Sans', sans-serif;
    font-weight: 700;
    font-size: 14px;
    color: var(--mk-cream);
    margin-bottom: 6px;
  }

  &__step-sub {
    font-family: 'DM Sans', sans-serif;
    font-size: 13px;
    color: var(--mk-dim);
    line-height: 1.6;
  }

  &__step-connector {
    position: absolute;
    left: 21px;
    bottom: 0;
    top: 36px;
    width: 1px;
    background: linear-gradient(to bottom, var(--mk-red), transparent);
  }

  &__price-wrap {
    border-top: 1px solid rgba(245,242,237,0.1);
    padding-top: 28px;
  }

  &__price-bar {
    display: flex;
    align-items: center;
    gap: 24px;
    margin-bottom: 12px;
  }

  &__price-n {
    font-family: 'Bebas Neue', sans-serif;
    font-size: clamp(44px, 5vw, 64px);
    color: var(--mk-cream);
    line-height: 1;
  }

  &__price-unit {
    font-family: 'DM Sans', sans-serif;
    font-weight: 700;
    font-size: 14px;
    color: var(--mk-cream);
    margin-bottom: 4px;
  }

  &__price-label {
    font-family: 'DM Sans', sans-serif;
    font-size: 12px;
    color: var(--mk-dimmer);
  }

  &__reach {
    font-family: 'DM Sans', sans-serif;
    font-size: 12px;
    color: var(--mk-dimmer);
  }
}
</style>
