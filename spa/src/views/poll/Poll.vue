<template>
  <b-container fluid="true" class="pt-3 ml-auto mr-auto mt-auto mb-5 w-75">
    <ContentLoading v-if="! poll" type="poll" />
    <CompletePoll v-if="poll" />
    <Tags v-if="hasTags" :tags="tags" @clicked="viewPoll"/>
    <Comments v-if="poll" :itemId="poll._id" />
  </b-container>
</template>

<script>
import CompletePoll from '@/components/organisms/CompletePoll.vue';
import ContentLoading from '@/components/molecules/ContentLoading.vue';
import Comments from '@/components/organisms/Comments.vue';
import Tags from '@/components/atoms/Tags.vue';

export default {
  name: 'poll',
  components: {
    Comments,
    CompletePoll,
    ContentLoading,
    Tags,
  },
  props: {
    slug: String,
  },
  data() {
    return {
      // taglist: 'tag list',
    };
  },
  computed: {
    poll() {
      return this.$store.getters.POLL;
    },
    role() {
      return (this.$store.getters.USER_ROLE) ? this.$store.getters.USER_ROLE[0] === 'admin:poll' : false;
    },
    hasTags() {
      return this.tags !== null && this.tags.length > 0;
    },
    tags() {
      return this.poll !== null && this.poll.info.tags;
    },
  },
  created() {
    this.$store.dispatch('GET_POLL', { slug: this.slug });
  },
  beforeRouteUpdate(to, from, next) {
    if (from.params.slug !== to.params.slug) {
      this.$store.dispatch('GET_POLL', { slug: to.params.slug });
    }
    next();
  },
  methods: {
    viewPoll(emitTag) {
      this.$router.push(`/stitky/${emitTag}`);
    },
  },
};
</script>
