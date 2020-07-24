<template>
  <b-container fluid="true" class="pt-3 ml-auto mr-auto mt-auto mb-5 w-75">
    <ContentLoading v-if="! poll" type="poll" />
    <CompletePoll v-if="poll" />

    <b-button v-if="role" :to="`/uprava-ankety/${slug}`" variant="outline-primary">
      {{ $t('poll.forms.edit-poll') }}
    </b-button>
    <b-button v-if="role"  @click="showVerifyMsg" variant="outline-primary">
      {{ $t('poll.forms.delete-poll') }}
    </b-button>
    <b-button v-if="role" :to="`/nova-anketa/`" variant="outline-primary">
      {{ $t('poll.forms.new-poll-heading') }}
    </b-button>

    <Comments v-if="poll" :itemId="poll._id" />
  </b-container>
</template>

<script>
import CompletePoll from '@/components/organisms/CompletePoll.vue';
import ContentLoading from '@/components/molecules/ContentLoading.vue';
import Comments from '@/components/organisms/Comments.vue';

export default {
  name: 'poll',
  components: {
    Comments,
    CompletePoll,
    ContentLoading,
  },
  props: {
    slug: String,
  },
  computed: {
    poll() {
      return this.$store.getters.POLL;
    },
    role() {
      return (this.$store.getters.USER_ROLE) ? this.$store.getters.USER_ROLE[0] === 'admin:poll' : false;
    },
  },
  created() {
    this.$store.dispatch('GET_POLL', { slug: this.slug });
  },
  beforeRouteUpdate(to, from, next) {
    if (from.params.slug !== to.params.slug) {
      this.$store.dispatch('GET_POLL', { slug: to.params.slug });
    }
    next();
  },
  methods: {
    showVerifyMsg() {
      this.$bvModal.msgBoxConfirm(this.$t('poll.forms.delete-message'), {
        title: this.$t('poll.forms.poll-confirm-message-title'),
        size: 'sm',
        buttonSize: 'sm',
        okVariant: 'danger',
        okTitle: 'YES',
        cancelTitle: 'NO',
        footerClass: 'p-2',
        hideHeaderClose: false,
        centered: true,
      })
        .then((value) => {
          if (value) {
            this.deletePoll();
          }
        })
        .catch((err) => {
          console.log(err);
        });
    },

    async deletePoll() {
      try {
        await this.$store.dispatch('DELETE_POLL', {
          pollId: this.poll._id,
        });
        this.$router.push('/');
      } catch (error) {
        // eslint-disable-next-line no-console
        console.log(error);
        if (error.response && error.response.data && error.response.data.errors) {
          this.error = this.$t(error.response.data.errors[0].messageKey);
        } else {
          this.error = this.$t('poll.forms.poll-delete-error');
        }
      }
    },
  },
};
</script>
