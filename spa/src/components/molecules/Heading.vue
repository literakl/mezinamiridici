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
              <li><router-link :to="{ name: 'user-profile', params: { id: poll.userId }}">{{poll.userData.nickname}}</router-link></li>
              <li>53 votes</li>
              <li>290 comments</li>
              </ul>
              <ul id="home__heading-metadata-social">
              <li><iframe :src="'https://www.facebook.com/plugins/like.php?href=' + urlToShare + '&width=79&layout=button_count&action=like&size=small&show_faces=true&share=false&height=21&appId=547554546015306'" width="79" height="21" style="border:none;overflow:hidden" scrolling="no" frameborder="0" allowTransparency="true" allow="encrypted-media"></iframe></li>
              <li><span id="twitter-share"></span></li>
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
  updated: function(){
    if(this.poll){
      const text = this.poll.text;
      twttr.widgets.createShareButton(
        'https://betweenusdrivers.jacobclark.dev/polls/' + this.poll.pollId,
        document.getElementById('twitter-share'),
        {
          text: 'Between us Drivers - ' + text
        }
      );
    }
  },
  computed: {
    created() {
      const date = new Date(0);
      date.setUTCSeconds(this.poll.created);

      return `${date.getDate()}.${date.getMonth()}.${date.getFullYear()}`;
    },
    urlToShare() {
      return 'https://betweenusdrivers.jacobclark.dev/polls/' + this.poll.pollId
    }
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

.fb-like > span {
  vertical-align: baseline !important;
}
</style>
