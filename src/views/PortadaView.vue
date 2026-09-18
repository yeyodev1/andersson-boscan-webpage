<template>
  <main
    class="pt"
    ref="rootEl"
    @pointerenter="onEnter"
    @pointerleave="onLeave"
    @pointermove="onMove"
  >
    <div class="pt__floor" aria-hidden="true"></div>

    <header class="pt__top">
      <h1 class="pt__logo" ref="logoEl">
        Boscán <span class="pt__amp">&amp;</span> La Moni
      </h1>
      <span class="pt__rule" ref="ruleEl"></span>
    </header>

    <a href="/publicidad" class="pt__mk" @click.prevent="goPublicidad">Media kit 2026</a>

    <!-- Hilos rojos -->
    <svg class="pt__threads" ref="svgEl" aria-hidden="true">
      <line
        v-for="f in folders"
        :key="'l-' + f.id"
        :ref="el => setLine(f.id, el as SVGLineElement)"
        class="pt__thread"
      />
      <circle
        v-for="f in folders"
        :key="'c-' + f.id"
        :ref="el => setDot(f.id, el as SVGCircleElement)"
        class="pt__thread-dot"
        r="2.2"
      />
    </svg>

    <!-- Carpetas -->
    <div
      v-for="f in folders"
      :key="f.id"
      class="pt__fw"
      :class="{ 'is-dragging': dragId === f.id, 'pt__fw--mobile-hide': f.mobileHide }"
      :style="{ left: f.left, top: f.top, '--rot': f.rot + 'deg', '--depth': f.depth }"
      :ref="el => setWrap(f.id, el as HTMLElement)"
      @pointerdown="onDragStart($event, f.id)"
    >
      <div class="pt__par" :ref="el => setPar(f.id, el as HTMLElement)">
        <div class="folder" :class="`folder--${f.variant}`" :ref="el => setFolder(f.id, el as HTMLElement)">
          <div class="folder__tab"></div>
          <div class="folder__body">
            <div class="folder__photo"></div>
            <div class="folder__label">{{ f.label }}</div>
          </div>
          <div class="folder__edge"></div>
        </div>
      </div>
    </div>

    <!-- Pareja -->
    <figure class="pt__photo" ref="photoEl">
      <img src="/images/portada-pareja.png" alt="Andersson Boscán y Mónica Velásquez" draggable="false" />
    </figure>

    <!-- CTAs -->
    <nav class="pt__ctas" ref="ctasEl" aria-label="Elige tu camino">
      <a href="/periodismo/" class="pt__cta pt__cta--light">
        <span class="pt__cta-dash"></span>
        <span class="pt__cta-text">Quiero periodismo</span>
        <span class="pt__cta-arrow">→</span>
      </a>
      <a href="/publicidad" class="pt__cta pt__cta--dark" @click.prevent="goPublicidad">
        <span class="pt__cta-dash"></span>
        <span class="pt__cta-text">Quiero publicidad</span>
        <span class="pt__cta-arrow">→</span>
      </a>
    </nav>

    <div class="pt__reflection" aria-hidden="true">
      <span class="pt__cta pt__cta--light"><span class="pt__cta-dash"></span><span class="pt__cta-text">Quiero periodismo</span><span class="pt__cta-arrow">→</span></span>
      <span class="pt__cta pt__cta--dark"><span class="pt__cta-dash"></span><span class="pt__cta-text">Quiero publicidad</span><span class="pt__cta-arrow">→</span></span>
    </div>

    <p class="pt__hint" :class="{ 'is-hidden': revealed }" ref="hintEl">Pasa el cursor para abrir los expedientes</p>

    <footer class="pt__foot">
      <span>Periodismo de investigación · Toronto</span>
      <span>© 2026 Eureka Productions</span>
    </footer>

    <!-- Cortina de salida hacia /publicidad (mismo negro que el media kit) -->
    <div class="pt__curtain" ref="curtainEl" aria-hidden="true">
      <span class="pt__curtain-line" ref="curtainLineEl"></span>
    </div>
  </main>
