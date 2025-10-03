#!/bin/bash

# Script para configurar buckets do Supabase Storage

echo "🚀 Configurando Supabase Storage..."

# Verificar se as variáveis de ambiente estão definidas
if [ -z "$NEXT_PUBLIC_SUPABASE_URL" ] || [ -z "$SUPABASE_SERVICE_ROLE_KEY" ]; then
    echo "❌ Variáveis de ambiente não encontradas"
    echo "Certifique-se de configurar:"
    echo "  NEXT_PUBLIC_SUPABASE_URL"
    echo "  SUPABASE_SERVICE_ROLE_KEY"
    exit 1
fi

echo "📦 Criando buckets do Supabase Storage..."

# Usar a API do Supabase para criar os buckets
curl -X POST "$NEXT_PUBLIC_SUPABASE_URL/rest/v1/storage/buckets" \
  -H "Authorization: Bearer $SUPABASE_SERVICE_ROLE_KEY" \
  -H "Content-Type: application/json" \
  -d '{
    "name": "animals",
    "public": true,
    "file_size_limit": 5242880,
    "allowed_mime_types": ["image/jpeg", "image/png", "image/webp"]
  }'

echo ""

curl -X POST "$NEXT_PUBLIC_SUPABASE_URL/rest/v1/storage/buckets" \
  -H "Authorization: Bearer $SUPABASE_SERVICE_ROLE_KEY" \
  -H "Content-Type: application/json" \
  -d '{
    "name": "documents",
    "public": false,
    "file_size_limit": 10485760,
    "allowed_mime_types": ["application/pdf", "image/jpeg", "image/png"]
  }'

echo ""

curl -X POST "$NEXT_PUBLIC_SUPABASE_URL/rest/v1/storage/buckets" \
  -H "Authorization: Bearer $SUPABASE_SERVICE_ROLE_KEY" \
  -H "Content-Type: application/json" \
  -d '{
    "name": "profiles",
    "public": true,
    "file_size_limit": 2097152,
    "allowed_mime_types": ["image/jpeg", "image/png", "image/webp"]
  }'

echo ""

echo "✅ Configuração do Supabase Storage concluída!"
echo ""
echo "📋 Buckets criados:"
echo "  • animals (público) - Fotos de animais"
echo "  • documents (privado) - Documentos de adoção"
echo "  • profiles (público) - Fotos de perfil"
echo ""
echo "🔧 Para configurar as políticas RLS, execute:"
echo "   npx supabase migration up"
echo ""