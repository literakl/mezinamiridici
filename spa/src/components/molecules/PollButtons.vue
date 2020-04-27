<template>
    <div>
        <h3>{{ $t('poll.your-opinion') }}</h3>
        <button
            v-on:click="voted('neutral')"
            class="opinion-poll__button opinion-poll__button__neutral"
        >
            <img src="@/assets/happy.png" align="middle">{{ $t('poll.choices.neutral') }}
        </button>
        <button
            v-on:click="voted('trivial')"
            class="opinion-poll__button opinion-poll__button-trivial"
        >
            <img src="@/assets/ok.png">{{ $t('poll.choices.trivial') }}
        </button>
        <button
            v-on:click="voted('dislike')"
            class="opinion-poll__button opinion-poll__button-dislike"
        >
            <img src="@/assets/slanty.png">{{ $t('poll.choices.dislike') }}
        </button>
        <button
            v-on:click="voted('hate')"
            class="opinion-poll__button opinion-poll__button-hate"
        >
            <img src="@/assets/angry.png">{{ $t('poll.choices.hate') }}
        </button>
    </div>
</template>

<script>
export default {
  name: 'PollButtons',
  methods: {
    voted(vote) {
      if (!this.$store.getters.IS_AUTHORIZED) {
        this.$router.push({ name: 'sign-in' });
      } else {
        this.$emit('do-vote', vote);
      }
    },
  },
};
</script>
