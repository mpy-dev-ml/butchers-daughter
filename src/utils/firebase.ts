// src/utils/firebase.ts
import { initializeApp } from 'firebase/app';
import { 
  getFirestore, 
  collection, 
  doc, 
  getDoc, 
  getDocs, 
  query, 
  where,
  orderBy,
  addDoc,
  updateDoc,
  deleteDoc,
  DocumentData
} from 'firebase/firestore';

const firebaseConfig = {
  apiKey: process.env.FIREBASE_API_KEY,
  authDomain: "butchers-daughter.firebaseapp.com",
  projectId: "butchers-daughter",
  storageBucket: "butchers-daughter.appspot.com",
  messagingSenderId: process.env.FIREBASE_SENDER_ID,
  appId: process.env.FIREBASE_APP_ID
};

// Initialize Firebase
const app = initializeApp(firebaseConfig);
const db = getFirestore(app);

export class FirestoreDB {
  // Get all recipes
  async getAllRecipes() {
    try {
      const recipesRef = collection(db, 'recipes');
      const q = query(recipesRef, orderBy('publishDate', 'desc'));
      const querySnapshot = await getDocs(q);
      
      return querySnapshot.docs.map(doc => ({
        id: doc.id,
        ...doc.data()
      }));
    } catch (error) {
      console.error('Error getting recipes:', error);
      throw error;
    }
  }

  // Get recipe by ID
  async getRecipe(id: string) {
    try {
      const docRef = doc(db, 'recipes', id);
      const docSnap = await getDoc(docRef);
      
      if (docSnap.exists()) {
        return {
          id: docSnap.id,
          ...docSnap.data()
        };
      } else {
        return null;
      }
    } catch (error) {
      console.error('Error getting recipe:', error);
      throw error;
    }
  }

  // Get recipes by category
  async getRecipesByCategory(category: string) {
    try {
      const recipesRef = collection(db, 'recipes');
      const q = query(
        recipesRef, 
        where('category', '==', category),
        orderBy('publishDate', 'desc')
      );
      const querySnapshot = await getDocs(q);
      
      return querySnapshot.docs.map(doc => ({
        id: doc.id,
        ...doc.data()
      }));
    } catch (error) {
      console.error('Error getting recipes by category:', error);
      throw error;
    }
  }

  // Add new recipe
  async addRecipe(recipe: DocumentData) {
    try {
      const docRef = await addDoc(collection(db, 'recipes'), {
        ...recipe,
        createdAt: new Date()
      });
      return docRef.id;
    } catch (error) {
      console.error('Error adding recipe:', error);
      throw error;
    }
  }

  // Update recipe
  async updateRecipe(id: string, recipe: Partial<DocumentData>) {
    try {
      const docRef = doc(db, 'recipes', id);
      await updateDoc(docRef, {
        ...recipe,
        updatedAt: new Date()
      });
    } catch (error) {
      console.error('Error updating recipe:', error);
      throw error;
    }
  }

  // Delete recipe
  async deleteRecipe(id: string) {
    try {
      const docRef = doc(db, 'recipes', id);
      await deleteDoc(docRef);
    } catch (error) {
      console.error('Error deleting recipe:', error);
      throw error;
    }
  }

  // Search recipes
  async searchRecipes(searchTerm: string) {
    try {
      // Note: For proper search functionality, you might want to use 
      // Firebase Extensions like Algolia or implement your own search solution
      const recipesRef = collection(db, 'recipes');
      const querySnapshot = await getDocs(recipesRef);
      
      // Basic search implementation
      return querySnapshot.docs
        .map(doc => ({
          id: doc.id,
          ...doc.data()
        }))
        .filter(recipe => 
          recipe.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
          recipe.ingredients.some((ingredient: string) => 
            ingredient.toLowerCase().includes(searchTerm.toLowerCase())
          )
        );
    } catch (error) {
      console.error('Error searching recipes:', error);
      throw error;
    }
  }
}