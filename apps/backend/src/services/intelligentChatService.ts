import { PrismaClient } from '@prisma/client';
import { v4 as uuidv4 } from 'uuid';

const prisma = new PrismaClient();

interface ConversationContext {
  sessionId: string;
  userId?: string;
  contextData: any;
  lastIntent?: string;
  lastAgent?: string;
  conversationHistory: ConversationMessage[];
}

interface ConversationMessage {
  role: 'user' | 'assistant' | 'system';
  content: string;
  timestamp: Date;
  metadata?: any;
}

interface N8NWorkflowResponse {
  message: string;
  agent: string;
  confidence: number;
  actions?: any[];
  metadata?: any;
  toolCalls?: ToolCall[];
}

interface ToolCall {
  type: 'database_query' | 'pinecone_search' | 'create_entity' | 'update_entity';
  parameters: any;
  result?: any;
}

export class IntelligentChatService {
  private readonly N8N_BASE_URL: string;
  private readonly OPENAI_API_KEY: string;
  private readonly PINECONE_API_KEY: string;

  constructor() {
    this.N8N_BASE_URL = process.env.N8N_WEBHOOK_URL || 'https://n8n-moveup-u53084.vm.elestio.app';
    this.OPENAI_API_KEY = process.env.OPENAI_API_KEY || '';
    this.PINECONE_API_KEY = process.env.PINECONE_API_KEY || '';
  }

  /**
   * Main chat processing method with persistent memory
   */
  async processMessage(
    message: string,
    sessionId: string,
    userId?: string,
    context?: any
  ): Promise<N8NWorkflowResponse> {
    try {
      console.log('🧠 Processando mensagem inteligente:', { message, sessionId, userId });

      // Step 1: Load conversation context
      const conversationContext = await this.loadConversationContext(sessionId, userId);
      
      // Step 2: Enhance context with Pinecone semantic search
      const semanticContext = await this.getSemanticContext(message, conversationContext);
      
      // Step 3: Route to appropriate N8N workflow
      const routingResult = await this.intelligentRouting(message, {
        ...conversationContext,
        semanticContext,
        ...context
      });

      // Step 4: Execute workflow with enhanced context
      const workflowResponse = await this.executeWorkflow(routingResult, {
        message,
        sessionId,
        userId,
        conversationContext,
        semanticContext
      });

      // Step 5: Execute tool calls if needed
      if (workflowResponse.toolCalls && workflowResponse.toolCalls.length > 0) {
        await this.executeToolCalls(workflowResponse.toolCalls, sessionId);
      }

      // Step 6: Update conversation context
      await this.updateConversationContext(sessionId, userId, {
        userMessage: message,
        assistantResponse: workflowResponse.message,
        agent: workflowResponse.agent,
        intent: routingResult.intent,
        metadata: workflowResponse.metadata
      });

      // Step 7: Store interaction for analytics
      await this.storeInteraction(userId, workflowResponse.agent, message, workflowResponse);

      return workflowResponse;

    } catch (error) {
      console.error('❌ Erro no chat inteligente:', error);
      
      // Intelligent fallback with context
      return await this.intelligentFallback(message, sessionId, userId, error);
    }
  }

  /**
   * Load persistent conversation context
   */
  private async loadConversationContext(sessionId: string, userId?: string): Promise<ConversationContext> {
    try {
      // Try to load from database first
      const existingContext = await prisma.$queryRaw<any[]>`
        SELECT * FROM conversation_contexts 
        WHERE session_id = ${sessionId} 
        ORDER BY updated_at DESC 
        LIMIT 1
      `;

      if (existingContext.length > 0) {
        const context = existingContext[0];
        const contextData = JSON.parse(context.context_data || '{}');
        
        return {
          sessionId,
          userId: userId || context.user_id,
          contextData,
          lastIntent: context.last_intent,
          lastAgent: context.last_agent,
          conversationHistory: contextData.conversationHistory || []
        };
      }

      // Create new context
      return {
        sessionId,
        userId,
        contextData: {},
        conversationHistory: []
      };

    } catch (error) {
      console.error('❌ Erro ao carregar contexto:', error);
      return {
        sessionId,
        userId,
        contextData: {},
        conversationHistory: []
      };
    }
  }

