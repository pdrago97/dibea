# 🚀 DIBEA - Plano de Implementação das Edge Functions

## 📋 **RESUMO EXECUTIVO**

Este documento define a arquitetura técnica, priorização e cronograma de implementação das 30 Edge Functions necessárias para o chat conversacional do DIBEA.

---

## 🎯 **PRIORIZAÇÃO (MVP → Full Feature)**

### **🔥 FASE 1: MVP - Funcionalidades Essenciais (Semana 1-2)**

**Objetivo:** Habilitar fluxo básico de adoção para cidadãos

| # | Função | Tipo | Prioridade | Complexidade |
|---|--------|------|------------|--------------|
| 1 | `search_animals` | Query | 🔴 Crítica | Média |
| 2 | `get_animal_details` | Query | 🔴 Crítica | Baixa |
| 3 | `create_tutor` | Action | 🔴 Crítica | Média |
| 4 | `create_appointment` | Action | 🔴 Crítica | Média |
| 5 | `create_adoption` | Action | 🔴 Crítica | Baixa |
| 6 | `search_municipalities` | Query | 🔴 Crítica | Baixa |

**Entregável:** Cidadão pode buscar animais, se cadastrar como tutor e solicitar adoção.

---

### **🟡 FASE 2: Gestão Básica (Semana 3-4)**

**Objetivo:** Habilitar gestão operacional para staff

| # | Função | Tipo | Prioridade | Complexidade |
|---|--------|------|------------|--------------|
| 7 | `create_animal` | Action | 🟡 Alta | Média |
| 8 | `update_animal` | Action | 🟡 Alta | Média |
| 9 | `search_adoptions` | Query | 🟡 Alta | Média |
| 10 | `update_adoption_status` | Action | 🟡 Alta | Média |
| 11 | `get_my_adoptions` | Query | 🟡 Alta | Baixa |
| 12 | `search_appointments` | Query | 🟡 Alta | Média |
| 13 | `confirm_appointment` | Action | 🟡 Alta | Baixa |
| 14 | `cancel_appointment` | Action | 🟡 Alta | Baixa |

**Entregável:** Staff pode gerenciar animais, aprovar adoções e gerenciar agendamentos.

---

### **🟢 FASE 3: Funcionalidades Avançadas (Semana 5-6)**

**Objetivo:** Completar funcionalidades de gestão e atendimento

| # | Função | Tipo | Prioridade | Complexidade |
|---|--------|------|------------|--------------|
| 15 | `create_medical_record` | Action | 🟢 Média | Alta |
| 16 | `create_complaint` | Action | 🟢 Média | Média |
| 17 | `search_complaints` | Query | 🟢 Média | Média |
| 18 | `update_complaint_status` | Action | 🟢 Média | Média |
| 19 | `search_campaigns` | Query | 🟢 Média | Média |
| 20 | `get_campaign_details` | Query | 🟢 Média | Baixa |
| 21 | `enroll_in_campaign` | Action | 🟢 Média | Média |
| 22 | `get_available_slots` | Query | 🟢 Média | Alta |

**Entregável:** Sistema completo de denúncias, campanhas e histórico médico.

---

### **🔵 FASE 4: Funcionalidades Complementares (Semana 7-8)**

**Objetivo:** Completar RGA, microchips e perfis

| # | Função | Tipo | Prioridade | Complexidade |
|---|--------|------|------------|--------------|
| 23 | `search_rgas` | Query | 🔵 Baixa | Média |
| 24 | `get_rga_details` | Query | 🔵 Baixa | Baixa |
| 25 | `request_rga` | Action | 🔵 Baixa | Média |
| 26 | `issue_rga` | Action | 🔵 Baixa | Alta |
| 27 | `search_microchips` | Query | 🔵 Baixa | Média |
| 28 | `get_tutor_profile` | Query | 🔵 Baixa | Baixa |
| 29 | `update_tutor` | Action | 🔵 Baixa | Baixa |
| 30 | `get_adoption_stats` | Query | 🔵 Baixa | Média |

**Entregável:** Sistema completo com todas as funcionalidades.

---

## 🏗️ **ARQUITETURA DAS EDGE FUNCTIONS**

### **Estrutura de Diretórios**

```
supabase/functions/
├── _shared/
│   ├── auth.ts              # Validação JWT e permissões
│   ├── database.ts          # Cliente Supabase
│   ├── types.ts             # Tipos TypeScript
│   ├── validators.ts        # Validações de dados
│   ├── errors.ts            # Tratamento de erros
│   └── utils.ts             # Funções utilitárias
│
├── search_animals/
│   └── index.ts
│
├── get_animal_details/
│   └── index.ts
│
├── create_tutor/
│   └── index.ts
│
├── create_appointment/
│   └── index.ts
│
├── create_adoption/
│   └── index.ts
│
└── ... (demais funções)
```

