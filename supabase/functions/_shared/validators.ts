// =====================================================
// DIBEA - Shared Module: Validators
// =====================================================

import { ValidationError } from './errors.ts'

/**
 * Valida UUID
 */
export function validateUUID(value: string, fieldName: string = 'id'): void {
  const uuidRegex = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i
  if (!uuidRegex.test(value)) {
    throw new ValidationError(`Invalid ${fieldName}: must be a valid UUID`)
  }
}

/**
 * Valida CPF
 */
export function validateCPF(cpf: string): boolean {
  // Remove caracteres não numéricos
  cpf = cpf.replace(/[^\d]/g, '')
  
  if (cpf.length !== 11) return false
  
  // Verifica se todos os dígitos são iguais
  if (/^(\d)\1{10}$/.test(cpf)) return false
  
  // Validação dos dígitos verificadores
  let sum = 0
  for (let i = 0; i < 9; i++) {
    sum += parseInt(cpf.charAt(i)) * (10 - i)
  }
  let digit = 11 - (sum % 11)
  if (digit >= 10) digit = 0
  if (digit !== parseInt(cpf.charAt(9))) return false
  
  sum = 0
  for (let i = 0; i < 10; i++) {
    sum += parseInt(cpf.charAt(i)) * (11 - i)
  }
  digit = 11 - (sum % 11)
  if (digit >= 10) digit = 0
  if (digit !== parseInt(cpf.charAt(10))) return false
  
  return true
}

/**
 * Valida telefone brasileiro
 */
export function validatePhone(phone: string): boolean {
  // Remove caracteres não numéricos
  phone = phone.replace(/[^\d]/g, '')
  
  // Formato: +55 11 99999-9999 (13 dígitos com +55)
  // Ou: 11999999999 (11 dígitos sem +55)
  return phone.length === 11 || phone.length === 13
}

/**
 * Valida email
 */
export function validateEmail(email: string): boolean {
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/
  return emailRegex.test(email)
}

/**
 * Valida campos obrigatórios
 */
export function validateRequired(
  data: Record<string, any>,
  requiredFields: string[]
): void {
  const missingFields = requiredFields.filter(field => {
    const value = data[field]
    return value === undefined || value === null || value === ''
  })
  
  if (missingFields.length > 0) {
    throw new ValidationError(
      `Missing required fields: ${missingFields.join(', ')}`,
      { missingFields }
    )
  }
}

/**
 * Valida enum
 */
export function validateEnum<T extends string>(
  value: string,
  allowedValues: T[],
  fieldName: string = 'value'
): void {
  if (!allowedValues.includes(value as T)) {
    throw new ValidationError(
      `Invalid ${fieldName}: must be one of ${allowedValues.join(', ')}`,
      { allowedValues, received: value }
    )
  }
}

/**
 * Valida data
 */
export function validateDate(dateString: string, fieldName: string = 'date'): Date {
  const date = new Date(dateString)
  if (isNaN(date.getTime())) {
    throw new ValidationError(`Invalid ${fieldName}: must be a valid date`)
  }
  return date
}

/**
 * Valida data futura
 */
export function validateFutureDate(dateString: string, fieldName: string = 'date'): Date {
  const date = validateDate(dateString, fieldName)
  if (date <= new Date()) {
    throw new ValidationError(`${fieldName} must be in the future`)
  }
  return date
}

/**
 * Valida número positivo
 */
export function validatePositiveNumber(
  value: number,
  fieldName: string = 'value'
): void {
  if (typeof value !== 'number' || value <= 0) {
    throw new ValidationError(`${fieldName} must be a positive number`)
  }
}

/**
 * Valida range de número
 */
export function validateNumberRange(
  value: number,
  min: number,
  max: number,
  fieldName: string = 'value'
): void {
  if (typeof value !== 'number' || value < min || value > max) {
    throw new ValidationError(
      `${fieldName} must be between ${min} and ${max}`,
      { min, max, received: value }
    )
  }
}

/**
 * Valida string não vazia
 */
export function validateNonEmptyString(
  value: string,
  fieldName: string = 'value'
): void {
  if (typeof value !== 'string' || value.trim().length === 0) {
    throw new ValidationError(`${fieldName} must be a non-empty string`)
  }
}

/**
 * Valida comprimento de string
 */
export function validateStringLength(
  value: string,
  minLength: number,
  maxLength: number,
  fieldName: string = 'value'
): void {
  if (typeof value !== 'string' || value.length < minLength || value.length > maxLength) {
    throw new ValidationError(
      `${fieldName} must be between ${minLength} and ${maxLength} characters`,
      { minLength, maxLength, received: value.length }
    )
  }
}

/**
 * Sanitiza string (remove caracteres especiais)
 */
export function sanitizeString(value: string): string {
  return value.trim().replace(/[<>]/g, '')
}

/**
 * Valida e sanitiza input
 */
export function validateAndSanitize(
  data: Record<string, any>,
  schema: {
    [key: string]: {
      required?: boolean
      type?: 'string' | 'number' | 'boolean' | 'date' | 'uuid' | 'email' | 'phone' | 'cpf'
      enum?: string[]
      min?: number
      max?: number
      minLength?: number
      maxLength?: number
    }
  }
): Record<string, any> {
  const sanitized: Record<string, any> = {}
  
  for (const [key, rules] of Object.entries(schema)) {
    const value = data[key]
    
    // Verificar obrigatório
    if (rules.required && (value === undefined || value === null || value === '')) {
      throw new ValidationError(`${key} is required`)
    }
    
    // Se não obrigatório e não fornecido, pular
    if (!rules.required && (value === undefined || value === null)) {
      continue
    }
    
    // Validar tipo
    switch (rules.type) {
      case 'string':
        validateNonEmptyString(value, key)
        if (rules.minLength !== undefined && rules.maxLength !== undefined) {
          validateStringLength(value, rules.minLength, rules.maxLength, key)
        }
        sanitized[key] = sanitizeString(value)
        break
        
      case 'number':
        if (typeof value !== 'number') {
          throw new ValidationError(`${key} must be a number`)
        }
        if (rules.min !== undefined && rules.max !== undefined) {
          validateNumberRange(value, rules.min, rules.max, key)
        }
        sanitized[key] = value
        break
        
      case 'boolean':
        if (typeof value !== 'boolean') {
          throw new ValidationError(`${key} must be a boolean`)
        }
        sanitized[key] = value
        break
        
      case 'date':
        sanitized[key] = validateDate(value, key)
        break
        
      case 'uuid':
        validateUUID(value, key)
        sanitized[key] = value
        break
        
      case 'email':
        if (!validateEmail(value)) {
          throw new ValidationError(`${key} must be a valid email`)
        }
        sanitized[key] = value.toLowerCase().trim()
        break
        
      case 'phone':
        if (!validatePhone(value)) {
          throw new ValidationError(`${key} must be a valid phone number`)
        }
        sanitized[key] = value.replace(/[^\d+]/g, '')
        break
        
      case 'cpf':
        if (!validateCPF(value)) {
          throw new ValidationError(`${key} must be a valid CPF`)
        }
        sanitized[key] = value.replace(/[^\d]/g, '')
        break
        
      default:
        sanitized[key] = value
    }
    
    // Validar enum
    if (rules.enum) {
      validateEnum(sanitized[key], rules.enum, key)
    }
  }
  
  return sanitized
}

