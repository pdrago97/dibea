import { Router } from 'express';
import { authenticate, authorize } from '../middleware/auth';
import {
  getTasks,
  getTask,
  createTask,
  updateTask,
  deleteTask
} from '../controllers/taskController';

const router = Router();

// All routes require authentication
router.use(authenticate);

// @route   GET /api/v1/tasks
// @desc    Get tasks with filters and pagination
// @access  Private (All authenticated users)
router.get('/', getTasks);

// @route   GET /api/v1/tasks/:id
// @desc    Get single task by ID
// @access  Private (All authenticated users)
router.get('/:id', getTask);

// @route   POST /api/v1/tasks
// @desc    Create new task
// @access  Private (ADMIN, FUNCIONARIO, VETERINARIO)
router.post('/', authorize('ADMIN', 'FUNCIONARIO', 'VETERINARIO'), createTask);

// @route   PUT /api/v1/tasks/:id
// @desc    Update task
// @access  Private (All authenticated users - with permission checks)
router.put('/:id', updateTask);

// @route   DELETE /api/v1/tasks/:id
// @desc    Delete task
// @access  Private (ADMIN, Creator only)
router.delete('/:id', deleteTask);

export default router;
