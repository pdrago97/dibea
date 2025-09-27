'use client';

import React, { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { 
  Users, 
  PawPrint, 
  FileText, 
  Phone, 
  Calendar,
  CheckCircle,
  Clock,
  AlertTriangle,
  MessageCircle,
  Bot,
  UserCheck,
  ClipboardList
} from 'lucide-react';
import Link from 'next/link';

interface StaffStats {
  pendingAdoptions: number;
  todayVisits: number;
  documentsToReview: number;
  callsToMake: number;
}

interface Task {
  id: string;
  type: string;
  description: string;
  priority: 'high' | 'medium' | 'low';
  dueTime: string;
  status: 'pending' | 'in_progress' | 'completed';
}

export default function StaffDashboard() {
  const [user, setUser] = useState<any>(null);
  const [stats, setStats] = useState<StaffStats>({
    pendingAdoptions: 0,
    todayVisits: 0,
    documentsToReview: 0,
    callsToMake: 0
  });

  const [todayTasks, setTodayTasks] = useState<Task[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const loadStaffData = async () => {
      // Load user data from localStorage
      const userData = localStorage.getItem('user');
      if (userData) {
        setUser(JSON.parse(userData));
      }

      // Simulate API calls - replace with real data
      await new Promise(resolve => setTimeout(resolve, 1000));

      setStats({
        pendingAdoptions: 12,
        todayVisits: 5,
        documentsToReview: 8,
        callsToMake: 3
      });

      setTodayTasks([
        {
          id: '1',
          type: 'visit',
          description: 'Visita domiciliar - Maria Silva (Adoção Luna)',
          priority: 'high',
          dueTime: '10:00',
          status: 'pending'
        },
        {
          id: '2',
          type: 'call',
          description: 'Ligar para João Santos - Follow-up Rex',
          priority: 'medium',
          dueTime: '14:00',
          status: 'pending'
        },
        {
          id: '3',
          type: 'document',
          description: 'Revisar documentos - Ana Costa',
          priority: 'medium',
          dueTime: '15:30',
          status: 'in_progress'
        },
        {
          id: '4',
          type: 'adoption',
          description: 'Processar adoção aprovada - Bella',
          priority: 'high',
          dueTime: '16:00',
          status: 'pending'
        }
      ]);

      setIsLoading(false);
    };

    loadStaffData();
  }, []);

  const getTaskIcon = (type: string) => {
    switch (type) {
      case 'visit':
        return <UserCheck className="w-4 h-4" />;
      case 'call':
        return <Phone className="w-4 h-4" />;
      case 'document':
        return <FileText className="w-4 h-4" />;
      case 'adoption':
        return <PawPrint className="w-4 h-4" />;
      default:
        return <ClipboardList className="w-4 h-4" />;
    }
  };

  const getPriorityColor = (priority: string) => {
    switch (priority) {
      case 'high':
        return 'bg-red-100 text-red-800';
      case 'medium':
        return 'bg-yellow-100 text-yellow-800';
      case 'low':
        return 'bg-green-100 text-green-800';
      default:
        return 'bg-gray-100 text-gray-800';
    }
  };

  const getStatusBadge = (status: string) => {
    const statusMap = {
      pending: { label: 'Pendente', color: 'bg-blue-100 text-blue-800' },
      in_progress: { label: 'Em Andamento', color: 'bg-yellow-100 text-yellow-800' },
      completed: { label: 'Concluído', color: 'bg-green-100 text-green-800' }
    };
    const statusInfo = statusMap[status as keyof typeof statusMap];
    return (
      <Badge className={statusInfo.color}>
        {statusInfo.label}
      </Badge>
    );
  };

  if (isLoading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-blue-50 to-green-50 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4"></div>
          <p className="text-gray-600">Carregando painel do funcionário...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-green-50">
      {/* Header */}
      <header className="bg-white/80 backdrop-blur-md border-b border-gray-200">
        <div className="container mx-auto px-6 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-2">
              <PawPrint className="w-8 h-8 text-blue-600" />
              <span className="text-2xl font-bold text-gray-900">DIBEA</span>
              <Badge className="bg-purple-100 text-purple-800">Funcionário</Badge>
            </div>
            <div className="flex items-center space-x-4">
              <Button variant="outline" size="sm">
                <Calendar className="w-4 h-4 mr-2" />
                Agenda
              </Button>
              <div className="flex items-center space-x-2">
                <Users className="w-5 h-5 text-gray-600" />
                <span className="text-sm font-medium">{user?.name}</span>
              </div>
            </div>
          </div>
        </div>
      </header>

      <div className="container mx-auto px-6 py-8">
        {/* Welcome Section */}
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-900 mb-2">
            Painel do Funcionário 👨‍💼
          </h1>
          <p className="text-gray-600">
            Gerencie processos de adoção, visitas domiciliares e documentação.
          </p>
        </div>

        {/* Stats Cards */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
          <Card>
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-gray-600">Adoções Pendentes</p>
                  <p className="text-3xl font-bold text-orange-600">{stats.pendingAdoptions}</p>
                </div>
                <Clock className="w-8 h-8 text-orange-600" />
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-gray-600">Visitas Hoje</p>
                  <p className="text-3xl font-bold text-blue-600">{stats.todayVisits}</p>
                </div>
                <UserCheck className="w-8 h-8 text-blue-600" />
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-gray-600">Documentos p/ Revisar</p>
                  <p className="text-3xl font-bold text-purple-600">{stats.documentsToReview}</p>
                </div>
                <FileText className="w-8 h-8 text-purple-600" />
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-gray-600">Ligações p/ Fazer</p>
                  <p className="text-3xl font-bold text-green-600">{stats.callsToMake}</p>
                </div>
                <Phone className="w-8 h-8 text-green-600" />
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Quick Actions */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
          <Link href="/agents/chat">
            <Card className="hover:shadow-lg transition-shadow cursor-pointer">
              <CardContent className="p-6 text-center">
                <div className="w-12 h-12 bg-blue-100 rounded-full flex items-center justify-center mx-auto mb-4">
                  <Bot className="w-6 h-6 text-blue-600" />
                </div>
                <h3 className="font-semibold text-gray-900 mb-2">Agente de Tutores</h3>
                <p className="text-sm text-gray-600 mb-4">
                  Use IA para cadastrar e gerenciar tutores rapidamente
                </p>
                <Button size="sm" className="w-full">
                  <MessageCircle className="w-4 h-4 mr-2" />
                  Iniciar Chat
                </Button>
              </CardContent>
            </Card>
          </Link>

          <Card className="hover:shadow-lg transition-shadow cursor-pointer">
            <CardContent className="p-6 text-center">
              <div className="w-12 h-12 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-4">
                <UserCheck className="w-6 h-6 text-green-600" />
              </div>
              <h3 className="font-semibold text-gray-900 mb-2">Nova Visita</h3>
              <p className="text-sm text-gray-600 mb-4">
                Agendar visita domiciliar para processo de adoção
              </p>
              <Button size="sm" variant="outline" className="w-full">
                Agendar
              </Button>
            </CardContent>
          </Card>

          <Card className="hover:shadow-lg transition-shadow cursor-pointer">
            <CardContent className="p-6 text-center">
              <div className="w-12 h-12 bg-purple-100 rounded-full flex items-center justify-center mx-auto mb-4">
                <FileText className="w-6 h-6 text-purple-600" />
              </div>
              <h3 className="font-semibold text-gray-900 mb-2">Processar Adoção</h3>
              <p className="text-sm text-gray-600 mb-4">
                Finalizar processo de adoção aprovado
              </p>
              <Button size="sm" variant="outline" className="w-full">
                <Badge className="bg-orange-100 text-orange-800 mr-2">{stats.pendingAdoptions}</Badge>
                Processar
              </Button>
            </CardContent>
          </Card>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
          {/* Today's Tasks */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center">
                <ClipboardList className="w-5 h-5 mr-2" />
                Tarefas de Hoje
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {todayTasks.map((task) => (
                  <div key={task.id} className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                    <div className="flex items-start space-x-3 flex-1">
                      <div className="text-gray-600 mt-1">
                        {getTaskIcon(task.type)}
                      </div>
                      <div className="flex-1">
                        <div className="flex items-center space-x-2 mb-1">
                          <Badge className={getPriorityColor(task.priority)}>
                            {task.priority === 'high' ? 'Alta' : task.priority === 'medium' ? 'Média' : 'Baixa'}
                          </Badge>
                          {getStatusBadge(task.status)}
                        </div>
                        <p className="text-sm font-medium text-gray-900">{task.description}</p>
                        <p className="text-xs text-gray-500 mt-1">Horário: {task.dueTime}</p>
                      </div>
                    </div>
                    <div className="text-right">
                      {task.status === 'pending' && (
                        <Button size="sm">
                          Iniciar
                        </Button>
                      )}
                      {task.status === 'in_progress' && (
                        <Button size="sm" variant="outline">
                          Finalizar
                        </Button>
                      )}
                    </div>
                  </div>
                ))}
              </div>
              <div className="mt-4">
                <Button variant="outline" size="sm" className="w-full">
                  Ver Todas as Tarefas
                </Button>
              </div>
            </CardContent>
          </Card>

          {/* Quick Stats */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center">
                <CheckCircle className="w-5 h-5 mr-2" />
                Resumo Semanal
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                <div className="flex items-center justify-between">
                  <span className="text-sm font-medium">Adoções Processadas</span>
                  <div className="flex items-center">
                    <span className="text-2xl font-bold text-green-600 mr-2">18</span>
                    <Badge className="bg-green-100 text-green-800">
                      <CheckCircle className="w-3 h-3 mr-1" />
                      Meta atingida
                    </Badge>
                  </div>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-sm font-medium">Visitas Realizadas</span>
                  <div className="flex items-center">
                    <span className="text-2xl font-bold text-blue-600 mr-2">25</span>
                    <Badge className="bg-blue-100 text-blue-800">
                      <CheckCircle className="w-3 h-3 mr-1" />
                      Excelente
                    </Badge>
                  </div>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-sm font-medium">Documentos Revisados</span>
                  <div className="flex items-center">
                    <span className="text-2xl font-bold text-purple-600 mr-2">34</span>
                    <Badge className="bg-green-100 text-green-800">
                      <CheckCircle className="w-3 h-3 mr-1" />
                      Acima da média
                    </Badge>
                  </div>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-sm font-medium">Taxa de Aprovação</span>
                  <div className="flex items-center">
                    <span className="text-2xl font-bold text-orange-600 mr-2">89%</span>
                    <Badge className="bg-green-100 text-green-800">
                      <CheckCircle className="w-3 h-3 mr-1" />
                      Ótima
                    </Badge>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}
