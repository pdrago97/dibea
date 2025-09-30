# 🔐 DIBEA - Mapeamento de Permissões e Casos de Uso do Chat Conversacional

## 📊 **TIPOS DE USUÁRIOS**

### **1. CIDADÃO (Público Geral)**
- **Acesso:** Via WhatsApp (não autenticado inicialmente)
- **Identificação:** Por telefone/CPF quando necessário
- **Contexto:** Pode ou não ter cadastro como tutor
- **Município:** Pode ser de qualquer município

### **2. TUTOR (Cidadão Cadastrado)**
- **Acesso:** Via WhatsApp ou Portal Web (autenticado)
- **Identificação:** CPF + telefone verificado
- **Contexto:** Possui animais sob sua tutela
- **Município:** Vinculado a um município específico

### **3. FUNCIONÁRIO**
- **Acesso:** Backoffice Web (autenticado)
- **Identificação:** Email + senha + MFA
- **Contexto:** Funcionário municipal
- **Município:** Vinculado a um município específico
- **Permissões:** Gestão operacional

### **4. VETERINÁRIO**
- **Acesso:** Backoffice Web (autenticado)
- **Identificação:** Email + senha + MFA + CRMV
- **Contexto:** Profissional veterinário
- **Município:** Pode atender múltiplos municípios
- **Permissões:** Gestão médica e técnica

### **5. ADMIN (Administrador Municipal)**
- **Acesso:** Backoffice Web (autenticado)
- **Identificação:** Email + senha + MFA
- **Contexto:** Gestor municipal
- **Município:** Vinculado a um município específico
- **Permissões:** Acesso total ao município

### **6. SUPER_ADMIN (Administrador da Plataforma)**
- **Acesso:** Backoffice Web (autenticado)
- **Identificação:** Email + senha + MFA
- **Contexto:** Gestor da plataforma SaaS
- **Município:** Acesso a todos os municípios
- **Permissões:** Acesso total à plataforma

---

## 🎯 **MATRIZ DE PERMISSÕES - CONSULTAS (QUERIES)**

| Operação | Cidadão | Tutor | Funcionário | Veterinário | Admin | Super Admin |
|----------|---------|-------|-------------|-------------|-------|-------------|
| **ANIMAIS** |
| Buscar animais disponíveis | ✅ Todos | ✅ Todos | ✅ Município | ✅ Todos | ✅ Município | ✅ Todos |
| Ver detalhes animal disponível | ✅ Sim | ✅ Sim | ✅ Município | ✅ Todos | ✅ Município | ✅ Todos |
| Ver histórico médico | ❌ Não | ✅ Seus animais | ✅ Município | ✅ Município | ✅ Município | ✅ Todos |
| Ver animais adotados | ❌ Não | ✅ Seus animais | ✅ Município | ✅ Município | ✅ Município | ✅ Todos |
| Ver animais em tratamento | ❌ Não | ✅ Seus animais | ✅ Município | ✅ Município | ✅ Município | ✅ Todos |
| **ADOÇÕES** |
| Ver minhas adoções | ❌ Não | ✅ Suas | ✅ Município | ✅ Município | ✅ Município | ✅ Todos |
| Ver todas adoções | ❌ Não | ❌ Não | ✅ Município | ✅ Município | ✅ Município | ✅ Todos |
| Ver estatísticas adoção | ✅ Públicas | ✅ Públicas | ✅ Município | ✅ Município | ✅ Município | ✅ Todos |
| **AGENDAMENTOS** |
| Ver meus agendamentos | ❌ Não | ✅ Seus | ✅ Município | ✅ Município | ✅ Município | ✅ Todos |
| Ver todos agendamentos | ❌ Não | ❌ Não | ✅ Município | ✅ Município | ✅ Município | ✅ Todos |
| Ver agenda disponível | ✅ Sim | ✅ Sim | ✅ Município | ✅ Município | ✅ Município | ✅ Todos |
| **CAMPANHAS** |
| Ver campanhas ativas | ✅ Sim | ✅ Sim | ✅ Município | ✅ Município | ✅ Município | ✅ Todos |
| Ver vagas disponíveis | ✅ Sim | ✅ Sim | ✅ Município | ✅ Município | ✅ Município | ✅ Todos |
| Ver inscrições campanha | ❌ Não | ✅ Suas | ✅ Município | ✅ Município | ✅ Município | ✅ Todos |
| **DENÚNCIAS** |
| Ver minhas denúncias | ❌ Não | ✅ Suas | ✅ Município | ✅ Município | ✅ Município | ✅ Todos |
| Ver todas denúncias | ❌ Não | ❌ Não | ✅ Município | ✅ Município | ✅ Município | ✅ Todos |
| **TUTORES** |
| Ver meu cadastro | ❌ Não | ✅ Seu | ✅ Município | ✅ Município | ✅ Município | ✅ Todos |
| Ver outros tutores | ❌ Não | ❌ Não | ✅ Município | ✅ Município | ✅ Município | ✅ Todos |
| **RGA** |
| Ver meus RGAs | ❌ Não | ✅ Seus | ✅ Município | ✅ Município | ✅ Município | ✅ Todos |
| Ver todos RGAs | ❌ Não | ❌ Não | ✅ Município | ✅ Município | ✅ Município | ✅ Todos |
| **MICROCHIPS** |
| Consultar microchip | ✅ Sim | ✅ Sim | ✅ Município | ✅ Todos | ✅ Município | ✅ Todos |
| Ver estoque microchips | ❌ Não | ❌ Não | ✅ Município | ✅ Município | ✅ Município | ✅ Todos |
| **MUNICÍPIOS** |
| Buscar municípios | ✅ Sim | ✅ Sim | ✅ Todos | ✅ Todos | ✅ Todos | ✅ Todos |
| Ver dados município | ✅ Públicos | ✅ Públicos | ✅ Seu município | ✅ Todos | ✅ Seu município | ✅ Todos |

