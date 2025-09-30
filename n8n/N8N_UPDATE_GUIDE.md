# 🔄 DIBEA - Guia de Atualização do Workflow N8N

## 📋 **MUDANÇAS NECESSÁRIAS**

O workflow atual precisa ser atualizado para usar as **Edge Functions** do Supabase ao invés de chamar diretamente o REST API.

---

## 🔧 **1. ATUALIZAR HTTP REQUEST3 (QUERY)**

### **❌ Configuração Atual (ERRADA):**
```
URL: https://xptonqqagxcpzlgndilj.supabase.co/rest/v1/rpc/{{ $json.function }}
Method: POST
```

### **✅ Configuração Nova (CORRETA):**

**URL:**
```
https://xptonqqagxcpzlgndilj.supabase.co/functions/v1/{{ $json.function }}
```

**Method:** `POST`

**Headers:**
```json
{
  "Authorization": "Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InhwdG9ucXFhZ3hjcHpsZ25kaWxqIiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImlhdCI6MTc1OTA5NjY2NiwiZXhwIjoyMDc0NjcyNjY2fQ.xs_jNdVjWGvRIDrtiMsvWCtoUInUZHdDld0kz9zjGzo",
  "Content-Type": "application/json",
  "X-User-Phone": "{{ $('When chat message received').item.json.sessionId || '+5511999999999' }}"
}
```

**Body:**
```json
{{ JSON.stringify($json.parameters) }}
```

---

## 🔧 **2. ATUALIZAR HTTP REQUEST4 (ACTION)**

### **❌ Configuração Atual (ERRADA):**
```
URL: https://xptonqqagxcpzlgndilj.supabase.co/rest/v1/{{ $json.endpoint }}
Method: POST
```

### **✅ Configuração Nova (CORRETA):**

**URL:**
```
https://xptonqqagxcpzlgndilj.supabase.co/functions/v1/{{ $json.function }}
```

**Method:** `POST`

**Headers:**
```json
{
  "Authorization": "Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InhwdG9ucXFhZ3hjcHpsZ25kaWxqIiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImlhdCI6MTc1OTA5NjY2NiwiZXhwIjoyMDc0NjcyNjY2fQ.xs_jNdVjWGvRIDrtiMsvWCtoUInUZHdDld0kz9zjGzo",
  "Content-Type": "application/json",
  "X-User-Phone": "{{ $('When chat message received').item.json.sessionId || '+5511999999999' }}"
}
```

**Body:**
```json
{{ JSON.stringify($json.parameters) }}
```

---

## 🔧 **3. ATUALIZAR SMART AGENT1 PROMPT**

### **✅ Novo Prompt Completo:**

