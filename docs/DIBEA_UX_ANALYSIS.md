# 🎨 DIBEA - Análise de UX/UI e Propostas de Melhoria

**Versão:** 1.0  
**Data:** Janeiro 2025  
**Foco:** Interface do Cidadão (Usuário Final)

---

## 📊 ANÁLISE DA INTERFACE ATUAL

### Screenshot Analisado: Dashboard do Cidadão

#### ✅ Pontos Positivos:
1. **Saudação personalizada**: "Olá, Pedro Cidadão! 👋"
2. **Cards de ação claros**: Chat com IA, Buscar Animais, Meu Perfil
3. **Seção de destaque**: "Animais em Destaque"
4. **Indicadores visuais**: Badges de status (Pendente, Urgente)
5. **Cores agradáveis**: Paleta azul/verde suave

#### ❌ Problemas Críticos:

##### 1. **Sobrecarga Cognitiva**
```
Problema: Muita informação na primeira tela
- 3 cards de ação
- 2 animais em destaque
- 1 processo ativo
- 2 notificações
- Menu lateral com 8+ itens

Impacto: Usuário não sabe por onde começar
Solução: Hierarquia visual clara + Progressive disclosure
```

##### 2. **Falta de Hierarquia Visual**
```
Problema: Todos os elementos têm o mesmo peso visual
- Cards de ação têm mesmo tamanho que animais
- Notificações não se destacam
- CTA principal não é óbvio

Impacto: Usuário perde informações importantes
Solução: Tamanhos diferenciados + Cores de destaque
```

##### 3. **Cards de Animais Pequenos**
```
Problema: Fotos dos animais são muito pequenas
- Difícil ver detalhes do animal
- Informações comprimidas
- Botão "Adotar" não se destaca

Impacto: Baixa taxa de conversão
Solução: Cards maiores com fotos em destaque
```

##### 4. **Navegação Confusa**
```
Problema: Menu lateral com muitos itens
- "Chat com IA" aparece 2x (card + menu)
- "Buscar Animais" e "Ver Animais" são redundantes
- Ícones sem labels em alguns lugares

Impacto: Usuário se perde na navegação
Solução: Máximo 5 itens principais + Submenu contextual
```

##### 5. **Falta de Feedback Visual**
```
Problema: Não há indicação de progresso
- Processo de adoção sem % de conclusão
- Notificações sem prioridade visual
- Sem indicação de "novo" vs "lido"

Impacto: Usuário não sabe o status das ações
Solução: Progress bars + Badges de status + Timestamps
```

---

## 🎯 PROPOSTA DE REDESIGN

### Princípios de Design:

1. **Mobile-First**: 80% dos usuários acessam via celular
2. **Simplicidade**: Máximo 3 ações por tela
3. **Visual**: Fotos grandes e de alta qualidade
4. **Progressivo**: Mostrar informações conforme necessário
5. **Acessível**: Contraste adequado + Textos legíveis

---

## 📱 NOVO DASHBOARD DO CIDADÃO

### Layout Proposto:

```
┌─────────────────────────────────────────┐
│  [Logo DIBEA]    [Notificações: 2] [👤] │
├─────────────────────────────────────────┤
│                                         │
│  Olá, Pedro! 👋                         │
│  Encontre seu novo melhor amigo         │
│                                         │
│  ┌─────────────────────────────────┐   │
│  │  🔍 Buscar Animais              │   │
│  │  [Digite raça, porte, idade...] │   │
│  └─────────────────────────────────┘   │
│                                         │
│  ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━   │
│                                         │
│  🐕 Animais Disponíveis (12)            │
│                                         │
│  ┌───────────────┐  ┌───────────────┐  │
│  │   [FOTO]      │  │   [FOTO]      │  │
│  │   Luna        │  │   Rex         │  │
│  │   Labrador    │  │   Vira-lata   │  │
│  │   2 anos      │  │   3 anos      │  │
│  │   ❤️ Adotar   │  │   ❤️ Adotar   │  │
│  └───────────────┘  └───────────────┘  │
│                                         │
│  [Ver Todos os Animais →]               │
│                                         │
│  ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━   │
│                                         │
│  📋 Meus Processos (1)                  │
│                                         │
│  ┌─────────────────────────────────┐   │
│  │ Rex - Aguardando análise        │   │
│  │ ████████░░░░░░░░░░ 40%          │   │
│  │ Iniciado há 2 dias              │   │
│  │ [Ver Detalhes →]                │   │
│  └─────────────────────────────────┘   │
│                                         │
│  ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━   │
│                                         │
│  💬 Precisa de Ajuda?                   │
│  [Falar com IA →]                       │
│                                         │
└─────────────────────────────────────────┘
```

### Características:

#### 1. **Hero Section Simplificada**
- Saudação + CTA principal (busca)
- Busca em destaque com autocomplete
- Sem distrações

#### 2. **Cards de Animais Grandes**
- Foto ocupa 60% do card
- Informações essenciais (nome, raça, idade)
- Botão "Adotar" em destaque
- Hover mostra mais detalhes

