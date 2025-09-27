import { Router } from 'express';

const router = Router();

// Placeholder routes - will be implemented in tutors CRUD task
router.get('/', (req, res) => {
  res.json({ message: 'Get tutors endpoint - to be implemented' });
});

router.get('/:id', (req, res) => {
  res.json({ message: 'Get tutor by ID endpoint - to be implemented' });
});

router.post('/', (req, res) => {
  res.json({ message: 'Create tutor endpoint - to be implemented' });
});

router.put('/:id', (req, res) => {
  res.json({ message: 'Update tutor endpoint - to be implemented' });
});

router.delete('/:id', (req, res) => {
  res.json({ message: 'Delete tutor endpoint - to be implemented' });
});

export default router;
