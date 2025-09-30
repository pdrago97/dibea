# 📊 Referência de Schema - Supabase DIBEA

## ⚠️ IMPORTANTE: Nomenclatura de Campos

**Supabase usa `snake_case` para nomes de colunas!**

❌ **ERRADO:** `municipalityId`, `animalId`, `tutorId`, `dateTime`  
✅ **CORRETO:** `municipality_id`, `animal_id`, `tutor_id`, `date_time`

---

## 📋 **Tabela: animals**

### **Campos Obrigatórios:**
```json
{
  "name": "string",
  "species": "CANINO | FELINO",
  "sex": "MACHO | FEMEA",
  "size": "PEQUENO | MEDIO | GRANDE",
  "municipality_id": "uuid"
}
```

### **Campos Opcionais:**
```json
{
  "breed": "string",
  "age": "integer",
  "weight": "decimal",
  "color": "string",
  "temperament": "string",
  "description": "text",
  "status": "DISPONIVEL | ADOTADO | EM_TRATAMENTO | FALECIDO"
}
```

### **Exemplo Completo:**
```json
{
  "name": "Rex",
  "species": "CANINO",
  "breed": "Labrador",
  "sex": "MACHO",
  "size": "GRANDE",
  "age": 3,
  "weight": 30.5,
  "color": "Amarelo",
  "temperament": "Dócil e brincalhão",
  "description": "Cachorro muito carinhoso, adora crianças",
  "status": "DISPONIVEL",
  "municipality_id": "0b227971-5134-4992-b83c-b4f35cabb1c0"
}
```

### **Teste via cURL:**
```bash
curl -X POST "https://xptonqqagxcpzlgndilj.supabase.co/rest/v1/animals" \
  -H "apikey: eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InhwdG9ucXFhZ3hjcHpsZ25kaWxqIiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImlhdCI6MTc1OTA5NjY2NiwiZXhwIjoyMDc0NjcyNjY2fQ.xs_jNdVjWGvRIDrtiMsvWCtoUInUZHdDld0kz9zjGzo" \
  -H "Authorization: Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InhwdG9ucXFhZ3hjcHpsZ25kaWxqIiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImlhdCI6MTc1OTA5NjY2NiwiZXhwIjoyMDc0NjcyNjY2fQ.xs_jNdVjWGvRIDrtiMsvWCtoUInUZHdDld0kz9zjGzo" \
  -H "Content-Type: application/json" \
  -H "Prefer: return=representation" \
  -d '{
    "name": "Rex",
    "species": "CANINO",
    "sex": "MACHO",
    "size": "GRANDE",
    "municipality_id": "0b227971-5134-4992-b83c-b4f35cabb1c0"
  }'
```

---

## 📋 **Tabela: adoptions**

### **Campos Obrigatórios:**
```json
{
  "animal_id": "uuid",
  "tutor_id": "uuid"
}
```

### **Campos Opcionais:**
```json
{
  "status": "PENDENTE | APROVADO | REJEITADO | CONCLUIDO",
  "observations": "text",
  "adoption_date": "date"
}
```

### **Exemplo Completo:**
```json
{
  "animal_id": "uuid-do-animal",
  "tutor_id": "uuid-do-tutor",
  "status": "PENDENTE",
  "observations": "Primeira adoção do tutor",
  "adoption_date": "2025-09-29"
}
```

---

## 📋 **Tabela: appointments**

### **Campos Obrigatórios:**
```json
{
  "type": "VISITA_ADOCAO | CONSULTA | VACINACAO | CASTRACAO",
  "date_time": "ISO8601 timestamp",
  "tutor_id": "uuid"
}
```

### **Campos Opcionais:**
```json
{
  "animal_id": "uuid",
  "status": "AGENDADO | CONFIRMADO | CANCELADO | CONCLUIDO",
  "observations": "text"
}
```

### **Exemplo Completo:**
```json
{
  "type": "VISITA_ADOCAO",
  "date_time": "2025-09-30T14:00:00Z",
  "tutor_id": "uuid-do-tutor",
  "animal_id": "uuid-do-animal",
  "status": "AGENDADO",
  "observations": "Primeira visita para conhecer o animal"
}
```

---

## 📋 **Tabela: tutors**

### **Campos Obrigatórios:**
```json
{
  "name": "string",
  "cpf": "string",
  "email": "string",
  "phone": "string",
  "municipality_id": "uuid"
}
```

### **Campos Opcionais:**
```json
{
  "address": "string",
  "neighborhood": "string",
  "zip_code": "string",
  "has_other_pets": "boolean",
  "housing_type": "CASA | APARTAMENTO | SITIO | OUTRO",
  "has_yard": "boolean"
}
```

