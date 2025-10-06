"use client";

import React, { useState, useRef, useEffect } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Alert, AlertDescription } from "@/components/ui/alert";
import {
  Send,
  Bot,
  User,
  Loader2,
  MessageSquare,
  Zap,
  Brain,
  FileText,
  Heart,
  Users,
  BarChart3,
  AlertCircle,
  CheckCircle,
  Clock,
  Trash2,
} from "lucide-react";

interface ChatMessage {
  id: string;
  content: string;
  sender: "user" | "bot";
  timestamp: Date;
  type?: "text" | "quick-reply" | "action" | "system";
  agent?: string;
  status?: "sending" | "success" | "error";
  actions?: Array<{
    label: string;
    action: string;
    icon?: React.ReactNode;
    data?: any;
  }>;
  metadata?: {
    animalId?: string;
    processId?: string;
    documentId?: string;
    sessionId?: string;
  };
}

interface ChatInterfaceProps {
  title?: string;
  placeholder?: string;
  endpoint?: string;
  className?: string;
}

export function ChatInterface({
  title = "Chat DIBEA",
  placeholder = "Digite sua mensagem...",
  endpoint = "/api/chat/send",
  className = "",
}: ChatInterfaceProps) {
  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [inputMessage, setInputMessage] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [isConnected, setIsConnected] = useState(true);
  const messagesEndRef = useRef<HTMLDivElement>(null);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  const getAgentIcon = (agent?: string) => {
    switch (agent) {
      case "ANIMAL_AGENT":
        return <Heart className="w-4 h-4 text-green-600" />;
      case "PROCEDURE_AGENT":
        return <FileText className="w-4 h-4 text-blue-600" />;
      case "DOCUMENT_AGENT":
        return <FileText className="w-4 h-4 text-purple-600" />;
      case "TUTOR_AGENT":
        return <Users className="w-4 h-4 text-orange-600" />;
      case "GENERAL_AGENT":
        return <BarChart3 className="w-4 h-4 text-gray-600" />;
      default:
        return <Bot className="w-4 h-4 text-blue-600" />;
    }
  };

  const getAgentName = (agent?: string) => {
    switch (agent) {
      case "ANIMAL_AGENT":
        return "Agente Animal";
      case "PROCEDURE_AGENT":
        return "Agente Procedimentos";
      case "DOCUMENT_AGENT":
        return "Agente Documentos";
      case "TUTOR_AGENT":
        return "Agente Tutores";
      case "GENERAL_AGENT":
        return "Agente Geral";
      default:
        return "DIBEA Assistant";
    }
  };

  const sendMessage = async () => {
    if (!inputMessage.trim() || isLoading) return;

    const userMessage: ChatMessage = {
      id: Date.now().toString(),
      content: inputMessage,
      sender: "user",
      timestamp: new Date(),
      status: "sending",
    };

    setMessages((prev) => [...prev, userMessage]);
    setInputMessage("");
    setIsLoading(true);

    try {
      // Simulação de resposta do chatbot para desenvolvimento
      await new Promise((resolve) => setTimeout(resolve, 1000));

      const botMessage: ChatMessage = {
        id: (Date.now() + 1).toString(),
        content:
          "Olá! Sou o assistente do DIBEA. No momento estou em desenvolvimento. Em breve poderei ajudar você com adoções de animais.",
        sender: "bot",
        timestamp: new Date(),
        status: "success",
      };

      setMessages((prev) => [
        ...prev.map((msg) =>
          msg.id === userMessage.id
            ? { ...msg, status: "success" as const }
            : msg,
        ),
        botMessage,
      ]);

      setIsConnected(true);
    } catch (error) {
      console.error("Erro ao enviar mensagem:", error);

      setMessages((prev) =>
        prev.map((msg) =>
          msg.id === userMessage.id
            ? { ...msg, status: "error" as const }
            : msg,
        ),
      );

      const errorMessage: ChatMessage = {
        id: (Date.now() + 2).toString(),
        content: "Desculpe, ocorreu um erro ao processar sua mensagem.",
        sender: "bot",
        timestamp: new Date(),
        status: "error",
      };

      setMessages((prev) => [...prev, errorMessage]);
      setIsConnected(false);
    } finally {
      setIsLoading(false);
    }
  };

  const clearChat = () => {
    setMessages([]);
  };

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault();
      sendMessage();
    }
  };

  return (
    <Card className={`flex flex-col h-[600px] ${className}`}>
      <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-4">
        <CardTitle className="flex items-center space-x-2">
          <MessageSquare className="w-5 h-5" />
          <span>{title}</span>
        </CardTitle>
        <div className="flex items-center space-x-2">
          <Badge
            variant={isConnected ? "default" : "destructive"}
            className="flex items-center space-x-1"
          >
            {isConnected ? (
              <>
                <CheckCircle className="w-3 h-3" />
                <span>Online</span>
              </>
            ) : (
              <>
                <AlertCircle className="w-3 h-3" />
                <span>Offline</span>
              </>
            )}
          </Badge>
          <Button
            variant="outline"
            size="sm"
            onClick={clearChat}
            disabled={messages.length === 0}
          >
            <Trash2 className="w-4 h-4" />
          </Button>
        </div>
      </CardHeader>

      <CardContent className="flex flex-col flex-1 space-y-4">
        {/* Messages Area */}
        <div className="flex-1 overflow-y-auto space-y-4 p-4 bg-gray-50 rounded-lg">
          {messages.length === 0 ? (
            <div className="text-center text-gray-500 py-8">
              <Bot className="w-12 h-12 mx-auto mb-4 text-gray-400" />
              <p>Olá! Sou o assistente DIBEA.</p>
              <p className="text-sm">Como posso ajudá-lo hoje?</p>
            </div>
          ) : (
            messages.map((message) => (
              <div
                key={message.id}
                className={`flex ${message.sender === "user" ? "justify-end" : "justify-start"}`}
              >
                <div
                  className={`max-w-[80%] rounded-lg p-3 ${
                    message.sender === "user"
                      ? "bg-blue-600 text-white"
                      : "bg-white border shadow-sm"
                  }`}
                >
                  {message.sender === "bot" && (
                    <div className="flex items-center space-x-2 mb-2">
                      {getAgentIcon(message.agent)}
                      <span className="text-xs font-medium text-gray-600">
                        {getAgentName(message.agent)}
                      </span>
                      {message.status === "error" && (
                        <AlertCircle className="w-3 h-3 text-red-500" />
                      )}
                    </div>
                  )}

                  <p className="text-sm">{message.content}</p>

                  <div className="flex items-center justify-between mt-2">
                    <span
                      className={`text-xs ${
                        message.type === "user"
                          ? "text-blue-100"
                          : "text-gray-500"
                      }`}
                    >
                      {new Date(message.timestamp).toLocaleTimeString("pt-BR", {
                        hour: "2-digit",
                        minute: "2-digit",
                        hour12: false,
                      })}
                    </span>

                    {message.type === "user" && (
                      <div className="flex items-center space-x-1">
                        {message.status === "sending" && (
                          <Loader2 className="w-3 h-3 animate-spin" />
                        )}
                        {message.status === "success" && (
                          <CheckCircle className="w-3 h-3 text-blue-200" />
                        )}
                        {message.status === "error" && (
                          <AlertCircle className="w-3 h-3 text-red-300" />
                        )}
                      </div>
                    )}
                  </div>
                </div>
              </div>
            ))
          )}
          <div ref={messagesEndRef} />
        </div>

        {/* Input Area */}
        <div className="flex space-x-2">
          <Input
            value={inputMessage}
            onChange={(e) => setInputMessage(e.target.value)}
            onKeyPress={handleKeyPress}
            placeholder={placeholder}
            disabled={isLoading}
            className="flex-1"
          />
          <Button
            onClick={sendMessage}
            disabled={!inputMessage.trim() || isLoading}
            size="icon"
          >
            {isLoading ? (
              <Loader2 className="w-4 h-4 animate-spin" />
            ) : (
              <Send className="w-4 h-4" />
            )}
          </Button>
        </div>

        {/* Status */}
        {!isConnected && (
          <Alert>
            <AlertCircle className="h-4 w-4" />
            <AlertDescription>
              Problemas de conexão com o chatbot. Verifique sua internet ou
              tente novamente.
            </AlertDescription>
          </Alert>
        )}
      </CardContent>
    </Card>
  );
}
