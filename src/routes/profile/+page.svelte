<script lang="ts">
  import { db } from '$lib/firebase';
  import { collection, query, where, getDocs } from 'firebase/firestore';
  import type { Party } from '$lib/types';
  import { user } from '$lib/stores/auth';
  import { goto } from '$app/navigation';
  import { onMount } from 'svelte';

  let hostedParties: Party[] = [];
  let attendingParties: Party[] = [];
  let loading = true;

  onMount(async () => {
    if (!$user) {
      goto('/signin');
      return;
    }

    try {
      const partiesRef = collection(db, 'parties');
      const hostedQuery = query(partiesRef, where('createdBy', '==', $user.uid));
      const hostedSnapshot = await getDocs(hostedQuery);
      
      hostedParties = hostedSnapshot.docs.map(doc => ({
        ...doc.data(),
        id: doc.id
      })) as Party[];

      const attendingQuery = query(
        partiesRef, 
        where(`guests.${$user.uid}.status`, 'in', ['yes', 'maybe'])
      );
      const attendingSnapshot = await getDocs(attendingQuery);
      
      attendingParties = attendingSnapshot.docs
        .map(doc => ({
          ...doc.data(),
          id: doc.id
        })) as Party[];

      loading = false;
    } catch (error) {
      console.error('Error loading parties:', error);
      loading = false;
    }
  });

  function getStatusText(party: Party): string {
    if (!$user) return '';

    const status = party.guests[$user.uid]?.status;
    switch (status) {
      case 'yes':
        return 'Going';
      case 'maybe':
        return 'Maybe';
      case 'no':
        return 'Not going';
      default:
        return '';
    }
  }
</script>

<div class="max-w-4xl mx-auto p-4">
  <h1 class="text-2xl font-bold mb-8">Your Parties</h1>

  {#if loading}
    <div class="animate-pulse">Loading...</div>
  {:else}
    <div class="space-y-8">
      <!-- Hosted parties -->
      <div>
        <h2 class="text-xl font-medium mb-4">Parties You're Hosting</h2>
        {#if hostedParties.length === 0}
          <p class="text-gray-500">You're not hosting any parties yet.</p>
        {:else}
          <div class="grid gap-4">
            {#each hostedParties as party}
              <a 
                href="/party/{party.id}"
                class="block p-4 border-2 border-black shadow-[4px_4px_0px_0px_rgba(0,0,0,1)] hover:shadow-[2px_2px_0px_0px_rgba(0,0,0,1)] transition-shadow"
              >
                <div class="font-medium text-pink-300 hover:text-pink-400">{party.title}</div>
                <div class="text-sm text-gray-500">
                  {new Date(party.startDate).toLocaleDateString()} at {party.startTime}
                </div>
              </a>
            {/each}
          </div>
        {/if}
      </div>

      <!-- Attending parties -->
      <div>
        <h2 class="text-xl font-medium mb-4">Parties You're Attending</h2>
        {#if attendingParties.length === 0}
          <p class="text-gray-500">You're not attending any parties yet.</p>
        {:else}
          <div class="grid gap-4">
            {#each attendingParties as party}
              <a 
                href="/party/{party.id}"
                class="block p-4 border-2 border-black shadow-[4px_4px_0px_0px_rgba(0,0,0,1)] hover:shadow-[2px_2px_0px_0px_rgba(0,0,0,1)] transition-shadow"
              >
                <div class="font-medium text-pink-300 hover:text-pink-400">{party.title}</div>
                <div class="text-sm text-gray-500">
                  {new Date(party.startDate).toLocaleDateString()} at {party.startTime}
                </div>
                <div class="text-sm text-gray-500">
                  {getStatusText(party)}
                </div>
              </a>
            {/each}
          </div>
        {/if}
      </div>
    </div>
  {/if}
</div>