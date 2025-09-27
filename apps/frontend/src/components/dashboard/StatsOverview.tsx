'use client';

import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import {
  TrendingUp,
  TrendingDown,
  ArrowUp,
  ArrowDown,
  Minus,
  BarChart3,
  PieChart,
  Activity,
  Calendar,
  Clock,
  Users,
  PawPrint,
  Heart,
  Building,
  FileText,
  CheckCircle,
  AlertTriangle,
  Zap,
  Target,
  Award,
  Star
} from 'lucide-react';

interface StatItem {
  id: string;
  label: string;
  value: number | string;
  previousValue?: number;
  change?: number;
  changeType?: 'increase' | 'decrease' | 'neutral';
  icon: any;
  color: string;
  format?: 'number' | 'percentage' | 'currency' | 'time';
  description?: string;
  target?: number;
  priority?: 'high' | 'medium' | 'low';
}

interface StatsOverviewProps {
  userRole: 'ADMIN' | 'FUNCIONARIO' | 'VETERINARIO' | 'CIDADAO';
  timeRange?: '24h' | '7d' | '30d' | '90d' | '1y';
  showComparison?: boolean;
  compact?: boolean;
}

export function StatsOverview({ 
  userRole, 
  timeRange = '30d', 
  showComparison = true, 
  compact = false 
}: StatsOverviewProps) {
  const [stats, setStats] = useState<StatItem[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [selectedTimeRange, setSelectedTimeRange] = useState(timeRange);

  useEffect(() => {
    loadStats();
  }, [userRole, selectedTimeRange]);

  const loadStats = async () => {
    try {
      setIsLoading(true);
      
      // Generate role-specific stats
      const roleStats = generateStatsForRole(userRole);
      setStats(roleStats);
      
    } catch (error) {
      console.error('Error loading stats:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const generateStatsForRole = (role: string): StatItem[] => {
    const baseStats: StatItem[] = [];

    switch (role) {
      case 'ADMIN':
        return [
          {
            id: 'total-users',
            label: 'Total de Usuários',
            value: 1247,
            previousValue: 1156,
            change: 7.9,
            changeType: 'increase',
            icon: Users,
            color: 'blue',
            format: 'number',
            description: 'Usuários ativos na plataforma',
            target: 1500
          },
          {
            id: 'total-animals',
            label: 'Animais Cadastrados',
            value: 892,
            previousValue: 834,
            change: 7.0,
            changeType: 'increase',
            icon: PawPrint,
            color: 'green',
            format: 'number',
            description: 'Animais disponíveis para adoção'
          },
          {
            id: 'adoptions-month',
            label: 'Adoções este Mês',
            value: 45,
            previousValue: 38,
            change: 18.4,
            changeType: 'increase',
            icon: Heart,
            color: 'pink',
            format: 'number',
            description: 'Adoções finalizadas',
            priority: 'high'
          },
          {
            id: 'pending-approvals',
            label: 'Aprovações Pendentes',
            value: 23,
            previousValue: 31,
            change: -25.8,
            changeType: 'decrease',
            icon: Clock,
            color: 'yellow',
            format: 'number',
            description: 'Itens aguardando aprovação',
            priority: 'high'
          },
          {
            id: 'system-health',
            label: 'Saúde do Sistema',
            value: '98.5%',
            previousValue: 97.2,
            change: 1.3,
            changeType: 'increase',
            icon: Activity,
            color: 'green',
            format: 'percentage',
            description: 'Uptime e performance'
          },
          {
            id: 'ai-interactions',
            label: 'Interações IA',
            value: 5420,
            previousValue: 4890,
            change: 10.8,
            changeType: 'increase',
            icon: Zap,
            color: 'purple',
            format: 'number',
            description: 'Conversas com agentes IA'
          },
          {
            id: 'municipalities',
            label: 'Municípios Ativos',
            value: 15,
            previousValue: 14,
            change: 7.1,
            changeType: 'increase',
            icon: Building,
            color: 'indigo',
            format: 'number',
            description: 'Municípios participantes'
          },
          {
            id: 'procedures',
            label: 'Procedimentos',
            value: 234,
            previousValue: 198,
            change: 18.2,
            changeType: 'increase',
            icon: FileText,
            color: 'teal',
            format: 'number',
            description: 'Procedimentos realizados'
          }
        ];

      case 'FUNCIONARIO':
        return [
          {
            id: 'my-animals',
            label: 'Meus Animais',
            value: 34,
            previousValue: 31,
            change: 9.7,
            changeType: 'increase',
            icon: PawPrint,
            color: 'blue',
            format: 'number',
            description: 'Animais sob sua responsabilidade'
          },
          {
            id: 'adoptions-progress',
            label: 'Adoções em Andamento',
            value: 12,
            previousValue: 15,
            change: -20.0,
            changeType: 'decrease',
            icon: Heart,
            color: 'pink',
            format: 'number',
            description: 'Processos de adoção ativos'
          },
          {
            id: 'pending-tasks',
            label: 'Tarefas Pendentes',
            value: 8,
            previousValue: 12,
            change: -33.3,
            changeType: 'decrease',
            icon: Clock,
            color: 'yellow',
            format: 'number',
            description: 'Itens aguardando sua ação',
            priority: 'high'
          },
          {
            id: 'completed-today',
            label: 'Concluídas Hoje',
            value: 6,
            previousValue: 4,
            change: 50.0,
            changeType: 'increase',
            icon: CheckCircle,
            color: 'green',
            format: 'number',
            description: 'Tarefas finalizadas hoje'
          }
        ];

      case 'VETERINARIO':
        return [
          {
            id: 'appointments-today',
            label: 'Consultas Hoje',
            value: 8,
            previousValue: 6,
            change: 33.3,
            changeType: 'increase',
            icon: Calendar,
            color: 'blue',
            format: 'number',
            description: 'Consultas agendadas para hoje'
          },
          {
            id: 'patients',
            label: 'Pacientes Ativos',
            value: 45,
            previousValue: 42,
            change: 7.1,
            changeType: 'increase',
            icon: PawPrint,
            color: 'green',
            format: 'number',
            description: 'Animais sob seus cuidados'
          },
          {
            id: 'procedures-month',
            label: 'Procedimentos este Mês',
            value: 23,
            previousValue: 19,
            change: 21.1,
            changeType: 'increase',
            icon: FileText,
            color: 'purple',
            format: 'number',
            description: 'Procedimentos realizados'
          },
          {
            id: 'urgent-cases',
            label: 'Casos Urgentes',
            value: 2,
            previousValue: 4,
            change: -50.0,
            changeType: 'decrease',
            icon: AlertTriangle,
            color: 'red',
            format: 'number',
            description: 'Casos que requerem atenção imediata',
            priority: 'high'
          }
        ];

      case 'CIDADAO':
        return [
          {
            id: 'favorites',
            label: 'Animais Favoritos',
            value: 5,
            previousValue: 3,
            change: 66.7,
            changeType: 'increase',
            icon: Star,
            color: 'yellow',
            format: 'number',
            description: 'Animais que você favoritou'
          },
          {
            id: 'adoption-progress',
            label: 'Processos Ativos',
            value: 1,
            previousValue: 0,
            change: 100,
            changeType: 'increase',
            icon: Heart,
            color: 'pink',
            format: 'number',
            description: 'Seus processos de adoção'
          },
          {
            id: 'profile-completion',
            label: 'Perfil Completo',
            value: '85%',
            previousValue: 70,
            change: 21.4,
            changeType: 'increase',
            icon: Users,
            color: 'blue',
            format: 'percentage',
            description: 'Completude do seu perfil'
          },
          {
            id: 'compatibility-score',
            label: 'Score de Compatibilidade',
            value: '92%',
            previousValue: 88,
            change: 4.5,
            changeType: 'increase',
            icon: Target,
            color: 'green',
            format: 'percentage',
            description: 'Sua compatibilidade média'
          }
        ];

      default:
        return [];
    }
  };

  const formatValue = (value: number | string, format?: string) => {
    if (typeof value === 'string') return value;
    
    switch (format) {
      case 'percentage':
        return `${value}%`;
      case 'currency':
        return new Intl.NumberFormat('pt-BR', { 
          style: 'currency', 
          currency: 'BRL' 
        }).format(value);
      case 'time':
        return `${value}h`;
      default:
        return value.toLocaleString('pt-BR');
    }
  };

  const getChangeIcon = (changeType?: string) => {
    switch (changeType) {
      case 'increase':
        return <ArrowUp className="w-4 h-4 text-green-600" />;
      case 'decrease':
        return <ArrowDown className="w-4 h-4 text-red-600" />;
      default:
        return <Minus className="w-4 h-4 text-gray-400" />;
    }
  };

  const getChangeColor = (changeType?: string) => {
    switch (changeType) {
      case 'increase':
        return 'text-green-600';
      case 'decrease':
        return 'text-red-600';
      default:
        return 'text-gray-500';
    }
  };

  if (isLoading) {
    return (
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        {[...Array(4)].map((_, i) => (
          <Card key={i} className="animate-pulse">
            <CardContent className="p-6">
              <div className="h-4 bg-gray-200 rounded mb-2"></div>
              <div className="h-8 bg-gray-200 rounded mb-2"></div>
              <div className="h-3 bg-gray-200 rounded"></div>
            </CardContent>
          </Card>
        ))}
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Time Range Selector */}
      {!compact && (
        <div className="flex items-center justify-between">
          <h3 className="text-lg font-semibold text-gray-900">Estatísticas</h3>
          <div className="flex items-center space-x-2">
            {['24h', '7d', '30d', '90d', '1y'].map((range) => (
              <Button
                key={range}
                variant={selectedTimeRange === range ? 'default' : 'outline'}
                size="sm"
                onClick={() => setSelectedTimeRange(range as any)}
              >
                {range}
              </Button>
            ))}
          </div>
        </div>
      )}

      {/* Stats Grid */}
      <div className={`grid grid-cols-1 ${compact ? 'md:grid-cols-2' : 'md:grid-cols-2 lg:grid-cols-4'} gap-6`}>
        {stats.map((stat) => (
          <Card key={stat.id} className="hover:shadow-lg transition-shadow">
            <CardContent className="p-6">
              <div className="flex items-center justify-between mb-4">
                <div className={`w-12 h-12 bg-${stat.color}-100 rounded-full flex items-center justify-center`}>
                  <stat.icon className={`w-6 h-6 text-${stat.color}-600`} />
                </div>
                {stat.priority === 'high' && (
                  <Badge variant="outline" className="text-red-600 border-red-200">
                    Urgente
                  </Badge>
                )}
              </div>

              <div className="space-y-2">
                <p className="text-sm font-medium text-gray-600">{stat.label}</p>
                <p className="text-3xl font-bold text-gray-900">
                  {formatValue(stat.value, stat.format)}
                </p>

                {showComparison && stat.change !== undefined && (
                  <div className="flex items-center space-x-2">
                    {getChangeIcon(stat.changeType)}
                    <span className={`text-sm font-medium ${getChangeColor(stat.changeType)}`}>
                      {Math.abs(stat.change)}%
                    </span>
                    <span className="text-sm text-gray-500">vs período anterior</span>
                  </div>
                )}

                {stat.description && (
                  <p className="text-xs text-gray-500">{stat.description}</p>
                )}

                {stat.target && (
                  <div className="mt-3">
                    <div className="flex items-center justify-between text-xs text-gray-500 mb-1">
                      <span>Meta</span>
                      <span>{formatValue(stat.target, stat.format)}</span>
                    </div>
                    <div className="w-full bg-gray-200 rounded-full h-2">
                      <div 
                        className={`bg-${stat.color}-600 h-2 rounded-full transition-all duration-500`}
                        style={{ 
                          width: `${Math.min(100, (Number(stat.value) / stat.target) * 100)}%` 
                        }}
                      ></div>
                    </div>
                  </div>
                )}
              </div>
            </CardContent>
          </Card>
        ))}
      </div>
    </div>
  );
}
