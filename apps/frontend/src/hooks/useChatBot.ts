'use client';

import { useState, useCallback } from 'react';

interface ChatMessage {
  id: string;
  content: string;
  sender: 'user' | 'bot';
  timestamp: Date;
}

interface ChatBotState {
  isOpen: boolean;
  isMinimized: boolean;
  messages: ChatMessage[];
  unreadCount: number;
}

export function useChatBot() {
  const [state, setState] = useState<ChatBotState>({
    isOpen: false,
    isMinimized: false,
    messages: [
      {
        id: '1',
        content: 'Olá! Sou a IA do DIBEA. Como posso ajudá-lo hoje? Posso responder sobre adoção de animais, processos, documentação e muito mais!',
        sender: 'bot',
        timestamp: new Date()
      }
    ],
    unreadCount: 0
  });

  const openChat = useCallback(() => {
    setState(prev => ({
      ...prev,
      isOpen: true,
      unreadCount: 0
    }));
  }, []);

  const closeChat = useCallback(() => {
    setState(prev => ({
      ...prev,
      isOpen: false
    }));
  }, []);

  const toggleMinimize = useCallback(() => {
    setState(prev => ({
      ...prev,
      isMinimized: !prev.isMinimized
    }));
  }, []);

  const addMessage = useCallback((message: Omit<ChatMessage, 'id' | 'timestamp'>) => {
    const newMessage: ChatMessage = {
      ...message,
      id: Date.now().toString(),
      timestamp: new Date()
    };

    setState(prev => ({
      ...prev,
      messages: [...prev.messages, newMessage],
      unreadCount: prev.isOpen ? prev.unreadCount : prev.unreadCount + 1
    }));

    return newMessage;
  }, []);

  const clearMessages = useCallback(() => {
    setState(prev => ({
      ...prev,
      messages: [
        {
          id: '1',
          content: 'Olá! Sou a IA do DIBEA. Como posso ajudá-lo hoje?',
          sender: 'bot',
          timestamp: new Date()
        }
      ]
    }));
  }, []);

  return {
    ...state,
    openChat,
    closeChat,
    toggleMinimize,
    addMessage,
    clearMessages
  };
}
