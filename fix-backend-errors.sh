#!/bin/bash

# Fix Backend TypeScript Errors
# This script fixes common schema mismatches

set -e

echo "🔧 Fixing Backend TypeScript Errors"
echo "===================================="
echo ""

cd apps/backend

# Colors
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
NC='\033[0m'

echo "1️⃣  Fixing isActive -> active..."

# Fix authController.ts
sed -i 's/isActive: true/active: true/g' src/controllers/authController.ts
sed -i 's/isActive: true/active: true/g' src/routes/admin.ts
sed -i 's/isActive: true/active: true/g' src/scripts/seedAdminUsers.ts

echo -e "${GREEN}✅ Fixed isActive -> active${NC}"
echo ""

echo "2️⃣  Fixing PENDENTE -> SOLICITADA (AdoptionStatus)..."

# Fix seed scripts
sed -i 's/"PENDENTE"/"SOLICITADA"/g' src/scripts/seedNotifications.ts
sed -i 's/"PENDENTE"/"SOLICITADA"/g' src/services/systemAnalytics.ts

echo -e "${GREEN}✅ Fixed AdoptionStatus${NC}"
echo ""

echo "3️⃣  Regenerating Prisma Client..."

npx prisma generate

echo -e "${GREEN}✅ Prisma Client regenerated${NC}"
echo ""

echo "4️⃣  Testing TypeScript compilation..."

if npm run build; then
    echo ""
    echo -e "${GREEN}✅ Backend compiles successfully!${NC}"
    echo ""
else
    echo ""
    echo -e "${RED}❌ Still has compilation errors${NC}"
    echo ""
    echo "Remaining errors need manual fixing."
    echo "Check the output above for details."
    exit 1
fi

echo "✅ All fixes applied successfully!"
echo ""
echo "Next steps:"
echo "  1. Run: docker-compose up --build -d"
echo "  2. Open: http://localhost:3001"
echo ""

