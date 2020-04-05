<template>
    <div>
        <hr />

        <h2 id="home__heading-title">
          <router-link :to="{ name: 'poll', params: { slug: item.info.slug }}" class="home__heading-link">{{item.info.caption}}</router-link>
        </h2>

        <div id="home__heading-metadata">
          <ul id="home__heading-metadata-details">
            <li>{{created}}</li>
            <li>{{ $t('poll.votes') }}: {{item.votes.total}}</li>
            <!--                <li>{{poll.pollComments}} comments</li>-->
          </ul>

          <ul id="home__heading-metadata-social">
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

<style lang="scss">
#home__heading-title {
  font-size: 34px;
  line-height: 32px;
}

#home__heading-metadata {
  display: grid;
  grid-template-columns: 1fr 1fr;
}

#home__heading-metadata-social {
  text-align: right;
}

#home__heading-metadata ul {
  list-style: none;
  padding: 0;
}

#home__heading-metadata li {
  display: inline-block;
}

#home__heading-metadata li:after {
  content: '\b7\a0';
  padding: 0 10px 0 10px;
}

#home__heading-metadata li:last-child:after {
  content: '';
}

.fb-like > span {
  vertical-align: baseline !important;
}

.home__heading-link{
  color: #000;
  text-decoration: none;
}

.home__heading-link:hover {
  text-decoration: underline;
}
</style>