</template>

<script setup lang="ts">
import { ref, onMounted, onBeforeUnmount } from 'vue'
import { useRouter } from 'vue-router'
import { gsap } from 'gsap'

const router = useRouter()

interface Folder {
  id: string
  /** Slug del expediente en el sitio estático de investigaciones. */
  slug: string
  label: string
  variant: 'black' | 'manila'
  left: string
  top: string
  rot: number
  depth: number
  side: 'l' | 'r'
  mobileHide?: boolean
}

const folders: Folder[] = [
  { id: 'narcobabies', slug: 'narco-babies', label: 'Narcobabies',        variant: 'black',  left: '6%',  top: '16%', rot: -8,  depth: 1.0, side: 'l' },
  { id: 'odebrecht', slug: 'bribery-division',   label: 'Odebrecht',          variant: 'manila', left: '22%', top: '24%', rot: 5,   depth: 0.6, side: 'l', mobileHide: true },
  { id: 'padrino', slug: 'el-gran-padrino',     label: 'Caso Gran Padrino',  variant: 'black',  left: '9%',  top: '44%', rot: -4,  depth: 0.8, side: 'l' },
  { id: 'albanesa', slug: 'mafia-albanesa',    label: 'La Mafia Albanesa',  variant: 'manila', left: '20%', top: '60%', rot: 7,   depth: 0.5, side: 'l', mobileHide: true },
  { id: 'caminosca', slug: 'caminosca',   label: 'Caminosca',          variant: 'black',  left: '64%', top: '18%', rot: 6,   depth: 0.7, side: 'r', mobileHide: true },
  { id: 'madrina', slug: 'madrina-narcogenerales',     label: 'La Madrina',         variant: 'manila', left: '80%', top: '22%', rot: -6,  depth: 1.0, side: 'r' },
  { id: 'choneros', slug: 'caida-de-fito',    label: 'Los Choneros',       variant: 'manila', left: '66%', top: '44%', rot: -3,  depth: 0.6, side: 'r', mobileHide: true },
  { id: 'pazoplomo', slug: 'paz-o-plomo',   label: 'Paz o Plomo',        variant: 'black',  left: '82%', top: '48%', rot: 8,   depth: 0.9, side: 'r' },
]

const rootEl  = ref<HTMLElement | null>(null)
const logoEl  = ref<HTMLElement | null>(null)
const ruleEl  = ref<HTMLElement | null>(null)
const photoEl = ref<HTMLElement | null>(null)
const ctasEl  = ref<HTMLElement | null>(null)
const hintEl  = ref<HTMLElement | null>(null)
const svgEl   = ref<SVGSVGElement | null>(null)
const curtainEl     = ref<HTMLElement | null>(null)
const curtainLineEl = ref<HTMLElement | null>(null)

const wraps   = new Map<string, HTMLElement>()
const pars    = new Map<string, HTMLElement>()
const fEls    = new Map<string, HTMLElement>()
const lines   = new Map<string, SVGLineElement>()
const dots    = new Map<string, SVGCircleElement>()

const setWrap   = (id: string, el: HTMLElement | null)     => { if (el) wraps.set(id, el) }
const setPar    = (id: string, el: HTMLElement | null)     => { if (el) pars.set(id, el) }
const setFolder = (id: string, el: HTMLElement | null)     => { if (el) fEls.set(id, el) }
const setLine   = (id: string, el: SVGLineElement | null)  => { if (el) lines.set(id, el) }
const setDot    = (id: string, el: SVGCircleElement | null) => { if (el) dots.set(id, el) }

const revealed = ref(false)
const dragId   = ref<string | null>(null)

const reduceMotion = typeof window !== 'undefined' && window.matchMedia('(prefers-reduced-motion: reduce)').matches
const coarse       = typeof window !== 'undefined' && window.matchMedia('(pointer: coarse)').matches

let raf = 0
let hideTimer = 0
let floats: gsap.core.Tween[] = []

