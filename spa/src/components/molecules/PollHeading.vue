<template>
  <b-container>
    <b-row class="pollheader">
      <b-col v-if="item.siblings" class="prevbtn">
        <b-button v-if="item.siblings.older" :to="link(item.siblings.older)" variant="secondary">
          <BIconChevronDoubleLeft font-scale="2"></BIconChevronDoubleLeft>
        </b-button>
      </b-col>
      <b-col class="center-box">
        <div class="item-div item-hover mb-3">
          <h4 class="text-center poolheading">
            <router-link :to="{ name: 'poll', params: { slug: item.info.slug }}">
              {{item.info.caption}}
            </router-link>
          </h4>
          <div class="item-footer">
            <div class="post-details">
            <div class="post-time"><BIconCalendarRange scale="2"></BIconCalendarRange><span class="date"><Date :date="this.item.info.date" format="dynamicDate" /></span></div>
            <div class="post-author"><BIconPersonCircle scale="2"></BIconPersonCircle><span><ProfileLink :profile="this.item.info.author"/></span></div>
            <div class="post-rating"><img src="/images/icons/vote-icon.svg" class="" alt=""><span> {{item.votes.total}}</span></div>
            <div class="post-comments"><BIconChatTextFill scale="2"></BIconChatTextFill><span>
               {{item.comments.count}}
            </span>
            </div>
            </div>
            <div class="post-tags">
            <template v-if="hasTags">
              <BIconTags scale="2"></BIconTags>
              <TagList :tags="tags"/>
            </template>
            </div>
          </div>
        </div>
      </b-col>
      <b-col v-if="item.siblings" class="nextbtn">
        <b-button v-if="item.siblings.newer" :to="link(item.siblings.newer)" variant="secondary">
          <BIconChevronDoubleRight font-scale="2"></BIconChevronDoubleRight>
        </b-button>
      </b-col>
    </b-row>
  </b-container>
</template>

<script>
import { BIconChevronDoubleLeft, BIconChevronDoubleRight, BContainer, BRow, BCol, BButton, BIconPersonCircle, BIconCalendarRange, BIconChatTextFill, BIconTags } from 'bootstrap-vue';
import ProfileLink from '@/components/molecules/ProfileLink.vue';
import Date from '@/components/atoms/Date.vue';
import TagList from '@/components/atoms/TagList.vue';

export default {
  name: 'PollHeading',
  components: {
    ProfileLink,
    Date,
    TagList,
    BIconChevronDoubleLeft,
    BIconChevronDoubleRight,
    BContainer,
    BRow,
    BCol,
    BButton,
    BIconPersonCircle,
    BIconCalendarRange,
    BIconChatTextFill,
    BIconTags,
  },
  props: {
    item: Object,
  },
  computed: {
    hasTags() {
      return this.tags !== null && this.tags.length > 0;
    },
    tags() {
      return this.poll !== null && this.item.info.tags;
    },
  },
  methods: {
    link(poll) {
      const currentPath = this.$route.fullPath;
      const i = currentPath.indexOf('/', 1), j = currentPath.indexOf('/', i + 1);
      let nextPath = currentPath.substring(0, i + 1) + poll.info.slug;
      if (j > 0) {
        nextPath += currentPath.substring(j);
      }
      return nextPath;
    },
  },
};
</script>
<style scoped>
.pollheader{
  flex-wrap: nowrap;
  margin: 0 auto;
  align-items: center;
  justify-content: center;
  position: relative;
  padding: 0;
}
.pollheader .center-box{ width: 100%; padding: 0;}
.poolheading a{
  font-size: 32px;
  text-decoration: none;
  color: var(--dark-color);
  margin: 10px 0 20px;
}
.poolheading a:hover{
  color: #007bff;
}
.post-rating img{
  width: 22px;
  height: 20px;
  margin-right: 8px;
}
.post-rating svg{
  position: relative;
}
.post-rating:before{
  content: "";
  position: absolute;
}
.item-div {
  /* max-width: 890px; */
  width: 100%;
  position: relative;
  border: 0;
}
.post-details{
  display: flex;
  justify-content: space-between;
  width: 100%;
  margin-bottom: 15px;
}
.post-time {
  color: #777A7C;
}
.item-footer {
  background-color: #fff;
  padding: 10px 20px;
  font-size: 0.8em;
  color: #777A7C;
  font-weight: 600;
  box-shadow: var(--drop-shadow-two);
  max-width: 600px;
  margin: 0 auto 30px auto;

}
.item-footer a {
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
  font-weight: 400;
}
.post-comments a {
  color: #007bff!important;
}
.item-footer span a{
  color: #777A7C;
  text-decoration: none;
}
.post-tags{
  /* padding-top: 20px; */
      display: flex;
    align-items: center;
    justify-content: flex-start;
}
.post-tags a{
  font-weight: 400;
    padding: 3px 10px;
    background: #f9f9f9;
    margin: 0 2px 0 0;
}
.prevbtn{ max-width:50px; position: absolute; left: 0; z-index: 1; background: #fff; padding: 0;}
.nextbtn{ max-width:50px; position: absolute; right: 0; z-index: 1; background: #fff;padding: 0;}
.center-box{max-width: 100%; margin: 0 auto;}
.prevbtn a, .nextbtn a{
  border-radius: 100px;
  height: 50px;
  width: 50px;
  display: flex;
  align-items: center;
  justify-content: center;
  background-color: transparent;
  border: 1px solid #ddd;
  color: #AEB3B7 !important;
}
.prevbtn a.btn:active, .nextbtn a.btn:active{
  background: transparent;
}

 @media (min-width: 1920px) {
    p, a, button, li, span{ font-size: 20px}
    h3{ font-size: 26px;}
    .item-footer{
      max-width: 900px;
    }
}

@media (max-width: 767px) {
    .pollheader{
        margin-bottom: 30px;
  }
  .poolheading a{
    font-size: 22px;
  }
  .prevbtn {
  bottom: -20px;
}
.nextbtn {
  bottom: -20px;
}
}
@media (max-width: 600px) {
.post-time, .post-author, .post-rating, .post-comments{
  flex-direction: column;
}
.item-footer svg{
  margin-right: 0;
      margin-bottom: 10px;
}
.post-tags{
      display: flex;
      flex-wrap: wrap;
}
.post-tags svg{ margin-right: 15px;}

}
@media (max-width: 600px) {
 .nextbtn{
   width: 40px;
 }
.prevbtn a, .nextbtn a{
    height: 40px;
    width: 40px;
}

}
</style>
