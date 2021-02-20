<template>
  <div class="mb-3">
    <h4 class="pollheading">
      <router-link :to="{ name: 'poll', params: { slug: poll.info.slug }}">
        {{ poll.info.caption }}
      </router-link>
    </h4>

    <div v-if="voted" class="poll-success">
      <ul>
        <li>
          <div class="np-status">
            <span class="title-status">{{ $t('poll.choices.neutral') }}</span>
            <span class="status-img"><img src="/images/icons/happy.svg" class="" alt=""></span>
            <div class="progress-bar-outer">
              <div class="progress-bar">
                <span class="progress-bar-fill-green" v-bind:style="{ width: ['33%'] }"><i>{{ this.votes.neutral }}%</i></span>
              </div>
            </div>
          </div>
        </li>
        <li>
          <div class="traval-trouble-status">
            <span class="title-status">{{ $t('poll.choices.trivial') }}</span>
            <span class="status-img"><img src="/images/icons/ok.svg" class="" alt=""></span>
            <div class="progress-bar-outer">
              <div class="progress-bar">
                <span class="progress-bar-fill-blue" style="width: 11%;"><i>11%</i></span>
              </div>
            </div>
          </div>
        </li>
        <li>
          <div class="dislike-status">
            <span class="title-status">{{ $t('poll.choices.dislike') }}</span>
            <span class="status-img"><img src="/images/icons/dislike.svg" class="" alt=""></span>
            <div class="progress-bar-outer">
              <div class="progress-bar">
                <span class="progress-bar-fill-yellow" style="width: 56%;"><i>56%</i></span>
              </div>
            </div>
          </div>
        </li>
        <li>
          <div class="angry-status">
            <span class="title-status">{{ $t('poll.choices.hate') }}</span>
            <span class="status-img"><img src="/images/icons/angry.svg" class="" alt=""></span>
            <div class="progress-bar-outer">
              <div class="progress-bar">
                <span class="progress-bar-fill-red" style="width: 13.8%;"><i>13.8 %</i></span>
              </div>
            </div>
          </div>
        </li>
      </ul>
    </div>

    <div v-if="!voted" class="d-flex justify-content-center">
      <PollButtons v-on:do-vote="onVote"/>
    </div>
  </div>
</template>

<script>

import normalizeVotes from '@/utils/chartUtils';
import PollButtons from '@/components/molecules/PollButtons.vue';
import { BButton } from 'bootstrap-vue';

export default {
  name: 'HomePoll',
  components: {
    PollButtons,
    BButton,
  },
  props: {
    poll: Object,
  },
  data() {
    return {
      voting: false,
    };
  },
  computed: {
    voted() {
      return this.poll.my_vote;
    },
    votes() {
      return normalizeVotes(this.poll.votes);
    },
  },
  methods: {
    myVoteClass(value) {
      return this.poll.my_vote === value ? 'button_my_vote' : '';
    },
    async onVote(vote) {
      this.voting = true;
      await this.$store.dispatch('POLL_VOTE', {
        id: this.poll._id,
        vote,
      });
      this.voting = false;
    },
  },
};
</script>

<style scoped>
.np-status, .traval-trouble-status, .dislike-status, .angry-status{
  display: flex;
  align-items: center;
}
.np-status span,  .traval-trouble-status span, .dislike-status span, .angry-status span{
  margin-right: 15px;
}
.np-status span.status-img{
 margin-right: 11px;
}
.title-status{
  max-width: 100px;
      width: 100%;
}
.poll-success {
  max-width: 1062px;
  margin: 0 auto;
  padding: 0 0 0 10px;
}
.poll-success ul{
  padding:0;
  margin:0;
}
.poll-success ul li{
  list-style-type: none;
  font-size: 14px;
  font-weight:400;
}
.poll-success ul li img{
  width: 38px;
  height: 38px;
  margin-left:10px;
}
.poll-success ul li:first-child{
  flex: 1 1 100%;
}
.poll-success ul li:first-child img{
  width: 45px;
  height: 35px;
  margin-left: 7px;
}
.progress-bar-outer {
  width: 100%;
}
.progress-bar {
  width: 100%;
  background-color: #f7f7f7;
  padding: 3px;
  border-radius: 0px;
}

.progress-bar-fill-green {
  display: block;
  height: 22px;
  background-color: #28a745;
  border-radius: 0px;
  transition: width 500ms ease-in-out;
  display: flex;
  justify-content: flex-end;
      align-items: center;
}
.progress-bar-fill-green i { padding-right: 15px; font-size: 14px; font-weight: 500; font-style: normal;}
.progress-bar-fill-blue {
  display: block;
  height: 22px;
  background-color: #007bff;
  border-radius: 0px;
  transition: width 500ms ease-in-out;
  display: flex;
  justify-content: flex-end;
      align-items: center;
}
.progress-bar-fill-blue i { padding-right: 15px; font-size: 14px; font-weight: 500; font-style: normal;}

