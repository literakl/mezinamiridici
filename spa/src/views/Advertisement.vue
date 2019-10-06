<template>
    <div class="advertisement">
        <h1>Advertisement</h1>
        <p>Advertisement page here.</p>
    </div>
</template>

<script>

export default {
  name: 'Advertisement',
};
</script>

<style>
.advertisement {
    grid-template-columns: 1fr;
    display: grid;
    margin: 0 auto;
    max-width: 80%;
    padding: 1em 0;
    height: 100%;
}
</style>
