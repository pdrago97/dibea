# 🧪 DIBEA - Guia de Testes End-to-End

## 📋 Visão Geral

Este guia descreve como testar o fluxo completo do DIBEA via n8n, validando os dois casos principais:
- **QUERY** - Consultas ao sistema
- **ACTION** - Ações no sistema

---

## 🏗️ Arquitetura do Fluxo

```
┌─────────────────┐
│  Chat Input     │  Usuário envia mensagem
│  (n8n)          │
└────────┬────────┘
         │
         ▼
┌─────────────────┐
│  SMART AGENT 1  │  Analisa intenção (QUERY/ACTION)
│  (OpenAI)       │  Extrai função e parâmetros
└────────┬────────┘
         │
         ▼
┌─────────────────┐
│  Switch         │  Roteia baseado em intent
│  (QUERY/ACTION) │
└────────┬────────┘
         │
         ├──────────────────┐
         │                  │
         ▼                  ▼
┌─────────────────┐  ┌─────────────────┐
│  HTTP Request   │  │  HTTP Request   │
│  (Supabase)     │  │  (DIBEA API)    │
└────────┬────────┘  └────────┬────────┘
         │                    │
         └──────────┬─────────┘
                    ▼
         ┌─────────────────┐
         │ Format Response │  Normaliza output
         └────────┬────────┘
                  │
                  ▼
         ┌─────────────────┐
         │  SMART AGENT 2  │  Gera resposta amigável
         │  (OpenAI)       │
         └────────┬────────┘
                  │
                  ▼
         ┌─────────────────┐
         │  Resposta Final │  Exibida ao usuário
         └─────────────────┘
```

---

## 🎯 Teste 1: QUERY (Consulta)

### Objetivo
Validar que o sistema consegue consultar dados do Supabase e retornar informações corretas.

### Input de Teste
```
"Quantos animais existem no sistema?"
```

### Fluxo Esperado

1. **Chat Input** recebe a mensagem
2. **SMART AGENT 1** analisa e retorna:
   ```json
   {
     "intent": "QUERY",
     "function": "get_adoption_stats",
     "endpoint": "/rest/v1/rpc/get_adoption_stats",
     "parameters": {},
     "user_message": "Quantos animais existem no sistema?"
   }
   ```

3. **Switch** roteia para branch QUERY

4. **HTTP Request (Supabase)** executa:
   ```
   POST https://xptonqqagxcpzlgndilj.supabase.co/rest/v1/rpc/get_adoption_stats
   Headers:
     - apikey: [SUPABASE_ANON_KEY]
     - Authorization: Bearer [SUPABASE_ANON_KEY]
   ```

5. **Supabase** retorna:
   ```json
   {
     "total_animals": 4,
     "available_animals": 3,
     "adopted_animals": 1,
     "animals_by_species": {
       "CANINO": 2,
       "FELINO": 1
     },
     "animals_by_size": {
       "PEQUENO": 1,
       "MEDIO": 1,
       "GRANDE": 1
     },
     "recent_additions": 0
   }
   ```

6. **Format Response** normaliza:
   ```json
   {
     "user_message": "Quantos animais existem no sistema?",
     "intent": "QUERY",
     "function": "get_adoption_stats",
     "data": {
       "total_animals": 4,
       "available_animals": 3,
       "adopted_animals": 1,
       "animals_by_species": {"CANINO": 2, "FELINO": 1},
       "animals_by_size": {"PEQUENO": 1, "MEDIO": 1, "GRANDE": 1},
       "recent_additions": 0
     },
     "summary": "Resultado encontrado",
     "count": 1,
     "success": true
   }
   ```

7. **SMART AGENT 2** gera resposta amigável:
   ```
   "No momento temos 4 animais registrados no sistema! 🐾
   
   📊 Situação atual:
   - 3 disponíveis para adoção
   - 1 já adotado
   
   🐕 Por espécie:
   - Cães (CANINO): 2
   - Gatos (FELINO): 1
   
   📏 Por tamanho:
   - Pequeno: 1
   - Médio: 1
   - Grande: 1
   
   Gostaria de ver os animais disponíveis para adoção? 😊"
   ```

