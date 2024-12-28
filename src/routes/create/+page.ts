import { redirect } from '@sveltejs/kit';
import type { PageLoad } from './$types';
import { user } from '$lib/stores/auth';
import { get } from 'svelte/store';

export const load: PageLoad = () => {
  if (!get(user)) {
    throw redirect(307, '/signin');
  }
};