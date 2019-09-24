<template>
    <PaginatedTopPolls />
</template>

<script>
import Button from '@/components/atoms/Button.vue';
import PaginatedTopPolls from '@/components/organisms/PaginatedTopPolls.vue';

export default {
  name: 'poll',
  components: {
    PaginatedTopPolls,
  },
};
</script>
