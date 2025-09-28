'use client';

import { TimelineEvent } from '@/components/timeline/AnimalTimeline';
import { chatService } from './chatService';

export interface AnimalProfile {
  id: string;
  name: string;
  species: string;
  breed: string;
  age: string;
  description: string;
  image: string;
  status: 'available' | 'adopted' | 'in_process' | 'medical_care';
  municipality: string;
  createdAt: string;
  updatedAt: string;
  currentLocation?: string;
  healthStatus?: 'healthy' | 'sick' | 'recovering' | 'critical';
  adoptionProcess?: {
    id: string;
    status: string;
    adopterId: string;
    adopterName: string;
    startDate: string;
  };
}

export interface CreateEventRequest {
  animalId: string;
  type: TimelineEvent['type'];
  title: string;
  description: string;
  metadata?: TimelineEvent['metadata'];
  data?: any;
}

class TimelineService {
  private baseUrl: string;

  constructor() {
    this.baseUrl = 'https://n8n-moveup-u53084.vm.elestio.app';
  }

  private getAuthContext() {
    if (typeof window !== 'undefined') {
      const userData = localStorage.getItem('user');
      if (userData) {
        const user = JSON.parse(userData);
        return {
          userId: user.id,
          userRole: user.role,
          municipality: user.municipality,
          userName: user.name
        };
      }
    }
    return {};
  }

