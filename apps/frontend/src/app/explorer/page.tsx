'use client';

import React, { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { MainNavigation } from '@/components/navigation/MainNavigation';
import { EntityExplorer } from '@/components/navigation/EntityExplorer';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import {
  Search,
  Filter,
  BarChart3,
  Download,
  RefreshCw,
  Settings,
  Eye,
  TrendingUp,
  Users,
  PawPrint,
  Heart,
  Building,
  FileText,
  Calendar,
  Activity
} from 'lucide-react';

interface ExplorerStats {
  totalEntities: number;
  recentlyUpdated: number;
  pendingApproval: number;
  activeProcesses: number;
}

export default function ExplorerPage() {
  const router = useRouter();
  const [userRole, setUserRole] = useState<'ADMIN' | 'FUNCIONARIO' | 'VETERINARIO' | 'CIDADAO'>('CIDADAO');
  const [userName, setUserName] = useState<string>('');
  const [stats, setStats] = useState<ExplorerStats>({
    totalEntities: 0,
    recentlyUpdated: 0,
    pendingApproval: 0,
    activeProcesses: 0
  });
  const [selectedEntity, setSelectedEntity] = useState<any>(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    loadUserData();
    loadExplorerStats();
  }, []);

  const loadUserData = () => {
    try {
      const userData = localStorage.getItem('user');
      if (userData) {
        const user = JSON.parse(userData);
        setUserRole(user.role || 'CIDADAO');
        setUserName(user.name || 'Usuário');
      }
    } catch (error) {
      console.error('Error loading user data:', error);
    }
  };

  const loadExplorerStats = async () => {
    try {
      // Simulate loading explorer statistics
      setStats({
        totalEntities: 3247,
        recentlyUpdated: 45,
        pendingApproval: 23,
        activeProcesses: 89
      });
    } catch (error) {
      console.error('Error loading explorer stats:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const handleEntitySelect = (entity: any) => {
    setSelectedEntity(entity);
    // Navigate to entity detail page
    router.push(`/${userRole.toLowerCase()}/${entity.type}s/${entity.id}`);
  };

  const getQuickStats = () => {
    const baseStats = [
      {
        label: 'Total de Entidades',
        value: stats.totalEntities.toLocaleString(),
        icon: BarChart3,
        color: 'blue'
      },
      {
        label: 'Atualizadas Recentemente',
        value: stats.recentlyUpdated,
        icon: Activity,
        color: 'green'
      }
    ];

    // Add role-specific stats
    if (userRole === 'ADMIN' || userRole === 'FUNCIONARIO') {
      baseStats.push(
        {
          label: 'Pendentes de Aprovação',
          value: stats.pendingApproval,
          icon: Eye,
          color: 'yellow'
        },
        {
          label: 'Processos Ativos',
          value: stats.activeProcesses,
          icon: TrendingUp,
          color: 'purple'
        }
      );
    }

    return baseStats;
  };

  const getQuickActions = () => {
    const baseActions = [
      {
        label: 'Busca Avançada',
        description: 'Buscar entidades com filtros específicos',
        icon: Search,
        action: () => console.log('Advanced search'),
        color: 'blue'
      },
      {
        label: 'Relatórios',
        description: 'Gerar relatórios das entidades',
        icon: BarChart3,
        action: () => router.push(`/${userRole.toLowerCase()}/reports`),
        color: 'green'
      }
    ];

    // Add role-specific actions
    if (userRole === 'ADMIN') {
      baseActions.push(
        {
          label: 'Configurações',
          description: 'Configurar visualizações e permissões',
          icon: Settings,
          action: () => router.push('/admin/settings'),
          color: 'gray'
        },
        {
          label: 'Exportar Dados',
          description: 'Exportar dados das entidades',
          icon: Download,
          action: () => console.log('Export data'),
          color: 'indigo'
        }
      );
    }

    if (userRole === 'FUNCIONARIO' || userRole === 'ADMIN') {
      baseActions.push({
        label: 'Aprovações Pendentes',
        description: 'Revisar itens pendentes de aprovação',
        icon: Eye,
        action: () => router.push(`/${userRole.toLowerCase()}/approvals`),
        color: 'yellow'
      });
    }

    return baseActions;
  };

  if (isLoading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-blue-600"></div>
      </div>
    );
  }

  return (
    <div className="flex min-h-screen bg-gray-50">
      <MainNavigation 
        userRole={userRole} 
        userName={userName}
        notifications={stats.pendingApproval}
        onLogout={() => router.push('/auth/login')}
      />
      
      <div className="flex-1 lg:ml-64">
        <div className="p-6 space-y-8">
          {/* Header */}
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-3xl font-bold text-gray-900">Explorador de Entidades</h1>
              <p className="text-gray-600 mt-1">
                Navegue, visualize e gerencie todas as entidades do sistema DIBEA
              </p>
            </div>
            <div className="flex items-center space-x-3">
              <Button variant="outline" size="sm" onClick={loadExplorerStats}>
                <RefreshCw className="w-4 h-4 mr-2" />
                Atualizar
              </Button>
              <Button variant="outline" size="sm">
                <Filter className="w-4 h-4 mr-2" />
                Filtros
              </Button>
            </div>
          </div>

          {/* Quick Stats */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
            {getQuickStats().map((stat, index) => (
              <Card key={index}>
                <CardContent className="p-6">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-sm font-medium text-gray-600">{stat.label}</p>
                      <p className="text-3xl font-bold text-gray-900">{stat.value}</p>
                    </div>
                    <div className={`w-12 h-12 bg-${stat.color}-100 rounded-full flex items-center justify-center`}>
                      <stat.icon className={`w-6 h-6 text-${stat.color}-600`} />
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>

          {/* Quick Actions */}
          <div>
            <h2 className="text-xl font-semibold text-gray-900 mb-4">Ações Rápidas</h2>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {getQuickActions().map((action, index) => (
                <Card key={index} className="hover:shadow-lg transition-shadow cursor-pointer group">
                  <CardContent className="p-6">
                    <div className="flex items-start space-x-4">
                      <div className={`w-12 h-12 bg-${action.color}-100 rounded-full flex items-center justify-center group-hover:scale-110 transition-transform`}>
                        <action.icon className={`w-6 h-6 text-${action.color}-600`} />
                      </div>
                      <div className="flex-1">
                        <h3 className="font-semibold text-gray-900 mb-1">{action.label}</h3>
                        <p className="text-sm text-gray-600 mb-3">{action.description}</p>
                        <Button size="sm" variant="outline" onClick={action.action}>
                          Executar
                        </Button>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          </div>

          {/* Entity Explorer */}
          <div className="bg-white rounded-lg border border-gray-200">
            <EntityExplorer
              userRole={userRole}
              onEntitySelect={handleEntitySelect}
              showActions={userRole === 'ADMIN' || userRole === 'FUNCIONARIO'}
            />
          </div>

          {/* Recent Activity (for admins and staff) */}
          {(userRole === 'ADMIN' || userRole === 'FUNCIONARIO') && (
            <div>
              <h2 className="text-xl font-semibold text-gray-900 mb-4">Atividade Recente</h2>
              <Card>
                <CardContent className="p-6">
                  <div className="space-y-4">
                    {[
                      {
                        id: '1',
                        type: 'creation',
                        description: 'Novo animal "Rex" cadastrado por João Silva',
                        timestamp: '2024-01-15T10:30:00Z',
                        entity: 'animal'
                      },
                      {
                        id: '2',
                        type: 'approval',
                        description: 'Veterinário Dr. Ana Silva aprovado',
                        timestamp: '2024-01-15T09:15:00Z',
                        entity: 'user'
                      },
                      {
                        id: '3',
                        type: 'completion',
                        description: 'Processo de adoção de "Luna" finalizado',
                        timestamp: '2024-01-15T08:45:00Z',
                        entity: 'adoption'
                      },
                      {
                        id: '4',
                        type: 'update',
                        description: 'Procedimento de castração atualizado',
                        timestamp: '2024-01-15T07:30:00Z',
                        entity: 'procedure'
                      }
                    ].map((activity) => {
                      const getEntityIcon = () => {
                        switch (activity.entity) {
                          case 'animal': return PawPrint;
                          case 'user': return Users;
                          case 'adoption': return Heart;
                          case 'procedure': return FileText;
                          default: return Activity;
                        }
                      };

                      const EntityIcon = getEntityIcon();

                      return (
                        <div key={activity.id} className="flex items-center space-x-4 p-3 bg-gray-50 rounded-lg">
                          <div className="w-10 h-10 bg-blue-100 rounded-full flex items-center justify-center">
                            <EntityIcon className="w-5 h-5 text-blue-600" />
                          </div>
                          <div className="flex-1">
                            <p className="text-sm font-medium text-gray-900">{activity.description}</p>
                            <p className="text-xs text-gray-500">
                              {new Date(activity.timestamp).toLocaleString('pt-BR')}
                            </p>
                          </div>
                          <Badge variant="outline" className="text-xs">
                            {activity.type}
                          </Badge>
                        </div>
                      );
                    })}
                  </div>
                </CardContent>
              </Card>
            </div>
          )}

          {/* Help Section */}
          <div className="bg-blue-50 border border-blue-200 rounded-lg p-6">
            <div className="flex items-start space-x-4">
              <div className="w-12 h-12 bg-blue-100 rounded-full flex items-center justify-center">
                <Eye className="w-6 h-6 text-blue-600" />
              </div>
              <div>
                <h3 className="font-semibold text-blue-900 mb-2">Como usar o Explorador</h3>
                <div className="text-sm text-blue-800 space-y-1">
                  <p>• <strong>Navegue por categorias:</strong> Clique em uma categoria para ver todas as entidades</p>
                  <p>• <strong>Use filtros:</strong> Filtre por status, data ou outros critérios</p>
                  <p>• <strong>Busque rapidamente:</strong> Use a barra de busca para encontrar entidades específicas</p>
                  {(userRole === 'ADMIN' || userRole === 'FUNCIONARIO') && (
                    <p>• <strong>Gerencie entidades:</strong> Visualize, edite ou aprove entidades diretamente</p>
                  )}
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
