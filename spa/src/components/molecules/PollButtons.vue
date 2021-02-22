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
.heading-area{
  margin-top: -40px;
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
/* .def-btns{
  display: flex;
  width: 78%;
  margin: 0 auto;
} */

.normal-poll-inside button{
  display: flex;
  flex-direction: row-reverse;
  align-items: center;
  position: relative;
  max-width: 200px;
  width: 100%;
  justify-content: center;
  text-align: center;
  box-shadow: 0 10px 16px 0 rgba(0,0,0,0.2),0 6px 20px 0 rgba(0,0,0,0.19);
  padding-right: 35px;
  padding: 0;
  position: relative;
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
.item-div {
  border-width: 10px;
  border-color: #f1f1f1;
  border-style: solid;
}
.item-footer {
  font-size: 1em;
  color: #201f27;
  text-align: center;
  max-width: 550px;
  margin: 0 auto 30px;
  font-weight: 400;
  border-top: 1px solid #E6E6E6;
  border-bottom: 1px solid #E6E6E6;
  display: flex;
  justify-content: space-around;
  align-items: center;
}
.item-footer span, .item-footer span a, .item-footer a {
  color: #777A7C;
}
.item-footer svg{
  color: #AEB3B7;
  margin-right: 15px;
  font-size: 11px;
}
.post-time, .post-author, .post-rating, .post-comments{
  display: flex;
  align-items: center;
}
.item-footer span a{
  color: #777A7C;
  text-decoration: none;
}
/* @media (min-width: 1920px) {
  .normal-poll-inside button{
    font-size: 18px;
  }
} */
@media (max-width: 1220px) {
  .normal-poll-inside button{
    font-size: 15px;
    width: 180px;
  }
  .normal-poll-inside button span{
    width: 30px;
    height: 30px;
  }
}
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
  .pollheading a{
    font-size: 24px;
    margin: 0px 0 15px;
  }
  .item-footer{
    flex-wrap: wrap;
    font-size:14px
  }
  .item-footer svg{
    font-size: 10px;
    margin-right: 0px;
    margin-bottom: 10px;
  }
  .post-time svg, .post-author svg, .post-rating svg, .post-comments svg{
    display: block;
    margin: 0 auto 10px;
  }
  .post-time, .post-author, .post-rating, .post-comments {
    flex-direction: column;
  }
  .heading-area {
    margin-top: 0px;
  }
  .normal-poll-inside h4{
    flex-wrap: wrap;
    flex-basis: 100%;
    text-align: center;
  }
}
@media (max-width: 600px) {
  .normal-poll-inside {
    padding: 0 0px;
  }
  .item {
    width: 100%;
    }
  .item-footer {
    font-size: 12px;
  }
}

@media (max-width: 480px) {
  .item {
    width: 100%;
  }
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
