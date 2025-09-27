import { Request, Response } from 'express';
import { PrismaClient } from '@prisma/client';
import { z } from 'zod';
import { logger } from '../utils/logger';

const prisma = new PrismaClient();

// Validation schemas
const createNotificationSchema = z.object({
  title: z.string().min(1, 'Título é obrigatório'),
  message: z.string().min(1, 'Mensagem é obrigatória'),
  type: z.enum(['ADOPTION', 'TASK', 'SYSTEM', 'ALERT', 'INFO']),
  category: z.enum(['ADOCAO', 'DENUNCIA', 'CAMPANHA', 'SISTEMA', 'VETERINARIO']),
  priority: z.enum(['LOW', 'MEDIUM', 'HIGH', 'URGENT']).default('MEDIUM'),
  userId: z.string().optional(),
  animalId: z.string().optional(),
  adoptionId: z.string().optional(),
  taskId: z.string().optional(),
  actionType: z.enum(['APPROVE', 'REJECT', 'VIEW', 'REDIRECT', 'COMPLETE']).optional(),
  actionUrl: z.string().optional(),
  actionData: z.any().optional(),
  expiresAt: z.string().optional()
});

const updateNotificationSchema = z.object({
  status: z.enum(['UNREAD', 'READ', 'ARCHIVED']).optional(),
  readAt: z.string().optional()
});

const notificationFiltersSchema = z.object({
  page: z.number().min(1).default(1),
  limit: z.number().min(1).max(100).default(20),
  type: z.string().optional(),
  category: z.string().optional(),
  priority: z.string().optional(),
  status: z.string().optional(),
  userId: z.string().optional(),
  animalId: z.string().optional(),
  dateFrom: z.string().optional(),
  dateTo: z.string().optional()
});

