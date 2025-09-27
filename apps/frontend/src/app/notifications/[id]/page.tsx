'use client';

import { useState, useEffect } from 'react';
import { useRouter, useParams } from 'next/navigation';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { 
  ArrowLeft,
  CheckCircle, 
  XCircle,
  Eye,
  ExternalLink,
  Clock,
  User,
  PawPrint,
  FileText,
  Calendar
} from 'lucide-react';

interface NotificationDetail {
  id: string;
  title: string;
  message: string;
  type: 'ADOPTION' | 'TASK' | 'SYSTEM' | 'ALERT' | 'INFO';
  category: 'ADOCAO' | 'DENUNCIA' | 'CAMPANHA' | 'SISTEMA' | 'VETERINARIO';
  priority: 'LOW' | 'MEDIUM' | 'HIGH' | 'URGENT';
  status: 'UNREAD' | 'READ' | 'ARCHIVED';
  actionType?: 'APPROVE' | 'REJECT' | 'VIEW' | 'REDIRECT' | 'COMPLETE';
  actionUrl?: string;
  actionData?: any;
  createdAt: string;
  readAt?: string;
  expiresAt?: string;
  user?: {
    id: string;
    name: string;
    email: string;
  };
  animal?: {
    id: string;
    name: string;
    species: string;
    breed?: string;
  };
  task?: {
    id: string;
    title: string;
    status: string;
    description?: string;
  };
  adoption?: {
    id: string;
    status: string;
  };
}

