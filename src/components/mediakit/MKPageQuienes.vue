<template>
  <div class="qs">

    <!-- ── INTRO ──────────────────────────────────────────── -->
    <section class="qs__intro" ref="introEl">
      <div class="qs__intro-noise"></div>
      <div class="qs__intro-lines">
        <span v-for="n in 6" :key="n"></span>
      </div>
      <div class="qs__intro-inner">
        <div class="qs__intro-eyebrow" ref="eyebrowEl">EUREKA MEDIA EC · 2026</div>
        <h1 class="qs__intro-title">
          <span class="qs__intro-title-line">EL EQUIPO</span>
          <span class="qs__intro-title-line qs__intro-title-line--accent">DETRÁS DEL</span>
          <span class="qs__intro-title-line">IMPACTO</span>
        </h1>
        <p class="qs__intro-sub" ref="subEl">
          Dos voces que mueven audiencias. Un programa noticioso. Ochenta y ocho millones de alcance mensual.
        </p>
        <div class="qs__intro-rule" ref="ruleEl"></div>
        <div class="qs__intro-scroll" ref="scrollEl">
          <span>Descubre quiénes son</span>
          <i class="fa-solid fa-arrow-down"></i>
        </div>
      </div>
    </section>

    <!-- ── ANDERSSON ──────────────────────────────────────── -->
    <section class="qs__profile qs__profile--a" ref="profileAEl">
      <div class="qs__profile-photo-wrap">
        <div class="qs__profile-photo qs__profile-photo--a" ref="photoAEl"></div>
        <div class="qs__profile-photo-fade qs__profile-photo-fade--a"></div>
        <div class="qs__profile-number">01</div>
      </div>

      <div class="qs__profile-content" ref="contentAEl">
        <div class="qs__profile-meta">
          <span class="qs__profile-country"><i class="fa-solid fa-location-dot"></i> Toronto, Canadá</span>
          <span class="qs__profile-role">Periodista · Investigador · Fundador</span>
        </div>

        <h2 class="qs__profile-name">
          <span class="qs__profile-name-first">Andersson</span>
          <span class="qs__profile-name-last">Boscán</span>
        </h2>

        <p class="qs__profile-bio">
          Periodista de investigación con más de 15 años rompiendo noticias que otros no se atreven a contar.
          Fundador del programa noticioso matutino más seguido de Latinoamérica, con presencia simultánea en
          5 plataformas y una audiencia que supera los <strong>88 millones de alcance mensual</strong>.
          Candidato al Emmy Latino. Premio Nacional de Periodismo Digital.
        </p>

        <div class="qs__profile-awards">
          <div class="qs__profile-award">
            <i class="fa-solid fa-award"></i>
            <span>Candidato al Emmy Latino</span>
          </div>
          <div class="qs__profile-award">
            <i class="fa-solid fa-trophy"></i>
            <span>Premio Nacional Periodismo Digital</span>
          </div>
          <div class="qs__profile-award">
            <i class="fa-solid fa-shield-halved"></i>
            <span>Cuenta verificada · 5 plataformas</span>
          </div>
        </div>

        <div class="qs__profile-stats">
          <div class="qs__profile-stat" v-for="stat in statsA" :key="stat.label">
            <div class="qs__profile-stat-n">{{ stat.n }}</div>
            <div class="qs__profile-stat-l">{{ stat.label }}</div>
          </div>
        </div>

        <div class="qs__profile-socials">
          <a href="https://www.instagram.com/anderssonboscan/?hl=es" target="_blank" rel="noopener" class="qs__social qs__social--ig">
            <i class="fa-brands fa-instagram"></i>
            <div class="qs__social-info">
              <span class="qs__social-handle">@anderssonboscan</span>
              <span class="qs__social-stat">Instagram</span>
            </div>
          </a>
          <a href="https://www.tiktok.com/@anderssonboscan" target="_blank" rel="noopener" class="qs__social qs__social--tk">
            <i class="fa-brands fa-tiktok"></i>
            <div class="qs__social-info">
              <span class="qs__social-handle">@anderssonboscan</span>
              <span class="qs__social-stat">TikTok · 910K seguidores</span>
            </div>
          </a>
          <a href="https://www.youtube.com/@anderssonboscan" target="_blank" rel="noopener" class="qs__social qs__social--yt">
            <i class="fa-brands fa-youtube"></i>
            <div class="qs__social-info">
              <span class="qs__social-handle">@anderssonboscan</span>
              <span class="qs__social-stat">YouTube · 500K reprod/día</span>
            </div>
          </a>
          <a href="https://www.youtube.com/@cafelaposta" target="_blank" rel="noopener" class="qs__social qs__social--yt">
            <i class="fa-brands fa-youtube"></i>
            <div class="qs__social-info">
              <span class="qs__social-handle">@cafelaposta</span>
              <span class="qs__social-stat">YouTube · Café La Posta</span>
            </div>
          </a>
          <a href="https://x.com/AnderssonBoscan" target="_blank" rel="noopener" class="qs__social qs__social--x">
            <i class="fa-brands fa-x-twitter"></i>
            <div class="qs__social-info">
              <span class="qs__social-handle">@AnderssonBoscan</span>
              <span class="qs__social-stat">404K · Verificado</span>
            </div>
          </a>
          <a href="https://www.facebook.com/AnderssonBoscan/" target="_blank" rel="noopener" class="qs__social qs__social--fb">
            <i class="fa-brands fa-facebook"></i>
            <div class="qs__social-info">
              <span class="qs__social-handle">AnderssonBoscan</span>
              <span class="qs__social-stat">Facebook · 42.4M imp./año</span>
            </div>
          </a>
          <a href="https://open.spotify.com/show/3wDoVhiPD63OxI0YZ4Ymh7" target="_blank" rel="noopener" class="qs__social qs__social--sp">
            <i class="fa-brands fa-spotify"></i>
            <div class="qs__social-info">
              <span class="qs__social-handle">Podcast Boscán</span>
              <span class="qs__social-stat">Spotify · 85K reprod/mes</span>
            </div>
          </a>
          <a href="https://wa.me/593969097841" target="_blank" rel="noopener" class="qs__social qs__social--wa">
            <i class="fa-brands fa-whatsapp"></i>
            <div class="qs__social-info">
              <span class="qs__social-handle">WhatsApp directo</span>
              <span class="qs__social-stat">Contacto comercial</span>
            </div>
          </a>
        </div>

        <button class="qs__profile-cta" @click="openModal">
          <span>Publicitar con Andersson</span>
          <i class="fa-solid fa-arrow-right"></i>
        </button>
      </div>
    </section>

    <!-- ── DIVIDER ─────────────────────────────────────────── -->
    <div class="qs__divider" ref="dividerEl">
      <div class="qs__divider-line"></div>
      <div class="qs__divider-badge">& LA MONI</div>
      <div class="qs__divider-line"></div>
    </div>

    <!-- ── MONI ───────────────────────────────────────────── -->
    <section class="qs__profile qs__profile--m" ref="profileMEl">
      <div class="qs__profile-content qs__profile-content--m" ref="contentMEl">
        <div class="qs__profile-meta">
          <span class="qs__profile-country qs__profile-country--gold"><i class="fa-solid fa-location-dot"></i> Venezuela · LATAM</span>
          <span class="qs__profile-role">Presentadora · Productora · Creadora</span>
        </div>

        <h2 class="qs__profile-name">
          <span class="qs__profile-name-first">Mónica</span>
          <span class="qs__profile-name-last qs__profile-name-last--gold">Velásquez</span>
        </h2>

        <p class="qs__profile-bio">
          Conocida como <strong>"La Moni"</strong>, combina carisma, autenticidad y narrativa visual para
          conectar marcas con comunidades reales. Presentadora, productora y creadora de contenido con
          una energía que conquista audiencias en segundos. Su canal es un laboratorio de contenido con
          millones de reproducciones y <strong>engagement orgánico que supera el 70× su base de seguidores</strong>.
        </p>

        <div class="qs__profile-awards">
          <div class="qs__profile-award qs__profile-award--gold">
            <i class="fa-solid fa-fire"></i>
            <span>13.7M vistas semanales en Instagram</span>
          </div>
          <div class="qs__profile-award qs__profile-award--gold">
            <i class="fa-solid fa-chart-line"></i>
            <span>Engagement 70× su base orgánica</span>
          </div>
          <div class="qs__profile-award qs__profile-award--gold">
            <i class="fa-solid fa-star"></i>
            <span>Canal en explosión · Crecimiento sostenido</span>
          </div>
        </div>

        <div class="qs__profile-stats">
          <div class="qs__profile-stat qs__profile-stat--gold" v-for="stat in statsM" :key="stat.label">
            <div class="qs__profile-stat-n">{{ stat.n }}</div>
            <div class="qs__profile-stat-l">{{ stat.label }}</div>
          </div>
        </div>

        <div class="qs__profile-socials">
          <a href="https://www.instagram.com/monivelasquezv" target="_blank" rel="noopener" class="qs__social qs__social--ig">
            <i class="fa-brands fa-instagram"></i>
            <div class="qs__social-info">
              <span class="qs__social-handle">@monivelasquezv</span>
              <span class="qs__social-stat">Instagram · 13.7M vistas/sem</span>
            </div>
          </a>
          <a href="https://www.tiktok.com/@monivelasquezv" target="_blank" rel="noopener" class="qs__social qs__social--tk">
            <i class="fa-brands fa-tiktok"></i>
            <div class="qs__social-info">
              <span class="qs__social-handle">@monivelasquezv</span>
              <span class="qs__social-stat">TikTok</span>
            </div>
          </a>
          <a href="https://www.youtube.com/@monivelasquezv" target="_blank" rel="noopener" class="qs__social qs__social--yt">
            <i class="fa-brands fa-youtube"></i>
            <div class="qs__social-info">
              <span class="qs__social-handle">@monivelasquezv</span>
              <span class="qs__social-stat">YouTube</span>
            </div>
          </a>
          <a href="https://www.facebook.com/monivelasquezv" target="_blank" rel="noopener" class="qs__social qs__social--fb">
            <i class="fa-brands fa-facebook"></i>
            <div class="qs__social-info">
              <span class="qs__social-handle">monivelasquezv</span>
              <span class="qs__social-stat">Facebook</span>
            </div>
          </a>
          <a href="https://x.com/MoniVelasquezV" target="_blank" rel="noopener" class="qs__social qs__social--x">
            <i class="fa-brands fa-x-twitter"></i>
            <div class="qs__social-info">
              <span class="qs__social-handle">@MoniVelasquezV</span>
              <span class="qs__social-stat">X / Twitter</span>
            </div>
          </a>
          <a href="https://www.threads.net/@monivelasquezv" target="_blank" rel="noopener" class="qs__social qs__social--th">
            <i class="fa-brands fa-threads"></i>
            <div class="qs__social-info">
              <span class="qs__social-handle">@monivelasquezv</span>
              <span class="qs__social-stat">Threads</span>
            </div>
          </a>
        </div>

        <button class="qs__profile-cta qs__profile-cta--gold" @click="openModal">
          <span>Publicitar con La Moni</span>
          <i class="fa-solid fa-arrow-right"></i>
        </button>
      </div>

      <div class="qs__profile-photo-wrap qs__profile-photo-wrap--m">
        <div class="qs__profile-photo qs__profile-photo--m" ref="photoMEl"></div>
        <div class="qs__profile-photo-fade qs__profile-photo-fade--m"></div>
        <div class="qs__profile-number qs__profile-number--gold">02</div>
      </div>
    </section>

    <!-- ── CLOSING STATEMENT ─────────────────────────────── -->
    <section class="qs__closing" ref="closingEl">
      <div class="qs__closing-inner">
        <p class="qs__closing-quote">
          "Juntos alcanzan más de <em>88 millones</em> de personas al mes.<br>
          Tu marca, en el centro de la conversación."
        </p>
        <button class="qs__closing-cta" @click="openModal">
          <i class="fa-solid fa-handshake"></i> Hablemos de tu campaña
        </button>
      </div>
    </section>

  </div>
