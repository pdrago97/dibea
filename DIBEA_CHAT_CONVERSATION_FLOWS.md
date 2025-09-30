# 💬 DIBEA - Fluxos de Conversação do Chat

## 🎯 **OBJETIVO**

Este documento detalha os fluxos de conversação esperados para cada tipo de usuário, incluindo exemplos práticos de diálogos e como o sistema deve responder.

---

## 👤 **FLUXO 1: CIDADÃO (Não Autenticado)**

### **Cenário 1.1: Busca de Animal para Adoção**

```
👤 Usuário: "Oi, quero adotar um cachorro"

🤖 DIBEA: "Olá! Que legal que você quer adotar! 🐕 
Para te ajudar melhor, me conta:
- Você prefere um cachorro de qual porte? (pequeno, médio ou grande)
- Tem preferência de sexo? (macho ou fêmea)
- Qual cidade você mora?"

👤 Usuário: "Quero um cachorro pequeno, fêmea, moro em São Paulo"

🤖 DIBEA: "Perfeito! Encontrei 3 cachorrinhas pequenas disponíveis em São Paulo! 🐕

1. **Luna** - SRD, 2 anos, muito dócil
2. **Mel** - Poodle, 3 anos, adora crianças  
3. **Bella** - Shih Tzu, 1 ano, super carinhosa

Quer saber mais sobre alguma delas? Ou prefere agendar uma visita?"

👤 Usuário: "Me fala mais sobre a Luna"

🤖 DIBEA: "A Luna é uma cachorrinha incrível! 🐾

📋 **Detalhes:**
- Espécie: Canino
- Raça: SRD (Sem Raça Definida)
- Sexo: Fêmea
- Porte: Pequeno (8kg)
- Idade: 2 anos
- Temperamento: Dócil, sociável, adora brincar

🏥 **Saúde:**
- Vacinada ✅
- Castrada ✅
- Microchipada ✅

📍 **Localização:** Centro de Zoonoses - São Paulo/SP

Quer agendar uma visita para conhecê-la? 😊"

👤 Usuário: "Sim! Como faço?"

🤖 DIBEA: "Ótimo! Para agendar a visita, preciso de alguns dados:

📝 **Cadastro Rápido:**
- Nome completo:
- CPF:
- Telefone:
- Email:

Pode me enviar essas informações?"

👤 Usuário: "João Silva, 123.456.789-00, (11) 98765-4321, joao@email.com"

🤖 DIBEA: "Perfeito, João! Cadastro realizado com sucesso! ✅

📅 **Horários disponíveis para visita:**
- Amanhã (30/09) às 14h
- Amanhã (30/09) às 16h
- Quinta (01/10) às 10h
- Quinta (01/10) às 14h

Qual horário prefere?"

👤 Usuário: "Amanhã às 14h"

🤖 DIBEA: "Agendamento confirmado! 🎉

📅 **Detalhes da Visita:**
- Animal: Luna
- Data: 30/09/2025 às 14h
- Local: Centro de Zoonoses - Rua das Flores, 123
- Protocolo: #VIS-2025-001234

📱 Você receberá um lembrete 1 dia antes.

Alguma dúvida? Estou aqui para ajudar! 😊"
```

---

### **Cenário 1.2: Denúncia de Maus-Tratos**

