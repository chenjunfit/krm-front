<template>
        <el-card class="el-card">
            <template #header>
                <div class="auto-space-between">
                    <!-- 头部左侧-->
                    <div>
                        <ClusterNamespaceSelect
                            @namespaceChangeCallback="namespaceCallBack"
                            :clusterReadOnly="props.clusterReadOnly"
                            :nameSpaceReadOnly="props.nameSpaceReadOnly"
                            :ShowNamespace="props.ShowNamespace"
                            v-if="props.ShowNamespace"
                        >
                        </ClusterNamespaceSelect>
                        <ClusterNamespaceSelect
                            @namespaceChangeCallback="namespaceCallBack"
                            :clusterReadOnly="props.clusterReadOnly"
                            :ShowNamespace="props.ShowNamespace"
                            @clusterChangeCallback="clusterChangedRollback"
                            v-else="!props.ShowNamespace"
                        >
                        </ClusterNamespaceSelect>
                        <slot name="header"></slot>
                    </div>
                    <!-- 头部右侧-->
                    <div>
                    </div>
                </div>
            </template>

            <slot name="main"></slot>
        </el-card>

</template>

<script setup>

import ClusterNamespaceSelect from "./clusterNamespaceSelect.vue";
import cluster from "../../routers/cluster/cluster.js";
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
const emtis=defineEmits(['namespaceChangedRollback','clusterChangedRollback'])
const namespaceCallBack=(clusterId,nameSpace)=>{
emtis('namespaceChangedRollback',clusterId,nameSpace)
}
const clusterChangedRollback=(clusterId)=>{
    emtis('namespaceChangedRollback',clusterId)
}
</script>

<style scoped>

</style>