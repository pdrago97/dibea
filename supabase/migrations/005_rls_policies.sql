-- =====================================================
-- DIBEA - Migration 005: Row Level Security (RLS)
-- Políticas de segurança por linha
-- =====================================================

-- Habilitar RLS em todas as tabelas
ALTER TABLE municipios ENABLE ROW LEVEL SECURITY;
ALTER TABLE users ENABLE ROW LEVEL SECURITY;
ALTER TABLE tutores ENABLE ROW LEVEL SECURITY;
ALTER TABLE animais ENABLE ROW LEVEL SECURITY;
ALTER TABLE fotos_animal ENABLE ROW LEVEL SECURITY;
ALTER TABLE adocoes ENABLE ROW LEVEL SECURITY;
ALTER TABLE agendamentos ENABLE ROW LEVEL SECURITY;
ALTER TABLE atendimentos ENABLE ROW LEVEL SECURITY;
ALTER TABLE receitas ENABLE ROW LEVEL SECURITY;
ALTER TABLE medicamentos ENABLE ROW LEVEL SECURITY;
ALTER TABLE laudos ENABLE ROW LEVEL SECURITY;
ALTER TABLE produtos ENABLE ROW LEVEL SECURITY;
ALTER TABLE produtos_utilizados ENABLE ROW LEVEL SECURITY;
ALTER TABLE campanhas ENABLE ROW LEVEL SECURITY;
ALTER TABLE campanha_slots ENABLE ROW LEVEL SECURITY;
ALTER TABLE inscricoes_campanha ENABLE ROW LEVEL SECURITY;
ALTER TABLE rgas ENABLE ROW LEVEL SECURITY;
ALTER TABLE denuncias ENABLE ROW LEVEL SECURITY;
ALTER TABLE clinicas ENABLE ROW LEVEL SECURITY;
ALTER TABLE microchips ENABLE ROW LEVEL SECURITY;
ALTER TABLE notificacoes ENABLE ROW LEVEL SECURITY;
ALTER TABLE preferencias_notificacao ENABLE ROW LEVEL SECURITY;
ALTER TABLE conversas_whatsapp ENABLE ROW LEVEL SECURITY;
ALTER TABLE mensagens_whatsapp ENABLE ROW LEVEL SECURITY;
ALTER TABLE logs_auditoria ENABLE ROW LEVEL SECURITY;

-- =====================================================
-- HELPER FUNCTION: Get user role
-- =====================================================

CREATE OR REPLACE FUNCTION get_user_role()
RETURNS user_role AS $$
BEGIN
    RETURN (SELECT role FROM users WHERE id = auth.uid());
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- =====================================================
-- HELPER FUNCTION: Get user municipality
-- =====================================================

CREATE OR REPLACE FUNCTION get_user_municipality()
RETURNS UUID AS $$
BEGIN
    RETURN (SELECT municipality_id FROM users WHERE id = auth.uid());
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- =====================================================
-- HELPER FUNCTION: Is user tutor of animal
-- =====================================================

CREATE OR REPLACE FUNCTION is_tutor_of_animal(animal_uuid UUID)
RETURNS BOOLEAN AS $$
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

-- =====================================================
-- RLS POLICIES: municipios
-- =====================================================

-- Todos podem ver municípios ativos
CREATE POLICY "Municípios são públicos"
ON municipios FOR SELECT
USING (ativo = true);

-- Apenas SUPER_ADMIN pode modificar
CREATE POLICY "Apenas SUPER_ADMIN pode modificar municípios"
ON municipios FOR ALL
USING (get_user_role() = 'SUPER_ADMIN');

-- =====================================================
-- RLS POLICIES: users
-- =====================================================

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

-- SUPER_ADMIN vê todos
CREATE POLICY "SUPER_ADMIN vê todos usuários"
ON users FOR SELECT
USING (get_user_role() = 'SUPER_ADMIN');

