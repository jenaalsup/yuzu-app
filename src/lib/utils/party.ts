import { db } from '$lib/firebase';
import { doc, getDoc } from 'firebase/firestore';
import type { Party } from '$lib/types';
import { user } from '$lib/stores/auth';
import { get } from 'svelte/store';

export async function loadParty(partyId: string): Promise<{
  party: Party | null;
  error: string;
  isHost: boolean;
}> {
  try {
    const partyDoc = await getDoc(doc(db, 'parties', partyId));
    if (partyDoc.exists()) {
      const party = { id: partyDoc.id, ...partyDoc.data() } as Party;
      const currentUser = get(user);
      const isHost = currentUser?.uid === party.createdBy;
      
      return {
        party,
        error: '',
        isHost
      };
    }
    return { party: null, error: 'Party not found', isHost: false };
  } catch (e) {
    console.error('Error loading party:', e);
    return { party: null, error: 'Error loading party', isHost: false };
  }
}