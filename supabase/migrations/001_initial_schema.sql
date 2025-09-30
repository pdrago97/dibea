-- =====================================================
-- DIBEA - Migration 001: Initial Schema
-- Criação de tipos ENUM, tabelas base e relacionamentos
-- =====================================================

-- Habilitar extensões necessárias
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";
CREATE EXTENSION IF NOT EXISTS "pg_trgm"; -- Para busca fuzzy

-- =====================================================
-- TIPOS ENUM
-- =====================================================

CREATE TYPE user_role AS ENUM (
    'CIDADAO',
    'TUTOR', 
    'FUNCIONARIO',
    'VETERINARIO',
    'ADMIN',
    'SUPER_ADMIN'
);

CREATE TYPE animal_species AS ENUM ('CANINO', 'FELINO', 'OUTROS');
CREATE TYPE animal_sex AS ENUM ('MACHO', 'FEMEA');
CREATE TYPE animal_size AS ENUM ('PEQUENO', 'MEDIO', 'GRANDE');
CREATE TYPE animal_status AS ENUM ('DISPONIVEL', 'ADOTADO', 'EM_TRATAMENTO', 'OBITO', 'PERDIDO');

CREATE TYPE adoption_status AS ENUM (
    'SOLICITADA',
    'EM_ANALISE',
    'APROVADA',
    'REJEITADA',
    'CONCLUIDA',
    'CANCELADA'
);

CREATE TYPE appointment_status AS ENUM (
    'AGENDADO',
    'CONFIRMADO',
    'REALIZADO',
    'CANCELADO',
    'FALTOU'
);

CREATE TYPE campaign_status AS ENUM (
    'PLANEJADA',
    'INSCRICOES_ABERTAS',
    'EM_ANDAMENTO',
    'ENCERRADA',
    'CANCELADA'
);

CREATE TYPE complaint_status AS ENUM (
    'ABERTA',
    'EM_ANDAMENTO',
    'RESOLVIDA',
    'ARQUIVADA'
);

CREATE TYPE notification_type AS ENUM ('EMAIL', 'SMS', 'WHATSAPP', 'PUSH');
CREATE TYPE notification_priority AS ENUM ('BAIXA', 'MEDIA', 'ALTA', 'URGENTE');

-- =====================================================
-- TABELA: municipios
-- =====================================================

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

-- =====================================================
-- TABELA: users (autenticação e roles)
-- =====================================================

CREATE TABLE users (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    
    -- Autenticação
    email VARCHAR(255) UNIQUE,
    phone VARCHAR(20) UNIQUE,
    password_hash VARCHAR(255),
    
    -- Role e perfil
    role user_role NOT NULL DEFAULT 'CIDADAO',
    tutor_profile_id UUID, -- FK adicionada depois
    
    -- WhatsApp
    whatsapp_id VARCHAR(100),
    whatsapp_verified BOOLEAN DEFAULT false,
    
    -- Referências
    municipality_id UUID REFERENCES municipios(id),
    
    -- Controle
    active BOOLEAN DEFAULT true,
    last_login TIMESTAMP,
    created_at TIMESTAMP DEFAULT NOW(),
    updated_at TIMESTAMP DEFAULT NOW()
);

-- =====================================================
-- TABELA: tutores (perfil estendido)
-- =====================================================

CREATE TABLE tutores (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    user_id UUID UNIQUE REFERENCES users(id) ON DELETE CASCADE,
    
    -- Dados pessoais
    cpf VARCHAR(14) UNIQUE NOT NULL,
    rg VARCHAR(20),
    nome VARCHAR(255) NOT NULL,
    
    -- Contato
    email VARCHAR(255),
    telefone VARCHAR(20),
    
    -- Endereço
    endereco_completo TEXT,
    cep VARCHAR(10),
    cidade VARCHAR(100),
    estado VARCHAR(2),
    
    -- Perfil
    tipo_moradia VARCHAR(50),
    tem_experiencia BOOLEAN DEFAULT false,
    tem_outros_pets BOOLEAN DEFAULT false,
    tem_quintal BOOLEAN DEFAULT false,
    
    -- Validações
    cpf_verified BOOLEAN DEFAULT false,
    background_check_status VARCHAR(50) DEFAULT 'PENDING',
    
    -- Status
    status VARCHAR(50) DEFAULT 'ATIVO',
    
    -- Referências
    municipality_id UUID REFERENCES municipios(id),
    
    -- Controle
    observacoes TEXT,
    created_at TIMESTAMP DEFAULT NOW(),
    updated_at TIMESTAMP DEFAULT NOW()
);

-- Adicionar FK em users
ALTER TABLE users ADD CONSTRAINT fk_users_tutor_profile 
    FOREIGN KEY (tutor_profile_id) REFERENCES tutores(id);

-- =====================================================
-- TABELA: microchips
-- =====================================================

CREATE TABLE microchips (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    numero VARCHAR(50) UNIQUE NOT NULL,
    data_aplicacao DATE,
    veterinario_responsavel VARCHAR(255),
    local_aplicacao VARCHAR(255),
    status VARCHAR(50) DEFAULT 'ESTOQUE',
    municipality_id UUID REFERENCES municipios(id),
    created_at TIMESTAMP DEFAULT NOW()
);

