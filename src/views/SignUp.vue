<template>
  <div class="sign-up">
    <div class="sign-up__heading">
        <h1>Sign up</h1>
        <p>You are the single step away from registration.
        Enter statistical information you want to share.
        Your votes are anonymouse in each poll.</p>
    </div>
    <div class="sign-up__form">
        <SignUpForm />
    </div>
  </div>
</template>

<script>
import SignUpForm from '@/components/SignUpForm.vue';

export default {
  name: 'sign-up',
  components: {
    SignUpForm,
  },
};
</script>
