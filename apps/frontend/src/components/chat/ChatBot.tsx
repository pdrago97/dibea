'use client';

import { useState, useRef, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Badge } from '@/components/ui/badge';
import {
  MessageCircle,
  X,
  Send,
  Bot,
  User,
  Minimize2,
  Maximize2,
  Sparkles,
  Heart,
  Home,
  FileText,
  Phone
} from 'lucide-react';

interface Message {
  id: string;
  content: string;
  sender: 'user' | 'bot';
  timestamp: Date;
  type?: 'text' | 'quick-reply' | 'action';
  actions?: Array<{
    label: string;
    action: string;
    icon?: React.ReactNode;
  }>;
}

interface ChatBotProps {
  className?: string;
}

export function ChatBot({ className }: ChatBotProps) {
  const [isOpen, setIsOpen] = useState(false);
  const [isMinimized, setIsMinimized] = useState(false);
  const [messages, setMessages] = useState<Message[]>([
    {
      id: '1',
      content: 'Olá! Sou a IA do DIBEA 🐾 Como posso ajudá-lo hoje?',
      sender: 'bot',
      timestamp: new Date(),
      type: 'quick-reply',
      actions: [
        { label: 'Adotar um animal', action: 'adoption', icon: <Heart className="w-4 h-4" /> },
        { label: 'Meus processos', action: 'processes', icon: <FileText className="w-4 h-4" /> },
        { label: 'Documentação', action: 'docs', icon: <FileText className="w-4 h-4" /> },
        { label: 'Contato', action: 'contact', icon: <Phone className="w-4 h-4" /> }
      ]
    }
  ]);
  const [inputMessage, setInputMessage] = useState('');
  const [isTyping, setIsTyping] = useState(false);
  const [unreadCount, setUnreadCount] = useState(0);
  const messagesEndRef = useRef<HTMLDivElement>(null);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  const handleSendMessage = async () => {
    if (!inputMessage.trim()) return;

    const userMessage: Message = {
      id: Date.now().toString(),
      content: inputMessage,
      sender: 'user',
      timestamp: new Date()
    };

    setMessages(prev => [...prev, userMessage]);
    setInputMessage('');
    setIsTyping(true);

    // Simular resposta da IA (aqui você integraria com sua API de IA)
    setTimeout(() => {
      const botMessage = generateBotResponse(inputMessage);
      setMessages(prev => [...prev, botMessage]);
      setIsTyping(false);
    }, 1000 + Math.random() * 2000);
  };

  const generateBotResponse = (userInput: string): Message => {
    const input = userInput.toLowerCase();

    if (input.includes('adoção') || input.includes('adotar')) {
      return {
        id: (Date.now() + 1).toString(),
        content: 'Ótimo! Vou ajudá-lo com o processo de adoção 🐕',
        sender: 'bot',
        timestamp: new Date(),
        type: 'quick-reply',
        actions: [
          { label: 'Ver animais disponíveis', action: 'view-animals', icon: <Heart className="w-4 h-4" /> },
          { label: 'Requisitos para adoção', action: 'requirements', icon: <FileText className="w-4 h-4" /> },
          { label: 'Iniciar processo', action: 'start-process', icon: <Sparkles className="w-4 h-4" /> }
        ]
      };
    }

    if (input.includes('documento') || input.includes('documentação')) {
      return {
        id: (Date.now() + 1).toString(),
        content: 'Documentos necessários para adoção:\n\n📋 RG e CPF\n🏠 Comprovante de residência\n💰 Comprovante de renda\n📝 Termo de responsabilidade\n\nTodos devem estar atualizados!',
        sender: 'bot',
        timestamp: new Date()
      };
    }

    if (input.includes('processo') || input.includes('status')) {
      return {
        id: (Date.now() + 1).toString(),
        content: 'Você pode acompanhar seus processos no dashboard 📊',
        sender: 'bot',
        timestamp: new Date(),
        type: 'quick-reply',
        actions: [
          { label: 'Ver meus processos', action: 'my-processes', icon: <FileText className="w-4 h-4" /> },
          { label: 'Ir para dashboard', action: 'dashboard', icon: <Home className="w-4 h-4" /> }
        ]
      };
    }

    return {
      id: (Date.now() + 1).toString(),
      content: 'Como posso ajudá-lo? 🤔',
      sender: 'bot',
      timestamp: new Date(),
      type: 'quick-reply',
      actions: [
        { label: 'Adotar animal', action: 'adoption', icon: <Heart className="w-4 h-4" /> },
        { label: 'Documentos', action: 'docs', icon: <FileText className="w-4 h-4" /> },
        { label: 'Contato', action: 'contact', icon: <Phone className="w-4 h-4" /> }
      ]
    };
  };

  const handleQuickAction = (action: string) => {
    let response = '';

    switch (action) {
      case 'adoption':
        response = 'Quero adotar um animal';
        break;
      case 'processes':
        response = 'Ver meus processos';
        break;
      case 'docs':
        response = 'Preciso de informações sobre documentação';
        break;
      case 'contact':
        response = 'Preciso de contato';
        break;
      case 'view-animals':
        window.open('/animals', '_blank');
        return;
      case 'my-processes':
        window.open('/citizen/processes', '_blank');
        return;
      case 'dashboard':
        window.open('/dashboard', '_blank');
        return;
      default:
        response = action;
    }

    if (response) {
      setInputMessage(response);
      setTimeout(() => handleSendMessage(), 100);
    }
  };

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSendMessage();
    }
  };

  if (!isOpen) {
    return (
      <div className={`fixed bottom-6 right-6 z-50 ${className}`}>
        <div className="relative">
          <Button
            onClick={() => {
              setIsOpen(true);
              setUnreadCount(0);
            }}
            size="lg"
            className="rounded-full w-14 h-14 bg-blue-600 hover:bg-blue-700 shadow-lg hover:shadow-xl transition-all duration-300 animate-pulse"
          >
            <MessageCircle className="w-6 h-6" />
          </Button>
          {unreadCount > 0 && (
            <Badge
              variant="destructive"
              className="absolute -top-2 -right-2 w-6 h-6 rounded-full flex items-center justify-center text-xs"
            >
              {unreadCount > 9 ? '9+' : unreadCount}
            </Badge>
          )}
        </div>
      </div>
    );
  }

  return (
    <div className={`fixed bottom-6 right-6 z-50 ${className}`}>
      <Card className={`w-80 shadow-2xl border-0 transition-all duration-300 ${
        isMinimized ? 'h-14' : 'h-96'
      }`}>
        <CardHeader className="p-3 bg-gradient-to-r from-blue-600 to-blue-700 text-white rounded-t-lg">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-2">
              <div className="relative">
                <Bot className="w-5 h-5" />
                <div className="absolute -top-1 -right-1 w-2 h-2 bg-green-400 rounded-full animate-pulse"></div>
              </div>
              <div>
                <CardTitle className="text-sm font-medium">
                  IA DIBEA
                </CardTitle>
                <p className="text-xs opacity-90">Assistente Virtual</p>
              </div>
            </div>
            <div className="flex items-center space-x-1">
              <Button
                variant="ghost"
                size="sm"
                onClick={() => setIsMinimized(!isMinimized)}
                className="text-white hover:bg-blue-700 p-1 h-auto"
              >
                {isMinimized ? (
                  <Maximize2 className="w-4 h-4" />
                ) : (
                  <Minimize2 className="w-4 h-4" />
                )}
              </Button>
              <Button
                variant="ghost"
                size="sm"
                onClick={() => setIsOpen(false)}
                className="text-white hover:bg-blue-700 p-1 h-auto"
              >
                <X className="w-4 h-4" />
              </Button>
            </div>
          </div>
        </CardHeader>

        {!isMinimized && (
          <CardContent className="p-0 flex flex-col h-80">
            <ScrollArea className="flex-1 p-3">
              <div className="space-y-3">
                {messages.map((message) => (
                  <div key={message.id} className="space-y-2">
                    <div
                      className={`flex ${
                        message.sender === 'user' ? 'justify-end' : 'justify-start'
                      }`}
                    >
                      <div
                        className={`max-w-[80%] p-3 rounded-lg ${
                          message.sender === 'user'
                            ? 'bg-blue-600 text-white'
                            : 'bg-gray-100 text-gray-900'
                        }`}
                      >
                        <div className="flex items-start space-x-2">
                          {message.sender === 'bot' && (
                            <Bot className="w-4 h-4 mt-0.5 flex-shrink-0 text-blue-600" />
                          )}
                          {message.sender === 'user' && (
                            <User className="w-4 h-4 mt-0.5 flex-shrink-0" />
                          )}
                          <div className="text-sm whitespace-pre-line">{message.content}</div>
                        </div>
                      </div>
                    </div>

                    {/* Quick Actions */}
                    {message.actions && message.actions.length > 0 && (
                      <div className="flex justify-start">
                        <div className="max-w-[80%] space-y-2">
                          <div className="grid grid-cols-1 gap-2">
                            {message.actions.map((action, index) => (
                              <Button
                                key={index}
                                variant="outline"
                                size="sm"
                                onClick={() => handleQuickAction(action.action)}
                                className="justify-start text-left h-auto p-2 bg-white hover:bg-gray-50 border-gray-200"
                              >
                                <div className="flex items-center space-x-2">
                                  {action.icon}
                                  <span className="text-xs">{action.label}</span>
                                </div>
                              </Button>
                            ))}
                          </div>
                        </div>
                      </div>
                    )}
                  </div>
                ))}
                
                {isTyping && (
                  <div className="flex justify-start">
                    <div className="bg-gray-100 text-gray-900 p-2 rounded-lg">
                      <div className="flex items-center space-x-2">
                        <Bot className="w-4 h-4" />
                        <div className="flex space-x-1">
                          <div className="w-2 h-2 bg-gray-400 rounded-full animate-bounce"></div>
                          <div className="w-2 h-2 bg-gray-400 rounded-full animate-bounce" style={{ animationDelay: '0.1s' }}></div>
                          <div className="w-2 h-2 bg-gray-400 rounded-full animate-bounce" style={{ animationDelay: '0.2s' }}></div>
                        </div>
                      </div>
                    </div>
                  </div>
                )}
              </div>
              <div ref={messagesEndRef} />
            </ScrollArea>

            <div className="p-3 border-t">
              <div className="flex space-x-2">
                <Input
                  value={inputMessage}
                  onChange={(e) => setInputMessage(e.target.value)}
                  onKeyPress={handleKeyPress}
                  placeholder="Digite sua mensagem..."
                  className="flex-1"
                />
                <Button
                  onClick={handleSendMessage}
                  disabled={!inputMessage.trim() || isTyping}
                  size="sm"
                  className="bg-blue-600 hover:bg-blue-700"
                >
                  <Send className="w-4 h-4" />
                </Button>
              </div>
            </div>
          </CardContent>
        )}
      </Card>
    </div>
  );
}
