<template>

<div class="stats-wrap">
  <p>
    Přinášíme vám aktuální statistiky nehod za předchozí den a srovnání se stejným období letoška a loňska.
    Prosíme, jezděte opatrně, neriskujte a počítejte s chybami ostatních řidičů. Ať se vám tato statistika vyhýbá!
  </p>
  <h2>Current statistics</h2>
  <div style="overflow-x:auto;" class="stats-result table-responsive">
    <table class="table table-hover table-sm table-bordered text-center">

      <thead>
        <tr>
          <th scope="col">Kraj</th>
          <th scope="col">
            <img src="/images/icons/crash.png" width="48" height="48" title="Nehod">
          </th>
          <th scope="col">
            <img src="/images/icons/tombstone.png" width="48" height="48" title="Úmrtí">
          </th>
          <th scope="col">
            <img src="/images/icons/ambulance.png" width="48" height="48" title="Těžkých zranění">
          </th>
          <th scope="col">
            <img src="/images/icons/minor_injuries.png" width="48" height="48" title="Lehkých zranění">
          </th>
          <th scope="col">
            <img src="/images/icons/reason_speed.png" width="48" height="48" title="Rychlost">
          </th>
          <th scope="col">
            <img src="/images/icons/reason_give_way.png" width="48" height="48" title="Přednost v jízdě">
          </th>
          <th scope="col">
            <img src="/images/icons/reason_passing.png" width="48" height="48" title="Předjíždění">
          </th>
          <th scope="col">
            <img src="/images/icons/reason_drunk.png" width="48" height="48" title="Návykové látky">
          </th>
          <th scope="col">
            <img src="/images/icons/reason_mistake.png" width="48" height="48" title="Nesprávná jízda">
          </th>
          <th scope="col">
            <img src="/images/icons/reason_other.png" width="48" height="48" title="Jiný důvod">
          </th>
        </tr>
      </thead>
      <tbody>
      {{#each day.regions}}
        <tr>
          <td>{{ lookup ../REGIONS this.region }}</td>
          <td>{{ this.count }}</td>
          <td>{{ this.impact.deaths }}</td>
          <td>{{ this.impact.severely }}</td>
          <td>{{ this.impact.slightly }}</td>
          <td>{{ this.reason.speed }}</td>
          <td>{{ this.reason.giveway }}</td>
          <td>{{ this.reason.passing }}</td>
          <td>{{ this.reason.drunk }}</td>
          <td>{{ this.reason.mistake }}</td>
          <td>{{ this.reason.other }}</td>
        </tr>
      {{/each}}
        <tr>
          <td>Celkem</td>
          <td>{{ day.total.count }}</td>
          <td>{{ day.total.impact.deaths }}</td>
          <td>{{ day.total.impact.severely }}</td>
          <td>{{ day.total.impact.slightly }}</td>
          <td>{{ day.total.reason.speed }}</td>
          <td>{{ day.total.reason.giveway }}</td>
          <td>{{ day.total.reason.passing }}</td>
          <td>{{ day.total.reason.drunk }}</td>
          <td>{{ day.total.reason.mistake }}</td>
          <td>{{ day.total.reason.other }}</td>
        </tr>
      </tbody>

    </table>
  </div>

  <h2>Srovnání s loňským rokem</h2>
  <div style="overflow-x:auto;" class="stats-result table-responsive">
    <table class="table table-hover table-sm table-bordered text-center">
      <thead>
        <tr>
          <th>&nbsp;</th>
          <th colspan="2" scope="col">
            <img src="/images/icons/crash.png" width="48" height="48" alt="Počet nehod">
          </th>
          <th colspan="2" scope="col">
            <img src="/images/icons/tombstone.png" width="48" height="48" alt="Počet úmrtí">
          </th>
          <th colspan="2" scope="col">
            <img src="/images/icons/ambulance.png" width="48" height="48" alt="Počet těžkých zranění">
          </th>
          <th colspan="2" scope="col">
            <img src="/images/icons/minor_injuries.png" width="48" height="48" alt="Počet lehkých zranění">
          </th>
        </tr>
        <tr>
          <th>&nbsp;</th>
          <th scope="col">{{ lastYearValue }}</th>
          <th scope="col">{{ thisYearValue }}</th>
          <th scope="col">{{ lastYearValue }}</th>
          <th scope="col">{{ thisYearValue }}</th>
          <th scope="col">{{ lastYearValue }}</th>
          <th scope="col">{{ thisYearValue }}</th>
          <th scope="col">{{ lastYearValue }}</th>
          <th scope="col">{{ thisYearValue }}</th>
        </tr>
      </thead>
      <tbody>
        <tr>
          <td>Tento den</td>
          <td>{{ lastYear.day.count }}</td>
          <td>{{ thisYear.day.count }}</td>
          <td>{{ lastYear.day.impact.deaths }}</td>
          <td>{{ thisYear.day.impact.deaths }}</td>
          <td>{{ lastYear.day.impact.severely }}</td>
          <td>{{ thisYear.day.impact.severely }}</td>
          <td>{{ lastYear.day.impact.slightly }}</td>
          <td>{{ thisYear.day.impact.slightly }}</td>
        </tr>
        <tr>
          <td>Tento měsíc</td>
          <td>{{ lastYear.month.count }}</td>
          <td>{{ thisYear.month.count }}</td>
          <td>{{ lastYear.month.impact.deaths }}</td>
          <td>{{ thisYear.month.impact.deaths }}</td>
          <td>{{ lastYear.month.impact.severely }}</td>
          <td>{{ thisYear.month.impact.severely }}</td>
          <td>{{ lastYear.month.impact.slightly }}</td>
          <td>{{ thisYear.month.impact.slightly }}</td>
        </tr>
        <tr>
          <td>Tento rok</td>
          <td>{{ lastYear.year.count }}</td>
          <td>{{ thisYear.year.count }}</td>
          <td>{{ lastYear.year.impact.deaths }}</td>
          <td>{{ thisYear.year.impact.deaths }}</td>
          <td>{{ lastYear.year.impact.severely }}</td>
          <td>{{ thisYear.year.impact.severely }}</td>
          <td>{{ lastYear.year.impact.slightly }}</td>
          <td>{{ thisYear.year.impact.slightly }}</td>
        </tr>
      </tbody>
    </table>
  </div>
    <ul class="lagend-details">
      <li>
        <span>Legenda</span>
        <div style="overflow-x:auto;" class="stats-result table-responsive">
          <table class="table table-hover table-sm table-bordered text-center">
            <tr>
              <td>
                <img src="/images/icons/crash.png" width="48" height="48" alt="">
              </td>
              <td>Počet nehod</td>
              <td>
                <img src="/images/icons/tombstone.png" width="48" height="48" alt="">
              </td>
              <td>Počet úmrtí</td>
            </tr>
            <tr>
              <td>
                <img src="/images/icons/ambulance.png" width="48" height="48" alt="">
              </td>
              <td>Počet těžkých zranění</td>
              <td>
                <img src="/images/icons/minor_injuries.png" width="48" height="48" alt="">
              </td>
              <td>Počet lehkých zranění</td>
            </tr>
            <tr>
              <td>
                <img src="/images/icons/reason_speed.png" width="48" height="48" alt="">
              </td>
              <td>Nepřiměřená rychlost</td>
              <td>
                <img src="/images/icons/reason_give_way.png" width="48" height="48" alt="">
              </td>
              <td>Nedání přednosti v jízdě</td>
            </tr>
            <tr>
              <td>
                <img src="/images/icons/reason_passing.png" width="48" height="48" alt="">
              </td>
              <td>Nesprávné předjíždění</td>
              <td>
                <img src="/images/icons/reason_drunk.png" width="48" height="48" alt="">
              </td>
              <td>Pod vlivem návykových látek</td>
            </tr>
            <tr>
              <td>
                <img src="/images/icons/reason_mistake.png" width="48" height="48" alt="">
              </td>
              <td>Nesprávný způsob jízdy</td>
              <td>
                <img src="/images/icons/reason_other.png" width="48" height="48" alt="">
              </td>
              <td>Jiná příčina</td>
            </tr>
          </table>
        </div>
      </li>
    </ul>
</div>

</template>


<script>
export default {
    name: 'StatsContent',
}
</script>
<style>
  .stats-result{
    margin: 0;
    border-top: 3px solid #ddd;
    border-left: 3px solid #ddd;
    border-right: 3px solid #ddd;
    border-bottom: 3px solid #ddd;

    overflow-x: auto; background-color: #fff; padding: 0px;
  }
  .stats-wrap h2
{
    font-size: 1.2rem;
    line-height: 21px;
    padding: 7pt 12pt;
    margin: 0;
    margin-top: 25px;
    background: #e6eaef;
    color: #656b6f;
    border-radius: 4px 4px 0 0;
}
.stats-result table tr td{ vertical-align: middle;}
.stats-result table tr th{ vertical-align: middle;}
  .lagend-details{
      padding: 0;
    margin: 0;
    display: flex;
    margin-bottom: 20px;
    }
    .lagend-details li div{
      display: none;
    }
    .lagend-details li{
      position: relative;
    display: flex;
    max-width: 200px;
    width: 300px;
    /* display: flex; */
    overflow-x: visible;
    }
    .lagend-details li span{
      padding: 5px 20px;
    display: inline-block;
    margin: 20px 0 0 0;
    background: #e6eaef;
    color: #656b6f;
    font-weight: 500;
    font-size: 1.1rem;
    max-width: 200px;
    text-align: center;
    width: 100%;
    }
    .lagend-details li span:hover, .lagend-details li span:active{
      cursor: pointer;
      background-color:#28a745;
      color:#fff;
      box-shadow: #c1c1c1 1px 1px 10px;
    }
    .lagend-details li:active div, .lagend-details li:hover div {
      display: block;
    position: absolute;
    max-width: 500px;
    width: 400px;
    z-index: 1;
    border: 3px solid #ddd!important;
    top: 56px;
    }
    .lagend-details li:hover span,  .lagend-details li span:active{
      background-color:#28a745;
      color: #fff;
    }
    .lagend-details li div.stats-result{
     border: 0;
    }
    @media (max-width: 767px) {

      .lagend-details li:active div, .lagend-details li:hover div {
    top: unset;
    bottom: 0%;
    left: 0;
    width: 320px;
    }
    }
</style>