### **Exemplo Completo:**
```json
{
  "name": "João Silva",
  "cpf": "123.456.789-00",
  "email": "joao@email.com",
  "phone": "(11) 98765-4321",
  "address": "Rua das Flores, 123",
  "neighborhood": "Centro",
  "zip_code": "12345-678",
  "has_other_pets": false,
  "housing_type": "CASA",
  "has_yard": true,
  "municipality_id": "0b227971-5134-4992-b83c-b4f35cabb1c0"
}
```

---

## 📋 **Tabela: municipalities**

### **Campos Obrigatórios:**
```json
{
  "name": "string",
  "state": "string (2 letras)"
}
```

### **Campos Opcionais:**
```json
{
  "active": "boolean"
}
```

### **Exemplo:**
```json
{
  "name": "São Paulo",
  "state": "SP",
  "active": true
}
```

---

## 🔑 **UUIDs de Referência**

### **Município Padrão (São Paulo):**
```
0b227971-5134-4992-b83c-b4f35cabb1c0
```

Use este UUID quando não souber o município específico.

---

## 🎯 **Mapeamento de Enums**

### **Species (Espécie):**
- `CANINO` - Cachorro
- `FELINO` - Gato

### **Sex (Sexo):**
- `MACHO` - Macho
- `FEMEA` - Fêmea

### **Size (Porte):**
- `PEQUENO` - Pequeno (até 10kg)
- `MEDIO` - Médio (10-25kg)
- `GRANDE` - Grande (acima de 25kg)

### **Status (Animal):**
- `DISPONIVEL` - Disponível para adoção
- `ADOTADO` - Já foi adotado
- `EM_TRATAMENTO` - Em tratamento veterinário
- `FALECIDO` - Falecido

### **Status (Adoption):**
- `PENDENTE` - Aguardando análise
- `APROVADO` - Aprovado para adoção
- `REJEITADO` - Rejeitado
- `CONCLUIDO` - Adoção concluída

### **Status (Appointment):**
- `AGENDADO` - Agendado
- `CONFIRMADO` - Confirmado
- `CANCELADO` - Cancelado
- `CONCLUIDO` - Concluído

### **Type (Appointment):**
- `VISITA_ADOCAO` - Visita para conhecer animal
- `CONSULTA` - Consulta veterinária
- `VACINACAO` - Vacinação
- `CASTRACAO` - Castração

### **Housing Type (Tutor):**
- `CASA` - Casa
- `APARTAMENTO` - Apartamento
- `SITIO` - Sítio/Chácara
- `OUTRO` - Outro tipo

---

## 🚨 **Erros Comuns**

### **1. Campo não encontrado:**
```
Could not find the 'municipalityId' column of 'animals' in the schema cache
```
**Solução:** Use `municipality_id` (snake_case)

### **2. Valor de enum inválido:**
```
new row for relation "animals" violates check constraint "animals_species_check"
```
**Solução:** Use valores exatos: `CANINO` ou `FELINO` (maiúsculas)

### **3. UUID inválido:**
```
invalid input syntax for type uuid
```
**Solução:** Use UUID válido no formato: `xxxxxxxx-xxxx-xxxx-xxxx-xxxxxxxxxxxx`

### **4. Campo obrigatório faltando:**
```
null value in column "municipality_id" violates not-null constraint
```
**Solução:** Adicione o campo obrigatório

---

## ✅ **Checklist de Validação**

Antes de enviar para Supabase, verifique:

- [ ] Todos os nomes de campos estão em `snake_case`
- [ ] Valores de enum estão em MAIÚSCULAS
- [ ] UUIDs estão no formato correto
- [ ] Campos obrigatórios estão presentes
- [ ] Tipos de dados estão corretos (string, integer, boolean, etc.)
- [ ] Datas estão no formato ISO8601

---

## 🧪 **Teste Rápido**

```bash
# Criar animal
curl -X POST "https://xptonqqagxcpzlgndilj.supabase.co/rest/v1/animals" \
  -H "apikey: [ANON_KEY]" \
  -H "Authorization: Bearer [SERVICE_ROLE_KEY]" \
  -H "Content-Type: application/json" \
  -H "Prefer: return=representation" \
  -d '{
    "name": "Teste",
    "species": "CANINO",
    "sex": "MACHO",
    "size": "MEDIO",
    "municipality_id": "0b227971-5134-4992-b83c-b4f35cabb1c0"
  }'

# Listar animais
curl -X GET "https://xptonqqagxcpzlgndilj.supabase.co/rest/v1/animals?select=*" \
  -H "apikey: [ANON_KEY]" \
  -H "Authorization: Bearer [SERVICE_ROLE_KEY]"
```

---

**Sempre use esta referência ao trabalhar com Supabase!** 📚