</template>

<script setup lang="ts">
import { ref, onMounted } from 'vue'
import { gsap } from 'gsap'
import { ScrollTrigger } from 'gsap/ScrollTrigger'
import { useLeadModal } from '@/composables/useLeadModal'

gsap.registerPlugin(ScrollTrigger)

const { openModal } = useLeadModal()

const introEl    = ref<HTMLElement | null>(null)
const eyebrowEl  = ref<HTMLElement | null>(null)
const subEl      = ref<HTMLElement | null>(null)
const ruleEl     = ref<HTMLElement | null>(null)
const scrollEl   = ref<HTMLElement | null>(null)
const profileAEl = ref<HTMLElement | null>(null)
const photoAEl   = ref<HTMLElement | null>(null)
const contentAEl = ref<HTMLElement | null>(null)
const dividerEl  = ref<HTMLElement | null>(null)
const profileMEl = ref<HTMLElement | null>(null)
const photoMEl   = ref<HTMLElement | null>(null)
const contentMEl = ref<HTMLElement | null>(null)
const closingEl  = ref<HTMLElement | null>(null)

const statsA = [
  { n: '910K', label: 'TikTok' },
  { n: '404K', label: 'X verificado' },
  { n: '88.7M', label: 'Alcance/mes' },
  { n: '500K', label: 'Reprod/día' },
]

