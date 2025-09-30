# 🐛 BUG CRÍTICO: Busca de Animais Criando Registros Duplicados

## 🔍 **PROBLEMA IDENTIFICADO:**

Quando o usuário faz uma **busca/consulta** (QUERY), o sistema está **criando um novo registro** ao invés de buscar os existentes!

### **Causa Raiz:**

O workflow n8n tem 2 nós HTTP Request:
- **HTTP Request3** (para QUERY) → Faz **POST** ❌
- **HTTP Request4** (para ACTION) → Faz **POST** ✅

**Ambos fazem POST!** Isso significa que:
1. Usuário pergunta: "Quero um cachorro grande"
2. SMART AGENT1 gera: `{"intent": "QUERY", "function": "search_animals_text", "endpoint": "animals", "parameters": {"species": "CANINO", "size": "GRANDE"}}`
3. Switch roteia para HTTP Request3 (QUERY)
4. HTTP Request3 faz **POST /rest/v1/animals** com os parâmetros
5. Supabase **cria um novo animal** com esses dados! 😱
6. Retorna apenas esse animal recém-criado

---

## ✅ **SOLUÇÃO:**

### **Opção 1: Modificar HTTP Request3 para GET (RECOMENDADO)**

Alterar o nó **HTTP Request3** para:
- **Método:** GET
- **URL:** `https://xptonqqagxcpzlgndilj.supabase.co/rest/v1/animals?select=*`
- **Query Parameters:** Construir dinamicamente baseado nos filtros

### **Opção 2: Usar Supabase Edge Functions**

Criar Edge Functions específicas para cada tipo de consulta:
- `search_animals_text`
- `get_animal_details`
- `get_adoption_stats`
- `search_municipalities`

---

## 🛠️ **IMPLEMENTAÇÃO - Opção 1 (Mais Rápida)**

### **1. Modificar HTTP Request3:**

```json
{
  "parameters": {
    "method": "GET",
    "url": "={{ $json.endpoint === 'animals' ? 'https://xptonqqagxcpzlgndilj.supabase.co/rest/v1/animals?select=*,municipalities(name)' : 'https://xptonqqagxcpzlgndilj.supabase.co/rest/v1/' + $json.endpoint }}",
    "authentication": "predefinedCredentialType",
    "nodeCredentialType": "supabaseApi",
    "sendQuery": true,
    "queryParameters": {
      "parameters": [
        {
          "name": "species",
          "value": "={{ $json.parameters.species_filter !== 'all' ? 'eq.' + $json.parameters.species_filter : '' }}"
        },
        {
          "name": "size",
          "value": "={{ $json.parameters.size_filter !== 'all' ? 'eq.' + $json.parameters.size_filter : '' }}"
        },
        {
          "name": "status",
          "value": "eq.DISPONIVEL"
        },
        {
          "name": "limit",
          "value": "={{ $json.parameters.limit_count || 10 }}"
        }
      ]
    },
    "options": {}
  }
}
```

### **2. Atualizar SMART AGENT1 Prompt:**

Remover as "funções" de consulta e usar apenas endpoints diretos:

```
🔍 CONSULTAS (via Supabase REST API GET):

- Buscar animais:
  Endpoint: animals
  Parâmetros: {"species_filter": "CANINO|FELINO|all", "size_filter": "PEQUENO|MEDIO|GRANDE|all", "limit_count": 10}

- Detalhes de um animal:
  Endpoint: animals
  Parâmetros: {"animal_id": "uuid"}

- Estatísticas:
  Endpoint: adoption_stats_view
  Parâmetros: {}

- Buscar municípios:
  Endpoint: municipalities
  Parâmetros: {"search_query": "nome"}
```

---

## 🛠️ **IMPLEMENTAÇÃO - Opção 2 (Mais Robusta)**

### **1. Criar Edge Function: search_animals_text**