---

## 🎯 **MATRIZ DE PERMISSÕES - AÇÕES (ACTIONS)**

| Operação | Cidadão | Tutor | Funcionário | Veterinário | Admin | Super Admin |
|----------|---------|-------|-------------|-------------|-------|-------------|
| **ANIMAIS** |
| Cadastrar animal | ❌ Não | ❌ Não | ✅ Sim | ✅ Sim | ✅ Sim | ✅ Sim |
| Atualizar animal | ❌ Não | ❌ Não | ✅ Município | ✅ Município | ✅ Município | ✅ Todos |
| Atualizar status animal | ❌ Não | ❌ Não | ✅ Município | ✅ Município | ✅ Município | ✅ Todos |
| Registrar histórico médico | ❌ Não | ❌ Não | ❌ Não | ✅ Município | ✅ Município | ✅ Todos |
| **ADOÇÕES** |
| Solicitar adoção | ❌ Não | ✅ Sim | ❌ Não | ❌ Não | ❌ Não | ❌ Não |
| Aprovar/Rejeitar adoção | ❌ Não | ❌ Não | ✅ Município | ✅ Município | ✅ Município | ✅ Todos |
| Cancelar adoção | ❌ Não | ✅ Sua | ✅ Município | ✅ Município | ✅ Município | ✅ Todos |
| **AGENDAMENTOS** |
| Criar agendamento | ✅ Limitado | ✅ Sim | ✅ Município | ✅ Município | ✅ Município | ✅ Todos |
| Cancelar agendamento | ❌ Não | ✅ Seu | ✅ Município | ✅ Município | ✅ Município | ✅ Todos |
| Confirmar agendamento | ❌ Não | ❌ Não | ✅ Município | ✅ Município | ✅ Município | ✅ Todos |
| Registrar atendimento | ❌ Não | ❌ Não | ✅ Município | ✅ Município | ✅ Município | ✅ Todos |
| **CAMPANHAS** |
| Inscrever em campanha | ✅ Limitado | ✅ Sim | ✅ Município | ✅ Município | ✅ Município | ✅ Todos |
| Cancelar inscrição | ❌ Não | ✅ Sua | ✅ Município | ✅ Município | ✅ Município | ✅ Todos |
| Criar campanha | ❌ Não | ❌ Não | ✅ Município | ✅ Município | ✅ Município | ✅ Todos |
| **DENÚNCIAS** |
| Criar denúncia | ✅ Sim | ✅ Sim | ✅ Sim | ✅ Sim | ✅ Sim | ✅ Sim |
| Atualizar denúncia | ❌ Não | ❌ Não | ✅ Município | ✅ Município | ✅ Município | ✅ Todos |
| Resolver denúncia | ❌ Não | ❌ Não | ✅ Município | ✅ Município | ✅ Município | ✅ Todos |
| **TUTORES** |
| Criar cadastro tutor | ✅ Próprio | ✅ Próprio | ✅ Município | ✅ Município | ✅ Município | ✅ Todos |
| Atualizar cadastro | ❌ Não | ✅ Próprio | ✅ Município | ✅ Município | ✅ Município | ✅ Todos |
| **RGA** |
| Solicitar RGA | ❌ Não | ✅ Seus animais | ✅ Município | ✅ Município | ✅ Município | ✅ Todos |
| Emitir RGA | ❌ Não | ❌ Não | ✅ Município | ✅ Município | ✅ Município | ✅ Todos |
| Renovar RGA | ❌ Não | ✅ Seus RGAs | ✅ Município | ✅ Município | ✅ Município | ✅ Todos |
| **MICROCHIPS** |
| Registrar aplicação | ❌ Não | ❌ Não | ❌ Não | ✅ Município | ✅ Município | ✅ Todos |
| Atualizar estoque | ❌ Não | ❌ Não | ✅ Município | ✅ Município | ✅ Município | ✅ Todos |

