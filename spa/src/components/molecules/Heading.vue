<template>
    <div>
        <hr />
        <div v-if="poll">
          <h2 id="home__heading-title">
              {{poll.text}}
          </h2>
          <div id="home__heading-metadata">
              <ul id="home__heading-metadata-details">
              <li>{{created}}</li>
              <li>{{poll.userId}}</li>
              <li>53 votes</li>
              <li>290 comments</li>
              </ul>
              <ul id="home__heading-metadata-social">
              <li>(Facebook) Like | Share</li>
              <li>Twitter Share</li>
              </ul>
          </div>
        </div>
        <content-loader
            :height="60"
            :width="400"
            :speed="2"
            primaryColor="#f3f3f3"
            secondaryColor="#ecebeb"
            v-if="!poll"
          >
            <rect x="0" y="8" rx="3" ry="3" width="350" height="6.4" />
            <rect x="0" y="28" rx="3" ry="3" width="380" height="6.4" />
            <rect x="0" y="48" rx="3" ry="3" width="201" height="6.4" />
          </content-loader>
        <hr />
    </div>
</template>

<script>
import { ContentLoader } from 'vue-content-loader';

export default {
  name: 'Heading',
  props: {
    poll: Object,
  },
  computed: {
    created() {
      const date = new Date(this.poll.created);

      return `${date.getDate()}.${date.getMonth()}.${date.getFullYear()}`;
    },
  },
  components: {
    ContentLoader,
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
</style>
