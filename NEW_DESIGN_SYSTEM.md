# 🎨 Novo Design System DIBEA

**Baseado nas preferências do usuário:**
- ✅ Densidade: Balanceada (estilo Stripe)
- ✅ Estética: Minimalista/Flat
- ✅ Navegação: Híbrido (top + sidebar)
- ✅ Cards: Grid Pinterest-style
- ✅ Prioridade: Facilidade de uso
- ✅ Cores: Verde Natureza
- ✅ Objetivo: Híbrido Inteligente (admin profissional, cidadão emocional)
- ✅ Inspiração: Notion (clean, organizado)

---

## 🎨 Paleta de Cores

### **Principal: Verde Natureza**
```css
/* Emerald Scale (Tailwind) */
emerald-50:  #ecfdf5  /* Backgrounds suaves */
emerald-100: #d1fae5  /* Hover states */
emerald-200: #a7f3d0  /* Borders */
emerald-500: #10b981  /* Accents */
emerald-600: #059669  /* Primary buttons ← PRINCIPAL */
emerald-700: #047857  /* Hover buttons */
emerald-800: #065f46  /* Dark text */
```

### **Neutros**
```css
gray-50:  #f9fafb   /* Page background */
gray-100: #f3f4f6   /* Card backgrounds */
gray-200: #e5e7eb   /* Borders */
gray-400: #9ca3af   /* Icons disabled */
gray-600: #4b5563   /* Secondary text */
gray-700: #374151   /* Body text */
gray-900: #111827   /* Headers */
```

### **Suporte**
```css
/* Status colors */
blue-600:   #2563eb  /* Adotado */
amber-600:  #d97706  /* Tratamento */
red-600:    #dc2626  /* Urgente/Erro */
orange-600: #ea580c  /* Perdido */
```

---

## 📐 Espaçamento

### **Padrão Stripe-style**
```css
/* Containers */
px-8 py-6    /* Seções principais */
px-6 py-4    /* Cards */
px-4 py-3    /* Inputs */

/* Gaps */
gap-3        /* Entre elementos próximos */
gap-6        /* Entre seções */
gap-8        /* Entre blocos */

/* Margins */
mb-1         /* Subtítulos */
mb-3         /* Entre elementos de card */
mb-6         /* Entre seções */
```

---

## 🔤 Tipografia

### **Hierarquia**
```css
/* Headings */
h1: text-2xl font-semibold   /* Páginas principais */
h2: text-xl font-semibold    /* Seções */
h3: text-base font-semibold  /* Cards */

/* Body */
text-sm  /* Texto padrão */
text-xs  /* Labels, badges */

/* Weight */
font-medium    /* Labels, menus */
font-semibold  /* Headings */
font-normal    /* Body text */
```

---

## 🎴 Componentes

### **Cards**
```tsx
<Card className="border border-gray-200 shadow-none hover:shadow-sm transition-all">
  {/* Sem sombras por padrão, sutil no hover */}
</Card>
```

### **Buttons**

**Primary (Verde)**
```tsx
<Button className="bg-emerald-600 hover:bg-emerald-700 text-white">
  Ação Principal
</Button>
```

**Secondary (Outline)**
```tsx
<Button variant="outline" className="border-gray-300 text-gray-700 hover:bg-gray-50">
  Ação Secundária
</Button>
```

### **Badges**
```tsx
{/* Status */}
<div className="bg-emerald-50 text-emerald-700 border border-emerald-200 rounded-md px-2.5 py-1 text-xs font-medium">
  Disponível
</div>
```

### **Inputs**
```tsx
<Input className="border-gray-300 focus:border-emerald-500 focus:ring-emerald-500" />
```

---

## 📊 Stats Cards (Estilo Stripe)

```tsx
<Card className="border border-gray-200 shadow-none">
  <div className="p-6">
    <div className="flex items-center gap-3">
      {/* Icon com cor de fundo */}
      <div className="p-2.5 bg-emerald-100 text-emerald-600 rounded-lg">
        <Icon className="w-5 h-5" />
      </div>
      
      {/* Texto */}
      <div>
        <p className="text-sm text-gray-600 font-medium">Label</p>
        <p className="text-2xl font-semibold text-gray-900">Valor</p>
      </div>
    </div>
  </div>
</Card>
```

---

## 🐾 Animal Cards

### **Grid Layout**
```tsx
{/* Responsive grid */}
<div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
  <AnimalCard />
</div>
```

### **Card Structure**
```tsx
<Card className="border border-gray-200 hover:border-gray-300 hover:shadow-md">
  {/* Image aspect-[4/3] */}
  <div className="relative aspect-[4/3] bg-gray-100">
    <img className="w-full h-full object-cover" />
    
    {/* Status badge - top left */}
    <div className="absolute top-3 left-3">
      <StatusBadge />
    </div>
    
    {/* Species - top right */}
    <div className="absolute top-3 right-3">
      <span>🐕 Cão</span>
    </div>
  </div>
  
  {/* Content */}
  <div className="p-4">
    <h3>{animal.nome}</h3>
    <p className="text-sm text-gray-600">Raça • Sexo • Idade</p>
    <div className="flex gap-2 mt-4">
      <Button variant="outline">Ver</Button>
      <Button className="bg-emerald-600">Adotar</Button>
    </div>
  </div>
</Card>
```

