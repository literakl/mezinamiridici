<template>
  <div class="pt-3 centerbox m-auto" v-if="item">
    <h2>{{ $t('page-title.snippets') }}</h2>

    <ValidationObserver ref="observer" v-slot="{ invalid }">
      <b-form-textarea
        id="textarea"
        v-model="html"
        rows="10"
        min-rows="3"
        aria-describedby="content-errors"
        :rules="{ required: true }"
        class="mb-3" />

      <b-button variant="post-btn" :disabled="invalid" @click="saveArticle()">
        {{ $t("generic.save-button") }}
      </b-button>
    </ValidationObserver>
  </div>
</template>

<script>
import { configure } from 'vee-validate';
import {
  BButton,
  BFormInvalidFeedback,
  BFormGroup,
  BFormTextarea,
} from 'bootstrap-vue';
import i18n from '@/i18n';

export default {
  name: 'Snippets',
  components: {
    BButton,
    BFormGroup,
    BFormInvalidFeedback,
    BFormTextarea,
  },
  props: {
    slug: String,
  },
  data() {
    return {
      html: '',
      errors: [],
    };
  },
  computed: {
    item() {
      return this.$store.getters.CONTENT;
    },
  },
  methods: {
    async saveArticle() {
      const body = {
        itemId: this.item._id,
        source: this.html,
      };

      this.errors = [];
      let result = await this.$store.dispatch('UPDATE_CONTENT_HTML', body);
      if (result.success) {
        await this.$router.push({
          name: 'article',
          params: { slug: this.item.info.slug },
        });
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
