/**
 * Script de prueba para verificar la conexión y carga de archivos a S3
 *
 * Uso:
 * 1. Asegúrate de tener un archivo de prueba (ej: test-image.jpg) en la raíz del proyecto
 * 2. Ejecuta: node test-s3-upload.js
 */

require('dotenv').config({ path: '.env' });
const { S3Client, PutObjectCommand, ListBucketsCommand, ListObjectsV2Command } = require('@aws-sdk/client-s3');
const fs = require('fs');
const path = require('path');

// Colores para la consola
const colors = {
  reset: '\x1b[0m',
  green: '\x1b[32m',
  red: '\x1b[31m',
  yellow: '\x1b[33m',
  blue: '\x1b[34m',
  cyan: '\x1b[36m',
};

function log(message, color = colors.reset) {
  console.log(`${color}${message}${colors.reset}`);
}

// Configurar el cliente S3
const s3Client = new S3Client({
  region: process.env.AWS_REGION || 'us-east-2',
  credentials: {
    accessKeyId: process.env.AWS_ACCESS_KEY_ID || '',
    secretAccessKey: process.env.AWS_SECRET_ACCESS_KEY || '',
  },
});

const BUCKET_NAME = process.env.AWS_S3_BUCKET_NAME || '';

async function testConnection() {
  log('\n========================================', colors.cyan);
  log('🔍 Probando conexión con AWS S3...', colors.cyan);
  log('========================================\n', colors.cyan);

  // Verificar variables de entorno
  log('📋 Verificando configuración:', colors.blue);
  log(`   Region: ${process.env.AWS_REGION}`, colors.blue);
  log(`   Bucket: ${BUCKET_NAME}`, colors.blue);
  log(`   Access Key: ${process.env.AWS_ACCESS_KEY_ID?.substring(0, 10)}...`, colors.blue);
  log('');

  if (!process.env.AWS_ACCESS_KEY_ID || !process.env.AWS_SECRET_ACCESS_KEY || !BUCKET_NAME) {
    log('❌ Error: Faltan credenciales en el archivo .env', colors.red);
    log('   Asegúrate de configurar AWS_REGION, AWS_ACCESS_KEY_ID, AWS_SECRET_ACCESS_KEY y AWS_S3_BUCKET_NAME', colors.yellow);
    return false;
  }

  try {
    // Probar listando los buckets
    log('🔄 Intentando listar buckets...', colors.yellow);
    const listBucketsCommand = new ListBucketsCommand({});
    const { Buckets } = await s3Client.send(listBucketsCommand);

    log('✅ Conexión exitosa!', colors.green);
    log(`   Buckets disponibles (${Buckets?.length || 0}):`, colors.green);
    Buckets?.forEach(bucket => {
      const marker = bucket.Name === BUCKET_NAME ? '👉' : '  ';
      log(`   ${marker} ${bucket.Name}`, colors.green);
    });
    log('');

    return true;
  } catch (error) {
    log('❌ Error de conexión:', colors.red);
    log(`   ${error.message}`, colors.red);
    log('');
    log('💡 Posibles causas:', colors.yellow);
    log('   - Credenciales incorrectas', colors.yellow);
    log('   - Permisos insuficientes del usuario IAM', colors.yellow);
    log('   - Región incorrecta', colors.yellow);
    return false;
  }
}

async function listBucketContents() {
  log('📂 Listando contenido del bucket...', colors.blue);

  try {
    const command = new ListObjectsV2Command({
      Bucket: BUCKET_NAME,
      MaxKeys: 10,
    });

    const response = await s3Client.send(command);

    if (!response.Contents || response.Contents.length === 0) {
      log('   📭 El bucket está vacío', colors.yellow);
    } else {
      log(`   Archivos encontrados (${response.Contents.length}):`, colors.green);
      response.Contents.forEach(item => {
        const size = (item.Size / 1024).toFixed(2);
        log(`   📄 ${item.Key} (${size} KB)`, colors.green);
      });
    }
    log('');
    return true;
  } catch (error) {
    log(`❌ Error al listar archivos: ${error.message}`, colors.red);
    log('');
    return false;
  }
}

