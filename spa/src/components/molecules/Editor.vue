<template>
  <div class="editor" v-blur-event>
    <form @submit.prevent>
    <editor-menu-bar :editor="editor" v-slot="{ commands, isActive }">
      <div class="menubar">
        <button class="menubar__button" @click="commands.undo">
          <icon name="undo"/>
        </button>

        <button class="menubar__button" @click="commands.redo">
          <icon name="redo"/>
        </button>

        <button class="menubar__button" :class="{ 'is-active': isActive.bold() }" @click="commands.bold">
          <icon name="bold"/>
        </button>

        <button class="menubar__button" :class="{ 'is-active': isActive.italic() }" @click="commands.italic">
          <icon name="italic"/>
        </button>

        <button class="menubar__button" :class="{ 'is-active': isActive.strike() }" @click="commands.strike">
          <icon name="strike"/>
        </button>

        <button class="menubar__button" :class="{ 'is-active': isActive.underline() }" @click="commands.underline">
          <icon name="underline"/>
        </button>

        <button class="menubar__button" :class="{ 'is-active': isActive.heading({ level: 1 }) }" @click="commands.heading({ level: 1 })">
          H1
        </button>

        <button class="menubar__button" :class="{ 'is-active': isActive.heading({ level: 2 }) }" @click="commands.heading({ level: 2 })">
          H2
        </button>

        <button class="menubar__button" :class="{ 'is-active': isActive.heading({ level: 3 }) }" @click="commands.heading({ level: 3 })">
          H3
        </button>

        <button class="menubar__button" :class="{ 'is-active': isActive.bullet_list() }" @click="commands.bullet_list">
          <icon name="ul"/>
        </button>

        <button class="menubar__button" :class="{ 'is-active': isActive.ordered_list() }" @click="commands.ordered_list">
          <icon name="ol"/>
        </button>

        <button class="menubar__button" :class="{ 'is-active': isActive.blockquote() }" @click="commands.blockquote">
          <icon name="quote"/>
        </button>

        <button class="menubar__button" @click="commands.horizontal_rule">
          <icon name="hr"/>
        </button>

        <button class="menubar__button" @click="showImageModal(commands.image)">
          <Icon name="image"/>
        </button>

        <button class="menubar__button" @click="commands.iframe">
          <svg viewBox="0 0 511.6 511.6" width="14" height="14">
            <path
              d="M511.3 213c-.1-10.3-1-23.3-2.4-39a354.4 354.4 0 0 0-6.1-42.1 66.4 66.4 0 0 0-19.9-35.1c-10.1-9.5-22-15-35.5-16.6-42.3-4.7-106.1-7.1-191.6-7.1-85.4 0-149.3 2.4-191.6 7.1a60.2 60.2 0 0 0-35.4 16.6 66.8 66.8 0 0 0-19.7 35.1A316 316 0 0 0 2.7 174a560.2 560.2 0 0 0-2.4 39 2430.9 2430.9 0 0 0 0 85.6 560 560 0 0 0 2.4 39c1.4 15.7 3.5 29.8 6.2 42.1a65.4 65.4 0 0 0 55.3 51.7c42.3 4.8 106.1 7.1 191.6 7.1s149.3-2.3 191.6-7.1c13.5-1.5 25.3-7 35.4-16.6a66.8 66.8 0 0 0 19.7-35c2.8-12.4 5-26.5 6.4-42.2 1.4-15.7 2.2-28.7 2.4-39a2450.8 2450.8 0 0 0 0-85.6zM357 271.2l-146.2 91.4a16.3 16.3 0 0 1-9.7 2.8c-2.9 0-5.8-.7-8.9-2.2a17 17 0 0 1-9.4-16V164.5a17 17 0 0 1 9.4-16 17.2 17.2 0 0 1 18.6.5L357 240.4c5.7 3.2 8.5 8.4 8.5 15.4s-2.8 12.2-8.5 15.4z"
            />
          </svg>
        </button>

        <button class="menubar__button" @click="commands.createTable({rowsCount: 2, colsCount: 2, withHeaderRow: false })">
          <icon name="table"/>
        </button>

        <span v-if="isActive.table()">
          <button class="menubar__button" @click="commands.deleteTable">
            <icon name="delete_table"/>
          </button>
          <button class="menubar__button" @click="commands.addColumnBefore">
            <icon name="add_col_before"/>
          </button>
          <button class="menubar__button" @click="commands.addColumnAfter">
            <icon name="add_col_after"/>
          </button>
          <button class="menubar__button" @click="commands.deleteColumn">
            <icon name="delete_col"/>
          </button>
          <button class="menubar__button" @click="commands.addRowBefore">
            <icon name="add_row_before"/>
          </button>
          <button class="menubar__button" @click="commands.addRowAfter">
            <icon name="add_row_after"/>
          </button>
          <button class="menubar__button" @click="commands.deleteRow">
            <icon name="delete_row"/>
          </button>
          <button class="menubar__button" @click="commands.toggleCellMerge">
            <icon name="combine_cells"/>
          </button>
        </span>
      </div>
    </editor-menu-bar>

    <editor-menu-bubble class="menububble" :editor="editor" @hide="hideLinkMenu" v-slot="{ commands, isActive, getMarkAttrs, menu }">
      <div class="menububble" :class="{ 'is-active': menu.isActive }" :style="`left: ${menu.left}px; bottom: ${menu.bottom}px;`">
        <form class="menububble__form" v-if="linkMenuIsActive" @submit.prevent="setLinkUrl(commands.link, linkUrl)">
          <input class="menububble__input" type="text" v-model="linkUrl" placeholder="https://" ref="linkInput" @keydown.esc="hideLinkMenu"/>
          <button class="menububble__button" @click="setLinkUrl(commands.link, null)" type="button">
            <icon name="remove" />
          </button>
        </form>

        <template v-else>
          <button class="menububble__button" @click="showLinkMenu(getMarkAttrs('link'))" :class="{ 'is-active': isActive.link() }">
            <span>{{ isActive.link() ? "Update Link" : "Add Link" }}</span>
            <icon name="link" />
          </button>
        </template>
      </div>
    </editor-menu-bubble>
    <editor-content class="editor__content" :editor="editor" tabindex="0"/>
    <input type="file" ref="fileUploadInput" style="display: none" />
    </form>
  </div>
