#!/bin/bash

# ========================================
# DIBEA - Validador de Credenciais Supabase
# ========================================
# Valida todas as credenciais do Supabase

set -e

echo "🔍 DIBEA - Validador de Credenciais Supabase"
echo "=============================================="
echo ""

# Cores para output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m' # No Color

# Função para printar com cor
print_success() {
    echo -e "${GREEN}✅ $1${NC}"
}

print_error() {
    echo -e "${RED}❌ $1${NC}"
}

print_warning() {
    echo -e "${YELLOW}⚠️  $1${NC}"
}

print_info() {
    echo -e "${BLUE}ℹ️  $1${NC}"
}

# Contador de erros
ERRORS=0

# ========================================
# 1. Verificar arquivos .env
# ========================================
echo "1️⃣  Verificando arquivos .env..."
echo ""

# Backend .env
if [ -f "apps/backend/.env" ]; then
    print_success "Backend .env encontrado"
else
    print_error "Backend .env não encontrado"
    print_info "Execute: cp apps/backend/.env.example apps/backend/.env"
    ERRORS=$((ERRORS + 1))
fi

# Frontend .env.local
if [ -f "apps/frontend/.env.local" ]; then
    print_success "Frontend .env.local encontrado"
else
    print_error "Frontend .env.local não encontrado"
    print_info "Execute: cp apps/frontend/.env.example apps/frontend/.env.local"
    ERRORS=$((ERRORS + 1))
fi

echo ""

# ========================================
# 2. Verificar variáveis do Backend
# ========================================
echo "2️⃣  Verificando variáveis do Backend..."
echo ""

if [ -f "apps/backend/.env" ]; then
    # Carregar variáveis
    source apps/backend/.env 2>/dev/null || true
    
    # DATABASE_URL
    if [ ! -z "$DATABASE_URL" ]; then
        if [[ "$DATABASE_URL" == *"[YOUR_PASSWORD]"* ]] || [[ "$DATABASE_URL" == *"[PASSWORD]"* ]]; then
            print_error "DATABASE_URL: Senha não configurada"
            print_info "Substitua [YOUR_PASSWORD] pela senha real do Supabase"
            ERRORS=$((ERRORS + 1))
        else
            print_success "DATABASE_URL: Configurada"
        fi
    else
        print_error "DATABASE_URL: Não encontrada"
        ERRORS=$((ERRORS + 1))
    fi
    
    # SUPABASE_URL
    if [ ! -z "$SUPABASE_URL" ]; then
        if [[ "$SUPABASE_URL" == "https://xptonqqagxcpzlgndilj.supabase.co" ]]; then
            print_success "SUPABASE_URL: Correta"
        else
            print_warning "SUPABASE_URL: Valor inesperado"
            print_info "Esperado: https://xptonqqagxcpzlgndilj.supabase.co"
            print_info "Atual: $SUPABASE_URL"
        fi
    else
        print_error "SUPABASE_URL: Não encontrada"
        ERRORS=$((ERRORS + 1))
    fi
    
    # SUPABASE_ANON_KEY
    if [ ! -z "$SUPABASE_ANON_KEY" ]; then
        if [[ "$SUPABASE_ANON_KEY" == "[YOUR_ANON_KEY]"* ]] || [[ "$SUPABASE_ANON_KEY" == "[ANON_KEY]"* ]]; then
            print_error "SUPABASE_ANON_KEY: Não configurada"
            print_info "Obtenha em: https://app.supabase.com/project/xptonqqagxcpzlgndilj/settings/api"
            ERRORS=$((ERRORS + 1))
        else
            print_success "SUPABASE_ANON_KEY: Configurada"
        fi
    else
        print_error "SUPABASE_ANON_KEY: Não encontrada"
        ERRORS=$((ERRORS + 1))
    fi
    
    # SUPABASE_SERVICE_ROLE_KEY
    if [ ! -z "$SUPABASE_SERVICE_ROLE_KEY" ]; then
        if [[ "$SUPABASE_SERVICE_ROLE_KEY" == "[YOUR_SERVICE_ROLE_KEY]"* ]] || [[ "$SUPABASE_SERVICE_ROLE_KEY" == "[SERVICE_ROLE_KEY]"* ]]; then
            print_error "SUPABASE_SERVICE_ROLE_KEY: Não configurada"
            print_info "Obtenha em: https://app.supabase.com/project/xptonqqagxcpzlgndilj/settings/api"
            ERRORS=$((ERRORS + 1))
        else
            print_success "SUPABASE_SERVICE_ROLE_KEY: Configurada"
        fi
    else
        print_error "SUPABASE_SERVICE_ROLE_KEY: Não encontrada"
        ERRORS=$((ERRORS + 1))
    fi
