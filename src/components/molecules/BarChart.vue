<template>
    <div>  
        <table id="barchart__table">
            <tbody>
                <tr id="no-problem">
                    <td class="sent bar" v-bind:style="(voted === 'No problem') ? 'height: 101px; background-color: #ffd302' : 'height: 101px;'">  
                        <p>13%</p>
                    </td>
                    <th scope="row">No Problem</th>
                </tr>
                <tr id="trivial-trouble">
                    <td class="sent bar" v-bind:style="(voted === 'Trivial trouble') ? 'height: 206px; background-color: #ffd302' : 'height: 206px;'">
                        <p>40%</p>
                    </td>
                    <th scope="row">Trivial Trouble</th>
                </tr>
                <tr id="i-dont-like-it">
                    <td class="sent bar" v-bind:style="(voted === 'I don\'t like it') ? 'height: 300px; background-color: #ffd302' : 'height: 300px;'">
                        <p>90%</p>
                    </td>
                    <th scope="row">I don't like it</th>
                </tr>
                <tr id="i-hate-it">
                    <td class="sent bar" v-bind:style="(voted === 'I hate it') ? 'height: 110px; background-color: #ffd302' : 'height: 110px;'">
                        <p>30%</p>
                    </td>
                    <th scope="row">I hate it</th>
                </tr>
            </tbody>
        </table>
    </div>
</template>

<script>
export default {
  name: 'BarChart',
  props: {
    voted: String
  },
};
</script>


<style lang="scss">
#barchart__table {
  display: block; /* fixes layout wonkiness in FF1.5 */
  position: relative; 
  width: 580px; 
  height: 320px;
  margin: 0 0 30px 0;
  padding: 0;
  font-size: 20px;
}

#barchart__table th {
  border-top: 1px solid black;
}

#barchart__table tr, 
#barchart__table td,
#barchart__table th { 
  position: absolute;
  bottom: 0;
  text-align: center;
}

#no-problem {left: 0;}
#trivial-trouble {left: 140px;}
#i-dont-like-it {left: 280px;}
#i-hate-it {left: 429px; border-right: none;}

#barchart__table th {
  bottom: -1.75em;
  width: 150px; 
}

#barchart__table .bar {
  width: 60px; 
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

@media all and (max-width: 970px) {

}
</style>
