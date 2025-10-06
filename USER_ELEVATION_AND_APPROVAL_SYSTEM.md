# 🎯 Sistema Completo de Elevação de Usuários e Aprovações - DIBEA

## 🧠 Visão Geral

### **Objetivo:**
Criar um sistema robusto onde:
1. **Cidadãos** podem solicitar virar **Tutores** (precisa ser aprovado)
2. **Tutores** podem aplicar para **Adotar Animais** (precisa validar documentos)
3. **Admins** recebem notificações REAIS e podem aprovar/rejeitar
4. **Tudo é rastreável** e auditável

---

## 🔄 Fluxo de Elevação: CIDADAO → TUTOR

### **Por que precisa de aprovação?**
- Tutor pode adotar animais
- Precisa ter casa própria/alugada estável
- Precisa comprovar renda
- Precisa ter condições de cuidar

### **Processo:**

```
┌─────────────────────────────────────────────────────┐
│                    CIDADÃO                          │
│ 1. Clica em "Quero Adotar" na página de animais    │
│ 2. Sistema verifica se já é TUTOR                  │
│    → Se sim: Vai direto para formulário de adoção  │
│    → Se não: Precisa solicitar elevação            │
└─────────────────────────────────────────────────────┘
                          │
                          ▼
┌─────────────────────────────────────────────────────┐
│            FORMULÁRIO DE ELEVAÇÃO                   │
│ 3. Preenche dados:                                  │
│    • Tipo de residência (própria/alugada/familiar) │
│    • Comprovante de residência (PDF)               │
│    • Comprovante de renda (PDF/Imagem)             │
│    • RG/CPF (Foto)                                  │
│    • Fotos da casa/quintal                          │
│    • Termo de responsabilidade                      │
│ 4. Submete solicitação                              │
└─────────────────────────────────────────────────────┘
                          │
                          ▼
┌─────────────────────────────────────────────────────┐
│              SISTEMA CRIA REGISTRO                  │
│ 5. Tabela: user_elevation_requests                 │
│    • status: PENDING                                │
│    • documents: [...uploads do Supabase Storage]   │
│    • created_at: timestamp                          │
│ 6. Notifica ADMIN (real-time via Supabase)         │
└─────────────────────────────────────────────────────┘
                          │
                          ▼
┌─────────────────────────────────────────────────────┐
│          ADMIN RECEBE NOTIFICAÇÃO                   │
│ 7. Badge vermelho no dashboard:                    │
│    "1 nova solicitação de tutor"                   │
│ 8. Clica → Abre modal com todos os documentos      │
└─────────────────────────────────────────────────────┘
                          │
                          ▼
┌─────────────────────────────────────────────────────┐
│         ADMIN VALIDA DOCUMENTOS                     │
│ 9. Vê cada documento inline (PDF viewer)           │
│ 10. Sistema de rating por documento:               │
│     ✅ Aprovado   ⚠️ Revisar   ❌ Rejeitado       │
│ 11. Campo de comentários                            │
│ 12. Botões: [Aprovar Tudo] [Pedir Mais Docs]       │
└─────────────────────────────────────────────────────┘
                          │
                          ▼
┌─────────────────────────────────────────────────────┐
│              DECISÃO DO ADMIN                       │
│                                                     │
│ SE APROVAR:                                         │
│ • user.role = 'TUTOR'                              │
│ • elevation_request.status = 'APPROVED'            │
│ • Notifica usuário: "Parabéns! Você é tutor"      │
│ • Libera formulário de adoção                      │
│                                                     │
│ SE REJEITAR:                                        │
│ • elevation_request.status = 'REJECTED'            │
│ • elevation_request.rejection_reason = "..."       │
│ • Notifica usuário com motivo                      │
│ • Permite reenviar após 7 dias                     │
│                                                     │
│ SE PEDIR MAIS DOCS:                                 │
│ • elevation_request.status = 'NEEDS_MORE_INFO'     │
│ • Lista documentos faltantes                        │
│ • Notifica usuário                                  │
└─────────────────────────────────────────────────────┘
```

