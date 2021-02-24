<template>
  <div class="mb-2">
    <ValidationObserver ref="observer" v-slot="{ handleSubmit }">
      <b-form @submit.stop.prevent="handleSubmit(onSubmit)">
        <ValidationProvider :rules="{ required: true, min: 3 }" v-slot="validationContext">
          <b-form-group id="caption-group" :label="$t('cms.edit.caption-label')" label-for="caption">
            <b-form-input
              id="caption" name="caption" aria-describedby="text-errors"
              v-model="form.caption" :state="getValidationState(validationContext)">
            </b-form-input>
            <b-form-invalid-feedback id="caption-errors">{{ validationContext.errors[0] }}</b-form-invalid-feedback>
          </b-form-group>
        </ValidationProvider>
        <ValidationProvider :rules="{ required: true, min: 3 }" v-slot="validationContext">
          <b-form-group id="slug-group" :label="$t('cms.edit.slug-label')" label-for="slug">
            <b-form-input
              id="slug" name="slug" aria-describedby="text-errors"
              v-model="form.slug" :state="getValidationState(validationContext)">
            </b-form-input>
            <b-form-invalid-feedback id="slug-errors">{{ validationContext.errors[0] }}</b-form-invalid-feedback>
          </b-form-group>
        </ValidationProvider>
        <ValidationProvider :rules="{ required: true, min: 10 }" v-slot="validationContext">
          <b-form-group id="content-group" :label="$t('cms.edit.content-label')" label-for="content">
            <b-form-textarea
              class="textarea"
              id="content" name="content" aria-describedby="text-errors"
              rows="10" max-rows="50"
              :placeholder="$t('cms.edit.content-label')"
              v-model="form.content" :state="getValidationState(validationContext)">
            </b-form-textarea>
            <b-form-invalid-feedback id="content-errors">{{ validationContext.errors[0] }}</b-form-invalid-feedback>
          </b-form-group>
        </ValidationProvider>
        <div v-if="error" class="text-danger">
          {{ error }}
        </div>
        <b-button type="submit" variant="primary">Submit</b-button>
      </b-form>
    </ValidationObserver>
  </div>
</template>

<script>
import { BForm, BFormGroup, BFormInput, BFormInvalidFeedback, BButton, BFormTextarea } from 'bootstrap-vue';

export default {
  name: 'ContentForm',
  components: {
    BForm,
    BFormGroup,
    BFormInput,
    BFormInvalidFeedback,
    BButton,
    BFormTextarea,
  },
  props: {
    isCreate: Boolean,
    page: Object,
  },
  data: () => ({
    form: {
      caption: '',
      slug: '',
      content: '',
      context: null,
    },
    error: null,
  }),
  mounted() {
    if (!this.isCreate) {
      this.form.caption = this.page.info.caption;
      this.form.slug = this.page.info.slug;
      this.form.content = this.page.data.content;
    }
  },
  methods: {
    getValidationState({ dirty, validated, valid = null }) {
      return dirty || validated ? valid : null;
    },
    async onSubmit() {
      let message;
      const body = {
        caption: this.form.caption,
        slug: this.form.slug.replaceAll('/', ''),
        content: this.form.content,
      };

      if (this.isCreate) {
        message = 'CREATE_PAGE';
      } else {
        message = 'UPDATE_PAGE';
        body.pageId = this.page._id;
      }

      try {
        const item = await this.$store.dispatch(message, body);
        await this.$router.push({ name: 'page', params: { slug: item.info.slug } });
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
