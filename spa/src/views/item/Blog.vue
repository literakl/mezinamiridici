<template>
  <div class="pt-3 w-75 m-auto pb-5">
    <h1>{{title}}</h1>
    <div v-html="blogHtml"></div>
    <ShareLink :item="blog" />
    <Comments v-if="blog.type==='content'" :itemId="blog._id" />
  </div>
</template>

<script>
import Comments from '@/components/organisms/Comments.vue';
import ShareLink from '@/components/molecules/ShareLink.vue';

export default {
  name: 'blog',
  components: {
    Comments,
    ShareLink,
  },
  props: {
    slug: String,
  },
  data() {
    return {
      blogHtml: '',
    };
  },
  watch: {
    blog() {
      this.setContent(this.blog.data.content);
    },
  },
  computed: {
    blog() {
      return this.$store.getters.BLOG;
    },
    title() {
      let txt = '';
      if (this.blog !== null) {
        txt = this.blog.info.caption;
      }
      return txt;
    },
  },
  created() {
    this.$store.dispatch('FETCH_BLOG', { slug: this.slug });
  },
  methods: {
    setContent(html) {
      this.blogHtml = html;
    },
  },
};
</script>
<style>
  img {
    width:100%;
  }
  blockquote {
    display: block;
    margin-top: 1em;
    margin-bottom: 1em;
    margin-left: 40px;
    background-color: whitesmoke;
    padding: 20px;
    font-style: italic;
    overflow-wrap: anywhere;
  }
  blockquote p {
    font-style: normal;
    font-weight: bold;
  }

  table {
      width: 100%;
      height: 100%;
      border-collapse: collapse;
      table-layout: fixed;
  }
  table {
      border: 1px solid #DBDBE2;
      border-radius: 3px;
      position: relative;
      height: 100%;
      width: 100%;
      box-sizing: border-box;
  }
  td {
      border: 1px solid #DBDBE2;
      padding: 0;
      vertical-align: top;
  }
  td div{
      padding: 10px;
      height: 100%;
  }
  .tc-table__inp {
      outline: none;
      flex-grow: 100;
      min-height: 1.5em;
      height: 100%;
      overflow: hidden;
  }
  tbody tr:first-child td {
      border-top: none;
  }
  tbody tr:last-child td {
      border-bottom: none;
  }
  tbody tr td:last-child {
      border-right: none;
  }
  tbody tr td:first-child {
      border-left: none;
  }
</style>
