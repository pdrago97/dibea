import { Request, Response, NextFunction } from 'express';
import { UserRole } from '@prisma/client';
import { logger } from '../utils/logger';

// Agent types that can be accessed
export enum AgentType {
  ANIMAL = 'animal',
  PROCEDURE = 'procedure', 
  DOCUMENT = 'document',
  TUTOR = 'tutor',
  GENERAL = 'general'
}

// Permission levels for each agent
export enum PermissionLevel {
  NONE = 'none',
  READ = 'read',
  BASIC = 'basic',
  FULL = 'full',
  ADMIN = 'admin'
}

// Permission matrix: [UserRole][AgentType] = PermissionLevel
const PERMISSION_MATRIX: Record<UserRole, Record<AgentType, PermissionLevel>> = {
  [UserRole.ADMIN]: {
    [AgentType.ANIMAL]: PermissionLevel.ADMIN,
    [AgentType.PROCEDURE]: PermissionLevel.ADMIN,
    [AgentType.DOCUMENT]: PermissionLevel.ADMIN,
    [AgentType.TUTOR]: PermissionLevel.ADMIN,
    [AgentType.GENERAL]: PermissionLevel.ADMIN
  },
  [UserRole.VETERINARIO]: {
    [AgentType.ANIMAL]: PermissionLevel.FULL,
    [AgentType.PROCEDURE]: PermissionLevel.FULL,
    [AgentType.DOCUMENT]: PermissionLevel.FULL, // Only medical documents
    [AgentType.TUTOR]: PermissionLevel.READ,
    [AgentType.GENERAL]: PermissionLevel.BASIC
  },
  [UserRole.FUNCIONARIO]: {
    [AgentType.ANIMAL]: PermissionLevel.BASIC,
    [AgentType.PROCEDURE]: PermissionLevel.NONE,
    [AgentType.DOCUMENT]: PermissionLevel.BASIC, // Administrative documents
    [AgentType.TUTOR]: PermissionLevel.FULL,
    [AgentType.GENERAL]: PermissionLevel.BASIC
  },
  [UserRole.CIDADAO]: {
    [AgentType.ANIMAL]: PermissionLevel.NONE,
    [AgentType.PROCEDURE]: PermissionLevel.NONE,
    [AgentType.DOCUMENT]: PermissionLevel.NONE,
    [AgentType.TUTOR]: PermissionLevel.BASIC, // Self-registration only
    [AgentType.GENERAL]: PermissionLevel.READ // Public queries only
  }
};

// Allowed operations by permission level
const ALLOWED_OPERATIONS: Record<PermissionLevel, string[]> = {
  [PermissionLevel.NONE]: [],
  [PermissionLevel.READ]: ['search', 'get', 'list', 'view'],
  [PermissionLevel.BASIC]: ['search', 'get', 'list', 'view', 'create', 'update'],
  [PermissionLevel.FULL]: ['search', 'get', 'list', 'view', 'create', 'update', 'delete'],
  [PermissionLevel.ADMIN]: ['*'] // All operations
};

// Medical document types (only for veterinarians)
const MEDICAL_DOCUMENT_TYPES = [
  'medical_report',
  'prescription', 
  'vaccine_certificate',
  'surgery_report',
  'exam_result'
];

// Administrative document types (for funcionarios)
const ADMIN_DOCUMENT_TYPES = [
  'adoption_form',
  'registration_form',
  'invoice',
  'certificate',
  'photo'
];

/**
 * Middleware to validate agent access permissions
 */
