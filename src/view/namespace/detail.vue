<script setup>
import {computed} from "vue";

const props=defineProps({
    DetailItem:{
        type: Object
    }
})
const getNoeRole=computed(()=>{
    const listKey=Object.keys(props.DetailItem.metadata.labels)
    if (listKey.length==0){
        return "工作节点"
    }
    if(listKey.includes('node-role.kubernetes.io/control-plane')||
        listKey.includes('node-role.kubernetes.io/controlplane')||
        listKey.includes('node-role.kubernetes.io/master')
    ){
        return "控制节点"
    }
    return "工作节点"
})
</script>
<template>
<div>
    <el-descriptions :column="3" border>
        <el-descriptions-item label="主机名">
            <span>{{props.DetailItem.metadata.name}}</span>
        </el-descriptions-item>
        <el-descriptions-item label="IP">
            <span>{{props.DetailItem.status.addresses[0].address}}</span>
        </el-descriptions-item>
        <el-descriptions-item label="角色">
            <el-tag size="large">{{getNoeRole}}</el-tag>
        </el-descriptions-item>
        <el-descriptions-item label="状态">
            <el-tag size="large" :type="props.DetailItem.status.conditions[props.DetailItem.status.conditions.length-1].status?'success':'danger'">
                {{props.DetailItem.status.conditions[props.DetailItem.status.conditions.length-1].reason}}
            </el-tag>
        </el-descriptions-item>
        <el-descriptions-item label="Pod">
            <el-button type="primary">查看</el-button>
        </el-descriptions-item>
        <el-descriptions-item label="系统">
            <span>{{props.DetailItem.status.nodeInfo.osImage}}</span>
        </el-descriptions-item>
        <el-descriptions-item label="Runtime">
            <span>{{props.DetailItem.status.nodeInfo.containerRuntimeVersion}}</span>
        </el-descriptions-item>
        <el-descriptions-item label="架构">
            <span>{{props.DetailItem.status.nodeInfo.architecture}}</span>
        </el-descriptions-item>
        <el-descriptions-item label="组件版本">
            <span>
               Kubelet:{{props.DetailItem.status.nodeInfo.kubeletVersion}}
            </span>
            <span style="margin-left: 10px">
                KubeProxy:{{props.DetailItem.status.nodeInfo.kubeletVersion}}
            </span>
        </el-descriptions-item>
        <el-descriptions-item label="系统内核">
            <span>{{props.DetailItem.status.nodeInfo.kernelVersion}}</span>
        </el-descriptions-item>
    </el-descriptions>
</div>
</template>
<style scoped>

</style>