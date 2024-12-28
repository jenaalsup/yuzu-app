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

      // Format phone number
      let formattedPhone = phoneNumber.replace(/[^\d+]/g, '');
      if (!formattedPhone.startsWith('+')) {
        formattedPhone = '+1' + formattedPhone;
      }
      console.log('Sending code to:', formattedPhone);
      
      // Initialize reCAPTCHA with specific settings
      recaptchaVerifier = new RecaptchaVerifier(auth, 'recaptcha-container', {
        size: 'normal',
        callback: () => {
          console.log('reCAPTCHA verified');
        },
        'expired-callback': () => {
          error = 'reCAPTCHA expired, please try again';
          recaptchaVerifier?.clear();
          recaptchaVerifier = null;
        }
      });

      // Render the reCAPTCHA widget
      await recaptchaVerifier.render();
      
      confirmationResult = await signInWithPhoneNumber(
        auth,
        formattedPhone,
        recaptchaVerifier
      );
      
      showVerificationInput = true;
    } catch (e: any) {
      console.error('Detailed error:', e);
      error = e.message || 'Error sending verification code';
      // Reset reCAPTCHA on error
      if (recaptchaVerifier) {
        recaptchaVerifier.clear();
        recaptchaVerifier = null;
      }
    }
  }

  async function handleVerifyCode() {
    try {
      error = '';
      if (!confirmationResult) throw new Error('No confirmation result');
      
      const result = await confirmationResult.confirm(verificationCode);
      if (result.user) {
        goto('/create');
      }
    } catch (e: any) {
      console.error('Verification error:', e);
      error = e.message || 'Invalid verification code';
    }
  }
</script>


<script lang="ts">
</script>

<div class="min-h-screen bg-white">
  <header class="flex justify-between items-center p-4">
    <div class="flex items-center gap-2">
      <span class="text-xl font-bold">yuzu</span>
      <span class="text-xl font-bold text-orange-500">party</span>
    </div>
    <a href="/signin" class="text-sm">Sign In</a>
  </header>

  <main class="max-w-md mx-auto p-4">
    <div class="border-2 border-black shadow-[4px_4px_0px_0px_rgba(0,0,0,1)]">
      <div class="border-b-2 border-black p-4">
        <h1 class="text-xl font-medium">Create a party</h1>
      </div>
    </div>
  </main>

  <footer class="fixed bottom-4 w-full text-center text-gray-500 text-sm">
    Created by yuzu health
  </footer>
</div>

<style>
</style>