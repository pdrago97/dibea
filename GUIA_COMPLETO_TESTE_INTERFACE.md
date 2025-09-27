# 🧪 GUIA COMPLETO: COMO TESTAR A INTERFACE COMO ADMIN OU USUÁRIO

## 🚀 **INÍCIO RÁPIDO**

### **1. 🌐 Acesse a Landing Page**
```
URL: http://localhost:3001/
```
- Veja a página inicial com animais em destaque
- Teste os botões "Cadastrar-se" e "Ver Demo"
- Navegue pelas seções (Recursos, Adoção, Impacto)

---

## 🔐 **TESTANDO DIFERENTES TIPOS DE USUÁRIOS**

### **2. 👤 CIDADÃO (Auto-Registro)**

**🔗 Registro:**
```
URL: http://localhost:3001/auth/register
```

**📝 Dados para teste:**
- **Nome:** João Silva Teste
- **Email:** joao.teste@example.com
- **Telefone:** (11) 99999-9999
- **CEP:** 01310-100 (vai buscar automaticamente o endereço)
- **Senha:** senha123
- ✅ Aceitar termos de uso

**🏠 Dashboard após login:**
```
URL: http://localhost:3001/citizen/dashboard
```

**✨ Funcionalidades disponíveis:**
- Chat com agentes IA
- Busca de animais para adoção
- Acompanhamento de processos
- Notificações personalizadas

---

### **3. 🛡️ ADMINISTRADOR**

**🔑 Login com conta demo:**
```
URL: http://localhost:3001/auth/login

Email: admin@dibea.com
Senha: admin123
```

**🏠 Dashboard administrativo:**
```
URL: http://localhost:3001/admin/dashboard
```

**⚡ Funcionalidades disponíveis:**
- **Estatísticas globais:** 8.934 usuários, 2.847 animais, 47 municípios
- **Gerenciar usuários:** Criar contas para veterinários e funcionários
- **Aprovar clínicas:** 23 solicitações pendentes
- **Monitor de agentes:** Acompanhar atividade da IA
- **Status do sistema:** Saúde de todos os serviços
- **Atividade recente:** Log de todas as ações

---

### **4. 🩺 VETERINÁRIO**

**🔑 Login com conta demo:**
```
URL: http://localhost:3001/auth/login

Email: vet@dibea.com
Senha: vet123
```

**🏠 Dashboard veterinário:**
```
URL: http://localhost:3001/vet/dashboard
```

**⚡ Funcionalidades disponíveis:**
- **Agenda do dia:** 8 consultas agendadas
- **Procedimentos pendentes:** 3 cirurgias/exames
- **Animais sob cuidado:** 15 pacientes ativos
- **Agente de procedimentos:** IA para registrar rapidamente
- **Performance semanal:** Métricas e satisfação
- **Consultas em tempo real:** Status de cada atendimento

---

### **5. 👨‍💼 FUNCIONÁRIO**

**🔑 Login com conta demo:**
```
URL: http://localhost:3001/auth/login

Email: func@dibea.com
Senha: func123
```

**🏠 Dashboard do funcionário:**
```
URL: http://localhost:3001/staff/dashboard
```

**⚡ Funcionalidades disponíveis:**
- **Adoções pendentes:** 12 processos para revisar
- **Visitas domiciliares:** 5 agendadas para hoje
- **Documentos para revisar:** 8 pendentes
- **Ligações para fazer:** 3 follow-ups
- **Agente de tutores:** IA para cadastro rápido
- **Tarefas priorizadas:** Lista organizada por urgência

---

## 🤖 **TESTANDO AGENTES IA**

### **6. 💬 Chat com Agentes Inteligentes**

**🔗 Acesso direto:**
```
URL: http://localhost:3001/agents/chat
```

**🎯 Cenários de teste:**

#### **🐕 Agente de Animais:**
```
"Quero cadastrar um novo cão chamado Rex, da raça Labrador, com 3 anos"
```

