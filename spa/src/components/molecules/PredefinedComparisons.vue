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
            {{ $t('poll.analysis.custom') }}
          </router-link>
        </li>
      </ul>
    </div>
  </div>
</template>

<script>

export default {
  name: 'PredefinedComparisons',
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
  margin: 0 15px 0 0;
  padding: 0;
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
.comparison-list ul li a{ font-weight: 400;
 border: 1px solid #f3f3f3;
    border-radius: 0px;
    padding: 4px 10px;
    font-weight: 300;
}
.comparison-list ul li a:hover{ text-decoration: none;}
.comparison-list ul li a.router-link-active{ background: #fff;
  box-shadow: 0 10px 16px 0 rgba(0,0,0,0.2), 0 6px 20px 0 rgba(0,0,0,0.19);
color: var(--text-color);
position: relative;
}


.comparison-list ul li a.router-link-active:after{
  content: "";
  position: absolute;
  /* width: 0px;
  height: 0px; */
  /* border-left: 5px solid transparent;
  border-right: 5px solid transparent;
  border-bottom: 5px solid  var(--link-blue); */
  border-bottom: 2px solid  var(--link-blue);
  bottom: -3px;

  top: -6px;
  margin: 0 auto;
  left: 0;
  right: 0;
}


.custombtn{
  text-align: right;
  display: flex;
  align-items: center;
  justify-content: center;
}
.custombtn a{
  background:var(--color-white);
  text-align: center;
  color: #636466;
  padding: 4px 10px;
  font-weight: 400;
  font-size: 14px;
    border-radius: 3px;
    border: 1px solid #ddd;
    -webkit-box-shadow: #c1c1c1 1px 1px 10px;
    box-shadow: #c1c1c1 1px 1px 10px;
}
.custombtn a:hover{
  text-decoration: none;
}
.custombtn a.router-link-active{
  background:  #007bff;
  color: var(--color-white);
  position: relative;
  border-radius: 3px;
}
.custombtn a.router-link-active:after{
   content: "";
  position: absolute;
  width: 0px;
  height: 0px;
  border-left: 5px solid transparent;
  border-right: 5px solid transparent;
  border-bottom: 5px solid  var(--color-white);
  box-shadow: 0 10px 16px 0 rgba(0,0,0,0.2), 0 6px 20px 0 rgba(0,0,0,0.19);
  bottom: 0px;
  margin: 0 auto;
  left: 0;
  right: 0;
}
 @media (min-width: 1920px) {
.comparison-list h6{
  font-size: 22px;
}
.comment-area h3 {
    font-size: 28px;
}
.custombtn a{
  font-size: 19px;
}
}
@media (max-width: 1235px) {
  .comparison-box{
        padding: 20px 15px;
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
  .comparison-list, .custombtn{ width: 100%;}
}
</style>
