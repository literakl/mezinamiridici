<template>
  <b-container>
      <b-col sm="auto">
        <b-table
          id="items-view"
          :items="items"
          :per-page="perPage"
          :current-page="currentPage"
          small
          :fields="fields"
          :borderless="true"
          thead-class="thead-invisible"
        >
        <template v-slot:cell(link)="data">
          <router-link :to="{ name: 'poll', params: { slug: data.item.info.slug }}">
            {{data.item.info.caption}}
          </router-link>
          {{ $t('poll.votes') }}: {{data.item.votes_count}}
        </template>
        </b-table>
      </b-col>
      <b-pagination
        v-model="currentPage"
        :total-rows="rows"
        :per-page="perPage"
        aria-controls="items-view"
        align="center"
      ></b-pagination>
  </b-container>
</template>

<!-- TODO unused, remove -->
<script>
export default {
  name: 'Items',
  props: {
    items: Array,
  },
  data() {
    return {
      perPage: 2,
      currentPage: 1,
      fields: [
        'link',
      ],
    };
  },
  computed: {
    rows() {
      return this.items.length;
    },
  },
};
</script>
<style>
  .thead-invisible{
    display: none;
  }
</style>
