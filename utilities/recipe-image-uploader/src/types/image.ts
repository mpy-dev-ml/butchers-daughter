// src/types/image.ts

export interface ImageFile {
    path: string;
    filename: string;
    recipeName: string;
  }
  
  export interface ProcessedImage {
    buffer: Buffer;
    filename: string;
    recipeName: string;
    width: number;
    height: number;
    format: string;
  }
  
  export interface UploadResult {
    originalPath: string;
    storagePath: string;
    downloadUrl: string;
    success: boolean;
    error?: string;
  }