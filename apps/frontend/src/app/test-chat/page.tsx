'use client';

import { useState } from 'react';

export default function TestChatPage() {
  const [message, setMessage] = useState('');
  const [response, setResponse] = useState('');
  const [loading, setLoading] = useState(false);

  const testServerEndpoint = 'http://localhost:3005/api/test/supabase';

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setResponse('');

    try {
      console.log('🔄 Testando servidor...', testServerEndpoint);
      console.log('📤 Mensagem:', message);

      const res = await fetch(testServerEndpoint, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          userInput: message,
          sessionId: `test-${Date.now()}`,
          timestamp: new Date().toISOString()
        }),
      });

      console.log('📡 Status:', res.status, res.statusText);

      if (res.ok) {
        const data = await res.json();
        console.log('✅ Resposta:', data);
        setResponse(JSON.stringify(data, null, 2));
      } else {
        const errorText = await res.text();
        console.error('❌ Erro:', errorText);
        setResponse(`Erro ${res.status}: ${errorText}`);
      }
    } catch (error) {
      console.error('❌ Erro na requisição:', error);
      setResponse(`Erro: ${error.message}`);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="container mx-auto p-4">
      <h1 className="text-2xl font-bold mb-4">Teste de Chat - Servidor Backend</h1>
      
      <form onSubmit={handleSubmit} className="mb-4">
        <div className="flex gap-2">
          <input
            type="text"
            value={message}
            onChange={(e) => setMessage(e.target.value)}
            placeholder="Digite sua mensagem..."
            className="flex-1 p-2 border rounded"
            disabled={loading}
          />
          <button
            type="submit"
            disabled={loading || !message.trim()}
            className="px-4 py-2 bg-blue-500 text-white rounded disabled:opacity-50"
          >
            {loading ? 'Enviando...' : 'Enviar'}
          </button>
        </div>
      </form>

      {response && (
        <div className="mt-4">
          <h2 className="text-lg font-semibold mb-2">Resposta:</h2>
          <pre className="bg-gray-100 p-4 rounded overflow-auto text-sm">
            {response}
          </pre>
        </div>
      )}

      <div className="mt-4 text-sm text-gray-600">
        <p><strong>Endpoint:</strong> {testServerEndpoint}</p>
        <p><strong>Método:</strong> POST</p>
        <p><strong>Headers:</strong> Content-Type: application/json</p>
      </div>
    </div>
  );
}
