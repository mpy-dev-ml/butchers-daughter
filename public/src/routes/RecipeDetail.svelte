// src/routes/RecipeDetail.svelte
<script lang="ts">
  import { onMount } from 'svelte';
  import { Link } from 'svelte-routing';
  import { FirestoreDB } from '../utils/firebase';
  import { parseIngredient, formatIngredient } from '../utils/scaling';
  import { convertUnit, normalizeUnit } from '../utils/unitConversion';

  export let id: string;
  
  let recipe = null;
  let loading = true;
  let error = null;
  let servingScale = 1;
  let originalServes = '';
  let parsedIngredients = [];
  let measurementSystem: 'imperial' | 'metric' = 'imperial';
  let originalSystem: 'imperial' | 'metric' = 'imperial';
  
  const db = new FirestoreDB();

  onMount(async () => {
    try {
      recipe = await db.getRecipe(id);
      originalServes = recipe.serves;
      // Parse all ingredients on load
      parsedIngredients = recipe.ingredients.map(ing => parseIngredient(ing));
      loading = false;
    } catch (err) {
      error = err.message;
      loading = false;
    }
  });

  function convertIngredient(ingredient) {
    if (!ingredient.hasAmount || !ingredient.unit) {
      return ingredient;
    }

    const converted = convertUnit(
      ingredient.amount,
      ingredient.unit,
      measurementSystem
    );

    return {
      ...ingredient,
      amount: converted.value,
      unit: converted.unit
    };
  }

  function getScaledAndConvertedIngredients() {
    return parsedIngredients.map(ing => {
      const converted = convertIngredient(ing);
      return formatIngredient(converted, servingScale);
    });
  }

  function toggleMeasurementSystem() {
    measurementSystem = measurementSystem === 'imperial' ? 'metric' : 'imperial';
  }

  function printRecipe() {
    window.print();
  }
</script>

