#!/bin/bash

# 📁 Rutas relativas desde donde se ejecuta el script (raíz: Frontend/frontend)
CERT_PATH="src/certs"
CERT_FILE="localhost.pem"
KEY_FILE="localhost-key.pem"
OUTPUT="keystore.p12"
BACKEND_KEYSTORE_PATH="../../Backend/ProyectoVersion/demo/src/main/resources"
ALIAS="tomcat"
PASSWORD="123456"

echo "🛠️ Generando keystore.p12 desde certificados mkcert..."

# Verificar que los archivos existen
if [ ! -f "$CERT_PATH/$CERT_FILE" ] || [ ! -f "$CERT_PATH/$KEY_FILE" ]; then
  echo "❌ Error: No se encontraron los archivos de certificado en:"
  echo "   - $CERT_PATH/$CERT_FILE"
  echo "   - $CERT_PATH/$KEY_FILE"
  exit 1
fi

# Crear el archivo .p12
openssl pkcs12 -export \
  -in "$CERT_PATH/$CERT_FILE" \
  -inkey "$CERT_PATH/$KEY_FILE" \
  -out "$OUTPUT" \
  -name "$ALIAS" \
  -passout pass:"$PASSWORD"

if [ $? -eq 0 ]; then
  echo "✅ keystore.p12 generado correctamente."

  echo "🔁 Moviendo keystore.p12 a $BACKEND_KEYSTORE_PATH..."
  mv -f "$OUTPUT" "$BACKEND_KEYSTORE_PATH/$OUTPUT"

  if [ $? -eq 0 ]; then
    echo "✅ Copia completada con éxito en el backend."
  else
    echo "⚠️ Error al mover el archivo. ¿La ruta del backend es correcta?"
  fi
else
  echo "❌ Error al generar el keystore.p12"
fi