<template>
  <div class="m-auto item-div item-hover">
    <router-link :to="link">
      <b-img :src="item.info.picture" alt="" />
    </router-link>
    <div class="picture-actions">
      <span v-if="item.type === 'article'" class="picture-overlay overlay-left">
        {{ $t('generic.content.article') }}
      </span>
      <span v-if="item.type === 'blog'" class="picture-overlay overlay-left">
        {{ $t('generic.content.blog') }}
      </span>
      <span v-if="item.type === 'poll'" class="picture-overlay overlay-left">
        {{ $t('generic.content.poll') }}
      </span>
      <span class="picture-overlay overlay-right"><Date :date="item.info.date" format="dynamicDate"/></span>
    </div>
    <h4>
      <router-link :to="link">
        {{ item.info.caption }}
      </router-link>
    </h4>
    <div class="py-2 px-2 item-footer">
      <div class="bottom-links">
        <template v-if="showAuthor"><span><BIconPersonCircle></BIconPersonCircle> <ProfileLink :profile="item.info.author"/></span></template>
        <template v-if="item.type === 'poll'">{{ $t('poll.votes') }}: {{ item.votes_count }}</template>
        <template v-if="hasDiscussion">
          <span>
            <router-link :to="commentLink">
              <BIconChatTextFill></BIconChatTextFill>
              {{ item.comments.count }}
            </router-link>
          </span>
        </template>
      </div>
    </div>
  </div>
</template>

<script>
import { BImg, BIconPersonCircle, BIconChatTextFill } from 'bootstrap-vue';
import Date from '@/components/atoms/Date.vue';
import ProfileLink from '@/components/molecules/ProfileLink.vue';
import { deepCopy } from '@/utils/api';

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
      if (this.item.type === 'article') {
        return {
          name: 'article',
          params: { slug: this.item.info.slug },
        };
      }
      if (this.item.type === 'blog') {
        return {
          name: 'blog',
          params: {
            slug: this.item.info.slug,
            id: this.item.info.author.id,
          },
        };
      }
      if (this.item.type === 'poll') {
        return {
          name: 'poll',
          params: { slug: this.item.info.slug },
        };
      }
      if (this.item.type === 'page') {
        return {
          name: 'page',
          params: { slug: this.item.info.slug },
        };
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
      return this.item.type === 'article' || this.item.type === 'blog' || this.item.type === 'poll';
    },
  },
};
</script>
<style scoped>

.item-div {
  box-shadow: #c1c1c1 1px 1px 10px;
  border: 0 solid #f1f1f1;
  position: relative;
}

.item-hover {
  cursor: pointer;
  transition: 0.2s ease;
}

.item-hover:hover {
  transform: translateX(-2px) translateY(-2px) scale(1.03);
}

.item-div img {
  box-shadow: var(--big-shadow);
  border: 5px solid #fff;
  width: 100%;
}

.item-div h4 {
  text-align: center;
  height: 55px;
  margin: 0;
  overflow: hidden;
}

.item-footer {
  position: relative;
}

.item-div:hover h4, .item-footer {
  width: 100%;
  bottom: 0;
}

.item-div h4 a {
  color: var(--dark-color)!important;
  font-size: 16px;
  padding: 16px 10px 18px 10px;
  display: flex;
  align-items: flex-start;
  justify-content: flex-start;
  text-align: left;
  text-overflow: ellipsis;
}

.item-div h4 a:hover {
  text-decoration: none;
}

.picture-actions {
  position: relative;
}

.poll-symbol {
  position: absolute;
  display: block;
  width: 100%;
  top: -35px;
  left: 5px;
}

span.picture-overlay {
  position: absolute;
  font-size: 12px;
  font-weight: 400;
  background: #fff;
  padding: 0 10px;
  color: #777A7C;
  top: -20px;
}

span.overlay-left {
  left: 0;
}

span.overlay-right {
  right: 0;
}

.bottom-links {
  display: flex;
  width: 100%;
  justify-content: space-between;
  font-weight: 400;
  font-size: 14px;
  border-top: 1px solid #ddd;
  align-items: center;
  padding-top: 10px;
}

@media (min-width: 1920px) {
  span.picture-overlay {
    top: -20px;
  }

  .bottom-links span svg {
    font-size: 20px;
  }

  .item {
    width: 400px;
  }
}

@media (max-width: 767px) {
  .item-div h4 {
    height: auto;
  }
}
</style>
