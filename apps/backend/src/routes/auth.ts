import { Router } from 'express';
import { login, register, getMe, refreshToken, logout } from '../controllers/authController';
import { authenticate, optionalAuth } from '../middleware/auth';
import { validate, loginSchema, registerSchema } from '../utils/validation';

const router = Router();

// @route   POST /api/v1/auth/login
// @desc    Login user
// @access  Public
router.post('/login', validate(loginSchema), login);

// @route   POST /api/v1/auth/register
// @desc    Register new user (CIDADAO public, others require auth)
// @access  Public/Private
router.post('/register', optionalAuth, validate(registerSchema), register);

// @route   GET /api/v1/auth/me
// @desc    Get current user
// @access  Private
router.get('/me', authenticate, getMe);

// @route   POST /api/v1/auth/refresh
// @desc    Refresh access token
// @access  Public
router.post('/refresh', refreshToken);

// @route   POST /api/v1/auth/logout
// @desc    Logout user
// @access  Private
router.post('/logout', authenticate, logout);

export default router;
