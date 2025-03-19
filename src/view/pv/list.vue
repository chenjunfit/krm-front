<template>
    <List Title="PV列表">
        <template #header-options>
            <ClusterNamespaceSelect
                @clusterChangeCallback="nsCallBack"
                :ShowNamespace="false"
            >
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
                <el-table-column fixed prop="metadata.name" align="center" label="名称" width="160" >
                    <template #default="scope" >
                        <el-button link type="primary" size="small" @click="detailNode(scope.row)" >
                            {{scope.row.metadata.name}}
                        </el-button>
                    </template>
                </el-table-column>
                <el-table-column  prop="spec.capacity.storage" align="center" label="大小" width="140" >
                    <template #default="scope">
                        <span>{{scope.row.spec.capacity.storage}}</span>
                    </template>
                </el-table-column>
                <el-table-column  prop="spec.accessModes" align="center" label="访问模式" width="140">
                    <template #default="scope">
                        <span v-for="am in scope.row.spec.accessModes">{{am}}</span>
                    </template>
                </el-table-column>
                <el-table-column  prop="spec.storageClassName" align="center" label="存储类名称" width="140"/>
                <el-table-column  prop="spec.claimRef.name" align="center" label="pvc" width="200" >
                    <template #default="scope">
                        <span v-if="scope.row.spec.claimRef">{{scope.row.spec.claimRef.namespace}}/{{scope.row.spec.claimRef.name}}</span>
                        <span v-else></span>
                    </template>
                </el-table-column>

                <el-table-column  prop="spec.persistentVolumeReclaimPolicy" align="center" label="回收策略" width="140"/>
                <el-table-column  prop="status.phase" align="center" label="状态" />

                <el-table-column fixed="right" align="center" label="操作" width="140">
                    <template #default="scope" >
                        <GenericOptions
                                v-if="!scope.row.metadata.deletionTimestamp"
                                :name="scope.row.metadata.name"
                                :name-space="data.nameSpace"
                                :clusterId="data.clusterId"
                                ResourceType="PersistentVolume"
                                @deleteCallBack="getList"
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
import {ElMessage, ElMessageBox} from "element-plus";
import {getClusterList} from "../../api/cluster/cluster.js";
import Detail from "../namespace/detail.vue";
import {Codemirror} from "vue-codemirror";
import codeMirror from "../components/codeMirror.vue"
import {yaml} from "@codemirror/legacy-modes/mode/yaml";
import {obj2yaml} from "../../utils/index.js";
import DialogYaml from "../components/dialogYaml/dialogYaml.vue";
import {useRouter} from 'vue-router'
import GenericOptions from "../components/genericOptions.vue";
import {getConfigMapList} from "../../api/scheduler/configmap/configmap.js";
import {getPvList} from "../../api/scheduler/pv/pv.js";
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
const filterTableData = computed(() =>
    (data.items||[]).filter(
        (item) =>
            !search.value ||
            item.metadata.name.toLowerCase().includes(search.value.toLowerCase())
    )
)
const nsCallBack=(clusterId)=>{
    data.clusterId=clusterId
    getList()
}
const deleteCallBack=()=>{
    getList()
}
const getList=()=>{
    const params={
        clusterId: data.clusterId
    }
    getPvList(params).then((response)=>{
        data.items=response.data.data.items
    })
}

const detailNode=(row)=>{
    detailDialog.value=true
    const item=JSON.parse(JSON.stringify(row))
    delete item.metadata.managedFields
    const itemTemp={
        "apiVersion":"v1",
        "kind":"PersistentVolume",
        "metadata":item.metadata,
        "spec":item.spec,
    }
    data.yamlData=obj2yaml(itemTemp)
}
</script>

<style scoped>

</style>