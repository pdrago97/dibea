'use client';

import { useState, useEffect } from 'react';
import { useRequireAuth } from '@/contexts/AuthContext';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert';
import { 
  Plus,
  Check,
  MessageSquare,
  Users,
  PawPrint,
  Heart,
  AlertCircle,
  TrendingUp,
  RefreshCw,
  X,
  FileText,
  Clock,
  CheckCircle2,
  ChevronRight
} from 'lucide-react';
import Link from 'next/link';

interface DashboardStats {
  totalAnimals: number;
  pendingAdoptions: number;
  totalUsers: number;
  systemAlerts: number;
  trend: {
    animals: number;
    adoptions: number;
  };
}

interface PendingAction {
  id: string;
  type: 'adoption' | 'animal' | 'document' | 'user';
  title: string;
  description: string;
  priority: 'high' | 'medium' | 'low';
  timestamp: string;
  link: string;
}

interface Activity {
  id: string;
  type: 'animal_added' | 'adoption_approved' | 'user_registered' | 'document_uploaded';
  message: string;
  timestamp: string;
  user?: string;
}

export default function AdminDashboardFixed() {
  // Protect route - CRITICAL!
  useRequireAuth(['ADMIN']);

  const [stats, setStats] = useState<DashboardStats>({
    totalAnimals: 0,
    pendingAdoptions: 0,
    totalUsers: 0,
    systemAlerts: 0,
    trend: { animals: 0, adoptions: 0 }
  });
  
  const [pending, setPending] = useState<PendingAction[]>([]);
  const [activities, setActivities] = useState<Activity[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    loadDashboardData();
  }, []);

  const loadDashboardData = async () => {
    try {
      setIsLoading(true);
      setError(null);

      // Mock data for now - TODO: Replace with real API calls
      // Simula latência da API
      await new Promise(resolve => setTimeout(resolve, 500));

      setStats({
        totalAnimals: 4,
        pendingAdoptions: 3,
        totalUsers: 12,
        systemAlerts: 1,
        trend: {
          animals: 12.5,
          adoptions: 8.3
        }
      });

      setPending([
        {
          id: '1',
          type: 'adoption',
          title: 'Adoção do Rex',
          description: 'João Silva aguarda aprovação há 2 dias',
          priority: 'high',
          timestamp: '2024-01-15T10:30:00Z',
          link: '/admin/adoptions/1'
        },
        {
          id: '2',
          type: 'document',
          title: 'Documentos pendentes',
          description: 'Maria Santos enviou 3 documentos para verificação',
          priority: 'medium',
          timestamp: '2024-01-15T14:20:00Z',
          link: '/admin/documents/pending'
        },
        {
          id: '3',
          type: 'user',
          title: 'Novo funcionário',
          description: 'Carlos Oliveira solicitou conta de funcionário',
          priority: 'low',
          timestamp: '2024-01-14T16:45:00Z',
          link: '/admin/users/pending'
        }
      ]);

      setActivities([
        {
          id: '1',
          type: 'animal_added',
          message: 'Novo animal cadastrado: Luna (Cão)',
          timestamp: '15 min atrás',
          user: 'Ana Silva'
        },
        {
          id: '2',
          type: 'adoption_approved',
          message: 'Adoção do Milo aprovada',
          timestamp: '1h atrás',
          user: 'Você'
        },
        {
          id: '3',
          type: 'user_registered',
          message: 'Novo cidadão: Pedro Santos',
          timestamp: '2h atrás'
        },
        {
          id: '4',
          type: 'document_uploaded',
          message: 'Documentos enviados para verificação',
          timestamp: '3h atrás',
          user: 'Maria Costa'
        }
      ]);

    } catch (err: any) {
      setError(err.message || 'Erro ao carregar dashboard');
    } finally {
      setIsLoading(false);
    }
  };

  const getPriorityColor = (priority: string) => {
    const colors = {
      high: 'bg-red-50 border-red-200 text-red-700',
      medium: 'bg-amber-50 border-amber-200 text-amber-700',
      low: 'bg-blue-50 border-blue-200 text-blue-700'
    };
    return colors[priority as keyof typeof colors] || colors.low;
  };

  const getPriorityBadge = (priority: string) => {
    const badges = {
      high: <Badge className="bg-red-100 text-red-700 hover:bg-red-100">Urgente</Badge>,
      medium: <Badge className="bg-amber-100 text-amber-700 hover:bg-amber-100">Atenção</Badge>,
      low: <Badge className="bg-blue-100 text-blue-700 hover:bg-blue-100">Normal</Badge>
    };
    return badges[priority as keyof typeof badges] || badges.low;
  };

  const getActivityIcon = (type: string) => {
    const icons = {
      animal_added: <PawPrint className="w-4 h-4 text-emerald-600" />,
      adoption_approved: <Heart className="w-4 h-4 text-blue-600" />,
      user_registered: <Users className="w-4 h-4 text-gray-600" />,
      document_uploaded: <FileText className="w-4 h-4 text-amber-600" />
    };
    return icons[type as keyof typeof icons] || <Clock className="w-4 h-4" />;
  };

  if (error) {
    return (
      <div className="p-8">
        <Alert variant="destructive">
          <AlertCircle className="h-4 w-4" />
          <AlertTitle>Erro ao carregar dashboard</AlertTitle>
          <AlertDescription className="mt-2">
            {error}
          </AlertDescription>
          <Button 
            onClick={loadDashboardData} 
            variant="outline" 
            size="sm"
            className="mt-4"
          >
            <RefreshCw className="w-4 h-4 mr-2" />
            Tentar novamente
          </Button>
        </Alert>
      </div>
    );
  }

  return (
    <div className="p-8 space-y-6 bg-gray-50 min-h-screen">
      {/* Quick Actions */}
      <div className="grid grid-cols-4 gap-4">
        <Link href="/admin/animals/new">
          <Card className="p-4 hover:shadow-md transition-shadow cursor-pointer border-emerald-200 hover:border-emerald-400">
            <div className="flex items-center gap-3">
              <div className="p-2 bg-emerald-100 rounded-lg">
                <Plus className="w-5 h-5 text-emerald-600" />
              </div>
              <div>
                <p className="text-sm font-semibold text-gray-900">Novo Animal</p>
                <p className="text-xs text-gray-500">Cadastrar</p>
              </div>
            </div>
          </Card>
        </Link>

        <Link href="/admin/adoptions/pending">
          <Card className="p-4 hover:shadow-md transition-shadow cursor-pointer border-red-200 hover:border-red-400">
            <div className="flex items-center gap-3">
              <div className="p-2 bg-red-100 rounded-lg">
                <Check className="w-5 h-5 text-red-600" />
              </div>
              <div>
                <p className="text-sm font-semibold text-gray-900">Aprovar Adoções</p>
                <p className="text-xs text-gray-500">{stats.pendingAdoptions} pendentes</p>
              </div>
            </div>
          </Card>
        </Link>

        <Link href="/admin/chat">
          <Card className="p-4 hover:shadow-md transition-shadow cursor-pointer border-blue-200 hover:border-blue-400">
            <div className="flex items-center gap-3">
              <div className="p-2 bg-blue-100 rounded-lg">
                <MessageSquare className="w-5 h-5 text-blue-600" />
              </div>
              <div>
                <p className="text-sm font-semibold text-gray-900">Responder Chat</p>
                <p className="text-xs text-gray-500">Central</p>
              </div>
            </div>
          </Card>
        </Link>

        <Link href="/admin/users">
          <Card className="p-4 hover:shadow-md transition-shadow cursor-pointer border-gray-200 hover:border-gray-400">
            <div className="flex items-center gap-3">
              <div className="p-2 bg-gray-100 rounded-lg">
                <Users className="w-5 h-5 text-gray-600" />
              </div>
              <div>
                <p className="text-sm font-semibold text-gray-900">Usuários</p>
                <p className="text-xs text-gray-500">{stats.totalUsers} ativos</p>
              </div>
            </div>
          </Card>
        </Link>
      </div>

      {/* Hero: Pending Actions */}
      {pending.length > 0 && (
        <Card className="border-red-200 bg-red-50">
          <div className="p-6">
            <div className="flex items-center justify-between mb-4">
              <div className="flex items-center gap-3">
                <AlertCircle className="w-6 h-6 text-red-600" />
                <div>
                  <h2 className="text-lg font-semibold text-gray-900">
                    {pending.length} {pending.length === 1 ? 'Ação Pendente' : 'Ações Pendentes'}
                  </h2>
                  <p className="text-sm text-gray-600">Requer sua atenção</p>
                </div>
              </div>
              <Button size="sm" variant="outline">
                Ver Todas
              </Button>
            </div>

            <div className="space-y-3">
              {pending.map((item) => (
                <Link key={item.id} href={item.link}>
                  <div className={`
                    p-4 rounded-lg border-2 cursor-pointer hover:shadow-sm transition-all
                    ${getPriorityColor(item.priority)}
                  `}>
                    <div className="flex items-start justify-between">
                      <div className="flex-1">
                        <div className="flex items-center gap-2 mb-1">
                          <h3 className="font-semibold">{item.title}</h3>
                          {getPriorityBadge(item.priority)}
                        </div>
                        <p className="text-sm opacity-80">{item.description}</p>
                        <p className="text-xs opacity-60 mt-2">{item.timestamp}</p>
                      </div>
                      <ChevronRight className="w-5 h-5 flex-shrink-0 ml-4" />
                    </div>
                  </div>
                </Link>
              ))}
            </div>
          </div>
        </Card>
      )}

      {/* Stats Grid */}
      <div className="grid grid-cols-4 gap-4">
        <Card className="p-6 border border-gray-200">
          <div className="flex items-center justify-between mb-3">
            <div className="p-2 bg-emerald-100 rounded-lg">
              <PawPrint className="w-5 h-5 text-emerald-600" />
            </div>
            {stats.trend.animals > 0 && (
              <div className="flex items-center gap-1 text-xs text-emerald-600">
                <TrendingUp className="w-3 h-3" />
                +{stats.trend.animals}%
              </div>
            )}
          </div>
          <p className="text-sm text-gray-600 font-medium">Total de Animais</p>
          <p className="text-3xl font-semibold text-gray-900 mt-1">{stats.totalAnimals}</p>
        </Card>

        <Card className="p-6 border border-gray-200">
          <div className="flex items-center justify-between mb-3">
            <div className="p-2 bg-red-100 rounded-lg">
              <Heart className="w-5 h-5 text-red-600" />
            </div>
            {stats.trend.adoptions > 0 && (
              <div className="flex items-center gap-1 text-xs text-red-600">
                <TrendingUp className="w-3 h-3" />
                +{stats.trend.adoptions}%
              </div>
            )}
          </div>
          <p className="text-sm text-gray-600 font-medium">Adoções Pendentes</p>
          <p className="text-3xl font-semibold text-gray-900 mt-1">{stats.pendingAdoptions}</p>
        </Card>

        <Card className="p-6 border border-gray-200">
          <div className="flex items-center justify-between mb-3">
            <div className="p-2 bg-blue-100 rounded-lg">
              <Users className="w-5 h-5 text-blue-600" />
            </div>
          </div>
          <p className="text-sm text-gray-600 font-medium">Usuários Ativos</p>
          <p className="text-3xl font-semibold text-gray-900 mt-1">{stats.totalUsers}</p>
        </Card>

        <Card className="p-6 border border-gray-200">
          <div className="flex items-center justify-between mb-3">
            <div className="p-2 bg-amber-100 rounded-lg">
              <AlertCircle className="w-5 h-5 text-amber-600" />
            </div>
          </div>
          <p className="text-sm text-gray-600 font-medium">Alertas do Sistema</p>
          <p className="text-3xl font-semibold text-gray-900 mt-1">{stats.systemAlerts}</p>
        </Card>
      </div>

      {/* Recent Activity */}
      <Card>
        <div className="p-6">
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-lg font-semibold text-gray-900">Atividades Recentes</h2>
            <Button 
              size="sm" 
              variant="ghost"
              onClick={loadDashboardData}
            >
              <RefreshCw className="w-4 h-4" />
            </Button>
          </div>

          <div className="space-y-3">
            {isLoading ? (
              <>
                <div className="h-12 bg-gray-100 rounded animate-pulse" />
                <div className="h-12 bg-gray-100 rounded animate-pulse" />
                <div className="h-12 bg-gray-100 rounded animate-pulse" />
              </>
            ) : (
              activities.map((activity) => (
                <div key={activity.id} className="flex items-center gap-3 p-3 hover:bg-gray-50 rounded-lg transition-colors">
                  <div className="p-2 bg-gray-100 rounded-lg">
                    {getActivityIcon(activity.type)}
                  </div>
                  <div className="flex-1">
                    <p className="text-sm text-gray-900">{activity.message}</p>
                    <p className="text-xs text-gray-500">
                      {activity.user && `${activity.user} • `}{activity.timestamp}
                    </p>
                  </div>
                </div>
              ))
            )}
          </div>
        </div>
      </Card>
    </div>
  );
}
