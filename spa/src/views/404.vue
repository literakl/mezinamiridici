<template>
    <b-container fluid>
        <b-row>
            <b-col offset="1">
                <h1>404 - Page not found</h1>
                <p>This page may have been deleted, <router-link :to="{ name: 'home' }">go back to the homepage</router-link>.</p>
            </b-col>
        </b-row>
    </b-container>
</template>

<script>

export default {
  name: 'not-found',
};
</script>
