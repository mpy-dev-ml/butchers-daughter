// src/utils/firebase.ts
import { initializeApp, FirebaseApp } from 'firebase/app';
import { getFirestore, Firestore, collection, addDoc } from 'firebase/firestore';
import { Recipe } from '../types/recipe';

export class FirebaseClient {
  private app: FirebaseApp;
  private db: Firestore;

  constructor(config: object) {
    this.app = initializeApp(config);
    this.db = getFirestore(this.app);
  }

  async addRecipe(recipe: Recipe): Promise<string> {
    try {
      const docRef = await addDoc(collection(this.db, 'recipes'), recipe);
      return docRef.id;
    } catch (error) {
      throw new Error(`Failed to add recipe: ${error.message}`);
    }
  }
}