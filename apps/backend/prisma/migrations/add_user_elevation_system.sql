-- Migration: Add User Elevation and Approval System
-- Description: Tables for managing user role elevation requests, adoption applications, and document validation
-- Author: DIBEA Platform
-- Date: 2024-01-15

-- =====================================================
-- ENUM: ElevationRequestStatus
-- =====================================================
CREATE TYPE "ElevationRequestStatus" AS ENUM (
  'PENDING',
  'UNDER_REVIEW',
  'APPROVED',
  'REJECTED',
  'NEEDS_MORE_INFO',
  'CANCELLED'
);

-- =====================================================
-- ENUM: ResidenceType
-- =====================================================
CREATE TYPE "ResidenceType" AS ENUM (
  'CASA_PROPRIA',
  'CASA_ALUGADA',
  'APARTAMENTO_PROPRIO',
  'APARTAMENTO_ALUGADO',
  'FAMILIA'
);

-- =====================================================
-- ENUM: DocumentValidationStatus
-- =====================================================
CREATE TYPE "DocumentValidationStatus" AS ENUM (
  'PENDING',
  'APPROVED',
  'REJECTED',
  'NEEDS_REPLACEMENT'
);

-- =====================================================
-- TABLE: user_elevation_requests
-- =====================================================
CREATE TABLE "user_elevation_requests" (
  "id" UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  "user_id" UUID NOT NULL REFERENCES "usuarios"("id") ON DELETE CASCADE,
  
  -- Elevation details
  "from_role" TEXT NOT NULL,
  "to_role" TEXT NOT NULL DEFAULT 'TUTOR',
  "status" "ElevationRequestStatus" NOT NULL DEFAULT 'PENDING',
  
  -- User-provided information
  "residence_type" "ResidenceType",
  "has_yard" BOOLEAN DEFAULT false,
  "yard_size" TEXT, -- 'PEQUENO' | 'MEDIO' | 'GRANDE'
  "household_members" INTEGER DEFAULT 1,
  "has_children" BOOLEAN DEFAULT false,
  "children_ages" INTEGER[],
  "has_other_pets" BOOLEAN DEFAULT false,
  "other_pets_description" TEXT,
  "monthly_income" DECIMAL(10, 2),
  "work_schedule" TEXT, -- 'INTEGRAL' | 'MEIO_PERIODO' | 'HOME_OFFICE' | 'AUTONOMO'
  "reason_for_adoption" TEXT,
  
  -- Documents (Supabase Storage URLs)
  "documents" JSONB DEFAULT '{}', 
  -- Structure: {
  --   "proof_of_residence": {"url": "...", "uploaded_at": "..."},
  --   "income_proof": {"url": "...", "uploaded_at": "..."},
  --   "id_document": {"url": "...", "uploaded_at": "..."},
  --   "photos": [{"url": "...", "description": "sala", "uploaded_at": "..."}]
  -- }
  
  -- Admin review
  "reviewed_by" UUID REFERENCES "usuarios"("id"),
  "reviewed_at" TIMESTAMP,
  "review_notes" TEXT,
  "document_ratings" JSONB DEFAULT '{}',
  -- Structure: {
  --   "proof_of_residence": {"status": "approved", "notes": "..."},
  --   "income_proof": {"status": "needs_review", "notes": "..."}
  -- }
  "rejection_reason" TEXT,
  "rejection_category" TEXT, -- 'DOCUMENTOS_INVALIDOS' | 'CONDICOES_INADEQUADAS' | 'INFORMACOES_FALSAS' | 'OUTRO'
  
  -- Timestamps
  "created_at" TIMESTAMP NOT NULL DEFAULT NOW(),
  "updated_at" TIMESTAMP NOT NULL DEFAULT NOW()
);

-- Indexes for performance
CREATE INDEX "idx_elevation_user" ON "user_elevation_requests"("user_id");
CREATE INDEX "idx_elevation_status" ON "user_elevation_requests"("status");
CREATE INDEX "idx_elevation_pending" ON "user_elevation_requests"("status") WHERE "status" = 'PENDING';
CREATE INDEX "idx_elevation_reviewed_by" ON "user_elevation_requests"("reviewed_by");
CREATE INDEX "idx_elevation_created_at" ON "user_elevation_requests"("created_at" DESC);

