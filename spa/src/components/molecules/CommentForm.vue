<template>
  <div class="mb-2 mt-2">
    <b-popover :target="`emojis_${commentId}`" triggers="hover" placement="bottom">
      <b-button v-for="(emoji, index) in emojiArray" v-bind:key="index"
                v-on:click="addEmoji(index)"
                variant="outline" size="sm">
        {{ emoji }}
      </b-button>
    </b-popover>

    <div class="comment-box">
      <b-container fluid>
        <b-row>
          <b-col sm="12" class="editor-js" :id="`editor-js-${commentId}`">
            <div class="menubar" v-if="editor">
              <b-button class="menubar__button" :id="`emojis_${commentId}`" variant="outline">
                <BIconEmojiSunglasses></BIconEmojiSunglasses>
              </b-button>

              <button
                :title="$t('editor.menu.link')"
                v-if="!editor.isActive('link')"
                @click="showLinkMenu"
                class="menubar__button"
              >
                <icon name="link" />
              </button>

              <button
                :title="$t('editor.menu.unlink')"
                v-if="editor.isActive('link')"
                @click="editor.chain().focus().unsetLink().run()"
                class="is-active menubar__button"
              >
                <icon name="remove" />
              </button>

              <button
                :title="$t('editor.menu.link-edit')"
                v-if="editor.isActive('link')"
                @click="showLinkMenu"
                class="is-active menubar__button"
              >
                <icon name="link" />
              </button>

              <button
                :title="$t('editor.menu.bold')"
                @click="editor.chain().focus().toggleBold().run()"
                class="menubar__button"
                :class="{ 'is-active': editor.isActive('bold') }"
              >
                <icon name="bold" />
              </button>

              <button
                :title="$t('editor.menu.italic')"
                @click="editor.chain().focus().toggleItalic().run()"
                class="menubar__button"
                :class="{ 'is-active': editor.isActive('italic') }"
              >
                <icon name="italic" />
              </button>

              <button
                :title="$t('editor.menu.quote')"
                @click="editor.chain().focus().toggleCodeBlock().run()"
                class="menubar__button"
                :class="{ 'is-active': editor.isActive('codeBlock') }"
              >
                <icon name="quote" />
              </button>

              <button
                :title="$t('editor.menu.strike')"
                @click="editor.chain().focus().toggleStrike().run()"
                class="menubar__button"
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
                :title="$t('editor.menu.ul')"
                @click="editor.chain().focus().toggleBulletList().run()"
                class="menubar__button"
                :class="{ 'is-active': editor.isActive('bulletList') }"
              >
                <icon name="ul" />
              </button>

              <button
                :title="$t('editor.menu.ol')"
                @click="editor.chain().focus().toggleOrderedList().run()"
                class="menubar__button"
                :class="{ 'is-active': editor.isActive('orderedList') }"
              >
                <icon name="ol" />
              </button>

              <button
                :title="$t('editor.menu.undo')"
                @click="editor.chain().focus().undo().run()"
                class="menubar__button"
              >
                <icon name="undo" />
              </button>

              <button
                :title="$t('editor.menu.redo')"
                @click="editor.chain().focus().redo().run()"
                class="menubar__button"
              >
                <icon name="redo" />
              </button>

              <b-button v-if="parent" @click="dismiss" variant="outline" size="sm" class="closebtn">
                <BIconXCircle></BIconXCircle>
              </b-button>
            </div>
            <editor-content v-if="isShow" :editor="editor"/>
          </b-col>
        </b-row>
      </b-container>
    </div>

    <b-alert v-model="error" variant="danger" dismissible>
      {{ $t('generic.internal-error') }}
    </b-alert>
    <span class="send-comment-btn"><Button :disabled="sending || empty" class="mt-2" size="sm" :value="$t('comment.send-button')" @clicked="send"/></span>
  </div>
</template>

<script>
import { BIconEmojiSunglasses, BIconXCircle, BPopover, BButton, BContainer, BRow, BCol, BAlert } from 'bootstrap-vue';
import { Editor, EditorContent } from "@tiptap/vue-2";
import StarterKit from "@tiptap/starter-kit";
import Underline from "@tiptap/extension-underline";
import Link from "@tiptap/extension-link";
import Button from '@/components/atoms/Button.vue';
import Icon from '@/components/atoms/EditorIcon.vue';

