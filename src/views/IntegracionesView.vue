<script setup lang="ts">
import { ref, onMounted } from 'vue'
import { useRoute, useRouter } from 'vue-router'
import { tiktokService } from '../services/TiktokService'
import { instagramService, type InstagramAccount } from '../services/InstagramService'

const route = useRoute()
const router = useRouter()

const CLIENT_KEY = 'sbawzron1ukzcg607m'
const CLIENT_SECRET = 'lHY9hy7iyir0CZM60u3yri90lJB6f4S3'

const loading = ref(false)
const loadingAccounts = ref(true) // Inicialmente en true para cargar en mount
const errorMsg = ref<string | null>(null)
const accessToken = ref<string | null>(null)
const showLogoutModal = ref(false)
const rawResponse = ref<any>(null)
const savedAccounts = ref<any[]>([])

// Estado para Instagram
const igLoading = ref(false)
const igErrorMsg = ref<string | null>(null)
const igAccounts = ref<InstagramAccount[]>([])
const igClientId = ref('')
const igClientSecret = ref('')
const igShortLivedToken = ref('')

const igShowForm = ref(false)
const igAccountToDelete = ref<string | null>(null)

// Estado para Toast Notification
const showToast = ref(false)
const toastMessage = ref('')

const showToastNotification = (msg: string) => {
  toastMessage.value = msg
  showToast.value = true
  setTimeout(() => {
    showToast.value = false
  }, 3000)
}

const handleLogout = () => {
  localStorage.removeItem('access_token')
  router.push('/login')
}

// Estado para Eliminar Cuenta
const showDeleteModal = ref(false)
const accountToDelete = ref<string | null>(null)

const confirmDeleteAccount = (openId: string) => {
  accountToDelete.value = openId
  showDeleteModal.value = true
}

const deleteAccount = async () => {
  if (!accountToDelete.value) return

  try {
    await tiktokService.deleteAccount(accountToDelete.value)
    
    showToastNotification('🗑️ Cuenta eliminada correctamente')
    await loadSavedAccounts()
  } catch (err: any) {
    console.error('Error deleting account:', err)
    showToastNotification('❌ Error al eliminar la cuenta')
  } finally {
    showDeleteModal.value = false
    accountToDelete.value = null
  }
}

const confirmDeleteIgAccount = (accountId: string) => {
  igAccountToDelete.value = accountId
  showDeleteModal.value = true
}

const deleteIgAccount = async () => {
  if (!igAccountToDelete.value) return

  try {
    await instagramService.deleteAccount(igAccountToDelete.value)
    
    showToastNotification('🗑️ Cuenta de Instagram eliminada')
    await loadSavedAccounts()
  } catch (err: any) {
    console.error('Error deleting IG account:', err)
    showToastNotification('❌ Error al eliminar la cuenta de Instagram')
  } finally {
    showDeleteModal.value = false
    igAccountToDelete.value = null
  }
}

const loadSavedAccounts = async () => {
  loadingAccounts.value = true
  try {
    const [tiktokAccs, igAccs] = await Promise.all([
      tiktokService.getAccounts(),
      instagramService.getAccounts()
    ])
    savedAccounts.value = tiktokAccs
    igAccounts.value = igAccs
  } catch (err) {
    console.error('Error loading accounts:', err)
  } finally {
    loadingAccounts.value = false
  }
}

const loginWithTikTok = () => {
  // Generar un estado aleatorio para prevenir CSRF
  const csrfState = Math.random().toString(36).substring(2)
  localStorage.setItem('tiktok_csrf_state', csrfState)

  // Usar el origin dinámico para localhost o túnel
  const redirectUri = `${window.location.origin}/integraciones`
  
  let url = 'https://www.tiktok.com/v2/auth/authorize/'
  url += `?client_key=${CLIENT_KEY}`
  url += '&scope=user.info.basic,video.upload,video.publish'
  url += '&response_type=code'
  url += `&redirect_uri=${encodeURIComponent(redirectUri)}`
  url += `&state=${csrfState}`

  // Redirigir al usuario a la página de autorización de TikTok
  window.location.href = url
}

