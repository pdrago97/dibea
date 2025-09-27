import { Router } from 'express';
import { authenticate, authorize } from '../middleware/auth';
import {
  getAnimals,
  getAnimal,
  createAnimal,
  updateAnimal,
  deleteAnimal
} from '../controllers/animalController';

const router = Router();

// All routes require authentication
router.use(authenticate);

// @route   GET /api/v1/animals
// @desc    Get all animals with pagination and filters
// @access  Private (All authenticated users)
router.get('/', getAnimals);

// @route   GET /api/v1/animals/:id
// @desc    Get single animal by ID
// @access  Private (All authenticated users)
router.get('/:id', getAnimal);

// @route   POST /api/v1/animals
// @desc    Create new animal
// @access  Private (ADMIN, FUNCIONARIO, VETERINARIO)
router.post('/', authorize('ADMIN', 'FUNCIONARIO', 'VETERINARIO'), createAnimal);

// @route   PUT /api/v1/animals/:id
// @desc    Update animal
// @access  Private (ADMIN, FUNCIONARIO, VETERINARIO)
router.put('/:id', authorize('ADMIN', 'FUNCIONARIO', 'VETERINARIO'), updateAnimal);

// @route   DELETE /api/v1/animals/:id
// @desc    Delete animal
// @access  Private (ADMIN, FUNCIONARIO)
router.delete('/:id', authorize('ADMIN', 'FUNCIONARIO'), deleteAnimal);

export default router;
