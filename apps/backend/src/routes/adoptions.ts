import { Router } from 'express';
import { authenticate, authorize } from '../middleware/auth';
import {
  getAdoptions,
  getAdoption,
  createAdoption,
  updateAdoptionStatus,
  getUserAdoptions
} from '../controllers/adoptionController';

const router = Router();

// All routes require authentication
router.use(authenticate);

// @route   GET /api/v1/adoptions
// @desc    Get adoptions with filters and pagination
// @access  Private (ADMIN, FUNCIONARIO, VETERINARIO)
router.get('/', authorize('ADMIN', 'FUNCIONARIO', 'VETERINARIO'), getAdoptions);

// @route   GET /api/v1/adoptions/my
// @desc    Get user's adoptions
// @access  Private (All authenticated users)
router.get('/my', getUserAdoptions);

// @route   GET /api/v1/adoptions/:id
// @desc    Get single adoption by ID
// @access  Private (All authenticated users - with permission checks)
router.get('/:id', getAdoption);

// @route   POST /api/v1/adoptions
// @desc    Create new adoption request
// @access  Private (All authenticated users)
router.post('/', createAdoption);

// @route   PUT /api/v1/adoptions/:id/status
// @desc    Update adoption status
// @access  Private (ADMIN, FUNCIONARIO, VETERINARIO)
router.put('/:id/status', authorize('ADMIN', 'FUNCIONARIO', 'VETERINARIO'), updateAdoptionStatus);

export default router;
