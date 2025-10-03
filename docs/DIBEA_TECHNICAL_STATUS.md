# 🔧 DIBEA - Status Técnico Detalhado

**Versão:** 1.0  
**Data:** Janeiro 2025  
**Tipo:** Documentação Técnica

---

## 📊 VISÃO GERAL

### Arquitetura Atual

```
┌─────────────────────────────────────────────────────────┐
│                    FRONTEND (Next.js 14)                 │
│  ┌──────────┐  ┌──────────┐  ┌──────────┐              │
│  │ Citizen  │  │  Admin   │  │   Vet    │              │
│  │Dashboard │  │Dashboard │  │Dashboard │              │
│  └──────────┘  └──────────┘  └──────────┘              │
│                                                          │
│  ┌──────────────────────────────────────────────────┐  │
│  │         Shared Components (Shadcn/ui)            │  │
│  └──────────────────────────────────────────────────┘  │
└─────────────────────────────────────────────────────────┘
                           │
                           ▼
┌─────────────────────────────────────────────────────────┐
│                  BACKEND (Node.js + Express)             │
│  ┌──────────┐  ┌──────────┐  ┌──────────┐              │
│  │  Animal  │  │   User   │  │ Adoption │              │
│  │Controller│  │Controller│  │Controller│              │
│  └──────────┘  └──────────┘  └──────────┘              │
│                                                          │
│  ┌──────────────────────────────────────────────────┐  │
│  │         Services (Business Logic)                │  │
│  └──────────────────────────────────────────────────┘  │
│                                                          │
│  ┌──────────────────────────────────────────────────┐  │
│  │         Prisma ORM (Database Access)             │  │
│  └──────────────────────────────────────────────────┘  │
└─────────────────────────────────────────────────────────┘
                           │
                           ▼
┌─────────────────────────────────────────────────────────┐
│                    DATABASES                             │
│  ┌──────────────────┐  ┌──────────────────┐            │
│  │   PostgreSQL     │  │      Neo4j       │            │
│  │   (Supabase)     │  │ (Knowledge Graph)│            │
│  └──────────────────┘  └──────────────────┘            │
└─────────────────────────────────────────────────────────┘
                           │
                           ▼
┌─────────────────────────────────────────────────────────┐
│                  AUTOMATION (N8N)                        │
│  ┌──────────┐  ┌──────────┐  ┌──────────┐              │
│  │  Router  │  │  Search  │  │ General  │              │
│  │  Agent   │  │  Agent   │  │  Agent   │              │
│  └──────────┘  └──────────┘  └──────────┘              │
│                                                          │
│  ┌──────────────────────────────────────────────────┐  │
│  │         OpenAI GPT-4 Integration                 │  │
│  └──────────────────────────────────────────────────┘  │
└─────────────────────────────────────────────────────────┘
```

---

## 🗄️ BANCO DE DADOS

### Schema Implementado (PostgreSQL)

#### Tabelas Principais:

