# 💬 DIBEA - Exemplos de Use Cases para Testes

## 🎯 **OVERVIEW**

Este documento contém exemplos práticos de conversas para testar todos os use cases do chatbot DIBEA.

---

## 🐶 **USE CASE 1: BUSCAR ANIMAIS PARA ADOÇÃO**

### **Cenário 1.1: Busca Genérica**

```
👤 Usuário: Oi, quero adotar um pet

🤖 DIBEA: Olá! Que legal que você quer adotar! 🐾

Temos cachorros e gatos disponíveis. Qual você prefere?
```

```
👤 Usuário: Cachorro

🤖 DIBEA: 🐶 Encontrei 2 cachorros disponíveis para adoção!

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

### **Cenário 1.2: Busca com Filtro de Porte**

```
👤 Usuário: Quero um cachorro grande

🤖 DIBEA: 🐶 Encontrei 1 cachorro grande disponível!

*Rex*
• Raça: Labrador
• Porte: Grande
• Peso: 30.5 kg
• Idade: 3 anos
• Temperamento: Dócil, brincalhão e muito carinhoso

Rex precisa de espaço para correr e brincar. Você tem quintal?
```

---

### **Cenário 1.3: Busca de Gatos**

```
👤 Usuário: Tem gatos disponíveis?

🤖 DIBEA: 🐱 Sim! Encontrei 1 gatinho disponível:

*Mia*
• Raça: Siamês
• Porte: Pequeno
• Idade: 1 ano
• Peso: 4.5 kg
• Temperamento: Independente mas carinhosa

Mia se adapta bem a apartamentos! Quer conhecê-la? 😺
```

---

### **Cenário 1.4: Busca por Nome**

```
👤 Usuário: Me fale sobre a Luna

🤖 DIBEA: 🐶 *Luna - Vira-lata Caramelo*

📋 Informações:
• Idade: 2 anos
• Peso: 15.2 kg
• Porte: Médio
• Cor: Caramelo
• Castrada: Sim ✅
• Vacinada: Sim ✅

🏠 Temperamento:
Luna é super calma e amorosa! Ela se adapta bem a apartamentos e adora carinho. É perfeita para famílias com crianças.

📸 Fotos: [link]

Quer adotar a Luna? 🐾
```

---

### **Cenário 1.5: Busca Sem Resultados**

```
👤 Usuário: Quero um cachorro gigante

🤖 DIBEA: 😅 No momento não temos cachorros de porte gigante disponíveis.

Mas temos:
🐶 Rex - Labrador (porte grande)
🐶 Luna - Vira-lata (porte médio)

Quer conhecer algum deles? 🐾
```

---

## 💚 **USE CASE 2: SOLICITAR ADOÇÃO**

### **Cenário 2.1: Adoção - Novo Tutor (Fluxo Completo)**

```
👤 Usuário: Quero adotar o Rex

🤖 DIBEA: Que ótimo! 🎉 O Rex é um cachorro incrível!

Para continuar com a adoção, preciso de algumas informações:

📝 Dados necessários:
• Nome completo
• CPF
• Telefone
• Endereço completo (rua, número, bairro, cidade, estado)
• CEP
• Tipo de moradia (Casa/Apartamento/Sítio)
• Tem outros pets? (Sim/Não)
• Tem quintal? (Sim/Não)
• Já teve cachorro antes? (Sim/Não)

Pode me enviar essas informações?
```

```
👤 Usuário: Meu nome é Maria Oliveira
CPF: 987.654.321-00
Telefone: (11) 98888-7777
Endereço: Av. Paulista, 1000, Bela Vista, São Paulo-SP
CEP: 01310-100
Moro em apartamento
Não tenho outros pets
Não tenho quintal
Já tive cachorro antes

🤖 DIBEA: ✅ Perfeito! Sua solicitação de adoção do *Rex* foi registrada com sucesso!

📋 Resumo:
• Animal: Rex (Labrador)
• Tutor: Maria Oliveira
• CPF: ***.654.321-**
• Status: Em análise
• Protocolo: #AD-2025-001
• Data: 10/01/2025

📅 Próximos passos:
1. Nossa equipe vai avaliar seu pedido
2. Entraremos em contato em até 48 horas
3. Se aprovado, agendaremos uma visita
4. Você conhecerá o Rex pessoalmente
5. Se tudo der certo, ele vai pra casa! 🏠

Fique de olho no WhatsApp! 📱

Enquanto aguarda, quer saber mais sobre cuidados com cachorros de grande porte?
```

---

### **Cenário 2.2: Adoção - Tutor Existente**

```
👤 Usuário: Quero adotar a Luna

🤖 DIBEA: Oi Maria! Vi que você já tem cadastro conosco. 😊

Quer adotar a Luna também? Que legal! 🐶

Por que você quer adotar a Luna? (Preciso de pelo menos 20 caracteres)
```

```
👤 Usuário: Quero fazer companhia pro Rex. Acho que ele ficaria mais feliz com um amigo.

