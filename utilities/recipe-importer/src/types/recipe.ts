// src/types/recipe.ts

export type Category = 'meat' | 'dairy' | 'pareve';

export interface Recipe {
  title: string;
  author: string;
  publishDate: Date;
  prepTime: string;
  cookTime: string;
  serves: string;
  ingredients: string[];
  instructions: string[];
  source: string;
  category: Category;
}

export interface RecipeMarkdown {
  content: string;
  filePath: string;
}