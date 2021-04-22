<template>
  <div class="mt-4 centerbox">
    <div class="write-post-wrap">
      <ValidationObserver ref="observer" v-slot="{ invalid }">
        <div class="text-area">
          <ValidationProvider v-slot="validationContext">
            <TextInput
              v-model="title"
              :placeholder="$t('blog.form.title-placeholder')"
              class="write-blog"
              :state="getValidationState(validationContext)"
              aria-describedby="title-errors"
              :rules="{ required: true }"
            />
            <b-form-invalid-feedback id="title-errors">{{ validationContext.errors[0] }}</b-form-invalid-feedback>
          </ValidationProvider>

          <Editor
            :blog="blog"
            v-model="html"
            aria-describedby="content-errors"
            @outOfFocus="handleOutOfFocus"
            :class="{ invalid: !hideContentError }"
          />
          <b-form-invalid-feedback id="content-errors" :state="hideContentError">{{ $t('blog.form.required-field') }}</b-form-invalid-feedback>
        </div>
        <div class="bottom-wrap">
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
            <b-button variant="post-btn" :disabled="invalid || isEmpty" @click="saveBlog()">{{
              $t("blog.form.save-button")
            }}</b-button>
          </div>
        </div>
      </ValidationObserver>
    </div>
  </div>
</template>

<script>
import TextInput from '@/components/atoms/TextInput.vue';
import SelectPicture from '@/components/atoms/SelectPicture.vue';
import TagSelector from '@/components/atoms/TagSelector.vue';
import { BButton, BFormInvalidFeedback, BAlert } from 'bootstrap-vue';
import Editor from '@/components/molecules/Editor.vue';

export default {
  components: {
    SelectPicture,
    TextInput,
    TagSelector,
    BButton,
    Editor,
    BFormInvalidFeedback,
    BAlert,
  },
  props: {
    slug: String,
  },
  data() {
    return {
      isCreate: true,
      title: '',
      picture: '',
      tags: [],
      html: '',
      hideContentError: true,
      contentPictures: [],
      errors: [],
    };
  },
  computed: {
    blog() {
      return this.$store.getters.BLOG;
    },
    isEmpty() {
      return !(this.html && /<\w+>\S+.*<\/\w+>/gmi.test(this.html));
    },
  },
  watch: {
    blog() {
      this.title = this.blog.info.caption;
      this.picture = this.blog.info.picture;
      this.tags = this.blog.info.tags;
    },
    html() {
      if (!this.isEmpty) {
        this.getPictureIdList(this.html);
        this.hideContentError = true;
      }
    },
  },
  methods: {
    async saveBlog() {
      this.errors = [];
      const body = {
        title: this.title,
        source: this.html,
        picture: this.picture,
        tags: this.tags,
        contentPictures: this.contentPictures,
      };
      let result = '';

      if (this.title !== '') {
        if (this.isCreate) {
          result = await this.$store.dispatch('CREATE_BLOG', body);
          // TODO we need an array of new uploaded pictures
          // await this.$store.dispatch('SET_IMAGE_ITEM', { itemId: result._id });
        } else {
          body.blogId = this.blog._id;
          body.date = this.blog.date;
          result = await this.$store.dispatch('UPDATE_BLOG', body);
        }

        if (result.success) {
          await this.$router.push({
            name: 'blog',
            params: { slug: result.data.info.slug },
          });
        } else {
          this.showError(result.errors);
        }
      } else {
        console.log('empty title!');
      }
    },
    tagSelect(tags) {
      this.tags = tags;
    },
    changePath(path) {
      this.picture = path;
    },
    getValidationState({
      dirty,
      validated,
      valid = null,
    }) {
      return dirty || validated ? valid : null;
    },
    handleOutOfFocus() {
      if (this.isEmpty) {
        this.hideContentError = false;
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
    showError(errors) {
      for (let i = 0; i < errors.length; i += 1) {
        this.errors.push(this.$t(errors[i].messageKey));
      }
    },
  },
  created() {
    if (this.$route.name === 'update-blog') {
      this.isCreate = false;
      this.$store.dispatch('FETCH_BLOG', { slug: this.slug });
    }
  },
};
</script>

<style>
.centerbox {
  max-width: 1235px;
  margin: 0 auto 20px;
  padding:0px;
}
.btn-post-btn{
  background: var(--traval-trouble-status);
  border: 0;
  color: var(--color-white);
}
.btn-post-btn:hover{
  background: var(--traval-trouble-status-hover);
  color: var(--color-white);
}
.btn-post-btn:disabled {
    background: var(--traval-trouble-status);
}
.errors {
  margin-top: 1rem;
}
.errors .alert li{
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
  .write-blog {
    width: 100% !important;
  }
}

@media (max-width: 992px) {
  .bottom-wrap {
    flex-wrap: wrap;
  }
}

@media (max-width: 600px) {
  .bottom-wrap {
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
