# 🔗 DIBEA - Guia de Integração N8N

## 📋 **VISÃO GERAL**

Este guia explica como configurar o N8N para integrar com as Edge Functions do Supabase e criar o chatbot conversacional do DIBEA.

---

## 🏗️ **ARQUITETURA**

```
WhatsApp → N8N → Edge Functions → Supabase Database
   ↑                                      ↓
   └──────────── Response ←───────────────┘
```

### **Fluxo de Mensagem:**

1. **Usuário envia mensagem via WhatsApp**
2. **N8N recebe webhook do WhatsApp**
3. **SMART AGENT1 (LLM) classifica intenção**
4. **N8N chama Edge Function apropriada**
5. **Edge Function valida permissões e executa operação**
6. **SMART AGENT2 (LLM) formata resposta em linguagem natural**
7. **N8N envia resposta via WhatsApp**

---

## 🔧 **CONFIGURAÇÃO DO N8N**

### **1. Variáveis de Ambiente**

Adicione no arquivo `.env` do N8N:

```bash
# Supabase
SUPABASE_URL=https://xptonqqagxcpzlgndilj.supabase.co
SUPABASE_SERVICE_ROLE_KEY=seu_service_role_key_aqui
SUPABASE_ANON_KEY=seu_anon_key_aqui

# WhatsApp (Twilio ou outro provider)
WHATSAPP_ACCOUNT_SID=seu_account_sid
WHATSAPP_AUTH_TOKEN=seu_auth_token
WHATSAPP_FROM_NUMBER=+5511999999999

# OpenAI (ou outro LLM)
OPENAI_API_KEY=seu_openai_key
OPENAI_MODEL=gpt-4-turbo-preview

# DIBEA
DEFAULT_MUNICIPALITY_ID=0b227971-5134-4992-b83c-b4f35cabb1c0
```

---

## 📝 **WORKFLOW N8N - ESTRUTURA**

### **Node 1: Webhook (Trigger)**

Recebe mensagens do WhatsApp.

**Configuração:**
- **HTTP Method:** POST
- **Path:** `/webhook/whatsapp`
- **Response Mode:** Immediately

**Exemplo de Payload:**
```json
{
  "from": "+5511999999999",
  "body": "Quero adotar um cachorro",
  "messageId": "wamid.xxx",
  "timestamp": "2025-01-10T10:30:00Z"
}
```

---

### **Node 2: Get or Create Conversation**

Busca ou cria conversa no banco.

**Tipo:** HTTP Request  
**Method:** POST  
**URL:** `{{ $env.SUPABASE_URL }}/rest/v1/rpc/get_or_create_conversation`

**Headers:**
```json
{
  "Authorization": "Bearer {{ $env.SUPABASE_SERVICE_ROLE_KEY }}",
  "Content-Type": "application/json",
  "apikey": "{{ $env.SUPABASE_ANON_KEY }}"
}
```

**Body:**
```json
{
  "phone_number": "{{ $json.from }}",
  "contact_name": "{{ $json.profileName || 'Usuário' }}"
}
```

---

### **Node 3: SMART AGENT1 - Intent Detection**

Classifica a intenção do usuário usando LLM.

**Tipo:** OpenAI Chat Model  
**Model:** gpt-4-turbo-preview

