import { Request, Response } from "express";
import { z } from "zod";
import { prisma } from "../lib/prisma";

// Validation schemas
const createAnimalSchema = z.object({
  name: z.string().min(1, "Nome é obrigatório"),
  species: z.enum(["CANINO", "FELINO", "OUTROS"]),
  breed: z.string().optional(),
  sex: z.enum(["MACHO", "FEMEA"]),
  size: z.enum(["PEQUENO", "MEDIO", "GRANDE"]),
  birthDate: z.string().optional(),
  weight: z.number().min(0).optional(),
  color: z.string().optional(),
  temperament: z.string().optional(),
  observations: z.string().optional(),
  status: z
    .enum(["DISPONIVEL", "ADOTADO", "EM_TRATAMENTO", "OBITO", "PERDIDO"])
    .default("DISPONIVEL"),
  qrCode: z.string().optional(),
  municipalityId: z.string(),
  microchipId: z.string().optional(),
});

const updateAnimalSchema = createAnimalSchema.partial();

// @desc    Get all animals
// @route   GET /api/v1/animals
// @access  Private
export const getAnimals = async (req: Request, res: Response): Promise<any> => {
  try {
    const {
      page = 1,
      limit = 10,
      species,
      status,
      municipalityId,
      search,
    } = req.query;

    const skip = (Number(page) - 1) * Number(limit);

    // Build where clause
    const where: any = {};

    // Apply filters
    if (species) where.species = species;
    if (status) where.status = status;
    if (municipalityId) where.municipalityId = municipalityId;
    if (search) {
      where.OR = [
        { name: { contains: search as string, mode: 'insensitive' } },
        { breed: { contains: search as string, mode: 'insensitive' } },
        { observations: { contains: search as string, mode: 'insensitive' } }
      ];
    }

    // Execute query with Prisma
    const [animals, total] = await Promise.all([
      prisma.animal.findMany({
        where,
        include: {
          municipality: {
            select: { id: true, name: true }
          },
          microchip: {
            select: { id: true, number: true, status: true }
          }
        },
        skip,
        take: Number(limit),
        orderBy: { createdAt: 'desc' }
      }),
      prisma.animal.count({ where })
    ]);

    // No need for mapping - Prisma returns English field names
    res.status(200).json({
      success: true,
      data: animals,
      pagination: {
        page: Number(page),
        limit: Number(limit),
        total,
        pages: Math.ceil(total / Number(limit))
      }
    });
  } catch (error) {
    console.error('Error in getAnimals:', error);
    res.status(500).json({
      success: false,
      message: 'Erro ao buscar animais',
      error: error instanceof Error ? error.message : 'Unknown error'
    });
  }
};

// @desc    Get single animal
// @route   GET /api/v1/animals/:id
// @access  Private
export const getAnimal = async (req: Request, res: Response): Promise<any> => {
  try {
    const { id } = req.params;

    const animal = await prisma.animal.findUnique({
      where: { id },
      include: {
        municipality: {
          select: { id: true, name: true }
        },
        microchip: {
          select: { id: true, number: true, status: true }
        },
        adoptions: {
          include: {
            tutor: {
              select: { id: true, name: true, email: true, phone: true }
            }
          }
        },
        photos: {
          orderBy: { order: 'asc' }
        }
      }
    });

    if (!animal) {
      return res.status(404).json({
        success: false,
        message: "Animal não encontrado",
      });
    }

    res.status(200).json({
      success: true,
      data: animal,
    });
  } catch (error) {
    console.error(error);
    res.status(500).json({
      success: false,
      message: "Erro interno do servidor",
    });
  }
};

// @desc    Create new animal
// @route   POST /api/v1/animals
// @access  Private
export const createAnimal = async (
  req: Request,
  res: Response,
): Promise<any> => {
  try {
    const validatedData = createAnimalSchema.parse(req.body);

    // Convert birthDate string to Date if provided
    const animalData: any = { ...validatedData };
    if (animalData.birthDate) {
      animalData.birthDate = new Date(animalData.birthDate);
    }

    // Validate municipality exists
    const municipality = await prisma.municipality.findUnique({
      where: { id: animalData.municipalityId }
    });

    if (!municipality) {
      return res.status(400).json({
        success: false,
        message: "Município não encontrado"
      });
    }

    const animal = await prisma.animal.create({
      data: animalData,
      include: {
        municipality: {
          select: { id: true, name: true }
        },
        microchip: {
          select: { id: true, number: true, status: true }
        }
      }
    });

    res.status(201).json({
      success: true,
      data: animal,
      message: "Animal cadastrado com sucesso",
    });
  } catch (error) {
    if (error instanceof z.ZodError) {
      return res.status(400).json({
        success: false,
        message: "Dados inválidos",
        errors: error.errors,
      });
    }

    console.error(error);
    res.status(500).json({
      success: false,
      message: "Erro interno do servidor",
    });
  }
};

// @desc    Update animal
// @route   PUT /api/v1/animals/:id
// @access  Private
export const updateAnimal = async (
  req: Request,
  res: Response,
): Promise<any> => {
  try {
    const { id } = req.params;
    const validatedData = updateAnimalSchema.parse(req.body);

    // Check if animal exists
    const existingAnimal = await prisma.animal.findUnique({
      where: { id }
    });

    if (!existingAnimal) {
      return res.status(404).json({
        success: false,
        message: "Animal não encontrado",
      });
    }

    // Convert birthDate string to Date if provided
    const animalData: any = { ...validatedData };
    if (animalData.birthDate) {
      animalData.birthDate = new Date(animalData.birthDate);
    }

    const animal = await prisma.animal.update({
      where: { id },
      data: animalData,
      include: {
        municipality: {
          select: { id: true, name: true }
        },
        microchip: {
          select: { id: true, number: true, status: true }
        }
    });

    res.status(200).json({
      success: true,
      data: animal,
      message: "Animal atualizado com sucesso",
    });
  } catch (error) {
    if (error instanceof z.ZodError) {
      return res.status(400).json({
        success: false,
        message: "Dados inválidos",
        errors: error.errors,
      });
    }

    console.error('Error in updateAnimal:', error);
    res.status(500).json({
      success: false,
      message: "Erro ao atualizar animal",
      error: error instanceof Error ? error.message : 'Unknown error'
    });
  }
};

// @desc    Delete animal
// @route   DELETE /api/v1/animals/:id
// @access  Private
export const deleteAnimal = async (
  req: Request,
  res: Response,
): Promise<any> => {
  try {
    const { id } = req.params;

    // Check if animal exists
    const existingAnimal = await prisma.animal.findUnique({
      where: { id }
    });

    if (!existingAnimal) {
      return res.status(404).json({
        success: false,
        message: "Animal não encontrado",
      });
    }

    await prisma.animal.delete({
      where: { id }
    });

    res.status(200).json({
      success: true,
      message: "Animal removido com sucesso",
    });
  } catch (error) {
    console.error('Error in deleteAnimal:', error);
    res.status(500).json({
      success: false,
      message: "Erro ao remover animal",
      error: error instanceof Error ? error.message : 'Unknown error'
    });
  }
};
