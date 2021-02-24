<template>
  <div class="m-auto item-div item-hover">
    <router-link :to="link">
      <b-img :src="item.info.picture"></b-img>
    </router-link>
    <div class="overlap-actions">
      <!-- Item box Result Bars  -->
      <div class="result-bars">
        <span class="no-prob"></span>
        <span class="trival-trouble"></span>
        <span class="donot-like"></span>
      </div>
      <span class="data"><Date :date="item.info.date" format="dynamicDate" /></span>
    </div>
    <h4>
      <router-link :to="link">
        {{ item.info.caption }}
      </router-link>
    </h4>
    <div class="py-2 px-2 item-footer">
      <div class="bottom-links">
      <template v-if="showAuthor"><span><BIconPersonCircle></BIconPersonCircle> <ProfileLink :profile="item.info.author"/></span></template>
      <template v-if="item.type === 'poll'">{{ $t('poll.votes') }}: {{item.votes_count}}</template>
      <template v-if="hasDiscussion">
        <span><BIconChatTextFill></BIconChatTextFill> <router-link :to="commentLink">
          {{item.comments.count}}
        </router-link></span>
      </template>
      </div>
    </div>
  </div>
</template>

<script>
import Date from '@/components/atoms/Date.vue';
import ProfileLink from '@/components/molecules/ProfileLink.vue';
import { deepCopy } from '@/utils/api';
import { BImg, BIconPersonCircle, BIconChatTextFill } from 'bootstrap-vue';

export default {
  name: 'ItemBox',
  components: {
    Date,
    ProfileLink,
    BImg,
    BIconPersonCircle,
    BIconChatTextFill,
  },
  props: {
    item: Object,
  },
  data() {
    return {
      lastCommentDate: '',
    };
  },
  computed: {
    link() {
      if (this.item.type === 'poll') {
        return { name: 'poll', params: { slug: this.item.info.slug } };
      }
      if (this.item.type === 'blog') {
        return { name: 'blog', params: { slug: this.item.info.slug, id: this.item.info.author.id } };
      }
      if (this.item.type === 'page') {
        return { name: 'page', params: { slug: this.item.info.slug } };
      }
      return { name: 'home' };
    },
    commentLink() {
      const route = deepCopy(this.link);
      route.hash = '#comments';
      return route;
    },
    showAuthor() {
      return this.item.type !== 'poll';
    },
    hasDiscussion() {
      return this.item.type === 'poll' || this.item.type === 'blog';
    },
  },
};
</script>
<style scoped>

.item-div {
  border-color: #f1f1f1;
  border-style: solid;
  box-shadow: #c1c1c1 1px 1px 10px;

  border: 0;
}
.item-hover {
  cursor:pointer;
  transition: 0.2s ease;
}
.item-hover:hover {
  transform: translateX(-2px) translateY(-2px) scale(1.03);
}
.item-div img {
  box-shadow: var(--big-shadow);
  border: 5px solid #fff;
  width: 100%;
}
.item-div h4 {
  text-align: center;
  height: 55px;
  margin: 0;
  overflow: hidden;
}
.item-footer{
  position: relative;
}
.item-div:hover h4, .item-footer {
    width: 100%;
    bottom: 0;
}
.item-div h4 a {
  color: var(--dark-color);
  text-align: center;
  font-size: 16px;
  padding: 16px 10px 18px 10px;
  display: block;
  display: flex;
  align-items: flex-start;
  justify-content: flex-start;
  text-align: left;
  text-overflow: ellipsis;
}
.item-div h4 a:hover {
  text-decoration: none;
}
.overlap-actions{
  position: relative;
}
/* Item box Results Bars for Home infinite posts */
.result-bars{
  position: absolute;
  display: block;
  width: 100%;
  top: -35px;
  left:5px;
}
.result-bars span{
  margin-top: 1px;
}

.no-prob{
  height: 9px;
  background: rgb(191 229 200);
  width: 7%;
  left: 5px;
  border-radius: 0 6px 6px 0;
  display: block;
}

.trival-trouble{
  height: 9px;
  background: rgb(179 216 255);
  width: 4.5%;
  left: 5px;
  border-radius: 0 6px 6px 0;
  display: block;
}
.donot-like{
  height: 9px;
  background: rgb(255 237 181/1);
  width: 10.5%;
  left: 5px;
  border-radius: 0 6px 6px 0;
  display: block;
}
span.data {
  position: absolute;
  right: 0px;
  font-size: 12px;
  font-weight: 400;
  right: 0;
  background: #fff;
  padding: 0px 10px;
  color:#777A7C;
  top:-20px;
}
.item-footer:hover span.data{
  opacity: 1;
}
.bottom-links{
  display: flex;
  width: 100%;
  justify-content: space-between;
  font-weight: 400;
  font-size: 14px;
  border-top: 1px solid #ddd;
  align-items: center;
  padding-top: 10px;
}

@media (min-width: 1920px) {
  span.data{
    top: -20px;
  }
  .item-footer span.data span{
    font-size: 13px!important;
  }
  .bottom-links span svg{
    font-size: 20px;
  }
  .item{
    width: 400px;
  }
}
@media (max-width: 767px) {
  .item-div h4 {
    height: auto;
}
}
</style>
