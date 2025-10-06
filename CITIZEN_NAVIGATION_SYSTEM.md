# 🎯 Sistema de Navegação Cidadão - DIBEA

## ✅ O Que Foi Criado

### **CitizenLayout Component**
`/components/citizen/CitizenLayout.tsx`

**Diferenças do Admin Layout:**
- 🎨 Design mais amigável e acolhedor
- 🐾 Foco em adoção (não gestão)
- 📊 Quick stats na sidebar (processos, notificações)
- 💙 Gradientes azuis (tema de confiança/cuidado)
- 📱 Descrições em cada item do menu
- ✨ Visual mais clean e menos técnico

---

## 🗺️ Navegação do Cidadão

### **Sidebar Menu (7 Seções)**

```
🏠 Início
   Visão geral
   
🔍 Buscar Animais
   Encontre seu novo amigo
   
❤️ Meus Processos [1]
   Adoções em andamento
   
🐾 Meus Animais
   Animais adotados
   
📅 Agendamentos
   Consultas e procedimentos
   
📄 Documentos
   Comprovantes e certificados
   
💬 Chat
   Fale conosco
   
────────────────────────────
👤 Meu Perfil
🚪 Sair
```

### **Quick Stats Card (Sidebar)**
```
┌─────────────────────────────┐
│ Status:          [Cidadão]  │
│ ❤️ 1 processo em andamento  │
│ 🔔 2 notificações não lidas │
└─────────────────────────────┘
```

### **Header**
```
┌────────────────────────────────────────────────────────┐
│ Olá, Pedro! 👋            [🔍 Buscar (⌘K)] [🔔·] [📍] │
│ Bem-vindo ao seu painel                                │
└────────────────────────────────────────────────────────┘
```

---

## 🎨 Design Diferenciado

### **Admin vs Citizen**

| Feature | Admin | Citizen |
|---------|-------|---------|
| **Cor Principal** | Blue-600 | Blue-600 |
| **Sidebar Width** | 256px | 288px (mais largo) |
| **Menu Style** | Simples com ícone | Com descrição em 2 linhas |
| **Quick Stats** | Não | Sim (card na sidebar) |
| **Gradientes** | Sutis | Mais vibrantes |
| **Badges** | Contador simples | Com contexto |
| **Header** | Técnico (busca global) | Amigável (welcome msg) |
| **Tone** | Profissional | Acolhedor |

### **Visual Identity**

**Admin:**
- 🛡️ Shield icon
- Azul corporativo
- Menu compacto
- Foco em eficiência

**Citizen:**
- 🐾 Paw icon
- Azul amigável
- Menu descritivo
- Foco em orientação

---

## 📱 Jornada do Cidadão

### **1. Primeiro Acesso**
```
Dashboard (Início)
→ Ver animais em destaque
→ Buscar Animais
→ Escolher animal
→ Iniciar processo de adoção
```

### **2. Durante o Processo**
```
Meus Processos [1]
→ Ver status da adoção
→ Upload de documentos
→ Agendar visita
→ Receber notificações
```

### **3. Pós-Adoção**
```
Meus Animais
→ Ver histórico médico
→ Agendar consultas
→ Ver documentos (RGA)
→ Chat com suporte
```

---

## 🎯 Menu Items - Detalhes

### **🏠 Início** (`/citizen/dashboard`)
- Dashboard principal
- Animais em destaque
- Processos ativos
- Notificações recentes
- Quick actions

### **🔍 Buscar Animais** (`/animals/search`)
- Filtros por espécie, porte, idade
- Cards com fotos
- Mapa de localização
- Favorecer animais

### **❤️ Meus Processos** (`/citizen/adoptions`)
- Lista de adoções em andamento
- Timeline de status
- Upload de documentos
- Histórico de interações
- Badge: contador de processos ativos

### **🐾 Meus Animais** (`/citizen/animals`)
- Animais já adotados
- Carteirinha digital
- Histórico médico
- Certificados (RGA)
- Fotos e informações

### **📅 Agendamentos** (`/citizen/appointments`)
- Consultas veterinárias
- Procedimentos agendados
- Campanhas de vacinação
- Histórico de atendimentos

### **📄 Documentos** (`/citizen/documents`)
- Termo de adoção
- RGA (Registro Geral Animal)
- Comprovantes de vacinação
- Atestados médicos
- Download de PDFs

### **💬 Chat** (`/citizen/chat`)
- Falar com funcionários
- Tirar dúvidas
- Suporte em tempo real
- Histórico de conversas

---

## 🚀 Como Usar

### **Estrutura de Páginas**

