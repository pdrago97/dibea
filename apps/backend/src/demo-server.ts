import express from 'express';
import cors from 'cors';
import jwt from 'jsonwebtoken';
import bcrypt from 'bcrypt';
import { PrismaClient } from '@prisma/client';
import { IntelligentChatService } from './services/intelligentChatService';
import { supabaseService } from './services/supabaseService';

const app = express();
const prisma = new PrismaClient();
const intelligentChat = new IntelligentChatService();
const PORT = process.env.PORT ? parseInt(process.env.PORT) : 3002;
const JWT_SECRET = 'demo-secret-key';

// 🎯 CONFIGURAÇÃO: Sistema inteligente com N8N
const FORCE_N8N = false; // true = só n8n, false = fallback local se n8n falhar
const USE_N8N_SIMULATION = false; // true = usa simulação para demonstrar integração
const N8N_TIMEOUT = 60000; // 60 segundos para LLMs
const N8N_BASE_URL = process.env.N8N_WEBHOOK_URL || 'https://n8n-moveup-u53084.vm.elestio.app';
const OPENAI_API_KEY = process.env.OPENAI_API_KEY;

// N8N Workflow endpoints
const N8N_ENDPOINTS = {
  ROUTER: `${N8N_BASE_URL}/webhook/dibea-intelligent-router-crud`,
  CREATE: `${N8N_BASE_URL}/webhook/dibea-create-entity`,
  SEARCH: `${N8N_BASE_URL}/webhook/dibea-intelligent-chat`,
  UPDATE: `${N8N_BASE_URL}/webhook/dibea-update-entity`,
  GENERAL: `${N8N_BASE_URL}/webhook/general-agent`
};

// Middleware
app.use(cors());
app.use(express.json());

// Health check
app.get('/health', async (req, res) => {
  try {
    await prisma.$queryRaw`SELECT 1`;
    res.json({
      status: 'OK',
      timestamp: new Date().toISOString(),
      services: {
        database: 'connected',
        prisma: 'connected'
      }
    });
  } catch (error) {
    res.status(500).json({
      status: 'ERROR',
      timestamp: new Date().toISOString(),
      services: {
        database: 'disconnected',
        prisma: 'error'
      }
    });
  }
});

// Auth middleware
const authenticateToken = (req: any, res: any, next: any) => {
  const authHeader = req.headers['authorization'];
  const token = authHeader && authHeader.split(' ')[1];

  if (!token) {
    return res.sendStatus(401);
  }

  jwt.verify(token, JWT_SECRET, (err: any, user: any) => {
    if (err) return res.sendStatus(403);
    req.user = user;
    next();
  });
};

// Auth routes
app.post('/api/v1/auth/login', async (req, res) => {
  try {
    const { email, password } = req.body;

    const user = await prisma.user.findUnique({
      where: { email },
      include: { municipality: true }
    });

    if (!user || !user.isActive) {
      return res.status(401).json({ error: 'Invalid credentials' });
    }

    const validPassword = await bcrypt.compare(password, user.passwordHash);
    if (!validPassword) {
      return res.status(401).json({ error: 'Invalid credentials' });
    }

    const token = jwt.sign(
      {
        userId: user.id,
        email: user.email,
        role: user.role,
        municipalityId: user.municipalityId
      },
      JWT_SECRET,
      { expiresIn: '7d' }
    );

    return res.json({
      token,
      user: {
        id: user.id,
        email: user.email,
        name: user.name,
        role: user.role,
        municipality: user.municipality?.name || 'N/A'
      }
    });
  } catch (error) {
    console.error('Login error:', error);
    return res.status(500).json({ error: 'Internal server error' });
  }
});

// Register route
app.post('/api/v1/auth/register', async (req, res) => {
  try {
    const { name, email, password, phone, role = 'CIDADAO', zipCode, address } = req.body;

    // Validation
    if (!name || !email || !password) {
      return res.status(400).json({
        success: false,
        message: 'Por favor, forneça nome, email e senha'
      });
    }

    if (password.length < 6) {
      return res.status(400).json({
        success: false,
        message: 'Senha deve ter pelo menos 6 caracteres'
      });
    }

    // Check if user already exists
    const existingUser = await prisma.user.findUnique({
      where: { email }
    });

    if (existingUser) {
      return res.status(400).json({
        success: false,
        message: 'Email já está em uso'
      });
    }

    // Hash password
    const passwordHash = await bcrypt.hash(password, 10);

    // Get default municipality (São Paulo for demo)
    const municipality = await prisma.municipality.findFirst();

    if (!municipality) {
      return res.status(500).json({
        success: false,
        message: 'Erro interno: município não encontrado'
      });
    }

    // Create user
    const user = await prisma.user.create({
      data: {
        name,
        email,
        passwordHash,
        role,
        municipalityId: municipality.id,
        isActive: true
      },
      include: { municipality: true }
    });

    // Generate token
    const token = jwt.sign(
      {
        userId: user.id,
        email: user.email,
        role: user.role,
        municipalityId: user.municipalityId
      },
      JWT_SECRET,
      { expiresIn: '7d' }
    );

    return res.status(201).json({
      success: true,
      token,
      user: {
        id: user.id,
        email: user.email,
        name: user.name,
        role: user.role,
        municipality: user.municipality?.name || 'N/A'
      },
      message: 'Conta criada com sucesso! Bem-vindo ao DIBEA.'
    });
  } catch (error) {
    console.error('Register error:', error);
    return res.status(500).json({
      success: false,
      message: 'Erro interno do servidor. Tente novamente.'
    });
  }
});

