'use client';

import { useState, useRef } from 'react';
import { Button, Progress, Card, CardBody } from '@heroui/react';
import { FiUpload, FiX, FiCheck } from 'react-icons/fi';

interface FileUploaderProps {
  folder?: string;
  onUploadComplete: (fileUrl: string, fileName: string, fileSize?: number, duration?: number) => void;
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
}

/**
 * Extrae la duración de un archivo de video de forma instantánea
 * @param file - Archivo de video
 * @returns Duración en segundos
 */
const extractVideoDuration = (file: File): Promise<number> => {
  return new Promise((resolve) => {
    const video = document.createElement('video');
    video.preload = 'metadata';

    video.onloadedmetadata = function() {
      URL.revokeObjectURL(video.src);
      const duration = Math.floor(video.duration); // Duración en segundos
      resolve(duration);
    };

    video.onerror = function() {
      URL.revokeObjectURL(video.src);
      // Si falla, simplemente devolver 0 en lugar de rechazar
      resolve(0);
    };

    video.src = URL.createObjectURL(file);
  });
};

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
      const fileSizeBytes = file.size;
      const fileSizeMB = fileSizeBytes / (1024 * 1024); // Convertir a MB
      const apiUrl = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3001';

      // Step 1: Get presigned URL from backend
      const presignedResponse = await fetch(`${apiUrl}/s3/presigned-url`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          fileName: file.name,
          fileType: file.type,
          folder: folder,
        }),
      });

      if (!presignedResponse.ok) {
        const errorData = await presignedResponse.json();
        throw new Error(errorData.error || 'Error al obtener URL presignada');
      }

      const { uploadUrl, fileUrl, fileName: uniqueFileName } = await presignedResponse.json();

      // Step 2: Upload file to S3 using the presigned URL
      const uploadPromise = new Promise<void>((resolve, reject) => {
        const xhr = new XMLHttpRequest();

        // Events to track progress
        xhr.upload.addEventListener('progress', (e) => {
          if (e.lengthComputable) {
            const percentComplete = Math.round((e.loaded / e.total) * 100);
            setProgress(percentComplete);
          }
        });

        xhr.addEventListener('load', () => {
          if (xhr.status >= 200 && xhr.status < 300) {
            resolve();
          } else {
            reject(new Error(`Error al subir a S3: ${xhr.statusText}`));
          }
        });

        xhr.addEventListener('error', () => {
          reject(new Error('Error de red al subir a S3'));
        });

        xhr.addEventListener('abort', () => {
          reject(new Error('Carga cancelada'));
        });

        // Upload the file directly to S3
        xhr.open('PUT', uploadUrl);
        xhr.setRequestHeader('Content-Type', file.type);
        xhr.send(file);
      });

      // Extract duration of video in parallel (if it's a video)
      const durationPromise = file.type.startsWith('video/')
        ? extractVideoDuration(file)
        : Promise.resolve(undefined);

      // Wait for BOTH operations to complete in parallel
      const [, videoDuration] = await Promise.all([uploadPromise, durationPromise]);

      setProgress(100);

      const uploadedFileInfo: UploadedFileInfo = {
        url: fileUrl,
        fileName: uniqueFileName,
        originalName: file.name,
        size: fileSizeBytes,
        type: file.type,
      };

      setUploadedFile(uploadedFileInfo);
      onUploadComplete(fileUrl, uniqueFileName, fileSizeMB, videoDuration);

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
