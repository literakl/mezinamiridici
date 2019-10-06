<template>
    <div>
        <form
            id="app"
            @submit.prevent="checkForm"
            v-if="success === false || success === null"
        >
            <h3>Enter your new password below</h3>
            <div v-if="success !== true && success !== null">
                <strong class="reset-password-form__errors-heading">
                    <p>Something wen't wrong when resetting your password, please try again.</p>
                </strong>
            </div>

            <div id="reset-password-form-wrapper">
                <div class="reset-password-form__label">
                    <label for="password">{{ $t('sign-up.password-label') }}</label>
                </div>
                <TextInput class="reset-password-form__input" v-model="password" identifier="password" type="password" />
            </div>
            <Button :disabled="resetting" :value="$t('sign-up.finished-button-label')" @clicked="checkForm" class="reset-password-form__button"/>
        </form>
        <div id="reset-password-form-success" v-if="success === true">
            <p>Password reset successfully!</p>
        </div>
    </div>
</template>

<script>

import Button from '@/components/atoms/Button.vue';
import TextInput from '@/components/atoms/TextInput.vue';

export default {
  name: 'SignUpForm',
  components: {
    TextInput,
    Button,
  },
  data: () => ({
    password: null,
    success: null,
    resetting: null
  }),
  props: {
      passwordResetToken: String
  },
  methods: {
    async checkForm() {
      this.resetting = true;
      this.errors = [];

      if (!this.password) {
        this.errors.push(this.$t('sign-up.password-required'));
      }

      if (this.errors.length === 0) {
        try {
            const { data } = await this.$store.dispatch('RESET_PASSWORD', {
                passwordResetToken: this.passwordResetToken,
                password: this.password,
            });

            this.success = true;
            this.resetting = false;
        } catch {
            this.success = false;
            this.resetting = false;
        }
      } else {
        this.success = false;
        this.resetting = false;
      }

      return this.errors.length !== 0;
    },
  },
};
</script>


<style scoped lang="scss">
#reset-password-form-wrapper {
    display: grid;
    margin-top: 40px;
    grid-template-columns: 0.3fr 1fr;
}

#reset-password-form-success {
    color: green;
}

.reset-password-form__label {
    margin-bottom: 20px;
    font-weight: 900;
}

.reset-password-form__errors-heading {
    color: rgb(209, 49, 49);
}

.reset-password-form__input {
    width: 100%;
}

.reset-password-form__button {
    width: 100%;
}

@media all and (min-width: 850px) {

    .reset-password-form__button {
        width: 30%;
    }

    #reset-password-form-wrapper {
        grid-template-columns: 0.3fr 1fr;
    }

    .reset-password-form__input {
        width: 70%;
    }
}
</style>
