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
  Monitor,
  Zap
} from 'lucide-react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { MainNavigation } from '@/components/navigation/MainNavigation';
import { EntityCard, SectionHeader, StatusBadge } from '@/components/ui/design-system';
import { AdvancedDashboard } from '@/components/admin/AdvancedDashboard';
import { UserManagement } from '@/components/admin/UserManagement';
import { SystemMonitoring } from '@/components/admin/SystemMonitoring';

interface AdminStats {
  totalUsers: number;
  totalAnimals: number;
  totalMunicipalities: number;
  pendingApprovals: number;
  systemHealth: 'healthy' | 'warning' | 'critical';
  agentInteractions: number;
  totalAdoptions: number;
  totalProcedures: number;
  activeProcesses: number;
  monthlyGrowth: number;
  systemUptime: string;
  activeUsers: number;
  storageUsed: number;
  apiCalls: number;
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

export default function AdminDashboard() {
  const router = useRouter();
  const [user, setUser] = useState<any>(null);
  const [activeTab, setActiveTab] = useState<'dashboard' | 'users' | 'monitoring'>('dashboard');
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
    monthlyGrowth: 0,
    systemUptime: '99.9%',
    activeUsers: 0,
    storageUsed: 0,
    apiCalls: 0
  });

  const [pendingApprovals, setPendingApprovals] = useState<PendingApproval[]>([]);
  const [systemAlerts, setSystemAlerts] = useState<SystemAlert[]>([]);
  const [recentActivity, setRecentActivity] = useState<any[]>([]);
  const [users, setUsers] = useState<any[]>([]);
  const [systemMetrics, setSystemMetrics] = useState<any>({});
  const [services, setServices] = useState<any[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);

  useEffect(() => {
    loadAdminData();
  }, []);

  const loadAdminData = async () => {
    try {
      // Load user data from localStorage
      const userData = localStorage.getItem('user');
      if (userData) {
        setUser(JSON.parse(userData));
      }

      // Fetch real data from APIs
      await fetchDashboardData();
    } catch (error) {
      console.error('Error loading admin data:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const fetchDashboardData = async () => {
    try {
      const token = localStorage.getItem('token') || localStorage.getItem('dibea_token');

      console.log('Token encontrado:', token ? 'Sim' : 'Não');

      if (!token) {
        console.error('Nenhum token encontrado');
        setStats({
          totalUsers: 0,
          totalAnimals: 0,
          totalMunicipalities: 1,
          pendingApprovals: 0,
          systemHealth: 'unhealthy',
          agentInteractions: 0
        });
        return;
      }

      // Fetch dashboard stats directly
      console.log('Fazendo requisição para dashboard stats...');
      const statsResponse = await fetch('http://localhost:3000/api/v1/admin/dashboard/stats', {
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        }
      });

      if (statsResponse.ok) {
        const statsData = await statsResponse.json();
        console.log('Dados recebidos do dashboard:', statsData);
        setStats({
          totalUsers: statsData.totalUsers || 0,
          totalAnimals: statsData.totalAnimals || 0,
          totalMunicipalities: statsData.totalMunicipalities || 1,
          pendingApprovals: 0,
          systemHealth: 'healthy',
          agentInteractions: statsData.totalInteractions || 0,
          totalAdoptions: statsData.totalAdoptions || 0,
          totalProcedures: statsData.totalProcedures || 0,
          activeProcesses: statsData.activeProcesses || 0,
          monthlyGrowth: statsData.monthlyGrowth || 0,
          systemUptime: '99.9%',
          activeUsers: statsData.activeUsers || 0,
          storageUsed: 67,
          apiCalls: statsData.apiCalls || 0
        });
        return;
      } else {
        console.error('Erro na resposta do dashboard:', statsResponse.status, statsResponse.statusText);
      }

      // Fallback: Fetch individual data if stats endpoint fails
      const animalsResponse = await fetch('http://localhost:3000/api/v1/animals?limit=100', {
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        }
      });

      let totalAnimals = 0;
      if (animalsResponse.ok) {
        const animalsData = await animalsResponse.json();
        totalAnimals = animalsData.data?.length || 0;
      }

      // Fetch users data
      const usersResponse = await fetch('http://localhost:3000/api/v1/admin/users', {
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        }
      });

      let totalUsers = 0;
      if (usersResponse.ok) {
        const usersData = await usersResponse.json();
        totalUsers = usersData.users?.length || 0;
      }

      // Fetch agent metrics
      const agentResponse = await fetch('http://localhost:3000/api/v1/agents/metrics', {
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        }
      });

      let agentInteractions = 0;
      if (agentResponse.ok) {
        const agentData = await agentResponse.json();
        agentInteractions = agentData.totalInteractions || 0;
      }

      setStats({
        totalUsers,
        totalAnimals,
        totalMunicipalities: 1,
        pendingApprovals: 0,
        systemHealth: 'healthy',
        agentInteractions,
        totalAdoptions: 0,
        totalProcedures: 0,
        activeProcesses: 0,
        monthlyGrowth: 12.5,
        systemUptime: '99.9%',
        activeUsers: Math.floor(totalUsers * 0.3),
        storageUsed: 67,
        apiCalls: agentInteractions * 2
      });

      setRecentActivity([
        {
          id: '1',
          type: 'user_registration',
          message: 'Novo usuário registrado: Maria Silva',
          time: '5 min atrás',
          status: 'success'
        },
        {
          id: '2',
          type: 'animal_added',
          message: 'Animal adicionado: Luna (Cão)',
          time: '15 min atrás',
          status: 'info'
        },
        {
          id: '3',
          type: 'approval_pending',
          message: 'Clínica Veterinária ABC aguarda aprovação',
          time: '1 hora atrás',
          status: 'warning'
        },
        {
          id: '4',
          type: 'agent_interaction',
          message: `${agentInteractions} interações com agentes IA hoje`,
          time: '2 horas atrás',
          status: 'info'
        }
      ]);

      // Load additional mock data
      loadMockData();

    } catch (error) {
      console.error('Error fetching dashboard data:', error);
    }
  };

  const loadMockData = () => {
    // Mock users data
    const mockUsers = [
      {
        id: '1',
        name: 'Maria Silva',
        email: 'maria@example.com',
        role: 'VETERINARIO',
        municipality: 'São Paulo',
        status: 'active',
        lastLogin: '2 horas atrás',
        createdAt: '2024-01-15',
        permissions: ['animals.read', 'procedures.write']
      },
      {
        id: '2',
        name: 'João Santos',
        email: 'joao@example.com',
        role: 'FUNCIONARIO',
        municipality: 'São Paulo',
        status: 'active',
        lastLogin: '1 dia atrás',
        createdAt: '2024-02-10',
        permissions: ['animals.read', 'adoptions.write']
      },
      {
        id: '3',
        name: 'Ana Costa',
        email: 'ana@example.com',
        role: 'CIDADAO',
        municipality: 'São Paulo',
        status: 'pending',
        lastLogin: 'Nunca',
        createdAt: '2024-03-01',
        permissions: ['animals.read']
      }
    ];
    setUsers(mockUsers);

    // Mock system metrics
    const mockMetrics = {
      cpu: { usage: 45, cores: 8, temperature: 65 },
      memory: { used: 8589934592, total: 17179869184, percentage: 50 },
      storage: { used: 536870912000, total: 1073741824000, percentage: 50 },
      network: { inbound: 1048576, outbound: 524288, latency: 25 },
      database: { connections: 15, queries: 1250, responseTime: 12 },
      api: { requests: 2847, errors: 2, responseTime: 85 }
    };
    setSystemMetrics(mockMetrics);

    // Mock services status
    const mockServices = [
      { name: 'API Gateway', status: 'healthy', uptime: '99.9%', lastCheck: '30s atrás', responseTime: 45 },
      { name: 'Database', status: 'healthy', uptime: '99.8%', lastCheck: '1m atrás', responseTime: 12 },
      { name: 'File Storage', status: 'healthy', uptime: '99.9%', lastCheck: '45s atrás', responseTime: 23 },
      { name: 'AI Agents', status: 'warning', uptime: '98.5%', lastCheck: '2m atrás', responseTime: 156 },
      { name: 'Email Service', status: 'healthy', uptime: '99.7%', lastCheck: '1m atrás', responseTime: 89 },
      { name: 'SMS Service', status: 'healthy', uptime: '99.6%', lastCheck: '30s atrás', responseTime: 67 }
    ];
    setServices(mockServices);

    // Mock pending approvals
    const mockApprovals = [
      {
        id: '1',
        type: 'user',
        title: 'Novo Veterinário',
        description: 'Dr. Carlos Mendes solicitou acesso como veterinário',
        requestedBy: 'Carlos Mendes',
        timestamp: '2 horas atrás',
        priority: 'high'
      },
      {
        id: '2',
        type: 'animal',
        title: 'Cadastro de Animal',
        description: 'Novo cão resgatado precisa de aprovação para cadastro',
        requestedBy: 'Maria Silva',
        timestamp: '4 horas atrás',
        priority: 'medium'
      }
    ];
    setPendingApprovals(mockApprovals);

    // Mock system alerts
    const mockAlerts = [
      {
        id: '1',
        type: 'warning',
        title: 'Alto uso de CPU',
        message: 'Servidor principal com 85% de uso de CPU',
        timestamp: '15 min atrás'
      },
      {
        id: '2',
        type: 'info',
        title: 'Backup concluído',
        message: 'Backup diário executado com sucesso',
        timestamp: '2 horas atrás'
      }
    ];
    setSystemAlerts(mockAlerts);
  };

  const getActivityIcon = (type: string) => {
    switch (type) {
      case 'user_registration':
        return <UserPlus className="w-4 h-4" />;
      case 'animal_added':
        return <PawPrint className="w-4 h-4" />;
      case 'approval_pending':
        return <AlertTriangle className="w-4 h-4" />;
      case 'agent_interaction':
        return <Bot className="w-4 h-4" />;
      default:
        return <Clock className="w-4 h-4" />;
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'success':
        return 'bg-green-100 text-green-800';
      case 'warning':
        return 'bg-yellow-100 text-yellow-800';
      case 'error':
        return 'bg-red-100 text-red-800';
      default:
        return 'bg-blue-100 text-blue-800';
    }
  };

  // User management functions
  const handleCreateUser = () => {
    console.log('Create user');
    // Navigate to user creation page or open modal
  };

  const handleEditUser = (userId: string) => {
    console.log('Edit user:', userId);
    // Navigate to user edit page or open modal
  };

  const handleDeleteUser = (userId: string) => {
    console.log('Delete user:', userId);
    // Show confirmation and delete user
  };

  const handleToggleUserStatus = (userId: string, status: string) => {
    console.log('Toggle user status:', userId, status);
    // Update user status
  };

  const handleRefresh = async () => {
    setRefreshing(true);
    await fetchDashboardData();
    setRefreshing(false);
  };

  if (isLoading) {
    return (
      <div className="p-6">
        <div className="flex items-center justify-center h-64">
          <div className="text-center">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600 mx-auto"></div>
            <p className="mt-2 text-gray-600">Carregando dashboard...</p>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="p-6 space-y-6">
      {/* Navigation Tabs */}
      <div className="border-b border-gray-200">
        <nav className="-mb-px flex space-x-8">
          <button
            onClick={() => setActiveTab('dashboard')}
            className={`py-2 px-1 border-b-2 font-medium text-sm ${
              activeTab === 'dashboard'
                ? 'border-blue-500 text-blue-600'
                : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
            }`}
          >
            <BarChart3 className="w-4 h-4 inline mr-2" />
            Dashboard
          </button>
          <button
            onClick={() => setActiveTab('users')}
            className={`py-2 px-1 border-b-2 font-medium text-sm ${
              activeTab === 'users'
                ? 'border-blue-500 text-blue-600'
                : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
            }`}
          >
            <Users className="w-4 h-4 inline mr-2" />
            Usuários
          </button>
          <button
            onClick={() => setActiveTab('monitoring')}
            className={`py-2 px-1 border-b-2 font-medium text-sm ${
              activeTab === 'monitoring'
                ? 'border-blue-500 text-blue-600'
                : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
            }`}
          >
            <Monitor className="w-4 h-4 inline mr-2" />
            Monitoramento
          </button>
        </nav>
      </div>

      {/* Tab Content */}
      {activeTab === 'dashboard' && (
        <AdvancedDashboard
          stats={stats}
          alerts={systemAlerts}
          pendingApprovals={pendingApprovals}
          recentActivity={recentActivity}
          onRefresh={handleRefresh}
          isLoading={refreshing}
        />
      )}

      {activeTab === 'users' && (
        <UserManagement
          users={users}
          onCreateUser={handleCreateUser}
          onEditUser={handleEditUser}
          onDeleteUser={handleDeleteUser}
          onToggleStatus={handleToggleUserStatus}
          isLoading={refreshing}
        />
      )}

      {activeTab === 'monitoring' && (
        <SystemMonitoring
          metrics={systemMetrics}
          services={services}
          alerts={systemAlerts}
          onRefresh={handleRefresh}
          isLoading={refreshing}
        />
      )}
    </div>
  );
}
