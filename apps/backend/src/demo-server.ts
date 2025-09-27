import express from 'express';
import cors from 'cors';
import jwt from 'jsonwebtoken';
import bcrypt from 'bcrypt';
import { PrismaClient } from '@prisma/client';

const app = express();
const prisma = new PrismaClient();
const PORT = 3000;
const JWT_SECRET = 'demo-secret-key';

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

// Agent Chat endpoint
app.post('/api/v1/agents/chat', async (req, res) => {
  try {
    const { message, context } = req.body;

    if (!message) {
      return res.status(400).json({
        success: false,
        message: 'Mensagem é obrigatória'
      });
    }

    // Simple agent logic based on keywords
    const response = await processAgentMessage(message, context);

    return res.json({
      success: true,
      response: response.content,
      agent: response.agent,
      confidence: response.confidence,
      actions: response.actions || []
    });

  } catch (error) {
    console.error('Agent chat error:', error);
    return res.status(500).json({
      success: false,
      message: 'Erro interno do agente'
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
    const [totalAnimals, adoptedAnimals, totalMunicipalities, totalUsers] = await Promise.all([
      prisma.animal.count(),
      prisma.animal.count({ where: { status: 'ADOTADO' } }),
      prisma.municipality.count({ where: { active: true } }),
      prisma.user.count({ where: { isActive: true } })
    ]);

    res.json({
      totalAnimals,
      adoptedAnimals,
      totalMunicipalities,
      totalUsers
    });
  } catch (error) {
    console.error('Stats error:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

// Animals for landing
app.get('/api/v1/landing/animals', async (req, res) => {
  try {
    const animals = await prisma.animal.findMany({
      where: { status: 'DISPONIVEL' },
      include: { municipality: true },
      take: 6,
      orderBy: { createdAt: 'desc' }
    });

    const formattedAnimals = animals.map(animal => ({
      id: animal.id,
      name: animal.name,
      species: animal.species,
      breed: animal.breed || 'SRD',
      age: animal.age ? `${animal.age} anos` : 'Idade não informada',
      description: animal.description || 'Animal carinhoso e brincalhão',
      image: 'https://images.unsplash.com/photo-1552053831-71594a27632d?w=300&h=200&fit=crop',
      municipality: animal.municipality.name,
    }));

    res.json(formattedAnimals);
  } catch (error) {
    console.error('Animals error:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

// Admin dashboard stats
app.get('/api/v1/admin/dashboard/stats', authenticateToken, async (req, res) => {
  try {
    // Get real-time data directly from database
    const [
      totalUsers,
      totalAnimals,
      totalMunicipalities,
      totalAdoptions,
      activeUsers,
      availableAnimals,
      adoptedAnimals,
      totalInteractions
    ] = await Promise.all([
      prisma.user.count(),
      prisma.animal.count(),
      prisma.municipality.count(),
      prisma.adoption.count(),
      prisma.user.count({ where: { isActive: true } }),
      prisma.animal.count({ where: { status: 'DISPONIVEL' } }),
      prisma.animal.count({ where: { status: 'ADOTADO' } }),
      prisma.agentInteraction.count()
    ]);

    // Calculate adoption rate
    const adoptionRate = totalAnimals > 0 ? ((adoptedAnimals / totalAnimals) * 100).toFixed(1) : '0';

    res.json({
      totalAnimals,
      availableAnimals,
      adoptedAnimals,
      totalUsers,
      activeUsers,
      totalMunicipalities,
      totalAdoptions,
      totalInteractions,
      adoptionRate
    });
  } catch (error) {
    console.error('Dashboard stats error:', error);
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
    const { status, species } = req.query;
    
    const where: any = {};
    if (status && status !== 'all') where.status = status;
    if (species && species !== 'all') where.species = species;

    const animals = await prisma.animal.findMany({
      where,
      include: { municipality: true },
      orderBy: { createdAt: 'desc' }
    });

    const formattedAnimals = animals.map(animal => ({
      id: animal.id,
      name: animal.name,
      species: animal.species,
      breed: animal.breed || 'SRD',
      sex: animal.sex,
      age: animal.age,
      weight: animal.weight,
      size: animal.size,
      color: animal.color,
      description: animal.description,
      status: animal.status,
      municipality: animal.municipality.name,
      createdAt: animal.createdAt
    }));

    res.json(formattedAnimals);
  } catch (error) {
    console.error('Animals list error:', error);
    res.status(500).json({ error: 'Internal server error' });
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
