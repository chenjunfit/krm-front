<template>
    <List Title="Secret列表">
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
                <el-table-column fixed prop="metadata.name" align="center" label="Secret名称" >
                    <template #default="scope" >
                        <el-button link type="primary" size="small" @click="detailNode(scope.row)" >
                            {{scope.row.metadata.name}}
                        </el-button>
                    </template>
                </el-table-column>
                <el-table-column  prop="type" align="center" label="类型" >
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
                                v-if="!scope.row.metadata.deletionTimestamp"
                                :name="scope.row.metadata.name"
                                :name-space="data.nameSpace"
                                :clusterId="data.clusterId"
                                ResourceType="Secret"
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
import {obj2yaml} from "../../utils/index.js";
import DialogYaml from "../components/dialogYaml/dialogYaml.vue";
import {useRouter} from 'vue-router'
import GenericOptions from "../components/genericOptions.vue";
import {getSecretList} from "../../api/scheduler/secret/secret.js";
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
const nsCallBack=(clusterId,nameSpace)=>{
    data.clusterId=clusterId
    data.nameSpace=nameSpace
    getList()
}
const deleteCallBack=()=>{
    getList()
}
const getList=()=>{
    const param={
        clusterId: data.clusterId,
        nameSpace:data.nameSpace
    }
    getSecretList(param).then((response)=>{
        data.items=response.data.data.items
    })
}


const detailNode=(row)=>{
    detailDialog.value=true
    const item=JSON.parse(JSON.stringify(row))
    delete item.metadata.managedFields
    const itemTemp={
        "apiVersion":"v1",
        "kind":"Secret",
        "metadata":item.metadata,
        "data":item.data,
        "immutable":item.immutable
    }
    data.yamlData=obj2yaml(itemTemp)
}
</script>

<style scoped>

</style>