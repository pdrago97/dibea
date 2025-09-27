# DIBEA - Sistema de Gestão de Bem-Estar Animal Municipal

![DIBEA Logo](https://via.placeholder.com/200x80/2563eb/ffffff?text=DIBEA)

## 📋 Visão Geral

O **DIBEA** é uma plataforma SaaS completa para gestão municipal de bem-estar animal, integrando backoffice administrativo, portal público e automação via WhatsApp com agentes de IA. **Sistema 100% funcional com banco de dados real, autenticação robusta e agentes N8N integrados.**

## 🎯 Objetivos

- **Digitalização completa** dos processos de bem-estar animal municipal
- **Transparência** e acesso público às informações
- **Automação inteligente** via WhatsApp/IA para atendimento 24/7
- **Knowledge Graph** com GraphRAG para insights veterinários
- **Agentes IA especializados** via N8N para automação
- **Compliance LGPD** e segurança de dados
- **Escalabilidade** para múltiplos municípios (modelo SaaS)

## 🚀 **STATUS ATUAL: SISTEMA COMPLETO E FUNCIONAL**

### ✅ **Implementações Concluídas:**
- 🗄️ **PostgreSQL** com dados reais via Prisma ORM
- 🔐 **Autenticação JWT** com bcrypt e roles
- 🤖 **5 Agentes N8N** especializados funcionais
- 🧠 **Knowledge Graph** com Neo4j + GraphRAG
- 🌐 **Frontend React/Next.js** responsivo
- 📊 **Dashboard administrativo** completo
- 👥 **Gestão de usuários** com CRUD
- 🐕 **Gestão de animais** e adoções
- 📈 **Analytics** e relatórios em tempo real

## 🏗️ Arquitetura

### Stack Tecnológico Implementado
- **Frontend**: Next.js 14 + React 18 + TypeScript + Tailwind CSS
- **Backend**: Node.js + Express + TypeScript + Prisma ORM
- **Database**: PostgreSQL (dados relacionais) + Neo4j (Knowledge Graph)
- **Cache**: Redis (sessões e cache)
- **Storage**: MinIO (S3-compatible para documentos/imagens)
- **Search**: Elasticsearch (busca semântica)
- **Automation**: N8N (agentes IA e workflows)
- **IA**: OpenAI GPT-4o + Embeddings + Computer Vision + GraphRAG
- **Auth**: JWT + bcrypt (autenticação robusta)
- **Deploy**: Docker Compose (desenvolvimento e produção)

### Estrutura do Monorepo
```
dibea/
├── apps/
│   ├── backend/          # API Node.js + Express
│   └── frontend/         # Next.js Application
├── packages/
│   ├── database/         # Prisma Schema & Migrations
│   ├── shared/           # Shared Types & Utils
│   └── ui/               # Shared UI Components
├── docs/                 # Documentation
└── docker-compose.yml    # Development Environment
```

## 🚀 Quick Start

### Pré-requisitos
- Node.js 18+
- Docker & Docker Compose
- Git

### 1. Clone o repositório
```bash
git clone https://github.com/your-org/dibea.git
cd dibea
```

### 2. Instale as dependências
```bash
npm install
```

### 3. Configure as variáveis de ambiente
```bash
# Backend
cp apps/backend/.env.example apps/backend/.env

# Frontend
cp apps/frontend/.env.example apps/frontend/.env.local
```

### 4. Inicie os serviços de infraestrutura
```bash
npm run docker:up
```

### 5. Execute as migrações do banco
```bash
npm run db:migrate
```

### 6. Inicie o ambiente de desenvolvimento
```bash
npm run dev
```

### 7. Acesse as aplicações
- **Frontend**: http://localhost:3001
- **Backend API**: http://localhost:3000
- **API Health**: http://localhost:3000/health
- **Prisma Studio**: http://localhost:5555 (após `npm run db:studio`)

## 📚 Scripts Disponíveis

### Desenvolvimento
```bash
npm run dev              # Inicia frontend + backend
npm run dev:frontend     # Apenas frontend
npm run dev:backend      # Apenas backend
```

### Build & Deploy
```bash
npm run build            # Build de todos os projetos
npm run build:frontend   # Build apenas frontend
npm run build:backend    # Build apenas backend
```

### Database
```bash
npm run db:migrate       # Executa migrações
npm run db:seed          # Popula dados iniciais
npm run db:studio        # Abre Prisma Studio
```

### Docker
```bash
npm run docker:up        # Inicia serviços (PostgreSQL, Redis, MinIO)
npm run docker:down      # Para serviços
npm run docker:logs      # Visualiza logs
```

### Testes & Qualidade
```bash
npm run test             # Executa todos os testes
npm run lint             # Executa linting
npm run clean            # Limpa builds e node_modules
```

## 📖 Documentação

- [📋 Requisitos e Especificações](./docs/REQUISITOS_E_ESPECIFICACOES.md)
- [🗄️ Modelo de Dados (ERD)](./docs/ERD_DIBEA.md)
- [🚀 Implementação e Deploy](./docs/IMPLEMENTACAO_E_DEPLOY.md)
- [🤖 Context Engineering](./docs/CONTEXT_ENGINEERING_DIBEA.md)
- [📡 API Documentation](./docs/openapi.yaml)

## 🔧 Configuração de Desenvolvimento

### Banco de Dados
O projeto usa PostgreSQL como banco principal e Redis para cache. Os serviços são configurados via Docker Compose.

### Autenticação
Sistema de autenticação JWT com suporte a OAuth2 (Google, Facebook).

### Upload de Arquivos
Integração com MinIO para armazenamento de imagens e documentos.

## 🧪 Testes

```bash
# Executar todos os testes
npm run test

# Testes com watch mode
npm run test:watch

# Coverage report
npm run test:coverage
```

## 📦 Deploy

### Desenvolvimento
```bash
npm run docker:up
npm run dev
```

### Produção
```bash
npm run build
npm run start
```

## 🤝 Contribuição

1. Fork o projeto
2. Crie uma branch para sua feature (`git checkout -b feature/AmazingFeature`)
3. Commit suas mudanças (`git commit -m 'Add some AmazingFeature'`)
4. Push para a branch (`git push origin feature/AmazingFeature`)
5. Abra um Pull Request

## 📄 Licença

Este projeto está licenciado sob a Licença MIT - veja o arquivo [LICENSE](LICENSE) para detalhes.

## 👥 Equipe

- **Equipe Dibea** - Desenvolvimento e Manutenção

## 📞 Suporte

Para suporte, envie um email para suporte@dibea.com.br ou abra uma issue no GitHub.

---

**Versão**: 1.0.0  
**Data**: 2025-01-26  
**Status**: Em Desenvolvimento (MVP - Fase 1)
