# 🔍 DIBEA - Cleanup & User Journey Analysis

**Date:** January 2025  
**Purpose:** Identify non-essential files for deletion and document user journeys  
**Status:** 🚨 CRITICAL ISSUES FOUND

---

## 🚨 CRITICAL ISSUES TO FIX FIRST

### 1. **Backend Won't Compile** 🔴
**File:** `apps/backend/src/controllers/notificationController.ts`

**Errors:** 24 TypeScript errors related to Prisma schema mismatch:
- `priority` field doesn't exist in NotificationOrderByWithRelationInput
- `name` field doesn't exist in UserSelect
- `actionData`, `actionUrl`, `actionType` fields don't exist in Notification model
- `status` field issues
- `readAt` property issues

**Root Cause:** The notificationController is trying to use fields that don't exist in the Prisma schema.

**Action Required:** 
- Option A: Update Prisma schema to include missing fields
- Option B: Update notificationController to use existing schema fields
- **Recommended:** Option B - Fix controller to match existing schema

---

## 📁 NON-ESSENTIAL FILES ANALYSIS

### **Category 1: Redundant Documentation** 🗂️

#### Files to DELETE (Root Directory):
```
✂️ DIBEA_ADVANCED_FEATURES_EXPANSION.md          (36KB - feature brainstorm, not current status)
✂️ DIBEA_CHAT_CONVERSATION_FLOWS.md              (11KB - superseded by implementation)
✂️ DIBEA_CHAT_IMPLEMENTATION_SUMMARY.md          (10KB - outdated summary)
✂️ DIBEA_CHAT_PERMISSIONS_MAPPING.md             (23KB - can be consolidated)
✂️ DIBEA_COMPLETE_FEATURE_SUMMARY.md             (10KB - redundant with README)
✂️ DIBEA_EDGE_FUNCTIONS_IMPLEMENTATION_PLAN.md   (13KB - plan, not current status)
✂️ IMPLEMENTATION_SUMMARY.md                     (10KB - outdated)
✂️ LIMPEZA_DOCUMENTACAO.md                       (4KB - cleanup notes, not needed)
✂️ N8N_ACTION_FIX.md                             (7KB - temporary fix notes)
✂️ N8N_INTEGRATION_STATUS.md                     (7KB - status notes)
✂️ N8N_QUERY_FIX.md                              (7KB - temporary fix notes)
✂️ QUICK_COMMANDS.md                             (8KB - redundant with README)
✂️ QUICK_START_CHECKLIST.md                      (7KB - redundant with SETUP_GUIDE)
✂️ README_CHAT_IMPLEMENTATION.md                 (16KB - superseded)
✂️ SECURITY_FIXES_SUMMARY.md                     (7KB - temporary notes)
✂️ MANUAL_SETUP_GUIDE.md                         (7KB - redundant with SETUP_GUIDE)
✂️ SUPABASE_SCHEMA_REFERENCE.md                  (7KB - redundant, schema is in Prisma)
```

**Total to Delete:** 17 files, ~200KB

#### Files to KEEP (Root Directory):
```
✅ README.md                    - Main documentation
✅ AGENTS.md                    - Agent guidelines (active)
✅ SETUP_GUIDE.md               - Setup instructions
✅ SECURITY.md                  - Security policies
```

#### Files in `/docs` to DELETE:
```
✂️ docs/DIBEA_GIT_DIFF_ANALYSIS.md       - Temporary analysis
✂️ docs/DIBEA_TECHNICAL_STATUS.md        - Outdated status
✂️ docs/ENV_FILES_UPDATE_SUMMARY.md      - Temporary notes
✂️ docs/AUGMENT_VS_OPENCODE.md           - Tool comparison, not relevant
✂️ docs/OPENCODE_MCP_SETUP.md            - Specific tool setup
✂️ docs/README_DOCUMENTATION.md          - Meta documentation
✂️ docs/CONTEXT_ENGINEERING_DIBEA.md     - Outdated context
```

#### Files in `/docs` to KEEP:
```
✅ docs/DIBEA_MVP_ROADMAP.md             - Current roadmap
✅ docs/DIBEA_UX_ANALYSIS.md             - UX analysis
✅ docs/DIBEA_SUPABASE_REFERENCE.md      - Active reference
✅ docs/SUPABASE_CREDENTIALS_GUIDE.md    - Setup guide
✅ docs/DIBEA_ACTION_PLAN.md             - Current plan
✅ docs/ERD_DIBEA.md                     - Database diagram
✅ docs/SISTEMA_NAVEGACAO_VISUAL.md      - Navigation system
✅ docs/REQUISITOS_E_ESPECIFICACOES.md   - Requirements
✅ docs/IMPLEMENTACAO_E_DEPLOY.md        - Deploy guide
```

