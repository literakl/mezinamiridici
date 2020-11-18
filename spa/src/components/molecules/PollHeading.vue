<template>
  <b-container>
    <b-row align-v="center" align-h="center">
      <b-col sm="1" v-if="item.siblings">
        <b-button v-if="item.siblings.older" :to="link(item.siblings.older)" variant="secondary">
          <BIconChevronDoubleLeft font-scale="2"></BIconChevronDoubleLeft>
        </b-button>
      </b-col>
      <b-col sm="auto">
        <div class="item-div item-hover mb-3">
          <h4>
            <router-link :to="{ name: 'poll', params: { slug: item.info.slug }}">
              {{item.info.caption}}
            </router-link>
          </h4>
          <div class="mt-3 p-1 pl-3 item-footer">
            <Date :date="this.item.info.date" format="dynamicDate" />  &bull;
            <ProfileLink :profile="this.item.info.author"/> &bull;
            {{ $t('poll.votes') }}: {{item.votes.total}} &bull;
            <router-link :to="{ name: 'poll', params: { slug: item.info.slug }, hash: '#comments'}">
              {{ $t('comment.comments') }}: {{item.comments.count}}
            </router-link>
            <template v-if="hasTags">
              &bull;
              <TagList :tags="tags"/>
            </template>
          </div>
        </div>
      </b-col>
      <b-col sm="1" v-if="item.siblings">
        <b-button v-if="item.siblings.newer" :to="link(item.siblings.newer)" variant="secondary">
          <BIconChevronDoubleRight font-scale="2"></BIconChevronDoubleRight>
        </b-button>
      </b-col>
    </b-row>
  </b-container>
</template>

<script>
import { BIconChevronDoubleLeft, BIconChevronDoubleRight, BContainer, BRow, BCol, BButton } from 'bootstrap-vue';
import ProfileLink from '@/components/molecules/ProfileLink.vue';
import Date from '@/components/atoms/Date.vue';
import TagList from '@/components/atoms/TagList.vue';

export default {
  name: 'PollHeading',
  components: {
    ProfileLink,
    Date,
    TagList,
    BIconChevronDoubleLeft,
    BIconChevronDoubleRight,
    BContainer,
    BRow,
    BCol,
    BButton,
  },
  props: {
    item: Object,
  },
  computed: {
    hasTags() {
      return this.tags !== null && this.tags.length > 0;
    },
    tags() {
      return this.poll !== null && this.item.info.tags;
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
  },
};
</script>

<style scoped>
.item-div {
  border-width: 10px;
  border-color: #f1f1f1;
  border-style: solid;
  box-shadow: #c1c1c1 1px 1px 10px;
}
.item-footer {
  background-color: #f1f1f1;
  font-size: 0.8em;
  color: #201f27;
  font-weight: 600;
}
</style>