```
👤 Usuário: "Quero fazer uma denúncia"

🤖 DIBEA: "Entendo. Vou te ajudar com isso. 

Qual o tipo de denúncia?
1. Maus-tratos
2. Abandono
3. Animal perdido
4. Outro"

👤 Usuário: "Maus-tratos"

🤖 DIBEA: "Sinto muito por isso. Vamos registrar sua denúncia.

Por favor, me informe:
- Onde está acontecendo? (endereço ou referência)
- Descreva o que você viu
- Tem fotos? (pode enviar)"

👤 Usuário: "Rua das Palmeiras, 456 - São Paulo. Vi um cachorro amarrado sem água e comida há dias"

🤖 DIBEA: "Obrigado pelas informações. Denúncia registrada! 

📋 **Protocolo:** #DEN-2025-005678
📍 **Local:** Rua das Palmeiras, 456 - São Paulo/SP
📅 **Data:** 29/09/2025

A equipe da Vigilância Sanitária será acionada e fará uma vistoria em até 24h.

Você pode acompanhar o andamento pelo protocolo.

Quer deixar seus dados para contato? (opcional)"

👤 Usuário: "Sim, João Silva, (11) 98765-4321"

🤖 DIBEA: "Dados registrados! Você receberá atualizações sobre a denúncia.

Obrigado por cuidar dos animais! 🐾"
```

---

## 🏠 **FLUXO 2: TUTOR (Autenticado)**

### **Cenário 2.1: Consultar Minhas Adoções**

```
👤 Tutor: "Quais são minhas adoções?"

🤖 DIBEA: "Olá, João! Você tem 2 adoções registradas:

1. **Luna** - Cachorra SRD
   - Status: ✅ Concluída
   - Data: 15/08/2025
   - RGA: #RGA-SP-2025-001234

2. **Rex** - Cachorro Labrador
   - Status: ⏳ Em análise
   - Data solicitação: 28/09/2025
   - Previsão resposta: 05/10/2025

Quer ver mais detalhes de alguma?"

👤 Tutor: "Como está o processo do Rex?"

🤖 DIBEA: "O processo de adoção do Rex está em análise! 📋

**Status atual:** Em análise pela equipe
**Próximos passos:**
1. ✅ Solicitação recebida (28/09)
2. ⏳ Análise de perfil (em andamento)
3. ⏳ Visita domiciliar (aguardando)
4. ⏳ Aprovação final

**Previsão:** Resposta em até 7 dias úteis

Você receberá uma notificação assim que houver novidades! 😊"
```

---

### **Cenário 2.2: Agendar Consulta Veterinária**

```
👤 Tutor: "Preciso agendar consulta para a Luna"

🤖 DIBEA: "Claro! Vou te ajudar a agendar a consulta da Luna. 🏥

Qual o motivo da consulta?
1. Consulta de rotina
2. Vacinação
3. Problema de saúde
4. Retorno"

👤 Tutor: "Consulta de rotina"

🤖 DIBEA: "Perfeito! 

📅 **Horários disponíveis:**

**Esta semana:**
- Qui (01/10) às 10h - Dra. Maria
- Qui (01/10) às 14h - Dr. Carlos
- Sex (02/10) às 09h - Dra. Maria

**Próxima semana:**
- Seg (05/10) às 10h - Dr. Carlos
- Ter (06/10) às 14h - Dra. Maria

Qual horário prefere?"

👤 Tutor: "Quinta às 10h"

🤖 DIBEA: "Agendamento confirmado! ✅

📅 **Detalhes:**
- Animal: Luna
- Tipo: Consulta de rotina
- Data: 01/10/2025 às 10h
- Veterinário: Dra. Maria Silva (CRMV-SP 12345)
- Local: Centro Veterinário Municipal
- Protocolo: #CON-2025-007890

📱 Lembrete será enviado 1 dia antes.

Leve a carteira de vacinação da Luna! 🐾"
```

---

### **Cenário 2.3: Solicitar RGA**

