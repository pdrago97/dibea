// =====================================================
// DIBEA - Shared Module: Authentication & Authorization
// =====================================================

import { createClient, SupabaseClient } from 'https://esm.sh/@supabase/supabase-js@2.39.3'

export interface AuthUser {
  id: string | null
  email: string | null
  phone: string | null
  role: 'CIDADAO' | 'TUTOR' | 'FUNCIONARIO' | 'VETERINARIO' | 'ADMIN' | 'SUPER_ADMIN'
  municipality_id: string | null
  tutor_profile_id: string | null
  is_authenticated: boolean
  is_service_role: boolean
}

export interface AuthContext {
  user: AuthUser
  supabase: SupabaseClient
}

/**
 * Valida autenticação e retorna contexto do usuário
 * Suporta:
 * - JWT (usuários autenticados via web)
 * - Service Role (N8N)
 * - WhatsApp (não autenticados - identificação por telefone)
 */
export async function validateAuth(req: Request): Promise<AuthContext> {
  const authHeader = req.headers.get('Authorization')
  const serviceRoleKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!
  const supabaseUrl = Deno.env.get('SUPABASE_URL')!
  
  // Verificar se é Service Role (N8N)
  if (authHeader === `Bearer ${serviceRoleKey}`) {
    const supabase = createClient(supabaseUrl, serviceRoleKey)
    
    // Para Service Role, extrair identificação do body ou headers
    const phone = req.headers.get('X-User-Phone')
    const userId = req.headers.get('X-User-Id')
    
    if (phone) {
      // Buscar ou criar usuário por telefone (WhatsApp)
      const { data: user } = await supabase
        .from('users')
        .select('id, email, phone, role, municipality_id, tutor_profile_id')
        .eq('phone', phone)
        .single()
      
      if (user) {
        return {
          user: {
            ...user,
            is_authenticated: false,
            is_service_role: true
          },
          supabase
        }
      } else {
        // Usuário não cadastrado (cidadão via WhatsApp)
        return {
          user: {
            id: null,
            email: null,
            phone: phone,
            role: 'CIDADAO',
            municipality_id: null,
            tutor_profile_id: null,
            is_authenticated: false,
            is_service_role: true
          },
          supabase
        }
      }
    }
    
    if (userId) {
      // Buscar usuário por ID
      const { data: user } = await supabase
        .from('users')
        .select('id, email, phone, role, municipality_id, tutor_profile_id')
        .eq('id', userId)
        .single()
      
      if (user) {
        return {
          user: {
            ...user,
            is_authenticated: true,
            is_service_role: true
          },
          supabase
        }
      }
    }
    
    // Service Role sem identificação específica
    return {
      user: {
        id: null,
        email: null,
        phone: null,
        role: 'CIDADAO',
        municipality_id: null,
        tutor_profile_id: null,
        is_authenticated: false,
        is_service_role: true
      },
      supabase
    }
  }
  
  // Autenticação JWT (usuários web)
  if (!authHeader || !authHeader.startsWith('Bearer ')) {
    throw new Error('Missing or invalid Authorization header')
  }
  
  const token = authHeader.replace('Bearer ', '')
  const anonKey = Deno.env.get('SUPABASE_ANON_KEY')!
  const supabase = createClient(supabaseUrl, anonKey, {
    global: {
      headers: { Authorization: authHeader }
    }
  })
  
  // Validar token JWT
  const { data: { user: authUser }, error } = await supabase.auth.getUser(token)
  
  if (error || !authUser) {
    throw new Error('Invalid or expired token')
  }
  
  // Buscar dados completos do usuário
  const { data: userData, error: userError } = await supabase
    .from('users')
    .select('id, email, phone, role, municipality_id, tutor_profile_id')
    .eq('id', authUser.id)
    .single()
  
  if (userError || !userData) {
    throw new Error('User not found in database')
  }
  
  return {
    user: {
      ...userData,
      is_authenticated: true,
      is_service_role: false
    },
    supabase
  }
}

/**
 * Verifica se usuário tem permissão para a operação
 */
export function checkPermission(
  user: AuthUser,
  requiredRoles: AuthUser['role'][],
  municipalityId?: string
): boolean {
  // SUPER_ADMIN tem acesso total
  if (user.role === 'SUPER_ADMIN') {
    return true
  }
  
  // Verificar role
  if (!requiredRoles.includes(user.role)) {
    return false
  }
  
  // Verificar município (se aplicável)
  if (municipalityId && user.municipality_id !== municipalityId) {
    return false
  }
  
  return true
}

/**
 * Verifica se usuário é tutor de um animal
 */
export async function isTutorOfAnimal(
  supabase: SupabaseClient,
  userId: string,
  animalId: string
): Promise<boolean> {
  const { data, error } = await supabase
    .from('adocoes')
    .select('id')
    .eq('animal_id', animalId)
    .eq('status', 'CONCLUIDA')
    .eq('tutor_id', userId)
    .single()
  
  return !error && !!data
}

/**
 * Middleware para validar autenticação
 */
export async function withAuth(
  req: Request,
  handler: (ctx: AuthContext) => Promise<Response>
): Promise<Response> {
  try {
    const ctx = await validateAuth(req)
    return await handler(ctx)
  } catch (error) {
    return new Response(
      JSON.stringify({
        error: error.message,
        code: 'UNAUTHORIZED'
      }),
      {
        status: 401,
        headers: { 'Content-Type': 'application/json' }
      }
    )
  }
}