// ── Hilos ──────────────────────────────────────────────────────
function updateThreads() {
  const root = rootEl.value
  if (!root) return
  const rb = root.getBoundingClientRect()
  const pb = photoEl.value?.getBoundingClientRect()
  const ax = pb ? pb.left + pb.width / 2 - rb.left : rb.width / 2
  const ay = pb ? pb.top + pb.height * 0.45 - rb.top : rb.height * 0.5

  for (const f of folders) {
    const el = fEls.get(f.id)
    const ln = lines.get(f.id)
    const dt = dots.get(f.id)
    if (!el || !ln || !dt) continue
    const b = el.getBoundingClientRect()
    const x = b.left + b.width / 2 - rb.left
    const y = b.top + b.height / 2 - rb.top
    const tx = ax + (f.side === 'l' ? -pb!.width * 0.22 : pb!.width * 0.22)
    ln.setAttribute('x1', String(x));  ln.setAttribute('y1', String(y))
    ln.setAttribute('x2', String(tx)); ln.setAttribute('y2', String(ay))
    dt.setAttribute('cx', String(x));  dt.setAttribute('cy', String(y))
  }
}

function loop() {
  updateThreads()
  raf = requestAnimationFrame(loop)
}

// ── Reveal / hide ───────────────────────────────────────────────
function reveal() {
  if (revealed.value) return
  revealed.value = true
  clearTimeout(hideTimer)
  const els = folders.map(f => fEls.get(f.id)!).filter(Boolean)
  floats.forEach(t => t.kill()); floats = []
  gsap.killTweensOf(els)

  if (reduceMotion) {
    gsap.set(els, { opacity: 1, y: 0, scale: 1, rotate: (i) => folders[i]?.rot ?? 0 })
    gsap.set([svgEl.value], { opacity: 1 })
    updateThreads()
    return
  }

  gsap.fromTo(els,
    { opacity: 0, y: 60, scale: 0.7, rotate: (i) => (folders[i]?.rot ?? 0) + 14, filter: 'blur(6px)' },
    { opacity: 1, y: 0, scale: 1, rotate: (i) => folders[i]?.rot ?? 0, filter: 'blur(0px)',
      duration: 1.1, ease: 'expo.out', stagger: { each: 0.06, from: 'random' },
      onComplete: startFloat })
  gsap.fromTo(svgEl.value, { opacity: 0 }, { opacity: 1, duration: 1.2, delay: 0.35, ease: 'power2.out' })
  cancelAnimationFrame(raf)
  loop()
}

function startFloat() {
  folders.forEach((f, i) => {
    const el = fEls.get(f.id)
    if (!el) return
    floats.push(gsap.to(el, {
      y: (i % 2 ? -1 : 1) * (8 + f.depth * 8),
      rotate: f.rot + (i % 2 ? -1.5 : 1.5),
      duration: 2.6 + (i % 3) * 0.6,
      yoyo: true, repeat: -1, ease: 'sine.inOut', delay: i * 0.13,
    }))
  })
}

function hide() {
  if (!revealed.value || coarse) return
  revealed.value = false
  const els = folders.map(f => fEls.get(f.id)!).filter(Boolean)
  floats.forEach(t => t.kill()); floats = []
  gsap.to(els, { opacity: 0, y: 40, scale: 0.85, filter: 'blur(4px)', duration: 0.6, ease: 'power3.in', stagger: 0.02,
    onComplete: () => { cancelAnimationFrame(raf) } })
  gsap.to(svgEl.value, { opacity: 0, duration: 0.4 })
  // Reset posiciones arrastradas y parallax
  folders.forEach(f => {
    const w = wraps.get(f.id); const p = pars.get(f.id)
    if (w) gsap.to(w, { x: 0, y: 0, duration: 0.8, ease: 'power3.inOut' })
    if (p) gsap.to(p, { x: 0, y: 0, duration: 0.8, ease: 'power3.inOut' })
  })
}

function onEnter(e: PointerEvent) {
  if (e.pointerType === 'touch') return
  reveal()
}
function onLeave(e: PointerEvent) {
  if (e.pointerType === 'touch' || dragId.value) return
  hideTimer = window.setTimeout(hide, 700)
}

