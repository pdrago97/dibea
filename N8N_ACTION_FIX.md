# 🔧 Correção do HTTP Request4 (ACTION) - n8n

## ❌ **PROBLEMA IDENTIFICADO**

O **HTTP Request4** estava configurado para chamar `http://localhost:3000/api/v1/{{ $json.endpoint }}`, mas:

1. ❌ **n8n está hospedado externamente** (não tem acesso ao localhost)
2. ❌ **Backend não estava acessível** do n8n
3. ❌ **Faltava autenticação** (header Authorization)
4. ❌ **Erro:** "The service refused the connection - perhaps it is offline"

---

## ✅ **SOLUÇÃO APLICADA**

Alterado o **HTTP Request4** para usar **Supabase REST API** diretamente:

### **Antes:**
```json
{
  "method": "POST",
  "url": "http://localhost:3000/api/v1/{{ $json.endpoint }}",
  "headers": {
    "Content-Type": "application/json"
  }
}
```

### **Depois:**
```json
{
  "method": "POST",
  "url": "https://xptonqqagxcpzlgndilj.supabase.co/rest/v1/{{ $json.endpoint }}",
  "authentication": "supabaseApi",
  "headers": {
    "Content-Type": "application/json",
    "Prefer": "return=representation",
    "Authorization": "Bearer [SERVICE_ROLE_KEY]"
  }
}
```

---

## 📋 **MUDANÇAS NO ARQUIVO n8n-file.json**

### **HTTP Request4 (linhas 144-186):**

```json
{
  "parameters": {
    "method": "POST",
    "url": "=https://xptonqqagxcpzlgndilj.supabase.co/rest/v1/{{ $json.endpoint }}",
    "authentication": "predefinedCredentialType",
    "nodeCredentialType": "supabaseApi",
    "sendHeaders": true,
    "headerParameters": {
      "parameters": [
        {
          "name": "Content-Type",
          "value": "application/json"
        },
        {
          "name": "Prefer",
          "value": "return=representation"
        },
        {
          "name": "Authorization",
          "value": "Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InhwdG9ucXFhZ3hjcHpsZ25kaWxqIiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImlhdCI6MTc1OTA5NjY2NiwiZXhwIjoyMDc0NjcyNjY2fQ.xs_jNdVjWGvRIDrtiMsvWCtoUInUZHdDld0kz9zjGzo"
        }
      ]
    },
    "sendBody": true,
    "specifyBody": "json",
    "jsonBody": "={{ JSON.stringify($json.parameters) }}",
    "options": {}
  },
  "credentials": {
    "supabaseApi": {
      "id": "mrRLeoHwNIEKek1I",
      "name": "DIBEASUPABASE"
    }
  }
}
```

---

## 🎯 **MAPEAMENTO DE ENDPOINTS**

O SMART AGENT1 deve retornar o `endpoint` correto para cada ação:

| Função | Endpoint Supabase | Método |
|--------|-------------------|--------|
| `create_animal` | `animals` | POST |
| `create_adoption` | `adoptions` | POST |
| `create_appointment` | `appointments` | POST |
| `create_tutor` | `tutors` | POST |
| `update_animal` | `animals?id=eq.{id}` | PATCH |
| `delete_animal` | `animals?id=eq.{id}` | DELETE |

### **Exemplo de Output do SMART AGENT1:**

```json
{
  "intent": "ACTION",
  "function": "create_animal",
  "endpoint": "animals",
  "parameters": {
    "name": "Rex",
    "species": "CANINO",
    "sex": "MACHO",
    "size": "GRANDE",
    "status": "DISPONIVEL",
    "municipality_id": "0b227971-5134-4992-b83c-b4f35cabb1c0"
  },
  "user_message": "Cadastrar um animal chamado Rex..."
}
```

---

## 🧪 **COMO TESTAR**

### **1. Importar o workflow atualizado no n8n:**

1. Acesse: https://n8n-moveup-u53084.vm.elestio.app
2. Vá em **Workflows** → **Import from File**
3. Selecione o arquivo: `n8n/n8n-file.json`
4. Clique em **Import**

### **2. Testar ACTION - Criar Animal:**

**Input no chat:**
```
Cadastrar um novo animal chamado Rex, cachorro macho de porte grande
```

