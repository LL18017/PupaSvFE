#!/bin/sh

# Ruta al template y destino
TEMPLATE="/usr/share/nginx/html/config.template.js"
OUTPUT="/usr/share/nginx/html/config.js"

# Validar si existe el archivo template
if [ ! -f "$TEMPLATE" ]; then
  echo "No se encontró $TEMPLATE"
  exit 1
fi

# Reemplazo de variables de entorno en el archivo template
sed -e "s|__HOST__|${HOST:-localhost}|g" \
    -e "s|__PORT__|${PORT:-9080}|g" \
    "$TEMPLATE" > "$OUTPUT"

echo "✅ Configuración generada en $OUTPUT:"
cat "$OUTPUT"

# Iniciar nginx
exec nginx -g 'daemon off;'