---

## 🔍 **REGRAS DE VISIBILIDADE DE DADOS**

### **1. Filtro por Município:**
- **Funcionário/Admin:** Vê apenas dados do seu município
- **Veterinário:** Vê dados dos municípios onde atua
- **Super Admin:** Vê todos os municípios
- **Cidadão/Tutor:** Vê dados públicos de qualquer município

### **2. Filtro por Status do Animal:**
- **Público (Cidadão/Tutor):** Apenas animais com status `DISPONIVEL`
- **Staff (Funcionário/Veterinário/Admin):** Todos os status do município
- **Super Admin:** Todos os status de todos os municípios

### **3. Filtro por Propriedade:**
- **Tutor:** Vê todos os dados dos seus animais (independente do status)
- **Tutor:** Vê apenas suas adoções, agendamentos, denúncias
- **Staff:** Vê todos os dados do município

### **4. Dados Sensíveis:**
- **Histórico Médico:** Apenas tutor do animal, veterinário e admin
- **Dados Pessoais Tutor:** Apenas o próprio tutor e staff do município
- **Denúncias:** Denunciante vê apenas as suas, staff vê todas do município

---

## 📋 **EDGE FUNCTIONS NECESSÁRIAS**

### **🔍 CONSULTAS (QUERIES)**

#### **1. search_animals**
```typescript
// Buscar animais com filtros
// Permissões: Todos (com filtros diferentes por role)
// Parâmetros:
{
  search_query?: string,
  species_filter?: "CANINO" | "FELINO" | "all",
  size_filter?: "PEQUENO" | "MEDIO" | "GRANDE" | "all",
  sex_filter?: "MACHO" | "FEMEA" | "all",
  municipality_filter?: uuid,
  status_filter?: "DISPONIVEL" | "ADOTADO" | "EM_TRATAMENTO" | "FALECIDO",
  limit_count?: number,
  user_role?: string,
  user_id?: uuid,
  user_municipality_id?: uuid
}
```

#### **2. get_animal_details**
```typescript
// Detalhes completos de um animal
// Permissões: Todos (dados diferentes por role)
// Parâmetros:
{
  animal_id: uuid,
  user_role?: string,
  user_id?: uuid,
  include_medical_history?: boolean
}
```

