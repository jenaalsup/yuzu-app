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
  <a href="/" class="flex items-center gap-2 no-underline">
    <span class="text-xl font-bold text-pink-300 hover:text-pink-400">yuzu & me 🍋</span>
  </a>
  
  <div class="flex items-center gap-4">
    <a href="/profile" class="text-sm text-pink-300 hover:text-pink-400 no-underline">Profile</a>
    {#if $user}
      <button 
        on:click={handleSignOut}
        class="text-sm text-pink-300 hover:text-pink-400 no-underline"
      >
        Sign Out
      </button>
    {:else}
      <button 
        on:click={handleSignIn}
        class="text-sm text-pink-300 hover:text-pink-400 no-underline"
      >
        Sign In
      </button>
    {/if}
  </div>
</header>