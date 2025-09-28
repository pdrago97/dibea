'use client';

import { useState, useEffect, useCallback } from 'react';
import { 
  dashboardService, 
  AnimalCard, 
  AdoptionProcess, 
  Notification, 
  DashboardStats 
} from '@/services/dashboardService';

interface DashboardState {
  featuredAnimals: AnimalCard[];
  adoptionProcesses: AdoptionProcess[];
  notifications: Notification[];
  stats: DashboardStats | null;
  isLoading: boolean;
  error: string | null;
  lastUpdated: Date | null;
}

interface DashboardActions {
  refreshData: () => Promise<void>;
  refreshAnimals: () => Promise<void>;
  refreshProcesses: () => Promise<void>;
  refreshNotifications: () => Promise<void>;
  startAdoption: (animalId: string) => Promise<{ success: boolean; message: string }>;
  markNotificationAsRead: (notificationId: string) => void;
  clearError: () => void;
}

export function useDashboard() {
  const [state, setState] = useState<DashboardState>({
    featuredAnimals: [],
    adoptionProcesses: [],
    notifications: [],
    stats: null,
    isLoading: true,
    error: null,
    lastUpdated: null
  });

  const setLoading = useCallback((loading: boolean) => {
    setState(prev => ({ ...prev, isLoading: loading }));
  }, []);

  const setError = useCallback((error: string | null) => {
    setState(prev => ({ ...prev, error }));
  }, []);

  const clearError = useCallback(() => {
    setError(null);
  }, [setError]);

  const refreshAnimals = useCallback(async () => {
    try {
      const animals = await dashboardService.getFeaturedAnimals();
      setState(prev => ({ 
        ...prev, 
        featuredAnimals: animals,
        lastUpdated: new Date()
      }));
    } catch (error) {
      console.error('Erro ao atualizar animais:', error);
      setError('Erro ao carregar animais em destaque');
    }
  }, [setError]);

  const refreshProcesses = useCallback(async () => {
    try {
      const processes = await dashboardService.getAdoptionProcesses();
      setState(prev => ({ 
        ...prev, 
        adoptionProcesses: processes,
        lastUpdated: new Date()
      }));
    } catch (error) {
      console.error('Erro ao atualizar processos:', error);
      setError('Erro ao carregar processos de adoção');
    }
  }, [setError]);

  const refreshNotifications = useCallback(async () => {
    try {
      const notifications = await dashboardService.getNotifications();
      setState(prev => ({ 
        ...prev, 
        notifications,
        lastUpdated: new Date()
      }));
    } catch (error) {
      console.error('Erro ao atualizar notificações:', error);
      setError('Erro ao carregar notificações');
    }
  }, [setError]);

  const refreshStats = useCallback(async () => {
    try {
      const stats = await dashboardService.getDashboardStats();
      setState(prev => ({ 
        ...prev, 
        stats,
        lastUpdated: new Date()
      }));
    } catch (error) {
      console.error('Erro ao atualizar estatísticas:', error);
      setError('Erro ao carregar estatísticas');
    }
  }, [setError]);

  const refreshData = useCallback(async () => {
    setLoading(true);
    setError(null);

    try {
      // Carregar todos os dados em paralelo
      await Promise.allSettled([
        refreshAnimals(),
        refreshProcesses(),
        refreshNotifications(),
        refreshStats()
      ]);
    } catch (error) {
      console.error('Erro ao atualizar dashboard:', error);
      setError('Erro ao carregar dados do dashboard');
    } finally {
      setLoading(false);
    }
  }, [refreshAnimals, refreshProcesses, refreshNotifications, refreshStats, setLoading, setError]);

  const startAdoption = useCallback(async (animalId: string) => {
    try {
      const result = await dashboardService.startAdoptionProcess(animalId);
      
      if (result.success) {
        // Atualizar processos após iniciar adoção
        await refreshProcesses();
        // Atualizar animais para refletir mudança de status
        await refreshAnimals();
      }
      
      return result;
    } catch (error) {
      console.error('Erro ao iniciar adoção:', error);
      return {
        success: false,
        message: 'Erro ao iniciar processo de adoção'
      };
    }
  }, [refreshProcesses, refreshAnimals]);

  const markNotificationAsRead = useCallback((notificationId: string) => {
    setState(prev => ({
      ...prev,
      notifications: prev.notifications.map(notification =>
        notification.id === notificationId
          ? { ...notification, read: true }
          : notification
      )
    }));
  }, []);

  // Carregar dados iniciais
  useEffect(() => {
    refreshData();
  }, [refreshData]);

  // Auto-refresh a cada 5 minutos
  useEffect(() => {
    const interval = setInterval(() => {
      refreshData();
    }, 5 * 60 * 1000); // 5 minutos

    return () => clearInterval(interval);
  }, [refreshData]);

  // Computed values
  const unreadNotifications = state.notifications.filter(n => !n.read);
  const urgentAnimals = state.featuredAnimals.filter(a => a.urgent);
  const activeProcesses = state.adoptionProcesses.filter(p => 
    p.status === 'pending' || p.status === 'approved'
  );

  const actions: DashboardActions = {
    refreshData,
    refreshAnimals,
    refreshProcesses,
    refreshNotifications,
    startAdoption,
    markNotificationAsRead,
    clearError
  };

  return {
    // State
    ...state,
    
    // Computed values
    unreadNotifications,
    urgentAnimals,
    activeProcesses,
    unreadCount: unreadNotifications.length,
    urgentCount: urgentAnimals.length,
    activeProcessCount: activeProcesses.length,
    
    // Actions
    ...actions
  };
}

// Hook para estatísticas específicas
export function useDashboardStats() {
  const { stats, isLoading, error } = useDashboard();
  
  return {
    stats,
    isLoading,
    error,
    hasStats: !!stats
  };
}

// Hook para notificações específicas
export function useNotifications() {
  const { 
    notifications, 
    unreadNotifications, 
    unreadCount,
    markNotificationAsRead,
    refreshNotifications,
    isLoading,
    error 
  } = useDashboard();
  
  return {
    notifications,
    unreadNotifications,
    unreadCount,
    markNotificationAsRead,
    refreshNotifications,
    isLoading,
    error
  };
}
