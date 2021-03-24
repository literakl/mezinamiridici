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
              :rules="{ required: true }"
            />
            <b-form-invalid-feedback id="text-errors">{{ validationContext.errors[0] }}</b-form-invalid-feedback>
          </ValidationProvider>
          <Editor :blog="blog" @changeBlog="changeBlog" :rules="isRequired"/>
          <b-form-invalid-feedback id="text-errors" :state="isRequired">{{ $t('blog.form.required-field') }}</b-form-invalid-feedback>
        </div>
        <div class="bottom-wrap">
          <div class="tags-area">
            <TagSelector @changeTags="tagSelect" :formTags="tags" />
          </div>
          <div class="image-area">
            <SelectPicture :currentPath="picture" @changePath="changePath" />
            <b-button variant="primary" :disabled="invalid || !isRequired" @click="saveBlog">{{
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
    };
  },
  computed: {
    blog() {
      return this.$store.getters.BLOG;
    },
    isRequired() {
      if (this.html && /<\w+>\S+.*<\/\w+>/gmi.test(this.html)) { // <x...>y...</x...>
        return true;
      }
      return false;
    },
  },
  watch: {
    blog() {
      this.title = this.blog.info.caption;
      this.picture = this.blog.info.picture;
      this.tags = this.blog.info.tags;
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
        } else {
          body.blogId = this.blog._id;
          body.date = this.blog.date;
          result = await this.$store.dispatch('UPDATE_BLOG', body);
        }
        await this.$router.push({
          name: 'blog',
          params: { slug: result.info.slug },
        });
      }
    },
    changeBlog(blg) {
      this.html = blg;
    },
    tagSelect(tags) {
      this.tags = tags;
    },
    changePath(path) {
      this.picture = path;
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

.menubar{
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

blockquote {
  display: block;
  margin-top: 1em;
  margin-bottom: 1em;
  margin-left: 40px;
  background-color: whitesmoke;
  padding: 20px;
  font-style: italic;
  overflow-wrap: anywhere;
}

blockquote p {
  font-style: normal;
  font-weight: bold;
}

.has-focus {
  border-radius: 3px;
  box-shadow: 0 0 0 3px #f5f5f5;
}

table {
  width: 100%;
  height: 100%;
  border-collapse: collapse;
  table-layout: fixed;
}

table {
  border: 1px solid #DBDBE2;
  border-radius: 3px;
  position: relative;
  height: 100%;
  width: 100%;
  box-sizing: border-box;
}

td {
  border: 1px solid #DBDBE2;
  padding: 0;
  vertical-align: top;
}

td div {
  padding: 10px;
  height: 100%;
}

.tc-table__inp {
  outline: none;
  flex-grow: 100;
  min-height: 1.5em;
  height: 100%;
  overflow: hidden;
}

tbody tr:first-child td {
  border-top: none;
}

tbody tr:last-child td {
  border-bottom: none;
}

tbody tr td:last-child {
  border-right: none;
}

tbody tr td:first-child {
  border-left: none;
}
</style>

<style lang="scss" scoped>
$color-black: #aeb3b7;
$color-white: #ffffff;
$color-grey: #dddddd;

.menubar__button {
  font-weight: 700;
   background: #f1f0ed;
  border: 0;
  padding: .2rem .5rem;
  margin-right: .2rem;
  border-radius: 3px;
  opacity: 1;
  cursor: pointer;
}
.menubar__button:hover {
   background: #b9b8b5;
}
.menubar__button.is-active {
  border-bottom: 3px solid var(--theme-primary);
}
.actions {
  max-width: 30rem;
  margin: 0 auto 2rem auto;
}

.export {
  max-width: 30rem;
  margin: 0 auto 2rem auto;

  pre {
    padding: 1rem;
    border-radius: 5px;
    font-size: 0.8rem;
    font-weight: bold;
    background: rgba($color-black, 0.05);
    color: rgba($color-black, 0.8);
  }

  code {
    display: block;
    white-space: pre-wrap;
  }
}

.menububble__button:last-child {
  margin-right: 0;
}

.menububble__button {
  display: -webkit-inline-box;
  display: inline-flex;
  // background: transparent;
  background: #f1f0ed;
  border: 0;
  padding: .2rem .5rem;
  margin-right: .2rem;
  border-radius: 3px;
  cursor: pointer;
  font-size: 14px;
}

.menububble__form {
  display: -webkit-box;
  display: flex;
  -webkit-box-align: center;
     align-items: flex-start;
}

.menububble__input {
  font: inherit;
  border: none;
  background: transparent;
  font-size: 14px!important;
}

.menububble.is-active {
  opacity: 1;
  visibility: visible;
}

.menububble {
  position: absolute;
  display: -webkit-box;
  display: flex;
  z-index: 20;
  background: #fff;
  border-radius: 4px;
  padding: .3rem;
  margin-bottom: .5rem;
  -webkit-transform: translateX(-50%);
  transform: translateX(-50%);
  visibility: hidden;
  opacity: 0;
  -webkit-transition: opacity .2s, visibility .2s;
  transition: opacity .2s, visibility .2s;
  border: solid 1px #ddd;
  box-shadow: 1px 1px 8px #ddd;
}

.editor {
  position: relative;
}

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
