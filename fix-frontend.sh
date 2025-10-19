#!/bin/bash

# DIBEA Frontend Fix Script
# This script fixes common frontend issues and starts the development server

set -e  # Exit on error

echo "🔧 DIBEA Frontend Fix Script"
echo "=============================="
echo ""

# Colors for output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
NC='\033[0m' # No Color

# Navigate to frontend directory
cd apps/frontend

echo "📁 Current directory: $(pwd)"
echo ""

# Step 1: Check if backend is running
echo "1️⃣  Checking backend health..."
if curl -s http://localhost:3000/health > /dev/null 2>&1; then
    echo -e "${GREEN}✅ Backend is running on port 3000${NC}"
else
    echo -e "${YELLOW}⚠️  Backend is not responding on port 3000${NC}"
    echo "   Please start the backend first with: cd apps/backend && npm run dev"
    echo ""
fi

# Step 2: Check environment variables
echo ""
echo "2️⃣  Checking environment variables..."
if [ -f ".env.local" ]; then
    echo -e "${GREEN}✅ .env.local file exists${NC}"
    
    # Check API URL
    if grep -q "NEXT_PUBLIC_API_URL=http://localhost:3000" .env.local; then
        echo -e "${GREEN}✅ API URL is correctly configured${NC}"
    else
        echo -e "${YELLOW}⚠️  API URL might be incorrect${NC}"
        echo "   Expected: NEXT_PUBLIC_API_URL=http://localhost:3000/api/v1"
    fi
else
    echo -e "${RED}❌ .env.local file not found${NC}"
    echo "   Creating from .env.example..."
    cp .env.example .env.local
    echo -e "${GREEN}✅ Created .env.local${NC}"
fi

# Step 3: Clean build artifacts
echo ""
echo "3️⃣  Cleaning build artifacts..."
if [ -d ".next" ]; then
    rm -rf .next
    echo -e "${GREEN}✅ Removed .next directory${NC}"
else
    echo "   No .next directory to clean"
fi

# Also clean node_modules cache
if [ -d "node_modules/.cache" ]; then
    rm -rf node_modules/.cache
    echo -e "${GREEN}✅ Removed node_modules cache${NC}"
fi

# Step 4: Check dependencies
echo ""
echo "4️⃣  Checking dependencies..."
if [ -d "node_modules" ]; then
    echo -e "${GREEN}✅ node_modules exists${NC}"
else
    echo -e "${YELLOW}⚠️  node_modules not found, installing...${NC}"
    npm install
fi

# Step 5: Check for TypeScript errors
echo ""
echo "5️⃣  Checking for TypeScript errors..."
if npx tsc --noEmit 2>&1 | grep -q "error TS"; then
    echo -e "${RED}❌ TypeScript errors found${NC}"
    npx tsc --noEmit
    echo ""
    echo "Please fix the TypeScript errors above before continuing."
    exit 1
else
    echo -e "${GREEN}✅ No TypeScript errors${NC}"
fi

# Step 6: Check if port 3001 is available
echo ""
echo "6️⃣  Checking port availability..."
if lsof -Pi :3001 -sTCP:LISTEN -t >/dev/null 2>&1; then
    echo -e "${YELLOW}⚠️  Port 3001 is already in use${NC}"
    echo "   Killing existing process..."
    lsof -ti:3001 | xargs kill -9 2>/dev/null || true
    sleep 2
    echo -e "${GREEN}✅ Port 3001 is now available${NC}"
else
    echo -e "${GREEN}✅ Port 3001 is available${NC}"
fi

# Step 7: Start development server
echo ""
echo "7️⃣  Starting development server..."
echo ""
echo -e "${GREEN}🚀 Frontend will be available at: http://localhost:3001${NC}"
echo ""
echo "Press Ctrl+C to stop the server"
echo ""

# Start the dev server
npm run dev

