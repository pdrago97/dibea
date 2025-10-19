# 🎨 DIBEA Wireframe Specifications

## 📱 Mobile-First Design System

### **Design Principles**

- **Mobile-first**: Design for 375px width first, scale up
- **Thumb-friendly**: Minimum 44px touch targets
- **Simple navigation**: Max 5 main menu items
- **Clear CTAs**: Primary actions prominently displayed
- **Visual hierarchy**: Important info stands out

---

## 🏠 **Citizen Dashboard Wireframe**

### **Mobile (375px)**

```
┌─────────────────────────────┐
│ ☰  DIBEA           🔔  │ <- Header: Menu, Logo, Notifications
├─────────────────────────────┤
│                         │
│    🐾 Encontre um Pet    │ <- Hero Section (60% height)
│      Seu melhor amigo     │
│         está esperando     │
│                         │
│    [🔍 Buscar Animais]   │ <- Primary CTA Button
│                         │
├─────────────────────────────┤
│  Meus Processos          │ <- Section 1
│  📋 3 Adoções Ativas    │
│  [Ver Todos]             │
├─────────────────────────────┤
│  Animais Recentes         │ <- Section 2
│  [🐕][🐈][🐕][🐈]    │ <- Horizontal scroll cards
│  Max  [Ver Todos]         │
├─────────────────────────────┤
│  Precisa de Ajuda?       │ <- Section 3
│  💬 Chat com IA           │
│  [Abrir Chat]            │
└─────────────────────────────┘
```

### **Desktop (1200px+)**

```
┌─────────────────────────────────────────────────────────────────┐
│ DIBEA Logo    [Home] [Animais] [Adoções] [Perfil]    🔔 │
├─────────────────────────────────────────────────────────────────┤
│                                                         │
│  🐾 Encontre um Pet                                  │  │
│     Seu melhor amigo está esperando                        │  │ <- Hero (40% width)
│                                                         │  │
│  [🔍 Buscar Animais]    [📋 Minhas Adoções]        │  │
│                                                         │  │
├─────────────────────────────┬───────────────────────────────┤
│  Meus Processos          │  Animais Recentes             │
│  📋 3 Adoções Ativas      │  [🐕][🐈][🐕][🐈][🐕]    │
│  • Adoção #1234         │  [🐈][🐕][🐈][🐕]         │
│  • Adoção #1235         │  [🐕][🐈][🐕]             │
│  • Adoção #1236         │  [Ver Todos]                  │
│  [Ver Todos]             │                              │
│                         │                              │
│  Chat IA                │  Campanhas                   │
│  💬 Tem dúvidas?         │  🏥 Castração Gratuita       │
│  [Abrir Chat]           │  📅 Agende Vacinação         │
│                         │  [Ver Todas]                 │
└─────────────────────────────┴───────────────────────────────┘
```

---

## 🔍 **Animal Search Interface**

### **Mobile**

```
┌─────────────────────────────┐
│ ←  Buscar Animais    ⚙️  │ <- Header: Back, Title, Filters
├─────────────────────────────┤
│ [🔍 Buscar por nome...]   │ <- Search Bar
├─────────────────────────────┤
│ 🐶 Filtros              │ <- Filter Pills (horizontal scroll)
│ [Cães] [Gatos] [Peq]  │
│ [Méd] [Grande] [Todos]   │
├─────────────────────────────┤
│                         │
│ ┌─────────────────────┐   │ <- Animal Card (repeat)
│ │ 📷               │   │
│ │                   │   │
│ │ 🐕 Max            │   │
│ │ 2 anos • Macho     │   │
│ │ 📍 São Paulo, SP   │   │
│ │                   │   │
│ │ [Adotar Agora]    │   │ <- Primary CTA
│ └─────────────────────┘   │
│                         │
│ ┌─────────────────────┐   │
│ │ 📷               │   │
│ │                   │   │
│ │ 🐈 Luna           │   │
│ │ 1 ano • Fêmea      │   │
│ │ 📍 São Paulo, SP   │   │
│ │                   │   │
│ │ [Adotar Agora]    │   │
│ └─────────────────────┘   │
│                         │
│ [Carregar Mais]          │ <- Load More
└─────────────────────────────┘
```