  async getAnimalTimeline(animalId: string): Promise<TimelineEvent[]> {
    try {
      const response = await fetch(`${this.baseUrl}/webhook/dibea-get-animal-timeline`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          animalId,
          context: this.getAuthContext()
        }),
      });

      if (!response.ok) {
        throw new Error(`HTTP ${response.status}: ${response.statusText}`);
      }

      const data = await response.json();
      return data.timeline || this.getMockTimeline(animalId);

    } catch (error) {
      console.error('❌ Erro ao buscar timeline do animal:', error);
      return this.getMockTimeline(animalId);
    }
  }

  async getAnimalProfile(animalId: string): Promise<AnimalProfile | null> {
    try {
      const response = await fetch(`${this.baseUrl}/webhook/dibea-get-animal-profile`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          animalId,
          context: this.getAuthContext()
        }),
      });

      if (!response.ok) {
        throw new Error(`HTTP ${response.status}: ${response.statusText}`);
      }

      const data = await response.json();
      return data.animal || this.getMockAnimalProfile(animalId);

    } catch (error) {
      console.error('❌ Erro ao buscar perfil do animal:', error);
      return this.getMockAnimalProfile(animalId);
    }
  }

  async createTimelineEvent(eventData: CreateEventRequest): Promise<{ success: boolean; eventId?: string; message: string }> {
    try {
      const authContext = this.getAuthContext();
      
      const response = await fetch(`${this.baseUrl}/webhook/dibea-create-timeline-event`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          ...eventData,
          actor: {
            id: authContext.userId,
            name: authContext.userName,
            type: 'user'
          },
          context: authContext
        }),
      });

      if (!response.ok) {
        throw new Error(`HTTP ${response.status}: ${response.statusText}`);
      }

      const data = await response.json();
      return {
        success: true,
        eventId: data.eventId,
        message: data.message || 'Evento criado com sucesso'
      };

    } catch (error) {
      console.error('❌ Erro ao criar evento na timeline:', error);
      return {
        success: false,
        message: 'Erro ao criar evento na timeline'
      };
    }
  }

  async addChatInteraction(animalId: string, message: string, response: string, agent?: string): Promise<void> {
    try {
      await this.createTimelineEvent({
        animalId,
        type: 'chat',
        title: 'Conversa sobre o animal',
        description: `Usuário: "${message}"\nResposta: "${response}"`,
        metadata: {
          agent,
          animalId
        },
        data: {
          userMessage: message,
          botResponse: response,
          agent
        }
      });
    } catch (error) {
      console.error('❌ Erro ao registrar interação de chat:', error);
    }
  }

  async addAdoptionEvent(animalId: string, eventType: 'started' | 'approved' | 'completed' | 'cancelled', details?: string): Promise<void> {
    const titles = {
      started: 'Processo de adoção iniciado',
      approved: 'Adoção aprovada',
      completed: 'Adoção concluída',
      cancelled: 'Processo de adoção cancelado'
    };

    try {
      await this.createTimelineEvent({
        animalId,
        type: 'adoption',
        title: titles[eventType],
        description: details || `Processo de adoção ${eventType === 'started' ? 'foi iniciado' : eventType === 'approved' ? 'foi aprovado' : eventType === 'completed' ? 'foi concluído' : 'foi cancelado'}`,
        metadata: {
          animalId,
          status: eventType
        }
      });
    } catch (error) {
      console.error('❌ Erro ao registrar evento de adoção:', error);
    }
  }

  async addProcedureEvent(animalId: string, procedureType: string, description: string, veterinarian?: string): Promise<void> {
    try {
      await this.createTimelineEvent({
        animalId,
        type: 'procedure',
        title: `Procedimento: ${procedureType}`,
        description,
        metadata: {
          animalId,
          procedureType,
          veterinarian
        }
      });
    } catch (error) {
      console.error('❌ Erro ao registrar procedimento:', error);
    }
  }

  // Mock data for fallback
  private getMockTimeline(animalId: string): TimelineEvent[] {
    const now = new Date();
    return [
      {
        id: '1',
        type: 'system',
        title: 'Animal cadastrado no sistema',
        description: 'Animal foi registrado no sistema DIBEA',
        timestamp: new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000).toISOString(),
        actor: {
          id: 'system',
          name: 'Sistema DIBEA',
          type: 'system'
        },
        metadata: {
          animalId,
          status: 'registered'
        }
      },
      {
        id: '2',
        type: 'health',
        title: 'Exame veterinário inicial',
        description: 'Animal passou por exame veterinário completo. Estado de saúde: bom',
        timestamp: new Date(now.getTime() - 6 * 24 * 60 * 60 * 1000).toISOString(),
        actor: {
          id: 'vet-1',
          name: 'Dr. Maria Silva',
          type: 'veterinarian'
        },
        metadata: {
          animalId,
          severity: 'low' as const
        }
      },
      {
        id: '3',
        type: 'chat',
        title: 'Consulta via chat',
        description: 'Usuário perguntou sobre disponibilidade para adoção',
        timestamp: new Date(now.getTime() - 2 * 24 * 60 * 60 * 1000).toISOString(),
        actor: {
          id: 'user-1',
          name: 'João Santos',
          type: 'user'
        },
        metadata: {
          animalId,
          agent: 'ANIMAL_AGENT'
        }
      },
      {
        id: '4',
        type: 'adoption',
        title: 'Processo de adoção iniciado',
        description: 'Processo de adoção foi iniciado pelo usuário João Santos',
        timestamp: new Date(now.getTime() - 1 * 24 * 60 * 60 * 1000).toISOString(),
        actor: {
          id: 'user-1',
          name: 'João Santos',
          type: 'user'
        },
        metadata: {
          animalId,
          processId: 'proc-123',
          status: 'pending'
        }
      }
    ];
  }

  private getMockAnimalProfile(animalId: string): AnimalProfile {
    return {
      id: animalId,
      name: 'Luna',
      species: 'Cão',
      breed: 'Labrador Mix',
      age: '2 anos',
      description: 'Carinhosa e brincalhona, adora crianças',
      image: 'https://images.unsplash.com/photo-1552053831-71594a27632d?w=400&h=300&fit=crop',
      status: 'available',
      municipality: 'São Paulo',
      createdAt: '2024-01-15T10:00:00Z',
      updatedAt: '2024-01-20T14:30:00Z',
      currentLocation: 'Abrigo Municipal São Paulo',
      healthStatus: 'healthy'
    };
  }
}

export const timelineService = new TimelineService();