### ✅ Critérios de Sucesso

- [ ] SMART AGENT 1 identifica intent como "QUERY"
- [ ] Switch roteia para branch correta
- [ ] HTTP Request retorna dados do Supabase
- [ ] Format Response normaliza corretamente
- [ ] SMART AGENT 2 usa dados reais (4 animais, não 250!)
- [ ] Resposta é amigável e informativa

### ❌ Problemas Comuns

1. **SMART AGENT 2 inventa números**
   - Causa: Prompt não enfatiza uso de dados reais
   - Solução: Verificar prompt do SMART AGENT 2

2. **HTTP Request falha**
   - Causa: Credenciais Supabase incorretas
   - Solução: Verificar apikey e Authorization header

3. **Format Response retorna vazio**
   - Causa: Estrutura de dados inesperada
   - Solução: Verificar logs do node

---

## 🎯 Teste 2: ACTION (Ação)

### Objetivo
Validar que o sistema consegue executar ações (criar, atualizar, deletar) via API.

### Input de Teste
```
"Cadastrar um novo animal chamado Rex, cachorro macho de porte grande"
```

### Fluxo Esperado

1. **Chat Input** recebe a mensagem

2. **SMART AGENT 1** analisa e retorna:
   ```json
   {
     "intent": "ACTION",
     "function": "create_animal",
     "endpoint": "/api/v1/animals",
     "parameters": {
       "name": "Rex",
       "species": "CANINO",
       "sex": "MACHO",
       "size": "GRANDE",
       "status": "DISPONIVEL"
     },
     "user_message": "Cadastrar um novo animal chamado Rex, cachorro macho de porte grande"
   }
   ```

3. **Switch** roteia para branch ACTION

4. **HTTP Request (DIBEA API)** executa:
   ```
   POST http://localhost:3000/api/v1/animals
   Headers:
     - Authorization: Bearer [JWT_TOKEN]
     - Content-Type: application/json
   Body:
   {
     "name": "Rex",
     "species": "CANINO",
     "sex": "MACHO",
     "size": "GRANDE",
     "status": "DISPONIVEL",
     "municipalityId": "default-municipality-id"
   }
   ```

5. **DIBEA API** retorna:
   ```json
   {
     "id": "abc-123-def-456",
     "name": "Rex",
     "species": "CANINO",
     "sex": "MACHO",
     "size": "GRANDE",
     "status": "DISPONIVEL",
     "createdAt": "2024-01-15T10:30:00Z"
   }
   ```

6. **Format Response** normaliza:
   ```json
   {
     "user_message": "Cadastrar um novo animal chamado Rex...",
     "intent": "ACTION",
     "function": "create_animal",
     "data": {
       "id": "abc-123-def-456",
       "name": "Rex",
       "species": "CANINO",
       "sex": "MACHO",
       "size": "GRANDE",
       "status": "DISPONIVEL"
     },
     "summary": "Animal cadastrado com sucesso",
     "count": 1,
     "success": true
   }
   ```

7. **SMART AGENT 2** gera resposta:
   ```
   "✅ Animal cadastrado com sucesso!
   
   🐕 Detalhes:
   - Nome: Rex
   - Espécie: Cachorro (CANINO)
   - Sexo: Macho
   - Porte: Grande
   - Status: Disponível para adoção
   - ID: abc-123-def-456
   
   O Rex já está disponível para adoção! 🎉"
   ```

### ✅ Critérios de Sucesso

- [ ] SMART AGENT 1 identifica intent como "ACTION"
- [ ] SMART AGENT 1 extrai parâmetros corretamente
- [ ] Switch roteia para branch ACTION
- [ ] HTTP Request cria animal na API
- [ ] Format Response normaliza resposta
- [ ] SMART AGENT 2 confirma ação executada

