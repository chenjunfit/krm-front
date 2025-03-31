<template>
    <el-switch v-model="taint"></el-switch>
</template>

<script setup>
import {onBeforeMount, ref} from "vue";

const props=defineProps({
    taintType:{
        type:String
    },
    item:{
        type:Object
    },
    clusterId:{
        type:String
    }
})
const taint=ref(false)
onBeforeMount(()=>{
    const taints=props.item.spec.taints
    if(taints!=undefined){
        for(let i=0;i<taints.length;i++){
            const currentTaint=taints[i]
            const effect=currentTaint.effect
            const key=currentTaint.key
            if(effect!=props.taintType){
                continue
            }
            if(key=='node-role.kubernetes.io/master'||
                key=='node-role.kubernetes.io/control-plane'||
                key=='node-role.kubernetes.io/controlplane'
            ){
                taint.value=true
            }
        }
    }
})
</script>

<style scoped>

</style>