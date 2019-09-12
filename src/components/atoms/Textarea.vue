<template>
    <div class="poll__discussion-reply-wrapper">
        <textarea class="poll__discussion-reply-form-textarea"/>
        <Button class="poll__discussion-reply-send-button" value="Send"/>
    </div>
</template>

<script>
import Button from '@/components/atoms/Button.vue'

export default {
  name: 'Textarea',
  components: {
    Button
  }
};
</script>

<style scoped>
.poll__discussion-reply-wrapper {
  grid-template-columns: 1fr;
  display: grid;
}

.poll__discussion-reply-form-textarea {
  height: 100px;
  border: 1px solid black;
  resize: none;
}

.poll__discussion-reply-send-button {
  margin-top: 20px;
}

@media all and (min-width: 850px) {
  .poll__discussion-reply-wrapper {
    grid-template-columns: 1fr 0.4fr;
    width: 50%;
  }
  .poll__discussion-reply-form-textarea {
    grid-column: 1 / span 2
  }

  .poll__discussion-reply-send-button {
    grid-column: 2 / span 2;
  }
}
</style>
