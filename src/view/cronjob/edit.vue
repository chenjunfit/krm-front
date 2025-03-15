<template>
    <Add  method="route.query.method" v-if="ready" ResourceType="CronJob" :cron-job-item="cronJobItem"></Add>
</template>

<script setup>
import Add from "./addOrUpdate.vue";
import {onBeforeMount, reactive, ref, toRefs} from "vue";
import {useRoute} from "vue-router";
import {useItem} from "../../store/index.js";
import {getCronJob} from "../../api/scheduler/cronjob/cronjob.js";
const useItemer=useItem()
const route=useRoute()
let ready=ref(false)
const data=reactive({
    cronJobItem:{
    }
})

onBeforeMount( async ()=>{
    const requestQuery=route.query
    await getCronJob(requestQuery).then((res)=>{
        const item=JSON.parse(JSON.stringify(res.data.data.item))
        useItemer.item.metadata=item.metadata
        useItemer.item.spec=item.spec.jobTemplate.spec
        data.cronJobItem=item
        ready.value=true
    })
})
const {cronJobItem}=toRefs(data)
</script>

<style scoped>

</style>