# DIBEA Database Schema Documentation

This document provides a comprehensive overview of the DIBEA (Digital Platform for Animal Welfare) database schema and entities.

## Overview

The DIBEA system manages animal welfare operations for municipalities, including animal registration, adoptions, veterinary care, campaigns, and complaint management. The database is hosted on Supabase (PostgreSQL) and uses Prisma as the ORM.

**Database**: `dibea` (Supabase Project ID: `xptonqqagxcpzlgndilj`)  
**Region**: us-east-2

---

## Core Entities

### 1. Animals (animais)

The central entity representing animals in the system.

**Table**: `animais`

| Column | Type | Nullable | Description |
|--------|------|----------|-------------|
| id | text | NO | Primary key (UUID) |
| nome | text | NO | Animal's name |
| especie | enum | NO | Species: CANINO, FELINO, OUTROS |
| raca | text | YES | Breed (nullable for mixed breeds) |
| sexo | enum | NO | Sex: MACHO, FEMEA |
| porte | enum | NO | Size: PEQUENO, MEDIO, GRANDE |
| data_nascimento | timestamp | YES | Date of birth |
| peso | numeric | YES | Weight in kg |
| cor | text | YES | Color/coat description |
| temperamento | text | YES | Temperament description |
| observacoes | text | YES | General observations |
| status | enum | NO | Status: DISPONIVEL, ADOTADO, EM_TRATAMENTO, OBITO, PERDIDO |
| qr_code | text | YES | QR code identifier |
| microchip_id | text | YES | Microchip identifier |
| localizacao_atual | text | YES | Current location description |
| endereco_completo | text | YES | Full address |
| numero | text | YES | Address number |
| complemento | text | YES | Address complement |
| bairro | text | YES | Neighborhood |
| cep | text | YES | Postal code |
| cidade | text | YES | City |
| estado | text | YES | State |
| latitude | numeric | YES | GPS latitude |
| longitude | numeric | YES | GPS longitude |
| municipality_id | text | YES | Foreign key to municipios |
| current_tutor_id | text | YES | Foreign key to current tutor |
| current_clinic_id | text | YES | Foreign key to current clinic |
| created_at | timestamp | NO | Creation timestamp |
| updated_at | timestamp | NO | Last update timestamp |

**Current Data**: 11 animals registered

**Relationships**:
- Belongs to: `municipios` (municipality)
- Has many: `fotos_animal` (photos)
- Has many: `atendimentos` (veterinary appointments)
- Has many: `adocoes` (adoptions)
- Has many: `animal_events` (events)
- Has many: `animal_locations` (location history)

---

### 2. Animal Photos (fotos_animal)

Stores photos for animals.

**Table**: `fotos_animal`

| Column | Type | Nullable | Description |
|--------|------|----------|-------------|
| id | text | NO | Primary key (UUID) |
| animal_id | text | NO | Foreign key to animais |
| url | text | NO | Photo URL (Supabase Storage) |
| nome_arquivo | text | YES | Original filename |
| ordem | integer | NO | Display order |
| principal | boolean | NO | Is primary photo |
| created_at | timestamp | NO | Upload timestamp |

**Current Data**: 0 photos (needs to be populated)

---

### 3. Municipalities (municipios)

Represents municipalities using the system.

**Table**: `municipios`

| Column | Type | Nullable | Description |
|--------|------|----------|-------------|
| id | text | NO | Primary key (UUID) |
| nome | text | NO | Municipality name |

**Current Data**: 1 municipality (Biguaçu)

**Relationships**:
- Has many: `animais` (animals)
- Has many: `tutores` (guardians)
- Has many: `campanhas` (campaigns)
- Has many: `denuncias` (complaints)
- Has many: `atendimentos` (appointments)

---

### 4. Guardians/Tutors (tutores)

People who adopt or care for animals.

**Table**: `tutores`

| Column | Type | Nullable | Description |
|--------|------|----------|-------------|
| id | text | NO | Primary key (UUID) |
| user_id | text | NO | Foreign key to users |
| cpf | text | NO | Brazilian tax ID |
| rg | text | YES | National ID |
| nome | text | NO | Full name |
| email | text | YES | Email address |
| telefone | text | YES | Phone number |
| endereco_completo | text | YES | Full address |
| cep | text | YES | Postal code |
| cidade | text | YES | City |
| estado | text | YES | State |
| tipo_moradia | text | YES | Housing type |
| tem_experiencia | boolean | NO | Has pet experience |
| tem_outros_pets | boolean | NO | Has other pets |
| tem_quintal | boolean | NO | Has yard |
| cpf_verified | boolean | NO | CPF verification status |
| background_check_status | text | NO | Background check status |
| status | text | NO | Tutor status |
| municipality_id | text | NO | Foreign key to municipios |
| observacoes | text | YES | Observations |
| created_at | timestamp | NO | Creation timestamp |
| updated_at | timestamp | NO | Last update timestamp |

