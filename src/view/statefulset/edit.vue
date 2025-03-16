<template>
    <Add  :method="route.query.method" :ready="ready" ResourceType="StatefulSet"></Add>
</template>

<script setup>
import Add from "./addOrUpdate.vue";
import {onBeforeMount, onMounted, provide, reactive, ref, toRefs} from "vue";
import {useRoute} from "vue-router";
import {getDeployment} from "../../api/scheduler/deployment/deployment.js";
import {useItem} from "../../store/index.js";
import {getStatefulset} from "../../api/scheduler/statefulset/statefulset.js";
const useItemer=useItem()
const route=useRoute()
const ready=ref(false)
onBeforeMount( async ()=>{
    const requestQuery=route.query
    await getStatefulset(requestQuery).then((res)=>{
        useItemer.item=JSON.parse(JSON.stringify(res.data.data.item))
    })
    ready.value=true
})
</script>

<style scoped>

</style>