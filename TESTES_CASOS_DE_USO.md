# 🧪 TESTES DOS CASOS DE USO - AGENTES DIBEA

## 🎯 **CENÁRIOS DE TESTE PRIORITÁRIOS**

### **Teste 1: Validação Real de CPF** ⭐
**Usuário:** FUNCIONARIO
**Endpoint:** `POST /api/v1/agents/validate-cpf`
**Input:** `{"cpf": "123.456.789-09"}`

**Validações Esperadas:**
```json
{
  "success": true,
  "valid": true,
  "cpf": "12345678909",
  "formatted": "123.456.789-09",
  "rfbStatus": "valid"
}
```

**Casos de Erro:**
- CPF inválido: `{"valid": false, "error": "CPF inválido"}`
- CPF com formato incorreto: `{"valid": false, "error": "CPF deve ter 11 dígitos"}`
- CPF com dígitos repetidos: `{"valid": false, "error": "CPF inválido"}`

### **Teste 2: Cadastro de Tutor com Validações** ⭐
**Usuário:** FUNCIONARIO
**Fluxo:** "João Silva quer adotar um gato"

**Etapas:**
1. **Validar CPF:** `POST /validate-cpf`
2. **Verificar Duplicatas:** `GET /tutors/check?cpf=12345678909`
3. **Buscar CEP:** Via ViaCEP API
4. **Analisar Perfil:** `POST /analyze-profile`
5. **Criar Tutor:** `POST /tutors`

**Dados de Teste:**
```json
{
  "cpf": "123.456.789-09",
  "name": "João Silva",
  "email": "joao@email.com",
  "phone": "11999999999",
  "zipCode": "01310-100",
  "housingType": "APARTAMENTO",
  "hasExperience": true,
  "municipalityId": "uuid-municipio"
}
```

### **Teste 3: Registro Médico por Veterinário** ⭐
**Usuário:** VETERINARIO
**Fluxo:** "Vacinei a Luna contra raiva"

**Validações:**
- ✅ Usuário é VETERINARIO
- ✅ Animal existe no município
- ✅ Procedimento médico válido
- ✅ Atualização do histórico

**Dados de Teste:**
```json
{
  "animalId": "uuid-luna",
  "type": "VACINACAO",
  "description": "Vacina antirrábica",
  "veterinarianId": "uuid-vet",
  "date": "2025-01-27",
  "observations": "Animal reagiu bem"
}
```

### **Teste 4: Bloqueio de Acesso Não Autorizado** 🚫
**Usuário:** CIDADAO
**Tentativa:** Cadastrar animal no sistema

**Endpoint:** `POST /api/v1/agents/animals`
**Resposta Esperada:**
```json
{
  "success": false,
  "error": "Usuários do tipo CIDADAO não podem acessar o agente animal"
}
```

### **Teste 5: Consulta Pública por Cidadão** ✅
**Usuário:** CIDADAO
**Fluxo:** "Quais cães estão disponíveis para adoção?"

**Endpoint:** `POST /api/v1/agents/query`
**Query:** `SELECT * FROM animals WHERE status = 'DISPONIVEL' AND species = 'CANINO'`

**Validações:**
- ✅ Apenas dados públicos
- ✅ Apenas animais DISPONIVEL
- ✅ Sem dados sensíveis

## 🔧 **SCRIPTS DE TESTE**

### **Script 1: Teste de CPF**
```bash
#!/bin/bash
echo "🧪 Testando validação de CPF..."

# CPF válido
curl -X POST http://localhost:3000/api/v1/agents/validate-cpf \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer $TOKEN" \
  -d '{"cpf": "123.456.789-09"}'

# CPF inválido
curl -X POST http://localhost:3000/api/v1/agents/validate-cpf \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer $TOKEN" \
  -d '{"cpf": "111.111.111-11"}'
```

### **Script 2: Teste de Permissões**
```bash
#!/bin/bash
echo "🛡️ Testando guardrails de permissões..."

# FUNCIONARIO tentando registrar procedimento (deve falhar)
curl -X POST http://localhost:3000/api/v1/agents/procedures \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer $FUNCIONARIO_TOKEN" \
  -d '{"animalId": "uuid", "type": "CIRURGIA"}'

# VETERINARIO registrando procedimento (deve funcionar)
curl -X POST http://localhost:3000/api/v1/agents/procedures \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer $VETERINARIO_TOKEN" \
  -d '{"animalId": "uuid", "type": "CIRURGIA"}'
```

