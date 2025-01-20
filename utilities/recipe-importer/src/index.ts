// src/index.ts
import * as fs from 'fs-extra';
import * as path from 'path';
import { RecipeParser } from './utils/parser';
import { FirebaseClient } from './utils/firebase';
import { RecipeMarkdown } from './types/recipe';

// Firebase configuration - replace with your config
const firebaseConfig = {
  apiKey: process.env.FIREBASE_API_KEY,
  authDomain: "butchers-daughter.firebaseapp.com",
  projectId: "butchers-daughter",
  storageBucket: "butchers-daughter.appspot.com",
  messagingSenderId: process.env.FIREBASE_SENDER_ID,
  appId: process.env.FIREBASE_APP_ID
};

async function importRecipes(directoryPath: string) {
  try {
    const firebase = new FirebaseClient(firebaseConfig);
    const files = await fs.readdir(directoryPath);
    const markdownFiles = files.filter(file => file.endsWith('.md'));
    
    console.log(`Found ${markdownFiles.length} markdown files`);
    
    for (const file of markdownFiles) {
      const filePath = path.join(directoryPath, file);
      console.log(`Processing ${file}...`);
      
      try {
        const content = await fs.readFile(filePath, 'utf8');
        const markdown: RecipeMarkdown = { content, filePath };
        const recipe = RecipeParser.parse(markdown);
        
        if (recipe) {
          const docId = await firebase.addRecipe(recipe);
          console.log(`Added recipe "${recipe.title}" with ID: ${docId}`);
        }
      } catch (error) {
        console.error(`Error processing ${file}:`, error);
      }
    }
    
    console.log('Import complete!');
  } catch (error) {
    console.error('Error importing recipes:', error);
    process.exit(1);
  }
}

// Check command line arguments
const recipesDir = process.argv[2];
if (!recipesDir) {
  console.error('Please provide the path to your recipes directory');
  console.log('Usage: npm run import -- ./path/to/recipes');
  process.exit(1);
}

// Run the import
importRecipes(recipesDir);