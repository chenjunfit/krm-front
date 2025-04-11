<template>
    <el-card
        class="box-card"
        element-loading-text="玩命加载中"
    >
        <template #header>
            <div class="card-header" >
                <span>集群列表</span>
                <el-button class="button"  type="primary" @click="addCluster">添加</el-button>
            </div>
            <el-table :data="data.items"
                      style="width: 100%"
                      border
                      height="400px"
                      :default-sort="{ prop: 'id', order: 'ascending' }"
            >
                <el-table-column fixed prop="id" align="center" label="集群ID" width="120" >
                    <template #default="scope">
                        <el-button link type="primary" size="small" @click="detailNode(scope.row.id)" >
                            {{scope.row.id}}
                        </el-button>
                    </template>
                </el-table-column>
                <el-table-column prop="displayName" align="center" label="集群别名" width="150" />
                <el-table-column prop="clusterVersion" sortable align="center" label="版本" width="80" />
                <el-table-column prop="state" align="center" label="位置" width="180" >
                    <template #default="scope">
                        {{scope.row.city}}-{{scope.row.district}}
                    </template>
                </el-table-column>
                <el-table-column prop="" align="center" label="状态" width="80" >
                    <template #default="scope">
                        <el-icon v-if="scope.row.status=='Active'" color="green"><Check/></el-icon>
                        <el-icon v-else="scope.row.status=='InActive'" color="red"><Close/></el-icon>

                    </template>
                </el-table-column>
                <el-table-column prop="version" align="center" sortable label="集群规模" width="120" >
                    <template #default="scope">
                        <ClusterSize :cluseter-id="scope.row.id"></ClusterSize>
                    </template>
                </el-table-column>
                <el-table-column fixed="right" align="center" label="操作" min-width="100">
                    <template #default="scope" >
                        <el-button link type="primary" size="small" @click="updateCluster(scope.row)" :disabled="scope.row.status!='Active'">编辑</el-button>

                        <el-button link type="primary" size="small" @click="handleDelete(scope)">
                            删除
                        </el-button>
                    </template>
                </el-table-column>
            </el-table>
            <div class="auto-space-between" style="margin-top: 10px">
                <div></div>
                <div>总数: {{data.items.length}}</div>
            </div>
            <el-dialog
                v-model="dialogVisible"
                :title="defaultMethod=='create'?'创建集群':'更新集群'"
                width="80%"
                @close="closeDialog"
                destroy-on-close
            >
                <span>
                    <Add @callback="getClusterList"
                         @close-dialog-emit="closeDialogEmit"
                         :ClusterItem="ClusterForm"
                         :method="defaultMethod"
                    >

                    </Add>
                </span>
            </el-dialog>
            <el-dialog
                v-model="detailDialog"
                title="详情"
                width="60%"
                @before-close="closeDialog"
                destroy-on-close
            >
                <template #header="{titleId, titleClass }">
                    <div class="my-header">
                        <div :id="titleId" :class="titleClass">
                            <el-button type="primary" >
                                <i class="iconfont icon-bushu" style="width: 50px"/>
                                <div>{{data.detailItem}}</div>
                            </el-button>
                        </div>
                    </div>
                </template>
                <div class="auto-layout">
                    <div v-for="item in data.clusterDetailList" :key="item.resourceType" >
                        <el-card style="width: 300px;margin-bottom: 20px;margin-left: 10px">
                            <template #header>
                                <span>{{item.resourceType}}</span>
                            </template>
                            <div>
                                <div class="auto-space-between">
                                    <el-icon :size="50">
                                        <i :class="`iconfont icon-`+item.resourceType"></i>
                                    </el-icon>
                                    <router-link :to="{path:'/'+item.resourceType+'/list',
                                    query:{
                                        clusterId:data.clusterId,
                                    }
                                    }">
                                        {{item.total}}
                                    </router-link>
                                </div>
                            </div>
                        </el-card>
                    </div>
                </div>
            </el-dialog>
        </template>
    </el-card>

</template>

<script setup>
import {
    deleteCluster,
    getClusterList,
    getCluster,
    getNodeList,
    getNameSpaceDetail,
    getClusterDetail
} from "../../api/cluster/cluster.js";
import Add from './add.vue'
import form from './add.vue'
import {computed, onBeforeMount, reactive, ref, toRefs} from "vue";
import {ElMessage,ElMessageBox} from "element-plus";
import {Check,Close} from "@element-plus/icons-vue";
import ClusterSize from "../node/components/clusterSize.vue";
const loading=ref(true)
const dialogVisible = ref(false)
const defaultMethod=ref("create")
const detailDialog=ref(false)
const data=reactive({
    items:[],
    detailItem:"",
    clusterDetailList:[],
    ClusterForm:{
        id: "",
        displayName: "",
        city: "",
        district: "",
        kubeconfig: "",
    },
    clusterSize: 0,
})
const {ClusterForm}=toRefs(data)
const detailNode=async (row)=>{
    loading.value=true
    detailDialog.value=true
    data.detailItem=row
    await getClusterDetail(row).then((res)=>{
        data.clusterDetailList=res.data.data.items
    })
    loading.value=false
}
const getClusterListHandler=()=>{
    getClusterList().then((response)=>{
        data.items=response.data.data.items
        loading.value=false
        dialogVisible.value=false
    })

}
onBeforeMount(getClusterListHandler)
const handleDelete=(scope)=>{
    loading.value=true
    deleteCluster(scope.row.id).then((response)=>{
        ElMessageBox.confirm(
            '是否删除集群'+scope.row.id,
            'Warning',
            {
                confirmButtonText: 'OK',
                cancelButtonText: 'Cancel',
                type: 'warning',
            }
        ).then(() => {
            ElMessage({
                message:"删除集群成功",
                type:"success"
            })
            getClusterListHandler()
            loading.value=false

        })

    })
}

const addCluster=()=>{
    data.ClusterForm={}
    defaultMethod.value="create"
    dialogVisible.value=true
}
const updateCluster=(row)=>{
    defaultMethod.value="update"
    getCluster(row.id).then((response)=>{
        data.ClusterForm=response.data.data.item
        dialogVisible.value=true
    })


}
const closeDialog=()=>{
    getClusterListHandler()
}
const closeDialogEmit=()=>{
    dialogVisible.value=false
}


</script>

<style scoped>
.card-header{
    display: flex;
    align-items: center;
    justify-content: space-between;
}
</style>