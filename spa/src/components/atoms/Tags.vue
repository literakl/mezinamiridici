<template>
  <b-container>
    <b-row align-v="center" align-h="center">

      <b-col sm="auto">
        <b-card tag="article">
          <b-card-body>
            <div>
              <b-button v-for="tag in tags" :key="tag"
               squared v-bind:class="{'active':tag==cTag}"
               variant="link"
               @click="viewPollByTag(tag)" size="lg"
               style="margin:3px;">
                #{{tag}}
              </b-button>
            </div>
          </b-card-body>

        </b-card>
      </b-col>

    </b-row>
  </b-container>
</template>

<script>

export default {
  name: 'Tags',
  props: {
    cTag: String,
  },
  computed: {
    tags() {
      return this.$store.getters.TAGS;
    },
  },
  created() {
    this.$store.dispatch('GET_TAGS');
  },
  methods: {
    viewPollByTag(tag) {
      if (this.cTag !== tag) this.$emit('clicked', tag);
    },
  },
};
</script>
