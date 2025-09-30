# 🧪 DIBEA - Plano de Testes do Workflow N8N

## 📋 **OVERVIEW**

Este documento contém um plano completo de testes para validar o workflow N8N integrado com as Edge Functions do Supabase.

---

## 🎯 **OBJETIVOS DOS TESTES**

1. ✅ Validar integração N8N ↔ Edge Functions
2. ✅ Testar classificação de intenções (SMART AGENT1)
3. ✅ Testar formatação de respostas (SMART AGENT2)
4. ✅ Validar todos os use cases de chat conversacional
5. ✅ Identificar e corrigir erros

---

## 🔧 **SETUP INICIAL**

### **1. Verificar Edge Functions no Supabase**

```bash
# Testar search-animals diretamente
curl -X POST \
  https://xptonqqagxcpzlgndilj.supabase.co/functions/v1/search-animals \
  -H "Authorization: Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InhwdG9ucXFhZ3hjcHpsZ25kaWxqIiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImlhdCI6MTc1OTA5NjY2NiwiZXhwIjoyMDc0NjcyNjY2fQ.xs_jNdVjWGvRIDrtiMsvWCtoUInUZHdDld0kz9zjGzo" \
  -H "Content-Type: application/json" \
  -H "X-User-Phone: +5511999999999" \
  -d '{
    "especie": "CANINO",
    "status": "DISPONIVEL"
  }'

# Resposta esperada:
# {
#   "success": true,
#   "data": {
#     "animals": [...],
#     "total": 3
#   }
# }
```

### **2. Verificar Dados no Banco**

```sql
-- Ver animais disponíveis
SELECT id, nome, especie, porte, status 
FROM animais 
WHERE status = 'DISPONIVEL';

-- Deve retornar pelo menos 3 animais (Rex, Luna, Mia)
```

### **3. Ativar Workflow no N8N**

1. Abrir N8N: http://localhost:5678
2. Abrir workflow DIBEA
3. Verificar se está ativo (toggle no canto superior direito)

---

## 🧪 **TESTES UNITÁRIOS (Edge Functions)**

### **Teste 1: Buscar Animais - Todos**

**Payload:**
```json
{
  "status": "DISPONIVEL",
  "limit": 20
}
```

**Resultado Esperado:**
```json
{
  "success": true,
  "data": {
    "animals": [
      {
        "id": "...",
        "nome": "Rex",
        "especie": "CANINO",
        "porte": "GRANDE"
      },
      {
        "id": "...",
        "nome": "Luna",
        "especie": "CANINO",
        "porte": "MEDIO"
      },
      {
        "id": "...",
        "nome": "Mia",
        "especie": "FELINO",
        "porte": "PEQUENO"
      }
    ],
    "total": 3
  }
}
```

---

### **Teste 2: Buscar Animais - Filtro por Espécie**

**Payload:**
```json
{
  "especie": "CANINO",
  "status": "DISPONIVEL"
}
```

**Resultado Esperado:**
- Apenas Rex e Luna (cachorros)
- Total: 2

---

### **Teste 3: Buscar Animais - Filtro por Porte**

**Payload:**
```json
{
  "porte": "GRANDE",
  "status": "DISPONIVEL"
}
```

**Resultado Esperado:**
- Apenas Rex
- Total: 1

---

### **Teste 4: Buscar Animais - Por Nome**

**Payload:**
```json
{
  "nome": "Luna",
  "status": "DISPONIVEL"
}
```

**Resultado Esperado:**
- Apenas Luna
- Total: 1

---

### **Teste 5: Criar Adoção (Novo Tutor)**

**Payload:**
```json
{
  "animal_id": "an111111-1111-1111-1111-111111111111",
  "motivo_interesse": "Sempre quis ter um labrador. Tenho quintal grande e experiência com cães de grande porte.",
  "tutor_data": {
    "cpf": "98765432100",
    "nome": "Maria Oliveira",
    "telefone": "+5511988887777",
    "endereco_completo": "Av. Paulista, 1000",
    "cep": "01310100",
    "cidade": "São Paulo",
    "estado": "SP",
    "tipo_moradia": "APARTAMENTO",
    "tem_experiencia": true,
    "tem_outros_pets": false,
    "tem_quintal": false
  }
}
```

