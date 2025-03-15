<template>
    <Add  :method="route.query.method" v-if="ready"  :item="data.item"></Add>
</template>

<script setup>
import Add from "./addOrUpdate.vue";
import {onBeforeMount, onMounted, provide, reactive, ref, toRefs} from "vue";
import {useRoute} from "vue-router";
import {getDeployment} from "../../api/scheduler/deployment/deployment.js";
import {useItem} from "../../store/index.js";
import {getIngress} from "../../api/scheduler/ingress/ingress.js";
const useItemer=useItem()
const route=useRoute()
const ready=ref(false)
const data=reactive({
    item:{}
})
onBeforeMount( async ()=>{
    const requestQuery=route.query

    await getIngress(requestQuery).then((res)=>{
       data.item=JSON.parse(JSON.stringify(res.data.data.item))
    })
    ready.value=true
})
</script>

<style scoped>

</style>