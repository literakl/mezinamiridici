<template>
  <b-container fluid="true" class="pt-3 w-75 m-auto">
    <TagsHeading v-if="tags" :tags="tags" :cTag="tag"/>
    <ContentLoading v-if="! tags" type="tags"/>

    <b-row>
      <b-col>
        <ul>
          <li v-for="item in polls" :key="item._id">
            <router-link :to="{ name: 'poll', params: { slug: item.info.slug }}">
              {{item.info.caption}}
            </router-link>
            {{ $t('poll.votes') }}: {{item.votes_count}}
          </li>
        </ul>
      </b-col>
    </b-row>
  </b-container>
</template>

<script>
import ContentLoading from '@/components/molecules/ContentLoading.vue';
import TagsHeading from '@/components/molecules/TagsHeading.vue';

export default {
  name: 'home',
  components: {
    ContentLoading,
    TagsHeading,
  },
  props: {
    tag: String,
  },
  watch: {
    $route: 'fetchData',
  },
  computed: {
    tags() {
      return this.$store.getters.TAGS;
    },
    polls() {
      let stream = [];
      if (this.tag) {
        stream = this.$store.getters.ITEM_BY_TAG;
      }
      return stream;
    },
  },
  created() {
    this.$store.dispatch('GET_TAGS');
    if (this.tag) {
      this.$store.dispatch('GET_POLL_BY_TAG', this.tag);
    }
  },
  methods: {
    fetchData() {
      if (this.tag) {
        this.$store.dispatch('GET_POLL_BY_TAG', this.tag);
      }
    },
  },
};
</script>
