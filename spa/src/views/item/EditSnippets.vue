<template>
  <div class="pt-3 centerbox m-auto" v-if="item">
    <h2>{{ $t('page-title.snippets') }}</h2>

    <b-form-textarea
      id="textarea"
      v-model="snippets"
      rows="10"
      min-rows="3"
      aria-describedby="content-errors"
      class="mb-3" />

    <b-button variant="post-btn" @click="save()">
      {{ $t("generic.save-button") }}
    </b-button>

    <div v-if="errors" class="text-danger">
      {{ errors[0] }}
    </div>

    <h3 class="mt-3">{{ $t('cms.snippets.add-label') }}</h3>

    <div class="field-area">
      <div>
        <label class="d-label" for="type">{{ $t('cms.snippets.type') }}</label>
      </div>

      <div class="row">
        <Radio
          class="pl-3"
          v-model="type"
          name="type"
          label="html"
          identifier="html"/>
        <Radio
          class="pl-3"
          v-model="type"
          name="type"
          label="meta"
          identifier="meta"/>
        <Radio
          class="pl-3"
          v-model="type"
          name="type"
          label="style"
          identifier="style"/>
        <Radio
          class="pl-3"
          v-model="type"
          name="type"
          label="script"
          identifier="script"/>
        <Radio
          class="pl-3"
          v-model="type"
          name="type"
          label="link"
          identifier="link"/>
      </div>
    </div>

  </div>
</template>

<script>
import {
  BButton,
  BFormInvalidFeedback,
  BFormGroup,
  BFormTextarea,
} from 'bootstrap-vue';
import Radio from '@/components/atoms/Radio';

export default {
  name: 'Snippets',
  components: {
    BButton,
    BFormGroup,
    BFormInvalidFeedback,
    BFormTextarea,
    Radio,
  },
  props: {
    slug: String,
  },
  data() {
    return {
      type: '',
      name: '',
      // meta property
      property: '',
      // html / script innerHTML, style cssText, meta content
      content: '',
      // link rel
      rel: '',
      // script url, link href
      url: '',
      // script / style type
      typeValue: '',
      errors: [],
    };
  },
  computed: {
    item() {
      return this.$store.getters.CONTENT;
    },
    snippets() {
      return this.item.snippets;
    }
  },
  methods: {
    appendHTML() {
      this.append();
    },
    appendLink() {
      this.append();
    },
    appendMeta() {
      this.append();
    },
    appendScript() {
      this.append();
    },
    appendStyle() {
      this.append();
    },
    append(snippet) {
      if (!this.snippets || this.snippets.length === 0 || this.snippets[0] !== '[') {
        this.snippets = `[\n${snippet}\n]`;
      } else {
        const position = this.snippets.lastIndexOf(']');
        this.snippets = this.snippets.substring(0, position) + `\n${snippet}\n]`;
      }
    },
    async save() {
      const body = {
        itemId: this.item._id,
        source: this.html,
      };

      this.errors = [];
      let result = await this.$store.dispatch('UPDATE_CONTENT_HTML', body);
      if (result.success) {
        await this.$router.go(-1);
      } else {
        this.showError(result.errors);
      }
    },
    showError(errors) {
      for (let i = 0; i < errors.length; i += 1) {
        this.errors.push(this.$t(errors[i].messageKey));
      }
    },
  },
  async created() {
    await this.$store.dispatch('FETCH_CONTENT', { slug: this.slug });
  },
};
</script>

<style>
.centerbox {
  max-width: 1235px;
  margin: 0 auto;
  width: 100%;
}

@media (max-width: 1235px) {
  .centerbox {
    width: 91%;
  }
}
.btn-post-btn {
  background: var(--traval-trouble-status);
  border: 0;
  color: var(--color-white);
}
.btn-post-btn:hover {
  background: var(--traval-trouble-status-hover);
  color: var(--color-white);
}
.btn-post-btn:disabled {
    background: var(--traval-trouble-status);
}
.errors {
  margin-top: 1rem;
}
.errors .alert li {
  margin-top: 1rem;
}
</style>

<style lang="scss" scoped>
$color-black: #AEB3B7;
$color-white: #ffffff;
$color-grey: #dddddd;
</style>
