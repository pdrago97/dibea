import { Router } from 'express';
import multer from 'multer';
import { authenticate, authorize } from '../middleware/auth';
import {
  uploadDocument,
  analyzeDocument,
  getAnimalDocuments,
  getAnimalGraph,
  deleteDocument
} from '../controllers/documentController';

const router = Router();

// Configure multer for file uploads
const upload = multer({
  storage: multer.memoryStorage(),
  limits: {
    fileSize: 50 * 1024 * 1024, // 50MB
    files: 10 // Maximum 10 files per request
  },
  fileFilter: (req, file, cb) => {
    const allowedTypes = [
      'image/jpeg',
      'image/png',
      'image/gif',
      'application/pdf',
      'application/msword',
      'application/vnd.openxmlformats-officedocument.wordprocessingml.document'
    ];

    if (allowedTypes.includes(file.mimetype)) {
      cb(null, true);
    } else {
      cb(new Error('Tipo de arquivo não suportado'));
    }
  }
});

// All routes require authentication
router.use(authenticate);

/**
 * @route POST /api/v1/documents/upload
 * @desc Upload documents for an animal with AI analysis
 * @access ADMIN, FUNCIONARIO, VETERINARIO
 * @body {
 *   animalId: string,
 *   documentType: 'photo' | 'medical_report' | 'prescription' | 'invoice' | 'certificate',
 *   autoAnalyze?: boolean,
 *   description?: string
 * }
 * @files Multiple files (images, PDFs, Word docs)
 */
router.post(
  '/upload',
  authorize('ADMIN', 'FUNCIONARIO', 'VETERINARIO'),
  upload.array('files', 10),
  uploadDocument
);

/**
 * @route POST /api/v1/documents/:documentId/analyze
 * @desc Analyze a specific document with AI
 * @access ADMIN, FUNCIONARIO, VETERINARIO
 */
router.post(
  '/:documentId/analyze',
  authorize('ADMIN', 'FUNCIONARIO', 'VETERINARIO'),
  analyzeDocument
);

/**
 * @route GET /api/v1/documents/animal/:animalId
 * @desc Get all documents for an animal
 * @access All authenticated users
 */
router.get('/animal/:animalId', getAnimalDocuments);

/**
 * @route GET /api/v1/documents/animal/:animalId/graph
 * @desc Get complete knowledge graph for an animal
 * @access All authenticated users
 */
router.get('/animal/:animalId/graph', getAnimalGraph);

/**
 * @route DELETE /api/v1/documents/:documentId
 * @desc Delete a document
 * @access ADMIN, FUNCIONARIO
 */
router.delete(
  '/:documentId',
  authorize('ADMIN', 'FUNCIONARIO'),
  deleteDocument
);

export default router;
