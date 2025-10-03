# 🗄️ DIBEA - Referência Completa do Supabase

**Versão:** 1.0  
**Data:** Janeiro 2025  
**Tipo:** Documentação Técnica - Banco de Dados

---

## 📊 INFORMAÇÕES DO PROJETO SUPABASE

### Projeto Ativo: **dibea**

```yaml
Project ID: xptonqqagxcpzlgndilj
Organization ID: dacvlmxyzwwgafrhwtue
Region: us-east-2 (Ohio)
Status: ACTIVE_HEALTHY
Database Version: PostgreSQL 17.6.1.008
Created: 2025-09-28
```

### URLs de Conexão:

```bash
# API URL
https://xptonqqagxcpzlgndilj.supabase.co

# Database Host
db.xptonqqagxcpzlgndilj.supabase.co

# Database Connection String
postgresql://postgres:[PASSWORD]@db.xptonqqagxcpzlgndilj.supabase.co:5432/postgres
```

---

## 🔐 CREDENCIAIS E AUTENTICAÇÃO

### Variáveis de Ambiente Necessárias:

```bash
# .env.local (Frontend)
NEXT_PUBLIC_SUPABASE_URL=https://xptonqqagxcpzlgndilj.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=[ANON_KEY]

# .env (Backend)
SUPABASE_URL=https://xptonqqagxcpzlgndilj.supabase.co
SUPABASE_ANON_KEY=[ANON_KEY]
SUPABASE_SERVICE_ROLE_KEY=[SERVICE_ROLE_KEY]

# Database Direct Connection
DATABASE_URL=postgresql://postgres:[PASSWORD]@db.xptonqqagxcpzlgndilj.supabase.co:5432/postgres
```

### Como Obter as Keys:

1. **Acesse:** https://app.supabase.com/project/xptonqqagxcpzlgndilj/settings/api
2. **Anon Key (pública):** Usada no frontend, respeita RLS
3. **Service Role Key (privada):** Usada no backend, bypassa RLS
4. **Database Password:** Settings > Database > Connection String

---

## 🗄️ SCHEMA DO BANCO DE DADOS

### Migrations Aplicadas:

```
✅ 001_initial_schema.sql       - Tabelas base e ENUMs
✅ 002_medical_and_campaigns.sql - Histórico médico e campanhas
✅ 003_notifications_and_whatsapp.sql - Notificações e WhatsApp
✅ 004_triggers_and_functions.sql - Triggers e funções
✅ 005_rls_policies.sql         - Row Level Security
✅ 006_seed_data.sql            - Dados de teste
```

### Tabelas Principais (17 tabelas):

#### 1. **municipios** (Municípios)
```sql
CREATE TABLE municipios (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    nome VARCHAR(255) NOT NULL,
    cnpj VARCHAR(18) UNIQUE NOT NULL,
    endereco TEXT,
    telefone VARCHAR(20),
    email VARCHAR(255),
    configuracoes JSONB DEFAULT '{}',
    ativo BOOLEAN DEFAULT true,
    created_at TIMESTAMP DEFAULT NOW()
);
```

**Dados de Teste:**
- São Paulo (ID: `0b227971-5134-4992-b83c-b4f35cabb1c0`)

---

#### 2. **users** (Usuários)
```sql
CREATE TABLE users (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    email VARCHAR(255) UNIQUE,
    phone VARCHAR(20) UNIQUE,
    password_hash VARCHAR(255),
    role user_role NOT NULL DEFAULT 'CIDADAO',
    tutor_profile_id UUID,
    whatsapp_id VARCHAR(100),
    whatsapp_verified BOOLEAN DEFAULT false,
    municipality_id UUID REFERENCES municipios(id),
    active BOOLEAN DEFAULT true,
    last_login TIMESTAMP,
    created_at TIMESTAMP DEFAULT NOW(),
    updated_at TIMESTAMP DEFAULT NOW()
);
```

