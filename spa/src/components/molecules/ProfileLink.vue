<template>
  <span>
    <router-link :to="{ name: 'user-profile', params: { id: profile.id }}" :id="`user_${profile.id}`">
      {{profile.nickname}}
    </router-link>
    <b-popover @show="onShow" :target="`user_${profile.id}`" triggers="hover" placement="top" delay="150">
      <template v-slot:title>Popover Title</template>
      <template v-slot:default v-if="userInfo">
        I am {{ userInfo.bio.nickname }}
      </template>
    </b-popover>
  </span>
</template>

<script>
import { BPopover } from 'bootstrap-vue';

export default {
  name: 'ProfileLink',
  components: {
    BPopover,
  },
  props: {
    profile: Object,
  },
  data() {
    return {
      userInfo: undefined,
      requested: false,
    };
  },
  methods: {
    onShow() {
      if (!this.requested) {
        console.log(`onShow ${this.profile.id}`);
        this.requested = true;
        this.userInfo = this.$store.dispatch('FETCH_USER_INFO', { userId: this.profile.id });
      }
    },
  },
};
</script>
