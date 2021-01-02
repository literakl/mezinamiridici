<template>
      <div class="normal-poll">
        <div class="heading-area">
          <h4 class="text-center pb-3">{{ $t('poll.your-opinion') }}</h4>
        </div>
        <div class="pt-2 pb-2 d-flex justify-content-center featured-poll">
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
.normal-poll{
    justify-content: center;
    width: 100%;
}
.heading-area{
  margin-top: -20px;
}
.heading-area h4{
  font-size: 14px;
  text-transform: uppercase;
  border-bottom: 1px solid #ddd;
  max-width: 200px;
  margin: 0 auto 50px;
}
.featured-poll{
  display: flex;
}
.featured-poll button{
  display: flex;
  flex-direction: row-reverse;
  align-items: center;
  position: relative;
  max-width: 220px;
  width: 100%;
  border-radius: 100px;
  justify-content: center;
  text-align: center;
  box-shadow: var(--box-shadow);
  padding-right: 35px;
  padding: 0;
  position: relative;
  height: 50px;
  margin: 15px;
}
.featured-poll button.btn-success img{
  width: 70px;
  height: 50px;
}
.featured-poll button img{ position: absolute;
  top: -60px;
  width: 55px;
  height: 50px;
  display: block;
  margin: 0 auto;
}
.featured-poll button span{
 width: 50px;
  height: 50px;
  display: flex;
  align-items: center;
  justify-content: center;
  background: var(--color-white);
  color: var(--dark-color);
  position: absolute;
  left: -5px;
  font-size: 16px;
  box-shadow: var(--box-shadow);
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
  margin: 0 auto;
  font-weight: 400;
  border-top: 1px solid #E6E6E6;
  border-bottom: 1px solid #E6E6E6;
  display: flex;
  justify-content: space-around;
  align-items: center;
  margin-bottom: 20px;
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
@media (max-width: 1220px) {
  .featured-poll button{
    font-size: 15px;
    width: 180px;
  }
  .featured-poll button span{
    width: 30px;
    height: 30px;
  }
}
@media (max-width: 992px) {
  .featured-poll button img{
    left: 0;
    right: 0;
  }
  .featured-poll button span{
    top: 38px;
  }
  .featured-poll button {
    margin: 50px 0px!important;
    width: 133px;
    margin: 45px 10px!important;
  }
}
@media (max-width: 767px) {
  .featured-poll {
    flex-wrap: wrap;
    justify-content: space-around!important;
    padding: 0 20px;
  }
  .poolheading a{
    font-size: 30px;
    margin: 40px 0 35px;
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
}
@media (max-width: 600px) {
  .featured-poll {
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
}
</style>
