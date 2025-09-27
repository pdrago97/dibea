import { Request, Response } from 'express';
import { PrismaClient } from '@prisma/client';
import { z } from 'zod';
import { logger } from '../utils/logger';

const prisma = new PrismaClient();

// Validation schemas
const createTaskSchema = z.object({
  title: z.string().min(1, 'Título é obrigatório'),
  description: z.string().min(1, 'Descrição é obrigatória'),
  type: z.enum(['ADOPTION_REVIEW', 'DOCUMENT_VERIFICATION', 'ANIMAL_UPDATE', 'SYSTEM_MAINTENANCE']),
  priority: z.enum(['LOW', 'MEDIUM', 'HIGH', 'URGENT']).default('MEDIUM'),
  assignedToId: z.string().optional(),
  animalId: z.string().optional(),
  adoptionId: z.string().optional(),
  metadata: z.any().optional(),
  dueDate: z.string().optional()
});

const updateTaskSchema = z.object({
  title: z.string().optional(),
  description: z.string().optional(),
  status: z.enum(['PENDING', 'IN_PROGRESS', 'COMPLETED', 'CANCELLED']).optional(),
  priority: z.enum(['LOW', 'MEDIUM', 'HIGH', 'URGENT']).optional(),
  assignedToId: z.string().optional(),
  metadata: z.any().optional(),
  dueDate: z.string().optional()
});

const taskFiltersSchema = z.object({
  page: z.number().min(1).default(1),
  limit: z.number().min(1).max(100).default(20),
  type: z.string().optional(),
  status: z.string().optional(),
  priority: z.string().optional(),
  createdById: z.string().optional(),
  assignedToId: z.string().optional(),
  animalId: z.string().optional(),
  adoptionId: z.string().optional(),
  dueDateFrom: z.string().optional(),
  dueDateTo: z.string().optional()
});

