import express from 'express';
import cors from 'cors';

const app = express();
const PORT = 3005;

// Middleware
app.use(cors({
  origin: ['http://localhost:3004', 'http://localhost:3000'],
  credentials: true
}));
app.use(express.json());

// Test endpoint
app.post('/api/test/supabase', async (req, res) => {
  try {
    console.log('🔄 Teste de integração Supabase recebido:', req.body);
    
    // Fazer chamada para Supabase
    const response = await fetch('https://xptonqqagxcpzlgndilj.supabase.co/rest/v1/rpc/get_dashboard_stats', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'apikey': 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InhwdG9ucXFhZ3hjcHpsZ25kaWxqIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NTkwOTY2NjYsImV4cCI6MjA3NDY3MjY2Nn0.uT5QGzarx587tE-s3SGgji2zl2iwzk2u3bFoi_RGNJY',
        'Authorization': 'Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InhwdG9ucXFhZ3hjcHpsZ25kaWxqIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NTkwOTY2NjYsImV4cCI6MjA3NDY3MjY2Nn0.uT5QGzarx587tE-s3SGgji2zl2iwzk2u3bFoi_RGNJY'
      }
    });

    if (!response.ok) {
      throw new Error(`Supabase HTTP ${response.status}: ${response.statusText}`);
    }

    const stats = await response.json();
    console.log('✅ Dados do Supabase:', stats);

    const userInput = req.body.userInput || 'teste';
    const lowerInput = userInput.toLowerCase();
    
    let message = '';
    let actions = [];
    
    if (lowerInput.includes('animal') || lowerInput.includes('pet') || lowerInput.includes('cão') || lowerInput.includes('gato')) {
      message = `🐕 Temos ${stats.total_animals || 0} animais cadastrados no sistema, sendo ${stats.available_animals || 0} disponíveis para adoção!`;
      actions = [
        { label: '👁️ Ver todos os animais', action: 'list_animals' },
        { label: '❤️ Processo de adoção', action: 'adoption_process' },
        { label: '➕ Cadastrar animal', action: 'register_animal' }
      ];
    } else if (lowerInput.includes('estatística') || lowerInput.includes('número') || lowerInput.includes('quantos')) {
      message = `📊 **Estatísticas do DIBEA:**\n\n🐕 **${stats.total_animals || 0}** animais cadastrados\n❤️ **${stats.adopted_animals || 0}** adoções realizadas\n🏙️ **${stats.total_municipalities || 0}** municípios ativos\n👥 **${stats.total_users || 0}** usuários registrados`;
      actions = [
        { label: '📊 Ver relatório completo', action: 'full_report' },
        { label: '🐕 Ver animais disponíveis', action: 'available_animals' }
      ];
    } else {
      message = `👋 Olá! Sou o assistente inteligente do DIBEA conectado ao Supabase. Posso te ajudar com:\n\n🐕 Informações sobre animais (${stats.available_animals || 0} disponíveis)\n❤️ Processo de adoção\n📊 Estatísticas do sistema\n💉 Procedimentos veterinários\n\nComo posso te ajudar hoje?`;
      actions = [
        { label: '🐕 Ver animais disponíveis', action: 'list_animals' },
        { label: '❤️ Processo de adoção', action: 'adoption_info' },
        { label: '📊 Estatísticas', action: 'system_stats' },
        { label: '➕ Cadastrar animal', action: 'register_animal' }
      ];
    }

    const result = {
      success: true,
      agent: 'DIBEA_TEST_SERVER',
      message: message,
      data: {
        stats: stats,
        userInput: userInput,
        sessionId: req.body.sessionId || 'test-session',
        timestamp: new Date().toISOString()
      },
      actions: actions,
      timestamp: new Date().toISOString(),
      database: 'Supabase PostgreSQL (via Backend)'
    };

    console.log('✅ Resposta enviada:', result);
    res.json(result);

  } catch (error) {
    console.error('❌ Erro no teste:', error);
    res.status(500).json({
      success: false,
      agent: 'DIBEA_TEST_SERVER',
      message: 'Erro ao conectar com Supabase: ' + error.message,
      error: error.message,
      timestamp: new Date().toISOString()
    });
  }
});

// Health check
app.get('/health', (req, res) => {
  res.json({ status: 'ok', timestamp: new Date().toISOString() });
});

app.listen(PORT, () => {
  console.log(`🚀 Servidor de teste rodando na porta ${PORT}`);
  console.log(`📡 Endpoint de teste: http://localhost:${PORT}/api/test/supabase`);
});
