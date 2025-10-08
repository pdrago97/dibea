# 🚀 Como Aplicar a Migration no Supabase

## Método Recomendado: SQL Editor (Mais Simples)

### 1. Abra o Supabase Dashboard
```
https://supabase.com/dashboard/project/xptonqqagxcpzlgndilj
```

### 2. Vá para SQL Editor
- No menu lateral esquerdo, clique em "SQL Editor"
- Clique em "+ New Query"

### 3. Cole o SQL da Migration
- Abra o arquivo: `apps/backend/prisma/migrations/add_user_elevation_system.sql`
- Copie TODO o conteúdo (Cmd+A, Cmd+C)
- Cole no SQL Editor do Supabase (Cmd+V)

### 4. Execute a Migration
- Clique em "Run" (ou Cmd+Enter)
- Aguarde alguns segundos
- Se der erro, leia a mensagem e ajuste

### 5. Verifique se Funcionou
Execute este SQL para verificar:

```sql
-- Verificar se as tabelas foram criadas
SELECT table_name 
FROM information_schema.tables 
WHERE table_schema = 'public' 
AND table_name IN (
  'user_elevation_requests',
  'adoption_applications',
  'document_validations'
);

-- Deve retornar 3 linhas
```

### 6. Gere o Prisma Client
```bash
cd apps/backend
npx prisma generate
```

---

## Método Alternativo: Via Script Node.js

### 1. Instale Dependências
```bash
cd apps/backend
npm install @supabase/supabase-js dotenv
```

### 2. Configure Credenciais
Edite `.env` e adicione (se ainda não tiver):

```bash
NEXT_PUBLIC_SUPABASE_URL=https://xptonqqagxcpzlgndilj.supabase.co
SUPABASE_SERVICE_ROLE_KEY=seu-service-role-key-aqui
```

Para pegar o Service Role Key:
1. Va para Supabase Dashboard
2. Settings > API
3. Copie "service_role" key (secret)

### 3. Execute o Script
```bash
node apply-migration.js
```

---

## 🎯 O Que a Migration Faz

### Cria 3 Novas Tabelas:
1. **user_elevation_requests** - Solicitações de cidadãos para virar tutores
2. **adoption_applications** - Aplicações de adoção de animais
3. **document_validations** - Validação de documentos enviados

### Cria 3 Novos Enums:
1. **ElevationRequestStatus** - Status da solicitação
2. **ResidenceType** - Tipo de residência
3. **DocumentValidationStatus** - Status de validação

### Cria Functions e Triggers:
- Auto-update timestamps
- Notificações para admins
- Notificações para usuários
- Auto-elevação de role
- Auto-criação de perfil de tutor

---

## ⚠️ Troubleshooting

### Erro: "relation already exists"
**Solução:** A tabela já foi criada. Tudo bem!

### Erro: "type already exists"  
**Solução:** O enum já existe. Tudo bem!

### Erro: "permission denied"
**Solução:** 
1. Certifique-se de estar usando o Service Role Key (não o anon key)
2. Ou execute pelo SQL Editor do Supabase (tem permissões de admin)

### Erro: "syntax error"
**Solução:**
1. Certifique-se de copiar TODO o SQL
2. Não cole em múltiplas queries separadas
3. Execute tudo de uma vez

---

## ✅ Como Saber se Funcionou

### 1. No Supabase Dashboard
- Table Editor
- Você deve ver 3 novas tabelas:
  - user_elevation_requests
  - adoption_applications
  - document_validations

### 2. Teste um INSERT
```sql
-- Teste criar uma solicitação de elevação
INSERT INTO user_elevation_requests (
  user_id,
  from_role,
  to_role,
  status
) VALUES (
  (SELECT id FROM usuarios LIMIT 1),
  'CIDADAO',
  'TUTOR',
  'PENDING'
);

-- Verifique se foi criado
SELECT * FROM user_elevation_requests;
```

### 3. Verifique os Triggers
```sql
-- Ver todos os triggers criados
SELECT 
  trigger_name,
  event_object_table,
  action_statement
FROM information_schema.triggers
WHERE trigger_schema = 'public'
AND trigger_name LIKE '%elevation%'
OR trigger_name LIKE '%adoption%';
```

---

## 🎉 Próximos Passos

Após aplicar a migration:

1. **Gerar Prisma Client:**
   ```bash
   cd apps/backend
   npx prisma generate
   ```

2. **Testar no Backend:**
   ```bash
   npm run dev
   ```

3. **Testar no Frontend:**
   - Componentes já vão conseguir acessar as novas tabelas
   - Dashboard admin vai buscar dados reais

---

**Dúvidas?** Veja o arquivo SQL completo em:
`apps/backend/prisma/migrations/add_user_elevation_system.sql`
