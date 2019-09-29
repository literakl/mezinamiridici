<template>
    <div class="not-found">
        <h1>404 - Page not found</h1>
        <p>This page may have been deleted, <router-link :to="{ name: 'home' }">go back to the homepage</router-link>.</p>
    </div>
</template>

<script>

export default {
  name: 'not-found',
};
</script>

<style>
.not-found {
    grid-template-columns: 1fr;
    display: grid;
    margin: 0 auto;
    max-width: 80%;
    padding: 1em 0;
    height: 100%;
}
</style>
