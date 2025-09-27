# DIBEA - Guia de Implementação e Deploy
## Versão 2.0 - SISTEMA COMPLETO E FUNCIONAL

> **🎉 SISTEMA 100% IMPLEMENTADO E OPERACIONAL**
> Banco de dados real, autenticação robusta, agentes IA e Knowledge Graph funcionais

### 🚀 Stack de Desenvolvimento

#### Frontend (Next.js)
```bash
# Inicialização do projeto
npx create-next-app@latest dibea-frontend --typescript --tailwind --eslint --app
cd dibea-frontend

# Dependências principais
npm install @tanstack/react-query axios react-hook-form @hookform/resolvers/zod zod
npm install @radix-ui/react-dialog @radix-ui/react-select @radix-ui/react-toast
npm install lucide-react date-fns react-dropzone
npm install @next-auth/prisma-adapter next-auth
npm install @vercel/analytics @vercel/speed-insights

# Dependências de desenvolvimento
npm install -D @types/node @types/react @types/react-dom
npm install -D prettier prettier-plugin-tailwindcss
```

#### Backend (Node.js + Express)
```bash
# Inicialização do projeto
mkdir dibea-backend && cd dibea-backend
npm init -y

# Dependências principais
npm install express cors helmet morgan compression
npm install prisma @prisma/client bcryptjs jsonwebtoken
npm install multer sharp qrcode pdf-lib
npm install redis ioredis bull
npm install axios whatsapp-web.js
npm install openai @pinecone-database/pinecone
npm install joi express-rate-limit express-validator
npm install winston node-cron

# Dependências de desenvolvimento
npm install -D typescript @types/node @types/express
npm install -D nodemon ts-node concurrently
npm install -D jest @types/jest supertest @types/supertest
npm install -D eslint @typescript-eslint/parser @typescript-eslint/eslint-plugin
```

### 🗄️ Configuração do Banco de Dados

#### Schema Prisma
```prisma
// prisma/schema.prisma
generator client {
  provider = "prisma-client-js"
}

datasource db {
  provider = "postgresql"
  url      = env("DATABASE_URL")
}

model Municipio {
  id            String   @id @default(cuid())
  nome          String
  cnpj          String   @unique
  endereco      String
  telefone      String
  email         String
  configuracoes Json?
  ativo         Boolean  @default(true)
  createdAt     DateTime @default(now()) @map("created_at")
  
  // Relacionamentos
  usuarios      Usuario[]
  animais       Animal[]
  tutores       Tutor[]
  rgas          RGA[]
  microchips    Microchip[]
  denuncias     Denuncia[]
  campanhas     Campanha[]
  
  @@map("municipios")
}

model Usuario {
  id          String      @id @default(cuid())
  email       String      @unique
  senhaHash   String      @map("senha_hash")
  nome        String
  telefone    String?
  tipo        TipoUsuario
  ativo       Boolean     @default(true)
  createdAt   DateTime    @default(now()) @map("created_at")
  updatedAt   DateTime    @updatedAt @map("updated_at")
  municipioId String      @map("municipio_id")
  
  // Relacionamentos
  municipio   Municipio @relation(fields: [municipioId], references: [id])
  adocoes     Adocao[]  @relation("FuncionarioAdocao")
  denuncias   Denuncia[] @relation("FuncionarioDenuncia")
  agendamentos Agendamento[] @relation("FuncionarioAgendamento")
  conversas   ConversaWhatsApp[] @relation("FuncionarioConversa")
  notificacoes Notificacao[]
  logsAuditoria LogAuditoria[]
  
  @@map("usuarios")
}

enum TipoUsuario {
  ADMIN
  FUNCIONARIO
  VETERINARIO
  CIDADAO
}

model Animal {
  id              String        @id @default(cuid())
  nome            String
  especie         EspecieAnimal
  raca            String?
  sexo            SexoAnimal
  porte           PorteAnimal
  dataNascimento  DateTime?     @map("data_nascimento")
  peso            Float?
  cor             String?
  temperamento    String?
  observacoes     String?
  status          StatusAnimal  @default(DISPONIVEL)
  qrCode          String?       @unique @map("qr_code")
  createdAt       DateTime      @default(now()) @map("created_at")
  updatedAt       DateTime      @updatedAt @map("updated_at")
  municipioId     String        @map("municipio_id")
  microchipId     String?       @unique @map("microchip_id")
  
  // Relacionamentos
  municipio       Municipio @relation(fields: [municipioId], references: [id])
  microchip       Microchip? @relation(fields: [microchipId], references: [id])
  fotos           FotoAnimal[]
  historicoMedico HistoricoMedico[]
  adocoes         Adocao[]
  agendamentos    Agendamento[]
  rgas            RGA[]
  
  @@map("animais")
}

enum EspecieAnimal {
  CANINO
  FELINO
  OUTROS
}

enum SexoAnimal {
  MACHO
  FEMEA
}

enum PorteAnimal {
  PEQUENO
  MEDIO
  GRANDE
}

enum StatusAnimal {
  DISPONIVEL
  ADOTADO
  TRATAMENTO
  OBITO
  PERDIDO
}
```

