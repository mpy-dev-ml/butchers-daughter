// src/components/Navbar.svelte
<script lang="ts">
  import { Link } from "svelte-routing";
</script>

<nav class="bg-white shadow">
  <div class="container mx-auto px-4">
    <div class="flex justify-between h-16">
      <div class="flex">
        <div class="flex-shrink-0 flex items-center">
          <Link to="/" class="text-2xl font-bold text-gray-900">
            The Butcher's Daughter
          </Link>
        </div>
        
        <div class="hidden sm:ml-6 sm:flex sm:space-x-8">
          <Link 
            to="/"
            class="inline-flex items-center px-1 pt-1 text-gray-900"
          >
            Home
          </Link>
          
          <Link 
            to="/recipes"
            class="inline-flex items-center px-1 pt-1 text-gray-900"
          >
            Recipes
          </Link>
        </div>
      </div>
    </div>
  </div>
</nav>