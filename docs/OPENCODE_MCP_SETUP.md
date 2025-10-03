# 🔧 OpenCode MCP Configuration Guide

## 📋 Visão Geral

Este guia explica como configurar o **OpenCode** com **Model Context Protocol (MCP) servers** para replicar as capacidades do Augment no projeto DIBEA.

### O que são MCPs?

MCPs (Model Context Protocol servers) são ferramentas externas que estendem as capacidades da IA, permitindo:
- 📁 Acesso ao sistema de arquivos
- 🐙 Integração com GitHub
- 🗄️ Consultas ao banco de dados
- 🔍 Busca na web
- 💾 Memória persistente
- 🔗 Integração com APIs externas

---

## 🚀 Instalação Rápida

### 1. Instalar OpenCode

```bash
# Via npm
npm install -g opencode

# Via Homebrew (macOS)
brew install opencode

# Verificar instalação
opencode --version
```

### 2. Configurar Variáveis de Ambiente

```bash
# Copiar arquivo de exemplo
cp .opencode/.env.example .opencode/.env

# Editar com suas credenciais
nano .opencode/.env
```

### 3. Iniciar OpenCode

```bash
# No diretório do projeto DIBEA
cd /Users/pedroreichow/projects/dibea

# Iniciar OpenCode
opencode
```

---

## 🔑 Configuração de Credenciais

### GitHub Personal Access Token

1. Acesse: https://github.com/settings/tokens
2. Clique em **"Generate new token (classic)"**
3. Selecione os escopos:
   - ✅ `repo` (acesso completo a repositórios)
   - ✅ `read:org` (ler organizações)
   - ✅ `read:user` (ler perfil do usuário)
4. Copie o token e adicione ao `.env`:
   ```bash
   GITHUB_PERSONAL_ACCESS_TOKEN=ghp_seu_token_aqui
   ```

### Supabase Database URL

1. Acesse: https://supabase.com/dashboard/project/xptonqqagxcpzlgndilj/settings/database
2. Copie a **Connection String** (PostgreSQL)
3. Adicione ao `.env`:
   ```bash
   SUPABASE_DATABASE_URL=postgresql://postgres:sua_senha@db.xptonqqagxcpzlgndilj.supabase.co:5432/postgres
   ```

### Brave Search API (Opcional)

1. Acesse: https://brave.com/search/api/
2. Crie uma conta e obtenha API key
3. Adicione ao `.env`:
   ```bash
   BRAVE_API_KEY=seu_brave_api_key
   ```

### N8N API Key (Opcional)

1. Acesse: https://n8n-moveup-u53084.vm.elestio.app/settings/api
2. Gere uma API key
3. Adicione ao `.env`:
   ```bash
   N8N_API_KEY=seu_n8n_api_key
   ```

---

## 📦 MCPs Configurados

### 1. **Filesystem MCP** ✅ Habilitado

**Função:** Acesso seguro ao sistema de arquivos do projeto

**Capacidades:**
- Ler arquivos
- Escrever arquivos
- Listar diretórios
- Buscar conteúdo

**Configuração:**
```json
{
  "filesystem": {
    "type": "local",
    "command": ["npx", "-y", "@modelcontextprotocol/server-filesystem", "/Users/pedroreichow/projects/dibea"],
    "enabled": true
  }
}
```

**Uso:**
```
"Leia o arquivo apps/frontend/src/contexts/AuthContext.tsx"
"Liste todos os arquivos TypeScript em apps/backend/src"
```

---

### 2. **GitHub MCP** ✅ Habilitado

**Função:** Integração completa com GitHub

**Capacidades:**
- Criar/editar issues
- Gerenciar pull requests
- Buscar código
- Ver commits e histórico
- Gerenciar branches

**Configuração:**
```json
{
  "github": {
    "type": "local",
    "command": ["npx", "-y", "@modelcontextprotocol/server-github"],
    "enabled": true,
    "environment": {
      "GITHUB_PERSONAL_ACCESS_TOKEN": "${GITHUB_PERSONAL_ACCESS_TOKEN}"
    }
  }
}
```

**Uso:**
```
"Crie uma issue para implementar upload de fotos"
"Liste os últimos 5 commits no branch main"
"Mostre as PRs abertas"
```

---

### 3. **Supabase (PostgreSQL) MCP** ✅ Habilitado

**Função:** Consultas diretas ao banco de dados Supabase

**Capacidades:**
- Executar queries SQL
- Listar tabelas e schemas
- Analisar dados
- Verificar relacionamentos

**Configuração:**
```json
{
  "supabase": {
    "type": "local",
    "command": ["npx", "-y", "@modelcontextprotocol/server-postgres"],
    "enabled": true,
    "environment": {
      "POSTGRES_CONNECTION_STRING": "${SUPABASE_DATABASE_URL}"
    }
  }
}
```

**Uso:**
```
"Quantos animais estão disponíveis para adoção?"
"Mostre os últimos 10 usuários cadastrados"
"Liste todas as tabelas do banco"
```

---

### 4. **Git MCP** ✅ Habilitado

**Função:** Operações Git locais

**Capacidades:**
- Ver status do repositório
- Criar commits
- Gerenciar branches
- Ver diff de mudanças
- Histórico de commits

**Configuração:**
```json
{
  "git": {
    "type": "local",
    "command": ["npx", "-y", "@modelcontextprotocol/server-git"],
    "enabled": true
  }
}
```

