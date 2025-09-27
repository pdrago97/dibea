import express from 'express';
import cors from 'cors';
import dotenv from 'dotenv';
import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';
import { PrismaClient } from '@prisma/client';
import { AgentMetricsService } from './services/agentMetrics';
import { SystemAnalyticsService } from './services/systemAnalytics';

dotenv.config();

const app = express();
const PORT = process.env.PORT || 3000;
const JWT_SECRET = process.env.JWT_SECRET || 'your-super-secret-jwt-key';

// Initialize Prisma
const prisma = new PrismaClient();

// Middleware
app.use(cors());
app.use(express.json());

// JWT token generation
const generateToken = (user: any) => {
  return jwt.sign({
    userId: user.id,
    email: user.email,
    role: user.role,
    municipalityId: user.municipalityId,
  }, JWT_SECRET, {
    expiresIn: '7d',
    issuer: 'dibea-api',
    audience: 'dibea-frontend'
  });
};

// Middleware to verify JWT
const authenticateToken = async (req: any, res: any, next: any) => {
  const authHeader = req.headers.authorization;
  
  if (!authHeader || !authHeader.startsWith('Bearer ')) {
    return res.status(401).json({
      success: false,
      error: 'Access token required'
    });
  }

  try {
    const token = authHeader.substring(7);
    const decoded = jwt.verify(token, JWT_SECRET) as any;
    
    // Get user from database
    const user = await prisma.user.findUnique({
      where: { id: decoded.userId },
      include: { municipality: true }
    });

    if (!user || !user.active) {
      return res.status(401).json({
        success: false,
        error: 'User not found or inactive'
      });
    }

    req.user = {
      userId: user.id,
      email: user.email,
      role: user.role,
      municipalityId: user.municipalityId,
      municipality: user.municipality
    };

    next();
  } catch (error) {
    return res.status(401).json({
      success: false,
      error: 'Invalid token'
    });
  }
};

// Routes

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

// Landing page stats
app.get('/api/v1/landing/stats', async (req, res) => {
  try {
    const [totalAnimals, adoptedAnimals, activeMunicipalities, registeredUsers] = await Promise.all([
      prisma.animal.count(),
      prisma.animal.count({ where: { status: 'ADOTADO' } }),
      prisma.municipality.count({ where: { active: true } }),
      prisma.user.count({ where: { is_active: true } })
    ]);

    const stats = {
      totalAnimals,
      adoptedAnimals,
      activeMunicipalities,
      registeredUsers,
      proceduresCompleted: totalAnimals * 3, // Estimate
      documentsProcessed: totalAnimals * 5   // Estimate
    };

    res.json({ success: true, data: stats });
  } catch (error) {
    console.error('Error fetching stats:', error);
    res.status(500).json({
      success: false,
      message: 'Erro ao buscar estatísticas'
    });
  }
});

// Featured animals
app.get('/api/v1/landing/featured-animals', async (req, res) => {
  try {
    const animals = await prisma.animal.findMany({
      where: { 
        status: 'DISPONIVEL'
      },
      include: {
        municipality: true,
        photos: {
          where: { isPrimary: true },
          take: 1
        }
      },
      take: 6,
      orderBy: { createdAt: 'desc' }
    });

    const featuredAnimals = animals.map(animal => ({
      id: animal.id,
      name: animal.name,
      species: animal.species === 'CANINO' ? 'Cão' : animal.species === 'FELINO' ? 'Gato' : 'Outro',
      age: animal.birthDate ? 
        `${Math.floor((Date.now() - animal.birthDate.getTime()) / (365.25 * 24 * 60 * 60 * 1000))} anos` : 
        'Idade não informada',
      description: animal.temperament || 'Animal carinhoso e brincalhão',
      image: animal.photos[0]?.url || 'https://images.unsplash.com/photo-1552053831-71594a27632d?w=300&h=200&fit=crop',
      municipality: animal.municipality.name,
      urgent: false // Could be based on some criteria
    }));

    res.json({ success: true, data: featuredAnimals });
  } catch (error) {
    console.error('Error fetching featured animals:', error);
    res.status(500).json({
      success: false,
      message: 'Erro ao buscar animais em destaque'
    });
  }
});

