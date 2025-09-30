-- =====================================================
-- DIBEA - Migration 003: Notifications & WhatsApp
-- Notificações, conversas WhatsApp, preferências
-- =====================================================

-- =====================================================
-- TABELA: notificacoes
-- =====================================================

CREATE TABLE notificacoes (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    
    -- Destinatário (pode ser user_id OU phone/email)
    user_id UUID REFERENCES users(id),
    phone VARCHAR(20),
    email VARCHAR(255),
    
    -- Conteúdo
    titulo VARCHAR(255) NOT NULL,
    conteudo TEXT NOT NULL,
    
    -- Canal
    tipo notification_type NOT NULL,
    categoria VARCHAR(50) NOT NULL,
    prioridade notification_priority DEFAULT 'MEDIA',
    
    -- Agendamento
    enviar_em TIMESTAMP,
    enviada BOOLEAN DEFAULT false,
    data_envio TIMESTAMP,
    
    -- Rastreamento
    visualizada BOOLEAN DEFAULT false,
    data_visualizacao TIMESTAMP,
    clicada BOOLEAN DEFAULT false,
    data_clique TIMESTAMP,
    
    -- Relacionamento
    relacionado_tipo VARCHAR(50),
    relacionado_id UUID,
    
    -- Controle de envio
    tentativas_envio INTEGER DEFAULT 0,
    erro TEXT,
    provider_message_id VARCHAR(255),
    
    created_at TIMESTAMP DEFAULT NOW(),
    
    CONSTRAINT chk_notificacao_destinatario CHECK (
        user_id IS NOT NULL OR phone IS NOT NULL OR email IS NOT NULL
    ),
    CONSTRAINT chk_notificacao_tentativas CHECK (tentativas_envio >= 0 AND tentativas_envio <= 5)
);

-- =====================================================
-- TABELA: preferencias_notificacao
-- =====================================================

CREATE TABLE preferencias_notificacao (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    
    categoria VARCHAR(50) NOT NULL,
    
    email_enabled BOOLEAN DEFAULT true,
    sms_enabled BOOLEAN DEFAULT false,
    whatsapp_enabled BOOLEAN DEFAULT true,
    push_enabled BOOLEAN DEFAULT true,
    
    -- Horários preferidos
    horario_preferido_inicio TIME DEFAULT '08:00',
    horario_preferido_fim TIME DEFAULT '20:00',
    dias_semana_preferidos INTEGER[] DEFAULT ARRAY[1,2,3,4,5],
    
    created_at TIMESTAMP DEFAULT NOW(),
    updated_at TIMESTAMP DEFAULT NOW(),
    
    UNIQUE(user_id, categoria)
);

-- =====================================================
-- TABELA: conversas_whatsapp
-- =====================================================

CREATE TABLE conversas_whatsapp (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    
    -- Identificação (pode ser user_id OU phone)
    user_id UUID REFERENCES users(id),
    numero_telefone VARCHAR(20) NOT NULL,
    nome_contato VARCHAR(255),
    whatsapp_id VARCHAR(100),
    
    -- Contexto da conversa (JSONB)
    contexto JSONB DEFAULT '{}',
    
    -- Status
    status VARCHAR(50) DEFAULT 'ATIVA',
    
    -- Atendimento
    funcionario_id UUID REFERENCES users(id),
    transferida_em TIMESTAMP,
    
    -- Controle
    ultima_mensagem_em TIMESTAMP DEFAULT NOW(),
    created_at TIMESTAMP DEFAULT NOW(),
    updated_at TIMESTAMP DEFAULT NOW(),
    
    UNIQUE(numero_telefone)
);

-- =====================================================
-- TABELA: mensagens_whatsapp
-- =====================================================

CREATE TABLE mensagens_whatsapp (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    conversa_id UUID NOT NULL REFERENCES conversas_whatsapp(id) ON DELETE CASCADE,
    
    -- Conteúdo
    tipo VARCHAR(20) NOT NULL,
    conteudo TEXT,
    url_midia TEXT,
    
    -- Origem
    origem VARCHAR(20) NOT NULL,
    sender_id UUID REFERENCES users(id),
    
    -- Controle
    lida BOOLEAN DEFAULT false,
    data_leitura TIMESTAMP,
    
    -- Provider
    whatsapp_message_id VARCHAR(255),
    
    created_at TIMESTAMP DEFAULT NOW()
);

-- =====================================================
-- TABELA: logs_auditoria
-- =====================================================

CREATE TABLE logs_auditoria (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    
    -- Ação
    tabela VARCHAR(100) NOT NULL,
    operacao VARCHAR(20) NOT NULL,
    registro_id UUID,
    
    -- Usuário
    user_id UUID REFERENCES users(id),
    user_role user_role,
    
    -- Dados
    dados_anteriores JSONB,
    dados_novos JSONB,
    
    -- Contexto
    ip_address INET,
    user_agent TEXT,
    
    created_at TIMESTAMP DEFAULT NOW()
);

-- =====================================================
-- ÍNDICES PARA PERFORMANCE
-- =====================================================

-- Animais
CREATE INDEX idx_animais_status ON animais(status);
CREATE INDEX idx_animais_status_municipio_especie ON animais(status, municipality_id, especie);
CREATE INDEX idx_animais_disponivel ON animais(status) WHERE status = 'DISPONIVEL';
CREATE INDEX idx_animais_municipio ON animais(municipality_id);
CREATE INDEX idx_animais_microchip ON animais(microchip_id);

-- Full-text search em animais
CREATE INDEX idx_animais_nome_gin ON animais USING gin(to_tsvector('portuguese', nome));