🤖 DIBEA: ✅ Solicitação registrada!

📋 Resumo:
• Animal: Luna (Vira-lata)
• Tutor: Maria Oliveira (já cadastrada)
• Motivo: Companhia para o Rex
• Status: Em análise
• Protocolo: #AD-2025-002

Como você já é tutora do Rex, o processo será mais rápido! 🚀

Vamos avaliar se Luna e Rex se dariam bem juntos. Entraremos em contato em breve! 📱
```

---

## 📅 **USE CASE 3: AGENDAR PROCEDIMENTOS**

### **Cenário 3.1: Agendar Castração**

```
👤 Usuário: Quero castrar meu cachorro

🤖 DIBEA: Ótimo! A castração é muito importante! 🏥

Temos horários disponíveis para castração:

📅 Próximos dias:
• Segunda (13/01) - 09:00, 10:00, 14:00
• Terça (14/01) - 09:00, 11:00, 15:00
• Quarta (15/01) - 08:00, 10:00, 14:00

Qual dia e horário prefere?
```

```
👤 Usuário: Segunda às 10h

🤖 DIBEA: ✅ Agendamento confirmado!

📋 Detalhes:
• Serviço: Castração
• Data: 13/01/2025 às 10:00
• Local: DIBEA - Centro de Zoonoses
• Endereço: Rua Santa Eulália, 86 - Santana
• Animal: Rex
• Tutor: Maria Oliveira

⚠️ Importante:
• Jejum de 8 horas antes
• Levar documento com foto
• Chegar 15 minutos antes

Vamos enviar um lembrete 1 dia antes! 📱

Precisa de mais alguma coisa?
```

---

### **Cenário 3.2: Agendar Consulta**

```
👤 Usuário: Preciso marcar consulta veterinária

🤖 DIBEA: Claro! Vou te ajudar a agendar. 🏥

Para qual animal é a consulta?
• Rex
• Luna
• Outro animal
```

```
👤 Usuário: Para o Rex

🤖 DIBEA: Consulta para o Rex. Entendi! 🐶

Qual o motivo da consulta?
• Consulta de rotina
• Vacinação
• Problema de saúde
• Outro
```

```
👤 Usuário: Ele está com tosse

🤖 DIBEA: Entendo. Vou agendar uma consulta urgente. 🏥

Horários disponíveis hoje:
• 14:00
• 16:00
• 17:00

Amanhã:
• 09:00
• 10:00
• 11:00

Qual prefere?
```

---

## 💉 **USE CASE 4: CAMPANHAS**

### **Cenário 4.1: Consultar Campanhas**

```
👤 Usuário: Tem campanha de vacinação?

🤖 DIBEA: Sim! Temos campanhas ativas! 💉

📋 *Campanha de Vacinação Antirrábica*
• Período: 15/01 a 31/01/2025
• Local: Centro de Zoonoses
• Horário: Segunda a sexta, 8h às 12h
• Vagas: 150 disponíveis
• Gratuito: Sim ✅

📋 *Campanha de Castração*
• Período: 13/01 a 31/01/2025
• Local: Centro de Zoonoses
• Horário: Segunda a sexta, 8h às 12h
• Vagas: 80 disponíveis
• Gratuito: Sim ✅

Quer se inscrever em alguma? 🐾
```

---

### **Cenário 4.2: Inscrever em Campanha**

```
👤 Usuário: Quero inscrever o Rex na campanha de vacinação

🤖 DIBEA: Ótimo! Vou inscrever o Rex na campanha de vacinação! 💉

Horários disponíveis:
• Segunda (20/01) - 08:00, 09:00, 10:00
• Terça (21/01) - 08:00, 09:00, 11:00
• Quarta (22/01) - 08:00, 10:00, 11:00

Qual dia e horário prefere?
```

```
👤 Usuário: Segunda às 9h

🤖 DIBEA: ✅ Inscrição confirmada!

📋 Detalhes:
• Campanha: Vacinação Antirrábica
• Animal: Rex
• Data: 20/01/2025 às 09:00
• Local: Centro de Zoonoses
• Endereço: Rua Santa Eulália, 86
• Vaga: #045

⚠️ Importante:
• Levar carteira de vacinação
• Chegar 10 minutos antes
• Animal deve estar saudável

Vamos enviar lembrete! 📱
```

---

## 📢 **USE CASE 5: DENÚNCIAS**

### **Cenário 5.1: Registrar Denúncia**

```
👤 Usuário: Quero fazer uma denúncia

🤖 DIBEA: Entendo. Vou te ajudar a registrar a denúncia. 📢

Qual o tipo de denúncia?
• Maus tratos
• Abandono
• Animal em situação de risco
• Acúmulo de animais
• Outro
```

```
👤 Usuário: Maus tratos

🤖 DIBEA: Sinto muito por isso. Vamos registrar. 😔

