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
            <b-form-datepicker v-model="form.date" @context="onContext"
            :date-format-options="{ year: 'numeric', month: 'numeric', day: 'numeric' }" locale="cs"
            aria-describedby="date-errors" :state="getValidationState(validationContext)">
            </b-form-datepicker>

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
          class="mb-3"
        >
          {{$t('poll.forms.published-label')}}
        </b-form-checkbox>

        <div v-if="error" class="text-danger">
          {{ error }}
        </div>

        <b-button type="submit" variant="primary">Submit</b-button>
      </b-form>
    </ValidationObserver>

  </div>
</template>

<script>
import { getISO } from '@/utils/dateUtils';

export default {
  name: 'PollForm',
  props: {
    isCreate: Boolean,
    poll: Object,
  },
  data: () => ({
    form: {
      text: '',
      date: '',
      context: null,
      authorId: '',
      published: false,
    },
    error: null,
  }),
  mounted() {
    if (!this.isCreate) {
      this.form.text = this.poll.info.caption;
      this.form.published = this.poll.info.published;
      this.form.date = getISO(this.poll.info.date);
      this.form.authorId = this.poll.info.author.id;
    }
  },
  methods: {
    getValidationState({ dirty, validated, valid = null }) {
      return dirty || validated ? valid : null;
    },

    async onSubmit() {
      let message;
      const body = {
        text: this.form.text,
        date: new Date(this.form.date),
        author: this.form.authorId,
      };

      if (this.isCreate) {
        message = 'CREATE_POLL';
      } else {
        message = 'UPDATE_POLL';
        body.pollId = this.poll._id;
        body.published = this.form.published;
      }

      try {
        const item = await this.$store.dispatch(message, body);
        await this.$router.push({ name: 'poll', params: { slug: item.info.slug } });
      } catch (error) {
        this.$log.error(error);
        if (error.response && error.response.data && error.response.data.errors) {
          this.error = this.$t(error.response.data.errors[0].messageKey);
        } else {
          this.error = this.$t('generic.internal-error');
        }
      }
    },

    onContext() {
      // this.$log.debug(this.form.date);
    },
  },
};
</script>
