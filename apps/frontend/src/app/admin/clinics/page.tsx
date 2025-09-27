'use client';

import { useState, useEffect } from 'react';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { CheckCircle, XCircle, Clock, MapPin, Phone, Mail } from 'lucide-react';

interface Clinic {
  id: string;
  name: string;
  cnpj: string;
  email: string;
  phone: string;
  address: string;
  city: string;
  state: string;
  zipCode: string;
  status: 'PENDING' | 'APPROVED' | 'REJECTED';
  veterinarian: {
    name: string;
    crmv: string;
    email: string;
  };
  services: string[];
  documents: {
    id: string;
    type: string;
    url: string;
    verified: boolean;
  }[];
  requestDate: string;
  reviewDate?: string;
  reviewNotes?: string;
}

export default function ClinicsApproval() {
  const [clinics, setClinics] = useState<Clinic[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [selectedStatus, setSelectedStatus] = useState('PENDING');
  const [reviewingClinic, setReviewingClinic] = useState<Clinic | null>(null);
  const [reviewNotes, setReviewNotes] = useState('');

  useEffect(() => {
    fetchClinics();
  }, []);

  const fetchClinics = async () => {
    try {
      const token = localStorage.getItem('token');
      const response = await fetch('/api/v1/admin/clinics', {
        headers: {
          'Authorization': `Bearer ${token}`
        }
      });

      if (response.ok) {
        const data = await response.json();
        setClinics(data.clinics || []);
      } else {
        setError('Erro ao carregar clínicas');
      }
    } catch (err) {
      setError('Erro de conexão');
    } finally {
      setLoading(false);
    }
  };

  const approveClinic = async (clinicId: string, notes: string) => {
    try {
      const token = localStorage.getItem('token');
      const response = await fetch(`/api/v1/admin/clinics/${clinicId}/approve`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify({ notes })
      });

      if (response.ok) {
        await fetchClinics();
        setReviewingClinic(null);
        setReviewNotes('');
      } else {
        setError('Erro ao aprovar clínica');
      }
    } catch (err) {
      setError('Erro de conexão');
    }
  };

  const rejectClinic = async (clinicId: string, notes: string) => {
    try {
      const token = localStorage.getItem('token');
      const response = await fetch(`/api/v1/admin/clinics/${clinicId}/reject`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify({ notes })
      });

      if (response.ok) {
        await fetchClinics();
        setReviewingClinic(null);
        setReviewNotes('');
      } else {
        setError('Erro ao rejeitar clínica');
      }
    } catch (err) {
      setError('Erro de conexão');
    }
  };

  const filteredClinics = clinics.filter(clinic => 
    selectedStatus === 'ALL' || clinic.status === selectedStatus
  );

  const getStatusBadge = (status: string) => {
    switch (status) {
      case 'PENDING':
        return <Badge className="bg-yellow-100 text-yellow-800"><Clock className="w-3 h-3 mr-1" />Pendente</Badge>;
      case 'APPROVED':
        return <Badge className="bg-green-100 text-green-800"><CheckCircle className="w-3 h-3 mr-1" />Aprovada</Badge>;
      case 'REJECTED':
        return <Badge className="bg-red-100 text-red-800"><XCircle className="w-3 h-3 mr-1" />Rejeitada</Badge>;
      default:
        return <Badge>{status}</Badge>;
    }
  };

  const mockClinics: Clinic[] = [
    {
      id: '1',
      name: 'Clínica Veterinária ABC',
      cnpj: '12.345.678/0001-90',
      email: 'contato@clinicaabc.com.br',
      phone: '(11) 3456-7890',
      address: 'Rua das Flores, 123',
      city: 'São Paulo',
      state: 'SP',
      zipCode: '01234-567',
      status: 'PENDING',
      veterinarian: {
        name: 'Dr. João Silva',
        crmv: 'SP-12345',
        email: 'joao@clinicaabc.com.br'
      },
      services: ['Consultas', 'Cirurgias', 'Vacinação', 'Exames'],
      documents: [
        { id: '1', type: 'CRMV', url: '/docs/crmv.pdf', verified: true },
        { id: '2', type: 'CNPJ', url: '/docs/cnpj.pdf', verified: true },
        { id: '3', type: 'Alvará', url: '/docs/alvara.pdf', verified: false }
      ],
      requestDate: '2024-01-15T10:00:00Z'
    },
    {
      id: '2',
      name: 'Pet Care Veterinária',
      cnpj: '98.765.432/0001-10',
      email: 'contato@petcare.com.br',
      phone: '(11) 9876-5432',
      address: 'Av. Principal, 456',
      city: 'São Paulo',
      state: 'SP',
      zipCode: '09876-543',
      status: 'APPROVED',
      veterinarian: {
        name: 'Dra. Maria Santos',
        crmv: 'SP-67890',
        email: 'maria@petcare.com.br'
      },
      services: ['Consultas', 'Emergência 24h', 'Internação'],
      documents: [
        { id: '4', type: 'CRMV', url: '/docs/crmv2.pdf', verified: true },
        { id: '5', type: 'CNPJ', url: '/docs/cnpj2.pdf', verified: true }
      ],
      requestDate: '2024-01-10T14:30:00Z',
      reviewDate: '2024-01-12T09:15:00Z',
      reviewNotes: 'Documentação completa e em ordem. Clínica aprovada.'
    }
  ];

  if (loading) {
    return (
      <div className="p-6">
        <div className="animate-pulse">
          <div className="h-8 bg-gray-200 rounded w-1/4 mb-6"></div>
          <div className="space-y-4">
            {[1, 2, 3].map(i => (
              <div key={i} className="h-32 bg-gray-200 rounded"></div>
            ))}
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="p-6 space-y-6">
      {/* Header */}
      <div>
        <h1 className="text-3xl font-bold text-gray-900">Aprovar Clínicas</h1>
        <p className="text-gray-600">Revisar e aprovar solicitações de cadastro de clínicas veterinárias</p>
      </div>

      {error && (
        <Alert className="border-red-200 bg-red-50">
          <AlertDescription className="text-red-800">{error}</AlertDescription>
        </Alert>
      )}

      {/* Status Filter */}
      <Card className="p-4">
        <div className="flex gap-4">
          <Button
            variant={selectedStatus === 'PENDING' ? 'default' : 'outline'}
            onClick={() => setSelectedStatus('PENDING')}
            className="flex items-center gap-2"
          >
            <Clock className="w-4 h-4" />
            Pendentes ({mockClinics.filter(c => c.status === 'PENDING').length})
          </Button>
          <Button
            variant={selectedStatus === 'APPROVED' ? 'default' : 'outline'}
            onClick={() => setSelectedStatus('APPROVED')}
            className="flex items-center gap-2"
          >
            <CheckCircle className="w-4 h-4" />
            Aprovadas ({mockClinics.filter(c => c.status === 'APPROVED').length})
          </Button>
          <Button
            variant={selectedStatus === 'REJECTED' ? 'default' : 'outline'}
            onClick={() => setSelectedStatus('REJECTED')}
            className="flex items-center gap-2"
          >
            <XCircle className="w-4 h-4" />
            Rejeitadas ({mockClinics.filter(c => c.status === 'REJECTED').length})
          </Button>
          <Button
            variant={selectedStatus === 'ALL' ? 'default' : 'outline'}
            onClick={() => setSelectedStatus('ALL')}
          >
            Todas ({mockClinics.length})
          </Button>
        </div>
      </Card>

      {/* Clinics List */}
      <div className="space-y-4">
        {mockClinics.filter(clinic => 
          selectedStatus === 'ALL' || clinic.status === selectedStatus
        ).map(clinic => (
          <Card key={clinic.id} className="p-6">
            <div className="flex justify-between items-start mb-4">
              <div>
                <div className="flex items-center gap-3 mb-2">
                  <h3 className="text-xl font-semibold">{clinic.name}</h3>
                  {getStatusBadge(clinic.status)}
                </div>
                <p className="text-gray-600">CNPJ: {clinic.cnpj}</p>
              </div>
              <div className="text-right text-sm text-gray-500">
                <p>Solicitado em: {new Date(clinic.requestDate).toLocaleDateString('pt-BR')}</p>
                {clinic.reviewDate && (
                  <p>Revisado em: {new Date(clinic.reviewDate).toLocaleDateString('pt-BR')}</p>
                )}
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-4">
              {/* Contact Info */}
              <div>
                <h4 className="font-semibold mb-2">Informações de Contato</h4>
                <div className="space-y-1 text-sm">
                  <div className="flex items-center gap-2">
                    <MapPin className="w-4 h-4 text-gray-400" />
                    <span>{clinic.address}, {clinic.city} - {clinic.state}</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <Phone className="w-4 h-4 text-gray-400" />
                    <span>{clinic.phone}</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <Mail className="w-4 h-4 text-gray-400" />
                    <span>{clinic.email}</span>
                  </div>
                </div>
              </div>

              {/* Veterinarian Info */}
              <div>
                <h4 className="font-semibold mb-2">Veterinário Responsável</h4>
                <div className="space-y-1 text-sm">
                  <p><strong>Nome:</strong> {clinic.veterinarian.name}</p>
                  <p><strong>CRMV:</strong> {clinic.veterinarian.crmv}</p>
                  <p><strong>Email:</strong> {clinic.veterinarian.email}</p>
                </div>
              </div>
            </div>

            {/* Services */}
            <div className="mb-4">
              <h4 className="font-semibold mb-2">Serviços Oferecidos</h4>
              <div className="flex flex-wrap gap-2">
                {clinic.services.map(service => (
                  <Badge key={service} variant="outline">{service}</Badge>
                ))}
              </div>
            </div>

            {/* Documents */}
            <div className="mb-4">
              <h4 className="font-semibold mb-2">Documentos</h4>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-2">
                {clinic.documents.map(doc => (
                  <div key={doc.id} className="flex items-center justify-between p-2 border rounded">
                    <span className="text-sm">{doc.type}</span>
                    <div className="flex items-center gap-2">
                      {doc.verified ? (
                        <CheckCircle className="w-4 h-4 text-green-600" />
                      ) : (
                        <XCircle className="w-4 h-4 text-red-600" />
                      )}
                      <Button size="sm" variant="outline">Ver</Button>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* Review Notes */}
            {clinic.reviewNotes && (
              <div className="mb-4 p-3 bg-gray-50 rounded">
                <h4 className="font-semibold mb-1">Observações da Revisão</h4>
                <p className="text-sm text-gray-700">{clinic.reviewNotes}</p>
              </div>
            )}

            {/* Actions */}
            {clinic.status === 'PENDING' && (
              <div className="flex gap-2">
                <Button
                  onClick={() => setReviewingClinic(clinic)}
                  className="bg-green-600 hover:bg-green-700"
                >
                  Revisar
                </Button>
              </div>
            )}
          </Card>
        ))}
      </div>

      {/* Review Modal */}
      {reviewingClinic && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
          <Card className="w-full max-w-md p-6">
            <h3 className="text-lg font-semibold mb-4">
              Revisar: {reviewingClinic.name}
            </h3>
            <div className="mb-4">
              <label className="block text-sm font-medium mb-2">
                Observações da revisão
              </label>
              <textarea
                className="w-full p-2 border rounded-md"
                rows={4}
                value={reviewNotes}
                onChange={(e) => setReviewNotes(e.target.value)}
                placeholder="Adicione observações sobre a revisão..."
              />
            </div>
            <div className="flex gap-2">
              <Button
                onClick={() => approveClinic(reviewingClinic.id, reviewNotes)}
                className="bg-green-600 hover:bg-green-700"
              >
                Aprovar
              </Button>
              <Button
                onClick={() => rejectClinic(reviewingClinic.id, reviewNotes)}
                className="bg-red-600 hover:bg-red-700"
              >
                Rejeitar
              </Button>
              <Button
                variant="outline"
                onClick={() => {
                  setReviewingClinic(null);
                  setReviewNotes('');
                }}
              >
                Cancelar
              </Button>
            </div>
          </Card>
        </div>
      )}
    </div>
  );
}
