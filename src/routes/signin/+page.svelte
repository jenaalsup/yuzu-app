<script lang="ts">
  import { auth } from '$lib/firebase';
  import { RecaptchaVerifier, signInWithPhoneNumber } from 'firebase/auth';
  import { goto } from '$app/navigation';

  let phoneNumber = '';
  let verificationCode = '';
  let error = '';
  let showVerificationInput = false;
  let confirmationResult: any = null;
  let recaptchaVerifier: any = null;

  async function handleSendCode() {
    try {
      error = '';
      if (!auth) throw new Error('Auth not initialized');

      // Format phone number to remove any non-digit characters except +
      let formattedPhone = phoneNumber.replace(/[^\d+]/g, '');
      if (!formattedPhone.startsWith('+')) {
        formattedPhone = '+1' + formattedPhone;
      }
      console.log('Sending code to:', formattedPhone);
      
      /*// Initialize reCAPTCHA
      recaptchaVerifier = new RecaptchaVerifier(auth, 'recaptcha-container', {
        size: 'normal'
      });

      await recaptchaVerifier.render();*/


      // Initialize reCAPTCHA
      recaptchaVerifier = new RecaptchaVerifier(auth, 'recaptcha-container', {
        size: 'normal',
        callback: () => {
          console.log('reCAPTCHA solved');
        },
        'expired-callback': () => {
          error = 'reCAPTCHA expired, please try again';
          recaptchaVerifier?.clear();
          recaptchaVerifier = null;
        }
      });

      try {
        await recaptchaVerifier.render();
      } catch (e) {
        console.error('reCAPTCHA render error:', e);
        error = 'Failed to initialize reCAPTCHA';
        return;
      }
      
      confirmationResult = await signInWithPhoneNumber(
        auth,
        formattedPhone,
        recaptchaVerifier
      );
      
      showVerificationInput = true;
    } catch (e) {
      error = 'Error sending verification code';
      console.error('Send code error:', e);
    }
  }

  async function handleVerifyCode() {
    try {
      error = '';
      if (!confirmationResult) throw new Error('No confirmation result');
      
      await confirmationResult.confirm(verificationCode);
      goto('/create');
    } catch (e) {
      error = 'Invalid verification code';
      console.error('Verification error:', e);
    }
  }
</script>

<div class="min-h-screen bg-white">
  <header class="flex justify-between items-center p-4">
    <div class="flex items-center gap-2">
      <span class="text-xl font-bold">yuzu</span>
      <span class="text-xl font-bold text-orange-500">party</span>
    </div>
  </header>
      
  <main class="max-w-md mx-auto p-4">
    <div class="border-2 border-black shadow-[4px_4px_0px_0px_rgba(0,0,0,1)]">
      <div class="border-b-2 border-black p-4">
        <h1 class="text-xl font-medium">Sign In</h1>
      </div>
      <div class="p-4 space-y-4">
        {#if error}
          <div class="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded">
            {error}
          </div>
        {/if}
        
        {#if !showVerificationInput}
          <div>
            <label for="phone" class="block text-sm mb-1">Phone Number</label>
            <input
              type="tel"
              bind:value={phoneNumber}
              placeholder="+1 (555) 555-5555"
              required
              class="w-full border-2 border-black p-2"
            />
          </div>

          <!-- reCAPTCHA will be rendered here -->
          <div id="recaptcha-container"></div>

          <button 
            on:click={handleSendCode}
            class="w-full bg-black text-white py-2 hover:bg-gray-800"
          >
            Send Code
          </button>
        {:else}
          <div>
            <label for="phone" class="block text-sm mb-1">Verification Code</label>
            <input
              type="text"
              bind:value={verificationCode}
              placeholder="Enter 6-digit code"
              required
              class="w-full border-2 border-black p-2"
            />
          </div>

          <button 
            on:click={handleVerifyCode}
            class="w-full bg-black text-white py-2 hover:bg-gray-800"
          >
            Verify Code
          </button>
        {/if}
      </div>
    </div>
  </main>
</div>