const exchangeCodeForToken = async (code: string) => {
  loading.value = true
  errorMsg.value = null
  
  try {
    const redirectUri = `${window.location.origin}/integraciones`
    
    const data = await tiktokService.exchangeToken(code, CLIENT_KEY, CLIENT_SECRET, redirectUri)
    rawResponse.value = data

    if (data.error) {
      errorMsg.value = data.error_description || data.error
    } else {
      accessToken.value = data.access_token
      await loadSavedAccounts() // Recargar cuentas después de conectar
      showToastNotification('✅ Cuenta conectada con éxito')
    }
  } catch (error: any) {
    console.error('Error al obtener el token:', error)
    errorMsg.value = error.message || 'Error de red o de CORS. Verifica la consola.'
  } finally {
    loading.value = false
    // Limpiar la URL para no dejar el código visible
    router.replace({ path: '/integraciones' })
  }
}

const handleInstagramConnect = async () => {
  if (!igClientId.value || !igClientSecret.value || !igShortLivedToken.value) {
    igErrorMsg.value = "Por favor ingresa todos los campos requeridos."
    return
  }

  igLoading.value = true
  igErrorMsg.value = null

  try {
    const response = await instagramService.exchangeToken(
      igShortLivedToken.value, 
      igClientId.value, 
      igClientSecret.value
    )
    
    if (response.error) {
      igErrorMsg.value = response.error
    } else {
      showToastNotification('✅ Cuenta de Instagram conectada con éxito')
      igShortLivedToken.value = ''
      igShowForm.value = false
      await loadSavedAccounts()
    }
  } catch (error: any) {
    console.error('Error al conectar Instagram:', error)
    igErrorMsg.value = error.response?.data?.error || error.message || 'Error al conectar'
  } finally {
    igLoading.value = false
  }
}

const copyToClipboard = async (text: string) => {
  try {
    await navigator.clipboard.writeText(text)
    showToastNotification('📋 ¡Copiado al portapapeles!')
  } catch (err) {
    console.error('Error al copiar: ', err)
    showToastNotification('❌ Error al copiar')
  }
}

onMounted(() => {
  loadSavedAccounts()
  const code = route.query.code as string
  const state = route.query.state as string
  const error = route.query.error as string

  if (error) {
    errorMsg.value = route.query.error_description as string || error
    // Limpiar url
    router.replace({ path: '/integraciones' })
    return
  }

  if (code && state) {
    const savedState = localStorage.getItem('tiktok_csrf_state')
    
    if (state !== savedState) {
      errorMsg.value = 'Error de seguridad (CSRF). Por favor intenta de nuevo.'
      return
    }

    localStorage.removeItem('tiktok_csrf_state')
    exchangeCodeForToken(code)
  }
})
</script>

