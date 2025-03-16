<template>
    <Add  :method="route.query.method" v-if="ready"  :item="data.item"></Add>
</template>

<script setup>
import Add from "./addOrUpdate.vue";
import {onBeforeMount, onMounted, provide, reactive, ref, toRefs} from "vue";
import {useRoute} from "vue-router";
import {useItem} from "../../store/index.js";
import {getConfigMap} from "../../api/scheduler/configmap/configmap.js";
const useItemer=useItem()
const route=useRoute()
const ready=ref(false)
const data=reactive({
    item:{}
})
onBeforeMount( async ()=>{
    const requestQuery=route.query

    await getConfigMap(requestQuery).then((res)=>{
       data.item=JSON.parse(JSON.stringify(res.data.data.item))
    })
    ready.value=true
})
</script>

<style scoped>

</style>