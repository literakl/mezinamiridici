<template>
  <div class="mb-2">
    <ValidationObserver ref="observer" v-slot="{ handleSubmit }">
      <b-form @submit.stop.prevent="handleSubmit(onSubmit)">
        <ValidationProvider :rules="{ required: true, min: 3 }" v-slot="validationContext">
          <b-form-group id="caption-group" :label="$t('generic.content.caption-label')" label-for="caption">
            <b-form-input
              id="caption" name="caption" aria-describedby="text-errors"
              v-model="form.caption" :state="getValidationState(validationContext)">
            </b-form-input>
            <b-form-invalid-feedback id="caption-errors">{{ validationContext.errors[0] }}</b-form-invalid-feedback>
          </b-form-group>
        </ValidationProvider>

        <ValidationProvider :rules="{ required: true, min: 3 }" v-slot="validationContext">
          <b-form-group id="slug-group" :label="$t('generic.content.slug-label')" label-for="slug">
            <b-form-input
              id="slug" name="slug" aria-describedby="text-errors"
              v-model="form.slug" :state="getValidationState(validationContext)">
            </b-form-input>
            <b-form-invalid-feedback id="slug-errors">{{ validationContext.errors[0] }}</b-form-invalid-feedback>
          </b-form-group>
        </ValidationProvider>

        <Editor
          :blog="form.content"
          @changeBlog="changeBlog"
        />

        <div v-if="error" class="text-danger">
          {{ error }}
        </div>

        <b-button type="submit" variant="primary">{{ $t("generic.save-button") }}</b-button>
      </b-form>
    </ValidationObserver>
  </div>
</template>

<script>
import {
  BForm,
  BFormGroup,
  BFormInput,
  BFormInvalidFeedback,
  BButton,
  BFormTextarea
} from 'bootstrap-vue';
import Editor from '@/components/molecules/Editor.vue';

export default {
  name: 'PageForm',
  components: {
    BForm,
    BFormGroup,
    BFormInput,
    BFormInvalidFeedback,
    BFormTextarea,
    BButton,
    Editor,
  },
  props: {
    page: Object,
  },
  data: () => ({
    form: {
      caption: '',
      slug: '',
      content: null,
    },
    error: null,
    html: '',
    contentPictures: [],
  }),
  mounted() {
    if (this.page) {
      this.form.caption = this.page.info.caption;
      this.form.slug = this.page.info.slug;
      this.form.content = this.page;
      this.html = this.page.data.content;
    }
  },
  methods: {
    changeBlog(source) {
      this.getPictureIdList(source);
      this.html = source;
    },
    getValidationState({
      dirty,
      validated,
      valid = null,
    }) {
      return dirty || validated ? valid : null;
    },
    async onSubmit() {
      let message;
      const body = {
        caption: this.form.caption,
        slug: this.form.slug.replaceAll('/', ''),
        content: this.html,
        contentPictures: this.contentPictures,
      };

      if (this.page) {
        message = 'UPDATE_PAGE';
        body.pageId = this.page._id;
      } else {
        message = 'CREATE_PAGE';
      }

      try {
        const item = await this.$store.dispatch(message, body);
        await this.$router.push({
          name: 'page',
          params: { slug: item.info.slug },
        });
      } catch (error) {
        this.$log.error(error);
        if (error.response && error.response.data && error.response.data.errors) {
          this.error = this.$t(error.response.data.errors[0].messageKey);
        } else {
          this.error = this.$t('generic.internal-error');
        }
      }
    },
    getPictureIdList(html) {
      this.contentPictures = [];
      const tag = document.createElement('div');
      tag.innerHTML = html;
      const list = tag.getElementsByTagName('img');

      for (let i = 0; i < list.length; i += 1) {
        this.contentPictures.push(list[i].getAttribute('pictureid'));
      }
    },
  },
};
</script>
