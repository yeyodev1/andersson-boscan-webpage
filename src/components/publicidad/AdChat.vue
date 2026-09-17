<template>
  <Teleport to="body">
    <!-- Launcher -->
    <button
      v-show="!isOpen"
      class="adc-launcher"
      type="button"
      aria-label="Tengo una pregunta"
      @click="open"
    >
      <span class="adc-launcher__dot"></span>
      Tengo una pregunta
    </button>

    <!-- Panel -->
    <Transition name="adc">
      <section v-if="isOpen" class="adc" role="dialog" aria-label="Chat comercial">
        <header class="adc__head">
          <div>
            <div class="adc__title">Tengo una pregunta</div>
            <div class="adc__sub">Respuesta inmediata · humano si hace falta</div>
          </div>
          <button class="adc__close" type="button" aria-label="Cerrar" @click="close">×</button>
        </header>

        <div class="adc__body" ref="bodyEl">
          <div
            v-for="(m, i) in messages"
            :key="m.ts + '-' + i"
            class="adc__msg"
            :class="`adc__msg--${m.role}`"
          >{{ m.text }}</div>

          <!-- Escalamiento humano -->
          <form v-if="escalating" class="adc__esc" @submit.prevent="submitEscalation">
            <input v-model.trim="esc.first_name" type="text" placeholder="Nombre" required />
            <input v-model.trim="esc.company" type="text" placeholder="Empresa" required />
            <input v-model.trim="esc.email" type="email" placeholder="Correo" required />
            <input v-model.trim="esc.whatsapp" type="tel" placeholder="WhatsApp (opcional)" />
            <textarea v-model.trim="esc.question" rows="2" placeholder="Tu pregunta, tal cual" required></textarea>
            <button type="submit" :disabled="sending">{{ sending ? 'Enviando…' : 'Enviar a Andersson y Mónica' }}</button>
          </form>

          <div v-if="messages.length <= 1" class="adc__chips">
            <button v-for="s in suggestions" :key="s" type="button" class="adc__chip" @click="ask(s)">{{ s }}</button>
          </div>
        </div>

        <form class="adc__input" @submit.prevent="send">
          <input v-model="draft" type="text" placeholder="Escribe tu pregunta…" :disabled="escalating" />
          <button type="submit" :disabled="!draft.trim() || escalating" aria-label="Enviar">→</button>
        </form>
      </section>
    </Transition>
  </Teleport>
</template>

<script setup lang="ts">
import { ref, watch, nextTick } from 'vue'
import { useAdChat } from '@/composables/useAdChat'
import { useAdFunnel } from '@/composables/useAdFunnel'

const { isOpen, messages, escalating, sending, suggestions, open, close, ask, escalate } = useAdChat()
const { state } = useAdFunnel()

const draft  = ref('')
const bodyEl = ref<HTMLElement | null>(null)
const esc = ref({ first_name: state.value.first_name, company: state.value.brand, email: state.value.email, whatsapp: state.value.phone, question: '' })

function send() {
  const t = draft.value
  draft.value = ''
  ask(t)
}

watch(escalating, (v) => {
  if (v) {
    const lastUser = [...messages.value].reverse().find(m => m.role === 'user')
    esc.value.question = lastUser?.text ?? ''
    esc.value.first_name = esc.value.first_name || state.value.first_name
    esc.value.company    = esc.value.company    || state.value.brand
    esc.value.email      = esc.value.email      || state.value.email
    esc.value.whatsapp   = esc.value.whatsapp   || state.value.phone
  }
})

async function submitEscalation() {
  await escalate({ ...esc.value })
}

watch([messages, isOpen, escalating], async () => {
  await nextTick()
  if (bodyEl.value) bodyEl.value.scrollTop = bodyEl.value.scrollHeight
}, { deep: true })
</script>

