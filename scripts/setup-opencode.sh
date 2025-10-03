#!/bin/bash

# ========================================
# DIBEA - OpenCode MCP Setup Script
# ========================================
# Configura OpenCode com MCPs para o projeto DIBEA

set -e

echo "🚀 DIBEA - OpenCode MCP Setup"
echo "================================"
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

# ========================================
# 1. Verificar Node.js
# ========================================
echo "1️⃣  Verificando Node.js..."
if ! command -v node &> /dev/null; then
    print_error "Node.js não encontrado. Instale Node.js 18+ primeiro."
    exit 1
fi

NODE_VERSION=$(node -v | cut -d'v' -f2 | cut -d'.' -f1)
if [ "$NODE_VERSION" -lt 18 ]; then
    print_error "Node.js 18+ é necessário. Versão atual: $(node -v)"
    exit 1
fi

print_success "Node.js $(node -v) encontrado"

# ========================================
# 2. Verificar/Instalar OpenCode
# ========================================
echo ""
echo "2️⃣  Verificando OpenCode..."
if ! command -v opencode &> /dev/null; then
    print_warning "OpenCode não encontrado. Instalando..."
    
    # Perguntar método de instalação
    echo ""
    echo "Escolha o método de instalação:"
    echo "1) npm (global)"
    echo "2) Homebrew (macOS)"
    read -p "Opção [1]: " install_method
    install_method=${install_method:-1}
    
    if [ "$install_method" = "1" ]; then
        npm install -g opencode
    elif [ "$install_method" = "2" ]; then
        if ! command -v brew &> /dev/null; then
            print_error "Homebrew não encontrado. Use npm ou instale Homebrew primeiro."
            exit 1
        fi
        brew install opencode
    else
        print_error "Opção inválida"
        exit 1
    fi
    
    print_success "OpenCode instalado"
else
    print_success "OpenCode já instalado"
fi

# ========================================
# 3. Criar diretório .opencode
# ========================================
echo ""
echo "3️⃣  Criando estrutura de diretórios..."
mkdir -p .opencode
print_success "Diretório .opencode criado"

# ========================================
# 4. Verificar arquivo de configuração
# ========================================
echo ""
echo "4️⃣  Verificando configuração..."
if [ -f ".opencode/opencode.json" ]; then
    print_success "Arquivo opencode.json já existe"
else
    print_error "Arquivo opencode.json não encontrado"
    print_info "Execute este script do diretório raiz do projeto DIBEA"
    exit 1
fi

# ========================================
# 5. Configurar variáveis de ambiente
# ========================================
echo ""
echo "5️⃣  Configurando variáveis de ambiente..."

if [ -f ".opencode/.env" ]; then
    print_warning "Arquivo .env já existe. Deseja sobrescrever? (y/N)"
    read -p "> " overwrite
    if [ "$overwrite" != "y" ] && [ "$overwrite" != "Y" ]; then
        print_info "Mantendo .env existente"
    else
        cp .opencode/.env.example .opencode/.env
        print_success "Arquivo .env criado"
    fi
else
    cp .opencode/.env.example .opencode/.env
    print_success "Arquivo .env criado"
fi

# ========================================
# 6. Solicitar credenciais
# ========================================
echo ""
echo "6️⃣  Configurando credenciais..."
echo ""
print_info "Vamos configurar as credenciais necessárias."
print_info "Pressione ENTER para pular (pode configurar depois)"
echo ""

# GitHub Token
read -p "GitHub Personal Access Token: " github_token
if [ ! -z "$github_token" ]; then
    if [[ "$OSTYPE" == "darwin"* ]]; then
        sed -i '' "s|GITHUB_PERSONAL_ACCESS_TOKEN=.*|GITHUB_PERSONAL_ACCESS_TOKEN=$github_token|" .opencode/.env
    else
        sed -i "s|GITHUB_PERSONAL_ACCESS_TOKEN=.*|GITHUB_PERSONAL_ACCESS_TOKEN=$github_token|" .opencode/.env
    fi
    print_success "GitHub token configurado"
