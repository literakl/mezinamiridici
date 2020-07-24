<template>
  <div class="mb-2">


    <ValidationObserver ref="observer" v-slot="{ handleSubmit }">
      <b-form @submit.stop.prevent="handleSubmit(onSubmit)">
        <ValidationProvider :rules="{ required: true, min: 10 }" v-slot="validationContext">
          <b-form-group id="text-group" :label="$t('poll.forms.text-label')" label-for="text">

            <b-form-input
              id="text" name="text" aria-describedby="text-errors"
              v-model="form.text" :state="getValidationState(validationContext)">
            </b-form-input>

            <b-form-invalid-feedback id="text-errors">{{ validationContext.errors[0] }}</b-form-invalid-feedback>

          </b-form-group>
        </ValidationProvider>

        <ValidationProvider :rules="{ required: true, min: 10 }" v-slot="validationContext">

          <b-form-group id="date-group" :label="$t('poll.forms.date-label')" label-for="date">
            <!-- <b-form-input
              id="date" name="date" aria-describedby="date-errors"
              v-model="form.date" :state="getValidationState(validationContext)">
            </b-form-input> -->

            <b-form-datepicker v-model="form.date" @context="onContext"
            :date-format-options="{ year: 'numeric', month: 'numeric', day: 'numeric' }"
             locale="en-US" aria-describedby="date-errors" :state="getValidationState(validationContext)"></b-form-datepicker>

            <b-form-invalid-feedback id="date-errors">{{ validationContext.errors[0] }}</b-form-invalid-feedback>
          </b-form-group>

        </ValidationProvider>

        <ValidationProvider :rules="{ required: false }" v-slot="validationContext">

          <b-form-group id="author-id-group" :label="$t('poll.forms.author-id-label')" label-for="authorId">
            <b-form-input
              id="authorId" name="authorId" aria-describedby="authorId-errors"
              v-model="form.authorId" :state="getValidationState(validationContext)">
            </b-form-input>
            <b-form-invalid-feedback id="authorId-errors">{{ validationContext.errors[0] }}</b-form-invalid-feedback>
          </b-form-group>

        </ValidationProvider>

        <b-form-checkbox
          v-if="!isCreate"
          id="checkbox-published"
          v-model="form.published"
          name="published"
        >
          {{$t('poll.forms.published-label')}}
        </b-form-checkbox>

        <b-button type="submit" variant="primary">Submit</b-button>
      </b-form>
    </ValidationObserver>


  </div>
</template>

<script>
// import Button from '@/components/atoms/Button.vue';

export default {
  name: 'PollForm',
  props: {
    isCreate: Boolean,
    poll: Object,
  },
  components: {
    // Button,
  },
  data: () => ({
    form: {
      text: '',
      date: new Date(new Date().getFullYear(), new Date().getMonth(), new Date().getDate()),
      context: null,
      authorId: '',
      published: false,
    },
  }),
  mounted() {
    if (!this.isCreate) {
      this.form.text = this.poll.info.caption;
      this.form.published = this.poll.info.published;
      this.form.authorId = this.poll.info.author.id;
    }
  },
  methods: {
    getValidationState({ dirty, validated, valid = null }) {
      return dirty || validated ? valid : null;
    },

    async onSubmit() {
      const msgTitle = this.$t('poll.forms.poll-confirm-message-title');
      if (this.isCreate) {
        //  create poll
        try {
          const result = await this.$store.dispatch('POST_POLL', {
            content: {
              text: this.form.text,
              date: new Date(this.form.date),
              author: this.form.authorId,
            },
          });
          this.showResultMsg(result.statusText, msgTitle, true);
        } catch (error) {
          // eslint-disable-next-line no-console
          console.log(error);
          if (error.response && error.response.data && error.response.data.errors) {
            this.error = this.$t(error.response.data.errors[0].messageKey);
          } else {
            this.error = this.$t('poll.forms.poll-create-error');
          }
          this.showResultMsg(this.error, false);
        }
      } else {
        //  update poll
        try {
          const result = await this.$store.dispatch('PUT_POLL', {
            poll: this.poll,
            content: {
              text: this.form.text,
              date: new Date(this.form.date),
              author: this.form.authorId,
              published: this.form.published,
            },
          });
          await this.$store.dispatch('GET_POLL_BY_ID', { pollId: this.poll._id });
          const newSlug = this.$store.getters.POLL.info.slug;
          this.showResultMsg(result.statusText, msgTitle, true, newSlug);
        } catch (error) {
          // eslint-disable-next-line no-console
          console.log(error);
          if (error.response && error.response.data && error.response.data.errors) {
            this.error = this.$t(error.response.data.errors[0].messageKey);
          } else {
            this.error = this.$t('poll.forms.poll-update-error');
          }
          this.showResultMsg(this.error, false);
        }
      }
    },

    onContext() {
      // console.log(this.form.date);
    },

    showResultMsg(msg, title, type, slug) {
      this.$bvModal.msgBoxOk(msg, {
        title,
        size: 'sm',
        buttonSize: 'sm',
        okVariant: (type) ? 'success' : 'danger',
        headerClass: 'p-2 border-bottom-0',
        footerClass: 'p-2 border-top-0',
        centered: true,
      })
        .then((value) => {
          if (value) {
            if (slug) {
              this.$router.push(`/anketa/${slug}`);
            } else {
              this.$router.go();
            }
          }
        })
        .catch((err) => {
          console.log(err);
        });
    },
  },
};
</script>
