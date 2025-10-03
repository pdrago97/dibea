# 🔑 Guia de Credenciais Supabase - DIBEA

## 📋 Visão Geral

Este guia mostra como obter e configurar todas as credenciais necessárias do Supabase para o projeto DIBEA.

---

## 🎯 Informações do Projeto

```yaml
Project Name: dibea
Project ID: xptonqqagxcpzlgndilj
Organization ID: dacvlmxyzwwgafrhwtue
Region: us-east-2 (Ohio)
Database: PostgreSQL 17.6.1.008
Status: ACTIVE_HEALTHY
```

---

## 🔐 Credenciais Necessárias

### 1. **Database Password** 🔒

**Onde obter:**
1. Acesse: https://app.supabase.com/project/xptonqqagxcpzlgndilj/settings/database
2. Vá para a seção **"Connection String"**
3. Clique em **"Reset database password"** se necessário
4. Copie a senha gerada

**Onde usar:**
```bash
# Backend (.env)
DATABASE_URL="postgresql://postgres:[SUA_SENHA_AQUI]@db.xptonqqagxcpzlgndilj.supabase.co:5432/postgres"

# Frontend (.env.local)
DATABASE_URL="postgresql://postgres:[SUA_SENHA_AQUI]@db.xptonqqagxcpzlgndilj.supabase.co:5432/postgres"
```

---

### 2. **Anon Key (Pública)** 🔓

**Onde obter:**
1. Acesse: https://app.supabase.com/project/xptonqqagxcpzlgndilj/settings/api
2. Copie o valor de **"anon public"**

**Características:**
- ✅ Segura para usar no frontend
- ✅ Respeita Row Level Security (RLS)
- ✅ Pode ser exposta publicamente
- ✅ Expira em: 2050-03-15

**Valor atual:**
```
eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InhwdG9ucXFhZ3hjcHpsZ25kaWxqIiwicm9sZSI6ImFub24iLCJpYXQiOjE3MzQ0NTU1OTYsImV4cCI6MjA1MDAzMTU5Nn0.Hs-Hs_Hs-Hs_Hs-Hs_Hs-Hs_Hs-Hs_Hs-Hs-Hs
```

**Onde usar:**
```bash
# Backend (.env)
SUPABASE_ANON_KEY="eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9..."

# Frontend (.env.local)
NEXT_PUBLIC_SUPABASE_ANON_KEY="eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9..."
```

---

### 3. **Service Role Key (Privada)** 🔐

**Onde obter:**
1. Acesse: https://app.supabase.com/project/xptonqqagxcpzlgndilj/settings/api
2. Copie o valor de **"service_role secret"**

**Características:**
- ⚠️ **NUNCA** exponha no frontend
- ⚠️ **NUNCA** commite no Git
- ✅ Bypassa Row Level Security (RLS)
- ✅ Acesso total ao banco de dados
- ✅ Apenas para uso no backend

**Onde usar:**
```bash
# Backend (.env) - APENAS AQUI!
SUPABASE_SERVICE_ROLE_KEY="[SUA_SERVICE_ROLE_KEY_AQUI]"
```

**⚠️ IMPORTANTE:**
- Adicione ao `.gitignore`
- Use variáveis de ambiente em produção
- Nunca exponha em logs ou erros

---

## 📝 Checklist de Configuração

### Backend (`apps/backend/.env`)

```bash
# 1. Copiar arquivo de exemplo
cp apps/backend/.env.example apps/backend/.env

# 2. Editar arquivo
nano apps/backend/.env

# 3. Preencher credenciais:
# ✅ DATABASE_URL (com senha do banco)
# ✅ SUPABASE_URL
# ✅ SUPABASE_ANON_KEY
# ✅ SUPABASE_SERVICE_ROLE_KEY
```

**Checklist:**
- [ ] `DATABASE_URL` com senha correta
- [ ] `SUPABASE_URL` = `https://xptonqqagxcpzlgndilj.supabase.co`
- [ ] `SUPABASE_ANON_KEY` preenchida
- [ ] `SUPABASE_SERVICE_ROLE_KEY` preenchida
- [ ] Arquivo `.env` no `.gitignore`

---

### Frontend (`apps/frontend/.env.local`)

```bash
# 1. Copiar arquivo de exemplo
cp apps/frontend/.env.example apps/frontend/.env.local

# 2. Editar arquivo
nano apps/frontend/.env.local

# 3. Preencher credenciais:
# ✅ NEXT_PUBLIC_SUPABASE_URL
# ✅ NEXT_PUBLIC_SUPABASE_ANON_KEY
# ✅ DATABASE_URL (para NextAuth/Prisma)
```

**Checklist:**
- [ ] `NEXT_PUBLIC_SUPABASE_URL` = `https://xptonqqagxcpzlgndilj.supabase.co`
- [ ] `NEXT_PUBLIC_SUPABASE_ANON_KEY` preenchida
- [ ] `DATABASE_URL` com senha correta (para NextAuth)
- [ ] Arquivo `.env.local` no `.gitignore`

