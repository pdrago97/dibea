-- =====================================================
-- DIBEA - Migration 006: Seed Data
-- Dados iniciais para desenvolvimento e testes
-- =====================================================

-- =====================================================
-- MUNICÍPIO DE TESTE: São Paulo
-- =====================================================

INSERT INTO municipios (id, nome, cnpj, endereco, telefone, email, ativo) VALUES
(
    '0b227971-5134-4992-b83c-b4f35cabb1c0',
    'São Paulo',
    '46.395.000/0001-39',
    'Rua da Consolação, 1234 - Centro, São Paulo - SP',
    '(11) 3000-0000',
    'contato@dibea.sp.gov.br',
    true
);

-- =====================================================
-- USUÁRIOS DE TESTE
-- =====================================================

-- SUPER ADMIN
INSERT INTO users (id, email, role, active) VALUES
(
    '11111111-1111-1111-1111-111111111111',
    'superadmin@dibea.com.br',
    'SUPER_ADMIN',
    true
);

-- ADMIN Municipal (São Paulo)
INSERT INTO users (id, email, role, municipality_id, active) VALUES
(
    '22222222-2222-2222-2222-222222222222',
    'admin@sp.dibea.com.br',
    'ADMIN',
    '0b227971-5134-4992-b83c-b4f35cabb1c0',
    true
);

-- VETERINÁRIO
INSERT INTO users (id, email, role, municipality_id, active) VALUES
(
    '33333333-3333-3333-3333-333333333333',
    'veterinario@sp.dibea.com.br',
    'VETERINARIO',
    '0b227971-5134-4992-b83c-b4f35cabb1c0',
    true
);

-- FUNCIONÁRIO
INSERT INTO users (id, email, role, municipality_id, active) VALUES
(
    '44444444-4444-4444-4444-444444444444',
    'funcionario@sp.dibea.com.br',
    'FUNCIONARIO',
    '0b227971-5134-4992-b83c-b4f35cabb1c0',
    true
);

-- TUTOR 1
INSERT INTO users (id, email, phone, role, municipality_id, active) VALUES
(
    '55555555-5555-5555-5555-555555555555',
    'joao.silva@email.com',
    '+5511999999999',
    'TUTOR',
    '0b227971-5134-4992-b83c-b4f35cabb1c0',
    true
);

-- TUTOR 2
INSERT INTO users (id, email, phone, role, municipality_id, active) VALUES
(
    '66666666-6666-6666-6666-666666666666',
    'maria.santos@email.com',
    '+5511988888888',
    'TUTOR',
    '0b227971-5134-4992-b83c-b4f35cabb1c0',
    true
);

-- =====================================================
-- PERFIS DE TUTORES
-- =====================================================

INSERT INTO tutores (id, user_id, cpf, nome, email, telefone, endereco_completo, cep, cidade, estado, tipo_moradia, tem_experiencia, tem_outros_pets, tem_quintal, status, municipality_id) VALUES
(
    'aaaaaaaa-aaaa-aaaa-aaaa-aaaaaaaaaaaa',
    '55555555-5555-5555-5555-555555555555',
    '12345678900',
    'João Silva',
    'joao.silva@email.com',
    '+5511999999999',
    'Rua das Flores, 123 - Jardim Paulista, São Paulo - SP',
    '01234-567',
    'São Paulo',
    'SP',
    'CASA',
    true,
    true,
    true,
    'ATIVO',
    '0b227971-5134-4992-b83c-b4f35cabb1c0'
),
(
    'bbbbbbbb-bbbb-bbbb-bbbb-bbbbbbbbbbbb',
    '66666666-6666-6666-6666-666666666666',
    '98765432100',
    'Maria Santos',
    'maria.santos@email.com',
    '+5511988888888',
    'Av. Paulista, 1000 - Bela Vista, São Paulo - SP',
    '01310-100',
    'São Paulo',
    'SP',
    'APARTAMENTO',
    false,
    false,
    false,
    'ATIVO',
    '0b227971-5134-4992-b83c-b4f35cabb1c0'
);