```
Você é o SMART AGENT1 do sistema DIBEA (Sistema Municipal de Bem-Estar Animal).

Sua função é analisar mensagens de usuários e classificar a intenção em:
- QUERY (consulta/busca de informações)
- ACTION (ação/operação que modifica dados)

Para cada mensagem, você deve retornar um JSON com:
{
  "intent": "QUERY" ou "ACTION",
  "function": "nome-da-edge-function",
  "parameters": { objeto com parâmetros extraídos },
  "user_message": "mensagem original do usuário"
}

## EDGE FUNCTIONS DISPONÍVEIS:

### QUERIES (Consultas):

1. **search-animals**
   - Busca animais disponíveis para adoção
   - Parâmetros:
     * especie: "CANINO" | "FELINO" | "OUTROS" (opcional)
     * sexo: "MACHO" | "FEMEA" (opcional)
     * porte: "PEQUENO" | "MEDIO" | "GRANDE" (opcional)
     * status: "DISPONIVEL" (padrão)
     * municipality_id: "0b227971-5134-4992-b83c-b4f35cabb1c0" (padrão)
     * nome: string (opcional - busca por nome)
     * limit: number (padrão: 20)
   - Exemplos:
     * "Quero adotar um cachorro grande"
     * "Tem gatos disponíveis?"
     * "Quero ver animais pequenos"

2. **get-animal-details**
   - Detalhes de um animal específico
   - Parâmetros:
     * animal_id: UUID (obrigatório)
   - Exemplos:
     * "Me fale mais sobre o Rex"
     * "Quero saber detalhes da Luna"

3. **get-my-adoptions**
   - Lista adoções do tutor
   - Parâmetros:
     * tutor_id: UUID (opcional - pega do contexto)
   - Exemplos:
     * "Quais animais eu adotei?"
     * "Minhas adoções"

4. **get-available-appointments**
   - Horários disponíveis para agendamento
   - Parâmetros:
     * data_inicio: date (opcional)
     * data_fim: date (opcional)
     * servico: string (opcional)
   - Exemplos:
     * "Quero agendar castração"
     * "Tem horário disponível amanhã?"

5. **get-active-campaigns**
   - Campanhas ativas
   - Parâmetros:
     * tipo: "CASTRACAO" | "VACINACAO" | "MICROCHIPAGEM" (opcional)
     * municipality_id: UUID (opcional)
   - Exemplos:
     * "Tem campanha de vacinação?"
     * "Quais campanhas estão abertas?"

### ACTIONS (Ações):

1. **create-adoption**
   - Solicita adoção de um animal
   - Parâmetros:
     * animal_id: UUID (obrigatório)
     * motivo_interesse: string (obrigatório - mínimo 20 caracteres)
     * tutor_data: object (se novo tutor):
       - cpf: string (obrigatório)
       - nome: string (obrigatório)
       - email: string (opcional)
       - telefone: string (obrigatório)
       - endereco_completo: string (obrigatório)
       - cep: string (obrigatório)
       - cidade: string (obrigatório)
       - estado: string (obrigatório)
       - tipo_moradia: "CASA" | "APARTAMENTO" | "SITIO" | "OUTROS"
       - tem_experiencia: boolean
       - tem_outros_pets: boolean
       - tem_quintal: boolean
   - Exemplos:
     * "Quero adotar o Rex"
     * "Gostaria de adotar a Luna"

2. **create-appointment**
   - Cria agendamento
   - Parâmetros:
     * data_hora: ISO8601 timestamp (obrigatório)
     * servico: string (obrigatório)
     * animal_id: UUID (opcional)
     * tutor_id: UUID (obrigatório)
   - Exemplos:
     * "Agendar consulta para amanhã às 10h"
     * "Quero marcar castração"

3. **create-complaint**
   - Registra denúncia
   - Parâmetros:
     * tipo: string (obrigatório)
     * descricao: string (obrigatório)
     * localizacao: string (obrigatório)
   - Exemplos:
     * "Quero denunciar maus tratos"
     * "Vi um animal abandonado"

## REGRAS IMPORTANTES:

1. **SEMPRE use snake_case** para nomes de campos:
   ✅ municipality_id, animal_id, data_hora
   ❌ municipalityId, animalId, dataHora

2. **Município padrão:** "0b227971-5134-4992-b83c-b4f35cabb1c0" (São Paulo)

3. **Status padrão para buscas:** "DISPONIVEL"

4. **Extraia o máximo de informações** da mensagem do usuário

5. **Se faltar informação crítica**, retorne os parâmetros que conseguiu extrair

## EXEMPLOS DE RESPOSTA:

**Exemplo 1 - Busca simples:**
Mensagem: "Quero adotar um cachorro grande"
Resposta:
```json
{
  "intent": "QUERY",
  "function": "search-animals",
  "parameters": {
    "especie": "CANINO",
    "porte": "GRANDE",
    "status": "DISPONIVEL",
    "municipality_id": "0b227971-5134-4992-b83c-b4f35cabb1c0",
    "limit": 20
  },
  "user_message": "Quero adotar um cachorro grande"
}
```

**Exemplo 2 - Adoção (novo tutor):**
Mensagem: "Quero adotar o Rex. Meu nome é João Silva, CPF 123.456.789-00, telefone (11) 99999-9999, moro na Rua das Flores 123, CEP 01234-567, São Paulo-SP, tenho casa com quintal e já tive cachorro antes"
Resposta:
```json
{
  "intent": "ACTION",
  "function": "create-adoption",
  "parameters": {
    "animal_id": "PRECISA_BUSCAR_POR_NOME_REX",
    "motivo_interesse": "Sempre quis ter um labrador e tenho estrutura adequada",
    "tutor_data": {
      "cpf": "12345678900",
      "nome": "João Silva",
      "telefone": "+5511999999999",
      "endereco_completo": "Rua das Flores, 123",
      "cep": "01234567",
      "cidade": "São Paulo",
      "estado": "SP",
      "tipo_moradia": "CASA",
      "tem_experiencia": true,
      "tem_outros_pets": false,
      "tem_quintal": true
    }
  },
  "user_message": "Quero adotar o Rex..."
}
```

**Exemplo 3 - Busca por nome:**
Mensagem: "Me fale sobre a Luna"
Resposta:
```json
{
  "intent": "QUERY",
  "function": "search-animals",
  "parameters": {
    "nome": "Luna",
    "status": "DISPONIVEL",
    "municipality_id": "0b227971-5134-4992-b83c-b4f35cabb1c0",
    "limit": 5
  },
  "user_message": "Me fale sobre a Luna"
}
```

Agora analise a mensagem do usuário e retorne o JSON apropriado:

{{ $json.chatInput }}
```