fi

# Supabase URL
read -p "Supabase Database URL: " supabase_url
if [ ! -z "$supabase_url" ]; then
    if [[ "$OSTYPE" == "darwin"* ]]; then
        sed -i '' "s|SUPABASE_DATABASE_URL=.*|SUPABASE_DATABASE_URL=$supabase_url|" .opencode/.env
    else
        sed -i "s|SUPABASE_DATABASE_URL=.*|SUPABASE_DATABASE_URL=$supabase_url|" .opencode/.env
    fi
    print_success "Supabase URL configurada"
fi

# OpenAI API Key
read -p "OpenAI API Key: " openai_key
if [ ! -z "$openai_key" ]; then
    if [[ "$OSTYPE" == "darwin"* ]]; then
        sed -i '' "s|OPENAI_API_KEY=.*|OPENAI_API_KEY=$openai_key|" .opencode/.env
    else
        sed -i "s|OPENAI_API_KEY=.*|OPENAI_API_KEY=$openai_key|" .opencode/.env
    fi
    print_success "OpenAI API Key configurada"
fi

# ========================================
# 7. Instalar MCPs
# ========================================
echo ""
echo "7️⃣  Instalando MCP servers..."

print_info "Instalando @modelcontextprotocol/server-filesystem..."
npx -y @modelcontextprotocol/server-filesystem --version &> /dev/null
print_success "Filesystem MCP instalado"

print_info "Instalando @modelcontextprotocol/server-github..."
npx -y @modelcontextprotocol/server-github --version &> /dev/null
print_success "GitHub MCP instalado"

print_info "Instalando @modelcontextprotocol/server-postgres..."
npx -y @modelcontextprotocol/server-postgres --version &> /dev/null
print_success "PostgreSQL MCP instalado"

print_info "Instalando @modelcontextprotocol/server-git..."
npx -y @modelcontextprotocol/server-git --version &> /dev/null
print_success "Git MCP instalado"

print_info "Instalando @modelcontextprotocol/server-fetch..."
npx -y @modelcontextprotocol/server-fetch --version &> /dev/null
print_success "Fetch MCP instalado"

print_info "Instalando @modelcontextprotocol/server-memory..."
npx -y @modelcontextprotocol/server-memory --version &> /dev/null
print_success "Memory MCP instalado"

# ========================================
# 8. Testar configuração
# ========================================
echo ""
echo "8️⃣  Testando configuração..."

# Verificar se pode ler o arquivo de config
if opencode --version &> /dev/null; then
    print_success "OpenCode está funcionando"
else
    print_error "Erro ao executar OpenCode"
    exit 1
fi

# ========================================
# 9. Resumo
# ========================================
echo ""
echo "================================"
echo "✅ Setup Completo!"
echo "================================"
echo ""
print_info "MCPs Instalados:"
echo "  ✅ Filesystem - Acesso ao sistema de arquivos"
echo "  ✅ GitHub - Integração com GitHub"
echo "  ✅ Supabase - Consultas ao banco de dados"
echo "  ✅ Git - Operações Git locais"
echo "  ✅ Fetch - Buscar conteúdo da web"
echo "  ✅ Memory - Memória persistente"
echo ""
print_info "Agentes Configurados:"
echo "  🤖 dibea-fullstack - Desenvolvimento full-stack"
echo "  🎨 dibea-frontend - Frontend Next.js/React"
echo "  🔧 dibea-backend - Backend API/Database"
echo "  🔄 dibea-n8n - Workflows N8N"
echo "  📚 dibea-docs - Documentação"
echo ""
print_info "Próximos Passos:"
echo "  1. Edite .opencode/.env com suas credenciais"
echo "  2. Execute: opencode"
echo "  3. Ou escolha um agente: opencode --agent dibea-fullstack"
echo ""
print_info "Documentação completa: docs/OPENCODE_MCP_SETUP.md"
echo ""
print_success "Pronto para usar! 🚀"

