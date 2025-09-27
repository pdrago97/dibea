'use client';

import React, { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import {
  Users,
  PawPrint,
  Building,
  Shield,
  Settings,
  BarChart3,
  UserPlus,
  AlertTriangle,
  CheckCircle,
  Clock,
  TrendingUp,
  Database,
  Bot,
  MessageSquare,
  Heart,
  FileText,
  Calendar,
  Activity,
  Eye,
  Filter,
  Download,
  RefreshCw,
  Search,
  Plus,
  Edit,
  Trash2,
  MoreHorizontal,
  ArrowUp,
  ArrowDown,
  Zap
} from 'lucide-react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { MainNavigation } from '@/components/navigation/MainNavigation';
import { EntityCard, SectionHeader, StatusBadge } from '@/components/ui/design-system';

interface AdminStats {
  totalUsers: number;
  totalAnimals: number;
  totalMunicipalities: number;
  pendingApprovals: number;
  systemHealth: string;
  agentInteractions: number;
  totalAdoptions: number;
  totalProcedures: number;
  activeProcesses: number;
  monthlyGrowth: number;
}

interface PendingApproval {
  id: string;
  type: 'user' | 'animal' | 'procedure' | 'adoption' | 'document';
  title: string;
  description: string;
  submittedBy: string;
  submittedAt: string;
  priority: 'high' | 'medium' | 'low';
  municipality: string;
}

interface SystemAlert {
  id: string;
  type: 'error' | 'warning' | 'info';
  title: string;
  description: string;
  timestamp: string;
  resolved: boolean;
}

export default function EnhancedAdminDashboard() {
  const router = useRouter();
  const [user, setUser] = useState<any>(null);
  const [stats, setStats] = useState<AdminStats>({
    totalUsers: 0,
    totalAnimals: 0,
    totalMunicipalities: 0,
    pendingApprovals: 0,
    systemHealth: 'healthy',
    agentInteractions: 0,
    totalAdoptions: 0,
    totalProcedures: 0,
    activeProcesses: 0,
    monthlyGrowth: 0
  });

  const [pendingApprovals, setPendingApprovals] = useState<PendingApproval[]>([]);
  const [systemAlerts, setSystemAlerts] = useState<SystemAlert[]>([]);
  const [recentActivity, setRecentActivity] = useState<any[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);

  useEffect(() => {
    loadAdminData();
  }, []);

  const loadAdminData = async () => {
    try {
      setRefreshing(true);
      
      // Load user data
      const userData = localStorage.getItem('user');
      if (userData) {
        setUser(JSON.parse(userData));
      }

      // Simulate comprehensive admin stats
      setStats({
        totalUsers: 1247,
        totalAnimals: 892,
        totalMunicipalities: 15,
        pendingApprovals: 23,
        systemHealth: 'healthy',
        agentInteractions: 5420,
        totalAdoptions: 156,
        totalProcedures: 2341,
        activeProcesses: 89,
        monthlyGrowth: 12.5
      });

      // Simulate pending approvals with priority
      setPendingApprovals([
        {
          id: '1',
          type: 'user',
          title: 'Dr. Ana Silva - Veterinária',
          description: 'Solicitação de cadastro como veterinária',
          submittedBy: 'ana.silva@email.com',
          submittedAt: '2024-01-15T10:30:00Z',
          priority: 'high',
          municipality: 'São Paulo'
        },
        {
          id: '2',
          type: 'animal',
          title: 'Rex - Cão para adoção',
          description: 'Cadastro de animal resgatado',
          submittedBy: 'Funcionário João',
          submittedAt: '2024-01-15T09:15:00Z',
          priority: 'medium',
          municipality: 'Rio de Janeiro'
        },
        {
          id: '3',
          type: 'procedure',
          title: 'Castração - Luna',
          description: 'Procedimento veterinário realizado',
          submittedBy: 'Dr. Carlos',
          submittedAt: '2024-01-15T08:45:00Z',
          priority: 'low',
          municipality: 'São Paulo'
        },
        {
          id: '4',
          type: 'adoption',
          title: 'Processo de Adoção - Milo',
          description: 'Documentação de adoção para aprovação',
          submittedBy: 'Maria Santos',
          submittedAt: '2024-01-15T07:30:00Z',
          priority: 'high',
          municipality: 'Belo Horizonte'
        }
      ]);

      // Simulate system alerts
      setSystemAlerts([
        {
          id: '1',
          type: 'warning',
          title: 'Alto volume de solicitações',
          description: 'Município de São Paulo com 15 aprovações pendentes',
          timestamp: '2024-01-15T11:00:00Z',
          resolved: false
        },
        {
          id: '2',
          type: 'error',
          title: 'Falha na sincronização',
          description: 'Erro ao sincronizar dados com município do Rio de Janeiro',
          timestamp: '2024-01-15T10:45:00Z',
          resolved: false
        },
        {
          id: '3',
          type: 'info',
          title: 'Backup realizado',
          description: 'Backup automático do banco de dados concluído',
          timestamp: '2024-01-15T06:00:00Z',
          resolved: true
        }
      ]);

      // Simulate recent activity
      setRecentActivity([
        {
          id: '1',
          type: 'approval',
          description: 'Veterinário Dr. Silva aprovado',
          timestamp: '2024-01-15T10:30:00Z',
          user: 'Admin Pedro'
        },
        {
          id: '2',
          type: 'creation',
          description: 'Novo animal "Rex" cadastrado',
          timestamp: '2024-01-15T09:15:00Z',
          user: 'Funcionário João'
        },
        {
          id: '3',
          type: 'completion',
          description: 'Adoção de "Luna" finalizada',
          timestamp: '2024-01-15T08:45:00Z',
          user: 'Funcionário Maria'
        }
      ]);

    } catch (error) {
      console.error('Error loading admin data:', error);
    } finally {
      setIsLoading(false);
      setRefreshing(false);
    }
  };

  const handleApproval = async (approvalId: string, action: 'approve' | 'reject') => {
    try {
      // Simulate API call
      console.log(`${action} approval ${approvalId}`);
      
      // Remove from pending list
      setPendingApprovals(prev => prev.filter(approval => approval.id !== approvalId));
      
      // Update stats
      setStats(prev => ({
        ...prev,
        pendingApprovals: prev.pendingApprovals - 1
      }));
      
    } catch (error) {
      console.error('Error handling approval:', error);
    }
  };

  const getEntityIcon = (type: string) => {
    switch (type) {
      case 'user': return Users;
      case 'animal': return PawPrint;
      case 'procedure': return FileText;
      case 'adoption': return Heart;
      case 'document': return FileText;
      default: return FileText;
    }
  };

  const getAlertIcon = (type: string) => {
    switch (type) {
      case 'error': return AlertTriangle;
      case 'warning': return Clock;
      case 'info': return CheckCircle;
      default: return AlertTriangle;
    }
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
        userRole="ADMIN" 
        userName={user?.name || 'Administrador'}
        notifications={systemAlerts.filter(alert => !alert.resolved).length}
        onLogout={() => router.push('/auth/login')}
      />
      
      <div className="flex-1 lg:ml-64">
        <div className="p-6 space-y-8">
          {/* Header with Actions */}
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-3xl font-bold text-gray-900">Dashboard Administrativo</h1>
              <p className="text-gray-600 mt-1">
                Gerencie todo o sistema DIBEA de forma centralizada
              </p>
            </div>
            <div className="flex items-center space-x-3">
              <Button 
                variant="outline" 
                size="sm"
                onClick={loadAdminData}
                disabled={refreshing}
              >
                <RefreshCw className={`w-4 h-4 mr-2 ${refreshing ? 'animate-spin' : ''}`} />
                Atualizar
              </Button>
              <Button variant="outline" size="sm">
                <Download className="w-4 h-4 mr-2" />
                Exportar
              </Button>
              <StatusBadge 
                status={stats.systemHealth === 'healthy' ? 'active' : 'urgent'}
                label={`Sistema ${stats.systemHealth === 'healthy' ? 'Saudável' : 'Com Problemas'}`}
              />
            </div>
          </div>

          {/* System Alerts */}
          {systemAlerts.filter(alert => !alert.resolved).length > 0 && (
            <div className="bg-red-50 border border-red-200 rounded-lg p-4">
              <div className="flex items-center justify-between mb-3">
                <h3 className="font-semibold text-red-800 flex items-center">
                  <AlertTriangle className="w-5 h-5 mr-2" />
                  Alertas do Sistema ({systemAlerts.filter(alert => !alert.resolved).length})
                </h3>
                <Button variant="outline" size="sm">
                  Ver Todos
                </Button>
              </div>
              <div className="space-y-2">
                {systemAlerts.filter(alert => !alert.resolved).slice(0, 2).map((alert) => {
                  const AlertIcon = getAlertIcon(alert.type);
                  return (
                    <div key={alert.id} className="flex items-center justify-between bg-white p-3 rounded border">
                      <div className="flex items-center space-x-3">
                        <AlertIcon className={`w-5 h-5 ${
                          alert.type === 'error' ? 'text-red-500' :
                          alert.type === 'warning' ? 'text-yellow-500' : 'text-blue-500'
                        }`} />
                        <div>
                          <p className="font-medium text-gray-900">{alert.title}</p>
                          <p className="text-sm text-gray-600">{alert.description}</p>
                        </div>
                      </div>
                      <Button size="sm" variant="outline">
                        Resolver
                      </Button>
                    </div>
                  );
                })}
              </div>
            </div>
          )}

          {/* Stats Grid */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
            <Card>
              <CardContent className="p-6">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm font-medium text-gray-600">Total de Usuários</p>
                    <p className="text-3xl font-bold text-gray-900">{stats.totalUsers.toLocaleString()}</p>
                    <div className="flex items-center mt-2">
                      <ArrowUp className="w-4 h-4 text-green-500 mr-1" />
                      <span className="text-sm text-green-600">+{stats.monthlyGrowth}% este mês</span>
                    </div>
                  </div>
                  <div className="w-12 h-12 bg-blue-100 rounded-full flex items-center justify-center">
                    <Users className="w-6 h-6 text-blue-600" />
                  </div>
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardContent className="p-6">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm font-medium text-gray-600">Animais Cadastrados</p>
                    <p className="text-3xl font-bold text-gray-900">{stats.totalAnimals.toLocaleString()}</p>
                    <div className="flex items-center mt-2">
                      <ArrowUp className="w-4 h-4 text-green-500 mr-1" />
                      <span className="text-sm text-green-600">+8.2% este mês</span>
                    </div>
                  </div>
                  <div className="w-12 h-12 bg-green-100 rounded-full flex items-center justify-center">
                    <PawPrint className="w-6 h-6 text-green-600" />
                  </div>
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardContent className="p-6">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm font-medium text-gray-600">Aprovações Pendentes</p>
                    <p className="text-3xl font-bold text-gray-900">{stats.pendingApprovals}</p>
                    <div className="flex items-center mt-2">
                      <Clock className="w-4 h-4 text-yellow-500 mr-1" />
                      <span className="text-sm text-yellow-600">Requer atenção</span>
                    </div>
                  </div>
                  <div className="w-12 h-12 bg-yellow-100 rounded-full flex items-center justify-center">
                    <Clock className="w-6 h-6 text-yellow-600" />
                  </div>
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardContent className="p-6">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm font-medium text-gray-600">Interações IA</p>
                    <p className="text-3xl font-bold text-gray-900">{stats.agentInteractions.toLocaleString()}</p>
                    <div className="flex items-center mt-2">
                      <Zap className="w-4 h-4 text-purple-500 mr-1" />
                      <span className="text-sm text-purple-600">+15% esta semana</span>
                    </div>
                  </div>
                  <div className="w-12 h-12 bg-purple-100 rounded-full flex items-center justify-center">
                    <Bot className="w-6 h-6 text-purple-600" />
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Pending Approvals */}
          <div>
            <SectionHeader 
              title="Aprovações Pendentes"
              subtitle="Itens aguardando sua aprovação"
              action={
                <div className="flex space-x-2">
                  <Button variant="outline" size="sm">
                    <Filter className="w-4 h-4 mr-2" />
                    Filtrar
                  </Button>
                  <Button variant="outline" size="sm">
                    Ver Todas
                  </Button>
                </div>
              }
            />
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              {pendingApprovals.slice(0, 4).map((approval) => {
                const EntityIcon = getEntityIcon(approval.type);
                return (
                  <EntityCard
                    key={approval.id}
                    entity={approval.type as any}
                    title={approval.title}
                    subtitle={`Por: ${approval.submittedBy}`}
                    description={approval.description}
                    status={approval.priority === 'high' ? 'urgent' : approval.priority === 'medium' ? 'pending' : 'active'}
                    icon={EntityIcon}
                    metadata={[
                      { label: 'Município', value: approval.municipality },
                      { label: 'Data', value: new Date(approval.submittedAt).toLocaleDateString('pt-BR') }
                    ]}
                    actions={
                      <div className="flex space-x-2">
                        <Button 
                          size="sm" 
                          variant="outline"
                          onClick={() => handleApproval(approval.id, 'reject')}
                        >
                          Rejeitar
                        </Button>
                        <Button 
                          size="sm"
                          onClick={() => handleApproval(approval.id, 'approve')}
                        >
                          Aprovar
                        </Button>
                      </div>
                    }
                  />
                );
              })}
            </div>
          </div>

          {/* Quick Management Actions */}
          <div>
            <SectionHeader 
              title="Ações Rápidas"
              subtitle="Acesso direto às principais funcionalidades"
            />
            <div className="grid grid-cols-1 md:grid-cols-3 lg:grid-cols-4 gap-6">
              {[
                { title: 'Gerenciar Usuários', icon: Users, href: '/admin/users', color: 'blue' },
                { title: 'Cadastrar Animal', icon: PawPrint, href: '/admin/animals/create', color: 'green' },
                { title: 'Relatórios', icon: BarChart3, href: '/admin/reports', color: 'purple' },
                { title: 'Configurações', icon: Settings, href: '/admin/settings', color: 'gray' },
                { title: 'Municípios', icon: Building, href: '/admin/municipalities', color: 'indigo' },
                { title: 'Agentes IA', icon: Bot, href: '/admin/ai-agents', color: 'pink' },
                { title: 'Logs do Sistema', icon: Activity, href: '/admin/logs', color: 'orange' },
                { title: 'Backup', icon: Database, href: '/admin/backup', color: 'teal' }
              ].map((action, index) => (
                <Card key={index} className="hover:shadow-lg transition-shadow cursor-pointer group">
                  <CardContent className="p-6 text-center">
                    <div className={`w-12 h-12 bg-${action.color}-100 rounded-full flex items-center justify-center mx-auto mb-4 group-hover:scale-110 transition-transform`}>
                      <action.icon className={`w-6 h-6 text-${action.color}-600`} />
                    </div>
                    <h3 className="font-semibold text-gray-900 mb-2">{action.title}</h3>
                    <Button 
                      size="sm" 
                      variant="outline" 
                      className="w-full"
                      onClick={() => router.push(action.href)}
                    >
                      Acessar
                    </Button>
                  </CardContent>
                </Card>
              ))}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
