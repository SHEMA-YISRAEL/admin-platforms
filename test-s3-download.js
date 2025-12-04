/**
 * Script para descargar archivos de S3
 *
 * Uso:
 * 1. Descargar un archivo específico:
 *    node test-s3-download.js test/prueba-123456.txt
 *
 */

require('dotenv').config({ path: '.env' });
const { S3Client, GetObjectCommand, ListObjectsV2Command } = require('@aws-sdk/client-s3');
const fs = require('fs');
const path = require('path');
const { Readable } = require('stream');

// Configurar el cliente S3
const s3Client = new S3Client({
  region: process.env.AWS_REGION,
  credentials: {
    accessKeyId: process.env.AWS_ACCESS_KEY_ID,
    secretAccessKey: process.env.AWS_SECRET_ACCESS_KEY,
  },
});

const BUCKET_NAME = process.env.AWS_S3_BUCKET_NAME;
const DOWNLOAD_FOLDER = './downloads'; // Carpeta donde se guardarán los archivos

// Crear carpeta de descargas si no existe
if (!fs.existsSync(DOWNLOAD_FOLDER)) {
  fs.mkdirSync(DOWNLOAD_FOLDER, { recursive: true });
  console.log(`📁 Carpeta de descargas creada: ${DOWNLOAD_FOLDER}\n`);
}

/**
 * Convierte un stream a buffer
 */
async function streamToBuffer(stream) {
  return new Promise((resolve, reject) => {
    const chunks = [];
    stream.on('data', (chunk) => chunks.push(chunk));
    stream.on('error', reject);
    stream.on('end', () => resolve(Buffer.concat(chunks)));
  });
}

/**
 * Descarga un archivo específico de S3
 */
async function downloadFile(fileKey) {
  try {
    console.log(`🔄 Descargando: ${fileKey}`);

    const command = new GetObjectCommand({
      Bucket: BUCKET_NAME,
      Key: fileKey,
    });

    const response = await s3Client.send(command);

    // Convertir el stream a buffer
    const buffer = await streamToBuffer(response.Body);

    // Crear ruta local preservando la estructura de carpetas
    const localPath = path.join(DOWNLOAD_FOLDER, fileKey);
    const localDir = path.dirname(localPath);

    // Crear directorios si no existen
    if (!fs.existsSync(localDir)) {
      fs.mkdirSync(localDir, { recursive: true });
    }

    // Guardar archivo
    fs.writeFileSync(localPath, buffer);

    const sizeKB = (buffer.length / 1024).toFixed(2);
    console.log(`✅ Descargado: ${localPath} (${sizeKB} KB)`);
    console.log(`   Tipo: ${response.ContentType || 'desconocido'}`);
    console.log(`   Última modificación: ${response.LastModified}\n`);

    return localPath;
  } catch (error) {
    console.error(`❌ Error al descargar ${fileKey}:`, error.message);
    return null;
  }
}

/**
 * Lista todos los archivos en el bucket o en una carpeta específica
 */
async function listFiles(prefix = '') {
  try {
    console.log('📋 Listando archivos en S3...\n');

    const command = new ListObjectsV2Command({
      Bucket: BUCKET_NAME,
      Prefix: prefix,
    });

    const response = await s3Client.send(command);

    if (!response.Contents || response.Contents.length === 0) {
      console.log('📭 No se encontraron archivos\n');
      return [];
    }

    console.log(`Encontrados ${response.Contents.length} archivo(s):\n`);

    response.Contents.forEach((item, index) => {
      const sizeKB = (item.Size / 1024).toFixed(2);
      const date = item.LastModified.toISOString().split('T')[0];
      console.log(`${index + 1}. ${item.Key}`);
      console.log(`   📏 ${sizeKB} KB | 📅 ${date}\n`);
    });

    return response.Contents;
  } catch (error) {
    console.error('❌ Error al listar archivos:', error.message);
    return [];
  }
}

// Función principal
async function main() {
  console.log('\n╔════════════════════════════════════════╗');
  console.log('║   Script de Descarga S3 - Neurapp     ║');
  console.log('╚════════════════════════════════════════╝\n');

  // Verificar configuración
  if (!process.env.AWS_ACCESS_KEY_ID || !BUCKET_NAME) {
    console.error('❌ Error: Faltan credenciales en .env');
    console.error('   Configura AWS_ACCESS_KEY_ID, AWS_SECRET_ACCESS_KEY y AWS_S3_BUCKET_NAME\n');
    process.exit(1);
  }

  console.log(`📦 Bucket: ${BUCKET_NAME}`);
  console.log(`🌍 Region: ${process.env.AWS_REGION}`);
  console.log(`📁 Carpeta de descargas: ${path.resolve(DOWNLOAD_FOLDER)}\n`);

  const arg = process.argv[2];

  if (!arg) {
    console.log('💡 Uso:');
    console.log('   node test-s3-download.js <archivo-o-carpeta>');
    console.log('   node test-s3-download.js --list (listar archivos)');
    console.log('\nEjemplos:');
    console.log('   node test-s3-download.js test/prueba-123456.txt');
    console.log('   node test-s3-download.js test/');
    console.log('   node test-s3-download.js https://bucket.s3.region.amazonaws.com/file.txt');
    console.log('   node test-s3-download.js --list\n');

    // Listar archivos por defecto
    await listFiles();
    return;
  }

  if (arg === '--list' || arg === '-l') {
    await listFiles();
  } else if (arg.startsWith('http://') || arg.startsWith('https://')) {
    await downloadFromUrl(arg);
  } else if (arg.endsWith('/')) {
    await downloadFolder(arg);
  } else {
    await downloadFile(arg);
  }
}

// Ejecutar
main().catch(error => {
  console.error('\n❌ Error fatal:', error.message);
  process.exit(1);
});
