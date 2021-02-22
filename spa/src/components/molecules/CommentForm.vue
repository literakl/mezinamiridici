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
                <button class="menubar__button" @click="commands.undo">
                  <icon name="undo" />
                </button>

                <button class="menubar__button" @click="commands.redo">
                  <icon name="redo" />
                </button>

                <button class="menubar__button" :class="{ 'is-active': isActive.bold() }" @click="commands.bold">
                  <icon name="bold" />
                </button>

                <button class="menubar__button" :class="{ 'is-active': isActive.italic() }" @click="commands.italic">
                  <icon name="italic" />
                </button>

                <button class="menubar__button" :class="{ 'is-active': isActive.strike() }" @click="commands.strike">
                  <icon name="strike" />
                </button>

                <button class="menubar__button" :class="{ 'is-active': isActive.underline() }" @click="commands.underline">
                  <icon name="underline" />
                </button>

                <button class="menubar__button" :class="{ 'is-active': isActive.bullet_list() }" @click="commands.bullet_list">
                  <icon name="ul" />
                </button>

                <button class="menubar__button" :class="{ 'is-active': isActive.ordered_list() }" @click="commands.ordered_list">
                  <icon name="ol" />
                </button>

                <button class="menubar__button" :class="{ 'is-active': isActive.blockquote() }" @click="commands.blockquote">
                  <icon name="quote" />
                </button>

                <b-button class="menubar__button"  :id="`emojis_${commentId}`" variant="outline" size="sm">
                  <BIconEmojiSunglasses></BIconEmojiSunglasses>
                </b-button>

                <b-button v-if="parent" @click="dismiss" variant="outline" size="sm" class="closebtn">
                  <BIconXCircle></BIconXCircle>
                </b-button>
              </div>
            </editor-menu-bar>
            <editor-content v-if="isShow" :editor="editor" />
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
import { Editor, EditorContent, EditorMenuBar } from 'tiptap';
import {
  Blockquote,
  OrderedList,
  BulletList,
  ListItem,
  Bold,
  Italic,
  Link,
  Strike,
  Underline,
  History,
} from 'tiptap-extensions';
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
          new ListItem(),
          new OrderedList(),
          new Link(),
          new Bold(),
          new Italic(),
          new Strike(),
          new Underline(),
          new History(),
        ],
        content: '',
        onUpdate: ({ getJSON, getHTML }) => {
          this.json = getJSON();
          this.html = getHTML();
          if (this.html.replace(/<[^>]*>/g, '').trim().length > 0) {
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
      this.editor.setContent(editorData, true);
    },
  },
};
</script>

<style>
.comment-box .container-fluid{
  padding: 0;
}
  .ProseMirror {
    border: #dddddd solid 1px;
    padding: 10px;
    min-height: 150px;
  }
  .ProseMirror img{
    width: 100%;
  }
  .send-comment-btn{
    width: 100%;
    display: flex;
    justify-content: flex-end;
    margin-bottom: 20px;
  }
  .send-comment-btn button{
    max-width: 150px;
    width: 100%;
  }
  .closebtn{
    float: right;
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
  .menubar button{
    box-shadow: none;
  }
  .menubar button svg{ color:var(--text-color)}
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
