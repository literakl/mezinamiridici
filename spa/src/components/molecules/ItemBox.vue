<template>
  <div class="m-auto item-div item-hover">
    <router-link :to="link">
      <b-img :src="item.info.picture"></b-img>
    </router-link>
    <h4>
      <router-link :to="link">
        <!-- <div v-if="item.info.length<23">{{ item.info.caption }}</div>
        <div v-else>{{ item.info.caption.substring(0, 23)+ "..." }}</div> -->
        {{ item.info.caption }}
      </router-link>
    </h4>
    <div class="py-2 px-2 item-footer">
 <span class="forpolls"></span>
    <span class="dailystats"></span>
      <span class="data"><Date :date="item.info.date" format="dynamicDate" /></span>
      <div class="bottom-links">
      <template v-if="showAuthor"><span><BIconPersonCircle></BIconPersonCircle> <ProfileLink :profile="item.info.author"/></span></template>
      <template v-if="item.type === 'poll'">{{ $t('poll.votes') }}: {{item.votes_count}}</template>
      <template v-if="hasDiscussion">
        <span><BIconChatTextFill></BIconChatTextFill> <router-link :to="commentLink">
          <!-- {{ $t('comment.comments') }}:  -->
          {{item.comments.count}}
        </router-link></span>
      </template>
      </div>
    </div>
  </div>
</template>

<script>
import Date from '@/components/atoms/Date.vue';
import ProfileLink from '@/components/molecules/ProfileLink.vue';
import { deepCopy } from '@/utils/api';
import { BImg, BIconPersonCircle, BIconChatTextFill } from 'bootstrap-vue';

export default {
  name: 'ItemBox',
  components: {
    Date,
    ProfileLink,
    BImg,
    BIconPersonCircle,
    BIconChatTextFill,
  },
  props: {
    item: Object,
  },
  data() {
    return {
      lastCommentDate: '',
    };
  },
  computed: {
    link() {
      if (this.item.type === 'poll') {
        return { name: 'poll', params: { slug: this.item.info.slug } };
      }
      if (this.item.type === 'blog') {
        return { name: 'blog', params: { slug: this.item.info.slug, id: this.item.info.author.id } };
      }
      if (this.item.type === 'page') {
        return { name: 'page', params: { slug: this.item.info.slug } };
      }
      return { name: 'home' };
    },
    commentLink() {
      const route = deepCopy(this.link);
      route.hash = '#comments';
      return route;
    },
    showAuthor() {
      return this.item.type !== 'poll';
    },
    hasDiscussion() {
      return this.item.type === 'poll' || this.item.type === 'blog';
    },
  },
};
</script>
<style scoped>
/* img {
  width:100%;
} */
.item-div {
  border-color: #f1f1f1;
  border-style: solid;
  box-shadow: #c1c1c1 1px 1px 10px;
  position: relative;
  border: 0;
}
.item-hover {
  cursor:pointer;
  transition: 0.2s ease;
}
.item-hover:hover {
  transform: translateX(-2px) translateY(-2px) scale(1.03);
}
.item-hover:active {
  transform: translateX(-1px) translateY(-1px) scale(1.01);
}
.item-div img { box-shadow: var(--big-shadow); border: 5px solid #fff;width: 100%;}
.item-div h4 { text-align: center; height: 66px; overflow: hidden;}
.item-div:hover h4 {
    height: 110px;
}
.item-div:hover h4, .item-footer {
  position: absolute;
    width: 100%;
    bottom: 0;
}
.item-div h4 a {
  height: 75px;
  color: var(--dark-color);
  text-align: center;
  font-size: 17px;
  padding: 25px 10px 10px;
  display: block;
  display: flex;
  align-items: flex-start;
  justify-content: center;
  text-align: justify;
  text-overflow: ellipsis;
}
.item-div h4 a:hover { text-decoration: none;}
.forpolls{
  position: absolute;
  height: 9px;
  background: rgb(191 229 200 / 1);
  top: -90px;
  width: 6%;
  left: 5px;
  border-radius: 0 6px 6px 0;
}
.dailystats{
  position: absolute;
  height: 9px;
  background: rgb(179 216 255 / 1);
  top: -100px;
  width: 8.5%;
  left: 5px;
  border-radius: 0 6px 6px 0;
}


.item-footer span.data {
  position: absolute;
  font-size: 12px;
  font-weight: 400;
  right: 0;
      top: -81px;
  background: #fff;
  padding: 0px 10px;
  color:#777A7C;
}
.item-footer:hover span.data{
  opacity: 1;
}
.bottom-links{
  display: flex;
  width: 100%;
  justify-content: space-between;
  font-weight: 400;
  font-size: 14px;
  border-top: 1px solid #ddd;
  align-items: center;
  padding-top: 4px;
}
.bottom-links a {
  font-weight: 400;
}
.bottom-links span svg {
  color:#AEB3B7;
  font-size: 16px;
}
@media (min-width: 1920px) {
  .item-div h4 a{
    font-size: 20px;
    padding: 15px 10px 10px
  }
  .item-footer span.data{
    top: -96px;
  }
  .item-footer span.data span{
    font-size: 18px!important;
  }
  .bottom-links span svg{
    font-size: 20px;
  }
}
@media (max-width: 767px) {
  .forlogedin .poolheading a { font-size: 24px;}
}
</style>