**Relationships**:
- Belongs to: `users`, `municipios`
- Has many: `adocoes` (adoptions)

---

### 5. Adoptions (adocoes)

Tracks adoption processes.

**Table**: `adocoes`

| Column | Type | Nullable | Description |
|--------|------|----------|-------------|
| id | text | NO | Primary key (UUID) |
| animal_id | text | NO | Foreign key to animais |
| tutor_id | text | NO | Foreign key to tutores |
| funcionario_id | text | YES | Staff member who processed |
| data_solicitacao | timestamp | NO | Request date |
| data_aprovacao | timestamp | YES | Approval date |
| data_entrega | timestamp | YES | Delivery date |
| motivo_interesse | text | YES | Reason for interest |
| observacoes_entrevista | text | YES | Interview notes |
| motivo_rejeicao | text | YES | Rejection reason |
| status | enum | NO | Status (PENDENTE, APROVADO, REJEITADO, etc.) |
| created_at | timestamp | NO | Creation timestamp |
| updated_at | timestamp | NO | Last update timestamp |

**Relationships**:
- Belongs to: `animais`, `tutores`, `users` (funcionario)

---

### 6. Adoption Applications (adoption_applications)

Alternative adoption application system.

**Table**: `adoption_applications`

Similar to `adocoes` but may be used for a different workflow.

---

### 7. Veterinary Appointments (atendimentos)

Medical appointments and treatments for animals.

**Table**: `atendimentos`

| Column | Type | Nullable | Description |
|--------|------|----------|-------------|
| id | text | NO | Primary key (UUID) |
| animal_id | text | NO | Foreign key to animais |
| veterinario_id | text | NO | Veterinarian user ID |
| tipo | text | NO | Appointment type |
| data_atendimento | timestamp | NO | Appointment date |
| peso_animal | numeric | YES | Animal weight at visit |
| temperatura | numeric | YES | Temperature |
| frequencia_cardiaca | integer | YES | Heart rate |
| frequencia_respiratoria | integer | YES | Respiratory rate |
| queixa_principal | text | YES | Main complaint |
| historico_doenca_atual | text | YES | Current illness history |
| exame_fisico | text | YES | Physical examination |
| diagnostico_presuntivo | text | YES | Presumptive diagnosis |
| diagnostico_definitivo | text | YES | Definitive diagnosis |
| cid_veterinario | text | YES | Veterinary ICD code |
| conduta | text | NO | Treatment plan |
| observacoes | text | YES | Observations |
| retorno_recomendado | timestamp | YES | Recommended return date |
| status | text | NO | Appointment status |
| agendamento_id | text | YES | Related scheduling ID |
| municipality_id | text | NO | Foreign key to municipios |
| created_at | timestamp | NO | Creation timestamp |
| updated_at | timestamp | NO | Last update timestamp |

**Relationships**:
- Belongs to: `animais`, `users` (veterinario), `municipios`
- Has many: `laudos` (medical reports)
- Has many: `receitas` (prescriptions)

---

### 8. Campaigns (campanhas)

Vaccination and sterilization campaigns.

**Table**: `campanhas`

| Column | Type | Nullable | Description |
|--------|------|----------|-------------|
| id | text | NO | Primary key (UUID) |
| nome | text | NO | Campaign name |
| tipo | text | NO | Campaign type (VACINACAO, CASTRACAO, etc.) |
| descricao | text | YES | Description |
| data_inicio | timestamp | NO | Start date |
| data_fim | timestamp | NO | End date |
| local | text | NO | Location name |
| endereco | text | NO | Address |
| latitude | numeric | YES | GPS latitude |
| longitude | numeric | YES | GPS longitude |
| horarios_config | jsonb | NO | Schedule configuration |
| vagas_total | integer | NO | Total slots |
| vagas_ocupadas | integer | NO | Occupied slots |
| lista_espera | boolean | NO | Has waiting list |
| valor | numeric | YES | Cost (if not free) |
| gratuita | boolean | NO | Is free |
| requisitos | text[] | YES | Requirements array |
| publico_alvo | text | NO | Target audience |
| status | enum | NO | Campaign status |
| municipality_id | text | NO | Foreign key to municipios |
| created_by | text | NO | Creator user ID |
| created_at | timestamp | NO | Creation timestamp |
| updated_at | timestamp | NO | Last update timestamp |

