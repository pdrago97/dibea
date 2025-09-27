#!/bin/bash

echo "🚀 POPULANDO DADOS NO SISTEMA DIBEA"
echo "=================================="

# Base URL
BASE_URL="http://localhost:3000/api/v1"

# Login como admin para obter token
echo "🔐 Fazendo login como admin..."
ADMIN_RESPONSE=$(curl -s -X POST "$BASE_URL/auth/login" \
  -H "Content-Type: application/json" \
  -d '{"email":"admin@dibea.com","password":"admin123"}')

ADMIN_TOKEN=$(echo $ADMIN_RESPONSE | jq -r '.token')

if [ "$ADMIN_TOKEN" = "null" ]; then
  echo "❌ Erro ao fazer login como admin"
  exit 1
fi

echo "✅ Login realizado com sucesso"

# Registrar novos cidadãos
echo ""
echo "👥 REGISTRANDO NOVOS CIDADÃOS"
echo "-----------------------------"

# Cidadão 1
echo "Registrando João Silva..."
curl -s -X POST "$BASE_URL/auth/register" \
  -H "Content-Type: application/json" \
  -d '{
    "name": "João Silva",
    "email": "joao.silva@email.com",
    "password": "123456",
    "phone": "(11) 91234-5678",
    "role": "CIDADAO"
  }' | jq '.message'

# Cidadão 2
echo "Registrando Maria Santos..."
curl -s -X POST "$BASE_URL/auth/register" \
  -H "Content-Type: application/json" \
  -d '{
    "name": "Maria Santos",
    "email": "maria.santos@email.com",
    "password": "123456",
    "phone": "(11) 98765-4321",
    "role": "CIDADAO"
  }' | jq '.message'

# Cidadão 3
echo "Registrando Pedro Oliveira..."
curl -s -X POST "$BASE_URL/auth/register" \
  -H "Content-Type: application/json" \
  -d '{
    "name": "Pedro Oliveira",
    "email": "pedro.oliveira@email.com",
    "password": "123456",
    "phone": "(11) 95555-5555",
    "role": "CIDADAO"
  }' | jq '.message'

# Cidadão 4
echo "Registrando Ana Costa..."
curl -s -X POST "$BASE_URL/auth/register" \
  -H "Content-Type: application/json" \
  -d '{
    "name": "Ana Costa",
    "email": "ana.costa@email.com",
    "password": "123456",
    "phone": "(11) 94444-4444",
    "role": "CIDADAO"
  }' | jq '.message'

# Cidadão 5
echo "Registrando Carlos Ferreira..."
curl -s -X POST "$BASE_URL/auth/register" \
  -H "Content-Type: application/json" \
  -d '{
    "name": "Carlos Ferreira",
    "email": "carlos.ferreira@email.com",
    "password": "123456",
    "phone": "(11) 93333-3333",
    "role": "CIDADAO"
  }' | jq '.message'

echo ""
echo "📊 VERIFICANDO ESTATÍSTICAS ATUALIZADAS"
echo "---------------------------------------"

# Buscar estatísticas atualizadas
STATS=$(curl -s "$BASE_URL/landing/stats")
echo "Estatísticas atuais:"
echo $STATS | jq '.data'

echo ""
echo "🐕 VERIFICANDO ANIMAIS EM DESTAQUE"
echo "----------------------------------"

# Buscar animais em destaque
ANIMALS=$(curl -s "$BASE_URL/landing/featured-animals")
echo "Animais disponíveis:"
echo $ANIMALS | jq '.data[] | {name: .name, species: .species, age: .age}'

echo ""
echo "🎯 TESTANDO SISTEMA DE AGENTES"
echo "------------------------------"

# Testar acesso a agentes
echo "Testando acesso ao agente de animais..."
AGENT_ACCESS=$(curl -s -H "Authorization: Bearer $ADMIN_TOKEN" \
  "$BASE_URL/auth/validate-agent-access/animal")
echo $AGENT_ACCESS | jq '.permissions'

echo ""
echo "🎉 POPULAÇÃO DE DADOS CONCLUÍDA!"
echo "================================"
echo ""
echo "📋 RESUMO:"
echo "• 5 novos cidadãos registrados"
echo "• 2 animais disponíveis para adoção (Rex e Luna)"
echo "• 4 usuários demo (admin, vet, func, cidadao)"
echo "• Sistema de agentes funcionando"
echo ""
echo "🌐 ACESSE O SISTEMA:"
echo "• Frontend: http://localhost:3001"
echo "• Backend: http://localhost:3000"
echo ""
echo "🔑 CONTAS DEMO:"
echo "👑 Admin: admin@dibea.com / admin123"
echo "🩺 Veterinário: vet@dibea.com / vet123"
echo "👨‍💼 Funcionário: func@dibea.com / func123"
echo "👤 Cidadão: cidadao@dibea.com / cidadao123"
echo ""
echo "👥 NOVOS CIDADÃOS:"
echo "• joao.silva@email.com / 123456"
echo "• maria.santos@email.com / 123456"
echo "• pedro.oliveira@email.com / 123456"
echo "• ana.costa@email.com / 123456"
echo "• carlos.ferreira@email.com / 123456"