---

## 🎯 Status System

### **Cores por Status**
```typescript
const statusConfig = {
  DISPONIVEL: {
    color: 'bg-emerald-50 text-emerald-700 border-emerald-200',
    icon: CheckCircle
  },
  ADOTADO: {
    color: 'bg-blue-50 text-blue-700 border-blue-200',
    icon: CheckCircle
  },
  EM_TRATAMENTO: {
    color: 'bg-amber-50 text-amber-700 border-amber-200',
    icon: Clock
  },
  OBITO: {
    color: 'bg-gray-50 text-gray-700 border-gray-200',
    icon: AlertCircle
  },
  PERDIDO: {
    color: 'bg-orange-50 text-orange-700 border-orange-200',
    icon: AlertCircle
  }
};
```

---

## 🧭 Navegação

### **Sidebar**
```css
/* Admin */
bg-white
border-r border-gray-200

/* Items */
hover:bg-gray-100        /* Normal */
bg-emerald-50            /* Active */
text-emerald-700         /* Active text */
border-l-2 border-emerald-600  /* Active indicator */
```

### **Header**
```css
bg-white
border-b border-gray-200
px-8 py-4
```

### **Breadcrumbs**
```css
bg-gray-50
border-b border-gray-200
px-8 py-3
text-sm
```

---

## 🎨 Princípios de Design

### **1. Minimalismo**
- ❌ Sem gradientes excessivos
- ❌ Sem sombras grandes
- ✅ Bordas finas (1px)
- ✅ Sombras sutis (shadow-sm)
- ✅ Cores sólidas

### **2. Clareza (Stripe-style)**
- ✅ Informação organizada em seções
- ✅ Espaçamento consistente
- ✅ Hierarquia visual clara
- ✅ Não muito denso, não muito vazio

### **3. Verde Natureza**
- ✅ Emerald-600 como cor principal
- ✅ Associação com cuidado/vida
- ✅ Botões principais em verde
- ✅ Status "Disponível" em verde

### **4. Facilidade de Uso**
- ✅ Ações claras (botões bem descritos)
- ✅ Feedback visual (hover states)
- ✅ Navegação intuitiva
- ✅ Labels descritivos

---

## 📱 Responsivo

### **Breakpoints**
```css
/* Mobile first */
sm:  640px   /* Tablet portrait */
md:  768px   /* Tablet landscape */
lg:  1024px  /* Desktop */
xl:  1280px  /* Large desktop */
```

### **Grid Adaptativo**
```css
/* Animals grid */
grid-cols-1          /* Mobile */
md:grid-cols-2       /* Tablet */
lg:grid-cols-3       /* Desktop */
xl:grid-cols-4       /* Large */
```

---

## 🔄 Estados Interativos

### **Hover**
```css
/* Cards */
hover:border-gray-300 hover:shadow-md

/* Buttons */
hover:bg-emerald-700  /* Primary */
hover:bg-gray-50      /* Secondary */

/* Links */
hover:text-gray-900
```

### **Focus**
```css
focus:border-emerald-500
focus:ring-emerald-500
focus:ring-2
```

### **Active**
```css
/* Nav items */
bg-emerald-50
text-emerald-700
border-l-2 border-emerald-600
```

---

## 🎯 Aplicação

### **Admin**
- Verde emerald-600
- Minimalista
- Informação balanceada
- Profissional mas não frio

### **Cidadão**
- Mesmo verde
- Mais emocional
- Fotos maiores
- Textos mais acolhedores

---

## 📦 Componentes Reutilizáveis

### **StatCard**
```tsx
<StatCard 
  icon={Activity}
  label="Total de Animais"
  value={42}
  color="bg-emerald-100 text-emerald-600"
/>
```

### **StatusBadge**
```tsx
<StatusBadge status="DISPONIVEL" />
```

### **AnimalCard**
```tsx
<AnimalCard animal={animalData} />
```

---

## ✅ Checklist de Implementação

### **Cores** ✅
- [x] Emerald-600 como principal
- [x] Gray scale para neutros
- [x] Status colors definidos

### **Componentes** ✅
- [x] Cards minimalistas
- [x] Buttons (primary + outline)
- [x] Stats cards
- [x] Animal cards
- [x] Status badges

### **Layout** ✅
- [x] Sidebar verde
- [x] Header clean
- [x] Breadcrumbs
- [x] Grid responsivo

### **Páginas** 🚧
- [x] Admin Animals
- [ ] Citizen Dashboard
- [ ] Animals Search
- [ ] Outras páginas

---

**Status:** ✅ Design system definido e aplicado
**Próximo:** Aplicar em todas as páginas restantes
**Test:** Reinicie `npm run dev` e veja a diferença!

**Inspiração:** Stripe Dashboard (clareza), Notion (organização), Linear (minimalismo)
