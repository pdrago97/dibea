'use client';

import React, { useState, useEffect } from 'react';
import { useAuth } from '@/contexts/AuthContext';
import { ProtectedRoute } from '@/components/auth/ProtectedRoute';
import Header from '@/components/navigation/Header';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import {
  Heart,
  MessageCircle,
  FileText,
  Bell,
  Search,
  PawPrint,
  MapPin,
  Calendar,
  User,
  Phone,
  Mail,
  ArrowRight,
  Bot,
  Sparkles,
  ChevronRight
} from 'lucide-react';
import Link from 'next/link';

interface UserProfile {
  id: string;
  name: string;
  email: string;
  phone: string;
  municipality: string;
  role: string;
}

interface AnimalCard {
  id: string;
  name: string;
  species: string;
  breed: string;
  age: string;
  description: string;
  image: string;
  urgent: boolean;
  municipality: string;
}

interface AdoptionProcess {
  id: string;
  animalName: string;
  status: 'pending' | 'approved' | 'rejected' | 'completed';
  createdAt: string;
  nextStep: string;
}

export default function CitizenDashboard() {
  const [user, setUser] = useState<UserProfile | null>(null);
  const [featuredAnimals, setFeaturedAnimals] = useState<AnimalCard[]>([]);
  const [adoptionProcesses, setAdoptionProcesses] = useState<AdoptionProcess[]>([]);
  const [notifications, setNotifications] = useState<any[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const loadDashboardData = async () => {
      // Load user data from localStorage
      const userData = localStorage.getItem('user');
      if (userData) {
        setUser(JSON.parse(userData));
      }

      // Simulate API calls - replace with real data
      await new Promise(resolve => setTimeout(resolve, 1000));

      setFeaturedAnimals([
        {
          id: '1',
          name: 'Luna',
          species: 'Cão',
          breed: 'Labrador Mix',
          age: '2 anos',
          description: 'Carinhosa e brincalhona, adora crianças',
          image: 'https://images.unsplash.com/photo-1552053831-71594a27632d?w=300&h=200&fit=crop',
          urgent: false,
          municipality: 'São Paulo'
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
          municipality: 'São Paulo'
        }
      ]);

      setAdoptionProcesses([
        {
          id: '1',
          animalName: 'Rex',
          status: 'pending',
          createdAt: '2024-01-15',
          nextStep: 'Aguardando análise de documentos'
        }
      ]);

      setNotifications([
        {
          id: '1',
          type: 'adoption',
          message: 'Novo animal disponível para adoção na sua região',
          time: '2 horas atrás'
        },
        {
          id: '2',
          type: 'process',
          message: 'Seu processo de adoção foi atualizado',
          time: '1 dia atrás'
        }
      ]);

      setIsLoading(false);
    };

    loadDashboardData();
  }, []);

  const getStatusBadge = (status: string) => {
    const statusMap = {
      pending: { label: 'Pendente', color: 'bg-yellow-100 text-yellow-800' },
      approved: { label: 'Aprovado', color: 'bg-green-100 text-green-800' },
      rejected: { label: 'Rejeitado', color: 'bg-red-100 text-red-800' },
      completed: { label: 'Concluído', color: 'bg-blue-100 text-blue-800' }
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
          <p className="text-gray-600">Carregando seu dashboard...</p>
        </div>
      </div>
    );
  }

  return (
    <ProtectedRoute requiredRoles="CIDADAO">
      <div className="min-h-screen bg-gradient-to-br from-blue-50 to-green-50">
      {/* Header */}
      <header className="bg-white/80 backdrop-blur-md border-b border-gray-200">
        <div className="container mx-auto px-6 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-2">
              <PawPrint className="w-8 h-8 text-blue-600" />
              <span className="text-2xl font-bold text-gray-900">DIBEA</span>
              <Badge className="bg-green-100 text-green-800">Cidadão</Badge>
            </div>
            <div className="flex items-center space-x-4">
              <Button variant="outline" size="sm">
                <Bell className="w-4 h-4 mr-2" />
                Notificações
              </Button>
              <div className="flex items-center space-x-2">
                <User className="w-5 h-5 text-gray-600" />
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
            Olá, {user?.name}! 👋
          </h1>
          <p className="text-gray-600">
            Bem-vindo ao seu painel de adoção. Encontre seu novo melhor amigo ou acompanhe seus processos.
          </p>
        </div>

        {/* Quick Actions */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
          <Link href="/agents/chat">
            <Card className="hover:shadow-lg transition-shadow cursor-pointer">
              <CardContent className="p-6 text-center">
                <div className="w-12 h-12 bg-blue-100 rounded-full flex items-center justify-center mx-auto mb-4">
                  <Bot className="w-6 h-6 text-blue-600" />
                </div>
                <h3 className="font-semibold text-gray-900 mb-2">Chat com IA</h3>
                <p className="text-sm text-gray-600 mb-4">
                  Converse com nossos agentes inteligentes para encontrar o animal ideal
                </p>
                <Button size="sm" className="w-full">
                  <MessageCircle className="w-4 h-4 mr-2" />
                  Iniciar Conversa
                </Button>
              </CardContent>
            </Card>
          </Link>

          <Link href="/animals/search">
            <Card className="hover:shadow-lg transition-shadow cursor-pointer">
              <CardContent className="p-6 text-center">
                <div className="w-12 h-12 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-4">
                  <Search className="w-6 h-6 text-green-600" />
                </div>
                <h3 className="font-semibold text-gray-900 mb-2">Buscar Animais</h3>
                <p className="text-sm text-gray-600 mb-4">
                  Explore todos os animais disponíveis para adoção
                </p>
                <Button size="sm" variant="outline" className="w-full">
                  <PawPrint className="w-4 h-4 mr-2" />
                  Ver Animais
                </Button>
              </CardContent>
            </Card>
          </Link>

          <Link href="/citizen/profile">
            <Card className="hover:shadow-lg transition-shadow cursor-pointer">
              <CardContent className="p-6 text-center">
                <div className="w-12 h-12 bg-purple-100 rounded-full flex items-center justify-center mx-auto mb-4">
                  <User className="w-6 h-6 text-purple-600" />
                </div>
                <h3 className="font-semibold text-gray-900 mb-2">Meu Perfil</h3>
                <p className="text-sm text-gray-600 mb-4">
                  Gerencie suas informações e preferências
                </p>
                <Button size="sm" variant="outline" className="w-full">
                  <User className="w-4 h-4 mr-2" />
                  Ver Perfil
                </Button>
              </CardContent>
            </Card>
          </Link>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
          {/* Featured Animals */}
          <div>
            <div className="flex items-center justify-between mb-6">
              <h2 className="text-2xl font-bold text-gray-900">Animais em Destaque</h2>
              <Link href="/animals/search">
                <Button variant="outline" size="sm">
                  Ver Todos
                  <ArrowRight className="w-4 h-4 ml-2" />
                </Button>
              </Link>
            </div>

            <div className="space-y-4">
              {featuredAnimals.map((animal) => (
                <Card key={animal.id} className="overflow-hidden hover:shadow-lg transition-shadow">
                  <div className="flex">
                    <div className="relative w-24 h-24">
                      <img 
                        src={animal.image} 
                        alt={animal.name}
                        className="w-full h-full object-cover"
                      />
                      {animal.urgent && (
                        <Badge className="absolute top-1 right-1 bg-red-100 text-red-800 text-xs">
                          Urgente
                        </Badge>
                      )}
                    </div>
                    <div className="flex-1 p-4">
                      <div className="flex items-center justify-between mb-2">
                        <h3 className="font-semibold text-gray-900">{animal.name}</h3>
                        <Badge variant="outline">{animal.species}</Badge>
                      </div>
                      <p className="text-sm text-gray-600 mb-2">{animal.breed} • {animal.age}</p>
                      <p className="text-sm text-gray-700 mb-3">{animal.description}</p>
                      <div className="flex items-center justify-between">
                        <div className="flex items-center text-xs text-gray-500">
                          <MapPin className="w-3 h-3 mr-1" />
                          {animal.municipality}
                        </div>
                        <Button size="sm">
                          <Heart className="w-4 h-4 mr-2" />
                          Adotar
                        </Button>
                      </div>
                    </div>
                  </div>
                </Card>
              ))}
            </div>
          </div>

          {/* Adoption Processes & Notifications */}
          <div className="space-y-8">
            {/* Adoption Processes */}
            <div>
              <h2 className="text-2xl font-bold text-gray-900 mb-6">Meus Processos</h2>
              
              {adoptionProcesses.length > 0 ? (
                <div className="space-y-4">
                  {adoptionProcesses.map((process) => (
                    <Card key={process.id}>
                      <CardContent className="p-4">
                        <div className="flex items-center justify-between mb-2">
                          <h3 className="font-semibold text-gray-900">{process.animalName}</h3>
                          {getStatusBadge(process.status)}
                        </div>
                        <p className="text-sm text-gray-600 mb-2">{process.nextStep}</p>
                        <div className="flex items-center text-xs text-gray-500">
                          <Calendar className="w-3 h-3 mr-1" />
                          Iniciado em {new Date(process.createdAt).toLocaleDateString('pt-BR')}
                        </div>
                      </CardContent>
                    </Card>
                  ))}
                </div>
              ) : (
                <Card>
                  <CardContent className="p-6 text-center">
                    <FileText className="w-12 h-12 text-gray-400 mx-auto mb-4" />
                    <h3 className="font-semibold text-gray-900 mb-2">Nenhum processo ativo</h3>
                    <p className="text-sm text-gray-600 mb-4">
                      Você ainda não iniciou nenhum processo de adoção
                    </p>
                    <Link href="/animals/search">
                      <Button size="sm">
                        <Heart className="w-4 h-4 mr-2" />
                        Encontrar um Animal
                      </Button>
                    </Link>
                  </CardContent>
                </Card>
              )}
            </div>

            {/* Notifications */}
            <div>
              <div className="flex items-center justify-between mb-6">
                <h2 className="text-2xl font-bold text-gray-900">Notificações</h2>
                <Link href="/notifications">
                  <Button variant="outline" size="sm">
                    <Bell className="w-4 h-4 mr-2" />
                    Ver Todas
                  </Button>
                </Link>
              </div>

              <div className="space-y-3">
                {notifications.length > 0 ? notifications.map((notification) => (
                  <Link key={notification.id} href={`/notifications/${notification.id}`}>
                    <Card className="hover:shadow-md transition-shadow cursor-pointer">
                      <CardContent className="p-4">
                        <div className="flex items-start space-x-3">
                          <div className="w-2 h-2 bg-blue-600 rounded-full mt-2"></div>
                          <div className="flex-1">
                            <p className="text-sm font-medium text-gray-900">{notification.message}</p>
                            <p className="text-xs text-gray-500 mt-1">{notification.time}</p>
                          </div>
                          <ChevronRight className="w-4 h-4 text-gray-400" />
                        </div>
                      </CardContent>
                    </Card>
                  </Link>
                )) : (
                  <Card>
                    <CardContent className="p-6 text-center">
                      <Bell className="w-12 h-12 text-gray-400 mx-auto mb-4" />
                      <h3 className="font-semibold text-gray-900 mb-2">Nenhuma notificação</h3>
                      <p className="text-sm text-gray-600">
                        Você não tem notificações no momento
                      </p>
                    </CardContent>
                  </Card>
                )}
              </div>
            </div>
          </div>
        </div>
      </div>
      </div>
    </ProtectedRoute>
  );
}
