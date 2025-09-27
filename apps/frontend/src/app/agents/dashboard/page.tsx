'use client';

import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { 
  Shield, 
  Users, 
  FileText, 
  Activity, 
  AlertTriangle,
  CheckCircle,
  XCircle,
  Clock,
  BarChart3
} from 'lucide-react';

interface AgentMetrics {
  totalRequests: number;
  successfulRequests: number;
  failedRequests: number;
  blockedRequests: number;
  averageResponseTime: number;
  activeUsers: number;
}

interface UserActivity {
  userId: string;
  userName: string;
  role: string;
  lastActivity: string;
  requestCount: number;
  municipality: string;
}

interface SecurityEvent {
  id: string;
  type: 'BLOCKED_ACCESS' | 'INVALID_CPF' | 'UNAUTHORIZED_MUNICIPALITY' | 'INVALID_DOCUMENT';
  userId: string;
  userName: string;
  role: string;
  description: string;
  timestamp: string;
  severity: 'LOW' | 'MEDIUM' | 'HIGH';
}

export default function AgentsDashboard() {
  const [metrics, setMetrics] = useState<AgentMetrics>({
    totalRequests: 0,
    successfulRequests: 0,
    failedRequests: 0,
    blockedRequests: 0,
    averageResponseTime: 0,
    activeUsers: 0
  });

  const [userActivity, setUserActivity] = useState<UserActivity[]>([]);
  const [securityEvents, setSecurityEvents] = useState<SecurityEvent[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  // Simulated data - replace with real API calls
  useEffect(() => {
    const loadDashboardData = async () => {
      setIsLoading(true);
      
      // Simulate API delay
      await new Promise(resolve => setTimeout(resolve, 1000));
      
      // Mock data
      setMetrics({
        totalRequests: 1247,
        successfulRequests: 1156,
        failedRequests: 45,
        blockedRequests: 46,
        averageResponseTime: 245,
        activeUsers: 23
      });

      setUserActivity([
        {
          userId: '1',
          userName: 'Dr. Silva',
          role: 'VETERINARIO',
          lastActivity: '2025-01-27T10:30:00Z',
          requestCount: 15,
          municipality: 'São Paulo'
        },
        {
          userId: '2',
          userName: 'João Santos',
          role: 'FUNCIONARIO',
          lastActivity: '2025-01-27T10:25:00Z',
          requestCount: 8,
          municipality: 'São Paulo'
        },
        {
          userId: '3',
          userName: 'Maria Admin',
          role: 'ADMIN',
          lastActivity: '2025-01-27T10:20:00Z',
          requestCount: 32,
          municipality: 'Global'
        }
      ]);

      setSecurityEvents([
        {
          id: '1',
          type: 'BLOCKED_ACCESS',
          userId: '4',
          userName: 'Pedro Cidadão',
          role: 'CIDADAO',
          description: 'Tentativa de acessar agente de animais',
          timestamp: '2025-01-27T10:15:00Z',
          severity: 'MEDIUM'
        },
        {
          id: '2',
          type: 'INVALID_CPF',
          userId: '2',
          userName: 'João Santos',
          role: 'FUNCIONARIO',
          description: 'CPF inválido fornecido: 111.111.111-11',
          timestamp: '2025-01-27T10:10:00Z',
          severity: 'LOW'
        },
        {
          id: '3',
          type: 'UNAUTHORIZED_MUNICIPALITY',
          userId: '5',
          userName: 'Ana Funcionária',
          role: 'FUNCIONARIO',
          description: 'Tentativa de acessar dados de outro município',
          timestamp: '2025-01-27T10:05:00Z',
          severity: 'HIGH'
        }
      ]);

      setIsLoading(false);
    };

    loadDashboardData();
  }, []);

  const getRoleColor = (role: string) => {
    switch (role) {
      case 'ADMIN': return 'bg-purple-100 text-purple-800';
      case 'VETERINARIO': return 'bg-blue-100 text-blue-800';
      case 'FUNCIONARIO': return 'bg-green-100 text-green-800';
      case 'CIDADAO': return 'bg-gray-100 text-gray-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  const getSeverityColor = (severity: string) => {
    switch (severity) {
      case 'HIGH': return 'bg-red-100 text-red-800';
      case 'MEDIUM': return 'bg-yellow-100 text-yellow-800';
      case 'LOW': return 'bg-blue-100 text-blue-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  const formatTimestamp = (timestamp: string) => {
    return new Date(timestamp).toLocaleString('pt-BR');
  };

  if (isLoading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto"></div>
          <p className="mt-4 text-gray-600">Carregando dashboard...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="container mx-auto p-6 space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">Dashboard de Agentes</h1>
          <p className="text-gray-600">Monitoramento e segurança do sistema DIBEA</p>
        </div>
        <Button onClick={() => window.location.reload()}>
          <Activity className="w-4 h-4 mr-2" />
          Atualizar
        </Button>
      </div>

      {/* Metrics Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total de Requisições</CardTitle>
            <BarChart3 className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{metrics.totalRequests.toLocaleString()}</div>
            <p className="text-xs text-muted-foreground">Últimas 24 horas</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Requisições Bem-sucedidas</CardTitle>
            <CheckCircle className="h-4 w-4 text-green-600" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-green-600">{metrics.successfulRequests.toLocaleString()}</div>
            <p className="text-xs text-muted-foreground">
              {((metrics.successfulRequests / metrics.totalRequests) * 100).toFixed(1)}% de sucesso
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Acessos Bloqueados</CardTitle>
            <Shield className="h-4 w-4 text-red-600" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-red-600">{metrics.blockedRequests}</div>
            <p className="text-xs text-muted-foreground">Tentativas não autorizadas</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Usuários Ativos</CardTitle>
            <Users className="h-4 w-4 text-blue-600" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-blue-600">{metrics.activeUsers}</div>
            <p className="text-xs text-muted-foreground">Últimos 30 minutos</p>
          </CardContent>
        </Card>
      </div>

      {/* User Activity */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center">
            <Users className="w-5 h-5 mr-2" />
            Atividade de Usuários
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            {userActivity.map((user) => (
              <div key={user.userId} className="flex items-center justify-between p-4 border rounded-lg">
                <div className="flex items-center space-x-4">
                  <div>
                    <p className="font-medium">{user.userName}</p>
                    <p className="text-sm text-gray-600">{user.municipality}</p>
                  </div>
                  <Badge className={getRoleColor(user.role)}>
                    {user.role}
                  </Badge>
                </div>
                <div className="text-right">
                  <p className="text-sm font-medium">{user.requestCount} requisições</p>
                  <p className="text-xs text-gray-600">{formatTimestamp(user.lastActivity)}</p>
                </div>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>

      {/* Security Events */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center">
            <AlertTriangle className="w-5 h-5 mr-2" />
            Eventos de Segurança
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            {securityEvents.map((event) => (
              <div key={event.id} className="flex items-center justify-between p-4 border rounded-lg">
                <div className="flex items-center space-x-4">
                  <div className="flex-1">
                    <div className="flex items-center space-x-2 mb-1">
                      <p className="font-medium">{event.userName}</p>
                      <Badge className={getRoleColor(event.role)}>
                        {event.role}
                      </Badge>
                      <Badge className={getSeverityColor(event.severity)}>
                        {event.severity}
                      </Badge>
                    </div>
                    <p className="text-sm text-gray-600">{event.description}</p>
                    <p className="text-xs text-gray-500">{formatTimestamp(event.timestamp)}</p>
                  </div>
                </div>
                <div className="text-right">
                  {event.severity === 'HIGH' && <XCircle className="w-5 h-5 text-red-600" />}
                  {event.severity === 'MEDIUM' && <AlertTriangle className="w-5 h-5 text-yellow-600" />}
                  {event.severity === 'LOW' && <Clock className="w-5 h-5 text-blue-600" />}
                </div>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
