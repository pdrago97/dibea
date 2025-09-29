# 🔧 Configuração do n8n para ACTIONS

## ✅ Backend Configurado e Rodando!

O backend DIBEA está rodando em `http://localhost:3000` com autenticação via API Key para o n8n.

---

## 📋 Configuração do HTTP Request (ACTION)

### 1. **Localize o Node "HTTP Request4"**

No workflow n8n, encontre o node que faz requisições para a API DIBEA (branch ACTION).

### 2. **Configure a URL**

```
URL: http://localhost:3000/api/v1/n8n/animals
Method: POST
```

**⚠️ IMPORTANTE:** Use `/api/v1/n8n/animals` (não `/api/v1/animals`)
- As rotas `/api/v1/n8n/*` usam autenticação via API Key
- As rotas `/api/v1/*` usam autenticação JWT (usuários)

### 3. **Configure os Headers**

Adicione os seguintes headers:

```json
{
  "Authorization": "Bearer dibea_n8n_secure_key_2024_a1b2c3d4e5f6",
  "Content-Type": "application/json"
}
```

**No n8n:**
- Clique em "Add Header"
- Name: `Authorization`
- Value: `Bearer dibea_n8n_secure_key_2024_a1b2c3d4e5f6`

### 4. **Configure o Body**

O body deve conter os parâmetros extraídos pelo SMART AGENT 1:

```javascript
{
  "name": "{{ $json.parameters.name }}",
  "species": "{{ $json.parameters.species }}",
  "sex": "{{ $json.parameters.sex }}",
  "size": "{{ $json.parameters.size }}",
  "age": "{{ $json.parameters.age }}",
  "breed": "{{ $json.parameters.breed }}",
  "color": "{{ $json.parameters.color }}",
  "description": "{{ $json.parameters.description }}",
  "status": "{{ $json.parameters.status || 'DISPONIVEL' }}",
  "municipalityId": "{{ $json.parameters.municipalityId || '0b227971-5134-4992-b83c-b4f35cabb1c0' }}"
}
```

**No n8n:**
- Body Content Type: `JSON`
- Specify Body: `Using Fields Below`
- Adicione os campos acima

**OU use JSON direto:**
```javascript
{{ JSON.stringify({
  name: $json.parameters.name,
  species: $json.parameters.species,
  sex: $json.parameters.sex,
  size: $json.parameters.size,
  age: $json.parameters.age,
  breed: $json.parameters.breed,
  color: $json.parameters.color,
  description: $json.parameters.description,
  status: $json.parameters.status || 'DISPONIVEL',
  municipalityId: $json.parameters.municipalityId || '0b227971-5134-4992-b83c-b4f35cabb1c0'
}) }}
```

---

## 🧪 Teste de Validação

### 1. **Teste o Health Check**

Antes de testar o workflow completo, valide que o backend está acessível:

```bash
curl -X GET http://localhost:3000/api/v1/n8n/health \
  -H "Authorization: Bearer dibea_n8n_secure_key_2024_a1b2c3d4e5f6" \
  -H "Content-Type: application/json"
```

**Resposta esperada:**
```json
{
  "success": true,
  "message": "N8N integration is healthy",
  "timestamp": "2025-01-15T10:30:00.000Z",
  "authenticated": true,
  "user": "n8n@system.internal"
}
```

### 2. **Teste Criar Animal (Manual)**

```bash
curl -X POST http://localhost:3000/api/v1/n8n/animals \
  -H "Authorization: Bearer dibea_n8n_secure_key_2024_a1b2c3d4e5f6" \
  -H "Content-Type: application/json" \
  -d '{
    "name": "Rex",
    "species": "CANINO",
    "sex": "MACHO",
    "size": "GRANDE",
    "status": "DISPONIVEL",
    "municipalityId": "default-municipality-id"
  }'
```

**Resposta esperada:**
```json
{
  "success": true,
  "data": {
    "id": "abc-123-def-456",
    "name": "Rex",
    "species": "CANINO",
    "sex": "MACHO",
    "size": "GRANDE",
    "status": "DISPONIVEL",
    "municipalityId": "default-municipality-id",
    "createdAt": "2025-01-15T10:30:00.000Z",
    "updatedAt": "2025-01-15T10:30:00.000Z"
  }
}
```