<template>
  <!-- Toast Notification -->
  <transition name="toast-fade">
    <div v-if="showToast" class="toast-notification">
      {{ toastMessage }}
    </div>
  </transition>

  <!-- Modal de Confirmación de Logout -->
  <div v-if="showLogoutModal" class="modal-overlay" @click.self="showLogoutModal = false">
    <div class="modal-content">
      <h3>¿Cerrar sesión?</h3>
      <p>Tendrás que volver a ingresar tus credenciales para acceder a este panel.</p>
      <div class="modal-actions">
        <button @click="showLogoutModal = false" class="btn-cancel">Cancelar</button>
        <button @click="handleLogout" class="btn-danger">Cerrar Sesión</button>
      </div>
    </div>
  </div>

  <!-- Modal de Confirmación de Eliminar Cuenta -->
  <div v-if="showDeleteModal" class="modal-overlay" @click.self="showDeleteModal = false">
    <div class="modal-content">
      <h3>¿Eliminar cuenta?</h3>
      <p>Esta acción desvinculará la cuenta de tu panel. ¿Estás seguro?</p>
      <div class="modal-actions">
        <button @click="showDeleteModal = false" class="btn-cancel">Cancelar</button>
        <button v-if="accountToDelete" @click="deleteAccount" class="btn-danger"><i class="fa-solid fa-trash"></i> Eliminar TikTok</button>
        <button v-if="igAccountToDelete" @click="deleteIgAccount" class="btn-danger"><i class="fa-solid fa-trash"></i> Eliminar Instagram</button>
      </div>
    </div>
  </div>

  <main class="dashboard-container">
    <header class="app-header">
      <div class="logo">Andersson Boscán Admin</div>
      <button @click="showLogoutModal = true" class="btn-logout">
        Cerrar Sesión
      </button>
    </header>

    <div class="content-wrapper">
      <header class="dashboard-header">
        <h1 class="title">Panel de Integraciones</h1>
        <p class="subtitle">Gestiona y conecta tus cuentas externas para el flujo de trabajo.</p>
      </header>
      
      <div class="integrations-grid">
        <!-- Tarjeta de TikTok -->
        <div class="integration-card">
          <div class="card-header">
            <div class="brand-info">
              <svg class="brand-icon tiktok" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 448 512">
                <path fill="currentColor" d="M448,209.91a210.06,210.06,0,0,1-122.77-39.25V349.38A162.55,162.55,0,1,1,185,188.31V278.2a74.62,74.62,0,1,0,52.23,71.18V0l88,0a121.18,121.18,0,0,0,1.86,22.17h0A122.18,122.18,0,0,0,381,102.39a121.43,121.43,0,0,0,67,20.14Z"/>
              </svg>
              <h3>TikTok</h3>
            </div>
            <span class="status-badge" :class="{ 'connected': savedAccounts.length > 0 }">
              {{ savedAccounts.length > 0 ? `${savedAccounts.length} Cuentas` : 'No conectado' }}
            </span>
          </div>

          <div class="card-body">
            <p class="description" v-if="savedAccounts.length === 0 && !loading && !loadingAccounts">
              Conecta tu cuenta de TikTok para autorizar la aplicación y obtener el token de acceso.
            </p>

            <div v-if="loading || loadingAccounts" class="loading-state">
              <div class="spinner"></div>
              <p>{{ loading ? 'Procesando...' : 'Cargando cuentas...' }}</p>
            </div>

            <div v-if="errorMsg" class="error-message">
              <strong>Error:</strong> {{ errorMsg }}
              <p class="small-note">Verifica la consola para más detalles.</p>
            </div>

            <!-- Panel de éxito con Múltiples Cuentas -->
            <div v-if="savedAccounts.length > 0 && !loadingAccounts" class="success-state">
              <div class="success-header">
                <div class="success-icon"><i class="fa-solid fa-check"></i></div>
                <h4>Cuentas Vinculadas</h4>
              </div>
              
              <div class="accounts-list">
                <div v-for="account in savedAccounts" :key="account.open_id" class="account-row">
                  <div class="account-profile">
                    <img v-if="account.avatar_url" :src="account.avatar_url" alt="Avatar" class="avatar-img" />
                    <div v-else class="avatar-placeholder"><i class="fa-solid fa-user"></i></div>
                    <div class="account-info">
                      <span class="username">@{{ account.username }}</span>
                      <span class="display-name" v-if="account.display_name">{{ account.display_name }}</span>
                    </div>
                  </div>
                  <div class="account-actions">
                    <button @click="copyToClipboard(account.access_token)" class="copy-btn copy-btn-primary" title="Copiar Token">
                      <i class="fa-regular fa-copy"></i> <span>Copiar Token</span>
                    </button>
                    <button @click="confirmDeleteAccount(account.open_id)" class="delete-btn" title="Eliminar cuenta">
                      <i class="fa-solid fa-trash"></i>
                    </button>
                  </div>
                </div>
              </div>
            </div>

            <!-- Botón de Conectar Siempre Visible al final -->
            <div class="actions-footer">
              <button @click="loginWithTikTok" class="btn-primary btn-large">
                <span v-if="savedAccounts.length > 0"><i class="fa-solid fa-arrows-rotate"></i> Conectar otra cuenta</span>
                <span v-else>Vincular Cuenta TikTok</span>
              </button>
            </div>
          </div>
        </div>
        
        <!-- Tarjeta de Instagram -->
        <div class="integration-card">
          <div class="card-header">
            <div class="brand-info">
              <svg class="brand-icon instagram" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 448 512" style="fill: #E1306C">
                <path d="M224.1 141c-63.6 0-114.9 51.3-114.9 114.9s51.3 114.9 114.9 114.9S339 319.5 339 255.9 287.7 141 224.1 141zm0 189.6c-41.1 0-74.7-33.5-74.7-74.7s33.5-74.7 74.7-74.7 74.7 33.5 74.7 74.7-33.6 74.7-74.7 74.7zm146.4-194.3c0 14.9-12 26.8-26.8 26.8-14.9 0-26.8-12-26.8-26.8s12-26.8 26.8-26.8 26.8 12 26.8 26.8zm76.1 27.2c-1.7-35.9-9.9-67.7-36.2-93.9-26.2-26.2-58-34.4-93.9-36.2-37-2.1-147.9-2.1-184.9 0-35.8 1.7-67.6 9.9-93.9 36.1s-34.4 58-36.2 93.9c-2.1 37-2.1 147.9 0 184.9 1.7 35.9 9.9 67.7 36.2 93.9s58 34.4 93.9 36.2c37 2.1 147.9 2.1 184.9 0 35.9-1.7 67.7-9.9 93.9-36.2 26.2-26.2 34.4-58 36.2-93.9 2.1-37 2.1-147.8 0-184.8zM398.8 388c-7.8 19.6-22.9 34.7-42.6 42.6-29.5 11.7-99.5 9-132.1 9s-102.7 2.6-132.1-9c-19.6-7.8-34.7-22.9-42.6-42.6-11.7-29.5-9-99.5-9-132.1s-2.6-102.7 9-132.1c7.8-19.6 22.9-34.7 42.6-42.6 29.5-11.7 99.5-9 132.1-9s102.7-2.6 132.1 9c19.6 7.8 34.7 22.9 42.6 42.6 11.7 29.5 9 99.5 9 132.1s2.7 102.7-9 132.1z"/>
              </svg>
              <h3>Instagram</h3>
            </div>
            <span class="status-badge" :class="{ 'connected': igAccounts.length > 0 }">
              {{ igAccounts.length > 0 ? `${igAccounts.length} Cuentas` : 'No conectado' }}
            </span>
          </div>

          <div class="card-body">
            <p class="description" v-if="igAccounts.length === 0 && !igLoading && !loadingAccounts && !igShowForm">
              Conecta tu cuenta de Instagram Business para automatizar publicaciones.
            </p>

            <div v-if="igLoading || loadingAccounts" class="loading-state">
              <div class="spinner"></div>
              <p>{{ igLoading ? 'Obteniendo Token Largo...' : 'Cargando cuentas...' }}</p>
            </div>

            <div v-if="igErrorMsg" class="error-message">
              <strong>Error:</strong> {{ igErrorMsg }}
              <p class="small-note">Verifica la consola para más detalles.</p>
            </div>

            <!-- Formulario Manual para Instagram -->
            <div v-if="igShowForm && !igLoading" class="ig-form">
              <div class="form-group">
                <label>App ID (Facebook Dev)</label>
                <input v-model="igClientId" type="text" placeholder="Ej: 123456789012" class="form-input" />
              </div>
              <div class="form-group">
                <label>App Secret (Facebook Dev)</label>
                <input v-model="igClientSecret" type="password" placeholder="Tu App Secret" class="form-input" />
              </div>
              <div class="form-group">
                <label>Short-Lived Token (Graph API Explorer)</label>
                <textarea v-model="igShortLivedToken" placeholder="Pega aquí tu token de corta duración..." class="form-input textarea" rows="4"></textarea>
              </div>
              
              <div class="form-actions">
                <button @click="igShowForm = false" class="btn-cancel">Cancelar</button>
                <button @click="handleInstagramConnect" class="btn-primary">Obtener Long Token</button>
              </div>
            </div>

            <!-- Panel de éxito con Múltiples Cuentas Instagram -->
            <div v-if="igAccounts.length > 0 && !loadingAccounts && !igShowForm" class="success-state">
              <div class="success-header">
                <div class="success-icon"><i class="fa-solid fa-check"></i></div>
                <h4>Cuentas Vinculadas</h4>
              </div>
              
              <div class="accounts-list">
                <div v-for="account in igAccounts" :key="account.ig_account_id" class="account-row">
                  <div class="account-profile">
                    <img v-if="account.profile_picture_url" :src="account.profile_picture_url" alt="Avatar" class="avatar-img" />
                    <div v-else class="avatar-placeholder"><i class="fa-brands fa-instagram"></i></div>
                    <div class="account-info">
                      <span class="username">@{{ account.username }}</span>
                      <span class="display-name">{{ account.followers_count }} seguidores</span>
                    </div>
                  </div>
                  <div class="account-actions">
                    <button @click="copyToClipboard(account.access_token)" class="copy-btn copy-btn-primary" title="Copiar Long Token">
                      <i class="fa-regular fa-copy"></i> <span>Copiar Token</span>
                    </button>
                    <button @click="confirmDeleteIgAccount(account.ig_account_id)" class="delete-btn" title="Eliminar cuenta">
                      <i class="fa-solid fa-trash"></i>
                    </button>
                  </div>
                </div>
              </div>
            </div>

            <div class="actions-footer" v-if="!igShowForm && !igLoading">
              <button @click="igShowForm = true" class="btn-primary btn-large">
                <span v-if="igAccounts.length > 0"><i class="fa-solid fa-arrows-rotate"></i> Conectar otra cuenta</span>
                <span v-else>Conectar con Short Token</span>
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  </main>
</template>

