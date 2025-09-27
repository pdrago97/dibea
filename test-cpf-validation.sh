#!/bin/bash

# 🧪 TESTE DE VALIDAÇÃO DE CPF - DIBEA AGENTS
# Este script testa a validação real de CPF implementada

echo "🚀 Iniciando testes de validação de CPF..."
echo "================================================"

# Configurações
BASE_URL="http://localhost:3000/api/v1"
CONTENT_TYPE="Content-Type: application/json"

# Função para fazer login e obter token
get_token() {
    local email=$1
    local password=$2
    
    echo "🔐 Fazendo login para $email..."
    
    TOKEN=$(curl -s -X POST "$BASE_URL/auth/login" \
        -H "$CONTENT_TYPE" \
        -d "{\"email\": \"$email\", \"password\": \"$password\"}" \
        | jq -r '.token // empty')
    
    if [ -z "$TOKEN" ] || [ "$TOKEN" = "null" ]; then
        echo "❌ Erro ao obter token para $email"
        return 1
    fi
    
    echo "✅ Token obtido com sucesso"
    return 0
}

# Função para testar validação de CPF
test_cpf() {
    local cpf=$1
    local description=$2
    local expected_valid=$3
    
    echo ""
    echo "📋 Testando: $description"
    echo "CPF: $cpf"
    echo "Esperado: $([ "$expected_valid" = "true" ] && echo "VÁLIDO" || echo "INVÁLIDO")"
    
    response=$(curl -s -X POST "$BASE_URL/agents/validate-cpf" \
        -H "$CONTENT_TYPE" \
        -H "Authorization: Bearer $TOKEN" \
        -d "{\"cpf\": \"$cpf\"}")
    
    echo "Resposta: $response"
    
    # Verificar se a resposta está correta
    actual_valid=$(echo "$response" | jq -r '.valid // false')
    success=$(echo "$response" | jq -r '.success // false')
    
    if [ "$success" = "true" ] && [ "$actual_valid" = "$expected_valid" ]; then
        echo "✅ PASSOU - Resultado correto"
    else
        echo "❌ FALHOU - Resultado incorreto"
        echo "   Esperado: $expected_valid"
        echo "   Obtido: $actual_valid"
    fi
    
    echo "----------------------------------------"
}

# Função para criar usuário de teste
create_test_user() {
    echo "👤 Criando usuário de teste..."
    
    curl -s -X POST "$BASE_URL/auth/register" \
        -H "$CONTENT_TYPE" \
        -d '{
            "name": "Funcionário Teste",
            "email": "funcionario.teste@dibea.com",
            "password": "teste123",
            "role": "FUNCIONARIO",
            "municipalityId": "1"
        }' > /dev/null
    
    echo "✅ Usuário de teste criado (ou já existe)"
}

# Função principal
main() {
    echo "🏗️ Preparando ambiente de teste..."
    
    # Criar usuário de teste
    create_test_user
    
    # Fazer login
    if ! get_token "funcionario.teste@dibea.com" "teste123"; then
        echo "❌ Não foi possível fazer login. Verifique se o backend está rodando."
        exit 1
    fi
    
    echo ""
    echo "🧪 Iniciando testes de CPF..."
    echo "================================================"
    
    # Testes de CPFs válidos
    echo "📊 TESTANDO CPFs VÁLIDOS"
    test_cpf "123.456.789-09" "CPF válido com formatação" "true"
    test_cpf "12345678909" "CPF válido sem formatação" "true"
    test_cpf "987.654.321-00" "CPF válido alternativo" "true"
    
    # Testes de CPFs inválidos
    echo ""
    echo "📊 TESTANDO CPFs INVÁLIDOS"
    test_cpf "111.111.111-11" "CPF com dígitos repetidos" "false"
    test_cpf "123.456.789-00" "CPF com dígito verificador incorreto" "false"
    test_cpf "000.000.000-00" "CPF com zeros" "false"
    test_cpf "123.456.789" "CPF incompleto" "false"
    test_cpf "123.456.789-123" "CPF com dígitos extras" "false"
    test_cpf "abc.def.ghi-jk" "CPF com letras" "false"
    test_cpf "" "CPF vazio" "false"
    
    echo ""
    echo "🎯 RESUMO DOS TESTES"
    echo "================================================"
    echo "✅ Testes de validação de CPF concluídos!"
    echo "📋 Verifique os resultados acima"
    echo "🔍 CPFs válidos devem retornar valid: true"
    echo "🚫 CPFs inválidos devem retornar valid: false"
    echo ""
    echo "💡 PRÓXIMOS PASSOS:"
    echo "1. Testar integração com N8N workflows"
    echo "2. Testar validação com API da Receita Federal"
    echo "3. Testar fluxo completo de cadastro de tutor"
}

# Verificar se jq está instalado
if ! command -v jq &> /dev/null; then
    echo "❌ jq não está instalado. Instale com: brew install jq (macOS) ou apt-get install jq (Ubuntu)"
    exit 1
fi

# Verificar se curl está instalado
if ! command -v curl &> /dev/null; then
    echo "❌ curl não está instalado."
    exit 1
fi

# Executar testes
main

echo "🏁 Testes finalizados!"