-- =====================================================
-- TABLE: adoption_applications
-- =====================================================
CREATE TABLE "adoption_applications" (
  "id" UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  "animal_id" UUID NOT NULL REFERENCES "animais"("id") ON DELETE CASCADE,
  "applicant_id" UUID NOT NULL REFERENCES "usuarios"("id") ON DELETE CASCADE,
  
  -- Status
  "status" "AdoptionStatus" NOT NULL DEFAULT 'SOLICITADA',
  
  -- Application details
  "reason_for_adoption" TEXT NOT NULL,
  "previous_pet_experience" TEXT,
  "daily_routine" TEXT,
  "time_available" TEXT, -- Horas por dia disponível
  "vacation_plan" TEXT, -- O que fará com o pet nas férias
  "emergency_plan" TEXT,
  "veterinary_budget" DECIMAL(10, 2),
  
  -- Additional documents (beyond elevation docs)
  "additional_documents" JSONB DEFAULT '{}',
  
  -- Home visit (optional but recommended)
  "home_visit_required" BOOLEAN DEFAULT true,
  "home_visit_scheduled_at" TIMESTAMP,
  "home_visit_completed_at" TIMESTAMP,
  "home_visit_approved" BOOLEAN,
  "home_visit_notes" TEXT,
  "home_visit_conducted_by" UUID REFERENCES "usuarios"("id"),
  
  -- Admin decision
  "reviewed_by" UUID REFERENCES "usuarios"("id"),
  "reviewed_at" TIMESTAMP,
  "approval_notes" TEXT,
  "rejection_reason" TEXT,
  
  -- Terms acceptance
  "terms_accepted" BOOLEAN NOT NULL DEFAULT false,
  "terms_accepted_at" TIMESTAMP,
  "terms_ip" TEXT,
  
  -- Timestamps
  "created_at" TIMESTAMP NOT NULL DEFAULT NOW(),
  "updated_at" TIMESTAMP NOT NULL DEFAULT NOW()
);

-- Indexes
CREATE INDEX "idx_adoption_animal" ON "adoption_applications"("animal_id");
CREATE INDEX "idx_adoption_applicant" ON "adoption_applications"("applicant_id");
CREATE INDEX "idx_adoption_status" ON "adoption_applications"("status");
CREATE INDEX "idx_adoption_pending" ON "adoption_applications"("status") WHERE "status" = 'SOLICITADA';
CREATE INDEX "idx_adoption_reviewed_by" ON "adoption_applications"("reviewed_by");
CREATE INDEX "idx_adoption_created_at" ON "adoption_applications"("created_at" DESC);

-- Unique constraint: One active application per user per animal
CREATE UNIQUE INDEX "idx_adoption_active_per_user_animal" 
ON "adoption_applications"("applicant_id", "animal_id") 
WHERE "status" IN ('SOLICITADA', 'EM_ANALISE');

-- =====================================================
-- TABLE: document_validations
-- =====================================================
CREATE TABLE "document_validations" (
  "id" UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  
  -- Source reference
  "source_type" TEXT NOT NULL, -- 'USER_ELEVATION' | 'ADOPTION_APPLICATION' | 'CLINIC_REGISTRATION' | 'VETERINARIAN_LICENSE'
  "source_id" UUID NOT NULL,
  
  -- Document info
  "document_type" TEXT NOT NULL, -- 'PROOF_OF_RESIDENCE' | 'INCOME_PROOF' | 'ID_DOCUMENT' | 'PHOTO' | 'VETERINARY_LICENSE' | 'CLINIC_LICENSE'
  "document_url" TEXT NOT NULL,
  "document_name" TEXT,
  "file_size" BIGINT, -- bytes
  "mime_type" TEXT,
  
  -- Validation
  "status" "DocumentValidationStatus" NOT NULL DEFAULT 'PENDING',
  "validated_by" UUID REFERENCES "usuarios"("id"),
  "validated_at" TIMESTAMP,
  "validation_notes" TEXT,
  "rating" INTEGER CHECK ("rating" >= 1 AND "rating" <= 5),
  
  -- Metadata
  "metadata" JSONB DEFAULT '{}',
  
  -- Timestamps
  "created_at" TIMESTAMP NOT NULL DEFAULT NOW(),
  "updated_at" TIMESTAMP NOT NULL DEFAULT NOW()
);

-- Indexes
CREATE INDEX "idx_document_source" ON "document_validations"("source_type", "source_id");
CREATE INDEX "idx_document_status" ON "document_validations"("status");
CREATE INDEX "idx_document_pending" ON "document_validations"("status") WHERE "status" = 'PENDING';
CREATE INDEX "idx_document_validated_by" ON "document_validations"("validated_by");
CREATE INDEX "idx_document_created_at" ON "document_validations"("created_at" DESC);

-- =====================================================
-- TRIGGER: Update updated_at timestamp
-- =====================================================

-- Function to update updated_at
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Apply trigger to user_elevation_requests
CREATE TRIGGER update_elevation_requests_updated_at
BEFORE UPDATE ON "user_elevation_requests"
FOR EACH ROW
EXECUTE FUNCTION update_updated_at_column();