```tsx
// app/citizen/minha-pagina/page.tsx
export default function MinhaPagina() {
  return (
    <div className="p-8">
      {/* Breadcrumbs */}
      <div className="mb-6">
        <div className="flex items-center gap-2 text-sm text-gray-600">
          <a href="/citizen/dashboard">Início</a>
          <ChevronRight className="w-4 h-4" />
          <span className="text-gray-900 font-medium">Minha Página</span>
        </div>
      </div>

      {/* Conteúdo */}
      <h1 className="text-3xl font-bold mb-4">Título</h1>
      {/* ... */}
    </div>
  );
}
```

### **Layout Automático**
- Todas as páginas em `/app/citizen/*` usam CitizenLayout automaticamente
- Sidebar e header aparecem em todas as páginas
- Não precisa importar nada

---

## 📊 Quick Stats (Sidebar Card)

### **Dados Exibidos:**
```typescript
interface QuickStats {
  role: 'Cidadão' | 'Tutor';
  activeProcesses: number;
  unreadNotifications: number;
  adoptedAnimals?: number;
}
```

### **Comportamento:**
- Só aparece quando sidebar está expandida
- Atualiza em tempo real
- Cores: Blue-50 background, Blue-700 text
- Badges dinâmicos

---

## 🔔 Notificações

### **Badge no Menu**
```
❤️ Meus Processos [1]  ← Contador de processos ativos
```

### **Badge no Header**
```
[🔔·]  ← Ponto vermelho quando tem novas
```

### **Tipos de Notificação:**
1. **Processo atualizado** - Badge urgente
2. **Novo animal disponível** - Badge info
3. **Agendamento confirmado** - Badge success
4. **Documento pendente** - Badge warning

---

## 🎨 Componentes Visuais

### **Sidebar Item (Ativo)**
```css
Gradient: from-blue-600 to-blue-700
Text: white
Shadow: shadow-lg shadow-blue-500/30
Icon: white
Description: text-blue-100
```

### **Sidebar Item (Hover)**
```css
Background: gray-100
Text: gray-700
Icon: blue-600 (on hover)
```

### **Quick Stats Card**
```css
Background: gradient-to-br from-blue-50 to-indigo-50
Border: border-blue-100
Text: text-blue-700
Icons: text-blue-600
```

---

## 📱 Responsivo

### **Mobile (<768px)**
- Sidebar fecha automaticamente
- Fica com drawer/modal
- Header simplificado
- Touch-friendly (min 44px)

### **Tablet (768-1024px)**
- Sidebar colapsável
- Quick stats visível
- Header completo

### **Desktop (>1024px)**
- Sidebar expandida por padrão
- Todos os elementos visíveis
- Layout otimizado

---

## ✅ Checklist

### **Layout & Navegação** ✅
- [x] Sidebar com menu de cidadão
- [x] Header com welcome message
- [x] Quick stats card
- [x] Badges de notificação
- [x] Toggle sidebar
- [x] Avatar do usuário
- [x] Localização (município)
- [x] Busca rápida (UI)

### **Páginas Cidadão** 🚧
- [x] Dashboard
- [ ] Buscar Animais
- [ ] Meus Processos
- [ ] Meus Animais
- [ ] Agendamentos
- [ ] Documentos
- [ ] Chat
- [ ] Perfil

---

## 🔄 Fluxo de Adoção

### **Status Tracking**
```
1. Interesse Manifestado    🔵 Badge: Pendente
2. Documentos Enviados      🟡 Badge: Em Análise
3. Análise Aprovada         🟢 Badge: Aprovado
4. Agendamento de Visita    📅 Badge: Agendado
5. Adoção Concluída         ✅ Badge: Concluído
```

### **Notificações por Etapa**
- Cada mudança de status → Notificação
- Badge de urgência conforme prazo
- Chat disponível para dúvidas

---

## 🎯 Melhorias Futuras

### **Fase 1 - Básico**
- [ ] Dashboard funcional
- [ ] Busca de animais
- [ ] Processo de adoção completo
- [ ] Upload de documentos

### **Fase 2 - Avançado**
- [ ] Chat em tempo real
- [ ] Notificações push
- [ ] Favoritar animais
- [ ] Compartilhar nas redes sociais

### **Fase 3 - Premium**
- [ ] Gamificação (badges)
- [ ] Comunidade de tutores
- [ ] Timeline do animal
- [ ] App mobile

---

**Status:** ✅ Sistema de navegação cidadão completo
**Test:** Reinicie `npm run dev` e acesse `/citizen/dashboard`
**Next:** Implementar páginas faltantes do cidadão

---

**Arquivos:**
- ✅ `/components/citizen/CitizenLayout.tsx`
- ✅ `/app/citizen/layout.tsx`
- 📖 `CITIZEN_NAVIGATION_SYSTEM.md` (este arquivo)