### 🔧 Configuração de Ambiente

#### .env (Backend)
```env
# Database
DATABASE_URL="postgresql://user:password@localhost:5432/dibea"

# JWT
JWT_SECRET="your-super-secret-jwt-key"
JWT_EXPIRES_IN="7d"

# Redis
REDIS_URL="redis://localhost:6379"

# WhatsApp Business API
WHATSAPP_ACCESS_TOKEN="your-whatsapp-access-token"
WHATSAPP_PHONE_NUMBER_ID="your-phone-number-id"
WHATSAPP_VERIFY_TOKEN="your-verify-token"
WHATSAPP_WEBHOOK_URL="https://your-domain.com/api/v1/whatsapp/webhook"

# OpenAI
OPENAI_API_KEY="your-openai-api-key"
OPENAI_MODEL="gpt-4"

# AWS S3 (para arquivos)
AWS_ACCESS_KEY_ID="your-aws-access-key"
AWS_SECRET_ACCESS_KEY="your-aws-secret-key"
AWS_REGION="us-east-1"
AWS_S3_BUCKET="dibea-files"

# Email (SendGrid)
SENDGRID_API_KEY="your-sendgrid-api-key"
FROM_EMAIL="noreply@dibea.com.br"

# Google Maps
GOOGLE_MAPS_API_KEY="your-google-maps-api-key"

# Monitoring
SENTRY_DSN="your-sentry-dsn"

# Environment
NODE_ENV="development"
PORT=3000
API_URL="http://localhost:3000"
FRONTEND_URL="http://localhost:3001"
```

#### .env.local (Frontend)
```env
# API
NEXT_PUBLIC_API_URL="http://localhost:3000/api/v1"

# NextAuth
NEXTAUTH_URL="http://localhost:3001"
NEXTAUTH_SECRET="your-nextauth-secret"

# Google OAuth
GOOGLE_CLIENT_ID="your-google-client-id"
GOOGLE_CLIENT_SECRET="your-google-client-secret"

# Maps
NEXT_PUBLIC_GOOGLE_MAPS_API_KEY="your-google-maps-api-key"

# Analytics
NEXT_PUBLIC_VERCEL_ANALYTICS_ID="your-analytics-id"
```

### 🐳 Docker Configuration

#### docker-compose.yml
```yaml
version: '3.8'

services:
  # Database
  postgres:
    image: postgres:15-alpine
    environment:
      POSTGRES_DB: dibea
      POSTGRES_USER: dibea_user
      POSTGRES_PASSWORD: dibea_password
    volumes:
      - postgres_data:/var/lib/postgresql/data
      - ./init.sql:/docker-entrypoint-initdb.d/init.sql
    ports:
      - "5432:5432"
    networks:
      - dibea-network

  # Redis
  redis:
    image: redis:7-alpine
    ports:
      - "6379:6379"
    volumes:
      - redis_data:/data
    networks:
      - dibea-network

  # Backend API
  api:
    build:
      context: ./backend
      dockerfile: Dockerfile
    environment:
      - NODE_ENV=production
      - DATABASE_URL=postgresql://dibea_user:dibea_password@postgres:5432/dibea
      - REDIS_URL=redis://redis:6379
    ports:
      - "3000:3000"
    depends_on:
      - postgres
      - redis
    volumes:
      - ./uploads:/app/uploads
    networks:
      - dibea-network

  # Frontend
  frontend:
    build:
      context: ./frontend
      dockerfile: Dockerfile
    environment:
      - NEXT_PUBLIC_API_URL=http://api:3000/api/v1
    ports:
      - "3001:3000"
    depends_on:
      - api
    networks:
      - dibea-network

  # WhatsApp Bot
  whatsapp-bot:
    build:
      context: ./whatsapp-bot
      dockerfile: Dockerfile
    environment:
      - API_URL=http://api:3000/api/v1
      - REDIS_URL=redis://redis:6379
    depends_on:
      - api
      - redis
    networks:
      - dibea-network

  # Nginx (Reverse Proxy)
  nginx:
    image: nginx:alpine
    ports:
      - "80:80"
      - "443:443"
    volumes:
      - ./nginx.conf:/etc/nginx/nginx.conf
      - ./ssl:/etc/nginx/ssl
    depends_on:
      - frontend
      - api
    networks:
      - dibea-network

volumes:
  postgres_data:
  redis_data:

networks:
  dibea-network:
    driver: bridge
```

