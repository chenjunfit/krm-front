<template>
    <el-switch v-model="taint" :before-change="updateTaint"/>
</template>

<script setup>
import {onBeforeMount, ref, watch} from "vue";
import {updateNode} from "../../../api/cluster/cluster.js";
import {ElMessage} from "element-plus";

const props=defineProps({
    taintType:{
        type:String
    },
    item:{
        type:Object
    },
    clusterId:{
        type:String
    },
})
const taint=ref(false)
const updateTaint=()=>{
    if(taint.value){
        const taints=props.item.spec.taints
        if(taints!=undefined){
            for(let i=0;i<taints.length;i++){
                const currentTaint=taints[i]
                const effect=currentTaint.effect
                const key=currentTaint.key
                if(effect==props.taintType){
                    if(key=='node-role.kubernetes.io/master'||
                        key=='node-role.kubernetes.io/control-plane'||
                        key=='node-role.kubernetes.io/controlplane'
                    ){
                        props.item.spec.taints.splice(i,1)
                    }
                }

            }
        }
    }else {
     const taint={
         key:"node-role.kubernetes.io/control-plane",
         effect:props.taintType,
     }
     if(props.item.spec.taints==undefined){
         props.item.spec.taints=[]
     }
        props.item.spec.taints.push(taint)
    }
    return new Promise(async (resolve,reject)=>{
        await updateNode(props.clusterId,props.item.metadata.name,props.item).then((res)=>{
            if(res.data.status==200){
                ElMessage.success(res.data.message)
                return resolve(true)
            }else{
                ElMessage.error(res.data.message)
                return reject(false)
            }
        }).catch(
            err=>{
                ElMessage.error(err.message)
                return reject(false)
            }
        )
    })


}
const GetTaintStatus=()=>{
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
            }else {
                taint.value=false
            }
        }
    }
}
onBeforeMount(()=>{
    GetTaintStatus()
})
</script>

<style scoped>

</style>