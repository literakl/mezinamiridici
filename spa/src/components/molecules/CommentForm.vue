<template>
  <div class="mb-2">
    <b-btn-close v-if="dismissable" @click="dismiss"></b-btn-close>
    <b-form-textarea v-model="text" :placeholder="$t('comment.write-comment-placeholder')" rows="2">
    </b-form-textarea>
    <b-alert v-model="error" variant="danger" dismissible>
      {{ $t('generic.internal-error') }}
    </b-alert>

    <Button :disabled="sending" class="mt-2" size="sm" :value="$t('comment.send-button')" @clicked="send"/>

    <b-button :id="`emoji-list_${commentId}`" class="mt-2" variant="outline" size="sm">
      &#x1f600;
    </b-button>

    <b-popover :target="`emoji-list_${commentId}`" triggers="hover" placement="bottom">
      <b-button v-for="(emoji,index) in emojiArray" v-bind:key="index" variant="outline" size="sm"
       @click="insertEmoji(index)">{{emoji}}</b-button>
    </b-popover>

  </div>
</template>

<script>
import Button from '@/components/atoms/Button.vue';

export default {
  name: 'CommentForm',
  props: {
    itemId: String,
    commentId: String,
    parent: String,
    dismissable: {
      type: Boolean,
      default: true,
    },
  },
  components: {
    Button,
  },
  data: () => ({
    text: '',
    sending: null,
    error: null,
    emojiArray: ['\u{1F600}', '\u{1F603}', '\u{1F604}', '\u{1F601}',
      '\u{1F970}', '\u{1F60D}', '\u{1F929}', '\u{1F60B}',
      '\u{1F61B}', '\u{1F917}', '\u{1F92D}', '\u{1F910}',
      '\u{1F928}', '\u{1F637}', '\u{1F60E}', '\u{1F615}',
      '\u{1F61F}', '\u{1F633}', '\u{1F629}', '\u{1F621}',
      '\u{1F608}', '\u{1F47F}', '\u{1F620}', '\u{1F92C}'],
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
    insertEmoji(idx) {
      this.text += this.emojiArray[idx];
    },
  },
};
</script>
