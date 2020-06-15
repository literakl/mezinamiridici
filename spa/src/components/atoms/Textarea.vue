<template>
  <div>
    <b-form-textarea v-model="text"></b-form-textarea>
    <Button :disabled="sending" class="mt-3" value="Send" @clicked="send"/>
  </div>
</template>

<script>
import Button from '@/components/atoms/Button.vue';

export default {
  name: 'Textarea',
  props: {
    id: String,
    parent: String,
  },
  components: {
    Button,
  },
  data: () => ({
    text: null,
    sending: null,
  }),
  methods: {
    async send() {
      this.sending = true;

      const payload = {
        id: this.id,
        text: this.text,
      };

      if (this.parent) {
        payload.parent = this.parent;
      }

      await this.$store.dispatch('COMMENT', payload);
      this.$store.dispatch('GET_POLL_COMMENTS', { id: this.id, reset: true });
      this.sending = false;
      this.text = '';
    },
  },
};
</script>
