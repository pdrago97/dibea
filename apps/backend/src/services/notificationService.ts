import { PrismaClient } from '@prisma/client';
import { logger } from '../utils/logger';

const prisma = new PrismaClient();

export class NotificationService {
  
  // Create adoption-related notification
  static async createAdoptionNotification(
    adoptionId: string,
    type: 'NEW_REQUEST' | 'APPROVED' | 'REJECTED' | 'PENDING_REVIEW',
    targetUserId?: string
  ) {
    try {
      const adoption = await prisma.adoption.findUnique({
        where: { id: adoptionId },
        include: {
          animal: true,
          tutor: true
        }
      });

      if (!adoption) {
        throw new Error('Adoption not found');
      }

      let title: string;
      let message: string;
      let actionType: string | undefined;
      let actionUrl: string | undefined;
      let priority: 'LOW' | 'MEDIUM' | 'HIGH' | 'URGENT' = 'MEDIUM';

      switch (type) {
        case 'NEW_REQUEST':
          title = `Nova solicitação de adoção - ${adoption.animal.name}`;
          message = `${adoption.tutor.name} solicitou a adoção de ${adoption.animal.name}`;
          actionType = 'VIEW';
          actionUrl = `/admin/adoptions/${adoptionId}`;
          priority = 'HIGH';
          break;

        case 'APPROVED':
          title = `Adoção aprovada - ${adoption.animal.name}`;
          message = `Parabéns! Sua solicitação de adoção de ${adoption.animal.name} foi aprovada!`;
          actionType = 'VIEW';
          actionUrl = `/citizen/adoptions/${adoptionId}`;
          priority = 'HIGH';
          targetUserId = adoption.tutorId;
          break;

        case 'REJECTED':
          title = `Adoção não aprovada - ${adoption.animal.name}`;
          message = `Sua solicitação de adoção de ${adoption.animal.name} não foi aprovada. Entre em contato para mais informações.`;
          actionType = 'VIEW';
          actionUrl = `/citizen/adoptions/${adoptionId}`;
          priority = 'HIGH';
          targetUserId = adoption.tutorId;
          break;

        case 'PENDING_REVIEW':
          title = `Adoção pendente de revisão - ${adoption.animal.name}`;
          message = `A adoção de ${adoption.animal.name} por ${adoption.tutor.name} precisa de revisão`;
          actionType = 'APPROVE';
          actionUrl = `/admin/adoptions/${adoptionId}`;
          priority = 'MEDIUM';
          break;
      }

      const notification = await prisma.notification.create({
        data: {
          title,
          message,
          type: 'ADOPTION',
          category: 'ADOCAO',
          priority,
          userId: targetUserId,
          animalId: adoption.animalId,
          adoptionId: adoptionId,
          actionType,
          actionUrl
        }
      });

      logger.info(`Adoption notification created: ${notification.id}`);
      return notification;

    } catch (error) {
      logger.error('Error creating adoption notification:', error);
      throw error;
    }
  }

  // Create task-related notification
  static async createTaskNotification(
    taskId: string,
    type: 'ASSIGNED' | 'COMPLETED' | 'OVERDUE' | 'UPDATED',
    targetUserId: string
  ) {
    try {
      const task = await prisma.task.findUnique({
        where: { id: taskId },
        include: {
          createdBy: true,
          assignedTo: true,
          animal: true
        }
      });

      if (!task) {
        throw new Error('Task not found');
      }

      let title: string;
      let message: string;
      let actionType: string | undefined;
      let actionUrl: string | undefined;
      let priority: 'LOW' | 'MEDIUM' | 'HIGH' | 'URGENT' = 'MEDIUM';

      switch (type) {
        case 'ASSIGNED':
          title = `Nova tarefa atribuída: ${task.title}`;
          message = `Você foi designado para a tarefa: ${task.description}`;
          actionType = 'VIEW';
          actionUrl = `/tasks/${taskId}`;
          priority = task.priority as any;
          break;

        case 'COMPLETED':
          title = `Tarefa concluída: ${task.title}`;
          message = `A tarefa "${task.title}" foi marcada como concluída`;
          actionType = 'VIEW';
          actionUrl = `/tasks/${taskId}`;
          priority = 'LOW';
          break;

        case 'OVERDUE':
          title = `Tarefa em atraso: ${task.title}`;
          message = `A tarefa "${task.title}" está em atraso e precisa de atenção`;
          actionType = 'VIEW';
          actionUrl = `/tasks/${taskId}`;
          priority = 'URGENT';
          break;

        case 'UPDATED':
          title = `Tarefa atualizada: ${task.title}`;
          message = `A tarefa "${task.title}" foi atualizada`;
          actionType = 'VIEW';
          actionUrl = `/tasks/${taskId}`;
          priority = 'MEDIUM';
          break;
      }

      const notification = await prisma.notification.create({
        data: {
          title,
          message,
          type: 'TASK',
          category: 'SISTEMA',
          priority,
          userId: targetUserId,
          taskId: taskId,
          animalId: task.animalId,
          actionType,
          actionUrl
        }
      });

      logger.info(`Task notification created: ${notification.id}`);
      return notification;

    } catch (error) {
      logger.error('Error creating task notification:', error);
      throw error;
    }
  }

