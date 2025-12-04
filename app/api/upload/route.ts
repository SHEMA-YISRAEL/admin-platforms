import { NextRequest, NextResponse } from 'next/server';
import { uploadToS3, generateUniqueFileName } from '@/lib/s3';

export const runtime = 'nodejs';

export async function POST(request: NextRequest) {
  try {
    const formData = await request.formData();
    const file = formData.get('file') as File;
    const folder = formData.get('folder') as string || 'resources';

    if (!file) {
      return NextResponse.json(
        { error: 'No se proporcionó ningún archivo' },
        { status: 400 }
      );
    }

    // Convertir el archivo a Buffer
    const bytes = await file.arrayBuffer();
    const buffer = Buffer.from(bytes);

    // Generar nombre único para el archivo
    const uniqueFileName = generateUniqueFileName(file.name);

    // Subir a S3
    const fileUrl = await uploadToS3({
      file: buffer,
      fileName: uniqueFileName,
      contentType: file.type,
      folder,
    });

    return NextResponse.json({
      success: true,
      url: fileUrl,
      fileName: uniqueFileName,
      originalName: file.name,
      size: file.size,
      type: file.type,
    });
  } catch (error) {
    console.error('Error uploading file:', error);
    return NextResponse.json(
      { error: 'Error al subir el archivo', details: error instanceof Error ? error.message : 'Unknown error' },
      { status: 500 }
    );
  }
}
