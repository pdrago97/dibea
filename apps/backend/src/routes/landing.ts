import { Router } from 'express';
import { prisma } from '../index';

const router = Router();

// GET /api/v1/landing/stats - Get landing page statistics
router.get('/stats', async (req, res) => {
  try {
    const [
      totalAnimals,
      adoptedAnimals,
      totalMunicipalities,
      totalUsers
    ] = await Promise.all([
      prisma.animal.count(),
      prisma.animal.count({ where: { status: 'ADOTADO' } }),
      prisma.municipality.count(),
      prisma.user.count()
    ]);

    res.json({
      success: true,
      totalAnimals,
      adoptedAnimals,
      totalMunicipalities,
      totalUsers
    });
  } catch (error) {
    console.error('Error fetching landing stats:', error);
    res.status(500).json({
      success: false,
      message: 'Erro ao buscar estatísticas',
      totalAnimals: 0,
      adoptedAnimals: 0,
      totalMunicipalities: 0,
      totalUsers: 0
    });
  }
});

// GET /api/v1/landing/animals - Get featured animals for landing page
router.get('/animals', async (req, res) => {
  try {
    const animals = await prisma.animal.findMany({
      where: {
        status: 'DISPONIVEL'
      },
      take: 6,
      include: {
        municipality: {
          select: {
            name: true
          }
        },
        photos: {
          where: {
            isPrimary: true
          },
          take: 1
        }
      },
      orderBy: {
        createdAt: 'desc'
      }
    });

    const formattedAnimals = animals.map(animal => ({
      id: animal.id,
      name: animal.name,
      species: animal.species,
      breed: animal.breed || 'Sem raça definida',
      age: animal.birthDate ? new Date().getFullYear() - animal.birthDate.getFullYear() + ' anos' : 'Idade desconhecida',
      description: animal.observations || 'Sem descrição',
      image: animal.photos?.[0]?.url || 'https://images.unsplash.com/photo-1552053831-71594a27632d?w=300&h=200&fit=crop',
      municipality: animal.municipality?.name || 'Município desconhecido',
      urgent: false,
      createdAt: animal.createdAt,
      updatedAt: animal.updatedAt
    }));

    res.json(formattedAnimals);
  } catch (error) {
    console.error('Error fetching landing animals:', error);
    res.status(500).json({
      success: false,
      message: 'Erro ao buscar animais',
      data: []
    });
  }
});

export default router;

