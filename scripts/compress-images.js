#!/usr/bin/env node
// Скрипт для сжатия всех фото в public/photos/
// Запуск: node scripts/compress-images.js
// Требует: npm install sharp

import sharp from 'sharp';
import { readdir, stat } from 'fs/promises';
import { join, dirname } from 'path';
import { fileURLToPath } from 'url';
import { dirname as pathDirname } from 'path';

const __filename = fileURLToPath(import.meta.url);
const __dirname = pathDirname(__filename);
const photosDir = join(__dirname, '..', 'public', 'photos');

const MAX_SIZE = 1400; // максимальная ширина/высота
const QUALITY = 80; // качество WebP

async function compressImage(filePath) {
  try {
    const statResult = await stat(filePath);
    const sizeBefore = statResult.size;

    await sharp(filePath)
      .resize({ width: MAX_SIZE, height: MAX_SIZE, fit: 'inside', withoutEnlargement: true })
      .webp({ quality: QUALITY })
      .toFile(filePath.replace(/\.(jpg|jpeg|png|JPG|JPEG|PNG)$/, '.webp'));

    const sizeAfter = (await stat(filePath.replace(/\.(jpg|jpeg|png|JPG|JPEG|PNG)$/, '.webp'))).size;
    const reduction = ((1 - sizeAfter / sizeBefore) * 100).toFixed(1);

    console.log(`✓ ${filePath.replace('public/photos/', '')}: ${formatBytes(sizeBefore)} → ${formatBytes(sizeAfter)} (${reduction}%)`);
  } catch (err) {
    console.error(`✗ ${filePath}: ${err.message}`);
  }
}

function formatBytes(bytes) {
  if (bytes < 1024) return bytes + ' B';
  if (bytes < 1048576) return (bytes / 1024).toFixed(1) + ' KB';
  return (bytes / 1048576).toFixed(2) + ' MB';
}

async function main() {
  console.log('📸 Сжатие изображений...\n');

  const files = await readdir(photosDir);
  const imageFiles = files.filter(f => /\.(jpg|jpeg|png|JPG|JPEG|PNG)$/i.test(f));

  if (imageFiles.length === 0) {
    console.log('Фото не найдены в public/photos/');
    return;
  }

  console.log(`Найдено ${imageFiles.length} фото\n`);

  for (const file of imageFiles) {
    await compressImage(join(photosDir, file));
  }

  console.log('\n✅ Готово! Все фото конвертированы в WebP и сжаты.');
  console.log('Оригиналы (jpg/png) можно удалить, если всё ок.');
}

main();
