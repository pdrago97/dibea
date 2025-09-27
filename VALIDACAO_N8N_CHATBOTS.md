# 🤖 **VALIDAÇÃO DAS INTEGRAÇÕES N8N COM CHATBOTS - DIBEA**

## 📋 **SITUAÇÃO ATUAL IDENTIFICADA**

### ✅ **Workflows Ativos Encontrados**
1. **chat-w-ontology** - RAG AI Agent com interface de chat
2. **DIBEA Agent Router - Main** - Roteador de agentes especializados

### 🔍 **Workflows DIBEA Inativos (Precisam Ativação)**
- DIBEA Animal Agent
- DIBEA Procedure Agent  
- DIBEA Document Agent
- DIBEA Tutor Agent
- DIBEA General Agent

## 🎯 **PLANO DE VALIDAÇÃO COMPLETO**

### **FASE 1: VALIDAÇÃO DO WORKFLOW RAG (chat-w-ontology)**

#### **1.1 Teste do Webhook Principal**
```bash
# Testar endpoint do chatbot RAG
curl -X POST https://n8n-moveup-u53084.vm.elestio.app/webhook/9ba11544-5c4e-4f91-818a-08a4ecb596c5 \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer YOUR_TOKEN" \
  -d '{"message": "Olá, como você pode me ajudar?"}'
```

#### **1.2 Validação de Componentes**
- ✅ **OpenAI Integration**: Verificar credenciais
- ✅ **Supabase Vector Store**: Testar conexão
- ✅ **PostgreSQL Memory**: Validar persistência
- ✅ **Document Processing**: Testar upload/processamento

#### **1.3 Testes Funcionais**
- [ ] Chat básico funcionando
- [ ] Memória de conversação
- [ ] Busca em documentos (RAG)
- [ ] Processamento de PDFs/Excel
- [ ] Respostas contextualizadas

### **FASE 2: VALIDAÇÃO DO ROTEADOR DIBEA**

#### **2.1 Corrigir Workflow Principal**
```bash
# Testar roteador corrigido
curl -X POST https://n8n-moveup-u53084.vm.elestio.app/webhook/dibea-agent \
  -H "Content-Type: application/json" \
  -d '{"userInput": "Quero cadastrar um novo cão"}'
```

#### **2.2 Validação de Roteamento**
- [ ] ANIMAL_AGENT: "Cadastrar novo animal"
- [ ] PROCEDURE_AGENT: "Vacinar o Rex"
- [ ] DOCUMENT_AGENT: "Upload de laudo"
- [ ] TUTOR_AGENT: "Cadastrar adotante"
- [ ] GENERAL_AGENT: "Relatório mensal"

### **FASE 3: ATIVAÇÃO DOS AGENTES ESPECIALIZADOS**

#### **3.1 Ativar Workflows Inativos**
- [ ] DIBEA Animal Agent
- [ ] DIBEA Procedure Agent
- [ ] DIBEA Document Agent
- [ ] DIBEA Tutor Agent
- [ ] DIBEA General Agent

#### **3.2 Configurar Integrações**
- [ ] Conectar com API do DIBEA (localhost:3000)
- [ ] Configurar autenticação
- [ ] Testar operações CRUD
- [ ] Validar respostas

### **FASE 4: INTEGRAÇÃO COM FRONTEND**

#### **4.1 Criar Interface de Chat**
```typescript
// Componente de chat para o dashboard
interface ChatMessage {
  id: string;
  message: string;
  response: string;
  timestamp: string;
  agent: string;
}
```

#### **4.2 Endpoints de Integração**
- [ ] `/api/chat/send` - Enviar mensagem
- [ ] `/api/chat/history` - Histórico
- [ ] `/api/agents/status` - Status dos agentes

## 🧪 **SCRIPTS DE TESTE AUTOMATIZADOS**

### **Teste 1: RAG Chatbot**
```bash
#!/bin/bash
echo "🤖 Testando RAG Chatbot..."

# Teste básico
response=$(curl -s -X POST \
  https://n8n-moveup-u53084.vm.elestio.app/webhook/9ba11544-5c4e-4f91-818a-08a4ecb596c5 \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer YOUR_TOKEN" \
  -d '{"message": "Olá, como você funciona?"}')

echo "Resposta: $response"

# Teste com contexto
response2=$(curl -s -X POST \
  https://n8n-moveup-u53084.vm.elestio.app/webhook/9ba11544-5c4e-4f91-818a-08a4ecb596c5 \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer YOUR_TOKEN" \
  -d '{"message": "Quais documentos você tem acesso?"}')

echo "Resposta com contexto: $response2"
```

