export type FileTypeCategory = 'video' | 'image' | 'document';

export interface FileTypeConfig {
  mime: string;
  extension: string;
  label: string;
}

export interface FileTypeCategoryConfig {
  category: FileTypeCategory;
  types: FileTypeConfig[];
  acceptAttribute: string;
  maxSizeMB: number;
}

export const VIDEO_FILE_TYPES: FileTypeCategoryConfig = {
  category: 'video',
  types: [{ mime: 'video/mp4', extension: 'mp4', label: 'MP4' }],
  acceptAttribute: '.mp4,video/mp4',
  maxSizeMB: 2048,
};

export const IMAGE_FILE_TYPES: FileTypeCategoryConfig = {
  category: 'image',
  types: [
    { mime: 'image/jpeg', extension: 'jpg', label: 'JPG' },
    { mime: 'image/png', extension: 'png', label: 'PNG' },
    { mime: 'image/webp', extension: 'webp', label: 'WEBP' },
  ],
  acceptAttribute: '.jpg,.jpeg,.png,.webp,image/jpeg,image/png,image/webp',
  maxSizeMB: 10,
};

export const DOCUMENT_FILE_TYPES: FileTypeCategoryConfig = {
  category: 'document',
  types: [{ mime: 'application/pdf', extension: 'pdf', label: 'PDF' }],
  acceptAttribute: '.pdf,application/pdf',
  maxSizeMB: 50,
};

export const FILE_TYPE_CONFIGS: Record<
  FileTypeCategory,
  FileTypeCategoryConfig
> = {
  video: VIDEO_FILE_TYPES,
  image: IMAGE_FILE_TYPES,
  document: DOCUMENT_FILE_TYPES,
};

export function getAllowedMimeTypes(category: FileTypeCategory): string[] {
  return FILE_TYPE_CONFIGS[category].types.map((t) => t.mime);
}

export function getAllowedExtensions(category: FileTypeCategory): string[] {
  return FILE_TYPE_CONFIGS[category].types.map((t) => t.extension);
}

export function formatAllowedTypes(category: FileTypeCategory): string {
  const config = FILE_TYPE_CONFIGS[category];
  return config.types.map((t) => t.label).join(', ');
}