---

## 📊 Schema do Banco (Supabase)

### **1. Tabela: `user_elevation_requests`**

```sql
CREATE TABLE user_elevation_requests (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES usuarios(id),
  
  -- Tipo de elevação
  from_role TEXT NOT NULL, -- 'CIDADAO'
  to_role TEXT NOT NULL, -- 'TUTOR'
  
  -- Status da solicitação
  status TEXT NOT NULL DEFAULT 'PENDING', 
  -- 'PENDING' | 'UNDER_REVIEW' | 'APPROVED' | 'REJECTED' | 'NEEDS_MORE_INFO'
  
  -- Dados do formulário
  residence_type TEXT, -- 'OWNED' | 'RENTED' | 'FAMILY'
  has_yard BOOLEAN,
  household_members INTEGER,
  other_pets TEXT[],
  monthly_income DECIMAL,
  
  -- Documentos (URLs do Supabase Storage)
  documents JSONB, -- { proof_of_residence: 'url', income: 'url', id_doc: 'url', photos: [...] }
  
  -- Validação do admin
  reviewed_by UUID REFERENCES usuarios(id),
  reviewed_at TIMESTAMP,
  review_notes TEXT,
  document_ratings JSONB, -- { proof_of_residence: 'approved', income: 'needs_review', ... }
  rejection_reason TEXT,
  
  -- Timestamps
  created_at TIMESTAMP DEFAULT NOW(),
  updated_at TIMESTAMP DEFAULT NOW()
);

-- Índices
CREATE INDEX idx_elevation_requests_status ON user_elevation_requests(status);
CREATE INDEX idx_elevation_requests_user ON user_elevation_requests(user_id);
CREATE INDEX idx_elevation_requests_pending ON user_elevation_requests(status) WHERE status = 'PENDING';
```

### **2. Tabela: `adoption_applications`**

```sql
CREATE TABLE adoption_applications (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  animal_id UUID NOT NULL REFERENCES animais(id),
  applicant_id UUID NOT NULL REFERENCES usuarios(id),
  
  -- Status
  status TEXT NOT NULL DEFAULT 'PENDING',
  -- 'PENDING' | 'INTERVIEW_SCHEDULED' | 'APPROVED' | 'REJECTED' | 'CANCELLED'
  
  -- Formulário de adoção
  reason_for_adoption TEXT NOT NULL,
  previous_pet_experience TEXT,
  daily_routine TEXT,
  emergency_plan TEXT,
  
  -- Documentos adicionais (além dos de tutor)
  additional_documents JSONB,
  
  -- Home visit
  home_visit_scheduled_at TIMESTAMP,
  home_visit_completed_at TIMESTAMP,
  home_visit_approved BOOLEAN,
  home_visit_notes TEXT,
  
  -- Decisão
  reviewed_by UUID REFERENCES usuarios(id),
  reviewed_at TIMESTAMP,
  approval_notes TEXT,
  rejection_reason TEXT,
  
  -- Timestamps
  created_at TIMESTAMP DEFAULT NOW(),
  updated_at TIMESTAMP DEFAULT NOW()
);
```

### **3. Tabela: `document_validations`**

```sql
CREATE TABLE document_validations (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  
  -- Origem do documento
  source_type TEXT NOT NULL, -- 'USER_ELEVATION' | 'ADOPTION_APPLICATION' | 'CLINIC_REGISTRATION'
  source_id UUID NOT NULL, -- ID da elevação/adoção/etc
  
  -- Documento
  document_type TEXT NOT NULL, -- 'PROOF_OF_RESIDENCE' | 'INCOME' | 'ID_DOCUMENT' | 'PHOTOS'
  document_url TEXT NOT NULL,
  document_name TEXT,
  
  -- Validação
  status TEXT NOT NULL DEFAULT 'PENDING', -- 'PENDING' | 'APPROVED' | 'REJECTED' | 'NEEDS_REPLACEMENT'
  validated_by UUID REFERENCES usuarios(id),
  validated_at TIMESTAMP,
  validation_notes TEXT,
  rating INTEGER CHECK (rating >= 1 AND rating <= 5),
  
  -- Timestamps
  created_at TIMESTAMP DEFAULT NOW(),
  updated_at TIMESTAMP DEFAULT NOW()
);
```

