# Segurança - DIBEA

## ⚠️ IMPORTANTE: Gestão de Credenciais

Este projeto utiliza variáveis de ambiente para gerenciar credenciais sensíveis. **NUNCA** commite arquivos com credenciais reais.

## Arquivos Sensíveis

Os seguintes arquivos **NÃO DEVEM** ser commitados:

```
.env
.env.local
.env.development
.env.production
.env.dev
.env.prod
apps/**/.env
apps/**/.env.local
apps/**/.env.docker
supabase/.temp/
```

Todos estes arquivos estão no `.gitignore`.

## Configuração Inicial

### 1. Copiar Template de Variáveis

```bash
# Root do projeto
cp .env.example .env.local

# Frontend
cp apps/frontend/.env.example apps/frontend/.env.local

# Backend
cp apps/backend/.env.example apps/backend/.env.local
```

### 2. Preencher Credenciais Reais

Edite os arquivos `.env.local` com suas credenciais:

#### Supabase

Obtenha as credenciais em: https://app.supabase.com/project/YOUR_PROJECT/settings/api

```bash
SUPABASE_URL=https://your-project-id.supabase.co
SUPABASE_ANON_KEY=your_anon_key_here
SUPABASE_SERVICE_ROLE_KEY=your_service_role_key_here

NEXT_PUBLIC_SUPABASE_URL=https://your-project-id.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=your_anon_key_here
```

#### N8N

```bash
N8N_WEBHOOK_URL=https://your-n8n-instance.com
N8N_BASIC_AUTH_USER=admin
N8N_BASIC_AUTH_PASSWORD=your_secure_password
```

#### OpenAI

```bash
OPENAI_API_KEY=sk-...
```

#### Pinecone (se usar)

```bash
PINECONE_API_KEY=your_pinecone_api_key_here
PINECONE_INDEX_NAME=your-index-name
```

## Credenciais Expostas - Ação Imediata

Se você acidentalmente commitou credenciais:

### 1. Revogar Credenciais Imediatamente

**Supabase:**
1. Acesse: https://app.supabase.com/project/YOUR_PROJECT/settings/api
2. Clique em "Reset" nas chaves expostas
3. Atualize `.env.local` com as novas chaves

**OpenAI:**
1. Acesse: https://platform.openai.com/api-keys
2. Revogue a chave exposta
3. Crie uma nova chave
4. Atualize `.env.local`

**Pinecone:**
1. Acesse: https://app.pinecone.io/
2. Revogue a chave exposta
3. Crie uma nova chave
4. Atualize `.env.local`

**N8N:**
1. Altere a senha do usuário admin
2. Atualize `.env.local`

### 2. Remover do Histórico do Git

```bash
# Remover arquivo do histórico
git filter-branch --force --index-filter \
  "git rm --cached --ignore-unmatch .env.production" \
  --prune-empty --tag-name-filter cat -- --all

# Forçar push (CUIDADO!)
git push origin --force --all
```

**Alternativa mais segura (BFG Repo-Cleaner):**

```bash
# Instalar BFG
brew install bfg  # macOS
# ou baixar de: https://rtyley.github.io/bfg-repo-cleaner/

# Remover credenciais
bfg --delete-files .env.production
bfg --replace-text passwords.txt  # arquivo com credenciais a substituir

# Limpar
git reflog expire --expire=now --all
git gc --prune=now --aggressive

# Push
git push origin --force --all
```

### 3. Verificar Exposição

Verifique se as credenciais foram expostas publicamente:

```bash
# Buscar no GitHub
# https://github.com/search?q=repo:pdrago97/dibea+SUPABASE_ANON_KEY&type=code

# Verificar commits
git log --all --full-history -- .env.production
```

## Boas Práticas

### ✅ FAZER

1. **Sempre usar variáveis de ambiente**
   ```typescript
   const apiKey = process.env.OPENAI_API_KEY;
   ```

