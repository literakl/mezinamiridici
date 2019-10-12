<template>
  <div class="complete-profile__wrapper">
        <div>
            <h2>{{ $t('complete-profile.heading') }}</h2>
            <CompleteProfileForm />
        </div>
  </div>
</template>

<script>
import CompleteProfileForm from '@/components/molecules/forms/CompleteProfileForm.vue';

export default {
  name: 'sign-up',
  components: {
    CompleteProfileForm,
  },
};
</script>

<style>
.complete-profile__wrapper{
    display: grid;
    margin: 0 auto;
    max-width: 80%;
    padding: 1em 0;
    grid-gap: 20px;
    grid-template-columns: 0.5fr 0.5fr;
}
</style>
