"use client";

import React, { useState, useCallback } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Upload, X, Camera, CheckCircle, AlertCircle } from "lucide-react";
import { supabase } from "@/lib/supabase";

interface UploadProps {
  animalId: string;
  onUploadComplete?: (fileUrls: string[]) => void;
  maxFiles?: number;
  acceptedTypes?: string[];
}

export function AnimalPhotoUpload({
  animalId,
  onUploadComplete,
  maxFiles = 5,
  acceptedTypes = ["image/jpeg", "image/png", "image/webp"],
}: UploadProps) {
  const [files, setFiles] = useState<File[]>([]);
  const [uploading, setUploading] = useState(false);
  const [uploadedUrls, setUploadedUrls] = useState<string[]>([]);
  const [error, setError] = useState<string>("");

  const handleFileSelect = useCallback(
    (event: React.ChangeEvent<HTMLInputElement>) => {
      const selectedFiles = Array.from(event.target.files || []);

      // Validate file types
      const invalidFiles = selectedFiles.filter(
        (file) => !acceptedTypes.includes(file.type),
      );
      if (invalidFiles.length > 0) {
        setError(
          `Tipo de arquivo não suportado: ${invalidFiles.map((f) => f.name).join(", ")}`,
        );
        return;
      }

      // Validate file size (max 5MB)
      const oversizedFiles = selectedFiles.filter(
        (file) => file.size > 5 * 1024 * 1024,
      );
      if (oversizedFiles.length > 0) {
        setError(
          `Arquivos muito grandes (máx. 5MB): ${oversizedFiles.map((f) => f.name).join(", ")}`,
        );
        return;
      }

      // Check total files limit
      if (files.length + selectedFiles.length > maxFiles) {
        setError(`Máximo de ${maxFiles} fotos permitidas`);
        return;
      }

      setFiles((prev) => [...prev, ...selectedFiles]);
      setError("");
    },
    [files.length, maxFiles, acceptedTypes],
  );

  const removeFile = (index: number) => {
    setFiles((prev) => prev.filter((_, i) => i !== index));
  };

  const uploadFiles = async () => {
    if (files.length === 0) return;

    setUploading(true);
    setError("");

    try {
      const uploadedUrls: string[] = [];

      for (const file of files) {
        // Create unique filename
        const timestamp = Date.now();
        const fileExtension = file.name.split(".").pop();
        const fileName = `${animalId}_${timestamp}.${fileExtension}`;

        // Upload to Supabase Storage
        const { data, error } = await supabase.storage
          .from("animals")
          .upload(`photos/${animalId}/${fileName}`, file);

        if (error) {
          throw new Error(`Erro ao fazer upload: ${error.message}`);
        }

        // Get public URL
        const { data: urlData } = supabase.storage
          .from("animals")
          .getPublicUrl(`photos/${animalId}/${fileName}`);

        if (urlData?.publicUrl) {
          uploadedUrls.push(urlData.publicUrl);

          // Add photo to animal record
          await fetch("/api/animals/add-photo", {
            method: "POST",
            headers: {
              "Content-Type": "application/json",
            },
            body: JSON.stringify({
              animalId,
              photoUrl: urlData.publicUrl,
            }),
          });
        } else {
          throw new Error("Não foi possível obter URL pública");
        }
      }

      setUploadedUrls(uploadedUrls);
      setFiles([]);
      onUploadComplete?.(uploadedUrls);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Erro desconhecido");
    } finally {
      setUploading(false);
    }
  };

  const getFilePreview = (file: File) => {
    return URL.createObjectURL(file);
  };

  return (
    <Card>
      <CardContent className="p-6">
        <div className="space-y-4">
          {/* Header */}
          <div className="flex items-center justify-between">
            <div>
              <h3 className="text-lg font-semibold">Fotos do Animal</h3>
              <p className="text-sm text-gray-600">
                Adicione até {maxFiles} fotos (JPEG, PNG, WebP, máx. 5MB cada)
              </p>
            </div>
            <Badge variant="outline">
              {files.length + uploadedUrls.length}/{maxFiles}
            </Badge>
          </div>

          {/* Upload Area */}
          <div className="border-2 border-dashed border-gray-300 rounded-lg p-6 text-center hover:border-blue-400 transition-colors">
            <input
              type="file"
              multiple
              accept={acceptedTypes.join(",")}
              onChange={handleFileSelect}
              className="hidden"
              id="animal-photo-upload"
              disabled={
                uploading || files.length + uploadedUrls.length >= maxFiles
              }
            />
            <label htmlFor="animal-photo-upload" className="cursor-pointer">
              <Camera className="w-12 h-12 text-gray-400 mx-auto mb-4" />
              <p className="text-sm text-gray-600 mb-2">
                Clique para selecionar fotos ou arraste e solte
              </p>
              <Button
                type="button"
                variant="outline"
                disabled={
                  uploading || files.length + uploadedUrls.length >= maxFiles
                }
              >
                <Upload className="w-4 h-4 mr-2" />
                Selecionar Fotos
              </Button>
            </label>
          </div>

          {/* Error Message */}
          {error && (
            <div className="flex items-center space-x-2 p-3 bg-red-50 border border-red-200 rounded-lg">
              <AlertCircle className="w-4 h-4 text-red-600" />
              <p className="text-sm text-red-600">{error}</p>
            </div>
          )}

          {/* Selected Files Preview */}
          {files.length > 0 && (
            <div>
              <h4 className="text-sm font-medium text-gray-700 mb-3">
                Fotos selecionadas ({files.length})
              </h4>
              <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-5 gap-3">
                {files.map((file, index) => (
                  <div key={index} className="relative group">
                    <img
                      src={getFilePreview(file)}
                      alt={file.name}
                      className="w-full h-24 object-cover rounded-lg"
                    />
                    <button
                      onClick={() => removeFile(index)}
                      className="absolute -top-2 -right-2 bg-red-500 text-white rounded-full p-1 opacity-0 group-hover:opacity-100 transition-opacity"
                    >
                      <X className="w-3 h-3" />
                    </button>
                    <div className="text-xs text-gray-500 truncate mt-1">
                      {file.name}
                    </div>
                  </div>
                ))}
              </div>

              <div className="flex items-center space-x-3 mt-4">
                <Button
                  onClick={uploadFiles}
                  disabled={uploading}
                  className="bg-blue-600 hover:bg-blue-700"
                >
                  {uploading ? "Enviando..." : "Enviar Fotos"}
                </Button>
                <Button
                  variant="outline"
                  onClick={() => setFiles([])}
                  disabled={uploading}
                >
                  Cancelar
                </Button>
              </div>
            </div>
          )}

          {/* Uploaded Files */}
          {uploadedUrls.length > 0 && (
            <div>
              <h4 className="text-sm font-medium text-gray-700 mb-3">
                Fotos enviadas ({uploadedUrls.length})
              </h4>
              <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-5 gap-3">
                {uploadedUrls.map((url, index) => (
                  <div key={index} className="relative">
                    <img
                      src={url}
                      alt={`Foto ${index + 1}`}
                      className="w-full h-24 object-cover rounded-lg"
                    />
                    <div className="absolute top-2 right-2">
                      <CheckCircle className="w-4 h-4 text-green-500" />
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Empty State */}
          {files.length === 0 && uploadedUrls.length === 0 && (
            <div className="text-center py-8">
              <Camera className="w-16 h-16 text-gray-300 mx-auto mb-4" />
              <p className="text-gray-500">Nenhuma foto adicionada ainda</p>
            </div>
          )}
        </div>
      </CardContent>
    </Card>
  );
}
