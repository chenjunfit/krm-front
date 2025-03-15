<script setup>
</script>

<template>
  <router-view></router-view>
</template>

<style>
#app{
    width: 100%;
    height: 100%;
    margin: 0;
    padding: 0;
}
.logo {
  height: 6em;
  padding: 1.5em;
  will-change: filter;
  transition: filter 300ms;
}
.logo:hover {
  filter: drop-shadow(0 0 2em #646cffaa);
}
.logo.vue:hover {
  filter: drop-shadow(0 0 2em #42b883aa);
}
.auto-space-between{
    display: flex;
    flex-direction: row;
    justify-content: space-between;
    align-items: center;
 }
</style>