// Auth routes
app.post('/api/v1/auth/register', async (req, res): Promise<any> => {
  try {
    const { name, email, password, phone, role = 'CIDADAO' } = req.body;

    if (!name || !email || !password) {
      return res.status(400).json({
        success: false,
        message: 'Por favor, forneça nome, email e senha'
      });
    }

    // Check if user exists
    const existingUser = await prisma.user.findUnique({
      where: { email }
    });

    if (existingUser) {
      return res.status(400).json({
        success: false,
        message: 'Usuário já existe'
      });
    }

    // Get default municipality (first active one)
    const municipality = await prisma.municipality.findFirst({
      where: { active: true }
    });

    if (!municipality) {
      return res.status(500).json({
        success: false,
        message: 'Nenhum município ativo encontrado'
      });
    }

    // Hash password
    const passwordHash = await bcrypt.hash(password, 10);

    // Create user
    const newUser = await prisma.user.create({
      data: {
        email,
        passwordHash,
        name,
        phone: phone || '',
        role: role as any,
        municipalityId: municipality.id
      },
      include: {
        municipality: true
      }
    });

    const token = generateToken(newUser);

    res.status(201).json({
      success: true,
      token,
      user: {
        id: newUser.id,
        name: newUser.name,
        email: newUser.email,
        role: newUser.role,
        phone: newUser.phone,
        municipality: { 
          id: newUser.municipality.id, 
          name: newUser.municipality.name 
        }
      },
      message: role === 'CIDADAO' 
        ? 'Conta criada com sucesso! Agora você pode explorar animais para adoção.'
        : 'Usuário criado com sucesso!'
    });
  } catch (error) {
    console.error('Registration error:', error);
    res.status(500).json({
      success: false,
      message: 'Erro interno do servidor'
    });
  }
});

app.post('/api/v1/auth/login', async (req, res): Promise<any> => {
  try {
    const { email, password } = req.body;

    if (!email || !password) {
      return res.status(400).json({
        success: false,
        message: 'Email e senha são obrigatórios'
      });
    }

    // Find user
    const user = await prisma.user.findUnique({
      where: { email },
      include: { municipality: true }
    });

    if (!user || !user.active) {
      return res.status(401).json({
        success: false,
        message: 'Credenciais inválidas'
      });
    }

    // Verify password
    const isValidPassword = await bcrypt.compare(password, user.passwordHash);
    if (!isValidPassword) {
      return res.status(401).json({
        success: false,
        message: 'Credenciais inválidas'
      });
    }

    const token = generateToken(user);

    res.json({
      success: true,
      token,
      user: {
        id: user.id,
        name: user.name,
        email: user.email,
        role: user.role,
        municipality: { 
          id: user.municipality.id, 
          name: user.municipality.name 
        }
      }
    });
  } catch (error) {
    console.error('Login error:', error);
    res.status(500).json({
      success: false,
      message: 'Erro interno do servidor'
    });
  }
});

// Agent validation
app.get('/api/v1/auth/validate-agent-access/:agentType', authenticateToken, (req, res): any => {
  const { agentType } = req.params;
  const user = (req as any).user;

  // Permission matrix
  const permissions = {
    canRead: true,
    canWrite: user.role !== 'CIDADAO',
    canDelete: user.role === 'ADMIN',
    agentType
  };

  res.json({
    success: true,
    message: 'Acesso autorizado',
    permissions
  });
});

// ===== ADMIN MIDDLEWARE =====

// Middleware para verificar role de admin
const requireAdmin = (req: any, res: any, next: any) => {
  if (req.user.role !== 'ADMIN') {
    return res.status(403).json({
      success: false,
      message: 'Acesso negado. Apenas administradores.'
    });
  }
  next();
};

// ===== AGENT METRICS ROUTES (BEFORE GENERIC ROUTES) =====

// GET /api/v1/agents/metrics - Buscar métricas reais dos agentes
app.get('/api/v1/agents/metrics', authenticateToken, async (req, res) => {
  try {
    const metrics = await AgentMetricsService.getAllAgentMetrics();

    res.json({
      success: true,
      data: metrics
    });
  } catch (error) {
    console.error('Error fetching agent metrics:', error);
    res.status(500).json({
      success: false,
      message: 'Erro ao buscar métricas dos agentes'
    });
  }
});

