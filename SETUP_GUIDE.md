# 🚀 DIBEA - Guia Completo de Setup

## 📋 **PRÉ-REQUISITOS**

- Node.js 18+ e npm/yarn/pnpm
- Conta no Supabase
- Conta no N8N (self-hosted ou cloud)
- Conta no Twilio (para WhatsApp) ou Evolution API
- Conta no OpenAI (ou outro provedor de LLM)
- Git

---

## 🏗️ **PARTE 1: SETUP DO SUPABASE**

### **1.1. Criar Projeto no Supabase**

1. Acesse https://supabase.com
2. Crie novo projeto
3. Anote as credenciais:
   - `Project URL`
   - `anon/public key`
   - `service_role key`

### **1.2. Executar Migrations**

```bash
# Instalar Supabase CLI
npm install -g supabase

# Login
supabase login

# Link ao projeto
supabase link --project-ref xptonqqagxcpzlgndilj

# Executar migrations
supabase db push

# Ou manualmente no Dashboard:
# SQL Editor → Copiar conteúdo de cada migration e executar em ordem:
# 001_initial_schema.sql
# 002_medical_and_campaigns.sql
# 003_notifications_and_whatsapp.sql
# 004_triggers_and_functions.sql
# 005_rls_policies.sql
# 006_seed_data.sql
```

### **1.3. Verificar Tabelas**

No Supabase Dashboard → Table Editor, você deve ver:
- ✅ municipios
- ✅ users
- ✅ tutores
- ✅ animais
- ✅ adocoes
- ✅ agendamentos
- ✅ atendimentos
- ✅ campanhas
- ✅ notificacoes
- ✅ conversas_whatsapp
- ... e outras

### **1.4. Deploy Edge Functions**

```bash
# Deploy todas as functions
supabase functions deploy search-animals
supabase functions deploy create-adoption

# Ou deploy todas de uma vez
supabase functions deploy --no-verify-jwt
```

### **1.5. Configurar Storage Buckets**

No Supabase Dashboard → Storage:

1. Criar buckets:
   - `animals` (público)
   - `documents` (privado)
   - `prescriptions` (privado)

2. Configurar políticas de acesso (RLS)

---

## 🔧 **PARTE 2: SETUP DO N8N**

### **2.1. Instalar N8N**

**Opção A: Docker (Recomendado)**

```bash
docker run -it --rm \
  --name n8n \
  -p 5678:5678 \
  -e N8N_BASIC_AUTH_ACTIVE=true \
  -e N8N_BASIC_AUTH_USER=admin \
  -e N8N_BASIC_AUTH_PASSWORD=admin123 \
  -v ~/.n8n:/home/node/.n8n \
  n8nio/n8n
```

**Opção B: npm**

```bash
npm install -g n8n
n8n start
```

Acesse: http://localhost:5678

### **2.2. Configurar Variáveis de Ambiente**

No N8N → Settings → Environment Variables:

```
SUPABASE_URL=https://xptonqqagxcpzlgndilj.supabase.co
SUPABASE_SERVICE_ROLE_KEY=seu_service_role_key
SUPABASE_ANON_KEY=seu_anon_key
WHATSAPP_ACCOUNT_SID=seu_twilio_sid
WHATSAPP_AUTH_TOKEN=seu_twilio_token
WHATSAPP_FROM_NUMBER=whatsapp:+5511999999999
OPENAI_API_KEY=sk-seu-openai-key
OPENAI_MODEL=gpt-4-turbo-preview
DEFAULT_MUNICIPALITY_ID=0b227971-5134-4992-b83c-b4f35cabb1c0
```

### **2.3. Importar Workflow**

1. No N8N → Workflows → Import from File
2. Selecione `n8n/n8n-file.json`
3. Ative o workflow

### **2.4. Configurar Webhook do WhatsApp**

**Se usar Twilio:**

1. Acesse Twilio Console → WhatsApp → Sandbox
2. Configure Webhook URL:
   ```
   https://seu-n8n-domain.com/webhook/whatsapp
   ```
3. Método: POST

**Se usar Evolution API:**

1. Configure webhook na Evolution API
2. Aponte para o webhook do N8N

---

## 💻 **PARTE 3: SETUP DO NEXT.JS (Frontend)**

### **3.1. Instalar Dependências**

```bash
# Clone o repositório (se ainda não fez)
git clone https://github.com/seu-usuario/dibea.git
cd dibea

# Instalar dependências
npm install
# ou
yarn install
# ou
pnpm install
```

### **3.2. Configurar Variáveis de Ambiente**

```bash
# Copiar template
cp .env.example .env.local

# Editar .env.local com suas credenciais
nano .env.local
```

Preencha:
```bash
NEXT_PUBLIC_SUPABASE_URL=https://xptonqqagxcpzlgndilj.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=seu_anon_key
NEXT_PUBLIC_APP_URL=http://localhost:3000
```

