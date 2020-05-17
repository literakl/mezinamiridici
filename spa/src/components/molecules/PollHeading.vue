<template>
    <div>
        <h1>
          <router-link :to="{ name: 'poll', params: { slug: item.info.slug }}" class="poll-heading-link">{{item.info.caption}}</router-link>
        </h1>

        <div class="poll-metadata">
          <ul>
            <li>{{created}}</li>
            <li><ProfileLink :profile="this.item.info.author" /></li>
            <li>{{ $t('poll.votes') }}: {{item.votes.total}}</li>
            <!--                <li>{{poll.pollComments}} comments</li>-->
          </ul>
        </div>
    </div>
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
  .poll-metadata {
    display: grid;
    grid-template-columns: 1fr 1fr;
  }
  .poll-metadata ul {
    list-style: none;
    padding: 0;
  }
  .poll-metadata li {
    display: inline-block;
  }
  .poll-metadata li:after {
    content: '\b7\a0';
    padding: 0 10px 0 10px;
  }
  .poll-metadata li:last-child:after {
    content: '';
  }
  .poll-heading-link {
    color: #000;
    text-decoration: none;
  }
  .poll-heading-link:hover {
    color: #000;
    text-decoration: underline;
  }
</style>
