<template>
  <div>
    <div id="poll__wrapper">
      <div id="poll__ads">
        Ads
      </div>

      <div id="poll_content">
        <Heading />

        <div v-if="vote">
          <div id="poll__chart-wrapper">
            <h2 id="poll__chart-wrapper-vote">
              Your vote: 
              <span id="vote-text">{{vote}}</span>
            </h2>

            <div id="poll__chart-wrapper-bar-chart">
              <BarChart v-bind:voted="vote" />
            </div>

            <Button class="poll__chart-wrapper-analyze-votes-button" value="Analyze votes" />
          </div>
        </div>

        <div v-if="!vote">
          <OpinionButtons @voted="voted" />
        </div>
      </div>
    </div>

    <div id="poll__discussion-break-out">
      <div id="poll__discussion-wrapper">
        <h2>Discussion (440)</h2>
        <h3>What do you want to say about it?</h3>

        <form id="poll_discussion_form">
          <textarea />
          <Submit class="poll__discussion-send-button" value="Send" />
        </form>

        <div id="comment__parent">
          <h4>Franta Jelen, today  12:26</h4>
          <p>Lorem ipsum dolor sit amet consectetur adipisicing elit. Provident, ut.</p>
          <div>
            +1 / -1 + - Reply
          </div>
          <div id="comment_child">
            <h4>Franta Jelen, today  12:26</h4>
            <p>Lorem ipsum dolor sit amet consectetur adipisicing elit. Provident, ut.</p>
            <div>
              +1 / -1 + - Reply
            </div>
            <div id="comment_child">
              <h4>Franta Jelen, today  12:26</h4>
              <p>Lorem ipsum dolor sit amet consectetur adipisicing elit. Provident, ut.</p>
              <div>
                +1 / -1 + - Reply
              </div>
                <div id="comment_child">
                <h4>Franta Jelen, today  12:26</h4>
                <p>Lorem ipsum dolor sit amet consectetur adipisicing elit. Provident, ut.</p>
                <div>
                  +1 / -1 + - Reply
                </div>
                <div id="comment_child">
                  <h4>Franta Jelen, today  12:26</h4>
                  <p>Lorem ipsum dolor sit amet consectetur adipisicing elit. Provident, ut.</p>
                  <div>
                    +1 / -1 + - Reply
                  </div>
                </div>
              </div>
            </div>
          </div>
          <div id="comment_child">
              <h4>Franta Jelen, today  12:26</h4>
              <p>Lorem ipsum dolor sit amet consectetur adipisicing elit. Provident, ut.</p>
              <div>
                +1 / -1 + - Reply
              </div>
            </div>
        </div>

        <div id="comment__parent">
          <h4>Franta Jelen, today  12:26</h4>
          <p>Lorem ipsum dolor sit amet consectetur adipisicing elit. Provident, ut.</p>
          <div>
            +1 / -1 + - Reply
          </div>
        </div>

        <div id="poll__other-polls">
          <h2>
            <router-link to="/polls">
              <Button value="Other polls" />
            </router-link>
            <hr class="poll__double-line" />
            <hr class="poll__double-line" />
          </h2>
        </div>
      </div>
      </div>
  </div>
</template>

<script>
import Heading from '@/components/molecules/Heading.vue'
import OpinionButtons from '@/components/molecules/OpinionButtons.vue'
import BarChart from '@/components/molecules/BarChart.vue'
import Button from '@/components/atoms/Button.vue'
import Submit from '@/components/atoms/Submit.vue'

export default {
  name: 'poll',
  props: {
    vote: String
  },
  methods: {
    voted: function(vote){
      this.vote = vote;
    }
  },
  components: {
    Heading,
    Button,
    Submit,
    BarChart,
    OpinionButtons,
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

#poll__discussion-break-out {
  background: #f6f6f6;
}

#poll__discussion-wrapper {
    grid-template-columns: 1fr;
    display: grid;
    margin: 0 auto;
    max-width: 80%;
    padding: 1em 0;
}

#poll_discussion_form{
  grid-template-columns: 1fr 0.4fr;
  display: grid;
  width: 50%;
}

textarea {
  height: 100px;
  border: 1px solid black;
  resize: none;
  grid-column: 1 / span 2
}

.poll__discussion-send-button {
  grid-column: 2 / span 2;
  margin-top: 20px;
}

#poll__discussion-submit-button {
  grid-column: 2 / span 2;
  width: 100%
}


#poll__chart-wrapper-vote {
  grid-column: 1 / span 4
}

#poll__chart-wrapper-bar-chart {
  grid-column: 1 / span 4;
  margin: 0 auto;
  max-width: 80%;
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

#vote-text {
  color: red;
}

#poll__other-polls {
    grid-template-columns: 1fr;
    display: grid;
    width: 50%;
    text-align:center;
}

.poll__double-line {
  margin-top: -20px;
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

#comment_child {
  margin-left: 30px;
}
</style>
