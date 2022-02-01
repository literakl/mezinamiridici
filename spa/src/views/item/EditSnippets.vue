<template>
  <div class="pt-3 centerbox m-auto" v-if="item">
    <h2>{{ $t('page-title.snippets') }}</h2>

    <div class="field-area">
      <div>
        <label class="d-label">{{ $t('cms.snippets.code') }}</label>
      </div>

      <div class="pb-2">
        <b-form-input v-model="code" class="w-25"></b-form-input>
      </div>
    </div>

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

    <div class="field-area" v-if="type==='html'">
      <div>
        <label class="d-label" for="content">{{ $t('cms.snippets.content') }}</label>
      </div>

      <div class="pb-2">
        <b-form-textarea
          id="content"
          v-model="content"
          rows="10"
          min-rows="3"
          class="mb-3" />
      </div>
    </div>


    <b-button variant="post-btn" @click="appendHTML()">
      {{ $t("generic.insert-button") }}
    </b-button>

    <div v-if="errors" class="errors">
      {{ errors[0] }}
    </div>

  </div>
</template>

<script>
import {
  BButton,
  BFormGroup,
  BFormInput,
  BFormTextarea,
} from 'bootstrap-vue';
import Radio from '@/components/atoms/Radio';

export default {
  name: 'Snippets',
  components: {
    BButton,
    BFormGroup,
    BFormInput,
    BFormTextarea,
    Radio,
  },
  props: {
    slug: String,
  },
  data() {
    return {
      snippets: [],
      type: '',
      code: '',
      // meta name
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
  },
  methods: {
    async appendHTML() {
      await this.append({ innerHTML: this.content });
      this.code = this.innerHTML = null;
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
    async append(snippet) {
      const body = {
        itemId: this.item._id,
        code: this.code,
        type: this.type,
        object: snippet,
      };

      this.errors = [];
      let result = await this.$store.dispatch('ADD_SNIPPET', body);
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
    this.snippets = this.item.snippets;
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
