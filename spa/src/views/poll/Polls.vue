<template>
  <div class="pt-3 w-75 m-auto">
    <div class="mb-2 d-flex flex-row-reverse">
      <b-button-group>
        <b-button v-if="role" :to="{ name: 'create-poll'}" variant="outline-primary">
          {{ $t('poll.forms.new-poll-heading') }}
        </b-button>
      </b-button-group>
    </div>

    <div v-for="item in polls" :key="item._id">
      <b-card tag="article">
        <b-card-body>
          <h3>
            <router-link :to="{ name: 'poll', params: { slug: item.info.slug }}">
              {{item.info.caption}}
            </router-link>
          </h3>
        </b-card-body>
        <b-card-footer class="d-flex justify-content-between">
          <div>
            <Date :date="item.info.date" format="dynamicDate" /> &bull;
            <ProfileLink :profile="item.info.author"/> &bull;
            {{ $t('poll.votes') }}: {{item.votes.total}} &bull;
            <router-link :to="{ name: 'poll', params: { slug: item.info.slug }, hash: '#comments'}">
              {{ $t('comment.comments') }}: {{item.comments.count}}
            </router-link>
            <span v-if="! item.info.published">
               &bull; {{ $t('generic.not-published') }}
            </span>
          </div>
          <b-button-group>
            <b-button v-if="role" :to="{ name: 'edit-poll', params: { slug: item.info.slug }}" variant="outline-primary">
              {{ $t('poll.forms.edit-poll') }}
            </b-button>
            <b-button v-if="role" @click="confirmDelete(item)" variant="outline-primary">
              {{ $t('poll.forms.delete-poll') }}
            </b-button>
          </b-button-group>
        </b-card-footer>
      </b-card>
    </div>
  </div>
</template>

<script>
import ProfileLink from '@/components/atoms/ProfileLink.vue';
import Date from '@/components/atoms/Date.vue';

export default {
  components: {
    ProfileLink, Date,
  },
  data() {
    return {
      polls: null,
    };
  },
  computed: {
    role() {
      return (this.$store.getters.USER_ROLE) ? this.$store.getters.USER_ROLE[0] === 'admin:poll' : false;
    },
  },
  async mounted() {
    this.polls = await this.$store.dispatch('GET_POLLS', {});
  },
  methods: {
    confirmDelete(item) {
      this.$bvModal.msgBoxConfirm(this.$t('poll.forms.delete-message'), {
        title: this.$t('poll.forms.poll-confirm-message-title'),
        size: 'sm',
        buttonSize: 'sm',
        okVariant: 'danger',
        okTitle: this.$t('generic.ok-button'),
        cancelTitle: this.$t('generic.cancel-button'),
        footerClass: 'p-2',
        hideHeaderClose: false,
        centered: true,
      })
        .then((value) => {
          if (value) {
            this.deletePoll(item);
          }
        })
        .catch((err) => {
          this.$log.error(err);
        });
    },

    async deletePoll(item) {
      await this.$store.dispatch('DELETE_POLL', {
        pollId: item._id,
      });
      this.polls = await this.$store.dispatch('GET_POLLS', {});
    },
  },
};
</script>
