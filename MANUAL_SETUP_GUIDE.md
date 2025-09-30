# 🎯 DIBEA - Guia de Setup Manual (Dashboard)

## ✅ **CHECKLIST COMPLETO**

Vamos configurar tudo pelo Dashboard do Supabase e testar com o N8N do Elestio.

---

## 📊 **PASSO 1: VERIFICAR/EXECUTAR MIGRATIONS**

### **1.1. Acessar SQL Editor**

1. Abrir: https://supabase.com/dashboard/project/xptonqqagxcpzlgndilj
2. Menu lateral → **SQL Editor**
3. Clicar em **New Query**

### **1.2. Executar Migrations (em ordem)**

**Migration 1: Initial Schema**
```sql
-- Copiar todo o conteúdo de: supabase/migrations/001_initial_schema.sql
-- Colar no SQL Editor
-- Clicar em RUN
```

**Migration 2: Medical and Campaigns**
```sql
-- Copiar todo o conteúdo de: supabase/migrations/002_medical_and_campaigns.sql
-- Colar no SQL Editor
-- Clicar em RUN
```

**Migration 3: Notifications and WhatsApp**
```sql
-- Copiar todo o conteúdo de: supabase/migrations/003_notifications_and_whatsapp.sql
-- Colar no SQL Editor
-- Clicar em RUN
```

**Migration 4: Triggers and Functions**
```sql
-- Copiar todo o conteúdo de: supabase/migrations/004_triggers_and_functions.sql
-- Colar no SQL Editor
-- Clicar em RUN
```

**Migration 5: RLS Policies**
```sql
-- Copiar todo o conteúdo de: supabase/migrations/005_rls_policies.sql
-- Colar no SQL Editor
-- Clicar em RUN
```

**Migration 6: Seed Data**
```sql
-- Copiar todo o conteúdo de: supabase/migrations/006_seed_data.sql
-- Colar no SQL Editor
-- Clicar em RUN
```

### **1.3. Verificar Tabelas**

1. Menu lateral → **Table Editor**
2. Verificar se existem:
   - ✅ municipios
   - ✅ users
   - ✅ tutores
   - ✅ animais
   - ✅ adocoes
   - ✅ agendamentos
   - ✅ campanhas
   - ✅ conversas_whatsapp
   - ... (25 tabelas no total)

3. Clicar em **animais** → Ver se tem dados (Rex, Luna, Mia)

---

## 🚀 **PASSO 2: DEPLOY EDGE FUNCTIONS**

### **2.1. Acessar Edge Functions**

1. Menu lateral → **Edge Functions**
2. Clicar em **Deploy a new function**

### **2.2. Deploy search-animals**

1. **Function name:** `search-animals`
2. **Code:** Copiar de `supabase/functions/search-animals/index.ts`
3. Incluir também os arquivos shared:
   - `_shared/auth.ts`
   - `_shared/errors.ts`
   - `_shared/validators.ts`

**OU usar CLI (se conseguir fazer login):**
```bash
npx supabase functions deploy search-animals --no-verify-jwt
```

### **2.3. Deploy create-adoption**

1. **Function name:** `create-adoption`
2. **Code:** Copiar de `supabase/functions/create-adoption/index.ts`
3. Incluir também os arquivos shared

**OU usar CLI:**
```bash
npx supabase functions deploy create-adoption --no-verify-jwt
```

### **2.4. Verificar Deploy**

Testar com curl:
```bash
curl -X POST \
  https://xptonqqagxcpzlgndilj.supabase.co/functions/v1/search-animals \
  -H "Authorization: Bearer SEU_SERVICE_ROLE_KEY" \
  -H "Content-Type: application/json" \
  -H "X-User-Phone: +5511999999999" \
  -d '{"especie": "CANINO", "status": "DISPONIVEL"}'
```

**Resposta esperada:**
```json
{
  "success": true,
  "data": {
    "animals": [
      {"id": "...", "nome": "Rex", "especie": "CANINO"},
      {"id": "...", "nome": "Luna", "especie": "CANINO"}
    ],
    "total": 2
  }
}
```

---

## 🔧 **PASSO 3: CONFIGURAR N8N (ELESTIO)**

### **3.1. Acessar N8N**

URL: https://n8n-moveup-u53084.vm.elestio.app/

### **3.2. Importar/Verificar Workflow**

1. Workflows → Ver se workflow DIBEA existe
2. Se não existir: Import from File → `n8n/n8n-file.json`

### **3.3. Atualizar Workflow**

**Node: HTTP Request3 (QUERY)**

1. Clicar no node "HTTP Request3"
2. **URL:** Mudar para:
   ```
   https://xptonqqagxcpzlgndilj.supabase.co/functions/v1/{{ $json.function }}
   ```
3. **Headers:** Adicionar:
   ```
   X-User-Phone: {{ $('When chat message received').item.json.sessionId || '+5511999999999' }}
   ```

**Node: HTTP Request4 (ACTION)**

