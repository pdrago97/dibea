import { Request, Response, NextFunction } from "express";
import { verifyToken, JwtPayload } from "../utils/jwt";
import { prisma } from "../lib/prisma";
import { logger } from "../utils/logger";

// Extend Express Request interface to include user
declare global {
  namespace Express {
    interface Request {
      user?: JwtPayload & {
        municipality?: {
          id: string;
          name: string;
        };
      };
    }
  }
}

export const authenticate = async (
  req: Request,
  res: Response,
  next: NextFunction,
): Promise<any> => {
  try {
    const authHeader = req.headers.authorization;

    if (!authHeader || !authHeader.startsWith("Bearer ")) {
      return res.status(401).json({
        success: false,
        error: "Access token required",
      });
    }

    const token = authHeader.substring(7); // Remove 'Bearer ' prefix

    // Verify JWT token
    const decoded = verifyToken(token);

    // Check if user still exists and is active using Prisma
    const user = await prisma.user.findUnique({
      where: {
        id: decoded.userId,
        active: true
      },
      include: {
        municipality: {
          select: { id: true, name: true, active: true }
        }
      }
    });

    if (!user) {
      return res.status(401).json({
        success: false,
        error: "User not found or inactive",
      });
    }

    if (user.municipality && !user.municipality.active) {
      return res.status(401).json({
        success: false,
        error: "Municipality is inactive",
      });
    }

    // Add user info to request
    req.user = {
      userId: user.id,
      email: user.email || "",
      role: user.role,
      municipalityId: user.municipalityId || "",
      municipality: user.municipality
        ? {
            id: user.municipality.id,
            name: user.municipality.name,
          }
        : undefined,
    };

    next();
  } catch (error) {
    logger.error("Authentication error:", error);

    return res.status(401).json({
      success: false,
      error: error instanceof Error ? error.message : "Authentication failed",
    });
  }
};

export const authorize = (...roles: string[]) => {
  return (req: Request, res: Response, next: NextFunction): any => {
    if (!req.user) {
      return res.status(401).json({
        success: false,
        error: "Authentication required",
      });
    }

    if (!roles.includes(req.user.role)) {
      return res.status(403).json({
        success: false,
        error: "Insufficient permissions",
      });
    }

    next();
  };
};

// Middleware to check if user belongs to the same municipality
export const checkMunicipality = (
  req: Request,
  res: Response,
  next: NextFunction,
) => {
  if (!req.user) {
    return res.status(401).json({
      success: false,
      error: "Authentication required",
    });
  }

  // For admin users, allow access to all municipalities
  if (req.user.role === "ADMIN") {
    return next();
  }

  // For other users, check if they belong to the same municipality
  const municipalityId = req.params.municipalityId || req.body.municipalityId;

  if (municipalityId && municipalityId !== req.user.municipalityId) {
    return res.status(403).json({
      success: false,
      error: "Access denied to this municipality",
    });
  }

  next();
};

// Optional authentication - doesn't fail if no token provided
export const optionalAuth = async (
  req: Request,
  res: Response,
  next: NextFunction,
) => {
  try {
    const authHeader = req.headers.authorization;

    if (!authHeader || !authHeader.startsWith("Bearer ")) {
      return next(); // Continue without authentication
    }

    const token = authHeader.substring(7);
    const decoded = verifyToken(token);

    // Check if user still exists and is active using Prisma
    const user = await prisma.user.findUnique({
      where: {
        id: decoded.userId,
        active: true
      },
      include: {
        municipality: {
          select: { id: true, name: true, active: true }
        }
      }
    });

    if (user && (!user.municipality || user.municipality.active)) {
      req.user = {
        ...decoded,
        municipality: user.municipality
          ? {
              id: user.municipality.id,
              name: user.municipality.name,
            }
          : undefined,
      };
    }

    next();
  } catch (error) {
    // Log error but continue without authentication
    logger.warn("Optional authentication failed:", error);
    next();
  }
};

// N8N Internal API Key Authentication
// Allows n8n to call internal APIs using a secure API key
export const authenticateN8N = async (
  req: Request,
  res: Response,
  next: NextFunction,
): Promise<any> => {
  try {
    const authHeader = req.headers.authorization;
    const n8nApiKey = process.env.N8N_INTERNAL_API_KEY;

    if (!n8nApiKey) {
      logger.error("N8N_INTERNAL_API_KEY not configured");
      return res.status(500).json({
        success: false,
        error: "Internal authentication not configured",
      });
    }

    if (!authHeader || !authHeader.startsWith("Bearer ")) {
      return res.status(401).json({
        success: false,
        error: "API key required",
      });
    }

    const providedKey = authHeader.substring(7);

    if (providedKey !== n8nApiKey) {
      logger.warn("Invalid N8N API key attempt");
      return res.status(401).json({
        success: false,
        error: "Invalid API key",
      });
    }

    // Set a system user context for n8n requests
    req.user = {
      userId: "n8n-system",
      email: "n8n@system.internal",
      role: "ADMIN", // Grant admin privileges to n8n
      municipalityId: req.body.municipalityId || "", // Use provided municipality or empty
    };

    logger.info("N8N authenticated successfully");
    next();
  } catch (error) {
    logger.error("N8N authentication error:", error);
    return res.status(401).json({
      success: false,
      error: "Authentication failed",
    });
  }
};
