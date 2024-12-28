<script lang="ts">
  import { db, auth } from '$lib/firebase';
  import { collection, addDoc } from 'firebase/firestore';
  import type { Party } from '$lib/types';
  import { user } from '$lib/stores/auth';
  import { get } from 'svelte/store';
  import { goto } from '$app/navigation';

  let title = '';
  let startDate = '';
  let startTime = '';
  let location = '';
  let description = '';
  let requireApproval = false;

  const generateDateTimeLocal = (date?: Date | number) => {
    const d = date ? new Date(date) : undefined;
    if (!d) return '';
    return new Date(d.getTime() - d.getTimezoneOffset() * 60000).toISOString().slice(0, 16);
  };

  const minDate = generateDateTimeLocal(new Date());

  async function handleSubmit() {
    if (!title.trim() || !startDate || !startTime || !location.trim()) return;

    const currentUser = get(user);
    if (!currentUser) {
      goto('/signin');
      return;
    }

    const party: Partial<Party> = {
      title,
      startDate,
      startTime,
      location,
      description,
      requireApproval,
      createdAt: Date.now(),
      createdBy: currentUser.uid
    };

    try {
      await addDoc(collection(db, 'parties'), party);
      
      // Reset form
      title = '';
      startDate = '';
      startTime = '';
      location = '';
      description = '';
      requireApproval = false;
    } catch (error) {
      console.error('Error creating party:', error);
    }
  }

  async function handleSignOut() {
    if (!auth) return;
    try {
      await auth.signOut();
      goto('/signin');
    } catch (error) {
      console.error('Error signing out:', error);
    }
  }
</script>

<svelte:head>
  <title>Create Party | Yuzu</title>
</svelte:head>

<div class="min-h-screen bg-white">
  <header class="flex justify-between items-center p-4">
    <div class="flex items-center gap-2">
      <span class="text-xl font-bold">yuzu</span>
      <span class="text-xl font-bold text-orange-500">party</span>
    </div>
    <button 
      on:click={handleSignOut}
      class="text-sm hover:underline"
    >
      Sign Out
    </button>
  </header>

  <main class="max-w-md mx-auto p-4">
    <div class="border-2 border-black shadow-[4px_4px_0px_0px_rgba(0,0,0,1)]">
      <div class="border-b-2 border-black p-4">
        <h1 class="text-xl font-medium">Create a party</h1>
      </div>
      <form on:submit|preventDefault={handleSubmit} class="p-4 space-y-4">
        <div>
          <label for="party-title" class="block text-sm mb-1">Title</label>
          <input
            id="party-title"
            type="text"
            bind:value={title}
            required
            maxlength="50"
            class="w-full border-2 border-black p-2"
            placeholder="Party title"
          />
        </div>

        <div>
          <label for="party-date" class="block text-sm mb-1">Date</label>
          <input
            id="party-date"
            type="datetime-local"
            bind:value={startDate}
            min={minDate}
            required
            class="w-full border-2 border-black p-2"
          />
        </div>

        <div>
          <label for="party-location" class="block text-sm mb-1">Location</label>
          <input
            id="party-location"
            type="text"
            bind:value={location}
            required
            maxlength="60"
            class="w-full border-2 border-black p-2"
            placeholder="Party location"
          />
        </div>

        <div>
          <label for="party-description" class="block text-sm mb-1">Description</label>
          <div
            id="party-description"
            contenteditable="true"
            bind:textContent={description}
            class="w-full border-2 border-black p-2 h-24 outline-none"
            data-placeholder="Party description (optional)"
          ></div>
        </div>

        <div class="flex items-center gap-2">
          <input
            type="checkbox"
            bind:checked={requireApproval}
            id="requireApproval"
            class="border-2 border-black"
          />
          <label for="requireApproval" class="text-sm">
            Require approval for attendees
          </label>
        </div>

        <button 
          type="submit"
          class="w-full bg-black text-white py-2 hover:bg-gray-800"
        >
          Create Party
        </button>
      </form>
    </div>
  </main>
</div>

<style>
  input[type="datetime-local"]::-webkit-calendar-picker-indicator {
    width: 100%;
    height: 100%;
    position: absolute;
    right: 0;
    background: none;
  }

  [contenteditable]:empty:before {
    content: attr(data-placeholder);
    color: #71717a;
  }
</style>