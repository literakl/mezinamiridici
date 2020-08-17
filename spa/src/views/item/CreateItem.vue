<template>
  <div class="pt-3 w-75 m-auto">
    <!-- <h1>{{ $t('poll.forms.new-poll-heading') }}</h1> -->

    <TextInput
      v-model="title"
      label=""
      class="pb-3 w-100"/>

    <Editor
    ref="blogEditor"
    :initialValue="editorText"
    :options="editorOptions"
    height="300px"
    previewStyle="vertical"
    />


    <b-button variant="primary" @click="saveBlog">{{ButtonText}}</b-button>

    <b-modal id="modalPopover" v-model="imageEditorShow" size="xl" title="Image Editor"
      @ok="getImage" ok-only>
      <div class="pt-3 w-100 m-auto" style="height:550px;">
        <ImageEditor
        :include-ui="useImageEditorDefaultUI"
        ref="imageEditor" ></ImageEditor>
      </div>
    </b-modal>
  </div>
</template>

<script>


import { Editor } from '@toast-ui/vue-editor';
import { ImageEditor } from '@toast-ui/vue-image-editor';
import TextInput from '@/components/atoms/TextInput.vue';

export default {
  components: {
    Editor,
    TextInput,
    ImageEditor,
  },
  data() {
    return {
      editorText: '',
      editorOptions: {
        hideModeSwitch: true,
        language: 'en-US',
      },
      isCreate: true,
      title: '',
      ButtonText: 'Save',

      imageEditorShow: false,
      useImageEditorDefaultUI: true,
    };
  },
  computed: {
    blog() {
      return this.$store.getters.BLOG;
    },
  },
  watch: {
    blog() {
      this.editorText = this.blog.text;
      this.title = this.blog.title;
      this.$refs.blogEditor.invoke('setMarkdown', this.editorText);
    },
  },
  methods: {
    async saveBlog() {
      this.editorText = this.$refs.blogEditor.invoke('getMarkdown');
      const body = {
        title: this.title,
        text: this.editorText,
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
    getImage() {
      const url = `![image](${this.$refs.imageEditor.invoke('toDataURL')})`;
      this.$refs.blogEditor.invoke('insertText', url);
    },
  },
  created() {
    if (this.$route.name === 'update-blog') {
      this.ButtonText = 'Update';
      this.isCreate = false;
      this.$store.dispatch('GET_BLOG');
    }
  },
  mounted() {
    const editor = this.$refs.blogEditor;
    this.$log.debug(editor);
    const toolbar = editor.invoke('getUI').getToolbar();

    editor.editor.eventManager.addEventType('clickShowImageEditor');
    editor.editor.eventManager.listen('clickShowImageEditor', () => {
      this.imageEditorShow = true;
    });

    toolbar.insertItem(0, {
      type: 'button',
      options: {
        className: 'last',
        event: 'clickShowImageEditor',
        tooltip: 'Custom Button',
        text: '@',
        style: 'background:none;border-color:lime;color:black;',
      },
    });
  },
};
</script>
<style>
  @import '~codemirror/lib/codemirror.css';
  @import '~@toast-ui/editor/dist/toastui-editor.css';
  @import '~tui-image-editor/dist/tui-image-editor.css';
  @import "~tui-color-picker/dist/tui-color-picker.css"
</style>
