// src/routes/Home.svelte
<script lang="ts">
  import { onMount } from 'svelte';
  import { Link } from 'svelte-routing';
  import { recipeStore } from '../stores/recipeStore';

  let featuredRecipes = [];
  let loading = true;
  let error = null;

  onMount(async () => {
    try {
      await recipeStore.loadAllRecipes();
      // Get the 6 most recent recipes for the featured section
      featuredRecipes = $recipeStore.recipes.slice(0, 6);
      loading = false;
    } catch (err) {
      error = err.message;
      loading = false;
    }
  });

  const categories = [
    { id: 'meat', name: 'Meat Dishes', description: 'Hearty meat-based recipes' },
    { id: 'dairy', name: 'Dairy', description: 'Creamy dairy-based dishes' },
    { id: 'pareve', name: 'Pareve', description: 'Versatile pareve recipes' }
  ];
</script>

<div class="space-y-12">
  <!-- Hero Section -->
  <div class="bg-gray-100 rounded-xl p-8 md:p-12">
    <div class="text-center">
      <h1 class="text-4xl md:text-5xl font-bold text-gray-900 mb-4">
        Welcome to The Butcher's Daughter
      </h1>
      <p class="text-xl text-gray-600 mb-8">
        Discover delicious kosher recipes for every occasion
      </p>
      <Link 
        to="/recipes" 
        class="inline-block bg-blue-600 text-white px-8 py-3 rounded-lg hover:bg-blue-700 transition"
      >
        Browse All Recipes
      </Link>
    </div>
  </div>

  <!-- Categories Section -->
  <section>
    <h2 class="text-3xl font-bold text-gray-900 mb-6">Recipe Categories</h2>
    <div class="grid grid-cols-1 md:grid-cols-3 gap-6">
      {#each categories as category}
        <Link 
          to={`/recipes?category=${category.id}`}
          class="block p-6 bg-white rounded-lg shadow-md hover:shadow-lg transition"
        >
          <h3 class="text-xl font-semibold mb-2">{category.name}</h3>
          <p class="text-gray-600">{category.description}</p>
        </Link>
      {/each}
    </div>
  </section>

  <!-- Featured Recipes Section -->
  <section>
    <h2 class="text-3xl font-bold text-gray-900 mb-6">Featured Recipes</h2>
    
    {#if loading}
      <div class="flex justify-center py-12">
        <div class="animate-spin rounded-full h-12 w-12 border-b-2 border-gray-900"></div>
      </div>
    {:else if error}
      <div class="text-red-500 text-center py-12">
        Error loading recipes: {error}
      </div>
    {:else if featuredRecipes.length === 0}
      <div class="text-gray-500 text-center py-12">
        No recipes available
      </div>
    {:else}
      <div class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {#each featuredRecipes as recipe}
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
              <h3 class="text-xl font-semibold mb-2">{recipe.title}</h3>
              <p class="text-gray-600 mb-2">By {recipe.author}</p>
              <div class="flex justify-between text-sm text-gray-500">
                <span>Prep: {recipe.prepTime}</span>
                <span>Cook: {recipe.cookTime}</span>
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
  </section>

  <!-- Newsletter Section -->
  <section class="bg-blue-50 rounded-xl p-8 text-center">
    <h2 class="text-2xl font-bold text-gray-900 mb-4">
      Stay Updated
    </h2>
    <p class="text-gray-600 mb-6">
      Subscribe to receive new recipes and cooking tips
    </p>
    <form class="max-w-md mx-auto">
      <div class="flex gap-2">
        <input
          type="email"
          placeholder="Enter your email"
          class="flex-1 px-4 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
        />
        <button
          type="submit"
          class="px-6 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition"
        >
          Subscribe
        </button>
      </div>
    </form>
  </section>
</div>