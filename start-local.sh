#!/bin/bash

# DIBEA - Local Development Startup Script
# Este script inicia todos os serviços localmente sem Docker

set -e

echo "🚀 Iniciando DIBEA - Desenvolvimento Local"
echo "=========================================="

# Verificar dependências
echo "🔍 Verificando dependências..."

# Verificar Node.js
if ! command -v node > /dev/null 2>&1; then
    echo "❌ Node.js não encontrado. Por favor, instale o Node.js primeiro."
    exit 1
fi

# Verificar npm
if ! command -v npm > /dev/null 2>&1; then
    echo "❌ npm não encontrado. Por favor, instale o npm primeiro."
    exit 1
fi

echo "✅ Node.js $(node --version)"
echo "✅ npm $(npm --version)"

# Parar processos existentes
echo ""
echo "🛑 Parando processos existentes..."
pkill -f "ts-node.*demo-server" 2>/dev/null || true
pkill -f "next dev" 2>/dev/null || true
lsof -ti:3000 | xargs kill -9 2>/dev/null || true
lsof -ti:3001 | xargs kill -9 2>/dev/null || true

# Instalar dependências se necessário
echo ""
echo "📦 Verificando dependências do projeto..."

if [ ! -d "node_modules" ]; then
    echo "📦 Instalando dependências raiz..."
    npm install
fi

if [ ! -d "apps/backend/node_modules" ]; then
    echo "📦 Instalando dependências do backend..."
    cd apps/backend && npm install && cd ../..
fi

if [ ! -d "apps/frontend/node_modules" ]; then
    echo "📦 Instalando dependências do frontend..."
    cd apps/frontend && npm install && cd ../..
fi

# Preparar banco de dados
echo ""
echo "🗄️ Preparando banco de dados..."
cd apps/backend

# Gerar Prisma client
echo "🔧 Gerando Prisma client..."
npx prisma generate

# Executar migrações
echo "🔄 Executando migrações..."
npx prisma migrate dev --name local-setup

# Executar seed
echo "🌱 Executando seed..."
npx ts-node prisma/seed-demo.ts

cd ../..

# Iniciar serviços
echo ""
echo "🚀 Iniciando serviços..."

# Iniciar backend em background
echo "🔧 Iniciando backend..."
cd apps/backend
npx ts-node src/demo-server.ts > ../../logs/backend.log 2>&1 &
BACKEND_PID=$!
cd ../..

# Aguardar backend iniciar
echo "⏳ Aguardando backend iniciar..."
sleep 10

# Verificar se backend está rodando
if ! curl -s http://localhost:3000/health > /dev/null; then
    echo "❌ Backend falhou ao iniciar. Verificando logs..."
    tail -20 logs/backend.log
    exit 1
fi

echo "✅ Backend iniciado com sucesso"

# Iniciar frontend em background
echo "🎨 Iniciando frontend..."
cd apps/frontend
npm run dev > ../../logs/frontend.log 2>&1 &
FRONTEND_PID=$!
cd ../..

# Aguardar frontend iniciar
echo "⏳ Aguardando frontend iniciar..."
sleep 15

# Verificar se frontend está rodando
if ! curl -s http://localhost:3001 > /dev/null; then
    echo "❌ Frontend falhou ao iniciar. Verificando logs..."
    tail -20 logs/frontend.log
    exit 1
fi

echo "✅ Frontend iniciado com sucesso"

# Criar arquivo de PIDs para facilitar parada
echo "$BACKEND_PID" > .backend.pid
echo "$FRONTEND_PID" > .frontend.pid

echo ""
echo "🎉 DIBEA está rodando localmente!"
echo "================================"
echo ""
echo "📊 Serviços disponíveis:"
echo "• Frontend:        http://localhost:3001"
echo "• Backend API:     http://localhost:3000"
echo "• Health Check:    http://localhost:3000/health"
echo ""
echo "🔐 Contas de demonstração:"
echo "• Admin:           admin@dibea.com / admin123"
echo "• Veterinário:     vet@dibea.com / vet123"
echo "• Funcionário:     func@dibea.com / func123"
echo "• Cidadão:         cidadao@dibea.com / cidadao123"
echo ""
echo "📝 Logs:"
echo "• Backend:         tail -f logs/backend.log"
echo "• Frontend:        tail -f logs/frontend.log"
echo ""
echo "🛑 Para parar:     ./stop-local.sh"
echo ""
echo "✨ Acesse http://localhost:3001 para começar!"
