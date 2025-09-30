#!/bin/bash

# DIBEA - Script de Teste de Integração
# Este script testa a integração completa N8N + Supabase

echo "🧪 DIBEA - Teste de Integração"
echo "================================"
echo ""

# Cores
GREEN='\033[0;32m'
RED='\033[0;31m'
YELLOW='\033[1;33m'
NC='\033[0m' # No Color

# Configurações
SUPABASE_URL="https://xptonqqagxcpzlgndilj.supabase.co"
N8N_WEBHOOK="https://n8n-moveup-u53084.vm.elestio.app/webhook-test/d0fff20e-124c-49f3-8ccf-a615504c5fc1"

# Pedir Service Role Key
echo "📝 Cole sua Supabase Service Role Key:"
echo "(Dashboard → Settings → API → service_role key)"
read -s SERVICE_ROLE_KEY
echo ""

# Teste 1: Verificar Edge Function search-animals
echo "🔍 Teste 1: Verificar Edge Function search-animals"
echo "---------------------------------------------------"

RESPONSE=$(curl -s -X POST \
  "$SUPABASE_URL/functions/v1/search-animals" \
  -H "Authorization: Bearer $SERVICE_ROLE_KEY" \
  -H "Content-Type: application/json" \
  -H "X-User-Phone: +5511999999999" \
  -d '{"especie": "CANINO", "status": "DISPONIVEL"}')

if echo "$RESPONSE" | grep -q '"success":true'; then
    echo -e "${GREEN}✅ Edge Function funcionando!${NC}"
    echo "Resposta: $RESPONSE" | jq '.' 2>/dev/null || echo "$RESPONSE"
else
    echo -e "${RED}❌ Edge Function com erro!${NC}"
    echo "Resposta: $RESPONSE"
fi
echo ""

# Teste 2: Verificar tabela animais
echo "🔍 Teste 2: Verificar tabela animais"
echo "-------------------------------------"

RESPONSE=$(curl -s -X GET \
  "$SUPABASE_URL/rest/v1/animais?select=id,nome,especie,porte&status=eq.DISPONIVEL&limit=5" \
  -H "apikey: $SERVICE_ROLE_KEY" \
  -H "Authorization: Bearer $SERVICE_ROLE_KEY")

if echo "$RESPONSE" | grep -q 'Rex\|Luna\|Mia'; then
    echo -e "${GREEN}✅ Dados encontrados!${NC}"
    echo "Animais: $RESPONSE" | jq '.' 2>/dev/null || echo "$RESPONSE"
else
    echo -e "${RED}❌ Sem dados ou erro!${NC}"
    echo "Resposta: $RESPONSE"
fi
echo ""

# Teste 3: Testar Webhook N8N
echo "🔍 Teste 3: Testar Webhook N8N"
echo "-------------------------------"

RESPONSE=$(curl -s -X POST \
  "$N8N_WEBHOOK" \
  -H "Content-Type: application/json" \
  -d '{
    "sessionId": "+5511999999999",
    "chatInput": "Quero adotar um cachorro"
  }')

if echo "$RESPONSE" | grep -q 'Rex\|Luna\|cachorro'; then
    echo -e "${GREEN}✅ N8N funcionando!${NC}"
    echo "Resposta: $RESPONSE" | jq '.' 2>/dev/null || echo "$RESPONSE"
else
    echo -e "${YELLOW}⚠️  N8N pode precisar de ajustes${NC}"
    echo "Resposta: $RESPONSE"
fi
echo ""

# Teste 4: Testar busca de gatos
echo "🔍 Teste 4: Testar busca de gatos"
echo "----------------------------------"

RESPONSE=$(curl -s -X POST \
  "$N8N_WEBHOOK" \
  -H "Content-Type: application/json" \
  -d '{
    "sessionId": "+5511999999999",
    "chatInput": "Tem gatos disponíveis?"
  }')

if echo "$RESPONSE" | grep -q 'Mia\|gato'; then
    echo -e "${GREEN}✅ Busca de gatos funcionando!${NC}"
    echo "Resposta: $RESPONSE" | jq '.' 2>/dev/null || echo "$RESPONSE"
else
    echo -e "${YELLOW}⚠️  Busca de gatos pode precisar de ajustes${NC}"
    echo "Resposta: $RESPONSE"
fi
echo ""

# Resumo
echo "================================"
echo "📊 RESUMO DOS TESTES"
echo "================================"
echo ""
echo "✅ = Funcionando"
echo "❌ = Com erro"
echo "⚠️  = Precisa verificar"
echo ""
echo "Próximos passos:"
echo "1. Se todos os testes passaram: Implementar mais Edge Functions"
echo "2. Se houver erros: Verificar logs no Supabase e N8N"
echo "3. Consultar MANUAL_SETUP_GUIDE.md para troubleshooting"
echo ""

