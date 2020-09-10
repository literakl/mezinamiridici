<template>
  <span>
    <router-link :to="{ name: 'user-profile', params: { id: profile.id }}" :id="id">
      {{profile.nickname}}
    </router-link>
    <b-popover v-if="showUserInfo" @show="onShow" :target="id" triggers="hover" placement="top" delay="150">
      <template v-slot:title><span v-if="userInfo">{{ userInfo.bio.nickname }}</span></template>
      <template v-slot:default v-if="userInfo">
        <div>{{ $t('profile.info.member-since') }}: <Date :date="userInfo.bio.registered" format="dynamicDate" /></div>
        <div>{{ $t('profile.info.rank-label') }}: {{ $t(`profile.info.rank.${userInfo.honors.rank}`) }}</div>
        <div>{{ $t('profile.info.comments-label') }}: {{ userInfo.honors.count.comments }}</div>
        <div v-if="userInfo.honors.count.commentVoteRatio">{{ $t('profile.info.comment-ratio-label') }}: {{ userInfo.honors.count.commentVoteRatio }}</div>
      </template>
    </b-popover>
  </span>
</template>

<script>
import { BPopover } from 'bootstrap-vue';
import { nanoid } from 'nanoid';
import Date from '@/components/atoms/Date.vue';

export default {
  name: 'ProfileLink',
  components: {
    BPopover,
    Date,
  },
  props: {
    profile: Object,
    showUserInfo: {
      type: Boolean,
      default: true,
    },
  },
  data() {
    return {
      userInfo: undefined,
      requested: false,
      id: nanoid(6),
    };
  },
  methods: {
    async onShow() {
      if (!this.requested) {
        console.log(`onShow ${this.profile.id}`);
        this.requested = true;
        this.userInfo = await this.$store.dispatch('FETCH_USER_INFO', { userId: this.profile.id });
        console.log(this.userInfo);
      }
    },
  },
};
</script>
