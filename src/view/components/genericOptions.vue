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
                            <el-dropdown-item v-if="props.ResourceType=='Deployment'" command="rollback"><el-button type="primary" link @click="rollback=true">回滚</el-button></el-dropdown-item>
                                <el-dropdown-item command="updateImage"><el-button type="primary" link @click="visable=true">更新镜像</el-button></el-dropdown-item>
                                <el-dropdown-item v-if="props.ResourceType!='CronJob'" >
                                    <MatchPod
                                            button-name="关联Pod"
                                            :cluster-id="props.clusterId"
                                            :name-space="props.nameSpace"
                                            :resource-type="props.ResourceType"
                                            :resource-name="props.item.metadata.name"
                                            field-selector=""
                                            font-size="15px"
                                            :label-selector="props.item.spec.selector.matchLabels"
                                    >
                                    </MatchPod>
                                </el-dropdown-item>
                        </el-dropdown-menu>
                </template>
        </el-dropdown>
    <el-dialog
            v-model="visable"
            append-to-body
            width="70%"
            center
            draggable
    >
        <template #header="{titleId,titleClass}">
            <div class="my-header">
                <div :id="titleId" :class="titleClass" style="margin: 10px auto 0 auto">
                    <el-tag title="集群">
                        {{props.clusterId}}
                    </el-tag>
                    <el-tag title="命名空间">
                        {{props.nameSpace}}
                    </el-tag>
                    <el-tag title="类型">
                        {{props.ResourceType}}
                    </el-tag>
                    <el-tag title="资源名">
                        {{props.item.metadata.name}}
                    </el-tag>
                </div>
            </div>
        </template>
        <el-form :model="containers" ref="updateImagesFormRef">
            <el-tabs v-model="activeName" class="demo-tabs" >
                <el-tab-pane
                        v-for="(c,index) in containers"
                        :label="c.name"
                        :name="index"
                        :key="c.name">
                    <el-form-item
                            label="镜像地址"
                            :prop="index +'.image'"
                            :rules="[{required:true,message:'请输入镜像地址',trigger:'blur'}]">
                      <el-input v-model.trim="c.image" @change="()=>{updateImageButton=false}"/>
                    </el-form-item>
                </el-tab-pane>

            </el-tabs>
        </el-form>
        <template #footer>
            <div >
                <el-button type="primary" @click="visable=false">取消</el-button>
                <el-button :disabled="updateImageButton" type="primary"  @click="updateImage" >确认</el-button>
            </div>
        </template>
    </el-dialog>
    <el-dialog
            v-model="rollback"
            append-to-body
            width="70%"
            center
            draggable
    >
        <template #header="{titleId,titleClass}">
            <div class="my-header">
                <div :id="titleId" :class="titleClass" style="margin: 10px auto 0 auto">
                    <el-tag title="集群">
                        {{props.clusterId}}
                    </el-tag>
                    <el-tag title="命名空间">
                        {{props.nameSpace}}
                    </el-tag>
                    <el-tag title="类型">
                        {{props.ResourceType}}
                    </el-tag>
                    <el-tag title="资源名">
                        {{props.item.metadata.name}}
                    </el-tag>
                </div>
            </div>
        </template>
        <div>
            <el-form-item label="当前版本">
                <span>{{props.item.metadata.annotations['deployment.kubernetes.io/revision']}}</span>
            </el-form-item>
            <el-form-item label="请选择要回滚的版本">
                <div class="flex flex-wrap gap-4 items-center">
                    <el-select
                        v-model="currentSelectedItem"
                        value-key="metadata.name"
                        placeholder="选择要回滚的版本"
                        style="width: 480px"
                        @change="rollbackChanged"
                        @visible-change="getRollbackList"
                    >
                        <el-option
                            v-for="item in rollbackDataList"
                            :key="item.metadata.name"
                            :label="'版本:'+item.metadata.annotations['deployment.kubernetes.io/revision']+':'+item.metadata.annotations['kubernetes.io/change-cause']"
                            :value="item"
                        />
                    </el-select>
                </div>
            </el-form-item>
            <div>
                <CodeMirror
                    v-model="yamlData"
                    height="400px"
                ></CodeMirror>
            </div>
        </div>
        <template #footer>
            <div >
                <el-button type="primary" @click="rollback=false">取消</el-button>
                <el-button  type="primary"  @click="rollbackDeployment" >确认</el-button>
            </div>
        </template>
    </el-dialog>
