import Joi from 'joi';

// Email validation
export const validateEmail = (email: string): boolean => {
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  return emailRegex.test(email);
};

// Password validation - at least 8 chars, 1 uppercase, 1 lowercase, 1 number, 1 special char
export const validatePassword = (password: string): boolean => {
  const passwordRegex = /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[@$!%*?&])[A-Za-z\d@$!%*?&]{8,}$/;
  return passwordRegex.test(password);
};

// CPF validation (Brazilian tax ID)
export const validateCPF = (cpf: string): boolean => {
  // Remove non-numeric characters
  const cleanCPF = cpf.replace(/\D/g, '');
  
  // Check if has 11 digits
  if (cleanCPF.length !== 11) return false;
  
  // Check if all digits are the same
  if (/^(\d)\1{10}$/.test(cleanCPF)) return false;
  
  // Validate check digits
  let sum = 0;
  for (let i = 0; i < 9; i++) {
    sum += parseInt(cleanCPF.charAt(i)) * (10 - i);
  }
  let remainder = (sum * 10) % 11;
  if (remainder === 10 || remainder === 11) remainder = 0;
  if (remainder !== parseInt(cleanCPF.charAt(9))) return false;
  
  sum = 0;
  for (let i = 0; i < 10; i++) {
    sum += parseInt(cleanCPF.charAt(i)) * (11 - i);
  }
  remainder = (sum * 10) % 11;
  if (remainder === 10 || remainder === 11) remainder = 0;
  if (remainder !== parseInt(cleanCPF.charAt(10))) return false;
  
  return true;
};

// CNPJ validation (Brazilian company tax ID)
export const validateCNPJ = (cnpj: string): boolean => {
  const cleanCNPJ = cnpj.replace(/\D/g, '');
  
  if (cleanCNPJ.length !== 14) return false;
  if (/^(\d)\1{13}$/.test(cleanCNPJ)) return false;
  
  // Validate first check digit
  let sum = 0;
  let weight = 2;
  for (let i = 11; i >= 0; i--) {
    sum += parseInt(cleanCNPJ.charAt(i)) * weight;
    weight = weight === 9 ? 2 : weight + 1;
  }
  let remainder = sum % 11;
  const firstDigit = remainder < 2 ? 0 : 11 - remainder;
  if (firstDigit !== parseInt(cleanCNPJ.charAt(12))) return false;
  
  // Validate second check digit
  sum = 0;
  weight = 2;
  for (let i = 12; i >= 0; i--) {
    sum += parseInt(cleanCNPJ.charAt(i)) * weight;
    weight = weight === 9 ? 2 : weight + 1;
  }
  remainder = sum % 11;
  const secondDigit = remainder < 2 ? 0 : 11 - remainder;
  if (secondDigit !== parseInt(cleanCNPJ.charAt(13))) return false;
  
  return true;
};

// Phone validation (Brazilian format)
export const validatePhone = (phone: string): boolean => {
  const cleanPhone = phone.replace(/\D/g, '');
  // Accept 10 or 11 digits (with or without 9th digit for mobile)
  return cleanPhone.length === 10 || cleanPhone.length === 11;
};

// ZIP code validation (Brazilian CEP)
export const validateZipCode = (zipCode: string): boolean => {
  const cleanZip = zipCode.replace(/\D/g, '');
  return cleanZip.length === 8;
};

// Joi schemas for request validation
export const loginSchema = Joi.object({
  email: Joi.string().email().required(),
  password: Joi.string().min(1).required()
});

export const registerSchema = Joi.object({
  email: Joi.string().email().required(),
  password: Joi.string().min(8).pattern(
    /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[@$!%*?&])[A-Za-z\d@$!%*?&]{8,}$/
  ).required().messages({
    'string.pattern.base': 'Password must contain at least 8 characters with uppercase, lowercase, number and special character'
  }),
  name: Joi.string().min(2).max(100).required(),
  phone: Joi.string().optional(),
  role: Joi.string().valid('ADMIN', 'FUNCIONARIO', 'VETERINARIO', 'CIDADAO').optional(),
  municipalityId: Joi.string().uuid().optional()
});

export const animalSchema = Joi.object({
  name: Joi.string().min(1).max(100).required(),
  species: Joi.string().valid('CANINO', 'FELINO', 'OUTROS').required(),
  breed: Joi.string().max(100).optional(),
  sex: Joi.string().valid('MACHO', 'FEMEA').required(),
  size: Joi.string().valid('PEQUENO', 'MEDIO', 'GRANDE').required(),
  birthDate: Joi.date().optional(),
  weight: Joi.number().positive().optional(),
  color: Joi.string().max(100).optional(),
  temperament: Joi.string().max(500).optional(),
  observations: Joi.string().max(1000).optional()
});

export const tutorSchema = Joi.object({
  cpf: Joi.string().required().custom((value, helpers) => {
    if (!validateCPF(value)) {
      return helpers.error('any.invalid');
    }
    return value;
  }).messages({
    'any.invalid': 'Invalid CPF format'
  }),
  rg: Joi.string().max(20).optional(),
  name: Joi.string().min(2).max(100).required(),
  email: Joi.string().email().optional(),
  phone: Joi.string().required().custom((value, helpers) => {
    if (!validatePhone(value)) {
      return helpers.error('any.invalid');
    }
    return value;
  }).messages({
    'any.invalid': 'Invalid phone format'
  }),
  fullAddress: Joi.string().min(10).max(200).required(),
  zipCode: Joi.string().required().custom((value, helpers) => {
    if (!validateZipCode(value)) {
      return helpers.error('any.invalid');
    }
    return value;
  }).messages({
    'any.invalid': 'Invalid ZIP code format'
  }),
  city: Joi.string().min(2).max(100).required(),
  state: Joi.string().length(2).required(),
  housingType: Joi.string().valid('CASA', 'APARTAMENTO', 'SITIO', 'OUTROS').required(),
  hasExperience: Joi.boolean().required(),
  observations: Joi.string().max(1000).optional()
});

export const complaintSchema = Joi.object({
  type: Joi.string().valid('MAUS_TRATOS', 'ABANDONO', 'ANIMAL_PERDIDO', 'OUTROS').required(),
  description: Joi.string().min(10).max(1000).required(),
  location: Joi.string().max(200).optional(),
  latitude: Joi.number().min(-90).max(90).optional(),
  longitude: Joi.number().min(-180).max(180).optional(),
  tutorId: Joi.string().uuid().optional()
});

// Middleware for Joi validation
export const validate = (schema: Joi.ObjectSchema) => {
  return (req: any, res: any, next: any) => {
    const { error } = schema.validate(req.body);
    if (error) {
      return res.status(400).json({
        success: false,
        error: error.details[0].message,
        details: error.details
      });
    }
    next();
  };
};
