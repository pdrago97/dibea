#!/bin/bash

# DIBEA Docker Compose Startup Script
# Starts all services with Docker Compose

set -e

echo "🐳 DIBEA Docker Compose Startup"
echo "================================"
echo ""

# Colors
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m'

# Step 1: Stop any running containers
echo "1️⃣  Stopping any running containers..."
docker-compose down 2>/dev/null || true
echo -e "${GREEN}✅ Containers stopped${NC}"
echo ""

# Step 2: Check if .env file exists
echo "2️⃣  Checking environment variables..."
if [ -f ".env" ]; then
    echo -e "${GREEN}✅ .env file exists${NC}"
    # Show non-sensitive vars
    echo "   Key variables:"
    grep -E "^(POSTGRES_|REDIS_|JWT_|NODE_ENV)" .env | sed 's/=.*/=***/' || echo "   (none found)"
else
    echo -e "${YELLOW}⚠️  .env file not found${NC}"
    echo "   Using default values from docker-compose.yml"
fi
echo ""

# Step 3: Build and start services
echo "3️⃣  Building and starting services..."
echo "   This may take a few minutes on first run..."
echo ""

docker-compose up --build -d

echo ""
echo -e "${GREEN}✅ Services started${NC}"
echo ""

# Step 4: Wait for services to be healthy
echo "4️⃣  Waiting for services to be healthy..."
echo ""

# Wait for postgres
echo -n "   PostgreSQL: "
for i in {1..30}; do
    if docker-compose exec -T postgres pg_isready -U dibea -d dibea >/dev/null 2>&1; then
        echo -e "${GREEN}✅ Healthy${NC}"
        break
    fi
    echo -n "."
    sleep 1
done

# Wait for redis
echo -n "   Redis: "
for i in {1..30}; do
    if docker-compose exec -T redis redis-cli ping >/dev/null 2>&1; then
        echo -e "${GREEN}✅ Healthy${NC}"
        break
    fi
    echo -n "."
    sleep 1
done

# Wait for backend
echo -n "   Backend: "
for i in {1..60}; do
    if curl -sf http://localhost:3000/health >/dev/null 2>&1; then
        echo -e "${GREEN}✅ Healthy${NC}"
        break
    fi
    echo -n "."
    sleep 1
done

# Wait for frontend
echo -n "   Frontend: "
for i in {1..60}; do
    if curl -sf http://localhost:3001 >/dev/null 2>&1; then
        echo -e "${GREEN}✅ Healthy${NC}"
        break
    fi
    echo -n "."
    sleep 1
done

echo ""

# Step 5: Show container status
echo "5️⃣  Container Status:"
echo ""
docker-compose ps
echo ""

# Step 6: Show logs summary
echo "6️⃣  Recent Logs:"
echo ""
echo "=== Backend Logs ==="
docker-compose logs --tail=10 backend
echo ""
echo "=== Frontend Logs ==="
docker-compose logs --tail=10 frontend
echo ""

# Step 7: Final summary
echo "✅ DIBEA is now running!"
echo ""
echo "📊 Services:"
echo "   • PostgreSQL: http://localhost:5432"
echo "   • Redis: http://localhost:6379"
echo "   • Backend API: http://localhost:3000"
echo "   • Frontend: http://localhost:3001"
echo ""
echo "🌐 Open in browser: http://localhost:3001"
echo ""
echo "📝 Useful commands:"
echo "   • View logs: docker-compose logs -f"
echo "   • View specific service: docker-compose logs -f frontend"
echo "   • Stop all: docker-compose down"
echo "   • Restart service: docker-compose restart frontend"
echo ""
echo "🐛 Troubleshooting:"
echo "   • Check frontend logs: docker-compose logs frontend"
echo "   • Check backend logs: docker-compose logs backend"
echo "   • Rebuild frontend: docker-compose up --build -d frontend"
echo "   • Full rebuild: docker-compose down && docker-compose up --build -d"
echo ""

