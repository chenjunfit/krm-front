<template>
    <Add  :method="route.query.method" v-if="ready"  ></Add>
</template>

<script setup>
import Add from "./addOrUpdate.vue";
import {onBeforeMount, onMounted, provide, reactive, ref, toRefs} from "vue";
import {useRoute} from "vue-router";
import {getDeployment} from "../../api/scheduler/deployment/deployment.js";
import {useItem} from "../../store/index.js";
const useItemer=useItem()
const route=useRoute()
const ready=ref(false)
onBeforeMount( async ()=>{
    const requestQuery=route.query

    await getDeployment(requestQuery).then((res)=>{
        useItemer.item=JSON.parse(JSON.stringify(res.data.data.item))
    })
    ready.value=true
})
</script>

<style scoped>

</style>