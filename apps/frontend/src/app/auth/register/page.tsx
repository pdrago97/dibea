'use client';

import React, { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Badge } from '@/components/ui/badge';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { 
  PawPrint, 
  User, 
  Mail, 
  Lock, 
  Phone, 
  MapPin,
  Heart,
  CheckCircle,
  AlertCircle,
  ArrowRight,
  Shield
} from 'lucide-react';
import Link from 'next/link';
import Header from '@/components/navigation/Header';

interface RegisterForm {
  name: string;
  email: string;
  password: string;
  confirmPassword: string;
  phone: string;
  zipCode: string;
  acceptTerms: boolean;
}

interface ValidationErrors {
  [key: string]: string;
}

export default function RegisterPage() {
  const [form, setForm] = useState<RegisterForm>({
    name: '',
    email: '',
    password: '',
    confirmPassword: '',
    phone: '',
    zipCode: '',
    acceptTerms: false
  });

  const [errors, setErrors] = useState<ValidationErrors>({});
  const [isLoading, setIsLoading] = useState(false);
  const [isSuccess, setIsSuccess] = useState(false);
  const [addressInfo, setAddressInfo] = useState<any>(null);
  const [isValidatingCep, setIsValidatingCep] = useState(false);
  const [fieldTouched, setFieldTouched] = useState<{[key: string]: boolean}>({});

  // Validate individual field
  const validateField = (fieldName: string, value: any): string => {
    switch (fieldName) {
      case 'name':
        return !value.trim() ? 'Nome é obrigatório' : '';
      case 'email':
        if (!value.trim()) return 'Email é obrigatório';
        if (!/\S+@\S+\.\S+/.test(value)) return 'Email inválido';
        return '';
      case 'password':
        if (!value) return 'Senha é obrigatória';
        if (value.length < 6) return 'Senha deve ter pelo menos 6 caracteres';
        return '';
      case 'confirmPassword':
        if (value !== form.password) return 'Senhas não coincidem';
        return '';
      case 'phone':
        if (!value.trim()) return 'Telefone é obrigatório';
        if (!/^\(\d{2}\)\s\d{4,5}-\d{4}$/.test(value) && !/^\d{10,11}$/.test(value.replace(/\D/g, ''))) {
          return 'Formato de telefone inválido';
        }
        return '';
      case 'zipCode':
        if (!value.trim()) return 'CEP é obrigatório';
        if (value.length !== 8) return 'CEP deve ter 8 dígitos';
        return '';
      case 'acceptTerms':
        return !value ? 'Você deve aceitar os termos de uso' : '';
      default:
        return '';
    }
  };

  // Validate form fields
  const validateForm = (): boolean => {
    const newErrors: ValidationErrors = {};

    Object.keys(form).forEach(key => {
      const error = validateField(key, form[key as keyof RegisterForm]);
      if (error) newErrors[key] = error;
    });

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  // Handle field change with real-time validation
  const handleFieldChange = (fieldName: string, value: any) => {
    setForm({ ...form, [fieldName]: value });

    // Mark field as touched
    setFieldTouched({ ...fieldTouched, [fieldName]: true });

    // Real-time validation for touched fields
    if (fieldTouched[fieldName] || value !== '') {
      const error = validateField(fieldName, value);
      setErrors({ ...errors, [fieldName]: error });
    }
  };

  // Handle CEP lookup with loading state
  const handleZipCodeChange = async (zipCode: string) => {
    handleFieldChange('zipCode', zipCode);

    if (zipCode.length === 8) {
      setIsValidatingCep(true);
      try {
        const response = await fetch(`https://viacep.com.br/ws/${zipCode}/json/`);
        const data = await response.json();

        if (!data.erro) {
          setAddressInfo(data);
          // Clear CEP error if address found
          setErrors({ ...errors, zipCode: '' });
        } else {
          setAddressInfo(null);
          setErrors({ ...errors, zipCode: 'CEP não encontrado' });
        }
      } catch (error) {
        console.error('Erro ao buscar CEP:', error);
        setErrors({ ...errors, zipCode: 'Erro ao validar CEP' });
      } finally {
        setIsValidatingCep(false);
      }
    } else {
      setAddressInfo(null);
    }
  };

  // Format phone number
  const formatPhone = (value: string) => {
    const numbers = value.replace(/\D/g, '');
    if (numbers.length <= 10) {
      return numbers.replace(/(\d{2})(\d{4})(\d{4})/, '($1) $2-$3');
    } else {
      return numbers.replace(/(\d{2})(\d{5})(\d{4})/, '($1) $2-$3');
    }
  };

  // Handle form submission
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!validateForm()) {
      return;
    }

    setIsLoading(true);

    try {
      const response = await fetch('/api/v1/auth/register', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          name: form.name,
          email: form.email,
          password: form.password,
          phone: form.phone,
          role: 'CIDADAO',
          municipalityId: '1', // Default municipality
          zipCode: form.zipCode,
          address: addressInfo ? `${addressInfo.logradouro}, ${addressInfo.bairro}, ${addressInfo.localidade}/${addressInfo.uf}` : ''
        }),
      });

      const data = await response.json();

      if (response.ok) {
        setIsSuccess(true);
        // Redirect to login or dashboard after success
        setTimeout(() => {
          window.location.href = '/auth/login';
        }, 2000);
      } else {
        setErrors({ general: data.message || 'Erro ao criar conta' });
      }
    } catch (error) {
      setErrors({ general: 'Erro de conexão. Tente novamente.' });
    } finally {
      setIsLoading(false);
    }
  };

  if (isSuccess) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-blue-50 to-green-50 flex items-center justify-center p-6">
        <Card className="w-full max-w-md">
          <CardContent className="p-8 text-center">
            <div className="w-16 h-16 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-6">
              <CheckCircle className="w-8 h-8 text-green-600" />
            </div>
            <h2 className="text-2xl font-bold text-gray-900 mb-4">
              Conta Criada com Sucesso!
            </h2>
            <p className="text-gray-600 mb-6">
              Bem-vindo ao DIBEA! Sua conta foi criada e você será redirecionado para fazer login.
            </p>
            <div className="flex items-center justify-center text-sm text-gray-500">
              <Shield className="w-4 h-4 mr-2" />
              Redirecionando em alguns segundos...
            </div>
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-green-50">
      {/* Fixed Navigation Header */}
      <Header showBackButton={true} backUrl="/" title="Cadastro" />

      <div className="flex items-center justify-center p-6 pt-20">
        <div className="w-full max-w-md">
          {/* Header */}
          <div className="text-center mb-8">
          <h1 className="text-3xl font-bold text-gray-900 mb-2">
            Criar Conta Gratuita
          </h1>
          <p className="text-gray-600">
            Junte-se à revolução do cuidado animal
          </p>
        </div>

        {/* Registration Form */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center">
              <User className="w-5 h-5 mr-2" />
              Informações Pessoais
            </CardTitle>
          </CardHeader>
          <CardContent>
            <form onSubmit={handleSubmit} className="space-y-4">
              {/* General Error */}
              {errors.general && (
                <Alert className="border-red-200 bg-red-50">
                  <AlertCircle className="h-4 w-4 text-red-600" />
                  <AlertDescription className="text-red-600">
                    {errors.general}
                  </AlertDescription>
                </Alert>
              )}

              {/* Name */}
              <div>
                <Label htmlFor="name">Nome Completo</Label>
                <Input
                  id="name"
                  type="text"
                  value={form.name}
                  onChange={(e) => handleFieldChange('name', e.target.value)}
                  onBlur={() => setFieldTouched({ ...fieldTouched, name: true })}
                  placeholder="Seu nome completo"
                  className={errors.name ? 'border-red-500 focus:border-red-500' : 'focus:border-blue-500'}
                />
                {errors.name && (
                  <p className="text-sm text-red-600 mt-1 flex items-center">
                    <AlertCircle className="w-4 h-4 mr-1" />
                    {errors.name}
                  </p>
                )}
              </div>

              {/* Email */}
              <div>
                <Label htmlFor="email">Email</Label>
                <Input
                  id="email"
                  type="email"
                  value={form.email}
                  onChange={(e) => handleFieldChange('email', e.target.value)}
                  onBlur={() => setFieldTouched({ ...fieldTouched, email: true })}
                  placeholder="seu@email.com"
                  className={errors.email ? 'border-red-500 focus:border-red-500' : 'focus:border-blue-500'}
                />
                {errors.email && (
                  <p className="text-sm text-red-600 mt-1 flex items-center">
                    <AlertCircle className="w-4 h-4 mr-1" />
                    {errors.email}
                  </p>
                )}
              </div>

              {/* Phone */}
              <div>
                <Label htmlFor="phone">Telefone</Label>
                <Input
                  id="phone"
                  type="tel"
                  value={form.phone}
                  onChange={(e) => {
                    const formatted = formatPhone(e.target.value);
                    handleFieldChange('phone', formatted);
                  }}
                  onBlur={() => setFieldTouched({ ...fieldTouched, phone: true })}
                  placeholder="(11) 99999-9999"
                  maxLength={15}
                  className={errors.phone ? 'border-red-500 focus:border-red-500' : 'focus:border-blue-500'}
                />
                {errors.phone && (
                  <p className="text-sm text-red-600 mt-1 flex items-center">
                    <AlertCircle className="w-4 h-4 mr-1" />
                    {errors.phone}
                  </p>
                )}
              </div>

              {/* ZIP Code */}
              <div>
                <Label htmlFor="zipCode">CEP</Label>
                <div className="relative">
                  <Input
                    id="zipCode"
                    type="text"
                    value={form.zipCode}
                    onChange={(e) => handleZipCodeChange(e.target.value.replace(/\D/g, ''))}
                    onBlur={() => setFieldTouched({ ...fieldTouched, zipCode: true })}
                    placeholder="12345678"
                    maxLength={8}
                    className={errors.zipCode ? 'border-red-500 focus:border-red-500' : 'focus:border-blue-500'}
                  />
                  {isValidatingCep && (
                    <div className="absolute right-3 top-1/2 transform -translate-y-1/2">
                      <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-blue-600"></div>
                    </div>
                  )}
                </div>
                {errors.zipCode && (
                  <p className="text-sm text-red-600 mt-1 flex items-center">
                    <AlertCircle className="w-4 h-4 mr-1" />
                    {errors.zipCode}
                  </p>
                )}
                {addressInfo && (
                  <div className="mt-2 p-2 bg-green-50 rounded text-sm text-green-700 flex items-center">
                    <CheckCircle className="w-4 h-4 mr-1 text-green-600" />
                    <MapPin className="w-4 h-4 mr-1" />
                    {addressInfo.logradouro}, {addressInfo.bairro} - {addressInfo.localidade}/{addressInfo.uf}
                  </div>
                )}
              </div>

              {/* Password */}
              <div>
                <Label htmlFor="password">Senha</Label>
                <Input
                  id="password"
                  type="password"
                  value={form.password}
                  onChange={(e) => handleFieldChange('password', e.target.value)}
                  onBlur={() => setFieldTouched({ ...fieldTouched, password: true })}
                  placeholder="Mínimo 6 caracteres"
                  className={errors.password ? 'border-red-500 focus:border-red-500' : 'focus:border-blue-500'}
                />
                {errors.password && (
                  <p className="text-sm text-red-600 mt-1 flex items-center">
                    <AlertCircle className="w-4 h-4 mr-1" />
                    {errors.password}
                  </p>
                )}
                {form.password && form.password.length > 0 && (
                  <div className="mt-1 text-xs text-gray-500">
                    Força da senha: {form.password.length < 6 ? 'Fraca' : form.password.length < 8 ? 'Média' : 'Forte'}
                  </div>
                )}
              </div>

              {/* Confirm Password */}
              <div>
                <Label htmlFor="confirmPassword">Confirmar Senha</Label>
                <Input
                  id="confirmPassword"
                  type="password"
                  value={form.confirmPassword}
                  onChange={(e) => handleFieldChange('confirmPassword', e.target.value)}
                  onBlur={() => setFieldTouched({ ...fieldTouched, confirmPassword: true })}
                  placeholder="Digite a senha novamente"
                  className={errors.confirmPassword ? 'border-red-500 focus:border-red-500' : 'focus:border-blue-500'}
                />
                {errors.confirmPassword && (
                  <p className="text-sm text-red-600 mt-1 flex items-center">
                    <AlertCircle className="w-4 h-4 mr-1" />
                    {errors.confirmPassword}
                  </p>
                )}
                {form.confirmPassword && form.password === form.confirmPassword && (
                  <p className="text-sm text-green-600 mt-1 flex items-center">
                    <CheckCircle className="w-4 h-4 mr-1" />
                    Senhas coincidem
                  </p>
                )}
              </div>

              {/* Terms */}
              <div className="flex items-start space-x-2">
                <input
                  type="checkbox"
                  id="acceptTerms"
                  checked={form.acceptTerms}
                  onChange={(e) => handleFieldChange('acceptTerms', e.target.checked)}
                  className="mt-1 w-4 h-4 text-blue-600 border-gray-300 rounded focus:ring-blue-500"
                />
                <Label htmlFor="acceptTerms" className="text-sm">
                  Aceito os{' '}
                  <Link href="/terms" className="text-blue-600 hover:underline">
                    termos de uso
                  </Link>{' '}
                  e{' '}
                  <Link href="/privacy" className="text-blue-600 hover:underline">
                    política de privacidade
                  </Link>
                </Label>
              </div>
              {errors.acceptTerms && (
                <p className="text-sm text-red-600 flex items-center">
                  <AlertCircle className="w-4 h-4 mr-1" />
                  {errors.acceptTerms}
                </p>
              )}

              {/* Submit Button */}
              <Button
                type="submit"
                className="w-full bg-gradient-to-r from-blue-600 to-green-600 hover:from-blue-700 hover:to-green-700 transition-all duration-200 transform hover:scale-105"
                disabled={isLoading || Object.keys(errors).some(key => errors[key])}
              >
                {isLoading ? (
                  <div className="flex items-center">
                    <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
                    Criando conta...
                  </div>
                ) : (
                  <div className="flex items-center">
                    <Heart className="w-4 h-4 mr-2" />
                    Criar Conta Gratuita
                    <ArrowRight className="w-4 h-4 ml-2" />
                  </div>
                )}
              </Button>

              {/* Form Progress Indicator */}
              <div className="mt-2 text-center">
                <div className="text-xs text-gray-500">
                  {Object.keys(fieldTouched).length > 0 && (
                    <span>
                      Campos preenchidos: {Object.keys(fieldTouched).filter(key => fieldTouched[key] && !errors[key]).length}/6
                    </span>
                  )}
                </div>
              </div>
            </form>

            {/* Login Link */}
            <div className="mt-6 text-center">
              <p className="text-sm text-gray-600">
                Já tem uma conta?{' '}
                <Link href="/auth/login" className="text-blue-600 hover:underline font-medium">
                  Fazer login
                </Link>
              </p>
            </div>
          </CardContent>
        </Card>

        {/* Benefits */}
        <div className="mt-8 text-center">
          <p className="text-sm text-gray-600 mb-4">Ao se cadastrar, você terá acesso a:</p>
          <div className="grid grid-cols-1 gap-2 text-sm">
            <div className="flex items-center justify-center text-gray-700">
              <CheckCircle className="w-4 h-4 text-green-600 mr-2" />
              Portal de adoção com agentes IA
            </div>
            <div className="flex items-center justify-center text-gray-700">
              <CheckCircle className="w-4 h-4 text-green-600 mr-2" />
              Acompanhamento de processos
            </div>
            <div className="flex items-center justify-center text-gray-700">
              <CheckCircle className="w-4 h-4 text-green-600 mr-2" />
              Notificações sobre animais
            </div>
          </div>
        </div>
        </div>
      </div>
    </div>
  );
}
