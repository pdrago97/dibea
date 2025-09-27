-- DIBEA Database Initialization Script
-- This script creates the initial database structure and extensions

-- Create database if not exists (handled by Docker)
-- CREATE DATABASE IF NOT EXISTS dibea;

-- Enable required extensions
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";
CREATE EXTENSION IF NOT EXISTS "pg_trgm";
CREATE EXTENSION IF NOT EXISTS "unaccent";

-- Create custom types/enums that will be used by Prisma
-- These will be recreated by Prisma migrations, but having them here
-- ensures the database is properly initialized

-- User roles enum
DO $$ BEGIN
    CREATE TYPE user_role AS ENUM ('ADMIN', 'FUNCIONARIO', 'VETERINARIO', 'CIDADAO');
EXCEPTION
    WHEN duplicate_object THEN null;
END $$;

-- Animal species enum
DO $$ BEGIN
    CREATE TYPE animal_species AS ENUM ('CANINO', 'FELINO', 'OUTROS');
EXCEPTION
    WHEN duplicate_object THEN null;
END $$;

-- Animal sex enum
DO $$ BEGIN
    CREATE TYPE animal_sex AS ENUM ('MACHO', 'FEMEA');
EXCEPTION
    WHEN duplicate_object THEN null;
END $$;

-- Animal size enum
DO $$ BEGIN
    CREATE TYPE animal_size AS ENUM ('PEQUENO', 'MEDIO', 'GRANDE');
EXCEPTION
    WHEN duplicate_object THEN null;
END $$;

-- Animal status enum
DO $$ BEGIN
    CREATE TYPE animal_status AS ENUM ('DISPONIVEL', 'ADOTADO', 'TRATAMENTO', 'OBITO', 'PERDIDO');
EXCEPTION
    WHEN duplicate_object THEN null;
END $$;

-- Tutor status enum
DO $$ BEGIN
    CREATE TYPE tutor_status AS ENUM ('ATIVO', 'INATIVO', 'BLACKLIST');
EXCEPTION
    WHEN duplicate_object THEN null;
END $$;

-- Housing type enum
DO $$ BEGIN
    CREATE TYPE housing_type AS ENUM ('CASA', 'APARTAMENTO', 'SITIO', 'OUTROS');
EXCEPTION
    WHEN duplicate_object THEN null;
END $$;

-- Adoption status enum
DO $$ BEGIN
    CREATE TYPE adoption_status AS ENUM ('PENDENTE', 'EM_ANALISE', 'APROVADA', 'REJEITADA', 'CANCELADA');
EXCEPTION
    WHEN duplicate_object THEN null;
END $$;

-- Complaint status enum
DO $$ BEGIN
    CREATE TYPE complaint_status AS ENUM ('ABERTA', 'EM_ANDAMENTO', 'RESOLVIDA', 'FECHADA');
EXCEPTION
    WHEN duplicate_object THEN null;
END $$;

-- Complaint type enum
DO $$ BEGIN
    CREATE TYPE complaint_type AS ENUM ('MAUS_TRATOS', 'ABANDONO', 'ANIMAL_PERDIDO', 'OUTROS');
EXCEPTION
    WHEN duplicate_object THEN null;
END $$;

-- Create indexes for better performance
-- These will be managed by Prisma, but having them here as reference

-- Function to generate QR codes (placeholder)
CREATE OR REPLACE FUNCTION generate_qr_code()
RETURNS TEXT AS $$
BEGIN
    RETURN 'QR_' || EXTRACT(EPOCH FROM NOW())::TEXT || '_' || (RANDOM() * 1000000)::INTEGER::TEXT;
END;
$$ LANGUAGE plpgsql;

-- Function to generate protocol numbers
CREATE OR REPLACE FUNCTION generate_protocol()
RETURNS TEXT AS $$
BEGIN
    RETURN 'PROT_' || TO_CHAR(NOW(), 'YYYYMMDD') || '_' || LPAD((RANDOM() * 999999)::INTEGER::TEXT, 6, '0');
END;
$$ LANGUAGE plpgsql;

-- Create audit log function
CREATE OR REPLACE FUNCTION audit_trigger_function()
RETURNS TRIGGER AS $$
BEGIN
    IF TG_OP = 'INSERT' THEN
        INSERT INTO audit_logs (table_name, operation, new_data, user_id, created_at)
        VALUES (TG_TABLE_NAME, TG_OP, row_to_json(NEW), NEW.created_by, NOW());
        RETURN NEW;
    ELSIF TG_OP = 'UPDATE' THEN
        INSERT INTO audit_logs (table_name, operation, old_data, new_data, user_id, created_at)
        VALUES (TG_TABLE_NAME, TG_OP, row_to_json(OLD), row_to_json(NEW), NEW.updated_by, NOW());
        RETURN NEW;
    ELSIF TG_OP = 'DELETE' THEN
        INSERT INTO audit_logs (table_name, operation, old_data, user_id, created_at)
        VALUES (TG_TABLE_NAME, TG_OP, row_to_json(OLD), OLD.created_by, NOW());
        RETURN OLD;
    END IF;
    RETURN NULL;
END;
$$ LANGUAGE plpgsql;

-- Grant necessary permissions
GRANT ALL PRIVILEGES ON DATABASE dibea TO dibea_user;
GRANT ALL PRIVILEGES ON ALL TABLES IN SCHEMA public TO dibea_user;
GRANT ALL PRIVILEGES ON ALL SEQUENCES IN SCHEMA public TO dibea_user;
GRANT ALL PRIVILEGES ON ALL FUNCTIONS IN SCHEMA public TO dibea_user;

-- Set default privileges for future objects
ALTER DEFAULT PRIVILEGES IN SCHEMA public GRANT ALL ON TABLES TO dibea_user;
ALTER DEFAULT PRIVILEGES IN SCHEMA public GRANT ALL ON SEQUENCES TO dibea_user;
ALTER DEFAULT PRIVILEGES IN SCHEMA public GRANT ALL ON FUNCTIONS TO dibea_user;