  /**
   * Get semantic context from Pinecone
   */
  private async getSemanticContext(message: string, context: ConversationContext): Promise<any> {
    try {
      console.log('🔍 Buscando contexto semântico para:', message);

      // Use N8N workflow for Pinecone search - using working webhook
      const response = await fetch(`${this.N8N_BASE_URL}/webhook/dibea-master`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          userInput: message,
          sessionId: context.sessionId,
          context: {
            searchOnly: true,
            pineconeSearch: true,
            conversationHistory: context.conversationHistory.slice(-5)
          }
        }),
        signal: AbortSignal.timeout(30000)
      });

      if (response.ok) {
        const data = await response.json();
        console.log('✅ Contexto semântico obtido:', data.semanticContext ? 'Sim' : 'Não');
        return data.semanticContext || data.pineconeResults || data.context;
      }

      console.warn('⚠️ Busca semântica falhou, continuando sem contexto');
      return null;

    } catch (error) {
      console.error('❌ Erro na busca semântica:', error);
      return null;
    }
  }

  /**
   * Intelligent routing using OpenAI
   */
  private async intelligentRouting(message: string, context: any): Promise<any> {
    try {
      if (!this.OPENAI_API_KEY) {
        console.warn('⚠️ OpenAI API Key não configurada, usando roteamento básico');
        return this.basicRouting(message);
      }

      const response = await fetch('https://api.openai.com/v1/chat/completions', {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${this.OPENAI_API_KEY}`,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          model: 'gpt-4o-mini',
          messages: [
            {
              role: 'system',
              content: `Você é o roteador inteligente do DIBEA. Analise a mensagem e contexto para determinar:

1. INTENT: A intenção do usuário (CREATE_ANIMAL, SEARCH_ANIMAL, UPDATE_ANIMAL, ADOPT_ANIMAL, GENERAL_QUERY, etc.)
2. WORKFLOW: Qual workflow N8N usar (dibea-create-entity, dibea-intelligent-chat, dibea-update-entity, etc.)
3. CONFIDENCE: Confiança na decisão (0.0 a 1.0)
4. PARAMETERS: Parâmetros extraídos da mensagem
5. TOOL_CALLS: Chamadas de ferramentas necessárias

Contexto disponível:
- Histórico da conversa
- Contexto semântico do Pinecone
- Última intenção e agente usado

Responda APENAS em JSON válido:
{
  "intent": "CREATE_ANIMAL",
  "workflow": "dibea-create-entity",
  "agent": "ANIMAL_AGENT",
  "confidence": 0.95,
  "parameters": {
    "entity_type": "animal",
    "extracted_data": {}
  },
  "tool_calls": [
    {
      "type": "database_query",
      "parameters": {"query": "SELECT * FROM animals WHERE status = 'DISPONIVEL'"}
    }
  ],
  "reasoning": "Usuário quer cadastrar um novo animal"
}`
            },
            {
              role: 'user',
              content: `Mensagem: "${message}"
              
Contexto da conversa:
${JSON.stringify(context, null, 2)}`
            }
          ],
          temperature: 0.1,
          max_tokens: 1000
        })
      });

      if (!response.ok) {
        throw new Error(`OpenAI API error: ${response.status}`);
      }

      const data = await response.json();
      const result = JSON.parse(data.choices[0].message.content);
      
      console.log('✅ Roteamento inteligente:', result);
      return result;

    } catch (error) {
      console.error('❌ Erro no roteamento inteligente:', error);
      return this.basicRouting(message);
    }
  }

  /**
   * Basic routing fallback
   */
  private basicRouting(message: string): any {
    const lowerMessage = message.toLowerCase();

    if (lowerMessage.includes('cadastrar') || lowerMessage.includes('criar')) {
      return {
        intent: 'CREATE_ENTITY',
        workflow: 'dibea-create-entity',
        agent: 'CREATE_AGENT',
        confidence: 0.7,
        parameters: { action: 'create' },
        tool_calls: [],
        reasoning: 'Detectou intenção de criar'
      };
    }

    if (lowerMessage.includes('buscar') || lowerMessage.includes('procurar')) {
      return {
        intent: 'SEARCH_ENTITY',
        workflow: 'dibea-intelligent-chat',
        agent: 'SEARCH_AGENT',
        confidence: 0.7,
        parameters: { action: 'search', query: message },
        tool_calls: [
          {
            type: 'database_query',
            parameters: { query: `SELECT * FROM animals WHERE name ILIKE '%${message}%' LIMIT 10` }
          }
        ],
        reasoning: 'Detectou intenção de busca'
      };
    }

    return {
      intent: 'GENERAL_QUERY',
      workflow: 'dibea-intelligent-chat',
      agent: 'GENERAL_AGENT',
      confidence: 0.5,
      parameters: {},
      tool_calls: [],
      reasoning: 'Consulta geral'
    };
  }

  /**
   * Execute N8N workflow with enhanced context
   */
  private async executeWorkflow(routingResult: any, context: any): Promise<N8NWorkflowResponse> {
    try {
      // Map to working webhooks
      const workflowMapping: { [key: string]: string } = {
        'dibea-create-entity': 'dibea-agent',
        'dibea-intelligent-chat': 'dibea-master',
        'dibea-update-entity': 'dibea-agent',
        'general-agent': 'dibea-agent'
      };

      const webhookName = workflowMapping[routingResult.workflow] || 'dibea-master';
      const workflowUrl = `${this.N8N_BASE_URL}/webhook/${webhookName}`;

      console.log('🚀 Executando workflow:', workflowUrl);
      console.log('📊 Payload:', {
        userInput: context.message,
        sessionId: context.sessionId,
        intent: routingResult.intent
      });

      const response = await fetch(workflowUrl, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          userInput: context.message,
          userMessage: context.message,
          sessionId: context.sessionId,
          userId: context.userId,
          context: {
            ...context.conversationContext,
            semanticContext: context.semanticContext,
            routing: routingResult,
            timestamp: new Date().toISOString(),
            conversationHistory: context.conversationContext?.conversationHistory?.slice(-5) || []
          },
          routing: routingResult,
          intent: routingResult.intent,
          agent: routingResult.agent
        }),
        signal: AbortSignal.timeout(60000) // 60 seconds for LLM processing
      });

      if (!response.ok) {
        const errorText = await response.text();
        console.error('❌ N8N Error Response:', errorText);
        throw new Error(`N8N workflow error: ${response.status} ${response.statusText} - ${errorText}`);
      }

      const data = await response.json();
      console.log('✅ N8N Response:', data);

      return {
        message: data.message || data.response || data.text || 'Processamento concluído pelo N8N',
        agent: data.agent || routingResult.agent,
        confidence: data.confidence || routingResult.confidence,
        actions: data.actions || [],
        metadata: {
          workflow: routingResult.workflow,
          webhook: webhookName,
          intent: routingResult.intent,
          n8nResponse: data,
          timestamp: new Date().toISOString()
        },
        toolCalls: routingResult.tool_calls || []
      };

    } catch (error) {
      console.error('❌ Erro na execução do workflow:', error);
      throw error;
    }
  }

  /**
   * Execute tool calls (database queries, etc.)
   */
  private async executeToolCalls(toolCalls: ToolCall[], sessionId: string): Promise<void> {
    for (const toolCall of toolCalls) {
      try {
        console.log('🔧 Executando tool call:', toolCall.type);

        switch (toolCall.type) {
          case 'database_query':
            toolCall.result = await this.executeDatabaseQuery(toolCall.parameters.query);
            break;

          case 'pinecone_search':
            toolCall.result = await this.executePineconeSearch(toolCall.parameters);
            break;

          case 'create_entity':
            toolCall.result = await this.createEntity(toolCall.parameters);
            break;

          case 'update_entity':
            toolCall.result = await this.updateEntity(toolCall.parameters);
            break;

          default:
            console.warn('⚠️ Tool call type não reconhecido:', toolCall.type);
        }

        console.log('✅ Tool call executado:', toolCall.type, toolCall.result);

      } catch (error) {
        console.error('❌ Erro no tool call:', toolCall.type, error);
        toolCall.result = { error: error.message };
      }
    }
  }

  /**
   * Execute database query
   */
  private async executeDatabaseQuery(query: string): Promise<any> {
    try {
      // Sanitize query to prevent SQL injection
      if (query.toLowerCase().includes('drop') ||
          query.toLowerCase().includes('delete') ||
          query.toLowerCase().includes('truncate')) {
        throw new Error('Operação não permitida');
      }

      const result = await prisma.$queryRawUnsafe(query);
      return result;

    } catch (error) {
      console.error('❌ Erro na query do banco:', error);
      throw error;
    }
  }

  /**
   * Execute Pinecone search
   */
  private async executePineconeSearch(parameters: any): Promise<any> {
    try {
      // Use N8N workflow for Pinecone operations
      const response = await fetch(`${this.N8N_BASE_URL}/webhook/dibea-intelligent-chat`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          userInput: parameters.query,
          context: {
            pineconeOnly: true,
            namespace: parameters.namespace || 'real-entities',
            topK: parameters.topK || 5
          }
        })
      });

      if (response.ok) {
        const data = await response.json();
        return data.pineconeResults || data.matches;
      }

      throw new Error('Pinecone search failed');

    } catch (error) {
      console.error('❌ Erro na busca Pinecone:', error);
      throw error;
    }
  }

  /**
   * Create entity using N8N workflow
   */
  private async createEntity(parameters: any): Promise<any> {
    try {
      const response = await fetch(`${this.N8N_BASE_URL}/webhook/dibea-create-entity`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          entityType: parameters.entity_type,
          entityData: parameters.data,
          context: parameters.context
        })
      });

      if (response.ok) {
        return await response.json();
      }

      throw new Error('Entity creation failed');

    } catch (error) {
      console.error('❌ Erro na criação de entidade:', error);
      throw error;
    }
  }

  /**
   * Update entity using N8N workflow
   */
  private async updateEntity(parameters: any): Promise<any> {
    try {
      const response = await fetch(`${this.N8N_BASE_URL}/webhook/dibea-update-entity`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          entityType: parameters.entity_type,
          entityId: parameters.entity_id,
          updateData: parameters.data,
          context: parameters.context
        })
      });

      if (response.ok) {
        return await response.json();
      }

      throw new Error('Entity update failed');

    } catch (error) {
      console.error('❌ Erro na atualização de entidade:', error);
      throw error;
    }
  }

  /**
   * Update conversation context with new interaction
   */
  private async updateConversationContext(
    sessionId: string,
    userId?: string,
    interaction?: {
      userMessage: string;
      assistantResponse: string;
      agent: string;
      intent: string;
      metadata?: any;
    }
  ): Promise<void> {
    try {
      const currentContext = await this.loadConversationContext(sessionId, userId);

      // Add new interaction to history
      if (interaction) {
        currentContext.conversationHistory.push(
          {
            role: 'user',
            content: interaction.userMessage,
            timestamp: new Date(),
            metadata: { intent: interaction.intent }
          },
          {
            role: 'assistant',
            content: interaction.assistantResponse,
            timestamp: new Date(),
            metadata: { agent: interaction.agent, ...interaction.metadata }
          }
        );

        // Keep only last 20 messages to prevent context from growing too large
        if (currentContext.conversationHistory.length > 20) {
          currentContext.conversationHistory = currentContext.conversationHistory.slice(-20);
        }

        currentContext.lastIntent = interaction.intent;
        currentContext.lastAgent = interaction.agent;
      }

      // Update context in database
      await prisma.$executeRaw`
        INSERT INTO conversation_contexts (session_id, user_id, context_data, last_intent, last_agent, updated_at)
        VALUES (${sessionId}, ${userId}, ${JSON.stringify({
          ...currentContext.contextData,
          conversationHistory: currentContext.conversationHistory
        })}, ${currentContext.lastIntent}, ${currentContext.lastAgent}, ${new Date()})
        ON CONFLICT (session_id) DO UPDATE SET
          context_data = EXCLUDED.context_data,
          last_intent = EXCLUDED.last_intent,
          last_agent = EXCLUDED.last_agent,
          updated_at = EXCLUDED.updated_at
      `;

    } catch (error) {
      console.error('❌ Erro ao atualizar contexto:', error);
    }
  }

  /**
   * Store interaction for analytics
   */
  private async storeInteraction(
    userId: string | undefined,
    agentName: string,
    userInput: string,
    response: N8NWorkflowResponse
  ): Promise<void> {
    try {
      await prisma.agentInteraction.create({
        data: {
          userId,
          agentName,
          userInput,
          agentResponse: response.message,
          responseTimeMs: 0, // Could be calculated if needed
          success: true,
          createdAt: new Date()
        }
      });

    } catch (error) {
      console.error('❌ Erro ao armazenar interação:', error);
    }
  }

  /**
   * Intelligent fallback when workflows fail
   */
  private async intelligentFallback(
    message: string,
    sessionId: string,
    userId?: string,
    error?: any
  ): Promise<N8NWorkflowResponse> {
    try {
      console.log('🔄 Executando fallback inteligente');

      // Try to provide a contextual response based on the message
      const context = await this.loadConversationContext(sessionId, userId);

      let fallbackMessage = '';
      let actions: any[] = [];

      // Analyze message for fallback response
      const lowerMessage = message.toLowerCase();

      if (lowerMessage.includes('animal') || lowerMessage.includes('cão') || lowerMessage.includes('gato')) {
        // Try to get some animals from database
        try {
          const animals = await prisma.animal.findMany({
            take: 3,
            where: { status: 'DISPONIVEL' },
            include: { municipality: true }
          });

          if (animals.length > 0) {
            fallbackMessage = `Encontrei ${animals.length} animais disponíveis para adoção:\n\n` +
              animals.map(animal =>
                `🐾 **${animal.name}** (${animal.species})\n` +
                `   Porte: ${animal.size || 'Não informado'}\n` +
                `   Local: ${animal.municipality.name}\n`
              ).join('\n');

            actions = animals.map(animal => ({
              type: 'view_animal',
              label: `Ver ${animal.name}`,
              data: { animalId: animal.id }
            }));
          } else {
            fallbackMessage = 'No momento não temos animais disponíveis para adoção, mas nossa equipe está sempre trabalhando para resgatar e cuidar de novos animais.';
          }
        } catch (dbError) {
          fallbackMessage = 'Estou com dificuldades para acessar informações sobre animais no momento. Tente novamente em alguns instantes.';
        }
      } else if (lowerMessage.includes('adoção') || lowerMessage.includes('adotar')) {
        fallbackMessage = `Para adotar um animal, você precisa:\n\n` +
          `1. 📋 Preencher o formulário de interesse\n` +
          `2. 🏠 Passar por uma avaliação de perfil\n` +
          `3. 📄 Apresentar documentação necessária\n` +
          `4. 🤝 Assinar o termo de adoção responsável\n\n` +
          `Posso ajudá-lo com qualquer uma dessas etapas!`;

        actions = [
          { type: 'start_adoption', label: 'Iniciar processo de adoção' },
          { type: 'view_requirements', label: 'Ver requisitos' }
        ];
      } else {
        fallbackMessage = `Recebi sua mensagem: "${message}"\n\n` +
          `Estou temporariamente com dificuldades técnicas, mas posso ajudá-lo com:\n` +
          `• 🐾 Informações sobre animais para adoção\n` +
          `• 📋 Processos de adoção\n` +
          `• 📞 Contatos da prefeitura\n` +
          `• 📄 Documentação necessária\n\n` +
          `Tente reformular sua pergunta ou escolha uma das opções abaixo.`;

        actions = [
          { type: 'view_animals', label: 'Ver animais disponíveis' },
          { type: 'adoption_info', label: 'Como adotar' },
          { type: 'contact_info', label: 'Falar com atendente' }
        ];
      }

      // Update context even for fallback
      await this.updateConversationContext(sessionId, userId, {
        userMessage: message,
        assistantResponse: fallbackMessage,
        agent: 'FALLBACK_AGENT',
        intent: 'FALLBACK',
        metadata: { error: error?.message, timestamp: new Date().toISOString() }
      });

      return {
        message: fallbackMessage,
        agent: 'FALLBACK_AGENT',
        confidence: 0.3,
        actions,
        metadata: {
          fallback: true,
          error: error?.message,
          timestamp: new Date().toISOString()
        }
      };

    } catch (fallbackError) {
      console.error('❌ Erro no fallback inteligente:', fallbackError);

      return {
        message: 'Desculpe, estou com dificuldades técnicas no momento. Tente novamente em alguns instantes ou entre em contato com nossa equipe.',
        agent: 'ERROR_AGENT',
        confidence: 0.1,
        actions: [
          { type: 'retry', label: 'Tentar novamente' },
          { type: 'contact_support', label: 'Falar com suporte' }
        ],
        metadata: {
          error: true,
          fallbackError: fallbackError?.message,
          timestamp: new Date().toISOString()
        }
      };
    }
  }
}
