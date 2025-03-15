<template>
    <List Title="Pod列表">
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
                        <el-icon v-if="scope.row.status.phase=='Running'" color="green">{{scope.row.status.phase}}</el-icon>
                        <el-icon v-else color="red">{{scope.row.status.phase}}</el-icon>
                    </template>
                </el-table-column>
                <el-table-column  prop="" align="center" label="重启次数" width="100">
                    <template #default="scope">
                        <span v-if="!scope.row.metadata.deleteTimestamp">
                            {{getPodRestartCount(scope.row)[0]}}
                        </span>
                    </template>
                </el-table-column>
                <el-table-column prop="" align="center" label="容器状态" width="100">
                    <template #default="scope">
                        <span v-if="!scope.row.metadata.deleteTimestamp">
                            {{getPodRestartCount(scope.row)[1]}}
                        </span>
                    </template>
                </el-table-column>
                <el-table-column  prop="status.podIP" align="center" label="Pod IP"  width="120"/>
                <el-table-column  prop="spec.nodeName" align="center" label="宿主机"  width="240"/>
                <el-table-column  prop="status.hostIP" align="center" label="Host IP" width="120"  />

                <el-table-column fixed="right" align="center" label="操作" width="240">
                    <template #default="scope" >
                        <el-button v-if="!scope.row.metadata.deleteTimestamp" link type="warning" size="small" @click="deleteItem(scope.row,false)" >删除</el-button>
                        <el-button v-else link type="warning" size="small" @click="deleteItem(scope.row,true)" >强制删除</el-button>
                        <el-button  v-if="!scope.row.metadata.deleteTimestamp" link type="info"  size="small" @click="deleteNs(scope.row)" >查看日志</el-button>
                        <el-button  v-if="!scope.row.metadata.deleteTimestamp" link type="info" size="small" @click="deleteNs(scope.row)" >执行命令</el-button>
                    </template>
                </el-table-column>


            </el-table>
            <el-dialog
                v-model="detailDialog"
                title="详情"
                width="60%"
                destroy-on-close
            >
                <template #header="{titleId, titleClass }">
                    <div class="my-header">
                        <div :id="titleId" :class="titleClass">
                            <el-button type="primary" >
                                <i class="iconfont icon-bushu" style="width: 50px"/>
                                <div>{{data.clusterId}}</div>
                            </el-button>
                            <el-button type="primary" >
                                <i class="iconfont icon-rongqi" style="width: 50px"/>
                                <div>{{data.namespace}}</div>
                            </el-button>
                        </div>

                    </div>
                </template>
                <codeMirror v-model="data.yamlData"></codeMirror>
            </el-dialog>

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

const detailDialog=ref(false)
const data=reactive({
    clusterId:"",
    namespace:"",
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
    data.namespace=nameSpace
    getList()
}
const getList=()=>{
getPodList(data.clusterId,data.namespace).then((response)=>{
    data.items=response.data.data.items
})
}
onBeforeMount(()=>{
   getList()
})
const getPodRestartCount=computed(()=>(row)=>{
    let restartCount=0
    let readyCount=0
    row.status.containerStatuses.forEach(item=>{
        restartCount+=item.restartCount
        if (item.ready){
            readyCount+=1
        }
    })
    const containerTotal=row.status.containerStatuses.length
    const readyStatus=`${readyCount}/${containerTotal}`
    return [restartCount,readyStatus]
})
const deleteItem=(row,force)=>{
    deletePod(data.clusterId,data.namespace,row.metadata.name,force).then((res)=>{
        ElMessageBox.confirm(
            '是否删除Pod: '+row.metadata.name,
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
        "apiVersion":"v1",
        "kind":"Pod",
        "metadata":item.metadata,
        "spec":item.spec
    }
    data.yamlData=obj2yaml(itemTemp)
}
</script>

<style scoped>

</style>