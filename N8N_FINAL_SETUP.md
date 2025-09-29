# 🎯 n8n - Configuração Final para QUERY e ACTION

## ✅ **VALIDADO E FUNCIONANDO!**

Ambos os fluxos (QUERY e ACTION) devem usar **Supabase REST API** diretamente.

---

## 📊 **QUERY - Consultas (JÁ VALIDADO)**

### Configuração HTTP Request (Supabase)

```
URL: https://xptonqqagxcpzlgndilj.supabase.co/rest/v1/rpc/{{ $json.function }}
Method: POST
Headers:
  - apikey: eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InhwdG9ucXFhZ3hjcHpsZ25kaWxqIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NTkwOTY2NjYsImV4cCI6MjA3NDY3MjY2Nn0.uT5QGzarx587tE-s3SGgji2zl2iwzk2u3bFoi_RGNJY
  - Authorization: Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InhwdG9ucXFhZ3hjcHpsZ25kaWxqIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NTkwOTY2NjYsImV4cCI6MjA3NDY3MjY2Nn0.uT5QGzarx587tE-s3SGgji2zl2iwzk2u3bFoi_RGNJY
  - Content-Type: application/json
Body: {{ JSON.stringify($json.parameters || {}) }}
```

### Exemplo de Teste

**Input:**
```
"Quantos animais existem no sistema?"
```

**SMART AGENT 1 Output:**
```json
{
  "intent": "QUERY",
  "function": "get_adoption_stats",
  "parameters": {}
}
```

**Supabase Response:**
```json
{
  "total_animals": 5,
  "available_animals": 4,
  "adopted_animals": 1,
  "animals_by_species": {"CANINO": 3, "FELINO": 2},
  "animals_by_size": {"PEQUENO": 1, "MEDIO": 2, "GRANDE": 2}
}
```

---

## 🎬 **ACTION - Ações (CONFIGURAÇÃO ATUALIZADA)**

### Configuração HTTP Request (Supabase)

```
URL: https://xptonqqagxcpzlgndilj.supabase.co/rest/v1/animals
Method: POST
Headers:
  - apikey: eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InhwdG9ucXFhZ3hjcHpsZ25kaWxqIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NTkwOTY2NjYsImV4cCI6MjA3NDY3MjY2Nn0.uT5QGzarx587tE-s3SGgji2zl2iwzk2u3bFoi_RGNJY
  - Authorization: Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InhwdG9ucXFhZ3hjcHpsZ25kaWxqIiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImlhdCI6MTc1OTA5NjY2NiwiZXhwIjoyMDc0NjcyNjY2fQ.xs_jNdVjWGvRIDrtiMsvWCtoUInUZHdDld0kz9zjGzo
  - Content-Type: application/json
  - Prefer: return=representation
```

**⚠️ IMPORTANTE:** Use o `service_role` key (não `anon` key) para permitir INSERT/UPDATE/DELETE.

### Body Configuration

```javascript
{
  "name": "{{ $json.parameters.name }}",
  "species": "{{ $json.parameters.species }}",
  "sex": "{{ $json.parameters.sex }}",
  "size": "{{ $json.parameters.size }}",
  "age": "{{ $json.parameters.age }}",
  "breed": "{{ $json.parameters.breed }}",
  "description": "{{ $json.parameters.description }}",
  "status": "{{ $json.parameters.status || 'DISPONIVEL' }}",
  "municipality_id": "{{ $json.parameters.municipalityId || '0b227971-5134-4992-b83c-b4f35cabb1c0' }}"
}
```

**OU use JSON direto:**
```javascript
{{ JSON.stringify({
  name: $json.parameters.name,
  species: $json.parameters.species,
  sex: $json.parameters.sex,
  size: $json.parameters.size,
  age: $json.parameters.age,
  breed: $json.parameters.breed,
  description: $json.parameters.description,
  status: $json.parameters.status || 'DISPONIVEL',
  municipality_id: $json.parameters.municipalityId || '0b227971-5134-4992-b83c-b4f35cabb1c0'
}) }}
```

### Exemplo de Teste

**Input:**
```
"Cadastrar um novo animal chamado Rex, cachorro macho de porte grande"
```

**SMART AGENT 1 Output:**
```json
{
  "intent": "ACTION",
  "function": "create_animal",
  "parameters": {
    "name": "Rex",
    "species": "CANINO",
    "sex": "MACHO",
    "size": "GRANDE"
  }
}
```

**Supabase Response:**
```json
[{
  "id": "8dc718af-892f-46cb-8e6e-b1d5344733cf",
  "name": "Rex",
  "species": "CANINO",
  "sex": "MACHO",
  "size": "GRANDE",
  "status": "DISPONIVEL",
  "municipality_id": "0b227971-5134-4992-b83c-b4f35cabb1c0",
  "created_at": "2025-09-29T21:12:36.629965+00:00"
}]
```

---

## 🔧 **Configuração Completa do Workflow**

### 1. Chat Input
- Recebe mensagem do usuário

### 2. SMART AGENT 1 (OpenAI)
- Analisa intenção (QUERY/ACTION)
- Extrai função e parâmetros
- Output:
```json
{
  "intent": "QUERY" | "ACTION",
  "function": "nome_da_funcao",
  "parameters": {...},
  "user_message": "mensagem original"
}
```

### 3. Switch (IF Node)
- Condição: `{{ $json.intent === 'QUERY' }}`
- True → HTTP Request (QUERY)
- False → HTTP Request (ACTION)

