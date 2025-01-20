// src/routes/RecipeList.svelte
<script lang="ts">
  import { onMount } from 'svelte';
  import { Link, useNavigate } from 'svelte-routing';
  import { recipeStore } from '../stores/recipeStore';

  let searchTerm = '';
  let selectedCategory = '';
  const navigate = useNavigate();

  // Get category from URL if present
  onMount(() => {
    const params = new URLSearchParams(window.location.search);
    const category = params.get('category');
    if (category) {
      selectedCategory = category;
      recipeStore.loadRecipesByCategory(category);
    } else {
      recipeStore.loadAllRecipes();
    }
  });

  function handleSearch() {
    if (searchTerm.trim()) {
      recipeStore.searchRecipes(searchTerm);
    } else {
      recipeStore.loadAllRecipes();
    }
  }

  function handleCategoryChange() {
    if (selectedCategory) {
      navigate(`/recipes?category=${selectedCategory}`);
      recipeStore.loadRecipesByCategory(selectedCategory);
    } else {
      navigate('/recipes');
      recipeStore.loadAllRecipes();
    }
  }
</script>

<div>
  <!-- Search and Filter Section -->
  <div class="bg-white shadow rounded-lg p-6 mb-8">
    <div class="flex flex-col md:flex-row gap-4">
      <div class="flex-1">
        <input
          type="text"
          bind:value={searchTerm}
          on:input={handleSearch}
          placeholder="Search recipes..."
          class="w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
        />
      </div>
      
      <div class="w-full md:w-48">
        <select
          bind:value={selectedCategory}
          on:change={handleCategoryChange}
          class="w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
        >
          <option value="">All Categories</option>
          <option value="meat">Meat</option>
          <option value="dairy">Dairy</option>
          <option value="pareve">Pareve</option>
        </select>
      </div>
    </div>
  </div>

  <!-- Recipe Grid -->
  {#if $recipeStore.loading}
    <div class="flex justify-center py-12">
      <div class="animate-spin rounded-full h-12 w-12 border-b-2 border-gray-900"></div>
    </div>
  {:else if $recipeStore.error}
    <div class="text-red-500 text-center py-12">
      Error: {$recipeStore.error}
    </div>
  {:else if $recipeStore.recipes.length === 0}
    <div class="text-gray-500 text-center py-12">
      No recipes found. Try adjusting your search or filters.
    </div>
  {:else}
    <div class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
      {#each $recipeStore.recipes as recipe}
        <Link 
          to={`/recipe/${recipe.id}`}
          class="block bg-white rounded-lg overflow-hidden shadow-md hover:shadow-lg transition"
        >
          {#if recipe.imageUrl}
            <img 
              src={recipe.imageUrl} 
              alt={recipe.title}
              class="w-full h-48 object-cover"
            />
          {/if}
          <div class="p-4">
            <h2 class="text-xl font-semibold mb-2">{recipe.title}</h2>
            <p class="text-gray-600 mb-2">By {recipe.author}</p>
            <div class="flex flex-wrap gap-4 text-sm text-gray-500">
              <span class="flex items-center">
                <svg class="w-4 h-4 mr-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
                Prep: {recipe.prepTime}
              </span>
              <span class="flex items-center">
                <svg class="w-4 h-4 mr-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M17 8h2a2 2 0 012 2v6a2 2 0 01-2 2h-2v4l-4-4H9a1.994 1.994 0 01-1.414-.586m0 0L11 14h4a2 2 0 002-2V6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2v4l.586-.586z" />
                </svg>
                Cook: {recipe.cookTime}
              </span>
            </div>
            <div class="mt-2">
              <span class="inline-block px-2 py-1 text-sm bg-gray-100 rounded-full">
                {recipe.category}
              </span>
            </div>
          </div>
        </Link>
      {/each}
    </div>
  {/if}
</div>