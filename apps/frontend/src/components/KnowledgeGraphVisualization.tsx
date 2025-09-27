'use client';

import React, { useEffect, useRef, useState } from 'react';
import { Network, FileText, Calendar, DollarSign, Stethoscope, Heart, Activity } from 'lucide-react';

interface GraphNode {
  id: string;
  type: 'animal' | 'document' | 'event' | 'cost' | 'medication' | 'procedure';
  label: string;
  x?: number;
  y?: number;
  color?: string;
}

interface GraphEdge {
  source: string;
  target: string;
  type: string;
  label?: string;
}

interface GraphData {
  nodes: GraphNode[];
  edges: GraphEdge[];
  insights: {
    totalDocuments: number;
    totalEvents: number;
    totalCosts: number;
    lastEvent?: string;
  };
}

interface KnowledgeGraphVisualizationProps {
  animalId: string;
  data?: GraphData;
}

const nodeTypeConfig = {
  animal: { icon: Heart, color: '#3B82F6', bgColor: '#EFF6FF' },
  document: { icon: FileText, color: '#10B981', bgColor: '#ECFDF5' },
  event: { icon: Calendar, color: '#F59E0B', bgColor: '#FFFBEB' },
  cost: { icon: DollarSign, color: '#EF4444', bgColor: '#FEF2F2' },
  medication: { icon: Activity, color: '#8B5CF6', bgColor: '#F5F3FF' },
  procedure: { icon: Stethoscope, color: '#06B6D4', bgColor: '#F0F9FF' }
};