```sql
-- 1. USERS (Autenticação e Perfis)
users (
  id UUID PRIMARY KEY,
  email VARCHAR(255) UNIQUE,
  password_hash VARCHAR(255),
  name VARCHAR(255),
  role user_role, -- ADMIN, FUNCIONARIO, VETERINARIO, CIDADAO
  municipality_id UUID,
  is_active BOOLEAN,
  created_at TIMESTAMP,
  updated_at TIMESTAMP
)

-- 2. ANIMALS (Animais)
animals (
  id UUID PRIMARY KEY,
  name VARCHAR(255),
  species animal_species, -- CANINO, FELINO, OUTROS
  breed VARCHAR(100),
  sex animal_sex, -- MACHO, FEMEA
  size animal_size, -- PEQUENO, MEDIO, GRANDE
  birth_date DATE,
  weight DECIMAL(5,2),
  color VARCHAR(100),
  temperament TEXT,
  observations TEXT,
  status animal_status, -- DISPONIVEL, ADOTADO, TRATAMENTO, OBITO
  qr_code VARCHAR(100) UNIQUE,
  municipality_id UUID,
  microchip_id UUID,
  created_at TIMESTAMP,
  updated_at TIMESTAMP
)

-- 3. ADOPTIONS (Adoções)
adoptions (
  id UUID PRIMARY KEY,
  animal_id UUID,
  tutor_id UUID,
  status adoption_status, -- PENDENTE, APROVADA, REJEITADA
  notes TEXT,
  created_at TIMESTAMP,
  updated_at TIMESTAMP
)

-- 4. NOTIFICATIONS (Notificações)
notifications (
  id UUID PRIMARY KEY,
  title VARCHAR(255),
  message TEXT,
  type notification_type, -- ADOPTION, TASK, SYSTEM, ALERT
  category VARCHAR(50), -- ADOCAO, DENUNCIA, CAMPANHA
  priority notification_priority, -- LOW, MEDIUM, HIGH, URGENT
  status notification_status, -- UNREAD, READ, ARCHIVED
  user_id UUID,
  animal_id UUID,
  adoption_id UUID,
  action_type VARCHAR(50),
  action_url VARCHAR(255),
  read_at TIMESTAMP,
  created_at TIMESTAMP
)

-- 5. TASKS (Tarefas)
tasks (
  id UUID PRIMARY KEY,
  title VARCHAR(255),
  description TEXT,
  type task_type, -- ADOPTION_REVIEW, DOCUMENT_VERIFICATION
  status task_status, -- PENDING, IN_PROGRESS, COMPLETED
  priority task_priority,
  created_by_id UUID,
  assigned_to_id UUID,
  animal_id UUID,
  adoption_id UUID,
  due_date TIMESTAMP,
  completed_at TIMESTAMP,
  created_at TIMESTAMP
)

-- 6. MUNICIPALITIES (Municípios)
municipalities (
  id UUID PRIMARY KEY,
  name VARCHAR(255),
  state VARCHAR(2),
  email VARCHAR(255),
  active BOOLEAN,
  created_at TIMESTAMP
)

-- 7. CONVERSATION_CONTEXTS (Contexto de Chat)
conversation_contexts (
  id UUID PRIMARY KEY,
  session_id VARCHAR(255) UNIQUE,
  user_id UUID,
  context_data JSONB,
  last_intent VARCHAR(100),
  last_agent VARCHAR(100),
  created_at TIMESTAMP,
  updated_at TIMESTAMP
)

-- 8. AGENT_INTERACTIONS (Histórico de IA)
agent_interactions (
  id UUID PRIMARY KEY,
  user_id UUID,
  agent_name VARCHAR(100),
  user_input TEXT,
  agent_response TEXT,
  response_time_ms INTEGER,
  success BOOLEAN,
  error_message TEXT,
  created_at TIMESTAMP
)
```

#### Enums Definidos:

```sql
-- Roles de usuário
CREATE TYPE user_role AS ENUM (
  'ADMIN',
  'FUNCIONARIO',
  'VETERINARIO',
  'CIDADAO'
);

-- Espécies de animais
CREATE TYPE animal_species AS ENUM (
  'CANINO',
  'FELINO',
  'OUTROS'
);

-- Status de animais
CREATE TYPE animal_status AS ENUM (
  'DISPONIVEL',
  'ADOTADO',
  'TRATAMENTO',
  'OBITO',
  'PERDIDO'
);

-- Status de adoções
CREATE TYPE adoption_status AS ENUM (
  'PENDENTE',
  'APROVADA',
  'REJEITADA'
);
```

### Relacionamentos:

