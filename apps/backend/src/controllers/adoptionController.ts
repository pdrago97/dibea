import { Request, Response } from 'express';
import { PrismaClient } from '@prisma/client';
import { z } from 'zod';
import { logger } from '../utils/logger';
import { NotificationService } from '../services/notificationService';

const prisma = new PrismaClient();

// Validation schemas
const createAdoptionSchema = z.object({
  animalId: z.string().min(1, 'ID do animal é obrigatório'),
  notes: z.string().optional()
});

const updateAdoptionStatusSchema = z.object({
  status: z.enum(['PENDENTE', 'APROVADA', 'REJEITADA']),
  notes: z.string().optional()
});

const adoptionFiltersSchema = z.object({
  page: z.number().min(1).default(1),
  limit: z.number().min(1).max(100).default(20),
  status: z.string().optional(),
  animalId: z.string().optional(),
  tutorId: z.string().optional(),
  dateFrom: z.string().optional(),
  dateTo: z.string().optional()
});

// @route   GET /api/v1/adoptions
// @desc    Get adoptions with filters and pagination
// @access  Private (ADMIN, FUNCIONARIO, VETERINARIO)
export const getAdoptions = async (req: Request, res: Response): Promise<void> => {
  try {
    const filters = adoptionFiltersSchema.parse({
      page: parseInt(req.query.page as string) || 1,
      limit: parseInt(req.query.limit as string) || 20,
      ...req.query
    });

    const { page, limit, status, animalId, tutorId, dateFrom, dateTo } = filters;
    const skip = (page - 1) * limit;

    // Build where clause
    const where: any = {};
    
    if (status) where.status = status;
    if (animalId) where.animalId = animalId;
    if (tutorId) where.tutorId = tutorId;

    if (dateFrom || dateTo) {
      where.createdAt = {};
      if (dateFrom) where.createdAt.gte = new Date(dateFrom);
      if (dateTo) where.createdAt.lte = new Date(dateTo);
    }

    // Get adoptions with relations
    const [adoptions, total] = await Promise.all([
      prisma.adoption.findMany({
        where,
        skip,
        take: limit,
        orderBy: { createdAt: 'desc' },
        include: {
          animal: {
            select: { 
              id: true, 
              name: true, 
              species: true, 
              breed: true,
              age: true,
              sex: true,
              status: true
            }
          },
          tutor: {
            select: { 
              id: true, 
              name: true, 
              email: true 
            }
          }
        }
      }),
      prisma.adoption.count({ where })
    ]);

    const totalPages = Math.ceil(total / limit);

    res.json({
      success: true,
      data: adoptions,
      pagination: {
        page,
        limit,
        total,
        totalPages,
        hasNext: page < totalPages,
        hasPrev: page > 1
      }
    });

  } catch (error) {
    logger.error('Error fetching adoptions:', error);
    if (error instanceof z.ZodError) {
      res.status(400).json({
        success: false,
        message: 'Dados inválidos',
        errors: error.errors
      });
    } else {
      res.status(500).json({
        success: false,
        message: 'Erro interno do servidor'
      });
    }
  }
};

// @route   GET /api/v1/adoptions/my
// @desc    Get user's adoptions
// @access  Private (All authenticated users)
export const getUserAdoptions = async (req: Request, res: Response): Promise<void> => {
  try {
    const userId = (req as any).user?.id;

    const adoptions = await prisma.adoption.findMany({
      where: { tutorId: userId },
      orderBy: { createdAt: 'desc' },
      include: {
        animal: {
          select: { 
            id: true, 
            name: true, 
            species: true, 
            breed: true,
            age: true,
            sex: true,
            status: true
          }
        },
        notifications: {
          select: {
            id: true,
            title: true,
            message: true,
            status: true,
            createdAt: true
          },
          orderBy: { createdAt: 'desc' },
          take: 5
        }
      }
    });

    res.json({
      success: true,
      data: adoptions
    });

  } catch (error) {
    logger.error('Error fetching user adoptions:', error);
    res.status(500).json({
      success: false,
      message: 'Erro interno do servidor'
    });
  }
};