### **Teste 2: Roteador DIBEA**
```bash
#!/bin/bash
echo "🎯 Testando Roteador DIBEA..."

# Array de testes
declare -a tests=(
  "Quero cadastrar um novo cão chamado Rex"
  "Preciso vacinar meu gato"
  "Fazer upload de um exame veterinário"
  "João quer adotar um animal"
  "Quantos animais foram adotados este mês?"
)

for test in "${tests[@]}"; do
  echo "Testando: $test"
  response=$(curl -s -X POST \
    https://n8n-moveup-u53084.vm.elestio.app/webhook/dibea-agent \
    -H "Content-Type: application/json" \
    -d "{\"userInput\": \"$test\"}")
  
  echo "Resposta: $response"
  echo "---"
done
```

### **Teste 3: Validação de Agentes**
```bash
#!/bin/bash
echo "🔍 Validando Agentes Especializados..."

# Verificar status dos workflows
workflows=("jdwUc5uPPZsYHEq1" "uYoJZjbZwkzm94kc" "CZOdyQ9IKmqsRqvC" "3mAEudQboDwuRfJv" "tZAOPGQcsCVjPdmp")

for workflow in "${workflows[@]}"; do
  echo "Verificando workflow: $workflow"
  # Aqui você adicionaria a lógica de verificação
done
```

## 📊 **MÉTRICAS DE VALIDAÇÃO**

### **Critérios de Sucesso**
- [ ] **Disponibilidade**: 99%+ uptime
- [ ] **Latência**: < 3s resposta
- [ ] **Precisão**: 90%+ roteamento correto
- [ ] **Memória**: Contexto mantido por sessão
- [ ] **Integração**: APIs funcionando

### **KPIs a Monitorar**
- **Tempo de Resposta**: Média < 2s
- **Taxa de Erro**: < 5%
- **Satisfação**: Respostas relevantes
- **Uso**: Número de interações/dia
- **Conversões**: Ações completadas

## 🔧 **FERRAMENTAS DE MONITORAMENTO**

### **Dashboard de Monitoramento**
```typescript
interface AgentMetrics {
  agentName: string;
  totalRequests: number;
  successRate: number;
  avgResponseTime: number;
  lastActive: string;
  errors: string[];
}
```

### **Alertas Automáticos**
- [ ] Workflow offline
- [ ] Erro de API
- [ ] Latência alta
- [ ] Falha de autenticação

## 🚀 **PRÓXIMOS PASSOS IMEDIATOS**

### **1. Executar Testes (Hoje)**
- [ ] Testar RAG chatbot
- [ ] Corrigir roteador DIBEA
- [ ] Validar credenciais

### **2. Ativar Agentes (Esta Semana)**
- [ ] Ativar workflows inativos
- [ ] Configurar integrações
- [ ] Testar funcionalidades

### **3. Integrar Frontend (Próxima Semana)**
- [ ] Criar interface de chat
- [ ] Implementar no dashboard
- [ ] Testes de usuário

### **4. Monitoramento (Contínuo)**
- [ ] Configurar alertas
- [ ] Dashboard de métricas
- [ ] Logs detalhados

## 📝 **CHECKLIST DE VALIDAÇÃO**

### **✅ Pré-requisitos**
- [ ] n8n funcionando
- [ ] Credenciais configuradas
- [ ] Webhooks acessíveis
- [ ] APIs do DIBEA ativas

### **🧪 Testes Funcionais**
- [ ] Chat básico
- [ ] Roteamento de agentes
- [ ] Processamento de documentos
- [ ] Memória de conversação
- [ ] Integração com DIBEA

### **🔍 Testes de Performance**
- [ ] Tempo de resposta
- [ ] Carga de usuários
- [ ] Estabilidade
- [ ] Recuperação de falhas

### **🎯 Testes de Integração**
- [ ] Frontend ↔ n8n
- [ ] n8n ↔ DIBEA API
- [ ] n8n ↔ OpenAI
- [ ] n8n ↔ Supabase

**🎯 OBJETIVO: Ter todos os chatbots validados e funcionando perfeitamente!**
