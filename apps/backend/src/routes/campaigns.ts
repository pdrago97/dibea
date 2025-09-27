import { Router } from 'express';

const router = Router();

// Placeholder routes - will be implemented in future phases
router.get('/', (req, res) => {
  res.json({ message: 'Get campaigns endpoint - to be implemented' });
});

router.post('/', (req, res) => {
  res.json({ message: 'Create campaign endpoint - to be implemented' });
});

export default router;
