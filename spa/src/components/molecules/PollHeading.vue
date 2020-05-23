<template>
  <b-container size="md">
    <b-card
      img-src="../../assets/unsplash/cameron-earl-zatacka.jpg"
      img-alt="Image"
      img-top
      tag="article"
      class="mb-2"
    >
      <b-card-title>
        <h1>
          <router-link :to="{ name: 'poll', params: { slug: item.info.slug }}"
                     class="poll-heading-link">{{item.info.caption}}
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
