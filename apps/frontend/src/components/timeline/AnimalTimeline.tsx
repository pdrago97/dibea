'use client';

import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import {
  Calendar,
  User,
  Heart,
  FileText,
  Stethoscope,
  MessageCircle,
  MapPin,
  Clock,
  Bot,
  CheckCircle,
  AlertCircle,
  Info,
  Camera,
  Upload
} from 'lucide-react';

export interface TimelineEvent {
  id: string;
  type: 'adoption' | 'procedure' | 'chat' | 'document' | 'status_change' | 'location' | 'health' | 'system';
  title: string;
  description: string;
  timestamp: string;
  actor: {
    id: string;
    name: string;
    type: 'user' | 'veterinarian' | 'admin' | 'system' | 'ai_agent';
    avatar?: string;
  };
  metadata?: {
    animalId?: string;
    processId?: string;
    documentId?: string;
    location?: string;
    agent?: string;
    severity?: 'low' | 'medium' | 'high';
    status?: string;
    attachments?: Array<{
      id: string;
      name: string;
      type: string;
      url: string;
    }>;
  };
  data?: any;
}

interface AnimalTimelineProps {
  animalId: string;
  events: TimelineEvent[];
  isLoading?: boolean;
  onRefresh?: () => void;
  onAddEvent?: (event: Partial<TimelineEvent>) => void;
  className?: string;
}

