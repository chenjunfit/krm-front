<template>
    <List Title="StatefulSet列表">
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
                <el-table-column prop="" align="center" label="副本" width="160px" >
                    <template #default="scope">
                        <el-input-number :controls="false" style="width: 100px" v-model="scope.row.spec.replicas" :min="0" :max="100" placeholder="副本数" @change="(currentValue,oldValue)=>handlechange(currentValue,oldValue,'StatefulSet',scope.row)"/>
                    </template>
                </el-table-column>
                <el-table-column prop="" align="center"  label="Handless Service" width="160px" >
                    <template #default="scope">
                       <span>{{scope.row.spec.serviceName}}</span>
                    </template>
                </el-table-column>
                <el-table-column fixed="right" align="center" label="操作" width="240">
                    <template #default="scope" >
                        <GenericOptions
                            v-if="!scope.row.metadata.deletionTimestamp"
                            :name="scope.row.metadata.name"
                            :clusterId="data.clusterId"
                            :name-space="data.nameSpace"
                            ResourceType="StatefulSet"
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
                @closeDialogHandler="(val)=>{detailDialog=val}"
            >

            </DialogYaml>
        </template>
    </List>

</template>

<script setup>
import ClusterNamespaceSelect from "../components/clusterNamespaceSelect.vue";
import List from "../components/list.vue"
import {computed, onBeforeMount, onMounted, reactive, ref, toRefs} from "vue";
import {deletePod, getPodList} from "../../api/scheduler/pod/pod.js";
import {ElMessage, ElMessageBox} from "element-plus";
import {getClusterList} from "../../api/cluster/cluster.js";
import Detail from "../namespace/detail.vue";
import {Codemirror} from "vue-codemirror";
import codeMirror from "../components/codeMirror.vue"
import {yaml} from "@codemirror/legacy-modes/mode/yaml";
import {obj2yaml} from "../../utils/index.js";
import DialogYaml from "../components/dialogYaml/dialogYaml.vue";
import {useRouter} from 'vue-router'
import {deleteStatefulset, getStatefulsetList, updateStatefulset} from "../../api/scheduler/statefulset/statefulset.js";
import GenericOptions from "../components/genericOptions.vue";
import {updateDeployment} from "../../api/scheduler/deployment/deployment.js";
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
            await updateStatefulset(postData).then((res)=>{
                ElMessage.success(res.data.message)
            }).catch((res)=>{
                row.spec.replicas=oldValue
                ElMessage.success(res.data.message)
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
    getStatefulsetList(data.clusterId,data.nameSpace).then((response)=>{
        data.items=response.data.data.items
    })
}
// const deleteItem=(row,force)=>{
//     const params={
//         clusterId: data.clusterId,
//         nameSpace:data.nameSpace,
//         name:row.metadata.name,
//         forceDelete:force,
//     }
//     deleteStatefulset(params).then((res)=>{
//         ElMessageBox.confirm(
//             '是否删除StatefulSet: '+row.metadata.name,
//             'Warning',
//             {
//                 confirmButtonText: 'OK',
//                 cancelButtonText: 'Cancel',
//                 type: 'warning',
//             }
//         ).then(() => {
//             ElMessage({
//                 message:res.data.message,
//                 type:"success"
//             })
//             getList()
//         })
//     })
// }
const detailNode=(row)=>{
    detailDialog.value=true
    const item=JSON.parse(JSON.stringify(row))
    delete item.metadata.managedFields
    const itemTemp={
        "apiVersion":"v1",
        "kind":"StatefulSet",
        "metadata":item.metadata,
        "spec":item.spec
    }
    data.yamlData=obj2yaml(itemTemp)
}
const editItem=(row)=>{
    router.push({
        path:"/statefulset/edit",
        query:{
            clusterId: data.clusterId,
            nameSpace:data.nameSpace,
            item: row.metadata.name,
        }
    })
}
</script>

<style scoped>

</style>