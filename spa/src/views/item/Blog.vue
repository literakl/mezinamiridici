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
  computed: {
    blog() {
      return this.$store.getters.BLOG;
    },
    blogHtml() {
      let txt = '';
      if (this.blog !== null) {
        txt = this.blog.data.content;
      }
      return txt;
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
};
</script>
<style>
  blockquote {
    display: block;
    margin-top: 1em;
    margin-bottom: 1em;
    margin-left: 40px;
    background-color: whitesmoke;
    padding: 20px;
    font-style: italic;
  }
  blockquote p {
    font-style: normal;
    font-weight: bold;
  }
  .tc-table {
      width: 100%;
      height: 100%;
      border-collapse: collapse;
      table-layout: fixed;
  }
  .tc-table__wrap {
      border: 1px solid #DBDBE2;
      border-radius: 3px;
      position: relative;
      height: 100%;
      width: 100%;
      box-sizing: border-box;
  }
  .tc-table__cell {
      border: 1px solid #DBDBE2;
      padding: 0;
      vertical-align: top;
  }
  .tc-table__area {
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
  .tc-table tbody tr:first-child td {
      border-top: none;
  }
  .tc-table tbody tr:last-child td {
      border-bottom: none;
  }
  .tc-table tbody tr td:last-child {
      border-right: none;
  }
  .tc-table tbody tr td:first-child {
      border-left: none;
  }
  img {
    width:100%;
  }
  .ce-delimiter {
    line-height: 1.6em;
    width: 100%;
    text-align: center;
  }
  .ce-delimiter:before {
    display: inline-block;
    content: "***";
    font-size: 30px;
    line-height: 65px;
    height: 30px;
    letter-spacing: 0.2em;
  }
</style>