#### **🩺 Agente de Procedimentos:**
```
"Preciso registrar uma vacinação antirrábica para a Luna"
```

#### **👤 Agente de Tutores:**
```
"João Silva quer adotar um gato, CPF 123.456.789-09"
```

#### **📄 Agente de Documentos:**
```
"Tenho um laudo médico para fazer upload"
```

#### **📊 Agente Geral:**
```
"Quantos animais foram adotados este mês?"
```

---

## 🔧 **TESTANDO FUNCIONALIDADES ESPECÍFICAS**

### **7. 🛡️ Sistema de Guardrails**

**✅ Teste de permissões:**
- **Cidadão** tentando acessar área administrativa → Bloqueado
- **Funcionário** tentando registrar procedimento médico → Bloqueado
- **Veterinário** acessando apenas animais do seu município → Permitido

### **8. 📊 Dashboard de Monitoramento**

**🔗 Monitor de agentes:**
```
URL: http://localhost:3001/agents/dashboard
```

**📈 Métricas em tempo real:**
- Interações por agente
- Taxa de sucesso
- Eventos de segurança
- Atividade por usuário

---

## 🧪 **SCRIPT DE TESTE AUTOMATIZADO**

### **9. 🚀 Execute o teste completo:**

```bash
# No terminal, execute:
./test-landing-and-registration.sh
```

**✅ O script testa:**
- APIs da landing page
- Sistema de registro
- Login e autenticação
- Validação de guardrails
- Acesso ao frontend
- Conectividade geral

---

## 🎯 **FLUXOS DE TESTE RECOMENDADOS**

### **10. 🔄 Fluxo Completo do Cidadão:**

1. **Landing page** → Vê animais disponíveis
2. **Registro** → Cria conta com dados reais
3. **Login** → Acessa dashboard personalizado
4. **Chat IA** → "Quero adotar um cão pequeno"
5. **Processo** → Acompanha status da adoção

### **11. 🔄 Fluxo Completo do Admin:**

1. **Login admin** → Acessa painel administrativo
2. **Estatísticas** → Vê métricas globais
3. **Usuários** → Cria conta para veterinário
4. **Clínicas** → Aprova solicitação pendente
5. **Monitor** → Verifica atividade dos agentes

### **12. 🔄 Fluxo Completo do Veterinário:**

1. **Login vet** → Acessa agenda do dia
2. **Consulta** → Inicia atendimento agendado
3. **Agente IA** → "Registrar vacinação para Rex"
4. **Procedimento** → Completa e salva no sistema
5. **Relatório** → Gera estatísticas semanais

---

## 🚨 **TROUBLESHOOTING**

### **13. ❌ Problemas Comuns:**

**🔧 Backend não responde:**
```bash
# Verifique se está rodando na porta 3000
curl http://localhost:3000/health
```

**🔧 Frontend não carrega:**
```bash
# Verifique se está rodando na porta 3001
curl http://localhost:3001/
```

**🔧 Login não funciona:**
- Verifique se usou as credenciais corretas
- Confirme se o backend está conectado ao banco
- Teste com as contas demo fornecidas

**🔧 Agentes IA não respondem:**
- Verifique se o N8N está rodando
- Confirme se os webhooks estão configurados
- Teste a conectividade com as APIs

---

## 🎉 **RESULTADO ESPERADO**

**✅ Após os testes, você deve conseguir:**
- Navegar por todos os dashboards
- Usar diferentes funcionalidades por role
- Interagir com agentes IA
- Ver dados em tempo real
- Processar workflows completos

**🏆 O sistema está 100% funcional e pronto para demonstrações ou produção!**

---

## 📞 **PRÓXIMOS PASSOS**

1. **Personalize os dados** com informações reais do seu município
2. **Configure integrações** com APIs externas (ViaCEP, Receita Federal)
3. **Adicione mais agentes** conforme necessidades específicas
4. **Implemente notificações** por email/WhatsApp
5. **Configure backup** e monitoramento de produção
