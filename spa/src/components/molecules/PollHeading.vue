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

            <b-dropdown v-if="hasPath" text="Share"  variant="primary" class="m-md-2">
              <b-dropdown-item v-for="(item, index) in shareLinkList" :key="index" @click="shareLink(index)">
                {{item.toUpperCase()}}
              </b-dropdown-item>
            </b-dropdown>

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
  data() {
    return {
      shareLinkList: ['facebook', 'twitter', 'messenger', 'whatsapp', 'email'],
    };
  },
  computed: {
    // urlToShare() {
    //   return `http://mezinamiridici.cz/poll/${this.item.poll.pollId}/${this.item.poll.slug}`;
    // },
    hasPath() {
      return this.$route.fullPath.split('/')[1] === 'anketa';
    },
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
    async shareLink(shareIndex) {
      const body = {
        itemId: this.item._id,
        link: this.shareLinkList[shareIndex],
        path: `/anketa/${this.item.info.slug}`,
      };
      const response = await this.$store.dispatch('SHARE_LINK', body);
      const { data } = response.data;
      window.location.href = data;
    },
  },
};
</script>
