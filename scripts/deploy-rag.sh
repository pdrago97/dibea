#!/bin/bash

# ========================================
# DEPLOY RAG UNIVERSAL - DIBEA
# ========================================
# Script para fazer deploy da Edge Function de RAG no Supabase

set -e

echo "🚀 Iniciando deploy da Edge Function Universal RAG..."

# Cores para output
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
RED='\033[0;31m'
NC='\033[0m' # No Color

# Verificar se está no diretório correto
if [ ! -d "supabase/functions/universal-rag" ]; then
  echo -e "${RED}❌ Erro: Diretório supabase/functions/universal-rag não encontrado${NC}"
  echo "Execute este script a partir da raiz do projeto: /Users/pedroreichow/projects/dibea"
  exit 1
fi

# Verificar se Supabase CLI está instalado
if ! command -v supabase &> /dev/null; then
  echo -e "${RED}❌ Supabase CLI não está instalado${NC}"
  echo "Instale com: npm install -g supabase"
  exit 1
fi

# Verificar se está logado no Supabase
echo -e "${YELLOW}🔐 Verificando autenticação...${NC}"
if ! supabase projects list &> /dev/null; then
  echo -e "${RED}❌ Você não está logado no Supabase${NC}"
  echo "Execute: supabase login"
  exit 1
fi

# Link do projeto (se ainda não estiver linkado)
echo -e "${YELLOW}🔗 Linkando projeto...${NC}"
supabase link --project-ref xptonqqagxcpzlgndilj || true

# Deploy da função
echo -e "${YELLOW}📦 Fazendo deploy da função universal-rag...${NC}"
supabase functions deploy universal-rag --no-verify-jwt

# Verificar se o deploy foi bem-sucedido
if [ $? -eq 0 ]; then
  echo -e "${GREEN}✅ Deploy realizado com sucesso!${NC}"
  echo ""
  echo "📍 URL da função:"
  echo "https://xptonqqagxcpzlgndilj.supabase.co/functions/v1/universal-rag"
  echo ""
  echo "🧪 Teste com curl:"
  echo "curl -X POST \\"
  echo "  https://xptonqqagxcpzlgndilj.supabase.co/functions/v1/universal-rag \\"
  echo "  -H 'Authorization: Bearer YOUR_SERVICE_ROLE_KEY' \\"
  echo "  -H 'Content-Type: application/json' \\"
  echo "  -d '{\"query\": \"cachorro\", \"tables\": [\"animais\"], \"limit\": 10}'"
  echo ""
  echo -e "${GREEN}🎉 Próximos passos:${NC}"
  echo "1. Configure o N8N conforme o guia: n8n/GUIA_IMPLEMENTACAO_RAG.md"
  echo "2. Teste a função no N8N"
  echo "3. Integre no frontend usando o hook useUniversalRAG"
else
  echo -e "${RED}❌ Erro no deploy${NC}"
  exit 1
fi

