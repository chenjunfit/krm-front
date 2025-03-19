<template>
    <el-card
        class="box-card"
        element-loading-text="玩命加载中"
    >
        <template #header>
            <div class="card-header" >
                <div>
                    <span>节点列表</span>
                </div>
                <div class="card-header">
                    <el-select v-model="clusterId" placeholder="请选择集群" style="width: 240px" @change="getNodeListHandler">
                        <el-option
                            v-for="item in clusterList"
                            :key="item.id"
                            :label="item.displayName"
                            :value="item.id"
                            :disabled="item.status=='InActive'"
                        />
                    </el-select>
                    <el-input v-model="search"  style="margin-left: 8px;height: 32px;" size="small" placeholder="搜索" />
                </div>
            </div>
            <el-table :data="filterTableData"
                      style="width: 100%"
                      border
                      height="400px"
                      :default-sort="{ prop: 'id', order: 'ascending' }"
            >
                <el-table-column fixed prop="" align="center" label="主机名" width="120" >
                    <template #default="scope" >
                        <el-button link type="primary" size="small" @click="detailNode(scope.row)" >
                            {{scope.row.metadata.name}}
                        </el-button>
                    </template>
                </el-table-column>
                <el-table-column prop="status.addresses[0].address" align="center" label="IP" width="150" />
                <el-table-column prop="metadata.name" sortable align="center" label="角色" width="80" />
                <el-table-column prop="metadata.name" align="center" label="节点状态" width="180" >
                </el-table-column>
                <el-table-column prop="" align="center" label="状态" width="80" >
                    <template #default="scope">
                        <el-icon v-if="scope.row.status.conditions[scope.row.status.conditions.length-1].status=='True'" color="green">Ready</el-icon>
                        <el-icon v-else color="red">NotReady</el-icon>
                    </template>
                </el-table-column>
                <el-table-column prop="" align="center"  label="禁止调度" width="120" >
                    <template #default="scope">
                        <el-switch v-model="value1"/>
                    </template>
                </el-table-column>
                <el-table-column prop="" align="center" label="驱逐" width="120" >
                    <template #default="scope">
                        <el-switch v-model="value1"/>
                    </template>
                </el-table-column>
                <el-table-column fixed="right" align="center" label="操作" min-width="100">
                    <template #default="scope" >
                        <el-button link type="primary" size="small" @click="updateNode(scope.row)" :disabled="scope.row.status=='Active'">编辑</el-button>
                    </template>
                </el-table-column>


            </el-table>
            <div class="auto-space-between" style="margin-top: 10px">
                <div>批量</div>
                <div>总数: {{filterTableData.length}}</div>
            </div>
            <el-dialog
                v-model="nodeDialog"
                :append-to-body="true"
                :title="clusterId+'-'+editNodeName"
                :center="true"
                width="60%"
                @close="closeDialog"
                destroy-on-close
            >
                <Edit @callback="getNodeListHandler(data.clusterId)"
                      :EditItem="editItem"
                      :ClusterId="data.clusterId"
                      @close-dialog-emit="closeDialogEmit"
                >

                </Edit>

            </el-dialog>
            <el-dialog
                v-model="detailDialog"
                :append-to-body="true"
                :title="clusterId+'-'+detailNodeName"
                :center="true"
                width="60%"
                @close="closeDialog"
                destroy-on-close
            >
                <Detail :DetailItem="detailItem"
                        @close-dialog-emit="closeDialogEmit"
                >

                </Detail>

            </el-dialog>
        </template>
    </el-card>

</template>

<script setup>
import {getClusterList, getNode, getNodeList} from "../../api/cluster/cluster.js";
import {computed, onBeforeMount, reactive, ref, toRefs} from "vue";
import {Check,Close} from "@element-plus/icons-vue";
import {useRoute} from "vue-router";
import Edit from "./edit.vue";
import node from "../../routers/cluster/node.js";
import Detail from "./detail.vue";
import ClusterNamespaceSelect from "../components/clusterNamespaceSelect.vue";
const loading=ref(true)
const nodeDialog=ref(false)
const detailDialog=ref(false)
const search = ref('')
const  value1=ref('')
const data=reactive({
    items:[],
    clusterList:[],
    clusterId:"",
    editItem:{},
    detailItem:{},
    editNodeName:"",
    detailNodeName:"",
})
const {clusterId,clusterList,editItem,editNodeName,detailNodeName,detailItem}=toRefs(data)
const route=useRoute()
const  getAllClusters=async ()=>{
await getClusterList().then((response)=>{
     data.clusterList=response.data.data.items
})
}
const getNodeListHandler=()=>{
    console.log(data.clusterId)
    getNodeList(data.clusterId).then((response)=>{
        data.items=response.data.data.items
        loading.value=false
    })
}
onBeforeMount(async ()=>{
    await getAllClusters()
    const defaultClusterId=data.clusterList[0].id
    const currentClusterId=route.query.id
    data.clusterId=currentClusterId?currentClusterId:defaultClusterId
    getNodeListHandler()
})

const updateNode=(row)=>{
    loading.value=true
    nodeDialog.value=true
    data.editItem=row
    data.editNodeName=data.editItem.metadata.name
    loading.value=false
}
const detailNode=(row)=>{
    loading.value=true
    detailDialog.value=true
    data.detailItem=row
    data.detailNodeName=data.detailItem.metadata.name
    loading.value=false
}


const closeDialog=()=>{
    getNodeListHandler(clusterId)
}
const closeDialogEmit=()=>{
    nodeDialog.value=false
}

const filterTableData = computed(() =>
    (data.items||[]).filter(
        (item) =>
            !search.value ||
            item.metadata.name.toLowerCase().includes(search.value.toLowerCase())||
            item.status.addresses[0].address.toLowerCase().includes(search.value.toLowerCase())
    )
)
</script>

<style scoped>
.card-header{
    display: flex;
    align-items: center;
    justify-content: space-between;
}
</style>