**Roles Disponíveis:**
```sql
CREATE TYPE user_role AS ENUM (
    'CIDADAO',      -- Usuário comum (não autenticado via WhatsApp)
    'TUTOR',        -- Cidadão que já adotou
    'FUNCIONARIO',  -- Staff municipal
    'VETERINARIO',  -- Veterinário
    'ADMIN',        -- Admin municipal
    'SUPER_ADMIN'   -- Admin da plataforma
);
```

**Usuários de Teste:**
```sql
-- SUPER ADMIN
Email: superadmin@dibea.com.br
ID: 11111111-1111-1111-1111-111111111111

-- ADMIN Municipal (São Paulo)
Email: admin@sp.dibea.com.br
ID: 22222222-2222-2222-2222-222222222222

-- VETERINÁRIO
Email: veterinario@sp.dibea.com.br
ID: 33333333-3333-3333-3333-333333333333

-- FUNCIONÁRIO
Email: funcionario@sp.dibea.com.br
ID: 44444444-4444-4444-4444-444444444444

-- TUTOR 1
Email: joao.silva@email.com
Phone: +5511999999999
ID: 55555555-5555-5555-5555-555555555555

-- TUTOR 2
Email: maria.santos@email.com
Phone: +5511988888888
ID: 66666666-6666-6666-6666-666666666666
```

---

#### 3. **tutores** (Perfil de Tutores)
```sql
CREATE TABLE tutores (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    user_id UUID UNIQUE REFERENCES users(id) ON DELETE CASCADE,
    cpf VARCHAR(14) UNIQUE NOT NULL,
    rg VARCHAR(20),
    nome VARCHAR(255) NOT NULL,
    email VARCHAR(255),
    telefone VARCHAR(20),
    endereco_completo TEXT,
    cep VARCHAR(10),
    cidade VARCHAR(100),
    estado VARCHAR(2),
    tipo_moradia VARCHAR(50),
    tem_experiencia BOOLEAN DEFAULT false,
    tem_outros_pets BOOLEAN DEFAULT false,
    tem_quintal BOOLEAN DEFAULT false,
    cpf_verified BOOLEAN DEFAULT false,
    background_check_status VARCHAR(50) DEFAULT 'PENDING',
    status VARCHAR(50) DEFAULT 'ATIVO',
    municipality_id UUID REFERENCES municipios(id),
    observacoes TEXT,
    created_at TIMESTAMP DEFAULT NOW(),
    updated_at TIMESTAMP DEFAULT NOW()
);
```

---

#### 4. **animais** (Animais)
```sql
CREATE TABLE animais (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    nome VARCHAR(255) NOT NULL,
    especie animal_species NOT NULL,
    raca VARCHAR(100),
    sexo animal_sex NOT NULL,
    porte animal_size,
    data_nascimento DATE,
    peso DECIMAL(5,2),
    cor VARCHAR(100),
    temperamento TEXT,
    observacoes TEXT,
    status animal_status DEFAULT 'DISPONIVEL',
    data_resgate DATE,
    local_resgate TEXT,
    qr_code VARCHAR(100) UNIQUE,
    municipality_id UUID REFERENCES municipios(id),
    microchip_id UUID,
    created_at TIMESTAMP DEFAULT NOW(),
    updated_at TIMESTAMP DEFAULT NOW()
);
```

**Enums de Animais:**
```sql
CREATE TYPE animal_species AS ENUM ('CANINO', 'FELINO', 'OUTROS');
CREATE TYPE animal_sex AS ENUM ('MACHO', 'FEMEA');
CREATE TYPE animal_size AS ENUM ('PEQUENO', 'MEDIO', 'GRANDE');
CREATE TYPE animal_status AS ENUM (
    'DISPONIVEL',
    'ADOTADO',
    'EM_TRATAMENTO',
    'OBITO',
    'PERDIDO'
);
```

**Animais de Teste:**
- Rex (Labrador, Macho, Grande)
- Luna (SRD, Fêmea, Médio)
- Mia (Siamês, Fêmea, Pequeno)

---

#### 5. **fotos_animal** (Fotos dos Animais)
```sql
CREATE TABLE fotos_animal (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    animal_id UUID REFERENCES animais(id) ON DELETE CASCADE,
    url TEXT NOT NULL,
    descricao TEXT,
    ordem INTEGER DEFAULT 0,
    principal BOOLEAN DEFAULT false,
    created_at TIMESTAMP DEFAULT NOW()
);
```