</template>

<script setup>
import {ElMessage, ElMessageBox} from "element-plus";
import {useRouter} from "vue-router";
import {deleteHandler, listHandler, restartHandler, updateHandler} from "../../api/generic/generic.js";
import { ArrowDown } from '@element-plus/icons-vue'
import MatchPod from "./matchPod.vue";
import {onBeforeMount, ref} from "vue";
import {getReplicasetList} from "../../api/scheduler/deployment/deployment.js";
import {obj2yaml, object2list, objectToString} from "../../utils/index.js";
import CodeMirror from "./codeMirror.vue";
const router=useRouter()
const visable=ref(false)
const rollback=ref(false)
const updateImagesFormRef=ref('')
const activeName=ref(0)
let updateImageButton=ref(true)
let containers=ref([])
const currentSelectedItem=ref()
let rollbackDataList=ref([])
let yamlData=ref('')
const rollbackChanged=(val)=>{
    delete val.metadata.managedFields
    const itemTemp={
        "apiVersion":"apps/v1",
        "kind":"ReplicaSet",
        "metadata":val.metadata,
        "spec":val.spec
    }
    yamlData.value=obj2yaml(itemTemp)
}
const getRollbackList= async (visable)=>{
    if(visable){
        const fieldSelector=''
        const labelSelector=objectToString(props.item.spec.selector.matchLabels,",")
        await getReplicasetList(props.clusterId,props.nameSpace,fieldSelector,labelSelector).then((res)=>{
            let items=res.data.data.items
            items.sort(
                (a,b)=>
                b.metadata.annotations['deployment.kubernetes.io/revision']-
                a.metadata.annotations['deployment.kubernetes.io/revision']
            )
            rollbackDataList.value=items
        })
    }

}
const rollbackDeployment=()=>{
        ElMessageBox.confirm(
            `是否回滚${props.ResourceType}: ${props.name}`,
            'Warning',
            {
                confirmButtonText: 'OK',
                cancelButtonText: 'Cancel',
                type: 'warning',
            }
        ).then(() => {
            props.item.spec.template=currentSelectedItem.value.spec.template
            delete props.item.spec.template.metadata.labels['pod-template-hash']
            updateHandler(props.ResourceType,props.item.metadata.name,props.clusterId,props.nameSpace,props.item).then((res)=>{
                ElMessage({
                    message:res.data.message,
                    type:"success"
                })
                rollback.value=false
                emits('deleteCallBack')
            })

        }).catch(()=>{
            return
        })

}
const updateImage=()=>{
    updateImagesFormRef.value.validate((valid)=>{
        if(valid){
            ElMessageBox.confirm(
                `是否更新${props.ResourceType}: ${props.name}的镜像`,
                'Warning',
                {
                    confirmButtonText: 'OK',
                    cancelButtonText: 'Cancel',
                    type: 'warning',
                }
            ).then(() => {
                updateHandler(props.ResourceType,props.item.metadata.name,props.clusterId,props.nameSpace,props.item).then((res)=>{
                    ElMessage({
                        message:res.data.message,
                        type:"success"
                    })
                    emits('deleteCallBack')
                })

            }).catch(()=>{
                return
            })
        }else{
            ElMessage.warning('请输入镜像地址')
            updateImageButton.value=true
        }
    })
    visable.value=false
}
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
onBeforeMount(()=>{
    if(props.item!=null||props.item!=undefined){
        if(['Deployment','StatefulSet','DaemonSet'].includes(props.ResourceType)){
            containers.value=props.item.spec.template.spec.containers
        }else if(props.ResourceType=='CronJob'){
            containers.value=props.item.spec.jobTemplate.spec.template.spec.containers
        }
    }

})
</script>

<style scoped>
.el-tag{
    margin-left: 10px;
}
</style>