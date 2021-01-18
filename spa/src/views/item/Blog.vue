<template>
  <div v-if="blog" class="pt-3 w-75 m-auto pb-5">
    <div class="post-details-wrap">

     <div class="post-details">
        <span><BIconCalendarRange scale="1"></BIconCalendarRange><Date :date="blog.info.date" format="dynamicDate" /></span>
        <span><BIconPersonCircle scale="1"></BIconPersonCircle><ProfileLink :profile="blog.info.author"/></span>
        <span><BIconChatTextFill scale="1"></BIconChatTextFill><a href="#comments">
          {{ $t('comment.comments') }}: {{blog.comments.count}}
        </a></span>
      </div>
      <h2>{{title}}</h2>
    </div>
    <div style="overflow-x:auto;">
      <div class="gredient-gray p3" v-html="blogHtml"></div>
    </div>
    <ShareLink :item="blog" />
    <Comments :itemId="blog._id" />
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
.post-details-wrap{
  display: flex;
  width: 100%;
  flex-direction: column;
  flex-flow: column-reverse;
  -moz-box-shadow: inset 0 0 10px #fffcf3;
  -webkit-box-shadow: inset 0 0 10px #fffcf3;
  box-shadow: inset 0px 10px 10px #fffcf3;
}
.post-details-wrap .post-details{
 width: 100%;
    display: flex;
    /* flex-direction: column; */
    font-size: 14px;
    border-top: 1px solid #f3f3f3;
    border-bottom: 1px solid #f3f3f3;
    border-radius: 0px;
}
.post-details span{
  padding: 5px 8px;
}
.post-details svg{
  font-size: 16px;
}
.post-details span:last-child{
  border: 0;
}
.post-details span span{ border: 0; padding: 0;}
.post-details span svg{
    color: var(--text-color-light);
    margin-right: 10px;
}
  img {
    /* width:100%; */
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

.gredient-gray table{
  font-size: 14px;
}
.gredient-gray h2, .gredient-gray h3{
  font-size: 22px;
}
  table {
      border: 1px solid #DBDBE2;
      border-radius: 3px;
      position: relative;
      height: 100%;
      width: 100%;
      box-sizing: border-box;
      font-size: 14px;
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
    @media (min-width: 1920px) {
    .gredient-gray table{ font-size: 18px!important; overflow-x: auto; border: red 1px solid;}

}
</style>