```
users ──┬── 1:N ──→ adoptions (como tutor)
        ├── 1:N ──→ tasks (criadas)
        ├── 1:N ──→ tasks (assignadas)
        ├── 1:N ──→ notifications
        └── 1:N ──→ conversation_contexts

animals ──┬── 1:N ──→ adoptions
          ├── 1:N ──→ notifications
          └── 1:N ──→ tasks

municipalities ──┬── 1:N ──→ users
                 └── 1:N ──→ animals

adoptions ──┬── 1:N ──→ notifications
            └── 1:N ──→ tasks
```

---

## 🔌 API ENDPOINTS

### Implementados:

#### Authentication:
```
POST   /api/v1/auth/register     - Criar conta
POST   /api/v1/auth/login        - Login
POST   /api/v1/auth/logout       - Logout
GET    /api/v1/auth/me           - Usuário atual
```

#### Animals:
```
GET    /api/v1/animals           - Listar animais
GET    /api/v1/animals/:id       - Detalhes do animal
POST   /api/v1/animals           - Criar animal (ADMIN)
PUT    /api/v1/animals/:id       - Atualizar animal (ADMIN)
DELETE /api/v1/animals/:id       - Deletar animal (ADMIN)
GET    /api/v1/animals/search    - Buscar animais
```

#### Adoptions:
```
GET    /api/v1/adoptions         - Listar adoções
GET    /api/v1/adoptions/:id     - Detalhes da adoção
POST   /api/v1/adoptions         - Criar adoção
PUT    /api/v1/adoptions/:id     - Atualizar status (ADMIN)
GET    /api/v1/adoptions/my      - Minhas adoções
```

#### Users:
```
GET    /api/v1/users             - Listar usuários (ADMIN)
GET    /api/v1/users/:id         - Detalhes do usuário
PUT    /api/v1/users/:id         - Atualizar usuário
GET    /api/v1/users/profile     - Meu perfil
PUT    /api/v1/users/profile     - Atualizar perfil
```

#### Notifications:
```
GET    /api/v1/notifications     - Listar notificações
GET    /api/v1/notifications/:id - Detalhes
PUT    /api/v1/notifications/:id - Marcar como lida
DELETE /api/v1/notifications/:id - Deletar
```

### Não Implementados (Necessários para MVP):

```
POST   /api/v1/animals/:id/photos        - Upload de fotos
DELETE /api/v1/animals/:id/photos/:photoId - Deletar foto
GET    /api/v1/animals/:id/medical       - Histórico médico
POST   /api/v1/animals/:id/medical       - Adicionar procedimento

POST   /api/v1/adoptions/:id/documents   - Upload de documentos
GET    /api/v1/adoptions/:id/documents   - Listar documentos
POST   /api/v1/adoptions/:id/approve     - Aprovar adoção
POST   /api/v1/adoptions/:id/reject      - Rejeitar adoção

GET    /api/v1/dashboard/stats           - Estatísticas
GET    /api/v1/dashboard/recent          - Atividades recentes

POST   /api/v1/chat/message              - Enviar mensagem ao chat
GET    /api/v1/chat/history              - Histórico de conversas
```

---

## 🎨 FRONTEND

### Estrutura de Pastas:

```
apps/frontend/src/
├── app/                          # Next.js App Router
│   ├── (auth)/
│   │   ├── login/
│   │   └── register/
│   ├── admin/
│   │   ├── dashboard/
│   │   ├── animals/
│   │   ├── users/
│   │   └── analytics/
│   ├── citizen/
│   │   ├── dashboard/
│   │   ├── profile/
│   │   └── adoption/
│   ├── animals/
│   │   ├── [id]/
│   │   └── search/
│   ├── notifications/
│   └── api/
│
├── components/
│   ├── ui/                       # Shadcn components
│   │   ├── button.tsx
│   │   ├── card.tsx
│   │   ├── input.tsx
│   │   └── ...
│   ├── chat/
│   │   ├── ChatInterface.tsx
│   │   └── ChatBot.tsx
│   ├── navigation/
│   │   └── MainNavigation.tsx
│   └── admin/
│       ├── AdvancedDashboard.tsx
│       └── UserManagement.tsx
│
├── hooks/
│   ├── useAuth.ts
│   ├── useDashboard.ts
│   └── useChatBot.ts
│
├── services/
│   ├── chatService.ts
│   ├── dashboardService.ts
│   └── api.ts
│
├── lib/
│   ├── utils.ts
│   └── validators.ts
│
└── types/
    └── index.ts
```

