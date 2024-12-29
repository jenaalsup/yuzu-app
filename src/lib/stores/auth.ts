import { writable, derived } from 'svelte/store';
import type { User } from '$lib/types'; 

export const user = writable<User | null>(null);
export const authInitialized = writable(false);
export const isAuthenticated = derived(
  [user, authInitialized],
  ([$user, $authInitialized]) => $authInitialized && $user !== null
);