// POST /api/v1/agents/interaction - Registrar interação com agente
app.post('/api/v1/agents/interaction', authenticateToken, async (req, res) => {
  try {
    const { agentId, agentName, inputMessage, outputMessage, success, responseTimeMs, errorMessage, metadata } = req.body;

    const interaction = await AgentMetricsService.recordInteraction({
      agentId,
      agentName,
      userId: (req as any).user.id,
      sessionId: req.headers['x-session-id'] as string,
      inputMessage,
      outputMessage,
      success,
      responseTimeMs,
      errorMessage,
      metadata
    });

    res.json({
      success: true,
      interaction
    });
  } catch (error) {
    console.error('Error recording agent interaction:', error);
    res.status(500).json({
      success: false,
      message: 'Erro ao registrar interação'
    });
  }
});

// POST /api/v1/agents/simulate - Simular interações para demonstração (apenas admin)
app.post('/api/v1/agents/simulate', authenticateToken, requireAdmin, async (req, res) => {
  try {
    await AgentMetricsService.simulateInteractions();

    res.json({
      success: true,
      message: 'Interações simuladas criadas com sucesso'
    });
  } catch (error) {
    console.error('Error simulating interactions:', error);
    res.status(500).json({
      success: false,
      message: 'Erro ao simular interações'
    });
  }
});

// GET /api/v1/analytics - Buscar analytics do sistema
app.get('/api/v1/analytics', authenticateToken, async (req, res) => {
  try {
    const analytics = await SystemAnalyticsService.generateSystemAnalytics();

    res.json({
      success: true,
      data: analytics
    });
  } catch (error) {
    console.error('Error fetching system analytics:', error);
    res.status(500).json({
      success: false,
      message: 'Erro ao buscar analytics do sistema'
    });
  }
});

// GET /api/v1/analytics - Buscar analytics do sistema
app.get('/api/v1/analytics', authenticateToken, async (req, res) => {
  try {
    const analytics = await SystemAnalyticsService.generateSystemAnalytics();

    res.json({
      success: true,
      data: analytics
    });
  } catch (error) {
    console.error('Error fetching system analytics:', error);
    res.status(500).json({
      success: false,
      message: 'Erro ao buscar analytics do sistema'
    });
  }
});

// ===== ANIMALS ROUTES =====

// GET /api/v1/animals - Listar animais
app.get('/api/v1/animals', authenticateToken, async (req, res) => {
  try {
    const { status, species, page = 1, limit = 10 } = req.query;

    const where: any = {};
    if (status) where.status = status;
    if (species) where.species = species;

    const animals = await prisma.animal.findMany({
      where,
      include: {
        municipality: true,
        microchip: true,
        adoptions: {
          include: {
            tutor: true
          }
        }
      },
      skip: (Number(page) - 1) * Number(limit),
      take: Number(limit),
      orderBy: { createdAt: 'desc' }
    });

    const total = await prisma.animal.count({ where });

    res.json({
      success: true,
      data: animals,
      pagination: {
        page: Number(page),
        limit: Number(limit),
        total,
        pages: Math.ceil(total / Number(limit))
      }
    });
  } catch (error) {
    console.error('Error fetching animals:', error);
    res.status(500).json({
      success: false,
      message: 'Erro ao buscar animais'
    });
  }
});

// GET /api/v1/animals/:id - Buscar animal por ID
app.get('/api/v1/animals/:id', authenticateToken, async (req, res) => {
  try {
    const { id } = req.params;

    const animal = await prisma.animal.findUnique({
      where: { id },
      include: {
        municipality: true,
        microchip: true,
        adoptions: {
          include: {
            tutor: true
          }
        },
        medicalHistory: true,
        photos: true
      }
    });

    if (!animal) {
      return res.status(404).json({
        success: false,
        message: 'Animal não encontrado'
      });
    }

    return res.json({
      success: true,
      data: animal
    });
  } catch (error) {
    console.error('Error fetching animal:', error);
    return res.status(500).json({
      success: false,
      message: 'Erro ao buscar animal'
    });
  }
});

// POST /api/v1/animals - Criar animal
app.post('/api/v1/animals', authenticateToken, async (req, res) => {
  try {
    const { name, species, breed, sex, size, birthDate, weight, color, observations } = req.body;

    const animal = await prisma.animal.create({
      data: {
        name,
        species,
        breed,
        sex,
        size,
        birthDate: birthDate ? new Date(birthDate) : null,
        weight: weight ? parseFloat(weight) : null,
        color,
        observations,
        qrCode: `QR-${Date.now()}`, // Generate a simple QR code
        status: 'DISPONIVEL',
        municipalityId: (req as any).user.municipalityId
      },
      include: {
        municipality: true,
        microchip: true
      }
    });

    res.json({
      success: true,
      data: animal,
      message: 'Animal criado com sucesso'
    });
  } catch (error) {
    console.error('Error creating animal:', error);
    res.status(500).json({
      success: false,
      message: 'Erro ao criar animal'
    });
  }
});

