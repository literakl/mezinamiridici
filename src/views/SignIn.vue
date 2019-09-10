<template>
    <form>
        <div id="signin">  
            <div id="signin__wrapper">
                <div>
                    <h1>Sign in</h1>
                    <TextInput type="email" identifier="email" placeholder="Email" />
                    <TextInput type="password" identifier="password" placeholder="Password" />
                    <div>Forgot password?</div>
                    <Submit value="Sign in" />
                </div>
                <div>
                    <h2>If you don't already have an account, click the button below to create one</h2>
                    <Button value="Sign up now" />
                    <div>OR</div>
                    <Button value="Continue with Facebook" />
                    <Button value="Sign in with Google" />
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
#signin {
    background: #f6f6f6;
    margin-top: 50px;
    padding-top: 30px;
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
}

#signin__wrapper {
    grid-template-columns: 0.2fr 0.2fr 0.6fr;
    display: grid;
    margin: 0 auto;
    max-width: 80%;
    padding: 1em 0;
    grid-gap: 20px;
}
</style>
