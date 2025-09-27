import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

export interface AgentInteractionData {
  agentId: string;
  agentName: string;
  userId?: string;
  sessionId?: string;
  inputMessage: string;
  outputMessage?: string;
  success: boolean;
  responseTimeMs: number;
  errorMessage?: string;
  metadata?: any;
}

export class AgentMetricsService {
  
  // Registrar uma interação com agente
  static async recordInteraction(data: AgentInteractionData) {
    try {
      // Registrar a interação
      const interaction = await prisma.agentInteraction.create({
        data: {
          agentId: data.agentId,
          agentName: data.agentName,
          userId: data.userId,
          sessionId: data.sessionId,
          inputMessage: data.inputMessage,
          outputMessage: data.outputMessage,
          success: data.success,
          responseTimeMs: data.responseTimeMs,
          errorMessage: data.errorMessage,
          metadata: data.metadata
        }
      });

      // Atualizar métricas diárias
      await this.updateDailyMetrics(data.agentId, data.agentName);

      return interaction;
    } catch (error) {
      console.error('Error recording agent interaction:', error);
      throw error;
    }
  }

  // Atualizar métricas diárias do agente
  static async updateDailyMetrics(agentId: string, agentName: string) {
    try {
      const today = new Date();
      today.setHours(0, 0, 0, 0);

      // Buscar interações do dia
      const todayInteractions = await prisma.agentInteraction.findMany({
        where: {
          agentId,
          createdAt: {
            gte: today
          }
        }
      });

      const totalInteractions = todayInteractions.length;
      const successfulInteractions = todayInteractions.filter(i => i.success).length;
      const failedInteractions = totalInteractions - successfulInteractions;
      const avgResponseTime = totalInteractions > 0 
        ? todayInteractions.reduce((sum, i) => sum + i.responseTimeMs, 0) / totalInteractions 
        : 0;
      const lastActivity = todayInteractions.length > 0 
        ? todayInteractions[todayInteractions.length - 1].createdAt 
        : null;

      // Upsert métricas diárias
      await prisma.agentMetrics.upsert({
        where: {
          agentId_date: {
            agentId,
            date: today
          }
        },
        update: {
          totalInteractions,
          successfulInteractions,
          failedInteractions,
          avgResponseTimeMs: avgResponseTime,
          lastActivity,
          status: 'online'
        },
        create: {
          agentId,
          agentName,
          date: today,
          totalInteractions,
          successfulInteractions,
          failedInteractions,
          avgResponseTimeMs: avgResponseTime,
          lastActivity,
          status: 'online'
        }
      });

    } catch (error) {
      console.error('Error updating daily metrics:', error);
      throw error;
    }
  }

  // Buscar métricas de todos os agentes
  static async getAllAgentMetrics() {
    try {
      const today = new Date();
      today.setHours(0, 0, 0, 0);

      // Buscar métricas de hoje
      const todayMetrics = await prisma.agentMetrics.findMany({
        where: {
          date: today
        }
      });

      // Buscar métricas históricas (últimos 7 dias)
      const sevenDaysAgo = new Date(today);
      sevenDaysAgo.setDate(sevenDaysAgo.getDate() - 7);

      const historicalMetrics = await prisma.agentMetrics.findMany({
        where: {
          date: {
            gte: sevenDaysAgo,
            lt: today
          }
        }
      });

      // Calcular métricas agregadas
      const agentSummary = await this.calculateAgentSummary();

      return {
        todayMetrics,
        historicalMetrics,
        summary: agentSummary
      };
    } catch (error) {
      console.error('Error fetching agent metrics:', error);
      throw error;
    }
  }