// PUT /api/v1/animals/:id - Atualizar animal
app.put('/api/v1/animals/:id', authenticateToken, async (req, res) => {
  try {
    const { id } = req.params;
    const { name, species, breed, sex, size, birthDate, weight, color, observations, status } = req.body;

    const animal = await prisma.animal.update({
      where: { id },
      data: {
        name,
        species,
        breed,
        sex,
        size,
        birthDate: birthDate ? new Date(birthDate) : null,
        weight: weight ? parseFloat(weight) : null,
        color,
        observations,
        status
      },
      include: {
        municipality: true,
        microchip: true
      }
    });

    res.json({
      success: true,
      data: animal,
      message: 'Animal atualizado com sucesso'
    });
  } catch (error) {
    console.error('Error updating animal:', error);
    res.status(500).json({
      success: false,
      message: 'Erro ao atualizar animal'
    });
  }
});

// ===== GRAPHRAG ROUTES =====

// GET /api/v1/graphrag/query - Query GraphRAG knowledge base
app.post('/api/v1/graphrag/query', authenticateToken, async (req, res) => {
  try {
    const { query, type = 'global' } = req.body;

    if (!query) {
      return res.status(400).json({
        success: false,
        message: 'Query é obrigatório'
      });
    }

    // For now, return mock data based on the query
    // In a real implementation, this would connect to your GraphRAG system
    const mockResponse = generateMockGraphRAGResponse(query);

    // Save the interaction to database
    await prisma.agentInteraction.create({
      data: {
        agentId: 'graphrag-001',
        agentName: 'GraphRAG',
        userId: (req as any).user.userId,
        inputMessage: query,
        outputMessage: JSON.stringify(mockResponse),
        responseTimeMs: Math.floor(Math.random() * 1000) + 500,
        success: true
      }
    });

    return res.json({
      success: true,
      data: mockResponse
    });
  } catch (error) {
    console.error('Error querying GraphRAG:', error);
    return res.status(500).json({
      success: false,
      message: 'Erro ao consultar base de conhecimento'
    });
  }
});

// GET /api/v1/graphrag/stats - Get GraphRAG statistics
app.get('/api/v1/graphrag/stats', authenticateToken, async (req, res) => {
  try {
    // Get real statistics from database
    const totalInteractions = await prisma.agentInteraction.count({
      where: {
        agentName: 'GraphRAG'
      }
    });

    const recentInteractions = await prisma.agentInteraction.findMany({
      where: {
        agentName: 'GraphRAG',
        createdAt: {
          gte: new Date(Date.now() - 24 * 60 * 60 * 1000) // Last 24 hours
        }
      },
      orderBy: { createdAt: 'desc' },
      take: 10,
      include: {
        user: {
          select: {
            name: true,
            email: true
          }
        }
      }
    });

    const avgResponseTime = await prisma.agentInteraction.aggregate({
      where: {
        agentName: 'GraphRAG'
      },
      _avg: {
        responseTimeMs: true
      }
    });

    res.json({
      success: true,
      data: {
        totalInteractions,
        recentInteractions: recentInteractions.length,
        avgResponseTime: Math.round(avgResponseTime._avg.responseTimeMs || 0),
        entities: 15, // Mock data - would come from GraphRAG
        relationships: 8, // Mock data - would come from GraphRAG
        sources: 3, // Mock data - would come from GraphRAG
        lastUpdate: new Date().toISOString()
      }
    });
  } catch (error) {
    console.error('Error fetching GraphRAG stats:', error);
    res.status(500).json({
      success: false,
      message: 'Erro ao buscar estatísticas'
    });
  }
});

