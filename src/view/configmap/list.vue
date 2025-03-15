<template>
    <List Title="ConfigMap列表">
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
                <el-table-column fixed prop="metadata.name" align="center" label="名称" >
                    <template #default="scope" >
                        <el-button link type="primary" size="small" @click="detailNode(scope.row)" >
                            {{scope.row.metadata.name}}
                        </el-button>
                    </template>
                </el-table-column>
                <el-table-column  prop="immutable" align="center" label="只读" >
                    <template #default="scope">
                        <span>{{scope.row.immutable?'true':'false'}}</span>
                    </template>
                </el-table-column>
                <el-table-column  prop="metadata.namespace" align="center" label="命名空间" />
                <el-table-column fixed="right" align="center" label="操作" >
                    <template #default="scope" >
                        <GenericOptions
                                v-if="!scope.row.metadata.deleteTimestamp"
                                :name="scope.row.metadata.name"
                                :name-space="data.nameSpace"
                                :clusterId="data.clusterId"
                                ResourceType="Ingress"
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
    data.items.filter(
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
    getConfigMapList(data.clusterId,data.nameSpace).then((response)=>{
        data.items=response.data.data.items
    })
}
onBeforeMount(()=>{
    getList()

})

const detailNode=(row)=>{
    detailDialog.value=true
    const item=JSON.parse(JSON.stringify(row))
    delete item.metadata.managedFields
    const itemTemp={
        "apiVersion":"v1",
        "kind":"ConfigMap",
        "metadata":item.metadata,
        "data":item.data,
        "immutable":item.immutable
    }
    data.yamlData=obj2yaml(itemTemp)
}
</script>

<style scoped>

</style>