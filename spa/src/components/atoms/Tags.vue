<template>
  <b-container>
      <b-col sm="auto">
        <b-card no-body tag="article" :title="title" class="text-center" >
            <div>
              <b-button v-for="tag in tags" :key="tag"
               squared v-bind:class="{'active':tag==cTag}"
               variant="link"
               @click="viewPollByTag(tag)" size="lg">
                #{{tag}}
              </b-button>
            </div>

        </b-card>
      </b-col>
  </b-container>
</template>

<script>

export default {
  name: 'Tags',
  props: {
    cTag: String,
    tags: Array,
    title: String,
  },
  methods: {
    viewPollByTag(tag) {
      if (this.cTag !== tag) this.$emit('clicked', tag);
    },
  },
};
</script>
