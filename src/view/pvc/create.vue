<template>
<AddOrUpdate method="Create" ></AddOrUpdate>
</template>

<script setup>

import AddOrUpdate from "./addOrUpdate.vue";
import {onBeforeMount, ref} from "vue";
import {useItem} from "../../store/index.js";

const ready=ref(true)
onBeforeMount(()=>{
    useItem().$reset()
})
</script>

<style scoped>

</style>