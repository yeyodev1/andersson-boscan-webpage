#!/usr/bin/env bash
# Espera a que Vercel publique el último push en boscanymoni.com.
#
# Uso: bash scripts/esperar-deploy.sh <id anterior>
#   El id anterior se toma ANTES del push con:
#   curl -s https://boscanymoni.com/version.json
#
# Cada build escribe un id nuevo en /version.json (plugin versionJson de
# vite.config.ts), así que cuando cambia, el deploy ya está en línea.
set -u
ANTERIOR="${1:?Uso: bash scripts/esperar-deploy.sh <id anterior>}"
URL="https://boscanymoni.com/version.json"
LIMITE=480   # segundos; un deploy normal tarda 1-2 minutos

inicio=$(date +%s)
while :; do
  actual=$(curl -s -H 'Cache-Control: no-cache' "$URL?t=$(date +%s)" | sed -n 's/.*"id":"\([^"]*\)".*/\1/p')
  if [ -n "$actual" ] && [ "$actual" != "$ANTERIOR" ]; then
    echo "✓ Publicado en boscanymoni.com (versión $actual, $(( $(date +%s) - inicio )) s)"
    exit 0
  fi
  if [ $(( $(date +%s) - inicio )) -ge $LIMITE ]; then
    echo "✗ Pasaron $((LIMITE / 60)) minutos y el sitio sigue en la versión $ANTERIOR."
    echo "  Lo más probable es que el build haya fallado en Vercel. Avisar a Diego."
    exit 1
  fi
  sleep 15
done
