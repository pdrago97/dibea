#!/bin/bash

# Script para configurar ngrok para DIBEA
# Uso: ./setup-ngrok.sh

echo "🚀 Configurando ngrok para DIBEA..."
echo ""

# Verificar se ngrok está instalado
if ! command -v ngrok &> /dev/null; then
    echo "❌ ngrok não está instalado!"
    echo "📦 Instalando ngrok..."
    npm install -g ngrok
fi

echo "✅ ngrok instalado!"
echo ""
echo "📋 Instruções:"
echo ""
echo "1️⃣  Abra 2 terminais separados"
echo ""
echo "2️⃣  No Terminal 1, execute:"
echo "   ngrok http 3002 --log=stdout > ngrok-frontend.log &"
echo ""
echo "3️⃣  No Terminal 2, execute:"
echo "   ngrok http 3000 --log=stdout > ngrok-backend.log &"
echo ""
echo "4️⃣  Aguarde alguns segundos e execute:"
echo "   curl http://localhost:4040/api/tunnels | jq '.tunnels[0].public_url'"
echo "   curl http://localhost:4041/api/tunnels | jq '.tunnels[0].public_url'"
echo ""
echo "5️⃣  Copie as URLs públicas e atualize:"
echo "   - Frontend: NEXT_PUBLIC_API_URL no .env.local"
echo "   - Backend: CORS origins no apps/backend/src/index.ts"
echo ""
echo "💡 Dica: Use 'ngrok authtoken <seu-token>' para remover limites"
echo "   Obtenha seu token em: https://dashboard.ngrok.com/get-started/your-authtoken"
echo ""