### Páginas Implementadas:

#### Cidadão:
- ✅ `/citizen/dashboard` - Dashboard principal
- ✅ `/citizen/profile` - Perfil do usuário
- ✅ `/citizen/adoption/start/[animalId]` - Iniciar adoção
- ⚠️ `/citizen/adoptions` - Meus processos (parcial)
- ❌ `/citizen/favorites` - Favoritos (não implementado)

#### Admin:
- ✅ `/admin/dashboard` - Dashboard administrativo
- ✅ `/admin/animals` - Gestão de animais
- ✅ `/admin/users` - Gestão de usuários
- ⚠️ `/admin/analytics` - Analytics (parcial)
- ❌ `/admin/settings` - Configurações (não implementado)

#### Compartilhadas:
- ✅ `/animals` - Listagem de animais
- ✅ `/animals/[id]` - Detalhes do animal
- ✅ `/notifications` - Central de notificações
- ✅ `/auth/login` - Login
- ✅ `/auth/register` - Registro

### Componentes Principais:

```tsx
// 1. ChatInterface
<ChatInterface
  sessionId="session-123"
  userId="user-456"
  onMessageSent={(message) => {}}
/>

// 2. AnimalCard (atual - precisa redesign)
<Card>
  <img src={animal.photo} />
  <h3>{animal.name}</h3>
  <p>{animal.breed}</p>
  <Button>Adotar</Button>
</Card>

// 3. Dashboard Stats
<StatsCard
  title="Animais Disponíveis"
  value={12}
  icon={<PawPrint />}
  trend="+2 esta semana"
/>

// 4. Notification Item
<NotificationItem
  title="Nova adoção"
  message="Rex foi adotado!"
  type="success"
  timestamp="2h atrás"
/>
```

---

## 🤖 SISTEMA DE CHAT IA

### Arquitetura:

```
User Input
    │
    ▼
┌─────────────────┐
│  ChatInterface  │ (Frontend)
└─────────────────┘
    │
    ▼
┌─────────────────┐
│  chatService.ts │ (Frontend Service)
└─────────────────┘
    │
    ▼ HTTP POST
┌─────────────────┐
│  N8N Webhook    │ (n8n-moveup-u53084.vm.elestio.app)
└─────────────────┘
    │
    ▼
┌─────────────────┐
│  Router Agent   │ (OpenAI GPT-4)
│  - Intent       │
│  - Confidence   │
│  - Parameters   │
└─────────────────┘
    │
    ├─→ Search Agent (buscar animais)
    ├─→ General Agent (perguntas gerais)
    └─→ Action Agent (criar adoção)
    │
    ▼
┌─────────────────┐
│  Supabase DB    │
│  - Query data   │
│  - Save context │
└─────────────────┘
    │
    ▼
Response to User
```

### Agentes Implementados:

#### 1. Router Agent
```typescript
// Função: Detectar intenção do usuário
Input: "Quero adotar um cachorro grande"
Output: {
  intent: "SEARCH_ANIMAL",
  confidence: 0.95,
  parameters: {
    species: "CANINO",
    size: "GRANDE"
  },
  agent: "SEARCH_AGENT"
}
```

#### 2. Search Agent
```typescript
// Função: Buscar animais no banco
Input: { species: "CANINO", size: "GRANDE" }
Output: {
  animals: [
    { id: "123", name: "Rex", breed: "Labrador" },
    { id: "456", name: "Thor", breed: "Pastor Alemão" }
  ],
  count: 2
}
```