-- Apply trigger to adoption_applications
CREATE TRIGGER update_adoption_applications_updated_at
BEFORE UPDATE ON "adoption_applications"
FOR EACH ROW
EXECUTE FUNCTION update_updated_at_column();

-- Apply trigger to document_validations
CREATE TRIGGER update_document_validations_updated_at
BEFORE UPDATE ON "document_validations"
FOR EACH ROW
EXECUTE FUNCTION update_updated_at_column();

-- =====================================================
-- FUNCTION: Notify admins of new elevation request
-- =====================================================
CREATE OR REPLACE FUNCTION notify_admins_new_elevation()
RETURNS TRIGGER AS $$
BEGIN
  -- Insert notification for all admins
  INSERT INTO "notificacoes" (
    "user_id",
    "titulo",
    "conteudo",
    "tipo",
    "categoria",
    "prioridade",
    "link_acao"
  )
  SELECT 
    u.id,
    'Nova Solicitação de Elevação',
    CONCAT('Usuário solicitou virar ', NEW.to_role),
    'PROCESSO',
    'ALERTA',
    'ALTA',
    CONCAT('/admin/elevations/', NEW.id)
  FROM "usuarios" u
  WHERE u.role IN ('ADMIN', 'SUPER_ADMIN') AND u.active = true;
  
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Trigger to notify admins
CREATE TRIGGER notify_admins_on_elevation_request
AFTER INSERT ON "user_elevation_requests"
FOR EACH ROW
WHEN (NEW.status = 'PENDING')
EXECUTE FUNCTION notify_admins_new_elevation();

-- =====================================================
-- FUNCTION: Notify admins of new adoption application
-- =====================================================
CREATE OR REPLACE FUNCTION notify_admins_new_adoption()
RETURNS TRIGGER AS $$
DECLARE
  animal_name TEXT;
BEGIN
  -- Get animal name
  SELECT nome INTO animal_name FROM "animais" WHERE id = NEW.animal_id;
  
  -- Insert notification for all admins
  INSERT INTO "notificacoes" (
    "user_id",
    "titulo",
    "conteudo",
    "tipo",
    "categoria",
    "prioridade",
    "link_acao"
  )
  SELECT 
    u.id,
    'Nova Aplicação de Adoção',
    CONCAT('Solicitação de adoção para ', COALESCE(animal_name, 'animal desconhecido')),
    'PROCESSO',
    'INFO',
    'MEDIA',
    CONCAT('/admin/adoptions/', NEW.id)
  FROM "usuarios" u
  WHERE u.role IN ('ADMIN', 'SUPER_ADMIN', 'FUNCIONARIO') AND u.active = true;
  
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Trigger to notify admins
CREATE TRIGGER notify_admins_on_adoption_application
AFTER INSERT ON "adoption_applications"
FOR EACH ROW
WHEN (NEW.status = 'SOLICITADA')
EXECUTE FUNCTION notify_admins_new_adoption();

-- =====================================================
-- FUNCTION: Notify user of elevation decision
-- =====================================================
CREATE OR REPLACE FUNCTION notify_user_elevation_decision()
RETURNS TRIGGER AS $$
BEGIN
  IF NEW.status = 'APPROVED' AND OLD.status != 'APPROVED' THEN
    INSERT INTO "notificacoes" (
      "user_id",
      "titulo",
      "conteudo",
      "tipo",
      "categoria",
      "prioridade",
      "link_acao"
    )
    VALUES (
      NEW.user_id,
      'Solicitação Aprovada! 🎉',
      CONCAT('Parabéns! Você agora é um ', NEW.to_role, '. Você já pode iniciar processos de adoção.'),
      'SISTEMA',
      'SUCESSO',
      'ALTA',
      '/citizen/profile'
    );
  ELSIF NEW.status = 'REJECTED' AND OLD.status != 'REJECTED' THEN
    INSERT INTO "notificacoes" (
      "user_id",
      "titulo",
      "conteudo",
      "tipo",
      "categoria",
      "prioridade",
      "link_acao"
    )
    VALUES (
      NEW.user_id,
      'Solicitação Não Aprovada',
      CONCAT('Sua solicitação não foi aprovada. Motivo: ', COALESCE(NEW.rejection_reason, 'Não especificado')),
      'SISTEMA',
      'ALERTA',
      'ALTA',
      CONCAT('/citizen/elevations/', NEW.id)
    );
  ELSIF NEW.status = 'NEEDS_MORE_INFO' AND OLD.status != 'NEEDS_MORE_INFO' THEN
    INSERT INTO "notificacoes" (
      "user_id",
      "titulo",
      "conteudo",
      "tipo",
      "categoria",
      "prioridade",
      "link_acao"
    )
    VALUES (
      NEW.user_id,
      'Documentos Adicionais Necessários',
      'Precisamos de mais informações para aprovar sua solicitação. Verifique os detalhes.',
      'SISTEMA',
      'INFO',
      'MEDIA',
      CONCAT('/citizen/elevations/', NEW.id)
    );
  END IF;
  
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Trigger to notify user
CREATE TRIGGER notify_user_on_elevation_decision
AFTER UPDATE ON "user_elevation_requests"
FOR EACH ROW
WHEN (OLD.status IS DISTINCT FROM NEW.status)
EXECUTE FUNCTION notify_user_elevation_decision();

