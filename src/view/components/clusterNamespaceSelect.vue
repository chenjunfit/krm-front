<script setup>
import {onBeforeMount, reactive, toRefs} from "vue";
import {useRoute} from "vue-router";
import {getClusterList, getNamespaceList} from "../../api/cluster/cluster.js";
const route=useRoute()
const data=reactive({
    clusterList:[],
    namespaceList:[],
    clusterId:"",
    namespace:"",
})
const {clusterId,clusterList,namespaceList,namespace}=toRefs(data)

const props=defineProps({
    ShowNamespace:{
        type: Boolean,
        default: true
    },
    clusterReadOnly:{
        type:Boolean,
        default: false
    },
    nameSpaceReadOnly:{
        type:Boolean,
        default: false
    }
})
const emtis=defineEmits(['clusterChangeCallback','namespaceChangeCallback'])
const clusterChangeCallbackHandler=()=>{
  emtis('clusterChangeCallback',data.clusterId)
}
const namespaceChangeCallbackHandler=()=>{
    emtis('namespaceChangeCallback',data.clusterId,data.namespace)
}
const  getAllClusters=async ()=> {
    await getClusterList().then((response) => {
        data.clusterList = response.data.data.items
    })
}
const clusterChange=async ()=>{
    if(props.ShowNamespace){
        await getAlLNamespace()
    }else {
        clusterChangeCallbackHandler()
    }
}
const namespaceChange=()=>{
    namespaceChangeCallbackHandler()
}
const getAlLNamespace=async ()=>{
    const param={
        clusterId:data.clusterId
    }
    await getNamespaceList(param).then((response)=>{
        data.namespaceList=response.data.data.items
    })
    const currentNamespace=route.query.nameSpace
    data.namespace=currentNamespace?currentNamespace:"default"
    namespaceChangeCallbackHandler()
}
onBeforeMount(async ()=>{

        await getAllClusters()
        const defaultClusterId=data.clusterList[0].id
        const currentClusterId=route.query.clusterId
        data.clusterId=currentClusterId?currentClusterId:defaultClusterId

        await clusterChange()

})
</script>
<template>
    <el-select filterable
               v-model="clusterId"
               placeholder="请选择集群"
               style="width: 100px"
               @change="clusterChange"
               :disabled="props.clusterReadOnly"
    >
        <el-option
                v-for="item in clusterList"
                :key="item.id"
                :label="item.displayName"
                :value="item.id"
                :disabled="item.status=='InActive'"
        />
    </el-select>
    <el-select v-if="props.ShowNamespace"
               filterable
               v-model="namespace"
               placeholder="请选择NameSpace"
               style="margin-left: 10px;width: 200px"
               @change="namespaceChange"
               :disabled="props.nameSpaceReadOnly"
    >
        <el-option
                v-for="item in namespaceList"
                :key="item.metadata.name"
                :label="item.metadata.name"
                :value="item.metadata.name"
        />
    </el-select>

</template>
<style scoped>

</style>