---

## 🎨 UI Components Necessários

### **1. ElevationRequestCard** (Dashboard Admin)

```tsx
<Card className="border-amber-200 bg-amber-50">
  <CardHeader>
    <div className="flex items-center gap-3">
      <Badge variant="warning">Nova Solicitação</Badge>
      <h3>Pedro Santos quer virar Tutor</h3>
    </div>
  </CardHeader>
  <CardContent>
    <div className="grid grid-cols-2 gap-4">
      <div>
        <p className="text-sm text-gray-600">Residência:</p>
        <p className="font-semibold">Casa própria com quintal</p>
      </div>
      <div>
        <p className="text-sm text-gray-600">Renda mensal:</p>
        <p className="font-semibold">R$ 3.500</p>
      </div>
    </div>
    
    <div className="mt-4 flex gap-2">
      <Button onClick={openReviewModal}>
        <FileText className="w-4 h-4 mr-2" />
        Revisar Documentos (5)
      </Button>
      <Button variant="outline">
        <MessageSquare className="w-4 h-4 mr-2" />
        Conversar
      </Button>
    </div>
  </CardContent>
</Card>
```

### **2. DocumentReviewModal** (Admin valida docs)

```tsx
<Dialog>
  <DialogContent className="max-w-4xl">
    <DialogHeader>
      <DialogTitle>Validar Documentos - Pedro Santos</DialogTitle>
    </DialogHeader>
    
    <div className="space-y-4">
      {/* Cada documento */}
      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <h4>Comprovante de Residência</h4>
            <div className="flex gap-2">
              <Button size="sm" variant="success">
                <Check className="w-4 h-4" /> Aprovar
              </Button>
              <Button size="sm" variant="warning">
                <AlertCircle className="w-4 h-4" /> Revisar
              </Button>
              <Button size="sm" variant="destructive">
                <X className="w-4 h-4" /> Rejeitar
              </Button>
            </div>
          </div>
        </CardHeader>
        <CardContent>
          {/* PDF Viewer inline */}
          <iframe src={documentUrl} className="w-full h-96" />
          
          <Textarea 
            placeholder="Comentários sobre este documento..."
            className="mt-4"
          />
        </CardContent>
      </Card>
      
      {/* Repetir para cada documento */}
    </div>
    
    <DialogFooter>
      <Button variant="outline">Salvar e Continuar Depois</Button>
      <Button variant="success">Aprovar Tudo e Elevar Usuário</Button>
      <Button variant="destructive">Rejeitar Solicitação</Button>
    </DialogFooter>
  </DialogContent>
</Dialog>
```

### **3. ElevationRequestForm** (Cidadão solicita)

```tsx
<Form>
  <h2>Quero me Tornar Tutor</h2>
  <p>Para adotar animais, precisamos validar alguns dados:</p>
  
  <FormField label="Tipo de Residência">
    <Select>
      <option>Casa própria</option>
      <option>Casa alugada</option>
      <option>Apartamento próprio</option>
      <option>Apartamento alugado</option>
      <option>Moro com família</option>
    </Select>
  </FormField>
  
  <FormField label="Possui quintal?">
    <RadioGroup>
      <Radio value="yes">Sim, quintal grande</Radio>
      <Radio value="small">Sim, quintal pequeno</Radio>
      <Radio value="no">Não</Radio>
    </RadioGroup>
  </FormField>
  
  <FormField label="Comprovante de Residência">
    <FileUpload 
      accept="application/pdf,image/*"
      maxSize={5 * 1024 * 1024}
      onUpload={handleUploadToSupabaseStorage}
    />
  </FormField>
  
  <FormField label="Comprovante de Renda">
    <FileUpload accept="application/pdf,image/*" />
  </FormField>
  
  <FormField label="RG ou CNH">
    <FileUpload accept="image/*" />
  </FormField>
  
  <FormField label="Fotos da Casa">
    <MultiFileUpload 
      accept="image/*"
      maxFiles={10}
      hint="Tire fotos dos cômodos e áreas externas"
    />
  </FormField>
  
  <Checkbox>
    Li e concordo com o termo de responsabilidade
  </Checkbox>
  
  <Button type="submit">
    Enviar Solicitação
  </Button>
</Form>
```

