#!/bin/bash

# Script para obtener el refresh_token de forma manual
# Uso: ./get-refresh-token.sh

set -e

echo "=========================================="
echo "🔐 Google OAuth Refresh Token Generator"
echo "=========================================="
echo ""

# Leer variables del .env si existen
if [ -f .env ]; then
  echo "Cargando variables de .env..."
  export $(grep -v '^#' .env | xargs)
fi

CLIENT_ID="${GOOGLE_CLIENT_ID}"
CLIENT_SECRET="${GOOGLE_CLIENT_SECRET}"
REDIRECT_URI="${GOOGLE_REDIRECT_URI:-http://localhost:3000/google/callback}"

if [ -z "$CLIENT_ID" ] || [ -z "$CLIENT_SECRET" ]; then
  echo "❌ Error: GOOGLE_CLIENT_ID o GOOGLE_CLIENT_SECRET no están configurados"
  echo "   Asegúrate de tener un .env con estas variables o exportarlas."
  exit 1
fi

echo "📋 Configuración:"
echo "  CLIENT_ID: $CLIENT_ID"
echo "  REDIRECT_URI: $REDIRECT_URI"
echo ""

# 1. Generar URL de autorización
SCOPE="https://www.googleapis.com/auth/drive.file"
ENCODED_REDIRECT=$(python3 -c "import urllib.parse; print(urllib.parse.quote('$REDIRECT_URI'))")
ENCODED_SCOPE=$(python3 -c "import urllib.parse; print(urllib.parse.quote('$SCOPE'))")

AUTH_URL="https://accounts.google.com/o/oauth2/v2/auth?client_id=$CLIENT_ID&redirect_uri=$ENCODED_REDIRECT&response_type=code&scope=$ENCODED_SCOPE&access_type=offline&prompt=consent"

echo "✅ Paso 1: URL de autorización generada"
echo ""
echo "📱 Abre esta URL en tu navegador:"
echo ""
echo "$AUTH_URL"
echo ""
echo "---"
echo "Después de autorizar, Google te redirigirá a una URL con ?code=..."
echo ""

# 2. Pedirle al usuario que pegue el código
# Puedes pasar el code como argumento: ./get-refresh-token.sh "4/0AbC..."
# o como variable de entorno: AUTH_CODE=... ./get-refresh-token.sh
AUTH_CODE="$1"
if [ -z "$AUTH_CODE" ]; then
  AUTH_CODE="$AUTH_CODE_ENV"
fi
if [ -z "$AUTH_CODE" ]; then
  read -p "📌 Copia y pega el CODE de la URL redirigida (la parte después de ?code=): " AUTH_CODE
fi

if [ -z "$AUTH_CODE" ]; then
  echo "❌ Código vacío. Abortando."
  exit 1
fi

echo ""
echo "✅ Paso 2: Código recibido: ${AUTH_CODE:0:20}..."
echo ""

# 3. Intercambiar código por tokens
echo "🔄 Paso 3: Intercambiando código por tokens..."
echo ""

RESPONSE=$(curl -s -X POST https://oauth2.googleapis.com/token \
  -H "Content-Type: application/x-www-form-urlencoded" \
  -d "client_id=$CLIENT_ID" \
  -d "client_secret=$CLIENT_SECRET" \
  -d "code=$AUTH_CODE" \
  -d "grant_type=authorization_code" \
  -d "redirect_uri=$REDIRECT_URI")

echo "📦 Respuesta de Google:"
echo "$RESPONSE" | jq . 2>/dev/null || echo "$RESPONSE"
echo ""

# 4. Extraer el refresh token
REFRESH_TOKEN=$(echo "$RESPONSE" | jq -r '.refresh_token // empty' 2>/dev/null)

if [ -z "$REFRESH_TOKEN" ] || [ "$REFRESH_TOKEN" = "null" ]; then
  echo "❌ No se obtuvo refresh_token. Posibles causas:"
  echo "   - Ya autorizaste la app antes sin offline access"
  echo "   - La redirect_uri no coincide con la registrada en Google Cloud"
  echo "   - El código expiró (es válido solo 10 minutos)"
  echo ""
  echo "💡 Solución: revoca la app en https://myaccount.google.com/permissions y reinenta"
  exit 1
fi

echo "✅ ¡Refresh token obtenido!"
echo ""
echo "🔑 Tu REFRESH_TOKEN es:"
echo ""
echo "   $REFRESH_TOKEN"
echo ""
echo "---"
echo "Guarda este token en una variable de entorno o archivo seguro (.env, secrets, etc.)"
echo ""
echo "Ejemplo de uso en .env:"
echo "  GOOGLE_REFRESH_TOKEN=$REFRESH_TOKEN"
echo ""
echo "O como variable en el shell:"
echo "  export GOOGLE_REFRESH_TOKEN='$REFRESH_TOKEN'"
echo ""