#### **3. search_adoptions**
```typescript
// Buscar adoções
// Permissões: Tutor (suas), Staff (município), Super Admin (todos)
// Parâmetros:
{
  status_filter?: "PENDENTE" | "APROVADO" | "REJEITADO" | "CONCLUIDO",
  tutor_id?: uuid,
  animal_id?: uuid,
  municipality_id?: uuid,
  user_role: string,
  user_id: uuid
}
```

#### **4. get_my_adoptions**
```typescript
// Adoções do tutor logado
// Permissões: Apenas Tutor
// Parâmetros:
{
  tutor_id: uuid,
  status_filter?: string
}
```

#### **5. search_appointments**
```typescript
// Buscar agendamentos
// Permissões: Tutor (seus), Staff (município), Super Admin (todos)
// Parâmetros:
{
  type_filter?: "VISITA_ADOCAO" | "CONSULTA" | "VACINACAO" | "CASTRACAO",
  status_filter?: "AGENDADO" | "CONFIRMADO" | "CANCELADO" | "CONCLUIDO",
  date_from?: date,
  date_to?: date,
  tutor_id?: uuid,
  animal_id?: uuid,
  municipality_id?: uuid,
  user_role: string,
  user_id: uuid
}
```

#### **6. get_available_slots**
```typescript
// Horários disponíveis para agendamento
// Permissões: Todos
// Parâmetros:
{
  appointment_type: string,
  date: date,
  municipality_id: uuid
}
```

#### **7. search_campaigns**
```typescript
// Buscar campanhas
// Permissões: Todos (públicas), Staff (todas do município)
// Parâmetros:
{
  status_filter?: "ATIVA" | "ENCERRADA",
  type_filter?: "CASTRACAO" | "VACINACAO" | "MICROCHIPAGEM",
  municipality_id?: uuid,
  user_role?: string
}
```

#### **8. get_campaign_details**
```typescript
// Detalhes de uma campanha
// Permissões: Todos
// Parâmetros:
{
  campaign_id: uuid,
  include_enrollments?: boolean,
  user_role?: string
}
```

#### **9. search_complaints**
```typescript
// Buscar denúncias
// Permissões: Tutor (suas), Staff (município), Super Admin (todos)
// Parâmetros:
{
  status_filter?: "ABERTA" | "EM_ANALISE" | "RESOLVIDA" | "ARQUIVADA",
  protocol?: string,
  municipality_id?: uuid,
  user_role: string,
  user_id: uuid
}
```

#### **10. get_adoption_stats**
```typescript
// Estatísticas de adoção
// Permissões: Todos (públicas), Staff (detalhadas do município)
// Parâmetros:
{
  municipality_id?: uuid,
  period_days?: number,
  user_role?: string
}
```

#### **11. search_rgas**
```typescript
// Buscar RGAs (Registro Geral Animal)
// Permissões: Tutor (seus), Staff (município), Super Admin (todos)
// Parâmetros:
{
  rga_number?: string,
  animal_id?: uuid,
  tutor_id?: uuid,
  status_filter?: "ATIVO" | "VENCIDO" | "CANCELADO",
  municipality_id?: uuid,
  user_role: string,
  user_id: uuid
}
```

#### **12. get_rga_details**
```typescript
// Detalhes de um RGA específico
// Permissões: Tutor (seu), Staff (município), Super Admin (todos)
// Parâmetros:
{
  rga_id: uuid,
  user_role: string,
  user_id: uuid
}
```

#### **13. search_microchips**
```typescript
// Buscar microchips
// Permissões: Todos (consulta pública), Staff (estoque do município)
// Parâmetros:
{
  chip_number?: string,
  animal_id?: uuid,
  status_filter?: "DISPONIVEL" | "APLICADO" | "PERDIDO",
  municipality_id?: uuid,
  user_role?: string
}
```

#### **14. search_municipalities**
```typescript
// Buscar municípios
// Permissões: Todos
// Parâmetros:
{
  search_query?: string,
  state_filter?: string,
  active_only?: boolean
}
```

