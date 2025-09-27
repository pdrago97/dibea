import express from 'express';
import cors from 'cors';
import dotenv from 'dotenv';

dotenv.config();

const app = express();
const PORT = process.env.PORT || 3000;

// Middleware
app.use(cors());
app.use(express.json());

// Mock data for testing
const mockStats = {
  totalAnimals: 2847,
  adoptedAnimals: 1923,
  activeMunicipalities: 47,
  registeredUsers: 8934,
  proceduresCompleted: 15672,
  documentsProcessed: 23891
};

const mockAnimals = [
  {
    id: '1',
    name: 'Luna',
    species: 'Cão',
    age: '2 anos',
    description: 'Carinhosa e brincalhona, adora crianças',
    image: 'https://images.unsplash.com/photo-1552053831-71594a27632d?w=300&h=200&fit=crop',
    municipality: 'São Paulo',
    urgent: false
  },
  {
    id: '2',
    name: 'Milo',
    species: 'Gato',
    age: '1 ano',
    description: 'Calmo e independente, ideal para apartamento',
    image: 'https://images.unsplash.com/photo-1514888286974-6c03e2ca1dba?w=300&h=200&fit=crop',
    municipality: 'Rio de Janeiro',
    urgent: true
  },
  {
    id: '3',
    name: 'Rex',
    species: 'Cão',
    age: '3 anos',
    description: 'Protetor e leal, ótimo para famílias',
    image: 'https://images.unsplash.com/photo-1587300003388-59208cc962cb?w=300&h=200&fit=crop',
    municipality: 'Belo Horizonte',
    urgent: false
  }
];

const mockUsers = [
  {
    id: '1',
    email: 'admin@dibea.com',
    password: 'admin123',
    name: 'Administrador',
    role: 'ADMIN',
    municipalityId: '1'
  },
  {
    id: '2',
    email: 'vet@dibea.com',
    password: 'vet123',
    name: 'Dr. Veterinário',
    role: 'VETERINARIO',
    municipalityId: '1'
  },
  {
    id: '3',
    email: 'func@dibea.com',
    password: 'func123',
    name: 'Funcionário Municipal',
    role: 'FUNCIONARIO',
    municipalityId: '1'
  },
  {
    id: '4',
    email: 'cidadao@dibea.com',
    password: 'cidadao123',
    name: 'João Cidadão',
    role: 'CIDADAO',
    municipalityId: '1'
  }
];

// Simple JWT token generation (for demo purposes)
const generateToken = (user: any) => {
  return Buffer.from(JSON.stringify({
    userId: user.id,
    email: user.email,
    role: user.role,
    municipalityId: user.municipalityId,
    exp: Date.now() + (7 * 24 * 60 * 60 * 1000) // 7 days
  })).toString('base64');
};

// Routes

// Health check
app.get('/health', (req, res) => {
  res.json({ 
    status: 'OK', 
    timestamp: new Date().toISOString(),
    services: {
      database: 'connected',
      neo4j: 'connected'
    }
  });
});

// Landing page stats
app.get('/api/v1/landing/stats', (req, res) => {
  res.json({ success: true, data: mockStats });
});

// Featured animals
app.get('/api/v1/landing/featured-animals', (req, res) => {
  res.json({ success: true, data: mockAnimals });
});

// Auth routes
app.post('/api/v1/auth/register', (req, res): any => {
  const { name, email, password, phone, role = 'CIDADAO' } = req.body;

  if (!name || !email || !password) {
    return res.status(400).json({
      success: false,
      message: 'Por favor, forneça nome, email e senha'
    });
  }

  // Check if user exists
  const userExists = mockUsers.find(u => u.email === email);
  if (userExists) {
    return res.status(400).json({
      success: false,
      message: 'Usuário já existe'
    });
  }

  // Create new user
  const newUser = {
    id: String(mockUsers.length + 1),
    email,
    password,
    name,
    role,
    municipalityId: '1'
  };

  mockUsers.push(newUser);

  const token = generateToken(newUser);

  res.status(201).json({
    success: true,
    token,
    user: {
      id: newUser.id,
      name: newUser.name,
      email: newUser.email,
      role: newUser.role,
      phone: phone || '',
      municipality: { id: '1', name: 'São Paulo' }
    },
    message: role === 'CIDADAO' 
      ? 'Conta criada com sucesso! Agora você pode explorar animais para adoção.'
      : 'Usuário criado com sucesso!'
  });
});

app.post('/api/v1/auth/login', (req, res): any => {
  const { email, password } = req.body;

  if (!email || !password) {
    return res.status(400).json({
      success: false,
      message: 'Email e senha são obrigatórios'
    });
  }

  // Find user
  const user = mockUsers.find(u => u.email === email && u.password === password);
  if (!user) {
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
      municipality: { id: '1', name: 'São Paulo' }
    }
  });
});

// Agent validation (simplified)
app.get('/api/v1/auth/validate-agent-access/:agentType', (req, res): any => {
  const authHeader = req.headers.authorization;
  
  if (!authHeader || !authHeader.startsWith('Bearer ')) {
    return res.status(401).json({
      success: false,
      error: 'Access token required'
    });
  }

  try {
    const token = authHeader.substring(7);
    const decoded = JSON.parse(Buffer.from(token, 'base64').toString());
    
    if (decoded.exp < Date.now()) {
      return res.status(401).json({
        success: false,
        error: 'Token expired'
      });
    }

    res.json({
      success: true,
      message: 'Acesso autorizado',
      permissions: {
        canRead: true,
        canWrite: decoded.role !== 'CIDADAO',
        canDelete: decoded.role === 'ADMIN',
        agentType: req.params.agentType
      }
    });
  } catch (error) {
    res.status(401).json({
      success: false,
      error: 'Invalid token'
    });
  }
});

// Agent routes (simplified)
app.post('/api/v1/agents/:agentType', (req, res) => {
  res.json({
    success: true,
    message: 'Agente processado com sucesso',
    data: {
      agentType: req.params.agentType,
      input: req.body.input,
      response: `Resposta do agente ${req.params.agentType}: Processando "${req.body.input}"`
    }
  });
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

app.listen(PORT, () => {
  console.log(`🚀 Simple DIBEA Server running on port ${PORT}`);
  console.log(`📊 Health check: http://localhost:${PORT}/health`);
  console.log(`🔐 Auth API: http://localhost:${PORT}/api/v1/auth`);
  console.log(`🤖 Agent API: http://localhost:${PORT}/api/v1/agents`);
  console.log(`🏠 Landing API: http://localhost:${PORT}/api/v1/landing`);
  console.log('');
  console.log('🎯 Demo accounts:');
  console.log('👑 Admin: admin@dibea.com / admin123');
  console.log('🩺 Veterinário: vet@dibea.com / vet123');
  console.log('👨‍💼 Funcionário: func@dibea.com / func123');
  console.log('👤 Cidadão: cidadao@dibea.com / cidadao123');
});
