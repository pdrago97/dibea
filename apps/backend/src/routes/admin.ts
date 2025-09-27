import express from 'express';
import { PrismaClient } from '@prisma/client';
import bcrypt from 'bcrypt';
import { authenticateToken, requireRole } from '../middleware/auth';

const router = express.Router();
const prisma = new PrismaClient();

// Middleware para verificar se é admin
const requireAdmin = requireRole(['ADMIN']);

// GET /api/v1/admin/users - Listar todos os usuários
router.get('/users', authenticateToken, requireAdmin, async (req, res) => {
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
router.post('/users', authenticateToken, requireAdmin, async (req, res) => {
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
        password: hashedPassword,
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

    res.status(201).json({
      success: true,
      message: 'Usuário criado com sucesso',
      user: newUser
    });
  } catch (error) {
    console.error('Error creating user:', error);
    res.status(500).json({
      success: false,
      message: 'Erro ao criar usuário'
    });
  }
});

// PUT /api/v1/admin/users/:id - Atualizar usuário
router.put('/users/:id', authenticateToken, requireAdmin, async (req, res) => {
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

    res.json({
      success: true,
      message: 'Usuário atualizado com sucesso',
      user: updatedUser
    });
  } catch (error) {
    console.error('Error updating user:', error);
    res.status(500).json({
      success: false,
      message: 'Erro ao atualizar usuário'
    });
  }
});

// DELETE /api/v1/admin/users/:id - Desativar usuário
router.delete('/users/:id', authenticateToken, requireAdmin, async (req, res) => {
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

    res.json({
      success: true,
      message: 'Usuário desativado com sucesso'
    });
  } catch (error) {
    console.error('Error deactivating user:', error);
    res.status(500).json({
      success: false,
      message: 'Erro ao desativar usuário'
    });
  }
});

// GET /api/v1/admin/stats - Estatísticas do sistema
router.get('/stats', authenticateToken, requireAdmin, async (req, res) => {
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

// GET /api/v1/admin/activity - Atividade recente
router.get('/activity', authenticateToken, requireAdmin, async (req, res) => {
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
