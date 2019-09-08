<template>
    <div>
        <hr />
        <h2 id="home__heading-title">
            "Slow car blocks the lane and its driver refuses to switch lanes"
        </h2>
        <div id="home__heading-metadata">
            <ul id="home__heading-metadata-details">
            <li>30.07.2018</li>
            <li>Leoś</li>
            <li>53 votes</li>
            <li>290 comments</li>
            </ul>
            <ul id="home__heading-metadata-social">
            <li>(Facebook) Like | Share</li>
            <li>Twitter Share</li>
            </ul>
        </div>
        <hr />
    </div>
</template>

<script>
export default {
  name: 'Heading',
  components: {
  },
  data: () => ({
  }),
  methods: {
  },
};
</script>


<style lang="scss">
#home__heading-title {
  font-size: 34px;
  line-height: 32px;
}

#home__heading-metadata {
  display: grid;
  grid-template-columns: 1fr 1fr;
}

#home__heading-metadata-social {
  text-align: right;
}

#home__heading-metadata ul {
  list-style: none;
  padding: 0;
}

#home__heading-metadata li {
  display: inline-block;
}

#home__heading-metadata li:after {
  content: '\b7\a0';
  padding: 0 10px 0 10px;
}

#home__heading-metadata li:last-child:after {
  content: '';
}
</style>
