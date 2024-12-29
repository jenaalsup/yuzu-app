<script lang="ts">
  import { db } from '$lib/firebase';
  import { deleteDoc, doc } from 'firebase/firestore';
  import { page } from '$app/stores';
  import { onMount } from 'svelte';
  import type { Party } from '$lib/types';
  import { user } from '$lib/stores/auth';
  import { goto } from '$app/navigation';
  import { loadParty } from '$lib/utils/party';

  const partyId = $page.params.id;
  let party: Party | null = null;
  let error = '';
  let isHost = false;

  onMount(async () => {
    const result = await loadParty(partyId);
    party = result.party;
    error = result.error;
    isHost = result.isHost;

    // If not host and not authenticated, redirect to RSVP page
    if (!isHost && !$user) {
      goto(`/party/${partyId}/rsvp`);
    }
  });

  async function handleDelete() {
    if (!party || !confirm('Are you sure you want to delete this party?')) return;

    try {
      await deleteDoc(doc(db, 'parties', party.id));
      goto('/profile');
    } catch (error) {
      console.error('Error deleting party:', error);
    }
  }
</script>

<div class="min-h-screen bg-white">
  <main class="max-w-4xl mx-auto p-4">
    {#if error}
      <div class="text-red-500">{error}</div>
    {:else if party}
      <div class="grid grid-cols-[2fr,1fr] gap-4">
        <!-- Left column - Party details -->
        <div class="space-y-4">
          <div class="border-2 border-black shadow-[4px_4px_0px_0px_rgba(0,0,0,1)] p-4 relative">
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
                <span>Hosted by {party.createdByName}</span>
              </div>
            </div>

            {#if party.description}
              <p class="mt-4">{party.description}</p>
            {/if}

            <div class="mt-4 text-sm">
              <span class="text-gray-600">Share: </span>
              <a 
                href={`${window.location.origin}/party/${partyId}/rsvp`}
                target="_blank"
                rel="noopener noreferrer"
                class="text-blue-600 hover:underline"
              >
                {`${window.location.origin}/party/${partyId}/rsvp`}
              </a>
            </div>

            {#if isHost}
              <button 
                on:click={handleDelete}
                class="absolute bottom-4 right-4 text-gray-600 hover:text-black"
              >
                🗑️
              </button>
            {/if}
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