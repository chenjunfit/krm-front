<template>
    <Add  :method="route.query.method" v-if="ready"  :item="data.item"></Add>
</template>

<script setup>
import Add from "./addOrUpdate.vue";
import {onBeforeMount, onMounted, provide, reactive, ref, toRefs} from "vue";
import {useRoute} from "vue-router";
import {getDeployment} from "../../api/scheduler/deployment/deployment.js";
import {useItem} from "../../store/index.js";
import {getService} from "../../api/scheduler/service/service.js";
const useItemer=useItem()
const route=useRoute()
const ready=ref(false)
const data=reactive({
    item:{}
})
onBeforeMount( async ()=>{
    const requestQuery=route.query

    await getService(requestQuery).then((res)=>{
       data.item=JSON.parse(JSON.stringify(res.data.data.item))
        if(route.query.method=='Copy'){
            delete data.item.spec.clusterIPs
        }
    })
    ready.value=true
})
</script>

<style scoped>

</style>