export default function NotificationDetailPage() {
  const [notification, setNotification] = useState<NotificationDetail | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [isExecutingAction, setIsExecutingAction] = useState(false);
  const router = useRouter();
  const params = useParams();
  const notificationId = params.id as string;

  useEffect(() => {
    loadNotification();
  }, [notificationId]);

  const loadNotification = async () => {
    try {
      setIsLoading(true);
      const token = localStorage.getItem('token');
      
      const response = await fetch(`/api/v1/notifications/${notificationId}`, {
        headers: {
          'Authorization': `Bearer ${token}`
        }
      });

      if (response.ok) {
        const data = await response.json();
        setNotification(data.data);
        
        // Mark as read if not already read
        if (data.data.status === 'UNREAD') {
          markAsRead();
        }
      } else {
        router.push('/notifications');
      }
    } catch (error) {
      console.error('Error loading notification:', error);
      router.push('/notifications');
    } finally {
      setIsLoading(false);
    }
  };

  const markAsRead = async () => {
    try {
      const token = localStorage.getItem('token');
      
      await fetch(`/api/v1/notifications/${notificationId}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify({ status: 'read' })
      });
    } catch (error) {
      console.error('Error marking as read:', error);
    }
  };

  const executeAction = async (actionType?: string) => {
    try {
      setIsExecutingAction(true);
      const token = localStorage.getItem('token');
      
      const response = await fetch(`/api/v1/notifications/${notificationId}/action`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify({ actionType })
      });

      if (response.ok) {
        const data = await response.json();
        
        // Handle redirect
        if (data.data?.redirectUrl || notification?.actionUrl) {
          router.push(data.data?.redirectUrl || notification!.actionUrl!);
        } else {
          // Refresh notification data
          await loadNotification();
        }
      }
    } catch (error) {
      console.error('Error executing action:', error);
    } finally {
      setIsExecutingAction(false);
    }
  };

  const getPriorityColor = (priority: string) => {
    switch (priority) {
      case 'URGENT': return 'bg-red-100 text-red-800 border-red-200';
      case 'HIGH': return 'bg-orange-100 text-orange-800 border-orange-200';
      case 'MEDIUM': return 'bg-blue-100 text-blue-800 border-blue-200';
      case 'LOW': return 'bg-gray-100 text-gray-800 border-gray-200';
      default: return 'bg-gray-100 text-gray-800 border-gray-200';
    }
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleString('pt-BR');
  };

  if (isLoading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-blue-600"></div>
      </div>
    );
  }

  if (!notification) {
    return (
      <div className="container mx-auto px-4 py-8">
        <div className="text-center">
          <h1 className="text-2xl font-bold text-gray-900 mb-4">Notificação não encontrada</h1>
          <Button onClick={() => router.push('/notifications')}>
            <ArrowLeft className="w-4 h-4 mr-2" />
            Voltar para Notificações
          </Button>
        </div>
      </div>
    );
  }

  return (
    <div className="container mx-auto px-4 py-8">
      {/* Header */}
      <div className="flex items-center justify-between mb-6">
        <Button
          variant="outline"
          onClick={() => router.push('/notifications')}
        >
          <ArrowLeft className="w-4 h-4 mr-2" />
          Voltar
        </Button>
        
        <Badge className={getPriorityColor(notification.priority)}>
          {notification.priority}
        </Badge>
      </div>

      {/* Main Content */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Notification Details */}
        <div className="lg:col-span-2">
          <Card>
            <CardHeader>
              <CardTitle className="text-xl">{notification.title}</CardTitle>
              <div className="flex items-center space-x-4 text-sm text-gray-600">
                <div className="flex items-center">
                  <Calendar className="w-4 h-4 mr-1" />
                  {formatDate(notification.createdAt)}
                </div>
                <Badge variant="outline">{notification.category}</Badge>
                <Badge variant="outline">{notification.type}</Badge>
              </div>
            </CardHeader>
            <CardContent>
              <p className="text-gray-700 mb-6 leading-relaxed">
                {notification.message}
              </p>

              {/* Action Buttons */}
              {notification.actionType && (
                <div className="space-y-3">
                  <h4 className="font-medium text-gray-900">Ações Disponíveis:</h4>
                  <div className="flex flex-wrap gap-3">
                    {notification.actionType === 'APPROVE' && (
                      <Button
                        onClick={() => executeAction('APPROVE')}
                        disabled={isExecutingAction}
                        className="bg-green-600 hover:bg-green-700"
                      >
                        <CheckCircle className="w-4 h-4 mr-2" />
                        Aprovar
                      </Button>
                    )}
                    
                    {notification.actionType === 'REJECT' && (
                      <Button
                        onClick={() => executeAction('REJECT')}
                        disabled={isExecutingAction}
                        variant="destructive"
                      >
                        <XCircle className="w-4 h-4 mr-2" />
                        Rejeitar
                      </Button>
                    )}
                    
                    {(notification.actionType === 'VIEW' || notification.actionType === 'REDIRECT') && (
                      <Button
                        onClick={() => executeAction()}
                        disabled={isExecutingAction}
                      >
                        <Eye className="w-4 h-4 mr-2" />
                        Visualizar
                      </Button>
                    )}
                    
                    {notification.actionType === 'COMPLETE' && (
                      <Button
                        onClick={() => executeAction('COMPLETE')}
                        disabled={isExecutingAction}
                        className="bg-blue-600 hover:bg-blue-700"
                      >
                        <CheckCircle className="w-4 h-4 mr-2" />
                        Marcar como Concluído
                      </Button>
                    )}
                    
                    {notification.actionUrl && (
                      <Button
                        variant="outline"
                        onClick={() => router.push(notification.actionUrl!)}
                      >
                        <ExternalLink className="w-4 h-4 mr-2" />
                        Ir para Página
                      </Button>
                    )}
                  </div>
                </div>
              )}
            </CardContent>
          </Card>
        </div>

        {/* Sidebar */}
        <div className="space-y-6">
          {/* Related Information */}
          {(notification.animal || notification.task || notification.adoption) && (
            <Card>
              <CardHeader>
                <CardTitle className="text-lg">Informações Relacionadas</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                {notification.animal && (
                  <div className="flex items-center space-x-3">
                    <PawPrint className="w-5 h-5 text-blue-600" />
                    <div>
                      <p className="font-medium">{notification.animal.name}</p>
                      <p className="text-sm text-gray-600">
                        {notification.animal.species} {notification.animal.breed && `- ${notification.animal.breed}`}
                      </p>
                    </div>
                  </div>
                )}
                
                {notification.task && (
                  <div className="flex items-center space-x-3">
                    <FileText className="w-5 h-5 text-green-600" />
                    <div>
                      <p className="font-medium">{notification.task.title}</p>
                      <p className="text-sm text-gray-600">Status: {notification.task.status}</p>
                    </div>
                  </div>
                )}
                
                {notification.adoption && (
                  <div className="flex items-center space-x-3">
                    <User className="w-5 h-5 text-purple-600" />
                    <div>
                      <p className="font-medium">Processo de Adoção</p>
                      <p className="text-sm text-gray-600">Status: {notification.adoption.status}</p>
                    </div>
                  </div>
                )}
              </CardContent>
            </Card>
          )}

          {/* Notification Status */}
          <Card>
            <CardHeader>
              <CardTitle className="text-lg">Status da Notificação</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-3">
                <div className="flex justify-between">
                  <span className="text-sm text-gray-600">Status:</span>
                  <Badge variant={notification.status === 'UNREAD' ? 'default' : 'secondary'}>
                    {notification.status === 'UNREAD' ? 'Não lida' : 'Lida'}
                  </Badge>
                </div>
                
                <div className="flex justify-between">
                  <span className="text-sm text-gray-600">Criada em:</span>
                  <span className="text-sm">{formatDate(notification.createdAt)}</span>
                </div>
                
                {notification.readAt && (
                  <div className="flex justify-between">
                    <span className="text-sm text-gray-600">Lida em:</span>
                    <span className="text-sm">{formatDate(notification.readAt)}</span>
                  </div>
                )}
                
                {notification.expiresAt && (
                  <div className="flex justify-between">
                    <span className="text-sm text-gray-600">Expira em:</span>
                    <span className="text-sm">{formatDate(notification.expiresAt)}</span>
                  </div>
                )}
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}