  // Create system notification
  static async createSystemNotification(
    title: string,
    message: string,
    targetUserId?: string,
    priority: 'LOW' | 'MEDIUM' | 'HIGH' | 'URGENT' = 'MEDIUM',
    actionUrl?: string
  ) {
    try {
      const notification = await prisma.notification.create({
        data: {
          title,
          message,
          type: 'SYSTEM',
          category: 'SISTEMA',
          priority,
          userId: targetUserId,
          actionType: actionUrl ? 'REDIRECT' : undefined,
          actionUrl
        }
      });

      logger.info(`System notification created: ${notification.id}`);
      return notification;

    } catch (error) {
      logger.error('Error creating system notification:', error);
      throw error;
    }
  }

  // Create animal-related notification
  static async createAnimalNotification(
    animalId: string,
    type: 'NEW_ANIMAL' | 'STATUS_CHANGE' | 'MEDICAL_UPDATE',
    targetUserId?: string,
    customMessage?: string
  ) {
    try {
      const animal = await prisma.animal.findUnique({
        where: { id: animalId }
      });

      if (!animal) {
        throw new Error('Animal not found');
      }

      let title: string;
      let message: string;
      let actionType: string | undefined;
      let actionUrl: string | undefined;
      let priority: 'LOW' | 'MEDIUM' | 'HIGH' | 'URGENT' = 'MEDIUM';

      switch (type) {
        case 'NEW_ANIMAL':
          title = `Novo animal cadastrado: ${animal.name}`;
          message = customMessage || `${animal.name} (${animal.species}) foi cadastrado no sistema`;
          actionType = 'VIEW';
          actionUrl = `/animals/${animalId}`;
          priority = 'MEDIUM';
          break;

        case 'STATUS_CHANGE':
          title = `Status alterado: ${animal.name}`;
          message = customMessage || `O status de ${animal.name} foi alterado para ${animal.status}`;
          actionType = 'VIEW';
          actionUrl = `/animals/${animalId}`;
          priority = 'MEDIUM';
          break;

        case 'MEDICAL_UPDATE':
          title = `Atualização médica: ${animal.name}`;
          message = customMessage || `${animal.name} teve uma atualização médica`;
          actionType = 'VIEW';
          actionUrl = `/animals/${animalId}`;
          priority = 'HIGH';
          break;
      }

      const notification = await prisma.notification.create({
        data: {
          title,
          message,
          type: 'INFO',
          category: 'VETERINARIO',
          priority,
          userId: targetUserId,
          animalId: animalId,
          actionType,
          actionUrl
        }
      });

      logger.info(`Animal notification created: ${notification.id}`);
      return notification;

    } catch (error) {
      logger.error('Error creating animal notification:', error);
      throw error;
    }
  }

  // Get notifications for user with smart filtering
  static async getNotificationsForUser(
    userId: string,
    options: {
      limit?: number;
      unreadOnly?: boolean;
      category?: string;
      priority?: string;
    } = {}
  ) {
    try {
      const { limit = 10, unreadOnly = false, category, priority } = options;

      const where: any = { userId };
      
      if (unreadOnly) {
        where.status = 'UNREAD';
      }
      
      if (category) {
        where.category = category;
      }
      
      if (priority) {
        where.priority = priority;
      }

      const notifications = await prisma.notification.findMany({
        where,
        take: limit,
        orderBy: [
          { priority: 'desc' },
          { createdAt: 'desc' }
        ],
        include: {
          animal: {
            select: { id: true, name: true, species: true }
          },
          task: {
            select: { id: true, title: true, status: true }
          },
          adoption: {
            select: { id: true, status: true }
          }
        }
      });

      return notifications;

    } catch (error) {
      logger.error('Error getting notifications for user:', error);
      throw error;
    }
  }
}
