'use client';

import React, { useState, useCallback } from 'react';
import { useDropzone } from 'react-dropzone';
import { Upload, FileText, Image, FileCheck, Receipt, Award, X, Eye, Download } from 'lucide-react';

interface DocumentUploadProps {
  animalId: string;
  onUploadComplete?: () => void;
}

interface UploadedDocument {
  id: string;
  fileName: string;
  fileUrl: string;
  mimeType: string;
  size: number;
  documentType: string;
  analysis?: {
    summary: string;
    keyFindings: string[];
    confidence: number;
  };
}

const documentTypes = [
  { value: 'photo', label: 'Foto', icon: Image, color: 'bg-blue-500' },
  { value: 'medical_report', label: 'Laudo Médico', icon: FileText, color: 'bg-green-500' },
  { value: 'prescription', label: 'Receita', icon: FileCheck, color: 'bg-purple-500' },
  { value: 'invoice', label: 'Nota Fiscal', icon: Receipt, color: 'bg-orange-500' },
  { value: 'certificate', label: 'Certificado', icon: Award, color: 'bg-red-500' }
];

export default function AnimalDocumentUpload({ animalId, onUploadComplete }: DocumentUploadProps) {
  const [selectedType, setSelectedType] = useState('photo');
  const [description, setDescription] = useState('');
  const [uploading, setUploading] = useState(false);
  const [uploadedFiles, setUploadedFiles] = useState<UploadedDocument[]>([]);
  const [error, setError] = useState<string | null>(null);

  const onDrop = useCallback(async (acceptedFiles: File[]) => {
    if (!animalId) {
      setError('ID do animal é obrigatório');
      return;
    }

    setUploading(true);
    setError(null);

    try {
      const formData = new FormData();
      formData.append('animalId', animalId);
      formData.append('documentType', selectedType);
      formData.append('autoAnalyze', 'true');
      formData.append('description', description);

      acceptedFiles.forEach(file => {
        formData.append('files', file);
      });

      const response = await fetch('/api/v1/documents/upload', {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${localStorage.getItem('token')}`
        },
        body: formData
      });

      if (!response.ok) {
        throw new Error('Erro ao fazer upload dos documentos');
      }

      const result = await response.json();
      
      if (result.success) {
        const newDocuments = result.data.map((item: any) => ({
          id: item.document.id,
          fileName: item.document.fileName || item.document.filename,
          fileUrl: item.document.fileUrl || item.document.url,
          mimeType: item.document.mimeType,
          size: item.document.size,
          documentType: selectedType,
          analysis: item.analysis?.insights
        }));

        setUploadedFiles(prev => [...prev, ...newDocuments]);
        setDescription('');
        
        if (onUploadComplete) {
          onUploadComplete();
        }
      } else {
        throw new Error(result.error || 'Erro desconhecido');
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Erro ao fazer upload');
    } finally {
      setUploading(false);
    }
  }, [animalId, selectedType, description, onUploadComplete]);

  const { getRootProps, getInputProps, isDragActive } = useDropzone({
    onDrop,
    accept: {
      'image/*': ['.jpeg', '.jpg', '.png', '.gif'],
      'application/pdf': ['.pdf'],
      'application/msword': ['.doc'],
      'application/vnd.openxmlformats-officedocument.wordprocessingml.document': ['.docx']
    },
    maxSize: 50 * 1024 * 1024, // 50MB
    multiple: true,
    disabled: uploading
  });

  const formatFileSize = (bytes: number) => {
    if (bytes === 0) return '0 Bytes';
    const k = 1024;
    const sizes = ['Bytes', 'KB', 'MB', 'GB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
  };

  const getDocumentTypeInfo = (type: string) => {
    return documentTypes.find(dt => dt.value === type) || documentTypes[0];
  };

  const removeDocument = (id: string) => {
    setUploadedFiles(prev => prev.filter(doc => doc.id !== id));
  };

  return (
    <div className="space-y-6">
      {/* Document Type Selection */}
      <div>
        <label className="block text-sm font-medium text-gray-700 mb-3">
          Tipo de Documento
        </label>
        <div className="grid grid-cols-2 md:grid-cols-5 gap-3">
          {documentTypes.map((type) => {
            const Icon = type.icon;
            return (
              <button
                key={type.value}
                onClick={() => setSelectedType(type.value)}
                className={`p-3 rounded-lg border-2 transition-all ${
                  selectedType === type.value
                    ? 'border-blue-500 bg-blue-50'
                    : 'border-gray-200 hover:border-gray-300'
                }`}
              >
                <div className={`w-8 h-8 rounded-full ${type.color} flex items-center justify-center mx-auto mb-2`}>
                  <Icon className="w-4 h-4 text-white" />
                </div>
                <span className="text-xs font-medium text-gray-700">{type.label}</span>
              </button>
            );
          })}
        </div>
      </div>

      {/* Description */}
      <div>
        <label className="block text-sm font-medium text-gray-700 mb-2">
          Descrição (opcional)
        </label>
        <textarea
          value={description}
          onChange={(e) => setDescription(e.target.value)}
          placeholder="Adicione uma descrição para os documentos..."
          className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
          rows={3}
        />
      </div>

      {/* Upload Area */}
      <div
        {...getRootProps()}
        className={`border-2 border-dashed rounded-lg p-8 text-center transition-colors ${
          isDragActive
            ? 'border-blue-500 bg-blue-50'
            : 'border-gray-300 hover:border-gray-400'
        } ${uploading ? 'opacity-50 cursor-not-allowed' : 'cursor-pointer'}`}
      >
        <input {...getInputProps()} />
        <Upload className="w-12 h-12 text-gray-400 mx-auto mb-4" />
        {uploading ? (
          <div>
            <p className="text-lg font-medium text-gray-600">Fazendo upload...</p>
            <div className="mt-2 w-full bg-gray-200 rounded-full h-2">
              <div className="bg-blue-600 h-2 rounded-full animate-pulse" style={{ width: '60%' }}></div>
            </div>
          </div>
        ) : isDragActive ? (
          <p className="text-lg font-medium text-blue-600">Solte os arquivos aqui...</p>
        ) : (
          <div>
            <p className="text-lg font-medium text-gray-600">
              Arraste arquivos aqui ou clique para selecionar
            </p>
            <p className="text-sm text-gray-500 mt-2">
              Suporta: Imagens (JPG, PNG, GIF), PDF, Word (DOC, DOCX)
            </p>
            <p className="text-sm text-gray-500">Tamanho máximo: 50MB por arquivo</p>
          </div>
        )}
      </div>

      {/* Error Message */}
      {error && (
        <div className="bg-red-50 border border-red-200 rounded-md p-4">
          <p className="text-red-800">{error}</p>
        </div>
      )}

      {/* Uploaded Files */}
      {uploadedFiles.length > 0 && (
        <div>
          <h3 className="text-lg font-medium text-gray-900 mb-4">
            Documentos Enviados ({uploadedFiles.length})
          </h3>
          <div className="space-y-3">
            {uploadedFiles.map((doc) => {
              const typeInfo = getDocumentTypeInfo(doc.documentType);
              const Icon = typeInfo.icon;
              
              return (
                <div key={doc.id} className="bg-white border border-gray-200 rounded-lg p-4">
                  <div className="flex items-start justify-between">
                    <div className="flex items-start space-x-3">
                      <div className={`w-10 h-10 rounded-lg ${typeInfo.color} flex items-center justify-center`}>
                        <Icon className="w-5 h-5 text-white" />
                      </div>
                      <div className="flex-1">
                        <h4 className="font-medium text-gray-900">{doc.fileName}</h4>
                        <p className="text-sm text-gray-500">
                          {typeInfo.label} • {formatFileSize(doc.size)}
                        </p>
                        {doc.analysis && (
                          <div className="mt-2">
                            <p className="text-sm text-gray-700">{doc.analysis.summary}</p>
                            {doc.analysis.keyFindings.length > 0 && (
                              <div className="mt-1">
                                <p className="text-xs text-gray-500">Principais achados:</p>
                                <ul className="text-xs text-gray-600 list-disc list-inside">
                                  {doc.analysis.keyFindings.slice(0, 3).map((finding, idx) => (
                                    <li key={idx}>{finding}</li>
                                  ))}
                                </ul>
                              </div>
                            )}
                            <div className="mt-1">
                              <span className="text-xs text-gray-500">
                                Confiança: {Math.round(doc.analysis.confidence * 100)}%
                              </span>
                            </div>
                          </div>
                        )}
                      </div>
                    </div>
                    <div className="flex items-center space-x-2">
                      <button
                        onClick={() => window.open(doc.fileUrl, '_blank')}
                        className="p-2 text-gray-400 hover:text-blue-600 transition-colors"
                        title="Visualizar"
                      >
                        <Eye className="w-4 h-4" />
                      </button>
                      <button
                        onClick={() => removeDocument(doc.id)}
                        className="p-2 text-gray-400 hover:text-red-600 transition-colors"
                        title="Remover"
                      >
                        <X className="w-4 h-4" />
                      </button>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      )}
    </div>
  );
}
