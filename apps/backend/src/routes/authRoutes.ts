import express from 'express';
import { 
  register, 
  login, 
  getProfile, 
  updateProfile,
  refreshToken,
  logout,
  forgotPassword,
  resetPassword
} from '../controllers/authController';
import { protect } from '../middleware/auth';
import { validateAgentAccess } from '../middleware/agentGuardrails';

const router = express.Router();

// Public routes
router.post('/register', register);
router.post('/login', login);
router.post('/forgot-password', forgotPassword);
router.post('/reset-password', resetPassword);
router.post('/refresh-token', refreshToken);

// Protected routes
router.use(protect); // All routes below require authentication

router.get('/profile', getProfile);
router.put('/profile', updateProfile);
router.post('/logout', logout);

// Validate user access for agent interactions
router.get('/validate-agent-access/:agentType', (req, res) => {
  res.json({
    success: true,
    message: 'Acesso autorizado',
    permissions: (req as any).userPermissions || {}
  });
});

export default router;
