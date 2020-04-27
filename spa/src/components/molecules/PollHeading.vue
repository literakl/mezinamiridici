<template>
    <div>
        <hr />

        <h2>
          <router-link :to="{ name: 'poll', params: { slug: item.info.slug }}" class="home__heading-link">{{item.info.caption}}</router-link>
        </h2>

        <div>
          <ul>
            <li>{{created}}</li>
            <li>{{ $t('poll.votes') }}: {{item.votes.total}}</li>
            <!--                <li>{{poll.pollComments}} comments</li>-->
          </ul>
        </div>

        <hr />
    </div>
</template>

<script>

export default {
  name: 'PollHeading',
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
