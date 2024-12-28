<script lang="ts">
  import { db } from '$lib/firebase';
  import { doc, getDoc } from 'firebase/firestore';
  import { page } from '$app/stores';
  import { onMount } from 'svelte';
  import type { Party } from '$lib/types';
  import { user } from '$lib/stores/auth';
  import { get } from 'svelte/store';
  import { browser } from '$app/environment';
  import { goto } from '$app/navigation';

  let party: Party | null = null;
  let error = '';
  let isHost = false;

  onMount(async () => {
    try {
      const partyId = $page.params.id;
      const partyDoc = await getDoc(doc(db, 'parties', partyId));
      
      if (partyDoc.exists()) {
        party = { id: partyDoc.id, ...partyDoc.data() } as Party;
        const currentUser = get(user);
        isHost = currentUser?.uid === party.createdBy;
        
        // If not host and not authenticated, redirect to RSVP page
        if (!isHost && !currentUser) {
          goto(`/party/${partyId}/rsvp`);
        }
      } else {
        error = 'Party not found';
      }
    } catch (e) {
      console.error('Error loading party:', e);
      error = 'Error loading party';
    }
  });
</script>

<div class="min-h-screen bg-white">
  <header class="flex justify-between items-center p-4">
    <div class="flex items-center gap-2">
      <span class="text-xl font-bold">yuzu</span>
      <span class="text-xl font-bold text-orange-500">party</span>
    </div>
  </header>

  <main class="max-w-4xl mx-auto p-4">
    {#if error}
      <div class="text-red-500">{error}</div>
    {:else if party}
      <div class="grid grid-cols-[2fr,1fr] gap-4">
        <!-- Left column - Party details -->
        <div class="space-y-4">
          <div class="border-2 border-black shadow-[4px_4px_0px_0px_rgba(0,0,0,1)] p-4">
            <h1 class="text-2xl font-bold mb-4">{party.title}</h1>
            
            <div class="space-y-2">
              <div class="flex items-center gap-2">
                <span class="text-gray-600">📅</span>
                <span>{new Date(party.startDate).toLocaleDateString()} at {party.startTime}</span>
              </div>
              
              <div class="flex items-center gap-2">
                <span class="text-gray-600">📍</span>
                <span>{party.location}</span>
              </div>

              <div class="flex items-center gap-2">
                <span class="text-gray-600">👤</span>
                <span>Hosted by {party.createdBy}</span>
              </div>
            </div>

            {#if party.description}
              <p class="mt-4">{party.description}</p>
            {/if}

            <div class="mt-4 text-sm">
              <span class="text-gray-600">Share: </span>
              <a 
                href={`${window.location.origin}/party/${$page.params.id}/rsvp`}
                target="_blank"
                rel="noopener noreferrer"
                class="text-blue-600 hover:underline"
              >
                {`${window.location.origin}/party/${$page.params.id}/rsvp`}
              </a>
            </div>
          </div>
        </div>

        <!-- Right column - Activity -->
        <div class="border-2 border-black shadow-[4px_4px_0px_0px_rgba(0,0,0,1)]">
          <div class="border-b-2 border-black p-4">
            <div class="flex justify-between items-center">
              <h2 class="font-medium">Activity</h2>
              <div class="text-sm">{party.guests.length} attending</div>
            </div>
          </div>
          
          <div class="p-4">
            <!-- Guest list -->
            {#each party.guests as guestId}
              <div class="flex items-center gap-2 py-2">
                <div class="w-8 h-8 bg-gray-200 rounded-full"></div>
                <div>
                  <div class="text-sm font-medium">
                    {guestId === party.createdBy ? 'Host' : 'Guest'}
                  </div>
                  <div class="text-sm text-gray-500">is attending</div>
                </div>
              </div>
            {/each}
          </div>
        </div>
      </div>
    {:else}
      <div class="animate-pulse">Loading...</div>
    {/if}
  </main>
</div>