.progress-bar-fill-yellow {
  display: block;
  height: 22px;
  background-color: #ffc107;
  border-radius: 0px;
  transition: width 500ms ease-in-out;
  display: flex;
  justify-content: flex-end;
      align-items: center;
}
.progress-bar-fill-yellow i { padding-right: 15px; font-size: 14px; color: #212529; font-weight: 500; font-style: normal;}
.progress-bar-fill-red {
  display: block;
  height: 22px;
  background-color: #dc3545;
  border-radius: 0px;
  transition: width 500ms ease-in-out;
  display: flex;
  justify-content: flex-end;
      align-items: center;
}
.progress-bar-fill-red i { padding-right: 15px; font-size: 14px; font-weight: 500; font-style: normal;}
.temp-wrapper p{
  color:var(--text-color);
  font-weight:400;
  line-height:1.4;
  font-size:16px!important;
  word-break:normal;
  margin:0 0 10px;
  padding:0
}
.button{
  color:#fff;font-weight:bold;text-align:left;line-height:1.4;text-decoration:none;font-size:16px;display:inline-block;border-radius:8px;margin:0;padding:15px 24px;border:0 solid #ea4c89
}
.resetpass{
  width:100%;
}
.featured-poll {
  display: none!important;
}
.featured-poll button{
    display: flex;
    flex-direction: row-reverse;
    align-items: center;
    position: relative;
    max-width: 210px;
    width: 100%;
    /* border-radius: 100px; */
    justify-content: center;
    text-align: center;
    box-shadow: 0 10px 16px 0 rgba(0,0,0,0.2),0 6px 20px 0 rgba(0,0,0,0.19);
    padding-right: 35px;
    padding: 0;
    position: relative;
    height: 50px;
    margin: 15px 15px 5px;
    font-size: 14px;
    font-weight: 400;
}
.featured-poll button.btn-success img{
  width: 50px;
  height: 40px;
  top: -38px;
}
.featured-poll button img{ position: absolute;
   top: -42px;
    width: 43px;
    height: 43px;
    /* left: auto; */
    /* right: auto; */
    display: block;
    margin: 0 auto;
    right: 20%;
    left: 20%;
}
.featured-poll button span{
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
  border-color: #dee0e1;
  border-style: solid;
  box-shadow: #c1c1c1 1px 1px 10px;
}
.item-footer {
     font-size: .9em;
    color: #201f27;
    text-align: center;
    max-width: 380px;
    margin: 0 auto;
    font-weight: 400;
    border-top: 0px solid #E6E6E6;
    border-bottom: 0px solid #E6E6E6;
    display: flex;
    justify-content: space-around;
    align-items: center;
    margin-bottom: 20px;

}
.post-time {
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
.post-comments a {
  color: #007bff!important;
}
.item-footer span a{
  color: #777A7C;
  text-decoration: none;
}
.pollheading a{
  font-size: 24px;
  text-decoration: none;
  /* margin: 10px 0 40px; */
  margin: 10px 0 15px;

    display: block;
    color: var(--text-color);
    text-align: left;
}
.pollheading a:hover{
  color: var(--link-blue);
}
@media (min-width: 1920px) {

  .featured-poll button{
    height: 60px;
    max-width: 240px;
  }
  .featured-poll button span{
    width: 40px;
    height: 32px;
    top: 14px;
  }
}


@media (max-width: 1220px) {
  .featured-poll button{
    width: 180px;
    height: 40px;
  }
  .featured-poll button span{
    width: 30px;
    height: 30px;
    top: -22px;
    left: -2px;
  }
}


@media (max-width: 1065px) {

  .poll-success {
    padding: 0 15px;
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
    width: 115px;
    margin: 35px 5px 30px!important;
    font-size: 14px;
  }
  .pollheading a{
    margin-bottom: 20px;
  }
}
@media (max-width: 767px) {
  .featured-poll {
    flex-wrap: wrap;
    justify-content: space-around!important;
    padding: 0 20px;
  }
  .pollheading a {
      /* font-size: 22px; */
      margin: 0px 0 15px;
      /* padding:0 15px; */
  }
  .featured-poll button{
        max-width: 50%;
    margin: 35px 5px 30px!important;
    font-size: 14px;
    width: 40%;
  }
  .featured-poll button span{
      top: -30px;
    }
  .featured-poll button img{
    width: 40px;
  }
  .featured-poll button.btn-success img{
    width: 50px;
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
  .progress-bar-fill-red i,
.progress-bar-fill-yellow i,
.progress-bar-fill-blue i,
.progress-bar-fill-green i {
  padding-right:5px;
}
}

/* @media (max-width: 667px) {
  .featured-poll button{
    width: 105px;
    font-size: 13px;
  }
} */

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
  .np-status, .traval-trouble-status, .dislike-status, .angry-status {
    flex-basis: 100px;
    flex-wrap: wrap;
}
}

@media (max-width: 480px) {
  .item {
    width: 100%;
  }
  .featured-poll button{
    width: 40%;
  }
}

</style>
