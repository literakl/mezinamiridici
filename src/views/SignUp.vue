<template>
  <div id="sign-up-wrapper">
    <div id="sign-up">
      <div class="sign-up__heading">
          <h1>Sign up</h1>
          <p>You are the single step away from registration.
          Enter statistical information you want to share.
          Your votes are anonymous in each poll.</p>
      </div>
      <div class="sign-up__form">
          <SignUpForm />
      </div>
    </div>
  </div>
</template>

<script>
import SignUpForm from '@/components/molecules/SignUpForm.vue';

export default {
  name: 'sign-up',
  components: {
    SignUpForm,
  },
};
</script>

<style>
  #sign-up {
    display: grid;
    grid-template-columns: 1fr;
    margin: 0 auto;
    max-width: 80%;
    padding: 1em 0;
  }

  @media all and (min-width: 850px) {
    #sign-up {
      grid-template-columns: 0.5fr;
      max-width: 80%;
    }
  }
</style>