### ❌ Problemas Comuns

1. **Backend não está rodando**
   - Causa: API na porta 3000 não iniciada
   - Solução: `cd apps/backend && npm run dev`

2. **Autenticação falha**
   - Causa: JWT token não configurado
   - Solução: Adicionar N8N_INTERNAL_API_KEY

3. **MunicipalityId faltando**
   - Causa: Parâmetro obrigatório não enviado
   - Solução: Adicionar default no HTTP Request

---

## 🔧 Configuração Necessária

### 1. Supabase (QUERY)

No n8n, configure o HTTP Request:
```
URL: https://xptonqqagxcpzlgndilj.supabase.co/rest/v1/rpc/{{ $json.function }}
Method: POST
Headers:
  - apikey: eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...
  - Authorization: Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...
  - Content-Type: application/json
Body: {{ JSON.stringify($json.parameters || {}) }}
```

### 2. DIBEA API (ACTION)

No n8n, configure o HTTP Request:
```
URL: http://localhost:3000{{ $json.endpoint }}
Method: POST
Headers:
  - Authorization: Bearer dibea_n8n_secure_key_2024_a1b2c3d4e5f6
  - Content-Type: application/json
Body: {{ JSON.stringify($json.parameters) }}
```

### 3. Backend (.env)

```env
PORT=3000
DATABASE_URL="postgresql://postgres.xptonqqagxcpzlgndilj:dibea123@db.xptonqqagxcpzlgndilj.supabase.co:5432/postgres"
SUPABASE_URL="https://xptonqqagxcpzlgndilj.supabase.co"
SUPABASE_ANON_KEY="eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9..."
N8N_INTERNAL_API_KEY="dibea_n8n_secure_key_2024_a1b2c3d4e5f6"
```

---

## 📊 Checklist de Validação

### Antes de Testar

- [ ] Supabase está acessível
- [ ] n8n está rodando (https://n8n-moveup-u53084.vm.elestio.app)
- [ ] Workflow está ativo no n8n
- [ ] Credenciais OpenAI configuradas
- [ ] Credenciais Supabase configuradas
- [ ] Backend rodando (se testar ACTION)

### Durante o Teste

- [ ] Abrir n8n Workflow
- [ ] Ativar modo "Listening for test event"
- [ ] Enviar mensagem no Chat
- [ ] Observar execução node por node
- [ ] Verificar dados em cada etapa

### Após o Teste

- [ ] Verificar resposta final
- [ ] Confirmar dados no Supabase (se ACTION)
- [ ] Revisar logs de erro (se houver)
- [ ] Documentar problemas encontrados

---

## 🚀 Como Executar os Testes

### Via n8n Interface

1. Acesse: https://n8n-moveup-u53084.vm.elestio.app
2. Abra o workflow "DIBEA Smart Router"
3. Clique em "Execute Workflow"
4. No node "When chat message received", clique em "Test"
5. Digite a mensagem de teste
6. Observe a execução

### Via Webhook (Alternativo)

```bash
curl -X POST https://n8n-moveup-u53084.vm.elestio.app/webhook/d0fff20e-124c-49f3-8ccf-a615504c5fc1 \
  -H "Content-Type: application/json" \
  -d '{"chatInput": "Quantos animais existem no sistema?"}'
```

---

## 📝 Registro de Testes

| Data | Teste | Status | Observações |
|------|-------|--------|-------------|
| 2024-01-15 | QUERY - Estatísticas | ❌ | SMART AGENT 2 inventou 250 animais |
| 2024-01-15 | QUERY - Estatísticas | ✅ | Após correção do prompt |
| 2024-01-15 | ACTION - Criar animal | ⏳ | Backend não iniciado |

---

**Próximos Passos:**
1. ✅ Validar QUERY com dados reais
2. ⏳ Validar ACTION com backend
3. ⏳ Integrar com frontend Next.js
4. ⏳ Adicionar mais casos de teste