-- =====================================================
-- TABELA: animais
-- =====================================================

CREATE TABLE animais (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    
    -- Identificação
    nome VARCHAR(255) NOT NULL,
    especie animal_species NOT NULL,
    raca VARCHAR(100),
    sexo animal_sex NOT NULL,
    porte animal_size NOT NULL,
    
    -- Características
    data_nascimento DATE,
    peso DECIMAL(5,2),
    cor VARCHAR(100),
    temperamento TEXT,
    observacoes TEXT,
    
    -- Status
    status animal_status DEFAULT 'DISPONIVEL',
    
    -- QR Code e Microchip
    qr_code VARCHAR(100) UNIQUE,
    microchip_id UUID REFERENCES microchips(id),
    
    -- Referências
    municipality_id UUID NOT NULL REFERENCES municipios(id),
    
    -- Controle
    created_at TIMESTAMP DEFAULT NOW(),
    updated_at TIMESTAMP DEFAULT NOW(),
    
    -- Constraints
    CONSTRAINT chk_animal_peso CHECK (peso > 0 AND peso < 200),
    CONSTRAINT chk_animal_data_nascimento CHECK (data_nascimento <= CURRENT_DATE)
);

-- =====================================================
-- TABELA: fotos_animal
-- =====================================================

CREATE TABLE fotos_animal (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    animal_id UUID NOT NULL REFERENCES animais(id) ON DELETE CASCADE,
    url TEXT NOT NULL,
    nome_arquivo VARCHAR(255),
    ordem INTEGER DEFAULT 0,
    principal BOOLEAN DEFAULT false,
    created_at TIMESTAMP DEFAULT NOW()
);

-- =====================================================
-- TABELA: adocoes
-- =====================================================

CREATE TABLE adocoes (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    
    -- Relacionamentos
    animal_id UUID NOT NULL REFERENCES animais(id),
    tutor_id UUID NOT NULL REFERENCES tutores(id),
    funcionario_id UUID REFERENCES users(id),
    
    -- Datas
    data_solicitacao DATE DEFAULT CURRENT_DATE,
    data_aprovacao DATE,
    data_entrega DATE,
    
    -- Informações
    motivo_interesse TEXT,
    observacoes_entrevista TEXT,
    motivo_rejeicao TEXT,
    
    -- Status
    status adoption_status DEFAULT 'SOLICITADA',
    
    -- Controle
    created_at TIMESTAMP DEFAULT NOW(),
    updated_at TIMESTAMP DEFAULT NOW()
);

-- =====================================================
-- TABELA: clinicas (parceiras)
-- =====================================================

CREATE TABLE clinicas (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    nome VARCHAR(255) NOT NULL,
    cnpj VARCHAR(18) UNIQUE NOT NULL,
    endereco TEXT NOT NULL,
    telefone VARCHAR(20),
    email VARCHAR(255),
    
    -- Configuração
    horario_funcionamento JSONB,
    servicos_oferecidos TEXT[],
    
    -- Convênio DIBEA
    aceita_convenio_dibea BOOLEAN DEFAULT false,
    desconto_dibea DECIMAL(5,2),
    
    -- Localização
    latitude DECIMAL(10,8),
    longitude DECIMAL(11,8),
    
    -- Referências
    municipality_id UUID REFERENCES municipios(id),
    
    -- Controle
    ativo BOOLEAN DEFAULT true,
    created_at TIMESTAMP DEFAULT NOW(),
    updated_at TIMESTAMP DEFAULT NOW()
);

-- =====================================================
-- TABELA: agendamentos
-- =====================================================

CREATE TABLE agendamentos (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    
    -- Tipo e local
    tipo VARCHAR(50) NOT NULL,
    local_type VARCHAR(20) NOT NULL DEFAULT 'DIBEA',
    
    -- Referências condicionais
    clinica_id UUID REFERENCES clinicas(id),
    
    -- Data e hora
    data_hora TIMESTAMP NOT NULL,
    duracao_minutos INTEGER DEFAULT 30,
    
    -- Participantes
    tutor_id UUID NOT NULL REFERENCES tutores(id),
    animal_id UUID REFERENCES animais(id),
    veterinario_id UUID REFERENCES users(id),
    funcionario_id UUID REFERENCES users(id),
    
    -- Serviço
    servico VARCHAR(255),
    valor DECIMAL(10,2),
    
    -- Status
    status appointment_status DEFAULT 'AGENDADO',
    
    -- Controle
    observacoes TEXT,
    motivo_cancelamento TEXT,
    lembrete_enviado BOOLEAN DEFAULT false,
    
    -- Referências
    municipality_id UUID REFERENCES municipios(id),
    
    -- Timestamps
    created_at TIMESTAMP DEFAULT NOW(),
    updated_at TIMESTAMP DEFAULT NOW(),
    
    -- Constraints
    CONSTRAINT chk_local_clinica CHECK (
        (local_type = 'DIBEA' AND clinica_id IS NULL) OR
        (local_type = 'CLINICA_PARCEIRA' AND clinica_id IS NOT NULL)
    ),
    CONSTRAINT chk_agendamento_data_futura CHECK (data_hora > created_at)
);

-- Continua na próxima migration...

