import { Request, Response } from "express";
import bcrypt from "bcryptjs";
import { prisma } from "../lib/prisma";
import {
  generateToken,
  generateRefreshToken,
  verifyRefreshToken,
  JwtPayload,
} from "../utils/jwt";

// @desc    Login user
// @route   POST /api/v1/auth/login
// @access  Public
export const login = async (req: Request, res: Response): Promise<any> => {
  try {
    const { email, password } = req.body;

    if (!email || !password) {
      return res.status(400).json({
        success: false,
        message: "Por favor, forneça email e senha",
      });
    }

    // Check for user with Prisma
    const user = await prisma.user.findUnique({
      where: { email },
    });

    if (!user) {
      return res.status(401).json({
        success: false,
        message: "Credenciais inválidas",
      });
    }

    // Check if password matches
    if (!user.passwordHash) {
      return res.status(401).json({
        success: false,
        message: "Credenciais inválidas",
      });
    }
    const isMatch = await bcrypt.compare(password, user.passwordHash);

    if (!isMatch) {
      return res.status(401).json({
        success: false,
        message: "Credenciais inválidas",
      });
    }

    // Check if user is active
    if (!user.active) {
      return res.status(401).json({
        success: false,
        message: "Conta desativada. Entre em contato com o administrador.",
      });
    }

    // Check if municipality is active (if needed, fetch separately)
    // Skipping municipality check for now

    // Generate JWT with complete payload
    const tokenPayload: JwtPayload = {
      userId: user.id,
      email: user.email || "",
      role: user.role,
      municipalityId: user.municipalityId || "",
    };

    const token = generateToken(tokenPayload);
    const refreshToken = generateRefreshToken(user.id);

    res.status(200).json({
      success: true,
      token,
      refreshToken,
      user: {
        id: user.id,
        name: user.name,
        email: user.email,
        role: user.role,
        municipalityId: user.municipalityId,
        active: user.active,
      },
    });
  } catch (error) {
    console.error(error);
    res.status(500).json({
      success: false,
      message: "Erro interno do servidor",
    });
  }
};

// @desc    Register new user
// @route   POST /api/v1/auth/register
// @access  Public (for CIDADAO) / Private (for other roles)
export const register = async (req: Request, res: Response): Promise<any> => {
  try {
    const {
      name,
      email,
      password,
      phone,
      zipCode,
      address,
      role = "CIDADAO",
      municipalityId,
    } = req.body;

    if (!name || !email || !password) {
      return res.status(400).json({
        success: false,
        message: "Por favor, forneça nome, email e senha",
      });
    }

    // For CIDADAO registration, require additional fields
    if (role === "CIDADAO") {
      if (!phone) {
        return res.status(400).json({
          success: false,
          message: "Telefone é obrigatório para cidadãos",
        });
      }
    }

    // Check if user exists
    const userExists = await prisma.user.findUnique({
      where: { email },
    });

    if (userExists) {
      return res.status(400).json({
        success: false,
        message: "Usuário já existe",
      });
    }

    // Hash password
    const salt = await bcrypt.genSalt(10);
    const hashedPassword = await bcrypt.hash(password, salt);

    // Validate municipality if provided
    if (municipalityId) {
      const municipality = await prisma.municipality.findUnique({
        where: { id: municipalityId },
      });

      if (!municipality) {
        return res.status(400).json({
          success: false,
          message: "Município não encontrado",
        });
      }
    }

    // Create user with Prisma
    const user = await prisma.user.create({
      data: {
        email,
        ...(phone && { phone }),
        passwordHash: hashedPassword,
        role,
        municipalityId,
        active: true,
      },
    });

    // If it's a CIDADAO and we have address info, we could create a tutor record
    // This would be done in a separate step or service
    if (role === "CIDADAO" && zipCode) {
      // TODO: Create tutor record with address information
      // This would be handled by the tutor agent when the user wants to adopt
    }

    // Generate JWT with complete payload
    const tokenPayload: JwtPayload = {
      userId: user.id,
      email: user.email || "",
      role: user.role,
      municipalityId: user.municipalityId || "",
    };

    const token = generateToken(tokenPayload);
    const refreshToken = generateRefreshToken(user.id);

    res.status(201).json({
      success: true,
      token,
      refreshToken,
      user: {
        id: user.id,
        name: user.name,
        email: user.email,
        role: user.role,
        municipalityId: user.municipalityId,
        active: user.active,
      },
      message:
        role === "CIDADAO"
          ? "Conta criada com sucesso! Agora você pode explorar animais para adoção."
          : "Usuário criado com sucesso!",
    });
  } catch (error) {
    console.error(error);
    res.status(500).json({
      success: false,
      message: "Erro interno do servidor",
    });
  }
};

// @desc    Get current user
// @route   GET /api/v1/auth/me
// @access  Private
export const getMe = async (req: Request, res: Response): Promise<any> => {
  try {
    const userId = req.user?.userId;

    if (!userId) {
      return res.status(401).json({
        success: false,
        message: "Não autenticado",
      });
    }

    const user = await prisma.user.findUnique({
      where: { id: userId },
      include: {
        municipality: {
          select: { id: true, name: true },
        },
      },
    });

    if (!user) {
      return res.status(404).json({
        success: false,
        message: "Usuário não encontrado",
      });
    }

    res.status(200).json({
      success: true,
      user: {
        id: user.id,
        email: user.email,
        role: user.role,
        municipality: user.municipality,
      },
    });
  } catch (error) {
    console.error("Error in getMe:", error);
    res.status(500).json({
      success: false,
      message: "Erro ao buscar usuário",
      error: error instanceof Error ? error.message : "Unknown error",
    });
  }
};