-- Usuário pode atualizar próprio perfil
CREATE POLICY "Usuário pode atualizar próprio perfil"
ON users FOR UPDATE
USING (id = auth.uid())
WITH CHECK (id = auth.uid());

-- =====================================================
-- RLS POLICIES: tutores
-- =====================================================

-- Tutor pode ver próprio perfil
CREATE POLICY "Tutor pode ver próprio perfil"
ON tutores FOR SELECT
USING (user_id = auth.uid());

-- Staff pode ver tutores do município
CREATE POLICY "Staff pode ver tutores do município"
ON tutores FOR SELECT
USING (
    get_user_role() IN ('FUNCIONARIO', 'VETERINARIO', 'ADMIN')
    AND municipality_id = get_user_municipality()
);

-- SUPER_ADMIN vê todos
CREATE POLICY "SUPER_ADMIN vê todos tutores"
ON tutores FOR SELECT
USING (get_user_role() = 'SUPER_ADMIN');

-- Tutor pode atualizar próprio perfil
CREATE POLICY "Tutor pode atualizar próprio perfil"
ON tutores FOR UPDATE
USING (user_id = auth.uid())
WITH CHECK (user_id = auth.uid());

-- Staff pode criar/atualizar tutores
CREATE POLICY "Staff pode gerenciar tutores"
ON tutores FOR ALL
USING (
    get_user_role() IN ('FUNCIONARIO', 'VETERINARIO', 'ADMIN')
    AND municipality_id = get_user_municipality()
);

-- =====================================================
-- RLS POLICIES: animais
-- =====================================================

-- Animais disponíveis são públicos
CREATE POLICY "Animais disponíveis são públicos"
ON animais FOR SELECT
USING (status = 'DISPONIVEL');

-- Tutor pode ver seus animais
CREATE POLICY "Tutor pode ver seus animais"
ON animais FOR SELECT
USING (is_tutor_of_animal(id));

-- Staff pode ver animais do município
CREATE POLICY "Staff pode ver animais do município"
ON animais FOR SELECT
USING (
    get_user_role() IN ('FUNCIONARIO', 'VETERINARIO', 'ADMIN')
    AND municipality_id = get_user_municipality()
);

-- SUPER_ADMIN vê todos
CREATE POLICY "SUPER_ADMIN vê todos animais"
ON animais FOR SELECT
USING (get_user_role() = 'SUPER_ADMIN');

-- Staff pode criar/atualizar animais
CREATE POLICY "Staff pode gerenciar animais"
ON animais FOR ALL
USING (
    get_user_role() IN ('FUNCIONARIO', 'VETERINARIO', 'ADMIN')
    AND municipality_id = get_user_municipality()
);

-- =====================================================
-- RLS POLICIES: adocoes
-- =====================================================

-- Tutor pode ver suas adoções
CREATE POLICY "Tutor pode ver suas adoções"
ON adocoes FOR SELECT
USING (
    EXISTS (
        SELECT 1 FROM tutores t
        WHERE t.id = adocoes.tutor_id
        AND t.user_id = auth.uid()
    )
);

-- Staff pode ver adoções do município
CREATE POLICY "Staff pode ver adoções do município"
ON adocoes FOR SELECT
USING (
    get_user_role() IN ('FUNCIONARIO', 'VETERINARIO', 'ADMIN')
    AND EXISTS (
        SELECT 1 FROM animais a
        WHERE a.id = adocoes.animal_id
        AND a.municipality_id = get_user_municipality()
    )
);

-- Tutor pode solicitar adoção
CREATE POLICY "Tutor pode solicitar adoção"
ON adocoes FOR INSERT
WITH CHECK (
    get_user_role() = 'TUTOR'
    AND EXISTS (
        SELECT 1 FROM tutores t
        WHERE t.id = tutor_id
        AND t.user_id = auth.uid()
    )
);

-- Staff pode gerenciar adoções
CREATE POLICY "Staff pode gerenciar adoções"
ON adocoes FOR ALL
USING (
    get_user_role() IN ('FUNCIONARIO', 'VETERINARIO', 'ADMIN')
    AND EXISTS (
        SELECT 1 FROM animais a
        WHERE a.id = adocoes.animal_id
        AND a.municipality_id = get_user_municipality()
    )
);