### **4. PendingApprovalsWidget** (Dashboard Admin)

```tsx
<Card>
  <CardHeader>
    <div className="flex items-center justify-between">
      <h3>Aprovações Pendentes</h3>
      <Badge variant="destructive">{totalPending}</Badge>
    </div>
  </CardHeader>
  <CardContent>
    <Tabs>
      <TabsList>
        <TabsTrigger>Elevações ({elevationCount})</TabsTrigger>
        <TabsTrigger>Adoções ({adoptionCount})</TabsTrigger>
        <TabsTrigger>Documentos ({documentCount})</TabsTrigger>
      </TabsList>
      
      <TabsContent value="elevations">
        {elevations.map(req => (
          <ElevationRequestCard key={req.id} request={req} />
        ))}
      </TabsContent>
      
      {/* Outros tabs */}
    </Tabs>
  </CardContent>
</Card>
```

---

## 🔔 Sistema de Notificações Real-Time

### **Supabase Realtime Subscription:**

```typescript
// Admin Dashboard
useEffect(() => {
  const subscription = supabase
    .channel('admin-notifications')
    .on('postgres_changes', {
      event: 'INSERT',
      schema: 'public',
      table: 'user_elevation_requests',
      filter: 'status=eq.PENDING'
    }, (payload) => {
      // Nova solicitação de elevação
      toast.info('Nova solicitação de tutor recebida!');
      playNotificationSound();
      fetchPendingApprovals();
    })
    .on('postgres_changes', {
      event: 'INSERT',
      schema: 'public',
      table: 'adoption_applications',
      filter: 'status=eq.PENDING'
    }, (payload) => {
      // Nova aplicação de adoção
      toast.info('Nova aplicação de adoção!');
      fetchPendingAdoptions();
    })
    .subscribe();

  return () => {
    subscription.unsubscribe();
  };
}, []);
```

---

## 🎯 Fluxo Completo: Cidadão → Tutor → Adota Animal

### **Passo a Passo:**

```
1. CIDADÃO CRIA CONTA
   ↓
2. CIDADÃO vê animal "Rex" e quer adotar
   ↓
3. Clica em "Adotar"
   ↓
4. Sistema verifica: user.role === 'CIDADAO' ?
   → Redireciona para formulário de elevação
   ↓
5. CIDADÃO preenche formulário e envia documentos
   ↓
6. Sistema:
   - Faz upload para Supabase Storage
   - Cria registro em user_elevation_requests
   - Dispara notificação real-time para ADMINs
   ↓
7. ADMIN recebe notificação no dashboard
   - Badge vermelho: "1 nova solicitação"
   - Card destacado: "Pedro Santos quer virar tutor"
   ↓
8. ADMIN clica em "Revisar Documentos"
   - Abre modal com todos os PDFs inline
   - Valida cada documento (✅ ⚠️ ❌)
   - Adiciona comentários
   ↓
9. ADMIN decide:
   
   OPÇÃO A - APROVAR:
   - Clica em "Aprovar e Elevar"
   - Sistema atualiza user.role = 'TUTOR'
   - Notifica Pedro: "Parabéns! Você é tutor"
   - Pedro agora pode adotar
   
   OPÇÃO B - REJEITAR:
   - Clica em "Rejeitar"
   - Escreve motivo
   - Notifica Pedro com motivo
   - Pedro pode tentar novamente em 7 dias
   
   OPÇÃO C - PEDIR MAIS DOCS:
   - Clica em "Solicitar Mais Informações"
   - Lista documentos faltantes
   - Pedro recebe notificação
   - Pedro reenvia documentos
   ↓
10. PEDRO agora é TUTOR
    ↓
11. PEDRO volta na página do Rex e clica "Adotar"
    ↓
12. Agora abre formulário de adoção (não de elevação)
    ↓
13. PEDRO preenche:
    - Por que quer adotar
    - Experiência com pets
    - Rotina diária
    - Plano de emergência
    ↓
14. Sistema cria adoption_application
    ↓
15. ADMIN recebe notificação de nova adoção
    ↓
16. ADMIN agenda home visit (opcional)
    ↓
17. ADMIN aprova adoção
    ↓
18. Sistema atualiza animal.status = 'ADOTADO'
    ↓
19. Rex agora pertence a Pedro! 🎉
```