### **Category 2: Redundant Server Files** 🖥️

#### Files to DELETE (Backend):
```
✂️ apps/backend/src/demo-server.ts      - Demo/testing server
✂️ apps/backend/src/simple-server.ts    - Simplified server for testing
✂️ apps/backend/src/test-server.ts      - Test server
✂️ apps/backend/src/real-server.ts      - Redundant if index.ts is main
```

**Note:** Check which server file is actually used by `package.json` before deleting.

#### Files to KEEP:
```
✅ apps/backend/src/index.ts            - Main entry point
```

### **Category 3: Redundant Scripts** 🔧

#### Scripts to DELETE:
```
✂️ scripts/setup-opencode.sh            - Specific tool setup
✂️ scripts/deploy-rag.sh                - RAG not in MVP
✂️ test-integration.sh                  - Root level, should be in scripts/
```

#### Scripts to KEEP:
```
✅ scripts/setup-storage.sh
✅ scripts/setup-git-hooks.sh
✅ scripts/validate-supabase-credentials.sh
✅ apps/backend/docker-entrypoint.sh
```

### **Category 4: N8N Workflows** 🤖

#### Files to REVIEW (Keep for now, but may need cleanup):
```
⚠️ n8n/N8N_UPDATE_GUIDE.md
⚠️ n8n/N8N_INTEGRATION_GUIDE.md
⚠️ n8n/VALIDATION_SUMMARY.md
⚠️ n8n/N8N_TEST_PLAN.md
⚠️ n8n/USE_CASES_EXAMPLES.md
```

---

## 👥 USER TYPES & THEIR JOURNEYS

### Overview of User Roles

| Role | Portuguese | Access | Primary Interface |
|------|-----------|--------|-------------------|
| **CIDADAO** | Cidadão | Public | WhatsApp, Web (read-only) |
| **TUTOR** | Tutor/Adotante | Authenticated | Web, WhatsApp |
| **FUNCIONARIO** | Funcionário Municipal | Authenticated | Web (admin panel) |
| **VETERINARIO** | Veterinário | Authenticated | Web (medical panel) |
| **ADMIN** | Administrador Municipal | Authenticated | Web (full admin) |
| **SUPER_ADMIN** | Super Administrador | Authenticated | Web (platform admin) |

---

### 🔵 1. CIDADAO (Citizen) Journey

**Description:** General public, non-authenticated users

#### **Available Actions:**
- 🔍 Browse available animals (read-only)
- 💬 Chat with AI bot (WhatsApp or Web)
- 📋 View animal details
- 📢 View public campaigns
- 📱 Register to become a TUTOR

#### **User Flow:**
```
1. Access Website/WhatsApp
   ↓
2. Browse Animals
   ├── Filter by species, size, age
   ├── View animal cards (photo, name, basic info)
   └── Click to see details
   ↓
3. View Animal Details
   ├── Photos gallery
   ├── Description
   ├── Temperament
   └── Health status
   ↓
4. Want to Adopt?
   ├── Register as TUTOR
   └── Start adoption process
```

#### **Current Pages:**
- `/` - Home page
- `/animals` - Animal listing (PUBLIC)
- `/animals/[id]` - Animal details (PUBLIC)
- `/animals/search` - Search page
- `/auth/register` - Register as citizen

#### **Missing Features:**
- ❌ Public campaign calendar
- ❌ Animal filtering by temperament
- ❌ "Favorite" animals (requires login)
- ❌ Share animal on social media

---

### 🟢 2. TUTOR (Adopter/Guardian) Journey

**Description:** Registered users who adopted or want to adopt animals

#### **Available Actions:**
- 🐕 View/manage adopted animals
- 📋 Start adoption process
- 📅 Schedule appointments (vet visits, campaigns)
- 📄 Upload documents (ID, address proof)
- 💬 Chat with staff
- 🔔 Receive notifications
- 📱 View RGA (Animal Registration)

#### **User Flow - Adoption:**
```
1. Login as TUTOR
   ↓
2. Browse Animals
   ↓
3. Click "Adopt"
   ↓
4. Fill Adoption Form
   ├── Personal info (CPF, RG, address)
   ├── Housing info (type, has yard, other pets)
   └── Upload documents
   ↓
5. Submit Application
   ↓
6. Wait for FUNCIONARIO approval
   ↓
7. Receive notification (approved/rejected)
   ↓
8. If approved: Schedule visit/pickup
   ↓
9. Complete adoption
   ↓
10. Animal appears in "My Animals"
```

#### **Current Pages:**
- `/citizen/dashboard` - Main dashboard
- `/citizen/dashboard-simple` - Simplified dashboard
- `/citizen/animals` - My animals
- `/citizen/profile` - Profile management
- `/citizen/adoption/start/[animalId]` - Adoption form
- `/notifications` - Notifications center
- `/notifications/[id]` - Notification details

