import { Request, Response } from "express";
import { z } from "zod";
import { logger } from "../utils/logger";
import { NotificationService } from "../services/notificationService";
import { prisma } from "../lib/prisma";

// Validation schemas
const createAdoptionSchema = z.object({
  animalId: z.string().min(1, "ID do animal é obrigatório"),
  notes: z.string().optional(),
});

const updateAdoptionStatusSchema = z.object({
  status: z.enum([
    "SOLICITADA",
    "EM_ANALISE",
    "APROVADA",
    "REJEITADA",
    "CONCLUIDA",
    "CANCELADA",
  ]),
  notes: z.string().optional(),
});

const adoptionFiltersSchema = z.object({
  page: z.number().min(1).default(1),
  limit: z.number().min(1).max(100).default(20),
  status: z.string().optional(),
  animalId: z.string().optional(),
  tutorId: z.string().optional(),
  dateFrom: z.string().optional(),
  dateTo: z.string().optional(),
});

// @route   GET /api/v1/adoptions
// @desc    Get adoptions with filters and pagination
// @access  Private (ADMIN, FUNCIONARIO, VETERINARIO)
export const getAdoptions = async (
  req: Request,
  res: Response,
): Promise<void> => {
  try {
    const filters = adoptionFiltersSchema.parse({
      page: parseInt(req.query.page as string) || 1,
      limit: parseInt(req.query.limit as string) || 20,
      ...req.query,
    });

    const { page, limit, status, animalId, tutorId, dateFrom, dateTo } =
      filters;
    const skip = (page - 1) * limit;

    // Build Prisma where clause
    const where: any = {};
    if (status) where.status = status;
    if (animalId) where.animalId = animalId;
    if (tutorId) where.tutorId = tutorId;

    if (dateFrom || dateTo) {
      where.createdAt = {};
      if (dateFrom) where.createdAt.gte = new Date(dateFrom);
      if (dateTo) where.createdAt.lte = new Date(dateTo);
    }

    // Fetch adoptions with Prisma
    const [adoptions, total] = await Promise.all([
      prisma.adoption.findMany({
        where,
        include: {
          animal: {
            select: { id: true, name: true, species: true, breed: true, sex: true, status: true }
          },
          tutor: {
            select: { id: true, name: true, email: true, phone: true }
          }
        },
        skip,
        take: limit,
        orderBy: { createdAt: 'desc' }
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
        hasPrev: page > 1,
      },
    });
    return;
  } catch (error) {
    logger.error("Error fetching adoptions:", error);
    if (error instanceof z.ZodError) {
      res.status(400).json({
        success: false,
        message: "Dados inválidos",
        errors: error.errors,
      });
    } else {
      res.status(500).json({
        success: false,
        message: "Erro interno do servidor",
      });
    }
  }
};

// @route   GET /api/v1/adoptions/my
// @desc    Get user's adoptions
// @access  Private (All authenticated users)
export const getUserAdoptions = async (
  req: Request,
  res: Response,
): Promise<void> => {
  try {
    const userId = req.user?.userId;

    if (!userId) {
      res.status(401).json({
        success: false,
        message: "Não autenticado",
      });
      return;
    }

    const adoptions = await prisma.adoption.findMany({
      where: { tutorId: userId },
      include: {
        animal: {
          select: { id: true, name: true, species: true, breed: true, sex: true, status: true }
        }
      },
      orderBy: { createdAt: 'desc' }
    });

    res.json({
      success: true,
      data: adoptions,
    });
  } catch (error) {
    logger.error("Error fetching user adoptions:", error);
    res.status(500).json({
      success: false,
      message: "Erro ao buscar adoções do usuário",
      error: error instanceof Error ? error.message : 'Unknown error'
    });
  }
};

// @route   GET /api/v1/adoptions/:id
// @desc    Get single adoption by ID
// @access  Private (All authenticated users - with permission checks)
export const getAdoption = async (
  req: Request,
  res: Response,
): Promise<void> => {
  try {
    const { id } = req.params;
    const userId = req.user?.userId;
    const userRole = req.user?.role;

    const adoption = await prisma.adoption.findUnique({
      where: { id },
      include: {
        animal: {
          select: {
            id: true, name: true, species: true, breed: true, sex: true,
            status: true, temperament: true, color: true, weight: true
          }
        },
        tutor: {
          select: { id: true, name: true, email: true }
        }
      }
    });

    if (!adoption) {
      res.status(404).json({
        success: false,
        message: "Adoção não encontrada",
      });
      return;
    }

    // Check permissions
    if (
      userRole !== "ADMIN" &&
      userRole !== "FUNCIONARIO" &&
      adoption.tutorId !== userId
    ) {
      res.status(403).json({
        success: false,
        message: "Acesso negado",
      });
      return;
    }

    res.json({
      success: true,
      data: adoption,
    });
  } catch (error) {
    logger.error("Error fetching adoption:", error);
    res.status(500).json({
      success: false,
      message: "Erro interno do servidor",
    });
  }
};

// @route   POST /api/v1/adoptions
// @desc    Create new adoption request
// @access  Private (All authenticated users)
export const createAdoption = async (
  req: Request,
  res: Response,
): Promise<void> => {
  try {
    const validatedData = createAdoptionSchema.parse(req.body);
    const tutorId = req.user?.userId;

    if (!tutorId) {
      res.status(401).json({
        success: false,
        message: "Não autenticado",
      });
      return;
    }

    // Check if animal exists and is available
    const animal = await prisma.animal.findUnique({
      where: { id: validatedData.animalId }
    });

    if (!animal) {
      res.status(404).json({
        success: false,
        message: "Animal não encontrado",
      });
      return;
    }

    if (animal.status !== "DISPONIVEL") {
      res.status(400).json({
        success: false,
        message: "Animal não está disponível para adoção",
      });
      return;
    }

    // Check if user already has a pending adoption for this animal
    const existingAdoption = await prisma.adoption.findFirst({
      where: {
        animalId: validatedData.animalId,
        tutorId,
        status: "SOLICITADA"
      }
    });

    if (existingAdoption) {
      res.status(400).json({
        success: false,
        message: "Você já possui uma solicitação pendente para este animal",
      });
      return;
    }

    // Create adoption request
    const adoption = await prisma.adoption.create({
      data: {
        animalId: validatedData.animalId,
        tutorId,
        interestReason: validatedData.notes,
        status: "SOLICITADA",
      },
      include: {
        animal: {
          select: { id: true, name: true, species: true, breed: true }
        },
        tutor: {
          select: { id: true, name: true, email: true }
        }
      }
    });

    // Update animal status (optional - depends on business logic)
    // await prisma.animal.update({
    //   where: { id: validatedData.animalId },
    //   data: { status: "EM_PROCESSO_ADOCAO" }
    // });

    res.status(201).json({
      success: true,
      data: adoption,
      message: "Solicitação de adoção criada com sucesso",
    });
    return;
  } catch (error) {
    logger.error("Error creating adoption:", error);
    if (error instanceof z.ZodError) {
      res.status(400).json({
        success: false,
        message: "Dados inválidos",
        errors: error.errors,
      });
    } else {
      res.status(500).json({
        success: false,
        message: "Erro ao criar solicitação de adoção",
        error: error instanceof Error ? error.message : 'Unknown error'
      });
    }
  }
};

// @route   PATCH /api/v1/adoptions/:id/status
// @desc    Update adoption status
// @access  Private (ADMIN, FUNCIONARIO, VETERINARIO)
export const updateAdoptionStatus = async (
  req: Request,
  res: Response,
): Promise<void> => {
  try {
    const { id } = req.params;
    const validatedData = updateAdoptionStatusSchema.parse(req.body);

    const adoption = await prisma.adoption.findUnique({
      where: { id },
      include: {
        animal: true,
        tutor: true
      }
    });

    if (!adoption) {
      res.status(404).json({
        success: false,
        message: "Adoção não encontrada",
      });
      return;
    }

    // Update adoption status
    const updatedAdoption = await prisma.adoption.update({
      where: { id },
      data: {
        status: validatedData.status,
        interviewNotes: validatedData.notes,
        approvalDate: validatedData.status === "APROVADA" ? new Date() : undefined,
        rejectionReason: validatedData.status === "REJEITADA" ? validatedData.notes : undefined,
      },
      include: {
        animal: {
          select: { id: true, name: true, species: true, breed: true }
        },
        tutor: {
          select: { id: true, name: true, email: true }
        }
      }
    });

    // Update animal status based on adoption status
    if (validatedData.status === "APROVADA") {
      await prisma.animal.update({
        where: { id: adoption.animalId },
        data: { status: "ADOTADO" }
      });
    } else if (validatedData.status === "REJEITADA" || validatedData.status === "CANCELADA") {
      await prisma.animal.update({
        where: { id: adoption.animalId },
        data: { status: "DISPONIVEL" }
      });
    }

    // Send notification (if notification service is available)
    // TODO: Implement notification service method
    // try {
    //   const notificationService = new NotificationService();
    //   await notificationService.sendAdoptionStatusUpdate(
    //     adoption.tutorId,
    //     updatedAdoption.id,
    //     validatedData.status
    //   );
    // } catch (notifError) {
    //   logger.warn("Failed to send notification:", notifError);
    // }

    res.json({
      success: true,
      data: updatedAdoption,
      message: "Status da adoção atualizado com sucesso",
    });
    return;
  } catch (error) {
    logger.error("Error updating adoption status:", error);
    if (error instanceof z.ZodError) {
      res.status(400).json({
        success: false,
        message: "Dados inválidos",
        errors: error.errors,
      });
    } else {
      res.status(500).json({
        success: false,
        message: "Erro ao atualizar status da adoção",
        error: error instanceof Error ? error.message : 'Unknown error'
      });
    }
  }
};