// Intelligent Chat endpoint with N8N workflows, memory, and tool calls
app.post('/api/v1/agents/chat', async (req, res) => {
  try {
    const { message, context, sessionId, userId } = req.body;

    if (!message) {
      return res.status(400).json({
        success: false,
        message: 'Mensagem é obrigatória'
      });
    }

    console.log('🧠 Processando com chat inteligente:', { message, sessionId, userId });

    // Use the intelligent chat service
    const response = await intelligentChat.processMessage(
      message,
      sessionId || `session-${Date.now()}`,
      userId,
      context
    );

    return res.json({
      success: true,
      response: response.message,
      agent: response.agent,
      confidence: response.confidence,
      actions: response.actions || [],
      source: 'intelligent_chat_service',
      metadata: response.metadata,
      toolCalls: response.toolCalls
    });

  } catch (error) {
    console.error('❌ Erro no chat inteligente:', error);

    return res.status(500).json({
      success: false,
      message: 'Erro interno do servidor',
      error: error.message,
      timestamp: new Date().toISOString()
    });
  }
});

// Test endpoint for intelligent chat system
app.post('/api/v1/agents/chat/test', async (req, res) => {
  try {
    const testMessages = [
      'Quero cadastrar um novo cão',
      'Buscar animais disponíveis para adoção',
      'Como funciona o processo de adoção?',
      'Quais documentos preciso para adotar?'
    ];

    const results = [];
    const sessionId = `test-session-${Date.now()}`;

    for (const message of testMessages) {
      console.log(`🧪 Testando: "${message}"`);

      try {
        const response = await intelligentChat.processMessage(
          message,
          sessionId,
          'test-user',
          { test: true }
        );

        results.push({
          message,
          response: response.message,
          agent: response.agent,
          confidence: response.confidence,
          intent: response.metadata?.intent,
          toolCalls: response.toolCalls?.length || 0,
          success: true
        });

      } catch (error) {
        results.push({
          message,
          error: error.message,
          success: false
        });
      }
    }

    return res.json({
      success: true,
      testResults: results,
      summary: {
        total: testMessages.length,
        successful: results.filter(r => r.success).length,
        failed: results.filter(r => !r.success).length
      }
    });

  } catch (error) {
    console.error('❌ Erro no teste do chat:', error);
    return res.status(500).json({
      success: false,
      error: error.message
    });
  }
});

// Get conversation history endpoint
app.get('/api/v1/agents/chat/history/:sessionId', async (req, res) => {
  try {
    const { sessionId } = req.params;

    const context = await prisma.$queryRaw<any[]>`
      SELECT * FROM conversation_contexts
      WHERE session_id = ${sessionId}
      ORDER BY updated_at DESC
      LIMIT 1
    `;

    if (context.length === 0) {
      return res.json({
        success: true,
        history: [],
        message: 'Nenhum histórico encontrado para esta sessão'
      });
    }

    const contextData = JSON.parse(context[0].context_data || '{}');

    return res.json({
      success: true,
      sessionId,
      lastIntent: context[0].last_intent,
      lastAgent: context[0].last_agent,
      history: contextData.conversationHistory || [],
      updatedAt: context[0].updated_at
    });

  } catch (error) {
    console.error('❌ Erro ao buscar histórico:', error);
    return res.status(500).json({
      success: false,
      error: error.message
    });
  }
});

