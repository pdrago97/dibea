'use client';

import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import { Alert, AlertDescription } from '@/components/ui/alert';
import {
  Users, PawPrint, Building, Shield, Settings, BarChart3,
  UserPlus, AlertTriangle, CheckCircle, Clock, TrendingUp,
  Database, Bot, MessageSquare, Heart, FileText, Calendar,
  Activity, Eye, Filter, Download, RefreshCw, Search,
  Plus, Edit, Trash2, MoreHorizontal, Bell, Zap,
  Target, Award, Star, ChevronRight, ArrowUp, ArrowDown
} from 'lucide-react';
import { EntityCard, SectionHeader, StatusBadge } from '@/components/ui/design-system';

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

interface SystemAlert {
  id: string;
  type: 'info' | 'warning' | 'error' | 'success';
  title: string;
  message: string;
  timestamp: string;
  action?: string;
}

interface PendingApproval {
  id: string;
  type: 'user' | 'animal' | 'procedure' | 'document';
  title: string;
  description: string;
  requestedBy: string;
  timestamp: string;
  priority: 'high' | 'medium' | 'low';
}

interface RecentActivity {
  id: string;
  type: 'user_created' | 'animal_added' | 'adoption_completed' | 'procedure_scheduled';
  description: string;
  user: string;
  timestamp: string;
  entity?: string;
}

interface AdvancedDashboardProps {
  stats: AdminStats;
  alerts: SystemAlert[];
  pendingApprovals: PendingApproval[];
  recentActivity: RecentActivity[];
  onRefresh: () => void;
  isLoading?: boolean;
}