#### 3. General Agent
```typescript
// Função: Responder perguntas gerais
Input: "Como funciona o processo de adoção?"
Output: {
  response: "O processo de adoção tem 4 etapas: 1. Escolha do animal..."
}
```

### Contexto Persistente:

```typescript
interface ConversationContext {
  sessionId: string;
  userId?: string;
  contextData: {
    lastIntent?: string;
    lastAnimalViewed?: string;
    conversationHistory: Message[];
  };
  lastAgent?: string;
  createdAt: Date;
  updatedAt: Date;
}
```

---

## 🔐 AUTENTICAÇÃO E AUTORIZAÇÃO

### Implementação Atual:

```typescript
// JWT Token
{
  userId: "uuid",
  email: "user@example.com",
  role: "CIDADAO",
  municipalityId: "uuid",
  iat: 1234567890,
  exp: 1234567890
}

// Middleware de Autenticação
const authMiddleware = (req, res, next) => {
  const token = req.headers.authorization?.split(' ')[1];
  if (!token) return res.status(401).json({ error: 'Unauthorized' });
  
  try {
    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    req.user = decoded;
    next();
  } catch (error) {
    res.status(401).json({ error: 'Invalid token' });
  }
};

// Middleware de Autorização
const requireRole = (roles: string[]) => {
  return (req, res, next) => {
    if (!roles.includes(req.user.role)) {
      return res.status(403).json({ error: 'Forbidden' });
    }
    next();
  };
};
```

### Permissões por Role:

```typescript
const permissions = {
  CIDADAO: [
    'animals:read',
    'adoptions:create',
    'adoptions:read:own',
    'profile:update:own'
  ],
  FUNCIONARIO: [
    'animals:read',
    'animals:create',
    'animals:update',
    'adoptions:read',
    'adoptions:update',
    'users:read'
  ],
  VETERINARIO: [
    'animals:read',
    'animals:update',
    'medical:create',
    'medical:read'
  ],
  ADMIN: [
    '*' // Todas as permissões
  ]
};
```

---

## 📦 DEPENDÊNCIAS PRINCIPAIS

### Frontend:
```json
{
  "next": "14.0.4",
  "react": "18.2.0",
  "typescript": "5.3.3",
  "tailwindcss": "3.4.0",
  "@radix-ui/react-*": "^1.0.0", // Shadcn components
  "react-hook-form": "^7.49.0",
  "zod": "^3.22.4",
  "lucide-react": "^0.294.0"
}
```

### Backend:
```json
{
  "express": "^4.18.2",
  "prisma": "^5.7.1",
  "@prisma/client": "^5.7.1",
  "bcrypt": "^5.1.1",
  "jsonwebtoken": "^9.0.2",
  "zod": "^3.22.4",
  "winston": "^3.11.0"
}
```

---

## 🚨 PROBLEMAS TÉCNICOS CONHECIDOS

### Críticos:
1. ❌ **Upload de imagens não funciona** - Supabase Storage não configurado
2. ❌ **Chat IA não executa ações** - Apenas retorna texto
3. ❌ **Notificações não são em tempo real** - Falta WebSocket
4. ❌ **Sem testes automatizados** - 0% coverage

### Médios:
1. ⚠️ **Performance ruim em listagens** - Sem paginação
2. ⚠️ **Queries N+1** - Falta eager loading
3. ⚠️ **Sem cache** - Todas as queries vão ao banco
4. ⚠️ **Logs não estruturados** - Difícil debugar

### Baixos:
1. 🟡 **Sem validação de CPF** - Aceita qualquer string
2. 🟡 **Sem rate limiting** - Vulnerável a abuse
3. 🟡 **Sem CORS configurado** - Aceita qualquer origem
4. 🟡 **Senhas fracas aceitas** - Sem política de senha

---

**Próxima Ação:** Priorizar correção dos problemas críticos