### **Desktop**

```
┌─────────────────────────────────────────────────────────────────┐
│ ← Buscar Animais                    [Filtros] [Ordenar] │
├─────────────────────────────────────────────────────────────────┤
│ ┌─────────────────┐ ┌─────────────────┐ ┌─────────────┐ │
│ │ 📷             │ │ 📷             │ │ 📷         │ │ <- Grid (3-4 columns)
│ │                 │ │                 │ │             │ │
│ │ 🐕 Max         │ │ 🐈 Luna         │ │ 🐕 Buddy    │ │
│ │ 2 anos • Macho  │ │ 1 ano • Fêmea   │ │ 3 anos • M  │ │
│ │ 📍 São Paulo   │ │ 📍 São Paulo   │ │ 📍 São P    │ │
│ │                 │ │                 │ │             │ │
│ │ [Adotar Agora] │ │ [Adotar Agora] │ │ [Adotar Ag] │ │
│ └─────────────────┘ └─────────────────┘ └─────────────┘ │
│                                                         │
│ ┌─────────────────┐ ┌─────────────────┐ ┌─────────────┐ │
│ │ 📷             │ │ 📷             │ │ 📷         │ │
│ │ 🐈 Bella        │ │ 🐕 Rocky        │ │ 🐕 Charlie  │ │
│ │ 6 meses • Fêmea │ │ 4 anos • Macho   │ │ 5 anos • M  │ │
│ │ 📍 São Paulo   │ │ 📍 São Paulo   │ │ 📍 São P    │ │
│ │                 │ │                 │ │             │ │
│ │ [Adotar Agora] │ │ [Adotar Agora] │ │ [Adotar Ag] │ │
│ └─────────────────┘ └─────────────────┘ └─────────────┘ │
│                                                         │
│                    [Página Anterior] [1] [2] [3] [Próxima] │ <- Pagination
└─────────────────────────────────────────────────────────────────┘
```

---

## 📋 **4-Step Adoption Workflow**

### **Step 1: Choose Animal**

```
┌─────────────────────────────┐
│ ← Adoção de Animal    1/4 │ <- Progress Header
├─────────────────────────────┤
│                         │
│    🐕 Max foi escolhido! │ <- Confirmation
│                         │
│ ┌─────────────────────┐   │ <- Selected Animal Card
│ │ 📷               │   │
│ │                   │   │
│ │ 🐕 Max            │   │
│ │ 2 anos • Macho     │   │
│ │ 📍 São Paulo, SP   │   │
│ │                   │   │
│ │ ✅ Selecionado     │   │
│ └─────────────────────┘   │
│                         │
│ [🔄 Escolher Outro]      │ <- Secondary Action
│ [Continuar →]            │ <- Primary CTA
└─────────────────────────────┘
```

### **Step 2: Your Information**

```
┌─────────────────────────────┐
│ ← Adoção de Animal    2/4 │
├─────────────────────────────┤
│ 📝 Seus Dados          │ <- Section Title
│                         │
│ Nome Completo*          │ <- Form Fields
│ [________________]      │
│                         │
│ Email*                 │
│ [________________]      │
│                         │
│ Telefone*              │
│ [(__) _____-____]      │
│                         │
│ CPF*                   │
│ [___.___.___-__]      │
│                         │
│ Endereço*              │
│ [________________]      │
│                         │
│ [← Voltar]    [Continuar →] │
└─────────────────────────────┘
```

### **Step 3: Documents**

```
┌─────────────────────────────┐
│ ← Adoção de Animal    3/4 │
├─────────────────────────────┤
│ 📄 Documentos           │ <- Section Title
│                         │
│ 📸 Foto do RG*         │ <- Upload Areas
│ ┌─────────────────────┐   │
│ │   +   Adicionar   │   │
│ │     Foto          │   │
│ │   ou Arraste      │   │
│ └─────────────────────┘   │
│                         │
│ 📸 Comprovante Residência*│
│ ┌─────────────────────┐   │
│ │   +   Adicionar   │   │
│ │     Documento     │   │
│ │   ou Arraste      │   │
│ └─────────────────────┘   │
│                         │
│ 📸 Selfie com Documento* │
│ ┌─────────────────────┐   │
│ │   +   Adicionar   │   │
│ │     Selfie       │   │
│ │   ou Arraste      │   │
│ └─────────────────────┘   │
│                         │
│ [← Voltar]    [Continuar →] │
└─────────────────────────────┘
```

