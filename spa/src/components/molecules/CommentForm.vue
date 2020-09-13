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
            <editor v-if="isShow" class="textarea" ref="editor" :config="config"/>
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
import { BIconEmojiSunglasses, BIconXCircle } from 'bootstrap-vue';
import List from '@editorjs/list';
import Paragraph from '@editorjs/paragraph';
import Button from '@/components/atoms/Button.vue';

export default {
  name: 'CommentForm',
  props: {
    itemId: String,
    parent: String,
    commentId: String,
    isShow: Boolean,
  },
  components: {
    Button, BIconEmojiSunglasses, BIconXCircle,
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

      config: {
        holder: `editor-js-${this.commentId}`,
        minHeight: 0,
        tools: {
          paragraph: {
            class: Paragraph,
          },
          list: {
            class: List,
            inlineToolbar: true,
          },
        },
        placeholder: this.$t('blog.form.p-placeholder'),
        data: {},
        i18n: {
          messages: {
            ui: {
              blockTunes: {
                toggler: {
                  'Click to tune': this.$t('blog.form.click-to-tune'),
                  'or drag to move': this.$t('blog.form.or-drag-to-move'),
                },
              },
              inlineToolbar: {
                converter: {
                  'Convert to': this.$t('blog.form.convert-to'),
                },
              },
              toolbar: {
                toolbox: {
                  Add: this.$t('blog.form.add'),
                },
              },
            },
            toolNames: {
              Text: this.$t('blog.form.text'),
              Heading: this.$t('blog.form.heading'),
              List: this.$t('blog.form.list'),
              Quote: this.$t('blog.form.quote'),
              Delimiter: this.$t('blog.form.delimiter'),
              Table: this.$t('blog.form.table'),
              Image: this.$t('blog.form.table'),
              Bold: this.$t('blog.form.bold'),
              Italic: this.$t('blog.form.italic'),
              InlineCode: this.$t('blog.form.inlineCode'),
            },
            tools: {
              warning: {
                Title: this.$t('blog.form.title'),
                Message: this.$t('blog.form.message'),
              },
              link: {
                'Add a link': this.$t('blog.form.add-link'),
              },
              stub: {
                'The block can not be displayed correctly.': this.$t('blog.form.display-incorrect'),
              },
            },
            blockTunes: {
              delete: {
                Delete: this.$t('blog.form.delete'),
              },
              moveUp: {
                'Move up': this.$t('blog.form.move-up'),
              },
              moveDown: {
                'Move down': this.$t('blog.form.move-down'),
              },
            },
          },
        },
      },
    };
  },
  methods: {
    dismiss() {
      this.$emit('dismiss');
    },
    async send() {
      this.error = false;
      this.sending = true;

      const editorData = await this.$refs.editor.state.editor.save().then(res => res);

      const payload = {
        itemId: this.itemId,
        source: editorData,
      };

      if (this.parent) {
        payload.parent = this.parent;
      }

      try {
        await this.$store.dispatch('ADD_COMMENT', payload);
        this.$refs.editor.state.editor.clear();
        this.$emit('dismiss');
      } catch (e) {
        this.$log.error(e);
        this.error = true;
      }
      this.sending = false;
    },
    async addEmoji(idx) {
      this.$refs.editor.state.editor.blocks.insert('paragraph', { text: this.emojiArray[idx] });
    },
  },
};
</script>

<style>
  .editor-js {
    border: 1px solid #ced4da;
    overflow: auto;
  }
  .comment-box .codex-editor {
    height: 100px;
  }
  .comment-box .codex-editor__redactor {
    padding-bottom: 100px
  }
  .comment-box .comment-box {
    position: relative;
    width: 100%;
  }

  .comment-box .textarea {
    /* height: 40px; */
    overflow-y: hidden;
  }

  .comment-box .textarea_short {
    padding: 13px 50px 34px 32px;
  }

  .comment-box .textarea_long {
    padding: 0 30px 5px 30px;
  }

  .comment-box .icons {
    position: relative;
    text-align: right;
    width: 143px;
    float: right;
    right: 40px;
  }

  .ce-block__content, .ce-toolbar__content {
    position: relative;
    max-width: 97%;
    margin: 0 auto;
    -webkit-transition: background-color .15s ease;
    transition: background-color .15s ease;
  }
</style>
