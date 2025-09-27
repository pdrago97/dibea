#!/bin/bash

# DIBEA - Simple Docker Startup Script
# Este script inicia apenas os serviços essenciais do DIBEA

set -e

echo "🚀 Iniciando DIBEA - Versão Simplificada"
echo "========================================"

# Verificar se Docker está rodando
if ! docker info > /dev/null 2>&1; then
    echo "❌ Docker não está rodando. Por favor, inicie o Docker primeiro."
    exit 1
fi

echo "✅ Docker está rodando"

# Parar containers existentes
echo ""
echo "🛑 Parando containers existentes..."
docker-compose -f docker-simple.yml down --remove-orphans 2>/dev/null || true

# Limpar se solicitado
if [ "$1" = "--clean" ]; then
    echo "🧹 Limpando volumes existentes..."
    docker-compose -f docker-simple.yml down -v 2>/dev/null || true
    docker system prune -f
fi

# Construir e iniciar serviços
echo ""
echo "🔨 Construindo e iniciando serviços..."
docker-compose -f docker-simple.yml up --build -d

# Aguardar serviços
echo ""
echo "⏳ Aguardando serviços ficarem prontos..."
sleep 30

echo ""
echo "🎉 DIBEA está rodando!"
echo "====================="
echo ""
echo "📊 Serviços disponíveis:"
echo "• Frontend:        http://localhost:3001"
echo "• Backend API:     http://localhost:3000"
echo "• PostgreSQL:      localhost:5432"
echo "• Redis:           localhost:6379"
echo ""
echo "🔐 Credenciais do banco:"
echo "• Database:        dibea"
echo "• User:            dibea_user"
echo "• Password:        dibea_password"
echo ""
echo "📝 Para ver logs: docker-compose -f docker-simple.yml logs -f [service_name]"
echo "🛑 Para parar:    docker-compose -f docker-simple.yml down"
echo ""
echo "✨ Acesse http://localhost:3001 para começar!"
