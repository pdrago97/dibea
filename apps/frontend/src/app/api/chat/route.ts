import { NextRequest, NextResponse } from 'next/server';

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    console.log('🔄 Proxy recebeu requisição:', body);

    // Fazer requisição para o servidor de teste
    const response = await fetch('http://localhost:3005/api/test/supabase', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(body),
    });

    if (!response.ok) {
      throw new Error(`Server responded with ${response.status}: ${response.statusText}`);
    }

    const data = await response.json();
    console.log('✅ Proxy enviando resposta:', data);

    return NextResponse.json(data);
  } catch (error) {
    console.error('❌ Erro no proxy:', error);
    return NextResponse.json(
      { 
        success: false, 
        error: error.message,
        agent: 'PROXY_ERROR',
        message: 'Erro interno do servidor. Tente novamente.',
        timestamp: new Date().toISOString()
      },
      { status: 500 }
    );
  }
}

export async function GET() {
  return NextResponse.json({ 
    status: 'ok', 
    message: 'Chat API Proxy is running',
    timestamp: new Date().toISOString()
  });
}
