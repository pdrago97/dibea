'use client';

import { useAuth } from '@/contexts/AuthContext';

export interface ChatMessage {
  id: string;
  content: string;
  sender: 'user' | 'bot';
  timestamp: Date;
  type?: 'text' | 'quick-reply' | 'action' | 'system';
  agent?: string;
  status?: 'sending' | 'success' | 'error';
  actions?: Array<{
    label: string;
    action: string;
    icon?: React.ReactNode;
    data?: any;
  }>;
  metadata?: {
    animalId?: string;
    processId?: string;
    documentId?: string;
    sessionId?: string;
  };
}

export interface ChatContext {
  sessionId: string;
  userId?: string;
  userRole?: string;
  municipality?: string;
  timestamp: string;
  previousMessages: ChatMessage[];
  currentFlow?: string;
  flowData?: any;
}

export interface N8nResponse {
  message: string;
  agent?: string;
  actions?: Array<{
    label: string;
    action: string;
    data?: any;
  }>;
  metadata?: any;
  nextStep?: string;
  flowComplete?: boolean;
  data?: any;
}

class ChatService {
  private baseUrl: string;
  private sessionId: string;
  private context: Partial<ChatContext>;

  constructor() {
    this.baseUrl = process.env.NODE_ENV === 'production'
      ? 'https://api.dibea.com'
      : 'http://localhost:3000';
    this.sessionId = this.generateSessionId();
    this.context = {};
  }

  private generateSessionId(): string {
    return `session-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`;
  }

  private getAuthContext() {
    if (typeof window !== 'undefined') {
      const userData = localStorage.getItem('user');
      if (userData) {
        const user = JSON.parse(userData);
        return {
          userId: user.id,
          userRole: user.role,
          municipality: user.municipality
        };
      }
    }
    return {};
  }

  private buildContext(previousMessages: ChatMessage[]): ChatContext {
    return {
      sessionId: this.sessionId,
      ...this.getAuthContext(),
      timestamp: new Date().toISOString(),
      previousMessages: previousMessages.slice(-5), // Last 5 messages for context
      ...this.context
    };
  }

  async sendMessage(
    message: string,
    previousMessages: ChatMessage[] = [],
    flowData?: any
  ): Promise<N8nResponse> {
    try {
      const context = this.buildContext(previousMessages);

      // Update context with flow data if provided
      if (flowData) {
        this.context.currentFlow = flowData.flow;
        this.context.flowData = flowData.data;
      }

      const payload = {
        userInput: message,
        context: {
          ...context,
          currentFlow: this.context.currentFlow,
          flowData: this.context.flowData
        },
        sessionId: this.sessionId
      };

      console.log('🚀 Enviando para Router n8n (auto-forward):', payload);

      // Router now handles auto-forwarding based on confidence
      const response = await this.callRouter(payload);
      console.log('✅ Resposta do sistema:', response);

      // Parse response and extract structured data
      return this.parseN8nResponse(response);

    } catch (error) {
      console.error('❌ Erro ao comunicar com n8n:', error);
      throw error;
    }
  }

