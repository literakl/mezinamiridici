<template>
  <b-form-group :label="$t('generic.tag-select-label')">
    <b-form-tags v-model="tagList" size="lg" add-on-change no-outer-focus class="mb-0">
      <template v-slot="{ tags, inputAttrs, inputHandlers, disabled, removeTag }">
        <ul v-if="tags.length > 0" class="list-inline d-inline-block mb-2">
          <li v-for="tag in tags" :key="tag" class="list-inline-item">
            <b-form-tag
              @remove="removeTag(tag)"
              :title="tag"
              :disabled="disabled"
              variant="info"
            >{{ tag }}</b-form-tag>
          </li>
        </ul>
        <b-form-select
          v-bind="inputAttrs"
          v-on="inputHandlers"
          :disabled="disabled || availableOptions.length === 0"
          :options="availableOptions"
        >
          <template v-slot:first>
            <option disabled value="">{{ $t('generic.tag-select-placeholder') }}</option>
          </template>
        </b-form-select>
      </template>
    </b-form-tags>
  </b-form-group>
</template>

<script>
export default {
  name: 'TagSelector',
  props: {
    formTags: Array,
  },
  data: () => ({
    wholeTagsList: [],
    error: null,
    tagList: [],
  }),
  computed: {
    availableOptions() {
      return this.wholeTagsList.filter(opt => this.tagList.indexOf(opt) === -1);
    },
  },
  watch: {
    tagList() {
      this.$emit('changeTags', this.tagList);
    },
    formTags() {
      this.tagList = this.formTags;
    },
  },
  async created() {
    this.wholeTagsList = await this.$store.dispatch('FETCH_TAGS');
  },
  methods: {
    onContext() {
      this.$log.debug(this.form.date);
    },
  },
};
</script>
