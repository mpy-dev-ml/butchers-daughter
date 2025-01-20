// src/utils/firebaseStorage.ts
import { initializeApp } from 'firebase/app';
import { getStorage, ref, uploadBytes, getDownloadURL } from 'firebase/storage';
import { ProcessedImage, UploadResult } from '../types/image';
import { logger } from './logger';

export class FirebaseStorage {
  private storage;

  constructor(config: object) {
    const app = initializeApp(config);
    this.storage = getStorage(app);
  }

  async uploadImage(image: ProcessedImage): Promise<UploadResult> {
    const result: UploadResult = {
      originalPath: image.filename,
      storagePath: '',
      downloadUrl: '',
      success: false
    };

    try {
      // Create storage path
      const storagePath = `recipes/${image.recipeName}.jpg`;
      const storageRef = ref(this.storage, storagePath);

      // Upload the image
      await uploadBytes(storageRef, image.buffer, {
        contentType: 'image/jpeg',
        customMetadata: {
          width: image.width.toString(),
          height: image.height.toString(),
          recipeName: image.recipeName
        }
      });

      // Get the download URL
      const downloadUrl = await getDownloadURL(storageRef);

      result.storagePath = storagePath;
      result.downloadUrl = downloadUrl;
      result.success = true;

      logger.info(`Successfully uploaded image: ${storagePath}`);
      return result;
    } catch (error) {
      logger.error(`Error uploading image ${image.filename}: ${error.message}`);
      result.error = error.message;
      return result;
    }
  }
}