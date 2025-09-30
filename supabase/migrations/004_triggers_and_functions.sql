-- =====================================================
-- DIBEA - Migration 004: Triggers & Functions
-- Automações, validações e funções auxiliares
-- =====================================================

-- =====================================================
-- FUNÇÃO: Atualizar updated_at automaticamente
-- =====================================================

CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = NOW();
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Aplicar em todas as tabelas com updated_at
CREATE TRIGGER trg_users_updated_at BEFORE UPDATE ON users
FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER trg_tutores_updated_at BEFORE UPDATE ON tutores
FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER trg_animais_updated_at BEFORE UPDATE ON animais
FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER trg_adocoes_updated_at BEFORE UPDATE ON adocoes
FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER trg_agendamentos_updated_at BEFORE UPDATE ON agendamentos
FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER trg_atendimentos_updated_at BEFORE UPDATE ON atendimentos
FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER trg_campanhas_updated_at BEFORE UPDATE ON campanhas
FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER trg_denuncias_updated_at BEFORE UPDATE ON denuncias
FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER trg_conversas_whatsapp_updated_at BEFORE UPDATE ON conversas_whatsapp
FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER trg_preferencias_notificacao_updated_at BEFORE UPDATE ON preferencias_notificacao
FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

-- =====================================================
-- FUNÇÃO: Atualizar vagas de campanhas
-- =====================================================

CREATE OR REPLACE FUNCTION update_campaign_slots_count()
RETURNS TRIGGER AS $$
BEGIN
    IF TG_OP = 'INSERT' THEN
        -- Incrementar vagas ocupadas no slot
        UPDATE campanha_slots
        SET vagas_ocupadas = vagas_ocupadas + 1
        WHERE id = NEW.slot_id;
        
        -- Incrementar vagas ocupadas na campanha
        UPDATE campanhas
        SET vagas_ocupadas = vagas_ocupadas + 1
        WHERE id = NEW.campanha_id;
        
    ELSIF TG_OP = 'DELETE' THEN
        -- Decrementar vagas ocupadas no slot
        UPDATE campanha_slots
        SET vagas_ocupadas = vagas_ocupadas - 1
        WHERE id = OLD.slot_id;
        
        -- Decrementar vagas ocupadas na campanha
        UPDATE campanhas
        SET vagas_ocupadas = vagas_ocupadas - 1
        WHERE id = OLD.campanha_id;
    END IF;
    
    RETURN COALESCE(NEW, OLD);
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER trg_inscricao_campanha_count
AFTER INSERT OR DELETE ON inscricoes_campanha
FOR EACH ROW EXECUTE FUNCTION update_campaign_slots_count();

-- =====================================================
-- FUNÇÃO: Atualizar status do animal quando adotado
-- =====================================================

CREATE OR REPLACE FUNCTION update_animal_status_on_adoption()
RETURNS TRIGGER AS $$
BEGIN
    IF NEW.status = 'CONCLUIDA' AND (OLD.status IS NULL OR OLD.status != 'CONCLUIDA') THEN
        UPDATE animais
        SET status = 'ADOTADO'
        WHERE id = NEW.animal_id;
    ELSIF NEW.status = 'CANCELADA' AND OLD.status = 'CONCLUIDA' THEN
        -- Se cancelar adoção concluída, volta para disponível
        UPDATE animais
        SET status = 'DISPONIVEL'
        WHERE id = NEW.animal_id;
    END IF;
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER trg_adoption_animal_status
AFTER UPDATE ON adocoes
FOR EACH ROW EXECUTE FUNCTION update_animal_status_on_adoption();

-- =====================================================
-- FUNÇÃO: Atualizar estoque de produtos
-- =====================================================

CREATE OR REPLACE FUNCTION update_product_stock()
RETURNS TRIGGER AS $$
DECLARE
    produto_nome VARCHAR(255);
    estoque_atual_val INTEGER;
    estoque_minimo_val INTEGER;
BEGIN
    -- Atualizar estoque
    UPDATE produtos
    SET estoque_atual = estoque_atual - NEW.quantidade
    WHERE id = NEW.produto_id
    RETURNING nome, estoque_atual, estoque_minimo 
    INTO produto_nome, estoque_atual_val, estoque_minimo_val;
    
    -- Verificar se estoque está baixo
    IF estoque_atual_val < estoque_minimo_val THEN
        INSERT INTO notificacoes (
            titulo,
            conteudo,
            tipo,
            categoria,
            prioridade,
            relacionado_tipo,
            relacionado_id
        ) VALUES (
            'Estoque Baixo',
            'O produto "' || produto_nome || '" está com estoque baixo (' || estoque_atual_val || ' unidades). Estoque mínimo: ' || estoque_minimo_val,
            'EMAIL',
            'SISTEMA',
            'ALTA',
            'produto',
            NEW.produto_id
        );
    END IF;
    
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER trg_product_stock_update
AFTER INSERT ON produtos_utilizados
FOR EACH ROW EXECUTE FUNCTION update_product_stock();

-- =====================================================
-- FUNÇÃO: Gerar número de protocolo para denúncias
-- =====================================================

CREATE OR REPLACE FUNCTION generate_complaint_protocol()
RETURNS TRIGGER AS $$
DECLARE
    ano VARCHAR(4);
    sequencial VARCHAR(6);
BEGIN
    IF NEW.protocolo IS NULL THEN
        ano := TO_CHAR(NOW(), 'YYYY');
        sequencial := LPAD(
            (SELECT COUNT(*) + 1 FROM denuncias WHERE EXTRACT(YEAR FROM created_at) = EXTRACT(YEAR FROM NOW()))::TEXT,
            6,
            '0'
        );
        NEW.protocolo := 'DEN-' || ano || '-' || sequencial;
    END IF;
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER trg_generate_complaint_protocol
BEFORE INSERT ON denuncias
FOR EACH ROW EXECUTE FUNCTION generate_complaint_protocol();