#### **15. get_tutor_profile**
```typescript
// Perfil do tutor
// Permissões: Tutor (próprio), Staff (município), Super Admin (todos)
// Parâmetros:
{
  tutor_id: uuid,
  user_role: string,
  user_id: uuid,
  include_animals?: boolean,
  include_adoptions?: boolean
}
```

---

### **🎯 AÇÕES (ACTIONS)**

#### **16. create_animal**
```typescript
// Cadastrar novo animal
// Permissões: Funcionário, Veterinário, Admin, Super Admin
// Parâmetros:
{
  name: string,
  species: "CANINO" | "FELINO",
  breed?: string,
  sex: "MACHO" | "FEMEA",
  size: "PEQUENO" | "MEDIO" | "GRANDE",
  age?: number,
  weight?: number,
  color?: string,
  temperament?: string,
  description?: text,
  municipality_id: uuid,
  user_role: string,
  user_id: uuid
}
```

#### **17. update_animal**
```typescript
// Atualizar dados do animal
// Permissões: Funcionário, Veterinário, Admin (município), Super Admin (todos)
// Parâmetros:
{
  animal_id: uuid,
  updates: {
    name?: string,
    breed?: string,
    age?: number,
    weight?: number,
    color?: string,
    temperament?: string,
    description?: text,
    status?: "DISPONIVEL" | "ADOTADO" | "EM_TRATAMENTO" | "FALECIDO"
  },
  user_role: string,
  user_id: uuid,
  user_municipality_id: uuid
}
```

#### **18. create_adoption**
```typescript
// Solicitar adoção
// Permissões: Tutor
// Parâmetros:
{
  animal_id: uuid,
  tutor_id: uuid,
  observations?: text,
  user_role: string,
  user_id: uuid
}
```

#### **19. update_adoption_status**
```typescript
// Aprovar/Rejeitar adoção
// Permissões: Funcionário, Veterinário, Admin (município), Super Admin (todos)
// Parâmetros:
{
  adoption_id: uuid,
  new_status: "APROVADO" | "REJEITADO" | "CONCLUIDO",
  rejection_reason?: text,
  user_role: string,
  user_id: uuid,
  user_municipality_id: uuid
}
```

#### **20. create_appointment**
```typescript
// Criar agendamento
// Permissões: Cidadão (limitado), Tutor, Staff
// Parâmetros:
{
  type: "VISITA_ADOCAO" | "CONSULTA" | "VACINACAO" | "CASTRACAO",
  date_time: ISO8601,
  tutor_id: uuid,
  animal_id?: uuid,
  observations?: text,
  municipality_id: uuid,
  user_role?: string,
  user_id?: uuid
}
```

#### **21. cancel_appointment**
```typescript
// Cancelar agendamento
// Permissões: Tutor (seu), Staff (município)
// Parâmetros:
{
  appointment_id: uuid,
  cancellation_reason: text,
  user_role: string,
  user_id: uuid
}
```

#### **22. confirm_appointment**
```typescript
// Confirmar agendamento
// Permissões: Funcionário, Veterinário, Admin (município)
// Parâmetros:
{
  appointment_id: uuid,
  user_role: string,
  user_id: uuid,
  user_municipality_id: uuid
}
```

#### **23. create_medical_record**
```typescript
// Registrar histórico médico
// Permissões: Veterinário, Admin (município)
// Parâmetros:
{
  animal_id: uuid,
  record_type: "CONSULTA" | "VACINACAO" | "CIRURGIA" | "EXAME",
  date: date,
  description: text,
  veterinarian_id: uuid,
  medications?: text,
  next_appointment?: date,
  user_role: string,
  user_id: uuid
}
```

#### **24. enroll_in_campaign**
```typescript
// Inscrever em campanha
// Permissões: Cidadão (limitado), Tutor, Staff
// Parâmetros:
{
  campaign_id: uuid,
  tutor_id: uuid,
  animal_id?: uuid,
  observations?: text,
  user_role?: string,
  user_id?: uuid
}
```

