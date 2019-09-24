<template>
    <form @submit.prevent="signIn">
        <div class="signin">  
            <div class="signin__wrapper">
                <Modal :show="forottenPassword">
                    <h1>{{ $t('sign-in.forgot-password-heading') }}</h1>
                    <p>{{ $t('sign-in.email-reset-description') }}</p>
                    <TextInput type="resetEmail" identifier="resetEmail" :placeholder="$t('sign-in.email-placeholder')" class="signin__reset-text-input" />
                    <Submit :value="$t('sign-in.reset-password-button')" class="signin__forgotten-password-submit-button"/>
                    <Button :value="$t('sign-in.modal-close-button')" class="signin__forgotten-password-close-button" @clicked="closeForgottenPassword"/>
                </Modal>
                <div>
                    <h1>{{ $t('sign-in.sign-in-heading') }}</h1>
                </div>
                <div>
                    <h2>{{ $t('sign-in.sign-up-create-account-heading') }}</h2>
                </div>
                <div>
                    <p v-if="loginError" class="signin__login-error">Incorrect username/password, please try again</p>
                    <TextInput type="email" identifier="email" :placeholder="$t('sign-in.email-placeholder')" class="signin__text-input" @input="emailInput"/>
                    <TextInput type="password" identifier="password" :placeholder="$t('sign-in.password-placeholder')" class="signin__text-input" @input="passwordInput"/>
                    <div class="signin__forgot-password" v-on:click="openForgottenPassword">{{ $t('sign-in.forgot-password-link')}}</div>
                    <Button :disabled="signingIn" class="signin__sign-in-button" :value="$t('sign-in.sign-in-button')" />
                </div>
                <div>
                    <Button value="Sign up now" class="signin__sign-up-button" @clicked="redirectToSignIn" />
                    <div class="signin__or">{{ $t('sign-in.or') }}</div>
                    <p>Facebook login button will go here</p>
                    <p>Google login button will go here</p>
                </div>
            </div>
        </div>
    </form>
</template>

<script>
import Button from '@/components/atoms/Button.vue';
import TextInput from '@/components/atoms/TextInput.vue';
import Submit from '@/components/atoms/Submit.vue';
import Modal from '@/components/molecules/Modal.vue';

export default {
  name: 'signin',
  components: {
      Button,
      TextInput,
      Submit,
      Modal
  },
  data: () => ({
    page: 0,
    forottenPassword: false,
    loginError: false,
    email: null,
    password: null,
    signingIn: false
  }),
  methods: {
      openForgottenPassword: function() {
          this.forottenPassword = true;
      },
      closeForgottenPassword: function() {
          this.forottenPassword = false;
      },
      redirectToSignIn: function(){
          this.$router.push({ name: 'sign-up' })
      },
      passwordInput: function(data){
          this.password = data;
      },
      emailInput: function(data){
          this.email = data;
      },
      signInFailed: function(){
          this.email = "";
          this.password = "";
          this.loginError = true;
          this.signingIn = false;
      },
      signIn: async function(){
          this.signingIn = true;

          try {
            const response = await this.$store.dispatch('GET_USER_TOKEN', {
                email: this.email,
                password: this.password
            });

            if(response.status === 200) {
                localStorage.setItem('jwt', response.data.token);
                this.$router.push('/');
            } else {
                this.signInFailed();
            }
          } catch(e) {
              this.signInFailed();
          }
      }
  }
};
</script>

<style scoped>
.signin {
    background: #f6f6f6;
    padding: 30px 0 30px 0;
}

.signin__or {
    text-align: center;
    padding-top: 20px;
    font-weight: 900;
}

input { 
    width: 100%;
    padding: 0px;
}

h1 {
    padding: 0 0 20px 0;
    margin: 0px;
}

h2 {
    padding: 0 0 20px 0;
    margin: 0px;
    font-size: 14px;
    font-weight: normal;
    text-align: center;
}

.signin__login-error {
    text-align: center;
    color: #d13131;
}

.signin__text-input {
    width: 100%;
}

.signin__wrapper {
    display: grid;
    margin: 0 auto;
    max-width: 80%;
    padding: 1em 0;
    grid-column-gap: 20px;
}

.signin__sign-in-button {
    width: 100%;
}

.signin__sign-up-button {
    background: #9b9b9b;
    box-shadow: 0px 4px #868686;
    color: #FFF;
    font-size: 14px;
    width: 100%;
    margin-top: 20px;
}

.signin__facebook-button {
    background: #9b9b9b;
    box-shadow: 0px 4px #868686;
    color: #FFF;
    font-size: 14px;
    width: 100%;
}

.signin__forgot-password {
    margin-bottom: 10px;
}

.signin__forgot-password:hover {
    text-decoration: underline;
    cursor: pointer;
}

.signin__forgotten-password-close-button {
    width: 100%;
    margin-top: 20px;
}

.signin__reset-text-input {
    display: block;
}


@media all and (min-width: 850px) {
    .signin__wrapper {
        grid-template-columns: 0.2fr 0.2fr;
    }
}
</style>
