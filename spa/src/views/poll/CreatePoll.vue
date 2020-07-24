<template>
  <div class="pt-3 w-75 m-auto">
    <h1>{{ $t('poll.forms.new-poll-heading') }}</h1>

    <PollForm  :isCreate="isNew"/>

  </div>
</template>

<script>

import PollForm from '@/views/poll/PollForm.vue';

export default {
  components: {
    PollForm,
  },
  data() {
    return {
      isNew: true,
    };
  },
};
</script>
