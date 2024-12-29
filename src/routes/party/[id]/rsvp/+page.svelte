<script lang="ts">
  import { db } from '$lib/firebase';
  import { doc, updateDoc } from 'firebase/firestore';
  import { page } from '$app/stores';
  import { onMount } from 'svelte';
  import type { Party } from '$lib/types';
  import { user } from '$lib/stores/auth';
  import { goto } from '$app/navigation';
  import { loadParty } from '$lib/utils/party';

  let party: Party | null = null;
  let error = '';
  let userRsvpStatus: 'yes' | 'maybe' | 'no' | null = null;
  const partyId = $page.params.id;

  onMount(async () => {
    const result = await loadParty(partyId);
    party = result.party;
    error = result.error;

    if (party && $user) {
      userRsvpStatus = party.guests[$user.uid]?.status || null;
    }
  });

  async function handleRsvp(status: 'yes' | 'maybe' | 'no') {
    if (!party || !$user) return;

    try {
      const partyRef = doc(db, 'parties', partyId);
      const guestName = $user.displayName || 'Guest';
      
      // First update the local party state to show immediate feedback
      if (!party.guests) party.guests = {};
      party.guests[$user.uid] = {
        status,
        timestamp: Date.now(),
        displayName: guestName
      };
      userRsvpStatus = status;

      // Then update Firestore
      await updateDoc(partyRef, {
        [`guests.${$user.uid}`]: {
          status,
          timestamp: Date.now(),
          displayName: guestName
        }
      });
    } catch (e) {
      console.error('Error updating RSVP:', e);
      error = 'Error updating RSVP';
      
      // Revert local state if the update failed
      const result = await loadParty(partyId);
      party = result.party;
    }
  }
</script>

<div class="min-h-screen bg-white">
  <main class="max-w-md mx-auto p-4">
    {#if error}
      <div class="text-pink-400">{error}</div>
    {:else if party}
      <div class="border-2 border-black shadow-[4px_4px_0px_0px_rgba(0,0,0,1)]">
        <div class="p-4">
          <h1 class="text-2xl font-bold">{party.title}</h1>
          
          <div class="mt-4 space-y-2">
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
        </div>
        
        <div class="border-t-2 border-black">
          {#if !$user}
            <button 
              class="w-full p-4 hover:bg-gray-100"
              on:click={() => goto(`/signin?redirect=/party/${partyId}/rsvp`)}
            >
              Sign in to RSVP
            </button>
          {:else if $user?.uid === party?.createdBy}
            <div class="p-4 text-center text-gray-600">
              You're the host!
            </div>
          {:else if userRsvpStatus}
            <div class="p-4 text-center">
              You're a {userRsvpStatus === 'maybe' ? 'maybe going' : userRsvpStatus}!
            </div>
          {:else}
            <div class="grid grid-cols-3">
              <button 
                class="p-4 hover:bg-gray-100 border-r-2 border-black"
                on:click={() => handleRsvp('yes')}
              >
                Yes
              </button>
              <button 
                class="p-4 hover:bg-gray-100 border-r-2 border-black"
                on:click={() => handleRsvp('maybe')}
              >
                Maybe
              </button>
              <button 
                class="p-4 hover:bg-gray-100"
                on:click={() => handleRsvp('no')}
              >
                No
              </button>
            </div>
          {/if}
        </div>
      </div>
    {:else}
      <div class="animate-pulse">Loading...</div>
    {/if}
  </main>
</div>