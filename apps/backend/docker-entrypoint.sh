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

# Executar migrações do Prisma (opcional)
if [ "$SKIP_MIGRATIONS" != "true" ]; then
  echo "🔄 Executando migrações do banco de dados..."
  npx prisma migrate deploy || echo "⚠️ Migrações falharam ou já foram executadas"
fi

# Executar seed se necessário (opcional)
if [ "$SKIP_SEED" != "true" ]; then
  echo "🌱 Executando seed do banco de dados..."
  npx prisma db seed || echo "⚠️ Seed falhou ou já foi executado"
fi

echo "✅ Backend pronto para iniciar"

# Executar comando passado como argumento
exec "$@"
