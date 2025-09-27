'use client';

import React, { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { 
  Stethoscope, 
  PawPrint, 
  Calendar, 
  FileText, 
  Users,
  Clock,
  CheckCircle,
  AlertTriangle,
  TrendingUp,
  MessageCircle,
  Bot,
  Syringe
} from 'lucide-react';
import Link from 'next/link';

interface VetStats {
  todayAppointments: number;
  pendingProcedures: number;
  animalsUnderCare: number;
  completedToday: number;
}

interface Appointment {
  id: string;
  animalName: string;
  tutorName: string;
  time: string;
  type: string;
  status: 'scheduled' | 'in_progress' | 'completed';
}

export default function VetDashboard() {
  const [user, setUser] = useState<any>(null);
  const [stats, setStats] = useState<VetStats>({
    todayAppointments: 0,
    pendingProcedures: 0,
    animalsUnderCare: 0,
    completedToday: 0
  });

  const [todayAppointments, setTodayAppointments] = useState<Appointment[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const loadVetData = async () => {
      // Load user data from localStorage
      const userData = localStorage.getItem('user');
      if (userData) {
        setUser(JSON.parse(userData));
      }

      // Simulate API calls - replace with real data
      await new Promise(resolve => setTimeout(resolve, 1000));

      setStats({
        todayAppointments: 8,
        pendingProcedures: 3,
        animalsUnderCare: 15,
        completedToday: 5
      });

      setTodayAppointments([
        {
          id: '1',
          animalName: 'Luna',
          tutorName: 'Maria Silva',
          time: '09:00',
          type: 'Consulta de rotina',
          status: 'completed'
        },
        {
          id: '2',
          animalName: 'Rex',
          tutorName: 'João Santos',
          time: '10:30',
          type: 'Vacinação',
          status: 'in_progress'
        },
        {
          id: '3',
          animalName: 'Milo',
          tutorName: 'Ana Costa',
          time: '14:00',
          type: 'Cirurgia menor',
          status: 'scheduled'
        },
        {
          id: '4',
          animalName: 'Bella',
          tutorName: 'Carlos Lima',
          time: '15:30',
          type: 'Exame de sangue',
          status: 'scheduled'
        }
      ]);

      setIsLoading(false);
    };

    loadVetData();
  }, []);

  const getStatusBadge = (status: string) => {
    const statusMap = {
      scheduled: { label: 'Agendado', color: 'bg-blue-100 text-blue-800' },
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
          <p className="text-gray-600">Carregando painel veterinário...</p>
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
              <Badge className="bg-blue-100 text-blue-800">Veterinário</Badge>
            </div>
            <div className="flex items-center space-x-4">
              <Button variant="outline" size="sm">
                <Calendar className="w-4 h-4 mr-2" />
                Agenda
              </Button>
              <div className="flex items-center space-x-2">
                <Stethoscope className="w-5 h-5 text-gray-600" />
                <span className="text-sm font-medium">Dr(a). {user?.name}</span>
              </div>
            </div>
          </div>
        </div>
      </header>

      <div className="container mx-auto px-6 py-8">
        {/* Welcome Section */}
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-900 mb-2">
            Painel Veterinário 🩺
          </h1>
          <p className="text-gray-600">
            Gerencie consultas, procedimentos e acompanhe seus pacientes.
          </p>
        </div>

        {/* Stats Cards */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
          <Card>
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-gray-600">Consultas Hoje</p>
                  <p className="text-3xl font-bold text-blue-600">{stats.todayAppointments}</p>
                </div>
                <Calendar className="w-8 h-8 text-blue-600" />
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-gray-600">Procedimentos Pendentes</p>
                  <p className="text-3xl font-bold text-orange-600">{stats.pendingProcedures}</p>
                </div>
                <Clock className="w-8 h-8 text-orange-600" />
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-gray-600">Animais sob Cuidado</p>
                  <p className="text-3xl font-bold text-green-600">{stats.animalsUnderCare}</p>
                </div>
                <PawPrint className="w-8 h-8 text-green-600" />
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-gray-600">Concluídos Hoje</p>
                  <p className="text-3xl font-bold text-purple-600">{stats.completedToday}</p>
                </div>
                <CheckCircle className="w-8 h-8 text-purple-600" />
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
                <h3 className="font-semibold text-gray-900 mb-2">Agente de Procedimentos</h3>
                <p className="text-sm text-gray-600 mb-4">
                  Use IA para registrar procedimentos rapidamente
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
                <Syringe className="w-6 h-6 text-green-600" />
              </div>
              <h3 className="font-semibold text-gray-900 mb-2">Novo Procedimento</h3>
              <p className="text-sm text-gray-600 mb-4">
                Registrar vacinação, cirurgia ou consulta
              </p>
              <Button size="sm" variant="outline" className="w-full">
                Registrar
              </Button>
            </CardContent>
          </Card>

          <Card className="hover:shadow-lg transition-shadow cursor-pointer">
            <CardContent className="p-6 text-center">
              <div className="w-12 h-12 bg-purple-100 rounded-full flex items-center justify-center mx-auto mb-4">
                <FileText className="w-6 h-6 text-purple-600" />
              </div>
              <h3 className="font-semibold text-gray-900 mb-2">Relatórios</h3>
              <p className="text-sm text-gray-600 mb-4">
                Gerar relatórios de atividades e estatísticas
              </p>
              <Button size="sm" variant="outline" className="w-full">
                Gerar
              </Button>
            </CardContent>
          </Card>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
          {/* Today's Appointments */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center">
                <Calendar className="w-5 h-5 mr-2" />
                Agenda de Hoje
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {todayAppointments.map((appointment) => (
                  <div key={appointment.id} className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                    <div className="flex-1">
                      <div className="flex items-center justify-between mb-1">
                        <h4 className="font-medium text-gray-900">{appointment.animalName}</h4>
                        {getStatusBadge(appointment.status)}
                      </div>
                      <p className="text-sm text-gray-600">Tutor: {appointment.tutorName}</p>
                      <p className="text-sm text-gray-600">{appointment.type}</p>
                    </div>
                    <div className="text-right">
                      <p className="text-sm font-medium text-gray-900">{appointment.time}</p>
                      {appointment.status === 'scheduled' && (
                        <Button size="sm" className="mt-2">
                          Iniciar
                        </Button>
                      )}
                    </div>
                  </div>
                ))}
              </div>
              <div className="mt-4">
                <Button variant="outline" size="sm" className="w-full">
                  Ver Agenda Completa
                </Button>
              </div>
            </CardContent>
          </Card>

          {/* Performance Metrics */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center">
                <TrendingUp className="w-5 h-5 mr-2" />
                Performance Semanal
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                <div className="flex items-center justify-between">
                  <span className="text-sm font-medium">Consultas Realizadas</span>
                  <div className="flex items-center">
                    <span className="text-2xl font-bold text-blue-600 mr-2">42</span>
                    <Badge className="bg-green-100 text-green-800">
                      <TrendingUp className="w-3 h-3 mr-1" />
                      +15%
                    </Badge>
                  </div>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-sm font-medium">Procedimentos</span>
                  <div className="flex items-center">
                    <span className="text-2xl font-bold text-green-600 mr-2">28</span>
                    <Badge className="bg-green-100 text-green-800">
                      <TrendingUp className="w-3 h-3 mr-1" />
                      +8%
                    </Badge>
                  </div>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-sm font-medium">Satisfação</span>
                  <div className="flex items-center">
                    <span className="text-2xl font-bold text-purple-600 mr-2">4.8</span>
                    <Badge className="bg-green-100 text-green-800">
                      <CheckCircle className="w-3 h-3 mr-1" />
                      Excelente
                    </Badge>
                  </div>
                </div>
                <div className="mt-4 p-3 bg-blue-50 rounded-lg">
                  <div className="flex items-center">
                    <CheckCircle className="w-4 h-4 text-blue-600 mr-2" />
                    <span className="text-sm text-blue-700">
                      Performance acima da média municipal
                    </span>
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
