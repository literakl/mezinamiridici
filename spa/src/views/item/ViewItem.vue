<template>
  <div class="pt-3 w-75 m-auto">

    <TextInput
      :value="title"
      :disabled="true"
      label="Blog title"
      class="pb-3 w-100"/>

    <Viewer
    ref="blogView"
    :initialValue="editorText"
    :options="editorOptions"
    height="500px"
    previewStyle="vertical"
    />

  </div>
</template>

<script>


import { Viewer } from '@toast-ui/vue-editor';
import TextInput from '@/components/atoms/TextInput.vue';

export default {
  components: {
    Viewer,
    TextInput,
  },
  data() {
    return {
      editorOptions: {
        hideModeSwitch: true,
        language: 'en-US',
      },
      isCreate: true,
    };
  },
  computed: {
    blog() {
      return this.$store.getters.BLOG;
    },
    editorText() {
      let txt = '';
      if (this.blog !== null) {
        txt = this.blog.text;

        this.$refs.blogView.invoke('setMarkdown', txt);
      }
      return txt;
    },
    title() {
      let txt = '';
      if (this.blog !== null) {
        txt = this.blog.title;
      }
      return txt;
    },
  },
  created() {
    this.$store.dispatch('GET_BLOG');
  },
};
</script>
<style>
  @import '~codemirror/lib/codemirror.css';
  @import '~@toast-ui/editor/dist/toastui-editor.css';
</style>