-- =====================================================
-- FUNÇÃO: Gerar número de receita
-- =====================================================

CREATE OR REPLACE FUNCTION generate_prescription_number()
RETURNS TRIGGER AS $$
DECLARE
    ano VARCHAR(4);
    mes VARCHAR(2);
    sequencial VARCHAR(6);
BEGIN
    IF NEW.numero_receita IS NULL THEN
        ano := TO_CHAR(NOW(), 'YYYY');
        mes := TO_CHAR(NOW(), 'MM');
        sequencial := LPAD(
            (SELECT COUNT(*) + 1 FROM receitas WHERE EXTRACT(YEAR FROM created_at) = EXTRACT(YEAR FROM NOW()))::TEXT,
            6,
            '0'
        );
        NEW.numero_receita := 'REC-' || ano || mes || '-' || sequencial;
    END IF;
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER trg_generate_prescription_number
BEFORE INSERT ON receitas
FOR EACH ROW EXECUTE FUNCTION generate_prescription_number();

-- =====================================================
-- FUNÇÃO: Gerar número de RGA
-- =====================================================

CREATE OR REPLACE FUNCTION generate_rga_number()
RETURNS TRIGGER AS $$
DECLARE
    municipio_sigla VARCHAR(10);
    ano VARCHAR(4);
    sequencial VARCHAR(6);
BEGIN
    IF NEW.numero IS NULL THEN
        -- Buscar sigla do município (primeiras 3 letras)
        SELECT UPPER(SUBSTRING(nome, 1, 3)) INTO municipio_sigla
        FROM municipios WHERE id = NEW.municipality_id;
        
        ano := TO_CHAR(NOW(), 'YYYY');
        sequencial := LPAD(
            (SELECT COUNT(*) + 1 FROM rgas WHERE municipality_id = NEW.municipality_id AND EXTRACT(YEAR FROM created_at) = EXTRACT(YEAR FROM NOW()))::TEXT,
            6,
            '0'
        );
        NEW.numero := 'RGA-' || municipio_sigla || '-' || ano || '-' || sequencial;
    END IF;
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER trg_generate_rga_number
BEFORE INSERT ON rgas
FOR EACH ROW EXECUTE FUNCTION generate_rga_number();

-- =====================================================
-- FUNÇÃO: Atualizar última mensagem da conversa
-- =====================================================

CREATE OR REPLACE FUNCTION update_conversation_last_message()
RETURNS TRIGGER AS $$
BEGIN
    UPDATE conversas_whatsapp
    SET ultima_mensagem_em = NEW.created_at
    WHERE id = NEW.conversa_id;
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER trg_update_conversation_last_message
AFTER INSERT ON mensagens_whatsapp
FOR EACH ROW EXECUTE FUNCTION update_conversation_last_message();

-- =====================================================
-- FUNÇÃO: Log de auditoria automático
-- =====================================================

CREATE OR REPLACE FUNCTION log_audit_trail()
RETURNS TRIGGER AS $$
DECLARE
    current_user_id UUID;
    current_user_role user_role;
BEGIN
    -- Tentar obter user_id do contexto (Supabase Auth)
    BEGIN
        current_user_id := auth.uid();
        SELECT role INTO current_user_role FROM users WHERE id = current_user_id;
    EXCEPTION WHEN OTHERS THEN
        current_user_id := NULL;
        current_user_role := NULL;
    END;
    
    IF TG_OP = 'INSERT' THEN
        INSERT INTO logs_auditoria (
            tabela,
            operacao,
            registro_id,
            user_id,
            user_role,
            dados_novos
        ) VALUES (
            TG_TABLE_NAME,
            'INSERT',
            NEW.id,
            current_user_id,
            current_user_role,
            to_jsonb(NEW)
        );
        RETURN NEW;
        
    ELSIF TG_OP = 'UPDATE' THEN
        INSERT INTO logs_auditoria (
            tabela,
            operacao,
            registro_id,
            user_id,
            user_role,
            dados_anteriores,
            dados_novos
        ) VALUES (
            TG_TABLE_NAME,
            'UPDATE',
            NEW.id,
            current_user_id,
            current_user_role,
            to_jsonb(OLD),
            to_jsonb(NEW)
        );
        RETURN NEW;
        
    ELSIF TG_OP = 'DELETE' THEN
        INSERT INTO logs_auditoria (
            tabela,
            operacao,
            registro_id,
            user_id,
            user_role,
            dados_anteriores
        ) VALUES (
            TG_TABLE_NAME,
            'DELETE',
            OLD.id,
            current_user_id,
            current_user_role,
            to_jsonb(OLD)
        );
        RETURN OLD;
    END IF;
END;
$$ LANGUAGE plpgsql;

-- Aplicar auditoria em tabelas críticas
CREATE TRIGGER trg_audit_animais AFTER INSERT OR UPDATE OR DELETE ON animais
FOR EACH ROW EXECUTE FUNCTION log_audit_trail();

CREATE TRIGGER trg_audit_adocoes AFTER INSERT OR UPDATE OR DELETE ON adocoes
FOR EACH ROW EXECUTE FUNCTION log_audit_trail();

CREATE TRIGGER trg_audit_tutores AFTER INSERT OR UPDATE OR DELETE ON tutores
FOR EACH ROW EXECUTE FUNCTION log_audit_trail();

CREATE TRIGGER trg_audit_users AFTER INSERT OR UPDATE OR DELETE ON users
FOR EACH ROW EXECUTE FUNCTION log_audit_trail();

-- Continua na próxima migration...

