'use client';

import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Alert, AlertDescription } from '@/components/ui/alert';
import {
  Activity, Database, Server, Cpu, HardDrive, Wifi,
  AlertTriangle, CheckCircle, Clock, Zap, BarChart3,
  TrendingUp, TrendingDown, RefreshCw, Settings,
  Monitor, Globe, Shield, Lock, Eye, Download
} from 'lucide-react';

interface SystemMetrics {
  cpu: {
    usage: number;
    cores: number;
    temperature: number;
  };
  memory: {
    used: number;
    total: number;
    percentage: number;
  };
  storage: {
    used: number;
    total: number;
    percentage: number;
  };
  network: {
    inbound: number;
    outbound: number;
    latency: number;
  };
  database: {
    connections: number;
    queries: number;
    responseTime: number;
  };
  api: {
    requests: number;
    errors: number;
    responseTime: number;
  };
}

interface ServiceStatus {
  name: string;
  status: 'healthy' | 'warning' | 'critical' | 'offline';
  uptime: string;
  lastCheck: string;
  responseTime: number;
  url?: string;
}

interface SystemAlert {
  id: string;
  type: 'performance' | 'security' | 'error' | 'maintenance';
  severity: 'low' | 'medium' | 'high' | 'critical';
  title: string;
  description: string;
  timestamp: string;
  resolved: boolean;
}

interface SystemMonitoringProps {
  metrics: SystemMetrics;
  services: ServiceStatus[];
  alerts: SystemAlert[];
  onRefresh: () => void;
  isLoading?: boolean;
}