// Agent message processing function
async function processAgentMessage(message: string, context: any) {
  const lowerMessage = message.toLowerCase();

  // Animal registration keywords
  const animalKeywords = ['animal', 'cão', 'gato', 'cachorro', 'felino', 'canino'];
  const actionKeywords = ['cadastrar', 'registrar', 'adicionar'];

  const hasAnimalKeyword = animalKeywords.some(keyword => lowerMessage.includes(keyword));
  const hasActionKeyword = actionKeywords.some(keyword => lowerMessage.includes(keyword));
  const hasNewAnimal = lowerMessage.includes('novo') && animalKeywords.some(keyword => lowerMessage.includes(keyword));

  if ((hasActionKeyword && hasAnimalKeyword) || hasNewAnimal) {
    return {
      agent: 'Animal Agent',
      confidence: 0.95,
      content: `🐕 **Agente de Animais Ativado**

Vou te ajudar a cadastrar um novo animal! Para isso, preciso das seguintes informações:

**📋 Dados Obrigatórios:**
• **Nome** do animal
• **Espécie** (Cão, Gato, Outros)
• **Sexo** (Macho/Fêmea)
• **Porte** (Pequeno, Médio, Grande)

**📋 Dados Opcionais:**
• Raça
• Data de nascimento
• Peso
• Cor
• Temperamento
• Observações especiais

Você pode me fornecer essas informações agora ou uma de cada vez. Como prefere começar?`,
      actions: [
        { type: 'form', label: 'Abrir Formulário de Cadastro', url: '/animals/new' },
        { type: 'guide', label: 'Ver Guia Completo', url: '/help/animal-registration' }
      ]
    };
  }

  // Vaccination/procedure keywords
  if (lowerMessage.includes('vacin') || lowerMessage.includes('procedimento') || lowerMessage.includes('consulta') ||
      lowerMessage.includes('medicação') || lowerMessage.includes('medicamento') || lowerMessage.includes('cirurgia') ||
      lowerMessage.includes('exame') || lowerMessage.includes('tratamento')) {
    return {
      agent: 'Procedure Agent',
      confidence: 0.92,
      content: `💉 **Agente de Procedimentos Ativado**

Vou te ajudar a registrar um procedimento veterinário!

**🔍 Primeiro, preciso saber:**
• Qual animal recebeu o procedimento?
• Que tipo de procedimento foi realizado?

**📋 Tipos de Procedimento:**
• Vacinação
• Consulta veterinária
• Cirurgia
• Exame
• Medicação
• Outros

Você pode me dizer o nome do animal e o tipo de procedimento?`,
      actions: [
        { type: 'search', label: 'Buscar Animal', url: '/animals/search' },
        { type: 'form', label: 'Registrar Procedimento', url: '/procedures/new' }
      ]
    };
  }

  // Adoption keywords
  if (lowerMessage.includes('adot') || lowerMessage.includes('tutor') ||
      lowerMessage.includes('processo') || lowerMessage.includes('responsável')) {
    return {
      agent: 'Tutor Agent',
      confidence: 0.90,
      content: `👥 **Agente de Tutores Ativado**

Vou te ajudar com o processo de adoção!

**🏠 Para adoção, preciso:**
• Dados pessoais do interessado
• Informações sobre moradia
• Experiência com animais
• Preferências do animal

**📋 Documentos Necessários:**
• CPF
• Comprovante de residência
• Comprovante de renda

Você gostaria de iniciar o cadastro de tutor ou tem alguma dúvida sobre o processo?`,
      actions: [
        { type: 'form', label: 'Cadastrar Tutor', url: '/tutors/new' },
        { type: 'info', label: 'Processo de Adoção', url: '/adoption/process' }
      ]
    };
  }

  // Document/upload keywords
  if (lowerMessage.includes('document') || lowerMessage.includes('upload') || lowerMessage.includes('arquivo') ||
      lowerMessage.includes('enviar') || lowerMessage.includes('carteira') || lowerMessage.includes('foto') ||
      lowerMessage.includes('imagem') || lowerMessage.includes('anexar')) {
    return {
      agent: 'Document Agent',
      confidence: 0.88,
      content: `📄 **Agente de Documentos Ativado**

Vou te ajudar com documentos e uploads!

**📁 Tipos de Documento:**
• Carteira de vacinação
• Exames veterinários
• Fotos do animal
• Documentos de identificação
• Comprovantes

**🔧 Funcionalidades:**
• Upload de arquivos
• OCR (reconhecimento de texto)
• Análise de imagens
• Organização automática

Que tipo de documento você gostaria de enviar?`,
      actions: [
        { type: 'upload', label: 'Enviar Documento', url: '/documents/upload' },
        { type: 'camera', label: 'Tirar Foto', url: '/documents/camera' }
      ]
    };
  }

  // General queries/reports
  if (lowerMessage.includes('relat') || lowerMessage.includes('estatist') || lowerMessage.includes('busca') ||
      lowerMessage.includes('pesquis') || lowerMessage.includes('encontrar') || lowerMessage.includes('procurar') ||
      lowerMessage.includes('dados') || lowerMessage.includes('informações')) {
    return {
      agent: 'General Agent',
      confidence: 0.85,
      content: `📊 **Agente de Consultas Ativado**

Posso te ajudar com consultas e relatórios!

**📈 Relatórios Disponíveis:**
• Estatísticas de animais
• Relatórios de adoção
• Histórico de procedimentos
• Análises por período

**🔍 Consultas Possíveis:**
• Buscar animais por características
• Histórico de um animal específico
• Status de adoções
• Procedimentos realizados

O que você gostaria de consultar?`,
      actions: [
        { type: 'report', label: 'Gerar Relatório', url: '/reports' },
        { type: 'search', label: 'Busca Avançada', url: '/search' }
      ]
    };
  }

  // Default response
  return {
    agent: 'DIBEA Assistant',
    confidence: 0.75,
    content: `🤖 **Assistente DIBEA**

Olá! Sou o assistente inteligente do DIBEA. Posso te ajudar com:

**🐕 Gestão de Animais:**
• Cadastrar novos animais
• Buscar animais cadastrados
• Atualizar informações

**💉 Procedimentos Veterinários:**
• Registrar vacinações
• Consultas veterinárias
• Histórico médico

**👥 Processo de Adoção:**
• Cadastrar tutores
• Gerenciar adoções
• Acompanhar processos

**📄 Documentos:**
• Upload de arquivos
• OCR e análise
• Organização

**📊 Relatórios:**
• Estatísticas
• Consultas personalizadas
• Análises

Como posso te ajudar hoje? Você pode me dizer o que precisa fazer ou escolher uma das opções acima!`,
    actions: [
      { type: 'form', label: 'Cadastrar Animal', url: '/animals/new' },
      { type: 'form', label: 'Registrar Procedimento', url: '/procedures/new' },
      { type: 'form', label: 'Cadastrar Tutor', url: '/tutors/new' },
      { type: 'report', label: 'Ver Relatórios', url: '/reports' }
    ]
  };
}

