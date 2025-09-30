// =====================================================
// DIBEA - Edge Function: search-animals
// Busca animais disponíveis para adoção
// =====================================================

import { serve } from 'https://deno.land/std@0.168.0/http/server.ts'
import { withAuth, AuthContext } from '../_shared/auth.ts'
import { withErrorHandling, ValidationError } from '../_shared/errors.ts'
import { validateAndSanitize } from '../_shared/validators.ts'

interface SearchAnimalsParams {
  especie?: 'CANINO' | 'FELINO' | 'OUTROS'
  sexo?: 'MACHO' | 'FEMEA'
  porte?: 'PEQUENO' | 'MEDIO' | 'GRANDE'
  status?: 'DISPONIVEL' | 'ADOTADO' | 'EM_TRATAMENTO' | 'OBITO' | 'PERDIDO'
  municipality_id?: string
  nome?: string
  limit?: number
  offset?: number
}

interface AnimalResult {
  id: string
  nome: string
  especie: string
  raca: string
  sexo: string
  porte: string
  data_nascimento: string
  peso: number
  cor: string
  temperamento: string
  status: string
  qr_code: string
  fotos: Array<{
    url: string
    principal: boolean
  }>
  municipio: {
    id: string
    nome: string
  }
}

async function searchAnimals(
  ctx: AuthContext,
  params: SearchAnimalsParams
): Promise<{ animals: AnimalResult[]; total: number }> {
  const { supabase, user } = ctx
  
  // Validar e sanitizar parâmetros
  const sanitized = validateAndSanitize(params, {
    especie: { enum: ['CANINO', 'FELINO', 'OUTROS'] },
    sexo: { enum: ['MACHO', 'FEMEA'] },
    porte: { enum: ['PEQUENO', 'MEDIO', 'GRANDE'] },
    status: { enum: ['DISPONIVEL', 'ADOTADO', 'EM_TRATAMENTO', 'OBITO', 'PERDIDO'] },
    municipality_id: { type: 'uuid' },
    nome: { type: 'string', minLength: 2, maxLength: 255 },
    limit: { type: 'number', min: 1, max: 100 },
    offset: { type: 'number', min: 0, max: 10000 }
  })
  
  // Defaults
  const limit = sanitized.limit || 20
  const offset = sanitized.offset || 0
  const status = sanitized.status || 'DISPONIVEL'
  
  // Construir query
  let query = supabase
    .from('animais')
    .select(`
      id,
      nome,
      especie,
      raca,
      sexo,
      porte,
      data_nascimento,
      peso,
      cor,
      temperamento,
      status,
      qr_code,
      fotos_animal (
        url,
        principal
      ),
      municipios:municipality_id (
        id,
        nome
      )
    `, { count: 'exact' })
    .eq('status', status)
    .order('created_at', { ascending: false })
    .range(offset, offset + limit - 1)
  
  // Filtros opcionais
  if (sanitized.especie) {
    query = query.eq('especie', sanitized.especie)
  }
  
  if (sanitized.sexo) {
    query = query.eq('sexo', sanitized.sexo)
  }
  
  if (sanitized.porte) {
    query = query.eq('porte', sanitized.porte)
  }
  
  if (sanitized.municipality_id) {
    query = query.eq('municipality_id', sanitized.municipality_id)
  }
  
  // Busca por nome (full-text search)
  if (sanitized.nome) {
    query = query.ilike('nome', `%${sanitized.nome}%`)
  }
  
  // Executar query
  const { data, error, count } = await query
  
  if (error) {
    console.error('Database error:', error)
    throw new Error(`Failed to search animals: ${error.message}`)
  }
  
  // Formatar resultado
  const animals: AnimalResult[] = (data || []).map((animal: any) => ({
    id: animal.id,
    nome: animal.nome,
    especie: animal.especie,
    raca: animal.raca,
    sexo: animal.sexo,
    porte: animal.porte,
    data_nascimento: animal.data_nascimento,
    peso: animal.peso,
    cor: animal.cor,
    temperamento: animal.temperamento,
    status: animal.status,
    qr_code: animal.qr_code,
    fotos: animal.fotos_animal || [],
    municipio: animal.municipios || { id: '', nome: '' }
  }))
  
  return {
    animals,
    total: count || 0
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
        const result = await searchAnimals(ctx, body)
        
        return new Response(
          JSON.stringify({
            success: true,
            data: result,
            user_context: {
              role: ctx.user.role,
              is_authenticated: ctx.user.is_authenticated
            }
          }),
          {
            status: 200,
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