</template>
<script>
import Icon from '@/components/atoms/EditorIcon.vue';
import { Editor, EditorContent, EditorMenuBar, EditorMenuBubble } from 'tiptap';
import {
  Blockquote,
  HardBreak,
  Heading,
  HorizontalRule,
  OrderedList,
  BulletList,
  ListItem,
  Bold,
  Italic,
  Link,
  Strike,
  Underline,
  History,
  Table,
  TableHeader,
  TableCell,
  TableRow,
  Focus,
} from 'tiptap-extensions';
import Image from '@/utils/editorImage';
import store from '@/store';
import Iframe from '../../extensions/iframe';

async function upload(file, itemId) {
  const formData = new FormData();
  formData.append('image', file);
  if (itemId) {
    formData.append('item', itemId);
  }
  // TODO handle errors
  const res = await store.dispatch('UPLOAD_IMAGE', formData);
  return res.data.url;
}

export default {
  components: {
    Icon,
    EditorContent,
    EditorMenuBar,
    EditorMenuBubble,
  },
  props: {
    blog: {
      type: Object,
      default: null,
    },
    value: {
      type: String,
      default: '',
    },
  },
  model: {
    prop: 'value',
    event: 'changeBlog',
  },
  directives: {
    blurEvent: {
      bind(el, binding, vnode) {
        el.addEventListener('blur', () => {
          vnode.context.$emit('outOfFocus');
        }, true);
      },
    },
  },
  data() {
    return {
      editor: new Editor({
        extensions: [
          new Blockquote(),
          new BulletList(),
          new HardBreak(),
          new Heading({ levels: [1, 2, 3] }),
          new HorizontalRule(),
          new ListItem(),
          new OrderedList(),
          new Link(),
          new Bold(),
          new Italic(),
          new Strike(),
          new Underline(),
          new History(),
          new Image(null, null, upload),
          new Table({
            resizable: true,
          }),
          new TableHeader(),
          new TableCell(),
          new TableRow(),
          new Focus({
            className: 'has-focus',
            nested: false,
          }),
          new Iframe(),
        ],
        content: '',
        onUpdate: ({ getHTML }) => {
          const html = getHTML();
          this.$emit('changeBlog', html);
        },
      }),
      linkUrl: null,
      linkMenuIsActive: true,
    };
  },
  watch: {
    blog() {
      this.setContent(this.blog.data.content);
    },
  },
  methods: {
    showImageModal(command) {
      this.$refs.fileUploadInput.click();
      this.$refs.fileUploadInput.command = command;
    },
    clearContent() {
      this.editor.clearContent(true);
      this.editor.focus();
    },
    setContent(json) {
      this.editor.setContent(json, true);
      this.editor.focus();
    },
    showLinkMenu(attrs) {
      this.linkUrl = attrs.href;
      this.linkMenuIsActive = true;
      this.$nextTick(() => {
        this.$refs.linkInput.focus();
      });
    },
    hideLinkMenu() {
      this.linkUrl = null;
      this.linkMenuIsActive = false;
    },
    setLinkUrl(command, url) {
      command({ href: url });
      this.hideLinkMenu();
    },
  },
  mounted() {
    this.$refs.fileUploadInput.addEventListener('change', async (event) => {
      if (event.target.files && event.target.files[0]) {
        const src = await upload(event.target.files[0], this.blog._id);
        event.target.command({ src });
        event.target.command = null;
      }
    });
  },
  beforeDestroy() {
    this.editor.destroy();
  },
};
</script>
<style scoped>
.editor {
  width: 100%;
  margin-bottom: 15px;
}
</style>

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

