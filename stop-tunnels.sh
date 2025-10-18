#!/bin/bash

# Script para parar os túneis Cloudflare
# Uso: ./stop-tunnels.sh

echo "🛑 Parando túneis Cloudflare..."

if [ -f .cloudflare-pids ]; then
    while read pid; do
        if ps -p $pid > /dev/null 2>&1; then
            echo "   Parando processo $pid..."
            kill $pid
        fi
    done < .cloudflare-pids
    
    rm .cloudflare-pids
    echo "✅ Túneis parados!"
else
    echo "⚠️  Nenhum túnel ativo encontrado"
    echo "   Tentando parar todos os processos cloudflared..."
    pkill -f cloudflared
fi

# Limpar logs
if [ -f cloudflare-frontend.log ]; then
    rm cloudflare-frontend.log
fi

if [ -f cloudflare-backend.log ]; then
    rm cloudflare-backend.log
fi

echo "🧹 Limpeza concluída!"