-- Atualizar users com tutor_profile_id
UPDATE users SET tutor_profile_id = 'aaaaaaaa-aaaa-aaaa-aaaa-aaaaaaaaaaaa' WHERE id = '55555555-5555-5555-5555-555555555555';
UPDATE users SET tutor_profile_id = 'bbbbbbbb-bbbb-bbbb-bbbb-bbbbbbbbbbbb' WHERE id = '66666666-6666-6666-6666-666666666666';

-- =====================================================
-- MICROCHIPS
-- =====================================================

INSERT INTO microchips (id, numero, status, municipality_id) VALUES
('mc111111-1111-1111-1111-111111111111', '982000123456789', 'ESTOQUE', '0b227971-5134-4992-b83c-b4f35cabb1c0'),
('mc222222-2222-2222-2222-222222222222', '982000123456790', 'ESTOQUE', '0b227971-5134-4992-b83c-b4f35cabb1c0'),
('mc333333-3333-3333-3333-333333333333', '982000123456791', 'APLICADO', '0b227971-5134-4992-b83c-b4f35cabb1c0');

-- =====================================================
-- ANIMAIS DE TESTE
-- =====================================================

INSERT INTO animais (id, nome, especie, raca, sexo, porte, data_nascimento, peso, cor, temperamento, status, qr_code, microchip_id, municipality_id) VALUES
(
    'an111111-1111-1111-1111-111111111111',
    'Rex',
    'CANINO',
    'Labrador',
    'MACHO',
    'GRANDE',
    '2020-05-15',
    30.5,
    'Amarelo',
    'Dócil, brincalhão e muito carinhoso',
    'DISPONIVEL',
    'QR-REX-2024-001',
    NULL,
    '0b227971-5134-4992-b83c-b4f35cabb1c0'
),
(
    'an222222-2222-2222-2222-222222222222',
    'Luna',
    'CANINO',
    'Vira-lata',
    'FEMEA',
    'MEDIO',
    '2021-08-20',
    15.2,
    'Caramelo',
    'Calma e amorosa',
    'DISPONIVEL',
    'QR-LUNA-2024-002',
    NULL,
    '0b227971-5134-4992-b83c-b4f35cabb1c0'
),
(
    'an333333-3333-3333-3333-333333333333',
    'Mia',
    'FELINO',
    'Siamês',
    'FEMEA',
    'PEQUENO',
    '2022-03-10',
    4.5,
    'Branco e marrom',
    'Independente mas carinhosa',
    'DISPONIVEL',
    'QR-MIA-2024-003',
    NULL,
    '0b227971-5134-4992-b83c-b4f35cabb1c0'
),
(
    'an444444-4444-4444-4444-444444444444',
    'Thor',
    'CANINO',
    'Pastor Alemão',
    'MACHO',
    'GRANDE',
    '2019-11-05',
    35.0,
    'Preto e marrom',
    'Protetor e leal',
    'ADOTADO',
    'QR-THOR-2024-004',
    'mc333333-3333-3333-3333-333333333333',
    '0b227971-5134-4992-b83c-b4f35cabb1c0'
);

-- =====================================================
-- FOTOS DOS ANIMAIS
-- =====================================================

INSERT INTO fotos_animal (animal_id, url, ordem, principal) VALUES
('an111111-1111-1111-1111-111111111111', 'https://example.com/rex-1.jpg', 1, true),
('an111111-1111-1111-1111-111111111111', 'https://example.com/rex-2.jpg', 2, false),
('an222222-2222-2222-2222-222222222222', 'https://example.com/luna-1.jpg', 1, true),
('an333333-3333-3333-3333-333333333333', 'https://example.com/mia-1.jpg', 1, true),
('an444444-4444-4444-4444-444444444444', 'https://example.com/thor-1.jpg', 1, true);

-- =====================================================
-- ADOÇÃO (Thor foi adotado por João Silva)
-- =====================================================

INSERT INTO adocoes (id, animal_id, tutor_id, funcionario_id, data_solicitacao, data_aprovacao, data_entrega, motivo_interesse, status) VALUES
(
    'ad111111-1111-1111-1111-111111111111',
    'an444444-4444-4444-4444-444444444444',
    'aaaaaaaa-aaaa-aaaa-aaaa-aaaaaaaaaaaa',
    '44444444-4444-4444-4444-444444444444',
    '2024-01-10',
    '2024-01-15',
    '2024-01-20',
    'Sempre quis ter um pastor alemão. Tenho quintal grande e experiência com cães de grande porte.',
    'CONCLUIDA'
);

