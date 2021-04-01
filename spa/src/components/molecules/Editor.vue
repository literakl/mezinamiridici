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
  font-size: 18px!important;
  border-radius: 0;
  padding: 0;
}

.ProseMirror-focused  .has-focus {
  border-radius: 3px;
  box-shadow: 0 0 0 3px #f7f7f7;
}
.ProseMirror {
  border: #ddd solid 1px;
  padding: 10px;
  min-height: 250px;
  max-height: 70vh;
  overflow: hidden;
  overflow-y: scroll;
}

.editor {
  width: 100%;
  margin-bottom: 15px;
}
.editor .menubar{
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
.tags-area div {
  border-radius: 0;
  border: 0;
  padding: 0;
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
  border: 0;
  padding: 0.2rem 0.5rem;
  margin-right: 0.2rem;
  border-radius: 3px;
  opacity: 1;
  cursor: pointer;
}
.menubar__button:hover {
   background: #f8f7f4;
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
  .ProseMirror {
    max-height: 50vh;
  }
}
</style>