1. Clicar no node "HTTP Request4"
2. **URL:** Mudar para:
   ```
   https://xptonqqagxcpzlgndilj.supabase.co/functions/v1/{{ $json.function }}
   ```
3. **Headers:** Adicionar:
   ```
   X-User-Phone: {{ $('When chat message received').item.json.sessionId || '+5511999999999' }}
   ```

**Node: SMART AGENT1**

1. Clicar no node "SMART AGENT1"
2. Copiar prompt de: `n8n/N8N_UPDATE_GUIDE.md` (seção 3)
3. Colar no campo "Prompt"

**Node: Format-Response**

1. Clicar no node "Format-Response"
2. Copiar código de: `n8n/N8N_UPDATE_GUIDE.md` (seção 4)
3. Colar no campo "JavaScript Code"

### **3.4. Salvar e Ativar**

1. Clicar em **Save**
2. Ativar workflow (toggle no canto superior direito)

---

## 🧪 **PASSO 4: TESTAR INTEGRAÇÃO**

### **4.1. Testar Webhook Diretamente**

```bash
curl -X POST \
  https://n8n-moveup-u53084.vm.elestio.app/webhook-test/d0fff20e-124c-49f3-8ccf-a615504c5fc1 \
  -H "Content-Type: application/json" \
  -d '{
    "sessionId": "+5511999999999",
    "chatInput": "Quero adotar um cachorro"
  }'
```

**Resposta esperada:**
```json
{
  "response": "🐶 Encontrei 2 cachorros disponíveis!...",
  "success": true
}
```

### **4.2. Testar no N8N**

1. N8N → Workflows → DIBEA
2. Clicar em **Execute Workflow**
3. No chat, digitar: "Quero adotar um cachorro"
4. Ver resposta

### **4.3. Ver Logs**

**Supabase:**
- Dashboard → Edge Functions → Logs

**N8N:**
- Executions → Ver última execução
- Clicar em cada node para ver input/output

---

## 📊 **PASSO 5: VALIDAÇÃO FINAL**

### **5.1. Verificar Dados no Banco**

```sql
-- Ver animais
SELECT id, nome, especie, porte, status FROM animais;

-- Ver conversas (se houver)
SELECT * FROM conversas_whatsapp ORDER BY created_at DESC LIMIT 5;

-- Ver mensagens (se houver)
SELECT * FROM mensagens_whatsapp ORDER BY created_at DESC LIMIT 10;
```

### **5.2. Checklist**

- [ ] Migrations executadas (25 tabelas criadas)
- [ ] Seed data carregado (Rex, Luna, Mia)
- [ ] Edge Functions deployadas (search-animals, create-adoption)
- [ ] N8N workflow atualizado
- [ ] Workflow ativo
- [ ] Teste básico passou (buscar animais)
- [ ] Logs sem erros

---

## 🎯 **CASOS DE TESTE**

### **Teste 1: Buscar Todos os Animais**
```
Mensagem: "Quero adotar um pet"
Esperado: Lista com Rex, Luna e Mia
```

### **Teste 2: Buscar Cachorros**
```
Mensagem: "Quero adotar um cachorro"
Esperado: Lista com Rex e Luna
```

### **Teste 3: Buscar Cachorro Grande**
```
Mensagem: "Quero um cachorro grande"
Esperado: Apenas Rex
```

### **Teste 4: Buscar Gatos**
```
Mensagem: "Tem gatos disponíveis?"
Esperado: Apenas Mia
```

### **Teste 5: Buscar por Nome**
```
Mensagem: "Me fale sobre a Luna"
Esperado: Detalhes da Luna
```

---

## 🐛 **TROUBLESHOOTING**

### **Erro: "Function not found"**
- Edge Functions não foram deployadas
- Verificar em: Dashboard → Edge Functions

### **Erro: "Table does not exist"**
- Migrations não foram executadas
- Executar migrations no SQL Editor

### **Erro: "No data found"**
- Seed data não foi carregado
- Executar migration 006_seed_data.sql

### **Erro: "Invalid Authorization"**
- Service Role Key incorreta
- Verificar em: Dashboard → Settings → API

---

## 📞 **PRÓXIMOS PASSOS**

Após validar tudo:

1. ✅ Implementar Edge Functions restantes
2. ✅ Desenvolver interface Next.js
3. ✅ Criar diferentes views por usuário
4. ✅ Deploy em produção

---

## 🔑 **INFORMAÇÕES IMPORTANTES**

**Supabase Project:**
- URL: https://xptonqqagxcpzlgndilj.supabase.co
- Project ID: xptonqqagxcpzlgndilj

**N8N:**
- URL: https://n8n-moveup-u53084.vm.elestio.app/
- Webhook: /webhook-test/d0fff20e-124c-49f3-8ccf-a615504c5fc1

**Município Padrão:**
- ID: 0b227971-5134-4992-b83c-b4f35cabb1c0
- Nome: São Paulo

---

**Siga este guia passo a passo e tudo vai funcionar!** 🚀