-- =====================================================
-- FUNCTION: Auto-elevate user role on approval
-- =====================================================
CREATE OR REPLACE FUNCTION auto_elevate_user_role()
RETURNS TRIGGER AS $$
BEGIN
  IF NEW.status = 'APPROVED' AND OLD.status != 'APPROVED' THEN
    -- Update user role
    UPDATE "usuarios"
    SET 
      role = NEW.to_role::TEXT::"UserRole",
      updated_at = NOW()
    WHERE id = NEW.user_id;
    
    -- If elevating to TUTOR, create tutor profile if doesn't exist
    IF NEW.to_role = 'TUTOR' THEN
      INSERT INTO "tutores" (
        "user_id",
        "nome",
        "cpf",
        "endereco",
        "municipality_id"
      )
      SELECT 
        u.id,
        'Pendente', -- Será preenchido depois
        '', -- Será preenchido depois
        '',
        u.municipality_id
      FROM "usuarios" u
      WHERE u.id = NEW.user_id
      ON CONFLICT (user_id) DO NOTHING;
    END IF;
  END IF;
  
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Trigger to auto-elevate user
CREATE TRIGGER auto_elevate_on_approval
AFTER UPDATE ON "user_elevation_requests"
FOR EACH ROW
WHEN (NEW.status = 'APPROVED' AND OLD.status != 'APPROVED')
EXECUTE FUNCTION auto_elevate_user_role();

-- =====================================================
-- ROW LEVEL SECURITY (RLS) Policies
-- =====================================================

-- Enable RLS
ALTER TABLE "user_elevation_requests" ENABLE ROW LEVEL SECURITY;
ALTER TABLE "adoption_applications" ENABLE ROW LEVEL SECURITY;
ALTER TABLE "document_validations" ENABLE ROW LEVEL SECURITY;

-- User can view their own elevation requests
CREATE POLICY "Users can view own elevation requests"
ON "user_elevation_requests"
FOR SELECT
TO authenticated
USING (user_id = auth.uid());

-- User can create their own elevation requests
CREATE POLICY "Users can create elevation requests"
ON "user_elevation_requests"
FOR INSERT
TO authenticated
WITH CHECK (user_id = auth.uid());

-- Admins can view all elevation requests
CREATE POLICY "Admins can view all elevation requests"
ON "user_elevation_requests"
FOR SELECT
TO authenticated
USING (
  EXISTS (
    SELECT 1 FROM "usuarios"
    WHERE id = auth.uid() AND role IN ('ADMIN', 'SUPER_ADMIN')
  )
);

-- Admins can update elevation requests
CREATE POLICY "Admins can update elevation requests"
ON "user_elevation_requests"
FOR UPDATE
TO authenticated
USING (
  EXISTS (
    SELECT 1 FROM "usuarios"
    WHERE id = auth.uid() AND role IN ('ADMIN', 'SUPER_ADMIN')
  )
);

-- Similar policies for adoption_applications and document_validations
-- (Add more as needed)

-- =====================================================
-- COMMENTS for documentation
-- =====================================================
COMMENT ON TABLE "user_elevation_requests" IS 'Stores requests from users to elevate their role (e.g., CIDADAO to TUTOR)';
COMMENT ON TABLE "adoption_applications" IS 'Stores adoption applications from tutors for specific animals';
COMMENT ON TABLE "document_validations" IS 'Tracks validation status of user-uploaded documents';

COMMENT ON COLUMN "user_elevation_requests"."reviewed_by" IS 'Admin user who reviewed and made the decision';
COMMENT ON COLUMN "user_elevation_requests"."document_ratings" IS 'JSON object with validation status for each document';
COMMENT ON COLUMN "adoption_applications"."home_visit_required" IS 'Whether a home visit is required before approval';
COMMENT ON COLUMN "document_validations"."source_type" IS 'Type of entity this document belongs to';