.text-area input {
  margin-bottom: 20px;
  width: 100%;
  display: flex;
  border: 0;
  border-bottom: 2px solid #ddd;
  font-size: 22px;
  border-radius: 0;
}

.text-area input:focus {
  border-bottom: 2px solid #ced4da;
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
  box-shadow: 0 0 0 3px #3ea4ffe6;
}

table {
  width: 100%;
  height: 100%;
  border-collapse: collapse;
  table-layout: fixed;
}

table {
  border: 1px solid #dbdbe2;
  border-radius: 3px;
  position: relative;
  height: 100%;
  width: 100%;
  box-sizing: border-box;
}

td {
  border: 1px solid #dbdbe2;
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
  display: -webkit-inline-box;
  background: transparent;
  border: 0;
  color: $color-black;
  padding: 0.2rem 0.5rem;
  margin-right: 0.2rem;
  border-radius: 3px;
  opacity: 0.5;
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
  background: transparent;
  border: 0;
  padding: 0.2rem 0.5rem;
  margin-right: 0.2rem;
  border-radius: 3px;
  cursor: pointer;
}

.menububble__form {
  display: -webkit-box;
  display: flex;
  -webkit-box-align: center;
  align-items: center;
}

.menububble__input {
  font: inherit;
  border: none;
  background: transparent;
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
  border-radius: 5px;
  padding: 0.3rem;
  margin-bottom: 0.5rem;
  -webkit-transform: translateX(-50%);
  transform: translateX(-50%);
  visibility: hidden;
  opacity: 0;
  -webkit-transition: opacity 0.2s, visibility 0.2s;
  transition: opacity 0.2s, visibility 0.2s;
  border: solid 1px gray;
  box-shadow: 1px 1px 8px grey;
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

<style lang="scss">
.iframe {
  &__embed {
    width: 100%;
  }
  &__input {
    display: block;
    width: 100%;
    font-size: inherit;
    border: 0;
    border-radius: 5px;
    background-color: rgba(100,100,100, 0.1);
    padding: 0.3rem 0.5rem;
  }
}
</style>