**Resultado Esperado:**
```json
{
  "success": true,
  "data": {
    "adoption_id": "...",
    "animal": {
      "id": "...",
      "nome": "Rex",
      "especie": "CANINO"
    },
    "tutor": {
      "id": "...",
      "nome": "Maria Oliveira",
      "cpf": "98765432100"
    },
    "status": "SOLICITADA",
    "message": "Solicitação de adoção criada com sucesso!"
  }
}
```

---

## 🎭 **TESTES DE INTEGRAÇÃO (N8N Workflow)**

### **Teste 1: Busca Simples de Cachorro**

**Mensagem do Usuário:**
```
Quero adotar um cachorro
```

**Fluxo Esperado:**
1. SMART AGENT1 classifica como QUERY
2. Função: `search-animals`
3. Parâmetros: `{ especie: "CANINO", status: "DISPONIVEL" }`
4. HTTP Request3 chama Edge Function
5. Format-Response formata dados
6. SMART AGENT2 gera resposta natural

**Resposta Esperada (SMART AGENT2):**
```
🐶 Encontrei 2 cachorros disponíveis para adoção!

*Rex*
• Raça: Labrador
• Porte: Grande
• Idade: 3 anos
• Temperamento: Dócil e brincalhão

*Luna*
• Raça: Vira-lata
• Porte: Médio
• Idade: 2 anos
• Temperamento: Calma e amorosa

Quer saber mais sobre algum deles? 😊
```

---

### **Teste 2: Busca com Filtro de Porte**

**Mensagem do Usuário:**
```
Quero um cachorro grande
```

**Parâmetros Esperados:**
```json
{
  "especie": "CANINO",
  "porte": "GRANDE",
  "status": "DISPONIVEL"
}
```

**Resposta Esperada:**
```
🐶 Encontrei 1 cachorro grande disponível!

*Rex*
• Raça: Labrador
• Porte: Grande
• Peso: 30.5 kg
• Temperamento: Dócil e brincalhão

Quer adotar o Rex? É só me dizer! 🐾
```

---

### **Teste 3: Busca de Gatos**

**Mensagem do Usuário:**
```
Tem gatos disponíveis?
```

**Parâmetros Esperados:**
```json
{
  "especie": "FELINO",
  "status": "DISPONIVEL"
}
```

**Resposta Esperada:**
```
🐱 Sim! Encontrei 1 gatinho disponível:

*Mia*
• Raça: Siamês
• Porte: Pequeno
• Idade: 1 ano
• Temperamento: Independente mas carinhosa

Quer conhecer a Mia? 😺
```

---

### **Teste 4: Busca por Nome**

**Mensagem do Usuário:**
```
Me fale sobre a Luna
```

**Parâmetros Esperados:**
```json
{
  "nome": "Luna",
  "status": "DISPONIVEL"
}
```

**Resposta Esperada:**
```
🐶 *Luna - Vira-lata*

📋 Informações:
• Idade: 2 anos
• Peso: 15.2 kg
• Porte: Médio
• Cor: Caramelo
• Castrada: Sim ✅
• Vacinada: Sim ✅

🏠 Temperamento:
Luna é super calma e amorosa! Ela se adapta bem a apartamentos e adora carinho.

Quer adotar a Luna? 🐾
```

---

### **Teste 5: Solicitar Adoção (Fluxo Completo)**

**Mensagem 1:**
```
Quero adotar o Rex
```

**Resposta Esperada:**
```
Que ótimo! 🎉 O Rex é um cachorro incrível!

Para continuar com a adoção, preciso de algumas informações:

📝 Dados necessários:
• Nome completo
• CPF
• Telefone
• Endereço completo
• CEP
• Tipo de moradia (Casa/Apartamento)
• Tem outros pets? (Sim/Não)
• Tem quintal? (Sim/Não)
• Já teve cachorro antes? (Sim/Não)

Pode me enviar essas informações?
```

**Mensagem 2:**
```
Meu nome é Maria Oliveira
CPF: 987.654.321-00
Telefone: (11) 98888-7777
Endereço: Av. Paulista, 1000, São Paulo-SP
CEP: 01310-100
Moro em apartamento
Não tenho outros pets
Não tenho quintal
Já tive cachorro antes
```