// @route   GET /api/v1/adoptions/:id
// @desc    Get single adoption by ID
// @access  Private (All authenticated users - with permission checks)
export const getAdoption = async (req: Request, res: Response): Promise<void> => {
  try {
    const { id } = req.params;
    const userId = (req as any).user?.id;
    const userRole = (req as any).user?.role;

    const adoption = await prisma.adoption.findUnique({
      where: { id },
      include: {
        animal: {
          select: { 
            id: true, 
            name: true, 
            species: true, 
            breed: true,
            age: true,
            sex: true,
            status: true,
            description: true,
            color: true,
            weight: true
          }
        },
        tutor: {
          select: { 
            id: true, 
            name: true, 
            email: true 
          }
        },
        notifications: {
          select: {
            id: true,
            title: true,
            message: true,
            status: true,
            createdAt: true
          },
          orderBy: { createdAt: 'desc' }
        },
        tasks: {
          select: {
            id: true,
            title: true,
            description: true,
            status: true,
            priority: true,
            createdAt: true
          },
          orderBy: { createdAt: 'desc' }
        }
      }
    });

    if (!adoption) {
      res.status(404).json({
        success: false,
        message: 'Adoção não encontrada'
      });
      return;
    }

    // Check access permissions
    const canAccess = userRole === 'ADMIN' || 
                     userRole === 'FUNCIONARIO' || 
                     userRole === 'VETERINARIO' ||
                     adoption.tutorId === userId;

    if (!canAccess) {
      res.status(403).json({
        success: false,
        message: 'Acesso negado'
      });
      return;
    }

    res.json({
      success: true,
      data: adoption
    });

  } catch (error) {
    logger.error('Error fetching adoption:', error);
    res.status(500).json({
      success: false,
      message: 'Erro interno do servidor'
    });
  }
};

// @route   POST /api/v1/adoptions
// @desc    Create new adoption request
// @access  Private (All authenticated users)
export const createAdoption = async (req: Request, res: Response): Promise<void> => {
  try {
    const validatedData = createAdoptionSchema.parse(req.body);
    const tutorId = (req as any).user?.id;

    // Check if animal exists and is available
    const animal = await prisma.animal.findUnique({
      where: { id: validatedData.animalId }
    });

    if (!animal) {
      res.status(404).json({
        success: false,
        message: 'Animal não encontrado'
      });
      return;
    }

    if (animal.status !== 'DISPONIVEL') {
      res.status(400).json({
        success: false,
        message: 'Animal não está disponível para adoção'
      });
      return;
    }

    // Check if user already has a pending adoption for this animal
    const existingAdoption = await prisma.adoption.findFirst({
      where: {
        animalId: validatedData.animalId,
        tutorId,
        status: 'PENDENTE'
      }
    });

    if (existingAdoption) {
      res.status(400).json({
        success: false,
        message: 'Você já possui uma solicitação pendente para este animal'
      });
      return;
    }

    // Create adoption request
    const adoption = await prisma.adoption.create({
      data: {
        animalId: validatedData.animalId,
        tutorId,
        notes: validatedData.notes,
        status: 'PENDENTE'
      },
      include: {
        animal: {
          select: { 
            id: true, 
            name: true, 
            species: true, 
            breed: true
          }
        },
        tutor: {
          select: { 
            id: true, 
            name: true, 
            email: true 
          }
        }
      }
    });

    // Create notification for admins/staff
    await NotificationService.createAdoptionNotification(
      adoption.id,
      'NEW_REQUEST'
    );

    // Create task for adoption review
    await prisma.task.create({
      data: {
        title: `Revisar adoção - ${animal.name}`,
        description: `Revisar solicitação de adoção de ${animal.name} por ${adoption.tutor.name}`,
        type: 'ADOPTION_REVIEW',
        priority: 'HIGH',
        createdById: tutorId,
        animalId: validatedData.animalId,
        adoptionId: adoption.id,
        metadata: JSON.stringify({
          animalName: animal.name,
          tutorName: adoption.tutor.name,
          tutorEmail: adoption.tutor.email
        })
      }
    });

    logger.info(`Adoption request created: ${adoption.id} for animal: ${validatedData.animalId}`);

    res.status(201).json({
      success: true,
      data: adoption,
      message: 'Solicitação de adoção criada com sucesso'
    });

  } catch (error) {
    logger.error('Error creating adoption:', error);
    if (error instanceof z.ZodError) {
      res.status(400).json({
        success: false,
        message: 'Dados inválidos',
        errors: error.errors
      });
    } else {
      res.status(500).json({
        success: false,
        message: 'Erro interno do servidor'
      });
    }
  }
};

