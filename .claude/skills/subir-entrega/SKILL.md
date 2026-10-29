---
name: subir-entrega
description: Sube una entrega nueva del sitio de investigaciones de Andersson (lo que genera su build.py) a boscanymoni.com/periodismo/ y la publica. Úsala cuando diga "sube mi entrega", "actualiza mis investigaciones", "subí un expediente nuevo", "corregí un reportaje, súbelo", "te paso el zip de periodismo", o comparta una carpeta o un .zip con index.html e investigaciones/.
---

# Subir una entrega de periodismo

Quien la usa es Andersson. Háblale corto y en español, sin jerga.

La carpeta `public/periodismo/` es su sitio generado con `build.py`: se
reemplaza entera. Todo lo nuestro (URLs con `/periodismo/`, letra grande,
ajustes de la portada, llms.txt) lo vuelve a aplicar el script.

## Pasos

1. **Ubicar la entrega.** Si no dijo dónde está, busca lo más reciente en
   Descargas, Escritorio y Documentos: un `.zip` o una carpeta que tenga
   `index.html` y `investigaciones/` (p. ej. la salida de su `build.py`).
   Dile cuál encontraste (nombre y fecha) y confírmalo antes de seguir.
2. **Aplicarla:**
   `python3 -I scripts/actualizar-periodismo.py "<ruta>"`
   - Si dice que faltan expedientes, **pregúntale** si los retiró a
     propósito, nombrándolos. Solo con su sí, repite con `--permitir-bajas`.
   - Si falla por otra cosa, explícale el mensaje en palabras simples. No
     edites `public/periodismo/` a mano para salir del paso.
3. **Revisar:** cuéntale el resumen del script (expedientes antes → después,
   nuevos, retirados). Si hay expedientes nuevos, avísale que en la portada
   principal (las carpetas que aparecen al pasar el mouse) no salen solos:
   eso lo agrega Diego si lo quiere ahí; en `/periodismo/` sí aparecen.
4. **Publicar** con la skill `publicar`. Mensaje de commit:
   `feat(periodismo): entrega nueva — <resumen corto>` (p. ej.
   `— suma el expediente caso-x` o `— correcciones en el-gran-padrino`).
   Al confirmar, dale el enlace: `https://boscanymoni.com/periodismo/` y el de
   cada expediente nuevo.
