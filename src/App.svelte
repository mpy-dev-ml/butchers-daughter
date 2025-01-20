// src/App.svelte
<script lang="ts">
  import { Router, Link, Route } from "svelte-routing";
  import Navbar from "./components/Navbar.svelte";
  import Home from "./routes/Home.svelte";
  import RecipeList from "./routes/RecipeList.svelte";
  import RecipeDetail from "./routes/RecipeDetail.svelte";

  export let url = "";
</script>

<Router {url}>
  <div class="min-h-screen bg-gray-50">
    <Navbar />
    
    <main class="container mx-auto px-4 py-8">
      <Route path="/" component={Home} />
      <Route path="/recipes" component={RecipeList} />
      <Route path="/recipe/:id" component={RecipeDetail} />
    </main>
  </div>
</Router>