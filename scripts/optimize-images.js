#!/usr/bin/env node

/**
 * Image Optimization Script
 *
 * Optimizes all images in the project:
 * - Converts to WebP format with fallbacks
 * - Compresses images
 * - Generates responsive image variants
 * - Creates optimized thumbnails
 *
 * Usage: node scripts/optimize-images.js
 */

import sharp from 'sharp';
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const PROJECT_ROOT = path.join(__dirname, '..');
const PUBLIC_DIR = path.join(PROJECT_ROOT, 'public');
const OUTPUT_DIR = path.join(PUBLIC_DIR, 'optimized');

// Image optimization settings
const FORMATS = ['webp', 'jpeg'];
const SIZES = {
  thumbnail: 300,
  small: 640,
  medium: 1024,
  large: 1920,
};

const QUALITY = {
  webp: 85,
  jpeg: 85,
  png: 90,
};

/**
 * Find all images in a directory
 */
function findImages(dir, images = []) {
  const files = fs.readdirSync(dir);

  for (const file of files) {
    const filePath = path.join(dir, file);
    const stat = fs.statSync(filePath);

    if (stat.isDirectory() && !filePath.includes('node_modules') && !filePath.includes('optimized')) {
      findImages(filePath, images);
    } else if (stat.isFile() && /\.(jpg|jpeg|png)$/i.test(file)) {
      images.push(filePath);
    }
  }

  return images;
}

/**
 * Optimize a single image
 */
async function optimizeImage(imagePath) {
  const relativePath = path.relative(PUBLIC_DIR, imagePath);
  const outputPath = path.join(OUTPUT_DIR, path.dirname(relativePath));

  // Create output directory if it doesn't exist
  if (!fs.existsSync(outputPath)) {
    fs.mkdirSync(outputPath, { recursive: true });
  }

  const filename = path.basename(imagePath, path.extname(imagePath));
  const image = sharp(imagePath);
  const metadata = await image.metadata();

  console.log(`\nOptimizing: ${relativePath}`);
  console.log(`Original: ${metadata.width}x${metadata.height} (${metadata.format})`);

  const results = [];

  // Generate responsive variants
  for (const [sizeName, width] of Object.entries(SIZES)) {
    // Skip if original is smaller than target size
    if (metadata.width < width && sizeName !== 'thumbnail') {
      continue;
    }

    for (const format of FORMATS) {
      const outputFilename = `${filename}-${sizeName}.${format}`;
      const outputFile = path.join(outputPath, outputFilename);

      try {
        const resized = image
          .clone()
          .resize(width, null, {
            fit: 'inside',
            withoutEnlargement: true,
          });

        if (format === 'webp') {
          await resized.webp({ quality: QUALITY.webp }).toFile(outputFile);
        } else if (format === 'jpeg') {
          await resized.jpeg({ quality: QUALITY.jpeg, progressive: true }).toFile(outputFile);
        }

        const stats = fs.statSync(outputFile);
        results.push(`  ✓ ${sizeName}/${format}: ${Math.round(stats.size / 1024)}KB`);
      } catch (error) {
        console.error(`  ✗ Error creating ${sizeName}/${format}:`, error.message);
      }
    }
  }

  results.forEach(r => console.log(r));

  return results.length;
}

/**
 * Generate image manifest
 */
function generateManifest(images) {
  const manifest = {};

  for (const imagePath of images) {
    const relativePath = path.relative(PUBLIC_DIR, imagePath);
    const filename = path.basename(imagePath, path.extname(imagePath));
    const outputPath = path.join(path.dirname(relativePath));

    manifest[relativePath] = {
      original: relativePath,
      variants: {},
    };

    for (const [sizeName, width] of Object.entries(SIZES)) {
      manifest[relativePath].variants[sizeName] = {
        webp: `/optimized/${outputPath}/${filename}-${sizeName}.webp`,
        jpeg: `/optimized/${outputPath}/${filename}-${sizeName}.jpeg`,
      };
    }
  }

  const manifestPath = path.join(OUTPUT_DIR, 'manifest.json');
  fs.writeFileSync(manifestPath, JSON.stringify(manifest, null, 2));
  console.log(`\n✓ Manifest generated: ${manifestPath}`);

  return manifest;
}

/**
 * Calculate total size savings
 */
function calculateSavings(images) {
  let originalSize = 0;
  let optimizedSize = 0;

  for (const imagePath of images) {
    const originalStats = fs.statSync(imagePath);
    originalSize += originalStats.size;

    const relativePath = path.relative(PUBLIC_DIR, imagePath);
    const filename = path.basename(imagePath, path.extname(imagePath));
    const outputPath = path.join(OUTPUT_DIR, path.dirname(relativePath));

    // Count all generated variants
    for (const sizeName of Object.keys(SIZES)) {
      for (const format of FORMATS) {
        const outputFile = path.join(outputPath, `${filename}-${sizeName}.${format}`);
        if (fs.existsSync(outputFile)) {
          const stats = fs.statSync(outputFile);
          optimizedSize += stats.size;
        }
      }
    }
  }

  return {
    originalSize,
    optimizedSize,
    savings: originalSize - optimizedSize,
    savingsPercent: ((originalSize - optimizedSize) / originalSize * 100).toFixed(2),
  };
}

/**
 * Main execution
 */
async function main() {
  console.log('🖼️  Image Optimization Script');
  console.log('================================\n');

  // Find all images
  console.log('Finding images...');
  const images = findImages(PUBLIC_DIR);
  console.log(`Found ${images.length} images to optimize\n`);

  if (images.length === 0) {
    console.log('No images found to optimize.');
    return;
  }

  // Create output directory
  if (!fs.existsSync(OUTPUT_DIR)) {
    fs.mkdirSync(OUTPUT_DIR, { recursive: true });
  }

  // Optimize each image
  console.log('Starting optimization...');
  let completed = 0;

  for (const imagePath of images) {
    try {
      await optimizeImage(imagePath);
      completed++;
    } catch (error) {
      console.error(`Error optimizing ${imagePath}:`, error.message);
    }
  }

  // Generate manifest
  generateManifest(images);

  // Calculate savings
  const savings = calculateSavings(images);

  console.log('\n================================');
  console.log('Optimization Complete!');
  console.log('================================');
  console.log(`Images processed: ${completed}/${images.length}`);
  console.log(`Original size: ${(savings.originalSize / 1024 / 1024).toFixed(2)}MB`);
  console.log(`Optimized size: ${(savings.optimizedSize / 1024 / 1024).toFixed(2)}MB`);
  console.log(`Savings: ${(savings.savings / 1024 / 1024).toFixed(2)}MB (${savings.savingsPercent}%)`);
  console.log('\n✓ All images optimized!');
}

// Run the script
main().catch(console.error);
