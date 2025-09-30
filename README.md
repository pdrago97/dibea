# 🐾 DIBEA - Sistema Municipal de Bem-Estar Animal

Sistema completo de gestão de bem-estar animal com chatbot conversacional via WhatsApp, plataforma web administrativa e integração com N8N.

---

## 🎯 **VISÃO GERAL**

O DIBEA é uma plataforma SaaS multi-tenant que permite municípios gerenciarem:

- 🐶 **Animais** - Cadastro, adoção, histórico médico
- 👥 **Tutores** - Gestão de adotantes e responsáveis
- 📅 **Agendamentos** - Consultas, procedimentos, campanhas
- 💉 **Campanhas** - Vacinação, castração, microchipagem
- 📢 **Denúncias** - Maus tratos, abandono
- 💬 **Chat Conversacional** - Atendimento via WhatsApp com IA
- 📊 **Dashboard** - Métricas e relatórios

---

## 🏗️ **ARQUITETURA**

```
┌─────────────────────────────────────────────────────────────┐
│                         USUÁRIOS                             │
│  Cidadãos │ Tutores │ Funcionários │ Veterinários │ Admins  │
└────────┬────────────────────────────────────────────┬────────┘
         │                                             │
         ▼                                             ▼
┌─────────────────┐                          ┌─────────────────┐
│   WhatsApp      │                          │   Next.js App   │
│   (Twilio)      │                          │   (Frontend)    │
└────────┬────────┘                          └────────┬────────┘
         │                                             │
         ▼                                             │
┌─────────────────┐                                   │
│      N8N        │                                   │
│  (Workflow)     │                                   │
│                 │                                   │
│  ┌───────────┐  │                                   │
│  │ AGENT1    │  │ Intent Detection                  │
│  │ (LLM)     │  │                                   │
│  └───────────┘  │                                   │
│                 │                                   │
│  ┌───────────┐  │                                   │
│  │ AGENT2    │  │ Response Generation               │
│  │ (LLM)     │  │                                   │
│  └───────────┘  │                                   │
└────────┬────────┘                                   │
         │                                             │
         └─────────────────┬───────────────────────────┘
                           │
                           ▼
                  ┌─────────────────┐
                  │ Supabase        │
                  │                 │
                  │ ┌─────────────┐ │
                  │ │ PostgreSQL  │ │
                  │ │ (Database)  │ │
                  │ └─────────────┘ │
                  │                 │
                  │ ┌─────────────┐ │
                  │ │Edge Functions│ │
                  │ │  (Deno)     │ │
                  │ └─────────────┘ │
                  │                 │
                  │ ┌─────────────┐ │
                  │ │   Storage   │ │
                  │ │   (S3)      │ │
                  │ └─────────────┘ │
                  │                 │
                  │ ┌─────────────┐ │
                  │ │    Auth     │ │
                  │ │   (JWT)     │ │
                  │ └─────────────┘ │
                  └─────────────────┘
```

---

## 🚀 **TECNOLOGIAS**

### **Backend:**
- **Supabase** - BaaS (PostgreSQL, Auth, Storage, Edge Functions)
- **PostgreSQL** - Database com RLS (Row Level Security)
- **Deno** - Runtime para Edge Functions
- **N8N** - Workflow automation

### **Frontend:**
- **Next.js 14** - React framework (App Router)
- **TypeScript** - Type safety
- **Tailwind CSS** - Styling
- **Shadcn/ui** - Component library

### **IA & Automação:**
- **OpenAI GPT-4** - LLM para chatbot
- **N8N** - Orquestração de workflows
- **Twilio** - WhatsApp Business API

### **Infraestrutura:**
- **Vercel** - Deploy do Next.js
- **Supabase Cloud** - Backend
- **Docker** - N8N self-hosted

---

## 📁 **ESTRUTURA DO PROJETO**

