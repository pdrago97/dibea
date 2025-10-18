#!/bin/bash

# Script para configurar Cloudflare Tunnel para DIBEA
# Uso: ./setup-cloudflare-tunnel.sh

echo "🚀 Configurando Cloudflare Tunnel para DIBEA..."
echo ""

# Verificar se cloudflared está instalado
if ! command -v cloudflared &> /dev/null; then
    echo "❌ cloudflared não está instalado!"
    echo "📦 Instalando cloudflared..."
    
    # Detectar sistema operacional
    if [[ "$OSTYPE" == "linux-gnu"* ]]; then
        wget https://github.com/cloudflare/cloudflared/releases/latest/download/cloudflared-linux-amd64.deb
        sudo dpkg -i cloudflared-linux-amd64.deb
        rm cloudflared-linux-amd64.deb
    elif [[ "$OSTYPE" == "darwin"* ]]; then
        brew install cloudflare/cloudflare/cloudflared
    else
        echo "❌ Sistema operacional não suportado. Instale manualmente:"
        echo "   https://developers.cloudflare.com/cloudflare-one/connections/connect-apps/install-and-setup/installation/"
        exit 1
    fi
fi

echo "✅ cloudflared instalado!"
echo ""
echo "🌐 Iniciando túneis..."
echo ""

# Iniciar túnel para frontend em background
echo "📱 Iniciando túnel para Frontend (porta 3002)..."
cloudflared tunnel --url http://localhost:3002 > cloudflare-frontend.log 2>&1 &
FRONTEND_PID=$!

# Aguardar 3 segundos para o túnel iniciar
sleep 3

# Iniciar túnel para backend em background
echo "🔧 Iniciando túnel para Backend (porta 3000)..."
cloudflared tunnel --url http://localhost:3000 > cloudflare-backend.log 2>&1 &
BACKEND_PID=$!

# Aguardar 3 segundos para o túnel iniciar
sleep 3

echo ""
echo "✅ Túneis iniciados!"
echo ""
echo "📋 URLs públicas:"
echo ""

# Extrair URLs dos logs
FRONTEND_URL=$(grep -oP 'https://[a-z0-9-]+\.trycloudflare\.com' cloudflare-frontend.log | head -1)
BACKEND_URL=$(grep -oP 'https://[a-z0-9-]+\.trycloudflare\.com' cloudflare-backend.log | head -1)

echo "🌐 Frontend: $FRONTEND_URL"
echo "🔧 Backend:  $BACKEND_URL"
echo ""
echo "📝 Próximos passos:"
echo ""
echo "1️⃣  Atualize o arquivo apps/frontend/.env.local:"
echo "   NEXT_PUBLIC_API_URL=$BACKEND_URL"
echo ""
echo "2️⃣  Atualize o CORS no apps/backend/src/index.ts:"
echo "   origin: ['$FRONTEND_URL']"
echo ""
echo "3️⃣  Reinicie os servidores (npm run dev)"
echo ""
echo "💡 Para parar os túneis:"
echo "   kill $FRONTEND_PID $BACKEND_PID"
echo ""
echo "📄 Logs salvos em:"
echo "   - cloudflare-frontend.log"
echo "   - cloudflare-backend.log"
echo ""

# Salvar PIDs em arquivo para fácil cleanup
echo "$FRONTEND_PID" > .cloudflare-pids
echo "$BACKEND_PID" >> .cloudflare-pids

echo "✅ Configuração completa!"

