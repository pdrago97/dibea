'use client';

import { useState } from 'react';
import { Send, CheckCircle, XCircle, Loader2, MessageSquare } from 'lucide-react';

interface TestResult {
  timestamp: string;
  input: string;
  output: any;
  success: boolean;
  duration: number;
  error?: string;
}

export default function TestN8NPage() {
  const [message, setMessage] = useState('');
  const [loading, setLoading] = useState(false);
  const [results, setResults] = useState<TestResult[]>([]);

  const n8nWebhookUrl = 'https://n8n-moveup-u53084.vm.elestio.app/webhook/d0fff20e-124c-49f3-8ccf-a615504c5fc1';

  const testMessages = [
    'Quero adotar um cachorro pequeno',
    'Mostre os animais disponíveis',
    'Quantos animais temos cadastrados?',
    'Buscar cães de porte grande',
    'Ver gatos disponíveis'
  ];

  const handleTest = async (testMessage?: string) => {
    const inputMessage = testMessage || message;
    if (!inputMessage.trim()) return;

    setLoading(true);
    const startTime = Date.now();

    try {
      console.log('🚀 Testando N8N Webhook:', n8nWebhookUrl);
      console.log('📤 Mensagem:', inputMessage);

      const response = await fetch(n8nWebhookUrl, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          chatInput: inputMessage,
          userInput: inputMessage,
          message: inputMessage,
          sessionId: `test-${Date.now()}`,
          timestamp: new Date().toISOString()
        }),
      });

      const duration = Date.now() - startTime;
      const data = await response.json();

      console.log('✅ Resposta recebida:', data);
      console.log(`⏱️ Tempo de resposta: ${duration}ms`);

      const result: TestResult = {
        timestamp: new Date().toISOString(),
        input: inputMessage,
        output: data,
        success: response.ok,
        duration,
      };

      setResults(prev => [result, ...prev]);
      
      if (!testMessage) {
        setMessage('');
      }
    } catch (error: any) {
      console.error('❌ Erro:', error);
      
      const duration = Date.now() - startTime;
      const result: TestResult = {
        timestamp: new Date().toISOString(),
        input: inputMessage,
        output: null,
        success: false,
        duration,
        error: error.message
      };

      setResults(prev => [result, ...prev]);
    } finally {
      setLoading(false);
    }
  };

  const handleQuickTest = (msg: string) => {
    handleTest(msg);
  };

  const clearResults = () => {
    setResults([]);
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 p-8">
      <div className="max-w-6xl mx-auto">
        {/* Header */}
        <div className="bg-white rounded-lg shadow-lg p-6 mb-6">
          <div className="flex items-center gap-3 mb-4">
            <MessageSquare className="w-8 h-8 text-blue-600" />
            <h1 className="text-3xl font-bold text-gray-800">
              🧪 Teste de Integração N8N + Supabase
            </h1>
          </div>
          
          <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
            <p className="text-sm text-blue-800 mb-2">
              <strong>Webhook URL:</strong>
            </p>
            <code className="text-xs bg-white px-2 py-1 rounded border border-blue-300 block overflow-x-auto">
              {n8nWebhookUrl}
            </code>
          </div>
        </div>

        {/* Test Input */}
        <div className="bg-white rounded-lg shadow-lg p-6 mb-6">
          <h2 className="text-xl font-semibold mb-4 text-gray-800">
            📝 Enviar Mensagem de Teste
          </h2>
          
          <div className="flex gap-2 mb-4">
            <input
              type="text"
              value={message}
              onChange={(e) => setMessage(e.target.value)}
              onKeyPress={(e) => e.key === 'Enter' && handleTest()}
              placeholder="Digite sua mensagem de teste..."
              className="flex-1 px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              disabled={loading}
            />
            <button
              onClick={() => handleTest()}
              disabled={loading || !message.trim()}
              className="px-6 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:bg-gray-400 disabled:cursor-not-allowed flex items-center gap-2 transition-colors"
            >
              {loading ? (
                <>
                  <Loader2 className="w-5 h-5 animate-spin" />
                  Testando...
                </>
              ) : (
                <>
                  <Send className="w-5 h-5" />
                  Testar
                </>
              )}
            </button>
          </div>

          {/* Quick Test Buttons */}
          <div className="space-y-2">
            <p className="text-sm font-medium text-gray-700">
              🚀 Testes Rápidos:
            </p>
            <div className="flex flex-wrap gap-2">
              {testMessages.map((msg, idx) => (
                <button
                  key={idx}
                  onClick={() => handleQuickTest(msg)}
                  disabled={loading}
                  className="px-3 py-2 bg-gray-100 hover:bg-gray-200 text-gray-700 rounded-lg text-sm transition-colors disabled:opacity-50"
                >
                  {msg}
                </button>
              ))}
            </div>
          </div>
        </div>

        {/* Results */}
        <div className="bg-white rounded-lg shadow-lg p-6">
          <div className="flex justify-between items-center mb-4">
            <h2 className="text-xl font-semibold text-gray-800">
              📊 Resultados dos Testes ({results.length})
            </h2>
            {results.length > 0 && (
              <button
                onClick={clearResults}
                className="px-4 py-2 bg-red-100 text-red-700 rounded-lg hover:bg-red-200 transition-colors text-sm"
              >
                Limpar Resultados
              </button>
            )}
          </div>

          {results.length === 0 ? (
            <div className="text-center py-12 text-gray-500">
              <MessageSquare className="w-16 h-16 mx-auto mb-4 opacity-50" />
              <p>Nenhum teste realizado ainda.</p>
              <p className="text-sm">Use os botões acima para testar a integração.</p>
            </div>
          ) : (
            <div className="space-y-4 max-h-[600px] overflow-y-auto">
              {results.map((result, idx) => (
                <div
                  key={idx}
                  className={`border rounded-lg p-4 ${
                    result.success
                      ? 'border-green-200 bg-green-50'
                      : 'border-red-200 bg-red-50'
                  }`}
                >
                  {/* Header */}
                  <div className="flex items-start justify-between mb-3">
                    <div className="flex items-center gap-2">
                      {result.success ? (
                        <CheckCircle className="w-5 h-5 text-green-600" />
                      ) : (
                        <XCircle className="w-5 h-5 text-red-600" />
                      )}
                      <span className="font-medium text-gray-800">
                        {result.success ? 'Sucesso' : 'Erro'}
                      </span>
                    </div>
                    <div className="text-right text-sm text-gray-600">
                      <div>{new Date(result.timestamp).toLocaleTimeString()}</div>
                      <div className="text-xs">
                        ⏱️ {result.duration}ms
                      </div>
                    </div>
                  </div>

                  {/* Input */}
                  <div className="mb-3">
                    <p className="text-xs font-semibold text-gray-600 mb-1">
                      📤 INPUT:
                    </p>
                    <p className="text-sm bg-white px-3 py-2 rounded border border-gray-200">
                      {result.input}
                    </p>
                  </div>

                  {/* Output */}
                  <div>
                    <p className="text-xs font-semibold text-gray-600 mb-1">
                      📥 OUTPUT:
                    </p>
                    <pre className="text-xs bg-white px-3 py-2 rounded border border-gray-200 overflow-x-auto">
                      {result.error
                        ? `ERROR: ${result.error}`
                        : JSON.stringify(result.output, null, 2)}
                    </pre>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Instructions */}
        <div className="mt-6 bg-yellow-50 border border-yellow-200 rounded-lg p-4">
          <h3 className="font-semibold text-yellow-800 mb-2">
            ℹ️ Como Testar:
          </h3>
          <ol className="text-sm text-yellow-800 space-y-1 list-decimal list-inside">
            <li>Certifique-se de que o workflow N8N está <strong>ATIVO</strong></li>
            <li>Use os botões de teste rápido ou digite sua própria mensagem</li>
            <li>Verifique se a resposta contém dados do Supabase (animais, estatísticas, etc.)</li>
            <li>Teste diferentes tipos de consultas (busca, estatísticas, detalhes)</li>
            <li>Monitore o tempo de resposta (deve ser &lt; 5 segundos)</li>
          </ol>
        </div>
      </div>
    </div>
  );
}