**System Prompt:**
```
Você é o SMART AGENT1 do sistema DIBEA (Sistema Municipal de Bem-Estar Animal).

Sua função é analisar mensagens de usuários e classificar a intenção em:
- QUERY (consulta/busca de informações)
- ACTION (ação/operação que modifica dados)

Para cada mensagem, você deve retornar um JSON com:
{
  "intent_type": "QUERY" ou "ACTION",
  "function_name": "nome_da_edge_function",
  "parameters": { objeto com parâmetros extraídos },
  "confidence": 0.0 a 1.0
}

## EDGE FUNCTIONS DISPONÍVEIS:

### QUERIES (Consultas):
1. search-animals
   - Busca animais disponíveis
   - Parâmetros: especie, sexo, porte, nome, municipality_id
   - Exemplo: "Quero adotar um cachorro grande"

2. get-animal-details
   - Detalhes de um animal específico
   - Parâmetros: animal_id
   - Exemplo: "Me fale mais sobre o Rex"

3. get-my-adoptions
   - Lista adoções do tutor
   - Parâmetros: tutor_id (opcional)
   - Exemplo: "Quais animais eu adotei?"

4. get-available-appointments
   - Horários disponíveis para agendamento
   - Parâmetros: data_inicio, data_fim, servico
   - Exemplo: "Quero agendar castração"

5. get-active-campaigns
   - Campanhas ativas
   - Parâmetros: tipo, municipality_id
   - Exemplo: "Tem campanha de vacinação?"

### ACTIONS (Ações):
1. create-adoption
   - Solicita adoção
   - Parâmetros: animal_id, motivo_interesse, tutor_data (se novo)
   - Exemplo: "Quero adotar a Luna"

2. create-appointment
   - Cria agendamento
   - Parâmetros: data_hora, servico, animal_id, tutor_id
   - Exemplo: "Agendar consulta para amanhã às 10h"

3. create-complaint
   - Registra denúncia
   - Parâmetros: tipo, descricao, localizacao
   - Exemplo: "Quero denunciar maus tratos"

4. enroll-in-campaign
   - Inscreve em campanha
   - Parâmetros: campanha_id, animal_id, slot_id
   - Exemplo: "Quero inscrever meu cachorro na campanha"

## REGRAS:
- Use snake_case para nomes de campos (ex: municipality_id, não municipalityId)
- Sempre extraia o máximo de parâmetros possível da mensagem
- Se faltar informação crítica, retorne confidence < 0.7
- Para município, use sempre: "0b227971-5134-4992-b83c-b4f35cabb1c0" (São Paulo)
- Para status de animais, use sempre "DISPONIVEL" em buscas

## EXEMPLOS:

Mensagem: "Quero adotar um cachorro grande"
Resposta:
{
  "intent_type": "QUERY",
  "function_name": "search-animals",
  "parameters": {
    "especie": "CANINO",
    "porte": "GRANDE",
    "status": "DISPONIVEL",
    "municipality_id": "0b227971-5134-4992-b83c-b4f35cabb1c0"
  },
  "confidence": 0.95
}

Mensagem: "Quero adotar o Rex"
Resposta:
{
  "intent_type": "ACTION",
  "function_name": "create-adoption",
  "parameters": {
    "animal_id": "PRECISA_BUSCAR_POR_NOME",
    "motivo_interesse": "PRECISA_PERGUNTAR"
  },
  "confidence": 0.6
}
```

**User Message:**
```
{{ $json.body }}

Contexto da conversa:
{{ $('Get or Create Conversation').item.json.contexto }}
```

---

### **Node 4: Switch (QUERY vs ACTION)**

Roteia baseado no `intent_type`.

**Configuração:**
- **Mode:** Rules
- **Rule 1:** `{{ $json.intent_type }} === "QUERY"` → Output 1
- **Rule 2:** `{{ $json.intent_type }} === "ACTION"` → Output 2

---

### **Node 5a: Call Edge Function (QUERY)**

Chama Edge Function para consultas.

**Tipo:** HTTP Request  
**Method:** POST  
**URL:** `{{ $env.SUPABASE_URL }}/functions/v1/{{ $json.function_name }}`

**Headers:**
```json
{
  "Authorization": "Bearer {{ $env.SUPABASE_SERVICE_ROLE_KEY }}",
  "Content-Type": "application/json",
  "X-User-Phone": "{{ $('Webhook').item.json.from }}"
}
```

**Body:**
```json
{{ $json.parameters }}
```

---

### **Node 5b: Call Edge Function (ACTION)**

Chama Edge Function para ações.

**Configuração:** Igual ao Node 5a

---

### **Node 6: SMART AGENT2 - Response Generation**

Formata resposta em linguagem natural.

**Tipo:** OpenAI Chat Model  
**Model:** gpt-4-turbo-preview

**System Prompt:**
```
Você é o SMART AGENT2 do DIBEA, responsável por transformar dados técnicos em respostas amigáveis.

Você receberá:
1. A mensagem original do usuário
2. A função chamada
3. O resultado da função (JSON)

Sua tarefa é criar uma resposta em português brasileiro, amigável e informativa.

## DIRETRIZES:
- Use emojis apropriados (🐶 🐱 ✅ ❌ 📅 📍)
- Seja conciso mas completo
- Use formatação WhatsApp (*negrito*, _itálico_)
- Inclua próximos passos quando relevante
- Seja empático e acolhedor

## EXEMPLOS:

### Busca de animais:
Entrada: { animals: [{ nome: "Rex", especie: "CANINO", porte: "GRANDE" }], total: 1 }
Saída:
"🐶 Encontrei 1 cachorro grande disponível para adoção!

*Rex*
• Espécie: Cachorro
• Porte: Grande
• Status: Disponível

Quer saber mais sobre o Rex? É só me perguntar! 😊"

### Adoção criada:
Entrada: { adoption_id: "xxx", animal: { nome: "Luna" }, status: "SOLICITADA" }
Saída:
"✅ Sua solicitação de adoção da *Luna* foi registrada com sucesso!

📋 Status: Em análise
📅 Data: 10/01/2025

Nossa equipe vai avaliar seu pedido e entrar em contato em breve. Fique de olho no WhatsApp! 📱"
```

