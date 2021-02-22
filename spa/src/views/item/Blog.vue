<template>
  <div v-if="blog" class="blog-posts pt-3 m-auto">
    <div class="post-details-wrap">
        <div class="">
          <div class="hero-details">
            <h1>{{title}}</h1>
          </div>
          <div class="post-details">
            <div class="post-author"><BIconPersonCircle scale="1"></BIconPersonCircle><ProfileLink :profile="blog.info.author"/></div>
            <div class="post-time"><BIconCalendarRange scale="1"></BIconCalendarRange><Date :date="blog.info.date" format="dynamicDate" /></div>
            <div class="post-comments"><BIconChatTextFill scale="1"></BIconChatTextFill><a href="#comments">
               {{blog.comments.count}}
            </a></div>
          </div>
            <div class="post-content p3" v-html="blogHtml"></div>
             <div class="content-wrap">
            <ShareLink :item="blog" />
          <Comments :itemId="blog._id" />
          </div>
        </div>
    </div>
  </div>
</template>

<script>
import Comments from '@/components/organisms/Comments.vue';
import ShareLink from '@/components/molecules/ShareLink.vue';
import Date from '@/components/atoms/Date.vue';
import ProfileLink from '@/components/molecules/ProfileLink.vue';
import { BIconPersonCircle, BIconCalendarRange, BIconChatTextFill } from 'bootstrap-vue';

export default {
  name: 'blog',
  components: {
    Date,
    ProfileLink,
    Comments,
    ShareLink,
    BIconPersonCircle,
    BIconCalendarRange,
    BIconChatTextFill,
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
      this.blogHtml = this.blog.data.content;
      document.title = this.blog.info.caption;
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
};
</script>
<style>
.blog-posts{
  max-width: 1235px;
  margin: 0 auto;
}
.post-details-wrap{
  display: flex;
  width: 100%;
  flex-direction: column;
  flex-flow: column-reverse;
  position: relative;
}
.post-details-wrap h1{
  font-size: 21px;
  text-decoration: none;
  color: var(--dark-color);
  margin: 0px 0 10px;
}
.post-details-wrap .post-details, .post-details-wrap .hero-details{
  width: 100%;
  margin: 0 auto;
  display: flex;
  font-size: 14px;
  border-radius: 0px;
}
.post-details-wrap .post-content{
  width: 100%;
  margin: 0 auto;
}
.post-details{
  border-bottom: 1px solid #dee0e1;
  margin-bottom: 20px!important;
  padding: 0px 0px 5px;
}
.post-details span:last-child{
  border: 0;
}

.post-time, .post-author, .post-comments{
  display: flex;
  align-items: center;
  font-weight: 300;
  margin-right: 15px;
  color: #777A7C;
}
.post-details div svg{
  margin-right: 8px;
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
.post-content table thead:first-child tr{ background: #fafbf2;}

.post-content table thead tr{
 background: transparent
}
.post-content table:before{
  content: '';
  overflow-x: auto;
}
.post-content table{
  font-size: 14px;
}
.post-content h2, .post-content h3{
  font-size: 18px;
  color: var(--text-color);
}
.post-content table {
  border: 1px solid #DBDBE2;
  border-radius: 3px;
  position: relative;
  width: 100%;
  box-sizing: border-box;
  font-size: 14px;
}
.post-content table tr th {
  vertical-align: middle;
}
.post-content table tr td {
  border: 1px solid #DBDBE2;
  vertical-align: middle;
}
td div{
  padding: 10px;
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

@media (max-width: 1235px) {
  .post-details-wrap{
    padding: 0 35px;
  }
}
</style>
