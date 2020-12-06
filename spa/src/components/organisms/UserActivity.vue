<template>
  <div>
    <div class="row pb-3">
      <Radio
        class="pl-3"
        v-model="filter"
        :label="$t('profile.filter.posts')"
        name="filter"
        identifier="blog"/>
      <Radio
        class="pl-3"
        v-model="filter"
        :label="$t('profile.filter.comments')"
        name="filter"
        identifier="comment"/>
    </div>

    <div v-for="item in list" :key="item._id">
      <Date :date="item.date" format="dynamicDateTime" /> &nbsp;
      <router-link :to="getURL(item)">{{ item.text }}</router-link>
    </div>

    <Button
      v-if="!hasEnded"
      size="sm"
      class="w-25"
      :value="$t('generic.loading-more-button')"
      @clicked="fetchActivity"
    />
  </div>
</template>

<script>
import Date from '@/components/atoms/Date.vue';
import Button from '@/components/atoms/Button.vue';
import Radio from '@/components/atoms/Radio.vue';

export default {
  name: 'UserActivity',
  components: {
    Button,
    Radio,
    Date,
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
