<template>
<div class="share-links-wrap">
  <div class="share-box">
    <b-button @click="shareLink('twitter')" class="p-0" v-html="twitter" variant="transparent" />
    <b-button @click="shareLink('facebook')" class="p-0" v-html="facebook" variant="transparent" />
    <b-button @click="shareLink('messenger')" class="p-0" v-html="messenger" variant="transparent" />
    <b-button @click="shareLink('whatsapp')" class="p-0" v-html="whatsapp" variant="transparent" />
    <b-button @click="shareLink('email')" class="p-0" v-html="email" variant="transparent" />
  </div>
</div>
</template>

<script>
import { BButton } from 'bootstrap-vue';

export default {
  name: 'share_link',
  components: {
    BButton,
  },
  props: {
    item: Object,
  },
  data() {
    return {
      email: '<svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24"><path d="M12 .02c-6.627 0-12 5.373-12 12s5.373 12 12 12 12-5.373 12-12-5.373-12-12-12zm6.99 6.98l-6.99 5.666-6.991-5.666h13.981zm.01 10h-14v-8.505l7 5.673 7-5.672v8.504z"/></svg>',
      facebook: '<svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24"><path d="M12 0c-6.627 0-12 5.373-12 12s5.373 12 12 12 12-5.373 12-12-5.373-12-12-12zm3 8h-1.35c-.538 0-.65.221-.65.778v1.222h2l-.209 2h-1.791v7h-3v-7h-2v-2h2v-2.308c0-1.769.931-2.692 3.029-2.692h1.971v3z"/></svg>',
      messenger: '<svg width="24" height="24" xmlns="http://www.w3.org/2000/svg" fill-rule="evenodd" clip-rule="evenodd"><path d="M12 0c-6.626 0-12 5.372-12 12 0 6.627 5.374 12 12 12 6.627 0 12-5.373 12-12 0-6.628-5.373-12-12-12zm0 5.5c-3.866 0-7 2.902-7 6.481 0 2.04 1.018 3.86 2.609 5.048v2.471l2.383-1.308c.636.176 1.31.271 2.008.271 3.866 0 7-2.902 7-6.482 0-3.579-3.134-6.481-7-6.481zm.696 8.728l-1.783-1.901-3.478 1.901 3.826-4.061 1.826 1.901 3.435-1.901-3.826 4.061z"/></svg>',
      twitter: '<svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24"><path d="M12 0c-6.627 0-12 5.373-12 12s5.373 12 12 12 12-5.373 12-12-5.373-12-12-12zm6.066 9.645c.183 4.04-2.83 8.544-8.164 8.544-1.622 0-3.131-.476-4.402-1.291 1.524.18 3.045-.244 4.252-1.189-1.256-.023-2.317-.854-2.684-1.995.451.086.895.061 1.298-.049-1.381-.278-2.335-1.522-2.304-2.853.388.215.83.344 1.301.359-1.279-.855-1.641-2.544-.889-3.835 1.416 1.738 3.533 2.881 5.92 3.001-.419-1.796.944-3.527 2.799-3.527.825 0 1.572.349 2.096.907.654-.128 1.27-.368 1.824-.697-.215.671-.67 1.233-1.263 1.589.581-.07 1.135-.224 1.649-.453-.384.578-.87 1.084-1.433 1.489z"/></svg>',
      whatsapp: '<svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24"><path d="M12.031 6.172c-3.181 0-5.767 2.586-5.768 5.766-.001 1.298.38 2.27 1.019 3.287l-.582 2.128 2.182-.573c.978.58 1.911.928 3.145.929 3.178 0 5.767-2.587 5.768-5.766.001-3.187-2.575-5.77-5.764-5.771zm3.392 8.244c-.144.405-.837.774-1.17.824-.299.045-.677.063-1.092-.069-.252-.08-.575-.187-.988-.365-1.739-.751-2.874-2.502-2.961-2.617-.087-.116-.708-.94-.708-1.793s.448-1.273.607-1.446c.159-.173.346-.217.462-.217l.332.006c.106.005.249-.04.39.298.144.347.491 1.2.534 1.287.043.087.072.188.014.304-.058.116-.087.188-.173.289l-.26.304c-.087.086-.177.18-.076.354.101.174.449.741.964 1.201.662.591 1.221.774 1.394.86s.274.072.376-.043c.101-.116.433-.506.549-.68.116-.173.231-.145.39-.087s1.011.477 1.184.564.289.13.332.202c.045.072.045.419-.1.824zm-3.423-14.416c-6.627 0-12 5.373-12 12s5.373 12 12 12 12-5.373 12-12-5.373-12-12-12zm.029 18.88c-1.161 0-2.305-.292-3.318-.844l-3.677.964.984-3.595c-.607-1.052-.927-2.246-.926-3.468.001-3.825 3.113-6.937 6.937-6.937 1.856.001 3.598.723 4.907 2.034 1.31 1.311 2.031 3.054 2.03 4.908-.001 3.825-3.113 6.938-6.937 6.938z"/></svg>',
    };
  },
  methods: {
    async shareLink(service) {
      const currentPath = this.$route.fullPath;
      const body = {
        itemId: this.item._id,
        service,
        path: currentPath,
        // path: `/anketa/${this.item.info.slug}`,
      };
      const response = await this.$store.dispatch('SHARE_LINK', body);
      const { data } = response.data;
      window.location.href = data;
    },
  },
};
</script>
<style scoped>
.share-links-wrap{
  margin: 0 auto;
  position: fixed;
  top: 40%;
  bottom: 40%;
  transform: translate(-55px, -50%);
  z-index:1;
}
.share-box{
  left: 15px;
  width: 40px;
  top: 190px;
  text-align: center;
  background: #fff;
  border: 1px solid #ddd;
  flex-direction: column;
  justify-content: center;
  border-radius: 4px;
  font-size: 12px;
  box-shadow: none;
  background: white;
  z-index: 100;
  padding-top: 3px;
}
.share-box button{ width:100%; text-align:center; display:block; margin-bottom: 5px; border-bottom:1px solid #ddd;border-radius: 0;}
.share-box button:last-child{
  border-bottom: 0; margin-bottom: 0;
}
.share-box button.p-0{color:#AEB3B7; fill:#AEB3B7; box-shadow: none; padding-bottom: 4px!important; }
.share-box button.p-0:hover{color:#b9cbda; fill:#b9cbda; box-shadow: none; }

@media (max-width: 1235px) {
  .share-links-wrap{
    transform: translate(-45px, -50%);
  }
  .share-box button.p-0 svg{ font-size: 20px; width:20px; height: 20px;}
}
@media (max-width: 992px) {
  .share-box{
    right: 0px;
    width: 36px;
    left: unset;
  }
  .share-box svg{ width: 20px;}
  .share-links-wrap{
    right: 0;
    left:unset;
    transform: translate(-0px, -50%);
  }
}

</style>