const statsM = [
  { n: '13.7M', label: 'Vistas/sem IG' },
  { n: '70×', label: 'Alcance orgánico' },
  { n: '2', label: 'Canales activos' },
]

onMounted(() => {
  // ── Intro ──
  const tl = gsap.timeline({ defaults: { ease: 'power3.out' } })

  tl.from(eyebrowEl.value, { opacity: 0, y: 20, duration: 0.8 }, 0.3)
    .from('.qs__intro-title-line', { opacity: 0, y: 60, stagger: 0.12, duration: 1 }, 0.5)
    .from(subEl.value, { opacity: 0, y: 20, duration: 0.8 }, 1.2)
    .from(ruleEl.value, { scaleX: 0, transformOrigin: 'left', duration: 0.8 }, 1.4)
    .from(scrollEl.value, { opacity: 0, y: 10, duration: 0.6 }, 1.7)

  // ── Intro bg lines parallax ──
  ScrollTrigger.create({
    trigger: introEl.value,
    start: 'top top',
    end: 'bottom top',
    scrub: 1,
    onUpdate: (self) => {
      gsap.set('.qs__intro-lines span', {
        yPercent: (i) => self.progress * (15 + i * 8),
      })
    },
  })

  // ── Andersson ──
  ScrollTrigger.create({
    trigger: profileAEl.value,
    start: 'top bottom',
    end: 'bottom top',
    scrub: 1.5,
    onUpdate: (self) => {
      if (photoAEl.value) gsap.set(photoAEl.value, { yPercent: self.progress * 20 })
    },
  })

  gsap.timeline({
    scrollTrigger: { trigger: profileAEl.value, start: 'top 70%', once: true },
    defaults: { ease: 'power3.out' },
  })
    .from(photoAEl.value, { x: -80, opacity: 0, duration: 1.2 })
    .from(contentAEl.value?.children ?? [], { x: 50, opacity: 0, stagger: 0.1, duration: 0.8 }, '-=0.8')

  // ── Divider ──
  gsap.from('.qs__divider-line', {
    scrollTrigger: { trigger: dividerEl.value, start: 'top 80%', once: true },
    scaleX: 0, transformOrigin: 'center', duration: 1, ease: 'power3.out', stagger: 0.2,
  })
  gsap.from('.qs__divider-badge', {
    scrollTrigger: { trigger: dividerEl.value, start: 'top 80%', once: true },
    opacity: 0, scale: 0.7, duration: 0.8, ease: 'back.out(1.7)', delay: 0.3,
  })

  // ── Moni ──
  ScrollTrigger.create({
    trigger: profileMEl.value,
    start: 'top bottom',
    end: 'bottom top',
    scrub: 1.5,
    onUpdate: (self) => {
      if (photoMEl.value) gsap.set(photoMEl.value, { yPercent: self.progress * 20 })
    },
  })

  gsap.timeline({
    scrollTrigger: { trigger: profileMEl.value, start: 'top 70%', once: true },
    defaults: { ease: 'power3.out' },
  })
    .from(photoMEl.value, { x: 80, opacity: 0, duration: 1.2 })
    .from(contentMEl.value?.children ?? [], { x: -50, opacity: 0, stagger: 0.1, duration: 0.8 }, '-=0.8')

  // ── Closing ──
  gsap.from('.qs__closing-quote', {
    scrollTrigger: { trigger: closingEl.value, start: 'top 75%', once: true },
    opacity: 0, y: 40, duration: 1, ease: 'power3.out',
  })
  gsap.from('.qs__closing-cta', {
    scrollTrigger: { trigger: closingEl.value, start: 'top 70%', once: true },
    opacity: 0, y: 20, duration: 0.8, ease: 'power3.out', delay: 0.4,
  })
})
</script>

