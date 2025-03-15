<template>
    <List Title="Service列表">
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
                <el-table-column  prop="spec.type" align="center" label="类型" sortable width="240"/>
                <el-table-column  prop="spec.clusterIP" align="center" label="IP" sortable width="240"/>
                <el-table-column  prop="" align="center" label="端口" sortable width="240">
                    <template #default="scope">
                        <span v-for="port in scope.row.spec.ports" style="display: block">{{port.port}}/{{port.protocol}}</span>
                    </template>
                </el-table-column>
                <el-table-column  prop="" align="center" label="NodePort" sortable width="240">
                    <template #default="scope">
                        <div style="display: block">
                            <span v-if="scope.row.spec.type=='NodePort'" v-for="port in scope.row.spec.ports" >
                            {{port.port}}/{{port.protocol}}
                        </span>
                        </div>
                    </template>
                </el-table-column>

                <el-table-column  prop="metadata.namespace" align="center" label="命名空间" width="120"/>
                <el-table-column  prop="spec.sessionAffinity" align="center" label="会话保持" width="120"/>

                <el-table-column fixed="right" align="center" label="操作" width="240">
                    <template #default="scope" >
                        <GenericOptions
                                v-if="!scope.row.metadata.deleteTimestamp"
                                :name="scope.row.metadata.name"
                                :clusterId="data.clusterId"
                                :name-space="data.nameSpace"
                                ResourceType="Service"
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
import {deletePod, getPodList} from "../../api/scheduler/pod/pod.js";
import {ElMessage, ElMessageBox} from "element-plus";
import {getClusterList} from "../../api/cluster/cluster.js";
import Detail from "../namespace/detail.vue";
import {Codemirror} from "vue-codemirror";
import codeMirror from "../components/codeMirror.vue"
import {yaml} from "@codemirror/legacy-modes/mode/yaml";
import {obj2yaml} from "../../utils/index.js";
import {deleteDeployment, getDeploymentList} from "../../api/scheduler/deployment/deployment.js";
import DialogYaml from "../components/dialogYaml/dialogYaml.vue";
import {useRouter} from 'vue-router'
import GenericOptions from "../components/genericOptions.vue";
import {getSecretList} from "../../api/scheduler/secret/secret.js";
import {getServiceList} from "../../api/scheduler/service/service.js";
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
    getServiceList(data.clusterId,data.nameSpace).then((response)=>{
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
        "kind":"Service",
        "metadata":item.metadata,
        "spec":item.spec
    }
    data.yamlData=obj2yaml(itemTemp)
}
</script>

<style scoped>

</style>