<style lang="scss" scoped>
.adc-launcher {
  position: fixed;
  right: 24px;
  bottom: 24px;
  z-index: 900;
  display: inline-flex;
  align-items: center;
  gap: 10px;
  padding: 14px 20px;
  border: 1px solid rgba(0,0,0,0.08);
  border-radius: 999px;
  background: #0b0b0b;
  color: #fff;
  font-family: 'DM Sans', sans-serif;
  font-size: 1.23rem;
  letter-spacing: 0.04em;
  cursor: pointer;
  box-shadow: 0 12px 32px rgba(0,0,0,0.18);
  transition: transform .25s ease, box-shadow .25s ease;
  &:hover { transform: translateY(-2px); box-shadow: 0 16px 40px rgba(0,0,0,0.22); }
  &__dot { width: 8px; height: 8px; border-radius: 50%; background: #c8392b; box-shadow: 0 0 0 4px rgba(200,57,43,0.18); }
}

.adc {
  position: fixed;
  right: 24px;
  bottom: 24px;
  z-index: 950;
  width: min(380px, calc(100vw - 32px));
  height: min(560px, calc(100vh - 48px));
  display: flex;
  flex-direction: column;
  background: #fff;
  border-radius: 18px;
  border: 1px solid rgba(0,0,0,0.08);
  box-shadow: 0 24px 64px rgba(0,0,0,0.22);
  overflow: hidden;
  font-family: 'DM Sans', sans-serif;

  &__head {
    display: flex; align-items: center; justify-content: space-between;
    padding: 16px 18px; border-bottom: 1px solid rgba(0,0,0,0.06);
    background: #0b0b0b; color: #fff;
  }
  &__title { font-family: 'Playfair Display', serif; font-size: 1.42rem; }
  &__sub { font-size: 1.14rem; opacity: .6; letter-spacing: .04em; margin-top: 2px; }
  &__close { background: none; border: 0; color: #fff; font-size: 1.84rem; line-height: 1; cursor: pointer; opacity: .7; &:hover { opacity: 1; } }

  &__body { flex: 1; overflow-y: auto; padding: 16px; display: flex; flex-direction: column; gap: 10px; background: #f7f6f3; }
  &__msg {
    max-width: 88%; padding: 10px 14px; border-radius: 14px; font-size: 1.26rem; line-height: 1.5; white-space: pre-wrap;
    &--assistant { align-self: flex-start; background: #fff; color: #111; border: 1px solid rgba(0,0,0,0.06); border-bottom-left-radius: 4px; }
    &--user { align-self: flex-end; background: #0b0b0b; color: #fff; border-bottom-right-radius: 4px; }
  }
  &__chips { display: flex; flex-wrap: wrap; gap: 6px; margin-top: 4px; }
  &__chip {
    background: #fff; border: 1px solid rgba(0,0,0,0.12); border-radius: 999px; padding: 7px 12px;
    font-size: 1.19rem; cursor: pointer; color: #222; font-family: inherit;
    &:hover { border-color: #c8392b; color: #c8392b; }
  }
  &__esc {
    display: grid; gap: 8px; padding: 12px; background: #fff; border: 1px solid rgba(0,0,0,0.08); border-radius: 12px;
    input, textarea { font: inherit; font-size: 1.23rem; padding: 9px 11px; border: 1px solid rgba(0,0,0,0.14); border-radius: 8px; outline: none; &:focus { border-color: #0b0b0b; } }
    button { font: inherit; font-size: 1.23rem; padding: 10px; border: 0; border-radius: 8px; background: #c8392b; color: #fff; cursor: pointer; &:disabled { opacity: .6; } }
  }
  &__input {
    display: flex; gap: 8px; padding: 12px; border-top: 1px solid rgba(0,0,0,0.06); background: #fff;
    input { flex: 1; font: inherit; font-size: 1.28rem; padding: 11px 14px; border: 1px solid rgba(0,0,0,0.14); border-radius: 999px; outline: none; &:focus { border-color: #0b0b0b; } }
    button { width: 42px; border: 0; border-radius: 50%; background: #0b0b0b; color: #fff; font-size: 1.47rem; cursor: pointer; &:disabled { opacity: .3; cursor: default; } }
  }
}

.adc-enter-active, .adc-leave-active { transition: opacity .25s ease, transform .25s ease; }
.adc-enter-from, .adc-leave-to { opacity: 0; transform: translateY(16px) scale(.98); }

@media (max-width: 480px) {
  .adc { right: 8px; bottom: 8px; left: 8px; width: auto; height: min(80vh, 600px); }
  .adc-launcher { right: 12px; bottom: 12px; }
}
</style>
