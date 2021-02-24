<template>
  <div class="normal-poll pt-4">
    <div class="normal-poll-inside">
      <h4 class="pb-2">{{ $t('poll.your-opinion') }}</h4>
      <b-button variant="success" v-on:click="voted('neutral')">
        <img src="/images/icons/happy.svg" class="" alt="">
        {{ $t('poll.choices.neutral') }}
      </b-button>
      <b-button variant="primary" v-on:click="voted('trivial')">
        <img src="/images/icons/ok.svg" class="" alt="">
        {{ $t('poll.choices.trivial') }}
      </b-button>
      <b-button variant="warning" v-on:click="voted('dislike')">
        <img src="/images/icons/dislike.svg" class="" alt="">
        {{ $t('poll.choices.dislike') }}
      </b-button>
      <b-button variant="danger" v-on:click="voted('hate')">
        <img src="/images/icons/angry.svg" class="" alt="">
        {{ $t('poll.choices.hate') }}
      </b-button>
    </div>
  </div>
</template>

<script>
import { BButton } from 'bootstrap-vue';

export default {
  name: 'PollButtons',
  components: {
    BButton,
  },
  methods: {
    voted(vote) {
      if (!this.$store.getters.IS_AUTHORIZED) {
        this.$router.push({ name: 'sign-in', params: { redirectUrl: this.$route.fullPath } });
      } else {
        this.$emit('do-vote', vote);
      }
    },
  },
};
</script>

<style scoped>
/* Default Poll Css Start */
.normal-poll{
  display: flex;
  justify-content: center;
  width: 100%;
}
.normal-poll-inside h4{
  font-size: 16px;
  text-transform: uppercase;
  padding: 16px 0 0 0px;
  color: var(--text-color);
}
/* Default Poll Buttons Css Start */
.normal-poll-inside{
  display: flex;
  width: 100%;
  justify-content: center;
  align-items: center;
}
.normal-poll-inside button{
  display: flex;
  align-items: center;
  position: relative;
  max-width: 200px;
  width: 100%;
  justify-content: center;
  text-align: center;
  box-shadow: 0 10px 16px 0 rgba(0,0,0,0.2),0 6px 20px 0 rgba(0,0,0,0.19);
  padding: 0;
  height: 40px;
  margin: 15px;
  font-size: 14px;
  font-weight: 400;
}
.normal-poll-inside button.btn-success img{
  width: 60px;
  height: 40px;
  top: -38px;
}
.normal-poll-inside button img{ position: absolute;
  top: -42px;
  width: 48px;
  height: 43px;
  display: block;
  margin: 0 auto;
  right: 20%;
  left: 20%;
}
.normal-poll-inside button span{
  width: 32px;
  height: 27px;
  display: flex;
  align-items: center;
  justify-content: center;
  background:rgba(255, 255, 255, .7);
  color: var(--dark-color);
  position: absolute;
  left: 7px;
  font-size: 13px;
  box-shadow: var(--big-shadow);
  border-radius: 3px;
  top: 11px;
}
/* Default Poll Buttons Css End */
@media (max-width: 992px) {
  .normal-poll-inside button img{
    left: 0;
    right: 0;
  }
  .normal-poll-inside button span{
    top: 38px;
  }
  .normal-poll-inside button {
        width: 105px;
    margin: 35px 5px 30px!important;
    font-size: 13px;
  }
  .normal-poll-inside h4{
    padding: 0;
  }
}
@media (max-width: 767px) {
  .normal-poll-inside {
    flex-wrap: wrap;
    justify-content: space-around!important;
    padding: 0 10px;
  }
  .normal-poll-inside button {
        width: 45%;
  }
  .normal-poll-inside h4{
    flex-wrap: wrap;
    flex-basis: 100%;
    text-align: center;
  }
  .normal-poll{
    padding-top: 0px!important;
  }
}
@media (max-width: 600px) {
  .normal-poll-inside {
    padding: 0 0px;
  }
}

@media (max-width: 480px) {
  .normal-poll-inside button {
    width: 145px;
  }
}
@media (max-width: 360px) {
  .normal-poll-inside button {
    width: 122px;
  }
}
</style>
