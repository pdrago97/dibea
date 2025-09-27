#!/bin/bash

# 🎯 TESTE COMPLETO: LANDING PAGE E SISTEMA DE AUTO-REGISTRO
# Este script testa todas as funcionalidades implementadas

echo "🚀 INICIANDO TESTES DO SISTEMA DIBEA"
echo "======================================"

# Cores para output
RED='\033[0;31m'
GREEN='\033[0;32m'
BLUE='\033[0;34m'
YELLOW='\033[1;33m'
NC='\033[0m' # No Color

# Configurações
BACKEND_URL="http://localhost:3000"
FRONTEND_URL="http://localhost:3001"

echo -e "${BLUE}📊 1. TESTANDO APIS DA LANDING PAGE${NC}"
echo "----------------------------------------"

# Teste 1: Stats da Landing Page
echo -e "${YELLOW}Testando GET /api/v1/landing/stats...${NC}"
STATS_RESPONSE=$(curl -s -w "%{http_code}" -o /tmp/stats_response.json "$BACKEND_URL/api/v1/landing/stats")
STATS_CODE="${STATS_RESPONSE: -3}"

if [ "$STATS_CODE" = "200" ]; then
    echo -e "${GREEN}✅ Stats API funcionando${NC}"
    echo "📈 Dados retornados:"
    cat /tmp/stats_response.json | jq '.data' 2>/dev/null || cat /tmp/stats_response.json
else
    echo -e "${RED}❌ Stats API falhou (HTTP $STATS_CODE)${NC}"
fi

echo ""

# Teste 2: Animais em Destaque
echo -e "${YELLOW}Testando GET /api/v1/landing/featured-animals...${NC}"
ANIMALS_RESPONSE=$(curl -s -w "%{http_code}" -o /tmp/animals_response.json "$BACKEND_URL/api/v1/landing/featured-animals")
ANIMALS_CODE="${ANIMALS_RESPONSE: -3}"

if [ "$ANIMALS_CODE" = "200" ]; then
    echo -e "${GREEN}✅ Featured Animals API funcionando${NC}"
    echo "🐕 Animais retornados:"
    cat /tmp/animals_response.json | jq '.data[].name' 2>/dev/null || cat /tmp/animals_response.json
else
    echo -e "${RED}❌ Featured Animals API falhou (HTTP $ANIMALS_CODE)${NC}"
fi

echo ""
echo -e "${BLUE}🔐 2. TESTANDO SISTEMA DE REGISTRO${NC}"
echo "----------------------------------------"

# Teste 3: Registro de Cidadão
echo -e "${YELLOW}Testando POST /api/v1/auth/register (Cidadão)...${NC}"

# Dados de teste para registro
REGISTER_DATA='{
  "name": "João Silva Teste",
  "email": "joao.teste@example.com",
  "password": "senha123",
  "phone": "(11) 99999-9999",
  "zipCode": "01310-100",
  "role": "CIDADAO"
}'

REGISTER_RESPONSE=$(curl -s -w "%{http_code}" -o /tmp/register_response.json \
  -H "Content-Type: application/json" \
  -d "$REGISTER_DATA" \
  "$BACKEND_URL/api/v1/auth/register")

REGISTER_CODE="${REGISTER_RESPONSE: -3}"

if [ "$REGISTER_CODE" = "201" ]; then
    echo -e "${GREEN}✅ Registro de cidadão funcionando${NC}"
    echo "👤 Usuário criado:"
    cat /tmp/register_response.json | jq '.user.name' 2>/dev/null || echo "Usuário criado com sucesso"
    
    # Extrair token para próximos testes
    TOKEN=$(cat /tmp/register_response.json | jq -r '.token' 2>/dev/null)
    
elif [ "$REGISTER_CODE" = "400" ]; then
    echo -e "${YELLOW}⚠️  Usuário já existe (esperado em testes repetidos)${NC}"
    cat /tmp/register_response.json | jq '.message' 2>/dev/null || cat /tmp/register_response.json
else
    echo -e "${RED}❌ Registro falhou (HTTP $REGISTER_CODE)${NC}"
    cat /tmp/register_response.json
fi

echo ""

# Teste 4: Login
echo -e "${YELLOW}Testando POST /api/v1/auth/login...${NC}"

LOGIN_DATA='{
  "email": "joao.teste@example.com",
  "password": "senha123"
}'

LOGIN_RESPONSE=$(curl -s -w "%{http_code}" -o /tmp/login_response.json \
  -H "Content-Type: application/json" \
  -d "$LOGIN_DATA" \
  "$BACKEND_URL/api/v1/auth/login")

LOGIN_CODE="${LOGIN_RESPONSE: -3}"

if [ "$LOGIN_CODE" = "200" ]; then
    echo -e "${GREEN}✅ Login funcionando${NC}"
    echo "🔑 Token gerado:"
    cat /tmp/login_response.json | jq '.token' 2>/dev/null | head -c 50
    echo "..."
    
    # Usar token do login para próximos testes
    TOKEN=$(cat /tmp/login_response.json | jq -r '.token' 2>/dev/null)
else
    echo -e "${RED}❌ Login falhou (HTTP $LOGIN_CODE)${NC}"
    cat /tmp/login_response.json
fi

echo ""
echo -e "${BLUE}🛡️ 3. TESTANDO GUARDRAILS E SEGURANÇA${NC}"
echo "----------------------------------------"