  private async callRouter(payload: any): Promise<any> {
    const response = await fetch(`${this.baseUrl}/api/v1/agents/chat`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        message: payload.userInput,
        context: payload.context
      }),
    });

    if (!response.ok) {
      throw new Error(`Router error! status: ${response.status}`);
    }

    return await response.json();
  }

  private async callSpecificAgent(routerData: any, originalPayload: any): Promise<any> {
    const agentType = routerData.agent;
    const agentEndpoints = {
      'ANIMAL_AGENT': '/webhook/animal-agent',
      'PROCEDURE_AGENT': '/webhook/procedure-agent',
      'TUTOR_AGENT': '/webhook/tutor-agent',
      'GENERAL_AGENT': '/webhook/general-agent',
    };

    const endpoint = agentEndpoints[agentType as keyof typeof agentEndpoints];

    if (!endpoint) {
      console.log('⚠️ Agente não encontrado, usando resposta do router');
      return routerData;
    }

    try {
      const agentPayload = {
        ...originalPayload,
        agent: agentType,
        routerData: routerData,
        context: {
          ...originalPayload.context,
          routerContext: routerData.context,
          confidence: routerData.confidence
        }
      };

      const response = await fetch(`${this.baseUrl}${endpoint}`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(agentPayload),
      });

      if (!response.ok) {
        console.warn(`⚠️ Agente ${agentType} falhou, usando resposta do router`);
        return routerData;
      }

      const agentData = await response.json();

      // Merge router and agent data for complete response
      return {
        ...agentData,
        routerAgent: routerData.agent,
        routerConfidence: routerData.confidence,
        routerContext: routerData.context
      };

    } catch (error) {
      console.warn(`⚠️ Erro no agente ${agentType}:`, error);
      return routerData;
    }
  }

  private parseN8nResponse(responseData: any): N8nResponse {
    // Handle backend response format
    const message = responseData?.response ||
                   responseData?.message ||
                   responseData?.text ||
                   'Operação realizada com sucesso';

    const agent = responseData?.agent || 'DIBEA Assistant';

    // Parse actions from backend format
    let actions = responseData?.actions || [];

    if (actions.length === 0) {
      actions = this.generateContextualActions(responseData);
    }

    // Extract metadata
    const metadata = {
      confidence: responseData?.confidence,
      source: responseData?.source,
      ...responseData?.metadata
    };

    return {
      message,
      agent,
      actions,
      metadata,
      nextStep: responseData?.nextStep,
      flowComplete: responseData?.flowComplete,
      data: responseData?.data
    };
  }

  private generateContextualActions(responseData: any): Array<{label: string, action: string, data?: any}> {
    const actions: Array<{label: string, action: string, data?: any}> = [];
    const agent = responseData?.agent || responseData?.routerAgent;

    if (agent === 'ANIMAL_AGENT') {
      actions.push(
        { label: '🐕 Ver animais cadastrados', action: 'list_animals' },
        { label: '➕ Cadastrar outro animal', action: 'new_animal' },
        { label: '🔍 Buscar animal específico', action: 'search_animal' }
      );
    } else if (agent === 'PROCEDURE_AGENT') {
      actions.push(
        { label: '📋 Ver histórico médico', action: 'medical_history' },
        { label: '📅 Agendar consulta', action: 'schedule_appointment' },
        { label: '💉 Registrar vacina', action: 'register_vaccine' }
      );
    } else if (agent === 'TUTOR_AGENT') {
      actions.push(
        { label: '❤️ Ver adoções pendentes', action: 'pending_adoptions' },
        { label: '👤 Cadastrar novo tutor', action: 'new_tutor' },
        { label: '🏠 Processos de adoção', action: 'adoption_processes' }
      );
    } else if (agent === 'GENERAL_AGENT') {
      actions.push(
        { label: '📊 Ver relatórios', action: 'reports' },
        { label: '📈 Estatísticas gerais', action: 'statistics' },
        { label: '🏥 Status do sistema', action: 'system_status' }
      );
    } else {
      // Default actions for any agent
      actions.push(
        { label: '🏠 Voltar ao início', action: 'home' },
        { label: '❓ Ajuda', action: 'help' }
      );
    }

    return actions;
  }

  // Specialized methods for different flows
  async startAnimalRegistration(): Promise<N8nResponse> {
    return this.sendMessage('Quero cadastrar um novo animal', [], {
      flow: 'ANIMAL_REGISTRATION',
      data: {}
    });
  }

  async startAdoptionProcess(animalId: string): Promise<N8nResponse> {
    return this.sendMessage(`Quero adotar o animal ${animalId}`, [], {
      flow: 'ADOPTION_PROCESS',
      data: { animalId }
    });
  }

  async registerProcedure(animalId: string): Promise<N8nResponse> {
    return this.sendMessage(`Registrar procedimento para animal ${animalId}`, [], {
      flow: 'PROCEDURE_REGISTRATION',
      data: { animalId }
    });
  }

  async searchAnimals(query: string): Promise<N8nResponse> {
    return this.sendMessage(`Buscar animais: ${query}`, [], {
      flow: 'ANIMAL_SEARCH',
      data: { query }
    });
  }

  async getAnimalTimeline(animalId: string): Promise<N8nResponse> {
    return this.sendMessage(`Ver histórico do animal ${animalId}`, [], {
      flow: 'ANIMAL_TIMELINE',
      data: { animalId }
    });
  }

  // Reset session for new conversation
  resetSession(): void {
    this.sessionId = this.generateSessionId();
    this.context = {};
  }

  // Get current session info
  getSessionInfo() {
    return {
      sessionId: this.sessionId,
      context: this.context
    };
  }
}

// Singleton instance
export const chatService = new ChatService();

// React hook for using chat service
export function useChatService() {
  return {
    sendMessage: chatService.sendMessage.bind(chatService),
    startAnimalRegistration: chatService.startAnimalRegistration.bind(chatService),
    startAdoptionProcess: chatService.startAdoptionProcess.bind(chatService),
    registerProcedure: chatService.registerProcedure.bind(chatService),
    searchAnimals: chatService.searchAnimals.bind(chatService),
    getAnimalTimeline: chatService.getAnimalTimeline.bind(chatService),
    resetSession: chatService.resetSession.bind(chatService),
    getSessionInfo: chatService.getSessionInfo.bind(chatService)
  };
}
