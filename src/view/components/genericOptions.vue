<template>
        <el-button  link type="primary" size="small" @click="editItem('Update')" >编辑</el-button>
        <el-button  link type="warning" size="small" @click="deleteItem" >删除</el-button>
        <el-button  link type="primary" size="small" @click="editItem('Copy')" >复制</el-button>
</template>

<script setup>
import {deleteDeployment} from "../../api/scheduler/deployment/deployment.js";
import {ElMessage, ElMessageBox} from "element-plus";
import {useRouter} from "vue-router";
import {deleteHandler} from "../../api/generic/generic.js";
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
        router.push({
                path:`/${resourceType}/edit`,
                query:{
                        clusterId: props.clusterId,
                        nameSpace:props.nameSpace,
                        item: props.name,
                        method:arg
                }
        })
}
</script>

<style scoped>

</style>