-- =====================================================
-- RLS POLICIES: agendamentos
-- =====================================================

-- Tutor pode ver seus agendamentos
CREATE POLICY "Tutor pode ver seus agendamentos"
ON agendamentos FOR SELECT
USING (
    EXISTS (
        SELECT 1 FROM tutores t
        WHERE t.id = agendamentos.tutor_id
        AND t.user_id = auth.uid()
    )
);

-- Staff pode ver agendamentos do município
CREATE POLICY "Staff pode ver agendamentos do município"
ON agendamentos FOR SELECT
USING (
    get_user_role() IN ('FUNCIONARIO', 'VETERINARIO', 'ADMIN')
    AND municipality_id = get_user_municipality()
);

-- Tutor pode criar agendamento
CREATE POLICY "Tutor pode criar agendamento"
ON agendamentos FOR INSERT
WITH CHECK (
    get_user_role() = 'TUTOR'
    AND EXISTS (
        SELECT 1 FROM tutores t
        WHERE t.id = tutor_id
        AND t.user_id = auth.uid()
    )
);

-- Staff pode gerenciar agendamentos
CREATE POLICY "Staff pode gerenciar agendamentos"
ON agendamentos FOR ALL
USING (
    get_user_role() IN ('FUNCIONARIO', 'VETERINARIO', 'ADMIN')
    AND municipality_id = get_user_municipality()
);

-- =====================================================
-- RLS POLICIES: atendimentos
-- =====================================================

-- Tutor pode ver atendimentos de seus animais
CREATE POLICY "Tutor pode ver atendimentos de seus animais"
ON atendimentos FOR SELECT
USING (is_tutor_of_animal(animal_id));

-- Veterinário pode ver atendimentos que realizou
CREATE POLICY "Veterinário pode ver seus atendimentos"
ON atendimentos FOR SELECT
USING (
    get_user_role() = 'VETERINARIO'
    AND veterinario_id = auth.uid()
);

-- Staff pode ver atendimentos do município
CREATE POLICY "Staff pode ver atendimentos do município"
ON atendimentos FOR SELECT
USING (
    get_user_role() IN ('FUNCIONARIO', 'ADMIN')
    AND municipality_id = get_user_municipality()
);

-- Veterinário pode criar/atualizar atendimentos
CREATE POLICY "Veterinário pode gerenciar atendimentos"
ON atendimentos FOR ALL
USING (
    get_user_role() = 'VETERINARIO'
    AND (veterinario_id = auth.uid() OR veterinario_id IS NULL)
);

-- =====================================================
-- RLS POLICIES: campanhas
-- =====================================================

-- Campanhas ativas são públicas
CREATE POLICY "Campanhas ativas são públicas"
ON campanhas FOR SELECT
USING (status IN ('INSCRICOES_ABERTAS', 'EM_ANDAMENTO'));

-- Staff pode ver todas campanhas do município
CREATE POLICY "Staff pode ver campanhas do município"
ON campanhas FOR SELECT
USING (
    get_user_role() IN ('FUNCIONARIO', 'VETERINARIO', 'ADMIN')
    AND municipality_id = get_user_municipality()
);

-- Staff pode gerenciar campanhas
CREATE POLICY "Staff pode gerenciar campanhas"
ON campanhas FOR ALL
USING (
    get_user_role() IN ('FUNCIONARIO', 'ADMIN')
    AND municipality_id = get_user_municipality()
);

-- =====================================================
-- RLS POLICIES: notificacoes
-- =====================================================

-- Usuário pode ver suas notificações
CREATE POLICY "Usuário pode ver suas notificações"
ON notificacoes FOR SELECT
USING (user_id = auth.uid());

-- Sistema pode criar notificações (via service role)
-- Sem policy específica - usar service role key

-- Continua...