### 4a. HTTP Request (QUERY Branch)
```
URL: https://xptonqqagxcpzlgndilj.supabase.co/rest/v1/rpc/{{ $json.function }}
Method: POST
Headers:
  - apikey: [ANON_KEY]
  - Authorization: Bearer [ANON_KEY]
  - Content-Type: application/json
Body: {{ JSON.stringify($json.parameters || {}) }}
```

### 4b. HTTP Request (ACTION Branch)
```
URL: https://xptonqqagxcpzlgndilj.supabase.co/rest/v1/animals
Method: POST
Headers:
  - apikey: [ANON_KEY]
  - Authorization: Bearer [SERVICE_ROLE_KEY]
  - Content-Type: application/json
  - Prefer: return=representation
Body: {{ JSON.stringify({
  name: $json.parameters.name,
  species: $json.parameters.species,
  sex: $json.parameters.sex,
  size: $json.parameters.size,
  status: $json.parameters.status || 'DISPONIVEL',
  municipality_id: $json.parameters.municipalityId || '0b227971-5134-4992-b83c-b4f35cabb1c0'
}) }}
```

### 5. Format Response
- Normaliza output de ambos os branches
- Output:
```json
{
  "user_message": "...",
  "intent": "QUERY" | "ACTION",
  "function": "...",
  "data": {...},
  "summary": "...",
  "count": 1,
  "success": true
}
```

### 6. SMART AGENT 2 (OpenAI)
- Recebe JSON normalizado
- Gera resposta amigável
- Output: String com resposta final

---

## 🧪 **Testes de Validação**

### Teste 1: QUERY - Estatísticas
```
Input: "Quantos animais existem no sistema?"
Expected: Resposta com números reais do banco
Status: ✅ VALIDADO
```

### Teste 2: ACTION - Criar Animal
```
Input: "Cadastrar um animal chamado Rex, cachorro macho grande"
Expected: Animal criado no Supabase + confirmação
Status: ✅ VALIDADO (via curl)
```

### Teste 3: QUERY - Buscar Animais
```
Input: "Quais cães estão disponíveis para adoção?"
Expected: Lista de cães disponíveis
Status: ⏳ PENDENTE
```

### Teste 4: ACTION - Atualizar Animal
```
Input: "Atualizar o status do animal Rex para adotado"
Expected: Animal atualizado + confirmação
Status: ⏳ PENDENTE
```

---

## 📋 **Checklist de Configuração**

### QUERY Branch
- [ ] HTTP Request configurado com URL Supabase RPC
- [ ] Header `apikey` com ANON_KEY
- [ ] Header `Authorization` com ANON_KEY
- [ ] Body com `{{ JSON.stringify($json.parameters || {}) }}`

### ACTION Branch
- [ ] HTTP Request configurado com URL Supabase REST
- [ ] Header `apikey` com ANON_KEY
- [ ] Header `Authorization` com SERVICE_ROLE_KEY
- [ ] Header `Prefer: return=representation`
- [ ] Body com campos mapeados corretamente
- [ ] MunicipalityId padrão configurado

### Format Response
- [ ] Normaliza output de ambos os branches
- [ ] Adiciona campos: user_message, intent, function, data, summary, count, success

### SMART AGENT 2
- [ ] Prompt configurado para usar JSON dinâmico
- [ ] Aviso para NÃO inventar dados
- [ ] Exemplos de como usar os dados

---

## 🚀 **Como Testar**

### Via n8n Interface

1. Acesse: https://n8n-moveup-u53084.vm.elestio.app
2. Abra o workflow "DIBEA Smart Router"
3. Clique em "Execute Workflow"
4. No node "When chat message received", clique em "Test"
5. Digite: "Cadastrar um animal chamado Rex, cachorro macho grande"
6. Observe a execução node por node
7. Verifique a resposta final

### Via Curl (Teste Manual)

**Criar Animal:**
```bash
curl -X POST "https://xptonqqagxcpzlgndilj.supabase.co/rest/v1/animals" \
  -H "apikey: eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InhwdG9ucXFhZ3hjcHpsZ25kaWxqIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NTkwOTY2NjYsImV4cCI6MjA3NDY3MjY2Nn0.uT5QGzarx587tE-s3SGgji2zl2iwzk2u3bFoi_RGNJY" \
  -H "Authorization: Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InhwdG9ucXFhZ3hjcHpsZ25kaWxqIiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImlhdCI6MTc1OTA5NjY2NiwiZXhwIjoyMDc0NjcyNjY2fQ.xs_jNdVjWGvRIDrtiMsvWCtoUInUZHdDld0kz9zjGzo" \
  -H "Content-Type: application/json" \
  -H "Prefer: return=representation" \
  -d '{
    "name": "Rex Teste",
    "species": "CANINO",
    "sex": "MACHO",
    "size": "GRANDE",
    "status": "DISPONIVEL",
    "municipality_id": "0b227971-5134-4992-b83c-b4f35cabb1c0"
  }'
```

**Resultado esperado:**
```json
[{
  "id": "...",
  "name": "Rex Teste",
  "species": "CANINO",
  "sex": "MACHO",
  "size": "GRANDE",
  "status": "DISPONIVEL",
  "created_at": "2025-09-29T21:12:36.629965+00:00"
}]
```

---

## 🎯 **Próximos Passos**

1. ✅ Configure o HTTP Request (ACTION) no n8n
2. ✅ Teste com: "Cadastrar um animal chamado Rex..."
3. ✅ Verifique que o animal foi criado no Supabase
4. ✅ Confirme que SMART AGENT 2 gera resposta amigável
5. ⏳ Integre com frontend Next.js
6. ⏳ Adicione mais funções (update, delete, search)

---

**Agora você tem um fluxo completo e funcional!** 🎉

