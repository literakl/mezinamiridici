<template>
  <div class="mb-2">
    <b-btn-close @click="dismiss"></b-btn-close>
    <b-form-textarea v-model="text"></b-form-textarea>
    <b-alert v-model="error" variant="danger" dismissible>
      {{ $t('generic.internal-error') }}
    </b-alert>
    <Button :disabled="sending" class="mt-2" size="sm" :value="$t('poll.send-button')" @clicked="send"/>
  </div>
</template>

<script>
import Button from '@/components/atoms/Button.vue';

export default {
  name: 'CommentForm',
  props: {
    itemId: String,
    parent: String,
  },
  components: {
    Button,
  },
  data: () => ({
    text: null,
    sending: null,
    error: null,
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
      } catch (e) {
        console.log(e);
        this.error = true;
      }
      this.sending = false;
    },
  },
};
</script>