// ── Parallax ────────────────────────────────────────────────────
function onMove(e: PointerEvent) {
  if (!revealed.value || reduceMotion || dragId.value || e.pointerType === 'touch') return
  const root = rootEl.value; if (!root) return
  const rb = root.getBoundingClientRect()
  const nx = (e.clientX - rb.left) / rb.width - 0.5
  const ny = (e.clientY - rb.top) / rb.height - 0.5
  folders.forEach(f => {
    const p = pars.get(f.id); if (!p) return
    gsap.to(p, { x: -nx * 28 * f.depth, y: -ny * 20 * f.depth, duration: 1.2, ease: 'power3.out', overwrite: 'auto' })
  })
  if (photoEl.value) gsap.to(photoEl.value, { x: -nx * 8, y: -ny * 5, duration: 1.4, ease: 'power3.out', overwrite: 'auto' })
}

// ── Drag ────────────────────────────────────────────────────────
let dragStart = { px: 0, py: 0, x: 0, y: 0, moved: false }
let activeWrap: HTMLElement | null = null

function onDragStart(e: PointerEvent, id: string) {
  if (!revealed.value && !coarse) return
  const w = wraps.get(id); if (!w) return
  e.preventDefault()
  activeWrap = w
  dragId.value = id
  dragStart = { px: e.clientX, py: e.clientY, x: Number(gsap.getProperty(w, 'x')) || 0, y: Number(gsap.getProperty(w, 'y')) || 0, moved: false }
  w.setPointerCapture(e.pointerId)
  w.addEventListener('pointermove', onDragMove)
  w.addEventListener('pointerup', onDragEnd, { once: true })
  w.addEventListener('pointercancel', onDragEnd, { once: true })
  const f = fEls.get(id)
  if (f) gsap.to(f, { scale: 1.06, duration: 0.2, ease: 'power2.out', overwrite: 'auto' })
}
function onDragMove(e: PointerEvent) {
  if (!activeWrap) return
  const dx = e.clientX - dragStart.px
  const dy = e.clientY - dragStart.py
  if (Math.abs(dx) + Math.abs(dy) > 6) dragStart.moved = true
  gsap.set(activeWrap, { x: dragStart.x + dx, y: dragStart.y + dy })
}
function onDragEnd() {
  if (!activeWrap) return
  const id = dragId.value!
  activeWrap.removeEventListener('pointermove', onDragMove)
  const f = fEls.get(id)
  if (f) gsap.to(f, { scale: 1, duration: 0.3, ease: 'power2.out', overwrite: 'auto' })
  const clicked = !dragStart.moved
  activeWrap = null
  dragId.value = null
  if (clicked) {
    const f = folders.find(x => x.id === id)
    window.location.assign(f ? `/periodismo/investigaciones/${f.slug}/` : '/periodismo/')
  }
}

// ── Salida hacia publicidad ─────────────────────────────────────
let leaving = false

/**
 * La cortina tapa toda la pantalla, así que si la navegación no ocurre el
 * visitante se queda mirando un negro del que no puede salir. Por eso: si
 * `router.push` falla o la deja pendiente, forzamos una navegación real del
 * navegador; y si la animación nunca termina, un temporizador navega igual.
 */
function irAPublicidad() {
  router.push('/publicidad').then(fallo => {
    if (fallo) window.location.href = '/publicidad'
  }).catch(() => { window.location.href = '/publicidad' })
}

