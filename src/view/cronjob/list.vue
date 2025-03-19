<template>
    <List Title="CronJob列表">
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
                <el-table-column  prop="metadata.namespace" align="center" label="命名空间" width="120px"/>
                <el-table-column prop="spec.schedule" align="center" label="调度策略" width="140px"/>
                <el-table-column prop="spec.concurrencyPolicy" align="center" label="并发策略" width="140px"/>
                <el-table-column prop="spec.jobTemplate.spec.template.spec.restartPolicy" align="center" label="重启策略" width="140px"/>
                <el-table-column prop="spec.suspend" align="center" label="停止调度" width="140px">
                    <template #default="scope">
                        <el-switch
                            v-model="scope.row.spec.suspend"
                            class="ml-2"
                            inline-prompt
                            active-text="是"
                            inactive-text="否"
                            :before-change="beforeChangeSuspend.bind(this,scope.row)"
                        >

                        </el-switch>
                    </template>

                </el-table-column>
                <el-table-column  prop="status.lastScheduleTime" align="center" label="上一次调度时间" width="240px"/>
                <el-table-column  prop="status.lastSuccessfulTime" align="center" label="上一次成功时间" width="240px"/>
                <el-table-column fixed="right" align="center" label="操作" width="240">
                    <template #default="scope" >
                        <GenericOptions
                            v-if="!scope.row.metadata.deletionTimestamp"
                            :name="scope.row.metadata.name"
                            :clusterId="data.clusterId"
                            :name-space="data.nameSpace"
                            ResourceType="CronJob"
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
import {deleteCronJob, getCronJobList} from "../../api/scheduler/cronjob/cronjob.js";
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
const nsCallBack=(clusterId,nameSpace)=>{
    data.clusterId=clusterId
    data.nameSpace=nameSpace
    getList()
}
const getList=()=>{
    getCronJobList(data.clusterId,data.nameSpace).then((response)=>{
        data.items=response.data.data.items
    })
}

const deleteItem=(row,force)=>{
    const param={
        clusterId: data.clusterId,
        nameSpace:data.nameSpace,
        name: row.metadata.name,
        forceDelete: force
    }
    deleteCronJob(data).then((res)=>{
        ElMessageBox.confirm(
            '是否删除CronJob: '+row.metadata.name,
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
        "apiVersion":"batch/v1",
        "kind":"CronJob",
        "metadata":item.metadata,
        "spec":item.spec
    }
    data.yamlData=obj2yaml(itemTemp)
}
const editItem=(row)=>{
    router.push({
        path:"/cronjob/edit",
        query:{
            clusterId: data.clusterId,
            nameSpace:data.nameSpace,
            item: row.metadata.name,
        }
    })
}
const beforeChangeSuspend=(row)=>{
    return new Promise(async (resolve,reject)=>{
        return resolve(true)
        // return resolve(false)
    })
}
</script>

<style scoped>

</style>