```
👤 Tutor: "Como faço para tirar o RGA da Luna?"

🤖 DIBEA: "O RGA (Registro Geral Animal) é o documento oficial da Luna! 📄

**Requisitos:**
✅ Animal vacinado
✅ Animal microchipado
✅ Tutor cadastrado

**Documentos necessários:**
- RG e CPF do tutor
- Comprovante de residência
- Carteira de vacinação do animal

**Taxa:** R$ 50,00 (R$ 25,00 para animais castrados)

A Luna já está vacinada e microchipada! ✅

Quer solicitar o RGA agora?"

👤 Tutor: "Sim!"

🤖 DIBEA: "Solicitação enviada! 🎉

📋 **Protocolo:** #RGA-2025-001234

**Próximos passos:**
1. ✅ Solicitação recebida
2. ⏳ Análise de documentos (1-2 dias)
3. ⏳ Emissão do RGA
4. ⏳ Envio por email

**Taxa:** R$ 25,00 (desconto por castração)
**Pagamento:** Boleto será enviado por email

Você receberá o RGA em PDF com QR Code em até 3 dias úteis! 📧"
```

---

## 👔 **FLUXO 3: FUNCIONÁRIO (Staff)**

### **Cenário 3.1: Cadastrar Novo Animal**

```
👤 Funcionário: "Cadastrar novo animal"

🤖 DIBEA: "Vou te ajudar com o cadastro! 📝

Por favor, informe os dados do animal:

**Obrigatórios:**
- Nome:
- Espécie: (CANINO ou FELINO)
- Sexo: (MACHO ou FEMEA)
- Porte: (PEQUENO, MEDIO ou GRANDE)

**Opcionais:**
- Raça:
- Idade:
- Peso:
- Cor:
- Temperamento:
- Descrição:"

👤 Funcionário: "Nome: Thor, Espécie: CANINO, Sexo: MACHO, Porte: GRANDE, Raça: Pastor Alemão, Idade: 4 anos, Peso: 35kg, Cor: Preto e marrom, Temperamento: Protetor mas dócil, Descrição: Cachorro muito inteligente, ótimo para casas com quintal"

🤖 DIBEA: "Cadastro realizado com sucesso! ✅

🐕 **Thor** foi cadastrado no sistema!

📋 **Dados:**
- ID: ae79feeb-be25-4598-8e81-b6a95ba28790
- RGA: Pendente
- Microchip: Pendente
- Status: DISPONIVEL
- QR Code: [link]

**Próximos passos:**
1. Aplicar microchip
2. Vacinar
3. Castrar (se necessário)
4. Tirar fotos
5. Disponibilizar para adoção

Quer registrar a aplicação do microchip agora?"
```

---

### **Cenário 3.2: Aprovar Adoção**

```
👤 Funcionário: "Listar adoções pendentes"

🤖 DIBEA: "Você tem 5 adoções pendentes de análise:

1. **Rex** - Labrador
   - Solicitante: João Silva
   - Data: 28/09/2025
   - Protocolo: #ADO-2025-001234

2. **Mel** - Poodle
   - Solicitante: Maria Santos
   - Data: 27/09/2025
   - Protocolo: #ADO-2025-001233

3. **Thor** - Pastor Alemão
   - Solicitante: Carlos Oliveira
   - Data: 26/09/2025
   - Protocolo: #ADO-2025-001232

Qual deseja analisar?"

👤 Funcionário: "Ver detalhes da adoção #ADO-2025-001234"

🤖 DIBEA: "📋 **Detalhes da Adoção #ADO-2025-001234**

**Animal:**
- Nome: Rex
- Espécie: Canino
- Raça: Labrador
- Porte: Grande
- Idade: 3 anos

**Solicitante:**
- Nome: João Silva
- CPF: 123.456.789-00
- Telefone: (11) 98765-4321
- Email: joao@email.com
- Endereço: Rua das Flores, 123 - São Paulo/SP
- Tipo de moradia: Casa com quintal
- Tem outros pets: Não

**Histórico:**
- Primeira adoção: Sim
- Visita realizada: Não
- Entrevista: Pendente

**Ações disponíveis:**
1. Aprovar
2. Solicitar visita domiciliar
3. Solicitar mais informações
4. Rejeitar

O que deseja fazer?"

👤 Funcionário: "Aprovar"

🤖 DIBEA: "Adoção aprovada! 🎉

✅ **Status atualizado para: APROVADO**

**Ações automáticas realizadas:**
- Status do Rex alterado para: ADOTADO
- Notificação enviada para João Silva
- Visita pós-adoção agendada para 15 dias
- Termo de adoção gerado

**Próximos passos:**
1. João deve assinar o termo de adoção
2. Pagar taxa de adoção (R$ 50,00)
3. Retirar o Rex no Centro de Zoonoses
4. Visita pós-adoção em 15 dias

Tudo certo! 👍"
```

