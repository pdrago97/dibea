import { Router } from 'express';

const router = Router();

// Placeholder routes - will be implemented in dashboard task
router.get('/stats', (req, res) => {
  res.json({ message: 'Get dashboard stats endpoint - to be implemented' });
});

router.get('/kpis', (req, res) => {
  res.json({ message: 'Get KPIs endpoint - to be implemented' });
});

export default router;
