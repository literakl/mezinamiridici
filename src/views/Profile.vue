<template>
    <div>
        <div class="profile">  
            <div class="profile__wrapper">
                <dl>
                    <dt>Nickname</dt>
                    <dl>Taxikar007</dl>

                    <dt>Driving for</dt>
                    <dl>23 years</dl>

                    <dt>Vehicle</dt>
                    <dl>bike, car</dl>
                    
                    <dt>Region</dt>
                    <dl>Praha</dl>

                    <dt>Education</dt>
                    <dl>High School</dl>

                    <dt>Sex</dt>
                    <dl>man</dl>
                </dl>
            </div>
        </div>
        <PaginatedTopPolls />
    </div>
</template>

<script>
import Button from '@/components/atoms/Button.vue';
import PaginatedTopPolls from '@/components/organisms/PaginatedTopPolls.vue';

export default {
  name: 'profile',
  components: {
      PaginatedTopPolls,
      Button
  },
  data: () => ({
    page: 0
  }),
  methods: {
      clicked: function () {
          console.log("Loading more...")
          this.page++;
      }
  }
};
</script>

<style>
.profile {
    background: #f6f6f6;
    margin-top: -16px;
    padding-top: 30px;
}

.profile__wrapper {
    grid-template-columns: 1fr;
    display: grid;
    margin: 0 auto;
    max-width: 80%;
    padding: 1em 0;
    grid-gap: 20px;
}

.polls {
    grid-template-columns: 1fr;
    display: grid;
    margin: 0 auto;
    max-width: 80%;
    padding: 1em 0;
    grid-gap: 20px;
}

dl {
  display: grid;
  grid-template-columns: max-content auto;
  margin: 0px;
}

dt {
  grid-column-start: 1;
  font-weight: 900;
  padding-right: 50px;
  padding-bottom: 20px;
}

dd {
  grid-column-start: 2;
}
</style>
