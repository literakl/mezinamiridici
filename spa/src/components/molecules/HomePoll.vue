<template>
  <div class="mb-3 notlogedin">
    <h4 class="text-center poolheading">
      <router-link :to="{ name: 'poll', params: { slug: poll.info.slug }}">
        {{ poll.info.caption }}
      </router-link>
    </h4>

    <div v-if="voted" class="d-flex justify-content-center featured-poll">
      <b-button variant="success" :class="myVoteClass('neutral')" class="m-3">
        <img src="/images/icons/happy.svg" class="" alt="">
        {{ $t('poll.choices.neutral') }}
        <span class="badge badge-pill badge-white">{{ this.votes.neutral }}%</span>
      </b-button>
      <b-button variant="primary" :class="myVoteClass('trivial')" class="m-3">
        <img src="/images/icons/ok.svg" class="" alt="">
        {{ $t('poll.choices.trivial') }}
        <span class="badge badge-pill badge-white">{{ this.votes.trivial }}%</span>
      </b-button>
      <b-button variant="warning" :class="myVoteClass('dislike')" class="m-3">
        <img src="/images/icons/dislike.svg" class="" alt="">
        {{ $t('poll.choices.dislike') }}
        <span class="badge badge-pill badge-white">{{ this.votes.dislike }}%</span>
      </b-button>
      <b-button variant="danger" :class="myVoteClass('hate')" class="m-3">
        <img src="/images/icons/angry.svg" class="" alt="">
        {{ $t('poll.choices.hate') }}
        <span class="badge badge-pill badge-white">{{ this.votes.hate }}%</span>
      </b-button>
    </div>

    <div v-if="!voted" class="d-flex justify-content-center">
      <PollButtons v-on:do-vote="onVote"/>
    </div>

    <div class="mt-3 py-3 mb-5 item-footer" style="display:none;">
      <template>
        <div class="post-time">
      <BIconCalendarRange scale="2"></BIconCalendarRange>
      <span class="date"><Date :date="poll.info.date" format="dynamicDate" /></span>
        </div>
      </template>
      <template>
        <div class="post-author">
      <BIconPersonCircle scale="2"></BIconPersonCircle>
      <span><ProfileLink :profile="poll.info.author"/></span>
       </div>
      </template>
      <template>
        <div class="post-rating">
      <BIconCollection scale="2"></BIconCollection>
      <span>{{ $t('poll.votes') }}: {{ poll.votes.total }}</span>
       </div>
      </template>
       <template>
        <div class="post-comments">
      <BIconChatTextFill scale="2"></BIconChatTextFill>
      <span><router-link :to="{ name: 'poll', params: { slug: poll.info.slug }, hash: '#comments'}">
        {{ $t('comment.comments') }}: {{ poll.comments.count }}
      </router-link></span>
       </div>
      </template>
    </div>

  </div>
</template>

<script>

import normalizeVotes from '@/utils/chartUtils';
import PollButtons from '@/components/molecules/PollButtons.vue';
import ProfileLink from '@/components/molecules/ProfileLink.vue';
import Date from '@/components/atoms/Date.vue';
import { BButton, BIconPersonCircle, BIconCalendarRange, BIconCollection, BIconChatTextFill } from 'bootstrap-vue';

export default {
  name: 'HomePoll',
  components: {
    PollButtons,
    ProfileLink,
    Date,
    BButton,
    BIconPersonCircle,
    BIconCalendarRange,
    BIconCollection,
    BIconChatTextFill,
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

.featured-poll button{
    display: flex;
    flex-direction: row-reverse;
    align-items: center;
    position: relative;
    max-width: 220px;
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
  width: 60px;
  height: 40px;
  top: -38px;
}
.featured-poll button img{ position: absolute;
   top: -42px;
    width: 48px;
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
  /* box-shadow: #c1c1c1 1px 1px 10px; */
}
.item-footer {
    /* display: none; */
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
.notlogedin .poolheading a{
  font-size: 32px;
  text-decoration: none;
  margin: 10px 0 40px;
    display: block;
    color: var(--text-color);
    text-align: center;
}
.notlogedin .poolheading a:hover{
  color: var(--link-blue);
}
@media (min-width: 1920px) {

  .featured-poll button{
        height: 60px;
        font-size: 20px;
            max-width: 250px;
  }
  .featured-poll button span{
    width: 40px;
    height: 32px;
    font-size: 17px;
        top: 14px;
  }
}


@media (max-width: 1220px) {
  .featured-poll button{
    font-size: 15px;
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
}
@media (max-width: 767px) {
  .featured-poll {
    flex-wrap: wrap;
    justify-content: space-around!important;
    padding: 0 20px;
  }
  .notlogedin .poolheading a {
      font-size: 22px;
      margin: 0px 0 15px;
      padding:0 15px;
  }
  .featured-poll button{
    width: 155px;
   margin: 35px 5px 30px!important;
    font-size: 14px;
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
}

@media (max-width: 480px) {
  .item {
    width: 100%;
  }
}

</style>
