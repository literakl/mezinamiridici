<template>
  <div class="mb-2">
    <b-button :id="`emoji_list_${commentId}`" class="mt-2" variant="outline" size="sm">
      &#x1F600;
    </b-button>
    <b-popover :target="`emoji_list_${commentId}`" triggers="hover" placement="bottom">
      <b-button v-for="(emoji, index) in emojiArray" v-bind:key="index"
                v-on:click="addEmoji(index)"
                variant="outline" size="sm">
        {{emoji}}
      </b-button>
    </b-popover>

    <b-btn-close v-if="dismissable" @click="dismiss"></b-btn-close>
    <b-form-textarea v-model="text" :placeholder="$t('comment.write-comment-placeholder')" rows="2">
    </b-form-textarea>

    <div class="textareaElement" id="textareaElement" contenteditable="">
    </div>
    <label class="placeholder">Type your comment ...</label>
    <div class="icons">
      <a href="#">S</a>
      <a href="#">C</a>
      <a href="#" class="gif">GIF</a>
      <a href="#">N</a>
    </div>

    <b-alert v-model="error" variant="danger" dismissible>
      {{ $t('generic.internal-error') }}
    </b-alert>
    <Button :disabled="sending" class="mt-2" size="sm" :value="$t('comment.send-button')" @clicked="send"/>
  </div>
</template>

<script>
import Button from '@/components/atoms/Button.vue';

export default {
  name: 'CommentForm',
  props: {
    itemId: String,
    parent: String,
    dismissable: {
      type: Boolean,
      default: true,
    },
    commentId: String,
  },
  components: {
    Button,
  },
  data: () => ({
    text: '',
    sending: null,
    error: null,
    emojiArray: ['\u{1F600}', '\u{1F603}', '\u{1F601}', '\u{1F606}',
      '\u{1F60B}', '\u{1F61B}', '\u{1F61C}', '\u{1F92D}', '\u{1F92B}',
      '\u{1F910}', '\u{1F928}', '\u{1F644}', '\u{1F614}', '\u{1F634}',
      '\u{1F637}', '\u{1F975}', '\u{1F60E}', '\u{2639}', '\u{1F633}',
      '\u{1F62D}', '\u{1F629}', '\u{1F621}', '\u{1F620}', '\u{1F47F}'],
  }),
  methods: {
    dismiss() {
      this.$emit('dismiss');
    },
    async send() {
      this.error = false;
      this.sending = true;

      const payload = {
        itemId: this.itemId,
        text: this.text,
      };

      if (this.parent) {
        payload.parent = this.parent;
      }

      try {
        await this.$store.dispatch('ADD_COMMENT', payload);
        this.text = '';
        this.$emit('dismiss');
      } catch (e) {
        console.log(e);
        this.error = true;
      }
      this.sending = false;
    },
    addEmoji(idx) {
      this.text += this.emojiArray[idx];
    },
  },
};
</script>

<style>
  * {
    box-sizing: border-box;
  }

  body {
    margin: 0;
    padding: 0;
    font-family: Arial, Helvetica, sans-serif;
    font-style: normal;
    font-weight: 500;
    -webkit-font-smoothing: antialiased;
    -moz-osx-font-smoothing: grayscale;
    box-sizing: border-box;
  }
  h1 {
    color: rgb(19, 146, 231);
    font-size: 50px;
    font-weight: bold;
  }

  .container {
    position: relative;
    margin-top: 80px;
  }
  .textareaElement {
    width: 100%;
    min-height: 17px;
    max-height: 300px;
    overflow-x: hidden;
    overflow-y: hidden;
    padding: 12px 31px 12px 31px;
    background: #333;
    color: #FFF;
    font-size: 21px;
    border-radius: 51px;
    outline: none;
    z-index: 9999;
  }
  .textareaElement a{
    text-align: right;
  }
  textarea:focus{
    background: #333;
    color: #FFF;
  }
  .icons {
    position: relative;
    top: -37px;
    left: 930px;
    width: 152px;
  }

  .icons a {
    margin: 0 5px;
    border: 1px solid #FFF;
    padding: 2px;
    border-radius: 5px;
  }
  .placeholder{
    position: absolute;
    top: 14px;
    left: 43px;
    color: #999;
    z-index: 5;
  }
</style>
