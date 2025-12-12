'use client';

import { useState, useRef } from 'react';
import { Button, Progress, Card, CardBody } from '@heroui/react';
import { FiUpload, FiX, FiCheck } from 'react-icons/fi';

interface FileUploaderProps {
  folder?: string;
  onUploadComplete: (fileUrl: string, fileName: string, duration?: number) => void;
  acceptedFileTypes?: string;
  maxSizeMB?: number;
  className?: string;
}

interface UploadedFileInfo {
  url: string;
  fileName: string;
  originalName: string;
  size: number;
  type: string;
  duration?: number;
}

export default function FileUploader({
  folder = 'resources',
  onUploadComplete,
  acceptedFileTypes = '*',
  maxSizeMB = 2048,
  className = '',
}: FileUploaderProps) {
  const [uploading, setUploading] = useState(false);
  const [progress, setProgress] = useState(0);
  const [error, setError] = useState<string | null>(null);
  const [uploadedFile, setUploadedFile] = useState<UploadedFileInfo | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const extractVideoDuration = (file: File): Promise<number | null> => {
    return new Promise((resolve) => {
      // Check if it's a video file
      if (!file.type.startsWith('video/')) {
        resolve(null);
        return;
      }

      const video = document.createElement('video');
      video.preload = 'metadata';

      video.onloadedmetadata = () => {
        window.URL.revokeObjectURL(video.src);
        const duration = Math.round(video.duration);
        resolve(duration);
      };

      video.onerror = () => {
        window.URL.revokeObjectURL(video.src);
        resolve(null);
      };

      video.src = URL.createObjectURL(file);
    });
  };

  const handleFileSelect = async (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) return;

    // Validar tamaño del archivo
    const maxSizeBytes = maxSizeMB * 1024 * 1024;
    if (file.size > maxSizeBytes) {
      setError(`El archivo excede el tamaño máximo de ${maxSizeMB}MB`);
      return;
    }

    setError(null);
    setUploading(true);
    setProgress(0);

    try {
      // Extract video duration from file before uploading
      const duration = await extractVideoDuration(file);

      const formData = new FormData();
      formData.append('file', file);
      formData.append('folder', folder);

      // Simular progreso mientras se sube
      const progressInterval = setInterval(() => {
        setProgress((prev) => {
          if (prev >= 90) {
            clearInterval(progressInterval);
            return 90;
          }
          return prev + 10;
        });
      }, 200);

      const apiUrl = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3001';
      const response = await fetch(`${apiUrl}/s3`, {
        method: 'POST',
        body: formData,
      });

      clearInterval(progressInterval);

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || 'Error al subir el archivo');
      }

      const data = await response.json();
      setProgress(100);
      setUploadedFile(data);
      // Use the duration extracted from the frontend
      onUploadComplete(data.url, data.fileName, duration || undefined);

      // Resetear después de 2 segundos
      setTimeout(() => {
        setProgress(0);
        setUploading(false);
      }, 2000);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Error desconocido');
      setUploading(false);
      setProgress(0);
    }
  };

  const handleButtonClick = () => {
    fileInputRef.current?.click();
  };

  const handleClearError = () => {
    setError(null);
    if (fileInputRef.current) {
      fileInputRef.current.value = '';
    }
  };

  return (
    <div className={className}>
      <input
        ref={fileInputRef}
        type="file"
        onChange={handleFileSelect}
        accept={acceptedFileTypes}
        disabled={uploading}
        className="hidden"
      />

      <Button
        color="primary"
        onClick={handleButtonClick}
        disabled={uploading}
        startContent={uploading ? null : <FiUpload />}
      >
        {uploading ? 'Subiendo...' : 'Seleccionar archivo'}
      </Button>

      {uploading && (
        <Card className="mt-4">
          <CardBody>
            <div className="space-y-2">
              <div className="flex justify-between items-center">
                <span className="text-sm text-gray-600">
                  Subiendo archivo...
                </span>
                <span className="text-sm font-semibold">{progress}%</span>
              </div>
              <Progress
                value={progress}
                color={progress === 100 ? 'success' : 'primary'}
                className="w-full"
              />
            </div>
          </CardBody>
        </Card>
      )}

      {error && (
        <Card className="mt-4 border-danger-500">
          <CardBody>
            <div className="flex justify-between items-center">
              <div className="flex items-center gap-2 text-danger-500">
                <FiX className="w-5 h-5" />
                <span className="text-sm">{error}</span>
              </div>
              <Button
                size="sm"
                variant="light"
                onClick={handleClearError}
                isIconOnly
              >
                <FiX />
              </Button>
            </div>
          </CardBody>
        </Card>
      )}

      {uploadedFile && !uploading && !error && (
        <Card className="mt-4 border-success-500">
          <CardBody>
            <div className="flex items-center gap-2 text-success-500">
              <FiCheck className="w-5 h-5" />
              <div className="flex-1">
                <p className="text-sm font-semibold">Archivo subido exitosamente</p>
                <p className="text-xs text-gray-500">{uploadedFile.originalName}</p>
              </div>
            </div>
          </CardBody>
        </Card>
      )}
    </div>
  );
}
