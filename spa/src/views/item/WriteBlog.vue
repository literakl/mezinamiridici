<template>
  <div class="pt-3 mt-5 border centerbox">
    <div class="write-post-wrap">
      <div class="text-area">
        <TextInput
          v-model="title"
          :label="$t('blog.form.title-label')"
          :placeholder="$t('blog.form.title-placeholder')"
          class="write-blog"
        />
        <Editor :blog="blog" @changeBlog="changeBlog"/>
      </div>
      <div class="bottom-wrap">
        <div class="tags-area">
          <TagSelector @changeTags="tagSelect" :formTags="tags" />
        </div>
        <div class="image-area">
          <SelectPicture :currentPath="picture" @changePath="changePath" />
          <b-button variant="primary" @click="saveBlog">{{
            $t("blog.form.save-button")
          }}</b-button>
        </div>
      </div>
    </div>
  </div>
</template>

<script>
import TextInput from '@/components/atoms/TextInput.vue';
import SelectPicture from '@/components/atoms/SelectPicture.vue';
import TagSelector from '@/components/atoms/TagSelector.vue';
import { BButton } from 'bootstrap-vue';
import Editor from '@/components/molecules/Editor.vue';


export default {
  components: {
    SelectPicture,
    TextInput,
    TagSelector,
    BButton,
    Editor,
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
      html: 'Update content to see changes',
    };
  },
  computed: {
    blog() {
      return this.$store.getters.BLOG;
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
  padding: 25px 20px;
  border-radius: 4px;
}

.text-area .w-50 {
  width: 100% !important;
}

.ProseMirror {
  border: #dddddd solid 1px;
  padding: 10px;
  min-height: 100px;
}

.editor {
  width: 100%;
  margin-bottom: 15px;
}

.bottom-wrap {
  display: flex;
  align-items: center;
  justify-content: space-between;
  flex-direction: column;
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
}

.tags-area div div {
  height: 150px;
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
