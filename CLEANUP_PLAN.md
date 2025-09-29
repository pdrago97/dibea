# 🧹 DIBEA - Plano de Limpeza da Codebase

## 📋 ARQUITETURA ATUAL (2024)

### ✅ Stack Mantido:
- **Frontend:** Next.js 14 + Supabase Client
- **Backend:** Node.js/Express + Supabase (API mínima)
- **n8n:** Agentes inteligentes + OpenAI
- **Database:** Supabase PostgreSQL
- **Deployment:** Vercel (Frontend) + Railway/Render (Backend opcional)

---

## 🗑️ ARQUIVOS PARA REMOVER

### 1. Documentação Desatualizada (Root):
- [ ] AMBIENTE_LOCAL_COMPLETO.md
- [ ] ARQUITETURA_IA_CORRETA.md
- [ ] CASOS_DE_USO_AGENTES.md
- [ ] CORRECOES_TELA_BRANCA.md
- [ ] DASHBOARD_MELHORADO.md
- [ ] DOCUMENTACAO_ATUALIZADA_2024.md
- [ ] EXEMPLOS_INSIGHTS_CONVERSACIONAIS.md
- [ ] GUIA_COMPLETO_TESTE_INTERFACE.md
- [ ] GUIA_IMPLEMENTACAO_CRUD_COMPLETO.md
- [ ] IMPLEMENTACAO_COMPLETA_END_TO_END.md
- [ ] INDICE_DOCUMENTACAO_COMPLETA.md
- [ ] INSIGHTS_NEGOCIO_2024.md
- [ ] KNOWLEDGE_GRAPH_IMPLEMENTATION.md
- [ ] LANDING_PAGE_E_AUTO_REGISTRO_IMPLEMENTADO.md
- [ ] NEXT_STEPS_AGENTS.md
- [ ] PINECONE_VECTOR_INTEGRATION.md
- [ ] README-PRODUCTION.md (consolidar no README.md)
- [ ] ROADMAP_ATUALIZADO_2024.md
- [ ] SISTEMA_AGENTES_N8N_COMPLETO.md
- [ ] SISTEMA_COMPLETO_COM_BANCO_REAL.md
- [ ] SISTEMA_COMPLETO_IMPLEMENTADO.md
- [ ] STATUS_ATUAL.md
- [ ] STATUS_FINAL_MELHORIAS.md
- [ ] TESTES_CASOS_DE_USO.md
- [ ] VALIDACAO_N8N_CHATBOTS.md

### 2. Docker/Kubernetes (Infraestrutura Complexa):
- [ ] docker-compose.infrastructure.yml
- [ ] docker-compose.local.yml
- [ ] docker-compose.production.yml
- [ ] docker-compose.simple.yml
- [ ] docker-compose.yml
- [ ] docker-simple.yml
- [ ] kubernetes/ (diretório completo)
- [ ] nginx.conf
- [ ] proxy-nginx.conf
- [ ] simple-nginx.conf
- [ ] ssl/ (diretório completo)

### 3. Scripts Desatualizados:
- [ ] build-and-push.sh
- [ ] demo-start.sh
- [ ] deploy-kubernetes.sh
- [ ] docker-start.sh
- [ ] populate-data.sh
- [ ] start-local.sh
- [ ] start-production.sh
- [ ] start-simple-new.sh
- [ ] start-simple.sh
- [ ] stop-local.sh
- [ ] scripts/deploy-dibea-agents.sh

### 4. Arquivos de Teste/Demo Antigos:
- [ ] demo-chat-interface-pinecone.js
- [ ] demo-crud-completo-funcionando.js
- [ ] test-agents.js
- [ ] test-api.html
- [ ] test-cpf-validation.sh
- [ ] test-crud-end-to-end.js
- [ ] test-end-to-end-real-data.js
- [ ] test-final-agents.js
- [ ] test-intelligent-agents.sh
- [ ] test-intelligent-chat.js
- [ ] test-landing-and-registration.sh
- [ ] test-pinecone-dibea-integration.js
- [ ] test-pinecone-integration.js
- [ ] test-register.js
- [ ] test-transparency.js

