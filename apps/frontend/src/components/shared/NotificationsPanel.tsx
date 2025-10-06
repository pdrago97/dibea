'use client';

import { useState, useEffect, useRef } from 'react';
import { Bell, Check, CheckCheck, Trash2, Filter, X } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { supabase } from '@/lib/supabase';

interface Notification {
  id: string;
  titulo: string;
  conteudo: string;
  tipo: 'SISTEMA' | 'PROCESSO' | 'ANIMAL' | 'AGENDAMENTO';
  categoria: 'INFO' | 'SUCESSO' | 'ALERTA' | 'URGENTE';
  prioridade: 'BAIXA' | 'MEDIA' | 'ALTA' | 'URGENTE';
  visualizada: boolean;
  created_at: string;
  link_acao?: string;
}

interface NotificationsPanelProps {
  userId?: string;
}

export default function NotificationsPanel({ userId }: NotificationsPanelProps) {
  const [isOpen, setIsOpen] = useState(false);
  const [notifications, setNotifications] = useState<Notification[]>([]);
  const [filter, setFilter] = useState<'all' | 'unread'>('all');
  const [loading, setLoading] = useState(false);
  const panelRef = useRef<HTMLDivElement>(null);

  const unreadCount = notifications.filter(n => !n.visualizada).length;

  useEffect(() => {
    if (isOpen) {
      fetchNotifications();
    }

    // Click outside to close
    const handleClickOutside = (event: MouseEvent) => {
      if (panelRef.current && !panelRef.current.contains(event.target as Node)) {
        setIsOpen(false);
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, [isOpen, userId]);

  const fetchNotifications = async () => {
    try {
      setLoading(true);
      
      // Mock data for now - TODO: Replace with real Supabase query
      const mockNotifications: Notification[] = [
        {
          id: '1',
          titulo: 'Novo animal disponível',
          conteudo: 'Um novo animal da sua região está disponível para adoção na sua região',
          tipo: 'ANIMAL',
          categoria: 'INFO',
          prioridade: 'MEDIA',
          visualizada: false,
          created_at: new Date(Date.now() - 2 * 60 * 60 * 1000).toISOString(),
          link_acao: '/animals/search'
        },
        {
          id: '2',
          titulo: 'Processo atualizado',
          conteudo: 'Seu processo de adoção do Rex foi atualizado',
          tipo: 'PROCESSO',
          categoria: 'SUCESSO',
          prioridade: 'ALTA',
          visualizada: false,
          created_at: new Date(Date.now() - 24 * 60 * 60 * 1000).toISOString(),
          link_acao: '/citizen/adoptions'
        },
        {
          id: '3',
          titulo: 'Documentos pendentes',
          conteudo: 'Você possui 2 documentos pendentes para upload',
          tipo: 'PROCESSO',
          categoria: 'ALERTA',
          prioridade: 'ALTA',
          visualizada: true,
          created_at: new Date(Date.now() - 2 * 24 * 60 * 60 * 1000).toISOString(),
          link_acao: '/citizen/documents'
        }
      ];

      setNotifications(mockNotifications);
    } catch (err) {
      console.error('Erro ao buscar notificações:', err);
    } finally {
      setLoading(false);
    }
  };

  const markAsRead = async (id: string) => {
    setNotifications(prev =>
      prev.map(n => n.id === id ? { ...n, visualizada: true } : n)
    );
    // TODO: Update in Supabase
  };

  const markAllAsRead = async () => {
    setNotifications(prev =>
      prev.map(n => ({ ...n, visualizada: true }))
    );
    // TODO: Update in Supabase
  };

  const deleteNotification = async (id: string) => {
    setNotifications(prev => prev.filter(n => n.id !== id));
    // TODO: Delete from Supabase
  };

  const getCategoryColor = (categoria: string) => {
    const colors = {
      INFO: 'text-blue-600 bg-blue-50 border-blue-200',
      SUCESSO: 'text-emerald-600 bg-emerald-50 border-emerald-200',
      ALERTA: 'text-amber-600 bg-amber-50 border-amber-200',
      URGENTE: 'text-red-600 bg-red-50 border-red-200'
    };
    return colors[categoria as keyof typeof colors] || colors.INFO;
  };

  const getRelativeTime = (dateString: string) => {
    const date = new Date(dateString);
    const now = new Date();
    const diffInHours = Math.floor((now.getTime() - date.getTime()) / (1000 * 60 * 60));
    
    if (diffInHours < 1) return 'Agora há pouco';
    if (diffInHours < 24) return `${diffInHours}h atrás`;
    const diffInDays = Math.floor(diffInHours / 24);
    if (diffInDays === 1) return 'Ontem';
    if (diffInDays < 7) return `${diffInDays} dias atrás`;
    return date.toLocaleDateString('pt-BR');
  };

  const filteredNotifications = filter === 'unread'
    ? notifications.filter(n => !n.visualizada)
    : notifications;

  return (
    <div className="relative" ref={panelRef}>
      {/* Trigger Button */}
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="relative p-2 hover:bg-gray-100 rounded-lg transition-colors"
      >
        <Bell className="w-5 h-5 text-gray-600" />
        {unreadCount > 0 && (
          <span className="absolute top-1 right-1 w-5 h-5 bg-red-500 text-white text-xs font-bold rounded-full flex items-center justify-center">
            {unreadCount > 9 ? '9+' : unreadCount}
          </span>
        )}
      </button>

      {/* Panel */}
      {isOpen && (
        <div className="absolute right-0 mt-2 w-96 bg-white border border-gray-200 rounded-lg shadow-lg z-50">
          {/* Header */}
          <div className="p-4 border-b border-gray-200">
            <div className="flex items-center justify-between mb-3">
              <h3 className="text-base font-semibold text-gray-900">Notificações</h3>
              <button
                onClick={() => setIsOpen(false)}
                className="p-1 hover:bg-gray-100 rounded transition-colors"
              >
                <X className="w-4 h-4 text-gray-500" />
              </button>
            </div>

            {/* Filters */}
            <div className="flex items-center gap-2">
              <button
                onClick={() => setFilter('all')}
                className={`px-3 py-1.5 text-xs font-medium rounded-md transition-colors ${
                  filter === 'all'
                    ? 'bg-emerald-100 text-emerald-700'
                    : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
                }`}
              >
                Todas ({notifications.length})
              </button>
              <button
                onClick={() => setFilter('unread')}
                className={`px-3 py-1.5 text-xs font-medium rounded-md transition-colors ${
                  filter === 'unread'
                    ? 'bg-emerald-100 text-emerald-700'
                    : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
                }`}
              >
                Não lidas ({unreadCount})
              </button>
              
              {unreadCount > 0 && (
                <button
                  onClick={markAllAsRead}
                  className="ml-auto text-xs text-emerald-600 hover:text-emerald-700 font-medium"
                >
                  Marcar todas como lida
                </button>
              )}
            </div>
          </div>

          {/* List */}
          <div className="max-h-[500px] overflow-y-auto">
            {loading ? (
              <div className="p-8 text-center">
                <div className="w-8 h-8 border-2 border-emerald-600 border-t-transparent rounded-full animate-spin mx-auto mb-3"></div>
                <p className="text-sm text-gray-500">Carregando...</p>
              </div>
            ) : filteredNotifications.length === 0 ? (
              <div className="p-8 text-center">
                <Bell className="w-12 h-12 text-gray-300 mx-auto mb-3" />
                <p className="text-sm font-medium text-gray-900 mb-1">
                  {filter === 'unread' ? 'Tudo em dia!' : 'Nenhuma notificação'}
                </p>
                <p className="text-xs text-gray-500">
                  {filter === 'unread' 
                    ? 'Você não tem notificações não lidas'
                    : 'Você será notificado quando houver novidades'
                  }
                </p>
              </div>
            ) : (
              <div className="divide-y divide-gray-100">
                {filteredNotifications.map((notification) => (
                  <div
                    key={notification.id}
                    className={`p-4 hover:bg-gray-50 transition-colors cursor-pointer ${
                      !notification.visualizada ? 'bg-blue-50/30' : ''
                    }`}
                    onClick={() => {
                      markAsRead(notification.id);
                      if (notification.link_acao) {
                        window.location.href = notification.link_acao;
                      }
                    }}
                  >
                    <div className="flex gap-3">
                      {/* Status Indicator */}
                      <div className="flex-shrink-0">
                        {!notification.visualizada ? (
                          <div className="w-2 h-2 bg-emerald-600 rounded-full mt-1.5"></div>
                        ) : (
                          <div className="w-2 h-2 bg-transparent rounded-full mt-1.5"></div>
                        )}
                      </div>

                      {/* Content */}
                      <div className="flex-1 min-w-0">
                        <div className="flex items-start justify-between gap-2 mb-1">
                          <p className={`text-sm font-semibold ${
                            !notification.visualizada ? 'text-gray-900' : 'text-gray-700'
                          }`}>
                            {notification.titulo}
                          </p>
                          <span className={`text-xs px-2 py-0.5 rounded border ${getCategoryColor(notification.categoria)}`}>
                            {notification.categoria}
                          </span>
                        </div>
                        
                        <p className="text-sm text-gray-600 mb-2 line-clamp-2">
                          {notification.conteudo}
                        </p>
                        
                        <div className="flex items-center justify-between">
                          <span className="text-xs text-gray-500">
                            {getRelativeTime(notification.created_at)}
                          </span>
                          
                          <div className="flex gap-1">
                            {!notification.visualizada && (
                              <button
                                onClick={(e) => {
                                  e.stopPropagation();
                                  markAsRead(notification.id);
                                }}
                                className="p-1 hover:bg-white rounded transition-colors"
                                title="Marcar como lida"
                              >
                                <Check className="w-3.5 h-3.5 text-gray-500" />
                              </button>
                            )}
                            <button
                              onClick={(e) => {
                                e.stopPropagation();
                                deleteNotification(notification.id);
                              }}
                              className="p-1 hover:bg-white rounded transition-colors"
                              title="Excluir"
                            >
                              <Trash2 className="w-3.5 h-3.5 text-gray-500" />
                            </button>
                          </div>
                        </div>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>

          {/* Footer */}
          {filteredNotifications.length > 0 && (
            <div className="p-3 border-t border-gray-200 bg-gray-50">
              <Button
                variant="ghost"
                size="sm"
                className="w-full text-emerald-600 hover:text-emerald-700 hover:bg-emerald-50"
                onClick={() => {
                  window.location.href = '/notifications';
                  setIsOpen(false);
                }}
              >
                Ver todas as notificações
              </Button>
            </div>
          )}
        </div>
      )}
    </div>
  );
}
