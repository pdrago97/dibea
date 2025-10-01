# Resumo das Correções de Segurança - DIBEA

## 🔒 Vulnerabilidades Corrigidas

### 1. Credenciais Hardcoded Removidas

**Arquivo:** `apps/frontend/src/lib/supabase.ts`

**Antes:**
```typescript
const supabaseUrl = 'https://[PROJECT-ID].supabase.co';
const supabaseAnonKey = '[HARDCODED-KEY]';
```

**Depois:**
```typescript
const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;

if (!supabaseUrl || !supabaseAnonKey) {
  throw new Error('Missing Supabase environment variables');
}
```

### 2. Arquivos .env Removidos do Repositório

Arquivos removidos:
- ✅ `.env.dev` (continha Pinecone API key real)
- ✅ `.env.production` (continha Pinecone API key real)
- ✅ `.env.prod.example` (continha credenciais de exemplo)
- ✅ `apps/backend/.env.docker` (continha credenciais)
- ✅ `supabase/.temp/pooler-url` (continha URL de conexão)
- ✅ `supabase/.temp/project-ref` (continha project ID)

### 3. .gitignore Atualizado

Adicionadas as seguintes regras:

```gitignore
# Arquivos de ambiente
.env
.env.local
.env.development
.env.development.local
.env.test
.env.test.local
.env.production
.env.production.local
.env.dev
.env.prod
*.env
!.env.example
apps/**/.env
apps/**/.env.local
apps/**/.env.docker
supabase/.temp/
```

### 4. .env.example Sanitizado

**Antes:**
```bash
SUPABASE_URL=https://[PROJECT-ID].supabase.co
DEFAULT_MUNICIPALITY_ID=[MUNICIPALITY-UUID]
```

**Depois:**
```bash
SUPABASE_URL=https://your-project-id.supabase.co
DEFAULT_MUNICIPALITY_ID=your_municipality_uuid_here
```

## 🛡️ Proteções Implementadas

### 1. Git Hooks de Segurança

Criado script `scripts/setup-git-hooks.sh` que instala:

#### Pre-commit Hook
- ✅ Bloqueia commit de arquivos `.env`
- ✅ Detecta credenciais hardcoded (OpenAI, Supabase, Pinecone, AWS, GitHub)
- ✅ Bloqueia arquivos temporários do Supabase
- ✅ Avisa sobre arquivos grandes (>1MB)
- ✅ Detecta conflitos não resolvidos em package-lock.json

#### Commit-msg Hook
- ✅ Avisa se mensagem contém palavras sensíveis (password, secret, api key, token)

#### Pre-push Hook
- ✅ Verificação final antes do push
- ✅ Bloqueia push se houver arquivos .env no repositório

### 2. Validação de Variáveis de Ambiente

Código atualizado para validar variáveis obrigatórias:

```typescript
if (!process.env.SUPABASE_URL || !process.env.SUPABASE_ANON_KEY) {
  throw new Error('Missing Supabase environment variables');
}
```

### 3. Documentação de Segurança

Criado `SECURITY.md` com:
- ✅ Guia de configuração de variáveis de ambiente
- ✅ Procedimentos para revogar credenciais expostas
- ✅ Boas práticas de segurança
- ✅ Checklist de segurança para deploy
- ✅ Ferramentas recomendadas (TruffleHog, GitLeaks, git-secrets)

## 📋 Credenciais que Precisam ser Revogadas

### ⚠️ AÇÃO IMEDIATA NECESSÁRIA

As seguintes credenciais foram expostas e **DEVEM SER REVOGADAS**:

### 1. Supabase

**Project ID:** `[REDACTED]`

**Anon Key (exposta):**
```
[REDACTED - JWT token was exposed in previous commits]
```

**Como revogar:**
1. Acesse: https://app.supabase.com/project/[YOUR-PROJECT-ID]/settings/api
2. Clique em "Reset" na seção "Project API keys"
3. Copie as novas chaves
4. Atualize `.env.local` com as novas chaves

### 2. Pinecone

**API Key (exposta):**
```
[REDACTED - Pinecone API key was exposed in previous commits]
```