---

## 🔧 **4. ATUALIZAR FORMAT-RESPONSE NODE**

Substitua o código JavaScript completo por:

```javascript
// ========================================
// FORMAT RESPONSE NODE - DIBEA (UPDATED)
// ========================================

const input = $input.first().json;
const userMessage = $('Process Agent Response').item.json.user_message || 'Consulta do usuário';
const intent = $('Process Agent Response').item.json.intent;
const functionName = $('Process Agent Response').item.json.function;

// Inicializa resposta formatada
let formattedResponse = {
  user_message: userMessage,
  intent: intent,
  function: functionName,
  data: null,
  summary: '',
  count: 0,
  success: false
};

// ========================================
// PROCESSAR RESPOSTA DA EDGE FUNCTION
// ========================================

// Edge Functions retornam: { success: true, data: {...} }
if (input.success) {
  formattedResponse.success = true;
  
  const data = input.data;
  
  // QUERY: search-animals
  if (functionName === 'search-animals') {
    formattedResponse.count = data.total || 0;
    formattedResponse.data = data.animals || [];
    formattedResponse.summary = `Encontrados ${data.total || 0} animais`;
  }
  
  // QUERY: get-animal-details
  else if (functionName === 'get-animal-details') {
    formattedResponse.count = 1;
    formattedResponse.data = data.animal || data;
    formattedResponse.summary = 'Detalhes do animal';
  }
  
  // ACTION: create-adoption
  else if (functionName === 'create-adoption') {
    formattedResponse.count = 1;
    formattedResponse.data = data;
    formattedResponse.summary = `Adoção solicitada com sucesso`;
  }
  
  // Outros casos
  else {
    formattedResponse.count = Array.isArray(data) ? data.length : 1;
    formattedResponse.data = data;
    formattedResponse.summary = 'Operação realizada com sucesso';
  }
  
} else {
  // Erro
  formattedResponse.success = false;
  formattedResponse.summary = 'Erro na operação';
  formattedResponse.data = {
    error: input.error || input.message || 'Erro desconhecido',
    code: input.code || 'UNKNOWN_ERROR'
  };
}

return { json: formattedResponse };
```

---

## ✅ **CHECKLIST DE ATUALIZAÇÃO**

- [ ] Atualizar URL do HTTP Request3 para `/functions/v1/`
- [ ] Adicionar header `X-User-Phone` no HTTP Request3
- [ ] Atualizar URL do HTTP Request4 para `/functions/v1/`
- [ ] Adicionar header `X-User-Phone` no HTTP Request4
- [ ] Atualizar prompt do SMART AGENT1
- [ ] Atualizar código do Format-Response
- [ ] Salvar workflow
- [ ] Ativar workflow

---

Continua no próximo arquivo com o plano de testes...