  // Calcular resumo dos agentes
  static async calculateAgentSummary() {
    try {
      const today = new Date();
      today.setHours(0, 0, 0, 0);

      // Buscar todas as interações de hoje
      const todayInteractions = await prisma.agentInteraction.findMany({
        where: {
          createdAt: {
            gte: today
          }
        }
      });

      // Agrupar por agente
      const agentGroups = todayInteractions.reduce((acc, interaction) => {
        if (!acc[interaction.agentId]) {
          acc[interaction.agentId] = {
            agentId: interaction.agentId,
            agentName: interaction.agentName,
            interactions: []
          };
        }
        acc[interaction.agentId].interactions.push(interaction);
        return acc;
      }, {} as any);

      // Calcular métricas para cada agente
      const agentSummaries = Object.values(agentGroups).map((group: any) => {
        const interactions = group.interactions;
        const totalInteractions = interactions.length;
        const successfulInteractions = interactions.filter((i: any) => i.success).length;
        const successRate = totalInteractions > 0 ? (successfulInteractions / totalInteractions) * 100 : 0;
        const avgResponseTime = totalInteractions > 0 
          ? interactions.reduce((sum: number, i: any) => sum + i.responseTimeMs, 0) / totalInteractions 
          : 0;
        const lastActivity = interactions.length > 0 
          ? interactions[interactions.length - 1].createdAt 
          : null;

        return {
          agentId: group.agentId,
          agentName: group.agentName,
          status: 'online',
          totalInteractions,
          successRate: Math.round(successRate * 10) / 10,
          avgResponseTime: Math.round(avgResponseTime * 10) / 10,
          lastActivity: lastActivity ? this.formatTimeAgo(lastActivity) : 'Nunca',
          capabilities: this.getAgentCapabilities(group.agentId)
        };
      });

      // Adicionar agentes que não tiveram interações hoje
      const allAgentIds = ['animal-agent', 'procedure-agent', 'document-agent', 'tutor-agent', 'general-agent'];
      const activeAgentIds = agentSummaries.map(a => a.agentId);
      
      for (const agentId of allAgentIds) {
        if (!activeAgentIds.includes(agentId)) {
          agentSummaries.push({
            agentId,
            agentName: this.getAgentName(agentId),
            status: 'offline',
            totalInteractions: 0,
            successRate: 0,
            avgResponseTime: 0,
            lastActivity: 'Nunca',
            capabilities: this.getAgentCapabilities(agentId)
          });
        }
      }

      return agentSummaries;
    } catch (error) {
      console.error('Error calculating agent summary:', error);
      throw error;
    }
  }

  // Simular interações para demonstração
  static async simulateInteractions() {
    try {
      const agents = [
        { id: 'animal-agent', name: 'Animal Agent' },
        { id: 'procedure-agent', name: 'Procedure Agent' },
        { id: 'document-agent', name: 'Document Agent' },
        { id: 'tutor-agent', name: 'Tutor Agent' },
        { id: 'general-agent', name: 'General Agent' }
      ];

      const sampleQueries = [
        'Informações sobre Rex',
        'Como adotar um animal?',
        'Procedimentos de vacinação',
        'Validar documento de tutor',
        'Estatísticas do sistema'
      ];

      const users = await prisma.user.findMany({ take: 5 });

      // Criar interações simuladas para os últimos 7 dias
      for (let day = 0; day < 7; day++) {
        const date = new Date();
        date.setDate(date.getDate() - day);
        
        for (const agent of agents) {
          const numInteractions = Math.floor(Math.random() * 50) + 10; // 10-60 interações por dia
          
          for (let i = 0; i < numInteractions; i++) {
            const responseTime = Math.floor(Math.random() * 3000) + 500; // 500-3500ms
            const success = Math.random() > 0.1; // 90% taxa de sucesso
            const user = users[Math.floor(Math.random() * users.length)];
            const query = sampleQueries[Math.floor(Math.random() * sampleQueries.length)];
            
            const interactionDate = new Date(date);
            interactionDate.setHours(
              Math.floor(Math.random() * 24),
              Math.floor(Math.random() * 60),
              Math.floor(Math.random() * 60)
            );

            await prisma.agentInteraction.create({
              data: {
                agentId: agent.id,
                agentName: agent.name,
                userId: user.id,
                sessionId: `session-${Date.now()}-${Math.random()}`,
                inputMessage: query,
                outputMessage: success ? `Resposta para: ${query}` : null,
                success,
                responseTimeMs: responseTime,
                errorMessage: success ? null : 'Erro simulado',
                createdAt: interactionDate,
                metadata: {
                  simulated: true,
                  day: day
                }
              }
            });
          }
          
          // Atualizar métricas para este dia
          await this.updateDailyMetricsForDate(agent.id, agent.name, date);
        }
      }

      console.log('✅ Interações simuladas criadas com sucesso!');
    } catch (error) {
      console.error('Error simulating interactions:', error);
      throw error;
    }
  }

