'use client';

import React, { useState, useRef, useEffect } from 'react';
import { Send, Bot, User, Loader2, AlertCircle, MessageSquare, X, Minimize2, Maximize2 } from 'lucide-react';
import { chatService } from '@/services/chatService';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { Alert, AlertDescription } from '@/components/ui/alert';

interface Message {
  id: string;
  type: 'user' | 'agent';
  content: string;
  timestamp: Date;
  agent?: string;
  actions?: Array<{
    label: string;
    action: string;
  }>;
}

interface FloatingChatProps {
  userRole?: 'ADMIN' | 'FUNCIONARIO' | 'VETERINARIO' | 'CIDADAO';
  userName?: string;
}

export function FloatingChat({ userRole = 'CIDADAO', userName }: FloatingChatProps) {
  const [isOpen, setIsOpen] = useState(false);
  const [isMinimized, setIsMinimized] = useState(false);
  const [messages, setMessages] = useState<Message[]>([]);
  const [inputValue, setInputValue] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [unreadCount, setUnreadCount] = useState(0);
  const messagesEndRef = useRef<HTMLDivElement>(null);

  // Mensagem inicial baseada no perfil
  const getInitialMessage = () => {
    const greetings = {
      ADMIN: '👋 Olá Admin! Posso te ajudar com gestão de usuários, animais, relatórios e configurações do sistema.',
      FUNCIONARIO: '👋 Olá! Posso te ajudar com cadastro de animais, processos de adoção e gestão de documentos.',
      VETERINARIO: '🩺 Olá! Posso te ajudar com procedimentos veterinários, histórico médico e agendamentos.',
      CIDADAO: '❤️ Olá! Posso te ajudar a encontrar o pet ideal para adoção e tirar suas dúvidas sobre o processo.'
    };

    return greetings[userRole] || greetings.CIDADAO;
  };

  useEffect(() => {
    if (messages.length === 0) {
      setMessages([{
        id: '1',
        type: 'agent',
        content: getInitialMessage(),
        timestamp: new Date()
      }]);
    }
  }, [userRole]);

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  // Incrementar contador de não lidas quando chat está fechado
  useEffect(() => {
    if (!isOpen && messages.length > 1 && messages[messages.length - 1].type === 'agent') {
      setUnreadCount(prev => prev + 1);
    }
  }, [messages, isOpen]);

  // Resetar contador ao abrir
  useEffect(() => {
    if (isOpen) {
      setUnreadCount(0);
    }
  }, [isOpen]);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  const sendMessage = async () => {
    if (!inputValue.trim() || isLoading) return;

    const userMessage: Message = {
      id: Date.now().toString(),
      type: 'user',
      content: inputValue,
      timestamp: new Date()
    };

    setMessages(prev => [...prev, userMessage]);
    setInputValue('');
    setIsLoading(true);
    setError(null);

    try {
      const response = await chatService.sendMessage(
        inputValue,
        messages.slice(-5).map(msg => ({
          id: msg.id,
          content: msg.content,
          sender: msg.type === 'user' ? 'user' : 'bot',
          timestamp: msg.timestamp,
          agent: msg.agent
        }))
      );

      const agentMessage: Message = {
        id: (Date.now() + 1).toString(),
        type: 'agent',
        content: response.message || 'Resposta recebida do sistema.',
        timestamp: new Date(),
        agent: response.agent || 'DIBEA AI',
        actions: response.actions
      };

      setMessages(prev => [...prev, agentMessage]);
    } catch (error) {
      console.error('❌ Erro ao enviar mensagem:', error);
      setError('Erro ao comunicar com o sistema. Tente novamente.');
      
      const errorMessage: Message = {
        id: (Date.now() + 1).toString(),
        type: 'agent',
        content: '❌ Desculpe, ocorreu um erro. Por favor, tente novamente.',
        timestamp: new Date()
      };
      
      setMessages(prev => [...prev, errorMessage]);
    } finally {
      setIsLoading(false);
    }
  };

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      sendMessage();
    }
  };

  // Botão flutuante
  if (!isOpen) {
    return (
      <button
        onClick={() => setIsOpen(true)}
        className="fixed bottom-6 right-6 z-50 bg-gradient-to-r from-blue-600 to-blue-700 text-white rounded-full p-4 shadow-lg hover:shadow-xl transition-all duration-300 hover:scale-110 group"
        aria-label="Abrir chat"
      >
        <MessageSquare className="w-6 h-6" />
        {unreadCount > 0 && (
          <span className="absolute -top-1 -right-1 bg-red-500 text-white text-xs font-bold rounded-full w-6 h-6 flex items-center justify-center animate-pulse">
            {unreadCount}
          </span>
        )}
        <span className="absolute right-full mr-3 bg-gray-900 text-white px-3 py-1 rounded-lg text-sm whitespace-nowrap opacity-0 group-hover:opacity-100 transition-opacity">
          Precisa de ajuda?
        </span>
      </button>
    );
  }

  // Chat expandido
  return (
    <div
      className={`fixed z-50 transition-all duration-300 ${
        isMinimized
          ? 'bottom-6 right-6 w-80'
          : 'bottom-6 right-6 w-96 h-[600px]'
      }`}
    >
      <Card className="h-full flex flex-col shadow-2xl">
        {/* Header */}
        <CardHeader className="bg-gradient-to-r from-blue-600 to-blue-700 text-white p-4 rounded-t-lg">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <Bot className="w-5 h-5" />
              <div>
                <CardTitle className="text-sm font-semibold">DIBEA AI Assistant</CardTitle>
                <p className="text-xs opacity-90">
                  {userName ? `Olá, ${userName}` : 'Como posso ajudar?'}
                </p>
              </div>
            </div>
            <div className="flex items-center gap-2">
              <Button
                variant="ghost"
                size="sm"
                onClick={() => setIsMinimized(!isMinimized)}
                className="text-white hover:bg-white/20 h-8 w-8 p-0"
              >
                {isMinimized ? <Maximize2 className="w-4 h-4" /> : <Minimize2 className="w-4 h-4" />}
              </Button>
              <Button
                variant="ghost"
                size="sm"
                onClick={() => setIsOpen(false)}
                className="text-white hover:bg-white/20 h-8 w-8 p-0"
              >
                <X className="w-4 h-4" />
              </Button>
            </div>
          </div>
        </CardHeader>

        {!isMinimized && (
          <>
            {/* Messages */}
            <CardContent className="flex-1 overflow-y-auto p-4 space-y-3 bg-gray-50">
              {messages.map((message) => (
                <div
                  key={message.id}
                  className={`flex ${message.type === 'user' ? 'justify-end' : 'justify-start'}`}
                >
                  <div
                    className={`max-w-[80%] px-3 py-2 rounded-lg ${
                      message.type === 'user'
                        ? 'bg-blue-600 text-white'
                        : 'bg-white text-gray-900 shadow-sm border'
                    }`}
                  >
                    <div className="flex items-start gap-2">
                      {message.type === 'agent' && (
                        <Bot className="w-4 h-4 text-blue-600 mt-0.5 flex-shrink-0" />
                      )}
                      <div className="flex-1">
                        <p className="text-sm whitespace-pre-wrap">{message.content}</p>
                        {message.actions && message.actions.length > 0 && (
                          <div className="mt-2 space-y-1">
                            {message.actions.map((action, idx) => (
                              <Button
                                key={idx}
                                variant="outline"
                                size="sm"
                                className="w-full text-xs"
                                onClick={() => setInputValue(action.label)}
                              >
                                {action.label}
                              </Button>
                            ))}
                          </div>
                        )}
                      </div>
                    </div>
                    <p className="text-xs mt-1 opacity-50">
                      {message.timestamp.toLocaleTimeString('pt-BR', { 
                        hour: '2-digit', 
                        minute: '2-digit' 
                      })}
                    </p>
                  </div>
                </div>
              ))}
              {isLoading && (
                <div className="flex justify-start">
                  <div className="bg-white text-gray-900 shadow-sm border px-3 py-2 rounded-lg">
                    <div className="flex items-center gap-2">
                      <Loader2 className="w-4 h-4 text-blue-600 animate-spin" />
                      <p className="text-sm">Digitando...</p>
                    </div>
                  </div>
                </div>
              )}
              <div ref={messagesEndRef} />
            </CardContent>

            {/* Error Alert */}
            {error && (
              <div className="px-4 pb-2">
                <Alert variant="destructive" className="py-2">
                  <AlertCircle className="h-4 w-4" />
                  <AlertDescription className="text-xs">{error}</AlertDescription>
                </Alert>
              </div>
            )}

            {/* Input */}
            <div className="border-t p-3 bg-white rounded-b-lg">
              <div className="flex gap-2">
                <Input
                  value={inputValue}
                  onChange={(e) => setInputValue(e.target.value)}
                  onKeyPress={handleKeyPress}
                  placeholder="Digite sua mensagem..."
                  disabled={isLoading}
                  className="flex-1 text-sm"
                />
                <Button
                  onClick={sendMessage}
                  disabled={!inputValue.trim() || isLoading}
                  size="sm"
                  className="bg-blue-600 hover:bg-blue-700"
                >
                  {isLoading ? (
                    <Loader2 className="w-4 h-4 animate-spin" />
                  ) : (
                    <Send className="w-4 h-4" />
                  )}
                </Button>
              </div>
            </div>
          </>
        )}
      </Card>
    </div>
  );
}