if [ ! -z "$TOKEN" ]; then
    # Teste 5: Validação de Acesso a Agentes
    echo -e "${YELLOW}Testando acesso a agentes com token válido...${NC}"
    
    AGENT_ACCESS_RESPONSE=$(curl -s -w "%{http_code}" -o /tmp/agent_access_response.json \
      -H "Authorization: Bearer $TOKEN" \
      "$BACKEND_URL/api/v1/auth/validate-agent-access/animal")
    
    AGENT_ACCESS_CODE="${AGENT_ACCESS_RESPONSE: -3}"
    
    if [ "$AGENT_ACCESS_CODE" = "200" ]; then
        echo -e "${GREEN}✅ Validação de acesso a agentes funcionando${NC}"
        echo "🔒 Permissões:"
        cat /tmp/agent_access_response.json | jq '.permissions' 2>/dev/null || cat /tmp/agent_access_response.json
    else
        echo -e "${RED}❌ Validação de acesso falhou (HTTP $AGENT_ACCESS_CODE)${NC}"
        cat /tmp/agent_access_response.json
    fi
else
    echo -e "${YELLOW}⚠️  Pulando teste de guardrails (sem token válido)${NC}"
fi

echo ""
echo -e "${BLUE}🌐 4. TESTANDO FRONTEND${NC}"
echo "----------------------------------------"

# Teste 6: Landing Page
echo -e "${YELLOW}Testando acesso à Landing Page...${NC}"
FRONTEND_RESPONSE=$(curl -s -w "%{http_code}" -o /dev/null "$FRONTEND_URL/")
FRONTEND_CODE="${FRONTEND_RESPONSE: -3}"

if [ "$FRONTEND_CODE" = "200" ]; then
    echo -e "${GREEN}✅ Landing Page acessível${NC}"
    echo "🏠 URL: $FRONTEND_URL/"
else
    echo -e "${RED}❌ Landing Page inacessível (HTTP $FRONTEND_CODE)${NC}"
fi

# Teste 7: Página de Registro
echo -e "${YELLOW}Testando acesso à página de registro...${NC}"
REGISTER_PAGE_RESPONSE=$(curl -s -w "%{http_code}" -o /dev/null "$FRONTEND_URL/auth/register")
REGISTER_PAGE_CODE="${REGISTER_PAGE_RESPONSE: -3}"

if [ "$REGISTER_PAGE_CODE" = "200" ]; then
    echo -e "${GREEN}✅ Página de registro acessível${NC}"
    echo "📝 URL: $FRONTEND_URL/auth/register"
else
    echo -e "${RED}❌ Página de registro inacessível (HTTP $REGISTER_PAGE_CODE)${NC}"
fi

# Teste 8: Página de Login
echo -e "${YELLOW}Testando acesso à página de login...${NC}"
LOGIN_PAGE_RESPONSE=$(curl -s -w "%{http_code}" -o /dev/null "$FRONTEND_URL/auth/login")
LOGIN_PAGE_CODE="${LOGIN_PAGE_RESPONSE: -3}"

if [ "$LOGIN_PAGE_CODE" = "200" ]; then
    echo -e "${GREEN}✅ Página de login acessível${NC}"
    echo "🔐 URL: $FRONTEND_URL/auth/login"
else
    echo -e "${RED}❌ Página de login inacessível (HTTP $LOGIN_PAGE_CODE)${NC}"
fi

echo ""
echo -e "${BLUE}📋 5. RESUMO DOS TESTES${NC}"
echo "======================================"

# Contadores
TOTAL_TESTS=8
PASSED_TESTS=0

# Verificar resultados
[ "$STATS_CODE" = "200" ] && ((PASSED_TESTS++))
[ "$ANIMALS_CODE" = "200" ] && ((PASSED_TESTS++))
[ "$REGISTER_CODE" = "201" ] || [ "$REGISTER_CODE" = "400" ] && ((PASSED_TESTS++))
[ "$LOGIN_CODE" = "200" ] && ((PASSED_TESTS++))
[ "$AGENT_ACCESS_CODE" = "200" ] && ((PASSED_TESTS++))
[ "$FRONTEND_CODE" = "200" ] && ((PASSED_TESTS++))
[ "$REGISTER_PAGE_CODE" = "200" ] && ((PASSED_TESTS++))
[ "$LOGIN_PAGE_CODE" = "200" ] && ((PASSED_TESTS++))

echo -e "${GREEN}✅ Testes Passaram: $PASSED_TESTS/$TOTAL_TESTS${NC}"

if [ $PASSED_TESTS -eq $TOTAL_TESTS ]; then
    echo -e "${GREEN}🎉 TODOS OS TESTES PASSARAM!${NC}"
    echo ""
    echo -e "${BLUE}🚀 SISTEMA PRONTO PARA USO:${NC}"
    echo "• Landing Page: $FRONTEND_URL/"
    echo "• Registro: $FRONTEND_URL/auth/register"
    echo "• Login: $FRONTEND_URL/auth/login"
    echo "• Chat IA: $FRONTEND_URL/agents/chat"
    echo "• Dashboard Cidadão: $FRONTEND_URL/citizen/dashboard"
else
    echo -e "${YELLOW}⚠️  Alguns testes falharam. Verifique os logs acima.${NC}"
fi

echo ""
echo -e "${BLUE}📖 PRÓXIMOS PASSOS SUGERIDOS:${NC}"
echo "1. Acesse a landing page e teste o fluxo completo"
echo "2. Registre um novo usuário cidadão"
echo "3. Faça login e explore o dashboard"
echo "4. Teste o chat com agentes IA"
echo "5. Configure dados reais no banco de dados"

# Limpeza
rm -f /tmp/stats_response.json /tmp/animals_response.json /tmp/register_response.json /tmp/login_response.json /tmp/agent_access_response.json

echo ""
echo -e "${GREEN}✨ Teste concluído!${NC}"
