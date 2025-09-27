#!/bin/bash

# DIBEA - Docker Startup Script
# Este script inicia todos os serviços do DIBEA usando Docker Compose

set -e

echo "🚀 Iniciando DIBEA - Sistema de Gestão de Bem-Estar Animal"
echo "=================================================="

# Verificar se Docker está rodando
if ! docker info > /dev/null 2>&1; then
    echo "❌ Docker não está rodando. Por favor, inicie o Docker primeiro."
    exit 1
fi

# Verificar se Docker Compose está disponível
if ! command -v docker-compose > /dev/null 2>&1; then
    echo "❌ Docker Compose não encontrado. Por favor, instale o Docker Compose."
    exit 1
fi

echo "✅ Docker está rodando"
echo "✅ Docker Compose encontrado"

# Parar containers existentes se estiverem rodando
echo ""
echo "🛑 Parando containers existentes..."
docker-compose down --remove-orphans

# Limpar volumes se solicitado
if [ "$1" = "--clean" ]; then
    echo "🧹 Limpando volumes existentes..."
    docker-compose down -v
    docker system prune -f
fi

# Construir e iniciar todos os serviços
echo ""
echo "🔨 Construindo e iniciando serviços..."
docker-compose up --build -d

# Aguardar serviços ficarem prontos
echo ""
echo "⏳ Aguardando serviços ficarem prontos..."

# Função para verificar se um serviço está saudável
check_health() {
    local service=$1
    local max_attempts=30
    local attempt=1
    
    while [ $attempt -le $max_attempts ]; do
        if docker-compose ps $service | grep -q "healthy"; then
            echo "✅ $service está pronto"
            return 0
        fi
        echo "⏳ Aguardando $service... (tentativa $attempt/$max_attempts)"
        sleep 10
        attempt=$((attempt + 1))
    done
    
    echo "❌ $service não ficou pronto em tempo hábil"
    return 1
}

# Verificar saúde dos serviços principais
check_health "postgres"
check_health "redis"
check_health "neo4j"
check_health "elasticsearch"

# Aguardar um pouco mais para o backend e frontend
sleep 20

echo ""
echo "🎉 DIBEA está rodando!"
echo "=================================================="
echo ""
echo "📊 Serviços disponíveis:"
echo "• Frontend:        http://localhost:3001"
echo "• Backend API:     http://localhost:3000"
echo "• PostgreSQL:      localhost:5432"
echo "• Redis:           localhost:6379"
echo "• Neo4j Browser:   http://localhost:7474"
echo "• Elasticsearch:   http://localhost:9200"
echo "• MinIO Console:   http://localhost:9001"
echo "• n8n:             http://localhost:5678"
echo ""
echo "🔐 Credenciais:"
echo "• Neo4j:           neo4j / dibea123"
echo "• MinIO:           dibea_minio / dibea_minio_password"
echo "• n8n:             admin / dibea123"
echo ""
echo "📝 Para ver logs: docker-compose logs -f [service_name]"
echo "🛑 Para parar:    docker-compose down"
echo "🧹 Para limpar:   ./docker-start.sh --clean"
echo ""
echo "✨ Acesse http://localhost:3001 para começar!"
