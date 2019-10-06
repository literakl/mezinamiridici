<template>
    <form class="reset">
        <h1>Reset your password</h1>
        <ResetPasswordForm :passwordResetToken="passwordResetToken" />
    </form>
</template>

<script>
import Button from '@/components/atoms/Button.vue';
import TextInput from '@/components/atoms/TextInput.vue';
import Submit from '@/components/atoms/Submit.vue';
import ResetPasswordForm from '@/components/molecules/forms/ResetPasswordForm.vue';

export default {
  name: 'Reset',
  components: {
    Button,
    TextInput, 
    Submit,
    ResetPasswordForm
  },
  data: () => ({
    verified: null
  }),
  props: {
    passwordResetToken: String
  }
};
</script>

<style scoped>
.reset {
    display: grid;
    grid-template-columns: 1fr;
    margin: 0 auto;
    max-width: 80%;
    padding: 1em 0;
  }

  @media all and (min-width: 850px) {
  .reset {
      grid-template-columns: 0.5fr;
      max-width: 80%;
    }
  }
.verifying {
  color: blue;
}

.failed {
  color: red;
}

.success {
  color: green;
}
</style>
