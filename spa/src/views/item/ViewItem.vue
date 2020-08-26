<template>
  <div class="m-auto item-div">

    <h4>{{title}}</h4>

    <b-img :src="picture"></b-img>

    <div class="mt-3 p-1 pl-3 item-footer">
        <p class="m-0">Create: {{itemDate}} </p>
        <p class="m-0" v-if="isBlog">{{author}} </p>
        <p class="m-0" v-if="!isBlog">{{votesCount}} Votes </p>
        <p class="m-0">{{commentsCount}} Comments </p>
        <p class="m-0" v-if="lastCommentDate">Last: {{lastCommentDate}}</p>
    </div>
  </div>
</template>

<script>

export default {
  name: 'itemView',
  props: {
    item: Object,
  },
  data() {
    return {
      title: '',
      picture: '',
      itemDate: '',
      isBlog: true,
      votesCount: null,
      commentsCount: null,
      lastCommentDate: '',
      author: '',
    };
  },
  created() {
    if (this.item !== null) {
      this.title = this.item.info.caption;
      this.picture = this.item.info.picture;
      this.itemDate = new Date(this.item.info.date).toLocaleDateString('cs-CZ');
      this.isBlog = (this.item.type === 'blog');
      this.author = this.item.info.author.nickname;
      this.votesCount = (this.item.votes_count === undefined) ? null : this.item.votes_count;
      this.commentsCount = this.item.comments.count;
      this.lastCommentDate = (this.item.comments.last === null) ? '' : new Date(this.item.comments.last).toLocaleDateString('cs-CZ');
    }
  },
};
</script>
<style scoped>
  img{
    width:100%;
  }
  .item-div {
    border-width: 10px;
    border-color: #f1f1f1;
    border-style: solid;
    box-shadow: #c1c1c1 1px 1px 10px;
  }
  .item-hover{
    cursor:pointer;
    transition: 0.2s ease;
  }
  .item-hover:hover {
    transform: translateX(-2px) translateY(-2px) scale(1.03);
  }
  .item-hover:active {
    transform: translateX(-1px) translateY(-1px) scale(1.01);
  }
  .item-div h1{
    margin: 20px;
  }
  .item-footer {
    background-color: #f1f1f1;
    font-size: 0.8em;
    color: #201f27;
    font-weight: 600;
  }
</style>
