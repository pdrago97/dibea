-- =====================================================
-- DIBEA - Migration 002: Medical Records & Campaigns
-- Atendimentos, receitas, laudos, campanhas
-- =====================================================

-- =====================================================
-- TABELA: atendimentos (histórico médico)
-- =====================================================

CREATE TABLE atendimentos (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    animal_id UUID NOT NULL REFERENCES animais(id),
    veterinario_id UUID NOT NULL REFERENCES users(id),
    
    -- Tipo
    tipo VARCHAR(50) NOT NULL,
    
    -- Data
    data_atendimento TIMESTAMP NOT NULL DEFAULT NOW(),
    
    -- Dados clínicos
    peso_animal DECIMAL(5,2),
    temperatura DECIMAL(4,2),
    frequencia_cardiaca INTEGER,
    frequencia_respiratoria INTEGER,
    
    -- Anamnese
    queixa_principal TEXT,
    historico_doenca_atual TEXT,
    exame_fisico TEXT,
    
    -- Diagnóstico
    diagnostico_presuntivo TEXT,
    diagnostico_definitivo TEXT,
    cid_veterinario VARCHAR(20),
    
    -- Conduta
    conduta TEXT NOT NULL,
    observacoes TEXT,
    
    -- Retorno
    retorno_recomendado DATE,
    
    -- Status
    status VARCHAR(50) DEFAULT 'CONCLUIDO',
    
    -- Referências
    agendamento_id UUID REFERENCES agendamentos(id),
    municipality_id UUID REFERENCES municipios(id),
    
    created_at TIMESTAMP DEFAULT NOW(),
    updated_at TIMESTAMP DEFAULT NOW(),
    
    CONSTRAINT chk_atendimento_temperatura CHECK (temperatura BETWEEN 35.0 AND 42.0),
    CONSTRAINT chk_atendimento_fc CHECK (frequencia_cardiaca BETWEEN 40 AND 200),
    CONSTRAINT chk_atendimento_fr CHECK (frequencia_respiratoria BETWEEN 10 AND 60)
);

-- =====================================================
-- TABELA: receitas
-- =====================================================

CREATE TABLE receitas (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    atendimento_id UUID NOT NULL REFERENCES atendimentos(id) ON DELETE CASCADE,
    
    numero_receita VARCHAR(50) UNIQUE NOT NULL,
    data_emissao DATE NOT NULL DEFAULT CURRENT_DATE,
    validade_dias INTEGER DEFAULT 30,
    
    observacoes TEXT,
    pdf_url TEXT,
    assinatura_digital TEXT,
    
    created_at TIMESTAMP DEFAULT NOW()
);

-- =====================================================
-- TABELA: medicamentos
-- =====================================================

CREATE TABLE medicamentos (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    receita_id UUID NOT NULL REFERENCES receitas(id) ON DELETE CASCADE,
    
    nome VARCHAR(255) NOT NULL,
    principio_ativo VARCHAR(255),
    dosagem VARCHAR(100) NOT NULL,
    via_administracao VARCHAR(50) NOT NULL,
    frequencia VARCHAR(100) NOT NULL,
    duracao_dias INTEGER NOT NULL,
    quantidade_total VARCHAR(100) NOT NULL,
    instrucoes TEXT,
    
    CONSTRAINT chk_medicamento_duracao CHECK (duracao_dias > 0 AND duracao_dias <= 365)
);

-- =====================================================
-- TABELA: laudos
-- =====================================================

CREATE TABLE laudos (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    atendimento_id UUID NOT NULL REFERENCES atendimentos(id) ON DELETE CASCADE,
    
    tipo VARCHAR(50) NOT NULL,
    data_realizacao DATE NOT NULL,
    laboratorio VARCHAR(255),
    
    resultado TEXT NOT NULL,
    interpretacao TEXT,
    
    arquivos TEXT[],
    
    created_at TIMESTAMP DEFAULT NOW()
);

-- =====================================================
-- TABELA: produtos (estoque)
-- =====================================================

CREATE TABLE produtos (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    nome VARCHAR(255) NOT NULL,
    categoria VARCHAR(50) NOT NULL,
    fabricante VARCHAR(255),
    codigo_barras VARCHAR(50),
    
    -- Estoque
    estoque_atual INTEGER DEFAULT 0,
    estoque_minimo INTEGER DEFAULT 10,
    unidade VARCHAR(20) NOT NULL,
    
    -- Valores
    valor_custo DECIMAL(10,2),
    valor_venda DECIMAL(10,2),
    
    -- Controle
    requer_receita BOOLEAN DEFAULT false,
    controlado BOOLEAN DEFAULT false,
    
    -- Referências
    municipality_id UUID REFERENCES municipios(id),
    
    -- Status
    ativo BOOLEAN DEFAULT true,
    created_at TIMESTAMP DEFAULT NOW(),
    
    CONSTRAINT chk_produto_estoque CHECK (estoque_atual >= 0),
    CONSTRAINT chk_produto_valores CHECK (valor_custo >= 0 AND valor_venda >= 0)
);

-- =====================================================
-- TABELA: produtos_utilizados
-- =====================================================

CREATE TABLE produtos_utilizados (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    atendimento_id UUID NOT NULL REFERENCES atendimentos(id) ON DELETE CASCADE,
    produto_id UUID NOT NULL REFERENCES produtos(id),
    
    quantidade DECIMAL(10,2) NOT NULL,
    unidade VARCHAR(20) NOT NULL,
    lote VARCHAR(50),
    validade DATE,
    
    valor_unitario DECIMAL(10,2),
    valor_total DECIMAL(10,2),
    
    created_at TIMESTAMP DEFAULT NOW(),
    
    CONSTRAINT chk_produto_utilizado_quantidade CHECK (quantidade > 0)
);