---

## 📊 Dashboard Admin: Dados REAIS

### **Queries do Supabase:**

```typescript
// Buscar elevações pendentes
const { data: elevations } = await supabase
  .from('user_elevation_requests')
  .select(`
    *,
    usuarios!user_id (id, nome, email, cpf)
  `)
  .eq('status', 'PENDING')
  .order('created_at', { ascending: false });

// Buscar adoções pendentes
const { data: adoptions } = await supabase
  .from('adoption_applications')
  .select(`
    *,
    animais!animal_id (id, nome, especie, raca),
    usuarios!applicant_id (id, nome, email)
  `)
  .eq('status', 'PENDING')
  .order('created_at', { ascending: false });

// Buscar documentos pendentes
const { data: documents } = await supabase
  .from('document_validations')
  .select('*')
  .eq('status', 'PENDING')
  .order('created_at', { ascending: false});

// Atualizar cards do dashboard
setPendingActions([
  ...elevations.map(e => ({
    type: 'elevation',
    title: `${e.usuarios.nome} quer virar Tutor`,
    priority: 'high',
    timestamp: e.created_at,
    data: e
  })),
  ...adoptions.map(a => ({
    type: 'adoption',
    title: `${a.usuarios.nome} quer adotar ${a.animais.nome}`,
    priority: 'high',
    timestamp: a.created_at,
    data: a
  })),
  ...documents.map(d => ({
    type: 'document',
    title: 'Documento pendente de validação',
    priority: 'medium',
    timestamp: d.created_at,
    data: d
  }))
]);
```

---

## 🎨 Views de Usuários (Admin)

### **Lista de Usuários com Solicitações:**

```tsx
<Table>
  <TableHeader>
    <TableRow>
      <TableHead>Nome</TableHead>
      <TableHead>Role Atual</TableHead>
      <TableHead>Status</TableHead>
      <TableHead>Solicitação</TableHead>
      <TableHead>Ações</TableHead>
    </TableRow>
  </TableHeader>
  <TableBody>
    {users.map(user => (
      <TableRow>
        <TableCell>
          <div className="flex items-center gap-2">
            <Avatar src={user.avatar} />
            <div>
              <p className="font-semibold">{user.nome}</p>
              <p className="text-xs text-gray-500">{user.email}</p>
            </div>
          </div>
        </TableCell>
        
        <TableCell>
          <Badge>{user.role}</Badge>
        </TableCell>
        
        <TableCell>
          {user.elevationRequest ? (
            <Badge variant={
              user.elevationRequest.status === 'PENDING' ? 'warning' :
              user.elevationRequest.status === 'APPROVED' ? 'success' :
              'destructive'
            }>
              {user.elevationRequest.status}
            </Badge>
          ) : (
            <span className="text-gray-400">—</span>
          )}
        </TableCell>
        
        <TableCell>
          {user.elevationRequest && (
            <div className="text-sm">
              <p className="font-semibold">
                {user.elevationRequest.from_role} → {user.elevationRequest.to_role}
              </p>
              <p className="text-gray-500">
                {formatDistance(user.elevationRequest.created_at)}
              </p>
            </div>
          )}
        </TableCell>
        
        <TableCell>
          {user.elevationRequest?.status === 'PENDING' && (
            <div className="flex gap-2">
              <Button 
                size="sm" 
                onClick={() => openReviewModal(user.elevationRequest)}
              >
                <FileText className="w-4 h-4 mr-1" />
                Revisar
              </Button>
              <DropdownMenu>
                <DropdownMenuTrigger>
                  <Button size="sm" variant="ghost">
                    <MoreHorizontal className="w-4 h-4" />
                  </Button>
                </DropdownMenuTrigger>
                <DropdownMenuContent>
                  <DropdownMenuItem onClick={() => quickApprove(user.id)}>
                    <Check className="w-4 h-4 mr-2" />
                    Aprovar Rápido
                  </DropdownMenuItem>
                  <DropdownMenuItem onClick={() => requestMoreDocs(user.id)}>
                    <AlertCircle className="w-4 h-4 mr-2" />
                    Pedir Mais Docs
                  </DropdownMenuItem>
                  <DropdownMenuItem onClick={() => rejectRequest(user.id)}>
                    <X className="w-4 h-4 mr-2" />
                    Rejeitar
                  </DropdownMenuItem>
                </DropdownMenuContent>
              </DropdownMenu>
            </div>
          )}
        </TableCell>
      </TableRow>
    ))}
  </TableBody>
</Table>
```

