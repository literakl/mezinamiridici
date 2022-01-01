<template>
  <div class="editor" v-blur-event>
    <form @submit.prevent>
      <div>
        <b-alert
          :show="showDismissibleAlert"
          dismissible
          @dismissed="dismissError"
          variant="danger"
        >
          {{ errorMessage }}
        </b-alert>
      </div>
      <div class="menubar" v-if="editor">
        <button class="menubar__button" @click="editor.chain().focus().undo().run()">
          <icon name="undo" />
        </button>
        <button class="menubar__button" @click="editor.chain().focus().redo().run()">
          <icon name="redo" />
        </button>
        <button
          class="menubar__button"
          @click="editor.chain().focus().toggleBold().run()"
          :class="{ 'is-active': editor.isActive('bold') }"
        >
          <icon name="bold" />
        </button>

        <button
          class="menubar__button"
          @click="editor.chain().focus().toggleItalic().run()"
          :class="{ 'is-active': editor.isActive('italic') }"
        >
          <icon name="italic" />
        </button>

        <button
          class="menubar__button"
          @click="editor.chain().focus().toggleStrike().run()"
          :class="{ 'is-active': editor.isActive('strike') }"
        >
          <icon name="strike" />
        </button>

        <button
          class="menubar__button"
          @click="editor.chain().focus().toggleUnderline().run()"
          :class="{ 'is-active': editor.isActive('underline') }"
        >
          <icon name="underline" />
        </button>

        <button
          class="menubar__button"
          @click="editor.chain().focus().toggleHeading({ level: 1 }).run()"
          :class="{ 'is-active': editor.isActive('heading', { level: 1 }) }"
        >
          H1
        </button>

        <button
          class="menubar__button"
          @click="editor.chain().focus().toggleHeading({ level: 2 }).run()"
          :class="{ 'is-active': editor.isActive('heading', { level: 2 }) }"
        >
          H2
        </button>

        <button
          class="menubar__button"
          @click="editor.chain().focus().toggleHeading({ level: 3 }).run()"
          :class="{ 'is-active': editor.isActive('heading', { level: 3 }) }"
        >
          H3
        </button>

        <button
          class="menubar__button"
          @click="editor.chain().focus().toggleBulletList().run()"
          :class="{ 'is-active': editor.isActive('bulletList') }"
        >
          <icon name="ul" />
        </button>

        <button
          class="menubar__button"
          @click="editor.chain().focus().toggleOrderedList().run()"
          :class="{ 'is-active': editor.isActive('orderedList') }"
        >
          <icon name="ol" />
        </button>

        <button
          class="menubar__button"
          @click="editor.chain().focus().toggleCodeBlock().run()"
          :class="{ 'is-active': editor.isActive('codeBlock') }"
        >
          <icon name="quote" />
        </button>

        <button class="menubar__button" @click="editor.chain().focus().setHorizontalRule().run()">
          <icon name="hr" />
        </button>

        <button class="menubar__button" @click="showImageModal">
          <Icon name="image" />
        </button>

        <button
          class="menubar__button"
          @click="showLinkMenu"
          :class="{ 'is-active': editor.isActive('link') }"
        >
          <span>{{ editor.isActive("link") ? "Update Link" : "Add Link" }}</span>
          <icon name="link" />
        </button>

        <button class="menubar__button" @click="addIframe">
          <icon name="video" />
        </button>

        <button
          class="menubar__button"
          @click="
            editor.chain().focus().insertTable({ rows: 2, cols: 2, withHeaderRow: false }).run()
          "
        >
          <icon name="table" />
        </button>

        <span v-if="editor.can().addColumnBefore()">
          <button
            class="menubar__button"
            @click="editor.chain().focus().deleteTable().run()"
            :disabled="!editor.can().deleteTable()"
          >
            <icon name="delete_table" />
          </button>
          <button
            class="menubar__button"
            @click="editor.chain().focus().addColumnBefore().run()"
            :disabled="!editor.can().addColumnBefore()"
          >
            <icon name="add_col_before" />
          </button>
          <button
            class="menubar__button"
            @click="editor.chain().focus().addColumnAfter().run()"
            :disabled="!editor.can().addColumnAfter()"
          >
            <icon name="add_col_after" />
          </button>
          <button
            class="menubar__button"
            @click="editor.chain().focus().deleteColumn().run()"
            :disabled="!editor.can().deleteColumn()"
          >
            <icon name="delete_col" />
          </button>
          <button
            class="menubar__button"
            @click="editor.chain().focus().addRowBefore().run()"
            :disabled="!editor.can().addRowBefore()"
          >
            <icon name="add_row_before" />
          </button>
          <button
            class="menubar__button"
            @click="editor.chain().focus().addRowAfter().run()"
            :disabled="!editor.can().addRowAfter()"
          >
            <icon name="add_row_after" />
          </button>
          <button
            class="menubar__button"
            @click="editor.chain().focus().deleteRow().run()"
            :disabled="!editor.can().deleteRow()"
          >
            <icon name="delete_row" />
          </button>
          <button
            class="menubar__button"
            @click="editor.chain().focus().mergeCells().run()"
            :disabled="!editor.can().mergeCells()"
          >
            <icon name="combine_cells" />
          </button>
        </span>
      </div>

      <editor-content class="editor__content" :editor="editor" tabindex="0" />

      <!-- <div class="upload-progress-content" v-if="progressValue!==0 && progressValue!==progressMax">
      <b-progress class="custom-progress-bar" :value="progressValue" :max="progressMax" variant="success" show-progress animated show-value></b-progress>
    </div> -->

      <input type="file" ref="fileUploadInput" style="display: none" />
    </form>
  </div>
