<template>
  <div class="pt-3 w-75 m-auto">
    <h1>{{ $t('poll.forms.new-poll-heading') }}</h1>

    <PollForm :isCreate="true"/>
  </div>
</template>

<script>

import PollForm from '@/components/organisms/PollForm.vue';

export default {
  components: {
    PollForm,
  },
};
</script>
