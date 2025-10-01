import { NextRequest, NextResponse } from 'next/server';

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    console.log('🔄 API Chat recebeu requisição:', body);

    // Configuração do N8N
    const useTestWebhook = process.env.NEXT_PUBLIC_N8N_USE_TEST === 'true';
    const n8nUrl = process.env.NEXT_PUBLIC_N8N_URL || 'https://n8n-moveup-u53084.vm.elestio.app';

    // Usar variáveis de ambiente para os webhook IDs
    const webhookId = useTestWebhook
      ? process.env.NEXT_PUBLIC_N8N_WEBHOOK_TEST || 'd0fff20e-124c-49f3-8ccf-a615504c5fc1'
      : process.env.NEXT_PUBLIC_N8N_WEBHOOK_PROD || 'dcfad7e3-e957-47e0-a5e5-7f6ecb400a54';

    const webhookPath = useTestWebhook
      ? `/webhook-test/${webhookId}`  // Webhook de teste
      : `/webhook/${webhookId}`;      // Chat Trigger (produção)

    const n8nWebhookUrl = `${n8nUrl}${webhookPath}`;

    console.log('🚀 Chamando N8N Webhook:', n8nWebhookUrl);
    console.log('📊 Modo:', useTestWebhook ? 'TESTE' : 'PRODUÇÃO');

    // Fazer requisição para o N8N
    const response = await fetch(n8nWebhookUrl, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        chatInput: body.message || body.userInput || body.chatInput,
        userInput: body.message || body.userInput || body.chatInput,
        context: body.context || {},
        sessionId: body.sessionId || `session-${Date.now()}`,
        previousMessages: body.previousMessages || []
      }),
      signal: AbortSignal.timeout(30000) // 30 second timeout
    });

    if (!response.ok) {
      throw new Error(`N8N responded with ${response.status}: ${response.statusText}`);
    }

    const data = await response.json();
    console.log('✅ Resposta do N8N:', data);

    // Formatar resposta
    const formattedResponse = {
      success: true,
      message: data.output || data.message || data.response || 'Resposta recebida',
      agent: 'DIBEA AI',
      data: data,
      timestamp: new Date().toISOString()
    };

    return NextResponse.json(formattedResponse);
  } catch (error: any) {
    console.error('❌ Erro na API Chat:', error);
    return NextResponse.json(
      {
        success: false,
        error: error.message,
        agent: 'API_ERROR',
        message: 'Erro ao comunicar com o sistema. Verifique se o N8N está ativo.',
        timestamp: new Date().toISOString()
      },
      { status: 500 }
    );
  }
}

export async function GET() {
  return NextResponse.json({
    status: 'ok',
    message: 'Chat API is running',
    n8n_mode: process.env.NEXT_PUBLIC_N8N_USE_TEST === 'true' ? 'test' : 'production',
    timestamp: new Date().toISOString()
  });
}