</template>
<script>
import { Editor, EditorContent } from "@tiptap/vue-2";
import StarterKit from "@tiptap/starter-kit";
import Table from "@tiptap/extension-table";
import TableRow from "@tiptap/extension-table-row";
import TableCell from "@tiptap/extension-table-cell";
import TableHeader from "@tiptap/extension-table-header";
import Underline from "@tiptap/extension-underline";
import Image from "@tiptap/extension-image";
import Link from "@tiptap/extension-link";
import Iframe from "@/modules/tiptap/iframe";
import { BAlert, BProgress } from "bootstrap-vue";
import store from "@/store";
import Icon from "@/components/atoms/EditorIcon.vue";

async function upload(file, progress) {
  const formData = new FormData();
  formData.append("image", file);
  // TODO handle errors
  const res = await store.dispatch("UPLOAD_IMAGE", {
    body: formData,
    progress,
  });
  return res.data;
}

export default {
  components: {
    Icon,
    EditorContent,
    BAlert,
    BProgress,
  },
  props: {
    blog: {
      type: Object,
      default: null,
    },
    value: {
      type: String,
      default: "",
    },
  },
  model: {
    prop: "value",
    event: "changeBlog",
  },
  directives: {
    blurEvent: {
      bind(el, binding, vnode) {
        el.addEventListener(
          "blur",
          () => {
            vnode.context.$emit("outOfFocus");
          },
          true
        );
      },
    },
  },
  data() {
    return {
      editor: new Editor({
        extensions: [
          StarterKit,
          Table.configure({
            resizable: true,
          }),
          TableRow,
          TableHeader,
          TableCell,
          Underline,
          Image,
          Link.configure({
            openOnClick: false,
          }),
          Iframe,
        ],
        content: "",
        onUpdate: ({ editor }) => {
          const html = editor.getHTML();
          this.$emit("changeBlog", html);
        },
      }),
      linkUrl: null,
      linkMenuIsActive: true,
      progressMax: 100,
      progressValue: 0,
      showDismissibleAlert: false,
      errorMessage: undefined,
    };
  },
  watch: {
    blog() {
      this.setContent(this.blog.data.content);
    },
  },
  methods: {
    addIframe() {
      const url = window.prompt("URL");

      if (url) {
        this.editor.chain().focus().setIframe({ src: url }).run();
      }
    },
    showImageModal() {
      this.$refs.fileUploadInput.click();
      this.$refs.fileUploadInput.command = command;
    },
    clearContent() {
      this.editor.commands.clearContent(true);
      this.editor.commands.focus();
    },
    setContent(json) {
      this.editor.commands.setContent(json, true);
      this.editor.commands.focus();
    },
    showLinkMenu() {
      const previousUrl = this.editor.getAttributes("link").href;
      this.linkUrl = window.prompt("URL", previousUrl);
     
      // cancelled
      if (this.linkUrl === null) {
        return;
      }

      // empty
      if (this.linkUrl === "") {
        this.editor.chain().focus().extendMarkRange("link").unsetLink().run();

        return;
      }

      // update link
      this.editor.chain().focus().extendMarkRange("link").setLink({ href: this.linkUrl }).run();
    },
    hideLinkMenu() {
      this.linkUrl = null;
      this.linkMenuIsActive = false;
    },
    setLinkUrl(command, url) {
      command({ href: url });
      this.hideLinkMenu();
    },
    dismissError() {
      this.showDismissibleAlert = false;
      this.errorMessage = undefined;
    },
  },
  mounted() {
    const _this = this;
    const progress = (progressEvent) => {
      let totalLength;
      if (progressEvent.lengthComputable) {
        totalLength = progressEvent.total;
      } else {
        totalLength =
          progressEvent.target.getResponseHeader("content-length") ||
          progressEvent.target.getResponseHeader("x-decompressed-content-length");
      }
      if (totalLength !== null) {
        _this.progressValue = Math.round((progressEvent.loaded * 100) / totalLength);
      }
    };

    this.$refs.fileUploadInput.addEventListener("change", async (event) => {
      if (event.target.files && event.target.files[0]) {
        const file = event.target.files[0];
        if (
          ["image/jpeg", "image/webp", "image/gif", "image/png", "image/svg+xml"].indexOf(
            file.type
          ) === -1
        ) {
          this.errorMessage = this.$t("editor.image-unsupported-type");
          this.showDismissibleAlert = true;
          return;
        }

        if (file.size > 20000000) {
          this.errorMessage = this.$t("editor.image-too-big");
          this.showDismissibleAlert = true;
          return;
        }

        // #214 TODO add dialog here?
        const data = await upload(file, progress);
        event.target.command({ src: data.url, pictureid: data.pictureId });
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
.upload-progress-content {
  background: rgba(0, 0, 0, 0.5);
  position: fixed;
  width: 100vw;
  height: 100vh;
  top: 0;
  left: 0;
}
.custom-progress-bar {
  position: inherit;
  top: 50%;
  width: calc(100vw - 20%);
  margin-left: 10%;
  margin-right: 10%;
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
  font-size: 18px !important;
  border-radius: 0;
  padding: 0;
}

.ProseMirror-focused .has-focus {
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
.editor .menubar {
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