<style lang="scss" scoped>
// ── Variables ──────────────────────────────────────────────
$red:    var(--mk-red);
$gold:   var(--mk-gold);
$cream:  var(--mk-cream);
$black:  #080808;
$dim:    var(--mk-dim);
$dimmer: var(--mk-dimmer);

// ── Root ───────────────────────────────────────────────────
.qs {
  background: $black;
  color: $cream;
}

// ── INTRO ──────────────────────────────────────────────────
.qs__intro {
  position: relative;
  min-height: 100vh;
  display: flex;
  align-items: center;
  justify-content: center;
  overflow: hidden;
  background: $black;

  &-noise {
    position: absolute;
    inset: 0;
    background-image: url("data:image/svg+xml,%3Csvg viewBox='0 0 256 256' xmlns='http://www.w3.org/2000/svg'%3E%3Cfilter id='noise'%3E%3CfeTurbulence type='fractalNoise' baseFrequency='0.9' numOctaves='4' stitchTiles='stitch'/%3E%3C/filter%3E%3Crect width='100%25' height='100%25' filter='url(%23noise)' opacity='0.04'/%3E%3C/svg%3E");
    opacity: 0.4;
    pointer-events: none;
  }

  &-lines {
    position: absolute;
    inset: 0;
    overflow: hidden;
    pointer-events: none;

    span {
      position: absolute;
      top: 0;
      bottom: 0;
      width: 1px;
      background: rgba(245,242,237,0.04);

      &:nth-child(1) { left: 16.66% }
      &:nth-child(2) { left: 33.33% }
      &:nth-child(3) { left: 50% }
      &:nth-child(4) { left: 66.66% }
      &:nth-child(5) { left: 83.33% }
      &:nth-child(6) { left: 100% }
    }
  }

  &-inner {
    position: relative;
    z-index: 2;
    text-align: center;
    padding: clamp(80px, 10vh, 120px) clamp(24px, 6vw, 80px);
    max-width: 900px;
  }

  &-eyebrow {
    font-family: 'DM Sans', sans-serif;
    font-size: 11px;
    letter-spacing: 0.45em;
    text-transform: uppercase;
    color: $gold;
    font-weight: 700;
    margin-bottom: 32px;
  }

  &-title {
    display: flex;
    flex-direction: column;
    font-family: 'Bebas Neue', sans-serif;
    font-size: clamp(4.5rem, 13vw, 10rem);
    line-height: 0.88;
    margin: 0 0 40px;
    gap: 0;

    &-line {
      display: block;
      color: $cream;

      &--accent {
        color: transparent;
        -webkit-text-stroke: 1px rgba(245,242,237,0.3);
        font-size: clamp(3rem, 9vw, 7rem);
        letter-spacing: 0.1em;
      }
    }
  }

  &-sub {
    font-family: 'DM Sans', sans-serif;
    font-size: clamp(14px, 1.8vw, 18px);
    color: $dim;
    line-height: 1.7;
    max-width: 560px;
    margin: 0 auto 32px;
  }

  &-rule {
    width: 80px;
    height: 2px;
    background: linear-gradient(to right, $red, $gold);
    margin: 0 auto 40px;
    border-radius: 2px;
  }

  &-scroll {
    display: inline-flex;
    align-items: center;
    gap: 10px;
    font-family: 'DM Sans', sans-serif;
    font-size: 11px;
    letter-spacing: 0.3em;
    text-transform: uppercase;
    color: $dimmer;
    animation: bob 2.5s ease-in-out infinite;
  }
}

