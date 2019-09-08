<template>
    <div>  
        <table id="barchart__table">
            <tbody>
                <tr class="qtr" id="q1">
                    <th scope="row">No Problem</th>
                    <td class="sent bar" style="height: 111px;">  
                        <p>13%</p>
                    </td>
                </tr>
                <tr class="qtr" id="q2">
                    <th scope="row">Trivial Trouble</th>
                    <td class="sent bar" style="height: 206px;">
                        <p>40%</p>
                    </td>
                </tr>
                <tr class="qtr" id="q3">
                    <th scope="row">I don't like it</th>
                    <td class="sent bar" style="height: 300px; background-color: #ffd302">
                        <p>90%</p>
                    </td>
                </tr>
                <tr class="qtr" id="q4">
                    <th scope="row">I hate it</th>
                    <td class="sent bar" style="height: 110px;">
                        <p>30%</p>
                    </td>
                </tr>
            </tbody>
        </table>
    </div>
</template>

<script>
export default {
  name: 'BarChart',
  components: {
  },
  data: () => ({
  }),
  methods: {
  },
};
</script>


<style lang="scss">
#barchart__table {
  display: block; /* fixes layout wonkiness in FF1.5 */
  position: relative; 
  width: 750px; 
  height: 320px;
  margin: 0 0 30px 0;
  padding: 0;
  font-size: 20px;
  border-bottom: 1px solid black;

}

#barchart__table tr, 
#barchart__table td { 
  position: absolute;
  bottom: 0; 
  width: 60px; 
  z-index: 2;
  margin: 0; 
  padding: 0;
  text-align: center;
}

#barchart__table th {
    position: absolute;
  bottom: 0; 
  width: 60px; 
  z-index: 2;
  margin: 20px 0 0 0; 
  padding: 0;
  text-align: center; 
}

#q1 {left: 0;}
#q2 {left: 200px;}
#q3 {left: 400px;}
#q4 {left: 600px; border-right: none;}

#barchart__table tbody th {
  bottom: -1.75em;
  width: 150px; 
  vertical-align: top;
  font-weight: normal; 
  color: #333;
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
</style>