-- =====================================================
-- TABELA: campanhas
-- =====================================================

CREATE TABLE campanhas (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    nome VARCHAR(255) NOT NULL,
    tipo VARCHAR(50) NOT NULL,
    descricao TEXT,
    
    -- Período
    data_inicio DATE NOT NULL,
    data_fim DATE NOT NULL,
    
    -- Local
    local VARCHAR(255) NOT NULL,
    endereco TEXT NOT NULL,
    latitude DECIMAL(10,8),
    longitude DECIMAL(11,8),
    
    -- Configuração de horários (JSONB)
    horarios_config JSONB NOT NULL,
    
    -- Vagas
    vagas_total INTEGER NOT NULL,
    vagas_ocupadas INTEGER DEFAULT 0,
    
    -- Lista de espera
    lista_espera BOOLEAN DEFAULT false,
    
    -- Financeiro
    valor DECIMAL(10,2),
    gratuita BOOLEAN DEFAULT true,
    
    -- Requisitos
    requisitos TEXT[],
    publico_alvo VARCHAR(50) DEFAULT 'TODOS',
    
    -- Status
    status campaign_status DEFAULT 'PLANEJADA',
    
    -- Referências
    municipality_id UUID NOT NULL REFERENCES municipios(id),
    created_by UUID NOT NULL REFERENCES users(id),
    
    created_at TIMESTAMP DEFAULT NOW(),
    updated_at TIMESTAMP DEFAULT NOW(),
    
    CONSTRAINT chk_campanha_datas CHECK (data_fim >= data_inicio),
    CONSTRAINT chk_campanha_vagas CHECK (vagas_ocupadas <= vagas_total),
    CONSTRAINT chk_campanha_vagas_positivas CHECK (vagas_total > 0)
);

-- =====================================================
-- TABELA: campanha_slots
-- =====================================================

CREATE TABLE campanha_slots (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    campanha_id UUID NOT NULL REFERENCES campanhas(id) ON DELETE CASCADE,
    
    data_hora TIMESTAMP NOT NULL,
    vagas_disponiveis INTEGER NOT NULL,
    vagas_ocupadas INTEGER DEFAULT 0,
    
    created_at TIMESTAMP DEFAULT NOW(),
    
    UNIQUE(campanha_id, data_hora),
    CONSTRAINT chk_slot_vagas CHECK (vagas_ocupadas <= vagas_disponiveis),
    CONSTRAINT chk_slot_vagas_positivas CHECK (vagas_disponiveis > 0)
);

-- =====================================================
-- TABELA: inscricoes_campanha
-- =====================================================

CREATE TABLE inscricoes_campanha (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    campanha_id UUID NOT NULL REFERENCES campanhas(id),
    slot_id UUID NOT NULL REFERENCES campanha_slots(id),
    tutor_id UUID NOT NULL REFERENCES tutores(id),
    animal_id UUID REFERENCES animais(id),
    
    posicao_fila INTEGER,
    status VARCHAR(50) DEFAULT 'CONFIRMADA',
    
    observacoes TEXT,
    created_at TIMESTAMP DEFAULT NOW(),
    
    UNIQUE(campanha_id, tutor_id, animal_id)
);

-- =====================================================
-- TABELA: rgas (Registro Geral Animal)
-- =====================================================

CREATE TABLE rgas (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    numero VARCHAR(50) UNIQUE NOT NULL,
    
    -- Relacionamentos
    animal_id UUID NOT NULL REFERENCES animais(id),
    tutor_id UUID NOT NULL REFERENCES tutores(id),
    
    -- Datas
    data_emissao DATE NOT NULL DEFAULT CURRENT_DATE,
    data_vencimento DATE NOT NULL,
    
    -- Financeiro
    valor_taxa DECIMAL(10,2),
    pago BOOLEAN DEFAULT false,
    data_pagamento DATE,
    
    -- Documento
    certificado_url TEXT,
    qr_code TEXT,
    
    -- Status
    status VARCHAR(50) DEFAULT 'ATIVO',
    
    -- Referências
    municipality_id UUID REFERENCES municipios(id),
    
    created_at TIMESTAMP DEFAULT NOW(),
    
    CONSTRAINT chk_rga_vencimento CHECK (data_vencimento > data_emissao),
    CONSTRAINT chk_rga_pagamento CHECK (
        (pago = false AND data_pagamento IS NULL) OR
        (pago = true AND data_pagamento IS NOT NULL)
    )
);

-- =====================================================
-- TABELA: denuncias
-- =====================================================

CREATE TABLE denuncias (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    protocolo VARCHAR(50) UNIQUE NOT NULL,
    
    -- Tipo
    tipo VARCHAR(50) NOT NULL,
    descricao TEXT NOT NULL,
    
    -- Localização
    localizacao TEXT NOT NULL,
    latitude DECIMAL(10,8),
    longitude DECIMAL(11,8),
    
    -- Denunciante (opcional)
    denunciante_nome VARCHAR(255),
    denunciante_telefone VARCHAR(20),
    denunciante_email VARCHAR(255),
    
    -- Fotos
    fotos TEXT[],
    
    -- Status
    status complaint_status DEFAULT 'ABERTA',
    prioridade VARCHAR(20) DEFAULT 'MEDIA',
    
    -- Atribuição
    responsavel_id UUID REFERENCES users(id),
    data_atribuicao TIMESTAMP,
    
    -- Resolução
    resolucao TEXT,
    data_resolucao TIMESTAMP,
    
    -- Referências
    municipality_id UUID NOT NULL REFERENCES municipios(id),
    
    created_at TIMESTAMP DEFAULT NOW(),
    updated_at TIMESTAMP DEFAULT NOW()
);

-- Continua na próxima migration...

