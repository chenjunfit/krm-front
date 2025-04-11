<template>
    <el-button type="text">{{clusterSize}}</el-button>
</template>

<script setup>
import {onBeforeMount, ref} from "vue";
import {getNodeList} from "../../../api/cluster/cluster.js";

const clusterSize=ref(0)
const props=defineProps({
    cluseterId: String
})
onBeforeMount(()=>{
    getNodeList(props.cluseterId).then((res)=>{
        clusterSize.value=res.data.data.items.length
    })
})
</script>

<style scoped>

</style>