<style lang="scss" scoped>
.toast-notification {
  position: fixed;
  bottom: 2rem;
  left: 50%;
  transform: translateX(-50%);
  background-color: var(--color-background-secondary, #2a2a2a);
  color: #ffffff;
  padding: 1rem 2rem;
  border-radius: 50px;
  box-shadow: 0 10px 30px rgba(0, 0, 0, 0.5);
  border: 1px solid rgba(255, 255, 255, 0.1);
  z-index: 2000;
  font-weight: 600;
  display: flex;
  align-items: center;
  gap: 0.5rem;
}

.toast-fade-enter-active,
.toast-fade-leave-active {
  transition: all 0.3s ease;
}

.toast-fade-enter-from,
.toast-fade-leave-to {
  opacity: 0;
  transform: translate(-50%, 20px);
}

.app-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 1rem 2rem;
  border-bottom: 1px solid rgba(255, 255, 255, 0.1);
  background-color: rgba(255, 255, 255, 0.02);
  margin-bottom: 3rem;

  .logo {
    color: #ffffff;
    font-size: 1.2rem;
    font-weight: 700;
  }

  .btn-logout {
    background: transparent;
    color: #a0a0a0;
    border: 1px solid rgba(255, 255, 255, 0.2);
    padding: 0.5rem 1rem;
    border-radius: 6px;
    font-size: 0.9rem;
    cursor: pointer;
    transition: all 0.2s;

    &:hover {
      background: rgba(255, 255, 255, 0.1);
      color: #ffffff;
    }
  }
}

