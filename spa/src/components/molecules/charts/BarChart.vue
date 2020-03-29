<template>
    <div>
        <table id="barchart__table">
            <tbody>
                <tr id="neutral">
                    <td class="sent bar" v-bind:style="barStyle('neutral')">
                      <p>{{data.neutral}}%</p>
                    </td>
                    <th scope="row">{{ $t('bar-chart.neutral') }}</th>
                </tr>
                <tr id="trivial">
                    <td class="sent bar" v-bind:style="barStyle('trivial')">
                      <p>{{data.trivial}}%</p>
                    </td>
                    <th scope="row">{{ $t('bar-chart.trivial') }}</th>
                </tr>
                <tr id="dislike">
                    <td class="sent bar" v-bind:style="barStyle('dislike')">
                      <p>{{data.dislike}}%</p>
                    </td>
                    <th scope="row">{{ $t('bar-chart.dislike') }}</th>
                </tr>
                <tr id="hate">
                    <td class="sent bar" v-bind:style="barStyle('hate')">
                      <p>{{data.hate}}%</p>
                    </td>
                    <th scope="row">{{ $t('bar-chart.hate') }}</th>
                </tr>
            </tbody>
        </table>
    </div>
</template>

<script>
export default {
  name: 'BarChart',
  props: {
    voted: String,
    data: Object,
  },
  computed() {
    return {
      poll() {
        const total = data.votes.neutral + data.votes.trivial + data.votes.dislike + data.votes.hate;
        let items = [data.votes.neutral, data.votes.trivial, data.votes.dislike, data.votes.hate];
        let result = [];
        let sum = 0, biggestRound = 0, roundPointer;

        items.forEach((votes, index) => {
          let value = 100 * votes / total;
          let rounded = Math.round(value);
          let diff = value - rounded;
          if (diff > biggestRound) {
            biggestRound = diff;
            roundPointer = index;
          }
          sum += rounded;
          result.push(rounded);
        });

        if (sum === 99) {
          result[roundPointer] += 1;
        } else if (sum === 101) {
          result[roundPointer] -= 1;
        }

        return {
          neutral: result[0],
          trivial: result[1],
          dislike: result[2],
          hate: result[3],
          totalVotes: total,
        };
      },
    }
  },
  methods: {
    barStyle(vote) {
      return `height: ${3 * poll[vote]} px${(this.voted === vote) ? ';background-color: #ffd302' : ''}`;
    }
  }
};
</script>

<style scoped lang="scss">
#barchart__table {
  display: block; /* fixes layout wonkiness in FF1.5 */
  position: relative;
  width: 500px;
  height: 300px;
  margin: 0 0 30px 0;
  padding: 0;
  font-size: 10px;
}

#barchart__table th {
  border-top: 1px solid black;
  width: 20px;
}

#barchart__table tr,
#barchart__table td,
#barchart__table th {
  position: absolute;
  bottom: 0;
  text-align: center;
}

#barchart__table th {
  width: 10px;
}

#neutral {
  left: 0;
}

#trivial {
  left: 100px;
}

#dislike {
  left: 200px;
}

#hate {
  left: 300px;
  border-right: none;
}

#barchart__table th {
  bottom: -1.75em;
  width: 150px;
}

#barchart__table .bar {
  width: 30px;
  margin-left:45px;
}

#barchart__table .bar p {
  margin: -25px 0 0;
}

#barchart__table .sent {
  background-color: black;
  border-color: transparent;
  border-radius: 5px;
}

/* Small Mobiles */
@media all and (max-width: 700px) {
  #barchart__table {
    width: 320px;
    margin-left: -30px;
  }

  #barchart__table th {
    width: 78px;
  }

  #barchart__table .bar {
    width: 20px;
    margin-left:25px;
  }

  #neutral {
    left: 0;
  }

  #trivial {
    left: 80px;
  }

  #dislike {
    left: 160px;
  }

  #hate {
    left: 240px;
    border-right: none;
  }
}

/* Desktop */
@media all and (min-width: 970px) {
  #barchart__table {
    width: 600px
  }

  #barchart__table .bar {
    width: 50px;
  }

  #neutral {
    left: 0;
  }

  #trivial {
    left: 150px;
  }

  #dislike {
    left: 300px;
  }

  #hate {
    left: 450px;
    border-right: none;
  }
}
</style>