@keyframes bob {
  0%, 100% { transform: translateY(0) }
  50% { transform: translateY(6px) }
}

// ── PROFILE ────────────────────────────────────────────────
.qs__profile {
  display: flex;
  min-height: 100vh;
  overflow: hidden;
  background: $black;

  @media (max-width: 860px) {
    flex-direction: column;
  }

  &--m {
    @media (max-width: 860px) {
      flex-direction: column-reverse;
    }
  }

  &-photo-wrap {
    position: relative;
    width: 46%;
    flex-shrink: 0;
    overflow: hidden;

    @media (max-width: 860px) {
      width: 100%;
      height: 55vw;
      min-height: 320px;
    }

    &--m {
      @media (max-width: 860px) {
        order: -1;
      }
    }
  }

  &-photo {
    position: absolute;
    inset: -10%;
    background-size: cover;
    background-repeat: no-repeat;
    will-change: transform;

    &--a {
      background-image: url('/images/p2-photo.png');
      background-position: center top;
    }

    &--m {
      background-image: url('/images/p10-photo.png');
      background-position: center top;
    }
  }

  &-photo-fade {
    position: absolute;
    inset: 0;
    pointer-events: none;

    &--a {
      background:
        linear-gradient(to right, transparent 55%, $black 100%),
        linear-gradient(to top, $black 0%, transparent 20%);

      @media (max-width: 860px) {
        background: linear-gradient(to bottom, transparent 50%, $black 100%);
      }
    }

    &--m {
      background:
        linear-gradient(to left, transparent 55%, $black 100%),
        linear-gradient(to top, $black 0%, transparent 20%);

      @media (max-width: 860px) {
        background: linear-gradient(to bottom, transparent 50%, $black 100%);
      }
    }
  }

  &-number {
    position: absolute;
    bottom: clamp(20px, 4vw, 40px);
    left: clamp(20px, 4vw, 40px);
    font-family: 'Bebas Neue', sans-serif;
    font-size: clamp(80px, 12vw, 140px);
    line-height: 1;
    color: rgba(245,242,237,0.04);
    pointer-events: none;
    user-select: none;

    &--gold { color: rgba(201,168,76,0.06); }

    @media (max-width: 860px) {
      display: none;
    }
  }

  &-content {
    flex: 1;
    display: flex;
    flex-direction: column;
    justify-content: center;
    padding: clamp(48px, 7vh, 96px) clamp(32px, 5vw, 72px);
    position: relative;
    z-index: 2;

    &--m {
      padding-left: clamp(40px, 6vw, 80px);
      padding-right: clamp(32px, 4vw, 56px);
    }
  }

  &-meta {
    display: flex;
    flex-wrap: wrap;
    gap: 12px 24px;
    margin-bottom: 20px;
  }

  &-country,
  &-role {
    font-family: 'DM Sans', sans-serif;
    font-size: 11px;
    letter-spacing: 0.2em;
    text-transform: uppercase;
    font-weight: 700;

    i { margin-right: 6px; }
  }

  &-country {
    color: $red;
    &--gold { color: $gold; }
  }

  &-role {
    color: $dimmer;
  }

  &-name {
    display: flex;
    flex-direction: column;
    font-family: 'Bebas Neue', sans-serif;
    line-height: 0.88;
    margin: 0 0 28px;

    &-first {
      font-size: clamp(3.5rem, 7vw, 6.5rem);
      color: $cream;
    }

    &-last {
      font-size: clamp(3.5rem, 7vw, 6.5rem);
      color: $red;
      &--gold { color: $gold; }
    }
  }

  &-bio {
    font-family: 'DM Sans', sans-serif;
    font-size: clamp(13px, 1.4vw, 15px);
    color: $dim;
    line-height: 1.75;
    margin: 0 0 28px;
    max-width: 520px;

    strong { color: $cream; font-weight: 600; }
  }

  &-awards {
    display: flex;
    flex-direction: column;
    gap: 10px;
    margin-bottom: 32px;
  }

  &-award {
    display: flex;
    align-items: center;
    gap: 10px;
    font-family: 'DM Sans', sans-serif;
    font-size: 12px;
    color: $dimmer;

    i {
      color: $red;
      font-size: 13px;
      width: 16px;
      flex-shrink: 0;
    }

    &--gold i { color: $gold; }
  }

  &-stats {
    display: flex;
    gap: clamp(20px, 3vw, 40px);
    padding: 24px 0;
    border-top: 1px solid rgba(245,242,237,0.07);
    border-bottom: 1px solid rgba(245,242,237,0.07);
    margin-bottom: 28px;
    flex-wrap: wrap;
  }

  &-stat {
    display: flex;
    flex-direction: column;
    gap: 4px;

    &-n {
      font-family: 'Bebas Neue', sans-serif;
      font-size: clamp(1.6rem, 3vw, 2.4rem);
      color: $cream;
      line-height: 1;
    }

    &-l {
      font-family: 'DM Sans', sans-serif;
      font-size: 10px;
      letter-spacing: 0.12em;
      text-transform: uppercase;
      color: $gold;
      opacity: 0.8;
    }

    &--gold &-n { color: $gold; }
  }

  &-socials {
    display: grid;
    grid-template-columns: 1fr 1fr;
    gap: 10px;
    margin-bottom: 32px;

    @media (max-width: 1100px) {
      grid-template-columns: 1fr;
    }
  }

  &-cta {
    display: inline-flex;
    align-items: center;
    gap: 12px;
    padding: 14px 28px;
    background: $red;
    border: 2px solid $red;
    border-radius: 4px;
    color: $cream;
    font-family: 'DM Sans', sans-serif;
    font-size: 13px;
    font-weight: 700;
    letter-spacing: 0.1em;
    text-transform: uppercase;
    cursor: pointer;
    transition: all 0.25s;
    align-self: flex-start;

    i { transition: transform 0.25s; }

    &:hover {
      background: transparent;
      color: $red;
      i { transform: translateX(4px); }
    }

    &--gold {
      background: transparent;
      border-color: $gold;
      color: $gold;

      &:hover {
        background: rgba(201,168,76,0.08);
        i { transform: translateX(4px); }
      }
    }
  }
}