-- Tutores
CREATE INDEX idx_tutores_cpf ON tutores(cpf);
CREATE INDEX idx_tutores_user_id ON tutores(user_id);
CREATE INDEX idx_tutores_municipio ON tutores(municipality_id);
CREATE INDEX idx_tutores_status ON tutores(status);

-- Full-text search em tutores
CREATE INDEX idx_tutores_nome_gin ON tutores USING gin(to_tsvector('portuguese', nome));

-- Users
CREATE INDEX idx_users_email ON users(email);
CREATE INDEX idx_users_phone ON users(phone);
CREATE INDEX idx_users_role ON users(role);
CREATE INDEX idx_users_whatsapp_id ON users(whatsapp_id);

-- Adoções
CREATE INDEX idx_adocoes_animal ON adocoes(animal_id);
CREATE INDEX idx_adocoes_tutor ON adocoes(tutor_id);
CREATE INDEX idx_adocoes_status ON adocoes(status);
CREATE INDEX idx_adocoes_data ON adocoes(data_solicitacao DESC);

-- Agendamentos
CREATE INDEX idx_agendamentos_data_status ON agendamentos(data_hora, status);
CREATE INDEX idx_agendamentos_tutor ON agendamentos(tutor_id, data_hora DESC);
CREATE INDEX idx_agendamentos_veterinario ON agendamentos(veterinario_id, data_hora DESC);
CREATE INDEX idx_agendamentos_municipio ON agendamentos(municipality_id);
CREATE INDEX idx_agendamentos_futuro ON agendamentos(data_hora) WHERE status IN ('AGENDADO', 'CONFIRMADO');

-- Atendimentos
CREATE INDEX idx_atendimentos_animal ON atendimentos(animal_id, data_atendimento DESC);
CREATE INDEX idx_atendimentos_veterinario ON atendimentos(veterinario_id, data_atendimento DESC);
CREATE INDEX idx_atendimentos_data ON atendimentos(data_atendimento DESC);

-- Campanhas
CREATE INDEX idx_campanhas_status_municipio ON campanhas(status, municipality_id);
CREATE INDEX idx_campanhas_datas ON campanhas(data_inicio, data_fim);
CREATE INDEX idx_campanhas_ativas ON campanhas(status) WHERE status IN ('INSCRICOES_ABERTAS', 'EM_ANDAMENTO');

-- Campanha Slots
CREATE INDEX idx_campanha_slots_campanha_data ON campanha_slots(campanha_id, data_hora);
CREATE INDEX idx_campanha_slots_disponiveis ON campanha_slots(campanha_id) WHERE vagas_ocupadas < vagas_disponiveis;

-- Inscrições Campanha
CREATE INDEX idx_inscricoes_campanha ON inscricoes_campanha(campanha_id);
CREATE INDEX idx_inscricoes_tutor ON inscricoes_campanha(tutor_id);
CREATE INDEX idx_inscricoes_slot ON inscricoes_campanha(slot_id);

-- Denúncias
CREATE INDEX idx_denuncias_status ON denuncias(status);
CREATE INDEX idx_denuncias_protocolo ON denuncias(protocolo);
CREATE INDEX idx_denuncias_municipio ON denuncias(municipality_id);
CREATE INDEX idx_denuncias_responsavel ON denuncias(responsavel_id);
CREATE INDEX idx_denuncias_criticas ON denuncias(prioridade, status) WHERE prioridade IN ('ALTA', 'URGENTE');

-- Notificações
CREATE INDEX idx_notificacoes_pendentes ON notificacoes(enviada, enviar_em) WHERE enviada = false;
CREATE INDEX idx_notificacoes_user ON notificacoes(user_id, created_at DESC);
CREATE INDEX idx_notificacoes_phone ON notificacoes(phone, created_at DESC);
CREATE INDEX idx_notificacoes_nao_visualizadas ON notificacoes(user_id, visualizada) WHERE visualizada = false;

-- Conversas WhatsApp
CREATE INDEX idx_conversas_telefone ON conversas_whatsapp(numero_telefone);
CREATE INDEX idx_conversas_user ON conversas_whatsapp(user_id) WHERE user_id IS NOT NULL;
CREATE INDEX idx_conversas_ativas ON conversas_whatsapp(status, ultima_mensagem_em DESC) WHERE status = 'ATIVA';
CREATE INDEX idx_conversas_whatsapp_id ON conversas_whatsapp(whatsapp_id);

-- Mensagens WhatsApp
CREATE INDEX idx_mensagens_conversa_created ON mensagens_whatsapp(conversa_id, created_at DESC);
CREATE INDEX idx_mensagens_nao_lidas ON mensagens_whatsapp(conversa_id, lida) WHERE lida = false;

-- RGAs
CREATE INDEX idx_rgas_animal ON rgas(animal_id);
CREATE INDEX idx_rgas_tutor ON rgas(tutor_id);
CREATE INDEX idx_rgas_numero ON rgas(numero);
CREATE INDEX idx_rgas_status ON rgas(status);
CREATE INDEX idx_rgas_vencimento ON rgas(data_vencimento) WHERE status = 'ATIVO';

-- Produtos
CREATE INDEX idx_produtos_categoria ON produtos(categoria);
CREATE INDEX idx_produtos_estoque_baixo ON produtos(municipality_id) WHERE estoque_atual < estoque_minimo;
CREATE INDEX idx_produtos_ativos ON produtos(ativo) WHERE ativo = true;

-- Logs Auditoria
CREATE INDEX idx_logs_tabela_operacao ON logs_auditoria(tabela, operacao, created_at DESC);
CREATE INDEX idx_logs_user ON logs_auditoria(user_id, created_at DESC);
CREATE INDEX idx_logs_registro ON logs_auditoria(tabela, registro_id, created_at DESC);

-- Continua na próxima migration...

