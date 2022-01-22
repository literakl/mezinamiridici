<template>
  <div class="mt-4 centerbox">
    <ValidationObserver ref="observer" v-slot="{ invalid }">
      <div class="container">
        <div class="row">
          <div class="col text-area">
            <TextInput
              v-model="title"
              name="title"
              :placeholder="$t('blog.form.title-placeholder')"
              class="write-article"
              aria-describedby="title-errors"
              :rules="{ required: true }"
            />

            <Editor
              :blog="item"
              v-model="html"
              aria-describedby="content-errors"
              @outOfFocus="handleOutOfFocus"
              :class="{ invalid: !hideContentError }"
            />
            <b-form-invalid-feedback id="content-errors" :state="hideContentError">{{ $t('blog.form.content-error') }}</b-form-invalid-feedback>
          </div>

          <div class="col col-lg-2 sidebar">
            <div v-if="isCreate && isEditor">
              <b-form-group class="title" :label="$t('articles.author-label')">
                <b-form-select v-model="author" :options="editors"></b-form-select>
              </b-form-group>
            </div>

            <div class="tags-area">
              <TagSelector @changeTags="tagSelect" :formTags="tags" />
            </div>

            <div class="image-area">
              <SelectPicture :currentPath="picture" @changePath="changePath" />

              <div class="errors">
                <b-alert variant="danger" dismissible :show="errors.length > 0" class="p-0">
                  <ul>
                    <li v-for="error in errors" :key="error.message">{{ error }}</li>
                  </ul>
                </b-alert>
              </div>

              <b-form-group v-if="isEditor" id="date-group" :label="$t('poll.forms.date-label')" label-for="date">
                <b-form-datepicker v-model="date" locale="cs"
                                   :date-format-options="{ year: 'numeric', month: 'numeric', day: 'numeric' }">
                </b-form-datepicker>
              </b-form-group>

              <b-button variant="post-btn" :disabled="invalid || isEmpty" @click="saveArticle()">
                {{ $t("generic.save-button") }}
              </b-button>
            </div>
          </div>
        </div>
      </div>
    </ValidationObserver>
  </div>
</template>

<script>
import { configure } from 'vee-validate';
import {
  BButton,
  BFormInvalidFeedback,
  BAlert,
  BFormGroup,
  BFormDatepicker,
  BFormSelect
} from 'bootstrap-vue';
import Editor from '@/components/molecules/Editor.vue';
import Radio from '@/components/atoms/Radio.vue';
import SelectPicture from '@/components/atoms/SelectPicture.vue';
import TagSelector from '@/components/atoms/TagSelector.vue';
import TextInput from '@/components/atoms/TextInput.vue';
import i18n from '@/i18n';

configure({
  defaultMessage(field, values) {
    values._field_ = i18n.t('blog.form.title-placeholder');
    return i18n.t(`validation.${values._rule_}`, values);
  },
});

export default {
  components: {
    BAlert,
    BButton,
    BFormDatepicker,
    BFormGroup,
    BFormInvalidFeedback,
    BFormSelect,
    Editor,
    Radio,
    SelectPicture,
    TagSelector,
    TextInput,
  },
  props: {
    slug: String,
  },
  data() {
    return {
      isCreate: true,
      title: '',
      date: '',
      picture: '',
      tags: [],
      html: '',
      author: this.$store.getters.USER_ID,
      editors: [],
      hideContentError: true,
      contentPictures: [],
      errors: [],
    };
  },
  computed: {
    item() {
      return this.$store.getters.CONTENT;
    },
    isEmpty() {
      return !(this.html && /<\w+>\S+.*<\/\w+>/gmi.test(this.html));
    },
    isEditor() {
      return this.$store.getters.IS_EDITOR_IN_CHIEF;
    },
  },
  watch: {
    item() {
      if (this.item) {
        this.title = this.item.info.caption;
        this.picture = this.item.info.picture;
        this.tags = this.item.info.tags;
        this.date = this.item.info.date;
      }
    },
    html() {
      if (!this.isEmpty) {
        this.setPictureIdList(this.html);
        this.hideContentError = true;
      }
    },
  },
  methods: {
    async saveArticle() {
      const body = {
        title: this.title,
        source: this.html,
        picture: this.picture,
        tags: this.tags,
        contentPictures: this.contentPictures,
      };

      if (this.date) {
        body.date = new Date(this.date);
      }

      if (this.author) {
        body.author = this.author;
      }

      this.errors = [];
      let result = '';
      if (this.isCreate) {
        result = await this.$store.dispatch('CREATE_ARTICLE', body);
      } else {
        body.itemId = this.item._id;
        result = await this.$store.dispatch('UPDATE_ARTICLE', body);
      }

      if (result.success) {
        await this.$router.push({
          name: 'article',
          params: { slug: result.data.info.slug },
        });
      } else {
        this.showError(result.errors);
      }
    },
    tagSelect(tags) {
      this.tags = tags;
    },
    changePath(path) {
      this.picture = path;
    },
    handleOutOfFocus() {
      if (this.isEmpty) {
        this.hideContentError = false;
      }
    },
    setPictureIdList(html) {
      this.contentPictures = [];
      const tag = document.createElement('div');
      tag.innerHTML = html;
      const list = tag.getElementsByTagName('img');

      for (let i = 0; i < list.length; i += 1) {
        this.contentPictures.push(list[i].getAttribute('pictureid'));
      }
    },
    showError(errors) {
      for (let i = 0; i < errors.length; i += 1) {
        this.errors.push(this.$t(errors[i].messageKey));
      }
    },
  },
  async created() {
    if (this.$route.name === 'update-article') {
      this.isCreate = false;
      await this.$store.dispatch('FETCH_CONTENT', { slug: this.slug });
    } else {
      const response = await this.$store.dispatch('GET_EDITORS', { slug: this.slug });
      this.editors = [];
      for (const user of response) {
        this.editors.push({ value: user._id, text: user.bio.nickname });
      }
    }
  },
};
</script>

<style>
.title {
  font-size: 14px;
  font-weight: 300
}
.centerbox {
  max-width: 1235px;
  margin: 0 auto 20px;
  padding:0px;
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

@media (max-width: 1235px) {
  .centerbox {
    margin-right: 35px;
    margin-left: 35px;
  }
}

@media (max-width: 1100px) {
  .write-article {
    width: 100% !important;
  }
}

@media (max-width: 992px) {
  .sidebar {
    flex-wrap: wrap;
  }
}

@media (max-width: 600px) {
  .sidebar {
    flex-direction: column;
  }
  .tags-area {
    width: 100%;
  }
  .image-area {
    width: 100%;
    margin: 0 auto;
    text-align: center;
    display: flex;
    justify-content: center;
    flex-direction: column;
  }
}
</style>