function goPublicidad() {
  if (leaving) return
  leaving = true
  if (reduceMotion || !curtainEl.value) { irAPublicidad(); return }

  const els = folders.map(f => fEls.get(f.id)!).filter(Boolean)
  floats.forEach(t => t.kill()); floats = []
  const red = setTimeout(irAPublicidad, 1600)
  gsap.timeline({ onComplete: () => { clearTimeout(red); irAPublicidad() } })
    .to([...els, svgEl.value], { opacity: 0, y: -30, duration: 0.4, ease: 'power2.in', stagger: 0.015 }, 0)
    .to([logoEl.value, ruleEl.value, hintEl.value, ctasEl.value], { opacity: 0, y: -16, duration: 0.45, ease: 'power2.in' }, 0)
    .to(photoEl.value, { opacity: 0, scale: 1.04, filter: 'blur(6px)', duration: 0.55, ease: 'power2.in' }, 0)
    .set(curtainEl.value, { visibility: 'visible' }, 0.15)
    .fromTo(curtainEl.value, { yPercent: 100 }, { yPercent: 0, duration: 0.75, ease: 'expo.inOut' }, 0.15)
    .fromTo(curtainLineEl.value, { scaleX: 0 }, { scaleX: 1, duration: 0.5, ease: 'power3.out' }, 0.6)
}

// ── Intro ───────────────────────────────────────────────────────
onMounted(() => {
  const els = folders.map(f => fEls.get(f.id)!).filter(Boolean)
  gsap.set(els, { opacity: 0 })
  gsap.set(svgEl.value, { opacity: 0 })

  const tl = gsap.timeline({ defaults: { ease: 'power3.out' } })
  tl.from(logoEl.value, { y: -18, opacity: 0, duration: 0.9 })
    .from(ruleEl.value, { scaleX: 0, duration: 0.6 }, '-=0.5')
    .from(photoEl.value, { y: 30, opacity: 0, scale: 0.97, duration: 1.2 }, '-=0.6')
    .from(ctasEl.value?.children ?? [], { y: 26, opacity: 0, duration: 0.8, stagger: 0.12 }, '-=0.7')
    .from(hintEl.value, { opacity: 0, duration: 0.6 }, '-=0.3')
  if (coarse) tl.call(reveal, [], '+=0.2')

  window.addEventListener('resize', updateThreads)
})

onBeforeUnmount(() => {
  cancelAnimationFrame(raf)
  clearTimeout(hideTimer)
  floats.forEach(t => t.kill())
  window.removeEventListener('resize', updateThreads)
})
</script>

<style lang="scss">
@import url('https://fonts.googleapis.com/css2?family=Playfair+Display:wght@500;600&family=Cormorant+Garamond:wght@500;600&family=DM+Sans:wght@300;400;500&display=swap');
</style>

<style lang="scss" scoped>
$red: #c8392b;
$ink: #0b0b0b;

