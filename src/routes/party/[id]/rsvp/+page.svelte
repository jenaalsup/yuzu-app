<script lang="ts">
  import { db } from '$lib/firebase';
  import { doc, getDoc, updateDoc } from 'firebase/firestore';
  import { page } from '$app/stores';
  import { onMount } from 'svelte';
  import type { Party } from '$lib/types';
  import { user } from '$lib/stores/auth';
  import { get } from 'svelte/store';
  import { goto } from '$app/navigation';

  let party: Party | null = null;
  let error = '';
  let userRsvpStatus: 'yes' | 'maybe' | 'no' | null = null;
  const partyId = $page.params.id;  


  onMount(async () => {
    try {
      const partyDoc = await getDoc(doc(db, 'parties', partyId));
      
      if (partyDoc.exists()) {
        party = { id: partyDoc.id, ...partyDoc.data() } as Party;
        const currentUser = get(user);
        if (currentUser) {
          userRsvpStatus = party.guests[currentUser.uid]?.status || null;
        }
      } else {
        error = 'Party not found';
      }
    } catch (e) {
      console.error('Error loading party:', e);
      error = 'Error loading party';
    }
  });

  async function handleRSVP(choice: 'yes' | 'maybe' | 'no') {
    if (!party) return;
    
    const currentUser = get(user);
    if (!currentUser) {
      goto(`/signin?redirect=/party/${partyId}/rsvp`);
      return;
    }

    // Don't allow host to RSVP
    if (currentUser.uid === party.createdBy) {
      error = "You're the host!";
      return;
    }

    try {
      const partyRef = doc(db, 'parties', partyId);
      await updateDoc(partyRef, {
        [`guests.${currentUser.uid}`]: {
          status: choice,
          timestamp: Date.now()
        }
      });
      
      userRsvpStatus = choice;
    } catch (error) {
      console.error('Error submitting RSVP:', error);
    }
  }

  function getRsvpStatusText(status: string) {
    switch (status) {
      case 'yes': return "You're going!";
      case 'maybe': return "You might go";
      case 'no': return "You can't make it";
      default: return '';
    }
  }
</script>

<div class="min-h-screen bg-white">
  <main class="max-w-md mx-auto p-4">
    {#if error}
      <div class="text-red-500">{error}</div>
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
          {#if !get(user)}
            <button 
              class="w-full p-4 hover:bg-gray-100"
              on:click={() => goto(`/signin?redirect=/party/${partyId}/rsvp`)}
            >
              Sign in to RSVP
            </button>
          {:else if get(user)?.uid === party?.createdBy}
            <div class="p-4 text-center text-gray-600">
              You're the host!
            </div>
          {:else if userRsvpStatus}
            <div class="p-4 text-center">
              {getRsvpStatusText(userRsvpStatus)}
            </div>
          {:else}
            <div class="grid grid-cols-3">
              <button 
                class="p-4 hover:bg-gray-100 border-r-2 border-black"
                on:click={() => handleRSVP('yes')}
              >
                Yes
              </button>
              <button 
                class="p-4 hover:bg-gray-100 border-r-2 border-black"
                on:click={() => handleRSVP('maybe')}
              >
                Maybe
              </button>
              <button 
                class="p-4 hover:bg-gray-100"
                on:click={() => handleRSVP('no')}
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