// @route   GET /api/v1/tasks
// @desc    Get tasks with filters and pagination
// @access  Private
export const getTasks = async (req: Request, res: Response): Promise<void> => {
  try {
    const filters = taskFiltersSchema.parse({
      page: parseInt(req.query.page as string) || 1,
      limit: parseInt(req.query.limit as string) || 20,
      ...req.query
    });

    const { page, limit, type, status, priority, createdById, assignedToId, animalId, adoptionId, dueDateFrom, dueDateTo } = filters;
    const skip = (page - 1) * limit;
    const userId = (req as any).user?.id;
    const userRole = (req as any).user?.role;

    // Build where clause
    const where: any = {};

    // Role-based filtering
    if (userRole === 'CIDADAO') {
      // Citizens can only see tasks related to their adoptions
      where.OR = [
        { createdById: userId },
        { 
          adoption: {
            tutorId: userId
          }
        }
      ];
    } else if (userRole !== 'ADMIN') {
      // Staff can see tasks assigned to them or created by them
      where.OR = [
        { createdById: userId },
        { assignedToId: userId }
      ];
    }

    if (type) where.type = type;
    if (status) where.status = status;
    if (priority) where.priority = priority;
    if (createdById) where.createdById = createdById;
    if (assignedToId) where.assignedToId = assignedToId;
    if (animalId) where.animalId = animalId;
    if (adoptionId) where.adoptionId = adoptionId;

    if (dueDateFrom || dueDateTo) {
      where.dueDate = {};
      if (dueDateFrom) where.dueDate.gte = new Date(dueDateFrom);
      if (dueDateTo) where.dueDate.lte = new Date(dueDateTo);
    }

    // Get tasks with relations
    const [tasks, total] = await Promise.all([
      prisma.task.findMany({
        where,
        skip,
        take: limit,
        orderBy: [
          { priority: 'desc' },
          { createdAt: 'desc' }
        ],
        include: {
          createdBy: {
            select: { id: true, name: true, email: true }
          },
          assignedTo: {
            select: { id: true, name: true, email: true }
          },
          animal: {
            select: { id: true, name: true, species: true }
          },
          adoption: {
            select: { id: true, status: true }
          },
          notifications: {
            select: { id: true, title: true, status: true }
          }
        }
      }),
      prisma.task.count({ where })
    ]);

    const totalPages = Math.ceil(total / limit);

    res.json({
      success: true,
      data: tasks,
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
    logger.error('Error fetching tasks:', error);
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

// @route   GET /api/v1/tasks/:id
// @desc    Get single task by ID
// @access  Private
export const getTask = async (req: Request, res: Response): Promise<void> => {
  try {
    const { id } = req.params;
    const userId = (req as any).user?.id;
    const userRole = (req as any).user?.role;

    const task = await prisma.task.findUnique({
      where: { id },
      include: {
        createdBy: {
          select: { id: true, name: true, email: true }
        },
        assignedTo: {
          select: { id: true, name: true, email: true }
        },
        animal: {
          select: { id: true, name: true, species: true, breed: true }
        },
        adoption: {
          select: { id: true, status: true }
        },
        notifications: {
          select: { id: true, title: true, status: true, createdAt: true }
        }
      }
    });

    if (!task) {
      res.status(404).json({
        success: false,
        message: 'Tarefa não encontrada'
      });
      return;
    }

    // Check access permissions
    const canAccess = userRole === 'ADMIN' || 
                     task.createdById === userId || 
                     task.assignedToId === userId ||
                     (userRole === 'CIDADAO' && task.adoption?.tutorId === userId);

    if (!canAccess) {
      res.status(403).json({
        success: false,
        message: 'Acesso negado'
      });
      return;
    }

    res.json({
      success: true,
      data: task
    });

  } catch (error) {
    logger.error('Error fetching task:', error);
    res.status(500).json({
      success: false,
      message: 'Erro interno do servidor'
    });
  }
};

// @route   POST /api/v1/tasks
// @desc    Create new task
// @access  Private (ADMIN, FUNCIONARIO, VETERINARIO)
export const createTask = async (req: Request, res: Response): Promise<void> => {
  try {
    const validatedData = createTaskSchema.parse(req.body);
    const createdById = (req as any).user?.id;

    const task = await prisma.task.create({
      data: {
        ...validatedData,
        createdById,
        metadata: validatedData.metadata ? JSON.stringify(validatedData.metadata) : null,
        dueDate: validatedData.dueDate ? new Date(validatedData.dueDate) : null
      },
      include: {
        createdBy: {
          select: { id: true, name: true, email: true }
        },
        assignedTo: {
          select: { id: true, name: true, email: true }
        },
        animal: {
          select: { id: true, name: true, species: true }
        },
        adoption: {
          select: { id: true, status: true }
        }
      }
    });

    // Create notification for assigned user
    if (task.assignedToId) {
      await prisma.notification.create({
        data: {
          title: `Nova tarefa atribuída: ${task.title}`,
          message: task.description,
          type: 'TASK',
          category: 'SISTEMA',
          priority: task.priority,
          userId: task.assignedToId,
          taskId: task.id,
          actionType: 'VIEW',
          actionUrl: `/tasks/${task.id}`
        }
      });
    }

    logger.info(`Task created: ${task.id} by user: ${createdById}`);

    res.status(201).json({
      success: true,
      data: task,
      message: 'Tarefa criada com sucesso'
    });

  } catch (error) {
    logger.error('Error creating task:', error);
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

// @route   PUT /api/v1/tasks/:id
// @desc    Update task
// @access  Private
export const updateTask = async (req: Request, res: Response): Promise<void> => {
  try {
    const { id } = req.params;
    const userId = (req as any).user?.id;
    const userRole = (req as any).user?.role;
    const validatedData = updateTaskSchema.parse(req.body);

    // Check if task exists and user can access it
    const existingTask = await prisma.task.findUnique({
      where: { id },
      include: {
        adoption: true
      }
    });

    if (!existingTask) {
      res.status(404).json({
        success: false,
        message: 'Tarefa não encontrada'
      });
      return;
    }

    // Check permissions
    const canUpdate = userRole === 'ADMIN' ||
                     existingTask.createdById === userId ||
                     existingTask.assignedToId === userId;

    if (!canUpdate) {
      res.status(403).json({
        success: false,
        message: 'Acesso negado'
      });
      return;
    }

    // Update task
    const updateData: any = { ...validatedData };

    if (validatedData.metadata) {
      updateData.metadata = JSON.stringify(validatedData.metadata);
    }

    if (validatedData.dueDate) {
      updateData.dueDate = new Date(validatedData.dueDate);
    }

    // If marking as completed, set completedAt
    if (validatedData.status === 'COMPLETED' && existingTask.status !== 'COMPLETED') {
      updateData.completedAt = new Date();
    }

    const task = await prisma.task.update({
      where: { id },
      data: updateData,
      include: {
        createdBy: {
          select: { id: true, name: true, email: true }
        },
        assignedTo: {
          select: { id: true, name: true, email: true }
        },
        animal: {
          select: { id: true, name: true, species: true }
        },
        adoption: {
          select: { id: true, status: true }
        }
      }
    });

    // Create notification for status changes
    if (validatedData.status && validatedData.status !== existingTask.status) {
      const statusMessages = {
        'IN_PROGRESS': 'iniciada',
        'COMPLETED': 'concluída',
        'CANCELLED': 'cancelada'
      };

      const message = statusMessages[validatedData.status as keyof typeof statusMessages];

      if (message) {
        // Notify creator if different from updater
        if (existingTask.createdById !== userId) {
          await prisma.notification.create({
            data: {
              title: `Tarefa ${message}: ${task.title}`,
              message: `A tarefa foi ${message} por ${(req as any).user?.name}`,
              type: 'TASK',
              category: 'SISTEMA',
              priority: 'MEDIUM',
              userId: existingTask.createdById,
              taskId: task.id,
              actionType: 'VIEW',
              actionUrl: `/tasks/${task.id}`
            }
          });
        }

        // Notify assigned user if different from updater
        if (existingTask.assignedToId && existingTask.assignedToId !== userId) {
          await prisma.notification.create({
            data: {
              title: `Tarefa ${message}: ${task.title}`,
              message: `A tarefa foi ${message}`,
              type: 'TASK',
              category: 'SISTEMA',
              priority: 'MEDIUM',
              userId: existingTask.assignedToId,
              taskId: task.id,
              actionType: 'VIEW',
              actionUrl: `/tasks/${task.id}`
            }
          });
        }
      }
    }

    res.json({
      success: true,
      data: task,
      message: 'Tarefa atualizada com sucesso'
    });

  } catch (error) {
    logger.error('Error updating task:', error);
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

// @route   DELETE /api/v1/tasks/:id
// @desc    Delete task
// @access  Private (ADMIN, Creator only)
export const deleteTask = async (req: Request, res: Response): Promise<void> => {
  try {
    const { id } = req.params;
    const userId = (req as any).user?.id;
    const userRole = (req as any).user?.role;

    const task = await prisma.task.findUnique({
      where: { id }
    });

    if (!task) {
      res.status(404).json({
        success: false,
        message: 'Tarefa não encontrada'
      });
      return;
    }

    // Only admin or creator can delete
    if (userRole !== 'ADMIN' && task.createdById !== userId) {
      res.status(403).json({
        success: false,
        message: 'Acesso negado'
      });
      return;
    }

    await prisma.task.delete({
      where: { id }
    });

    res.json({
      success: true,
      message: 'Tarefa excluída com sucesso'
    });

  } catch (error) {
    logger.error('Error deleting task:', error);
    res.status(500).json({
      success: false,
      message: 'Erro interno do servidor'
    });
  }
};
