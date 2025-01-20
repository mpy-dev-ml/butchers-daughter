// src/utils/imageProcessor.ts
import sharp from 'sharp';
import { ImageFile, ProcessedImage } from '../types/image';
import { logger } from './logger';

export class ImageProcessor {
  private readonly maxWidth: number;
  private readonly maxHeight: number;
  private readonly quality: number;

  constructor(maxWidth = 1200, maxHeight = 800, quality = 80) {
    this.maxWidth = maxWidth;
    this.maxHeight = maxHeight;
    this.quality = quality;
  }

  async processImage(imageFile: ImageFile): Promise<ProcessedImage | null> {
    try {
      logger.info(`Processing image: ${imageFile.path}`);
      
      const image = sharp(imageFile.path);
      const metadata = await image.metadata();

      if (!metadata.width || !metadata.height) {
        throw new Error('Could not read image dimensions');
      }

      // Calculate new dimensions while maintaining aspect ratio
      const aspectRatio = metadata.width / metadata.height;
      let newWidth = metadata.width;
      let newHeight = metadata.height;

      if (newWidth > this.maxWidth) {
        newWidth = this.maxWidth;
        newHeight = Math.round(this.maxWidth / aspectRatio);
      }

      if (newHeight > this.maxHeight) {
        newHeight = this.maxHeight;
        newWidth = Math.round(this.maxHeight * aspectRatio);
      }

      // Process image
      const processedBuffer = await image
        .resize(newWidth, newHeight, {
          fit: 'inside',
          withoutEnlargement: true
        })
        .jpeg({
          quality: this.quality,
          mozjpeg: true
        })
        .toBuffer();

      return {
        buffer: processedBuffer,
        filename: imageFile.filename,
        recipeName: imageFile.recipeName,
        width: newWidth,
        height: newHeight,
        format: 'jpeg'
      };
    } catch (error) {
      logger.error(`Error processing image ${imageFile.path}: ${error.message}`);
      return null;
    }
  }

  static sanitizeFilename(filename: string): string {
    return filename
      .toLowerCase()
      .replace(/[^a-z0-9]+/g, '-')
      .replace(/(^-|-$)/g, '');
  }
}