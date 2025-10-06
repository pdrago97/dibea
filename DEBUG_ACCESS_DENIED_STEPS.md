# 🔍 Debug: "Acesso Negado" - Passos Detalhados

## ✅ O Que Foi Feito

1. **Adicionado logs detalhados** em `hasRole()` function
2. **Criada página de debug** em `/debug-auth`
3. **Logs adicionados** em `useRequireAuth`

---

## 🧪 PASSO A PASSO PARA DEBUGAR

### 1. Reinicie o Dev Server
```bash
# Terminal 1: Backend
cd apps/backend
npm run dev

# Terminal 2: Frontend
cd apps/frontend
npm run dev
```

### 2. Limpe o Cache Completamente
```bash
# No navegador:
1. F12 (Abrir DevTools)
2. Application → Clear Storage → "Clear site data"
3. Ou Cmd+Shift+Del → Limpar tudo
```

### 3. Acesse a Página de Debug
```
http://localhost:3001/debug-auth
```

**O que você verá:**
- Estado do AuthContext
- Objeto user completo
- LocalStorage raw
- Testes de hasRole()
- Botões de ação rápida

### 4. Faça Login
```
Email: admin@dibea.com
Password: admin123
```

### 5. Volte para `/debug-auth`
```
http://localhost:3001/debug-auth
```

### 6. TIRE PRINT SCREEN da página inteira

### 7. Abra o Console (F12)

**Você DEVE ver logs como:**
```
[hasRole] Called with: { roles: ['ADMIN'], userRole: 'ADMIN', user: {...} }
[hasRole] Result: { roleArray: ['ADMIN'], userRole: 'ADMIN', includes: true }
```

### 8. Clique em "Ir para /admin/dashboard"

**Se aparecer "Acesso Negado" novamente:**

### 9. No Console, procure por:
```
[useRequireAuth] User role: ADMIN Required: ['ADMIN'] Authorized: false
```

OU

```
[hasRole] Result: { roleArray: ['ADMIN'], userRole: 'ADMIN', includes: false }
```

---

## 📸 INFORMAÇÕES NECESSÁRIAS

**Por favor, me envie:**

### A. Print da página `/debug-auth` mostrando:
- [ ] AuthContext State
- [ ] User Object (especialmente o `role`)
- [ ] LocalStorage values
- [ ] hasRole() tests results

### B. Logs do Console (copie e cole):
```
Todos os logs que começam com:
- [hasRole]
- [useRequireAuth]
- AuthContext:
```

### C. Output destes comandos no console do navegador:
```javascript
// Cole no console (F12):
console.log('User from localStorage:', JSON.parse(localStorage.getItem('user')));
console.log('Token:', localStorage.getItem('token'));
console.log('Cookies:', document.cookie);
```

---

## 🔍 POSSÍVEIS CAUSAS

### Causa 1: Role não é string 'ADMIN'
```javascript
// Pode ser um objeto:
user.role = { name: 'ADMIN' } // ❌ Errado
user.role = 'ADMIN'           // ✅ Correto
```

### Causa 2: Role tem espaços ou caracteres invisíveis
```javascript
user.role = 'ADMIN '  // ❌ Tem espaço
user.role = ' ADMIN'  // ❌ Tem espaço
user.role = 'ADMIN'   // ✅ Correto
```

### Causa 3: Tipo não é string
```javascript
typeof user.role === 'string' // Deve ser true
```

### Causa 4: User está sendo sobrescrito
```javascript
// Algum código pode estar mudando user.role depois do login
```

---

## 🛠️ TESTES MANUAIS NO CONSOLE

### Teste 1: Verificar User
```javascript
const user = JSON.parse(localStorage.getItem('user'));
console.log('User:', user);
console.log('Role:', user.role);
console.log('Type:', typeof user.role);
console.log('Equals ADMIN:', user.role === 'ADMIN');
console.log('Trimmed:', user.role.trim());
console.log('Length:', user.role.length);
```

### Teste 2: Verificar Array.includes
```javascript
const user = JSON.parse(localStorage.getItem('user'));
const roles = ['ADMIN'];
console.log('Includes?', roles.includes(user.role));
console.log('Index:', roles.indexOf(user.role));
```

### Teste 3: Comparação Manual
```javascript
const user = JSON.parse(localStorage.getItem('user'));
console.log('user.role:', JSON.stringify(user.role));
console.log('Expected:', JSON.stringify('ADMIN'));
console.log('Match:', user.role === 'ADMIN');
```

---

## 🚑 SOLUÇÃO TEMPORÁRIA (Bypass)

Se você precisa trabalhar AGORA e debugar depois:

### Opção 1: Desabilitar Proteção Temporariamente

No `apps/frontend/src/app/admin/dashboard/page.tsx`:

```typescript
// ANTES:
const { user } = useRequireAuth(['ADMIN']);

// DEPOIS (TEMPORÁRIO):
const { user } = useAuth();
// useRequireAuth(['ADMIN']); // Comentado

// Adicione um check simples:
if (!user) {
  return <div>Carregando...</div>;
}
```

### Opção 2: Forçar hasRole a Retornar True (MUITO TEMPORÁRIO)

No `apps/frontend/src/contexts/AuthContext.tsx`:

```typescript
const hasRole = (roles: UserRole | UserRole[]): boolean => {
  console.log('[hasRole] FORCED TO TRUE - DEBUG ONLY');
  return true; // 🚨 REMOVER DEPOIS!
};
```

⚠️ **AVISO:** Isso remove TODA a segurança. Use apenas para debug local!

---

## 📞 PRÓXIMOS PASSOS

**Me envie:**
1. Print da página `/debug-auth`
2. Logs do console
3. Output dos testes manuais

Com essas informações vou identificar o problema exato e criar a solução final.

---

## ✅ Checklist

- [ ] Dev server reiniciado
- [ ] Cache limpo
- [ ] Login feito (admin@dibea.com)
- [ ] Acessei `/debug-auth`
- [ ] Tirei print da página
- [ ] Copiei logs do console
- [ ] Executei testes manuais no console
- [ ] Tentei acessar `/admin/dashboard`
- [ ] Enviei todas as informações para análise

---

**Status:** Aguardando informações de debug 🔍
