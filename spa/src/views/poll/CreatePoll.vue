<template>
  <div class="pt-3 w-75 m-auto">
    <h1>{{ $t('poll.forms.new-poll-heading') }}</h1>
    <ValidationObserver ref="observer" v-slot="{ handleSubmit }">
      <b-form @submit.stop.prevent="handleSubmit(onSubmit)">
        <ValidationProvider :rules="{ required: true, min: 10 }" v-slot="validationContext">
          <b-form-group id="text-group" :label="$t('poll.forms.text-label')" label-for="text">
            <b-form-input
              id="text" name="text" aria-describedby="text-errors"
              v-model="form.text" :state="getValidationState(validationContext)">
            </b-form-input>
            <b-form-invalid-feedback id="text-errors">{{ validationContext.errors[0] }}</b-form-invalid-feedback>
          </b-form-group>
        </ValidationProvider>

        <ValidationProvider :rules="{ required: true, min: 10 }" v-slot="validationContext">
          <b-form-group id="picture-group" :label="$t('poll.forms.picture-label')" label-for="text">
            <b-form-input
              id="text" name="picture" aria-describedby="picture-errors"
              v-model="form.picture" :state="getValidationState(validationContext)">
            </b-form-input>
            <b-form-invalid-feedback id="picture-errors">{{ validationContext.errors[0] }}</b-form-invalid-feedback>
          </b-form-group>
        </ValidationProvider>

        <b-button type="submit" variant="primary">Submit</b-button>
      </b-form>
    </ValidationObserver>
  </div>
</template>

<script>

export default {
  data() {
    return {
      form: {
        text: null,
        picture: null,
      },
    };
  },
  methods: {
    getValidationState({ dirty, validated, valid = null }) {
      return dirty || validated ? valid : null;
    },
    onSubmit() {
    },
  },
};
</script>