**Relationships**:
- Belongs to: `municipios`, `users` (created_by)
- Has many: `campanha_slots` (time slots)
- Has many: `inscricoes_campanha` (registrations)

---

### 9. Complaints (denuncias)

Animal abuse or neglect complaints.

**Table**: `denuncias`

| Column | Type | Nullable | Description |
|--------|------|----------|-------------|
| id | text | NO | Primary key (UUID) |
| protocolo | text | NO | Protocol number |
| tipo | text | NO | Complaint type |
| descricao | text | NO | Description |
| localizacao | text | NO | Location |
| latitude | numeric | YES | GPS latitude |
| longitude | numeric | YES | GPS longitude |
| denunciante_nome | text | YES | Reporter name (optional) |
| denunciante_telefone | text | YES | Reporter phone |
| denunciante_email | text | YES | Reporter email |
| fotos | text[] | YES | Photo URLs array |
| status | enum | NO | Status (PENDENTE, EM_ANALISE, RESOLVIDA, etc.) |
| prioridade | text | NO | Priority level |
| responsavel_id | text | YES | Assigned staff member |
| data_atribuicao | timestamp | YES | Assignment date |
| resolucao | text | YES | Resolution description |
| data_resolucao | timestamp | YES | Resolution date |
| municipality_id | text | NO | Foreign key to municipios |
| created_at | timestamp | NO | Creation timestamp |
| updated_at | timestamp | NO | Last update timestamp |

**Relationships**:
- Belongs to: `municipios`, `users` (responsavel)

---

## Supporting Entities

### Users (users)
System users (staff, veterinarians, administrators).

### Clinics (clinicas)
Veterinary clinics in the system.

### Microchips (microchips)
Microchip registration and tracking.

### RGAs (rgas)
Animal General Registry (Registro Geral Animal).

### Medical Reports (laudos)
Detailed medical examination reports.

### Prescriptions (receitas)
Medication prescriptions.

### Medications (medicamentos)
Medication catalog.

### Products Used (produtos_utilizados)
Products/medications used in treatments.

### Products (produtos)
Product catalog.

### Notifications (notificacoes)
System notifications for users.

### Notification Preferences (preferencias_notificacao)
User notification settings.

### WhatsApp Conversations (conversas_whatsapp)
WhatsApp integration for communication.

### WhatsApp Messages (mensagens_whatsapp)
Individual WhatsApp messages.

### Agent Interactions (agent_interactions)
AI agent conversation logs.

### Conversation Contexts (conversation_contexts)
AI conversation context storage.

### Agent Metrics (agent_metrics)
AI agent performance metrics.

### System Analytics (system_analytics)
System usage analytics.

### Audit Logs (logs_auditoria)
System audit trail.

---

## Data Status Summary

Based on current database state:

- **Animals**: 11 registered
  - Species: CANINO (dogs), FELINO (cats)
  - Statuses: DISPONIVEL, ADOTADO
  - All linked to Biguaçu municipality
  
- **Photos**: 0 (needs population)
- **Municipalities**: 1 (Biguaçu)
- **Tutors**: Data exists
- **Adoptions**: Data exists
- **Campaigns**: Data exists
- **Complaints**: Data exists

---

## Key Relationships

```
municipios (1) ──< (N) animais
animais (1) ──< (N) fotos_animal
animais (1) ──< (N) atendimentos
animais (1) ──< (N) adocoes
tutores (1) ──< (N) adocoes
users (1) ──< (N) atendimentos (as veterinario)
municipios (1) ──< (N) campanhas
municipios (1) ──< (N) denuncias
```

---

## Notes

1. **Municipality Relationship**: Most entities are scoped to a municipality via `municipality_id`
2. **Photo Storage**: Photos are stored in Supabase Storage, with URLs in the database
3. **Enums**: Several fields use PostgreSQL enums (especie, sexo, porte, status, etc.)
4. **Timestamps**: All entities have `created_at` and `updated_at` for audit trails
5. **Soft Deletes**: Status fields are used instead of hard deletes in most cases