**Resposta Esperada:**
```
✅ Perfeito! Sua solicitação de adoção do *Rex* foi registrada!

📋 Resumo:
• Animal: Rex (Labrador)
• Tutor: Maria Oliveira
• Status: Em análise
• Protocolo: #AD-2025-001

Nossa equipe vai avaliar seu pedido e entrar em contato em até 48 horas. 

Fique de olho no WhatsApp! 📱

Enquanto isso, você pode:
• Ver outros animais disponíveis
• Agendar uma visita ao DIBEA
• Tirar dúvidas sobre o processo

Precisa de mais alguma coisa? 😊
```

---

### **Teste 6: Busca Sem Resultados**

**Mensagem do Usuário:**
```
Quero um elefante
```

**Resposta Esperada:**
```
😅 Desculpe, não temos elefantes disponíveis para adoção!

No DIBEA trabalhamos com:
🐶 Cachorros
🐱 Gatos

Quer ver os animais disponíveis? Posso te mostrar! 🐾
```

---

### **Teste 7: Estatísticas**

**Mensagem do Usuário:**
```
Quantos animais vocês têm?
```

**Resposta Esperada:**
```
📊 Estatísticas do DIBEA:

🐾 Total de animais: 4
✅ Disponíveis para adoção: 3
❤️ Já adotados: 1

Por espécie:
🐶 Cachorros: 3
🐱 Gatos: 1

Quer conhecer os animais disponíveis? 😊
```

---

## 🐛 **TROUBLESHOOTING**

### **Erro: "Missing or invalid Authorization header"**

**Causa:** Service Role Key incorreta ou ausente

**Solução:**
1. Verificar header `Authorization` no HTTP Request
2. Confirmar que está usando Service Role Key (não Anon Key)

---

### **Erro: "Animal not found"**

**Causa:** animal_id inválido ou animal não existe

**Solução:**
1. Verificar se animal existe no banco
2. Usar IDs dos animais de seed (Rex, Luna, Mia)

---

### **Erro: SMART AGENT1 retorna camelCase**

**Causa:** Prompt não está enfatizando snake_case

**Solução:**
1. Atualizar prompt com exemplos claros
2. Adicionar validação no Process Agent Response

---

### **Erro: Edge Function retorna 500**

**Causa:** Erro interno na Edge Function

**Solução:**
1. Ver logs no Supabase Dashboard → Edge Functions → Logs
2. Verificar se migrations foram executadas
3. Verificar se RLS não está bloqueando

---

## ✅ **CHECKLIST DE VALIDAÇÃO**

### **Funcionalidades Básicas:**
- [ ] Buscar todos os animais
- [ ] Buscar por espécie (cachorro/gato)
- [ ] Buscar por porte (pequeno/médio/grande)
- [ ] Buscar por nome
- [ ] Ver detalhes de um animal

### **Funcionalidades Avançadas:**
- [ ] Solicitar adoção (novo tutor)
- [ ] Solicitar adoção (tutor existente)
- [ ] Ver estatísticas
- [ ] Lidar com buscas sem resultado

### **Qualidade das Respostas:**
- [ ] AGENT2 usa dados reais (não inventa)
- [ ] Respostas são naturais e amigáveis
- [ ] Usa emojis apropriados
- [ ] Sugere próximos passos

### **Tratamento de Erros:**
- [ ] Erro de validação (dados faltando)
- [ ] Erro de permissão
- [ ] Erro de recurso não encontrado
- [ ] Erro interno do servidor

---

## 📊 **MÉTRICAS DE SUCESSO**

| Métrica | Meta | Status |
|---------|------|--------|
| Taxa de sucesso (queries) | > 95% | ⏳ |
| Taxa de sucesso (actions) | > 90% | ⏳ |
| Tempo de resposta | < 3s | ⏳ |
| Precisão do AGENT1 | > 90% | ⏳ |
| Qualidade do AGENT2 | > 85% | ⏳ |

---

## 🚀 **PRÓXIMOS PASSOS**

Após validar todos os testes:

1. ✅ Implementar Edge Functions restantes (48 funções)
2. ✅ Adicionar mais casos de teste
3. ✅ Implementar testes automatizados
4. ✅ Configurar monitoramento
5. ✅ Deploy em produção

---

**Boa sorte com os testes!** 🎉

