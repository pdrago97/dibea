'use client';

import React, { useState, useRef, useEffect } from 'react';
import { Send, Bot, User, Loader2, AlertCircle, ExternalLink, FileText, Search, Upload, Camera, BarChart3, Info, BookOpen } from 'lucide-react';
import Link from 'next/link';

interface Action {
  type: 'form' | 'search' | 'upload' | 'camera' | 'report' | 'info' | 'guide';
  label: string;
  url: string;
}

interface Message {
  id: string;
  type: 'user' | 'agent';
  content: string;
  timestamp: Date;
  agent?: string;
  confidence?: number;
  actions?: Action[];
}

export default function AgentChatPage() {
  const [messages, setMessages] = useState<Message[]>([
    {
      id: '1',
      type: 'agent',
      content: 'Olá! Sou o assistente inteligente do DIBEA. Posso te ajudar com:\n\n• 🐕 Cadastro de animais\n• 💉 Registro de procedimentos veterinários\n• 📄 Upload de documentos\n• 👥 Gestão de tutores\n• 📊 Consultas e relatórios\n\nComo posso te ajudar hoje?',
      timestamp: new Date()
    }
  ]);
  const [inputValue, setInputValue] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const messagesEndRef = useRef<HTMLDivElement>(null);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

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
      // Call local agent endpoint
      const response = await fetch('/api/v1/agents/chat', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${localStorage.getItem('token')}`
        },
        body: JSON.stringify({
          message: inputValue,
          context: {
            previousMessages: messages.slice(-5), // Last 5 messages for context
            timestamp: new Date().toISOString()
          }
        })
      });

      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }

      const data = await response.json();

      const agentMessage: Message = {
        id: (Date.now() + 1).toString(),
        type: 'agent',
        content: data.response || data.message || 'Resposta recebida do agente.',
        timestamp: new Date(),
        agent: data.agent || 'DIBEA Assistant',
        confidence: data.confidence || 0.95,
        actions: data.actions || []
      };

      setMessages(prev => [...prev, agentMessage]);

    } catch (error) {
      console.error('Erro ao enviar mensagem:', error);
      setError('Erro ao comunicar com o sistema de agentes. Tente novamente.');
      
      const errorMessage: Message = {
        id: (Date.now() + 1).toString(),
        type: 'agent',
        content: 'Desculpe, ocorreu um erro ao processar sua mensagem. Tente novamente em alguns instantes.',
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

  const getActionIcon = (type: string) => {
    switch (type) {
      case 'form': return <FileText className="w-4 h-4" />;
      case 'search': return <Search className="w-4 h-4" />;
      case 'upload': return <Upload className="w-4 h-4" />;
      case 'camera': return <Camera className="w-4 h-4" />;
      case 'report': return <BarChart3 className="w-4 h-4" />;
      case 'info': return <Info className="w-4 h-4" />;
      case 'guide': return <BookOpen className="w-4 h-4" />;
      default: return <ExternalLink className="w-4 h-4" />;
    }
  };

  const renderActions = (actions: Action[]) => {
    if (!actions || actions.length === 0) return null;

    return (
      <div className="mt-3 flex flex-wrap gap-2">
        {actions.map((action, index) => (
          <Link key={index} href={action.url}>
            <button className="inline-flex items-center gap-2 px-3 py-2 bg-blue-50 hover:bg-blue-100 text-blue-700 text-sm rounded-lg border border-blue-200 transition-colors">
              {getActionIcon(action.type)}
              {action.label}
            </button>
          </Link>
        ))}
      </div>
    );
  };

  const formatMessage = (content: string) => {
    return content.split('\n').map((line, index) => (
      <React.Fragment key={index}>
        {line}
        {index < content.split('\n').length - 1 && <br />}
      </React.Fragment>
    ));
  };

  return (
    <div className="min-h-screen bg-gray-50 flex flex-col">
      {/* Header */}
      <div className="bg-white shadow-sm border-b px-6 py-4">
        <div className="max-w-4xl mx-auto">
          <h1 className="text-2xl font-bold text-gray-900 flex items-center gap-2">
            <Bot className="w-8 h-8 text-blue-600" />
            DIBEA AI Agents
          </h1>
          <p className="text-gray-600 mt-1">
            Sistema de agentes conversacionais para gestão veterinária municipal
          </p>
        </div>
      </div>

      {/* Chat Container */}
      <div className="flex-1 max-w-4xl mx-auto w-full flex flex-col">
        {/* Messages */}
        <div className="flex-1 overflow-y-auto p-6 space-y-4">
          {messages.map((message) => (
            <div
              key={message.id}
              className={`flex ${message.type === 'user' ? 'justify-end' : 'justify-start'}`}
            >
              <div
                className={`max-w-xs lg:max-w-md px-4 py-3 rounded-lg ${
                  message.type === 'user'
                    ? 'bg-blue-600 text-white'
                    : 'bg-white text-gray-900 shadow-sm border'
                }`}
              >
                <div className="flex items-start gap-2">
                  {message.type === 'agent' && (
                    <Bot className="w-5 h-5 text-blue-600 mt-0.5 flex-shrink-0" />
                  )}
                  {message.type === 'user' && (
                    <User className="w-5 h-5 text-white mt-0.5 flex-shrink-0" />
                  )}
                  <div className="flex-1">
                    <div className="text-sm">
                      {formatMessage(message.content)}
                    </div>
                    {message.agent && (
                      <div className="mt-2 text-xs opacity-75">
                        Agente: {message.agent} 
                        {message.confidence && ` (${Math.round(message.confidence * 100)}%)`}
                      </div>
                    )}
                    <div className="text-xs opacity-75 mt-1">
                      {message.timestamp.toLocaleTimeString()}
                    </div>
                  </div>
                </div>
                {/* Render actions for agent messages */}
                {message.type === 'agent' && message.actions && renderActions(message.actions)}
              </div>
            </div>
          ))}
          
          {isLoading && (
            <div className="flex justify-start">
              <div className="bg-white text-gray-900 shadow-sm border max-w-xs lg:max-w-md px-4 py-3 rounded-lg">
                <div className="flex items-center gap-2">
                  <Bot className="w-5 h-5 text-blue-600" />
                  <Loader2 className="w-4 h-4 animate-spin" />
                  <span className="text-sm">Processando...</span>
                </div>
              </div>
            </div>
          )}
          
          <div ref={messagesEndRef} />
        </div>

        {/* Error Display */}
        {error && (
          <div className="px-6 py-2">
            <div className="bg-red-50 border border-red-200 rounded-lg p-3 flex items-center gap-2">
              <AlertCircle className="w-5 h-5 text-red-600" />
              <span className="text-red-700 text-sm">{error}</span>
            </div>
          </div>
        )}

        {/* Input */}
        <div className="border-t bg-white p-6">
          <div className="flex gap-3">
            <textarea
              value={inputValue}
              onChange={(e) => setInputValue(e.target.value)}
              onKeyPress={handleKeyPress}
              placeholder="Digite sua mensagem... (Ex: 'Quero cadastrar um novo cão' ou 'Acabei de vacinar o Rex')"
              className="flex-1 resize-none border border-gray-300 rounded-lg px-4 py-3 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              rows={2}
              disabled={isLoading}
            />
            <button
              onClick={sendMessage}
              disabled={!inputValue.trim() || isLoading}
              className="bg-blue-600 text-white px-6 py-3 rounded-lg hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-2 transition-colors"
            >
              {isLoading ? (
                <Loader2 className="w-5 h-5 animate-spin" />
              ) : (
                <Send className="w-5 h-5" />
              )}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