// @route   GET /api/v1/notifications
// @desc    Get notifications with filters and pagination
// @access  Private
export const getNotifications = async (req: Request, res: Response): Promise<void> => {
  try {
    const filters = notificationFiltersSchema.parse({
      page: parseInt(req.query.page as string) || 1,
      limit: parseInt(req.query.limit as string) || 20,
      ...req.query
    });

    const { page, limit, type, category, priority, status, userId, animalId, dateFrom, dateTo } = filters;
    const skip = (page - 1) * limit;

    // Build where clause
    const where: any = {};
    
    // If user is not admin, only show their notifications
    const userRole = (req as any).user?.role;
    if (userRole !== 'ADMIN') {
      where.userId = (req as any).user?.id;
    } else if (userId) {
      where.userId = userId;
    }

    if (type) where.type = type;
    if (category) where.category = category;
    if (priority) where.priority = priority;
    if (status) where.status = status;
    if (animalId) where.animalId = animalId;

    if (dateFrom || dateTo) {
      where.createdAt = {};
      if (dateFrom) where.createdAt.gte = new Date(dateFrom);
      if (dateTo) where.createdAt.lte = new Date(dateTo);
    }

    // Get notifications with relations
    const [notifications, total] = await Promise.all([
      prisma.notification.findMany({
        where,
        skip,
        take: limit,
        orderBy: [
          { priority: 'desc' },
          { createdAt: 'desc' }
        ],
        include: {
          user: {
            select: { id: true, name: true, email: true }
          },
          animal: {
            select: { id: true, name: true, species: true }
          },
          adoption: {
            select: { id: true, status: true }
          },
          task: {
            select: { id: true, title: true, status: true }
          }
        }
      }),
      prisma.notification.count({ where })
    ]);

    const totalPages = Math.ceil(total / limit);

    res.json({
      success: true,
      data: notifications,
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
    logger.error('Error fetching notifications:', error);
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

// @route   GET /api/v1/notifications/:id
// @desc    Get single notification by ID
// @access  Private
export const getNotification = async (req: Request, res: Response): Promise<void> => {
  try {
    const { id } = req.params;
    const userId = (req as any).user?.id;
    const userRole = (req as any).user?.role;

    const notification = await prisma.notification.findUnique({
      where: { id },
      include: {
        user: {
          select: { id: true, name: true, email: true }
        },
        animal: {
          select: { id: true, name: true, species: true, breed: true }
        },
        adoption: {
          select: { id: true, status: true }
        },
        task: {
          select: { id: true, title: true, status: true, description: true }
        }
      }
    });

    if (!notification) {
      res.status(404).json({
        success: false,
        message: 'Notificação não encontrada'
      });
      return;
    }

    // Check if user can access this notification
    if (userRole !== 'ADMIN' && notification.userId !== userId) {
      res.status(403).json({
        success: false,
        message: 'Acesso negado'
      });
      return;
    }

    res.json({
      success: true,
      data: notification
    });

  } catch (error) {
    logger.error('Error fetching notification:', error);
    res.status(500).json({
      success: false,
      message: 'Erro interno do servidor'
    });
  }
};

// @route   POST /api/v1/notifications
// @desc    Create new notification
// @access  Private (ADMIN, FUNCIONARIO, VETERINARIO)
export const createNotification = async (req: Request, res: Response): Promise<void> => {
  try {
    const validatedData = createNotificationSchema.parse(req.body);

    const notification = await prisma.notification.create({
      data: {
        ...validatedData,
        actionData: validatedData.actionData ? JSON.stringify(validatedData.actionData) : null,
        expiresAt: validatedData.expiresAt ? new Date(validatedData.expiresAt) : null
      },
      include: {
        user: {
          select: { id: true, name: true, email: true }
        },
        animal: {
          select: { id: true, name: true, species: true }
        },
        adoption: {
          select: { id: true, status: true }
        },
        task: {
          select: { id: true, title: true, status: true }
        }
      }
    });

    logger.info(`Notification created: ${notification.id} for user: ${notification.userId}`);

    res.status(201).json({
      success: true,
      data: notification,
      message: 'Notificação criada com sucesso'
    });

  } catch (error) {
    logger.error('Error creating notification:', error);
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

// @route   PUT /api/v1/notifications/:id
// @desc    Update notification (mark as read, archive, etc.)
// @access  Private
export const updateNotification = async (req: Request, res: Response): Promise<void> => {
  try {
    const { id } = req.params;
    const userId = (req as any).user?.id;
    const userRole = (req as any).user?.role;
    const validatedData = updateNotificationSchema.parse(req.body);

    // Check if notification exists and user can access it
    const existingNotification = await prisma.notification.findUnique({
      where: { id }
    });

    if (!existingNotification) {
      res.status(404).json({
        success: false,
        message: 'Notificação não encontrada'
      });
      return;
    }

    if (userRole !== 'ADMIN' && existingNotification.userId !== userId) {
      res.status(403).json({
        success: false,
        message: 'Acesso negado'
      });
      return;
    }

    // Update notification
    const updateData: any = { ...validatedData };
    
    // If marking as read, set readAt timestamp
    if (validatedData.status === 'READ' && !existingNotification.readAt) {
      updateData.readAt = new Date();
    }

    const notification = await prisma.notification.update({
      where: { id },
      data: updateData,
      include: {
        user: {
          select: { id: true, name: true, email: true }
        },
        animal: {
          select: { id: true, name: true, species: true }
        },
        adoption: {
          select: { id: true, status: true }
        },
        task: {
          select: { id: true, title: true, status: true }
        }
      }
    });

    res.json({
      success: true,
      data: notification,
      message: 'Notificação atualizada com sucesso'
    });

  } catch (error) {
    logger.error('Error updating notification:', error);
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

// @route   POST /api/v1/notifications/:id/action
// @desc    Execute notification action
// @access  Private
export const executeNotificationAction = async (req: Request, res: Response): Promise<void> => {
  try {
    const { id } = req.params;
    const userId = (req as any).user?.id;
    const userRole = (req as any).user?.role;

    const notification = await prisma.notification.findUnique({
      where: { id },
      include: {
        task: true,
        adoption: true,
        animal: true
      }
    });

    if (!notification) {
      res.status(404).json({
        success: false,
        message: 'Notificação não encontrada'
      });
      return;
    }

    // Check access
    if (userRole !== 'ADMIN' && notification.userId !== userId) {
      res.status(403).json({
        success: false,
        message: 'Acesso negado'
      });
      return;
    }

    let result: any = {};

    // Execute action based on type
    switch (notification.actionType) {
      case 'APPROVE':
        if (notification.adoptionId) {
          await prisma.adoption.update({
            where: { id: notification.adoptionId },
            data: { status: 'APROVADA' }
          });
          result.message = 'Adoção aprovada com sucesso';
        } else if (notification.taskId) {
          await prisma.task.update({
            where: { id: notification.taskId },
            data: { status: 'COMPLETED', completedAt: new Date() }
          });
          result.message = 'Tarefa aprovada e concluída';
        }
        break;

      case 'REJECT':
        if (notification.adoptionId) {
          await prisma.adoption.update({
            where: { id: notification.adoptionId },
            data: { status: 'REJEITADA' }
          });
          result.message = 'Adoção rejeitada';
        } else if (notification.taskId) {
          await prisma.task.update({
            where: { id: notification.taskId },
            data: { status: 'CANCELLED' }
          });
          result.message = 'Tarefa cancelada';
        }
        break;

      case 'COMPLETE':
        if (notification.taskId) {
          await prisma.task.update({
            where: { id: notification.taskId },
            data: { status: 'COMPLETED', completedAt: new Date() }
          });
          result.message = 'Tarefa marcada como concluída';
        }
        break;

      case 'VIEW':
      case 'REDIRECT':
        result.redirectUrl = notification.actionUrl;
        result.message = 'Redirecionamento preparado';
        break;

      default:
        result.message = 'Ação executada';
    }

    // Mark notification as read
    await prisma.notification.update({
      where: { id },
      data: {
        status: 'READ',
        readAt: new Date()
      }
    });

    res.json({
      success: true,
      data: result,
      message: result.message || 'Ação executada com sucesso'
    });

  } catch (error) {
    logger.error('Error executing notification action:', error);
    res.status(500).json({
      success: false,
      message: 'Erro interno do servidor'
    });
  }
};

// @route   GET /api/v1/notifications/unread/count
// @desc    Get unread notifications count for user
// @access  Private
export const getUnreadCount = async (req: Request, res: Response): Promise<void> => {
  try {
    const userId = (req as any).user?.id;

    const count = await prisma.notification.count({
      where: {
        userId,
        status: 'UNREAD'
      }
    });

    res.json({
      success: true,
      data: { count }
    });

  } catch (error) {
    logger.error('Error getting unread count:', error);
    res.status(500).json({
      success: false,
      message: 'Erro interno do servidor'
    });
  }
};

// @route   POST /api/v1/notifications/mark-all-read
// @desc    Mark all notifications as read for user
// @access  Private
export const markAllAsRead = async (req: Request, res: Response): Promise<void> => {
  try {
    const userId = (req as any).user?.id;

    await prisma.notification.updateMany({
      where: {
        userId,
        status: 'UNREAD'
      },
      data: {
        status: 'READ',
        readAt: new Date()
      }
    });

    res.json({
      success: true,
      message: 'Todas as notificações foram marcadas como lidas'
    });

  } catch (error) {
    logger.error('Error marking all as read:', error);
    res.status(500).json({
      success: false,
      message: 'Erro interno do servidor'
    });
  }
};