---

### **Template Base de Edge Function**

```typescript
// supabase/functions/[function_name]/index.ts
import { serve } from "https://deno.land/std@0.168.0/http/server.ts"
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2'
import { corsHeaders } from '../_shared/cors.ts'
import { validateAuth, hasPermission } from '../_shared/auth.ts'
import { handleError, AppError } from '../_shared/errors.ts'
import { validateInput } from '../_shared/validators.ts'

serve(async (req) => {
  // Handle CORS preflight
  if (req.method === 'OPTIONS') {
    return new Response('ok', { headers: corsHeaders })
  }

  try {
    // 1. Parse request body
    const body = await req.json()
    
    // 2. Validate input
    const validatedData = validateInput(body, schema)
    
    // 3. Authenticate user
    const user = await validateAuth(req)
    
    // 4. Check permissions
    if (!hasPermission(user, requiredRoles, validatedData)) {
      throw new AppError('FORBIDDEN', 'Insufficient permissions')
    }
    
    // 5. Create Supabase client
    const supabase = createClient(
      Deno.env.get('SUPABASE_URL') ?? '',
      Deno.env.get('SUPABASE_SERVICE_ROLE_KEY') ?? ''
    )
    
    // 6. Execute business logic
    const result = await executeFunction(supabase, validatedData, user)
    
    // 7. Return response
    return new Response(
      JSON.stringify(result),
      { 
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        status: 200
      }
    )
    
  } catch (error) {
    return handleError(error)
  }
})

async function executeFunction(supabase, data, user) {
  // Business logic here
}
```

---

### **Módulo de Autenticação (_shared/auth.ts)**

```typescript
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2'
import { AppError } from './errors.ts'

export interface User {
  id: string
  email: string
  role: 'CIDADAO' | 'TUTOR' | 'FUNCIONARIO' | 'VETERINARIO' | 'ADMIN' | 'SUPER_ADMIN'
  municipality_id?: string
  phone?: string
}

export async function validateAuth(req: Request): Promise<User | null> {
  // Para WhatsApp (não autenticado)
  const phone = req.headers.get('X-User-Phone')
  if (phone) {
    return {
      id: null,
      email: null,
      role: 'CIDADAO',
      phone: phone
    }
  }
  
  // Para usuários autenticados (JWT)
  const authHeader = req.headers.get('Authorization')
  if (!authHeader) {
    return null // Permite acesso público
  }
  
  const token = authHeader.replace('Bearer ', '')
  
  const supabase = createClient(
    Deno.env.get('SUPABASE_URL') ?? '',
    Deno.env.get('SUPABASE_ANON_KEY') ?? ''
  )
  
  const { data: { user }, error } = await supabase.auth.getUser(token)
  
  if (error || !user) {
    throw new AppError('UNAUTHORIZED', 'Invalid token')
  }
  
  // Buscar role e municipality_id do usuário
  const { data: userData, error: userError } = await supabase
    .from('users')
    .select('role, municipality_id')
    .eq('id', user.id)
    .single()
  
  if (userError) {
    throw new AppError('INTERNAL_ERROR', 'Failed to fetch user data')
  }
  
  return {
    id: user.id,
    email: user.email,
    role: userData.role,
    municipality_id: userData.municipality_id
  }
}

export function hasPermission(
  user: User | null,
  requiredRoles: string[],
  resourceData?: any
): boolean {
  // Acesso público
  if (!requiredRoles || requiredRoles.length === 0) {
    return true
  }
  
  // Requer autenticação
  if (!user) {
    return false
  }
  
  // Super Admin tem acesso total
  if (user.role === 'SUPER_ADMIN') {
    return true
  }
  
  // Verificar role
  if (!requiredRoles.includes(user.role)) {
    return false
  }
  
  // Verificar município (se aplicável)
  if (resourceData?.municipality_id && user.municipality_id) {
    if (user.role !== 'VETERINARIO') { // Veterinário pode atuar em múltiplos municípios
      if (resourceData.municipality_id !== user.municipality_id) {
        return false
      }
    }
  }
  
  return true
}

export function canAccessResource(
  user: User | null,
  resourceType: string,
  resourceData: any
): boolean {
  // Lógica específica por tipo de recurso
  switch (resourceType) {
    case 'animal':
      return canAccessAnimal(user, resourceData)
    case 'adoption':
      return canAccessAdoption(user, resourceData)
    case 'appointment':
      return canAccessAppointment(user, resourceData)
    // ... outros casos
    default:
      return false
  }
}

function canAccessAnimal(user: User | null, animal: any): boolean {
  // Público: apenas animais disponíveis
  if (!user || user.role === 'CIDADAO') {
    return animal.status === 'DISPONIVEL'
  }
  
  // Tutor: seus animais + disponíveis
  if (user.role === 'TUTOR') {
    return animal.status === 'DISPONIVEL' || animal.tutor_id === user.id
  }
  
  // Staff: animais do município
  if (['FUNCIONARIO', 'VETERINARIO', 'ADMIN'].includes(user.role)) {
    return animal.municipality_id === user.municipality_id
  }
  
  // Super Admin: todos
  return user.role === 'SUPER_ADMIN'
}

function canAccessAdoption(user: User | null, adoption: any): boolean {
  if (!user) return false
  
  // Tutor: apenas suas adoções
  if (user.role === 'TUTOR') {
    return adoption.tutor_id === user.id
  }
  
  // Staff: adoções do município
  if (['FUNCIONARIO', 'VETERINARIO', 'ADMIN'].includes(user.role)) {
    return adoption.municipality_id === user.municipality_id
  }
  
  return user.role === 'SUPER_ADMIN'
}

function canAccessAppointment(user: User | null, appointment: any): boolean {
  if (!user) return false
  
  // Tutor: apenas seus agendamentos
  if (user.role === 'TUTOR') {
    return appointment.tutor_id === user.id
  }
  
  // Staff: agendamentos do município
  if (['FUNCIONARIO', 'VETERINARIO', 'ADMIN'].includes(user.role)) {
    return appointment.municipality_id === user.municipality_id
  }
  
  return user.role === 'SUPER_ADMIN'
}
```

