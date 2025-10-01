// ========================================
// UNIVERSAL RAG - DIBEA
// ========================================
// Edge Function que faz RAG sobre TODAS as tabelas do Supabase
// Suporta busca em: animais, tutores, adocoes, agendamentos, municipios, etc.

import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2.39.3";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

interface QueryRequest {
  query: string;
  tables?: string[]; // Tabelas específicas para buscar (opcional)
  limit?: number;
  filters?: Record<string, any>; // Filtros adicionais
}

serve(async (req) => {
  // Handle CORS
  if (req.method === "OPTIONS") {
    return new Response("ok", { headers: corsHeaders });
  }

  try {
    const supabaseClient = createClient(
      Deno.env.get("SUPABASE_URL") ?? "",
      Deno.env.get("SUPABASE_SERVICE_ROLE_KEY") ?? ""
    );

    const { query, tables, limit = 50, filters = {} }: QueryRequest = await req.json();

    if (!query) {
      return new Response(
        JSON.stringify({ error: "Query is required" }),
        { status: 400, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    // Tabelas disponíveis para RAG
    const availableTables = tables || [
      "animais",
      "tutores",
      "adocoes",
      "agendamentos",
      "municipios",
      "clinicas",
      "atendimentos",
      "campanhas",
      "denuncias",
    ];

    const results: Record<string, any> = {};
    const searchTerm = `%${query}%`;

    // ========================================
    // BUSCA EM ANIMAIS
    // ========================================
    if (availableTables.includes("animais")) {
      const { data: animais, error: animaisError } = await supabaseClient
        .from("animais")
        .select(`
          id,
          nome,
          especie,
          raca,
          sexo,
          porte,
          idade,
          peso,
          cor,
          status,
          descricao,
          municipio:municipios(id, nome, estado)
        `)
        .or(`nome.ilike.${searchTerm},raca.ilike.${searchTerm},descricao.ilike.${searchTerm}`)
        .limit(limit);

      if (!animaisError && animais) {
        results.animais = {
          count: animais.length,
          data: animais,
        };
      }
    }

    // ========================================
    // BUSCA EM TUTORES
    // ========================================
    if (availableTables.includes("tutores")) {
      const { data: tutores, error: tutoresError } = await supabaseClient
        .from("tutores")
        .select(`
          id,
          nome,
          cpf,
          email,
          telefone,
          endereco,
          municipio:municipios(id, nome, estado)
        `)
        .or(`nome.ilike.${searchTerm},email.ilike.${searchTerm},telefone.ilike.${searchTerm}`)
        .limit(limit);

      if (!tutoresError && tutores) {
        results.tutores = {
          count: tutores.length,
          data: tutores,
        };
      }
    }

    // ========================================
    // BUSCA EM ADOÇÕES
    // ========================================
    if (availableTables.includes("adocoes")) {
      const { data: adocoes, error: adocoesError } = await supabaseClient
        .from("adocoes")
        .select(`
          id,
          status,
          data_adocao,
          observacoes,
          animal:animais(id, nome, especie, raca),
          tutor:tutores(id, nome, telefone)
        `)
        .or(`observacoes.ilike.${searchTerm}`)
        .limit(limit);

      if (!adocoesError && adocoes) {
        results.adocoes = {
          count: adocoes.length,
          data: adocoes,
        };
      }
    }

    // ========================================
    // BUSCA EM AGENDAMENTOS
    // ========================================
    if (availableTables.includes("agendamentos")) {
      const { data: agendamentos, error: agendamentosError } = await supabaseClient
        .from("agendamentos")
        .select(`
          id,
          tipo,
          data_hora,
          status,
          observacoes,
          animal:animais(id, nome, especie),
          tutor:tutores(id, nome, telefone)
        `)
        .or(`observacoes.ilike.${searchTerm}`)
        .limit(limit);

      if (!agendamentosError && agendamentos) {
        results.agendamentos = {
          count: agendamentos.length,
          data: agendamentos,
        };
      }
    }

    // ========================================
    // BUSCA EM MUNICÍPIOS
    // ========================================
    if (availableTables.includes("municipios")) {
      const { data: municipios, error: municipiosError } = await supabaseClient
        .from("municipios")
        .select(`
          id,
          nome,
          estado,
          ativo
        `)
        .or(`nome.ilike.${searchTerm}`)
        .limit(limit);

      if (!municipiosError && municipios) {
        results.municipios = {
          count: municipios.length,
          data: municipios,
        };
      }
    }

    // ========================================
    // BUSCA EM CLÍNICAS
    // ========================================
    if (availableTables.includes("clinicas")) {
      const { data: clinicas, error: clinicasError } = await supabaseClient
        .from("clinicas")
        .select(`
          id,
          nome,
          endereco,
          telefone,
          email,
          municipio:municipios(id, nome, estado)
        `)
        .or(`nome.ilike.${searchTerm},endereco.ilike.${searchTerm}`)
        .limit(limit);

      if (!clinicasError && clinicas) {
        results.clinicas = {
          count: clinicas.length,
          data: clinicas,
        };
      }
    }

    // ========================================
    // BUSCA EM ATENDIMENTOS
    // ========================================
    if (availableTables.includes("atendimentos")) {
      const { data: atendimentos, error: atendimentosError } = await supabaseClient
        .from("atendimentos")
        .select(`
          id,
          tipo,
          data_atendimento,
          diagnostico,
          tratamento,
          animal:animais(id, nome, especie),
          clinica:clinicas(id, nome)
        `)
        .or(`diagnostico.ilike.${searchTerm},tratamento.ilike.${searchTerm}`)
        .limit(limit);

      if (!atendimentosError && atendimentos) {
        results.atendimentos = {
          count: atendimentos.length,
          data: atendimentos,
        };
      }
    }

    // ========================================
    // BUSCA EM CAMPANHAS
    // ========================================
    if (availableTables.includes("campanhas")) {
      const { data: campanhas, error: campanhasError } = await supabaseClient
        .from("campanhas")
        .select(`
          id,
          nome,
          descricao,
          tipo,
          data_inicio,
          data_fim,
          status,
          municipio:municipios(id, nome, estado)
        `)
        .or(`nome.ilike.${searchTerm},descricao.ilike.${searchTerm}`)
        .limit(limit);

      if (!campanhasError && campanhas) {
        results.campanhas = {
          count: campanhas.length,
          data: campanhas,
        };
      }
    }

    // ========================================
    // BUSCA EM DENÚNCIAS
    // ========================================
    if (availableTables.includes("denuncias")) {
      const { data: denuncias, error: denunciasError } = await supabaseClient
        .from("denuncias")
        .select(`
          id,
          tipo,
          descricao,
          status,
          data_denuncia,
          localizacao,
          municipio:municipios(id, nome, estado)
        `)
        .or(`descricao.ilike.${searchTerm},localizacao.ilike.${searchTerm}`)
        .limit(limit);

      if (!denunciasError && denuncias) {
        results.denuncias = {
          count: denuncias.length,
          data: denuncias,
        };
      }
    }

    // ========================================
    // ESTATÍSTICAS GERAIS
    // ========================================
    const totalResults = Object.values(results).reduce(
      (sum, table: any) => sum + (table.count || 0),
      0
    );

    // ========================================
    // RESPOSTA FINAL
    // ========================================
    return new Response(
      JSON.stringify({
        success: true,
        query,
        total_results: totalResults,
        results,
        metadata: {
          tables_searched: availableTables,
          timestamp: new Date().toISOString(),
        },
      }),
      {
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      }
    );
  } catch (error) {
    console.error("Error in universal-rag:", error);
    return new Response(
      JSON.stringify({ error: error.message }),
      {
        status: 500,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      }
    );
  }
});