export default {
  name: 'CommentForm',
  props: {
    itemId: String,
    parent: String,
    commentId: String,
    isShow: Boolean,
  },
  components: {
    Button,
    BIconEmojiSunglasses,
    BIconXCircle,
    BPopover,
    BButton,
    BContainer,
    BRow,
    BCol,
    BAlert,
    Icon,
    EditorContent,
  },
  data() {
    return {
      sending: null,
      error: null,
      emojiArray: ['\u{1F600}', '\u{1F603}', '\u{1F601}', '\u{1F606}',
        '\u{1F60B}', '\u{1F61B}', '\u{1F61C}', '\u{1F92D}', '\u{1F92B}',
        '\u{1F910}', '\u{1F928}', '\u{1F644}', '\u{1F614}', '\u{1F634}',
        '\u{1F637}', '\u{1F975}', '\u{1F60E}', '\u{2639}', '\u{1F633}',
        '\u{1F62D}', '\u{1F629}', '\u{1F621}', '\u{1F620}', '\u{1F47F}'],
      editor: new Editor({
        extensions: [
          StarterKit,
          Link.configure({
            openOnClick: false,
          }),
          Underline,
        ],
        content: '',
        onUpdate: ({editor}) => {
          this.json = editor.getJSON();
          this.html = editor.getHTML();
          if (this.html.replace(/<[^>]*>/g, '')
            .trim().length > 0) {
            this.empty = false;
          } else {
            this.empty = true;
          }
        },
      }),
      json: '',
      html: '',
      empty: true,
    };
  },
  methods: {
    dismiss() {
      this.$emit('dismiss');
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
    async send() {
      this.error = false;
      this.sending = true;

      const payload = {
        itemId: this.itemId,
        source: this.html,
      };

      if (this.parent) {
        payload.parent = this.parent;
      }

      try {
        await this.$store.dispatch('ADD_COMMENT', payload);
        this.editor.commands.clearContent(true);
        this.$emit('dismiss');
      } catch (e) {
        this.$log.error(e);
        this.error = true;
      }
      this.sending = false;
    },
    async addEmoji(idx) {
      const editorData = `${this.html}<p>${this.emojiArray[idx]}</p>`;
      this.editor.commands.setContent(editorData, true);
    },
  },
};
</script>

<style>
.comment-box .container-fluid {
  padding: 0;
}

.ProseMirror {
  padding: 10px;
  min-height: 130px;
  border-left: #ddd solid 1px;
  border-right: #ddd solid 1px;
  border-bottom: #ddd solid 1px;
}

.ProseMirror img {
  max-width: 100%;
}

.send-comment-btn {
  width: 100%;
  display: flex;
  justify-content: flex-end;
  margin-bottom: 20px;
}

.send-comment-btn button {
  max-width: 150px;
  width: 100%;
  background: var(--dislike-status);
  border: 0;
}
.send-comment-btn button:hover {
background: var(--dislike-status-hover);
}

.send-comment-btn button:disabled{
  background: var(--dislike-status);
}

.closebtn {
  float: right;
}
</style>

<style lang="scss" scoped>
$color-black: #000000;
$color-white: #ffffff;
$color-grey: #dddddd;

.menubar__button {
  font-weight: 700;
    background: #f1f0ed;
    border: 0;
    padding: 0.2rem 0.5rem;
    margin-right: 0.2rem;
    border-radius: 3px;
    opacity: 1;
    cursor: pointer;

  &.is-active {
   border-bottom: 3px solid var(--theme-primary);
  }
}

.menubar{
    display: flex;
    align-items: flex-start;
    flex-wrap: wrap;
    padding: 4px 5px;
    border-radius: 4px 4px 0 0;
    border-top: 1px solid #ddd;
    border-left: 1px solid #ddd;
    border-right: 1px solid #ddd;
    border-bottom: 1px solid #ddd;
}

.menubar__button:hover {
   background: #f8f7f4;
}

.menubar button svg {
  color: var(--text-color)
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
</style>