// ── SOCIALS ────────────────────────────────────────────────
.qs__social {
  display: inline-flex;
  align-items: center;
  gap: 14px;
  padding: 10px 16px;
  border-radius: 8px;
  border: 1px solid rgba(245,242,237,0.08);
  text-decoration: none;
  transition: all 0.25s;
  background: rgba(245,242,237,0.02);

  > i {
    font-size: 20px;
    flex-shrink: 0;
  }

  &-info {
    display: flex;
    flex-direction: column;
    gap: 2px;
  }

  &-handle {
    font-family: 'DM Sans', sans-serif;
    font-size: 13px;
    font-weight: 600;
    color: $cream;
  }

  &-stat {
    font-family: 'DM Sans', sans-serif;
    font-size: 11px;
    color: $dimmer;
  }

  &--ig {
    i { color: #e1306c; }
    &:hover { border-color: rgba(225,48,108,0.4); background: rgba(225,48,108,0.06); transform: translateX(4px); }
  }

  &--tk {
    i { color: #ffffff; }
    &:hover { border-color: rgba(255,255,255,0.3); background: rgba(255,255,255,0.04); transform: translateX(4px); }
  }

  &--yt {
    i { color: #ff4444; }
    &:hover { border-color: rgba(255,68,68,0.4); background: rgba(255,68,68,0.06); transform: translateX(4px); }
  }

  &--x {
    i { color: $cream; }
    &:hover { border-color: rgba(245,242,237,0.3); background: rgba(245,242,237,0.06); transform: translateX(4px); }
  }

  &--fb {
    i { color: #1877f2; }
    &:hover { border-color: rgba(24,119,242,0.4); background: rgba(24,119,242,0.06); transform: translateX(4px); }
  }

  &--sp {
    i { color: #1db954; }
    &:hover { border-color: rgba(29,185,84,0.4); background: rgba(29,185,84,0.06); transform: translateX(4px); }
  }

  &--wa {
    i { color: #25d366; }
    &:hover { border-color: rgba(37,211,102,0.4); background: rgba(37,211,102,0.06); transform: translateX(4px); }
  }

  &--th {
    i { color: $cream; }
    &:hover { border-color: rgba(245,242,237,0.3); background: rgba(245,242,237,0.06); transform: translateX(4px); }
  }
}

// ── DIVIDER ────────────────────────────────────────────────
.qs__divider {
  display: flex;
  align-items: center;
  gap: 24px;
  padding: 0 clamp(32px, 6vw, 80px);
  background: $black;

  &-line {
    flex: 1;
    height: 1px;
    background: linear-gradient(to right, transparent, rgba(201,168,76,0.3), transparent);
  }

  &-badge {
    font-family: 'Bebas Neue', sans-serif;
    font-size: 28px;
    letter-spacing: 0.3em;
    color: $gold;
    white-space: nowrap;
    padding: 32px 0;
  }
}

// ── CLOSING ────────────────────────────────────────────────
.qs__closing {
  padding: clamp(60px, 10vh, 120px) clamp(24px, 6vw, 80px);
  text-align: center;
  background: $black;
  border-top: 1px solid rgba(245,242,237,0.06);

  &-inner {
    max-width: 700px;
    margin: 0 auto;
    display: flex;
    flex-direction: column;
    align-items: center;
    gap: 40px;
  }

  &-quote {
    font-family: 'Playfair Display', serif;
    font-style: italic;
    font-size: clamp(1.2rem, 2.5vw, 1.8rem);
    color: $cream;
    line-height: 1.6;
    margin: 0;

    em {
      color: $red;
      font-style: normal;
    }
  }

  &-cta {
    display: inline-flex;
    align-items: center;
    gap: 12px;
    padding: 16px 40px;
    background: $red;
    border: 2px solid $red;
    border-radius: 4px;
    color: $cream;
    font-family: 'DM Sans', sans-serif;
    font-size: 14px;
    font-weight: 700;
    letter-spacing: 0.1em;
    text-transform: uppercase;
    cursor: pointer;
    transition: all 0.25s;

    &:hover {
      background: transparent;
      color: $red;
      transform: translateY(-2px);
      box-shadow: 0 12px 32px rgba(200,57,43,0.2);
    }
  }
}
</style>
