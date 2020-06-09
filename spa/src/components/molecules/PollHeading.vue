<template>
  <b-container>
    <b-row align-v="center" align-h="center">
      <b-col sm="1" v-if="item.siblings">
        <b-button v-if="item.siblings.older" :to="link(item.siblings.older)" variant="secondary">
          <b-icon icon="chevron-double-left" font-scale="2"></b-icon>
        </b-button>
      </b-col>
      <b-col sm="auto">
        <b-card
          img-src="../../../public/img/poll/unsplash/cameron-earl-zatacka.jpg"
          img-alt="Image"
          img-top
          tag="article"
          class="mb-2"
        >
          <b-card-title>
            <h1>
              <router-link :to="{ name: 'poll', params: { slug: item.info.slug }}" class="poll-heading-link">
                {{item.info.caption}}
              </router-link>
            </h1>
          </b-card-title>
          <b-card-text>
            {{created}} &bull;
            <ProfileLink :profile="this.item.info.author"/> &bull;
            {{ $t('poll.votes') }}: {{item.votes.total}}
            <!--                <li>{{poll.pollComments}} comments</li>-->
          </b-card-text>
        </b-card>
      </b-col>
      <b-col sm="1" v-if="item.siblings">
        <b-button v-if="item.siblings.newer" :to="link(item.siblings.newer)" variant="secondary">
          <b-icon icon="chevron-double-right" font-scale="2"></b-icon>
        </b-button>
      </b-col>
    </b-row>
  </b-container>
</template>

<script>
import ProfileLink from '@/components/atoms/ProfileLink.vue';

export default {
  name: 'PollHeading',
  components: {
    ProfileLink,
  },
  computed: {
    item() {
      return this.$store.getters.POLL;
    },
    created() {
      const date = new Date(this.item.info.date);
      return `${date.getDate()}.${date.getMonth() + 1}.${date.getFullYear()}`;
    },
    // urlToShare() {
    //   return `http://mezinamiridici.cz/poll/${this.item.poll.pollId}/${this.item.poll.slug}`;
    // },
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

<style lang="scss">
  .poll-heading-link {
    color: #000;
    text-decoration: none;
  }

  .poll-heading-link:hover {
    color: #000;
    text-decoration: underline;
  }
</style>
