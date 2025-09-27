'use client';

import React, { useState, useEffect } from 'react';
import { useParams } from 'next/navigation';
import AnimalDocumentUpload from '@/components/AnimalDocumentUpload';
import { ArrowLeft, FileText, BarChart3, Network } from 'lucide-react';
import Link from 'next/link';

interface Animal {
  id: string;
  name: string;
  species: string;
  breed?: string;
  sex: string;
  size: string;
  status: string;
  qrCode: string;
}

interface GraphInsights {
  totalDocuments: number;
  totalEvents: number;
  totalCosts: number;
  lastEvent?: string;
}

export default function AnimalDocumentsPage() {
  const params = useParams();
  const animalId = params.id as string;
  
  const [animal, setAnimal] = useState<Animal | null>(null);
  const [insights, setInsights] = useState<GraphInsights | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (animalId) {
      fetchAnimalData();
      fetchGraphInsights();
    }
  }, [animalId]);

  const fetchAnimalData = async () => {
    try {
      const response = await fetch(`/api/v1/animals/${animalId}`, {
        headers: {
          'Authorization': `Bearer ${localStorage.getItem('token')}`
        }
      });

      if (!response.ok) {
        throw new Error('Erro ao carregar dados do animal');
      }

      const result = await response.json();
      if (result.success) {
        setAnimal(result.data);
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Erro desconhecido');
    } finally {
      setLoading(false);
    }
  };

  const fetchGraphInsights = async () => {
    try {
      const response = await fetch(`/api/v1/documents/animal/${animalId}/graph`, {
        headers: {
          'Authorization': `Bearer ${localStorage.getItem('token')}`
        }
      });

      if (response.ok) {
        const result = await response.json();
        if (result.success) {
          setInsights(result.data.insights);
        }
      }
    } catch (err) {
      console.error('Erro ao carregar insights do grafo:', err);
    }
  };

  const handleUploadComplete = () => {
    fetchGraphInsights();
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto"></div>
          <p className="mt-4 text-gray-600">Carregando...</p>
        </div>
      </div>
    );
  }

  if (error || !animal) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <p className="text-red-600 mb-4">{error || 'Animal não encontrado'}</p>
          <Link 
            href="/animals" 
            className="text-blue-600 hover:text-blue-800 underline"
          >
            Voltar para lista de animais
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <div className="bg-white shadow">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between h-16">
            <div className="flex items-center space-x-4">
              <Link 
                href={`/animals/${animalId}`}
                className="flex items-center text-gray-600 hover:text-gray-900"
              >
                <ArrowLeft className="w-5 h-5 mr-2" />
                Voltar
              </Link>
              <div>
                <h1 className="text-xl font-semibold text-gray-900">
                  Documentos - {animal.name}
                </h1>
                <p className="text-sm text-gray-500">
                  {animal.species} • {animal.breed} • {animal.sex} • {animal.size}
                </p>
              </div>
            </div>
          </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Main Content */}
          <div className="lg:col-span-2">
            <div className="bg-white rounded-lg shadow p-6">
              <div className="mb-6">
                <h2 className="text-lg font-medium text-gray-900 mb-2">
                  Upload de Documentos
                </h2>
                <p className="text-sm text-gray-600">
                  Faça upload de fotos, laudos médicos, receitas, notas fiscais e certificados. 
                  Nossa IA analisará automaticamente os documentos para extrair informações relevantes.
                </p>
              </div>

              <AnimalDocumentUpload 
                animalId={animalId} 
                onUploadComplete={handleUploadComplete}
              />
            </div>
          </div>

          {/* Sidebar */}
          <div className="space-y-6">
            {/* Knowledge Graph Insights */}
            {insights && (
              <div className="bg-white rounded-lg shadow p-6">
                <div className="flex items-center mb-4">
                  <Network className="w-5 h-5 text-blue-600 mr-2" />
                  <h3 className="text-lg font-medium text-gray-900">
                    Grafo de Conhecimento
                  </h3>
                </div>
                
                <div className="space-y-4">
                  <div className="flex items-center justify-between">
                    <span className="text-sm text-gray-600">Documentos</span>
                    <span className="font-medium text-gray-900">{insights.totalDocuments}</span>
                  </div>
                  
                  <div className="flex items-center justify-between">
                    <span className="text-sm text-gray-600">Eventos</span>
                    <span className="font-medium text-gray-900">{insights.totalEvents}</span>
                  </div>
                  
                  <div className="flex items-center justify-between">
                    <span className="text-sm text-gray-600">Custos Totais</span>
                    <span className="font-medium text-gray-900">
                      R$ {insights.totalCosts.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}
                    </span>
                  </div>
                  
                  {insights.lastEvent && (
                    <div className="pt-4 border-t border-gray-200">
                      <span className="text-sm text-gray-600">Último Evento</span>
                      <p className="text-sm font-medium text-gray-900 mt-1">
                        {new Date(insights.lastEvent).toLocaleDateString('pt-BR')}
                      </p>
                    </div>
                  )}
                </div>

                <div className="mt-6">
                  <button className="w-full bg-blue-600 text-white py-2 px-4 rounded-md hover:bg-blue-700 transition-colors">
                    Visualizar Grafo Completo
                  </button>
                </div>
              </div>
            )}

            {/* Quick Actions */}
            <div className="bg-white rounded-lg shadow p-6">
              <h3 className="text-lg font-medium text-gray-900 mb-4">
                Ações Rápidas
              </h3>
              
              <div className="space-y-3">
                <button className="w-full flex items-center justify-center px-4 py-2 border border-gray-300 rounded-md text-sm font-medium text-gray-700 hover:bg-gray-50">
                  <FileText className="w-4 h-4 mr-2" />
                  Gerar Relatório
                </button>
                
                <button className="w-full flex items-center justify-center px-4 py-2 border border-gray-300 rounded-md text-sm font-medium text-gray-700 hover:bg-gray-50">
                  <BarChart3 className="w-4 h-4 mr-2" />
                  Análise de Custos
                </button>
              </div>
            </div>

            {/* Tips */}
            <div className="bg-blue-50 rounded-lg p-6">
              <h3 className="text-sm font-medium text-blue-900 mb-2">
                💡 Dicas para Upload
              </h3>
              <ul className="text-sm text-blue-800 space-y-1">
                <li>• Use nomes descritivos para os arquivos</li>
                <li>• Fotos com boa qualidade geram melhores análises</li>
                <li>• PDFs com texto são analisados automaticamente</li>
                <li>• Adicione descrições para contexto adicional</li>
              </ul>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
