# ⚡ DIBEA - Comandos Rápidos

## 🗄️ **SUPABASE**

### **Setup inicial:**
```bash
# Instalar CLI
npm install -g supabase

# Login
supabase login

# Link ao projeto
supabase link --project-ref xptonqqagxcpzlgndilj

# Executar migrations
supabase db push

# Ou executar migration específica
supabase db execute --file supabase/migrations/001_initial_schema.sql
```

### **Edge Functions:**
```bash
# Deploy todas
supabase functions deploy

# Deploy específica
supabase functions deploy search-animals

# Testar localmente
supabase functions serve search-animals

# Ver logs
supabase functions logs search-animals
```

### **Database:**
```bash
# Reset database (CUIDADO!)
supabase db reset

# Dump schema
supabase db dump --schema public > schema.sql

# Backup data
supabase db dump --data-only > data.sql
```

---

## 🔧 **N8N**

### **Docker:**
```bash
# Iniciar
docker run -it --rm \
  --name n8n \
  -p 5678:5678 \
  -e N8N_BASIC_AUTH_ACTIVE=true \
  -e N8N_BASIC_AUTH_USER=admin \
  -e N8N_BASIC_AUTH_PASSWORD=admin123 \
  -v ~/.n8n:/home/node/.n8n \
  n8nio/n8n

# Parar
docker stop n8n

# Ver logs
docker logs -f n8n
```

### **Docker Compose:**
```bash
# Criar docker-compose.yml
cat > docker-compose.yml << 'EOF'
version: '3.8'
services:
  n8n:
    image: n8nio/n8n
    ports:
      - "5678:5678"
    environment:
      - N8N_BASIC_AUTH_ACTIVE=true
      - N8N_BASIC_AUTH_USER=admin
      - N8N_BASIC_AUTH_PASSWORD=admin123
    volumes:
      - ~/.n8n:/home/node/.n8n
EOF

# Iniciar
docker-compose up -d

# Parar
docker-compose down

# Ver logs
docker-compose logs -f
```

---

## 💻 **NEXT.JS**

### **Desenvolvimento:**
```bash
# Instalar dependências
npm install

# Rodar dev server
npm run dev

# Build
npm run build

# Rodar produção
npm start

# Lint
npm run lint

# Type check
npm run type-check
```

### **Testes:**
```bash
# Testes unitários
npm run test

# Testes com coverage
npm run test:coverage

# Testes E2E
npm run test:e2e

# Watch mode
npm run test:watch
```

---

## 🧪 **TESTES**

### **Testar Edge Function:**
```bash
# search-animals
curl -X POST \
  https://xptonqqagxcpzlgndilj.supabase.co/functions/v1/search-animals \
  -H "Authorization: Bearer $(cat .env.local | grep SUPABASE_SERVICE_ROLE_KEY | cut -d '=' -f2)" \
  -H "Content-Type: application/json" \
  -H "X-User-Phone: +5511999999999" \
  -d '{
    "especie": "CANINO",
    "status": "DISPONIVEL",
    "limit": 5
  }' | jq

# create-adoption
curl -X POST \
  https://xptonqqagxcpzlgndilj.supabase.co/functions/v1/create-adoption \
  -H "Authorization: Bearer $(cat .env.local | grep SUPABASE_SERVICE_ROLE_KEY | cut -d '=' -f2)" \
  -H "Content-Type: application/json" \
  -H "X-User-Phone: +5511999999999" \
  -d '{
    "animal_id": "an111111-1111-1111-1111-111111111111",
    "motivo_interesse": "Sempre quis ter um labrador. Tenho quintal grande.",
    "tutor_data": {
      "cpf": "12345678900",
      "nome": "João Silva",
      "telefone": "+5511999999999",
      "endereco_completo": "Rua das Flores, 123",
      "cep": "01234567",
      "cidade": "São Paulo",
      "estado": "SP",
      "tipo_moradia": "CASA",
      "tem_experiencia": true,
      "tem_outros_pets": false,
      "tem_quintal": true
    }
  }' | jq
```

### **Queries SQL úteis:**
```sql
-- Ver todos os animais disponíveis
SELECT id, nome, especie, porte, status 
FROM animais 
WHERE status = 'DISPONIVEL';

-- Ver adoções pendentes
SELECT 
  a.id,
  an.nome as animal_nome,
  t.nome as tutor_nome,
  a.status,
  a.data_solicitacao
FROM adocoes a
JOIN animais an ON a.animal_id = an.id
JOIN tutores t ON a.tutor_id = t.id
WHERE a.status IN ('SOLICITADA', 'EM_ANALISE')
ORDER BY a.data_solicitacao DESC;

-- Ver conversas ativas no WhatsApp
SELECT 
  id,
  numero_telefone,
  nome_contato,
  status,
  ultima_mensagem_em
FROM conversas_whatsapp
WHERE status = 'ATIVA'
ORDER BY ultima_mensagem_em DESC;

-- Ver últimas mensagens
SELECT 
  m.id,
  c.numero_telefone,
  m.tipo,
  m.conteudo,
  m.origem,
  m.created_at
FROM mensagens_whatsapp m
JOIN conversas_whatsapp c ON m.conversa_id = c.id
ORDER BY m.created_at DESC
LIMIT 20;

-- Ver logs de auditoria
SELECT 
  tabela,
  operacao,
  user_id,
  user_role,
  created_at
FROM logs_auditoria
ORDER BY created_at DESC
LIMIT 50;

-- Estatísticas de adoções
SELECT 
  status,
  COUNT(*) as total
FROM adocoes
GROUP BY status;

-- Animais por município
SELECT 
  m.nome as municipio,
  COUNT(a.id) as total_animais,
  SUM(CASE WHEN a.status = 'DISPONIVEL' THEN 1 ELSE 0 END) as disponiveis,
  SUM(CASE WHEN a.status = 'ADOTADO' THEN 1 ELSE 0 END) as adotados
FROM animais a
JOIN municipios m ON a.municipality_id = m.id
GROUP BY m.nome;
```

