<template>
  <div class="m-auto item-div item-hover">
    <router-link :to="link">
      <b-img :src="item.info.picture"></b-img>
    </router-link>
    <h4>
      <router-link :to="link">
        {{ item.info.caption }}
      </router-link>
    </h4>
    <div class="py-2 px-3 item-footer">
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
img {
  width:100%;
}
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
.item-div img { box-shadow: var(--big-shadow); border: 5px solid #fff;}
.item-div h4 { text-align: center;}

.item-div h4 a {
  height: 95px;
  color: var(--dark-color);
  text-align: center;
  font-size: 17px;
      padding: 32px 10px 10px;
  display: block;
      display: flex;
    align-items: flex-start;
    justify-content: center;
}

.item-footer span.data {
  position: absolute;
  font-size: 12px;
  font-weight: 400;
      right: 0;
    top: 151px;
  background: #fff;
  padding: 3px 10px;
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
}
.bottom-links a {
  font-weight: 400;
}
.bottom-links span svg {
  color:#AEB3B7;
  font-size: 16px;
}

@media (max-width: 767px) {
  .forlogedin .poolheading a { font-size: 24px;}
}
</style>