#### **Missing Features:**
- ❌ Document upload interface
- ❌ Adoption status tracking
- ❌ Appointment scheduling UI
- ❌ RGA certificate download
- ❌ Animal health history view
- ❌ Edit profile information

---

### 🟡 3. FUNCIONARIO (Municipal Staff) Journey

**Description:** Municipal employees managing operations

#### **Available Actions:**
- 📋 Review adoption applications
- ✅ Approve/reject adoptions
- 🐕 Register new animals
- 📸 Upload animal photos
- 📅 Manage appointments
- 💉 Manage campaigns (vaccination, castration)
- 📞 Transfer WhatsApp conversations
- 📊 View operational metrics
- 🔔 Send notifications

#### **User Flow - Adoption Review:**
```
1. Login as FUNCIONARIO
   ↓
2. Dashboard shows pending adoptions
   ↓
3. Click adoption request
   ↓
4. Review Application
   ├── Tutor information
   ├── Housing suitability
   ├── Documents
   └── Background check
   ↓
5. Decision
   ├── ✅ Approve → Schedule delivery
   ├── ❌ Reject → Add reason
   └── 💬 Request more info
   ↓
6. Notify tutor
   ↓
7. Update animal status
```

#### **Current Pages:**
- `/staff/dashboard` - Staff dashboard
- `/admin/animals` - Animal management
- `/admin/chat` - Chat management
- `/dashboard` - Generic dashboard

#### **Missing Features:**
- ❌ Adoption approval workflow
- ❌ Document review interface
- ❌ Campaign management UI
- ❌ Batch notifications
- ❌ Appointment calendar
- ❌ Task management system

---

### 🟣 4. VETERINARIO (Veterinarian) Journey

**Description:** Veterinarians providing medical care

#### **Available Actions:**
- 🩺 Conduct medical examinations (Attendance)
- 💊 Prescribe medications (Receita)
- 📄 Create medical reports (Laudo)
- 📅 View appointments
- 🐕 View animal medical history
- 📊 Track treatments
- 🔬 Record lab results

#### **User Flow - Medical Attendance:**
```
1. Login as VETERINARIO
   ↓
2. View scheduled appointments
   ↓
3. Start attendance
   ↓
4. Record Examination
   ├── Weight, temperature
   ├── Heart rate, respiratory rate
   ├── Main complaint
   └── Physical exam findings
   ↓
5. Diagnosis
   ├── Presumptive diagnosis
   ├── Definitive diagnosis
   └── CID code
   ↓
6. Treatment
   ├── Create prescription
   ├── Record procedures
   └── Schedule follow-up
   ↓
7. Generate Documents
   ├── PDF prescription
   └── Medical report
   ↓
8. Update animal record
```

#### **Current Pages:**
- `/vet/dashboard` - Vet dashboard

#### **Missing Features:**
- ❌ Attendance form
- ❌ Prescription creation
- ❌ Medical report generation
- ❌ Animal medical history timeline
- ❌ Lab results upload
- ❌ Appointment calendar
- ❌ Treatment tracking

---

### 🔴 5. ADMIN (Municipal Administrator) Journey

**Description:** Municipality administrators with full access

#### **Available Actions:**
- 👥 Manage all users (CRUD)
- 🐕 Manage all animals
- 📋 Manage all adoptions
- 💉 Create/manage campaigns
- 🏥 Manage clinics
- 📊 View analytics and reports
- ⚙️ Configure municipality settings
- 🤖 Manage AI agents
- 📢 Handle complaints
- 💾 Export data

#### **User Flow - User Management:**
```
1. Login as ADMIN
   ↓
2. Access Admin Dashboard
   ↓
3. Click "User Management"
   ↓
4. View all users
   ├── Filter by role
   ├── Search by name/email
   └── Sort by registration date
   ↓
5. Actions
   ├── Create new user
   ├── Edit user
   ├── Deactivate user
   └── Change role
   ↓
6. Assign municipality (if needed)
```

#### **Current Pages:**
- `/admin/dashboard` - Admin dashboard
- `/admin/users` - User management
- `/admin/animals` - Animal management
- `/admin/chat` - Chat management
- `/admin/agents` - AI agents management
- `/admin/analytics` - Analytics
- `/admin/clinics` - Clinics management

#### **Missing Features:**
- ❌ Campaign creation wizard
- ❌ Complaint management system
- ❌ Municipality settings page
- ❌ Bulk operations
- ❌ Data export functionality
- ❌ Audit log viewer

---

### 🟠 6. SUPER_ADMIN (Platform Administrator) Journey

**Description:** Platform-level administrators managing multiple municipalities