```
dibea/
├── supabase/
│   ├── migrations/           # SQL migrations
│   │   ├── 001_initial_schema.sql
│   │   ├── 002_medical_and_campaigns.sql
│   │   ├── 003_notifications_and_whatsapp.sql
│   │   ├── 004_triggers_and_functions.sql
│   │   ├── 005_rls_policies.sql
│   │   └── 006_seed_data.sql
│   │
│   └── functions/            # Edge Functions (Deno)
│       ├── _shared/
│       │   ├── auth.ts
│       │   ├── errors.ts
│       │   └── validators.ts
│       ├── search-animals/
│       │   └── index.ts
│       └── create-adoption/
│           └── index.ts
│
├── n8n/
│   ├── n8n-file.json        # Workflow principal
│   └── N8N_INTEGRATION_GUIDE.md
│
├── app/                      # Next.js App Router
│   ├── (auth)/
│   │   ├── login/
│   │   └── signup/
│   ├── (dashboard)/
│   │   ├── animals/
│   │   ├── adoptions/
│   │   ├── appointments/
│   │   ├── campaigns/
│   │   └── chat/
│   └── api/
│
├── components/               # React components
│   ├── ui/                  # Shadcn components
│   └── ...
│
├── lib/                     # Utilities
│   ├── supabase/
│   └── utils.ts
│
├── docs/                    # Documentação
│   ├── ERD_DIBEA.md
│   ├── DIBEA_CHAT_PERMISSIONS_MAPPING.md
│   ├── DIBEA_ADVANCED_FEATURES_EXPANSION.md
│   └── DIBEA_COMPLETE_FEATURE_SUMMARY.md
│
├── .env.example             # Template de variáveis
├── SETUP_GUIDE.md           # Guia de instalação
└── README.md                # Este arquivo
```

---

## ⚡ **QUICK START**

### **1. Clone o repositório**

```bash
git clone https://github.com/seu-usuario/dibea.git
cd dibea
```

### **2. Configure variáveis de ambiente**

```bash
cp .env.example .env.local
# Edite .env.local com suas credenciais
```

### **3. Setup Supabase**

```bash
# Instalar CLI
npm install -g supabase

# Login e link
supabase login
supabase link --project-ref xptonqqagxcpzlgndilj

# Executar migrations
supabase db push

# Deploy Edge Functions
supabase functions deploy
```

### **4. Setup N8N**

```bash
# Docker
docker run -it --rm \
  --name n8n \
  -p 5678:5678 \
  -v ~/.n8n:/home/node/.n8n \
  n8nio/n8n

# Importar workflow: n8n/n8n-file.json
```

### **5. Setup Next.js**

```bash
npm install
npm run dev
```

Acesse: http://localhost:3000

---

## 📚 **DOCUMENTAÇÃO**

### **Guias:**
- [📖 Setup Completo](SETUP_GUIDE.md)
- [🔗 Integração N8N](n8n/N8N_INTEGRATION_GUIDE.md)
- [🗄️ Schema do Banco](docs/ERD_DIBEA.md)
- [🔐 Permissões](docs/DIBEA_CHAT_PERMISSIONS_MAPPING.md)
- [✨ Funcionalidades](docs/DIBEA_COMPLETE_FEATURE_SUMMARY.md)

### **Edge Functions:**
- `search-animals` - Busca animais disponíveis
- `create-adoption` - Solicita adoção
- `create-appointment` - Agenda procedimento
- `get-animal-details` - Detalhes do animal
- `get-my-adoptions` - Lista adoções do tutor
- ... [50 funções no total]

---

## 🎭 **TIPOS DE USUÁRIOS**

| Tipo | Acesso | Permissões |
|------|--------|------------|
| **Cidadão** | WhatsApp (não autenticado) | Buscar animais, ver campanhas |
| **Tutor** | WhatsApp + Web | Adotar, agendar, ver seus animais |
| **Funcionário** | Web | Gestão operacional do município |
| **Veterinário** | Web | Atendimentos, receitas, laudos |
| **Admin** | Web | Gestão completa do município |
| **Super Admin** | Web | Gestão da plataforma (todos municípios) |

