<template>
  <div class="pt-3 w-75 m-auto">
    <!-- <h1>{{ $t('poll.forms.new-poll-heading') }}</h1> -->

    <TextInput
      v-model="title"
      label=""
      placeholder="Blog Title"
      class="pb-3 w-100"/>

    <editor ref="editor" :config="config" :initialized="onInitialized"/>

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

export default {
  components: {
    SelectPicture,
    TextInput,
  },
  data() {
    return {
      isCreate: true,
      title: '',
      picture: '',
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

                  const res = await store.dispatch('IMAGE_UPLOAD', formData);
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
        // onReady: () => {
        //   this.$log.debug('on ready');
        // },
        // onChange: (args) => {
        //   this.$log.debug(args, 'Now I know that Editor\'s content changed!');
        // },
        data: {},
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
      this.title = this.blog.title;
    },
  },
  methods: {
    async saveBlog() {
      const editorData = await this.$refs.editor.state.editor.save().then(res => res);

      const body = {
        title: this.title,
        source: editorData,
        picture: this.picture,
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
        this.$log.debug(result);
        await this.$router.push({ name: 'blog', params: { slug: result.info.slug } });
      }
    },
    onInitialized(editor) {
      if (this.$route.name === 'update-blog') {
        setTimeout(() => { editor.render(this.blog.source); }, 1000);
      }
    },
    changePath(path) {
      this.picture = path;
    },
  },
  created() {
    if (this.$route.name === 'update-blog') {
      this.isCreate = false;
      this.$store.dispatch('GET_BLOG');
    }
  },
};
</script>
