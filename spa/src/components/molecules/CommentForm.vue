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
          <b-col sm="12">
            <b-form-textarea
              class="textarea"
              :class="`${!wrapIcons ? 'textarea_long' : 'textarea_short'}`"
              rows="1" max-rows="8"
              :placeholder="$t('comment.write-comment-placeholder')"
              v-model="text"
            >
            </b-form-textarea>
          </b-col>
        </b-row>
      </b-container>

      <div class="icons" :class="`${wrapIcons ? 'icons_long' : 'icons_short'}`">
        <b-button :id="`emojis_${commentId}`" class="mt-2" variant="outline" size="sm">
          <b-icon icon="emoji-sunglasses"></b-icon>
        </b-button>
<!--
TODO: tato funkce vyzaduje widget, ktery rozumi HTML znackam
        <b-button v-if="parent" class="mt-2" variant="outline" size="sm">
          <b-icon icon="chat-quote"></b-icon>
        </b-button>
-->
        <b-button v-if="parent" @click="dismiss" class="mt-2" variant="outline" size="sm">
          <b-icon icon="x-circle"></b-icon>
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
import Button from '@/components/atoms/Button.vue';

export default {
  name: 'CommentForm',
  props: {
    itemId: String,
    parent: String,
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
  computed: {
    wrapIcons() {
      return this.text.length > 140;
    },
  },
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

<style scoped>
  .comment-box {
    position: relative;
    width: 100%;
  }

  .textarea {
    height: 40px;
    overflow-y: hidden;
  }

  .textarea_short {
    padding: 13px 50px 34px 32px;
  }

  .textarea_long {
    padding: 10px 174px 5px 28px;
  }

  .icons {
    position: relative;
    text-align: right;
    width: 143px;
    float: right;
  }

  .icons_short {
    top: -36px;
    right: 40px;
  }

  .icons_long {
    top: -45px;
    right: 40px; /*68*/
  }
</style>
