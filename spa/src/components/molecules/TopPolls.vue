<template>
    <div>
        <h3>Top polls</h3>
        <hr />
        <h4>
            <router-link to="/poll/1">
            Lorem ipsum dolor sit amet consectetur adipisicing elit. Quasi, cupiditate.
            </router-link> &middot; 138 Votes &middot; 9 comments
        </h4>
        <hr />
        <h4>
            <router-link to="/poll/2">
            Lorem ipsum dolor sit amet consectetur adipisicing elit. Quasi, cupiditate.
            </router-link> &middot; 138 Votes &middot; 9 comments
        </h4>
        <hr />
        <h4>
            <router-link to="/poll/3">
            Lorem ipsum dolor sit amet consectetur adipisicing elit. Quasi, cupiditate.
            </router-link> &middot; 138 Votes &middot; 9 comments
        </h4>
        <hr />
        <h4>
            <router-link to="/poll/4">
            Lorem ipsum dolor sit amet consectetur adipisicing elit. Quasi, cupiditate.
            </router-link> &middot; 138 Votes &middot; 9 comments
        </h4>
    </div>
</template>

<script>
export default {
  name: 'TopPolls'
};
</script>


<style lang="scss">
#sign-up-form-wrapper {
    display: grid;
    grid-template-columns: 0.3fr 1fr;
    margin-top: 40px;
}

.sign-up-form__label {
    margin-bottom: 20px;
    font-weight: 900;
}

.sign-up-form__errors-heading {
    color: rgb(209, 49, 49);
}
</style>
