#!/bin/bash

# DIBEA Demo Startup Script
# Este script inicia toda a demo local do DIBEA

echo "🚀 Iniciando DIBEA Demo Local..."
echo "=================================="

# Verificar se as portas estão livres
check_port() {
    if lsof -Pi :$1 -sTCP:LISTEN -t >/dev/null ; then
        echo "⚠️  Porta $1 já está em uso"
        return 1
    fi
    return 0
}

# Função para parar processos
cleanup() {
    echo ""
    echo "🛑 Parando serviços..."
    
    # Parar backend
    if [ ! -z "$BACKEND_PID" ]; then
        kill $BACKEND_PID 2>/dev/null
        echo "✅ Backend parado"
    fi
    
    # Parar frontend
    if [ ! -z "$FRONTEND_PID" ]; then
        kill $FRONTEND_PID 2>/dev/null
        echo "✅ Frontend parado"
    fi
    
    echo "👋 Demo finalizada!"
    exit 0
}

# Capturar Ctrl+C
trap cleanup SIGINT

# Verificar portas
echo "🔍 Verificando portas..."
if ! check_port 3000; then
    echo "❌ Porta 3000 (backend) está ocupada. Pare o processo e tente novamente."
    exit 1
fi

if ! check_port 3001; then
    echo "❌ Porta 3001 (frontend) está ocupada. Pare o processo e tente novamente."
    exit 1
fi

echo "✅ Portas disponíveis"

# Verificar se o banco existe
if [ ! -f "apps/backend/demo.db" ]; then
    echo "🗄️  Banco de dados não encontrado. Criando..."
    cd apps/backend
    npx prisma migrate dev --name demo-init
    npx ts-node prisma/seed-demo.ts
    cd ../..
    echo "✅ Banco de dados criado e populado"
else
    echo "✅ Banco de dados encontrado"
fi

# Iniciar backend
echo "🔧 Iniciando backend..."
cd apps/backend
npx ts-node src/demo-server.ts &
BACKEND_PID=$!
cd ../..

# Aguardar backend inicializar
echo "⏳ Aguardando backend inicializar..."
sleep 3

# Verificar se backend está funcionando
if curl -s http://localhost:3000/health > /dev/null; then
    echo "✅ Backend funcionando"
else
    echo "❌ Erro ao iniciar backend"
    cleanup
    exit 1
fi

# Iniciar frontend
echo "🌐 Iniciando frontend..."
cd apps/frontend
npm run dev &
FRONTEND_PID=$!
cd ../..

# Aguardar frontend inicializar
echo "⏳ Aguardando frontend inicializar..."
sleep 5

# Verificar se frontend está funcionando
if curl -s http://localhost:3001 > /dev/null; then
    echo "✅ Frontend funcionando"
else
    echo "❌ Erro ao iniciar frontend"
    cleanup
    exit 1
fi

echo ""
echo "🎉 DIBEA Demo iniciada com sucesso!"
echo "=================================="
echo ""
echo "📱 Acesse a aplicação:"
echo "   🌐 Frontend: http://localhost:3001"
echo "   🔧 Backend:  http://localhost:3000"
echo ""
echo "🔐 Contas de demonstração:"
echo "   👑 Admin:       admin@dibea.com / admin123"
echo "   🩺 Veterinário: vet@dibea.com / vet123"
echo "   👨‍💼 Funcionário:  func@dibea.com / func123"
echo "   👤 Cidadão:     cidadao@dibea.com / cidadao123"
echo ""
echo "📊 APIs disponíveis:"
echo "   🏥 Health:      http://localhost:3000/health"
echo "   🔑 Auth:        http://localhost:3000/api/v1/auth/login"
echo "   📈 Stats:       http://localhost:3000/api/v1/landing/stats"
echo "   🐾 Animals:     http://localhost:3000/api/v1/animals"
echo ""
echo "💡 Dicas:"
echo "   • Use Ctrl+C para parar a demo"
echo "   • Dados são salvos em SQLite (apps/backend/demo.db)"
echo "   • Logs aparecem em tempo real abaixo"
echo ""
echo "🔄 Aguardando... (Ctrl+C para parar)"
echo "=================================="

# Aguardar indefinidamente
wait
