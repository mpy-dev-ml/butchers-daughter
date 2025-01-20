// src/utils/parser.ts
import { Recipe, RecipeMarkdown, Category } from '../types/recipe';

export class RecipeParser {
  private static readonly DAIRY_TERMS = ['cheese', 'milk', 'cream', 'butter', 'yogurt', 'dairy'];
  private static readonly MEAT_TERMS = ['meat', 'chicken', 'beef', 'lamb', 'duck', 'turkey', 'brisket'];

  public static parse(markdown: RecipeMarkdown): Recipe | null {
    try {
      const { content, filePath } = markdown;
      const recipe: Partial<Recipe> = {};

      // Extract title (first h1)
      const titleMatch = content.match(/^#\s+(.+)$/m);
      if (!titleMatch) {
        throw new Error('Title not found');
      }
      recipe.title = titleMatch[1].trim();

      // Extract author and date
      const authorMatch = content.match(/\*By ([^*]+)\*/);
      const dateMatch = content.match(/\*([A-Za-z]+ \d+, \d{4})/);
      if (!authorMatch || !dateMatch) {
        throw new Error('Author or date not found');
      }
      recipe.author = authorMatch[1].trim();
      recipe.publishDate = new Date(dateMatch[1]);

      // Extract times and servings
      const prepTimeMatch = content.match(/\*\*Prep Time\*\*:\s*([^\n]+)/);
      const cookTimeMatch = content.match(/\*\*Cooking Time\*\*:\s*([^\n]+)/);
      const servesMatch = content.match(/\*\*Serves\*\*:\s*([^\n]+)/);

      recipe.prepTime = prepTimeMatch ? prepTimeMatch[1].trim() : '';
      recipe.cookTime = cookTimeMatch ? cookTimeMatch[1].trim() : '';
      recipe.serves = servesMatch ? servesMatch[1].trim() : '';

      // Extract ingredients
      const ingredientsSection = content.match(/## Ingredients\n\n([\s\S]*?)(?=\n##|$)/);
      if (!ingredientsSection) {
        throw new Error('Ingredients section not found');
      }
      recipe.ingredients = ingredientsSection[1]
        .split('\n')
        .map(line => line.replace(/^-\s*/, '').trim())
        .filter(line => line.length > 0);

      // Extract instructions
      const methodSection = content.match(/## Method\n\n([\s\S]*?)(?=\n##|$)/);
      if (!methodSection) {
        throw new Error('Method section not found');
      }
      recipe.instructions = methodSection[1]
        .split(/\d+\.\s+/)
        .map(line => line.trim())
        .filter(line => line.length > 0);

      // Extract source
      const sourceMatch = content.match(/\*Source: \[([^\]]+)\]\(([^)]+)\)\*/);
      if (sourceMatch) {
        recipe.source = sourceMatch[2];
      }

      // Determine category
      recipe.category = this.determineCategory(recipe.title, recipe.ingredients);

      return recipe as Recipe;
    } catch (error) {
      console.error(`Error parsing recipe: ${error.message}`);
      return null;
    }
  }

  private static determineCategory(title: string, ingredients: string[]): Category {
    const lowerTitle = title.toLowerCase();
    const lowerIngredients = ingredients.map(i => i.toLowerCase());
    
    const hasDairy = this.DAIRY_TERMS.some(term => 
      lowerTitle.includes(term) || 
      lowerIngredients.some(i => i.includes(term))
    );
    
    const hasMeat = this.MEAT_TERMS.some(term => 
      lowerTitle.includes(term) || 
      lowerIngredients.some(i => i.includes(term))
    );
    
    if (hasMeat) return 'meat';
    if (hasDairy) return 'dairy';
    return 'pareve';
  }
}