#### **25. create_complaint**
```typescript
// Criar denúncia
// Permissões: Todos
// Parâmetros:
{
  complaint_type: "MAUS_TRATOS" | "ABANDONO" | "ANIMAL_PERDIDO" | "OUTRO",
  description: text,
  location: string,
  latitude?: number,
  longitude?: number,
  photos?: array<url>,
  reporter_name?: string,
  reporter_phone?: string,
  reporter_email?: string,
  municipality_id: uuid,
  user_role?: string,
  user_id?: uuid
}
```

#### **26. update_complaint_status**
```typescript
// Atualizar status da denúncia
// Permissões: Funcionário, Admin (município)
// Parâmetros:
{
  complaint_id: uuid,
  new_status: "EM_ANALISE" | "RESOLVIDA" | "ARQUIVADA",
  resolution_notes?: text,
  user_role: string,
  user_id: uuid,
  user_municipality_id: uuid
}
```

#### **27. create_tutor**
```typescript
// Cadastrar tutor
// Permissões: Cidadão (próprio), Staff (qualquer)
// Parâmetros:
{
  name: string,
  cpf: string,
  email: string,
  phone: string,
  address?: string,
  neighborhood?: string,
  zip_code?: string,
  has_other_pets?: boolean,
  housing_type?: "CASA" | "APARTAMENTO" | "SITIO" | "OUTRO",
  has_yard?: boolean,
  municipality_id: uuid,
  user_role?: string,
  user_id?: uuid
}
```

#### **28. update_tutor**
```typescript
// Atualizar cadastro de tutor
// Permissões: Tutor (próprio), Staff (município)
// Parâmetros:
{
  tutor_id: uuid,
  updates: {
    name?: string,
    email?: string,
    phone?: string,
    address?: string,
    neighborhood?: string,
    zip_code?: string,
    has_other_pets?: boolean,
    housing_type?: string,
    has_yard?: boolean
  },
  user_role: string,
  user_id: uuid
}
```

#### **29. request_rga**
```typescript
// Solicitar RGA
// Permissões: Tutor (seus animais), Staff (município)
// Parâmetros:
{
  animal_id: uuid,
  tutor_id: uuid,
  user_role: string,
  user_id: uuid
}
```

#### **30. issue_rga**
```typescript
// Emitir RGA
// Permissões: Funcionário, Admin (município)
// Parâmetros:
{
  rga_request_id: uuid,
  rga_number: string,
  issue_date: date,
  expiration_date: date,
  fee_amount: decimal,
  fee_paid: boolean,
  user_role: string,
  user_id: uuid,
  user_municipality_id: uuid
}
```

---

## 🔐 **IMPLEMENTAÇÃO DE SEGURANÇA**

### **1. Autenticação no Chat**

#### **Fluxo para Cidadão (WhatsApp):**
```
1. Usuário envia mensagem
2. Sistema identifica por telefone
3. Se não cadastrado: oferece cadastro simplificado
4. Se cadastrado como tutor: autentica automaticamente
5. Para ações sensíveis: solicita confirmação por código SMS
```

#### **Fluxo para Staff (Backoffice):**
```
1. Login com email + senha + MFA
2. JWT token com claims: user_id, role, municipality_id
3. Token enviado no header das requisições
4. Edge Functions validam token e permissões
```

### **2. Validação de Permissões nas Edge Functions**

```typescript
// Exemplo de validação
async function validatePermission(
  req: Request,
  requiredRole: string[],
  resourceMunicipalityId?: string
): Promise<{authorized: boolean, user: User}> {

  // 1. Extrair e validar JWT token
  const token = req.headers.get('Authorization')?.replace('Bearer ', '')
  if (!token) return {authorized: false, user: null}

  // 2. Decodificar token
  const user = await verifyJWT(token)
  if (!user) return {authorized: false, user: null}

  // 3. Verificar role
  if (!requiredRole.includes(user.role)) {
    return {authorized: false, user}
  }

  // 4. Verificar município (se aplicável)
  if (resourceMunicipalityId && user.role !== 'SUPER_ADMIN') {
    if (user.municipality_id !== resourceMunicipalityId) {
      return {authorized: false, user}
    }
  }

  return {authorized: true, user}
}
```