export default function KnowledgeGraphVisualization({ animalId, data }: KnowledgeGraphVisualizationProps) {
  const svgRef = useRef<SVGSVGElement>(null);
  const [selectedNode, setSelectedNode] = useState<GraphNode | null>(null);
  const [graphData, setGraphData] = useState<GraphData | null>(data || null);

  // Mock data for demonstration
  const mockData: GraphData = {
    nodes: [
      { id: animalId, type: 'animal', label: 'Rex', x: 300, y: 200 },
      { id: 'doc1', type: 'document', label: 'Laudo Veterinário', x: 150, y: 100 },
      { id: 'doc2', type: 'document', label: 'Receita Médica', x: 450, y: 100 },
      { id: 'doc3', type: 'document', label: 'Nota Fiscal', x: 150, y: 300 },
      { id: 'event1', type: 'event', label: 'Consulta 15/03', x: 450, y: 300 },
      { id: 'med1', type: 'medication', label: 'Antibiótico', x: 300, y: 50 },
      { id: 'proc1', type: 'procedure', label: 'Vacinação', x: 300, y: 350 },
      { id: 'cost1', type: 'cost', label: 'R$ 150,00', x: 550, y: 200 }
    ],
    edges: [
      { source: animalId, target: 'doc1', type: 'has_document' },
      { source: animalId, target: 'doc2', type: 'has_document' },
      { source: animalId, target: 'doc3', type: 'has_document' },
      { source: animalId, target: 'event1', type: 'had_event' },
      { source: 'doc2', target: 'med1', type: 'prescribes' },
      { source: 'event1', target: 'proc1', type: 'includes' },
      { source: 'event1', target: 'cost1', type: 'costs' }
    ],
    insights: {
      totalDocuments: 3,
      totalEvents: 1,
      totalCosts: 150.00,
      lastEvent: new Date().toISOString()
    }
  };

  useEffect(() => {
    if (!graphData) {
      setGraphData(mockData);
    }
  }, [animalId]);

  const handleNodeClick = (node: GraphNode) => {
    setSelectedNode(node);
  };

  const renderGraph = () => {
    if (!graphData) return null;

    return (
      <div className="relative">
        <svg
          ref={svgRef}
          width="600"
          height="400"
          className="border border-gray-200 rounded-lg bg-gray-50"
        >
          {/* Render edges */}
          {graphData.edges.map((edge, index) => {
            const sourceNode = graphData.nodes.find(n => n.id === edge.source);
            const targetNode = graphData.nodes.find(n => n.id === edge.target);
            
            if (!sourceNode || !targetNode) return null;

            return (
              <g key={index}>
                <line
                  x1={sourceNode.x}
                  y1={sourceNode.y}
                  x2={targetNode.x}
                  y2={targetNode.y}
                  stroke="#9CA3AF"
                  strokeWidth="2"
                  strokeDasharray={edge.type === 'costs' ? '5,5' : 'none'}
                />
                {/* Edge label */}
                <text
                  x={(sourceNode.x! + targetNode.x!) / 2}
                  y={(sourceNode.y! + targetNode.y!) / 2 - 5}
                  textAnchor="middle"
                  className="text-xs fill-gray-500"
                >
                  {edge.type.replace('_', ' ')}
                </text>
              </g>
            );
          })}

          {/* Render nodes */}
          {graphData.nodes.map((node) => {
            const config = nodeTypeConfig[node.type];
            const Icon = config.icon;
            const isSelected = selectedNode?.id === node.id;

            return (
              <g
                key={node.id}
                onClick={() => handleNodeClick(node)}
                className="cursor-pointer"
              >
                {/* Node circle */}
                <circle
                  cx={node.x}
                  cy={node.y}
                  r={node.type === 'animal' ? 30 : 20}
                  fill={config.color}
                  stroke={isSelected ? '#1F2937' : 'white'}
                  strokeWidth={isSelected ? 3 : 2}
                  className="transition-all duration-200 hover:stroke-gray-700"
                />
                
                {/* Node icon */}
                <foreignObject
                  x={node.x! - 8}
                  y={node.y! - 8}
                  width="16"
                  height="16"
                  className="pointer-events-none"
                >
                  <Icon className="w-4 h-4 text-white" />
                </foreignObject>

                {/* Node label */}
                <text
                  x={node.x}
                  y={node.y! + (node.type === 'animal' ? 45 : 35)}
                  textAnchor="middle"
                  className="text-sm font-medium fill-gray-700"
                >
                  {node.label}
                </text>
              </g>
            );
          })}
        </svg>

        {/* Node details panel */}
        {selectedNode && (
          <div className="absolute top-4 right-4 bg-white border border-gray-200 rounded-lg p-4 shadow-lg w-64">
            <div className="flex items-center space-x-2 mb-3">
              {React.createElement(nodeTypeConfig[selectedNode.type].icon, {
                className: "w-5 h-5",
                style: { color: nodeTypeConfig[selectedNode.type].color }
              })}
              <h3 className="font-medium text-gray-900">{selectedNode.label}</h3>
            </div>
            
            <div className="space-y-2 text-sm text-gray-600">
              <p><span className="font-medium">Tipo:</span> {selectedNode.type}</p>
              <p><span className="font-medium">ID:</span> {selectedNode.id}</p>
              
              {selectedNode.type === 'animal' && (
                <div className="pt-2 border-t border-gray-200">
                  <p className="text-xs text-gray-500">
                    Este é o nó central do grafo de conhecimento. 
                    Todos os documentos, eventos e custos estão conectados a este animal.
                  </p>
                </div>
              )}
              
              {selectedNode.type === 'document' && (
                <div className="pt-2 border-t border-gray-200">
                  <p className="text-xs text-gray-500">
                    Documento analisado por IA para extrair informações estruturadas.
                  </p>
                </div>
              )}
              
              {selectedNode.type === 'event' && (
                <div className="pt-2 border-t border-gray-200">
                  <p className="text-xs text-gray-500">
                    Evento extraído automaticamente dos documentos ou registrado manualmente.
                  </p>
                </div>
              )}
            </div>

            <button
              onClick={() => setSelectedNode(null)}
              className="mt-3 text-xs text-gray-500 hover:text-gray-700"
            >
              Fechar
            </button>
          </div>
        )}
      </div>
    );
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center space-x-2">
          <Network className="w-6 h-6 text-blue-600" />
          <h2 className="text-xl font-semibold text-gray-900">
            Grafo de Conhecimento
          </h2>
        </div>
        
        <div className="text-sm text-gray-500">
          Clique nos nós para ver detalhes
        </div>
      </div>

      {/* Insights Cards */}
      {graphData && (
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-6">
          <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
            <div className="flex items-center space-x-2">
              <FileText className="w-5 h-5 text-blue-600" />
              <div>
                <p className="text-sm text-blue-600">Documentos</p>
                <p className="text-xl font-semibold text-blue-900">
                  {graphData.insights.totalDocuments}
                </p>
              </div>
            </div>
          </div>

          <div className="bg-orange-50 border border-orange-200 rounded-lg p-4">
            <div className="flex items-center space-x-2">
              <Calendar className="w-5 h-5 text-orange-600" />
              <div>
                <p className="text-sm text-orange-600">Eventos</p>
                <p className="text-xl font-semibold text-orange-900">
                  {graphData.insights.totalEvents}
                </p>
              </div>
            </div>
          </div>

          <div className="bg-red-50 border border-red-200 rounded-lg p-4">
            <div className="flex items-center space-x-2">
              <DollarSign className="w-5 h-5 text-red-600" />
              <div>
                <p className="text-sm text-red-600">Custos</p>
                <p className="text-xl font-semibold text-red-900">
                  R$ {graphData.insights.totalCosts.toFixed(2)}
                </p>
              </div>
            </div>
          </div>

          <div className="bg-green-50 border border-green-200 rounded-lg p-4">
            <div className="flex items-center space-x-2">
              <Activity className="w-5 h-5 text-green-600" />
              <div>
                <p className="text-sm text-green-600">Conexões</p>
                <p className="text-xl font-semibold text-green-900">
                  {graphData.edges.length}
                </p>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Graph Visualization */}
      <div className="bg-white border border-gray-200 rounded-lg p-6">
        {renderGraph()}
      </div>

      {/* Legend */}
      <div className="bg-gray-50 border border-gray-200 rounded-lg p-4">
        <h3 className="text-sm font-medium text-gray-900 mb-3">Legenda</h3>
        <div className="grid grid-cols-2 md:grid-cols-3 gap-3">
          {Object.entries(nodeTypeConfig).map(([type, config]) => {
            const Icon = config.icon;
            return (
              <div key={type} className="flex items-center space-x-2">
                <div
                  className="w-4 h-4 rounded-full flex items-center justify-center"
                  style={{ backgroundColor: config.color }}
                >
                  <Icon className="w-2.5 h-2.5 text-white" />
                </div>
                <span className="text-sm text-gray-700 capitalize">
                  {type === 'animal' ? 'Animal' :
                   type === 'document' ? 'Documento' :
                   type === 'event' ? 'Evento' :
                   type === 'cost' ? 'Custo' :
                   type === 'medication' ? 'Medicamento' :
                   'Procedimento'}
                </span>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
}