-- =====================================================
-- CLÍNICA PARCEIRA
-- =====================================================

INSERT INTO clinicas (id, nome, cnpj, endereco, telefone, email, aceita_convenio_dibea, desconto_dibea, latitude, longitude, municipality_id, ativo) VALUES
(
    'cl111111-1111-1111-1111-111111111111',
    'Clínica Veterinária Amigo Fiel',
    '12.345.678/0001-90',
    'Rua dos Veterinários, 456 - Vila Mariana, São Paulo - SP',
    '(11) 3456-7890',
    'contato@amigofiel.com.br',
    true,
    20.00,
    -23.5880,
    -46.6320,
    '0b227971-5134-4992-b83c-b4f35cabb1c0',
    true
);

-- =====================================================
-- CAMPANHA DE CASTRAÇÃO
-- =====================================================

INSERT INTO campanhas (id, nome, tipo, descricao, data_inicio, data_fim, local, endereco, horarios_config, vagas_total, status, gratuita, municipality_id, created_by) VALUES
(
    'cp111111-1111-1111-1111-111111111111',
    'Campanha de Castração - Janeiro 2025',
    'CASTRACAO',
    'Campanha gratuita de castração para cães e gatos. Atendimento de segunda a sexta, das 8h às 12h.',
    '2025-01-13',
    '2025-01-31',
    'Centro de Zoonoses de São Paulo',
    'Rua Santa Eulália, 86 - Santana, São Paulo - SP',
    '{
        "dias_semana": [1, 2, 3, 4, 5],
        "horario_inicio": "08:00",
        "horario_fim": "12:00",
        "duracao_atendimento_minutos": 30,
        "intervalo_minutos": 10,
        "vagas_por_slot": 2
    }',
    120,
    'INSCRICOES_ABERTAS',
    true,
    '0b227971-5134-4992-b83c-b4f35cabb1c0',
    '22222222-2222-2222-2222-222222222222'
);

-- =====================================================
-- PRODUTOS (Estoque)
-- =====================================================

INSERT INTO produtos (id, nome, categoria, fabricante, estoque_atual, estoque_minimo, unidade, valor_custo, valor_venda, requer_receita, municipality_id) VALUES
('pr111111-1111-1111-1111-111111111111', 'Vacina V10', 'VACINA', 'Zoetis', 50, 20, 'DOSE', 25.00, 50.00, false, '0b227971-5134-4992-b83c-b4f35cabb1c0'),
('pr222222-2222-2222-2222-222222222222', 'Vacina Antirrábica', 'VACINA', 'Zoetis', 80, 30, 'DOSE', 15.00, 30.00, false, '0b227971-5134-4992-b83c-b4f35cabb1c0'),
('pr333333-3333-3333-3333-333333333333', 'Anestésico Ketamina', 'MEDICAMENTO', 'Vetnil', 10, 5, 'FRASCO', 80.00, 150.00, true, '0b227971-5134-4992-b83c-b4f35cabb1c0'),
('pr444444-4444-4444-4444-444444444444', 'Antibiótico Amoxicilina', 'MEDICAMENTO', 'Agener', 100, 30, 'COMPRIMIDO', 2.00, 5.00, true, '0b227971-5134-4992-b83c-b4f35cabb1c0');

-- =====================================================
-- PREFERÊNCIAS DE NOTIFICAÇÃO (Tutores)
-- =====================================================

INSERT INTO preferencias_notificacao (user_id, categoria, email_enabled, sms_enabled, whatsapp_enabled, push_enabled) VALUES
('55555555-5555-5555-5555-555555555555', 'ADOCAO', true, false, true, true),
('55555555-5555-5555-5555-555555555555', 'AGENDAMENTO', true, true, true, true),
('55555555-5555-5555-5555-555555555555', 'CAMPANHA', true, false, true, false),
('66666666-6666-6666-6666-666666666666', 'ADOCAO', true, false, true, true),
('66666666-6666-6666-6666-666666666666', 'AGENDAMENTO', true, false, true, true);

-- =====================================================
-- FIM DO SEED
-- =====================================================