export function SystemMonitoring({
  metrics,
  services,
  alerts,
  onRefresh,
  isLoading = false
}: SystemMonitoringProps) {
  const [selectedTimeRange, setSelectedTimeRange] = useState('1h');
  const [autoRefresh, setAutoRefresh] = useState(true);

  useEffect(() => {
    if (autoRefresh) {
      const interval = setInterval(onRefresh, 30000); // Refresh every 30 seconds
      return () => clearInterval(interval);
    }
  }, [autoRefresh, onRefresh]);

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'healthy': return 'text-green-600 bg-green-100';
      case 'warning': return 'text-yellow-600 bg-yellow-100';
      case 'critical': return 'text-red-600 bg-red-100';
      case 'offline': return 'text-gray-600 bg-gray-100';
      default: return 'text-gray-600 bg-gray-100';
    }
  };

  const getSeverityColor = (severity: string) => {
    switch (severity) {
      case 'low': return 'bg-blue-100 text-blue-800';
      case 'medium': return 'bg-yellow-100 text-yellow-800';
      case 'high': return 'bg-orange-100 text-orange-800';
      case 'critical': return 'bg-red-100 text-red-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  const getUsageColor = (percentage: number) => {
    if (percentage >= 90) return 'bg-red-500';
    if (percentage >= 75) return 'bg-yellow-500';
    if (percentage >= 50) return 'bg-blue-500';
    return 'bg-green-500';
  };

  const formatBytes = (bytes: number) => {
    const sizes = ['B', 'KB', 'MB', 'GB', 'TB'];
    if (bytes === 0) return '0 B';
    const i = Math.floor(Math.log(bytes) / Math.log(1024));
    return Math.round(bytes / Math.pow(1024, i) * 100) / 100 + ' ' + sizes[i];
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col lg:flex-row justify-between items-start lg:items-center gap-4">
        <div>
          <h2 className="text-2xl font-bold text-gray-900">Monitoramento do Sistema</h2>
          <p className="text-gray-600">Status em tempo real da infraestrutura</p>
        </div>
        
        <div className="flex items-center space-x-3">
          <select
            value={selectedTimeRange}
            onChange={(e) => setSelectedTimeRange(e.target.value)}
            className="px-3 py-2 border rounded-md text-sm"
          >
            <option value="5m">Últimos 5 min</option>
            <option value="1h">Última hora</option>
            <option value="24h">Últimas 24h</option>
            <option value="7d">Últimos 7 dias</option>
          </select>
          
          <Button
            variant="outline"
            onClick={() => setAutoRefresh(!autoRefresh)}
            className={autoRefresh ? 'bg-green-50 border-green-200' : ''}
          >
            <Activity className={`w-4 h-4 mr-2 ${autoRefresh ? 'text-green-600' : ''}`} />
            Auto-refresh
          </Button>
          
          <Button onClick={onRefresh} disabled={isLoading} variant="outline">
            <RefreshCw className={`w-4 h-4 mr-2 ${isLoading ? 'animate-spin' : ''}`} />
            Atualizar
          </Button>
        </div>
      </div>

      {/* System Overview */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        {/* CPU Usage */}
        <Card>
          <CardContent className="p-6">
            <div className="flex items-center justify-between mb-4">
              <div className="flex items-center space-x-2">
                <Cpu className="w-5 h-5 text-blue-600" />
                <span className="font-medium">CPU</span>
              </div>
              <Badge className={getStatusColor(metrics.cpu.usage > 80 ? 'critical' : 'healthy')}>
                {metrics.cpu.usage}%
              </Badge>
            </div>
            <div className="space-y-2">
              <div className="w-full bg-gray-200 rounded-full h-2">
                <div 
                  className={`h-2 rounded-full ${getUsageColor(metrics.cpu.usage)}`}
                  style={{ width: `${metrics.cpu.usage}%` }}
                ></div>
              </div>
              <div className="flex justify-between text-sm text-gray-600">
                <span>{metrics.cpu.cores} cores</span>
                <span>{metrics.cpu.temperature}°C</span>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Memory Usage */}
        <Card>
          <CardContent className="p-6">
            <div className="flex items-center justify-between mb-4">
              <div className="flex items-center space-x-2">
                <Database className="w-5 h-5 text-green-600" />
                <span className="font-medium">Memória</span>
              </div>
              <Badge className={getStatusColor(metrics.memory.percentage > 80 ? 'critical' : 'healthy')}>
                {metrics.memory.percentage}%
              </Badge>
            </div>
            <div className="space-y-2">
              <div className="w-full bg-gray-200 rounded-full h-2">
                <div 
                  className={`h-2 rounded-full ${getUsageColor(metrics.memory.percentage)}`}
                  style={{ width: `${metrics.memory.percentage}%` }}
                ></div>
              </div>
              <div className="flex justify-between text-sm text-gray-600">
                <span>{formatBytes(metrics.memory.used)}</span>
                <span>{formatBytes(metrics.memory.total)}</span>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Storage Usage */}
        <Card>
          <CardContent className="p-6">
            <div className="flex items-center justify-between mb-4">
              <div className="flex items-center space-x-2">
                <HardDrive className="w-5 h-5 text-purple-600" />
                <span className="font-medium">Armazenamento</span>
              </div>
              <Badge className={getStatusColor(metrics.storage.percentage > 80 ? 'critical' : 'healthy')}>
                {metrics.storage.percentage}%
              </Badge>
            </div>
            <div className="space-y-2">
              <div className="w-full bg-gray-200 rounded-full h-2">
                <div 
                  className={`h-2 rounded-full ${getUsageColor(metrics.storage.percentage)}`}
                  style={{ width: `${metrics.storage.percentage}%` }}
                ></div>
              </div>
              <div className="flex justify-between text-sm text-gray-600">
                <span>{formatBytes(metrics.storage.used)}</span>
                <span>{formatBytes(metrics.storage.total)}</span>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Network */}
        <Card>
          <CardContent className="p-6">
            <div className="flex items-center justify-between mb-4">
              <div className="flex items-center space-x-2">
                <Wifi className="w-5 h-5 text-orange-600" />
                <span className="font-medium">Rede</span>
              </div>
              <Badge className={getStatusColor(metrics.network.latency > 100 ? 'warning' : 'healthy')}>
                {metrics.network.latency}ms
              </Badge>
            </div>
            <div className="space-y-2">
              <div className="flex justify-between text-sm">
                <span className="text-gray-600">↓ {formatBytes(metrics.network.inbound)}/s</span>
                <span className="text-gray-600">↑ {formatBytes(metrics.network.outbound)}/s</span>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Services Status */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center space-x-2">
            <Server className="w-5 h-5" />
            <span>Status dos Serviços</span>
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {services.map((service) => (
              <div key={service.name} className="p-4 border rounded-lg">
                <div className="flex items-center justify-between mb-2">
                  <h3 className="font-medium">{service.name}</h3>
                  <div className="flex items-center space-x-1">
                    {service.status === 'healthy' ? 
                      <CheckCircle className="w-4 h-4 text-green-500" /> :
                      <AlertTriangle className="w-4 h-4 text-red-500" />
                    }
                    <Badge className={getStatusColor(service.status)} variant="outline">
                      {service.status}
                    </Badge>
                  </div>
                </div>
                <div className="space-y-1 text-sm text-gray-600">
                  <div className="flex justify-between">
                    <span>Uptime:</span>
                    <span>{service.uptime}</span>
                  </div>
                  <div className="flex justify-between">
                    <span>Resposta:</span>
                    <span>{service.responseTime}ms</span>
                  </div>
                  <div className="flex justify-between">
                    <span>Última verificação:</span>
                    <span>{service.lastCheck}</span>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>

      {/* Performance Metrics */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Database Performance */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center space-x-2">
              <Database className="w-5 h-5" />
              <span>Performance do Banco</span>
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
              <span className="font-medium">Conexões Ativas</span>
              <Badge variant="outline">{metrics.database.connections}</Badge>
            </div>
            <div className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
              <span className="font-medium">Queries/min</span>
              <Badge variant="outline">{metrics.database.queries}</Badge>
            </div>
            <div className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
              <span className="font-medium">Tempo de Resposta</span>
              <Badge variant="outline">{metrics.database.responseTime}ms</Badge>
            </div>
          </CardContent>
        </Card>

        {/* API Performance */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center space-x-2">
              <Globe className="w-5 h-5" />
              <span>Performance da API</span>
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
              <span className="font-medium">Requisições/min</span>
              <Badge variant="outline">{metrics.api.requests}</Badge>
            </div>
            <div className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
              <span className="font-medium">Taxa de Erro</span>
              <Badge variant="outline" className={metrics.api.errors > 5 ? 'bg-red-100 text-red-800' : ''}>
                {metrics.api.errors}%
              </Badge>
            </div>
            <div className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
              <span className="font-medium">Tempo de Resposta</span>
              <Badge variant="outline">{metrics.api.responseTime}ms</Badge>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* System Alerts */}
      <Card>
        <CardHeader className="flex flex-row items-center justify-between">
          <CardTitle className="flex items-center space-x-2">
            <AlertTriangle className="w-5 h-5" />
            <span>Alertas do Sistema</span>
          </CardTitle>
          <Badge variant="secondary">{alerts.filter(a => !a.resolved).length} ativos</Badge>
        </CardHeader>
        <CardContent>
          <div className="space-y-3">
            {alerts.slice(0, 5).map((alert) => (
              <div key={alert.id} className={`p-4 border rounded-lg ${alert.resolved ? 'opacity-50' : ''}`}>
                <div className="flex items-start justify-between">
                  <div className="flex-1">
                    <div className="flex items-center space-x-2 mb-2">
                      <Badge className={getSeverityColor(alert.severity)} variant="outline">
                        {alert.severity}
                      </Badge>
                      <span className="text-sm text-gray-500">{alert.type}</span>
                      {alert.resolved && (
                        <CheckCircle className="w-4 h-4 text-green-500" />
                      )}
                    </div>
                    <h3 className="font-medium mb-1">{alert.title}</h3>
                    <p className="text-sm text-gray-600 mb-2">{alert.description}</p>
                    <span className="text-xs text-gray-500">{alert.timestamp}</span>
                  </div>
                  <Button size="sm" variant="ghost">
                    <Eye className="w-4 h-4" />
                  </Button>
                </div>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
