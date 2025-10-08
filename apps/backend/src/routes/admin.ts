import express from 'express';
import { PrismaClient } from '@prisma/client';
import bcrypt from 'bcrypt';
import { authenticate, authorize } from '../middleware/auth';

const router = express.Router();
const prisma = new PrismaClient();

// Middleware para verificar se é admin
const requireAdmin = authorize('ADMIN');

// GET /api/v1/admin/users - Listar todos os usuários
router.get('/users', authenticate, requireAdmin, async (req, res) => {
  try {
    const users = await prisma.user.findMany({
      select: {
        id: true,
        name: true,
        email: true,
        phone: true,
        role: true,
        isActive: true,
        createdAt: true,
        updatedAt: true,
        municipality: {
          select: {
            id: true,
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
      status: user.isActive ? 'active' : 'inactive',
      active: user.isActive,
      createdAt: user.createdAt.toISOString().split('T')[0],
      lastLogin: user.updatedAt.toISOString(),
      municipality: user.municipality || null
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
router.post('/users', authenticate, requireAdmin, async (req, res) => {
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

    // Criar usuário
    const newUser = await prisma.user.create({
      data: {
        name,
        email,
        passwordHash: hashedPassword,
        phone: phone || null,
        role: role as any,
        isActive: true,
        municipalityId: defaultMunicipality?.id
      },
      select: {
        id: true,
        name: true,
        email: true,
        phone: true,
        role: true,
        isActive: true,
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

// PUT /api/v1/admin/users/:id - Atualizar usuário
router.put('/users/:id', authenticate, requireAdmin, async (req, res) => {
  try {
    const { id } = req.params;
    const { name, email, phone, role, isActive } = req.body;

    // Verificar se usuário existe
    const existingUser = await prisma.user.findUnique({
      where: { id }
    });

    if (!existingUser) {
      return res.status(404).json({
        success: false,
        message: 'Usuário não encontrado'
      });
    }

    // Verificar se email já está em uso por outro usuário
    if (email && email !== existingUser.email) {
      const emailInUse = await prisma.user.findUnique({
        where: { email }
      });

      if (emailInUse) {
        return res.status(400).json({
          success: false,
          message: 'Email já está em uso'
        });
      }
    }

    // Atualizar usuário
    const updatedUser = await prisma.user.update({
      where: { id },
      data: {
        ...(name && { name }),
        ...(email && { email }),
        ...(phone !== undefined && { phone }),
        ...(role && { role: role as any }),
        ...(isActive !== undefined && { isActive })
      },
      select: {
        id: true,
        name: true,
        email: true,
        phone: true,
        role: true,
        isActive: true,
        updatedAt: true
      }
    });

    return res.json({
      success: true,
      message: 'Usuário atualizado com sucesso',
      user: updatedUser
    });
  } catch (error) {
    console.error('Error updating user:', error);
    return res.status(500).json({
      success: false,
      message: 'Erro ao atualizar usuário'
    });
  }
});

// DELETE /api/v1/admin/users/:id - Desativar usuário
router.delete('/users/:id', authenticate, requireAdmin, async (req, res) => {
  try {
    const { id } = req.params;

    // Verificar se usuário existe
    const existingUser = await prisma.user.findUnique({
      where: { id }
    });

    if (!existingUser) {
      return res.status(404).json({
        success: false,
        message: 'Usuário não encontrado'
      });
    }

    // Desativar usuário (soft delete)
    await prisma.user.update({
      where: { id },
      data: { isActive: false }
    });

    return res.json({
      success: true,
      message: 'Usuário desativado com sucesso'
    });
  } catch (error) {
    console.error('Error deactivating user:', error);
    return res.status(500).json({
      success: false,
      message: 'Erro ao desativar usuário'
    });
  }
});

// GET /api/v1/admin/stats - Estatísticas do sistema
router.get('/stats', authenticate, requireAdmin, async (req, res) => {
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
      prisma.user.count({ where: { isActive: true } }),
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

// GET /api/v1/admin/activity - Atividade recente
router.get('/activity', authenticate, requireAdmin, async (req, res) => {
  try {
    // Buscar atividades recentes (últimos usuários, animais, etc.)
    const [recentUsers, recentAnimals] = await Promise.all([
      prisma.user.findMany({
        take: 5,
        orderBy: { createdAt: 'desc' },
        select: {
          id: true,
          name: true,
          email: true,
          role: true,
          createdAt: true
        }
      }),
      prisma.animal.findMany({
        take: 5,
        orderBy: { createdAt: 'desc' },
        select: {
          id: true,
          name: true,
          species: true,
          createdAt: true
        }
      })
    ]);

    const activities = [
      ...recentUsers.map(user => ({
        id: `user-${user.id}`,
        type: 'user_registration',
        message: `Novo usuário registrado: ${user.name}`,
        time: formatTimeAgo(user.createdAt),
        status: 'success'
      })),
      ...recentAnimals.map(animal => ({
        id: `animal-${animal.id}`,
        type: 'animal_added',
        message: `Animal adicionado: ${animal.name} (${animal.species})`,
        time: formatTimeAgo(animal.createdAt),
        status: 'info'
      }))
    ].sort((a, b) => new Date(b.time).getTime() - new Date(a.time).getTime()).slice(0, 10);

    res.json({
      success: true,
      activities
    });
  } catch (error) {
    console.error('Error fetching activity:', error);
    res.status(500).json({
      success: false,
      message: 'Erro ao buscar atividades'
    });
  }
});

// GET /api/v1/admin/clinics - Listar todas as clínicas
router.get('/clinics', authenticate, requireAdmin, async (req, res) => {
  try {
    // TODO: Implement when Clinic model is ready in Prisma
    return res.json({
      success: true,
      clinics: []
    });
    
    /* REMOVE MOCK DATA
    const mockClinics = [
      {
        id: '1',
        name: 'Clínica Veterinária ABC',
        cnpj: '12.345.678/0001-90',
        email: 'contato@clinicaabc.com.br',
        phone: '(11) 3456-7890',
        address: 'Rua das Flores, 123',
        city: 'São Paulo',
        state: 'SP',
        zipCode: '01234-567',
        status: 'PENDING',
        veterinarian: {
          name: 'Dr. João Silva',
          crmv: 'SP-12345',
          email: 'joao@clinicaabc.com.br'
        },
        services: ['Consultas', 'Cirurgias', 'Vacinação', 'Exames'],
        documents: [
          { id: '1', type: 'CRMV', url: '/docs/crmv.pdf', verified: true },
          { id: '2', type: 'CNPJ', url: '/docs/cnpj.pdf', verified: true },
          { id: '3', type: 'Alvará', url: '/docs/alvara.pdf', verified: false }
        ],
        requestDate: '2024-01-15T10:00:00Z'
      },
      {
        id: '2',
        name: 'Pet Care Veterinária',
        cnpj: '98.765.432/0001-10',
        email: 'contato@petcare.com.br',
        phone: '(11) 9876-5432',
        address: 'Av. Principal, 456',
        city: 'São Paulo',
        state: 'SP',
        zipCode: '09876-543',
        status: 'APPROVED',
        veterinarian: {
          name: 'Dra. Maria Santos',
          crmv: 'SP-67890',
          email: 'maria@petcare.com.br'
        },
        services: ['Consultas', 'Emergência 24h', 'Internação'],
        documents: [
          { id: '4', type: 'CRMV', url: '/docs/crmv2.pdf', verified: true },
          { id: '5', type: 'CNPJ', url: '/docs/cnpj2.pdf', verified: true }
        ],
        requestDate: '2024-01-10T14:30:00Z',
        reviewDate: '2024-01-12T09:15:00Z',
        reviewNotes: 'Documentação completa e em ordem. Clínica aprovada.'
      }
    ];
    */
  } catch (error) {
    console.error('Error fetching clinics:', error);
    return res.status(500).json({
      success: false,
      message: 'Erro ao buscar clínicas'
    });
  }
});

// POST /api/v1/admin/clinics/:id/approve - Aprovar clínica
router.post('/clinics/:id/approve', authenticate, requireAdmin, async (req, res) => {
  try {
    const { id } = req.params;
    const { notes } = req.body;

    // TODO: Implement clinic approval logic when model is ready
    res.json({
      success: true,
      message: 'Clínica aprovada com sucesso'
    });
  } catch (error) {
    console.error('Error approving clinic:', error);
    res.status(500).json({
      success: false,
      message: 'Erro ao aprovar clínica'
    });
  }
});

// POST /api/v1/admin/clinics/:id/reject - Rejeitar clínica
router.post('/clinics/:id/reject', authenticate, requireAdmin, async (req, res) => {
  try {
    const { id } = req.params;
    const { notes } = req.body;

    // TODO: Implement clinic rejection logic when model is ready
    res.json({
      success: true,
      message: 'Clínica rejeitada'
    });
  } catch (error) {
    console.error('Error rejecting clinic:', error);
    res.status(500).json({
      success: false,
      message: 'Erro ao rejeitar clínica'
    });
  }
});

// Função auxiliar para formatar tempo
function formatTimeAgo(date: Date): string {
  const now = new Date();
  const diffInMinutes = Math.floor((now.getTime() - date.getTime()) / (1000 * 60));
  
  if (diffInMinutes < 1) return 'agora';
  if (diffInMinutes < 60) return `${diffInMinutes} min atrás`;
  
  const diffInHours = Math.floor(diffInMinutes / 60);
  if (diffInHours < 24) return `${diffInHours} hora${diffInHours > 1 ? 's' : ''} atrás`;
  
  const diffInDays = Math.floor(diffInHours / 24);
  return `${diffInDays} dia${diffInDays > 1 ? 's' : ''} atrás`;
}

export default router;
