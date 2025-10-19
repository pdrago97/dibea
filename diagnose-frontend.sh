#!/bin/bash

# DIBEA Frontend Diagnostic Script
# This script diagnoses frontend build issues

set -e

echo "🔍 DIBEA Frontend Diagnostic Tool"
echo "=================================="
echo ""

# Colors
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m'

cd apps/frontend

echo "📁 Working directory: $(pwd)"
echo ""

# Check 1: Node and npm versions
echo "1️⃣  Checking Node.js and npm versions..."
echo "   Node: $(node --version)"
echo "   npm: $(npm --version)"
echo ""

# Check 2: Package.json exists
echo "2️⃣  Checking package.json..."
if [ -f "package.json" ]; then
    echo -e "${GREEN}✅ package.json exists${NC}"
else
    echo -e "${RED}❌ package.json not found${NC}"
    exit 1
fi
echo ""

# Check 3: Dependencies installed
echo "3️⃣  Checking dependencies..."
if [ -d "node_modules" ]; then
    echo -e "${GREEN}✅ node_modules exists${NC}"
    
    # Check specific packages
    echo "   Checking critical packages:"
    
    if [ -d "node_modules/next" ]; then
        echo -e "   ${GREEN}✅ next${NC}"
    else
        echo -e "   ${RED}❌ next not installed${NC}"
    fi
    
    if [ -d "node_modules/tailwindcss" ]; then
        echo -e "   ${GREEN}✅ tailwindcss${NC}"
    else
        echo -e "   ${RED}❌ tailwindcss not installed${NC}"
    fi
    
    if [ -d "node_modules/postcss" ]; then
        echo -e "   ${GREEN}✅ postcss${NC}"
    else
        echo -e "   ${RED}❌ postcss not installed${NC}"
    fi
    
    if [ -d "node_modules/autoprefixer" ]; then
        echo -e "   ${GREEN}✅ autoprefixer${NC}"
    else
        echo -e "   ${RED}❌ autoprefixer not installed${NC}"
    fi
else
    echo -e "${RED}❌ node_modules not found${NC}"
    echo "   Run: npm install"
fi
echo ""

# Check 4: Configuration files
echo "4️⃣  Checking configuration files..."

if [ -f "next.config.js" ]; then
    echo -e "${GREEN}✅ next.config.js${NC}"
else
    echo -e "${RED}❌ next.config.js missing${NC}"
fi

if [ -f "tailwind.config.js" ]; then
    echo -e "${GREEN}✅ tailwind.config.js${NC}"
else
    echo -e "${RED}❌ tailwind.config.js missing${NC}"
fi

if [ -f "postcss.config.js" ]; then
    echo -e "${GREEN}✅ postcss.config.js${NC}"
    echo "   Content:"
    cat postcss.config.js | head -10
else
    echo -e "${RED}❌ postcss.config.js missing${NC}"
fi

if [ -f "tsconfig.json" ]; then
    echo -e "${GREEN}✅ tsconfig.json${NC}"
else
    echo -e "${RED}❌ tsconfig.json missing${NC}"
fi
echo ""

# Check 5: Source files
echo "5️⃣  Checking source files..."

if [ -f "src/app/globals.css" ]; then
    echo -e "${GREEN}✅ src/app/globals.css${NC}"
    echo "   First 5 lines:"
    head -5 src/app/globals.css
else
    echo -e "${RED}❌ src/app/globals.css missing${NC}"
fi

if [ -f "src/app/layout.tsx" ]; then
    echo -e "${GREEN}✅ src/app/layout.tsx${NC}"
else
    echo -e "${RED}❌ src/app/layout.tsx missing${NC}"
fi

if [ -f "src/app/page.tsx" ]; then
    echo -e "${GREEN}✅ src/app/page.tsx${NC}"
else
    echo -e "${RED}❌ src/app/page.tsx missing${NC}"
fi
echo ""

# Check 6: Environment variables
echo "6️⃣  Checking environment variables..."
if [ -f ".env.local" ]; then
    echo -e "${GREEN}✅ .env.local exists${NC}"
    echo "   Variables:"
    grep "^NEXT_PUBLIC" .env.local | sed 's/=.*/=***/' || echo "   No NEXT_PUBLIC variables"
else
    echo -e "${YELLOW}⚠️  .env.local not found${NC}"
fi
echo ""

# Check 7: Build artifacts
echo "7️⃣  Checking build artifacts..."
if [ -d ".next" ]; then
    echo -e "${YELLOW}⚠️  .next directory exists (may need cleaning)${NC}"
    echo "   Size: $(du -sh .next 2>/dev/null | cut -f1)"
else
    echo -e "${GREEN}✅ No .next directory (clean state)${NC}"
fi

if [ -d "node_modules/.cache" ]; then
    echo -e "${YELLOW}⚠️  node_modules/.cache exists (may need cleaning)${NC}"
else
    echo -e "${GREEN}✅ No cache directory${NC}"
fi
echo ""

# Check 8: Port availability
echo "8️⃣  Checking port 3001..."
if lsof -Pi :3001 -sTCP:LISTEN -t >/dev/null 2>&1; then
    echo -e "${YELLOW}⚠️  Port 3001 is in use${NC}"
    echo "   Process:"
    lsof -Pi :3001 -sTCP:LISTEN 2>/dev/null | grep -v COMMAND || echo "   Unable to identify"
else
    echo -e "${GREEN}✅ Port 3001 is available${NC}"
fi
echo ""

# Summary
echo "📊 Summary"
echo "=========="
echo ""
echo "Recommended actions:"
echo ""

# Determine what needs to be done
NEEDS_INSTALL=false
NEEDS_CLEAN=false

if [ ! -d "node_modules" ] || [ ! -d "node_modules/next" ]; then
    NEEDS_INSTALL=true
fi

if [ -d ".next" ] || [ -d "node_modules/.cache" ]; then
    NEEDS_CLEAN=true
fi

if [ "$NEEDS_CLEAN" = true ]; then
    echo -e "${YELLOW}1. Clean build artifacts:${NC}"
    echo "   rm -rf .next node_modules/.cache"
    echo ""
fi

if [ "$NEEDS_INSTALL" = true ]; then
    echo -e "${YELLOW}2. Install dependencies:${NC}"
    echo "   npm install"
    echo ""
fi

echo -e "${GREEN}3. Start development server:${NC}"
echo "   npm run dev"
echo ""

echo "Or run the automated fix script:"
echo -e "${BLUE}   ./fix-frontend.sh${NC}"
echo ""

# Offer to run fixes
echo "Would you like to run the fixes automatically? (y/n)"
read -r response

if [[ "$response" =~ ^[Yy]$ ]]; then
    echo ""
    echo "🔧 Running automated fixes..."
    echo ""
    
    if [ "$NEEDS_CLEAN" = true ]; then
        echo "Cleaning build artifacts..."
        rm -rf .next node_modules/.cache
        echo -e "${GREEN}✅ Cleaned${NC}"
    fi
    
    if [ "$NEEDS_INSTALL" = true ]; then
        echo "Installing dependencies..."
        npm install
        echo -e "${GREEN}✅ Installed${NC}"
    fi
    
    echo ""
    echo -e "${GREEN}🎉 Fixes applied!${NC}"
    echo ""
    echo "Starting development server..."
    npm run dev
else
    echo ""
    echo "No fixes applied. Run the commands manually when ready."
fi

