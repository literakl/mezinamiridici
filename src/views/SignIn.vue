<template>
    <form>
        <div class="signin">  
            <div class="signin__wrapper">
                <div>
                    <h1>Sign in</h1>
                </div>
                <div>
                    <h2>If you don't already have an account, click the button below to create one</h2>
                </div>
                <div>
                    <TextInput type="email" identifier="email" placeholder="Email"  class="signin__text-input" />
                    <TextInput type="password" identifier="password" placeholder="Password"  class="signin__text-input"/>
                    <div class="signin__forgot-password">Forgot password?</div>
                    <Submit value="Sign in" />
                </div>
                <div>
                    <router-link to="/sign-up"><Button value="Sign up now" class="signin__sign-up-button" /></router-link>
                    <div class="signin__or">OR</div>
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

export default {
  name: 'signin',
  components: {
      Button,
      TextInput,
      Submit
  },
  data: () => ({
    page: 0
  }),
  methods: {
      clicked: function () {
          console.log("Loading more...")
          this.page++;
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

.signin__text-input {
    width: 100%;
}

.signin__wrapper {
    grid-template-columns: 0.2fr 0.2fr;
    display: grid;
    margin: 0 auto;
    max-width: 80%;
    padding: 1em 0;
    grid-column-gap: 20px;
}

.signin__sign-up-button {
    background: #9b9b9b;
    box-shadow: 0px 4px #868686;
    color: #FFF;
    font-size: 14px;
    width: 100%;
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
</style>
