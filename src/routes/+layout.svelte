<script lang="ts">
  import '../app.css';
  import Header from '$lib/components/Header.svelte';
  import { onMount } from 'svelte';
  import { auth } from '$lib/firebase';
  import { user, authInitialized } from '$lib/stores/auth';
  import { onAuthStateChanged, type User as FirebaseUser } from 'firebase/auth';
  import { browser } from '$app/environment';

  onMount(() => {
    if (!browser) return;
    
    const unsubscribe = onAuthStateChanged(auth, (firebaseUser: FirebaseUser | null) => {
      if (firebaseUser) {
        user.set({
          uid: firebaseUser.uid,
          phoneNumber: firebaseUser.phoneNumber || '',
          displayName: firebaseUser.displayName || 'Unknown User'
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
      <slot />
    </main>
  </div>
{:else}
  <div class="min-h-screen flex items-center justify-center">
    <div class="animate-pulse">Loading...</div>
  </div>
{/if}