2. **Validar variáveis obrigatórias**
   ```typescript
   if (!process.env.SUPABASE_URL) {
     throw new Error('SUPABASE_URL is required');
   }
   ```

3. **Usar diferentes credenciais por ambiente**
   - Desenvolvimento: `.env.local`
   - Produção: Variáveis no Vercel/Railway/etc

4. **Rotacionar credenciais regularmente**
   - A cada 90 dias mínimo
   - Imediatamente se houver suspeita de exposição

5. **Usar secrets managers em produção**
   - Vercel: Environment Variables
   - Railway: Environment Variables
   - AWS: Secrets Manager
   - GCP: Secret Manager

### ❌ NÃO FAZER

1. **Hardcode de credenciais**
   ```typescript
   // ❌ NUNCA FAÇA ISSO
   const apiKey = 'sk-abc123...';
   ```

2. **Commit de arquivos .env**
   ```bash
   # ❌ NUNCA FAÇA ISSO
   git add .env.local
   git commit -m "Add env file"
   ```

3. **Compartilhar credenciais por email/chat**
   - Use ferramentas seguras: 1Password, Bitwarden, etc

4. **Usar mesmas credenciais em dev e prod**
   - Sempre separe ambientes

5. **Logar credenciais**
   ```typescript
   // ❌ NUNCA FAÇA ISSO
   console.log('API Key:', process.env.OPENAI_API_KEY);
   ```

## Verificação de Segurança

Execute antes de cada commit:

```bash
# Verificar se há credenciais expostas
git diff --cached | grep -i "api_key\|secret\|password\|token"

# Verificar arquivos staged
git status

# Se encontrar algo suspeito, unstage:
git reset HEAD .env.local
```

## Ferramentas Recomendadas

### Git Hooks (Pre-commit)

Crie `.git/hooks/pre-commit`:

```bash
#!/bin/bash

# Verificar se arquivos .env estão sendo commitados
if git diff --cached --name-only | grep -E '\.env$|\.env\.local$|\.env\.production$'; then
  echo "❌ ERRO: Tentativa de commit de arquivo .env detectada!"
  echo "Arquivos .env não devem ser commitados."
  exit 1
fi

# Verificar se há credenciais hardcoded
if git diff --cached | grep -iE 'api_key.*=.*["\']sk-|supabase.*anon.*key.*eyJ'; then
  echo "❌ ERRO: Possível credencial hardcoded detectada!"
  echo "Use variáveis de ambiente ao invés de hardcode."
  exit 1
fi

exit 0
```

Tornar executável:
```bash
chmod +x .git/hooks/pre-commit
```

### Scanners de Segurança

```bash
# TruffleHog - Detecta credenciais no histórico
pip install trufflehog
trufflehog git file://. --json

# GitLeaks - Detecta segredos
brew install gitleaks
gitleaks detect --source . --verbose

# git-secrets - Previne commits de segredos
brew install git-secrets
git secrets --install
git secrets --register-aws
```

## Contato de Segurança

Se você descobrir uma vulnerabilidade de segurança, por favor **NÃO** abra uma issue pública.

Envie um email para: security@dibea.com.br (ou contato do responsável)

## Checklist de Segurança

Antes de fazer deploy:

- [ ] Todas as credenciais estão em variáveis de ambiente
- [ ] Nenhum arquivo .env está commitado
- [ ] Credenciais de produção são diferentes de desenvolvimento
- [ ] Service role keys do Supabase estão protegidas (apenas backend)
- [ ] ANON keys do Supabase têm RLS habilitado
- [ ] Webhooks N8N têm autenticação
- [ ] CORS está configurado corretamente
- [ ] Rate limiting está habilitado
- [ ] Logs não expõem credenciais
- [ ] .gitignore está atualizado

## Recursos

- [Supabase Security Best Practices](https://supabase.com/docs/guides/platform/going-into-prod)
- [OWASP Top 10](https://owasp.org/www-project-top-ten/)
- [GitHub Secret Scanning](https://docs.github.com/en/code-security/secret-scanning)

