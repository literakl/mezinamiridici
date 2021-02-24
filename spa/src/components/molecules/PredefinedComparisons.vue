<template>
  <div id="scroll" class="comparison-box">
    <div  class="comparison-list">
      <h6>{{ $t('poll.analysis.comparison') }}</h6>
      <ul>
        <li><router-link :to="{ name: 'analyse-poll', params: { slug, type: 'muzi_zeny' } }">
          {{ $t('poll.analysis.men_women') }}
        </router-link></li>
        <li><router-link :to="{ name: 'analyse-poll', params: { slug, type: 'auto_kamion' } }">
          {{ $t('poll.analysis.car_truck') }}
        </router-link></li>
        <li><router-link :to="{ name: 'analyse-poll', params: { slug, type: 'auto_motorka' } }">
          {{ $t('poll.analysis.car_bike') }}
        </router-link></li>
        <li><router-link :to="{ name: 'analyse-poll', params: { slug, type: 'zajic_zkuseny' } }">
          {{ $t('poll.analysis.unseasoned_veteran') }}
        </router-link></li>
        <li><router-link :to="{ name: 'analyse-poll', params: { slug, type: 'praha_brno' } }">
          {{ $t('poll.analysis.praha_brno') }}
        </router-link></li>
        <li class="custombtn">
          <router-link :to="{ name: 'analyse-poll', params: { slug, type: 'vlastni' } }">
            {{ $t('poll.analysis.custom') }} <BIconGear scale='1'></BIconGear>
          </router-link>
        </li>
      </ul>
    </div>
  </div>
</template>

<script>
import { BIconGear } from 'bootstrap-vue';

export default {
  name: 'PredefinedComparisons',
  components: {
    BIconGear,
  },
  props: {
    slug: String,
  },
};

</script>

<style scoped>
.comparison-box{
  padding:20px 0px;
}
.comparison-list{
  display: flex;
  flex-wrap: wrap;
  align-items: center;
  justify-content: flex-start;
}
.comparison-list h6{
  margin-right:15px;
}
.comparison-list ul{
  padding: 0;
  margin: 0;
  display: flex;
  flex-wrap: wrap;
}
.comparison-list ul li{
  list-style-type: none;
  font-size: 14px;
  margin-right: 5px;
  display: flex;
  flex-wrap: wrap;
}
.comparison-list ul li a{
  border: 1px solid #f3f3f3;
  border-radius: 0px;
  padding: 4px 10px;
  font-weight: 300;
}
.comparison-list ul li a:hover{
  text-decoration: none;
}
.comparison-list ul li a.router-link-active{
  background: #fff;
  position: relative;
  color:var(--tect-color);
  font-weight: 400;
}
.comparison-list ul li a.router-link-active:after{
  content: "";
  position: absolute;
  border-bottom:3px solid  var(--theme-primary);
  bottom: -3px;
  top: -6px;
  margin: 0 auto;
  left: 0;
  right: 0;
}

@media (max-width: 1235px) {
  .comparison-box{
    padding: 20px 0px;
  }
}
@media (max-width: 1024px) {
  .comparison-list ul li { margin-bottom: 5px;}
}
@media (max-width: 767px) {
  .comparison-list{
    width: 80%;
  }
}
@media (max-width: 450px) {
  .comparison-box{
    flex-direction: column;
  }
  .comparison-list{ width: 100%;}
}
</style>