.modal-overlay {
  position: fixed;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  background-color: rgba(0, 0, 0, 0.7);
  backdrop-filter: blur(4px);
  z-index: 1000;
  display: flex;
  justify-content: center;
  align-items: center;
}

.modal-content {
  background-color: var(--color-background-secondary, #1a1a1a);
  border: 1px solid var(--color-border-primary, rgba(255, 255, 255, 0.1));
  border-radius: 12px;
  padding: 2rem;
  max-width: 400px;
  width: 90%;
  text-align: center;
  box-shadow: 0 10px 40px rgba(0, 0, 0, 0.5);

  h3 {
    color: #ffffff;
    font-size: 1.5rem;
    margin-bottom: 1rem;
  }

  p {
    color: #a0a0a0;
    margin-bottom: 2rem;
  }

  .modal-actions {
    display: flex;
    gap: 1rem;
    justify-content: center;

    button {
      padding: 0.75rem 1.5rem;
      border-radius: 8px;
      font-weight: 600;
      cursor: pointer;
      border: none;
      transition: all 0.2s;
    }

    .btn-cancel {
      background-color: rgba(255, 255, 255, 0.1);
      color: #ffffff;

      &:hover {
        background-color: rgba(255, 255, 255, 0.2);
      }
    }

    .btn-danger {
      background-color: #fe2c55;
      color: #ffffff;

      &:hover {
        background-color: #e62045;
      }
    }
  }
}

.dashboard-container {
  min-height: 100vh;
  padding-bottom: 4rem;
  background-color: var(--color-background-primary, #111111);
}

.content-wrapper {
  max-width: 1000px;
  margin: 0 auto;
  width: 100%;
}

.dashboard-header {
  margin-bottom: 3rem;
  
  .title {
    color: var(--color-text-primary, #ffffff);
    font-size: 2.5rem;
    font-weight: 700;
    margin-bottom: 0.5rem;
    letter-spacing: -0.02em;
  }

  .subtitle {
    color: var(--color-text-secondary, #a0a0a0);
    font-size: 1.125rem;
  }
}

.integrations-grid {
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(450px, 1fr));
  gap: 2rem;
}

.integration-card {
  background-color: var(--color-background-secondary, #1a1a1a);
  border: 1px solid var(--color-border-primary, rgba(255, 255, 255, 0.1));
  border-radius: 16px;
  overflow: hidden;
  box-shadow: 0 8px 32px rgba(0, 0, 0, 0.2);
  display: flex;
  flex-direction: column;

  .card-header {
    display: flex;
    justify-content: space-between;
    align-items: center;
    padding: 1.5rem 2rem;
    border-bottom: 1px solid rgba(255, 255, 255, 0.05);
    background-color: rgba(255, 255, 255, 0.02);

    .brand-info {
      display: flex;
      align-items: center;
      gap: 1rem;

      .brand-icon {
        width: 28px;
        height: 28px;
        &.tiktok { color: #ffffff; }
      }

      h3 {
        color: #ffffff;
        font-size: 1.25rem;
        margin: 0;
      }
    }

    .status-badge {
      font-size: 0.75rem;
      font-weight: 700;
      text-transform: uppercase;
      padding: 0.4rem 0.8rem;
      border-radius: 20px;
      background-color: rgba(160, 160, 160, 0.1);
      color: #a0a0a0;

      &.connected {
        background-color: rgba(34, 197, 94, 0.15);
        color: #22c55e;
      }
    }
  }

  .card-body {
    padding: 2rem;
  }
}

.description {
  color: var(--color-text-secondary, #a0a0a0);
  font-size: 1.125rem;
  line-height: 1.6;
  margin-bottom: 2rem;
}

.actions {
  display: flex;
  justify-content: center;
}

.btn-tiktok {
  display: inline-flex;
  align-items: center;
  gap: 0.75rem;
  background-color: #fe2c55;
  color: #ffffff;
  border: none;
  border-radius: 8px;
  padding: 0.75rem 1.5rem;
  font-size: 1.125rem;
  font-weight: 600;
  cursor: pointer;
  transition: background-color 0.2s ease, transform 0.1s ease;

  &:hover {
    background-color: #ef2950;
    transform: translateY(-2px);
  }
  
  &:active {
    transform: translateY(0);
  }

  .tiktok-icon {
    width: 20px;
    height: 20px;
  }
}

.btn-secondary {
  background-color: transparent;
  color: var(--color-text-primary, #ffffff);
  border: 1px solid var(--color-border-primary, rgba(255, 255, 255, 0.2));
  border-radius: 8px;
  padding: 0.5rem 1rem;
  font-size: 1rem;
  cursor: pointer;
  margin-top: 1.5rem;
  transition: all 0.2s ease;

  &:hover {
    background-color: rgba(255, 255, 255, 0.05);
  }
}

.loading-state {
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 1rem;
  color: var(--color-text-secondary, #a0a0a0);

  .spinner {
    width: 40px;
    height: 40px;
    border: 3px solid rgba(255, 255, 255, 0.1);
    border-top-color: #fe2c55;
    border-radius: 50%;
    animation: spin 1s linear infinite;
  }
}

@keyframes spin {
  to { transform: rotate(360deg); }
}

.error-message {
  background-color: rgba(254, 44, 85, 0.1);
  border: 1px solid rgba(254, 44, 85, 0.3);
  color: #ff4d6d;
  padding: 1rem;
  border-radius: 8px;
  margin-top: 1rem;
  text-align: left;
  
  .small-note {
    margin-top: 0.5rem;
    font-size: 0.875rem;
    opacity: 0.8;
  }
}

.success-state {
  .success-header {
    margin-bottom: 2rem;
    
    .success-icon {
      width: 70px;
      height: 70px;
      background-color: rgba(34, 197, 94, 0.15);
      color: #22c55e;
      border-radius: 50%;
      display: flex;
      align-items: center;
      justify-content: center;
      font-size: 2.5rem;
      margin: 0 auto 1rem;
    }

    h4 {
      color: var(--color-text-primary, #ffffff);
      margin-bottom: 0.5rem;
      font-size: 1.8rem;
    }

    p {
      color: var(--color-text-secondary, #a0a0a0);
      font-size: 1.1rem;
    }
  }

  .accounts-list {
    display: flex;
    flex-direction: column;
    gap: 1rem;
    margin-bottom: 2.5rem;
  }

    .account-row {
    background-color: rgba(0, 0, 0, 0.4);
    border: 1px solid rgba(254, 44, 85, 0.2);
    border-radius: 12px;
    padding: 1.25rem 1.5rem;
    display: flex;
    justify-content: space-between;
    align-items: center;
    gap: 1rem;
    transition: all 0.2s ease;

    &:hover {
      border-color: rgba(254, 44, 85, 0.6);
      background-color: rgba(0, 0, 0, 0.6);
      transform: translateY(-2px);
      box-shadow: 0 4px 12px rgba(254, 44, 85, 0.1);
    }

    .account-profile {
      display: flex;
      align-items: center;
      gap: 1rem;
      flex: 1;
      min-width: 0; // Essential for text truncation in children

      .avatar-img {
        width: 48px;
        height: 48px;
        border-radius: 50%;
        object-fit: cover;
        border: 2px solid rgba(254, 44, 85, 0.5);
        flex-shrink: 0;
      }

      .avatar-placeholder {
        width: 48px;
        height: 48px;
        border-radius: 50%;
        background-color: rgba(255, 255, 255, 0.1);
        display: flex;
        align-items: center;
        justify-content: center;
        color: #a0a0a0;
        font-size: 1.2rem;
        border: 2px solid rgba(255, 255, 255, 0.2);
        flex-shrink: 0;
      }

      .account-info {
        display: flex;
        flex-direction: column;
        gap: 0.25rem;
        min-width: 0; // Essential for text truncation

        .username {
          color: #ffffff;
          font-size: 1.2rem;
          font-weight: 700;
          letter-spacing: 0.5px;
          white-space: nowrap;
          overflow: hidden;
          text-overflow: ellipsis;
        }

        .display-name {
          color: var(--color-text-secondary, #a0a0a0);
          font-size: 0.9rem;
          white-space: nowrap;
          overflow: hidden;
          text-overflow: ellipsis;
        }
      }
    }

    .account-actions {
      display: flex;
      align-items: center;
      gap: 0.5rem;
      flex-shrink: 0;

      .copy-btn {
        display: inline-flex;
        align-items: center;
        gap: 0.5rem;
        white-space: nowrap;
        background-color: rgba(254, 44, 85, 0.15);
        color: #fe2c55;
        border: 1px solid rgba(254, 44, 85, 0.3);
        border-radius: 8px;
        padding: 0.6rem 1rem;
        font-size: 0.9rem;
        font-weight: 600;
        cursor: pointer;
        transition: all 0.2s ease;

        &:hover {
          background-color: rgba(254, 44, 85, 0.8);
          color: #ffffff;
        }
        
        &:active {
          background-color: #fe2c55;
          transform: scale(0.95);
        }
        
        /* Si la pantalla es muy pequeña, esconder el texto y dejar solo el icono */
        @media (max-width: 480px) {
          padding: 0.6rem;
          span {
            display: none;
          }
        }
      }

      .delete-btn {
        background-color: rgba(255, 255, 255, 0.05);
        color: #a0a0a0;
        border: 1px solid rgba(255, 255, 255, 0.1);
        border-radius: 8px;
        padding: 0.6rem;
        font-size: 0.9rem;
        cursor: pointer;
        transition: all 0.2s ease;
        display: flex;
        align-items: center;
        justify-content: center;

        &:hover {
          background-color: rgba(254, 44, 85, 0.15);
          color: #fe2c55;
          border-color: rgba(254, 44, 85, 0.3);
        }
        
        &:active {
          transform: scale(0.95);
        }
      }
    }
  }
}

.actions-footer {
  padding-top: 1.5rem;
  border-top: 1px solid rgba(255, 255, 255, 0.1);
  margin-top: 1rem;
}

.btn-large {
  width: 100%;
  padding: 1rem 2rem;
  font-size: 1.2rem;
  background-color: #fe2c55;
  color: white;
  border: none;
  border-radius: 8px;
  font-weight: bold;
  cursor: pointer;
  transition: all 0.2s;

  &:hover {
    background-color: #e62045;
    transform: translateY(-2px);
  }
}

/* Instagram Form Styles */
.ig-form {
  background: rgba(0, 0, 0, 0.2);
  padding: 1.5rem;
  border-radius: 12px;
  border: 1px solid rgba(255, 255, 255, 0.05);

  .form-group {
    margin-bottom: 1.2rem;
    
    label {
      display: block;
      color: #a0a0a0;
      margin-bottom: 0.5rem;
      font-size: 0.9rem;
    }

    .form-input {
      width: 100%;
      background: rgba(0, 0, 0, 0.4);
      border: 1px solid rgba(255, 255, 255, 0.1);
      color: white;
      padding: 0.8rem 1rem;
      border-radius: 8px;
      font-size: 1rem;
      
      &:focus {
        outline: none;
        border-color: #E1306C;
        box-shadow: 0 0 0 2px rgba(225, 48, 108, 0.2);
      }

      &.textarea {
        resize: vertical;
        min-height: 80px;
        font-family: monospace;
        font-size: 0.85rem;
      }
    }
  }

  .form-actions {
    display: flex;
    gap: 1rem;
    margin-top: 1.5rem;

    button {
      flex: 1;
      padding: 0.8rem;
      border-radius: 8px;
      font-weight: bold;
      cursor: pointer;
      border: none;
      transition: all 0.2s;
    }

    .btn-cancel {
      background: rgba(255, 255, 255, 0.1);
      color: white;
      &:hover { background: rgba(255, 255, 255, 0.2); }
    }

    .btn-primary {
      background: #E1306C;
      color: white;
      &:hover { background: #C13584; }
    }
  }
}
</style>