---

#### 6. **adocoes** (Adoções)
```sql
CREATE TABLE adocoes (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    animal_id UUID REFERENCES animais(id),
    tutor_id UUID REFERENCES tutores(id),
    status adoption_status DEFAULT 'SOLICITADA',
    data_solicitacao TIMESTAMP DEFAULT NOW(),
    data_aprovacao TIMESTAMP,
    data_conclusao TIMESTAMP,
    observacoes TEXT,
    motivo_rejeicao TEXT,
    termo_assinado BOOLEAN DEFAULT false,
    termo_url TEXT,
    created_at TIMESTAMP DEFAULT NOW(),
    updated_at TIMESTAMP DEFAULT NOW()
);
```

**Status de Adoção:**
```sql
CREATE TYPE adoption_status AS ENUM (
    'SOLICITADA',   -- Tutor solicitou
    'EM_ANALISE',   -- Em análise pela equipe
    'APROVADA',     -- Aprovada, aguardando conclusão
    'REJEITADA',    -- Rejeitada
    'CONCLUIDA',    -- Animal entregue ao tutor
    'CANCELADA'     -- Cancelada
);
```

---

#### 7. **notificacoes** (Notificações)
```sql
CREATE TABLE notificacoes (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    user_id UUID REFERENCES users(id),
    tipo notification_type NOT NULL,
    prioridade notification_priority DEFAULT 'MEDIA',
    titulo VARCHAR(255) NOT NULL,
    mensagem TEXT NOT NULL,
    lida BOOLEAN DEFAULT false,
    data_leitura TIMESTAMP,
    link TEXT,
    metadata JSONB DEFAULT '{}',
    created_at TIMESTAMP DEFAULT NOW()
);
```

**Tipos de Notificação:**
```sql
CREATE TYPE notification_type AS ENUM (
    'EMAIL',
    'SMS',
    'WHATSAPP',
    'PUSH'
);

CREATE TYPE notification_priority AS ENUM (
    'BAIXA',
    'MEDIA',
    'ALTA',
    'URGENTE'
);
```

---

#### 8. **agendamentos** (Agendamentos)
```sql
CREATE TABLE agendamentos (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    animal_id UUID REFERENCES animais(id),
    tutor_id UUID REFERENCES tutores(id),
    tipo VARCHAR(100) NOT NULL,
    data_hora TIMESTAMP NOT NULL,
    status appointment_status DEFAULT 'AGENDADO',
    observacoes TEXT,
    veterinario_id UUID REFERENCES users(id),
    created_at TIMESTAMP DEFAULT NOW(),
    updated_at TIMESTAMP DEFAULT NOW()
);
```

---

#### 9. **campanhas** (Campanhas de Vacinação/Castração)
```sql
CREATE TABLE campanhas (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    nome VARCHAR(255) NOT NULL,
    descricao TEXT,
    tipo VARCHAR(100) NOT NULL,
    data_inicio DATE NOT NULL,
    data_fim DATE NOT NULL,
    status campaign_status DEFAULT 'PLANEJADA',
    vagas_totais INTEGER,
    vagas_disponiveis INTEGER,
    municipality_id UUID REFERENCES municipios(id),
    created_at TIMESTAMP DEFAULT NOW(),
    updated_at TIMESTAMP DEFAULT NOW()
);
```

---

#### 10. **conversas_whatsapp** (Conversas WhatsApp)
```sql
CREATE TABLE conversas_whatsapp (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    whatsapp_id VARCHAR(100) UNIQUE NOT NULL,
    user_id UUID REFERENCES users(id),
    nome VARCHAR(255),
    telefone VARCHAR(20),
    ultima_mensagem TEXT,
    ultima_interacao TIMESTAMP,
    contexto JSONB DEFAULT '{}',
    ativa BOOLEAN DEFAULT true,
    created_at TIMESTAMP DEFAULT NOW()
);
```

---

## 🔒 ROW LEVEL SECURITY (RLS)