### **3. Row Level Security (RLS) no Supabase**

```sql
-- Exemplo: Política RLS para tabela animals
CREATE POLICY "animals_select_policy" ON animals
FOR SELECT USING (
  -- Público vê apenas disponíveis
  (status = 'DISPONIVEL') OR

  -- Tutor vê seus animais
  (id IN (
    SELECT animal_id FROM adoptions
    WHERE tutor_id = auth.uid() AND status = 'CONCLUIDO'
  )) OR

  -- Staff vê do município
  (municipality_id IN (
    SELECT municipality_id FROM users
    WHERE id = auth.uid() AND role IN ('FUNCIONARIO', 'VETERINARIO', 'ADMIN')
  )) OR

  -- Super Admin vê tudo
  (EXISTS (
    SELECT 1 FROM users
    WHERE id = auth.uid() AND role = 'SUPER_ADMIN'
  ))
);
```

---

## 📝 **CASOS DE USO DETALHADOS**

### **Caso 1: Cidadão busca animal para adoção**
```
Usuário: "Quero adotar um cachorro pequeno"

Fluxo:
1. SMART AGENT1 identifica: QUERY + search_animals
2. Parâmetros: {species: "CANINO", size: "PEQUENO", status: "DISPONIVEL"}
3. Edge Function aplica filtros + RLS
4. Retorna apenas animais disponíveis
5. SMART AGENT2 formata resposta amigável
```

### **Caso 2: Tutor consulta suas adoções**
```
Usuário (Tutor): "Quais são minhas adoções?"

Fluxo:
1. Sistema identifica tutor por telefone/JWT
2. SMART AGENT1: QUERY + get_my_adoptions
3. Parâmetros: {tutor_id: <user_id>}
4. Edge Function valida: user_id == tutor_id
5. Retorna apenas adoções do tutor
```

### **Caso 3: Funcionário cadastra animal**
```
Usuário (Funcionário): "Cadastrar cachorro Rex, macho, grande"

Fluxo:
1. Sistema valida JWT + role = FUNCIONARIO
2. SMART AGENT1: ACTION + create_animal
3. Parâmetros: {name: "Rex", species: "CANINO", sex: "MACHO", size: "GRANDE"}
4. Edge Function valida permissão + município
5. Cria animal no banco
6. Retorna confirmação com ID e QR Code
```

### **Caso 4: Veterinário registra consulta**
```
Usuário (Veterinário): "Registrar consulta do animal <ID>"

Fluxo:
1. Sistema valida JWT + role = VETERINARIO
2. SMART AGENT1: ACTION + create_medical_record
3. Edge Function valida: animal pertence ao município do veterinário
4. Registra histórico médico
5. Notifica tutor via WhatsApp
```

### **Caso 5: Admin aprova adoção**
```
Usuário (Admin): "Aprovar adoção <ID>"

Fluxo:
1. Sistema valida JWT + role = ADMIN
2. SMART AGENT1: ACTION + update_adoption_status
3. Edge Function valida: adoção pertence ao município do admin
4. Atualiza status para APROVADO
5. Atualiza status do animal para ADOTADO
6. Notifica tutor via WhatsApp
7. Agenda visita pós-adoção
```

---

## 🎯 **PRÓXIMOS PASSOS**

1. [ ] Revisar e aprovar matriz de permissões
2. [ ] Definir prioridade de implementação das Edge Functions
3. [ ] Criar estrutura base das Edge Functions
4. [ ] Implementar validação de JWT e permissões
5. [ ] Implementar RLS policies no Supabase
6. [ ] Criar testes unitários para cada função
7. [ ] Atualizar workflow n8n com novas funções
8. [ ] Documentar APIs para frontend
9. [ ] Implementar rate limiting e throttling
10. [ ] Configurar logs e monitoramento

---

**Documento criado em:** 2025-09-29
**Versão:** 1.0
**Status:** Aguardando revisão e aprovação

