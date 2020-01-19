<template>
  <div class="sign-up-wrapper">
    <div class="sign-up">
      <div class="sign-up__heading">
          <h1>{{ $t('sign-up.heading') }}</h1>
          <p>{{ $t('sign-up.body') }}</p>
      </div>
      <div class="sign-up__form">
          <SignUpForm />
      </div>
    </div>
  </div>
</template>

<script>
import SignUpForm from '@/components/molecules/forms/SignUpForm.vue';

export default {
  name: 'sign-up',
  components: {
    SignUpForm,
  },
};
</script>

<style>
.sign-up {
    display: grid;
    grid-template-columns: 1fr;
    margin: 0 auto;
    max-width: 80%;
    padding: 1em 0;
  }

  @media all and (min-width: 850px) {
  .sign-up {
      grid-template-columns: 1fr;
      max-width: 80%;
    }
  }
</style>
