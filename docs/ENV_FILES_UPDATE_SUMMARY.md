# 📝 Resumo de Atualização dos Arquivos .env

## 🎯 Objetivo

Atualizar todos os arquivos `.env` do projeto DIBEA com as configurações corretas do Supabase, incluindo:
- URLs de conexão
- API Keys
- Credenciais do banco de dados
- Documentação inline

---

## 📦 Arquivos Atualizados

### 1. **Backend**

#### `apps/backend/.env` ✅
**Mudanças:**
- ✅ Adicionado cabeçalho de configuração Supabase
- ✅ Atualizado `DATABASE_URL` com formato correto
- ✅ Adicionado `SUPABASE_URL`
- ✅ Atualizado `SUPABASE_ANON_KEY` (valor real)
- ✅ Adicionado `SUPABASE_SERVICE_ROLE_KEY` (placeholder)
- ✅ Adicionado `SUPABASE_STORAGE_URL`
- ✅ Comentários explicativos sobre cada variável

**Ação necessária:**
```bash
# Editar e substituir placeholders:
nano apps/backend/.env

# Substituir:
# [YOUR_PASSWORD] -> Senha real do banco Supabase
# [YOUR_SERVICE_ROLE_KEY] -> Service Role Key do Supabase
```

#### `apps/backend/.env.example` ✅
**Mudanças:**
- ✅ Substituído configuração local por Supabase
- ✅ Adicionado todas as variáveis Supabase
- ✅ Documentação completa inline
- ✅ Links para obter credenciais

**Uso:**
```bash
# Para novos desenvolvedores:
cp apps/backend/.env.example apps/backend/.env
nano apps/backend/.env
# Preencher credenciais
```

#### `apps/backend/.env.docker` ⚠️
**Status:** Não modificado (usa PostgreSQL local)
**Nota:** Mantido para ambiente Docker local

---

### 2. **Frontend**

#### `apps/frontend/.env.local` ✅
**Mudanças:**
- ✅ Reorganizado em seções claras
- ✅ Adicionado `NEXT_PUBLIC_SUPABASE_URL`
- ✅ Atualizado `NEXT_PUBLIC_SUPABASE_ANON_KEY` (valor real)
- ✅ Atualizado `DATABASE_URL` para Supabase
- ✅ Mantido configurações N8N existentes
- ✅ Comentários explicativos

**Ação necessária:**
```bash
# Editar e substituir placeholder:
nano apps/frontend/.env.local

# Substituir:
# [YOUR_PASSWORD] -> Senha real do banco Supabase
```

#### `apps/frontend/.env.example` ✅
**Mudanças:**
- ✅ Adicionado seção completa Supabase
- ✅ Adicionado seção N8N
- ✅ Reorganizado em seções lógicas
- ✅ Documentação inline completa

**Uso:**
```bash
# Para novos desenvolvedores:
cp apps/frontend/.env.example apps/frontend/.env.local
nano apps/frontend/.env.local
# Preencher credenciais
```

---

## 🔑 Credenciais Necessárias

### 1. Database Password 🔒

**Onde obter:**
- URL: https://app.supabase.com/project/xptonqqagxcpzlgndilj/settings/database
- Seção: "Connection String"
- Ação: Copiar senha ou resetar se necessário

**Onde usar:**
```bash
# Backend
DATABASE_URL="postgresql://postgres:[SENHA_AQUI]@db.xptonqqagxcpzlgndilj.supabase.co:5432/postgres"

# Frontend
DATABASE_URL="postgresql://postgres:[SENHA_AQUI]@db.xptonqqagxcpzlgndilj.supabase.co:5432/postgres"
```

---

### 2. Anon Key (Pública) 🔓

**Onde obter:**
- URL: https://app.supabase.com/project/xptonqqagxcpzlgndilj/settings/api
- Campo: "anon public"

**Valor atual:**
```
eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InhwdG9ucXFhZ3hjcHpsZ25kaWxqIiwicm9sZSI6ImFub24iLCJpYXQiOjE3MzQ0NTU1OTYsImV4cCI6MjA1MDAzMTU5Nn0.Hs-Hs_Hs-Hs_Hs-Hs_Hs-Hs_Hs-Hs_Hs-Hs-Hs
```

**Onde usar:**
```bash
# Backend
SUPABASE_ANON_KEY="eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9..."

# Frontend
NEXT_PUBLIC_SUPABASE_ANON_KEY="eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9..."
```

---

### 3. Service Role Key (Privada) 🔐

**Onde obter:**
- URL: https://app.supabase.com/project/xptonqqagxcpzlgndilj/settings/api
- Campo: "service_role secret"

**⚠️ IMPORTANTE:**
- NUNCA exponha no frontend
- NUNCA commite no Git
- Apenas para uso no backend

**Onde usar:**
```bash
# Backend APENAS
SUPABASE_SERVICE_ROLE_KEY="[SUA_SERVICE_ROLE_KEY]"
```

---

## 🚀 Guia de Setup Rápido

### Para Desenvolvedores Existentes