---

## ✅ Checklist de Implementação

### **Fase 1: Schema & Backend** ⏳
- [ ] Criar migration Prisma para `user_elevation_requests`
- [ ] Criar migration Prisma para `adoption_applications`
- [ ] Criar migration Prisma para `document_validations`
- [ ] Configurar Supabase Storage bucket para documentos
- [ ] Criar policies RLS (Row Level Security)
- [ ] Criar functions de notificação (triggers)

### **Fase 2: Formulário de Elevação** ⏳
- [ ] Criar componente `ElevationRequestForm`
- [ ] Integrar upload de arquivos com Supabase Storage
- [ ] Validações de formulário (Zod schema)
- [ ] Submit e criação de registro
- [ ] Feedback visual (toast notifications)

### **Fase 3: Dashboard Admin** ⏳
- [ ] Buscar aprovações pendentes (queries reais)
- [ ] Componente `PendingApprovalsWidget`
- [ ] Componente `ElevationRequestCard`
- [ ] Modal `DocumentReviewModal`
- [ ] Sistema de validação inline (approve/reject/review)
- [ ] Atualização de status em tempo real

### **Fase 4: Notificações Real-Time** ⏳
- [ ] Setup Supabase Realtime subscriptions
- [ ] Notificações para admin (new requests)
- [ ] Notificações para usuário (approved/rejected)
- [ ] Badge counter atualizado em tempo real
- [ ] Sound notifications (opcional)

### **Fase 5: View de Usuários** ⏳
- [ ] Lista de usuários com solicitações
- [ ] Filtros (pending/approved/rejected)
- [ ] Busca por nome/email
- [ ] Ações rápidas (approve/reject)
- [ ] Modal de detalhes do usuário

### **Fase 6: Testes & Polimento** ⏳
- [ ] Testar fluxo completo (cidadão → tutor → adota)
- [ ] Edge cases (upload fails, duplicate requests)
- [ ] Performance (lazy loading, pagination)
- [ ] Mobile responsiveness
- [ ] Accessibility (a11y)

---

## 🎯 Próximos Passos IMEDIATOS

**O que vou fazer AGORA:**

1. **Criar migrations Prisma** para as 3 tabelas
2. **Atualizar dashboard admin** para buscar dados reais
3. **Criar componente de elevação** (formulário)
4. **Criar modal de revisão** (admin valida docs)
5. **Conectar tudo** com Supabase

**Quer que eu comece?** Me confirme e eu implemento agora!

---

**Status:** 🚧 Design completo, pronto para implementar
**Tempo estimado:** 4-6 horas para MVP funcional
**Prioridade:** 🔴 CRÍTICO (sistema não funciona sem isso)
