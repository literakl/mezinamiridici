<template>
  <div class="pt-3 w-75 m-auto pb-5">
    <h1>{{title}}</h1>
    <editor-content class="editor__content" :editor="editor" />
  </div>
</template>

<script>

import { Editor, EditorContent } from 'tiptap';
import {
  Blockquote,
  CodeBlock,
  HardBreak,
  Heading,
  HorizontalRule,
  OrderedList,
  BulletList,
  ListItem,
  TodoItem,
  TodoList,
  Bold,
  Code,
  Italic,
  Link,
  Strike,
  Underline,
  History,
} from 'tiptap-extensions';
import Image from '@/utils/editorImage';

export default {
  name: 'blog',
  components: {
    EditorContent,
  },
  props: {
    slug: String,
  },
  data() {
    return {
      editor: new Editor({
        extensions: [
          new Blockquote(),
          new BulletList(),
          new CodeBlock(),
          new HardBreak(),
          new Heading({ levels: [1, 2, 3] }),
          new HorizontalRule(),
          new ListItem(),
          new OrderedList(),
          new TodoItem(),
          new TodoList(),
          new Link(),
          new Bold(),
          new Code(),
          new Italic(),
          new Strike(),
          new Underline(),
          new History(),
          new Image(),
        ],
        editable: false,
      }),
    };
  },
  watch: {
    blog() {
      this.setContent(this.blog.data.source);
    },
  },
  computed: {
    blog() {
      return this.$store.getters.BLOG;
    },
    title() {
      let txt = '';
      if (this.blog !== null) {
        txt = this.blog.info.caption;
      }
      return txt;
    },
  },
  created() {
    this.$store.dispatch('FETCH_BLOG', { slug: this.slug });
  },
  methods: {
    setContent(json) {
      this.editor.setContent(json, true);
      this.editor.focus();
    },
  },
};
</script>
<style>
  img {
    width:100%;
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
</style>