<div class="max-w-4xl mx-auto">
  {#if loading}
    <div class="flex justify-center py-12">
      <div class="animate-spin rounded-full h-12 w-12 border-b-2 border-gray-900"></div>
    </div>
  {:else if error}
    <div class="text-red-500 text-center py-12">
      Error loading recipe: {error}
    </div>
  {:else if !recipe}
    <div class="text-gray-500 text-center py-12">
      Recipe not found
    </div>
  {:else}
    <!-- Recipe Header -->
    <div class="bg-white rounded-lg shadow-lg overflow-hidden mb-8">
      {#if recipe.imageUrl}
        <img 
          src={recipe.imageUrl} 
          alt={recipe.title}
          class="w-full h-64 object-cover"
        />
      {/if}
      
      <div class="p-6">
        <div class="flex justify-between items-start">
          <div>
            <h1 class="text-3xl font-bold text-gray-900 mb-2">{recipe.title}</h1>
            <p class="text-gray-600">By {recipe.author}</p>
          </div>
          
          <button
            on:click={printRecipe}
            class="px-4 py-2 bg-gray-100 text-gray-700 rounded-lg hover:bg-gray-200 transition"
          >
            <svg class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M17 17h2a2 2 0 002-2v-4a2 2 0 00-2-2H5a2 2 0 00-2 2v4a2 2 0 002 2h2m2 4h6a2 2 0 002-2v-4a2 2 0 00-2-2H9a2 2 0 00-2 2v4a2 2 0 002 2zm8-12V5a2 2 0 00-2-2H9a2 2 0 00-2 2v4h10z" />
            </svg>
          </button>
        </div>

        <div class="flex flex-wrap gap-4 mt-4 text-sm text-gray-500">
          <span class="flex items-center">
            <svg class="w-4 h-4 mr-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
            </svg>
            Prep Time: {recipe.prepTime}
          </span>
          <span class="flex items-center">
            <svg class="w-4 h-4 mr-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M17 8h2a2 2 0 012 2v6a2 2 0 01-2 2h-2v4l-4-4H9a1.994 1.994 0 01-1.414-.586m0 0L11 14h4a2 2 0 002-2V6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2v4l.586-.586z" />
            </svg>
            Cook Time: {recipe.cookTime}
          </span>
          <span class="flex items-center">
            <svg class="w-4 h-4 mr-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
            </svg>
            Serves: {recipe.serves}
          </span>
          <span class="inline-block px-2 py-1 bg-gray-100 rounded-full">
            {recipe.category}
          </span>
        </div>
      </div>
    </div>

    <!-- Recipe Content -->
    <div class="grid grid-cols-1 md:grid-cols-2 gap-8">
<!-- Ingredients Section -->
  <div class="bg-white rounded-lg shadow p-6">
    <div class="flex justify-between items-center mb-4">
      <h2 class="text-xl font-semibold">Ingredients</h2>
      
      <div class="flex items-center space-x-4">
        <!-- Scaling Controls -->
        <div class="flex items-center space-x-2">
          <button
            on:click={scaleDown}
            disabled={servingScale <= 0.5}
            class="p-2 rounded-lg bg-gray-100 hover:bg-gray-200 disabled:opacity-50"
            title="Scale down"
          >
            <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M20 12H4" />
            </svg>
          </button>

          <button
            on:click={resetScale}
            class="px-3 py-1 text-sm rounded-lg bg-blue-100 hover:bg-blue-200 text-blue-800"
            class:hidden={servingScale === 1}
          >
            Reset
          </button>

          <span class="text-sm text-gray-600">
            {servingScale}x
          </span>

          <button
            on:click={scaleUp}
            class="p-2 rounded-lg bg-gray-100 hover:bg-gray-200"
            title="Scale up"
          >
            <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 4v16m8-8H4" />
            </svg>
          </button>
        </div>

        <!-- Unit Conversion Toggle -->
        <button
          on:click={toggleMeasurementSystem}
          class="px-3 py-1 text-sm rounded-lg bg-gray-100 hover:bg-gray-200"
        >
          {measurementSystem === 'imperial' ? 'Switch to Metric' : 'Switch to Imperial'}
        </button>
      </div>
    </div>

    <ul class="space-y-2">
      {#each getScaledAndConvertedIngredients() as ingredient}
        <li class="flex items-center">
          <svg class="w-4 h-4 mr-2 text-green-500 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M5 13l4 4L19 7" />
          </svg>
          <span>{ingredient}</span>
        </li>
      {/each}
    </ul>
  </div>

  <!-- Instructions Section -->
  <div class="bg-white rounded-lg shadow p-6">
    <h2 class="text-xl font-semibold mb-4">Instructions</h2>
    <ol class="space-y-4">
      {#each recipe.instructions as instruction, i}
        <li class="flex">
          <span class="flex-shrink-0 w-8 h-8 flex items-center justify-center rounded-full bg-blue-500 text-white font-semibold mr-3">
            {i + 1}
          </span>
          <p class="flex-1">{
            // Convert any temperatures in instructions
            instruction.replace(/(\d+)°([FC])/g, (match, temp, unit) => {
              if (measurementSystem === 'metric' && unit === 'F') {
                return `${convertTemperature(parseInt(temp), 'F', 'C')}°C`;
              } else if (measurementSystem === 'imperial' && unit === 'C') {
                return `${convertTemperature(parseInt(temp), 'C', 'F')}°F`;
              }
              return match;
            })
          }</p>
        </li>
      {/each}
    </ol>
  </div>

    <!-- Source and Navigation -->
    <div class="mt-8 flex justify-between items-center">
      <Link 
        to="/recipes" 
        class="text-blue-600 hover:text-blue-800"
      >
        ← Back to Recipes
      </Link>
      
      {#if recipe.source}
        <a 
          href={recipe.source} 
          target="_blank" 
          rel="noopener noreferrer"
          class="text-gray-600 hover:text-gray-800"
        >
          Source →
        </a>
      {/if}
    </div>
  {/if}
</div>

<style>
  @media print {
    :global(nav), :global(footer), button {
      display: none !important;
    }
    .bg-white {
      box-shadow: none !important;
    }
  }
</style>