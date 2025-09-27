import { Request, Response } from 'express';
import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';
import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

// Generate JWT Token
const generateToken = (id: string) => {
  return jwt.sign({ id }, process.env.JWT_SECRET || 'secret', {
    expiresIn: '30d',
  });
};

// @desc    Login user
// @route   POST /api/v1/auth/login
// @access  Public
export const login = async (req: Request, res: Response): Promise<any> => {
  try {
    const { email, password } = req.body;

    if (!email || !password) {
      return res.status(400).json({
        success: false,
        message: 'Por favor, forneça email e senha'
      });
    }

    // Check for user
    const user = await prisma.user.findUnique({
      where: { email },
      include: { municipality: true }
    });

    if (!user) {
      return res.status(401).json({
        success: false,
        message: 'Credenciais inválidas'
      });
    }

    // Check if password matches
    const isMatch = await bcrypt.compare(password, user.passwordHash);

    if (!isMatch) {
      return res.status(401).json({
        success: false,
        message: 'Credenciais inválidas'
      });
    }

    // Check if user is active
    if (!user.isActive) {
      return res.status(401).json({
        success: false,
        message: 'Conta desativada. Entre em contato com o administrador.'
      });
    }

    const token = generateToken(user.id);

    res.status(200).json({
      success: true,
      token,
      user: {
        id: user.id,
        name: user.name,
        email: user.email,
        role: user.role,
        municipality: user.municipality
      }
    });
  } catch (error) {
    console.error(error);
    res.status(500).json({
      success: false,
      message: 'Erro interno do servidor'
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
      role = 'CIDADAO',
      municipalityId
    } = req.body;

    if (!name || !email || !password) {
      return res.status(400).json({
        success: false,
        message: 'Por favor, forneça nome, email e senha'
      });
    }

    // For CIDADAO registration, require additional fields
    if (role === 'CIDADAO') {
      if (!phone) {
        return res.status(400).json({
          success: false,
          message: 'Telefone é obrigatório para cidadãos'
        });
      }
    }

    // Check if user exists
    const userExists = await prisma.user.findUnique({
      where: { email }
    });

    if (userExists) {
      return res.status(400).json({
        success: false,
        message: 'Usuário já existe'
      });
    }

    // Hash password
    const salt = await bcrypt.genSalt(10);
    const hashedPassword = await bcrypt.hash(password, salt);

    // Determine municipality (for now, use default)
    const defaultMunicipalityId = municipalityId || '1';

    // Create user
    const user = await prisma.user.create({
      data: {
        name,
        email,
        passwordHash: hashedPassword,
        role,
        municipalityId: defaultMunicipalityId,
        isActive: true
      },
      include: { municipality: true }
    });

    // If it's a CIDADAO and we have address info, we could create a tutor record
    // This would be done in a separate step or service
    if (role === 'CIDADAO' && zipCode) {
      // TODO: Create tutor record with address information
      // This would be handled by the tutor agent when the user wants to adopt
    }

    const token = generateToken(user.id);

    res.status(201).json({
      success: true,
      token,
      user: {
        id: user.id,
        name: user.name,
        email: user.email,
        role: user.role,
        municipalityId: user.municipalityId,
        municipality: user.municipality
      },
      message: role === 'CIDADAO'
        ? 'Conta criada com sucesso! Agora você pode explorar animais para adoção.'
        : 'Usuário criado com sucesso!'
    });
  } catch (error) {
    console.error(error);
    res.status(500).json({
      success: false,
      message: 'Erro interno do servidor'
    });
  }
};

// @desc    Get current user
// @route   GET /api/v1/auth/me
// @access  Private
export const getMe = async (req: Request, res: Response): Promise<any> => {
  try {
    const user = await prisma.user.findUnique({
      where: { id: (req as any).user.id },
      include: { municipality: true }
    });

    if (!user) {
      return res.status(404).json({
        success: false,
        message: 'Usuário não encontrado'
      });
    }

    res.status(200).json({
      success: true,
      user: {
        id: user.id,
        name: user.name,
        email: user.email,
        role: user.role,
        municipality: user.municipality
      }
    });
  } catch (error) {
    console.error(error);
    res.status(500).json({
      success: false,
      message: 'Erro interno do servidor'
    });
  }
};

// @desc    Refresh access token
// @route   POST /api/v1/auth/refresh
// @access  Public
export const refreshToken = async (req: Request, res: Response): Promise<any> => {
  try {
    const { token } = req.body;

    if (!token) {
      return res.status(400).json({
        success: false,
        message: 'Token é obrigatório'
      });
    }

    const decoded = jwt.verify(token, process.env.JWT_SECRET || 'secret') as any;
    const user = await prisma.user.findUnique({
      where: { id: decoded.id },
      include: { municipality: true }
    });

    if (!user || !user.isActive) {
      return res.status(401).json({
        success: false,
        message: 'Token inválido'
      });
    }

    const newToken = generateToken(user.id);

    res.status(200).json({
      success: true,
      token: newToken,
      user: {
        id: user.id,
        name: user.name,
        email: user.email,
        role: user.role,
        municipality: user.municipality
      }
    });
  } catch (error) {
    console.error(error);
    res.status(401).json({
      success: false,
      message: 'Token inválido'
    });
  }
};

// @desc    Logout user
// @route   POST /api/v1/auth/logout
// @access  Private
export const logout = async (req: Request, res: Response): Promise<any> => {
  res.status(200).json({
    success: true,
    message: 'Logout realizado com sucesso'
  });
};
