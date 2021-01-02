<template>
  <div class="mb-3 forlogedin">
    <h4 class="text-center poolheading">
      <router-link :to="{ name: 'poll', params: { slug: poll.info.slug }}">
        {{ poll.info.caption }}
      </router-link>
    </h4>

    <div v-if="voted" class="pt-2 pb-2 d-flex justify-content-center featured-poll">
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

    <div v-if="!voted" class="pt-2 pb-2 d-flex justify-content-center">
      <PollButtons v-on:do-vote="onVote"/>
    </div>

    <div class="mt-3 py-3 mb-5 item-footer">
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
      <BIconStarFill scale="2"></BIconStarFill>
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
import { BButton, BIconPersonCircle, BIconCalendarRange, BIconStarFill, BIconChatTextFill } from 'bootstrap-vue';

export default {
  name: 'HomePoll',
  components: {
    PollButtons,
    ProfileLink,
    Date,
    BButton,
    BIconPersonCircle,
    BIconCalendarRange,
    BIconStarFill,
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
.featured-poll button.btn-success img{width: 70px;
    height: 50px;}
.featured-poll button img{ position: absolute;
    top: -60px;
    width: 55px;
    height: 50px;
    /* left: auto; */
    /* right: auto; */
    display: block;
    margin: 0 auto;
    right: 20%;
    left: 20%;
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
  /* box-shadow: #c1c1c1 1px 1px 10px; */
}
.item-footer {
     font-size: 1em;
    color: #201f27;
    text-align: center;
    max-width: 650px;
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
.forlogedin .poolheading a{
  font-size: 50px;
  text-decoration: none;
  color: var(--dark-color);
  margin: 40px 0 55px;
    display: block;
}
.poolheading a:hover{ color: #007bff;}


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
   .featured-poll button {margin: 50px 0px!important;width: 133px; margin: 45px 10px!important;
    }
}
@media (max-width: 767px) {
  .featured-poll { flex-wrap: wrap; justify-content: space-around!important;     padding: 0 20px;
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