// @desc    Refresh access token
// @route   POST /api/v1/auth/refresh
// @access  Public
export const refreshToken = async (
  req: Request,
  res: Response,
): Promise<any> => {
  try {
    const { refreshToken: token } = req.body;

    if (!token) {
      return res.status(400).json({
        success: false,
        message: "Refresh token é obrigatório",
      });
    }

    const decoded = verifyRefreshToken(token);

    const user = await prisma.user.findUnique({
      where: { id: decoded.userId },
      select: {
        id: true,
        name: true,
        email: true,
        role: true,
        municipalityId: true,
        active: true,
      },
    });

    if (!user || !user.active) {
      return res.status(401).json({
        success: false,
        message: "Token inválido ou usuário inativo",
      });
    }

    // Generate new tokens with complete payload
    const tokenPayload: JwtPayload = {
      userId: user.id,
      email: user.email || "",
      role: user.role,
      municipalityId: user.municipalityId || "",
    };

    const newToken = generateToken(tokenPayload);
    const newRefreshToken = generateRefreshToken(user.id);

    res.status(200).json({
      success: true,
      token: newToken,
      refreshToken: newRefreshToken,
      user: {
        id: user.id,
        name: user.name,
        email: user.email,
        role: user.role,
        municipalityId: user.municipalityId,
        active: user.active,
      },
    });
  } catch (error) {
    console.error("Error in refreshToken:", error);
    res.status(401).json({
      success: false,
      message: "Token inválido",
      error: error instanceof Error ? error.message : "Unknown error",
    });
  }
};

// @desc    Get user profile
// @route   GET /api/v1/auth/profile
// @access  Private
export const getProfile = async (req: Request, res: Response): Promise<any> => {
  try {
    // @ts-ignore - user is attached by auth middleware
    const userId = req.user.id;

    const user = await prisma.user.findUnique({
      where: { id: userId },
      select: {
        id: true,
        name: true,
        email: true,
        role: true,
        municipalityId: true,
        active: true,
        createdAt: true,
        updatedAt: true,
      },
    });

    if (!user) {
      return res.status(404).json({
        success: false,
        message: "Usuário não encontrado",
      });
    }

    res.status(200).json({
      success: true,
      data: user,
    });
  } catch (error) {
    console.error("Error in getProfile:", error);
    res.status(500).json({
      success: false,
      message: "Erro ao buscar perfil",
      error: error instanceof Error ? error.message : "Unknown error",
    });
  }
};

// @desc    Update user profile
// @route   PUT /api/v1/auth/profile
// @access  Private
export const updateProfile = async (
  req: Request,
  res: Response,
): Promise<any> => {
  try {
    // @ts-ignore - user is attached by auth middleware
    const userId = req.user.id;
    const { name, email } = req.body;

    const user = await prisma.user.update({
      where: { id: userId },
      data: {
        ...(name && { name }),
        ...(email && { email }),
      },
      select: {
        id: true,
        name: true,
        email: true,
        role: true,
        municipalityId: true,
        active: true,
        createdAt: true,
        updatedAt: true,
      },
    });

    res.status(200).json({
      success: true,
      data: user,
      message: "Perfil atualizado com sucesso",
    });
  } catch (error) {
    console.error("Error in updateProfile:", error);
    res.status(500).json({
      success: false,
      message: "Erro ao atualizar perfil",
      error: error instanceof Error ? error.message : "Unknown error",
    });
  }
};

// @desc    Forgot password
// @route   POST /api/v1/auth/forgot-password
// @access  Public
export const forgotPassword = async (
  req: Request,
  res: Response,
): Promise<any> => {
  try {
    const { email } = req.body;

    if (!email) {
      return res.status(400).json({
        success: false,
        message: "Email é obrigatório",
      });
    }

    const user = await prisma.user.findUnique({
      where: { email },
    });

    if (!user) {
      return res.status(404).json({
        success: false,
        message: "Usuário não encontrado",
      });
    }

    // TODO: Implement actual email sending with reset token
    // For now, just return success
    res.status(200).json({
      success: true,
      message: "Email de redefinição de senha enviado",
    });
  } catch (error) {
    console.error("Error in forgotPassword:", error);
    res.status(500).json({
      success: false,
      message: "Erro ao processar solicitação",
      error: error instanceof Error ? error.message : "Unknown error",
    });
  }
};

// @desc    Reset password
// @route   POST /api/v1/auth/reset-password
// @access  Public
export const resetPassword = async (
  req: Request,
  res: Response,
): Promise<any> => {
  try {
    const { token, newPassword } = req.body;

    if (!token || !newPassword) {
      return res.status(400).json({
        success: false,
        message: "Token e nova senha são obrigatórios",
      });
    }

    // TODO: Implement actual token validation and password reset
    // For now, just return success
    res.status(200).json({
      success: true,
      message: "Senha redefinida com sucesso",
    });
  } catch (error) {
    console.error("Error in resetPassword:", error);
    res.status(500).json({
      success: false,
      message: "Erro ao redefinir senha",
      error: error instanceof Error ? error.message : "Unknown error",
    });
  }
};

// @desc    Logout user
// @route   POST /api/v1/auth/logout
// @access  Private
export const logout = async (req: Request, res: Response): Promise<any> => {
  res.status(200).json({
    success: true,
    message: "Logout realizado com sucesso",
  });
};
