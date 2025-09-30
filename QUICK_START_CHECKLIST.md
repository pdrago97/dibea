# ✅ DIBEA - Checklist Rápido de Setup

## 🎯 **OBJETIVO**

Configurar e testar a integração completa: **Supabase + N8N + Edge Functions**

---

## 📋 **CHECKLIST (Marque conforme avança)**

### **FASE 1: BANCO DE DADOS** 🗄️

- [ ] **1.1** Acessar Supabase Dashboard
  - URL: https://supabase.com/dashboard/project/xptonqqagxcpzlgndilj
  
- [ ] **1.2** Executar Migration 1 (Initial Schema)
  - SQL Editor → New Query
  - Copiar: `supabase/migrations/001_initial_schema.sql`
  - RUN
  
- [ ] **1.3** Executar Migration 2 (Medical and Campaigns)
  - Copiar: `supabase/migrations/002_medical_and_campaigns.sql`
  - RUN
  
- [ ] **1.4** Executar Migration 3 (Notifications)
  - Copiar: `supabase/migrations/003_notifications_and_whatsapp.sql`
  - RUN
  
- [ ] **1.5** Executar Migration 4 (Triggers)
  - Copiar: `supabase/migrations/004_triggers_and_functions.sql`
  - RUN
  
- [ ] **1.6** Executar Migration 5 (RLS)
  - Copiar: `supabase/migrations/005_rls_policies.sql`
  - RUN
  
- [ ] **1.7** Executar Migration 6 (Seed Data)
  - Copiar: `supabase/migrations/006_seed_data.sql`
  - RUN
  
- [ ] **1.8** Verificar Tabelas
  - Table Editor → Ver 25 tabelas
  - Clicar em `animais` → Ver Rex, Luna, Mia

**Status:** ⬜ Não iniciado | 🟡 Em progresso | ✅ Concluído

---

### **FASE 2: EDGE FUNCTIONS** 🚀

- [ ] **2.1** Copiar Service Role Key
  - Dashboard → Settings → API
  - Copiar `service_role` key
  - Guardar em local seguro
  
- [ ] **2.2** Deploy search-animals
  - **Opção A (CLI):**
    ```bash
    npx supabase functions deploy search-animals --no-verify-jwt
    ```
  - **Opção B (Manual):**
    - Edge Functions → Deploy new function
    - Nome: `search-animals`
    - Copiar código de: `supabase/functions/search-animals/index.ts`
    - Incluir `_shared/*.ts`
  
- [ ] **2.3** Deploy create-adoption
  - **Opção A (CLI):**
    ```bash
    npx supabase functions deploy create-adoption --no-verify-jwt
    ```
  - **Opção B (Manual):**
    - Edge Functions → Deploy new function
    - Nome: `create-adoption`
    - Copiar código de: `supabase/functions/create-adoption/index.ts`
  
- [ ] **2.4** Testar Edge Function
  ```bash
  curl -X POST \
    https://xptonqqagxcpzlgndilj.supabase.co/functions/v1/search-animals \
    -H "Authorization: Bearer SUA_SERVICE_ROLE_KEY" \
    -H "Content-Type: application/json" \
    -H "X-User-Phone: +5511999999999" \
    -d '{"especie": "CANINO", "status": "DISPONIVEL"}'
  ```
  - Deve retornar: `{"success": true, "data": {...}}`

**Status:** ⬜ Não iniciado | 🟡 Em progresso | ✅ Concluído

---

### **FASE 3: N8N WORKFLOW** 🔧

- [ ] **3.1** Acessar N8N
  - URL: https://n8n-moveup-u53084.vm.elestio.app/
  
- [ ] **3.2** Verificar/Importar Workflow
  - Workflows → Ver se "DIBEA" existe
  - Se não: Import from File → `n8n/n8n-file.json`
  
- [ ] **3.3** Atualizar HTTP Request3
  - Clicar no node "HTTP Request3"
  - URL: `https://xptonqqagxcpzlgndilj.supabase.co/functions/v1/{{ $json.function }}`
  - Headers → Add:
    - `X-User-Phone: {{ $('When chat message received').item.json.sessionId || '+5511999999999' }}`
  
- [ ] **3.4** Atualizar HTTP Request4
  - Clicar no node "HTTP Request4"
  - URL: `https://xptonqqagxcpzlgndilj.supabase.co/functions/v1/{{ $json.function }}`
  - Headers → Add:
    - `X-User-Phone: {{ $('When chat message received').item.json.sessionId || '+5511999999999' }}`
  
- [ ] **3.5** Atualizar SMART AGENT1
  - Clicar no node "SMART AGENT1"
  - Copiar prompt de: `n8n/N8N_UPDATE_GUIDE.md` (seção 3)
  - Colar no campo "Prompt"
  
