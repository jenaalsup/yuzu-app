<script lang="ts">
  import { user } from '$lib/stores/auth';
  import { auth } from '$lib/firebase';
  import { goto } from '$app/navigation';

  async function handleSignOut() {
    if (!auth) return;
    try {
      await auth.signOut();
      goto('/signin');
    } catch (error) {
      console.error('Error signing out:', error);
    }
  }

  function handleSignIn() {
    goto('/signin');
  }
</script>

<header class="flex justify-between items-center p-4">
  <a href="/" class="flex items-center gap-2">
    <span class="text-xl font-bold">yuzu</span>
    <span class="text-xl font-bold text-orange-500">party</span>
  </a>
  
  <div class="flex items-center gap-4">
    <a href="/profile" class="text-sm hover:underline">Profile</a>
    {#if $user}
      <button 
        on:click={handleSignOut}
        class="text-sm hover:underline"
      >
        Sign Out
      </button>
    {:else}
      <button 
        on:click={handleSignIn}
        class="text-sm hover:underline"
      >
        Sign In
      </button>
    {/if}
  </div>
</header>