export function AnimalTimeline({
  animalId,
  events,
  isLoading = false,
  onRefresh,
  onAddEvent,
  className = ""
}: AnimalTimelineProps) {
  const getEventIcon = (type: string) => {
    switch (type) {
      case 'adoption':
        return <Heart className="w-4 h-4 text-red-500" />;
      case 'procedure':
        return <Stethoscope className="w-4 h-4 text-blue-500" />;
      case 'chat':
        return <MessageCircle className="w-4 h-4 text-green-500" />;
      case 'document':
        return <FileText className="w-4 h-4 text-purple-500" />;
      case 'status_change':
        return <CheckCircle className="w-4 h-4 text-orange-500" />;
      case 'location':
        return <MapPin className="w-4 h-4 text-indigo-500" />;
      case 'health':
        return <Stethoscope className="w-4 h-4 text-red-500" />;
      case 'system':
        return <Bot className="w-4 h-4 text-gray-500" />;
      default:
        return <Info className="w-4 h-4 text-gray-500" />;
    }
  };

  const getEventColor = (type: string) => {
    switch (type) {
      case 'adoption':
        return 'border-red-200 bg-red-50';
      case 'procedure':
        return 'border-blue-200 bg-blue-50';
      case 'chat':
        return 'border-green-200 bg-green-50';
      case 'document':
        return 'border-purple-200 bg-purple-50';
      case 'status_change':
        return 'border-orange-200 bg-orange-50';
      case 'location':
        return 'border-indigo-200 bg-indigo-50';
      case 'health':
        return 'border-red-200 bg-red-50';
      case 'system':
        return 'border-gray-200 bg-gray-50';
      default:
        return 'border-gray-200 bg-gray-50';
    }
  };

  const formatTimeAgo = (timestamp: string) => {
    const now = new Date();
    const time = new Date(timestamp);
    const diffInMinutes = Math.floor((now.getTime() - time.getTime()) / (1000 * 60));
    
    if (diffInMinutes < 1) return 'Agora mesmo';
    if (diffInMinutes < 60) return `${diffInMinutes}min atrás`;
    
    const diffInHours = Math.floor(diffInMinutes / 60);
    if (diffInHours < 24) return `${diffInHours}h atrás`;
    
    const diffInDays = Math.floor(diffInHours / 24);
    if (diffInDays < 30) return `${diffInDays}d atrás`;
    
    return time.toLocaleDateString('pt-BR');
  };

  const getActorBadge = (actorType: string) => {
    switch (actorType) {
      case 'veterinarian':
        return <Badge className="bg-blue-100 text-blue-800 text-xs">Veterinário</Badge>;
      case 'admin':
        return <Badge className="bg-purple-100 text-purple-800 text-xs">Admin</Badge>;
      case 'ai_agent':
        return <Badge className="bg-green-100 text-green-800 text-xs">IA Agent</Badge>;
      case 'system':
        return <Badge className="bg-gray-100 text-gray-800 text-xs">Sistema</Badge>;
      default:
        return <Badge className="bg-orange-100 text-orange-800 text-xs">Usuário</Badge>;
    }
  };

  if (isLoading) {
    return (
      <Card className={className}>
        <CardHeader>
          <CardTitle className="flex items-center space-x-2">
            <Clock className="w-5 h-5" />
            <span>Timeline do Animal</span>
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            {[1, 2, 3].map((i) => (
              <div key={i} className="flex space-x-4 animate-pulse">
                <div className="w-8 h-8 bg-gray-200 rounded-full"></div>
                <div className="flex-1 space-y-2">
                  <div className="h-4 bg-gray-200 rounded w-3/4"></div>
                  <div className="h-3 bg-gray-200 rounded w-1/2"></div>
                </div>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card className={className}>
      <CardHeader>
        <div className="flex items-center justify-between">
          <CardTitle className="flex items-center space-x-2">
            <Clock className="w-5 h-5" />
            <span>Timeline do Animal</span>
          </CardTitle>
          <div className="flex items-center space-x-2">
            {onRefresh && (
              <Button variant="outline" size="sm" onClick={onRefresh}>
                <Clock className="w-4 h-4 mr-2" />
                Atualizar
              </Button>
            )}
            {onAddEvent && (
              <Button size="sm" onClick={() => onAddEvent({})}>
                <Upload className="w-4 h-4 mr-2" />
                Adicionar Evento
              </Button>
            )}
          </div>
        </div>
      </CardHeader>
      <CardContent>
        {events.length === 0 ? (
          <div className="text-center py-8">
            <Clock className="w-12 h-12 text-gray-400 mx-auto mb-4" />
            <h3 className="font-semibold text-gray-900 mb-2">Nenhum evento registrado</h3>
            <p className="text-sm text-gray-600">
              Os eventos e interações com este animal aparecerão aqui
            </p>
          </div>
        ) : (
          <div className="space-y-6">
            {events.map((event, index) => (
              <div key={event.id} className="relative">
                {/* Timeline line */}
                {index < events.length - 1 && (
                  <div className="absolute left-4 top-8 w-0.5 h-full bg-gray-200"></div>
                )}
                
                <div className="flex space-x-4">
                  {/* Event icon */}
                  <div className={`w-8 h-8 rounded-full border-2 flex items-center justify-center ${getEventColor(event.type)}`}>
                    {getEventIcon(event.type)}
                  </div>
                  
                  {/* Event content */}
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center justify-between mb-2">
                      <div className="flex items-center space-x-2">
                        <h4 className="font-semibold text-gray-900">{event.title}</h4>
                        {getActorBadge(event.actor.type)}
                        {event.metadata?.agent && (
                          <Badge className="bg-blue-100 text-blue-800 text-xs">
                            {event.metadata.agent}
                          </Badge>
                        )}
                      </div>
                      <span className="text-xs text-gray-500">{formatTimeAgo(event.timestamp)}</span>
                    </div>
                    
                    <p className="text-sm text-gray-700 mb-2">{event.description}</p>
                    
                    <div className="flex items-center space-x-4 text-xs text-gray-500">
                      <div className="flex items-center space-x-1">
                        <User className="w-3 h-3" />
                        <span>{event.actor.name}</span>
                      </div>
                      {event.metadata?.location && (
                        <div className="flex items-center space-x-1">
                          <MapPin className="w-3 h-3" />
                          <span>{event.metadata.location}</span>
                        </div>
                      )}
                    </div>
                    
                    {/* Attachments */}
                    {event.metadata?.attachments && event.metadata.attachments.length > 0 && (
                      <div className="mt-3 space-y-1">
                        {event.metadata.attachments.map((attachment) => (
                          <div key={attachment.id} className="flex items-center space-x-2 text-xs">
                            <Camera className="w-3 h-3 text-gray-400" />
                            <a 
                              href={attachment.url} 
                              target="_blank" 
                              rel="noopener noreferrer"
                              className="text-blue-600 hover:underline"
                            >
                              {attachment.name}
                            </a>
                          </div>
                        ))}
                      </div>
                    )}
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </CardContent>
    </Card>
  );
}
