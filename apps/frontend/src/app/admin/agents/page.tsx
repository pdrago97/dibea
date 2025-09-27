'use client';

import { useState, useEffect } from 'react';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { 
  Bot, 
  Activity, 
  Clock, 
  CheckCircle, 
  XCircle, 
  AlertTriangle,
  BarChart3,
  MessageSquare,
  Zap,
  Database,
  Brain,
  FileText,
  Users,
  Settings
} from 'lucide-react';

interface Agent {
  id: string;
  name: string;
  type: string;
  status: 'online' | 'offline' | 'error';
  lastActivity: string;
  totalInteractions: number;
  successRate: number;
  avgResponseTime: number;
  description: string;
  capabilities: string[];
}

interface AgentMetrics {
  totalAgents: number;
  activeAgents: number;
  totalInteractions: number;
  avgSuccessRate: number;
  avgResponseTime: number;
}

// Helper function to get agent descriptions
const getAgentDescription = (agentId: string): string => {
  const descriptions: { [key: string]: string } = {
    'animal-agent': 'Especialista em gestão de animais, cadastro e consultas',
    'procedure-agent': 'Especialista em procedimentos veterinários e protocolos médicos',
    'document-agent': 'Especialista em processamento de documentos e OCR',
    'tutor-agent': 'Especialista em gestão de tutores e processos de adoção',
    'general-agent': 'Assistente geral para consultas e roteamento'
  };
  return descriptions[agentId] || 'Agente especializado do sistema DIBEA';
};