### Políticas Implementadas:

#### Municípios:
```sql
-- Todos podem ver municípios ativos
CREATE POLICY "Municípios são públicos"
ON municipios FOR SELECT
USING (ativo = true);

-- Apenas SUPER_ADMIN pode modificar
CREATE POLICY "Apenas SUPER_ADMIN pode modificar municípios"
ON municipios FOR ALL
USING (get_user_role() = 'SUPER_ADMIN');
```

#### Users:
```sql
-- Usuário pode ver seu próprio perfil
CREATE POLICY "Usuário pode ver próprio perfil"
ON users FOR SELECT
USING (id = auth.uid());

-- Staff pode ver usuários do mesmo município
CREATE POLICY "Staff pode ver usuários do município"
ON users FOR SELECT
USING (
    get_user_role() IN ('FUNCIONARIO', 'VETERINARIO', 'ADMIN') 
    AND municipality_id = get_user_municipality()
);
```

#### Animais:
```sql
-- Todos podem ver animais disponíveis
CREATE POLICY "Animais disponíveis são públicos"
ON animais FOR SELECT
USING (status = 'DISPONIVEL');

-- Staff pode ver todos os animais do município
CREATE POLICY "Staff pode ver animais do município"
ON animais FOR SELECT
USING (
    get_user_role() IN ('FUNCIONARIO', 'VETERINARIO', 'ADMIN')
    AND municipality_id = get_user_municipality()
);

-- Tutor pode ver seus animais adotados
CREATE POLICY "Tutor pode ver seus animais"
ON animais FOR SELECT
USING (is_tutor_of_animal(id));
```

#### Adoções:
```sql
-- Tutor pode ver suas próprias adoções
CREATE POLICY "Tutor pode ver suas adoções"
ON adocoes FOR SELECT
USING (
    tutor_id IN (
        SELECT id FROM tutores WHERE user_id = auth.uid()
    )
);

-- Staff pode ver adoções do município
CREATE POLICY "Staff pode ver adoções do município"
ON adocoes FOR SELECT
USING (
    get_user_role() IN ('FUNCIONARIO', 'VETERINARIO', 'ADMIN')
    AND animal_id IN (
        SELECT id FROM animais WHERE municipality_id = get_user_municipality()
    )
);
```

### Funções Helper:

```sql
-- Obter role do usuário autenticado
CREATE FUNCTION get_user_role() RETURNS user_role AS $$
BEGIN
    RETURN (SELECT role FROM users WHERE id = auth.uid());
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Obter município do usuário
CREATE FUNCTION get_user_municipality() RETURNS UUID AS $$
BEGIN
    RETURN (SELECT municipality_id FROM users WHERE id = auth.uid());
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Verificar se usuário é tutor do animal
CREATE FUNCTION is_tutor_of_animal(animal_uuid UUID) RETURNS BOOLEAN AS $$
BEGIN
    RETURN EXISTS (
        SELECT 1 FROM adocoes a
        JOIN tutores t ON a.tutor_id = t.id
        WHERE a.animal_id = animal_uuid
        AND t.user_id = auth.uid()
        AND a.status = 'CONCLUIDA'
    );
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;
```

---

## 🔧 CONFIGURAÇÃO DO SUPABASE

### config.toml:

```toml
project_id = "xptonqqagxcpzlgndilj"

[api]
enabled = true
port = 54321
schemas = ["public", "storage", "graphql_public"]
max_rows = 1000

[db]
port = 54322
major_version = 17

[auth]
enabled = true
site_url = "http://localhost:3000"
jwt_expiry = 3600
enable_signup = true
```

---

## 📦 STORAGE (Buckets)

### Buckets Configurados:

```bash
# Fotos de animais
animals/
  ├── {animal_id}/
  │   ├── photo1.jpg
  │   ├── photo2.jpg
  │   └── ...

# Documentos de adoção
documents/
  ├── {adoption_id}/
  │   ├── cpf.pdf
  │   ├── comprovante_residencia.pdf
  │   └── ...

# Receitas médicas
prescriptions/
  ├── {prescription_id}.pdf
```

