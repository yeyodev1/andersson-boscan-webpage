<script setup lang="ts">
// Política de Privacidad
</script>

<template>
  <main class="privacy-container">
    <div class="content-wrapper">
      <h1 class="title">Política de Privacidad</h1>
      <div class="card">
        <p class="description">
          Todos los datos e información recopilados en este sitio web son estrictamente reservados 
          y propiedad exclusiva de <strong>Andersson Boscán</strong> y <strong>Mónica Velásquez</strong>.
        </p>
        <p class="description">
          Su privacidad es importante para nosotros. Nos comprometemos a proteger su información personal
          y a utilizarla únicamente para los fines establecidos y autorizados.
        </p>
        <p class="description">
          Los datos que usted envía a través de los formularios de contacto y del configurador de campañas
          se almacenan en nuestro CRM (LeadConnector / GoHighLevel) con el único fin de responder su solicitud
          y dar seguimiento comercial. No se venden ni se comparten con terceros ajenos a esa gestión.
        </p>
        <p class="description">
          <strong>Publicación en YouTube, Facebook e Instagram.</strong> Nuestra herramienta interna
          "Andersson Publicador" usa los <strong>Servicios de la API de YouTube</strong> y la API de Meta
          para subir, programar y editar videos y publicaciones únicamente en las cuentas propias de
          Andersson Boscán y su familia. Solo usa el título, la descripción, la miniatura, la fecha de
          publicación y el archivo de cada video que nosotros mismos publicamos. No accede a datos de
          espectadores ni de otros usuarios, y no comparte nada con terceros.
        </p>
        <p class="description">
          Los permisos de acceso se guardan cifrados en nuestros servidores privados y los videos se
          conservan en almacenamiento privado solo para publicarlos. En su navegador la herramienta solo
          guarda la clave del equipo, para no pedírsela cada vez; no usa cookies de seguimiento ni guarda
          otros datos en su dispositivo. Puede pedir que se borren escribiendo a
          <a href="mailto:anderssonboscan@gmail.com">anderssonboscan@gmail.com</a>.
        </p>
        <p class="description">
          Al usar los Servicios de la API de YouTube se aplican los
          <a href="https://www.youtube.com/t/terms" target="_blank" rel="noopener">Términos de Servicio de YouTube</a>
          y la
          <a href="https://policies.google.com/privacy" target="_blank" rel="noopener">Política de Privacidad de Google</a>.
          Puede quitar el acceso de la herramienta a una cuenta de Google en cualquier momento desde
          <a href="https://myaccount.google.com/permissions" target="_blank" rel="noopener">la configuración de seguridad de Google</a>,
          y a una cuenta de Meta desde la sección "Integraciones comerciales" de Facebook.
        </p>
      </div>
    </div>
  </main>
</template>

<style lang="scss" scoped>
.privacy-container {
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
  font-size: 1.47rem;
  line-height: 1.6;
  margin-bottom: 1.5rem;
  
  &:last-child {
    margin-bottom: 0;
  }

  strong {
    color: var(--color-text-primary, #ffffff);
    font-weight: 600;
  }

  a {
    color: var(--color-text-primary, #ffffff);
    text-decoration: underline;
  }
}
</style>