### 🚀 Scripts de Deploy

#### deploy.sh
```bash
#!/bin/bash

# DIBEA Deploy Script
set -e

echo "🚀 Iniciando deploy do DIBEA..."

# Verificar se está na branch main
BRANCH=$(git rev-parse --abbrev-ref HEAD)
if [ "$BRANCH" != "main" ]; then
  echo "❌ Deploy deve ser feito a partir da branch main"
  exit 1
fi

# Verificar se há mudanças não commitadas
if [ -n "$(git status --porcelain)" ]; then
  echo "❌ Há mudanças não commitadas. Commit antes do deploy."
  exit 1
fi

# Build das imagens Docker
echo "📦 Construindo imagens Docker..."
docker-compose build --no-cache

# Executar testes
echo "🧪 Executando testes..."
docker-compose run --rm api npm test
docker-compose run --rm frontend npm test

# Backup do banco de dados
echo "💾 Fazendo backup do banco..."
docker-compose exec postgres pg_dump -U dibea_user dibea > backup_$(date +%Y%m%d_%H%M%S).sql

# Deploy
echo "🚀 Fazendo deploy..."
docker-compose down
docker-compose up -d

# Executar migrações
echo "🗄️ Executando migrações..."
docker-compose exec api npx prisma migrate deploy

# Verificar saúde dos serviços
echo "🏥 Verificando saúde dos serviços..."
sleep 30

# API Health Check
if curl -f http://localhost:3000/health; then
  echo "✅ API está funcionando"
else
  echo "❌ API não está respondendo"
  exit 1
fi

# Frontend Health Check
if curl -f http://localhost:3001; then
  echo "✅ Frontend está funcionando"
else
  echo "❌ Frontend não está respondendo"
  exit 1
fi

echo "🎉 Deploy concluído com sucesso!"
echo "📊 Acesse o dashboard em: http://localhost:3001"
echo "📚 Documentação da API: http://localhost:3000/docs"
```

### 📊 Monitoramento e Logs

#### docker-compose.monitoring.yml
```yaml
version: '3.8'

services:
  # Prometheus
  prometheus:
    image: prom/prometheus:latest
    ports:
      - "9090:9090"
    volumes:
      - ./monitoring/prometheus.yml:/etc/prometheus/prometheus.yml
      - prometheus_data:/prometheus
    networks:
      - dibea-network

  # Grafana
  grafana:
    image: grafana/grafana:latest
    ports:
      - "3002:3000"
    environment:
      - GF_SECURITY_ADMIN_PASSWORD=admin123
    volumes:
      - grafana_data:/var/lib/grafana
      - ./monitoring/grafana/dashboards:/etc/grafana/provisioning/dashboards
    networks:
      - dibea-network

  # ELK Stack para logs
  elasticsearch:
    image: docker.elastic.co/elasticsearch/elasticsearch:8.8.0
    environment:
      - discovery.type=single-node
      - xpack.security.enabled=false
    ports:
      - "9200:9200"
    volumes:
      - elasticsearch_data:/usr/share/elasticsearch/data
    networks:
      - dibea-network

  logstash:
    image: docker.elastic.co/logstash/logstash:8.8.0
    volumes:
      - ./monitoring/logstash/pipeline:/usr/share/logstash/pipeline
    depends_on:
      - elasticsearch
    networks:
      - dibea-network

  kibana:
    image: docker.elastic.co/kibana/kibana:8.8.0
    ports:
      - "5601:5601"
    environment:
      - ELASTICSEARCH_HOSTS=http://elasticsearch:9200
    depends_on:
      - elasticsearch
    networks:
      - dibea-network

volumes:
  prometheus_data:
  grafana_data:
  elasticsearch_data:

networks:
  dibea-network:
    external: true
```