**Uso:**
```
"Mostre o status do git"
"Crie um commit com as mudanças atuais"
"Mostre o diff do último commit"
```

---

### 5. **Fetch MCP** ✅ Habilitado

**Função:** Buscar conteúdo da web

**Capacidades:**
- Fazer requisições HTTP
- Buscar documentação
- Acessar APIs públicas
- Converter HTML para Markdown

**Configuração:**
```json
{
  "fetch": {
    "type": "local",
    "command": ["npx", "-y", "@modelcontextprotocol/server-fetch"],
    "enabled": true
  }
}
```

**Uso:**
```
"Busque a documentação do Next.js sobre App Router"
"Faça uma requisição para a API do GitHub"
```

---

### 6. **Memory MCP** ✅ Habilitado

**Função:** Memória persistente entre sessões

**Capacidades:**
- Armazenar informações importantes
- Lembrar decisões de arquitetura
- Manter contexto entre conversas
- Knowledge graph de relacionamentos

**Configuração:**
```json
{
  "memory": {
    "type": "local",
    "command": ["npx", "-y", "@modelcontextprotocol/server-memory"],
    "enabled": true
  }
}
```

**Uso:**
```
"Lembre que usamos Prisma para ORM"
"Qual foi a decisão sobre o dashboard enhanced?"
```

---

### 7. **Brave Search MCP** ⚠️ Desabilitado (Opcional)

**Função:** Busca na web com privacidade

**Capacidades:**
- Buscar informações atualizadas
- Pesquisar documentação
- Encontrar soluções para erros

**Ativar:**
```json
{
  "tools": {
    "brave-search*": true
  }
}
```

---

### 8. **N8N MCP** ⚠️ Desabilitado (Opcional)

**Função:** Integração com workflows N8N

**Capacidades:**
- Criar workflows
- Executar automações
- Gerenciar webhooks

**Ativar:**
```json
{
  "tools": {
    "n8n*": true
  }
}
```

---

## 🤖 Agentes Configurados

### 1. **dibea-fullstack** (Padrão)

Agente completo para desenvolvimento full-stack.

**Ferramentas:**
- ✅ Filesystem
- ✅ GitHub
- ✅ Supabase
- ✅ Git
- ✅ Fetch
- ✅ Memory

**Uso:**
```bash
opencode --agent dibea-fullstack
```

---

### 2. **dibea-frontend**

Focado em desenvolvimento Next.js/React.

**Ferramentas:**
- ✅ Filesystem
- ✅ GitHub
- ✅ Git
- ✅ Fetch

**Uso:**
```bash
opencode --agent dibea-frontend
```

---

### 3. **dibea-backend**

Focado em API e banco de dados.

**Ferramentas:**
- ✅ Filesystem
- ✅ GitHub
- ✅ Supabase
- ✅ Git

**Uso:**
```bash
opencode --agent dibea-backend
```

---

### 4. **dibea-n8n**

Focado em workflows e automação.

**Ferramentas:**
- ✅ Filesystem
- ✅ N8N
- ✅ Fetch
- ✅ Memory

**Uso:**
```bash
opencode --agent dibea-n8n
```

---

### 5. **dibea-docs**

Focado em documentação e análise.

**Ferramentas:**
- ✅ Filesystem
- ✅ GitHub
- ✅ Git
- ✅ Fetch
- ✅ Memory

**Uso:**
```bash
opencode --agent dibea-docs
```

---

## 🎯 Exemplos de Uso

### Desenvolvimento Full-Stack

```bash
# Iniciar com agente full-stack
opencode --agent dibea-fullstack

# Exemplos de comandos:
> "Implemente upload de fotos usando animalService"
> "Corrija o bug de autenticação no AuthContext"
> "Adicione validação Zod no formulário de adoção"
```

### Análise de Código

```bash
opencode --agent dibea-docs

> "Analise as mudanças recentes no git diff"
> "Documente o fluxo de autenticação"
> "Crie um diagrama da arquitetura do sistema"
```

### Consultas ao Banco

```bash
opencode --agent dibea-backend

> "Quantos animais foram adotados este mês?"
> "Liste os usuários admin ativos"
> "Mostre o schema da tabela adoptions"
```

---

## 🔧 Troubleshooting

### MCP não está funcionando

```bash
# Verificar se o MCP está instalado
npx @modelcontextprotocol/server-filesystem --version

# Reinstalar MCP
npm cache clean --force
npx -y @modelcontextprotocol/server-filesystem
```

### Erro de autenticação GitHub

```bash
# Verificar token
echo $GITHUB_PERSONAL_ACCESS_TOKEN

# Testar token
curl -H "Authorization: token $GITHUB_PERSONAL_ACCESS_TOKEN" \
  https://api.github.com/user
```

### Erro de conexão Supabase

```bash
# Testar conexão
psql "$SUPABASE_DATABASE_URL" -c "SELECT 1"

# Verificar variável
echo $SUPABASE_DATABASE_URL
```

---

## 📚 Recursos Adicionais

- **OpenCode Docs:** https://opencode.ai/docs/
- **MCP Registry:** https://www.mcpregistry.online
- **MCP Specification:** https://modelcontextprotocol.io
- **Augment Docs:** https://docs.augmentcode.com

---

**Última atualização:** Janeiro 2025  
**Status:** ✅ Configuração completa e testada

