<template>
  <div>
    <div class="selectors">
      <Radio
        class="post-box mr-3"
        v-model="filter"
        :label="$t('profile.filter.posts')"
        name="filter"
        identifier="blog"/>
      <Radio
        class="comment-box"
        v-model="filter"
        :label="$t('profile.filter.comments')"
        name="filter"
        identifier="comment"/>
    </div>
    <ul class="post-list">
      <li v-for="item in list" :key="item._id">
        <span><BIconClock font-scale="1"></BIconClock> <Date :date="item.date" format="dynamicDateTime" /></span>
        <router-link :to="getURL(item)">{{ item.text }}</router-link>
      </li>
    </ul>
    <Button
      v-if="!hasEnded"
      size="sm"
      class="mt-3 loadmore"
      :value="$t('generic.loading-more-button')"
      @clicked="fetchActivity"
    />
  </div>
</template>

<script>
import Date from '@/components/atoms/Date.vue';
import Button from '@/components/atoms/Button.vue';
import Radio from '@/components/atoms/Radio.vue';
import { BIconClock } from 'bootstrap-vue';

export default {
  name: 'UserActivity',
  components: {
    Button,
    Radio,
    Date,
    BIconClock,
  },
  props: {
    userId: String,
  },
  data() {
    return {
      filter: 'blog',
      index: 0,
      pageSize: 10,
      hasEnded: false,
      list: [],
    };
  },
  watch: {
    filter() {
      this.index = 0;
      this.hasEnded = 0;
      this.list = [];
      this.fetchActivity();
    },
  },
  created() {
    this.fetchActivity();
  },
  methods: {
    async fetchActivity() {
      const payload = { start: this.index, size: this.pageSize, userId: this.userId, type: this.filter };
      const items = await this.$store.dispatch('FETCH_USER_ACTIVITY', payload);
      if (items.length === 0) {
        this.hasEnded = true;
        return;
      } else if (items.length < this.pageSize) {
        this.hasEnded = true;
      }

      this.index = this.index + this.pageSize;
      this.list = this.list.concat(items);
    },
    getURL(item) {
      if (this.filter === 'comment') {
        return { name: item.type,
          params: {
            slug: item.slug,
            id: item.userId,
          },
          hash: `#${item._id}`,
        };
      } else {
        return { name: 'blog',
          params: {
            slug: item.slug,
            id: item.userId,
          },
        };
      }
    },
  },
};
</script>
<style scoped>
.selectors{
  display: flex;
  margin-bottom:10px;
  align-items: center;
  justify-content: flex-start;
}
.post-list{ padding: 0; margin: 0; min-height: 450px;}
.post-list li, .comment-box li{
  list-style-type: none;
  display: flex;
  border-bottom: 1px solid #f3f3f3;
  margin-bottom: 3px;
  display: flex;
  align-items: flex-start;
  padding: 8px 0px;
  z-index: 1;
  font-size: 14px;
}
.post-list li svg, .comment-box li svg{
  margin-right: 5px;
}
.post-list li span, .comment-box li span{
  max-width: 150px;
  color: var(--text-color-light);
  width: 100%;
}
.post-list li a:hover, .comment-box li a:hover{
  text-decoration: none;
}
.post-list li:hover, .comment-box li:hover{
  background: white;
  z-index: 2; transition: 0.2s ease;transform:
  translateX(-2px) translateY(-2px) scale(1.01);
}

@media (min-width: 1920px) {
  .post-list li span, .comment-box li span{
    max-width: 210px
  }
}
@media (max-width: 500px) {
  .post-list li, .comment-box li{
    flex-direction: column;
  }
}
</style>
