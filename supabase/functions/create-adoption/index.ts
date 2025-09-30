// =====================================================
// DIBEA - Edge Function: create-adoption
// Solicita adoção de um animal
// =====================================================

import { serve } from 'https://deno.land/std@0.168.0/http/server.ts'
import { withAuth, AuthContext, checkPermission } from '../_shared/auth.ts'
import { withErrorHandling, ValidationError, ForbiddenError, NotFoundError, ConflictError } from '../_shared/errors.ts'
import { validateAndSanitize, validateUUID } from '../_shared/validators.ts'

interface CreateAdoptionParams {
  animal_id: string
  tutor_id?: string // Opcional se usuário já é tutor
  motivo_interesse: string
  
  // Dados do tutor (se não existir)
  tutor_data?: {
    cpf: string
    nome: string
    email?: string
    telefone: string
    endereco_completo: string
    cep: string
    cidade: string
    estado: string
    tipo_moradia: 'CASA' | 'APARTAMENTO' | 'SITIO' | 'OUTROS'
    tem_experiencia: boolean
    tem_outros_pets: boolean
    tem_quintal: boolean
  }
}

interface AdoptionResult {
  adoption_id: string
  animal: {
    id: string
    nome: string
    especie: string
  }
  tutor: {
    id: string
    nome: string
    cpf: string
  }
  status: string
  data_solicitacao: string
  message: string
}