**Fluxo esperado:**
1. ✅ SMART AGENT1 identifica `intent: "ACTION"`
2. ✅ SMART AGENT1 extrai `function: "create_animal"` e `endpoint: "animals"`
3. ✅ Switch direciona para HTTP Request4 (branch ACTION)
4. ✅ HTTP Request4 chama Supabase: `POST /rest/v1/animals`
5. ✅ Supabase cria o animal e retorna:
```json
[{
  "id": "uuid-gerado",
  "name": "Rex",
  "species": "CANINO",
  "sex": "MACHO",
  "size": "GRANDE",
  "status": "DISPONIVEL",
  "created_at": "2025-09-29T..."
}]
```
6. ✅ Format-Response normaliza a resposta
7. ✅ SMART AGENT2 gera resposta amigável:
```
"Ótimo! O Rex foi cadastrado com sucesso! 🐕 
Ele já está disponível para adoção no sistema. 
ID: uuid-gerado"
```

### **3. Verificar no Supabase:**

```bash
curl -X GET "https://xptonqqagxcpzlgndilj.supabase.co/rest/v1/animals?name=eq.Rex" \
  -H "apikey: eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InhwdG9ucXFhZ3hjcHpsZ25kaWxqIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NTkwOTY2NjYsImV4cCI6MjA3NDY3MjY2Nn0.uT5QGzarx587tE-s3SGgji2zl2iwzk2u3bFoi_RGNJY" \
  -H "Authorization: Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InhwdG9ucXFhZ3hjcHpsZ25kaWxqIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NTkwOTY2NjYsImV4cCI6MjA3NDY3MjY2Nn0.uT5QGzarx587tE-s3SGgji2zl2iwzk2u3bFoi_RGNJY"
```

---

## 🔍 **DEBUGGING**

### **Se o erro persistir:**

1. **Verifique o output do SMART AGENT1:**
   - Deve conter `endpoint: "animals"` (não `endpoint: "n8n/animals"`)
   - Deve conter `intent: "ACTION"`

2. **Verifique o Switch:**
   - Deve direcionar para HTTP Request4 quando `intent === "ACTION"`

3. **Verifique o HTTP Request4:**
   - URL deve ser: `https://xptonqqagxcpzlgndilj.supabase.co/rest/v1/animals`
   - Header `Authorization` deve ter o SERVICE_ROLE_KEY
   - Header `Prefer: return=representation` deve estar presente

4. **Verifique os parâmetros:**
   - `municipality_id` deve ser UUID válido: `0b227971-5134-4992-b83c-b4f35cabb1c0`
   - `species` deve ser: `CANINO` ou `FELINO`
   - `sex` deve ser: `MACHO` ou `FEMEA`
   - `size` deve ser: `PEQUENO`, `MEDIO` ou `GRANDE`

---

## 📊 **CAMPOS OBRIGATÓRIOS POR TABELA**

### **animals:**
```json
{
  "name": "string (obrigatório)",
  "species": "CANINO|FELINO (obrigatório)",
  "sex": "MACHO|FEMEA (obrigatório)",
  "size": "PEQUENO|MEDIO|GRANDE (obrigatório)",
  "status": "DISPONIVEL (padrão)",
  "municipality_id": "uuid (obrigatório)"
}
```

### **adoptions:**
```json
{
  "animal_id": "uuid (obrigatório)",
  "tutor_id": "uuid (obrigatório)",
  "status": "PENDENTE (padrão)",
  "observations": "string (opcional)"
}
```

### **appointments:**
```json
{
  "type": "VISITA_ADOCAO|CONSULTA (obrigatório)",
  "date_time": "ISO8601 (obrigatório)",
  "tutor_id": "uuid (obrigatório)",
  "animal_id": "uuid (opcional)",
  "status": "AGENDADO (padrão)"
}
```

### **tutors:**
```json
{
  "name": "string (obrigatório)",
  "cpf": "string (obrigatório)",
  "email": "string (obrigatório)",
  "phone": "string (obrigatório)",
  "municipality_id": "uuid (obrigatório)"
}
```

---

## ✅ **CHECKLIST DE VALIDAÇÃO**

- [x] HTTP Request4 atualizado para usar Supabase
- [x] Header `Authorization` com SERVICE_ROLE_KEY adicionado
- [x] Header `Prefer: return=representation` adicionado
- [x] Credenciais Supabase configuradas
- [ ] Workflow importado no n8n
- [ ] Teste ACTION executado com sucesso
- [ ] Animal criado no Supabase
- [ ] SMART AGENT2 gerou resposta amigável

---

## 🚀 **PRÓXIMOS PASSOS**

1. ✅ Importe o workflow atualizado no n8n
2. ✅ Teste com: "Cadastrar um animal chamado Max, gato macho pequeno"
3. ✅ Verifique que o animal foi criado no Supabase
4. ✅ Confirme a resposta do SMART AGENT2
5. ⏳ Adicione mais ações (update, delete, search)
6. ⏳ Integre com frontend Next.js

---

**Agora o fluxo ACTION está corrigido e pronto para testar!** 🎉