Por favor, me informe:
1. Localização (endereço ou referência)
2. Descrição do que está acontecendo
3. Tipo de animal
4. Há quanto tempo isso ocorre
```

```
👤 Usuário: Rua das Flores, 456 - Jardim Paulista
Tem um cachorro amarrado sem água e comida
É um vira-lata médio
Isso acontece há uns 3 dias

🤖 DIBEA: ✅ Denúncia registrada!

📋 Protocolo: #DEN-2025-001
• Tipo: Maus tratos
• Local: Rua das Flores, 456 - Jardim Paulista
• Animal: Cachorro vira-lata médio
• Status: Aberta
• Prioridade: Alta

Nossa equipe vai investigar em até 24 horas. 🚨

Você pode acompanhar pelo protocolo: DEN-2025-001

Obrigado por ajudar! 🐾
```

---

## 📊 **USE CASE 6: ESTATÍSTICAS E INFORMAÇÕES**

### **Cenário 6.1: Estatísticas Gerais**

```
👤 Usuário: Quantos animais vocês têm?

🤖 DIBEA: 📊 Estatísticas do DIBEA (São Paulo):

🐾 Total de animais: 4
✅ Disponíveis para adoção: 3
❤️ Já adotados: 1

Por espécie:
🐶 Cachorros: 3 (2 disponíveis)
🐱 Gatos: 1 (1 disponível)

Por porte:
• Pequeno: 1
• Médio: 1
• Grande: 2

📈 Este mês:
• Adoções realizadas: 1
• Animais resgatados: 2
• Procedimentos: 5

Quer conhecer os animais disponíveis? 🐾
```

---

### **Cenário 6.2: Informações sobre o DIBEA**

```
👤 Usuário: O que é o DIBEA?

🤖 DIBEA: Olá! 👋

O DIBEA é o *Sistema Municipal de Bem-Estar Animal* de São Paulo! 🐾

🎯 O que fazemos:
• Resgate de animais em situação de risco
• Adoções responsáveis
• Castração gratuita
• Vacinação
• Microchipagem
• Atendimento veterinário
• Educação sobre guarda responsável

📍 Onde estamos:
Centro de Zoonoses de São Paulo
Rua Santa Eulália, 86 - Santana
📞 (11) 3000-0000

🕐 Horário:
Segunda a sexta: 8h às 17h
Sábado: 8h às 12h

Como posso te ajudar hoje? 😊
```

---

## 🔍 **USE CASE 7: CONSULTAR MINHAS ADOÇÕES**

### **Cenário 7.1: Ver Minhas Adoções**

```
👤 Usuário: Quais animais eu adotei?

🤖 DIBEA: Oi Maria! Aqui estão suas adoções: 🐾

✅ *Adoções Concluídas:*

🐶 *Rex* - Labrador
• Data da adoção: 20/01/2024
• Status: Ativo
• RGA: RGA-SAO-2024-001234
• Próxima vacina: 15/02/2025

📋 *Adoções em Andamento:*

🐶 *Luna* - Vira-lata
• Data da solicitação: 10/01/2025
• Status: Em análise
• Protocolo: #AD-2025-002
• Previsão: Resposta em 48h

Precisa de algo relacionado a eles? 😊
```

---

## ❓ **USE CASE 8: DÚVIDAS E AJUDA**

### **Cenário 8.1: Como Funciona a Adoção**

```
👤 Usuário: Como funciona o processo de adoção?

🤖 DIBEA: Ótima pergunta! Vou te explicar: 📝

🔄 *Processo de Adoção:*

1️⃣ *Escolha o Animal*
   • Veja os animais disponíveis
   • Escolha o que mais combina com você

2️⃣ *Cadastro*
   • Preencha seus dados
   • CPF, endereço, telefone

3️⃣ *Análise*
   • Nossa equipe avalia em até 48h
   • Verificamos se o perfil é adequado

4️⃣ *Visita*
   • Agende uma visita ao DIBEA
   • Conheça o animal pessoalmente

5️⃣ *Entrevista*
   • Conversa com nossa equipe
   • Orientações sobre cuidados

6️⃣ *Aprovação*
   • Se tudo ok, você leva pra casa! 🏠
   • Assinatura do termo de adoção

7️⃣ *Acompanhamento*
   • Fazemos visitas pós-adoção
   • Estamos sempre disponíveis

Quer começar? 🐾
```

---

## 🎉 **RESUMO DOS USE CASES**

| # | Use Case | Status | Prioridade |
|---|----------|--------|------------|
| 1 | Buscar animais | ✅ Implementado | Alta |
| 2 | Solicitar adoção | ✅ Implementado | Alta |
| 3 | Agendar procedimentos | 🔄 Planejado | Média |
| 4 | Campanhas | 🔄 Planejado | Média |
| 5 | Denúncias | 🔄 Planejado | Alta |
| 6 | Estatísticas | 🔄 Planejado | Baixa |
| 7 | Minhas adoções | 🔄 Planejado | Média |
| 8 | Ajuda e dúvidas | 🔄 Planejado | Baixa |

---

**Use estes exemplos para testar o chatbot!** 🚀