#### **Available Actions:**
- 🏛️ Manage municipalities (CRUD)
- 👥 Manage all users across municipalities
- 📊 View platform-wide analytics
- ⚙️ Configure platform settings
- 🔐 Security and access control
- 💾 Database management
- 🤖 Manage AI agents globally
- 📈 Monitor system health

#### **User Flow - Municipality Management:**
```
1. Login as SUPER_ADMIN
   ↓
2. View all municipalities
   ↓
3. Create new municipality
   ├── Municipality info (name, CNPJ)
   ├── Contact details
   ├── Initial admin user
   └── Settings/configuration
   ↓
4. Activate municipality
   ↓
5. Monitor usage
   ├── Number of animals
   ├── Number of users
   ├── Number of adoptions
   └── System usage
   ↓
6. Provide support
```

#### **Current Pages:**
- `/admin/dashboard` - Uses admin dashboard (needs separate super_admin dashboard)

#### **Missing Features:**
- ❌ Municipality management interface
- ❌ Platform-wide analytics
- ❌ Cross-municipality reports
- ❌ System monitoring dashboard
- ❌ Configuration management
- ❌ Billing/subscription management (if SaaS)

---

## 🚨 CRITICAL FINDINGS

### **1. Incomplete User Journeys**

| User Type | Completion | Critical Gaps |
|-----------|-----------|---------------|
| CIDADAO | 70% | ❌ Registration flow incomplete |
| TUTOR | 40% | ❌ Document upload, ❌ Adoption tracking |
| FUNCIONARIO | 30% | ❌ Adoption approval, ❌ Campaign management |
| VETERINARIO | 20% | ❌ Attendance form, ❌ Prescriptions |
| ADMIN | 50% | ❌ Campaign wizard, ❌ Reports |
| SUPER_ADMIN | 10% | ❌ Municipality management |

### **2. Missing Core Features**
- ❌ Document upload system (Tutor → Funcionario workflow)
- ❌ Adoption approval workflow
- ❌ Medical attendance system (Veterinarian)
- ❌ Campaign management
- ❌ Email/SMS notifications
- ❌ Multi-tenant isolation (Super Admin)

### **3. Frontend-Backend Mismatch**
- Frontend has pages that reference backend endpoints that may not exist
- Backend has controllers with Prisma schema mismatches
- Authentication middleware exists but may not be properly applied to all routes

---

## 📋 RECOMMENDED ACTIONS

### **Phase 1: Fix Critical Issues** (Week 1)
```
1. ✅ Fix notificationController.ts TypeScript errors
2. ✅ Verify backend compiles and runs
3. ✅ Test authentication flow
4. ✅ Test animal CRUD operations
```

### **Phase 2: Clean Up Files** (Week 1)
```
1. ✅ Delete 17 redundant documentation files from root
2. ✅ Delete 7 files from docs/
3. ✅ Delete demo/test server files (after verifying main server)
4. ✅ Consolidate remaining docs into README.md and docs/
```

### **Phase 3: Complete User Journeys** (Weeks 2-6)
```
Priority 1: TUTOR Journey
- Document upload interface
- Adoption status tracking
- Profile editing

Priority 2: FUNCIONARIO Journey
- Adoption approval workflow
- Animal registration form
- Campaign management

Priority 3: VETERINARIO Journey
- Medical attendance form
- Prescription generation
- Medical history view

Priority 4: ADMIN Journey
- User management CRUD
- Campaign wizard
- Reports/analytics

Priority 5: SUPER_ADMIN Journey
- Municipality management
- Platform analytics
```

### **Phase 4: Testing & Documentation** (Week 7)
```
1. Write unit tests for controllers
2. Write integration tests for user journeys
3. Update documentation based on actual implementation
4. Create user guides for each role
```

---

## 📊 FILE CLEANUP SUMMARY

### **Files to Delete:** 27 files
- 17 root-level markdown files (~200KB)
- 7 docs/ markdown files (~50KB)
- 3 backend server files (~75KB)

### **Files to Keep:** ~12 essential docs
- README.md
- AGENTS.md
- SETUP_GUIDE.md
- SECURITY.md
- docs/DIBEA_MVP_ROADMAP.md
- docs/ERD_DIBEA.md
- docs/REQUISITOS_E_ESPECIFICACOES.md
- (and others listed above)

### **Estimated Impact:**
- **Disk Space Saved:** ~325KB
- **Reduced Confusion:** High (fewer outdated docs)
- **Risk:** Low (only documentation, no code)

---

## ✅ NEXT STEPS

1. **Immediate (Today):**
   - Fix notificationController.ts
   - Test backend compilation

2. **This Week:**
   - Delete approved files (after your review)
   - Verify main server works
   - Update README with current status

3. **Next Week:**
   - Start implementing missing TUTOR journey features
   - Create document upload interface

---

**Created by:** Factory Agent  
**Last Updated:** January 2025
