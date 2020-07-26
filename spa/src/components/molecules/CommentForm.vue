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
