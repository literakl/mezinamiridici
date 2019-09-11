<template>
  <div>
    <div class="poll__wrapper">
      <div class="poll__ads">
        Ads
      </div>

      <div class="poll_content">
        <Heading />
        <div v-if="mutableVote">
          <div class="poll__chart-wrapper">
            <h2 class="poll__chart-wrapper-vote">
              Your vote: 
              <span class="vote-text">{{mutableVote}}</span>
            </h2>

            <div class="poll__chart-wrapper-bar-chart">
              <BarChart v-bind:voted="mutableVote" />
            </div>

            <router-link :to="{ name: 'analyze-votes', params: { id: this.id }} " class="poll__chart-wrapper-analyze-votes-button" >
              <Button value="Analyze votes" />
            </router-link>
          </div>
        </div>

        <div v-if="!mutableVote">
          <OpinionButtons @voted="voted" />
        </div>
      </div>
    </div>

    <div class="poll__discussion-break-out">
      <div class="poll__discussion-wrapper">
        <h2>Discussion ({{comments.length}})</h2>
        <h3>What do you want to say about it?</h3>

        <form class="poll_discussion_form">
          <textarea />
          <Submit class="poll__discussion-send-button" value="Send" />
        </form>

        <Comments :comments="comments" :depth="parseInt(0)" />

        <div class="poll__other-polls">
          <h2>
            <router-link to="/polls">
              <Button value="Other polls" class="poll__other-polls-button" />
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
import BarChart from '@/components/molecules/charts/BarChart.vue'
import Button from '@/components/atoms/Button.vue'
import Submit from '@/components/atoms/Submit.vue'
import Comments from '@/components/organisms/Comments.vue'

export default {
  name: 'poll',
  props: {
    id: String,
    vote: String
  },
  data: function() {
    return {
        mutableVote: this.vote,
        comments: [
          {
            id: 1,
            name: "Franta Jelen",
            date: "today  12:26",
            title: "Lorem ipsum dolor sit amet consectetur adipisicing elit. Provident, ut.",
            votes: 1,
            comments: [
              {
                id: 2,
                name: "Parent Child",
                date: "yesterday  12:26",
                title: "Lorem ipsum dolor sit amet consectetur adipisicing elit. Provident, ut.",
                votes: 100,
                comments: [
                  {
                    id: 3,
                    name: "Parent Child Child",
                    date: "yesterday  12:26",
                    title: "Lorem ipsum dolor sit amet consectetur adipisicing elit. Provident, ut.",
                    votes: 2,
                    comments: [
                      {
                        id: 4,
                        name: "Parent Child Child Child",
                        date: "yesterday  12:26",
                        title: "Lorem ipsum dolor sit amet consectetur adipisicing elit. Provident, ut.",
                        votes: 2,
                        comments: [
                          {
                            id: 5,
                            name: "Parent Child Child",
                            date: "yesterday  12:26",
                            title: "Lorem ipsum dolor sit amet consectetur adipisicing elit. Provident, ut.",
                            votes: 2,
                            comments: [
                              {
                                id: 5,
                                name: "Parent Child Child",
                                date: "yesterday  12:26",
                                title: "Lorem ipsum dolor sit amet consectetur adipisicing elit. Provident, ut.",
                                votes: 2,
                                comments: [
                                  {
                                    id: 5,
                                    name: "Parent Child Child",
                                    date: "yesterday  12:26",
                                    title: "Lorem ipsum dolor sit amet consectetur adipisicing elit. Provident, ut.",
                                    votes: 2,
                                  }
                                ] 
                              }
                            ]
                          }
                        ]
                      }
                    ]
                  }
                ]
              }
            ]
          },
          {
            id: 1,
            name: "Hello World",
            date: "yesterday  12:26",
            title: "Lorem ipsum dolor sit amet consectetur adipisicing elit. Provident, ut.",
            votes: 7,
            downvotes: 3,
          }
        ]
    };
  },
  methods: {
    voted: function(vote){
      this.mutableVote = vote;
    }
  },
  components: {
    Heading,
    Button,
    Submit,
    BarChart,
    OpinionButtons,
    Comment,
    Comments
  },
};
</script>

<style>
.poll__wrapper {
    grid-template-columns: 1fr;
    display: grid;
    margin: 0 auto;
    max-width: 80%;
    padding: 1em 0;
    grid-gap: 20px;
}

.poll__chart-wrapper {
  grid-template-columns: 1fr 1fr 1fr 1fr;
  display: grid;
  padding: 1em 0;
  grid-gap: 20px;
}

.poll__discussion-break-out {
  background: #f6f6f6;
}

.poll__discussion-wrapper {
    grid-template-columns: 1fr;
    display: grid;
    margin: 0 auto;
    max-width: 80%;
    padding: 1em 0;
}

.poll_discussion_form{
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

.poll__discussion-submit-button {
  grid-column: 2 / span 2;
  width: 100%
}


.poll__chart-wrapper-vote {
  grid-column: 1 / span 4
}

.poll__chart-wrapper-bar-chart {
  grid-column: 1 / span 4;
  margin: 0 auto;
  max-width: 80%;
}

.poll__chart-wrapper-analyze-votes-button {
  grid-column: 1 / span 4;
  margin: 0 auto;
}

.poll_content {
  order: 2;
}

.poll__ads {
  height: 100%;
  background: grey;
  order: 1;
}

.vote-text {
  color: red;
}

.poll__other-polls {
  grid-template-columns: 1fr;
  display: grid;
  width: 50%;
  text-align:center;
}

.poll__other-polls-button {
  width: 30%;
}

.poll__double-line {
  margin-top: -20px;
}

@media all and (min-width: 850px) {
  .poll__wrapper {
    grid-template-columns: 1fr 0.2fr;
  }

  .poll_content {
    order: 1;
  }

  .poll__ads {
    order: 2;
  }
}
</style>
