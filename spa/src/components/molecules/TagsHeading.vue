<template>
  <b-container>
    <b-row align-v="center" align-h="center">

      <b-col sm="auto">
        <b-card tag="article">
          <b-card-body>
            <div>
              <b-button v-for="tag in tags" :key="tag"
               squared v-bind:class="{'active':tag==cTag}"
               variant="outline-primary"
               @click="viewPollByTag(tag)" size="lg"
               style="margin:3px;">
                {{tag}}
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
  name: 'TagsHeading',
  props: {
    tags: Array,
    cTag: String,
  },
  methods: {
    viewPollByTag(tag) {
      this.$router.push(`/stitky/${tag}`);
    },
  },
};
</script>
