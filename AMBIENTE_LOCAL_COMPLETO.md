# 🚀 DIBEA - Ambiente Local Completo

## ✅ **SISTEMA FUNCIONANDO 100%**

O DIBEA está rodando localmente com todos os serviços funcionais!

---

## 🌐 **Serviços Disponíveis**

### 🎨 **Frontend (Next.js)**
- **URL**: http://localhost:3001
- **Status**: ✅ Funcionando
- **Tecnologia**: Next.js 14 + React + TypeScript + Tailwind CSS

### 🔧 **Backend (Node.js)**
- **URL**: http://localhost:3000
- **Health Check**: http://localhost:3000/health
- **Status**: ✅ Funcionando
- **Tecnologia**: Node.js + Express + TypeScript + Prisma

### 🗄️ **Banco de Dados**
- **Tipo**: SQLite (demo.db)
- **Status**: ✅ Funcionando
- **Localização**: `apps/backend/prisma/demo.db`

---

## 🔐 **Contas de Demonstração**

| Tipo | Email | Senha | Acesso |
|------|-------|-------|--------|
| **👑 Admin** | admin@dibea.com | admin123 | Dashboard administrativo |
| **🩺 Veterinário** | vet@dibea.com | vet123 | Dashboard veterinário |
| **👨‍💼 Funcionário** | func@dibea.com | func123 | Dashboard funcionário |
| **👤 Cidadão** | cidadao@dibea.com | cidadao123 | Dashboard cidadão |

---

## 📊 **Dados Atuais do Sistema**

- **Animais Cadastrados**: 3
- **Adoções Realizadas**: 1
- **Municípios Ativos**: 1
- **Usuários Registrados**: 7

---

## 🛠️ **Como Gerenciar o Ambiente**

### ▶️ **Para Iniciar**
```bash
# Método atual (manual)
# Terminal 1 - Backend
cd apps/backend && npx ts-node src/demo-server.ts

# Terminal 2 - Frontend  
cd apps/frontend && npm run dev
```

### 🛑 **Para Parar**
```bash
# Use o script criado
./stop-local.sh

# Ou manualmente
pkill -f "ts-node.*demo-server"
pkill -f "next dev"
lsof -ti:3000 | xargs kill -9
lsof -ti:3001 | xargs kill -9
```

### 🔄 **Para Reiniciar**
```bash
./stop-local.sh
./start-local.sh
```

---

## 📁 **Estrutura do Projeto**

```
dibea/
├── apps/
│   ├── backend/           # API Node.js + Express
│   │   ├── src/
│   │   ├── prisma/        # Banco de dados
│   │   └── logs/          # Logs do sistema
│   └── frontend/          # Interface Next.js
│       └── src/
├── docker-compose.yml     # Docker completo (opcional)
├── docker-simple.yml      # Docker simplificado
├── start-local.sh         # Script de inicialização local
├── stop-local.sh          # Script para parar serviços
└── logs/                  # Logs dos serviços
```

---

## 🔧 **Scripts Disponíveis**

| Script | Descrição |
|--------|-----------|
| `./start-local.sh` | Inicia ambiente local completo |
| `./stop-local.sh` | Para todos os serviços |
| `./docker-start.sh` | Inicia com Docker (completo) |
| `./start-simple.sh` | Inicia com Docker (simplificado) |

---

## 🐳 **Opções Docker (Futuro)**

### **Docker Completo**
```bash
./docker-start.sh
# Inclui: PostgreSQL, Redis, Neo4j, Elasticsearch, MinIO, n8n
```

### **Docker Simplificado**
```bash
./start-simple.sh  
# Inclui: PostgreSQL, Redis, Backend, Frontend
```

---

## 🧪 **Testes de API**

### **Health Check**
```bash
curl http://localhost:3000/health
```

### **Login**
```bash
curl -X POST http://localhost:3000/api/v1/auth/login \
  -H "Content-Type: application/json" \
  -d '{"email":"admin@dibea.com","password":"admin123"}'
```

### **Estatísticas**
```bash
curl http://localhost:3000/api/v1/landing/stats
```

---

## 📝 **Logs**

### **Visualizar Logs em Tempo Real**
```bash
# Backend
tail -f apps/backend/logs/app.log

# Frontend (quando usando script)
tail -f logs/frontend.log

# Backend (quando usando script)
tail -f logs/backend.log
```

---

## 🎯 **Próximos Passos**

1. **✅ Sistema Local Funcionando**
2. **🔄 Configurar Docker (opcional)**
3. **🚀 Deploy em Produção**
4. **📱 Testes Mobile**
5. **🤖 Integração com n8n**

---

## 🆘 **Solução de Problemas**

### **Porta em Uso**
```bash
# Verificar portas
lsof -i :3000 -i :3001

# Liberar portas
lsof -ti:3000 | xargs kill -9
lsof -ti:3001 | xargs kill -9
```

### **Dependências**
```bash
# Reinstalar dependências
cd apps/backend && npm install
cd apps/frontend && npm install
```

### **Banco de Dados**
```bash
# Regenerar Prisma
cd apps/backend
npx prisma generate
npx prisma migrate dev
npx ts-node prisma/seed-demo.ts
```

---

## 🎉 **Status Final**

**✅ DIBEA ESTÁ 100% FUNCIONAL LOCALMENTE!**

- ✅ Frontend rodando em http://localhost:3001
- ✅ Backend rodando em http://localhost:3000  
- ✅ Banco de dados SQLite funcionando
- ✅ Sistema de autenticação ativo
- ✅ Contas demo configuradas
- ✅ APIs funcionando
- ✅ Interface responsiva

**🚀 Acesse http://localhost:3001 e comece a usar!**
