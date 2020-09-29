<template>
  <div class="mb-2 mt-2">
    <b-popover :target="`emojis_${commentId}`" triggers="hover" placement="bottom">
      <b-button v-for="(emoji, index) in emojiArray" v-bind:key="index"
                v-on:click="addEmoji(index)"
                variant="outline" size="sm">
        {{emoji}}
      </b-button>
    </b-popover>

    <div class="comment-box">
      <b-container fluid>
        <b-row>
          <b-col sm="12" class="editor-js" :id="`editor-js-${commentId}`">
            <editor-menu-bar v-if="isShow" :editor="editor" v-slot="{ commands, isActive }">
              <div class="menubar">

                <button
                  class="menubar__button"
                  :class="{ 'is-active': isActive.bold() }"
                  @click="commands.bold"
                >
                  <icon name="bold" />
                </button>

                <button
                  class="menubar__button"
                  :class="{ 'is-active': isActive.italic() }"
                  @click="commands.italic"
                >
                  <icon name="italic" />
                </button>

                <button
                  class="menubar__button"
                  :class="{ 'is-active': isActive.strike() }"
                  @click="commands.strike"
                >
                  <icon name="strike" />
                </button>

                <button
                  class="menubar__button"
                  :class="{ 'is-active': isActive.underline() }"
                  @click="commands.underline"
                >
                  <icon name="underline" />
                </button>

                <button
                  class="menubar__button"
                  :class="{ 'is-active': isActive.code() }"
                  @click="commands.code"
                >
                  <icon name="code" />
                </button>

                <button
                  class="menubar__button"
                  :class="{ 'is-active': isActive.paragraph() }"
                  @click="commands.paragraph"
                >
                  <icon name="paragraph" />
                </button>

                <button
                  class="menubar__button"
                  :class="{ 'is-active': isActive.heading({ level: 1 }) }"
                  @click="commands.heading({ level: 1 })"
                >
                  H1
                </button>

                <button
                  class="menubar__button"
                  :class="{ 'is-active': isActive.heading({ level: 2 }) }"
                  @click="commands.heading({ level: 2 })"
                >
                  H2
                </button>

                <button
                  class="menubar__button"
                  :class="{ 'is-active': isActive.heading({ level: 3 }) }"
                  @click="commands.heading({ level: 3 })"
                >
                  H3
                </button>

                <button
                  class="menubar__button"
                  :class="{ 'is-active': isActive.bullet_list() }"
                  @click="commands.bullet_list"
                >
                  <icon name="ul" />
                </button>

                <button
                  class="menubar__button"
                  :class="{ 'is-active': isActive.ordered_list() }"
                  @click="commands.ordered_list"
                >
                  <icon name="ol" />
                </button>

                <button
                  class="menubar__button"
                  :class="{ 'is-active': isActive.blockquote() }"
                  @click="commands.blockquote"
                >
                  <icon name="quote" />
                </button>

                <button
                  class="menubar__button"
                  :class="{ 'is-active': isActive.code_block() }"
                  @click="commands.code_block"
                >
                  <icon name="code" />
                </button>

                <button
                  class="menubar__button"
                  @click="commands.horizontal_rule"
                >
                  <icon name="hr" />
                </button>

                <button
                  class="menubar__button"
                  @click="commands.undo"
                >
                  <icon name="undo" />
                </button>

                <button
                  class="menubar__button"
                  @click="commands.redo"
                >
                  <icon name="redo" />
                </button>

              </div>
            </editor-menu-bar>
            <editor-content v-if="isShow" :editor="editor" />
          </b-col>
        </b-row>
      </b-container>

      <div class="icons">
        <b-button :id="`emojis_${commentId}`" class="mt-2" variant="outline" size="sm">
          <BIconEmojiSunglasses></BIconEmojiSunglasses>
        </b-button>
        <b-button v-if="parent" @click="dismiss" class="mt-2" variant="outline" size="sm">
          <BIconXCircle></BIconXCircle>
        </b-button>
      </div>
    </div>

    <b-alert v-model="error" variant="danger" dismissible>
      {{ $t('generic.internal-error') }}
    </b-alert>
    <Button :disabled="sending" class="mt-2" size="sm" :value="$t('comment.send-button')" @clicked="send"/>
  </div>
</template>

<script>
import { BIconEmojiSunglasses, BIconXCircle, BPopover, BButton, BContainer, BRow, BCol, BAlert } from 'bootstrap-vue';
import Icon from '@/components/atoms/EditorIcon.vue';
import { Editor, EditorContent, EditorMenuBar } from 'tiptap';
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
import Button from '@/components/atoms/Button.vue';
// import resourceBundle from '@/utils/editorJSResourceBundle';

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
    EditorMenuBar,
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
        ],
        content: '',
        onUpdate: ({ getJSON, getHTML }) => {
          this.json = getJSON();
          this.html = getHTML();
        },
      }),
      json: 'Update content to see changes',
      html: 'Update content to see changes',
    };
  },
  methods: {
    dismiss() {
      this.$emit('dismiss');
    },
    async send() {
      this.error = false;
      this.sending = true;

      const editorData = this.html;

      const payload = {
        itemId: this.itemId,
        source: editorData,
      };

      if (this.parent) {
        payload.parent = this.parent;
      }

      try {
        await this.$store.dispatch('ADD_COMMENT', payload);
        this.editor.clearContent(true);
        this.$emit('dismiss');
      } catch (e) {
        this.$log.error(e);
        this.error = true;
      }
      this.sending = false;
    },
    async addEmoji(idx) {
      const editorData = `${this.html}<p>${this.emojiArray[idx]}</p>`;
      this.editor.setContent(editorData);
    },
  },
};
</script>

<style>
  .ProseMirror {
    border: #dddddd solid 1px;
    padding: 10px;
  }
  .ProseMirror img{
    width: 100%;
  }
</style>

<style lang="scss" scoped>
  $color-black: #000000;
  $color-white: #ffffff;
  $color-grey: #dddddd;


  .menubar__button{
    font-weight: 700;
    display: -webkit-inline-box;
    background: transparent;
    border: 0;
    color: $color-black;
    padding: .2rem .5rem;
    margin-right: .2rem;
    border-radius: 3px;
    cursor: pointer;

    &.is-active {
      background-color: rgba($color-black,.1);
    }
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
</style>
