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
            <b-button variant="primary" :disabled="invalid || isEmpty" @click="saveBlog()">{{
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
import { BButton, BFormInvalidFeedback } from 'bootstrap-vue';
import Editor from '@/components/molecules/Editor.vue';

export default {
  components: {
    SelectPicture,
    TextInput,
    TagSelector,
    BButton,
    Editor,
    BFormInvalidFeedback,
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
        this.hideContentError = true;
      }
    },
  },
  methods: {
    async saveBlog() {
      const body = {
        title: this.title,
        source: this.html,
        picture: this.picture,
        tags: this.tags,
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

        await this.$router.push({
          name: 'blog',
          params: { slug: result.info.slug },
        });
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
  padding:0;
}

.text-area .w-50 {
  width: 100% !important;
}

.text-area input {
  margin-bottom: 20px;
  width: 100%;
  display: flex;
  border: 0;
  border-bottom: 2px solid #ddd;
  font-size: 18px!important;
  border-radius: 0;
  padding: 0;
}

.text-area input:focus {
  border-bottom: 2px solid #ced4da;
}

.ProseMirror {
  border: #dddddd solid 1px;
  padding: 10px;
  min-height: 250px;
}

.editor {
  width: 100%;
  margin-bottom: 15px;
}

.menubar {
  display: flex;
  justify-content: flex-start;
  align-items: flex-start;
  flex-wrap: wrap;
  padding: 4px 5px;
  border-radius: 4px 4px 0 0;
  border-top: 1px solid #ddd;
  border-left: 1px solid #ddd;
  border-right: 1px solid #ddd;
  border-bottom: 0px solid #ddd;
}

.bottom-wrap {
  display: flex;
  align-items: flex-start;
  justify-content: space-around;
  flex-direction:column;
}

.tags-area {
  width: 100%;
}

.image-area {
  width: 100%;
  justify-content: flex-start;
  flex-direction: column;
  align-items: flex-start;
}

.tags-area div {
  border-radius: 0;
  border: 0;
  padding: 0;
}

.tags-area div div {
  height: 150px;
}

.invalid-feedback {
  font-size: 0.9rem;
}

.invalid {
  border: 2px solid #dc3545;
  border-radius: 5px;
}

</style>

<style lang="scss" scoped>
$color-black: #aeb3b7;
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