async function uploadTestFile() {
  log('========================================', colors.cyan);
  log('📤 Subiendo archivo de prueba...', colors.cyan);
  log('========================================\n', colors.cyan);

  // Crear un archivo de prueba simple
  const testFileName = 'test-file.txt';
  const testContent = `Archivo de prueba creado el ${new Date().toISOString()}\n\nEste archivo fue subido desde el script de prueba de S3.\n\n¡Conexión exitosa! 🎉`;

  try {
    // Crear el archivo de prueba
    fs.writeFileSync(testFileName, testContent);
    log(`✅ Archivo de prueba creado: ${testFileName}`, colors.green);

    // Leer el archivo
    const fileContent = fs.readFileSync(testFileName);

    // Generar nombre único
    const timestamp = Date.now();
    const uniqueFileName = `test/prueba-${timestamp}.txt`;

    log(`🔄 Subiendo a S3 como: ${uniqueFileName}`, colors.yellow);

    // Subir a S3
    const command = new PutObjectCommand({
      Bucket: BUCKET_NAME,
      Key: uniqueFileName,
      Body: fileContent,
      ContentType: 'text/plain',
    });

    await s3Client.send(command);

    const fileUrl = `https://${BUCKET_NAME}.s3.${process.env.AWS_REGION}.amazonaws.com/${uniqueFileName}`;

    log('✅ ¡Archivo subido exitosamente!', colors.green);
    log('');
    log('📋 Detalles:', colors.blue);
    log(`   Bucket: ${BUCKET_NAME}`, colors.blue);
    log(`   Key: ${uniqueFileName}`, colors.blue);
    log(`   URL: ${fileUrl}`, colors.blue);
    log('');

    // Limpiar archivo local
    fs.unlinkSync(testFileName);
    log(`🧹 Archivo local eliminado`, colors.green);

    return true;
  } catch (error) {
    log('❌ Error al subir archivo:', colors.red);
    log(`   ${error.message}`, colors.red);

    // Limpiar archivo local si existe
    if (fs.existsSync(testFileName)) {
      fs.unlinkSync(testFileName);
    }

    log('');
    log('💡 Posibles causas:', colors.yellow);
    log('   - El bucket no existe', colors.yellow);
    log('   - El usuario IAM no tiene permisos de escritura (s3:PutObject)', colors.yellow);
    log('   - El nombre del bucket es incorrecto', colors.yellow);
    return false;
  }
}

async function uploadCustomFile(filePath) {
  log('========================================', colors.cyan);
  log('📤 Subiendo archivo personalizado...', colors.cyan);
  log('========================================\n', colors.cyan);

  if (!fs.existsSync(filePath)) {
    log(`❌ El archivo no existe: ${filePath}`, colors.red);
    return false;
  }

  try {
    const fileName = path.basename(filePath);
    const fileStats = fs.statSync(filePath);
    const fileSize = (fileStats.size / 1024 / 1024).toFixed(2);

    log(`📄 Archivo: ${fileName}`, colors.blue);
    log(`📏 Tamaño: ${fileSize} MB`, colors.blue);
    log('');

    // Leer el archivo
    const fileContent = fs.readFileSync(filePath);

    // Generar nombre único
    const timestamp = Date.now();
    const extension = path.extname(fileName);
    const nameWithoutExt = path.basename(fileName, extension);
    const uniqueFileName = `uploads/${nameWithoutExt}-${timestamp}${extension}`;

    log(`🔄 Subiendo a S3 como: ${uniqueFileName}`, colors.yellow);

    // Determinar content type
    const contentTypeMap = {
      '.jpg': 'image/jpeg',
      '.jpeg': 'image/jpeg',
      '.png': 'image/png',
      '.gif': 'image/gif',
      '.pdf': 'application/pdf',
      '.mp4': 'video/mp4',
      '.txt': 'text/plain',
    };
    const contentType = contentTypeMap[extension.toLowerCase()] || 'application/octet-stream';

    // Subir a S3
    const command = new PutObjectCommand({
      Bucket: BUCKET_NAME,
      Key: uniqueFileName,
      Body: fileContent,
      ContentType: contentType,
    });

    await s3Client.send(command);

    const fileUrl = `https://${BUCKET_NAME}.s3.${process.env.AWS_REGION}.amazonaws.com/${uniqueFileName}`;

    log('✅ ¡Archivo subido exitosamente!', colors.green);
    log('');
    log('📋 Detalles:', colors.blue);
    log(`   Bucket: ${BUCKET_NAME}`, colors.blue);
    log(`   Key: ${uniqueFileName}`, colors.blue);
    log(`   URL: ${fileUrl}`, colors.blue);
    log('');

    return true;
  } catch (error) {
    log('❌ Error al subir archivo:', colors.red);
    log(`   ${error.message}`, colors.red);
    return false;
  }
}

// Función principal
async function main() {
  log('\n╔════════════════════════════════════════╗', colors.cyan);
  log('║   Script de Prueba AWS S3 - Neurapp   ║', colors.cyan);
  log('╚════════════════════════════════════════╝', colors.cyan);

  // 1. Probar conexión
  const connected = await testConnection();
  if (!connected) {
    log('❌ No se pudo conectar a AWS S3. Revisa la configuración.', colors.red);
    process.exit(1);
  }

  // 2. Listar contenido del bucket
  await listBucketContents();

  // 3. Subir archivo de prueba
  const uploaded = await uploadTestFile();

  if (!uploaded) {
    log('❌ No se pudo subir el archivo de prueba.', colors.red);
    process.exit(1);
  }

  // 4. Listar contenido nuevamente
  await listBucketContents();

  // 5. Si se proporciona un archivo como argumento, subirlo
  const customFile = process.argv[2];
  if (customFile) {
    await uploadCustomFile(customFile);
  } else {
    log('💡 Tip: Puedes subir un archivo personalizado ejecutando:', colors.yellow);
    log('   node test-s3-upload.js ruta/al/archivo.jpg', colors.yellow);
    log('');
  }

  log('╔════════════════════════════════════════╗', colors.green);
  log('║     ✅ Todas las pruebas exitosas!     ║', colors.green);
  log('╚════════════════════════════════════════╝', colors.green);
  log('');
}

// Ejecutar
main().catch(error => {
  log('\n❌ Error fatal:', colors.red);
  log(error.stack, colors.red);
  process.exit(1);
});
