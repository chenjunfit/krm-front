<template>
        <el-button  link type="primary" size="small" @click="editItem('Update')" >编辑</el-button>
        <el-button  link type="warning" size="small" @click="deleteItem" >删除</el-button>
        <el-button v-if="['Deployment','StatefulSet','DaemonSet'].includes(props.ResourceType)"  link type="warning" size="small" @click="restartItem" >重启</el-button>
        <el-button  link type="primary" size="small" @click="editItem('Copy')" >复制</el-button>
        <el-dropdown @command="handleCommand" v-if="['Deployment','StatefulSet','DaemonSet','CronJob'].includes(props.ResourceType)" style="margin-top: 3px;margin-left: 5px">
         <span class="el-dropdown-link"><el-button type="primary" link size="small">更多</el-button><el-icon class="el-icon--right">
        <arrow-down />
      </el-icon>
    </span>
                <template #dropdown>
                        <el-dropdown-menu>
                                <el-dropdown-item v-if="props.ResourceType=='Deployment'" command="rollback">回滚</el-dropdown-item>
                                <el-dropdown-item command="updateImage">更新镜像</el-dropdown-item>
                                <el-dropdown-item v-if="props.ResourceType!='CronJob'" >
                                    <MatchPod
                                            button-name="关联Pod"
                                            :cluster-id="props.clusterId"
                                            :name-space="props.nameSpace"
                                            :resource-type="props.ResourceType"
                                            :resource-name="props.item.metadata.name"
                                            field-selector=""
                                            :label-selector="props.item.spec.selector.matchLabels"
                                    >
                                    </MatchPod>
                                </el-dropdown-item>
                        </el-dropdown-menu>
                </template>
        </el-dropdown>
</template>

<script setup>
import {ElMessage, ElMessageBox} from "element-plus";
import {useRouter} from "vue-router";
import {deleteHandler, restartHandler} from "../../api/generic/generic.js";
import { ArrowDown } from '@element-plus/icons-vue'
import MatchPod from "./matchPod.vue";
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
        },
        item:{
            type:Object
        }
})
const handleCommand = (command) => {
}
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