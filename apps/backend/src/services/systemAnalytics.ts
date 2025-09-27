import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

export class SystemAnalyticsService {
  
  // Gerar analytics do sistema
  static async generateSystemAnalytics() {
    try {
      const today = new Date();
      today.setHours(0, 0, 0, 0);

      // Métricas de usuários
      const totalUsers = await prisma.user.count();
      const activeUsers = await prisma.user.count({
        where: { is_active: true }
      });
      const newUsersToday = await prisma.user.count({
        where: {
          createdAt: {
            gte: today
          }
        }
      });

      // Métricas de animais
      const totalAnimals = await prisma.animal.count();
      const adoptedAnimals = await prisma.animal.count({
        where: { status: 'ADOTADO' }
      });
      const availableAnimals = await prisma.animal.count({
        where: { status: 'DISPONIVEL' }
      });

      // Métricas de adoções
      const totalAdoptions = await prisma.adoption.count();
      const pendingAdoptions = await prisma.adoption.count({
        where: { status: 'PENDENTE' }
      });
      const completedAdoptions = await prisma.adoption.count({
        where: { status: 'APROVADA' }
      });

      // Métricas de agentes (hoje)
      const agentInteractionsToday = await prisma.agentInteraction.count({
        where: {
          createdAt: {
            gte: today
          }
        }
      });

      const successfulInteractionsToday = await prisma.agentInteraction.count({
        where: {
          createdAt: {
            gte: today
          },
          success: true
        }
      });

      // Métricas de procedimentos (usando appointments como proxy)
      const totalProcedures = await prisma.appointment.count();
      const proceduresToday = await prisma.appointment.count({
        where: {
          createdAt: {
            gte: today
          }
        }
      });

      // Métricas de reclamações
      const totalComplaints = await prisma.complaint.count();
      const openComplaints = await prisma.complaint.count({
        where: { status: 'ABERTA' }
      });

      // Calcular taxas
      const adoptionRate = totalAnimals > 0 ? (adoptedAnimals / totalAnimals) * 100 : 0;
      const agentSuccessRate = agentInteractionsToday > 0 
        ? (successfulInteractionsToday / agentInteractionsToday) * 100 
        : 0;
      const userGrowthRate = await this.calculateUserGrowthRate();

      // Dados para gráficos
      const weeklyData = await this.getWeeklyData();
      const agentPerformance = await this.getAgentPerformanceData();
      const municipalityStats = await this.getMunicipalityStats();

      return {
        overview: {
          totalUsers,
          activeUsers,
          newUsersToday,
          totalAnimals,
          adoptedAnimals,
          availableAnimals,
          totalAdoptions,
          pendingAdoptions,
          completedAdoptions,
          agentInteractionsToday,
          successfulInteractionsToday,
          totalProcedures,
          proceduresToday,
          totalComplaints,
          openComplaints
        },
        rates: {
          adoptionRate: Math.round(adoptionRate * 10) / 10,
          agentSuccessRate: Math.round(agentSuccessRate * 10) / 10,
          userGrowthRate: Math.round(userGrowthRate * 10) / 10
        },
        charts: {
          weeklyData,
          agentPerformance,
          municipalityStats
        },
        insights: await this.generateInsights()
      };
    } catch (error) {
      console.error('Error generating system analytics:', error);
      throw error;
    }
  }

  // Calcular taxa de crescimento de usuários
  static async calculateUserGrowthRate() {
    try {
      const today = new Date();
      const lastWeek = new Date(today);
      lastWeek.setDate(lastWeek.getDate() - 7);
      const twoWeeksAgo = new Date(today);
      twoWeeksAgo.setDate(twoWeeksAgo.getDate() - 14);

      const thisWeekUsers = await prisma.user.count({
        where: {
          createdAt: {
            gte: lastWeek
          }
        }
      });

      const lastWeekUsers = await prisma.user.count({
        where: {
          createdAt: {
            gte: twoWeeksAgo,
            lt: lastWeek
          }
        }
      });

      if (lastWeekUsers === 0) return thisWeekUsers > 0 ? 100 : 0;
      return ((thisWeekUsers - lastWeekUsers) / lastWeekUsers) * 100;
    } catch (error) {
      console.error('Error calculating user growth rate:', error);
      return 0;
    }
  }

