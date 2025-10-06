#!/bin/bash

echo "🔄 Aplicando migration de User Elevation System..."

# Check if DATABASE_URL is set
if [ -z "$DATABASE_URL" ]; then
    echo "❌ DATABASE_URL não está configurada"
    echo "Execute: source .env"
    exit 1
fi

# Apply the SQL migration directly to Supabase
psql "$DATABASE_URL" -f prisma/migrations/add_user_elevation_system.sql

if [ $? -eq 0 ]; then
    echo "✅ Migration aplicada com sucesso!"
    echo "🔄 Gerando Prisma Client..."
    npx prisma generate
    echo "✅ Prisma Client gerado!"
else
    echo "❌ Erro ao aplicar migration"
    exit 1
fi