---

## 🎯 Teste End-to-End no n8n

### Input de Teste

```
"Gostaria de cadastrar um novo animal chamado Rex, cachorro macho de porte grande"
```

### Fluxo Esperado

1. **SMART AGENT 1** analisa e retorna:
```json
{
  "intent": "ACTION",
  "function": "create_animal",
  "endpoint": "/api/v1/n8n/animals",
  "parameters": {
    "name": "Rex",
    "species": "CANINO",
    "sex": "MACHO",
    "size": "GRANDE"
  },
  "user_message": "Gostaria de cadastrar um novo animal..."
}
```

2. **Switch** roteia para branch ACTION

3. **HTTP Request** executa:
```
POST http://localhost:3000/api/v1/n8n/animals
Headers:
  - Authorization: Bearer dibea_n8n_secure_key_2024_a1b2c3d4e5f6
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

4. **Backend** cria o animal e retorna:
```json
{
  "success": true,
  "data": {
    "id": "abc-123",
    "name": "Rex",
    "species": "CANINO",
    "sex": "MACHO",
    "size": "GRANDE",
    "status": "DISPONIVEL",
    "createdAt": "2025-01-15T10:30:00Z"
  }
}
```

5. **Format Response** normaliza:
```json
{
  "user_message": "Gostaria de cadastrar...",
  "intent": "ACTION",
  "function": "create_animal",
  "data": {
    "id": "abc-123",
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

6. **SMART AGENT 2** gera resposta:
```
"✅ Animal cadastrado com sucesso!

🐕 Detalhes:
- Nome: Rex
- Espécie: Cachorro (CANINO)
- Sexo: Macho
- Porte: Grande
- Status: Disponível para adoção
- ID: abc-123

O Rex já está disponível para adoção! 🎉"
```

---

## 🔍 Troubleshooting

### Erro: "Access token required"

**Causa:** Header Authorization não configurado ou incorreto

**Solução:**
```
Authorization: Bearer dibea_n8n_secure_key_2024_a1b2c3d4e5f6
```

### Erro: "Invalid API key"

**Causa:** API Key incorreta

**Solução:** Verifique que a key no n8n é exatamente:
```
dibea_n8n_secure_key_2024_a1b2c3d4e5f6
```

### Erro: "Connection refused"

**Causa:** Backend não está rodando

**Solução:**
```bash
cd apps/backend
npm run dev
```

### Erro: "Municipality not found"

**Causa:** municipalityId inválido

**Solução:** Use um ID válido ou crie um município padrão:
```sql
INSERT INTO municipalities (id, name, state, active)
VALUES ('default-municipality-id', 'Município Padrão', 'RS', true);
```

---

## 📊 Endpoints Disponíveis

### Animals

| Method | Endpoint | Descrição |
|--------|----------|-----------|
| GET | `/api/v1/n8n/animals` | Listar animais |
| GET | `/api/v1/n8n/animals/:id` | Buscar animal por ID |
| POST | `/api/v1/n8n/animals` | Criar animal |
| PUT | `/api/v1/n8n/animals/:id` | Atualizar animal |
| DELETE | `/api/v1/n8n/animals/:id` | Deletar animal |

### Health

| Method | Endpoint | Descrição |
|--------|----------|-----------|
| GET | `/api/v1/n8n/health` | Health check |

---

## ✅ Checklist de Configuração

- [ ] Backend rodando em `http://localhost:3000`
- [ ] API Key configurada: `dibea_n8n_secure_key_2024_a1b2c3d4e5f6`
- [ ] Health check retorna sucesso
- [ ] HTTP Request configurado com URL correta
- [ ] Header Authorization configurado
- [ ] Body com parâmetros dinâmicos
- [ ] MunicipalityId padrão configurado
- [ ] Teste manual com curl funcionando

---

## 🚀 Próximos Passos

1. ✅ Configure o HTTP Request no n8n
2. ✅ Teste com a mensagem: "Cadastrar um animal chamado Rex..."
3. ✅ Verifique a resposta do SMART AGENT 2
4. ✅ Confirme que o animal foi criado no Supabase
5. ✅ Teste outros casos (atualizar, deletar, buscar)

---

**Agora você está pronto para testar ACTIONS no n8n!** 🎉

