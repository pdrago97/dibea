# 🔧 Fix: "Acesso Negado" para Admin

## Problema
Admin faz login mas recebe "Acesso Negado" ao acessar `/admin/dashboard`

## Causa
`useRequireAuth` estava verificando permissões antes do usuário carregar do localStorage

## Solução Aplicada

### 1. Corrigido `useRequireAuth` timing
```typescript
// ANTES (❌ Errado):
if (!isLoading) {
  if (!user) router.push('/login');
  if (!hasRole()) router.push('/unauthorized');
}

// DEPOIS (✅ Correto):
if (isLoading) return; // Wait!

if (!user) router.push('/auth/login');
if (requiredRoles && !hasRole()) router.push('/unauthorized');
```

### 2. Adicionado Debug Logs
Agora você pode ver no console:
```
[useRequireAuth] User role: ADMIN Required: ADMIN Authorized: true
[useRequireAuth] User authorized: admin@dibea.com Role: ADMIN
```

---

## 🧪 Como Testar

### 1. Reinicie o Dev Server
```bash
# Pare o servidor (Ctrl+C)
npm run dev
```

### 2. Limpe o Cache do Navegador
```bash
# Chrome DevTools
F12 → Application → Clear Storage → Clear site data
```

### 3. Faça Login Novamente
- Email: `admin@dibea.com`
- Password: `admin123`

### 4. Abra o Console (F12)
Você deve ver:
```
AuthContext: Login successful for user: admin@dibea.com role: ADMIN
AuthContext: User state updated, isAuthenticated should now be true
[useRequireAuth] User role: ADMIN Required: ['ADMIN'] Authorized: true
[useRequireAuth] User authorized: admin@dibea.com Role: ADMIN
```

---

## ❌ Se AINDA Ver "Acesso Negado"

### Verifique os Logs no Console

**Se ver:**
```
[useRequireAuth] User role: ADMIN Required: ['ADMIN'] Authorized: false
```
→ Problema no `hasRole()` function

**Se ver:**
```
[useRequireAuth] No user found, redirecting to login
```
→ User não está sendo salvo no localStorage

**Se não ver NENHUM log:**
→ `useRequireAuth` não está sendo chamado (problema de import)

---

## 🔍 Debug Manual

### 1. Verificar se User Está Salvo
```javascript
// No console do navegador (F12)
console.log('Token:', localStorage.getItem('token'));
console.log('User:', JSON.parse(localStorage.getItem('user')));
console.log('Cookie:', document.cookie);
```

Deve mostrar:
```json
{
  "id": "1",
  "name": "Administrador DIBEA",
  "email": "admin@dibea.com",
  "role": "ADMIN",
  ...
}
```

### 2. Verificar hasRole Function
```javascript
// No console, depois de logar
const user = JSON.parse(localStorage.getItem('user'));
const roles = ['ADMIN'];
const hasRole = roles.includes(user.role);
console.log('Has role?', hasRole); // Deve ser true
```

### 3. Verificar Redirect Loop
Se ficar em loop infinito:
```javascript
// Adicione breakpoint em:
// apps/frontend/src/contexts/AuthContext.tsx linha 257
// E veja o que está acontecendo no useEffect
```

---

## 🛠️ Soluções Alternativas

### Opção 1: Remover Temporariamente a Proteção
No arquivo `apps/frontend/src/app/admin/dashboard/page.tsx`:

```typescript
// Comente temporariamente
// const { user } = useRequireAuth(['ADMIN']);

// E use apenas:
const { user } = useAuth();

// Adicione um check manual:
if (!user) {
  return <div>Carregando...</div>;
}
```

### Opção 2: Usar Middleware em Vez de useRequireAuth
Remova `useRequireAuth` e deixe o middleware fazer a proteção.

No `apps/frontend/src/middleware.ts`, já está configurado para proteger `/admin/*`

---

## 📝 Arquivos Modificados

```
✅ apps/frontend/src/contexts/AuthContext.tsx
   - useRequireAuth com timing corrigido
   - Debug logs adicionados
```

---

## 🎯 Próximos Passos

Se o problema persistir:

1. **Copie os logs do console** e me envie
2. **Print do localStorage** (F12 → Application → Local Storage)
3. **Print do cookie** (document.cookie no console)

Com essas informações posso diagnosticar o problema exato.

---

## ✅ Commit
```
commit 2e25fa2
fix(auth): improve useRequireAuth timing and add debug logs
```

**Status:** ✅ Fix aplicado, aguardando teste
