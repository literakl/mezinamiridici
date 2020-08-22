<template>
  <div class="pt-3 w-75 m-auto">
    <!-- <h1>{{ $t('poll.forms.new-poll-heading') }}</h1> -->

    <TextInput
      v-model="title"
      label=""
      placeholder="Blog Title"
      class="pb-3 w-100"/>

      <editor ref="editor" :config="config" :initialized="onInitialized"/>
      <!-- <editor
        ref="editor"
        header list code inlineCode personality embed linkTool marker table raw delimiter quote image warning paragraph checklist
        :config="config"
        :initialized="onInitialized"/> -->

    <b-button variant="primary" @click="saveBlog">{{ButtonText}}</b-button>

  </div>
</template>

<script>
// import { Editor } from 'vue-editor-js';

import Header from '@editorjs/header';
import List from '@editorjs/list';
import CodeTool from '@editorjs/code';
import Paragraph from '@editorjs/paragraph';
import Embed from '@editorjs/embed';
import Table from '@editorjs/table';
import Checklist from '@editorjs/checklist';
import Marker from '@editorjs/marker';
import Warning from '@editorjs/warning';
import RawTool from '@editorjs/raw';
import Quote from '@editorjs/quote';
import InlineCode from '@editorjs/inline-code';
import Delimiter from '@editorjs/delimiter';
import ImageTool from '@editorjs/image';

import TextInput from '@/components/atoms/TextInput.vue';
import store from '@/store';

export default {
  components: {
    // Editor,
    TextInput,
  },
  data() {
    return {
      isCreate: true,
      title: '',
      ButtonText: 'Save',
      /* config: {
        image: {
          endpoints: {
            byFile: 'http://localhost:8090/image',
            byUrl: 'http://localhost:8090/image-by-url',
          },
          field: 'image',
          types: 'image/*',
        },
      }, */
      config: {
        tools: {
          header: {
            class: Header,
            config: {
              placeholder: 'Enter a header',
              levels: [1, 2, 3, 4, 5, 6],
              defaultLevel: 3,
            },
          },
          list: {
            class: List,
            inlineToolbar: true,
          },
          code: {
            class: CodeTool,
          },
          paragraph: {
            class: Paragraph,
          },
          embed: {
            class: Embed,
            config: {
              services: {
                youtube: true,
                coub: true,
                imgur: true,
              },
            },
          },
          table: {
            class: Table,
            inlineToolbar: true,
            config: {
              rows: 2,
              cols: 3,
            },
          },
          checklist: {
            class: Checklist,
          },
          Marker: {
            class: Marker,
            shortcut: 'CMD+SHIFT+M',
          },
          warning: {
            class: Warning,
            inlineToolbar: true,
            shortcut: 'CMD+SHIFT+W',
            config: {
              titlePlaceholder: 'Title',
              messagePlaceholder: 'Message',
            },
          },
          raw: RawTool,
          quote: {
            class: Quote,
            inlineToolbar: true,
            shortcut: 'CMD+SHIFT+O',
            config: {
              quotePlaceholder: 'Enter a quote',
              captionPlaceholder: 'Quote\'s author',
            },
          },
          inlineCode: {
            class: InlineCode,
            shortcut: 'CMD+SHIFT+M',
          },
          delimiter: Delimiter,
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
        },
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
      }
    },
    onInitialized(editor) {
      if (this.$route.name === 'update-blog') {
        setTimeout(() => { editor.render(this.blog.source); }, 1000);
      }
    },
  },
  created() {
    if (this.$route.name === 'update-blog') {
      this.ButtonText = 'Update';
      this.isCreate = false;
      this.$store.dispatch('GET_BLOG');
    }
  },
};
</script>
