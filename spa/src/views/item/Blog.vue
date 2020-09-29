<template>
  <div class="pt-3 w-75 m-auto pb-5">
    <h1>{{title}}</h1>
    <div v-html="blogHtml"></div>
  </div>
</template>

<script>


export default {
  name: 'blog',
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
</style>