async function createAdoption(
  ctx: AuthContext,
  params: CreateAdoptionParams
): Promise<AdoptionResult> {
  const { supabase, user } = ctx
  
  // Validar parâmetros básicos
  validateUUID(params.animal_id, 'animal_id')
  
  if (!params.motivo_interesse || params.motivo_interesse.trim().length < 20) {
    throw new ValidationError('motivo_interesse deve ter pelo menos 20 caracteres')
  }
  
  // 1. Verificar se animal existe e está disponível
  const { data: animal, error: animalError } = await supabase
    .from('animais')
    .select('id, nome, especie, status, municipality_id')
    .eq('id', params.animal_id)
    .single()
  
  if (animalError || !animal) {
    throw new NotFoundError('Animal')
  }
  
  if (animal.status !== 'DISPONIVEL') {
    throw new ConflictError(`Animal não está disponível para adoção (status: ${animal.status})`)
  }
  
  // 2. Verificar/criar perfil de tutor
  let tutorId = params.tutor_id
  let tutorData: any = null
  
  if (user.role === 'TUTOR' && user.tutor_profile_id) {
    // Usuário já é tutor
    tutorId = user.tutor_profile_id
    
    const { data: existingTutor } = await supabase
      .from('tutores')
      .select('*')
      .eq('id', tutorId)
      .single()
    
    tutorData = existingTutor
    
  } else if (params.tutor_data) {
    // Criar novo perfil de tutor
    const sanitizedTutorData = validateAndSanitize(params.tutor_data, {
      cpf: { required: true, type: 'cpf' },
      nome: { required: true, type: 'string', minLength: 3, maxLength: 255 },
      email: { type: 'email' },
      telefone: { required: true, type: 'phone' },
      endereco_completo: { required: true, type: 'string', minLength: 10, maxLength: 500 },
      cep: { required: true, type: 'string', minLength: 8, maxLength: 10 },
      cidade: { required: true, type: 'string', minLength: 2, maxLength: 100 },
      estado: { required: true, type: 'string', minLength: 2, maxLength: 2 },
      tipo_moradia: { required: true, enum: ['CASA', 'APARTAMENTO', 'SITIO', 'OUTROS'] },
      tem_experiencia: { required: true, type: 'boolean' },
      tem_outros_pets: { required: true, type: 'boolean' },
      tem_quintal: { required: true, type: 'boolean' }
    })
    
    // Verificar se CPF já existe
    const { data: existingTutor } = await supabase
      .from('tutores')
      .select('id, user_id')
      .eq('cpf', sanitizedTutorData.cpf)
      .single()
    
    if (existingTutor) {
      if (existingTutor.user_id === user.id) {
        // Tutor já existe para este usuário
        tutorId = existingTutor.id
        tutorData = existingTutor
      } else {
        throw new ConflictError('CPF já cadastrado para outro usuário')
      }
    } else {
      // Criar novo tutor
      const { data: newTutor, error: tutorError } = await supabase
        .from('tutores')
        .insert({
          user_id: user.id,
          municipality_id: animal.municipality_id,
          ...sanitizedTutorData
        })
        .select()
        .single()
      
      if (tutorError) {
        console.error('Error creating tutor:', tutorError)
        throw new Error(`Failed to create tutor: ${tutorError.message}`)
      }
      
      tutorId = newTutor.id
      tutorData = newTutor
      
      // Atualizar role do usuário para TUTOR
      if (user.id) {
        await supabase
          .from('users')
          .update({
            role: 'TUTOR',
            tutor_profile_id: tutorId
          })
          .eq('id', user.id)
      }
    }
  } else {
    throw new ValidationError('tutor_id ou tutor_data são obrigatórios')
  }
  
  // 3. Verificar se já existe adoção pendente
  const { data: existingAdoption } = await supabase
    .from('adocoes')
    .select('id, status')
    .eq('animal_id', params.animal_id)
    .eq('tutor_id', tutorId)
    .in('status', ['SOLICITADA', 'EM_ANALISE', 'APROVADA'])
    .single()
  
  if (existingAdoption) {
    throw new ConflictError(
      `Já existe uma solicitação de adoção para este animal (status: ${existingAdoption.status})`
    )
  }
  
  // 4. Criar solicitação de adoção
  const { data: adoption, error: adoptionError } = await supabase
    .from('adocoes')
    .insert({
      animal_id: params.animal_id,
      tutor_id: tutorId,
      motivo_interesse: params.motivo_interesse,
      status: 'SOLICITADA',
      data_solicitacao: new Date().toISOString().split('T')[0]
    })
    .select()
    .single()
  
  if (adoptionError) {
    console.error('Error creating adoption:', adoptionError)
    throw new Error(`Failed to create adoption: ${adoptionError.message}`)
  }
  
  // 5. Criar notificação para staff
  await supabase
    .from('notificacoes')
    .insert({
      titulo: 'Nova Solicitação de Adoção',
      conteudo: `${tutorData.nome} solicitou adoção do animal ${animal.nome}`,
      tipo: 'EMAIL',
      categoria: 'ADOCAO',
      prioridade: 'MEDIA',
      relacionado_tipo: 'adoption',
      relacionado_id: adoption.id
    })
  
  return {
    adoption_id: adoption.id,
    animal: {
      id: animal.id,
      nome: animal.nome,
      especie: animal.especie
    },
    tutor: {
      id: tutorData.id,
      nome: tutorData.nome,
      cpf: tutorData.cpf
    },
    status: adoption.status,
    data_solicitacao: adoption.data_solicitacao,
    message: 'Solicitação de adoção criada com sucesso! Aguarde análise da equipe.'
  }
}

serve(
  withErrorHandling(
    async (req: Request) => {
      // CORS
      if (req.method === 'OPTIONS') {
        return new Response(null, {
          headers: {
            'Access-Control-Allow-Origin': '*',
            'Access-Control-Allow-Methods': 'POST, OPTIONS',
            'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type, x-user-phone, x-user-id'
          }
        })
      }
      
      if (req.method !== 'POST') {
        return new Response(
          JSON.stringify({ error: 'Method not allowed' }),
          { status: 405, headers: { 'Content-Type': 'application/json' } }
        )
      }
      
      return await withAuth(req, async (ctx) => {
        const body = await req.json()
        const result = await createAdoption(ctx, body)
        
        return new Response(
          JSON.stringify({
            success: true,
            data: result
          }),
          {
            status: 201,
            headers: {
              'Content-Type': 'application/json',
              'Access-Control-Allow-Origin': '*'
            }
          }
        )
      })
    }
  )
)

