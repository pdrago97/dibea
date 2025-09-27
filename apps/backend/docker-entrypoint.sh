#!/bin/sh

set -e

echo "🚀 Iniciando DIBEA Backend..."

# Aguardar PostgreSQL estar pronto
echo "⏳ Aguardando PostgreSQL..."
while ! nc -z postgres 5432; do
  sleep 1
done
echo "✅ PostgreSQL está pronto"

# Aguardar Redis estar pronto
echo "⏳ Aguardando Redis..."
while ! nc -z redis 6379; do
  sleep 1
done
echo "✅ Redis está pronto"

# Executar migrações do Prisma
echo "🔄 Executando migrações do banco de dados..."
npx prisma migrate deploy

# Executar seed se necessário
echo "🌱 Executando seed do banco de dados..."
npx prisma db seed || echo "⚠️ Seed falhou ou já foi executado"

echo "✅ Backend pronto para iniciar"

# Executar comando passado como argumento
exec "$@"
