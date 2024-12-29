import { redirect } from '@sveltejs/kit';
import type { PageLoad } from './$types';
import { isAuthenticated } from '$lib/stores/auth';
import { get } from 'svelte/store';

export const load: PageLoad = () => {
  if (!get(isAuthenticated)) {
    throw redirect(307, '/signin');
  }
};