import { fileTypeFromBuffer } from 'file-type';
import {
  FileTypeCategory,
  getAllowedMimeTypes,
  formatAllowedTypes
} from '@/constants/file-types';

export interface FileValidationResult {
  isValid: boolean;
  detectedMime?: string;
  detectedExtension?: string;
  error?: string;
}

export async function validateFileType(
  file: File,
  category: FileTypeCategory
): Promise<FileValidationResult> {
  const allowedMimes = getAllowedMimeTypes(category);

  try {
    const buffer = await file.slice(0, 4100).arrayBuffer();
    const uint8Array = new Uint8Array(buffer);

    const detectedType = await fileTypeFromBuffer(uint8Array);

    if (!detectedType) {
      if (category === 'document' && file.name.toLowerCase().endsWith('.pdf')) {
        const header = new TextDecoder().decode(uint8Array.slice(0, 5));
        if (header === '%PDF-') {
          return {
            isValid: true,
            detectedMime: 'application/pdf',
            detectedExtension: 'pdf',
          };
        }
      }

      return {
        isValid: false,
        error: `No se pudo verificar el tipo de archivo. Solo se permiten: ${formatAllowedTypes(category)}`,
      };
    }

    if (!allowedMimes.includes(detectedType.mime)) {
      return {
        isValid: false,
        detectedMime: detectedType.mime,
        detectedExtension: detectedType.ext,
        error: `Tipo de archivo no permitido. Se detectó ${detectedType.ext?.toUpperCase() || 'desconocido'}. Solo se permiten: ${formatAllowedTypes(category)}`,
      };
    }

    return {
      isValid: true,
      detectedMime: detectedType.mime,
      detectedExtension: detectedType.ext,
    };
  } catch (error) {
    console.error('Error validating file type:', error);
    return {
      isValid: false,
      error: 'Error al validar el tipo de archivo',
    };
  }
}

