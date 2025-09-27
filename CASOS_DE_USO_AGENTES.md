# 🎯 CASOS DE USO ESPECÍFICOS - AGENTES DIBEA

## 👥 **TIPOS DE USUÁRIOS E PERMISSÕES**

### **🏛️ ADMIN**
**Acesso:** Total a todos os municípios
**Agentes Permitidos:** Todos
**Casos de Uso:**
- ✅ Cadastrar animais em qualquer município
- ✅ Registrar procedimentos veterinários
- ✅ Processar documentos de qualquer tipo
- ✅ Gerenciar tutores de todos os municípios
- ✅ Gerar relatórios globais e comparativos
- ✅ Consultas avançadas multi-município

### **👨‍⚕️ VETERINARIO**
**Acesso:** Limitado ao seu município
**Agentes Permitidos:** Animal, Procedure, Document, General (limitado)
**Casos de Uso:**
- ✅ Cadastrar novos animais resgatados
- ✅ Registrar procedimentos médicos (vacinas, cirurgias, consultas)
- ✅ Processar laudos médicos e receitas
- ✅ Atualizar status de saúde dos animais
- ✅ Gerar relatórios médicos do município
- ❌ Não pode gerenciar tutores (apenas consultar)
- ❌ Não pode acessar dados de outros municípios

### **👨‍💼 FUNCIONARIO**
**Acesso:** Limitado ao seu município
**Agentes Permitidos:** Animal, Document, Tutor, General (básico)
**Casos de Uso:**
- ✅ Cadastrar animais para adoção
- ✅ Processar documentos administrativos
- ✅ Gerenciar tutores e processos de adoção
- ✅ Consultas básicas e relatórios administrativos
- ❌ Não pode registrar procedimentos médicos
- ❌ Não pode processar laudos médicos

### **👤 CIDADAO**
**Acesso:** Muito limitado, apenas dados públicos
**Agentes Permitidos:** Tutor (auto-cadastro), General (consultas públicas)
**Casos de Uso:**
- ✅ Cadastrar-se como tutor para adoção
- ✅ Consultar animais disponíveis para adoção
- ✅ Fazer denúncias e reclamações
- ✅ Agendar consultas para seus animais
- ❌ Não pode cadastrar animais no sistema
- ❌ Não pode processar documentos oficiais
- ❌ Não pode acessar dados de outros tutores

## 🛡️ **GUARDRAILS DE SEGURANÇA**

### **1. Validação de Usuário**
```typescript
interface UserContext {
  id: string;
  role: 'ADMIN' | 'VETERINARIO' | 'FUNCIONARIO' | 'CIDADAO';
  municipalityId: string;
  municipalityName: string;
}
```

### **2. Matriz de Permissões**
| Agente | ADMIN | VETERINARIO | FUNCIONARIO | CIDADAO |
|--------|-------|-------------|-------------|---------|
| Animal Agent | ✅ Total | ✅ Médico | ✅ Básico | ❌ |
| Procedure Agent | ✅ Total | ✅ Total | ❌ | ❌ |
| Document Agent | ✅ Total | ✅ Médico | ✅ Admin | ❌ |
| Tutor Agent | ✅ Total | ✅ Consulta | ✅ Total | ✅ Auto |
| General Agent | ✅ Total | ✅ Médico | ✅ Básico | ✅ Público |

### **3. Validações por Contexto**
- **Município:** Usuários só acessam dados do seu município (exceto ADMIN)
- **Propriedade:** Cidadãos só acessam seus próprios dados
- **Tipo de Documento:** Veterinários só processam documentos médicos
- **Nível de Acesso:** Cada role tem queries e operações específicas

## 🔍 **CASOS DE TESTE PRIORITÁRIOS**

### **Caso 1: Validação Real de CPF**
**Usuário:** FUNCIONARIO
**Fluxo:** "João Silva quer adotar um gato"
**Validações:**
1. ✅ CPF válido via API Receita Federal
2. ✅ Não existe duplicata no município
3. ✅ CEP válido via ViaCEP
4. ✅ Análise de perfil para adoção

### **Caso 2: Registro Médico**
**Usuário:** VETERINARIO  
**Fluxo:** "Vacinei a Luna contra raiva"
**Validações:**
1. ✅ Animal existe no município
2. ✅ Usuário é veterinário
3. ✅ Procedimento médico válido
4. ✅ Atualização do histórico médico

### **Caso 3: Consulta Pública**
**Usuário:** CIDADAO
**Fluxo:** "Quais cães estão disponíveis para adoção?"
**Validações:**
1. ✅ Apenas animais com status DISPONIVEL
2. ✅ Apenas do município público
3. ✅ Dados não sensíveis
4. ❌ Sem acesso a histórico médico

### **Caso 4: Relatório Administrativo**
**Usuário:** ADMIN
**Fluxo:** "Relatório de adoções por município"
**Validações:**
1. ✅ Acesso a todos os municípios
2. ✅ Dados agregados e estatísticas
3. ✅ Comparativos entre regiões
4. ✅ Exportação de relatórios

## 🚨 **CENÁRIOS DE BLOQUEIO**

### **Tentativas Não Autorizadas:**
- CIDADAO tentando cadastrar animal → **BLOQUEADO**
- FUNCIONARIO tentando registrar cirurgia → **BLOQUEADO**
- VETERINARIO tentando acessar outro município → **BLOQUEADO**
- Usuário inativo tentando qualquer operação → **BLOQUEADO**

### **Validações de Integridade:**
- CPF inválido → **BLOQUEADO**
- Animal inexistente → **BLOQUEADO**
- Município inativo → **BLOQUEADO**
- Token expirado → **BLOQUEADO**

## 🎯 **PRÓXIMOS PASSOS**

1. **Implementar Guardrails** no sistema de agentes
2. **Validação Real de CPF** via API Receita Federal
3. **Testes de Cada Caso de Uso** com usuários reais
4. **Logs de Auditoria** para todas as operações
5. **Rate Limiting** para prevenir abuso

## 📊 **MÉTRICAS DE SUCESSO**

- **100% das operações** validadas por tipo de usuário
- **0 acessos não autorizados** a dados sensíveis
- **Validação real** de CPF e CEP funcionando
- **Logs completos** de todas as interações
- **Performance** mantida mesmo com validações
