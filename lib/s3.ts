import { S3Client, PutObjectCommand, DeleteObjectCommand, GetObjectCommand } from '@aws-sdk/client-s3';
import { getSignedUrl } from '@aws-sdk/s3-request-presigner';

const s3Client = new S3Client({
  region: process.env.AWS_REGION || 'us-east-1',
  credentials: {
    accessKeyId: process.env.AWS_ACCESS_KEY_ID || '',
    secretAccessKey: process.env.AWS_SECRET_ACCESS_KEY || '',
  },
});

const BUCKET_NAME = process.env.AWS_S3_BUCKET_NAME || '';

export interface UploadToS3Params {
  file: Buffer;
  fileName: string;
  contentType: string;
  folder?: string;
}

export interface UploadProgress {
  loaded: number;
  total: number;
  percentage: number;
}

/**
 * Sube un archivo a S3 y retorna la URL pública
 */
export async function uploadToS3({
  file,
  fileName,
  contentType,
  folder = 'resources'
}: UploadToS3Params): Promise<string> {
  const key = folder ? `${folder}/${fileName}` : fileName;

  const command = new PutObjectCommand({
    Bucket: BUCKET_NAME,
    Key: key,
    Body: file,
    ContentType: contentType,
  });

  await s3Client.send(command);

  // Retornar la URL pública del archivo
  return `https://${BUCKET_NAME}.s3.${process.env.AWS_REGION}.amazonaws.com/${key}`;
}

/**
 * Elimina un archivo de S3
 */
export async function deleteFromS3(fileUrl: string): Promise<void> {
  try {
    // Extraer la key del URL
    const url = new URL(fileUrl);
    const key = url.pathname.substring(1); // Remover el '/' inicial

    const command = new DeleteObjectCommand({
      Bucket: BUCKET_NAME,
      Key: key,
    });

    await s3Client.send(command);
  } catch (error) {
    console.error('Error deleting file from S3:', error);
    throw error;
  }
}

/**
 * Genera una URL prefirmada para acceso temporal a un archivo privado
 */
export async function getPresignedUrl(fileKey: string, expiresIn: number = 3600): Promise<string> {
  const command = new GetObjectCommand({
    Bucket: BUCKET_NAME,
    Key: fileKey,
  });

  return await getSignedUrl(s3Client, command, { expiresIn });
}

/**
 * Genera un nombre de archivo único con timestamp
 */
export function generateUniqueFileName(originalName: string): string {
  const timestamp = Date.now();
  const randomString = Math.random().toString(36).substring(2, 8);
  const extension = originalName.split('.').pop();
  const nameWithoutExtension = originalName.replace(`.${extension}`, '');
  const sanitizedName = nameWithoutExtension.replace(/[^a-zA-Z0-9]/g, '-');

  return `${sanitizedName}-${timestamp}-${randomString}.${extension}`;
}

export { s3Client };