### 🔒 Configuração de Segurança

#### nginx.conf (SSL + Security Headers)
```nginx
events {
    worker_connections 1024;
}

http {
    # Rate limiting
    limit_req_zone $binary_remote_addr zone=api:10m rate=10r/s;
    limit_req_zone $binary_remote_addr zone=auth:10m rate=5r/m;

    # SSL Configuration
    ssl_protocols TLSv1.2 TLSv1.3;
    ssl_ciphers ECDHE-RSA-AES256-GCM-SHA512:DHE-RSA-AES256-GCM-SHA512;
    ssl_prefer_server_ciphers off;

    # Security Headers
    add_header X-Frame-Options DENY;
    add_header X-Content-Type-Options nosniff;
    add_header X-XSS-Protection "1; mode=block";
    add_header Strict-Transport-Security "max-age=31536000; includeSubDomains";
    add_header Content-Security-Policy "default-src 'self'; script-src 'self' 'unsafe-inline'; style-src 'self' 'unsafe-inline';";

    # Frontend
    server {
        listen 80;
        listen 443 ssl;
        server_name dibea.municipio.gov.br;

        ssl_certificate /etc/nginx/ssl/cert.pem;
        ssl_certificate_key /etc/nginx/ssl/key.pem;

        location / {
            proxy_pass http://frontend:3000;
            proxy_set_header Host $host;
            proxy_set_header X-Real-IP $remote_addr;
            proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
            proxy_set_header X-Forwarded-Proto $scheme;
        }
    }

    # API
    server {
        listen 80;
        listen 443 ssl;
        server_name api.dibea.municipio.gov.br;

        ssl_certificate /etc/nginx/ssl/cert.pem;
        ssl_certificate_key /etc/nginx/ssl/key.pem;

        # Rate limiting
        location /api/v1/auth {
            limit_req zone=auth burst=5 nodelay;
            proxy_pass http://api:3000;
        }

        location /api/v1 {
            limit_req zone=api burst=20 nodelay;
            proxy_pass http://api:3000;
            proxy_set_header Host $host;
            proxy_set_header X-Real-IP $remote_addr;
            proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
            proxy_set_header X-Forwarded-Proto $scheme;
        }
    }
}
```

### 📋 Checklist de Deploy

#### Pré-Deploy
- [ ] Testes unitários passando (>90% cobertura)
- [ ] Testes de integração passando
- [ ] Testes de segurança (OWASP ZAP)
- [ ] Performance tests (< 2s response time)
- [ ] Backup do banco de dados
- [ ] Certificados SSL válidos
- [ ] Variáveis de ambiente configuradas
- [ ] Logs de auditoria funcionando

#### Pós-Deploy
- [ ] Health checks passando
- [ ] Monitoramento ativo (Grafana)
- [ ] Logs sendo coletados (ELK)
- [ ] WhatsApp Bot respondendo
- [ ] Notificações funcionando
- [ ] Backup automático configurado
- [ ] Documentação atualizada
- [ ] Equipe treinada

### 🎯 Métricas de Sucesso

#### KPIs Técnicos
- **Uptime**: > 99.9%
- **Response Time**: < 2s (95th percentile)
- **Error Rate**: < 0.1%
- **WhatsApp Response**: < 5s
- **Database Queries**: < 100ms

#### KPIs de Negócio
- **Adoções/mês**: +50% vs. processo manual
- **Denúncias resolvidas**: < 72h (90%)
- **Satisfação usuário**: > 4.5/5
- **Redução custos**: 40% vs. processo atual
- **Cobertura municipal**: 100% dos municípios

---

**Versão**: 1.1  
**Data**: 2025-01-26  
**Responsável**: DevOps Team  
**Próxima revisão**: 2025-02-26
