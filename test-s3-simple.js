/**
 * Script simple para probar S3
 * Uso: node test-s3-simple.js
 */

require('dotenv').config({ path: '.env' });
const { S3Client, PutObjectCommand } = require('@aws-sdk/client-s3');

const s3Client = new S3Client({
  region: process.env.AWS_REGION,
  credentials: {
    accessKeyId: process.env.AWS_ACCESS_KEY_ID,
    secretAccessKey: process.env.AWS_SECRET_ACCESS_KEY,
  },
});

async function testUpload() {
  try {
    console.log('🔄 Subiendo archivo de prueba a S3...\n');

    const testContent = `Prueba exitosa - ${new Date().toISOString()}`;
    const fileName = `test/prueba-${Date.now()}.txt`;

    const command = new PutObjectCommand({
      Bucket: process.env.AWS_S3_BUCKET_NAME,
      Key: fileName,
      Body: testContent,
      ContentType: 'text/plain',
    });

    await s3Client.send(command);

    const url = `https://${process.env.AWS_S3_BUCKET_NAME}.s3.${process.env.AWS_REGION}.amazonaws.com/${fileName}`;

    console.log('✅ ¡Éxito! Archivo subido:');
    console.log(`   URL: ${url}\n`);

  } catch (error) {
    console.error('❌ Error:', error.message);
    console.error('Revisa tus credenciales en .env\n');
  }
}

testUpload();
