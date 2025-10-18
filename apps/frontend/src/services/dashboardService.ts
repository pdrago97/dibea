'use client';

import { chatService } from './chatService';

export interface AnimalCard {
  id: string;
  name: string;
  species: string;
  breed: string;
  age: string;
  description: string;
  image: string;
  urgent: boolean;
  municipality: string;
  status: 'available' | 'adopted' | 'in_process';
  createdAt: string;
  updatedAt: string;
}

export interface AdoptionProcess {
  id: string;
  animalId: string;
  animalName: string;
  animalImage?: string;
  status: 'pending' | 'approved' | 'rejected' | 'completed';
  createdAt: string;
  updatedAt: string;
  nextStep: string;
  documents?: Array<{
    id: string;
    name: string;
    status: 'pending' | 'approved' | 'rejected';
  }>;
  timeline?: Array<{
    id: string;
    event: string;
    description: string;
    timestamp: string;
    agent?: string;
  }>;
}

export interface Notification {
  id: string;
  type: 'adoption' | 'process' | 'animal' | 'system';
  title: string;
  message: string;
  timestamp: string;
  read: boolean;
  priority: 'low' | 'medium' | 'high';
  metadata?: {
    animalId?: string;
    processId?: string;
    actionUrl?: string;
  };
}

export interface DashboardStats {
  totalAnimals: number;
  availableAnimals: number;
  adoptedAnimals: number;
  activeProcesses: number;
  completedAdoptions: number;
  pendingDocuments: number;
}

class DashboardService {
  private baseUrl: string;
  private requestTimeout: number = 5000; // 5 second timeout

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
          municipality: user.municipality
        };
      }
    }
    return {};
  }

  private async fetchWithTimeout(url: string, options: RequestInit = {}): Promise<Response> {
    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), this.requestTimeout);

    try {
      const response = await fetch(url, {
        ...options,
        signal: controller.signal
      });
      clearTimeout(timeoutId);
      return response;
    } catch (error) {
      clearTimeout(timeoutId);
      throw error;
    }
  }

  async getFeaturedAnimals(): Promise<AnimalCard[]> {
    try {
      const response = await this.fetchWithTimeout(`${this.baseUrl}/webhook/dibea-get-featured-animals`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          context: this.getAuthContext(),
          limit: 6,
          filters: {
            status: 'available',
            featured: true
          }
        }),
      });

      if (!response.ok) {
        throw new Error(`HTTP ${response.status}: ${response.statusText}`);
      }

      const data = await response.json();
      return data.animals || [];

    } catch (error) {
      console.error('❌ Erro ao buscar animais em destaque:', error);
      // Fallback para dados mockados
      return this.getMockFeaturedAnimals();
    }
  }

  async getAdoptionProcesses(): Promise<AdoptionProcess[]> {
    try {
      const authContext = this.getAuthContext();
      if (!authContext.userId) {
        return [];
      }

      const response = await this.fetchWithTimeout(`${this.baseUrl}/webhook/dibea-get-user-processes`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          context: authContext,
          userId: authContext.userId
        }),
      });

      if (!response.ok) {
        throw new Error(`HTTP ${response.status}: ${response.statusText}`);
      }

      const data = await response.json();
      return data.processes || [];

    } catch (error) {
      console.error('❌ Erro ao buscar processos de adoção:', error);
      // Fallback para dados mockados
      return this.getMockAdoptionProcesses();
    }
  }

  async getNotifications(): Promise<Notification[]> {
    try {
      const authContext = this.getAuthContext();
      if (!authContext.userId) {
        return [];
      }

      const response = await this.fetchWithTimeout(`${this.baseUrl}/webhook/dibea-get-notifications`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          context: authContext,
          userId: authContext.userId,
          limit: 10,
          unreadOnly: false
        }),
      });

      if (!response.ok) {
        throw new Error(`HTTP ${response.status}: ${response.statusText}`);
      }

      const data = await response.json();
      return data.notifications || [];

    } catch (error) {
      console.error('❌ Erro ao buscar notificações:', error);
      // Fallback para dados mockados
      return this.getMockNotifications();
    }
  }

  async getDashboardStats(): Promise<DashboardStats> {
    try {
      const response = await this.fetchWithTimeout(`${this.baseUrl}/webhook/dibea-get-dashboard-stats`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          context: this.getAuthContext()
        }),
      });

      if (!response.ok) {
        throw new Error(`HTTP ${response.status}: ${response.statusText}`);
      }

      const data = await response.json();
      return data.stats || this.getMockStats();

    } catch (error) {
      console.error('❌ Erro ao buscar estatísticas:', error);
      return this.getMockStats();
    }
  }

  async startAdoptionProcess(animalId: string): Promise<{ success: boolean; processId?: string; message: string }> {
    try {
      const response = await chatService.startAdoptionProcess(animalId);
      
      return {
        success: true,
        processId: response.metadata?.processId,
        message: response.message
      };

    } catch (error) {
      console.error('❌ Erro ao iniciar processo de adoção:', error);
      return {
        success: false,
        message: 'Erro ao iniciar processo de adoção. Tente novamente.'
      };
    }
  }

  // Métodos de fallback com dados mockados
  private getMockFeaturedAnimals(): AnimalCard[] {
    return [
      {
        id: '1',
        name: 'Luna',
        species: 'Cão',
        breed: 'Labrador Mix',
        age: '2 anos',
        description: 'Carinhosa e brincalhona, adora crianças',
        image: 'https://images.unsplash.com/photo-1552053831-71594a27632d?w=300&h=200&fit=crop',
        urgent: false,
        municipality: 'São Paulo',
        status: 'available',
        createdAt: '2024-01-15T10:00:00Z',
        updatedAt: '2024-01-15T10:00:00Z'
      },
      {
        id: '2',
        name: 'Milo',
        species: 'Gato',
        breed: 'Siamês',
        age: '1 ano',
        description: 'Calmo e independente, ideal para apartamento',
        image: 'https://images.unsplash.com/photo-1514888286974-6c03e2ca1dba?w=300&h=200&fit=crop',
        urgent: true,
        municipality: 'São Paulo',
        status: 'available',
        createdAt: '2024-01-10T14:30:00Z',
        updatedAt: '2024-01-10T14:30:00Z'
      }
    ];
  }

  private getMockAdoptionProcesses(): AdoptionProcess[] {
    return [
      {
        id: '1',
        animalId: 'animal-123',
        animalName: 'Rex',
        status: 'pending',
        createdAt: '2024-01-15T10:00:00Z',
        updatedAt: '2024-01-15T10:00:00Z',
        nextStep: 'Aguardando análise de documentos'
      }
    ];
  }

  private getMockNotifications(): Notification[] {
    return [
      {
        id: '1',
        type: 'adoption',
        title: 'Novo animal disponível',
        message: 'Novo animal disponível para adoção na sua região',
        timestamp: new Date(Date.now() - 2 * 60 * 60 * 1000).toISOString(),
        read: false,
        priority: 'medium'
      },
      {
        id: '2',
        type: 'process',
        title: 'Processo atualizado',
        message: 'Seu processo de adoção foi atualizado',
        timestamp: new Date(Date.now() - 24 * 60 * 60 * 1000).toISOString(),
        read: false,
        priority: 'high'
      }
    ];
  }

  private getMockStats(): DashboardStats {
    return {
      totalAnimals: 150,
      availableAnimals: 89,
      adoptedAnimals: 61,
      activeProcesses: 12,
      completedAdoptions: 45,
      pendingDocuments: 8
    };
  }
}

export const dashboardService = new DashboardService();
