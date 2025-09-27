#!/bin/bash

echo "🤖 TESTE DE VALIDAÇÃO - AGENTES INTELIGENTES N8N"
echo "=================================================="

# Cores para output
GREEN='\033[0;32m'
RED='\033[0;31m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m' # No Color

# Função para testar endpoint
test_endpoint() {
    local name="$1"
    local url="$2"
    local data="$3"
    
    echo -e "\n${BLUE}🧪 Testando: $name${NC}"
    echo "URL: $url"
    echo "Data: $data"
    echo "---"
    
    response=$(curl -s -w "HTTP_CODE:%{http_code}" -X POST "$url" \
        -H "Content-Type: application/json" \
        -d "$data")
    
    http_code=$(echo "$response" | grep -o "HTTP_CODE:[0-9]*" | cut -d: -f2)
    body=$(echo "$response" | sed 's/HTTP_CODE:[0-9]*$//')
    
    if [ "$http_code" = "200" ]; then
        echo -e "${GREEN}✅ SUCESSO (HTTP $http_code)${NC}"
        echo "Resposta: $body" | jq . 2>/dev/null || echo "Resposta: $body"
    elif [ "$http_code" = "404" ]; then
        echo -e "${YELLOW}⚠️  WORKFLOW INATIVO (HTTP $http_code)${NC}"
        echo "Resposta: $body"
    else
        echo -e "${RED}❌ ERRO (HTTP $http_code)${NC}"
        echo "Resposta: $body"
    fi
}

echo -e "\n${YELLOW}📋 TESTANDO AGENTES ATUAIS${NC}"

# Teste 1: Router Agent Original (com problemas)
test_endpoint "Router Agent Original" \
    "https://n8n-moveup-u53084.vm.elestio.app/webhook/dibea-agent" \
    '{"userInput": "Quero cadastrar um novo cão chamado Rex"}'

# Teste 2: RAG Chatbot (requer auth)
test_endpoint "RAG Chatbot" \
    "https://n8n-moveup-u53084.vm.elestio.app/webhook/9ba11544-5c4e-4f91-818a-08a4ecb596c5" \
    '{"message": "Olá, como você funciona?"}'

echo -e "\n${YELLOW}🚀 TESTANDO NOVO ROUTER INTELIGENTE${NC}"

# Teste 3: Novo Router Inteligente
test_endpoint "Router Agent Inteligente" \
    "https://n8n-moveup-u53084.vm.elestio.app/webhook/dibea-intelligent-router" \
    '{"userMessage": "Quero cadastrar um novo cão chamado Rex", "context": {"sessionId": "test-123"}, "sessionId": "test-123"}'

echo -e "\n${YELLOW}🎯 TESTANDO DIFERENTES TIPOS DE MENSAGENS${NC}"

# Array de testes para diferentes agentes
declare -a test_messages=(
    '{"userMessage": "Preciso vacinar meu gato Luna", "context": {"sessionId": "test-procedure"}}'
    '{"userMessage": "Como fazer upload de um exame veterinário?", "context": {"sessionId": "test-document"}}'
    '{"userMessage": "João Silva quer adotar um animal", "context": {"sessionId": "test-tutor"}}'
    '{"userMessage": "Quantos animais foram adotados este mês?", "context": {"sessionId": "test-general"}}'
    '{"userMessage": "Olá, como você funciona?", "context": {"sessionId": "test-hello"}}'
)

declare -a test_names=(
    "Procedimento Veterinário"
    "Upload de Documento"
    "Processo de Adoção"
    "Relatório Geral"
    "Saudação Geral"
)

# Testa cada tipo de mensagem
for i in "${!test_messages[@]}"; do
    test_endpoint "${test_names[$i]}" \
        "https://n8n-moveup-u53084.vm.elestio.app/webhook/dibea-intelligent-router" \
        "${test_messages[$i]}"
done

echo -e "\n${BLUE}📊 RESUMO DOS TESTES${NC}"
echo "=================================="
echo "✅ Agentes que funcionaram: (verificar output acima)"
echo "⚠️  Agentes inativos: (verificar output acima)"
echo "❌ Agentes com erro: (verificar output acima)"

echo -e "\n${YELLOW}🔧 PRÓXIMOS PASSOS${NC}"
echo "1. Ativar workflows inativos no n8n"
echo "2. Configurar credenciais OpenAI se necessário"
echo "3. Testar integração com DIBEA API"
echo "4. Implementar agentes especializados"

echo -e "\n${GREEN}🎉 TESTE CONCLUÍDO!${NC}"
echo "Verifique os resultados acima para identificar quais agentes precisam de correção."