### **Step 4: Review & Submit**

```
┌─────────────────────────────┐
│ ← Adoção de Animal    4/4 │
├─────────────────────────────┤
│ ✅ Revisão Final        │ <- Section Title
│                         │
│ 🐕 Animal a Adotar      │ <- Review Section
│ Max • 2 anos • Macho    │
│                         │
│ 👤 Seus Dados           │
│ João Silva               │
│ joao@email.com           │
│ (11) 98765-4321        │
│                         │
│ 📄 Documentos           │
│ ✅ RG                   │
│ ✅ Comprovante Residência  │
│ ✅ Selfie               │
│                         │
│ ☑️ Li e aceito os       │ <- Terms
│    termos de adoção      │
│                         │
│ [← Voltar]    [Enviar Adoção] │ <- Final CTA
└─────────────────────────────┘
```

---

## 🎨 **Design System Specifications**

### **Colors**

```css
/* Primary */
--primary-50: #eff6ff --primary-500: #3b82f6 --primary-600: #2563eb
  /* Secondary */ --secondary-50: #f0fdf4 --secondary-500: #22c55e
  --secondary-600: #16a34a /* Neutral */ --gray-50: #f9fafb --gray-100: #f3f4f6
  --gray-500: #6b7280 --gray-900: #111827 /* Semantic */ --success: #22c55e
  --warning: #f59e0b --error: #ef4444;
```

### **Typography**

```css
/* Mobile */
--text-xs: 12px --text-sm: 14px --text-base: 16px --text-lg: 18px
  --text-xl: 20px --text-2xl: 24px /* Desktop */ --text-xs: 14px --text-sm: 16px
  --text-base: 18px --text-lg: 20px --text-xl: 24px --text-2xl: 32px;
```

### **Spacing**

```css
--space-1: 4px --space-2: 8px --space-3: 12px --space-4: 16px --space-6: 24px
  --space-8: 32px --space-12: 48px --space-16: 64px;
```

### **Border Radius**

```css
--radius-sm: 4px --radius-md: 8px --radius-lg: 12px --radius-xl: 16px
  --radius-full: 9999px;
```

---

## 📱 **Component Specifications**

### **Animal Card**

- **Mobile**: 100% width, 200px height
- **Desktop**: 280px width, 320px height
- **Image**: 16:9 aspect ratio, rounded-lg
- **Content**: Name, age/sex, location
- **CTA**: Full-width button at bottom

### **Search Bar**

- **Height**: 48px (mobile), 56px (desktop)
- **Icon**: Search icon on left
- **Placeholder**: "Buscar por nome ou raça..."
- **Border**: rounded-lg, gray-200

### **Filter Pills**

- **Height**: 36px
- **Spacing**: 8px between pills
- **Active**: primary-500 background, white text
- **Inactive**: gray-100 background, gray-700 text

### **Primary Button**

- **Height**: 48px (mobile), 52px (desktop)
- **Background**: primary-500
- **Text**: white, font-medium
- **Border**: rounded-lg
- **Hover**: primary-600

---

## 🚀 **Implementation Priority**

### **Phase 1: Core Components**

1. **AnimalCard** - Reusable animal display
2. **SearchBar** - With filters integration
3. **FilterPills** - Horizontal scroll filter
4. **AdoptionWizard** - Multi-step form

### **Phase 2: Page Assembly**

1. **CitizenDashboard** - Hero + sections
2. **AnimalSearchPage** - Search + grid
3. **AdoptionFlow** - Step-by-step wizard

### **Phase 3: Responsive Design**

1. **Mobile optimization** - Touch targets
2. **Tablet layout** - 2-column grids
3. **Desktop enhancement** - 3-4 columns

---

**Next**: Implement these wireframes as React components with Tailwind CSS