**Como revogar:**
1. Acesse: https://app.pinecone.io/
2. Vá em "API Keys"
3. Revogue a chave exposta
4. Crie uma nova chave
5. Atualize `.env.local`

### 3. N8N

**Webhook ID (exposto):**
```
[REDACTED - Webhook ID was exposed in previous commits]
```

**Como proteger:**
1. Acesse sua instância N8N
2. Desative o workflow DIBEA2
3. Crie um novo webhook com novo ID
4. Atualize a configuração no frontend

## 🚀 Próximos Passos

### Imediato (Hoje)

1. **Revogar todas as credenciais expostas** (ver seção acima)
2. **Atualizar `.env.local`** com novas credenciais
3. **Testar a aplicação** com novas credenciais
4. **Verificar se git hooks estão funcionando:**
   ```bash
   # Tentar commitar um arquivo .env (deve falhar)
   touch .env.test
   git add .env.test
   git commit -m "test"  # Deve ser bloqueado
   ```

### Curto Prazo (Esta Semana)

1. **Limpar histórico do Git** (remover credenciais antigas)
   ```bash
   # Usar BFG Repo-Cleaner
   bfg --delete-files .env.production
   bfg --delete-files .env.dev
   git reflog expire --expire=now --all
   git gc --prune=now --aggressive
   git push origin --force --all
   ```

2. **Configurar scanners de segurança:**
   ```bash
   # Instalar ferramentas
   brew install gitleaks trufflehog git-secrets
   
   # Escanear repositório
   gitleaks detect --source . --verbose
   trufflehog git file://. --json
   ```

3. **Configurar variáveis de ambiente em produção:**
   - Vercel: Adicionar variáveis no dashboard
   - Railway: Adicionar variáveis no dashboard
   - Supabase: Configurar Edge Functions secrets

### Médio Prazo (Este Mês)

1. **Implementar rotação de credenciais:**
   - Criar calendário de rotação (a cada 90 dias)
   - Documentar processo de rotação

2. **Configurar monitoramento:**
   - GitHub Secret Scanning
   - Dependabot para vulnerabilidades

3. **Revisar RLS policies no Supabase:**
   - Garantir que ANON key tem acesso limitado
   - Testar políticas de segurança

4. **Implementar rate limiting:**
   - N8N webhooks
   - Edge Functions

## ✅ Checklist de Verificação

Antes de fazer qualquer commit:

- [ ] Executei `./scripts/setup-git-hooks.sh`
- [ ] Revisei `git status` antes de `git add`
- [ ] Verifiquei que nenhum arquivo .env está staged
- [ ] Revisei `git diff --cached` antes de commit
- [ ] Mensagem de commit não contém credenciais
- [ ] Testei localmente com `.env.local`

Antes de fazer deploy:

- [ ] Todas as credenciais foram revogadas e renovadas
- [ ] Variáveis de ambiente configuradas no ambiente de produção
- [ ] RLS policies testadas e funcionando
- [ ] Rate limiting configurado
- [ ] Logs não expõem credenciais
- [ ] CORS configurado corretamente
- [ ] Webhooks têm autenticação

## 📚 Recursos

- `SECURITY.md` - Documentação completa de segurança
- `scripts/setup-git-hooks.sh` - Script de configuração de hooks
- `.env.example` - Template de variáveis de ambiente
- `.gitignore` - Arquivos ignorados pelo Git

## 🆘 Suporte

Se você tiver dúvidas sobre segurança:

1. Leia `SECURITY.md`
2. Verifique se os git hooks estão instalados
3. Teste localmente antes de commitar
4. Em caso de dúvida, pergunte antes de commitar

## 📊 Estatísticas

- **Arquivos removidos:** 6
- **Credenciais expostas:** 3 (Supabase, Pinecone, N8N)
- **Linhas de código corrigidas:** ~50
- **Git hooks instalados:** 3 (pre-commit, commit-msg, pre-push)
- **Documentação criada:** 2 arquivos (SECURITY.md, este arquivo)

---

**Data da correção:** 2025-10-01  
**Responsável:** Pedro Drago Reichow  
**Status:** ✅ Correções aplicadas, aguardando revogação de credenciais

