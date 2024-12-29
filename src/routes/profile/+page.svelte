<script lang="ts">
  import { db, auth } from '$lib/firebase';
  import { collection, query, where, getDocs } from 'firebase/firestore';
  import type { Party } from '$lib/types';
  import { user } from '$lib/stores/auth';
  import { get } from 'svelte/store';
  import { goto } from '$app/navigation';
  import { onMount } from 'svelte';

  let hostedParties: Party[] = [];
  let attendingParties: Party[] = [];
  let loading = true;

  onMount(async () => {
    const currentUser = get(user);
    if (!currentUser) {
      goto('/signin');
      return;
    }

    try {
      const partiesRef = collection(db, 'parties');
      const hostedQuery = query(partiesRef, where('createdBy', '==', currentUser.uid));
      const hostedSnapshot = await getDocs(hostedQuery);
      
      hostedParties = hostedSnapshot.docs.map(doc => ({
        ...doc.data(),
        id: doc.id
      })) as Party[];

      const attendingQuery = query(
        partiesRef, 
        where(`guests.${currentUser.uid}.status`, 'in', ['yes', 'maybe', 'no'])
      );
      const attendingSnapshot = await getDocs(attendingQuery);
      
      attendingParties = attendingSnapshot.docs.map(doc => ({
        ...doc.data(),
        id: doc.id
      })) as Party[];

      loading = false;
    } catch (error) {
      console.error('Error fetching parties:', error);
    }
  });

  function getStatusText(party: Party) {
    const currentUser = get(user);
    if (!currentUser) return '';
    
    const status = party.guests[currentUser.uid]?.status;
    switch (status) {
      case 'yes': return '(Going)';
      case 'maybe': return '(Maybe)';
      case 'no': return '(Not Going)';
      default: return '';
    }
  }
</script>

<div class="min-h-screen bg-white">
  <main class="max-w-4xl mx-auto p-4">
    {#if loading}
      <div class="animate-pulse">Loading...</div>
    {:else}
      <div class="space-y-4">
        <div class="border-2 border-black shadow-[4px_4px_0px_0px_rgba(0,0,0,1)]">
          <div class="border-b-2 border-black p-4">
            <h2 class="font-medium">Parties You're Hosting</h2>
          </div>
          <div class="divide-y-2 divide-black">
            {#each hostedParties as party}
              <a 
                href={`/party/${party.id}`}
                class="block p-4 hover:bg-gray-50"
              >
                <div class="font-medium">{party.title}</div>
                <div class="text-sm text-gray-600">
                  {new Date(party.startDate).toLocaleDateString()} at {party.startTime}
                </div>
              </a>
            {/each}
          </div>
        </div>

        <div class="border-2 border-black shadow-[4px_4px_0px_0px_rgba(0,0,0,1)]">
          <div class="border-b-2 border-black p-4">
            <h2 class="font-medium">Parties You're Invited To</h2>
          </div>
          <div class="divide-y-2 divide-black">
            {#each attendingParties as party}
              <a 
                href={`/party/${party.id}`}
                class="block p-4 hover:bg-gray-50"
              >
                <div class="font-medium">{party.title}</div>
                <div class="text-sm text-gray-600">
                  {new Date(party.startDate).toLocaleDateString()} at {party.startTime}
                  <span class="ml-2">{getStatusText(party)}</span>
                </div>
              </a>
            {/each}
          </div>
        </div>
      </div>
    {/if}
  </main>
</div>