// @route   PUT /api/v1/adoptions/:id/status
// @desc    Update adoption status
// @access  Private (ADMIN, FUNCIONARIO, VETERINARIO)
export const updateAdoptionStatus = async (req: Request, res: Response): Promise<void> => {
  try {
    const { id } = req.params;
    const validatedData = updateAdoptionStatusSchema.parse(req.body);
    const userId = (req as any).user?.id;

    // Check if adoption exists
    const existingAdoption = await prisma.adoption.findUnique({
      where: { id },
      include: {
        animal: true,
        tutor: true
      }
    });

    if (!existingAdoption) {
      res.status(404).json({
        success: false,
        message: 'Adoção não encontrada'
      });
      return;
    }

    // Update adoption status
    const adoption = await prisma.adoption.update({
      where: { id },
      data: {
        status: validatedData.status,
        notes: validatedData.notes,
        updatedAt: new Date()
      },
      include: {
        animal: {
          select: {
            id: true,
            name: true,
            species: true,
            breed: true
          }
        },
        tutor: {
          select: {
            id: true,
            name: true,
            email: true
          }
        }
      }
    });

    // Update animal status if adoption is approved
    if (validatedData.status === 'APROVADA') {
      await prisma.animal.update({
        where: { id: existingAdoption.animalId },
        data: { status: 'ADOTADO' }
      });

      // Create approval notification for tutor
      await NotificationService.createAdoptionNotification(
        adoption.id,
        'APPROVED',
        adoption.tutorId
      );

      // Create task for post-adoption follow-up
      await prisma.task.create({
        data: {
          title: `Acompanhamento pós-adoção - ${adoption.animal.name}`,
          description: `Acompanhar a adaptação de ${adoption.animal.name} com ${adoption.tutor.name}`,
          type: 'ADOPTION_REVIEW',
          priority: 'MEDIUM',
          createdById: userId,
          animalId: adoption.animalId,
          adoptionId: adoption.id,
          dueDate: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000), // 30 days from now
          metadata: JSON.stringify({
            type: 'follow_up',
            animalName: adoption.animal.name,
            tutorName: adoption.tutor.name,
            adoptionDate: new Date().toISOString()
          })
        }
      });

    } else if (validatedData.status === 'REJEITADA') {
      // Create rejection notification for tutor
      await NotificationService.createAdoptionNotification(
        adoption.id,
        'REJECTED',
        adoption.tutorId
      );
    }

    // Complete related tasks
    await prisma.task.updateMany({
      where: {
        adoptionId: adoption.id,
        status: 'PENDING'
      },
      data: {
        status: 'COMPLETED',
        completedAt: new Date()
      }
    });

    logger.info(`Adoption status updated: ${adoption.id} to ${validatedData.status}`);

    res.json({
      success: true,
      data: adoption,
      message: `Status da adoção atualizado para ${validatedData.status}`
    });

  } catch (error) {
    logger.error('Error updating adoption status:', error);
    if (error instanceof z.ZodError) {
      res.status(400).json({
        success: false,
        message: 'Dados inválidos',
        errors: error.errors
      });
    } else {
      res.status(500).json({
        success: false,
        message: 'Erro interno do servidor'
      });
    }
  }
};