---

## 💬 **EXEMPLOS DE USO (WhatsApp)**

```
👤 Usuário: "Quero adotar um cachorro grande"

🤖 DIBEA: "🐶 Encontrei 2 cachorros grandes disponíveis!

*Rex*
• Raça: Labrador
• Idade: 3 anos
• Porte: Grande
• Temperamento: Dócil e brincalhão

*Thor*
• Raça: Pastor Alemão
• Idade: 4 anos
• Porte: Grande
• Temperamento: Protetor e leal

Quer saber mais sobre algum deles? 😊"

👤 Usuário: "Me fale mais sobre o Rex"

🤖 DIBEA: "🐶 *Rex - Labrador*

📋 Informações:
• Idade: 3 anos
• Peso: 30.5 kg
• Cor: Amarelo
• Castrado: Sim ✅
• Vacinado: Sim ✅

🏠 Temperamento:
Rex é super dócil e adora brincar! Ele se dá bem com crianças e outros animais. Precisa de espaço para correr.

📸 Fotos: [link]

Quer adotar o Rex? É só me dizer! 🐾"

👤 Usuário: "Sim, quero adotar!"

🤖 DIBEA: "Que ótimo! 🎉

Para continuar, preciso de algumas informações:
• Nome completo:
• CPF:
• Telefone:
• Endereço:
• Tipo de moradia: (Casa/Apartamento)

Pode me enviar?"
```

---

## 🧪 **TESTES**

```bash
# Testar Edge Function
curl -X POST \
  https://xptonqqagxcpzlgndilj.supabase.co/functions/v1/search-animals \
  -H "Authorization: Bearer SERVICE_ROLE_KEY" \
  -H "Content-Type: application/json" \
  -d '{"especie": "CANINO", "status": "DISPONIVEL"}'

# Testar Frontend
npm run test

# Testar E2E
npm run test:e2e
```

---

## 🚀 **DEPLOY**

### **Frontend (Vercel):**
```bash
vercel --prod
```

### **Edge Functions:**
```bash
supabase functions deploy --no-verify-jwt
```

### **N8N (Docker):**
```bash
docker-compose up -d
```

---

## 📊 **ROADMAP**

### **Fase 1: MVP** ✅
- [x] Schema do banco
- [x] Edge Functions básicas
- [x] Integração N8N
- [x] Chat WhatsApp

### **Fase 2: Frontend** 🚧
- [ ] Dashboard administrativo
- [ ] Gestão de animais
- [ ] Gestão de adoções
- [ ] Gestão de agendamentos

### **Fase 3: Avançado** 📅
- [ ] Receitas médicas
- [ ] Laudos de exames
- [ ] Campanhas em lote
- [ ] Notificações multi-canal

### **Fase 4: Expansão** 🔮
- [ ] App mobile
- [ ] Integração com clínicas
- [ ] Marketplace de produtos
- [ ] Gamificação

---

## 🤝 **CONTRIBUINDO**

1. Fork o projeto
2. Crie uma branch: `git checkout -b feature/nova-funcionalidade`
3. Commit: `git commit -m 'Add nova funcionalidade'`
4. Push: `git push origin feature/nova-funcionalidade`
5. Abra um Pull Request

---

## 📄 **LICENÇA**

MIT License - veja [LICENSE](LICENSE)

---

## 👥 **EQUIPE**

- **Pedro Drago Reichow** - Desenvolvedor Principal

---

## 📞 **CONTATO**

- Email: pedroreichow3@gmail.com
- GitHub: [@pdrago97](https://github.com/pdrago97)

---

## 🙏 **AGRADECIMENTOS**

- Supabase Team
- N8N Community
- OpenAI
- Todos os contribuidores

---

**Feito com ❤️ para o bem-estar animal** 🐾

