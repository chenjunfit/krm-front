<template>
    <Add  :method="route.query.method" v-if="ready" ResourceType="DaemonSet"></Add>
</template>

<script setup>
import Add from "./addOrUpdate.vue";
import {onBeforeMount,ref} from "vue";
import {useRoute} from "vue-router";
import {useItem} from "../../store/index.js";
import {getDaemonset} from "../../api/scheduler/daemonset/daemonset.js";
const useItemer=useItem()
const route=useRoute()
const ready=ref(false)
onBeforeMount( async ()=>{
    const requestQuery=route.query
    await getDaemonset(requestQuery).then((res)=>{
        useItemer.item=JSON.parse(JSON.stringify(res.data.data.item))
    })
    ready.value=true
})
</script>

<style scoped>

</style>