  // Dados semanais para gráficos
  static async getWeeklyData() {
    try {
      const weeklyData = [];
      const today = new Date();

      for (let i = 6; i >= 0; i--) {
        const date = new Date(today);
        date.setDate(date.getDate() - i);
        date.setHours(0, 0, 0, 0);
        
        const nextDay = new Date(date);
        nextDay.setDate(nextDay.getDate() + 1);

        const [users, animals, interactions, procedures] = await Promise.all([
          prisma.user.count({
            where: {
              createdAt: {
                gte: date,
                lt: nextDay
              }
            }
          }),
          prisma.animal.count({
            where: {
              createdAt: {
                gte: date,
                lt: nextDay
              }
            }
          }),
          prisma.agentInteraction.count({
            where: {
              createdAt: {
                gte: date,
                lt: nextDay
              }
            }
          }),
          prisma.appointment.count({
            where: {
              createdAt: {
                gte: date,
                lt: nextDay
              }
            }
          })
        ]);

        weeklyData.push({
          date: date.toISOString().split('T')[0],
          users,
          animals,
          interactions,
          procedures
        });
      }

      return weeklyData;
    } catch (error) {
      console.error('Error getting weekly data:', error);
      return [];
    }
  }

  // Performance dos agentes
  static async getAgentPerformanceData() {
    try {
      const today = new Date();
      today.setHours(0, 0, 0, 0);

      const agentMetrics = await prisma.agentMetrics.findMany({
        where: {
          date: today
        }
      });

      return agentMetrics.map(metric => ({
        agentId: metric.agentId,
        agentName: metric.agentName,
        interactions: metric.totalInteractions,
        successRate: metric.totalInteractions > 0 
          ? (metric.successfulInteractions / metric.totalInteractions) * 100 
          : 0,
        avgResponseTime: metric.avgResponseTimeMs
      }));
    } catch (error) {
      console.error('Error getting agent performance data:', error);
      return [];
    }
  }

  // Estatísticas por município
  static async getMunicipalityStats() {
    try {
      const municipalities = await prisma.municipality.findMany({
        include: {
          _count: {
            select: {
              users: true,
              animals: true
            }
          }
        }
      });

      return municipalities.map(municipality => ({
        id: municipality.id,
        name: municipality.name,
        state: 'BR', // Default state since it's not in the schema
        users: municipality._count.users,
        animals: municipality._count.animals
      }));
    } catch (error) {
      console.error('Error getting municipality stats:', error);
      return [];
    }
  }

  // Gerar insights automáticos
  static async generateInsights() {
    try {
      const insights = [];

      // Insight sobre adoções
      const adoptionRate = await this.calculateAdoptionRate();
      if (adoptionRate > 80) {
        insights.push({
          type: 'success',
          title: 'Alta Taxa de Adoção',
          description: `Excelente! ${adoptionRate.toFixed(1)}% dos animais foram adotados.`,
          action: 'Continue promovendo as adoções através dos canais digitais.'
        });
      } else if (adoptionRate < 50) {
        insights.push({
          type: 'warning',
          title: 'Taxa de Adoção Baixa',
          description: `Apenas ${adoptionRate.toFixed(1)}% dos animais foram adotados.`,
          action: 'Considere campanhas de conscientização e melhorias no processo.'
        });
      }

      // Insight sobre agentes
      const agentSuccessRate = await this.calculateAgentSuccessRate();
      if (agentSuccessRate > 90) {
        insights.push({
          type: 'success',
          title: 'Agentes IA Performando Bem',
          description: `Taxa de sucesso de ${agentSuccessRate.toFixed(1)}% nas interações.`,
          action: 'Considere expandir o uso dos agentes para mais funcionalidades.'
        });
      }

      // Insight sobre crescimento
      const userGrowthRate = await this.calculateUserGrowthRate();
      if (userGrowthRate > 20) {
        insights.push({
          type: 'info',
          title: 'Crescimento Acelerado',
          description: `Crescimento de ${userGrowthRate.toFixed(1)}% em novos usuários esta semana.`,
          action: 'Prepare a infraestrutura para suportar o crescimento.'
        });
      }

      return insights;
    } catch (error) {
      console.error('Error generating insights:', error);
      return [];
    }
  }

  // Calcular taxa de adoção
  static async calculateAdoptionRate() {
    try {
      const totalAnimals = await prisma.animal.count();
      const adoptedAnimals = await prisma.animal.count({
        where: { status: 'ADOTADO' }
      });
      
      return totalAnimals > 0 ? (adoptedAnimals / totalAnimals) * 100 : 0;
    } catch (error) {
      console.error('Error calculating adoption rate:', error);
      return 0;
    }
  }

  // Calcular taxa de sucesso dos agentes
  static async calculateAgentSuccessRate() {
    try {
      const today = new Date();
      today.setHours(0, 0, 0, 0);

      const totalInteractions = await prisma.agentInteraction.count({
        where: {
          createdAt: {
            gte: today
          }
        }
      });

      const successfulInteractions = await prisma.agentInteraction.count({
        where: {
          createdAt: {
            gte: today
          },
          success: true
        }
      });

      return totalInteractions > 0 ? (successfulInteractions / totalInteractions) * 100 : 0;
    } catch (error) {
      console.error('Error calculating agent success rate:', error);
      return 0;
    }
  }
}
