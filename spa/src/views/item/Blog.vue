<template>
  <div class="pt-3 w-75 m-auto pb-5">

    <h1>{{title}}</h1>

    <div v-html="blogHtml"></div>

    <b-img thumbnail :src="picture" class="item-thumb"></b-img>
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
    picture() {
      let path = '';
      if (this.blog !== null) {
        path = this.blog.info.picture;
      }
      return path;
    },
  },
  created() {
    this.$store.dispatch('FETCH_BLOG', { slug: this.slug });
  },
};
</script>
<style>
  .item-thumb {
    width:200px;
    height:120px;
    box-shadow: grey 2px 2px 10px;
  }
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

  .cdx-checklist__item {
      display: flex;
      padding: 0 10px;
      box-sizing: content-box;
  }
  .cdx-checklist__item-text {
      outline: none;
      flex-grow: 1;
      padding: 10px 0;
  }
  .cdx-checklist__item-checkbox {
      display: inline-block;
      flex-shrink: 0;
      position: relative;
      width: 20px;
      height: 20px;
      margin: 10px 10px 10px 0;
      border-radius: 50%;
      border: 1px solid #d0d0d0;
      background: #fff;
      cursor: initial !important;
      user-select: none;
  }
  .cdx-checklist__item-checkbox:hover {
      border-color: #b5b5b5;
  }
  .cdx-checklist__item-checkbox::after {
      position: absolute;
      top: 5px;
      left: 5px;
      width: 8px;
      height: 5px;
      border: 2px solid #fcfff4;
      border-top: none;
      border-right: none;
      background: transparent;
      content: '';
      opacity: 0;
      transform: rotate(-45deg);
  }
  .cdx-checklist__item--checked .cdx-checklist__item-checkbox {
      background: #388ae5;
      border-color: #388ae5;
  }
  .cdx-checklist__item--checked .cdx-checklist__item-checkbox:hover {
      background: #307cd1;
  }
  .cdx-checklist__item--checked .cdx-checklist__item-checkbox::after {
      opacity: 1;
  }

  .cdx-rawhtml {
      min-height: 200px;
      resize: vertical;
      border-radius: 5px;
      background-color: #1e2128;
      font-family: Menlo, Monaco, Consolas, Courier New, monospace;
      font-size: 10px;
      line-height: 1.8;
      letter-spacing: -0.2px;
      color: #9ca3b3;
  }
  .cdx-rawhtml-input {
      border: 1px solid rgba(201,201,204,.48);
      -webkit-box-shadow: inset 0 1px 2px 0 rgba(35,44,72,.06);
      box-shadow: inset 0 1px 2px 0 rgba(35,44,72,.06);
      border-radius: 3px;
      padding: 10px 12px;
      outline: none;
      width: 100%;
      -webkit-box-sizing: border-box;
      box-sizing: border-box;
  }

</style>
