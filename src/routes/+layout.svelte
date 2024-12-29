<script lang="ts">
  import '../app.css';
  import Header from '$lib/components/Header.svelte';
  import { onMount } from 'svelte';
  import { auth } from '$lib/firebase';
  import { user, authInitialized } from '$lib/stores/auth';
  import { onAuthStateChanged } from 'firebase/auth';
  import { browser } from '$app/environment';

  let { children } = $props();

  onMount(() => {
    if (!browser) return;
    
    const unsubscribe = onAuthStateChanged(auth, (firebaseUser) => {
      if (firebaseUser) {
        user.set({
          uid: firebaseUser.uid,
          phoneNumber: firebaseUser.phoneNumber || '',
          displayName: firebaseUser.displayName || undefined,
          photoURL: firebaseUser.photoURL || undefined
        });
      } else {
        user.set(null);
      }
      authInitialized.set(true);
    });

    return unsubscribe;
  });
</script>

{#if $authInitialized}
  <div class="min-h-screen bg-white">
    <Header />
    <main>
      {@render children()}
    </main>
  </div>
{:else}
  <div class="min-h-screen flex items-center justify-center">
    <div class="animate-pulse">Loading...</div>
  </div>
{/if}