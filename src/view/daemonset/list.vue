<template>
    <List Title="DaemonSet列表">
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

                    <span>1/1</span>
                </el-table-column>
                <el-table-column fixed="right" align="center" label="操作" width="240">
                    <template #default="scope" >
                        <GenericOptions
                            v-if="!scope.row.metadata.deletionTimestamp"
                            :name="scope.row.metadata.name"
                            :clusterId="data.clusterId"
                            :name-space="data.nameSpace"
                            ResourceType="DaemonSet"
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
import {deleteDaemonset, getDaemonsetList} from "../../api/scheduler/daemonset/daemonset.js";
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
const filterTableData = computed(() =>
    (data.items||[]).filter(
        (item) =>
            !search.value ||
            item.metadata.name.toLowerCase().includes(search.value.toLowerCase())
    )
)
const nsCallBack=async (clusterId,nameSpace)=>{
    data.clusterId=clusterId
    data.nameSpace=nameSpace
    await getList()
}
const getList= async ()=>{
    await getDaemonsetList(data.clusterId,data.nameSpace).then((response)=>{
        data.items=response.data.data.items
    })
}
const detailNode=(row)=>{
    detailDialog.value=true
    const item=JSON.parse(JSON.stringify(row))
    delete item.metadata.managedFields
    const itemTemp={
        "apiVersion":"v1",
        "kind":"DaemonSet",
        "metadata":item.metadata,
        "spec":item.spec
    }
    data.yamlData=obj2yaml(itemTemp)
}
const editItem=(row)=>{
    router.push({
        path:"/daemonset/edit",
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