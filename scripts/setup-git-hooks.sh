#!/bin/bash

# =====================================================
# Setup Git Hooks - DIBEA
# =====================================================
# Este script configura git hooks para prevenir commit
# de credenciais e arquivos sensíveis

set -e

echo "🔒 Configurando Git Hooks de Segurança..."

# Criar diretório de hooks se não existir
mkdir -p .git/hooks

# =====================================================
# PRE-COMMIT HOOK
# =====================================================
cat > .git/hooks/pre-commit << 'EOF'
#!/bin/bash

# Cores para output
RED='\033[0;31m'
YELLOW='\033[1;33m'
GREEN='\033[0;32m'
NC='\033[0m' # No Color

echo "🔍 Verificando segurança antes do commit..."

# =====================================================
# 1. Verificar arquivos .env
# =====================================================
ENV_FILES=$(git diff --cached --name-only | grep -E '\.env$|\.env\.local$|\.env\.production$|\.env\.dev$|\.env\.prod$' || true)

if [ -n "$ENV_FILES" ]; then
  echo -e "${RED}❌ ERRO: Tentativa de commit de arquivo .env detectada!${NC}"
  echo -e "${YELLOW}Arquivos detectados:${NC}"
  echo "$ENV_FILES"
  echo ""
  echo -e "${YELLOW}Arquivos .env NÃO devem ser commitados.${NC}"
  echo -e "${YELLOW}Use .env.example como template.${NC}"
  echo ""
  echo "Para remover do stage:"
  echo "  git reset HEAD $ENV_FILES"
  exit 1
fi

# =====================================================
# 2. Verificar credenciais hardcoded
# =====================================================
PATTERNS=(
  'sk-[a-zA-Z0-9]{48}'                    # OpenAI API keys
  'supabase\.co.*eyJ[a-zA-Z0-9_-]{20,}'   # Supabase URLs with JWT
  'pcsk_[a-zA-Z0-9_-]{50,}'               # Pinecone API keys
  'AKIA[0-9A-Z]{16}'                      # AWS Access Key
  'ghp_[a-zA-Z0-9]{36}'                   # GitHub Personal Access Token
  'gho_[a-zA-Z0-9]{36}'                   # GitHub OAuth Token
)

FOUND_SECRETS=false

for pattern in "${PATTERNS[@]}"; do
  if git diff --cached | grep -qE "$pattern"; then
    if [ "$FOUND_SECRETS" = false ]; then
      echo -e "${RED}❌ ERRO: Possível credencial hardcoded detectada!${NC}"
      echo ""
      FOUND_SECRETS=true
    fi
    echo -e "${YELLOW}Padrão encontrado: $pattern${NC}"
  fi
done

if [ "$FOUND_SECRETS" = true ]; then
  echo ""
  echo -e "${YELLOW}Use variáveis de ambiente ao invés de hardcode:${NC}"
  echo "  const apiKey = process.env.OPENAI_API_KEY;"
  echo ""
  echo "Para ver o que será commitado:"
  echo "  git diff --cached"
  exit 1
fi

# =====================================================
# 3. Verificar arquivos temporários do Supabase
# =====================================================
TEMP_FILES=$(git diff --cached --name-only | grep -E 'supabase/\.temp/' || true)

if [ -n "$TEMP_FILES" ]; then
  echo -e "${RED}❌ ERRO: Arquivos temporários do Supabase detectados!${NC}"
  echo -e "${YELLOW}Arquivos:${NC}"
  echo "$TEMP_FILES"
  echo ""
  echo "Para remover do stage:"
  echo "  git reset HEAD $TEMP_FILES"
  exit 1
fi

# =====================================================
# 4. Verificar tamanho de arquivos
# =====================================================
LARGE_FILES=$(git diff --cached --name-only | while read file; do
  if [ -f "$file" ]; then
    size=$(wc -c < "$file")
    if [ $size -gt 1048576 ]; then  # 1MB
      echo "$file ($(numfmt --to=iec-i --suffix=B $size))"
    fi
  fi
done)

if [ -n "$LARGE_FILES" ]; then
  echo -e "${YELLOW}⚠️  AVISO: Arquivos grandes detectados (>1MB):${NC}"
  echo "$LARGE_FILES"
  echo ""
  echo -e "${YELLOW}Considere usar Git LFS para arquivos grandes.${NC}"
  echo ""
  read -p "Continuar mesmo assim? (y/N) " -n 1 -r
  echo
  if [[ ! $REPLY =~ ^[Yy]$ ]]; then
    exit 1
  fi
fi

# =====================================================
# 5. Verificar package-lock.json conflicts
# =====================================================
if git diff --cached --name-only | grep -q 'package-lock.json'; then
  if git diff --cached package-lock.json | grep -q '<<<<<<<'; then
    echo -e "${RED}❌ ERRO: Conflitos não resolvidos em package-lock.json${NC}"
    echo ""
    echo "Resolva os conflitos antes de commitar."
    exit 1
  fi
fi

echo -e "${GREEN}✅ Verificações de segurança passaram!${NC}"
exit 0
EOF

# Tornar executável
chmod +x .git/hooks/pre-commit

echo "✅ Pre-commit hook instalado!"

# =====================================================
# COMMIT-MSG HOOK
# =====================================================
cat > .git/hooks/commit-msg << 'EOF'
#!/bin/bash

# Verificar se a mensagem de commit contém credenciais
if grep -qiE 'password|secret|api.?key|token' "$1"; then
  echo "⚠️  AVISO: Mensagem de commit contém palavras sensíveis."
  echo "Certifique-se de não incluir credenciais na mensagem."
  echo ""
  read -p "Continuar? (y/N) " -n 1 -r
  echo
  if [[ ! $REPLY =~ ^[Yy]$ ]]; then
    exit 1
  fi
fi

exit 0
EOF

chmod +x .git/hooks/commit-msg

echo "✅ Commit-msg hook instalado!"

# =====================================================
# PRE-PUSH HOOK
# =====================================================
cat > .git/hooks/pre-push << 'EOF'
#!/bin/bash

echo "🔍 Verificação final antes do push..."

# Verificar se há arquivos .env no repositório
if git ls-files | grep -qE '\.env$|\.env\.local$|\.env\.production$'; then
  echo "❌ ERRO: Arquivos .env encontrados no repositório!"
  echo ""
  echo "Arquivos encontrados:"
  git ls-files | grep -E '\.env$|\.env\.local$|\.env\.production$'
  echo ""
  echo "Remova estes arquivos antes de fazer push:"
  echo "  git rm --cached <arquivo>"
  exit 1
fi

echo "✅ Verificação de push passou!"
exit 0
EOF

chmod +x .git/hooks/pre-push

echo "✅ Pre-push hook instalado!"

# =====================================================
# Resumo
# =====================================================
echo ""
echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
echo "✅ Git Hooks de Segurança Configurados!"
echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
echo ""
echo "Hooks instalados:"
echo "  • pre-commit  - Verifica credenciais e arquivos .env"
echo "  • commit-msg  - Verifica mensagens de commit"
echo "  • pre-push    - Verificação final antes do push"
echo ""
echo "Para testar:"
echo "  git add ."
echo "  git commit -m 'test'"
echo ""
echo "Para desabilitar temporariamente:"
echo "  git commit --no-verify"
echo ""

