import { Router } from 'express';
import { agentController } from '../controllers/agentController';
import { authenticate } from '../middleware/auth';
import {
  validateAgentAccess,
  validateDocumentType,
  validateMunicipalityAccess,
  AgentType
} from '../middleware/agentGuardrails';

const router = Router();

// Agent Health Check (public)
router.get('/health', agentController.healthCheck);

// Animal Management via Agents
router.post('/animals',
  authenticate,
  validateAgentAccess(AgentType.ANIMAL, 'create'),
  validateMunicipalityAccess,
  agentController.createAnimal
);

router.get('/animals/search',
  authenticate,
  validateAgentAccess(AgentType.ANIMAL, 'search'),
  validateMunicipalityAccess,
  agentController.searchAnimals
);

router.get('/animals/:animalId/graph',
  authenticate,
  validateAgentAccess(AgentType.ANIMAL, 'view'),
  validateMunicipalityAccess,
  agentController.getAnimalGraph
);

// Procedure Management via Agents
router.post('/procedures',
  authenticate,
  validateAgentAccess(AgentType.PROCEDURE, 'create'),
  validateMunicipalityAccess,
  agentController.createProcedure
);

// Document Processing via Agents
router.post('/documents',
  authenticate,
  validateAgentAccess(AgentType.DOCUMENT, 'create'),
  validateDocumentType,
  validateMunicipalityAccess,
  agentController.processDocument
);

router.post('/ocr',
  authenticate,
  validateAgentAccess(AgentType.DOCUMENT, 'create'),
  agentController.processOCR
);

router.post('/vision',
  authenticate,
  validateAgentAccess(AgentType.DOCUMENT, 'create'),
  agentController.analyzeImage
);

// Tutor Management via Agents
router.post('/tutors',
  authenticate,
  validateAgentAccess(AgentType.TUTOR, 'create'),
  validateMunicipalityAccess,
  agentController.createTutor
);

router.post('/validate-cpf',
  authenticate,
  validateAgentAccess(AgentType.TUTOR, 'create'),
  agentController.validateCPF
);

router.get('/tutors/check',
  authenticate,
  validateAgentAccess(AgentType.TUTOR, 'search'),
  validateMunicipalityAccess,
  agentController.checkTutorDuplicates
);

router.post('/analyze-profile',
  authenticate,
  validateAgentAccess(AgentType.TUTOR, 'create'),
  agentController.analyzeProfile
);

// Query and Analytics via Agents
router.post('/query',
  authenticate,
  validateAgentAccess(AgentType.GENERAL, 'search'),
  validateMunicipalityAccess,
  agentController.executeQuery
);

router.post('/analytics',
  authenticate,
  validateAgentAccess(AgentType.GENERAL, 'view'),
  validateMunicipalityAccess,
  agentController.generateAnalytics
);

router.post('/visualize',
  authenticate,
  validateAgentAccess(AgentType.GENERAL, 'view'),
  validateMunicipalityAccess,
  agentController.createVisualization
);

router.post('/reports',
  authenticate,
  validateAgentAccess(AgentType.GENERAL, 'view'),
  validateMunicipalityAccess,
  agentController.generateReport
);

export { router as agentRoutes };
