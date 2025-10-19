#!/bin/bash

# DIBEA Local Development Startup Script
# Starts database services in Docker, backend and frontend locally

set -e

echo "🚀 DIBEA Local Development Startup"
echo "==================================="
echo ""

# Colors
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m'

# Step 1: Stop any running Docker services
echo "1️⃣  Stopping any running Docker services..."
docker-compose down 2>/dev/null || true
echo -e "${GREEN}✅ Docker services stopped${NC}"
echo ""

# Step 2: Start only database services
echo "2️⃣  Starting PostgreSQL and Redis..."
docker-compose up -d postgres redis

# Wait for services to be ready
echo -n "   Waiting for PostgreSQL"
for i in {1..30}; do
    if docker-compose exec -T postgres pg_isready -U dibea -d dibea >/dev/null 2>&1; then
        echo -e " ${GREEN}✅${NC}"
        break
    fi
    echo -n "."
    sleep 1
done

echo -n "   Waiting for Redis"
for i in {1..30}; do
    if docker-compose exec -T redis redis-cli ping >/dev/null 2>&1; then
        echo -e " ${GREEN}✅${NC}"
        break
    fi
    echo -n "."
    sleep 1
done

echo ""

# Step 3: Show Docker status
echo "3️⃣  Docker Services Status:"
docker-compose ps
echo ""

# Step 4: Kill any processes on ports 3000 and 3001
echo "4️⃣  Checking ports..."
if lsof -Pi :3000 -sTCP:LISTEN -t >/dev/null 2>&1; then
    echo -e "${YELLOW}   Port 3000 in use, killing process...${NC}"
    lsof -ti:3000 | xargs kill -9 2>/dev/null || true
fi

if lsof -Pi :3001 -sTCP:LISTEN -t >/dev/null 2>&1; then
    echo -e "${YELLOW}   Port 3001 in use, killing process...${NC}"
    lsof -ti:3001 | xargs kill -9 2>/dev/null || true
fi
echo -e "${GREEN}✅ Ports 3000 and 3001 are available${NC}"
echo ""

# Step 5: Instructions
echo "5️⃣  Ready to start Backend and Frontend!"
echo ""
echo -e "${BLUE}━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━${NC}"
echo ""
echo "Open TWO separate terminals and run:"
echo ""
echo -e "${GREEN}Terminal 1 (Backend):${NC}"
echo "  cd apps/backend"
echo "  npm run dev"
echo ""
echo -e "${GREEN}Terminal 2 (Frontend):${NC}"
echo "  cd apps/frontend"
echo "  npm run dev"
echo ""
echo -e "${BLUE}━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━${NC}"
echo ""
echo "📊 Services:"
echo "   • PostgreSQL: Running in Docker on port 5432"
echo "   • Redis: Running in Docker on port 6379"
echo "   • Backend: Will run locally on port 3000"
echo "   • Frontend: Will run locally on port 3001"
echo ""
echo "🌐 After starting both services, open:"
echo -e "   ${GREEN}http://localhost:3001${NC}"
echo ""
echo "📝 Useful commands:"
echo "   • Stop Docker services: docker-compose down"
echo "   • View Docker logs: docker-compose logs -f"
echo "   • Restart Docker services: docker-compose restart postgres redis"
echo ""

