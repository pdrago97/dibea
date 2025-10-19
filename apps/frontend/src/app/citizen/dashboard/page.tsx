'use client';

export const dynamic = 'force-dynamic';

import React, { useState, useEffect } from 'react';
import { useAuth } from '@/contexts/AuthContext';
import { ProtectedRoute } from '@/components/auth/ProtectedRoute';
import Header from '@/components/navigation/Header';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Alert, AlertDescription } from '@/components/ui/alert';
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
  ChevronRight,
  Loader2,
  AlertCircle,
  RefreshCw,
  Clock
} from 'lucide-react';
import Link from 'next/link';
import { useDashboard } from '@/hooks/useDashboard';
import { useChatService } from '@/services/chatService';

interface UserProfile {
  id: string;
  name: string;
  email: string;
  phone: string;
  municipality: string;
  role: string;
}

export default function CitizenDashboard() {
  const [user, setUser] = useState<UserProfile | null>(null);
  const {
    featuredAnimals,
    adoptionProcesses,
    notifications,
    unreadCount,
    urgentCount,
    activeProcessCount,
    isLoading,
    error,
    lastUpdated,
    refreshData,
    startAdoption,
    markNotificationAsRead,
    clearError
  } = useDashboard();

  const chatService = useChatService();

  useEffect(() => {
    // Load user data from localStorage
    const userData = localStorage.getItem('user');
    if (userData) {
      setUser(JSON.parse(userData));
    }
  }, []);

  const handleAdoptAnimal = async (animalId: string) => {
    try {
      const result = await startAdoption(animalId);
      if (result.success) {
        // Mostrar sucesso - pode usar toast ou modal
        console.log('✅ Processo de adoção iniciado:', result.message);
      } else {
        console.error('❌ Erro ao iniciar adoção:', result.message);
      }
    } catch (error) {
      console.error('❌ Erro ao iniciar adoção:', error);
    }
  };

  const formatTimeAgo = (timestamp: string) => {
    const now = new Date();
    const time = new Date(timestamp);
    const diffInHours = Math.floor((now.getTime() - time.getTime()) / (1000 * 60 * 60));

    if (diffInHours < 1) return 'Agora mesmo';
    if (diffInHours < 24) return `${diffInHours}h atrás`;
    const diffInDays = Math.floor(diffInHours / 24);
    return `${diffInDays}d atrás`;
  };

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
          <p className="text-sm text-gray-500 mt-2">Conectando com agentes n8n...</p>
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
          <div className="flex items-center justify-between mb-4">
            <div>
              <h1 className="text-3xl font-bold text-gray-900 mb-2">
                Olá, {user?.name}! 👋
              </h1>
              <p className="text-gray-600">
                Bem-vindo ao seu painel de adoção. Encontre seu novo melhor amigo ou acompanhe seus processos.
              </p>
            </div>
            <div className="flex items-center space-x-4">
              {error && (
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => {
                    clearError();
                    refreshData();
                  }}
                  className="text-red-600 border-red-200 hover:bg-red-50"
                >
                  <RefreshCw className="w-4 h-4 mr-2" />
                  Tentar Novamente
                </Button>
              )}
              {lastUpdated && (
                <div className="text-xs text-gray-500 flex items-center">
                  <Clock className="w-3 h-3 mr-1" />
                  Atualizado {formatTimeAgo(lastUpdated.toISOString())}
                </div>
              )}
            </div>
          </div>

          {/* Status Indicators */}
          {(unreadCount > 0 || urgentCount > 0 || activeProcessCount > 0) && (
            <div className="flex items-center space-x-4 mb-4">
              {unreadCount > 0 && (
                <Badge className="bg-blue-100 text-blue-800">
                  {unreadCount} notificação{unreadCount > 1 ? 'ões' : ''} não lida{unreadCount > 1 ? 's' : ''}
                </Badge>
              )}
              {urgentCount > 0 && (
                <Badge className="bg-red-100 text-red-800">
                  {urgentCount} animal{urgentCount > 1 ? 'is' : ''} urgente{urgentCount > 1 ? 's' : ''}
                </Badge>
              )}
              {activeProcessCount > 0 && (
                <Badge className="bg-green-100 text-green-800">
                  {activeProcessCount} processo{activeProcessCount > 1 ? 's' : ''} ativo{activeProcessCount > 1 ? 's' : ''}
                </Badge>
              )}
            </div>
          )}

          {/* Error Alert */}
          {error && (
            <Alert className="mb-4">
              <AlertCircle className="h-4 w-4" />
              <AlertDescription>
                {error}
              </AlertDescription>
            </Alert>
          )}
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
                        <Button
                          size="sm"
                          onClick={() => handleAdoptAnimal(animal.id)}
                          disabled={animal.status !== 'available'}
                        >
                          <Heart className="w-4 h-4 mr-2" />
                          {animal.status === 'available' ? 'Adotar' : 'Indisponível'}
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
                  <Card
                    key={notification.id}
                    className="hover:shadow-md transition-shadow cursor-pointer"
                    onClick={() => {
                      if (!notification.read) {
                        markNotificationAsRead(notification.id);
                      }
                      // Navigate to notification detail or action
                      if (notification.metadata?.actionUrl) {
                        window.open(notification.metadata.actionUrl, '_blank');
                      }
                    }}
                  >
                    <CardContent className="p-4">
                      <div className="flex items-start space-x-3">
                        <div className={`w-2 h-2 rounded-full mt-2 ${
                          notification.read ? 'bg-gray-300' : 'bg-blue-600'
                        }`}></div>
                        <div className="flex-1">
                          <div className="flex items-center justify-between mb-1">
                            <p className="text-sm font-medium text-gray-900">{notification.title || notification.message}</p>
                            {notification.priority === 'high' && (
                              <Badge className="bg-red-100 text-red-800 text-xs">Urgente</Badge>
                            )}
                          </div>
                          <p className="text-sm text-gray-600">{notification.message}</p>
                          <p className="text-xs text-gray-500 mt-1">{formatTimeAgo(notification.timestamp)}</p>
                        </div>
                        <ChevronRight className="w-4 h-4 text-gray-400" />
                      </div>
                    </CardContent>
                  </Card>
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