**User Message:**
```
Mensagem original: {{ $('Webhook').item.json.body }}
Função chamada: {{ $('SMART AGENT1').item.json.function_name }}
Resultado: {{ JSON.stringify($('Call Edge Function').item.json) }}
```

---

### **Node 7: Update Conversation Context**

Atualiza contexto da conversa.

**Tipo:** HTTP Request  
**Method:** PATCH  
**URL:** `{{ $env.SUPABASE_URL }}/rest/v1/conversas_whatsapp?id=eq.{{ $('Get or Create Conversation').item.json.id }}`

**Headers:**
```json
{
  "Authorization": "Bearer {{ $env.SUPABASE_SERVICE_ROLE_KEY }}",
  "Content-Type": "application/json",
  "apikey": "{{ $env.SUPABASE_ANON_KEY }}",
  "Prefer": "return=minimal"
}
```

**Body:**
```json
{
  "contexto": {
    "last_intent": "{{ $('SMART AGENT1').item.json.function_name }}",
    "last_result": {{ JSON.stringify($('Call Edge Function').item.json) }},
    "conversation_history": "{{ $('Get or Create Conversation').item.json.contexto.conversation_history || [] }}"
  },
  "ultima_mensagem_em": "{{ new Date().toISOString() }}"
}
```

---

### **Node 8: Send WhatsApp Message**

Envia resposta ao usuário.

**Tipo:** HTTP Request (Twilio ou outro provider)  
**Method:** POST  
**URL:** `https://api.twilio.com/2010-04-01/Accounts/{{ $env.WHATSAPP_ACCOUNT_SID }}/Messages.json`

**Authentication:** Basic Auth
- **User:** `{{ $env.WHATSAPP_ACCOUNT_SID }}`
- **Password:** `{{ $env.WHATSAPP_AUTH_TOKEN }}`

**Body (Form-Data):**
```
From: {{ $env.WHATSAPP_FROM_NUMBER }}
To: {{ $('Webhook').item.json.from }}
Body: {{ $('SMART AGENT2').item.json.response }}
```

---

## 🧪 **TESTANDO A INTEGRAÇÃO**

### **1. Testar Edge Function diretamente:**

```bash
curl -X POST \
  https://xptonqqagxcpzlgndilj.supabase.co/functions/v1/search-animals \
  -H "Authorization: Bearer SEU_SERVICE_ROLE_KEY" \
  -H "Content-Type: application/json" \
  -H "X-User-Phone: +5511999999999" \
  -d '{
    "especie": "CANINO",
    "porte": "GRANDE",
    "status": "DISPONIVEL"
  }'
```

### **2. Testar via N8N:**

Envie mensagem no WhatsApp:
```
Quero adotar um cachorro grande
```

Verifique logs no N8N para cada node.

---

## 📊 **MONITORAMENTO**

### **Logs importantes:**

1. **Supabase Edge Functions:**
   - Dashboard → Edge Functions → Logs

2. **N8N:**
   - Executions → Ver detalhes de cada execução

3. **Database:**
   - Tabela `conversas_whatsapp` - contexto das conversas
   - Tabela `mensagens_whatsapp` - histórico de mensagens
   - Tabela `logs_auditoria` - auditoria de operações

---

## 🚨 **TROUBLESHOOTING**

### **Erro: "Missing or invalid Authorization header"**
- Verificar se `SUPABASE_SERVICE_ROLE_KEY` está correto
- Verificar header `Authorization` no HTTP Request

### **Erro: "Invalid snake_case field"**
- SMART AGENT1 está gerando camelCase
- Atualizar prompt para enfatizar snake_case

### **Erro: "Animal not found"**
- Verificar se `animal_id` está correto
- Verificar se animal existe no banco

### **Conversa perde contexto:**
- Verificar se Node 7 está atualizando `contexto`
- Verificar se `Get or Create Conversation` está retornando contexto

---

## 📚 **PRÓXIMOS PASSOS**

1. ✅ Implementar mais Edge Functions
2. ✅ Adicionar validação de CPF para tutores
3. ✅ Implementar upload de fotos
4. ✅ Adicionar suporte a áudio
5. ✅ Implementar fila de atendimento humano
6. ✅ Dashboard de métricas