export function AdvancedDashboard({
  stats,
  alerts,
  pendingApprovals,
  recentActivity,
  onRefresh,
  isLoading = false
}: AdvancedDashboardProps) {
  const [selectedTimeRange, setSelectedTimeRange] = useState('7d');
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedFilter, setSelectedFilter] = useState('all');

  const getHealthColor = (health: string) => {
    switch (health) {
      case 'healthy': return 'text-green-600 bg-green-100';
      case 'warning': return 'text-yellow-600 bg-yellow-100';
      case 'critical': return 'text-red-600 bg-red-100';
      default: return 'text-gray-600 bg-gray-100';
    }
  };

  const getAlertIcon = (type: string) => {
    switch (type) {
      case 'error': return <AlertTriangle className="w-4 h-4 text-red-500" />;
      case 'warning': return <AlertTriangle className="w-4 h-4 text-yellow-500" />;
      case 'success': return <CheckCircle className="w-4 h-4 text-green-500" />;
      default: return <Bell className="w-4 h-4 text-blue-500" />;
    }
  };

  const getPriorityColor = (priority: string) => {
    switch (priority) {
      case 'high': return 'bg-red-100 text-red-800';
      case 'medium': return 'bg-yellow-100 text-yellow-800';
      case 'low': return 'bg-green-100 text-green-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  return (
    <div className="space-y-6">
      {/* Header with Controls */}
      <div className="flex flex-col lg:flex-row justify-between items-start lg:items-center gap-4">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">Dashboard Administrativo</h1>
          <p className="text-gray-600">Visão completa do sistema DIBEA</p>
        </div>
        
        <div className="flex items-center space-x-3">
          <div className="flex items-center space-x-2">
            <Input
              placeholder="Buscar..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-64"
            />
            <Button variant="outline" size="icon">
              <Search className="w-4 h-4" />
            </Button>
          </div>
          
          <select
            value={selectedTimeRange}
            onChange={(e) => setSelectedTimeRange(e.target.value)}
            className="px-3 py-2 border rounded-md text-sm"
          >
            <option value="24h">Últimas 24h</option>
            <option value="7d">Últimos 7 dias</option>
            <option value="30d">Últimos 30 dias</option>
            <option value="90d">Últimos 90 dias</option>
          </select>
          
          <Button onClick={onRefresh} disabled={isLoading} variant="outline">
            <RefreshCw className={`w-4 h-4 mr-2 ${isLoading ? 'animate-spin' : ''}`} />
            Atualizar
          </Button>
        </div>
      </div>

      {/* System Health Banner */}
      <Alert className={`border-l-4 ${stats.systemHealth === 'healthy' ? 'border-green-500 bg-green-50' : 
        stats.systemHealth === 'warning' ? 'border-yellow-500 bg-yellow-50' : 'border-red-500 bg-red-50'}`}>
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-3">
            {stats.systemHealth === 'healthy' ? 
              <CheckCircle className="w-5 h-5 text-green-600" /> :
              <AlertTriangle className="w-5 h-5 text-yellow-600" />
            }
            <div>
              <h3 className="font-semibold">
                Sistema {stats.systemHealth === 'healthy' ? 'Operacional' : 'Com Alertas'}
              </h3>
              <AlertDescription>
                Uptime: {stats.systemUptime} | Usuários ativos: {stats.activeUsers} | 
                Armazenamento: {stats.storageUsed}% usado
              </AlertDescription>
            </div>
          </div>
          <Badge className={getHealthColor(stats.systemHealth)}>
            {stats.systemHealth.toUpperCase()}
          </Badge>
        </div>
      </Alert>

      {/* Key Metrics Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <Card className="hover:shadow-lg transition-shadow">
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">Total de Usuários</p>
                <p className="text-3xl font-bold text-blue-600">{stats.totalUsers}</p>
                <div className="flex items-center mt-2">
                  <ArrowUp className="w-4 h-4 text-green-500 mr-1" />
                  <span className="text-sm text-green-600">+{stats.monthlyGrowth}% este mês</span>
                </div>
              </div>
              <div className="p-3 bg-blue-100 rounded-lg">
                <Users className="w-8 h-8 text-blue-600" />
              </div>
            </div>
          </CardContent>
        </Card>

        <Card className="hover:shadow-lg transition-shadow">
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">Total de Animais</p>
                <p className="text-3xl font-bold text-green-600">{stats.totalAnimals}</p>
                <div className="flex items-center mt-2">
                  <Heart className="w-4 h-4 text-red-500 mr-1" />
                  <span className="text-sm text-gray-600">{stats.totalAdoptions} adotados</span>
                </div>
              </div>
              <div className="p-3 bg-green-100 rounded-lg">
                <PawPrint className="w-8 h-8 text-green-600" />
              </div>
            </div>
          </CardContent>
        </Card>

        <Card className="hover:shadow-lg transition-shadow">
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">Municípios</p>
                <p className="text-3xl font-bold text-purple-600">{stats.totalMunicipalities}</p>
                <div className="flex items-center mt-2">
                  <Building className="w-4 h-4 text-purple-500 mr-1" />
                  <span className="text-sm text-gray-600">ativos</span>
                </div>
              </div>
              <div className="p-3 bg-purple-100 rounded-lg">
                <Building className="w-8 h-8 text-purple-600" />
              </div>
            </div>
          </CardContent>
        </Card>

        <Card className="hover:shadow-lg transition-shadow">
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">Interações IA</p>
                <p className="text-3xl font-bold text-orange-600">{stats.agentInteractions}</p>
                <div className="flex items-center mt-2">
                  <Zap className="w-4 h-4 text-orange-500 mr-1" />
                  <span className="text-sm text-gray-600">{stats.apiCalls} API calls</span>
                </div>
              </div>
              <div className="p-3 bg-orange-100 rounded-lg">
                <Bot className="w-8 h-8 text-orange-600" />
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Main Content Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Pending Approvals */}
        <Card className="lg:col-span-1">
          <CardHeader className="flex flex-row items-center justify-between">
            <CardTitle className="flex items-center space-x-2">
              <Clock className="w-5 h-5 text-orange-500" />
              <span>Aprovações Pendentes</span>
            </CardTitle>
            <Badge variant="secondary">{pendingApprovals.length}</Badge>
          </CardHeader>
          <CardContent className="space-y-4">
            {pendingApprovals.slice(0, 5).map((approval) => (
              <div key={approval.id} className="flex items-start space-x-3 p-3 bg-gray-50 rounded-lg">
                <div className="flex-1">
                  <h4 className="font-medium text-sm">{approval.title}</h4>
                  <p className="text-xs text-gray-600 mt-1">{approval.description}</p>
                  <div className="flex items-center justify-between mt-2">
                    <span className="text-xs text-gray-500">por {approval.requestedBy}</span>
                    <Badge className={getPriorityColor(approval.priority)} variant="outline">
                      {approval.priority}
                    </Badge>
                  </div>
                </div>
                <Button size="sm" variant="outline">
                  <Eye className="w-4 h-4" />
                </Button>
              </div>
            ))}
            {pendingApprovals.length > 5 && (
              <Button variant="ghost" className="w-full">
                Ver todas ({pendingApprovals.length - 5} mais)
                <ChevronRight className="w-4 h-4 ml-2" />
              </Button>
            )}
          </CardContent>
        </Card>

        {/* System Alerts */}
        <Card className="lg:col-span-1">
          <CardHeader className="flex flex-row items-center justify-between">
            <CardTitle className="flex items-center space-x-2">
              <Bell className="w-5 h-5 text-red-500" />
              <span>Alertas do Sistema</span>
            </CardTitle>
            <Badge variant="secondary">{alerts.length}</Badge>
          </CardHeader>
          <CardContent className="space-y-4">
            {alerts.slice(0, 5).map((alert) => (
              <div key={alert.id} className="flex items-start space-x-3 p-3 border rounded-lg">
                {getAlertIcon(alert.type)}
                <div className="flex-1">
                  <h4 className="font-medium text-sm">{alert.title}</h4>
                  <p className="text-xs text-gray-600 mt-1">{alert.message}</p>
                  <span className="text-xs text-gray-500">{alert.timestamp}</span>
                </div>
                {alert.action && (
                  <Button size="sm" variant="outline">
                    {alert.action}
                  </Button>
                )}
              </div>
            ))}
          </CardContent>
        </Card>

        {/* Recent Activity */}
        <Card className="lg:col-span-1">
          <CardHeader className="flex flex-row items-center justify-between">
            <CardTitle className="flex items-center space-x-2">
              <Activity className="w-5 h-5 text-blue-500" />
              <span>Atividade Recente</span>
            </CardTitle>
            <Button variant="ghost" size="sm">
              <MoreHorizontal className="w-4 h-4" />
            </Button>
          </CardHeader>
          <CardContent className="space-y-4">
            {recentActivity.slice(0, 6).map((activity) => (
              <div key={activity.id} className="flex items-start space-x-3">
                <div className="w-2 h-2 bg-blue-500 rounded-full mt-2"></div>
                <div className="flex-1">
                  <p className="text-sm">{activity.description}</p>
                  <div className="flex items-center justify-between mt-1">
                    <span className="text-xs text-gray-500">por {activity.user}</span>
                    <span className="text-xs text-gray-500">{activity.timestamp}</span>
                  </div>
                </div>
              </div>
            ))}
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
