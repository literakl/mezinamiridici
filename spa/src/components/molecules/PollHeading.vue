<template>
  <b-container>
    <b-row align-v="center" align-h="center">
      <b-col sm="1" v-if="item.siblings">
        <b-button v-if="item.siblings.older" :to="link(item.siblings.older)" variant="secondary">
          <b-icon icon="chevron-double-left" font-scale="2"></b-icon>
        </b-button>
      </b-col>
      <b-col sm="auto">
        <b-card tag="article">
          <b-card-body>
            <h1>
              <router-link :to="{ name: 'poll', params: { slug: item.info.slug }}">
                {{item.info.caption}}
              </router-link>
            </h1>
          </b-card-body>
          <b-card-footer>
            <Date :date="this.item.info.date" format="dynamicDate" />  &bull;
            <ProfileLink :profile="this.item.info.author"/> &bull;
            {{ $t('poll.votes') }}: {{item.votes.total}} &bull;
            <router-link :to="{ name: 'poll', params: { slug: item.info.slug }, hash: '#comments'}">
              {{ $t('poll.comments') }}: {{item.comments.count}}
            </router-link>
          </b-card-footer>
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
import Date from '@/components/atoms/Date.vue';

export default {
  name: 'PollHeading',
  components: {
    ProfileLink, Date,
  },
  props: {
    item: Object,
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