fi

echo ""

# ========================================
# 3. Verificar variáveis do Frontend
# ========================================
echo "3️⃣  Verificando variáveis do Frontend..."
echo ""

if [ -f "apps/frontend/.env.local" ]; then
    # Carregar variáveis
    source apps/frontend/.env.local 2>/dev/null || true
    
    # NEXT_PUBLIC_SUPABASE_URL
    if [ ! -z "$NEXT_PUBLIC_SUPABASE_URL" ]; then
        if [[ "$NEXT_PUBLIC_SUPABASE_URL" == "https://xptonqqagxcpzlgndilj.supabase.co" ]]; then
            print_success "NEXT_PUBLIC_SUPABASE_URL: Correta"
        else
            print_warning "NEXT_PUBLIC_SUPABASE_URL: Valor inesperado"
            print_info "Esperado: https://xptonqqagxcpzlgndilj.supabase.co"
            print_info "Atual: $NEXT_PUBLIC_SUPABASE_URL"
        fi
    else
        print_error "NEXT_PUBLIC_SUPABASE_URL: Não encontrada"
        ERRORS=$((ERRORS + 1))
    fi
    
    # NEXT_PUBLIC_SUPABASE_ANON_KEY
    if [ ! -z "$NEXT_PUBLIC_SUPABASE_ANON_KEY" ]; then
        if [[ "$NEXT_PUBLIC_SUPABASE_ANON_KEY" == "[YOUR_ANON_KEY]"* ]] || [[ "$NEXT_PUBLIC_SUPABASE_ANON_KEY" == "[ANON_KEY]"* ]]; then
            print_error "NEXT_PUBLIC_SUPABASE_ANON_KEY: Não configurada"
            print_info "Obtenha em: https://app.supabase.com/project/xptonqqagxcpzlgndilj/settings/api"
            ERRORS=$((ERRORS + 1))
        else
            print_success "NEXT_PUBLIC_SUPABASE_ANON_KEY: Configurada"
        fi
    else
        print_error "NEXT_PUBLIC_SUPABASE_ANON_KEY: Não encontrada"
        ERRORS=$((ERRORS + 1))
    fi
fi

echo ""

# ========================================
# 4. Testar conexão (se possível)
# ========================================
echo "4️⃣  Testando conexão com Supabase..."
echo ""

if command -v curl &> /dev/null; then
    # Testar API
    HTTP_CODE=$(curl -s -o /dev/null -w "%{http_code}" "https://xptonqqagxcpzlgndilj.supabase.co/rest/v1/" \
        -H "apikey: $SUPABASE_ANON_KEY" 2>/dev/null || echo "000")
    
    if [ "$HTTP_CODE" = "200" ] || [ "$HTTP_CODE" = "404" ]; then
        print_success "API Supabase: Acessível"
    else
        print_warning "API Supabase: Código HTTP $HTTP_CODE"
        print_info "Verifique se a ANON_KEY está correta"
    fi
else
    print_warning "curl não encontrado - pulando teste de conexão"
fi

echo ""

# ========================================
# 5. Resumo
# ========================================
echo "=============================================="
echo "📊 Resumo da Validação"
echo "=============================================="
echo ""

if [ $ERRORS -eq 0 ]; then
    print_success "Todas as credenciais estão configuradas!"
    echo ""
    print_info "Próximos passos:"
    echo "  1. Teste a conexão: cd apps/backend && npx prisma db pull"
    echo "  2. Inicie o backend: cd apps/backend && npm run dev"
    echo "  3. Inicie o frontend: cd apps/frontend && npm run dev"
else
    print_error "Encontrados $ERRORS erro(s) de configuração"
    echo ""
    print_info "Consulte a documentação:"
    echo "  - docs/SUPABASE_CREDENTIALS_GUIDE.md"
    echo "  - docs/DIBEA_SUPABASE_REFERENCE.md"
    echo ""
    print_info "URLs úteis:"
    echo "  - API Keys: https://app.supabase.com/project/xptonqqagxcpzlgndilj/settings/api"
    echo "  - Database: https://app.supabase.com/project/xptonqqagxcpzlgndilj/settings/database"
fi

echo ""

exit $ERRORS

