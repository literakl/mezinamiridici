<template>
    <div>  
        <table id="barchart__table">
            <tbody>
                <tr id="no-problem">
                    <td class="first-group bar" v-bind:style="(voted === 'No problem') ? 'height: 101px; background-color: #ffd302' : 'height: 101px;'">  
                        <p>13%</p>
                    </td>
                    <td class="second-group bar" v-bind:style="(voted === 'No problem') ? 'height: 200px; background-color: #ffd302' : 'height: 200px;'">  
                        <p>50%</p>
                    </td>
                    <th scope="row">No Problem</th>
                </tr>
                <tr id="trivial-trouble">
                    <td class="first-group bar" v-bind:style="(voted === 'Trivial trouble') ? 'height: 206px; background-color: #ffd302' : 'height: 206px;'">
                        <p>40%</p>
                    </td>
                    <td class="second-group bar" v-bind:style="(voted === 'Trivial trouble') ? 'height: 10px; background-color: #ffd302' : 'height: 10px;'">
                        <p>10%</p>
                    </td>
                    <th scope="row">Trivial Trouble</th>
                </tr>
                <tr id="i-dont-like-it">
                    <td class="first-group bar" v-bind:style="(voted === 'I don\'t like it') ? 'height: 300px; background-color: #ffd302' : 'height: 300px;'">
                        <p>90%</p>
                    </td>
                    <td class="second-group bar" v-bind:style="(voted === 'I don\'t like it') ? 'height: 200px; background-color: #ffd302' : 'height: 200px;'">
                        <p>50%</p>
                    </td>
                    <th scope="row">I don't like it</th>
                </tr>
                <tr id="i-hate-it">
                    <td class="first-group bar" v-bind:style="(voted === 'I hate it') ? 'height: 110px; background-color: #ffd302' : 'height: 110px;'">
                        <p>30%</p>
                    </td>
                    <td class="second-group bar" v-bind:style="(voted === 'I hate it') ? 'height: 170px; background-color: #ffd302' : 'height: 170px;'">
                        <p>50%</p>
                    </td>
                    <th scope="row">I hate it</th>
                </tr>
            </tbody>
        </table>
    </div>
</template>

<script>
export default {
  name: 'GroupedBarChart',
  props: {
    voted: String
  },
};
</script>


<style lang="scss">
#barchart__table {
  display: block; /* fixes layout wonkiness in FF1.5 */
  position: relative; 
  width: 500px; 
  height: 320px;
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

#no-problem {
  left: 0;
}

#trivial-trouble {
  left: 100px;
}

#i-dont-like-it {
  left: 200px;
}

#i-hate-it {
  left: 300px;
  border-right: none;
}

#barchart__table th {
  bottom: -1.75em;
  width: 185px; 
}

#barchart__table .bar {
  width: 30px; 
  margin-left:45px;
}

#barchart__table .bar p {
  margin: -25px 0 0; 
}

#barchart__table .first-group {
  background-color: #ffd200;
  border-color: transparent;
  border-radius: 5px;
}

#barchart__table .second-group {
  background-color: #f5a522;
  margin-left: 100px;
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

  #no-problem {
    left: 0;
  }

  #trivial-trouble {
    left: 80px;
  }

  #i-dont-like-it {
    left: 160px;
  }

  #i-hate-it {
    left: 240px; 
    border-right: none;
  }
}

/* Desktop */
@media all and (min-width: 970px) {
  #barchart__table {
    width: 100%;
    margin-left: 10%;
    margin-right: 10%;
  }

  #barchart__table .bar {
    width: 50px; 
  }

  #no-problem {
    left: 0%;
    width: 100%;
  }

  #trivial-trouble {
    left: 50%;
    width: 100%;
  }

  #i-dont-like-it {
    left: 100%;
    width: 100%;
  }

  #i-hate-it {
    left: 150%; 
    border-right: none;
    width: 100%;
  }

  #barchart__table th  {
    width: 350px;
    margin-left: -70px;
  }
}
</style>
