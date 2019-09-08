<template>
    <div id="poll__wrapper">
        <div>
          <Heading />
          <h2>Your vote</h2>
          <div>Chart will go here</div>
          <Button value="Analyze votes" />
          
          <div>
            <h2>Discussion (440)</h2>
            <p>What do you want to say about it?</p>
            <form>
              <textarea />
              <Submit value="Send" />
            </form>
          </div>

          <hr />

          <h2><router-link to="/polls">Other polls</router-link></h2>
        </div>
    </div>
</template>

<script>
import Heading from '@/components/molecules/Heading.vue'
import Button from '@/components/atoms/Button.vue'
import Submit from '@/components/atoms/Submit.vue'

export default {
  name: 'poll',
  components: {
    Heading,
    Button,
    Submit
  },
};
</script>

<style>
#poll__wrapper {
    grid-template-columns: 1fr;
    display: grid;
    margin: 0 auto;
    max-width: 80%;
    padding: 1em 0;
    grid-gap: 20px;
}

@media all and (min-width: 850px) {
  #poll__wrapper {
    grid-template-columns: 1fr 0.2fr;
  }
}
</style>
