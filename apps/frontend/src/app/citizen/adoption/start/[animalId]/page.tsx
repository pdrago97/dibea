'use client';

import { useState, useEffect } from 'react';
import { useRouter, useParams } from 'next/navigation';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Textarea } from '@/components/ui/textarea';
import { 
  ArrowLeft,
  Heart,
  PawPrint,
  MapPin,
  Calendar,
  Info,
  CheckCircle,
  AlertTriangle
} from 'lucide-react';

interface Animal {
  id: string;
  name: string;
  species: string;
  breed?: string;
  age?: number;
  sex: string;
  size?: string;
  color?: string;
  description?: string;
  status: string;
  weight?: number;
}

export default function StartAdoptionPage() {
  const [animal, setAnimal] = useState<Animal | null>(null);
  const [notes, setNotes] = useState('');
  const [isLoading, setIsLoading] = useState(true);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState('');
  const router = useRouter();
  const params = useParams();
  const animalId = params.animalId as string;

  useEffect(() => {
    loadAnimal();
  }, [animalId]);

  const loadAnimal = async () => {
    try {
      setIsLoading(true);
      const token = localStorage.getItem('token');
      
      const response = await fetch(`/api/v1/animals/${animalId}`, {
        headers: {
          'Authorization': `Bearer ${token}`
        }
      });

      if (response.ok) {
        const data = await response.json();
        setAnimal(data.data);
      } else {
        setError('Animal não encontrado');
      }
    } catch (error) {
      console.error('Error loading animal:', error);
      setError('Erro ao carregar informações do animal');
    } finally {
      setIsLoading(false);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!animal) return;

    try {
      setIsSubmitting(true);
      setError('');
      
      const token = localStorage.getItem('token');
      
      const response = await fetch('/api/v1/adoptions', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify({
          animalId: animal.id,
          notes: notes.trim() || undefined
        })
      });

      const data = await response.json();

      if (response.ok) {
        // Redirect to adoption details or success page
        router.push(`/citizen/adoptions/${data.data.id}`);
      } else {
        setError(data.message || 'Erro ao criar solicitação de adoção');
      }
    } catch (error) {
      console.error('Error creating adoption:', error);
      setError('Erro interno. Tente novamente.');
    } finally {
      setIsSubmitting(false);
    }
  };

  if (isLoading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-blue-600"></div>
      </div>
    );
  }

  if (error && !animal) {
    return (
      <div className="container mx-auto px-4 py-8">
        <div className="text-center">
          <AlertTriangle className="w-16 h-16 text-red-500 mx-auto mb-4" />
          <h1 className="text-2xl font-bold text-gray-900 mb-4">{error}</h1>
          <Button onClick={() => router.push('/animals')}>
            <ArrowLeft className="w-4 h-4 mr-2" />
            Voltar para Animais
          </Button>
        </div>
      </div>
    );
  }

  if (!animal) return null;

  return (
    <div className="container mx-auto px-4 py-8">
      {/* Header */}
      <div className="flex items-center justify-between mb-6">
        <Button
          variant="outline"
          onClick={() => router.push(`/animals/${animalId}`)}
        >
          <ArrowLeft className="w-4 h-4 mr-2" />
          Voltar
        </Button>
        
        <Badge 
          className={
            animal.status === 'DISPONIVEL' 
              ? 'bg-green-100 text-green-800' 
              : 'bg-gray-100 text-gray-800'
          }
        >
          {animal.status}
        </Badge>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        {/* Animal Information */}
        <div>
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center space-x-2">
                <PawPrint className="w-6 h-6 text-blue-600" />
                <span>Informações do Animal</span>
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div>
                <h3 className="text-2xl font-bold text-gray-900 mb-2">{animal.name}</h3>
                <div className="grid grid-cols-2 gap-4 text-sm">
                  <div>
                    <span className="text-gray-600">Espécie:</span>
                    <span className="ml-2 font-medium">{animal.species}</span>
                  </div>
                  {animal.breed && (
                    <div>
                      <span className="text-gray-600">Raça:</span>
                      <span className="ml-2 font-medium">{animal.breed}</span>
                    </div>
                  )}
                  <div>
                    <span className="text-gray-600">Sexo:</span>
                    <span className="ml-2 font-medium">{animal.sex === 'MACHO' ? 'Macho' : 'Fêmea'}</span>
                  </div>
                  {animal.age && (
                    <div>
                      <span className="text-gray-600">Idade:</span>
                      <span className="ml-2 font-medium">{animal.age} anos</span>
                    </div>
                  )}
                  {animal.size && (
                    <div>
                      <span className="text-gray-600">Porte:</span>
                      <span className="ml-2 font-medium">{animal.size}</span>
                    </div>
                  )}
                  {animal.color && (
                    <div>
                      <span className="text-gray-600">Cor:</span>
                      <span className="ml-2 font-medium">{animal.color}</span>
                    </div>
                  )}
                  {animal.weight && (
                    <div>
                      <span className="text-gray-600">Peso:</span>
                      <span className="ml-2 font-medium">{animal.weight} kg</span>
                    </div>
                  )}
                </div>
              </div>

              {animal.description && (
                <div>
                  <h4 className="font-medium text-gray-900 mb-2">Descrição:</h4>
                  <p className="text-gray-700 text-sm leading-relaxed">
                    {animal.description}
                  </p>
                </div>
              )}
            </CardContent>
          </Card>
        </div>

        {/* Adoption Form */}
        <div>
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center space-x-2">
                <Heart className="w-6 h-6 text-red-500" />
                <span>Solicitação de Adoção</span>
              </CardTitle>
            </CardHeader>
            <CardContent>
              <form onSubmit={handleSubmit} className="space-y-6">
                {/* Information Alert */}
                <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
                  <div className="flex items-start space-x-3">
                    <Info className="w-5 h-5 text-blue-600 mt-0.5" />
                    <div className="text-sm text-blue-800">
                      <p className="font-medium mb-1">Processo de Adoção</p>
                      <p>
                        Sua solicitação será analisada pela nossa equipe. 
                        Você receberá notificações sobre o andamento do processo.
                      </p>
                    </div>
                  </div>
                </div>

                {/* Notes */}
                <div>
                  <label htmlFor="notes" className="block text-sm font-medium text-gray-700 mb-2">
                    Observações (opcional)
                  </label>
                  <Textarea
                    id="notes"
                    value={notes}
                    onChange={(e) => setNotes(e.target.value)}
                    placeholder="Conte-nos por que você gostaria de adotar este animal, sua experiência com pets, etc."
                    rows={4}
                    className="w-full"
                  />
                  <p className="text-xs text-gray-500 mt-1">
                    Essas informações ajudam nossa equipe a entender melhor sua motivação.
                  </p>
                </div>

                {/* Error Message */}
                {error && (
                  <div className="bg-red-50 border border-red-200 rounded-lg p-4">
                    <div className="flex items-center space-x-2">
                      <AlertTriangle className="w-5 h-5 text-red-600" />
                      <span className="text-sm text-red-800">{error}</span>
                    </div>
                  </div>
                )}

                {/* Submit Button */}
                <Button
                  type="submit"
                  disabled={isSubmitting || animal.status !== 'DISPONIVEL'}
                  className="w-full"
                  size="lg"
                >
                  {isSubmitting ? (
                    <>
                      <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
                      Enviando Solicitação...
                    </>
                  ) : (
                    <>
                      <Heart className="w-5 h-5 mr-2" />
                      Solicitar Adoção
                    </>
                  )}
                </Button>

                {animal.status !== 'DISPONIVEL' && (
                  <p className="text-sm text-gray-600 text-center">
                    Este animal não está mais disponível para adoção.
                  </p>
                )}
              </form>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}