  // Atualizar métricas para uma data específica
  static async updateDailyMetricsForDate(agentId: string, agentName: string, date: Date) {
    try {
      const startOfDay = new Date(date);
      startOfDay.setHours(0, 0, 0, 0);
      
      const endOfDay = new Date(date);
      endOfDay.setHours(23, 59, 59, 999);

      const dayInteractions = await prisma.agentInteraction.findMany({
        where: {
          agentId,
          createdAt: {
            gte: startOfDay,
            lte: endOfDay
          }
        }
      });

      const totalInteractions = dayInteractions.length;
      const successfulInteractions = dayInteractions.filter(i => i.success).length;
      const failedInteractions = totalInteractions - successfulInteractions;
      const avgResponseTime = totalInteractions > 0 
        ? dayInteractions.reduce((sum, i) => sum + i.responseTimeMs, 0) / totalInteractions 
        : 0;
      const lastActivity = dayInteractions.length > 0 
        ? dayInteractions[dayInteractions.length - 1].createdAt 
        : null;

      await prisma.agentMetrics.upsert({
        where: {
          agentId_date: {
            agentId,
            date: startOfDay
          }
        },
        update: {
          totalInteractions,
          successfulInteractions,
          failedInteractions,
          avgResponseTimeMs: avgResponseTime,
          lastActivity,
          status: 'online'
        },
        create: {
          agentId,
          agentName,
          date: startOfDay,
          totalInteractions,
          successfulInteractions,
          failedInteractions,
          avgResponseTimeMs: avgResponseTime,
          lastActivity,
          status: 'online'
        }
      });

    } catch (error) {
      console.error('Error updating metrics for date:', error);
      throw error;
    }
  }

  // Funções auxiliares
  static getAgentName(agentId: string): string {
    const names: { [key: string]: string } = {
      'animal-agent': 'Animal Agent',
      'procedure-agent': 'Procedure Agent',
      'document-agent': 'Document Agent',
      'tutor-agent': 'Tutor Agent',
      'general-agent': 'General Agent'
    };
    return names[agentId] || agentId;
  }

  static getAgentCapabilities(agentId: string): string[] {
    const capabilities: { [key: string]: string[] } = {
      'animal-agent': ['Cadastro de animais', 'Consulta de dados', 'Validação de informações', 'Geração de relatórios'],
      'procedure-agent': ['Protocolos médicos', 'Agendamentos', 'Histórico médico', 'Recomendações'],
      'document-agent': ['OCR de documentos', 'Análise de imagens', 'Extração de dados', 'Validação'],
      'tutor-agent': ['Cadastro de tutores', 'Validação de CPF', 'Consulta CEP', 'Análise de perfil'],
      'general-agent': ['Consultas gerais', 'Roteamento inteligente', 'FAQ', 'Suporte básico']
    };
    return capabilities[agentId] || [];
  }

  static formatTimeAgo(date: Date): string {
    const now = new Date();
    const diffInMinutes = Math.floor((now.getTime() - date.getTime()) / (1000 * 60));
    
    if (diffInMinutes < 1) return 'agora';
    if (diffInMinutes < 60) return `${diffInMinutes} min atrás`;
    
    const diffInHours = Math.floor(diffInMinutes / 60);
    if (diffInHours < 24) return `${diffInHours} hora${diffInHours > 1 ? 's' : ''} atrás`;
    
    const diffInDays = Math.floor(diffInHours / 24);
    return `${diffInDays} dia${diffInDays > 1 ? 's' : ''} atrás`;
  }
}