```typescript
// supabase/functions/search_animals_text/index.ts
import { serve } from "https://deno.land/std@0.168.0/http/server.ts"
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2'

serve(async (req) => {
  try {
    const { search_query, species_filter, size_filter, municipality_filter, limit_count } = await req.json()
    
    const supabaseClient = createClient(
      Deno.env.get('SUPABASE_URL') ?? '',
      Deno.env.get('SUPABASE_SERVICE_ROLE_KEY') ?? ''
    )

    let query = supabaseClient
      .from('animals')
      .select('*, municipalities(name)')
      .eq('status', 'DISPONIVEL')

    // Aplicar filtros
    if (species_filter && species_filter !== 'all') {
      query = query.eq('species', species_filter)
    }

    if (size_filter && size_filter !== 'all') {
      query = query.eq('size', size_filter)
    }

    if (municipality_filter) {
      query = query.eq('municipality_id', municipality_filter)
    }

    // Busca por texto (nome, raça, descrição)
    if (search_query) {
      query = query.or(`name.ilike.%${search_query}%,breed.ilike.%${search_query}%,description.ilike.%${search_query}%`)
    }

    // Limitar resultados
    query = query.limit(limit_count || 10)

    const { data, error } = await query

    if (error) throw error

    return new Response(
      JSON.stringify(data),
      { headers: { "Content-Type": "application/json" } }
    )
  } catch (error) {
    return new Response(
      JSON.stringify({ error: error.message }),
      { status: 400, headers: { "Content-Type": "application/json" } }
    )
  }
})
```

### **2. Deploy da Edge Function:**

```bash
supabase functions deploy search_animals_text
```

### **3. Atualizar HTTP Request3:**

```json
{
  "parameters": {
    "method": "POST",
    "url": "=https://xptonqqagxcpzlgndilj.supabase.co/functions/v1/{{ $json.function }}",
    "authentication": "predefinedCredentialType",
    "nodeCredentialType": "supabaseApi",
    "sendBody": true,
    "specifyBody": "json",
    "jsonBody": "={{ JSON.stringify($json.parameters) }}",
    "options": {}
  }
}
```

---

## 🧪 **TESTE RÁPIDO:**

### **Verificar animais duplicados:**

```sql
SELECT name, species, size, created_at, COUNT(*) as count
FROM animals
GROUP BY name, species, size, created_at
HAVING COUNT(*) > 1
ORDER BY created_at DESC;
```

### **Limpar duplicatas (se necessário):**

```sql
-- Ver duplicatas
SELECT * FROM animals 
WHERE name = 'Rex' 
ORDER BY created_at DESC;

-- Deletar duplicatas (manter apenas o mais antigo)
DELETE FROM animals 
WHERE id IN (
  SELECT id FROM (
    SELECT id, ROW_NUMBER() OVER (PARTITION BY name, species, size ORDER BY created_at ASC) as rn
    FROM animals
  ) t
  WHERE rn > 1
);
```

---

## 📊 **ESTADO ATUAL DO BANCO:**

```
Total de animais: 6
- Max (Labrador, GRANDE, MACHO) - ADOTADO
- Bella (SRD, PEQUENO, FEMEA) - DISPONIVEL
- Milo (Golden Retriever, GRANDE, MACHO) - DISPONIVEL
- Luna (SRD, MEDIO, FEMEA) - DISPONIVEL
- Rex Teste API (MEDIO, MACHO) - DISPONIVEL
- Rex (GRANDE, MACHO) - DISPONIVEL ← Criado via chat (deveria ser busca!)
```

---

## 🎯 **RECOMENDAÇÃO:**

**Use a Opção 1** (modificar HTTP Request3 para GET) porque:
1. ✅ Mais rápido de implementar
2. ✅ Não requer deploy de Edge Functions
3. ✅ Usa diretamente a REST API do Supabase
4. ✅ Suporta filtros nativos do PostgREST

**Use a Opção 2** se precisar de:
- Lógica de busca mais complexa
- Busca por texto (full-text search)
- Agregações customizadas
- Validações específicas

---

## 📝 **PRÓXIMOS PASSOS:**

1. [ ] Escolher entre Opção 1 ou Opção 2
2. [ ] Implementar a correção
3. [ ] Testar busca de animais
4. [ ] Verificar se não há mais duplicatas
5. [ ] Limpar registros duplicados (se houver)
6. [ ] Atualizar documentação

---

**Qual opção você prefere implementar?** 🤔

