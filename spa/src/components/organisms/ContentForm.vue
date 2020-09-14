<template>
  <div class="mb-2">
    <ValidationObserver ref="observer" v-slot="{ handleSubmit }">
      <b-form @submit.stop.prevent="handleSubmit(onSubmit)">
        <b-form-group id="type-group" :label="$t('cms.edit.type-label')" label-for="type">
          <b-row>
            <Radio
              class="pl-3"
              v-model="form.type"
              :label="$t('cms.edit.help')"
              name="type"
              identifier="help"/>
            <Radio
              class="pl-3"
              v-model="form.type"
              :label="$t('cms.edit.content')"
              name="type"
              identifier="content"/>
          </b-row>
        </b-form-group>
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

        <ValidationProvider :rules="{ required: false, min: 10 }" v-slot="validationContext">

          <b-form-group id="date-group" :label="$t('poll.forms.date-label')" label-for="date">
            <b-form-datepicker v-model="form.date" @context="onContext"
            :date-format-options="{ year: 'numeric', month: 'numeric', day: 'numeric' }" locale="cs"
            aria-describedby="date-errors" :state="getValidationState(validationContext)">
            </b-form-datepicker>

            <b-form-invalid-feedback id="date-errors">{{ validationContext.errors[0] }}</b-form-invalid-feedback>
          </b-form-group>

        </ValidationProvider>

        <ValidationProvider :rules="{ required: true, min: 10 }" v-slot="validationContext">
          <b-form-group id="content-group" :label="$t('cms.edit.content-label')" label-for="content">

            <b-form-textarea
              class="textarea"
              id="content" name="content" aria-describedby="text-errors"
              rows="10" max-rows="50"
              :placeholder="$t('cms.edit.content-label')"
              v-model="form.content" :state="getValidationState(validationContext)"
            >
            </b-form-textarea>

            <b-form-invalid-feedback id="content-errors">{{ validationContext.errors[0] }}</b-form-invalid-feedback>

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

        <TagSelector @changeTags="tagSelect" :formTags="form.cmsTagsList"/>

        <SelectPicture :currentPath="form.picture" @changePath="changePath"/>

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
import SelectPicture from '@/components/atoms/SelectPicture.vue';
import TagSelector from '@/components/atoms/TagSelector.vue';
import Radio from '@/components/atoms/Radio.vue';

export default {
  name: 'ContentForm',
  components: {
    SelectPicture,
    TagSelector,
    Radio,
  },
  props: {
    isCreate: Boolean,
    cms: Object,
  },
  data: () => ({
    form: {
      type: 'content',
      caption: '',
      slug: '',
      date: '',
      content: '',
      context: null,
      authorId: '',
      published: false,
      cmsTagsList: [],
      picture: '',
    },
    error: null,
  }),
  mounted() {
    if (!this.isCreate) {
      this.form.type = this.cms.type;
      this.form.caption = this.cms.info.caption;
      this.form.slug = this.cms.info.slug;
      this.form.content = this.cms.data.content;
      this.form.published = this.cms.info.published;
      this.form.date = getISO(this.cms.info.date);
      this.form.authorId = this.cms.info.author.id;
      this.form.cmsTagsList = (this.cms.info.tags === undefined) ? [] : this.cms.info.tags;
      this.form.picture = (this.cms.info.picture) ? this.cms.info.picture : '';
    }
  },
  methods: {
    getValidationState({ dirty, validated, valid = null }) {
      return dirty || validated ? valid : null;
    },
    tagSelect(tags) {
      this.form.cmsTagsList = tags;
    },
    changePath(path) {
      this.form.picture = path;
    },

    async onSubmit() {
      let message;
      const body = {
        type: this.form.type,
        caption: this.form.caption,
        slug: this.form.slug,
        date: new Date(this.form.date),
        author: this.form.authorId,
        content: this.form.content,
        tags: this.form.cmsTagsList,
        picture: this.form.picture,
      };

      if (this.isCreate) {
        message = 'CREATE_CONTENT';
      } else {
        message = 'UPDATE_CONTENT';
        body.cmsId = this.cms._id;
        body.published = this.form.published;
      }

      try {
        const item = await this.$store.dispatch(message, body);
        await this.$router.push({ name: 'cms', params: { slug: item.info.slug, type: item.type } });
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
