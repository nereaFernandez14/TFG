#!/bin/bash

# Ruta absoluta o relativa desde donde ejecutas este script
CERTS_DIR="src/certs"

echo "🔍 Verificando si mkcert está instalado..."
if ! command -v mkcert &> /dev/null; then
  echo "❌ mkcert no está instalado. Por favor, instálalo primero desde https://github.com/FiloSottile/mkcert"
  exit 1
fi

echo "📦 Instalando CA de mkcert (si no está ya instalada)..."
mkcert -install

echo "📂 Creando carpeta si no existe: $CERTS_DIR"
mkdir -p "$CERTS_DIR"
cd "$CERTS_DIR" || exit

echo "🔐 Generando certificados para localhost..."
mkcert localhost 127.0.0.1 ::1

if [ $? -eq 0 ]; then
  echo "✅ Certificados generados correctamente en $CERTS_DIR"
  echo "   📄 localhost.pem"
  echo "   🔑 localhost-key.pem"
else
  echo "❌ Error al generar los certificados"
  exit 1
fi