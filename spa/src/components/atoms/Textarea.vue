<template>
    <div class="atom__textarea-wrapper">
        <textarea class="atom__textarea-textarea" v-model="text" />
        <Button :disabled="sending" class="atom__textarea-send-button" value="Send" @clicked="send"/>
    </div>
</template>

<script>
import Button from '@/components/atoms/Button.vue';

export default {
  name: 'Textarea',
  props: {
    id: String,
    parent: String
  },
  components: {
    Button,
  },
  data: () => {
    return {
      text: null,
      sending: null
    }
  },
  methods: {
    async send(){
      this.sending = true;

      const payload = {
        id: this.id,
        text: this.text
      };

      if(this.parent) {
        payload['parent'] = this.parent;
      }

      await this.$store.dispatch("COMMENT", payload);

      this.$store.dispatch("GET_POLL_COMMENTS", {
        id: this.id
      });

      this.sending = false;
      this.text = "";
    }
  }
};
</script>

<style scoped>
.atom__textarea-wrapper {
  grid-template-columns: 1fr;
  display: grid;
}

.atom__textarea-textarea {
  height: 100px;
  border: 1px solid black;
  resize: none;
}

.atom__textarea-send-button {
  margin-top: 20px;
}

@media all and (min-width: 850px) {
  .atom__textarea-wrapper {
    grid-template-columns: 1fr 0.4fr;
    width: 50%;
  }
  .atom__textarea-textarea {
    grid-column: 1 / span 2
  }

  .atom__textarea-send-button {
    grid-column: 2 / span 2;
  }
}
</style>
