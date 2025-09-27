#!/bin/bash

# DIBEA Database Setup Script
# This script sets up the database for development

set -e

echo "🗄️  DIBEA Database Setup"
echo "======================="

# Check if Docker is running
if ! docker info > /dev/null 2>&1; then
    echo "❌ Docker is not running. Please start Docker first."
    exit 1
fi

# Start database services
echo "🐳 Starting database services..."
docker-compose up -d postgres redis minio

# Wait for PostgreSQL to be ready
echo "⏳ Waiting for PostgreSQL to be ready..."
until docker-compose exec postgres pg_isready -U dibea_user -d dibea > /dev/null 2>&1; do
    echo "   Waiting for PostgreSQL..."
    sleep 2
done

echo "✅ PostgreSQL is ready!"

# Wait for Redis to be ready
echo "⏳ Waiting for Redis to be ready..."
until docker-compose exec redis redis-cli ping > /dev/null 2>&1; do
    echo "   Waiting for Redis..."
    sleep 2
done

echo "✅ Redis is ready!"

# Navigate to backend directory
cd apps/backend

# Generate Prisma client
echo "🔧 Generating Prisma client..."
npx prisma generate

# Run database migrations
echo "🔄 Running database migrations..."
npx prisma migrate dev --name init

# Seed the database
echo "🌱 Seeding database with initial data..."
npx prisma db seed

echo ""
echo "🎉 Database setup completed successfully!"
echo ""
echo "📊 You can now:"
echo "   • View the database: npx prisma studio"
echo "   • Start the backend: npm run dev"
echo "   • Access Prisma Studio: http://localhost:5555"
echo ""
echo "🔐 Default accounts created:"
echo "   • Admin: admin@dibea.com.br / admin123"
echo "   • Veterinário: veterinario@dibea.com.br / vet123"
echo "   • Funcionário: funcionario@dibea.com.br / func123"
