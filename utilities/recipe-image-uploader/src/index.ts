// src/index.ts

// Load Firebase environment variables
import * as dotenv from 'dotenv';
dotenv.config();

// Imports required packages
import * as fs from 'fs-extra';
import * as path from 'path';
import { ImageProcessor } from './utils/imageProcessor';
import { FirebaseStorage } from './utils/firebaseStorage';
import { ImageFile, UploadResult } from './types/image';
import { logger } from './utils/logger';

// Firebase configuration
const firebaseConfig = {
  apiKey: process.env.FIREBASE_API_KEY,
  authDomain: "butchers-daughter.firebaseapp.com",
  projectId: "butchers-daughter",
  storageBucket: "butchers-daughter.appspot.com",
  messagingSenderId: process.env.FIREBASE_SENDER_ID,
  appId: process.env.FIREBASE_APP_ID
};

async function processAndUploadImages(directoryPath: string): Promise<UploadResult[]> {
  try {
    // Initialize processors
    const imageProcessor = new ImageProcessor();
    const storage = new FirebaseStorage(firebaseConfig);

    // Get all jpg files
    const files = await fs.readdir(directoryPath);
    const imageFiles = files.filter(file => 
      file.toLowerCase().endsWith('.jpg') || 
      file.toLowerCase().endsWith('.jpeg')
    );

    logger.info(`Found ${imageFiles.length} image files`);

    const results: UploadResult[] = [];

    for (const file of imageFiles) {
      const filePath = path.join(directoryPath, file);
      const recipeName = path.basename(file, path.extname(file));

      // Create image file object
      const imageFile: ImageFile = {
        path: filePath,
        filename: file,
        recipeName: ImageProcessor.sanitizeFilename(recipeName)
      };

      try {
        // Process image
        const processedImage = await imageProcessor.processImage(imageFile);
        if (!processedImage) {
          results.push({
            originalPath: filePath,
            storagePath: '',
            downloadUrl: '',
            success: false,
            error: 'Failed to process image'
          });
          continue;
        }

        // Upload to Firebase Storage
        const result = await storage.uploadImage(processedImage);
        results.push(result);
      } catch (error) {
        logger.error(`Error processing ${file}: ${error.message}`);
        results.push({
          originalPath: filePath,
          storagePath: '',
          downloadUrl: '',
          success: false,
          error: error.message
        });
      }
    }

    // Log summary
    const successful = results.filter(r => r.success).length;
    const failed = results.filter(r => !r.success).length;
    logger.info(`Upload complete. Successful: ${successful}, Failed: ${failed}`);

    return results;
  } catch (error) {
    logger.error('Error processing images:', error);
    throw error;
  }
}

// Check command line arguments
const imagesDir = process.argv[2];
if (!imagesDir) {
  logger.error('Please provide the path to your images directory');
  console.log('Usage: npm run upload -- ./path/to/images');
  process.exit(1);
}

// Run the upload
processAndUploadImages(imagesDir)
  .then(() => process.exit(0))
  .catch(() => process.exit(1));