### Políticas de Storage:

```sql
-- Qualquer um pode ver fotos de animais
CREATE POLICY "Fotos de animais são públicas"
ON storage.objects FOR SELECT
USING (bucket_id = 'animals');

-- Apenas staff pode fazer upload
CREATE POLICY "Apenas staff pode fazer upload de fotos"
ON storage.objects FOR INSERT
USING (
    bucket_id = 'animals'
    AND get_user_role() IN ('FUNCIONARIO', 'VETERINARIO', 'ADMIN')
);
```

---

## 🔌 COMO CONECTAR

### Frontend (Next.js):

```typescript
// lib/supabase.ts
import { createClient } from '@supabase/supabase-js';

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!;
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!;

export const supabase = createClient(supabaseUrl, supabaseAnonKey);

// Exemplo de uso
const { data, error } = await supabase
  .from('animais')
  .select('*')
  .eq('status', 'DISPONIVEL');
```

### Backend (Node.js):

```typescript
// services/supabaseService.ts
import { createClient } from '@supabase/supabase-js';

const supabaseUrl = process.env.SUPABASE_URL!;
const serviceRoleKey = process.env.SUPABASE_SERVICE_ROLE_KEY!;

// Client com RLS (para operações normais)
const client = createClient(supabaseUrl, process.env.SUPABASE_ANON_KEY!);

// Admin client (bypassa RLS)
const adminClient = createClient(supabaseUrl, serviceRoleKey);

// Exemplo: Criar animal (bypassa RLS)
const { data, error } = await adminClient
  .from('animais')
  .insert({
    nome: 'Rex',
    especie: 'CANINO',
    sexo: 'MACHO',
    municipality_id: 'uuid-do-municipio'
  });
```

---

## 📝 QUERIES ÚTEIS

### Buscar animais disponíveis:

```sql
SELECT 
  a.*,
  m.nome as municipio_nome,
  COUNT(f.id) as total_fotos
FROM animais a
LEFT JOIN municipios m ON a.municipality_id = m.id
LEFT JOIN fotos_animal f ON a.id = f.animal_id
WHERE a.status = 'DISPONIVEL'
GROUP BY a.id, m.nome
ORDER BY a.created_at DESC;
```

### Listar adoções pendentes:

```sql
SELECT 
  ad.*,
  a.nome as animal_nome,
  t.nome as tutor_nome,
  t.telefone as tutor_telefone
FROM adocoes ad
JOIN animais a ON ad.animal_id = a.id
JOIN tutores t ON ad.tutor_id = t.id
WHERE ad.status = 'SOLICITADA'
ORDER BY ad.created_at ASC;
```

### Estatísticas do município:

```sql
SELECT 
  COUNT(DISTINCT a.id) as total_animais,
  COUNT(DISTINCT CASE WHEN a.status = 'DISPONIVEL' THEN a.id END) as disponiveis,
  COUNT(DISTINCT CASE WHEN a.status = 'ADOTADO' THEN a.id END) as adotados,
  COUNT(DISTINCT ad.id) as total_adocoes,
  COUNT(DISTINCT t.id) as total_tutores
FROM municipios m
LEFT JOIN animais a ON m.id = a.municipality_id
LEFT JOIN adocoes ad ON a.id = ad.animal_id
LEFT JOIN tutores t ON m.id = t.municipality_id
WHERE m.id = 'uuid-do-municipio'
GROUP BY m.id;
```

---

## 🚀 PRÓXIMOS PASSOS

### Para Implementar:

1. **Configurar Storage Buckets**
   ```bash
   supabase storage create animals
   supabase storage create documents
   supabase storage create prescriptions
   ```

2. **Aplicar Migrations**
   ```bash
   supabase db push
   ```

3. **Configurar Autenticação**
   - Habilitar Email/Password
   - Configurar templates de email
   - Configurar OAuth (Google, Facebook)

4. **Configurar Edge Functions**
   ```bash
   supabase functions deploy search-animals
   supabase functions deploy create-adoption
   ```

---

**Última atualização:** Janeiro 2025  
**Próxima revisão:** Após cada migration

