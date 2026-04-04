import { ref } from 'vue'

const isOpen      = ref(false)
const startStep2  = ref(false)   // true = open at step 2, skipping contact form

export function useLeadModal() {
  function openModal() {
    startStep2.value = false
    isOpen.value = true
  }

  /** Open the modal directly at Step 2 (contact already captured via /precios gate) */
  function openModalStep2() {
    startStep2.value = true
    isOpen.value = true
  }

  function closeModal() {
    isOpen.value = false
  }

  return { isOpen, startStep2, openModal, openModalStep2, closeModal }
}
