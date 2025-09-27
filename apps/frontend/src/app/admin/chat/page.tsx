'use client';

import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Alert, AlertDescription } from '@/components/ui/alert';
import {
  MessageSquare, Bot, Zap, Settings, TestTube,
  CheckCircle, AlertCircle, Activity, BarChart3
} from 'lucide-react';
import { ChatInterface } from '@/components/chat/ChatInterface';

export default function AdminChatPage() {
  const [selectedAgent, setSelectedAgent] = useState<string>('main');

  const agents = [
    {
      id: 'main',
      name: 'Roteador Principal',
      description: 'Identifica automaticamente o agente correto',
      endpoint: 'https://n8n-moveup-u53084.vm.elestio.app/webhook/dibea-agent',
      status: 'active',
      icon: <Bot className="w-5 h-5" />
    },
    {
      id: 'rag',
      name: 'RAG Chatbot',
      description: 'Chat com base de conhecimento',
      endpoint: 'https://n8n-moveup-u53084.vm.elestio.app/webhook/9ba11544-5c4e-4f91-818a-08a4ecb596c5',
      status: 'auth_required',
      icon: <MessageSquare className="w-5 h-5" />
    },
    {
      id: 'animal',
      name: 'Agente Animal',
      description: 'Especializado em gestão de animais',
      endpoint: '/api/agents/animal',
      status: 'inactive',
      icon: <Activity className="w-5 h-5" />
    },
    {
      id: 'procedure',
      name: 'Agente Procedimentos',
      description: 'Procedimentos veterinários',
      endpoint: '/api/agents/procedure',
      status: 'inactive',
      icon: <Zap className="w-5 h-5" />
    }
  ];

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'active': return 'bg-green-100 text-green-800';
      case 'inactive': return 'bg-gray-100 text-gray-800';
      case 'auth_required': return 'bg-yellow-100 text-yellow-800';
      case 'error': return 'bg-red-100 text-red-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  const getStatusText = (status: string) => {
    switch (status) {
      case 'active': return 'Ativo';
      case 'inactive': return 'Inativo';
      case 'auth_required': return 'Requer Auth';
      case 'error': return 'Erro';
      default: return 'Desconhecido';
    }
  };

  const selectedAgentData = agents.find(agent => agent.id === selectedAgent);

  const testMessages = [
    "Quero cadastrar um novo cão chamado Rex",
    "Preciso vacinar meu gato Luna",
    "Como fazer upload de um exame veterinário?",
    "João Silva quer adotar um animal",
    "Quantos animais foram adotados este mês?",
    "Olá, como você funciona?",
    "Quais são os procedimentos disponíveis?"
  ];

  return (
    <div className="p-6 space-y-6">
      {/* Header */}
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">Chat DIBEA - Teste de Agentes</h1>
          <p className="text-gray-600">
            Teste e valide as integrações dos chatbots n8n
          </p>
        </div>
        <div className="flex items-center space-x-2">
          <Badge className="bg-blue-100 text-blue-800">
            <TestTube className="w-3 h-3 mr-1" />
            Ambiente de Teste
          </Badge>
        </div>
      </div>

      {/* Agent Selection */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center space-x-2">
            <Settings className="w-5 h-5" />
            <span>Selecionar Agente</span>
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
            {agents.map((agent) => (
              <div
                key={agent.id}
                className={`p-4 border rounded-lg cursor-pointer transition-all ${
                  selectedAgent === agent.id
                    ? 'border-blue-500 bg-blue-50'
                    : 'border-gray-200 hover:border-gray-300'
                }`}
                onClick={() => setSelectedAgent(agent.id)}
              >
                <div className="flex items-center justify-between mb-2">
                  <div className="flex items-center space-x-2">
                    {agent.icon}
                    <span className="font-medium">{agent.name}</span>
                  </div>
                  <Badge className={getStatusColor(agent.status)} variant="outline">
                    {getStatusText(agent.status)}
                  </Badge>
                </div>
                <p className="text-sm text-gray-600">{agent.description}</p>
                <p className="text-xs text-gray-500 mt-2 truncate">{agent.endpoint}</p>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>

      {/* Test Messages */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center space-x-2">
            <MessageSquare className="w-5 h-5" />
            <span>Mensagens de Teste</span>
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-2">
            {testMessages.map((message, index) => (
              <Button
                key={index}
                variant="outline"
                size="sm"
                className="text-left justify-start h-auto p-3"
                onClick={() => {
                  navigator.clipboard.writeText(message);
                }}
              >
                <span className="text-sm">{message}</span>
              </Button>
            ))}
          </div>
          <Alert className="mt-4">
            <AlertCircle className="h-4 w-4" />
            <AlertDescription>
              Clique em uma mensagem para copiá-la e cole no chat abaixo para testar.
            </AlertDescription>
          </Alert>
        </CardContent>
      </Card>

      {/* Chat Interface */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Chat */}
        <div className="lg:col-span-2">
          <ChatInterface
            title={`${selectedAgentData?.name} - Teste`}
            placeholder="Digite uma mensagem para testar o agente..."
            endpoint={selectedAgentData?.endpoint}
            className="h-[700px]"
          />
        </div>

        {/* Info Panel */}
        <div className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center space-x-2">
                <BarChart3 className="w-5 h-5" />
                <span>Status do Agente</span>
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="flex items-center justify-between">
                <span className="text-sm font-medium">Status:</span>
                <Badge className={getStatusColor(selectedAgentData?.status || '')}>
                  {getStatusText(selectedAgentData?.status || '')}
                </Badge>
              </div>
              
              <div className="space-y-2">
                <span className="text-sm font-medium">Endpoint:</span>
                <p className="text-xs text-gray-600 break-all bg-gray-50 p-2 rounded">
                  {selectedAgentData?.endpoint}
                </p>
              </div>

              <div className="space-y-2">
                <span className="text-sm font-medium">Descrição:</span>
                <p className="text-sm text-gray-600">
                  {selectedAgentData?.description}
                </p>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle className="text-sm">Instruções de Teste</CardTitle>
            </CardHeader>
            <CardContent className="space-y-3">
              <div className="text-sm space-y-2">
                <p><strong>1.</strong> Selecione um agente acima</p>
                <p><strong>2.</strong> Use as mensagens de teste ou digite sua própria</p>
                <p><strong>3.</strong> Observe a resposta e o agente identificado</p>
                <p><strong>4.</strong> Verifique se o roteamento está correto</p>
              </div>
              
              <Alert>
                <CheckCircle className="h-4 w-4" />
                <AlertDescription className="text-xs">
                  O roteador principal deve identificar automaticamente o agente correto baseado na mensagem.
                </AlertDescription>
              </Alert>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle className="text-sm">Agentes Esperados</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-2 text-xs">
                <div className="flex justify-between">
                  <span>"cadastrar animal"</span>
                  <Badge variant="outline" className="text-xs">ANIMAL_AGENT</Badge>
                </div>
                <div className="flex justify-between">
                  <span>"vacinar"</span>
                  <Badge variant="outline" className="text-xs">PROCEDURE_AGENT</Badge>
                </div>
                <div className="flex justify-between">
                  <span>"upload documento"</span>
                  <Badge variant="outline" className="text-xs">DOCUMENT_AGENT</Badge>
                </div>
                <div className="flex justify-between">
                  <span>"adotar"</span>
                  <Badge variant="outline" className="text-xs">TUTOR_AGENT</Badge>
                </div>
                <div className="flex justify-between">
                  <span>"relatório"</span>
                  <Badge variant="outline" className="text-xs">GENERAL_AGENT</Badge>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}
