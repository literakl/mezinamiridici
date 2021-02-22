<template>
  <div class="centerbox pt-3 m-auto">
    <div class="mb-2 d-flex flex-row-reverse action-btn">
      <b-button-group>
        <b-button v-if="role" :to="{ name: 'create-poll'}" variant="btn btn-primary">
          <BIconPlusCircle scale="1"></BIconPlusCircle>
          {{ $t('poll.forms.new-poll-heading') }}
        </b-button>
      </b-button-group>
    </div>

    <div v-for="item in polls" :key="item._id" class="pollslist-box">
      <b-card tag="article">
        <b-card-body>
          <h3>
            <router-link :to="{ name: 'poll', params: { slug: item.info.slug }}">
              {{item.info.caption}}
            </router-link>
          </h3>
        </b-card-body>
        <b-card-footer class="">
          <div>
            <span><BIconCalendarRange scale="1"></BIconCalendarRange><Date :date="item.info.date" format="dynamicDate"/></span>
            <span><BIconPersonCircle scale="1"></BIconPersonCircle><ProfileLink :profile="item.info.author"/></span>
            <span><BIconStarFill scale="1"></BIconStarFill>{{item.votes.total}}</span>
            <span><BIconChatTextFill scale="1"></BIconChatTextFill><router-link :to="{ name: 'poll', params: { slug: item.info.slug }, hash: '#comments'}">
               {{item.comments.count}}
            </router-link></span>
            <span v-if="! item.info.published">
               <BIconXOctagon scale='1'></BIconXOctagon> {{ $t('generic.not-published') }}
            </span>
          </div>
          <b-button-group>
            <b-button v-if="role" :to="{ name: 'edit-poll', params: { slug: item.info.slug }}" variant="outline-primary">
              <span><BIconPencilSquare scale="1"></BIconPencilSquare>{{ $t('poll.forms.edit-poll') }}</span>
            </b-button>
            <b-button v-if="role" @click="confirmDelete(item)" variant="outline-primary">
              <span><BIconTrash scale="1"></BIconTrash>{{ $t('poll.forms.delete-poll') }}</span>
            </b-button>
          </b-button-group>
        </b-card-footer>
      </b-card>
    </div>
  </div>
</template>

<script>
import ProfileLink from '@/components/molecules/ProfileLink.vue';
import Date from '@/components/atoms/Date.vue';
import { BButtonGroup, BButton, BCard, BCardBody, BCardFooter, BIconPlusCircle, BIconCalendarRange, BIconPersonCircle, BIconStarFill, BIconChatTextFill, BIconPencilSquare, BIconTrash, BIconXOctagon } from 'bootstrap-vue';

export default {
  components: {
    ProfileLink,
    Date,
    BButtonGroup,
    BButton,
    BCard,
    BCardBody,
    BCardFooter,
    BIconPlusCircle,
    BIconCalendarRange,
    BIconPersonCircle,
    BIconStarFill,
    BIconChatTextFill,
    BIconPencilSquare,
    BIconTrash,
    BIconXOctagon,
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
<style scoped>
.centerbox{
  max-width:1235px;
  margin: 0 auto;
}
.action-btn a{ font-size: 14px;}
.action-btn a svg{ color: #fff;}
.pollslist-box{
  box-shadow:  0 1px 6px rgba(var(--shadow-color), 0.35);
  margin-bottom: 10px;
}
.pollslist-box h3{ font-size: 18px;}
.pollslist-box .card-footer{
  display: flex;
  justify-content: space-between;
  align-items: center;
  border-top:0px solid #ddd;
  background: rgb(134 134 134 / 3%);
  padding: 8px 15px;
}
.pollslist-box .card-footer div{ display: flex;}
.pollslist-box .card-footer div span{ margin-right: 15px; font-size: 14px;}
.pollslist-box .card-footer span span{ margin-right: 0;display: inline-block;}
.pollslist-box .card-footer span a{
  display: inline-block;
}
.pollslist-box .card-footer svg {
  margin-right: 5px;
}
.pollslist-box .card-footer .btn-group button{
  font-size: 14px;
  padding: 0;
  border: 0;
  font-weight: 300;
}
.pollslist-box .card-footer .btn-group button:hover, .pollslist-box .card-footer .btn-group button:focus{
  background: transparent;
  color: var(--text-color);
}
.pollslist-box .card-footer .btn-group a:hover, .pollslist-box .card-footer .btn-group a:focus{
  background: transparent;
  color: var(--text-color);
}
.pollslist-box .card-footer .btn-group a{
  font-size: 14px;
  margin-right: 10px;
  padding: 0;
  border: 0;
  font-weight: 300;
}
.pollslist-box .card-footer .btn-group span{ margin-right: 0;}
  @media (max-width: 1235px) {
    .centerbox{ margin:0 35px!important;}
  }
  @media (max-width: 767px) {
  .pollslist-box .card-footer span{
    display: flex;
    flex-direction: column;
    align-items: center;
  }
  .pollslist-box .card-footer span svg{
    margin-right: 0;
  }
  .pagelist-box .card-footer{
    flex-direction: column;
  }
}
@media (max-width: 480px) {
  .pollslist-box .card-footer div{
    width: 100%;
    display: flex;
    flex-direction: column;
    align-items: flex-start;
  }
  .pollslist-box .card-footer span{
    flex-direction: row;
  }
  .pollslist-box .card-footer span svg{
    margin-right: 5px;
  }
  .pollslist-box .card-footer{
    align-items: flex-start;
  }
}
@media (max-width: 390px) {
  .pollslist-box .card-footer{
    flex-direction: column;
  }
   .card-footer .btn-group{
    display: flex;
    flex-direction: column;
  }
}
</style>
