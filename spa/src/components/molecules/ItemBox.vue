<template>
  <div class="m-auto item-div item-hover">
    <h4>
      <router-link :to="link">
        {{ item.info.caption }}
      </router-link>
    </h4>
    <router-link :to="link">
      <b-img :src="item.info.picture"></b-img>
    </router-link>
    <div class="mt-3 p-1 pl-3 item-footer">
      <Date :date="item.info.date" format="dynamicDate" />
      <template v-if="showAuthor">&bull; <ProfileLink :profile="item.info.author"/></template>
      <template v-if="item.type === 'poll'">&bull; {{ $t('poll.votes') }}: {{item.votes_count}}</template>
      <template v-if="hasDiscussion">
        &bull;
        <router-link :to="commentLink">
          {{ $t('comment.comments') }}: {{item.comments.count}}
        </router-link>
      </template>
    </div>
  </div>
</template>

<script>
import Date from '@/components/atoms/Date.vue';
import ProfileLink from '@/components/molecules/ProfileLink.vue';
import { deepCopy } from '@/utils/api';
import { BImg } from 'bootstrap-vue';

export default {
  name: 'ItemBox',
  components: {
    Date,
    ProfileLink,
    BImg,
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
      if (this.item.type === 'help' || this.item.type === 'article') {
        return { name: 'content', params: { slug: this.item.info.slug } };
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
      return this.item.type === 'poll' || this.item.type === 'blog' || this.item.type === 'article';
    },
  },
};
</script>
<style scoped>
  img {
    width:100%;
  }
  .item-div {
    border-width: 10px;
    border-color: #f1f1f1;
    border-style: solid;
    box-shadow: #c1c1c1 1px 1px 10px;
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
  .item-div h4 {}
  .item-footer {
    background-color: #f1f1f1;
    font-size: 0.8em;
    color: #201f27;
    font-weight: 600;
  }
</style>