- [ ] **3.6** Atualizar Format-Response
  - Clicar no node "Format-Response"
  - Copiar código de: `n8n/N8N_UPDATE_GUIDE.md` (seção 4)
  - Colar no campo "JavaScript Code"
  
- [ ] **3.7** Salvar e Ativar
  - Save
  - Toggle ON (canto superior direito)

**Status:** ⬜ Não iniciado | 🟡 Em progresso | ✅ Concluído

---

### **FASE 4: TESTES** 🧪

- [ ] **4.1** Teste Rápido (Webhook)
  ```bash
  curl -X POST \
    https://n8n-moveup-u53084.vm.elestio.app/webhook-test/d0fff20e-124c-49f3-8ccf-a615504c5fc1 \
    -H "Content-Type: application/json" \
    -d '{"sessionId": "+5511999999999", "chatInput": "Quero adotar um cachorro"}'
  ```
  
- [ ] **4.2** Teste no N8N
  - N8N → Workflows → DIBEA
  - Execute Workflow
  - Chat: "Quero adotar um cachorro"
  - Ver resposta
  
- [ ] **4.3** Teste: Buscar Cachorros
  - Mensagem: "Quero adotar um cachorro"
  - Esperado: Rex e Luna
  
- [ ] **4.4** Teste: Buscar Gatos
  - Mensagem: "Tem gatos disponíveis?"
  - Esperado: Mia
  
- [ ] **4.5** Teste: Buscar por Porte
  - Mensagem: "Quero um cachorro grande"
  - Esperado: Rex
  
- [ ] **4.6** Teste: Buscar por Nome
  - Mensagem: "Me fale sobre a Luna"
  - Esperado: Detalhes da Luna
  
- [ ] **4.7** Executar Script de Teste
  ```bash
  ./test-integration.sh
  ```

**Status:** ⬜ Não iniciado | 🟡 Em progresso | ✅ Concluído

---

### **FASE 5: VALIDAÇÃO** ✅

- [ ] **5.1** Verificar Logs Supabase
  - Dashboard → Edge Functions → Logs
  - Sem erros
  
- [ ] **5.2** Verificar Logs N8N
  - Executions → Ver última execução
  - Todos os nodes verdes
  
- [ ] **5.3** Verificar Dados no Banco
  ```sql
  SELECT * FROM animais WHERE status = 'DISPONIVEL';
  SELECT * FROM conversas_whatsapp ORDER BY created_at DESC LIMIT 5;
  ```
  
- [ ] **5.4** Checklist Final
  - ✅ 25 tabelas criadas
  - ✅ Seed data carregado (Rex, Luna, Mia)
  - ✅ 2 Edge Functions deployadas
  - ✅ N8N workflow atualizado e ativo
  - ✅ Todos os testes passaram
  - ✅ Sem erros nos logs

**Status:** ⬜ Não iniciado | 🟡 Em progresso | ✅ Concluído

---

## 🎯 **PROGRESSO GERAL**

```
Fase 1: Banco de Dados     [        ] 0/8
Fase 2: Edge Functions     [        ] 0/4
Fase 3: N8N Workflow       [        ] 0/7
Fase 4: Testes             [        ] 0/7
Fase 5: Validação          [        ] 0/4
                           ============
                           TOTAL: 0/30
```

---

## 🐛 **TROUBLESHOOTING RÁPIDO**

| Erro | Solução |
|------|---------|
| "Function not found" | Deploy Edge Functions (Fase 2) |
| "Table does not exist" | Executar Migrations (Fase 1) |
| "No data found" | Executar Seed Data (Migration 6) |
| "Invalid Authorization" | Verificar Service Role Key |
| N8N não responde | Verificar workflow ativo |
| AGENT1 retorna camelCase | Atualizar prompt (Fase 3.5) |

---

## 📚 **DOCUMENTOS DE APOIO**

- `MANUAL_SETUP_GUIDE.md` - Guia detalhado passo a passo
- `n8n/N8N_UPDATE_GUIDE.md` - Atualizações do workflow
- `n8n/N8N_TEST_PLAN.md` - Plano de testes completo
- `n8n/USE_CASES_EXAMPLES.md` - Exemplos de conversas
- `test-integration.sh` - Script de teste automatizado

---

## 🚀 **APÓS CONCLUIR**

1. ✅ Implementar Edge Functions restantes (48 funções)
2. ✅ Desenvolver interface Next.js
3. ✅ Criar views por tipo de usuário
4. ✅ Deploy em produção

---

## 💡 **DICAS**

- **Salve frequentemente** no N8N
- **Teste cada fase** antes de avançar
- **Consulte os logs** em caso de erro
- **Use o script de teste** para validar tudo de uma vez

---

**Tempo estimado:** 1-2 horas

**Dificuldade:** ⭐⭐⭐ (Média)

**Boa sorte!** 🎉