export const validateAgentAccess = (agentType: AgentType, operation: string = 'access') => {
  return (req: Request, res: Response, next: NextFunction): any => {
    try {
      // Check if user is authenticated
      if (!req.user) {
        return res.status(401).json({
          success: false,
          error: 'Autenticação necessária para acessar agentes'
        });
      }

      const { role, municipalityId } = req.user;
      
      // Get permission level for this user role and agent type
      const permissionLevel = PERMISSION_MATRIX[role][agentType];
      
      // Check if user has any permission for this agent
      if (permissionLevel === PermissionLevel.NONE) {
        logger.warn(`Access denied: ${role} tried to access ${agentType} agent`, {
          userId: req.user.id,
          role,
          agentType,
          operation
        });
        
        return res.status(403).json({
          success: false,
          error: `Usuários do tipo ${role} não podem acessar o agente ${agentType}`
        });
      }

      // Check if operation is allowed for this permission level
      const allowedOps = ALLOWED_OPERATIONS[permissionLevel];
      const isOperationAllowed = allowedOps.includes('*') || allowedOps.includes(operation);
      
      if (!isOperationAllowed) {
        logger.warn(`Operation denied: ${role} tried ${operation} on ${agentType}`, {
          userId: req.user.id,
          role,
          agentType,
          operation,
          permissionLevel
        });
        
        return res.status(403).json({
          success: false,
          error: `Operação '${operation}' não permitida para seu nível de acesso`
        });
      }

      // Add permission context to request
      req.agentContext = {
        agentType,
        permissionLevel,
        allowedOperations: allowedOps,
        municipalityId: role === UserRole.ADMIN ? undefined : municipalityId
      };

      logger.info(`Agent access granted: ${role} accessing ${agentType}`, {
        userId: req.user.id,
        role,
        agentType,
        operation,
        permissionLevel
      });

      next();

    } catch (error) {
      logger.error('Error in agent guardrails:', error);
      res.status(500).json({
        success: false,
        error: 'Erro interno na validação de permissões'
      });
    }
  };
};

/**
 * Validate document type access based on user role
 */
export const validateDocumentType = (req: Request, res: Response, next: NextFunction): any => {
  try {
    const { type: documentType } = req.body;
    const { role } = req.user!;

    // Admin can process any document type
    if (role === UserRole.ADMIN) {
      return next();
    }

    // Veterinarians can only process medical documents
    if (role === UserRole.VETERINARIO) {
      if (!MEDICAL_DOCUMENT_TYPES.includes(documentType)) {
        return res.status(403).json({
          success: false,
          error: `Veterinários só podem processar documentos médicos. Tipo '${documentType}' não permitido.`
        });
      }
    }

    // Funcionarios can only process administrative documents
    if (role === UserRole.FUNCIONARIO) {
      if (!ADMIN_DOCUMENT_TYPES.includes(documentType)) {
        return res.status(403).json({
          success: false,
          error: `Funcionários só podem processar documentos administrativos. Tipo '${documentType}' não permitido.`
        });
      }
    }

    // Cidadaos cannot process any documents
    if (role === UserRole.CIDADAO) {
      return res.status(403).json({
        success: false,
        error: 'Cidadãos não podem processar documentos oficiais'
      });
    }

    next();

  } catch (error) {
    logger.error('Error validating document type:', error);
    res.status(500).json({
      success: false,
      error: 'Erro na validação do tipo de documento'
    });
  }
};

/**
 * Validate municipality access (except for admins)
 */
export const validateMunicipalityAccess = (req: Request, res: Response, next: NextFunction): any => {
  try {
    const { role, municipalityId: userMunicipalityId } = req.user!;
    
    // Admin has access to all municipalities
    if (role === UserRole.ADMIN) {
      return next();
    }

    // Get municipality from request (body, params, or query)
    const requestMunicipalityId = req.body.municipalityId || 
                                  req.params.municipalityId || 
                                  req.query.municipalityId;

    // If no municipality specified, use user's municipality
    if (!requestMunicipalityId) {
      req.body.municipalityId = userMunicipalityId;
      return next();
    }

    // Check if user is trying to access different municipality
    if (requestMunicipalityId !== userMunicipalityId) {
      logger.warn(`Municipality access denied: ${role} tried to access different municipality`, {
        userId: req.user!.id,
        userMunicipalityId,
        requestMunicipalityId
      });

      return res.status(403).json({
        success: false,
        error: 'Acesso negado: você só pode acessar dados do seu município'
      });
    }

    next();

  } catch (error) {
    logger.error('Error validating municipality access:', error);
    res.status(500).json({
      success: false,
      error: 'Erro na validação de acesso ao município'
    });
  }
};

// Extend Express Request interface
declare global {
  namespace Express {
    interface Request {
      agentContext?: {
        agentType: AgentType;
        permissionLevel: PermissionLevel;
        allowedOperations: string[];
        municipalityId?: string;
      };
    }
  }
}
