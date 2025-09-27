'use client';

import React, { useState } from 'react';
import AnimalDocumentUpload from '@/components/AnimalDocumentUpload';
import KnowledgeGraphVisualization from '@/components/KnowledgeGraphVisualization';
import { Brain, Upload, Network, Sparkles, ArrowRight, CheckCircle } from 'lucide-react';

export default function KnowledgeGraphDemoPage() {
  const [activeTab, setActiveTab] = useState<'upload' | 'graph'>('upload');
  const [uploadedDocuments, setUploadedDocuments] = useState(0);

  const mockAnimalId = 'demo-animal-123';

  const features = [
    {
      icon: Upload,
      title: 'Upload Inteligente',
      description: 'Faça upload de fotos, laudos, receitas e documentos. Nossa IA analisa automaticamente cada arquivo.',
      color: 'blue'
    },
    {
      icon: Brain,
      title: 'Análise por IA',
      description: 'OCR, Computer Vision e NLP extraem informações estruturadas de documentos não-estruturados.',
      color: 'purple'
    },
    {
      icon: Network,
      title: 'Grafo de Conhecimento',
      description: 'Cada informação vira um nó conectado, criando uma rede rica de relacionamentos.',
      color: 'green'
    },
    {
      icon: Sparkles,
      title: 'Insights Automáticos',
      description: 'Descubra padrões, otimize custos e tome decisões baseadas em dados interconectados.',
      color: 'orange'
    }
  ];

  const pipeline = [
    {
      step: 1,
      title: 'Upload de Documento',
      description: 'Usuário faz upload de uma receita veterinária em PDF',
      status: 'completed'
    },
    {
      step: 2,
      title: 'OCR & Extração',
      description: 'IA extrai texto e identifica medicamentos, dosagens, datas',
      status: 'completed'
    },
    {
      step: 3,
      title: 'Análise Semântica',
      description: 'NLP identifica entidades: "Antibiótico", "10mg", "2x ao dia"',
      status: 'completed'
    },
    {
      step: 4,
      title: 'Criação de Nós',
      description: 'Cada entidade vira um nó no grafo: Animal → Receita → Medicamento',
      status: 'completed'
    },
    {
      step: 5,
      title: 'Relacionamentos',
      description: 'Conexões automáticas: "prescrito_para", "contém", "custa"',
      status: 'completed'
    },
    {
      step: 6,
      title: 'Insights',
      description: 'Sistema detecta padrões: "Custo médio de tratamento subiu 15%"',
      status: 'processing'
    }
  ];

  const handleUploadComplete = () => {
    setUploadedDocuments(prev => prev + 1);
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-purple-50">
      {/* Hero Section */}
      <div className="bg-white shadow-sm">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
          <div className="text-center">
            <div className="flex items-center justify-center space-x-2 mb-4">
              <Brain className="w-8 h-8 text-blue-600" />
              <h1 className="text-4xl font-bold text-gray-900">
                DIBEA Knowledge Graph
              </h1>
            </div>
            <p className="text-xl text-gray-600 max-w-3xl mx-auto">
              Transforme documentos veterinários em conhecimento estruturado com IA. 
              Cada animal se torna um universo de informações interconectadas.
            </p>
          </div>
        </div>
      </div>

      {/* Features Grid */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-12">
          {features.map((feature, index) => {
            const Icon = feature.icon;
            const colorClasses = {
              blue: 'bg-blue-500 text-blue-50',
              purple: 'bg-purple-500 text-purple-50',
              green: 'bg-green-500 text-green-50',
              orange: 'bg-orange-500 text-orange-50'
            };

            return (
              <div key={index} className="bg-white rounded-lg shadow-md p-6 hover:shadow-lg transition-shadow">
                <div className={`w-12 h-12 rounded-lg ${colorClasses[feature.color as keyof typeof colorClasses]} flex items-center justify-center mb-4`}>
                  <Icon className="w-6 h-6" />
                </div>
                <h3 className="text-lg font-semibold text-gray-900 mb-2">
                  {feature.title}
                </h3>
                <p className="text-gray-600 text-sm">
                  {feature.description}
                </p>
              </div>
            );
          })}
        </div>

        {/* Pipeline Visualization */}
        <div className="bg-white rounded-lg shadow-md p-8 mb-12">
          <h2 className="text-2xl font-bold text-gray-900 mb-6 text-center">
            Pipeline de Processamento IA
          </h2>
          
          <div className="space-y-4">
            {pipeline.map((item, index) => (
              <div key={index} className="flex items-center space-x-4">
                <div className={`w-8 h-8 rounded-full flex items-center justify-center text-sm font-medium ${
                  item.status === 'completed' 
                    ? 'bg-green-500 text-white' 
                    : item.status === 'processing'
                    ? 'bg-blue-500 text-white animate-pulse'
                    : 'bg-gray-300 text-gray-600'
                }`}>
                  {item.status === 'completed' ? (
                    <CheckCircle className="w-4 h-4" />
                  ) : (
                    item.step
                  )}
                </div>
                
                <div className="flex-1">
                  <h3 className="font-medium text-gray-900">{item.title}</h3>
                  <p className="text-sm text-gray-600">{item.description}</p>
                </div>
                
                {index < pipeline.length - 1 && (
                  <ArrowRight className="w-4 h-4 text-gray-400" />
                )}
              </div>
            ))}
          </div>
        </div>

        {/* Interactive Demo */}
        <div className="bg-white rounded-lg shadow-md overflow-hidden">
          {/* Tab Navigation */}
          <div className="border-b border-gray-200">
            <nav className="flex">
              <button
                onClick={() => setActiveTab('upload')}
                className={`px-6 py-4 text-sm font-medium border-b-2 transition-colors ${
                  activeTab === 'upload'
                    ? 'border-blue-500 text-blue-600'
                    : 'border-transparent text-gray-500 hover:text-gray-700'
                }`}
              >
                <Upload className="w-4 h-4 inline mr-2" />
                Upload de Documentos
              </button>
              <button
                onClick={() => setActiveTab('graph')}
                className={`px-6 py-4 text-sm font-medium border-b-2 transition-colors ${
                  activeTab === 'graph'
                    ? 'border-blue-500 text-blue-600'
                    : 'border-transparent text-gray-500 hover:text-gray-700'
                }`}
              >
                <Network className="w-4 h-4 inline mr-2" />
                Grafo de Conhecimento
              </button>
            </nav>
          </div>

          {/* Tab Content */}
          <div className="p-8">
            {activeTab === 'upload' && (
              <div>
                <div className="mb-6">
                  <h3 className="text-lg font-semibold text-gray-900 mb-2">
                    Demonstração de Upload
                  </h3>
                  <p className="text-gray-600">
                    Faça upload de documentos veterinários para ver como nossa IA os processa 
                    e adiciona ao grafo de conhecimento do animal.
                  </p>
                  {uploadedDocuments > 0 && (
                    <div className="mt-4 p-4 bg-green-50 border border-green-200 rounded-lg">
                      <p className="text-green-800">
                        ✅ {uploadedDocuments} documento(s) processado(s) com sucesso!
                      </p>
                    </div>
                  )}
                </div>
                
                <AnimalDocumentUpload 
                  animalId={mockAnimalId}
                  onUploadComplete={handleUploadComplete}
                />
              </div>
            )}

            {activeTab === 'graph' && (
              <div>
                <div className="mb-6">
                  <h3 className="text-lg font-semibold text-gray-900 mb-2">
                    Visualização do Grafo
                  </h3>
                  <p className="text-gray-600">
                    Explore o grafo de conhecimento interativo. Cada nó representa uma entidade 
                    (animal, documento, evento, custo) e as conexões mostram os relacionamentos.
                  </p>
                </div>
                
                <KnowledgeGraphVisualization animalId={mockAnimalId} />
              </div>
            )}
          </div>
        </div>

        {/* Benefits Section */}
        <div className="mt-12 bg-gradient-to-r from-blue-600 to-purple-600 rounded-lg p-8 text-white">
          <div className="text-center">
            <h2 className="text-2xl font-bold mb-4">
              Benefícios do Knowledge Graph
            </h2>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mt-8">
              <div>
                <h3 className="font-semibold mb-2">🔍 Descoberta de Insights</h3>
                <p className="text-blue-100">
                  Encontre padrões ocultos em tratamentos, custos e resultados
                </p>
              </div>
              <div>
                <h3 className="font-semibold mb-2">⚡ Decisões Rápidas</h3>
                <p className="text-blue-100">
                  Acesse informações contextualizadas instantaneamente
                </p>
              </div>
              <div>
                <h3 className="font-semibold mb-2">📈 Otimização Contínua</h3>
                <p className="text-blue-100">
                  Melhore processos baseado em dados interconectados
                </p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