### 5. Backends/Frontends Alternativos:
- [ ] simple-backend/ (diretório completo)
- [ ] simple-frontend/ (diretório completo)

### 6. Dados SQL Antigos:
- [ ] init-data.sql

### 7. Docs Desatualizados:
- [ ] docs/CONTEXT_ENGINEERING_DIBEA.md
- [ ] docs/ERD_DIBEA.md
- [ ] docs/IMPLEMENTACAO_E_DEPLOY.md
- [ ] docs/REQUISITOS_E_ESPECIFICACOES.md
- [ ] docs/SISTEMA_NAVEGACAO_VISUAL.md
- [ ] docs/whatsapp_flow.json

### 8. Backend - Controllers/Routes Quebrados:
- [ ] apps/backend/src/controllers/documentController.ts
- [ ] apps/backend/src/controllers/agentController.ts
- [ ] apps/backend/src/routes/documents.ts
- [ ] apps/backend/src/routes/agentRoutes.ts

### 9. Backend - Services Não Utilizados:
- [ ] apps/backend/src/services/graphService.ts (Neo4j)
- [ ] apps/backend/src/services/documentAnalysisService.ts
- [ ] apps/backend/src/services/storageService.ts (MinIO)

---

## 📝 ARQUIVOS PARA MANTER E ATUALIZAR

### Root:
- ✅ README.md (atualizar com arquitetura limpa)
- ✅ package.json (limpar scripts desnecessários)
- ✅ .env.dev (manter apenas Supabase + n8n)
- ✅ .env.production (manter apenas Supabase + n8n)

### Frontend (apps/frontend):
- ✅ Manter tudo (Next.js app)
- ✅ Atualizar README.md

### Backend (apps/backend):
- ✅ Manter apenas:
  - Controllers: animals, auth, adoptions, tutors, campaigns, dashboard, notifications, tasks, complaints
  - Routes correspondentes
  - Middleware: authenticate, errorHandler, rateLimiter
  - Services: supabaseService
  - Prisma schema (simplificado)

### n8n:
- ✅ Manter n8n-config/
- ✅ Manter n8n-workflows/
- ✅ Criar README.md explicando workflows

### Packages:
- ✅ Avaliar necessidade de packages/database e packages/shared

---

## 🎯 PRÓXIMOS PASSOS

1. ✅ Remover arquivos listados
2. ✅ Atualizar README.md principal
3. ✅ Criar README.md em apps/frontend
4. ✅ Criar README.md em apps/backend
5. ✅ Criar README.md em n8n-config
6. ✅ Limpar package.json (scripts)
7. ✅ Atualizar .env.example
8. ✅ Criar ARCHITECTURE.md (documentação limpa)
9. ✅ Criar DEPLOYMENT.md (guia de deploy)

---

## 📊 RESULTADO ESPERADO

### Estrutura Final:
```
dibea/
├── README.md                    # Documentação principal
├── ARCHITECTURE.md              # Arquitetura limpa
├── DEPLOYMENT.md                # Guia de deploy
├── package.json                 # Scripts limpos
├── .env.example                 # Template de variáveis
├── apps/
│   ├── frontend/               # Next.js + Supabase
│   │   └── README.md
│   └── backend/                # Express + Supabase (API mínima)
│       └── README.md
├── n8n-config/                 # Configurações n8n
│   └── README.md
└── n8n-workflows/              # Workflows n8n
    └── README.md
```

### Benefícios:
- ✅ Codebase 70% menor
- ✅ Documentação alinhada com realidade
- ✅ Fácil onboarding de novos devs
- ✅ Deploy simplificado
- ✅ Manutenção facilitada