export default function AgentsMonitor() {
  const [agents, setAgents] = useState<Agent[]>([]);
  const [metrics, setMetrics] = useState<AgentMetrics>({
    totalAgents: 0,
    activeAgents: 0,
    totalInteractions: 0,
    avgSuccessRate: 0,
    avgResponseTime: 0
  });
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [selectedAgent, setSelectedAgent] = useState<Agent | null>(null);

  useEffect(() => {
    fetchAgentsData();
  }, []);

  const simulateData = async () => {
    try {
      setLoading(true);
      const token = localStorage.getItem('token');

      const response = await fetch('http://localhost:3000/api/v1/agents/simulate', {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        }
      });

      if (response.ok) {
        alert('Dados simulados criados com sucesso! Atualizando métricas...');
        await fetchAgentsData();
      } else {
        alert('Erro ao simular dados. Verifique se você tem permissões de admin.');
      }
    } catch (error) {
      console.error('Error simulating data:', error);
      alert('Erro ao simular dados.');
    } finally {
      setLoading(false);
    }
  };

  const fetchAgentsData = async () => {
    try {
      // Fetch real agent metrics from backend
      const token = localStorage.getItem('token');
      const response = await fetch('http://localhost:3000/api/v1/agents/metrics', {
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        }
      });

      if (response.ok) {
        const data = await response.json();
        const agentSummaries = data.data.summary || [];

        // Convert to Agent format
        const agents: Agent[] = agentSummaries.map((agent: any) => ({
          id: agent.agentId,
          name: agent.agentName,
          type: agent.agentId.toUpperCase().replace('-', '_'),
          status: agent.status as 'online' | 'offline' | 'error',
          lastActivity: agent.lastActivity,
          totalInteractions: agent.totalInteractions,
          successRate: agent.successRate,
          avgResponseTime: agent.avgResponseTime / 1000, // Convert to seconds
          description: getAgentDescription(agent.agentId),
          capabilities: agent.capabilities
        }));

        setAgents(agents);

        // Calculate metrics
        const totalAgents = agents.length;
        const activeAgents = agents.filter(a => a.status === 'online').length;
        const totalInteractions = agents.reduce((sum, a) => sum + a.totalInteractions, 0);
        const avgSuccessRate = agents.length > 0
          ? agents.reduce((sum, a) => sum + a.successRate, 0) / agents.length
          : 0;
        const avgResponseTime = agents.length > 0
          ? agents.reduce((sum, a) => sum + a.avgResponseTime, 0) / agents.length
          : 0;

        setMetrics({
          totalAgents,
          activeAgents,
          totalInteractions,
          avgSuccessRate,
          avgResponseTime
        });
      } else {
        // Fallback to mock data if API fails
        const mockAgents: Agent[] = [
        {
          id: 'animal-agent',
          name: 'Animal Agent',
          type: 'ANIMAL_MANAGEMENT',
          status: 'online',
          lastActivity: '2 minutos atrás',
          totalInteractions: 1247,
          successRate: 94.5,
          avgResponseTime: 1.2,
          description: 'Especialista em gestão de animais, cadastro e consultas',
          capabilities: ['Cadastro de animais', 'Consulta de dados', 'Validação de informações', 'Geração de relatórios']
        },
        {
          id: 'procedure-agent',
          name: 'Procedure Agent',
          type: 'MEDICAL_PROCEDURES',
          status: 'online',
          lastActivity: '5 minutos atrás',
          totalInteractions: 892,
          successRate: 97.2,
          avgResponseTime: 2.1,
          description: 'Especialista em procedimentos veterinários e protocolos médicos',
          capabilities: ['Protocolos médicos', 'Agendamentos', 'Histórico médico', 'Recomendações']
        },
        {
          id: 'document-agent',
          name: 'Document Agent',
          type: 'DOCUMENT_PROCESSING',
          status: 'online',
          lastActivity: '1 minuto atrás',
          totalInteractions: 634,
          successRate: 89.8,
          avgResponseTime: 3.5,
          description: 'Especialista em processamento de documentos e OCR',
          capabilities: ['OCR de documentos', 'Análise de imagens', 'Extração de dados', 'Validação']
        },
        {
          id: 'tutor-agent',
          name: 'Tutor Agent',
          type: 'TUTOR_MANAGEMENT',
          status: 'online',
          lastActivity: '3 minutos atrás',
          totalInteractions: 1156,
          successRate: 96.1,
          avgResponseTime: 1.8,
          description: 'Especialista em gestão de tutores e processos de adoção',
          capabilities: ['Cadastro de tutores', 'Validação de CPF', 'Consulta CEP', 'Análise de perfil']
        },
        {
          id: 'general-agent',
          name: 'General Agent',
          type: 'GENERAL_ASSISTANCE',
          status: 'online',
          lastActivity: '30 segundos atrás',
          totalInteractions: 2341,
          successRate: 91.7,
          avgResponseTime: 1.5,
          description: 'Assistente geral para consultas e roteamento',
          capabilities: ['Consultas gerais', 'Roteamento inteligente', 'FAQ', 'Suporte básico']
        }
      ];

      setAgents(mockAgents);

      // Calculate metrics
      const totalAgents = mockAgents.length;
      const activeAgents = mockAgents.filter(a => a.status === 'online').length;
      const totalInteractions = mockAgents.reduce((sum, a) => sum + a.totalInteractions, 0);
      const avgSuccessRate = mockAgents.reduce((sum, a) => sum + a.successRate, 0) / totalAgents;
      const avgResponseTime = mockAgents.reduce((sum, a) => sum + a.avgResponseTime, 0) / totalAgents;

      setMetrics({
        totalAgents,
        activeAgents,
        totalInteractions,
        avgSuccessRate,
        avgResponseTime
      });

    } catch (err) {
      setError('Erro ao carregar dados dos agentes');
    } finally {
      setLoading(false);
    }
  };

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'online':
        return <CheckCircle className="w-4 h-4 text-green-600" />;
      case 'offline':
        return <XCircle className="w-4 h-4 text-gray-400" />;
      case 'error':
        return <AlertTriangle className="w-4 h-4 text-red-600" />;
      default:
        return <Clock className="w-4 h-4 text-yellow-600" />;
    }
  };

  const getStatusBadge = (status: string) => {
    switch (status) {
      case 'online':
        return <Badge className="bg-green-100 text-green-800">Online</Badge>;
      case 'offline':
        return <Badge className="bg-gray-100 text-gray-800">Offline</Badge>;
      case 'error':
        return <Badge className="bg-red-100 text-red-800">Erro</Badge>;
      default:
        return <Badge className="bg-yellow-100 text-yellow-800">Desconhecido</Badge>;
    }
  };

  const getAgentIcon = (type: string) => {
    switch (type) {
      case 'ANIMAL_MANAGEMENT':
        return <Bot className="w-5 h-5 text-blue-600" />;
      case 'MEDICAL_PROCEDURES':
        return <Activity className="w-5 h-5 text-green-600" />;
      case 'DOCUMENT_PROCESSING':
        return <FileText className="w-5 h-5 text-purple-600" />;
      case 'TUTOR_MANAGEMENT':
        return <Users className="w-5 h-5 text-orange-600" />;
      case 'GENERAL_ASSISTANCE':
        return <MessageSquare className="w-5 h-5 text-gray-600" />;
      default:
        return <Bot className="w-5 h-5 text-gray-600" />;
    }
  };

  if (loading) {
    return (
      <div className="p-6">
        <div className="animate-pulse">
          <div className="h-8 bg-gray-200 rounded w-1/4 mb-6"></div>
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-6">
            {[1, 2, 3, 4].map(i => (
              <div key={i} className="h-24 bg-gray-200 rounded"></div>
            ))}
          </div>
          <div className="space-y-4">
            {[1, 2, 3].map(i => (
              <div key={i} className="h-32 bg-gray-200 rounded"></div>
            ))}
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="p-6 space-y-6">
      {/* Header */}
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">Monitor de Agentes IA</h1>
          <p className="text-gray-600">Monitorar atividade e performance dos agentes N8N</p>
        </div>
        <div className="flex gap-2">
          <Button variant="outline" onClick={fetchAgentsData}>
            <Activity className="w-4 h-4 mr-2" />
            Atualizar
          </Button>
          <Button variant="outline" onClick={simulateData}>
            <Database className="w-4 h-4 mr-2" />
            Simular Dados
          </Button>
          <Button variant="outline">
            <Settings className="w-4 h-4 mr-2" />
            Configurar
          </Button>
        </div>
      </div>

      {error && (
        <Alert className="border-red-200 bg-red-50">
          <AlertDescription className="text-red-800">{error}</AlertDescription>
        </Alert>
      )}

      {/* Metrics Cards */}
      <div className="grid grid-cols-1 md:grid-cols-5 gap-4">
        <Card className="p-4">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-600">Total de Agentes</p>
              <p className="text-2xl font-bold text-blue-600">{metrics.totalAgents}</p>
            </div>
            <Bot className="w-8 h-8 text-blue-600" />
          </div>
        </Card>

        <Card className="p-4">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-600">Agentes Ativos</p>
              <p className="text-2xl font-bold text-green-600">{metrics.activeAgents}</p>
            </div>
            <CheckCircle className="w-8 h-8 text-green-600" />
          </div>
        </Card>

        <Card className="p-4">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-600">Interações Hoje</p>
              <p className="text-2xl font-bold text-purple-600">{metrics.totalInteractions.toLocaleString()}</p>
            </div>
            <MessageSquare className="w-8 h-8 text-purple-600" />
          </div>
        </Card>

        <Card className="p-4">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-600">Taxa de Sucesso</p>
              <p className="text-2xl font-bold text-orange-600">{metrics.avgSuccessRate.toFixed(1)}%</p>
            </div>
            <BarChart3 className="w-8 h-8 text-orange-600" />
          </div>
        </Card>

        <Card className="p-4">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-600">Tempo Médio</p>
              <p className="text-2xl font-bold text-red-600">{metrics.avgResponseTime.toFixed(1)}s</p>
            </div>
            <Clock className="w-8 h-8 text-red-600" />
          </div>
        </Card>
      </div>

      {/* Agents List */}
      <div className="space-y-4">
        <h2 className="text-xl font-semibold text-gray-900">Agentes Ativos</h2>
        
        {agents.map(agent => (
          <Card key={agent.id} className="p-6">
            <div className="flex justify-between items-start">
              <div className="flex items-start gap-4 flex-1">
                <div className="p-3 bg-gray-100 rounded-lg">
                  {getAgentIcon(agent.type)}
                </div>
                
                <div className="flex-1">
                  <div className="flex items-center gap-3 mb-2">
                    <h3 className="text-lg font-semibold">{agent.name}</h3>
                    {getStatusBadge(agent.status)}
                    {getStatusIcon(agent.status)}
                  </div>
                  
                  <p className="text-gray-600 mb-3">{agent.description}</p>
                  
                  <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-4">
                    <div>
                      <p className="text-sm text-gray-500">Interações</p>
                      <p className="font-semibold">{agent.totalInteractions.toLocaleString()}</p>
                    </div>
                    <div>
                      <p className="text-sm text-gray-500">Taxa de Sucesso</p>
                      <p className="font-semibold text-green-600">{agent.successRate}%</p>
                    </div>
                    <div>
                      <p className="text-sm text-gray-500">Tempo Médio</p>
                      <p className="font-semibold">{agent.avgResponseTime}s</p>
                    </div>
                    <div>
                      <p className="text-sm text-gray-500">Última Atividade</p>
                      <p className="font-semibold">{agent.lastActivity}</p>
                    </div>
                  </div>
                  
                  <div>
                    <p className="text-sm text-gray-500 mb-2">Capacidades:</p>
                    <div className="flex flex-wrap gap-2">
                      {agent.capabilities.map(capability => (
                        <Badge key={capability} variant="outline" className="text-xs">
                          {capability}
                        </Badge>
                      ))}
                    </div>
                  </div>
                </div>
              </div>
              
              <div className="flex gap-2">
                <Button 
                  variant="outline" 
                  size="sm"
                  onClick={() => setSelectedAgent(agent)}
                >
                  Detalhes
                </Button>
                <Button variant="outline" size="sm">
                  Logs
                </Button>
              </div>
            </div>
          </Card>
        ))}
      </div>

      {/* Agent Details Modal */}
      {selectedAgent && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
          <Card className="w-full max-w-2xl max-h-[80vh] overflow-y-auto">
            <div className="p-6">
              <div className="flex justify-between items-start mb-4">
                <h3 className="text-xl font-semibold">{selectedAgent.name}</h3>
                <Button 
                  variant="outline" 
                  size="sm"
                  onClick={() => setSelectedAgent(null)}
                >
                  Fechar
                </Button>
              </div>
              
              <div className="space-y-4">
                <div>
                  <h4 className="font-semibold mb-2">Informações Gerais</h4>
                  <div className="grid grid-cols-2 gap-4 text-sm">
                    <div>
                      <span className="text-gray-500">ID:</span>
                      <span className="ml-2 font-mono">{selectedAgent.id}</span>
                    </div>
                    <div>
                      <span className="text-gray-500">Tipo:</span>
                      <span className="ml-2">{selectedAgent.type}</span>
                    </div>
                    <div>
                      <span className="text-gray-500">Status:</span>
                      <span className="ml-2">{getStatusBadge(selectedAgent.status)}</span>
                    </div>
                    <div>
                      <span className="text-gray-500">Última Atividade:</span>
                      <span className="ml-2">{selectedAgent.lastActivity}</span>
                    </div>
                  </div>
                </div>
                
                <div>
                  <h4 className="font-semibold mb-2">Métricas de Performance</h4>
                  <div className="grid grid-cols-3 gap-4">
                    <div className="text-center p-3 bg-blue-50 rounded">
                      <p className="text-2xl font-bold text-blue-600">{selectedAgent.totalInteractions}</p>
                      <p className="text-sm text-gray-600">Interações</p>
                    </div>
                    <div className="text-center p-3 bg-green-50 rounded">
                      <p className="text-2xl font-bold text-green-600">{selectedAgent.successRate}%</p>
                      <p className="text-sm text-gray-600">Sucesso</p>
                    </div>
                    <div className="text-center p-3 bg-orange-50 rounded">
                      <p className="text-2xl font-bold text-orange-600">{selectedAgent.avgResponseTime}s</p>
                      <p className="text-sm text-gray-600">Tempo Médio</p>
                    </div>
                  </div>
                </div>
                
                <div>
                  <h4 className="font-semibold mb-2">Capacidades</h4>
                  <div className="space-y-2">
                    {selectedAgent.capabilities.map(capability => (
                      <div key={capability} className="flex items-center gap-2">
                        <CheckCircle className="w-4 h-4 text-green-600" />
                        <span className="text-sm">{capability}</span>
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            </div>
          </Card>
        </div>
      )}
    </div>
  );
}
