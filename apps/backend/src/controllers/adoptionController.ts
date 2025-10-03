import { Request, Response } from "express";
import { z } from "zod";
import { logger } from "../utils/logger";
import { NotificationService } from "../services/notificationService";
import supabaseService from "../services/supabaseService";

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

    // Build Supabase query
    let query = supabaseService
      .getClient()
      .from("adocoes")
      .select(
        `
      *,
      animal:animais(id, nome, especie, raca, sexo, status),
      tutor:tutores(id, nome, email, telefone)
    `,
        { count: "exact" },
      );

    // Apply filters
    if (status) query = query.eq("status", status);
    if (animalId) query = query.eq("animal_id", animalId);
    if (tutorId) query = query.eq("tutor_id", tutorId);

    if (dateFrom) query = query.gte("created_at", dateFrom);
    if (dateTo) query = query.lte("created_at", dateTo);

    // Apply pagination and ordering
    query = query
      .range(skip, skip + limit - 1)
      .order("created_at", { ascending: false });

    const { data: adoptions, error, count: total } = await query;

    if (error) throw error;

    const totalPages = Math.ceil((total || 0) / limit);

    res.json({
      success: true,
      data: adoptions,
      pagination: {
        page,
        limit,
        total: total || 0,
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
    const userId = (req as any).user?.id;

    const { data: adoptions, error } = await supabaseService
      .getClient()
      .from("adocoes")
      .select(
        `
        *,
        animal:animais(id, nome, especie, raca, sexo, status),
        notificacoes(*)
      `,
      )
      .eq("tutor_id", userId)
      .order("created_at", { ascending: false });

    if (error) throw error;

    res.json({
      success: true,
      data: adoptions,
    });
  } catch (error) {
    logger.error("Error fetching user adoptions:", error);
    res.status(500).json({
      success: false,
      message: "Erro interno do servidor",
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
    const userId = (req as any).user?.id;
    const userRole = (req as any).user?.role;

    const { data: adoption, error } = await supabaseService
      .getClient()
      .from("adocoes")
      .select(
        `
        *,
        animal:animais(id, nome, especie, raca, sexo, status, temperamento, cor, peso),
        tutor:tutores(id, nome, email),
        notificacoes(*)
      `,
      )
      .eq("id", id)
      .single();

    if (error) {
      if (error.code === "PGRST116") {
        return res.status(404).json({
          success: false,
          message: "Adoção não encontrada",
        });
      }
      throw error;
    }

    if (!adoption) {
      return res.status(404).json({
        success: false,
        message: "Adoção não encontrada",
      });
    }

    // Check permissions
    if (
      userRole !== "ADMIN" &&
      userRole !== "FUNCIONARIO" &&
      adoption.tutor_id !== userId
    ) {
      return res.status(403).json({
        success: false,
        message: "Acesso negado",
      });
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
    const tutorId = (req as any).user?.id;

    // Check if animal exists and is available
    const { data: animal, error: animalError } = await supabaseService
      .getClient()
      .from("animais")
      .select("*")
      .eq("id", validatedData.animalId)
      .single();

    if (animalError || !animal) {
      return res.status(404).json({
        success: false,
        message: "Animal não encontrado",
      });
    }

    if (animal.status !== "DISPONIVEL") {
      return res.status(400).json({
        success: false,
        message: "Animal não está disponível para adoção",
      });
    }

    // Check if user already has a pending adoption for this animal
    const { data: existingAdoption } = await supabaseService
      .getClient()
      .from("adocoes")
      .select("*")
      .eq("animal_id", validatedData.animalId)
      .eq("tutor_id", tutorId)
      .eq("status", "SOLICITADA")
      .single();

    if (existingAdoption) {
      return res.status(400).json({
        success: false,
        message: "Você já possui uma solicitação pendente para este animal",
      });
    }

    // Create adoption request
    const { data: adoption, error: insertError } = await supabaseService
      .getClient()
      .from("adocoes")
      .insert({
        animal_id: validatedData.animalId,
        tutor_id: tutorId,
        motivo_interesse: validatedData.notes,
        status: "SOLICITADA",
      })
      .select(
        `
        *,
        animal:animais(id, nome, especie, raca),
        tutor:tutores(id, nome, email)
      `,
      )
      .single();

    if (insertError) throw insertError;

    // Create notification for admins/staff
    await NotificationService.createAdoptionNotification(
      adoption.id,
      "NEW_REQUEST",
    );

    // Create task for adoption review
    await supabaseService
      .getClient()
      .from("tasks")
      .insert({
        title: `Revisar adoção - ${animal.nome}`,
        description: `Revisar solicitação de adoção de ${animal.nome} por ${adoption.tutor.nome}`,
        type: "ADOPTION_REVIEW",
        priority: "HIGH",
        created_by_id: tutorId,
        animal_id: validatedData.animalId,
        adoption_id: adoption.id,
        metadata: JSON.stringify({
          animalName: animal.nome,
          tutorName: adoption.tutor.nome,
          tutorEmail: adoption.tutor.email,
        }),
      });

    logger.info(
      `Adoption request created: ${adoption.id} for animal: ${validatedData.animalId}`,
    );

    res.status(201).json({
      success: true,
      data: adoption,
      message: "Solicitação de adoção criada com sucesso",
    });
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
        message: "Erro interno do servidor",
      });
    }
  }
};

// @route   PUT /api/v1/adoptions/:id/status
// @desc    Update adoption status
// @access  Private (ADMIN, FUNCIONARIO, VETERINARIO)
export const updateAdoptionStatus = async (
  req: Request,
  res: Response,
): Promise<void> => {
  try {
    const { id } = req.params;
    const validatedData = updateAdoptionStatusSchema.parse(req.body);
    const userId = (req as any).user?.id;

    // Check if adoption exists
    const { data: existingAdoption, error: fetchError } = await supabaseService
      .getClient()
      .from("adocoes")
      .select(
        `
        *,
        animal:animais(*),
        tutor:tutores(*)
      `,
      )
      .eq("id", id)
      .single();

    if (fetchError || !existingAdoption) {
      return res.status(404).json({
        success: false,
        message: "Adoção não encontrada",
      });
    }

    // Update adoption status
    const updateData: any = {
      status: validatedData.status,
      updated_at: new Date().toISOString(),
    };

    if (validatedData.status === "REJEITADA" && validatedData.notes) {
      updateData.motivo_rejeicao = validatedData.notes;
    } else if (validatedData.notes) {
      updateData.observacoes_entrevista = validatedData.notes;
    }

    const { data: adoption, error: updateError } = await supabaseService
      .getClient()
      .from("adocoes")
      .update(updateData)
      .eq("id", id)
      .select(
        `
        *,
        animal:animais(id, nome, especie, raca),
        tutor:tutores(id, nome, email)
      `,
      )
      .single();

    if (updateError) throw updateError;

    // Update animal status if adoption is approved
    if (validatedData.status === "APROVADA") {
      await supabaseService
        .getClient()
        .from("animais")
        .update({
          status: "ADOTADO",
        })
        .eq("id", existingAdoption.animal_id);

      // Create approval notification for tutor
      await NotificationService.createAdoptionNotification(
        adoption.id,
        "APPROVED",
        adoption.tutor_id,
      );

      // Create task for post-adoption follow-up
      await supabaseService
        .getClient()
        .from("tasks")
        .insert({
          title: `Acompanhamento pós-adoção - ${adoption.animal.nome}`,
          description: `Acompanhar a adaptação de ${adoption.animal.nome} com ${adoption.tutor.nome}`,
          type: "ADOPTION_REVIEW",
          priority: "MEDIUM",
          created_by_id: userId,
          animal_id: adoption.animal_id,
          adoption_id: adoption.id,
          due_date: new Date(
            Date.now() + 30 * 24 * 60 * 60 * 1000,
          ).toISOString(),
          metadata: JSON.stringify({
            type: "follow_up",
            animalName: adoption.animal.nome,
            tutorName: adoption.tutor.nome,
            adoptionDate: new Date().toISOString(),
          }),
        });
    } else if (validatedData.status === "REJEITADA") {
      // Create rejection notification for tutor
      await NotificationService.createAdoptionNotification(
        adoption.id,
        "REJECTED",
        adoption.tutor_id,
      );
    }

    // Complete related tasks
    await supabaseService
      .getClient()
      .from("tasks")
      .update({
        status: "COMPLETED",
        completed_at: new Date().toISOString(),
      })
      .eq("adoption_id", adoption.id)
      .eq("status", "PENDING");

    logger.info(
      `Adoption status updated: ${adoption.id} to ${validatedData.status}`,
    );

    res.json({
      success: true,
      data: adoption,
      message: `Status da adoção atualizado para ${validatedData.status}`,
    });
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
        message: "Erro interno do servidor",
      });
    }
  }
};