.pt {
  position: relative;
  min-height: 100svh;
  overflow: hidden;
  background:
    radial-gradient(120% 80% at 50% 30%, #ffffff 0%, #f6f6f6 45%, #e9e9e9 100%);
  color: $ink;
  font-family: 'DM Sans', sans-serif;
  user-select: none;
  -webkit-user-select: none;

  &__floor {
    position: absolute; inset: auto 0 0 0; height: 34%;
    background: linear-gradient(to bottom, rgba(255,255,255,0) 0%, rgba(215,215,215,0.55) 60%, rgba(200,200,200,0.75) 100%);
    pointer-events: none;
    &::after {
      content: ''; position: absolute; left: 10%; right: 10%; top: 38%; height: 1px;
      background: linear-gradient(90deg, transparent, rgba(0,0,0,0.08), transparent);
    }
  }

  &__top {
    position: absolute; top: clamp(22px, 4vh, 40px); left: 0; right: 0;
    display: flex; flex-direction: column; align-items: center; gap: 10px; z-index: 5; pointer-events: none;
  }
  &__logo {
    font-family: 'Playfair Display', serif; font-weight: 500;
    font-size: clamp(1.94rem, 3.6vw, 3.13rem); letter-spacing: -0.01em; line-height: 1; margin: 0;
  }
  &__amp { color: $red; font-weight: 500; }
  &__rule { width: 28px; height: 2px; background: $ink; opacity: .55; transform-origin: center; }

  &__mk {
    position: absolute; top: clamp(24px, 4vh, 42px); right: clamp(18px, 3vw, 40px); z-index: 6;
    font-size: 1.14rem; letter-spacing: .22em; text-transform: uppercase; color: rgba(11,11,11,.5); text-decoration: none;
    &:hover { color: $red; }
    @media (max-width: 640px) { display: none; }
  }

  &__threads {
    position: absolute; inset: 0; width: 100%; height: 100%; z-index: 2; pointer-events: none; overflow: visible;
  }
  &__thread { stroke: $red; stroke-width: 0.9; opacity: .55; }
  &__thread-dot { fill: $red; opacity: .8; }

  /* Carpetas */
  &__fw {
    position: absolute; z-index: 3; width: clamp(110px, 11vw, 168px); aspect-ratio: 1.36;
    cursor: grab; touch-action: none;
    &.is-dragging { z-index: 20; cursor: grabbing; }
    &.is-dragging .folder { box-shadow: 0 40px 70px rgba(0,0,0,.28); }
    @media (max-width: 640px) {
      width: 92px;
      &--mobile-hide { display: none; }
    }
  }
  &__par { width: 100%; height: 100%; }

  &__photo {
    position: absolute; left: 50%; bottom: 17%; transform: translateX(-50%);
    width: clamp(300px, 40vw, 600px); margin: 0; z-index: 4; pointer-events: none;
    img {
      width: 100%; height: auto; display: block;
      -webkit-mask-image: radial-gradient(ellipse 50% 60% at 50% 42%, #000 52%, rgba(0,0,0,.85) 68%, transparent 100%);
      mask-image: radial-gradient(ellipse 50% 60% at 50% 42%, #000 52%, rgba(0,0,0,.85) 68%, transparent 100%);
      filter: contrast(1.02) saturate(.95);
    }
    @media (max-width: 640px) { width: 78vw; bottom: 28%; }
  }

  &__ctas {
    position: absolute; left: 50%; bottom: 16%; transform: translateX(-50%);
    display: flex; gap: clamp(16px, 3vw, 44px); z-index: 8; width: min(1100px, 92vw); justify-content: center;
    @media (max-width: 760px) { flex-direction: column; align-items: center; bottom: 10%; gap: 12px; }
  }
  &__cta {
    display: inline-flex; align-items: center; gap: clamp(14px, 2.6vw, 36px);
    padding: clamp(16px, 2.2vw, 26px) clamp(24px, 3vw, 44px);
    min-width: clamp(280px, 38vw, 520px);
    border-radius: 10px; text-decoration: none; color: inherit;
    backdrop-filter: blur(14px); -webkit-backdrop-filter: blur(14px);
    transition: transform .35s cubic-bezier(.2,.8,.2,1), box-shadow .35s ease;
    &--light {
      background: rgba(255,255,255,.62); border: 1px solid rgba(255,255,255,.95); color: $ink;
      box-shadow: 0 18px 40px rgba(0,0,0,.10), inset 0 1px 0 rgba(255,255,255,1);
    }
    &--dark {
      background: rgba(12,12,12,.86); border: 1px solid rgba(255,255,255,.12); color: #fff;
      box-shadow: 0 18px 40px rgba(0,0,0,.28), inset 0 1px 0 rgba(255,255,255,.08);
    }
    &:hover { transform: translateY(-4px); }
    &:hover .pt__cta-arrow { transform: translateX(8px); }
    &:hover .pt__cta-dash { width: 34px; }
    @media (max-width: 760px) { min-width: 0; width: min(420px, 88vw); }
  }
  &__cta-dash { width: 22px; height: 1.5px; background: $red; transition: width .35s ease; flex: none; }
  &__cta-text {
    flex: 1; font-family: 'Cormorant Garamond', serif; font-weight: 600; text-transform: uppercase;
    letter-spacing: .2em; font-size: clamp(1.33rem, 1.5vw, 1.66rem); line-height: 1.1;
  }
  &__cta-arrow { font-size: clamp(1.47rem, 1.6vw, 1.75rem); transition: transform .35s cubic-bezier(.2,.8,.2,1); }

  &__reflection {
    position: absolute; left: 50%; bottom: 16%; transform: translateX(-50%) translateY(100%) scaleY(-1);
    display: flex; gap: clamp(16px, 3vw, 44px); width: min(1100px, 92vw); justify-content: center;
    z-index: 1; opacity: .13; pointer-events: none; filter: blur(1px);
    -webkit-mask-image: linear-gradient(to top, #000 0%, transparent 70%);
    mask-image: linear-gradient(to top, #000 0%, transparent 70%);
    .pt__cta { backdrop-filter: none; -webkit-backdrop-filter: none; box-shadow: none; }
    @media (max-width: 760px) { display: none; }
  }

  &__hint {
    position: absolute; left: 50%; bottom: 8.5%; transform: translateX(-50%);
    font-size: 1.14rem; letter-spacing: .22em; text-transform: uppercase; color: rgba(11,11,11,.55); z-index: 6; margin: 0;
    transition: opacity .5s ease;
    &.is-hidden { opacity: 0 !important; }
    @media (max-width: 760px) { display: none; }
  }
  &__curtain {
    position: fixed; inset: 0; z-index: 50; background: #080808;
    display: flex; align-items: center; justify-content: center;
    visibility: hidden; pointer-events: none;
  }
  &__curtain-line { width: 64px; height: 2px; background: $red; transform: scaleX(0); }

  &__foot {
    position: absolute; left: clamp(18px, 3vw, 40px); right: clamp(18px, 3vw, 40px); bottom: clamp(14px, 2.4vh, 22px);
    display: flex; justify-content: space-between; font-size: 1.12rem; letter-spacing: .16em; text-transform: uppercase;
    color: rgba(11,11,11,.42); z-index: 6;
    @media (max-width: 640px) { font-size: 1.05rem; letter-spacing: .1em; }
  }
}

/* ── Carpeta ─────────────────────────────────────────────── */
.folder {
  position: relative; width: 100%; height: 100%;
  transform: rotate(var(--rot));
  border-radius: 4px;
  box-shadow: 0 30px 55px rgba(0,0,0,.18), 0 4px 10px rgba(0,0,0,.08);
  will-change: transform, opacity;
  transition: box-shadow .3s ease;

  &__tab {
    position: absolute; top: -9%; left: 6%; width: 38%; height: 14%;
    border-radius: 4px 4px 0 0;
  }
  &__body {
    position: absolute; inset: 0; border-radius: 4px; overflow: hidden;
    display: flex; align-items: center; justify-content: center;
  }
  &__photo {
    position: absolute; right: -8%; top: 10%; width: 46%; height: 62%; transform: rotate(6deg);
    background: linear-gradient(135deg, #cfcfcf 0%, #8f8f8f 55%, #5d5d5d 100%);
    border: 3px solid #f3f1ec; box-shadow: 0 6px 14px rgba(0,0,0,.2); opacity: .9;
    -webkit-mask-image: linear-gradient(to left, #000 60%, transparent 100%);
    mask-image: linear-gradient(to left, #000 60%, transparent 100%);
  }
  &__label {
    position: relative; z-index: 1;
    background: #f2eee7; color: #1a1a1a; padding: 6px 10px; max-width: 78%; text-align: center;
    font-family: 'Cormorant Garamond', serif; font-weight: 600; text-transform: uppercase;
    letter-spacing: .14em; font-size: clamp(1rem, .8vw, 1.16rem); line-height: 1.25;
    box-shadow: 0 1px 2px rgba(0,0,0,.25);
  }
  &__edge {
    position: absolute; right: -2px; top: 12%; bottom: 12%; width: 4px; background: #b32d20; border-radius: 2px; opacity: .9;
  }

  &--black {
    .folder__tab  { background: #1c1c1c; }
    .folder__body { background: linear-gradient(160deg, #262626 0%, #121212 60%, #0a0a0a 100%); }
  }
  &--manila {
    .folder__tab  { background: #d9d3c6; }
    .folder__body { background: linear-gradient(160deg, #ece7dc 0%, #d8d2c4 70%, #cbc4b4 100%); }
    .folder__label { background: #faf8f3; }
  }
}
</style>