#### 3. **Processos com Progress Bar**
- Indicador visual de progresso
- Status claro (Aguardando, Em análise, Aprovado)
- Timestamp relativo ("há 2 dias")

#### 4. **Chat IA Discreto**
- Não compete com ação principal
- Sempre acessível mas não invasivo
- Pode ser floating button no canto

---

## 🐕 PÁGINA DE BUSCA DE ANIMAIS

### Layout Proposto:

```
┌─────────────────────────────────────────┐
│  [← Voltar]  Buscar Animais             │
├─────────────────────────────────────────┤
│                                         │
│  Filtros:                               │
│  [Espécie ▼] [Porte ▼] [Idade ▼]       │
│                                         │
│  ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━   │
│                                         │
│  12 animais encontrados                 │
│                                         │
│  ┌─────────────────────────────────┐   │
│  │                                 │   │
│  │        [FOTO GRANDE]            │   │
│  │                                 │   │
│  │  Luna                           │   │
│  │  Labrador Mix • Fêmea • 2 anos  │   │
│  │  Porte: Médio • Cor: Amarelo    │   │
│  │                                 │   │
│  │  Carinhosa e brincalhona,       │   │
│  │  adora crianças...              │   │
│  │                                 │   │
│  │  📍 São Paulo                   │   │
│  │  ✅ Vacinada  ✅ Castrada       │   │
│  │                                 │   │
│  │  [❤️ Adotar]  [👁️ Ver Mais]    │   │
│  └─────────────────────────────────┘   │
│                                         │
│  ┌─────────────────────────────────┐   │
│  │        [FOTO GRANDE]            │   │
│  │  Rex...                         │   │
│  └─────────────────────────────────┘   │
│                                         │
└─────────────────────────────────────────┘
```

### Características:

#### 1. **Filtros Simples**
- Máximo 3 filtros visíveis
- Filtros avançados em modal
- Resultados em tempo real

#### 2. **Cards Verticais**
- Foto ocupa topo do card (16:9)
- Informações organizadas hierarquicamente
- Badges visuais (vacinado, castrado)
- Localização visível

#### 3. **CTAs Claros**
- Botão "Adotar" em destaque
- "Ver Mais" secundário
- Ícone de favorito no canto

---

## 📄 PÁGINA DE DETALHES DO ANIMAL

### Layout Proposto:

```
┌─────────────────────────────────────────┐
│  [← Voltar]  [❤️ Favoritar]  [⋮ Menu]  │
├─────────────────────────────────────────┤
│                                         │
│  ┌─────────────────────────────────┐   │
│  │                                 │   │
│  │      [GALERIA DE FOTOS]         │   │
│  │      Swipe horizontal           │   │
│  │                                 │   │
│  └─────────────────────────────────┘   │
│                                         │
│  Luna                                   │
│  Labrador Mix • Fêmea • 2 anos          │
│  📍 São Paulo, SP                       │
│                                         │
│  [❤️ QUERO ADOTAR]                      │
│                                         │
│  ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━   │
│                                         │
│  📋 Sobre a Luna                        │
│                                         │
│  Carinhosa e brincalhona, a Luna        │
│  adora brincar com crianças e outros    │
│  animais. Ela foi resgatada das ruas... │
│                                         │
│  ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━   │
│                                         │
│  📊 Informações                         │
│                                         │
│  Porte:      Médio (15kg)               │
│  Cor:        Amarelo                    │
│  Pelagem:    Curta                      │
│  Castrada:   ✅ Sim                     │
│  Vacinada:   ✅ Sim                     │
│  Vermífugo:  ✅ Sim                     │
│                                         │
│  ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━   │
│                                         │
│  🏥 Histórico Médico                    │
│                                         │
│  [Timeline visual]                      │
│                                         │
│  ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━   │
│                                         │
│  💬 Dúvidas? Fale com a IA              │
│  [Iniciar Conversa →]                   │
│                                         │
└─────────────────────────────────────────┘
```

### Características:

#### 1. **Galeria de Fotos em Destaque**
- Swipe horizontal
- Indicador de posição (1/5)
- Zoom ao tocar

#### 2. **CTA Fixo no Topo**
- Botão "Quero Adotar" sempre visível
- Sticky ao scroll
- Cor de destaque

#### 3. **Informações Organizadas**
- Seções colapsáveis
- Ícones visuais
- Checklist de saúde

#### 4. **Chat IA Contextual**
- Perguntas sugeridas sobre o animal
- Respostas instantâneas
- Não invasivo

---

## 🔄 FLUXO DE ADOÇÃO REDESENHADO

### Wizard em 4 Passos:

```
Passo 1: Confirmação
┌─────────────────────────────────────────┐
│  Você escolheu adotar:                  │
│                                         │
│  ┌─────────────────────────────────┐   │
│  │  [Foto]  Luna                   │   │
│  │          Labrador • 2 anos      │   │
│  └─────────────────────────────────┘   │
│                                         │
│  Antes de continuar, certifique-se:     │
│  ☐ Tenho espaço adequado                │
│  ☐ Posso arcar com custos               │
│  ☐ Tenho tempo para cuidar              │
│                                         │
│  [Continuar →]                          │
└─────────────────────────────────────────┘

Passo 2: Seus Dados
┌─────────────────────────────────────────┐
│  Preencha seus dados:                   │
│                                         │
│  Nome completo: [____________]          │
│  CPF:           [____________]          │
│  Telefone:      [____________]          │
│  Email:         [____________]          │
│                                         │
│  Endereço:      [____________]          │
│  Cidade:        [____________]          │
│  Estado:        [▼]                     │
│                                         │
│  Tipo de moradia:                       │
│  ○ Casa  ○ Apartamento  ○ Sítio         │
│                                         │
│  [← Voltar]  [Continuar →]              │
└─────────────────────────────────────────┘

Passo 3: Documentos
┌─────────────────────────────────────────┐
│  Envie seus documentos:                 │
│                                         │
│  RG ou CNH:                             │
│  ┌─────────────────────────────────┐   │
│  │  📄 Arraste ou clique           │   │
│  │     para fazer upload           │   │
│  └─────────────────────────────────┘   │
│  ✅ documento.pdf (2.3 MB)              │
│                                         │
│  Comprovante de Residência:             │
│  ┌─────────────────────────────────┐   │
│  │  📄 Arraste ou clique           │   │
│  └─────────────────────────────────┘   │
│                                         │
│  [← Voltar]  [Continuar →]              │
└─────────────────────────────────────────┘

Passo 4: Confirmação
┌─────────────────────────────────────────┐
│  Revise suas informações:               │
│                                         │
│  Animal:     Luna                       │
│  Nome:       Pedro Cidadão              │
│  CPF:        ***.***.***-**             │
│  Endereço:   Rua X, 123                 │
│  Documentos: ✅ 2 arquivos enviados     │
│                                         │
│  ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━   │
│                                         │
│  Próximos passos:                       │
│  1. Análise dos documentos (2-3 dias)   │
│  2. Visita ao animal (agendada)         │
│  3. Aprovação final                     │
│  4. Assinatura do termo                 │
│                                         │
│  ☐ Li e aceito os termos de adoção      │
│                                         │
│  [← Voltar]  [Enviar Solicitação]       │
└─────────────────────────────────────────┘
```

---

## 🎨 DESIGN SYSTEM

### Paleta de Cores:

```css
/* Cores Principais */
--primary: #3B82F6;      /* Azul - Ações principais */
--secondary: #10B981;    /* Verde - Sucesso/Disponível */
--accent: #F59E0B;       /* Laranja - Urgente */
--danger: #EF4444;       /* Vermelho - Erro/Crítico */

/* Neutros */
--gray-50: #F9FAFB;
--gray-100: #F3F4F6;
--gray-600: #4B5563;
--gray-900: #111827;

/* Semânticos */
--success: #10B981;
--warning: #F59E0B;
--error: #EF4444;
--info: #3B82F6;
```

### Tipografia:

```css
/* Headings */
h1: 32px / 40px - Bold
h2: 24px / 32px - Bold
h3: 20px / 28px - Semibold
h4: 18px / 24px - Semibold

/* Body */
body: 16px / 24px - Regular
small: 14px / 20px - Regular
caption: 12px / 16px - Regular
```

### Espaçamento:

```css
/* Sistema de 8px */
--space-1: 8px;
--space-2: 16px;
--space-3: 24px;
--space-4: 32px;
--space-6: 48px;
--space-8: 64px;
```

---

## 📱 COMPONENTES PRINCIPAIS

### 1. AnimalCard (Redesenhado)

```tsx
<AnimalCard
  image="/luna.jpg"
  name="Luna"
  breed="Labrador Mix"
  age={2}
  sex="Fêmea"
  size="Médio"
  vaccinated={true}
  neutered={true}
  location="São Paulo, SP"
  onAdopt={() => {}}
  onViewDetails={() => {}}
/>
```

### 2. AdoptionWizard

```tsx
<AdoptionWizard
  animal={animal}
  onComplete={(data) => {}}
  onCancel={() => {}}
/>
```

### 3. ProcessProgress

```tsx
<ProcessProgress
  status="pending"
  progress={40}
  steps={[
    { label: "Solicitação", completed: true },
    { label: "Análise", current: true },
    { label: "Visita", pending: true },
    { label: "Aprovação", pending: true }
  ]}
/>
```

---

## ✅ CHECKLIST DE IMPLEMENTAÇÃO

### Semana 1-2: Design
- [ ] Criar wireframes no Figma
- [ ] Definir paleta de cores final
- [ ] Criar componentes no Figma
- [ ] Protótipo interativo
- [ ] Teste com usuários (5 pessoas)

### Semana 3-4: Implementação
- [ ] Atualizar Design System
- [ ] Implementar novos componentes
- [ ] Redesign do dashboard
- [ ] Redesign da busca
- [ ] Redesign dos detalhes

### Semana 5-6: Refinamento
- [ ] Animações e transições
- [ ] Responsividade
- [ ] Acessibilidade (WCAG 2.1)
- [ ] Performance (Lighthouse >90)
- [ ] Testes com usuários

---

**Próxima Ação:** Criar wireframes no Figma