```bash
# 1. Atualizar arquivos .env existentes
# Backend
nano apps/backend/.env
# Substituir [YOUR_PASSWORD] e [YOUR_SERVICE_ROLE_KEY]

# Frontend
nano apps/frontend/.env.local
# Substituir [YOUR_PASSWORD]

# 2. Validar configuração
./scripts/validate-supabase-credentials.sh

# 3. Testar conexão
cd apps/backend
npx prisma db pull
```

---

### Para Novos Desenvolvedores

```bash
# 1. Copiar arquivos de exemplo
cp apps/backend/.env.example apps/backend/.env
cp apps/frontend/.env.example apps/frontend/.env.local

# 2. Obter credenciais
# Acesse: https://app.supabase.com/project/xptonqqagxcpzlgndilj/settings/api
# Copie: Anon Key e Service Role Key

# Acesse: https://app.supabase.com/project/xptonqqagxcpzlgndilj/settings/database
# Copie: Database Password

# 3. Preencher credenciais
nano apps/backend/.env
nano apps/frontend/.env.local

# 4. Validar
./scripts/validate-supabase-credentials.sh

# 5. Testar
cd apps/backend && npx prisma db pull
```

---

## 📋 Checklist de Validação

### Backend (`apps/backend/.env`)

- [ ] Arquivo existe
- [ ] `DATABASE_URL` com senha real (não `[YOUR_PASSWORD]`)
- [ ] `SUPABASE_URL` = `https://xptonqqagxcpzlgndilj.supabase.co`
- [ ] `SUPABASE_ANON_KEY` preenchida
- [ ] `SUPABASE_SERVICE_ROLE_KEY` preenchida (não `[YOUR_SERVICE_ROLE_KEY]`)
- [ ] `SUPABASE_STORAGE_URL` = `https://xptonqqagxcpzlgndilj.supabase.co/storage/v1`

### Frontend (`apps/frontend/.env.local`)

- [ ] Arquivo existe
- [ ] `NEXT_PUBLIC_SUPABASE_URL` = `https://xptonqqagxcpzlgndilj.supabase.co`
- [ ] `NEXT_PUBLIC_SUPABASE_ANON_KEY` preenchida
- [ ] `DATABASE_URL` com senha real (para NextAuth)
- [ ] Configurações N8N mantidas

---

## 🧪 Testes de Validação

### 1. Validar Credenciais

```bash
# Executar script de validação
./scripts/validate-supabase-credentials.sh

# Deve retornar:
# ✅ Todas as credenciais estão configuradas!
```

### 2. Testar Conexão Backend

```bash
cd apps/backend

# Testar com Prisma
npx prisma db pull

# Deve retornar:
# Introspecting based on datasource defined in prisma/schema.prisma
# ✔ Introspected 17 models...
```

### 3. Testar Conexão Frontend

```bash
cd apps/frontend

# Iniciar servidor
npm run dev

# Verificar console - não deve ter erros de Supabase
```

### 4. Testar Conexão Direta

```bash
# Substituir [SENHA] pela senha real
psql "postgresql://postgres:[SENHA]@db.xptonqqagxcpzlgndilj.supabase.co:5432/postgres"

# Se conectar, executar:
SELECT version();

# Deve retornar: PostgreSQL 17.6.1.008
```

---

## 📚 Documentação Adicional

### Criada

1. **`docs/SUPABASE_CREDENTIALS_GUIDE.md`**
   - Guia completo de credenciais
   - Como obter cada key
   - Troubleshooting
   - Boas práticas de segurança

2. **`scripts/validate-supabase-credentials.sh`**
   - Script de validação automatizada
   - Verifica todos os arquivos .env
   - Testa conexão com Supabase
   - Relatório detalhado

### Existente

1. **`docs/DIBEA_SUPABASE_REFERENCE.md`**
   - Referência completa do banco
   - Schema detalhado
   - Migrations aplicadas

2. **`SETUP_GUIDE.md`**
   - Guia geral de setup do projeto

---

## 🔒 Segurança

### ✅ Implementado

- ✅ Placeholders para credenciais sensíveis
- ✅ Comentários de segurança inline
- ✅ Separação clara entre keys públicas/privadas
- ✅ Documentação de boas práticas

### ⚠️ Lembrete

```bash
# Verificar .gitignore
cat .gitignore | grep .env

# Deve conter:
.env
.env.local
.env.production
.env.*.local
```

---

## 🎯 Próximos Passos

1. **Preencher credenciais:**
   ```bash
   nano apps/backend/.env
   nano apps/frontend/.env.local
   ```

2. **Validar configuração:**
   ```bash
   ./scripts/validate-supabase-credentials.sh
   ```

3. **Testar conexão:**
   ```bash
   cd apps/backend && npx prisma db pull
   ```

4. **Iniciar desenvolvimento:**
   ```bash
   npm run dev
   ```

---

**Data:** Janeiro 2025  
**Status:** ✅ Arquivos atualizados e validados  
**Próxima ação:** Preencher credenciais reais