// Landing page stats
app.get('/api/v1/landing/stats', async (req, res) => {
  try {
    console.log('🔍 Fetching landing stats from Supabase...');
    const stats = await supabaseService.getDashboardStats();

    res.json({
      totalAnimals: stats.totalAnimals,
      adoptedAnimals: stats.adoptedAnimals,
      totalMunicipalities: stats.totalMunicipalities,
      totalUsers: stats.totalUsers
    });
  } catch (error) {
    console.error('❌ Stats error:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

// Animals for landing
app.get('/api/v1/landing/animals', async (req, res) => {
  try {
    console.log('🔍 Fetching landing animals from Supabase...');
    const animals = await supabaseService.getAnimals({ status: 'DISPONIVEL' });

    const formattedAnimals = animals.slice(0, 6).map((animal: any) => ({
      id: animal.id,
      name: animal.name,
      species: animal.species,
      breed: animal.breed || 'SRD',
      age: animal.age ? `${animal.age} anos` : 'Idade não informada',
      description: animal.description || 'Animal carinhoso e brincalhão',
      image: animal.image_url || 'https://images.unsplash.com/photo-1552053831-71594a27632d?w=300&h=200&fit=crop',
      municipality: animal.municipality?.name || 'N/A',
      urgent: false
    }));

    res.json(formattedAnimals);
  } catch (error) {
    console.error('❌ Landing animals error:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

// Admin dashboard stats
app.get('/api/v1/admin/dashboard/stats', authenticateToken, async (req, res) => {
  try {
    console.log('🔍 Fetching admin dashboard stats from Supabase...');
    const stats = await supabaseService.getDashboardStats();

    res.json({
      totalAnimals: stats.totalAnimals,
      availableAnimals: stats.availableAnimals,
      adoptedAnimals: stats.adoptedAnimals,
      totalUsers: stats.totalUsers,
      activeUsers: stats.totalUsers, // For now, assume all users are active
      totalMunicipalities: stats.totalMunicipalities,
      totalAdoptions: stats.totalAdoptions,
      totalInteractions: 0, // Will implement later
      adoptionRate: stats.adoptionRate
    });
  } catch (error) {
    console.error('❌ Dashboard stats error:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

// Agent metrics
app.get('/api/v1/admin/agents/metrics', authenticateToken, async (req, res) => {
  try {
    const metrics = await prisma.agentMetrics.findMany({
      orderBy: { createdAt: 'desc' },
      take: 10
    });

    const formattedMetrics = metrics.map(metric => ({
      agentName: metric.agentName,
      totalInteractions: metric.totalInteractions,
      successRate: metric.totalInteractions > 0 ? 
        ((metric.successfulInteractions / metric.totalInteractions) * 100).toFixed(1) : '0',
      averageResponseTime: `${metric.averageResponseTime}ms`,
      date: metric.date.toISOString().split('T')[0]
    }));

    res.json(formattedMetrics);
  } catch (error) {
    console.error('Agent metrics error:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

// Animals list
app.get('/api/v1/animals', authenticateToken, async (req, res) => {
  try {
    console.log('🔍 Fetching animals from Supabase...');
    const { status, species } = req.query;

    const filters: any = {};
    if (status && status !== 'all') filters.status = status;
    if (species && species !== 'all') filters.species = species;

    const animals = await supabaseService.getAnimals(filters);

    const formattedAnimals = animals.map((animal: any) => ({
      id: animal.id,
      name: animal.name,
      species: animal.species,
      breed: animal.breed || 'SRD',
      sex: animal.sex,
      age: animal.age,
      size: animal.size,
      description: animal.description,
      status: animal.status,
      municipality: animal.municipality?.name || 'N/A',
      image: animal.image_url,
      createdAt: animal.created_at
    }));

    res.json({ data: formattedAnimals, total: formattedAnimals.length });
  } catch (error) {
    console.error('❌ Animals list error:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

// Chat endpoint with Supabase integration
app.post('/api/v1/agents/chat', async (req, res) => {
  try {
    console.log('🤖 Chat request received:', req.body);
    const { message, userInput, context, sessionId } = req.body;
    const userMessage = message || userInput || '';

    if (!userMessage.trim()) {
      return res.status(400).json({
        success: false,
        message: 'Mensagem não pode estar vazia',
        timestamp: new Date().toISOString()
      });
    }

    // Analyze user intent
    const lowerMessage = userMessage.toLowerCase();
    let response = '';
    let actions = [];
    let data = {};

    if (lowerMessage.includes('animal') || lowerMessage.includes('pet') || lowerMessage.includes('cão') || lowerMessage.includes('gato')) {
      // Animal-related queries
      const stats = await supabaseService.getDashboardStats();
      const animals = await supabaseService.getAnimals({ status: 'DISPONIVEL' });

      response = `🐕 Temos ${stats.totalAnimals} animais cadastrados no sistema, sendo ${stats.availableAnimals} disponíveis para adoção!`;

      if (lowerMessage.includes('cadastrar') || lowerMessage.includes('registrar')) {
        response += ' Para cadastrar um novo animal, preciso de algumas informações como nome, espécie, idade e descrição.';
        actions = [
          { label: '📝 Iniciar cadastro', action: 'start_registration' },
          { label: '👁️ Ver animais cadastrados', action: 'list_animals' }
        ];
      } else {
        actions = [
          { label: '👁️ Ver todos os animais', action: 'list_animals' },
          { label: '❤️ Processo de adoção', action: 'adoption_process' },
          { label: '➕ Cadastrar animal', action: 'register_animal' }
        ];
      }

      data = { animals: animals.slice(0, 3), stats };

    } else if (lowerMessage.includes('adoção') || lowerMessage.includes('adotar')) {
      // Adoption-related queries
      const stats = await supabaseService.getDashboardStats();
      response = `❤️ Já realizamos ${stats.adoptedAnimals} adoções! O processo de adoção envolve cadastro do tutor, análise de perfil e acompanhamento pós-adoção.`;

      actions = [
        { label: '📋 Iniciar processo de adoção', action: 'start_adoption' },
        { label: '🐕 Ver animais disponíveis', action: 'available_animals' },
        { label: '📊 Estatísticas de adoção', action: 'adoption_stats' }
      ];

      data = { adoptionStats: stats };

    } else if (lowerMessage.includes('estatística') || lowerMessage.includes('número') || lowerMessage.includes('quantos')) {
      // Statistics queries
      const stats = await supabaseService.getDashboardStats();
      response = `📊 **Estatísticas do DIBEA:**\n\n🐕 **${stats.totalAnimals}** animais cadastrados\n❤️ **${stats.adoptedAnimals}** adoções realizadas\n🏙️ **${stats.totalMunicipalities}** municípios ativos\n👥 **${stats.totalUsers}** usuários registrados\n📈 Taxa de adoção: **${stats.adoptionRate}%**`;

      actions = [
        { label: '📊 Ver relatório completo', action: 'full_report' },
        { label: '🐕 Ver animais disponíveis', action: 'available_animals' },
        { label: '🏙️ Ver municípios', action: 'municipalities' }
      ];

      data = { stats };

    } else {
      // General greeting or help
      const stats = await supabaseService.getDashboardStats();
      response = `👋 Olá! Sou o assistente inteligente do DIBEA. Posso te ajudar com:\n\n🐕 Informações sobre animais (${stats.availableAnimals} disponíveis)\n❤️ Processo de adoção\n📊 Estatísticas do sistema\n💉 Procedimentos veterinários\n\nComo posso te ajudar hoje?`;

      actions = [
        { label: '🐕 Ver animais disponíveis', action: 'list_animals' },
        { label: '❤️ Processo de adoção', action: 'adoption_info' },
        { label: '📊 Estatísticas', action: 'system_stats' },
        { label: '➕ Cadastrar animal', action: 'register_animal' }
      ];

      data = { stats };
    }

    const chatResponse = {
      success: true,
      agent: 'DIBEA_CHAT_AGENT',
      message: response,
      data,
      actions,
      timestamp: new Date().toISOString(),
      sessionId: sessionId || `session-${Date.now()}`,
      database: 'Supabase PostgreSQL'
    };

    console.log('✅ Chat response:', chatResponse);
    res.json(chatResponse);

  } catch (error) {
    console.error('❌ Chat error:', error);
    res.status(500).json({
      success: false,
      agent: 'ERROR_AGENT',
      message: 'Desculpe, ocorreu um erro interno. Tente novamente em alguns instantes.',
      error: error.message,
      timestamp: new Date().toISOString()
    });
  }
});

// GraphRAG query
app.post('/api/v1/graphrag/query', authenticateToken, async (req, res) => {
  try {
    const { query } = req.body;
    const userId = (req as any).user.userId;

    // Simulate GraphRAG response
    const response = `Baseado na sua consulta "${query}", encontrei as seguintes informações no sistema DIBEA: 
    
    Temos ${await prisma.animal.count()} animais cadastrados, sendo ${await prisma.animal.count({ where: { status: 'DISPONIVEL' } })} disponíveis para adoção. 
    
    O sistema está funcionando perfeitamente com dados reais do banco de dados SQLite.`;

    // Log interaction
    await prisma.agentInteraction.create({
      data: {
        userId,
        agentName: 'GraphRAG Assistant',
        userInput: query,
        agentResponse: response,
        responseTimeMs: Math.floor(Math.random() * 1000) + 500,
        success: true
      }
    });

    res.json({
      response,
      timestamp: new Date().toISOString(),
      sources: ['DIBEA Database', 'Sistema de Gestão Animal']
    });
  } catch (error) {
    console.error('GraphRAG error:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

// 🔍 DIAGNÓSTICO N8N - TESTA MÚLTIPLOS ENDPOINTS
app.get('/api/v1/debug/n8n', async (req, res) => {
  const endpoints = [
    '/webhook/dibea-agent',
    '/webhook/dibea-agent-router',
    '/webhook/dibea-router',
    '/webhook/dibea-main',
    '/webhook/dibea-general',
    '/webhook/dibea-animal',
    '/webhook/chat-w-ontology'
  ];

  const results = [];

  for (const endpoint of endpoints) {
    try {
      console.log(`🔍 Testando: ${endpoint}`);

      const controller = new AbortController();
      const timeoutId = setTimeout(() => controller.abort(), 10000);

      const response = await fetch(`https://n8n-moveup-u53084.vm.elestio.app${endpoint}`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Accept': 'application/json'
        },
        body: JSON.stringify({
          userInput: 'teste de diagnóstico',
          context: { debug: true }
        }),
        signal: controller.signal
      });

      clearTimeout(timeoutId);

      const responseText = await response.text();

      results.push({
        endpoint,
        status: response.status,
        statusText: response.statusText,
        bodyLength: responseText.length,
        isEmpty: !responseText || responseText.trim() === '',
        isJson: (() => {
          try {
            JSON.parse(responseText);
            return true;
          } catch {
            return false;
          }
        })(),
        body: responseText.length > 0 ? responseText.substring(0, 200) + (responseText.length > 200 ? '...' : '') : '',
        working: response.status === 200 && responseText.length > 0
      });

    } catch (error) {
      results.push({
        endpoint,
        error: error.message,
        working: false
      });
    }
  }

  res.json({
    success: true,
    results,
    summary: {
      total: endpoints.length,
      working: results.filter(r => r.working).length,
      workingEndpoints: results.filter(r => r.working).map(r => r.endpoint)
    }
  });
});

// 🧪 TESTE DE INTEGRAÇÃO N8N - SIMULA RESPOSTA VÁLIDA
app.post('/api/v1/agents/chat/test-n8n', async (req, res) => {
  const { message } = req.body;

  // Simula uma resposta válida do n8n para testar a integração
  const mockN8nResponse = {
    message: `🤖 **Resposta simulada do LLM Agent do n8n**\n\nVocê disse: "${message}"\n\nEsta é uma resposta simulada para testar a integração. O n8n deveria retornar algo assim quando configurado corretamente.`,
    agent: 'DIBEA LLM Agent (Simulado)',
    confidence: 0.95,
    actions: [
      { type: 'quick_reply', text: 'Cadastrar Animal', action: 'register_animal' },
      { type: 'quick_reply', text: 'Buscar Animais', action: 'search_animals' },
      { type: 'quick_reply', text: 'Ajuda', action: 'help' }
    ],
    metadata: {
      workflow: 'DIBEA Agent Router - Main',
      timestamp: new Date().toISOString(),
      processed_by: 'n8n_llm_agent'
    }
  };

  res.json({
    success: true,
    response: mockN8nResponse.message,
    agent: mockN8nResponse.agent,
    confidence: mockN8nResponse.confidence,
    actions: mockN8nResponse.actions,
    source: 'n8n_simulation',
    metadata: mockN8nResponse.metadata
  });
});

// 🧪 SIMULAÇÃO N8N - GERA RESPOSTAS COMO SE FOSSE O LLM AGENT
function generateN8nSimulation(message: string) {
  const lowerMessage = message.toLowerCase();

  // Detecta intenção baseada na mensagem
  let response = '';
  let actions = [];
  let agent = 'DIBEA LLM Agent (Simulado)';

  if (lowerMessage.includes('cadastr') && lowerMessage.includes('animal')) {
    response = `🐾 **Assistente de Cadastro de Animais**\n\nVou te ajudar a cadastrar um novo animal! Para isso, preciso de algumas informações:\n\n**📋 Dados Obrigatórios:**\n• Nome do animal\n• Espécie (Cão, Gato, Outros)\n• Sexo (Macho/Fêmea)\n• Porte (Pequeno, Médio, Grande)\n\n**📋 Dados Opcionais:**\n• Raça\n• Data de nascimento\n• Peso\n• Cor\n• Temperamento\n• Observações especiais\n\nVocê pode me fornecer essas informações agora ou uma de cada vez. Como prefere começar?`;

    actions = [
      { type: 'quick_reply', text: 'Abrir Formulário', action: 'open_form' },
      { type: 'quick_reply', text: 'Informar por Chat', action: 'chat_form' },
      { type: 'quick_reply', text: 'Ver Guia Completo', action: 'full_guide' }
    ];
    agent = 'Animal Agent (95%)';

  } else if (lowerMessage.includes('buscar') || lowerMessage.includes('procur') || lowerMessage.includes('encontrar')) {
    response = `🔍 **Busca de Animais**\n\nVou te ajudar a encontrar animais! Você pode buscar por:\n\n• **Espécie**: Cães, gatos, outros\n• **Porte**: Pequeno, médio, grande\n• **Localização**: Município específico\n• **Status**: Disponível para adoção\n• **Características**: Cor, raça, idade\n\nO que você está procurando especificamente?`;

    actions = [
      { type: 'quick_reply', text: 'Buscar Cães', action: 'search_dogs' },
      { type: 'quick_reply', text: 'Buscar Gatos', action: 'search_cats' },
      { type: 'quick_reply', text: 'Busca Avançada', action: 'advanced_search' }
    ];

  } else if (lowerMessage.includes('estatística') || lowerMessage.includes('dados') || lowerMessage.includes('relatório')) {
    response = `📊 **Estatísticas do Sistema DIBEA**\n\nAqui estão os dados atuais:\n\n• **Animais cadastrados**: 1.247\n• **Disponíveis para adoção**: 892\n• **Adotados este mês**: 156\n• **Municípios ativos**: 23\n• **Usuários registrados**: 3.421\n\nQue tipo de relatório você gostaria de ver?`;

    actions = [
      { type: 'quick_reply', text: 'Relatório Completo', action: 'full_report' },
      { type: 'quick_reply', text: 'Por Município', action: 'by_city' },
      { type: 'quick_reply', text: 'Tendências', action: 'trends' }
    ];

  } else if (lowerMessage.includes('ajuda') || lowerMessage.includes('help') || lowerMessage.includes('como')) {
    response = `🆘 **Central de Ajuda DIBEA**\n\nSou o assistente inteligente do DIBEA! Posso te ajudar com:\n\n🐾 **Cadastro de Animais**\n• Registrar novos animais\n• Upload de documentos\n• Gestão de tutores\n\n🔍 **Busca e Adoção**\n• Encontrar animais disponíveis\n• Processo de adoção\n• Acompanhamento\n\n📊 **Relatórios e Dados**\n• Estatísticas do sistema\n• Relatórios personalizados\n• Métricas de performance\n\nO que você gostaria de fazer?`;

    actions = [
      { type: 'quick_reply', text: 'Cadastrar Animal', action: 'register_animal' },
      { type: 'quick_reply', text: 'Buscar Animais', action: 'search_animals' },
      { type: 'quick_reply', text: 'Ver Estatísticas', action: 'view_stats' },
      { type: 'quick_reply', text: 'Documentação', action: 'docs' }
    ];

  } else {
    response = `🤖 **Assistente DIBEA**\n\nOlá! Sou o assistente inteligente do Sistema de Gestão de Bem-Estar Animal.\n\nVocê disse: "${message}"\n\nPosso te ajudar com:\n• Cadastro de animais\n• Busca e adoção\n• Relatórios e estatísticas\n• Gestão de procedimentos\n• Upload de documentos\n\nComo posso ajudar você hoje?`;

    actions = [
      { type: 'quick_reply', text: 'Cadastrar Animal', action: 'register_animal' },
      { type: 'quick_reply', text: 'Buscar Animais', action: 'search_animals' },
      { type: 'quick_reply', text: 'Ver Estatísticas', action: 'view_stats' },
      { type: 'quick_reply', text: 'Ajuda', action: 'help' }
    ];
  }

  return {
    message: response,
    agent,
    confidence: 0.95,
    actions,
    metadata: {
      workflow: 'DIBEA Agent Router - Main',
      timestamp: new Date().toISOString(),
      processed_by: 'n8n_llm_agent',
      intent_detected: lowerMessage.includes('cadastr') ? 'register_animal' :
                      lowerMessage.includes('buscar') ? 'search_animals' :
                      lowerMessage.includes('estatística') ? 'view_stats' :
                      lowerMessage.includes('ajuda') ? 'help' : 'general'
    }
  };
}

// 🧪 FUNÇÕES DE TESTE PARA ENTIDADES DIBEA

async function testAnimalRegistration(data: any) {
  try {
    // Teste de cadastro de animal
    const testAnimal = await prisma.animal.create({
      data: {
        name: data.name || 'Animal Teste',
        species: data.species || 'CACHORRO',
        breed: data.breed || 'SRD',
        sex: data.sex || 'MACHO',
        age: data.age || 2,
        weight: data.weight || 15.5,
        size: data.size || 'MEDIO',
        color: data.color || 'Marrom',
        description: data.description || 'Animal de teste criado automaticamente',
        status: 'DISPONIVEL',
        municipalityId: data.municipalityId || 'mun-demo-001'
      }
    });

    return {
      success: true,
      message: 'Animal cadastrado com sucesso',
      animalId: testAnimal.id,
      data: testAnimal
    };
  } catch (error) {
    return {
      success: false,
      message: 'Erro ao cadastrar animal',
      error: error.message
    };
  }
}

async function testAdoptionProcess(data: any) {
  try {
    // Buscar um animal disponível
    const availableAnimal = await prisma.animal.findFirst({
      where: { status: 'DISPONIVEL' }
    });

    if (!availableAnimal) {
      return {
        success: false,
        message: 'Nenhum animal disponível para adoção'
      };
    }

    // Simular processo de adoção (precisa de um tutor existente)
    const tutor = await prisma.user.findFirst({
      where: { role: 'CIDADAO' }
    });

    if (!tutor) {
      return {
        success: false,
        message: 'Nenhum cidadão encontrado para ser tutor'
      };
    }

    const adoption = await prisma.adoption.create({
      data: {
        animalId: availableAnimal.id,
        tutorId: tutor.id,
        status: 'PENDENTE',
        notes: `Adoção de teste para ${data.adopterName || 'Adotante Teste'} - ${data.adopterEmail || 'teste@email.com'}`
      }
    });

    return {
      success: true,
      message: 'Processo de adoção iniciado',
      adoptionId: adoption.id,
      animalName: availableAnimal.name,
      data: adoption
    };
  } catch (error) {
    return {
      success: false,
      message: 'Erro no processo de adoção',
      error: error.message
    };
  }
}

async function testUserManagement(data: any) {
  try {
    // Buscar usuários por tipo
    const userStats = await prisma.user.groupBy({
      by: ['role'],
      _count: { id: true }
    });

    // Criar usuário de teste se solicitado
    let newUser = null;
    if (data.createUser) {
      newUser = await prisma.user.create({
        data: {
          email: data.email || `teste${Date.now()}@dibea.com`,
          name: data.name || 'Usuário Teste',
          role: data.role || 'CIDADAO',
          passwordHash: 'teste123', // Em produção seria hasheado
          municipalityId: data.municipalityId || 'mun-demo-001'
        }
      });
    }

    return {
      success: true,
      message: 'Gestão de usuários testada',
      userStats,
      newUser: newUser ? { id: newUser.id, email: newUser.email, role: newUser.role } : null
    };
  } catch (error) {
    return {
      success: false,
      message: 'Erro na gestão de usuários',
      error: error.message
    };
  }
}

async function testMunicipalityOperations(data: any) {
  try {
    // Estatísticas por município
    const municipalityStats = await prisma.municipality.findMany({
      include: {
        _count: {
          select: {
            animals: true,
            users: true
          }
        }
      }
    });

    // Criar município de teste se solicitado
    let newMunicipality = null;
    if (data.createMunicipality) {
      newMunicipality = await prisma.municipality.create({
        data: {
          name: data.name || `Município Teste ${Date.now()}`,
          state: data.state || 'SP'
        }
      });
    }

    return {
      success: true,
      message: 'Operações municipais testadas',
      municipalityStats: municipalityStats.map(m => ({
        id: m.id,
        name: m.name,
        state: m.state,
        animalsCount: m._count.animals,
        usersCount: m._count.users
      })),
      newMunicipality
    };
  } catch (error) {
    return {
      success: false,
      message: 'Erro nas operações municipais',
      error: error.message
    };
  }
}

async function testAgentInteraction(data: any) {
  try {
    // Simular interação com agente
    const interaction = await prisma.agentInteraction.create({
      data: {
        userId: data.userId || 'user-cidadao-001',
        agentName: data.agentName || 'Agente Teste',
        userInput: data.userInput || 'Teste de interação',
        agentResponse: data.agentResponse || 'Resposta de teste do agente',
        responseTimeMs: data.responseTimeMs || Math.floor(Math.random() * 1000) + 200,
        success: data.success !== false
      }
    });

    // Buscar métricas recentes
    const recentMetrics = await prisma.agentMetrics.findFirst({
      where: { agentName: interaction.agentName },
      orderBy: { createdAt: 'desc' }
    });

    return {
      success: true,
      message: 'Interação com agente testada',
      interactionId: interaction.id,
      agentName: interaction.agentName,
      responseTime: `${interaction.responseTimeMs}ms`,
      recentMetrics: recentMetrics ? {
        totalInteractions: recentMetrics.totalInteractions,
        successRate: `${((recentMetrics.successfulInteractions / recentMetrics.totalInteractions) * 100).toFixed(1)}%`,
        avgResponseTime: `${recentMetrics.averageResponseTime}ms`
      } : null
    };
  } catch (error) {
    return {
      success: false,
      message: 'Erro na interação com agente',
      error: error.message
    };
  }
}

// 🧪 ENDPOINT DE TESTE PARA ENTIDADES DIBEA
app.post('/api/v1/test/entities', async (req, res) => {
  try {
    const { testType, entityData } = req.body;

    console.log(`🧪 Teste de entidade: ${testType}`, entityData);

    let result = {};

    switch (testType) {
      case 'animal_registration':
        result = await testAnimalRegistration(entityData);
        break;
      case 'adoption_process':
        result = await testAdoptionProcess(entityData);
        break;
      case 'user_management':
        result = await testUserManagement(entityData);
        break;
      case 'municipality_operations':
        result = await testMunicipalityOperations(entityData);
        break;
      case 'agent_interaction':
        result = await testAgentInteraction(entityData);
        break;
      default:
        return res.status(400).json({
          success: false,
          message: 'Tipo de teste não reconhecido'
        });
    }

    return res.json({
      success: true,
      testType,
      result,
      timestamp: new Date().toISOString()
    });

  } catch (error) {
    console.error('Test error:', error);
    return res.status(500).json({
      success: false,
      message: 'Erro no teste',
      error: error.message
    });
  }
});

// Start server
app.listen(PORT, () => {
  console.log(`🚀 DIBEA Demo Server running on port ${PORT}`);
  console.log(`📊 Health check: http://localhost:${PORT}/health`);
  console.log(`🔐 Auth API: http://localhost:${PORT}/api/v1/auth`);
  console.log(`🏠 Landing API: http://localhost:${PORT}/api/v1/landing`);
  console.log('');
  console.log('🎯 Demo accounts:');
  console.log('👑 Admin: admin@dibea.com / admin123');
  console.log('🩺 Veterinário: vet@dibea.com / vet123');
  console.log('👨‍💼 Funcionário: func@dibea.com / func123');
  console.log('👤 Cidadão: cidadao@dibea.com / cidadao123');
});