---

## 🔍 **DEBUGGING**

### **Ver logs do Supabase:**
```bash
# Edge Functions
supabase functions logs search-animals --tail

# Database
supabase db logs --tail
```

### **Ver logs do N8N:**
```bash
# Docker
docker logs -f n8n

# Ou no dashboard
# http://localhost:5678 → Executions
```

### **Ver logs do Next.js:**
```bash
# Terminal onde está rodando npm run dev
# Ou
tail -f .next/trace
```

### **Conectar ao PostgreSQL:**
```bash
# Via psql
psql "postgresql://postgres:[PASSWORD]@db.xptonqqagxcpzlgndilj.supabase.co:5432/postgres"

# Ou via Supabase CLI
supabase db shell
```

---

## 🚀 **DEPLOY**

### **Supabase:**
```bash
# Deploy Edge Functions
supabase functions deploy --no-verify-jwt

# Deploy migrations
supabase db push
```

### **Vercel (Next.js):**
```bash
# Instalar CLI
npm i -g vercel

# Deploy
vercel

# Deploy produção
vercel --prod

# Ver logs
vercel logs
```

### **N8N (Docker):**
```bash
# Build e push
docker build -t seu-registry/n8n:latest .
docker push seu-registry/n8n:latest

# Deploy no servidor
ssh user@server
docker pull seu-registry/n8n:latest
docker-compose up -d
```

---

## 🔐 **SEGURANÇA**

### **Rotacionar keys:**
```bash
# Gerar nova service role key no Supabase Dashboard
# Settings → API → Generate new service_role key

# Atualizar .env.local
sed -i 's/SUPABASE_SERVICE_ROLE_KEY=.*/SUPABASE_SERVICE_ROLE_KEY=nova_key/' .env.local

# Atualizar N8N
# Settings → Environment Variables → SUPABASE_SERVICE_ROLE_KEY
```

### **Backup:**
```bash
# Backup completo
supabase db dump > backup_$(date +%Y%m%d).sql

# Backup apenas schema
supabase db dump --schema public > schema_$(date +%Y%m%d).sql

# Backup apenas data
supabase db dump --data-only > data_$(date +%Y%m%d).sql

# Restore
psql "postgresql://..." < backup_20250110.sql
```

---

## 📊 **MONITORAMENTO**

### **Métricas do Supabase:**
```bash
# Dashboard → Reports
# - Database size
# - API requests
# - Edge Function invocations
# - Storage usage
```

### **Métricas do N8N:**
```bash
# Dashboard → Executions
# - Success rate
# - Execution time
# - Error rate
```

### **Métricas do Next.js:**
```bash
# Vercel Dashboard → Analytics
# - Page views
# - Response time
# - Error rate
```

---

## 🛠️ **UTILITÁRIOS**

### **Limpar cache:**
```bash
# Next.js
rm -rf .next

# Node modules
rm -rf node_modules
npm install

# Supabase local
supabase stop
rm -rf .supabase
supabase start
```

### **Formatar código:**
```bash
# Prettier
npx prettier --write .

# ESLint
npx eslint --fix .
```

### **Gerar tipos TypeScript do Supabase:**
```bash
supabase gen types typescript --local > types/supabase.ts
```

---

## 📝 **ALIASES ÚTEIS**

Adicione ao seu `.bashrc` ou `.zshrc`:

```bash
# Supabase
alias sb='supabase'
alias sbl='supabase db shell'
alias sbp='supabase db push'
alias sbf='supabase functions'

# N8N
alias n8n-start='docker-compose up -d'
alias n8n-stop='docker-compose down'
alias n8n-logs='docker-compose logs -f'

# Next.js
alias dev='npm run dev'
alias build='npm run build'
alias test='npm run test'

# Git
alias gs='git status'
alias ga='git add'
alias gc='git commit -m'
alias gp='git push'
```

---

## 🆘 **TROUBLESHOOTING RÁPIDO**

### **Edge Function retorna 401:**
```bash
# Verificar key
echo $SUPABASE_SERVICE_ROLE_KEY

# Testar com curl
curl -H "Authorization: Bearer $SUPABASE_SERVICE_ROLE_KEY" \
  https://xptonqqagxcpzlgndilj.supabase.co/functions/v1/search-animals
```

### **N8N não conecta ao Supabase:**
```bash
# Verificar variáveis
docker exec n8n env | grep SUPABASE

# Testar conectividade
docker exec n8n curl https://xptonqqagxcpzlgndilj.supabase.co
```

### **Next.js não conecta ao Supabase:**
```bash
# Verificar .env.local
cat .env.local | grep NEXT_PUBLIC_SUPABASE

# Limpar cache
rm -rf .next
npm run dev
```

---

**Salve este arquivo para referência rápida!** 📌