### **3.3. Executar em Desenvolvimento**

```bash
npm run dev
# ou
yarn dev
# ou
pnpm dev
```

Acesse: http://localhost:3000

### **3.4. Criar Usuário Admin**

**Opção A: Via Supabase Dashboard**

1. Authentication → Users → Add User
2. Email: admin@dibea.com.br
3. Password: (sua senha)
4. Confirmar email automaticamente

5. SQL Editor → Executar:
```sql
UPDATE users 
SET role = 'ADMIN', 
    municipality_id = '0b227971-5134-4992-b83c-b4f35cabb1c0'
WHERE email = 'admin@dibea.com.br';
```

**Opção B: Via Signup no App**

1. Acesse http://localhost:3000/signup
2. Crie conta
3. Atualize role via SQL (como acima)

---

## 🧪 **PARTE 4: TESTES**

### **4.1. Testar Edge Functions**

```bash
# Buscar animais
curl -X POST \
  https://xptonqqagxcpzlgndilj.supabase.co/functions/v1/search-animals \
  -H "Authorization: Bearer SEU_SERVICE_ROLE_KEY" \
  -H "Content-Type: application/json" \
  -H "X-User-Phone: +5511999999999" \
  -d '{
    "especie": "CANINO",
    "status": "DISPONIVEL"
  }'

# Deve retornar lista de animais
```

### **4.2. Testar N8N Workflow**

1. N8N → Workflows → Seu workflow
2. Execute manualmente com payload de teste:
```json
{
  "from": "+5511999999999",
  "body": "Quero adotar um cachorro",
  "messageId": "test-123",
  "timestamp": "2025-01-10T10:00:00Z"
}
```

3. Verifique logs de cada node

### **4.3. Testar WhatsApp (End-to-End)**

1. Adicione seu número no Twilio Sandbox
2. Envie mensagem: "Quero adotar um cachorro"
3. Verifique resposta do bot

### **4.4. Testar Frontend**

1. Login: http://localhost:3000/login
2. Email: admin@dibea.com.br
3. Senha: (sua senha)
4. Navegue pelas páginas:
   - Dashboard
   - Animais
   - Adoções
   - Agendamentos
   - Campanhas

---

## 📊 **PARTE 5: MONITORAMENTO**

### **5.1. Logs do Supabase**

Dashboard → Logs → Edge Functions

### **5.2. Logs do N8N**

Executions → Ver detalhes

### **5.3. Logs do Next.js**

Terminal onde está rodando `npm run dev`

### **5.4. Database Queries**

```sql
-- Conversas ativas
SELECT * FROM conversas_whatsapp WHERE status = 'ATIVA';

-- Últimas mensagens
SELECT * FROM mensagens_whatsapp ORDER BY created_at DESC LIMIT 10;

-- Adoções pendentes
SELECT * FROM adocoes WHERE status IN ('SOLICITADA', 'EM_ANALISE');

-- Logs de auditoria
SELECT * FROM logs_auditoria ORDER BY created_at DESC LIMIT 20;
```

---

## 🚨 **TROUBLESHOOTING**

### **Problema: Edge Function retorna 401**

**Solução:**
- Verificar `SUPABASE_SERVICE_ROLE_KEY`
- Verificar header `Authorization`

### **Problema: N8N não recebe mensagens do WhatsApp**

**Solução:**
- Verificar webhook URL no Twilio
- Verificar se N8N está acessível publicamente (use ngrok em dev)
- Verificar logs do Twilio

### **Problema: Frontend não conecta ao Supabase**

**Solução:**
- Verificar `NEXT_PUBLIC_SUPABASE_URL` e `NEXT_PUBLIC_SUPABASE_ANON_KEY`
- Verificar CORS no Supabase (Dashboard → Settings → API)
- Limpar cache do navegador

### **Problema: RLS bloqueia queries**

**Solução:**
- Usar `service_role_key` para operações administrativas
- Verificar políticas RLS no Supabase
- Verificar se usuário tem role correto

---

## 📚 **PRÓXIMOS PASSOS**

1. ✅ Implementar mais Edge Functions
2. ✅ Criar páginas do frontend
3. ✅ Configurar CI/CD
4. ✅ Deploy em produção
5. ✅ Configurar domínio customizado
6. ✅ Configurar SSL
7. ✅ Configurar backup automático
8. ✅ Implementar monitoramento (Sentry, etc)

---

## 🎉 **PRONTO!**

Seu sistema DIBEA está configurado e rodando!

**Acesse:**
- Frontend: http://localhost:3000
- N8N: http://localhost:5678
- Supabase: https://supabase.com/dashboard

**Teste via WhatsApp:**
Envie: "Oi, quero adotar um cachorro"

---

## 📞 **SUPORTE**

- Documentação: `/docs`
- Issues: GitHub Issues
- Email: suporte@dibea.com.br

