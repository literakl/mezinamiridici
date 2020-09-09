<template>
  <span>
    <router-link :to="{ name: 'user-profile', params: { id: profile.id }}" :id="id">
      {{profile.nickname}}
    </router-link>
    <b-popover v-if="showUserInfo" @show="onShow" :target="id" triggers="hover" placement="top" delay="150">
      <template v-slot:title>Popover Title</template>
      <template v-slot:default v-if="userInfo">
        I am {{ userInfo.bio.nickname }}
      </template>
    </b-popover>
  </span>
</template>

<script>
import { BPopover } from 'bootstrap-vue';
import { nanoid } from 'nanoid';

export default {
  name: 'ProfileLink',
  components: {
    BPopover,
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
