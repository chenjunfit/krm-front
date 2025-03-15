<template>
    <el-card
        class="box-card"
        element-loading-text="玩命加载中"
    >
        <template #header>
            <div class="card-header" >
                <div>
                    <span>名称空间列表</span>
                </div>
                <div class="card-header">
                    <el-select v-model="clusterId" placeholder="请选择集群" style="width: 140px" @change="getNamespaceListHandler(clusterId)">
                        <el-option
                            v-for="item in clusterList"
                            :key="item.id"
                            :label="item.id"
                            :value="item.displayName"
                            :disabled="item.status=='InActive'"
                        />
                    </el-select>
                    <el-input v-model="search"  style="margin-left: 8px;height: 32px; width: 160px" size="small" placeholder="搜索" />
                    <el-button type="primary" style="margin-left: 10px" @click="createNamespace">创建</el-button>
                </div>
            </div>
            <el-table :data="filterTableData"
                      style="width: 100%"
                      border
                      height="400px"
                      :default-sort="{ prop: 'name', order: 'ascending' }"
            >
                <el-table-column fixed prop="name" align="center" label="名称" >
                    <template #default="scope" >
                        <el-button link type="primary" size="small" @click="detailNode(scope.row)" >
                            {{scope.row.metadata.name}}
                        </el-button>
                    </template>
                </el-table-column>
                <el-table-column fixed prop="metadata.creationTimestamp" align="center" label="创建时间" sortable />

                <el-table-column prop="" align="center" label="状态" >
                    <template #default="scope">
                        <el-icon v-if="scope.row.status.phase=='Active'" color="green">Active</el-icon>
                        <el-icon v-else color="red">NotActive</el-icon>
                    </template>
                </el-table-column>
                <el-table-column fixed="right" align="center" label="操作" >
                    <template #default="scope" >
                        <el-button link type="primary" size="small" @click="deleteNs(scope.row)" >资源复制</el-button>
                        <el-button link type="primary" size="small" @click="updateNamespace(scope.row)" :disabled="scope.row.status=='Active'">编辑</el-button>
                        <el-button link type="primary" size="small" @click="deleteNs(scope.row)" >删除</el-button>


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
                <Edit @callback="getNamespaceListHandler(data.clusterId)"
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
            <el-dialog
                v-model="createDialog"
                :append-to-body="true"
                title="创建命名空间"
                :center="true"
                width="30%"
                @close="closeDialog"
                destroy-on-close
            >
                <div >
                    <div>
                        <el-input v-model.trim="createName"  placeholder="请输入namespace名称" />
                    </div>
                    <div style="margin-top: 10px;text-align: center">
                        <el-button type="primary" @click="submitCreateNamespace">创建</el-button>
                    </div>
                </div>
            </el-dialog>
            <el-dialog
                v-model="deleteDialog"
                :append-to-body="true"
                :title="'删除命名空间'+deleteName"
                :center="true"
                width="30%"
                @close="closeDialog"
                destroy-on-close
            >
                <div >
                    <div>
                        <el-input v-model.trim="deleteNameConfirm"  placeholder="请输入namespace名称" />
                    </div>
                    <div style="margin-top: 10px;text-align: center">
                        <el-button type="primary" @click="submitDeleteNamespace(data.clusterId,deleteName)">删除</el-button>
                    </div>
                </div>
            </el-dialog>
        </template>
    </el-card>

</template>

<script setup>
import {getClusterList, getNamespaceList,addNamespace,deleteNamespace} from "../../api/cluster/cluster.js";
import {computed, onBeforeMount, reactive, ref, toRefs} from "vue";
import {Check,Close} from "@element-plus/icons-vue";
import {useRoute} from "vue-router";
import Edit from "./edit.vue";
import Detail from "./detail.vue";
import {ElMessage} from "element-plus";
const loading=ref(true)
const nodeDialog=ref(false)
const detailDialog=ref(false)
const createDialog=ref(false)
const deleteDialog=ref(false)
const search = ref('')
const data=reactive({
    items:[],
    clusterList:[],
    clusterId:"",
    editItem:{},
    detailItem:{},
    editNodeName:"",
    detailNodeName:"",
    createName:"",
    deleteName:"",
    deleteNameConfirm:""

})
const {clusterId,clusterList,editItem,editNodeName,detailNodeName,detailItem,createName,deleteName,deleteNameConfirm}=toRefs(data)
const route=useRoute()
const  getAllClusters=async ()=>{
    await getClusterList().then((response)=>{
        data.clusterList=response.data.data.items
    })
}
const getNamespaceListHandler=(clusterId)=>{
    getNamespaceList(clusterId).then((response)=>{
        data.items=response.data.data.items
        loading.value=false
    })
}
onBeforeMount(async ()=>{
    await getAllClusters()

    const defaultClusterId=data.clusterList[0].id
    const currentClusterId=route.query.id
    data.clusterId=currentClusterId?currentClusterId:defaultClusterId
    getNamespaceListHandler(data.clusterId)
})

const updateNamespace=(row)=>{
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

const createNamespace=()=>{
    createDialog.value=true
}
const submitCreateNamespace=()=>{

    addNamespace(data.clusterId,data.deleteName).then((response)=>{
    ElMessage({
        message:response.data.message,
        type:"success"
        })
    })
    createDialog.value=false
    createName.value=""
}
const deleteNs=(row)=>{
    deleteDialog.value=true
    data.deleteName=row.metadata.name
}
const submitDeleteNamespace=(clusterId,name)=>{
    if(data.deleteNameConfirm!=data.deleteName){
        ElMessage({
            message:"输入不一致",
            type:"warning"
        })
        deleteNameConfirm.value=""
        return
    }
    deleteNamespace(clusterId,name).then((response)=>{
        ElMessage({
            message:response.data.message,
            type:"success"
        })
    })
    deleteDialog.value=false
    deleteName.value=""
    deleteNameConfirm.value=""
}

const closeDialog=()=>{
    getNamespaceListHandler(clusterId)
}
const closeDialogEmit=()=>{
    nodeDialog.value=false
}

const filterTableData = computed(() =>
    data.items.filter(
        (item) =>
            !search.value ||
            item.metadata.name.toLowerCase().includes(search.value.toLowerCase())
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