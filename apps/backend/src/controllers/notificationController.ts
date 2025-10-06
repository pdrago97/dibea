import { Request, Response } from 'express';
import { PrismaClient } from '@prisma/client';
import { z } from 'zod';
import { logger } from '../utils/logger';

const prisma = new PrismaClient();

// Validation schemas
const createNotificationSchema = z.object({
  titulo: z.string().min(1, 'Título é obrigatório'),
  conteudo: z.string().min(1, 'Mensagem é obrigatória'),
  tipo: z.enum(['EMAIL', 'SMS', 'WHATSAPP', 'PUSH']),
  categoria: z.string(),
  prioridade: z.enum(['BAIXA', 'MEDIA', 'ALTA', 'URGENTE']).default('MEDIA'),
  userId: z.string().optional(),
  phone: z.string().optional(),
  email: z.string().optional(),
  relacionadoTipo: z.string().optional(),
  relacionadoId: z.string().optional(),
  enviarEm: z.string().optional()
});

const updateNotificationSchema = z.object({
  visualizada: z.boolean().optional(),
  dataVisualizacao: z.string().optional()
});

const notificationFiltersSchema = z.object({
  page: z.number().min(1).default(1),
  limit: z.number().min(1).max(100).default(20),
  tipo: z.string().optional(),
  categoria: z.string().optional(),
  prioridade: z.string().optional(),
  visualizada: z.boolean().optional(),
  userId: z.string().optional(),
  relacionadoId: z.string().optional(),
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

    const { page, limit, tipo, categoria, prioridade, visualizada, userId, relacionadoId, dateFrom, dateTo } = filters;
    const skip = (page - 1) * limit;

    // Build where clause
    const where: any = {};
    
    // If user is not admin, only show their notifications
    const userRole = (req as any).user?.role;
    if (userRole !== 'ADMIN' && userRole !== 'SUPER_ADMIN') {
      where.userId = (req as any).user?.id;
    } else if (userId) {
      where.userId = userId;
    }

    if (tipo) where.tipo = tipo;
    if (categoria) where.categoria = categoria;
    if (prioridade) where.prioridade = prioridade;
    if (visualizada !== undefined) where.visualizada = visualizada;
    if (relacionadoId) where.relacionadoId = relacionadoId;

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
          { prioridade: 'desc' },
          { createdAt: 'desc' }
        ],
        include: {
          user: {
            select: { id: true, email: true, phone: true, role: true }
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
          select: { id: true, email: true, phone: true, role: true }
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
        titulo: validatedData.titulo,
        conteudo: validatedData.conteudo,
        tipo: validatedData.tipo,
        categoria: validatedData.categoria,
        prioridade: validatedData.prioridade,
        userId: validatedData.userId,
        phone: validatedData.phone,
        email: validatedData.email,
        relacionadoTipo: validatedData.relacionadoTipo,
        relacionadoId: validatedData.relacionadoId,
        enviarEm: validatedData.enviarEm ? new Date(validatedData.enviarEm) : undefined
      },
      include: {
        user: {
          select: { id: true, email: true, phone: true, role: true }
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
    const updateData: any = {};
    
    // If marking as read, set dataVisualizacao timestamp
    if (validatedData.visualizada && !existingNotification.dataVisualizacao) {
      updateData.visualizada = true;
      updateData.dataVisualizacao = new Date();
    } else if (validatedData.visualizada !== undefined) {
      updateData.visualizada = validatedData.visualizada;
      if (validatedData.dataVisualizacao) {
        updateData.dataVisualizacao = new Date(validatedData.dataVisualizacao);
      }
    }

    const notification = await prisma.notification.update({
      where: { id },
      data: updateData,
      include: {
        user: {
          select: { id: true, email: true, phone: true, role: true }
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
        user: true
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

    // Execute action based on relacionadoTipo
    if (notification.relacionadoTipo && notification.relacionadoId) {
      switch (notification.relacionadoTipo) {
        case 'ADOPTION':
        case 'ADOCAO':
          const adoption = await prisma.adoption.findUnique({
            where: { id: notification.relacionadoId }
          });
          if (adoption) {
            result.redirectUrl = `/admin/adoptions/${notification.relacionadoId}`;
            result.message = 'Redirecionando para adoção';
          }
          break;

        case 'TASK':
        case 'TAREFA':
          const task = await prisma.task.findUnique({
            where: { id: notification.relacionadoId }
          });
          if (task) {
            result.redirectUrl = `/tasks/${notification.relacionadoId}`;
            result.message = 'Redirecionando para tarefa';
          }
          break;

        case 'ANIMAL':
          const animal = await prisma.animal.findUnique({
            where: { id: notification.relacionadoId }
          });
          if (animal) {
            result.redirectUrl = `/animals/${notification.relacionadoId}`;
            result.message = 'Redirecionando para animal';
          }
          break;

        default:
          result.message = 'Ação executada';
      }
    } else {
      result.message = 'Notificação visualizada';
    }

    // Mark notification as read
    await prisma.notification.update({
      where: { id },
      data: {
        visualizada: true,
        dataVisualizacao: new Date()
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
        visualizada: false
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
        visualizada: false
      },
      data: {
        visualizada: true,
        dataVisualizacao: new Date()
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