---

### **Módulo de Validação (_shared/validators.ts)**

```typescript
import { z } from 'https://deno.land/x/zod@v3.22.4/mod.ts'
import { AppError } from './errors.ts'

export function validateInput<T>(data: any, schema: z.ZodSchema<T>): T {
  try {
    return schema.parse(data)
  } catch (error) {
    if (error instanceof z.ZodError) {
      const messages = error.errors.map(e => `${e.path.join('.')}: ${e.message}`)
      throw new AppError('VALIDATION_ERROR', messages.join(', '))
    }
    throw error
  }
}

// Schemas comuns
export const uuidSchema = z.string().uuid()
export const emailSchema = z.string().email()
export const phoneSchema = z.string().regex(/^\(\d{2}\) \d{4,5}-\d{4}$/)
export const cpfSchema = z.string().regex(/^\d{3}\.\d{3}\.\d{3}-\d{2}$/)

export const speciesSchema = z.enum(['CANINO', 'FELINO'])
export const sexSchema = z.enum(['MACHO', 'FEMEA'])
export const sizeSchema = z.enum(['PEQUENO', 'MEDIO', 'GRANDE'])
export const animalStatusSchema = z.enum(['DISPONIVEL', 'ADOTADO', 'EM_TRATAMENTO', 'FALECIDO'])
```

---

### **Módulo de Erros (_shared/errors.ts)**

```typescript
import { corsHeaders } from './cors.ts'

export class AppError extends Error {
  constructor(
    public code: string,
    public message: string,
    public statusCode: number = 400
  ) {
    super(message)
    this.name = 'AppError'
  }
}

export function handleError(error: any): Response {
  console.error('Error:', error)
  
  if (error instanceof AppError) {
    return new Response(
      JSON.stringify({
        error: error.code,
        message: error.message
      }),
      {
        status: error.statusCode,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' }
      }
    )
  }
  
  // Erro genérico
  return new Response(
    JSON.stringify({
      error: 'INTERNAL_ERROR',
      message: 'An unexpected error occurred'
    }),
    {
      status: 500,
      headers: { ...corsHeaders, 'Content-Type': 'application/json' }
    }
  )
}
```

---

## 📊 **CRONOGRAMA DE IMPLEMENTAÇÃO**

| Semana | Fase | Entregas | Testes |
|--------|------|----------|--------|
| 1 | Setup | Estrutura base + módulos compartilhados | Unit tests |
| 2 | MVP | 6 funções essenciais | Integration tests |
| 3-4 | Gestão Básica | 8 funções de gestão | E2E tests |
| 5-6 | Avançadas | 8 funções avançadas | Load tests |
| 7-8 | Complementares | 8 funções complementares | Security tests |

---

## ✅ **CHECKLIST DE IMPLEMENTAÇÃO**

### **Para cada Edge Function:**

- [ ] Criar diretório e arquivo index.ts
- [ ] Implementar validação de input (Zod schema)
- [ ] Implementar autenticação e autorização
- [ ] Implementar lógica de negócio
- [ ] Implementar tratamento de erros
- [ ] Escrever testes unitários
- [ ] Escrever testes de integração
- [ ] Documentar API (OpenAPI/Swagger)
- [ ] Deploy no Supabase
- [ ] Testar em produção
- [ ] Atualizar workflow n8n

---

**Pronto para começar a implementação?** 🚀

