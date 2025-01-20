// src/stores/recipeStore.ts
import { writable } from 'svelte/store';
import { FirestoreDB } from '../utils/firebase';

const db = new FirestoreDB();

function createRecipeStore() {
  const { subscribe, set, update } = writable({
    recipes: [],
    loading: false,
    error: null
  });

  return {
    subscribe,
    loadAllRecipes: async () => {
      update(state => ({ ...state, loading: true }));
      try {
        const recipes = await db.getAllRecipes();
        update(state => ({ 
          ...state, 
          recipes, 
          loading: false 
        }));
      } catch (error) {
        update(state => ({ 
          ...state, 
          error: error.message, 
          loading: false 
        }));
      }
    },
    loadRecipesByCategory: async (category: string) => {
      update(state => ({ ...state, loading: true }));
      try {
        const recipes = await db.getRecipesByCategory(category);
        update(state => ({ 
          ...state, 
          recipes, 
          loading: false 
        }));
      } catch (error) {
        update(state => ({ 
          ...state, 
          error: error.message, 
          loading: false 
        }));
      }
    },
    searchRecipes: async (searchTerm: string) => {
      update(state => ({ ...state, loading: true }));
      try {
        const recipes = await db.searchRecipes(searchTerm);
        update(state => ({ 
          ...state, 
          recipes, 
          loading: false 
        }));
      } catch (error) {
        update(state => ({ 
          ...state, 
          error: error.message, 
          loading: false 
        }));
      }
    }
  };
}

export const recipeStore = createRecipeStore();