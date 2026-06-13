<script setup lang="ts">
import { ref } from 'vue'
import { useRouter } from 'vue-router'

import { authService } from '../services/AuthService'

const router = useRouter()

const email = ref('')
const password = ref('')
const loading = ref(false)
const errorMsg = ref<string | null>(null)

const handleLogin = async () => {
  loading.value = true
  errorMsg.value = null

  try {
    const data = await authService.login(email.value, password.value)

    // Guardarlo en localStorage
    localStorage.setItem('access_token', data.token)

    // Redirigir al panel de integraciones
    await router.push('/integraciones')
    // No establecemos loading a false aquí porque el componente se va a desmontar

  } catch (error: any) {
    errorMsg.value = error.message || 'Ocurrió un error al iniciar sesión'
    loading.value = false // Solo apagar el loading si hubo error
  }
}
</script>

<template>
  <main class="login-container">
    <div class="content-wrapper">
      <h1 class="title">Iniciar Sesión</h1>
      
      <div class="card">
        <form @submit.prevent="handleLogin">
          <div class="form-group">
            <label for="email">Correo Electrónico</label>
            <input 
              id="email" 
              v-model="email" 
              type="email" 
              placeholder="admin@boscanymoni.com" 
              required 
            />
          </div>

          <div class="form-group">
            <label for="password">Contraseña</label>
            <input 
              id="password" 
              v-model="password" 
              type="password" 
              placeholder="•••••••••" 
              required 
            />
          </div>

          <div v-if="errorMsg" class="error-message">
            {{ errorMsg }}
          </div>

          <button type="submit" class="btn-primary" :disabled="loading">
            <span v-if="loading" class="spinner"></span>
            <span v-else>Ingresar</span>
          </button>
        </form>
      </div>
    </div>
  </main>
</template>

<style lang="scss" scoped>
.login-container {
  display: flex;
  justify-content: center;
  align-items: center;
  min-height: 100vh;
  padding: 2rem;
  background-color: var(--color-background-primary, #111111);
}

.content-wrapper {
  max-width: 450px;
  width: 100%;
}

.title {
  color: var(--color-text-primary, #ffffff);
  font-size: 2.5rem;
  font-weight: 700;
  margin-bottom: 2rem;
  text-align: center;
  letter-spacing: -0.02em;
}

.card {
  background-color: var(--color-background-secondary, #1a1a1a);
  border: 1px solid var(--color-border-primary, rgba(255, 255, 255, 0.1));
  border-radius: 16px;
  padding: 2.5rem;
  box-shadow: 0 8px 32px rgba(0, 0, 0, 0.2);
}

.form-group {
  margin-bottom: 1.5rem;

  label {
    display: block;
    color: var(--color-text-secondary, #a0a0a0);
    margin-bottom: 0.5rem;
    font-size: 0.875rem;
  }

  input {
    width: 100%;
    padding: 0.75rem 1rem;
    background-color: rgba(0, 0, 0, 0.2);
    border: 1px solid var(--color-border-primary, rgba(255, 255, 255, 0.1));
    border-radius: 8px;
    color: var(--color-text-primary, #ffffff);
    font-size: 1rem;
    transition: border-color 0.2s ease;

    &:focus {
      outline: none;
      border-color: #fe2c55; /* O el color primario de la marca */
    }
  }
}

.btn-primary {
  width: 100%;
  display: flex;
  justify-content: center;
  align-items: center;
  background-color: #ffffff;
  color: #111111;
  border: none;
  border-radius: 8px;
  padding: 0.875rem 1.5rem;
  font-size: 1.125rem;
  font-weight: 600;
  cursor: pointer;
  transition: all 0.2s ease;
  margin-top: 1rem;

  &:hover:not(:disabled) {
    background-color: #e0e0e0;
    transform: translateY(-2px);
  }
  
  &:active:not(:disabled) {
    transform: translateY(0);
  }

  &:disabled {
    opacity: 0.7;
    cursor: not-allowed;
  }
}

.spinner {
  width: 20px;
  height: 20px;
  border: 3px solid rgba(0, 0, 0, 0.1);
  border-top-color: #111111;
  border-radius: 50%;
  animation: spin 1s linear infinite;
}

@keyframes spin {
  to { transform: rotate(360deg); }
}

.error-message {
  color: #ff4d6d;
  background-color: rgba(255, 77, 109, 0.1);
  border: 1px solid rgba(255, 77, 109, 0.2);
  padding: 0.75rem;
  border-radius: 8px;
  font-size: 0.875rem;
  margin-bottom: 1.5rem;
  text-align: center;
}

.success-state {
  text-align: center;

  .success-icon {
    width: 60px;
    height: 60px;
    background-color: rgba(34, 197, 94, 0.1);
    color: #22c55e;
    border-radius: 50%;
    display: flex;
    align-items: center;
    justify-content: center;
    font-size: 2rem;
    margin: 0 auto 1rem;
  }

  h2 {
    color: var(--color-text-primary, #ffffff);
    margin-bottom: 0.5rem;
  }

  .description {
    color: var(--color-text-secondary, #a0a0a0);
    margin-bottom: 1.5rem;
    line-height: 1.5;
  }

  .token-box {
    background-color: rgba(0, 0, 0, 0.3);
    border: 1px solid var(--color-border-primary, rgba(255, 255, 255, 0.1));
    padding: 1rem;
    border-radius: 8px;
    text-align: left;
    margin-bottom: 1.5rem;
    overflow-wrap: break-word;

    .label {
      display: block;
      color: var(--color-text-secondary, #a0a0a0);
      font-size: 0.875rem;
      margin-bottom: 0.5rem;
    }

    code {
      display: block;
      color: #22c55e;
      font-family: monospace;
      font-size: 0.9rem;
    }
  }
}

.btn-secondary {
  background-color: transparent;
  color: var(--color-text-primary, #ffffff);
  border: 1px solid var(--color-border-primary, rgba(255, 255, 255, 0.2));
  border-radius: 8px;
  padding: 0.75rem 1rem;
  font-size: 1rem;
  cursor: pointer;
  transition: all 0.2s ease;
  width: 100%;

  &:hover {
    background-color: rgba(255, 255, 255, 0.05);
  }
}
</style>
