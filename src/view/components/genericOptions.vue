<template>
        <el-button  link type="primary" size="small" @click="editItem('Update')" >编辑</el-button>
        <el-button  link type="warning" size="small" @click="deleteItem" >删除</el-button>
        <el-button v-if="['Deployment','StatefulSet','DaemonSet'].includes(props.ResourceType)"  link type="warning" size="small" @click="restartItem" >重启</el-button>
        <el-button  link type="primary" size="small" @click="editItem('Copy')" >复制</el-button>
</template>

<script setup>
import {deleteDeployment, updateDeployment} from "../../api/scheduler/deployment/deployment.js";
import {ElMessage, ElMessageBox} from "element-plus";
import {useRouter} from "vue-router";
import {deleteHandler, restartHandler} from "../../api/generic/generic.js";
const router=useRouter()
const props=defineProps({
        ResourceType:{
                type: String,
                default:'Deployment'
        },
        clusterId:{
                type:String,
                required:true
        },
        nameSpace:{
                type:String
        },
        name:{
                type:String,
                required:true
        }
})
const emits=defineEmits(['deleteCallBack'])
const restartItem=()=>{
        ElMessageBox.confirm(
            `是否重启${props.ResourceType}:${props.name}?`,
            {
                    confirmButtonText: '确定',
                    cancelButtonText: '取消',
                    type: 'warning',
            }
        )
            .then(async () => {
                    console.log(props.ResourceType,props.name,props.clusterId,props.nameSpace)
                    await restartHandler(props.ResourceType,props.name,props.clusterId,props.nameSpace).then((res)=>{
                            ElMessage.success(res.data.message)
                    }).catch((res)=>{
                            ElMessage.error(res.data.message)
                    })
            })
            .catch(() => {
                   return
            })
}
const deleteItem=()=>{
    deleteHandler(props.ResourceType,props.clusterId,props.nameSpace,props.name).then((res)=>{
        ElMessageBox.confirm(
            `是否删除${props.ResourceType}: ${props.name}`,
            'Warning',
            {
                confirmButtonText: 'OK',
                cancelButtonText: 'Cancel',
                type: 'warning',
            }
        ).then(() => {
            ElMessage({
                message:res.data.message,
                type:"success"
            })
            emits('deleteCallBack')
        })
    })
}
const editItem=(arg)=>{

        const resourceType=props.ResourceType.toLowerCase()
        let path=`/${resourceType}/edit`
        if(resourceType=='persistentvolume'){
                path='/pv/edit'
        }else if(resourceType=='persistentvolumeclaim'){
                path='/pvc/edit'
        }
        router.push({
                path:path,
                query:{
                        clusterId: props.clusterId,
                        nameSpace:props.nameSpace,
                        name: props.name,
                        method:arg
                }
        })
}
</script>

<style scoped>

</style>