<template>
    <List Title="Deployment列表">
        <template #header-options>
            <ClusterNamespaceSelect @namespaceChangeCallback="nsCallBack" >
            </ClusterNamespaceSelect>
            <el-input v-model="search"  style="margin-left: 8px;height: 32px; width: 160px" size="small" placeholder="搜索" />
        </template>
        <template #main>
            <el-table :data="filterTableData"
                      style="width: 100%"
                      border
                      :scrollbar-always-on="true"
                      height="400px"
                      :default-sort="{ prop: 'metadata.creationTimestamp', order:'descending' }"
            >
                <el-table-column fixed prop="metadata.name" align="center" label="名称" width="240">
                    <template #default="scope" >
                        <el-button link type="primary" size="small" @click="detailNode(scope.row)" >
                            {{scope.row.metadata.name}}
                        </el-button>
                    </template>
                </el-table-column>
                <el-table-column  prop="metadata.creationTimestamp" align="center" label="创建时间" sortable width="240"/>
                <el-table-column  prop="metadata.namespace" align="center" label="命名空间" width="120"/>
                <el-table-column prop="" align="center" label="状态" >
                    <template #default="scope">
                        <span v-if="scope.row.spec.replicas!=0">{{scope.row.status.readyReplicas?scope.row.status.readyReplicas:'0'}}/{{scope.row.spec.replicas}}</span>
                        <span v-else></span>
                    </template>
                </el-table-column>
                <el-table-column prop="" align="center" label="副本" width="160" >
                    <template #default="scope">
                        <el-input-number style="width: 100px" :controls="false" v-model="scope.row.spec.replicas" :min="0" :max="100" placeholder="副本数" @change="(currentValue,oldValue)=>handlechange(currentValue,oldValue,'Deployment',scope.row)"/>
                    </template>
                </el-table-column>
                <el-table-column prop="" align="center"  label="暂停更新" width="120" >
                    <template #default="scope">
                        <el-switch v-model="scope.row.spec.paused" @change="updatePaused(scope.row)"/>
                    </template>
                </el-table-column>
                <el-table-column fixed="right" align="center" label="操作" width="240">
                    <template #default="scope" >
                        <GenericOptions
                                v-if="!scope.row.metadata.deletionTimestamp"
                                :name="scope.row.metadata.name"
                                :clusterId="data.clusterId"
                                :name-space="data.nameSpace"
                                ResourceType="Deployment"
                                @deleteCallBack="deleteCallBack"
                                :item="scope.row"
                        />
                    </template>
                </el-table-column>


            </el-table>
            <DialogYaml
                :clusterId="data.clusterId"
                :nameSpace="data.nameSpace"
                :showDialog="detailDialog"
                :yamlContent="data.yamlData"
                @closeDialogHandler="closeDialogHandler"
            >

            </DialogYaml>
        </template>
    </List>

</template>

<script setup>
import ClusterNamespaceSelect from "../components/clusterNamespaceSelect.vue";
import List from "../components/list.vue"
import {computed, onBeforeMount, onMounted, reactive, ref, toRefs, watch} from "vue";
import {deletePod, getPodList} from "../../api/scheduler/pod/pod.js";
import {ElMessage, ElMessageBox} from "element-plus";
import {getClusterList, updateNode} from "../../api/cluster/cluster.js";
import Detail from "../namespace/detail.vue";
import {Codemirror} from "vue-codemirror";
import codeMirror from "../components/codeMirror.vue"
import {yaml} from "@codemirror/legacy-modes/mode/yaml";
import {obj2yaml} from "../../utils/index.js";
import {deleteDeployment, getDeploymentList, updateDeployment} from "../../api/scheduler/deployment/deployment.js";
import DialogYaml from "../components/dialogYaml/dialogYaml.vue";
import {useRouter} from 'vue-router'
import GenericOptions from "../components/genericOptions.vue";
const router=useRouter()

const detailDialog=ref(false)
const data=reactive({
    clusterId:"",
    nameSpace:"",
    items:[],
    yamlData:"",
})
const search = ref('')
const {clusterId,namespace,items,yamlData}=toRefs(data)
const oldReplicas=ref('')
const closeDialogHandler=(val)=>{
    detailDialog.value=val
}
const updatePaused=async (row)=>{
    const postData={
        clusterId: data.clusterId,
        namespace:data.nameSpace,
        item:row,
    }
    await updateDeployment(postData).then((res)=>{
        if(res.data.status==200){
            ElMessage.success(res.data.message)
        }else{
            ElMessage.error(res.data.message)
            row.spec.paused=!row.spec.paused
        }
    }).catch(
        err=>{
            ElMessage.error(err.message)
            row.spec.paused=!row.spec.paused
        }
    )

}
const handlechange=(currentValue,oldValue,type,row)=>{
    ElMessageBox.confirm(
        `是否修改${type}:${row.metadata.name}的副本数为${currentValue}?`,
        {
            confirmButtonText: '确定',
            cancelButtonText: '取消',
            type: 'warning',
        }
    )
        .then(async () => {
            const postData={
                clusterId: data.clusterId,
                namespace: data.nameSpace,
                item: row,
            }
          await updateDeployment(postData).then((res)=>{
               ElMessage.success(res.data.message)
           }).catch((res)=>{
               row.spec.replicas=oldValue
               ElMessage.error(res.data.message)
           })
        })
        .catch(() => {
            row.spec.replicas=oldValue
        })
}

const filterTableData = computed(() =>
    (data.items||[]).filter(
        (item) =>
            !search.value ||
            item.metadata.name.toLowerCase().includes(search.value.toLowerCase())
    )
)
const nsCallBack=(clusterId,nameSpace)=>{
    data.clusterId=clusterId
    data.nameSpace=nameSpace
    getList()
}
const deleteCallBack=()=>{
    getList()
}
const getList=()=>{
    getDeploymentList(data.clusterId,data.nameSpace).then((response)=>{
        data.items=[]
        data.items=response.data.data.items
    })
}
const deleteItem=(row,force)=>{
    deleteDeployment(data.clusterId,data.nameSpace,row.metadata.name,force).then((res)=>{
        ElMessageBox.confirm(
            '是否删除Deployment: '+row.metadata.name,
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
            getList()
        })
    })
}
const detailNode=(row)=>{
    detailDialog.value=true
    const item=JSON.parse(JSON.stringify(row))
    delete item.metadata.managedFields
    const itemTemp={
        "apiVersion":"apps/v1",
        "kind":"Deployment",
        "metadata":item.metadata,
        "spec":item.spec
    }
    data.yamlData=obj2yaml(itemTemp)
}
const editItem=(row,arg)=>{
    router.push({
        path:"/deployment/edit",
        query:{
            clusterId: data.clusterId,
            nameSpace:data.nameSpace,
            item: row.metadata.name,
            method:arg
        }
    })
}
</script>

<style scoped>

</style>