---

## 🩺 **FLUXO 4: VETERINÁRIO**

### **Cenário 4.1: Registrar Consulta**

```
👤 Veterinário: "Registrar consulta do animal ae79feeb-be25-4598-8e81-b6a95ba28790"

🤖 DIBEA: "Vou registrar a consulta do **Thor**! 🏥

Por favor, informe:
- Tipo de atendimento: (CONSULTA, VACINACAO, CIRURGIA, EXAME)
- Descrição do atendimento:
- Medicamentos prescritos: (opcional)
- Próximo retorno: (opcional)"

👤 Veterinário: "Tipo: CONSULTA, Descrição: Consulta de rotina. Animal saudável, sem alterações. Peso: 35kg. Vacinação em dia., Medicamentos: Vermífugo (dose única), Próximo retorno: 6 meses"

🤖 DIBEA: "Consulta registrada com sucesso! ✅

📋 **Histórico Médico Atualizado:**
- Animal: Thor
- Data: 29/09/2025
- Veterinário: Dr. Carlos Silva (CRMV-SP 12345)
- Tipo: Consulta de rotina
- Protocolo: #CON-2025-007891

**Prescrição:**
- Vermífugo (dose única)

**Próximo retorno:** 29/03/2026

O tutor será notificado sobre a consulta e receberá a prescrição por email! 📧"
```

---

## 🎯 **PADRÕES DE RESPOSTA**

### **1. Confirmações de Ação**
```
✅ [Ação] realizada com sucesso!
📋 Protocolo: #XXX-2025-XXXXXX
📅 Data: DD/MM/YYYY
```

### **2. Erros e Validações**
```
❌ Ops! Não foi possível [ação].
🔍 Motivo: [descrição do erro]
💡 Sugestão: [como resolver]
```

### **3. Solicitação de Dados**
```
📝 Para continuar, preciso de:
- Campo 1:
- Campo 2:
- Campo 3:
```

### **4. Listagens**
```
Encontrei X resultados:

1. **Nome** - Detalhes
   - Info 1
   - Info 2

2. **Nome** - Detalhes
   - Info 1
   - Info 2
```

### **5. Próximos Passos**
```
**Próximos passos:**
1. ✅ Passo concluído
2. ⏳ Passo em andamento
3. ⏳ Passo pendente
```

---

## 🚨 **TRATAMENTO DE ERROS**

### **Erro 1: Permissão Negada**
```
🤖 DIBEA: "Desculpe, você não tem permissão para realizar esta ação. 🔒

Esta operação requer nível de acesso: [ROLE]
Seu nível atual: [USER_ROLE]

Entre em contato com o administrador se precisar de acesso."
```

### **Erro 2: Recurso Não Encontrado**
```
🤖 DIBEA: "Não encontrei o que você procura. 🔍

Verifique se:
- O ID/protocolo está correto
- O recurso ainda existe
- Você tem permissão para visualizá-lo

Quer tentar novamente?"
```

### **Erro 3: Dados Inválidos**
```
🤖 DIBEA: "Ops! Alguns dados estão incorretos. ❌

Problemas encontrados:
- [Campo]: [Descrição do erro]
- [Campo]: [Descrição do erro]

Por favor, corrija e tente novamente."
```

---

**Documento criado em:** 2025-09-29  
**Versão:** 1.0  
**Status:** Aguardando revisão

