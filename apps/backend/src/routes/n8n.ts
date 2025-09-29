import { Router } from 'express';
import { authenticateN8N } from '../middleware/auth';
import {
  getAnimals,
  getAnimal,
  createAnimal,
  updateAnimal,
  deleteAnimal
} from '../controllers/animalController';

const router = Router();

// All n8n routes use API key authentication
router.use(authenticateN8N);

// ============================================
// ANIMAL ROUTES
// ============================================

// @route   GET /api/v1/n8n/animals
// @desc    Get all animals with pagination and filters
// @access  N8N Internal (API Key)
router.get('/animals', getAnimals);

// @route   GET /api/v1/n8n/animals/:id
// @desc    Get single animal by ID
// @access  N8N Internal (API Key)
router.get('/animals/:id', getAnimal);

// @route   POST /api/v1/n8n/animals
// @desc    Create new animal
// @access  N8N Internal (API Key)
router.post('/animals', createAnimal);

// @route   PUT /api/v1/n8n/animals/:id
// @desc    Update animal
// @access  N8N Internal (API Key)
router.put('/animals/:id', updateAnimal);

// @route   DELETE /api/v1/n8n/animals/:id
// @desc    Delete animal
// @access  N8N Internal (API Key)
router.delete('/animals/:id', deleteAnimal);

// ============================================
// HEALTH CHECK
// ============================================

// @route   GET /api/v1/n8n/health
// @desc    Health check for n8n integration
// @access  N8N Internal (API Key)
router.get('/health', (req, res) => {
  res.json({
    success: true,
    message: 'N8N integration is healthy',
    timestamp: new Date().toISOString(),
    authenticated: true,
    user: req.user?.email
  });
});

export default router;

