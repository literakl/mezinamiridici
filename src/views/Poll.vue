<template>
    <div id="poll__wrapper">
        <div id="poll__ads">
          Ads
        </div>
        <div id="poll_content">
          <Heading />
          <div>
            <div id="poll__chart-wrapper">
              <h2 class="poll__chart-wrapper-vote">
                Your vote: 
                <span class="vote-text">I don't like it</span>
              </h2>
              <div class="poll__chart-wrapper-bar-chart">
                <BarChart />
              </div>
              <Button class="poll__chart-wrapper-analyze-votes-button" value="Analyze votes" />
            </div>
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
    </div>
</template>

<script>
import Heading from '@/components/molecules/Heading.vue'
import BarChart from '@/components/molecules/BarChart.vue'
import Button from '@/components/atoms/Button.vue'
import Submit from '@/components/atoms/Submit.vue'

export default {
  name: 'poll',
  components: {
    Heading,
    Button,
    Submit,
    BarChart
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

#poll__chart-wrapper {
  grid-template-columns: 1fr 1fr 1fr 1fr;
  display: grid;
  padding: 1em 0;
  grid-gap: 20px;
}

.poll__chart-wrapper-vote {
  grid-column: 1 / span 4
}

.poll__chart-wrapper-bar-chart {
  grid-column: 1 / span 4;
  margin: 0 auto;
}

.poll__chart-wrapper-analyze-votes-button {
  grid-column: 1 / span 4;
  margin: 0 auto;
}

#poll_content {
  order: 2;
}

#poll__ads {
  height: 100%;
  background: grey;
  order: 1;
}

.vote-text {
  color: red;
}

@media all and (min-width: 850px) {
  #poll__wrapper {
    grid-template-columns: 1fr 0.2fr;
  }

  #poll_content {
    order: 1;
  }

  #poll__ads {
    order: 2;
  }
}
</style>
