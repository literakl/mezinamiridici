<template>
  <div class="pt-3 w-75 m-auto">
    <TextInput
      v-model="title"
      :label="$t('blog.form.title-label')"
      :placeholder="$t('blog.form.title-placeholder')"
      class="pb-3 w-100"/>

    <editor ref="editor" :config="config" :initialized="onInitialized"/>

    <TagSelector @changeTags="tagSelect" :formTags="tags"/>

    <SelectPicture :currentPath="picture" @changePath="changePath"/>

    <b-button variant="primary" @click="saveBlog">{{ $t('blog.form.save-button') }}</b-button>
  </div>
</template>

<script>
import Header from '@editorjs/header';
import List from '@editorjs/list';
import Paragraph from '@editorjs/paragraph';
import Embed from '@editorjs/embed';
import Table from '@editorjs/table';
import Quote from '@editorjs/quote';
import Delimiter from '@editorjs/delimiter';
import ImageTool from '@editorjs/image';

import TextInput from '@/components/atoms/TextInput.vue';
import SelectPicture from '@/components/atoms/SelectPicture.vue';
import store from '@/store';
import TagSelector from '@/components/atoms/TagSelector.vue';

export default {
  components: {
    SelectPicture,
    TextInput,
    TagSelector,
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
      config: {
        tools: {
          header: {
            class: Header,
            inlineToolbar: true,
            config: {
              placeholder: this.$t('blog.form.h-placeholder'),
              levels: [1, 2, 3],
              defaultLevel: 3,
            },
          },
          list: {
            class: List,
            inlineToolbar: true,
          },
          paragraph: {
            class: Paragraph,
          },
          image: {
            class: ImageTool,
            config: {
              uploader: {
                async uploadByFile(file) {
                  const formData = new FormData();
                  formData.append('image', file);

                  const res = await store.dispatch('UPLOAD_IMAGE', formData);
                  return {
                    success: res.success,
                    file: {
                      url: res.data.url,
                    },
                  };
                },
              },
            },
          },
          embed: {
            class: Embed,
            inlineToolbar: true,
            config: {
              services: {
                youtube: true,
                instagram: true,
                twitter: true,
                gfycat: true,
              },
            },
          },
          delimiter: Delimiter,
          table: {
            class: Table,
            inlineToolbar: true,
            config: {
              rows: 2,
              cols: 3,
            },
          },
          quote: {
            class: Quote,
            inlineToolbar: true,
            shortcut: 'CMD+SHIFT+O',
            config: {
              quotePlaceholder: this.$t('blog.form.q-placeholder'),
            },
          },
        },
        placeholder: this.$t('blog.form.p-placeholder'),
        data: {},
        i18n: {
          messages: {
            ui: {
              blockTunes: {
                toggler: {
                  'Click to tune': this.$t('blog.form.click-to-tune'),
                  'or drag to move': this.$t('blog.form.or-drag-to-move'),
                },
              },
              inlineToolbar: {
                converter: {
                  'Convert to': this.$t('blog.form.convert-to'),
                },
              },
              toolbar: {
                toolbox: {
                  Add: this.$t('blog.form.add'),
                },
              },
            },
            toolNames: {
              Text: this.$t('blog.form.text'),
              Heading: this.$t('blog.form.heading'),
              List: this.$t('blog.form.list'),
              Quote: this.$t('blog.form.quote'),
              Delimiter: this.$t('blog.form.delimiter'),
              Table: this.$t('blog.form.table'),
              Image: this.$t('blog.form.table'),
              Bold: this.$t('blog.form.bold'),
              Italic: this.$t('blog.form.italic'),
              InlineCode: this.$t('blog.form.inlineCode'),
            },
            tools: {
              warning: {
                Title: this.$t('blog.form.title'),
                Message: this.$t('blog.form.message'),
              },
              link: {
                'Add a link': this.$t('blog.form.add-link'),
              },
              stub: {
                'The block can not be displayed correctly.': this.$t('blog.form.display-incorrect'),
              },
            },
            blockTunes: {
              delete: {
                Delete: this.$t('blog.form.delete'),
              },
              moveUp: {
                'Move up': this.$t('blog.form.move-up'),
              },
              moveDown: {
                'Move down': this.$t('blog.form.move-down'),
              },
            },
          },
        },
      },
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
      const editorData = await this.$refs.editor.state.editor.save().then(res => res);

      const body = {
        title: this.title,
        source: editorData,
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
        await this.$router.push({ name: 'blog', params: { slug: result.info.slug } });
      }
    },
    tagSelect(tags) {
      this.tags = tags;
    },
    onInitialized(editor) {
      if (this.$route.name === 'update-blog') {
        setTimeout(() => { editor.render(this.blog.data.source); }, 1000);
      }
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
 .codex-editor {
   border: 1px solid #ced4da
 }

 .codex-editor__redactor {
   padding-bottom: 100px
 }

 /*.ce-block__content, .ce-toolbar__content*/
</style>
