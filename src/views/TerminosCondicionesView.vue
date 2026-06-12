<script setup lang="ts">
// Términos y Condiciones
</script>

<template>
  <main class="terms-container">
    <div class="content-wrapper">
      <h1 class="title">Términos y Condiciones</h1>
      <div class="card">
        <p class="description">
          Todos los datos e información recopilados en este sitio web son estrictamente reservados 
          y propiedad exclusiva de <strong>Andersson Boscán</strong> y <strong>Moni Boscán</strong>.
        </p>
        <p class="description">
          El uso no autorizado, reproducción o distribución de cualquier contenido está estrictamente prohibido.
        </p>
      </div>
    </div>
  </main>
</template>

<style lang="scss" scoped>
.terms-container {
  display: flex;
  justify-content: center;
  align-items: center;
  min-height: 100vh;
  padding: 2rem;
  background-color: var(--color-background-primary, #111111);
}

.content-wrapper {
  max-width: 600px;
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

.description {
  color: var(--color-text-secondary, #a0a0a0);
  font-size: 1.125rem;
  line-height: 1.6;
  margin-bottom: 1.5rem;
  
  &:last-child {
    margin-bottom: 0;
  }

  strong {
    color: var(--color-text-primary, #ffffff);
    font-weight: 600;
  }
}
</style>