---

## 🔗 URLs de Referência

### Dashboard Supabase
```
https://app.supabase.com/project/xptonqqagxcpzlgndilj
```

### API Settings
```
https://app.supabase.com/project/xptonqqagxcpzlgndilj/settings/api
```

### Database Settings
```
https://app.supabase.com/project/xptonqqagxcpzlgndilj/settings/database
```

### Storage Settings
```
https://app.supabase.com/project/xptonqqagxcpzlgndilj/storage/buckets
```

### SQL Editor
```
https://app.supabase.com/project/xptonqqagxcpzlgndilj/editor
```

---

## 🧪 Testar Conexão

### Backend (Node.js)

```bash
# 1. Ir para o diretório do backend
cd apps/backend

# 2. Testar conexão com Prisma
npx prisma db pull

# 3. Verificar se conectou
# Deve mostrar: "Introspecting based on datasource defined in prisma/schema.prisma"
```

### Frontend (Next.js)

```bash
# 1. Ir para o diretório do frontend
cd apps/frontend

# 2. Iniciar servidor de desenvolvimento
npm run dev

# 3. Verificar console
# Não deve ter erros de conexão com Supabase
```

### Teste Direto (psql)

```bash
# Substituir [SUA_SENHA] pela senha do banco
psql "postgresql://postgres:[SUA_SENHA]@db.xptonqqagxcpzlgndilj.supabase.co:5432/postgres"

# Se conectar, executar:
SELECT version();

# Deve retornar: PostgreSQL 17.6.1.008
```

---

## 🔧 Troubleshooting

### Erro: "password authentication failed"

**Causa:** Senha incorreta no `DATABASE_URL`

**Solução:**
1. Acesse: https://app.supabase.com/project/xptonqqagxcpzlgndilj/settings/database
2. Clique em **"Reset database password"**
3. Copie a nova senha
4. Atualize `DATABASE_URL` nos arquivos `.env`

---

### Erro: "Invalid API key"

**Causa:** `SUPABASE_ANON_KEY` ou `SUPABASE_SERVICE_ROLE_KEY` incorreta

**Solução:**
1. Acesse: https://app.supabase.com/project/xptonqqagxcpzlgndilj/settings/api
2. Copie as keys corretas
3. Atualize os arquivos `.env`

---

### Erro: "Connection timeout"

**Causa:** Firewall ou rede bloqueando conexão

**Solução:**
1. Verifique se está conectado à internet
2. Teste ping: `ping db.xptonqqagxcpzlgndilj.supabase.co`
3. Verifique firewall/VPN

---

### Erro: "SSL connection required"

**Causa:** Conexão sem SSL

**Solução:**
Adicione `?sslmode=require` ao final da `DATABASE_URL`:
```bash
DATABASE_URL="postgresql://postgres:[SENHA]@db.xptonqqagxcpzlgndilj.supabase.co:5432/postgres?sslmode=require"
```

---

## 📚 Recursos Adicionais

### Documentação Oficial
- **Supabase Docs:** https://supabase.com/docs
- **Database Docs:** https://supabase.com/docs/guides/database
- **API Docs:** https://supabase.com/docs/guides/api

### Documentação DIBEA
- **Referência Completa:** `docs/DIBEA_SUPABASE_REFERENCE.md`
- **Schema do Banco:** `docs/ERD_DIBEA.md`
- **Guia de Setup:** `SETUP_GUIDE.md`

---

## 🔒 Segurança

### ✅ Boas Práticas

1. **Nunca commite credenciais:**
   ```bash
   # Adicione ao .gitignore
   .env
   .env.local
   .env.production
   ```

2. **Use variáveis de ambiente em produção:**
   ```bash
   # Vercel, Railway, etc.
   # Configure as variáveis no dashboard
   ```

3. **Rotacione keys periodicamente:**
   - Service Role Key: a cada 90 dias
   - Database Password: a cada 180 dias

4. **Monitore uso:**
   - Acesse: https://app.supabase.com/project/xptonqqagxcpzlgndilj/settings/billing
   - Verifique uso de API, storage, bandwidth

### ⚠️ O Que NUNCA Fazer

- ❌ Commitar `.env` no Git
- ❌ Expor Service Role Key no frontend
- ❌ Compartilhar credenciais em chat/email
- ❌ Usar mesma senha em dev/prod
- ❌ Desabilitar SSL em produção

---

## 📞 Suporte

### Problemas com Supabase
- **Discord:** https://discord.supabase.com
- **GitHub:** https://github.com/supabase/supabase/issues
- **Docs:** https://supabase.com/docs

### Problemas com DIBEA
- **Documentação:** `docs/`
- **Issues:** GitHub Issues do projeto

---

**Última atualização:** Janeiro 2025  
**Status:** ✅ Configuração validada e testada