function generateMockGraphRAGResponse(query: string) {
  const lowerQuery = query.toLowerCase();

  if (lowerQuery.includes('cachorro') || lowerQuery.includes('cão') || lowerQuery.includes('canino')) {
    return {
      answer: `Encontrei informações sobre cães no sistema DIBEA. Atualmente temos ${Math.floor(Math.random() * 10) + 5} cães disponíveis para adoção. Os cães passam por avaliação veterinária completa antes de serem disponibilizados.`,
      entities: [
        { name: 'Cães', type: 'Animal', count: 15 },
        { name: 'Adoção', type: 'Processo', count: 8 },
        { name: 'Avaliação Veterinária', type: 'Procedimento', count: 12 }
      ],
      relationships: [
        { source: 'Cães', target: 'Adoção', type: 'disponível_para' },
        { source: 'Cães', target: 'Avaliação Veterinária', type: 'passa_por' }
      ],
      sources: [
        'Base de dados de animais DIBEA',
        'Protocolo de adoção municipal',
        'Registros veterinários'
      ]
    };
  }

  if (lowerQuery.includes('gato') || lowerQuery.includes('felino')) {
    return {
      answer: `Informações sobre felinos: Temos ${Math.floor(Math.random() * 8) + 3} gatos disponíveis para adoção. Todos os felinos são castrados e vacinados antes da adoção.`,
      entities: [
        { name: 'Gatos', type: 'Animal', count: 8 },
        { name: 'Castração', type: 'Procedimento', count: 8 },
        { name: 'Vacinação', type: 'Procedimento', count: 8 }
      ],
      relationships: [
        { source: 'Gatos', target: 'Castração', type: 'submetido_a' },
        { source: 'Gatos', target: 'Vacinação', type: 'recebe' }
      ],
      sources: [
        'Registro de felinos DIBEA',
        'Protocolo de castração',
        'Carteira de vacinação'
      ]
    };
  }

  if (lowerQuery.includes('adoção') || lowerQuery.includes('adotar')) {
    return {
      answer: `Processo de adoção: Para adotar um animal, é necessário preencher formulário, passar por entrevista e visita domiciliar. O processo leva em média 7-10 dias úteis.`,
      entities: [
        { name: 'Formulário de Adoção', type: 'Documento', count: 1 },
        { name: 'Entrevista', type: 'Processo', count: 1 },
        { name: 'Visita Domiciliar', type: 'Processo', count: 1 }
      ],
      relationships: [
        { source: 'Formulário de Adoção', target: 'Entrevista', type: 'precede' },
        { source: 'Entrevista', target: 'Visita Domiciliar', type: 'precede' }
      ],
      sources: [
        'Manual de procedimentos de adoção',
        'Regulamento municipal',
        'Histórico de adoções'
      ]
    };
  }

  // Default response
  return {
    answer: `Sua consulta "${query}" foi processada. O sistema DIBEA possui informações sobre animais, processos de adoção, cuidados veterinários e regulamentações municipais.`,
    entities: [
      { name: 'Sistema DIBEA', type: 'Sistema', count: 1 },
      { name: 'Informações', type: 'Dados', count: 100 }
    ],
    relationships: [
      { source: 'Sistema DIBEA', target: 'Informações', type: 'contém' }
    ],
    sources: [
      'Base de dados DIBEA',
      'Documentação do sistema'
    ]
  };
}

// Agent routes (generic - must be after specific routes)
app.post('/api/v1/agents/:agentType', authenticateToken, (req, res) => {
  const { agentType } = req.params;
  const { input } = req.body;

  res.json({
    success: true,
    message: 'Agente processado com sucesso',
    data: {
      agentType,
      input,
      response: `Resposta do agente ${agentType}: Processando "${input}"`
    }
  });
});

// ===== ADMIN ROUTES =====

// GET /api/v1/admin/users - Listar todos os usuários
app.get('/api/v1/admin/users', authenticateToken, requireAdmin, async (req, res) => {
  try {
    const users = await prisma.user.findMany({
      select: {
        id: true,
        name: true,
        email: true,
        phone: true,
        role: true,
        active: true,
        createdAt: true,
        updatedAt: true,
        municipality: {
          select: {
            name: true
          }
        }
      },
      orderBy: {
        createdAt: 'desc'
      }
    });

    const formattedUsers = users.map(user => ({
      id: user.id,
      name: user.name,
      email: user.email,
      phone: user.phone,
      role: user.role,
      status: user.active ? 'active' : 'inactive',
      createdAt: user.createdAt.toISOString().split('T')[0],
      lastLogin: user.updatedAt.toISOString(),
      municipality: user.municipality?.name || 'N/A'
    }));

    res.json({
      success: true,
      users: formattedUsers,
      total: users.length
    });
  } catch (error) {
    console.error('Error fetching users:', error);
    res.status(500).json({
      success: false,
      message: 'Erro ao buscar usuários'
    });
  }
});