### **Script 3: Teste de Município**
```bash
#!/bin/bash
echo "🏛️ Testando isolamento por município..."

# Usuário tentando acessar outro município (deve falhar)
curl -X GET "http://localhost:3000/api/v1/agents/animals/search?municipalityId=outro-municipio" \
  -H "Authorization: Bearer $TOKEN"
```

## 📊 **MATRIZ DE TESTES**

| Teste | ADMIN | VETERINARIO | FUNCIONARIO | CIDADAO |
|-------|-------|-------------|-------------|---------|
| Cadastrar Animal | ✅ | ✅ | ✅ | ❌ |
| Registrar Procedimento | ✅ | ✅ | ❌ | ❌ |
| Processar Laudo Médico | ✅ | ✅ | ❌ | ❌ |
| Processar Documento Admin | ✅ | ❌ | ✅ | ❌ |
| Cadastrar Tutor | ✅ | 👁️ | ✅ | 🔒 |
| Consultar Animais Públicos | ✅ | ✅ | ✅ | ✅ |
| Relatório Multi-Município | ✅ | ❌ | ❌ | ❌ |

**Legenda:**
- ✅ Permitido
- ❌ Bloqueado
- 👁️ Apenas leitura
- 🔒 Apenas próprios dados

## 🚀 **COMO EXECUTAR OS TESTES**

### **1. Preparar Ambiente**
```bash
# Iniciar serviços
docker-compose -f docker-compose.infrastructure.yml up -d
cd apps/backend && npm run dev
cd apps/frontend && npm run dev
```

### **2. Criar Usuários de Teste**
```bash
# ADMIN
curl -X POST http://localhost:3000/api/v1/auth/register \
  -H "Content-Type: application/json" \
  -d '{"name": "Admin Test", "email": "admin@test.com", "password": "123456", "role": "ADMIN"}'

# VETERINARIO
curl -X POST http://localhost:3000/api/v1/auth/register \
  -H "Content-Type: application/json" \
  -d '{"name": "Dr. Silva", "email": "vet@test.com", "password": "123456", "role": "VETERINARIO"}'

# FUNCIONARIO
curl -X POST http://localhost:3000/api/v1/auth/register \
  -H "Content-Type: application/json" \
  -d '{"name": "João Func", "email": "func@test.com", "password": "123456", "role": "FUNCIONARIO"}'

# CIDADAO
curl -X POST http://localhost:3000/api/v1/auth/register \
  -H "Content-Type: application/json" \
  -d '{"name": "Maria Cidadã", "email": "cidada@test.com", "password": "123456", "role": "CIDADAO"}'
```

### **3. Obter Tokens**
```bash
# Login e extrair token
TOKEN=$(curl -X POST http://localhost:3000/api/v1/auth/login \
  -H "Content-Type: application/json" \
  -d '{"email": "admin@test.com", "password": "123456"}' \
  | jq -r '.token')
```

### **4. Executar Testes**
```bash
# Teste de validação de CPF
./test-cpf.sh

# Teste de permissões
./test-permissions.sh

# Teste de município
./test-municipality.sh
```

## 📈 **MÉTRICAS DE SUCESSO**

### **Critérios de Aprovação:**
- ✅ **100% dos CPFs válidos** são aceitos
- ✅ **100% dos CPFs inválidos** são rejeitados
- ✅ **0 acessos não autorizados** passam pelos guardrails
- ✅ **Isolamento por município** funciona perfeitamente
- ✅ **Logs de auditoria** registram todas as tentativas
- ✅ **Performance** mantida mesmo com validações

### **Casos de Falha:**
- ❌ CIDADAO consegue cadastrar animal
- ❌ FUNCIONARIO consegue registrar cirurgia
- ❌ Usuário acessa dados de outro município
- ❌ CPF inválido é aceito como válido
- ❌ Documento médico processado por funcionário

## 🎯 **PRÓXIMOS TESTES**

1. **Integração com N8N** - Testar workflows completos
2. **Performance** - Teste de carga com validações
3. **Segurança** - Teste de penetração
4. **Usabilidade** - Teste com usuários reais
5. **Integração** - Teste com APIs externas reais
