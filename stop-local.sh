#!/bin/bash

# DIBEA - Stop Local Development Script

echo "🛑 Parando DIBEA - Desenvolvimento Local"
echo "======================================="

# Parar processos usando PIDs salvos
if [ -f ".backend.pid" ]; then
    BACKEND_PID=$(cat .backend.pid)
    if kill -0 $BACKEND_PID 2>/dev/null; then
        echo "🔧 Parando backend (PID: $BACKEND_PID)..."
        kill $BACKEND_PID
    fi
    rm .backend.pid
fi

if [ -f ".frontend.pid" ]; then
    FRONTEND_PID=$(cat .frontend.pid)
    if kill -0 $FRONTEND_PID 2>/dev/null; then
        echo "🎨 Parando frontend (PID: $FRONTEND_PID)..."
        kill $FRONTEND_PID
    fi
    rm .frontend.pid
fi

# Parar processos por nome (backup)
echo "🧹 Limpando processos restantes..."
pkill -f "ts-node.*demo-server" 2>/dev/null || true
pkill -f "next dev" 2>/dev/null || true

# Liberar portas
lsof -ti:3000 | xargs kill -9 2>/dev/null || true
lsof -ti:3001 | xargs kill -9 2>/dev/null || true

echo ""
echo "✅ DIBEA parado com sucesso!"
echo ""
echo "📝 Logs ainda disponíveis em:"
echo "• Backend:         logs/backend.log"
echo "• Frontend:        logs/frontend.log"