// POST /api/v1/admin/users - Criar novo usuário
app.post('/api/v1/admin/users', authenticateToken, requireAdmin, async (req, res) => {
  try {
    const { name, email, password, phone, role } = req.body;

    // Validar dados obrigatórios
    if (!name || !email || !password || !role) {
      return res.status(400).json({
        success: false,
        message: 'Nome, email, senha e role são obrigatórios'
      });
    }

    // Verificar se email já existe
    const existingUser = await prisma.user.findUnique({
      where: { email }
    });

    if (existingUser) {
      return res.status(400).json({
        success: false,
        message: 'Email já está em uso'
      });
    }

    // Hash da senha
    const hashedPassword = await bcrypt.hash(password, 10);

    // Buscar município padrão
    const defaultMunicipality = await prisma.municipality.findFirst();

    if (!defaultMunicipality) {
      return res.status(500).json({
        success: false,
        message: 'Nenhum município encontrado no sistema'
      });
    }

    // Criar usuário
    const newUser = await prisma.user.create({
      data: {
        name,
        email,
        passwordHash: hashedPassword,
        phone: phone || null,
        role: role as any,
        active: true,
        municipalityId: defaultMunicipality.id
      },
      select: {
        id: true,
        name: true,
        email: true,
        phone: true,
        role: true,
        active: true,
        createdAt: true
      }
    });

    return res.status(201).json({
      success: true,
      message: 'Usuário criado com sucesso',
      user: newUser
    });
  } catch (error) {
    console.error('Error creating user:', error);
    return res.status(500).json({
      success: false,
      message: 'Erro ao criar usuário'
    });
  }
});

// GET /api/v1/admin/stats - Estatísticas do sistema
app.get('/api/v1/admin/stats', authenticateToken, requireAdmin, async (req, res) => {
  try {
    const [
      totalUsers,
      totalAnimals,
      totalMunicipalities,
      totalAdoptions,
      activeUsers,
      availableAnimals
    ] = await Promise.all([
      prisma.user.count(),
      prisma.animal.count(),
      prisma.municipality.count(),
      prisma.adoption.count(),
      prisma.user.count({ where: { is_active: true } }),
      prisma.animal.count({ where: { status: 'DISPONIVEL' } })
    ]);

    // Calcular taxa de adoção
    const adoptionRate = totalAnimals > 0 ? (totalAdoptions / totalAnimals) * 100 : 0;

    res.json({
      success: true,
      stats: {
        totalUsers,
        totalAnimals,
        totalMunicipalities,
        totalAdoptions,
        activeUsers,
        availableAnimals,
        adoptionRate: Math.round(adoptionRate * 100) / 100,
        systemHealth: 'healthy'
      }
    });
  } catch (error) {
    console.error('Error fetching admin stats:', error);
    res.status(500).json({
      success: false,
      message: 'Erro ao buscar estatísticas'
    });
  }
});



// Catch all for missing routes
app.use('*', (req, res) => {
  res.status(404).json({
    success: false,
    message: 'Rota não encontrada'
  });
});

// Error handler
app.use((error: any, req: express.Request, res: express.Response, next: express.NextFunction) => {
  console.error('Error:', error);
  res.status(500).json({
    success: false,
    message: 'Erro interno do servidor'
  });
});

// Graceful shutdown
process.on('SIGINT', async () => {
  console.log('Shutting down gracefully...');
  await prisma.$disconnect();
  process.exit(0);
});

app.listen(PORT, () => {
  console.log(`🚀 DIBEA Real Server running on port ${PORT}`);
  console.log(`📊 Health check: http://localhost:${PORT}/health`);
  console.log(`🔐 Auth API: http://localhost:${PORT}/api/v1/auth`);
  console.log(`🤖 Agent API: http://localhost:${PORT}/api/v1/agents`);
  console.log(`🏠 Landing API: http://localhost:${PORT}/api/v1/landing`);
  console.log('');
  console.log('🎯 Demo accounts (run seed first):');
  console.log('👑 Admin: admin@dibea.com / admin123');
  console.log('🩺 Veterinário: vet@dibea.com / vet123');
  console.log('👨‍💼 Funcionário: func@dibea.com / func123');
  console.log('👤 Cidadão: cidadao@dibea.com / cidadao123');
});
