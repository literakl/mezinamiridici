<template>
  <div>
    <div class="pollheader">
      <b-col v-if="item.siblings" class="prevbtn">
        <b-button v-if="item.siblings.older" :to="link(item.siblings.older)" variant="secondary">
          <BIconChevronDoubleLeft font-scale="2"></BIconChevronDoubleLeft>
        </b-button>
      </b-col>
      <b-col class="center-box">
        <div class="post-tags">
              <template v-if="hasTags">
                <BIconTags scale="1"></BIconTags>
                <TagList :tags="tags"/>
              </template>
            </div>
            <h4 class="poolheading">
               <router-link :to="{ name: 'poll', params: { slug: item.info.slug }}">
                  {{item.info.caption}}
                </router-link>
            </h4>
        <div class="item-div item-hover mb-4">
            <!-- <div class="user-details">
              <div>
                <span><BIconPersonCircle scale="1"></BIconPersonCircle></span>
                <span><ProfileLink :profile="this.item.info.author"/>  <Date :date="this.item.info.date" format="dynamicDate" /></span>
              </div>
            </div> -->
          <div class="item-footer">
            <div class="post-details">
            <div class="post-author"><BIconPersonCircle scale="1"></BIconPersonCircle><span><ProfileLink :profile="this.item.info.author"/></span></div>
            <div class="post-time"><BIconCalendarRange scale="1"></BIconCalendarRange><span class="date"><Date :date="this.item.info.date" format="dynamicDate" /></span></div>
            <div class="post-rating"><img src="/images/icons/vote-icon.svg" class="" alt=""><span> {{item.votes.total}}</span></div>
            <div class="post-comments"><BIconChatTextFill scale="1"></BIconChatTextFill><span>
               {{item.comments.count}}
            </span>
            </div>
            </div>

          </div>
        </div>
      </b-col>
      <b-col v-if="item.siblings" class="nextbtn">
        <b-button v-if="item.siblings.newer" :to="link(item.siblings.newer)" variant="secondary">
          <BIconChevronDoubleRight font-scale="2"></BIconChevronDoubleRight>
        </b-button>
      </b-col>
    </div>
  </div>
</template>

<script>
import { BIconChevronDoubleLeft, BIconChevronDoubleRight, BCol, BButton, BIconPersonCircle, BIconCalendarRange, BIconChatTextFill, BIconTags } from 'bootstrap-vue';
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
.poolheading{
  margin: 0;
}
.poolheading a{
  font-size:21px;
  text-decoration: none;
  color: var(--text-color);
  margin: 10px 0 0px;
}

.post-rating img{
    width: 17px;
    height: 16px;
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
  border-bottom: 1px solid #dee0e1;
}
.post-details{
  display: flex;
  justify-content: space-between;
  width: 100%;
  font-size: 13px;
}
.post-time {
  color: #777A7C;
}
.post-tags{
  display: flex;
  flex-wrap: wrap;
    align-items: center;
    margin-bottom: 10px;
}
.post-tags svg{ margin-right: 8px;}
.item-footer {
  background-color: #fff;
  padding: 10px 0px 5px;
  /* font-size: 0.8em; */
  color: #777A7C;
  font-weight: 600;
  margin: 0px 0;
      max-width: 280px;
}
.item-footer a {
  color: #777A7C;

}
.item-footer svg{
      margin-right: 8px;
    font-size: 15px;
}
.user-details{
  display: flex;
  justify-content:flex-start
}
.user-details div{
  background-color: #fff;
  padding: 10px 20px;
  font-size: 0.8em;
  color: #777A7C;
  font-weight: 600;
  box-shadow: var(--drop-shadow-two);
}
.post-time, .post-author, .post-rating, .post-comments{
  display: flex;
  align-items: center;
  font-weight:300;
}
.post-comments a {
  color: #007bff!important;
}
.item-footer span a{
  color: #777A7C;
  text-decoration: none;
}

.prevbtn{ max-width:40px; position: absolute; left: -50px; top:0; z-index: 1; background: #fff; padding: 0;}
.nextbtn{ max-width:40px; position: absolute; right:-50px; top:0; z-index: 1; background: #fff;padding: 0;}
.center-box{max-width: 100%; margin: 0 auto;}
.prevbtn a, .nextbtn a{
  border-radius: 100px;
  height: 40px;
  width: 40px;
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
.prevbtn a svg, .nextbtn a svg{
  font-size: 140%!important;
}

 @media (min-width: 1920px) {
    p, a, button, li, span{ font-size: 20px}
    h3{ font-size: 26px;}
    .item-footer{
      max-width: 350px;
    }
    .poolheading a{
    font-size: 26px;
    }
}

@media (max-width: 992px) {

  .nextbtn{
      right: -44px;
          top: 0px;
}
.prevbtn{
  left:-50px;
}
}

@media (max-width: 767px) {
    .pollheader{
        margin-bottom: 0px;
  }
  .poolheading a{
    font-size: 22px;
  }
  .prevbtn {
  bottom: 0px;
  top:40%;
}
.nextbtn {
  bottom: 0px;
  top:40%;
}
}
@media (max-width: 600px) {

.item-footer svg{
  /* margin-right: 0;
      margin-bottom: 10px; */
}
.post-tags{
      display: flex;
      flex-wrap: wrap;

}
.post-tags svg{ margin-right: 15px;}

.poolheading{
    margin: 0;
    line-height: 18px;
}
.poolheading a {
    font-size: 18px;
}
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
@media (max-width: 350px) {
  .post-time, .post-author, .post-rating, .post-comments{
  flex-direction: column;
}
.item-footer svg, .post-rating img{
  margin-right: 0;
      margin-bottom: 10px;
}
}
</style>
