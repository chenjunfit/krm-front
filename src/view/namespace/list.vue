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
                            :label="item.displayName"
                            :value="item.id"
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
                        <el-button :disabled="scope.row.metadata.deletionTimestamp!=null" link type="primary" size="small" @click="copyNamespace(scope.row)" >资源复制</el-button>
                        <el-button :disabled="scope.row.metadata.deletionTimestamp!=null" link type="primary" size="small" @click="updateNamespace(scope.row)" >编辑</el-button>
                        <el-button :disabled="scope.row.metadata.deletionTimestamp!=null" link type="primary" size="small" @click="deleteNs(scope.row)" >删除</el-button>


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
            <el-dialog
                v-model="showNamespaceCopy"
                :append-to-body="true"
                :title="'复制集群 '+copyForm.clusterId+'命名空间 '+copyForm.namespace"
                :center="true"
                width="60%"
                @close="closeDialog"
                destroy-on-close
            >
                <el-form :model="copyForm" ref="copyFormRef">
                    <el-tabs v-model="activeName" tab-position="left" @tab-click="tabClick">
                        <el-tab-pane name="copyDest" label="复制目标">
                            <el-form-item label="命名空间">
                                <el-radio-group v-model="copyForm.createNamespace">
                                    <el-radio :label="true" size="large">新建namespace</el-radio>
                                    <el-radio :label="false" size="large">使用已有namespace</el-radio>
                                </el-radio-group>
                            </el-form-item>
                            <el-form-item label="配置目标">
                                <cluster-namespace-select
                                :ShowNamespace="!data.copyForm.createNamespace"
                                @clusterChangeCallback="destClusterChanged"
                                @namespaceChangeCallback="destNamespaceChanged"
                                >
                                </cluster-namespace-select>
                                <el-input v-show="data.copyForm.createNamespace" v-model.trim="copyForm.toNamespace" placeholder="请输入命名空间" style="width: 180px;margin-left: 10px">

                                </el-input>
                            </el-form-item>
                        </el-tab-pane>
                        <el-tab-pane
                            v-for="name in copyForm.resourceList"
                            :key="name"
                            :label="name"
                            :name="name"
                        >
                            <el-transfer :titles="['源', '目标']" v-model="copyForm.toResources[name]" :data="copyForm.fromResources[name]" />
                        </el-tab-pane>
                    </el-tabs>
                </el-form>
                <div  style="margin-top: 10px;text-align: center">
                    <el-button type="info" @click="clearCopyData">取消</el-button>
                    <el-button type="primary" @click="submitNameSpaceCopy">复制</el-button>
                </div>

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
                                <div>{{data.clusterId}}</div>
                            </el-button>
                            <el-button type="primary" >
                                <i class="iconfont icon-rongqi" style="width: 50px"/>
                                <div>{{data.detailItem.metadata.name}}</div>
                            </el-button>
                        </div>
                    </div>
                </template>
                <div class="auto-layout">
                    <div v-for="item in data.namespaceDetailList" :key="item.resourceType" >
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
                                        nameSpace:data.detailItem.metadata.name
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
    getClusterList,
    getNamespaceList,
    addNamespace,
    deleteNamespace,
    copyNamespaceHandler, getNameSpaceDetail
} from "../../api/cluster/cluster.js";
import {computed, onBeforeMount, reactive, ref, toRefs} from "vue";
import {Check,Close} from "@element-plus/icons-vue";
import {useRoute} from "vue-router";
import Edit from "./edit.vue";
import Detail from "./detail.vue";
import {ElMessage} from "element-plus";
import ClusterNamespaceSelect from "../components/clusterNamespaceSelect.vue";
import {listHandler} from "../../api/generic/generic.js";
const loading=ref(true)
const nodeDialog=ref(false)
const detailDialog=ref(false)
const createDialog=ref(false)
const deleteDialog=ref(false)
const showNamespaceCopy=ref(false)
const activeName=ref('copyDest')
const copyFormRef=ref('')
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
    deleteNameConfirm:"",
    namespaceDetailList:[],
    copyForm:{
        clusterId:"",
        namespace:"",
        toClusterId:"",
        toNamespace:"",
        createNamespace:false,
        resourceList:[
            "Deployment",
            "StatefulSet",
            "DaemonSet",
            "Service",
            "ConfigMap",
            "Secret",
            "CronJob"
        ],
        toResources:{
            Deployment:[],
            StatefulSet:[],
            DaemonSet:[],
            Service:[],
            ConfigMap:[],
            Secret:[],
            CronJob:[],
        },
        fromResources:{
            Deployment:[],
            StatefulSet:[],
            DaemonSet:[],
            Service:[],
            ConfigMap:[],
            Secret:[],
            CronJob:[],
        },
    }


})
const {clusterId,clusterList,editItem,editNodeName,detailNodeName,detailItem,createName,deleteName,deleteNameConfirm,copyForm}=toRefs(data)
const route=useRoute()
const clearCopyData=()=>{
    data.copyForm.toResources=JSON.parse(JSON.stringify({
        Deployment:[],
        StatefulSet:[],
        DaemonSet:[],
        Service:[],
        ConfigMap:[],
        Secret:[],
        CronJob:[],
    }))
    showNamespaceCopy.value=false
}
const submitNameSpaceCopy= async ()=>{
    await copyNamespaceHandler(data.copyForm).then((res)=>{
        ElMessage.success(res.data.message)
    })
}
const tabClick= async (paneName,event)=>{
    if(paneName.paneName!="copyDest"){
       await listHandler(paneName.paneName,data.copyForm.clusterId,data.copyForm.namespace).then((res)=>{
           const items=res.data.data.items
           const itemListName=[]
           if(items!=null){
               items.forEach((item)=>{
                   itemListName.push({
                       key: item.metadata.name,
                       label:item.metadata.name
                   })
               })
               data.copyForm.fromResources[paneName.paneName]=itemListName
           }

        })
    }

}
const toResourceList=computed(()=>{
    return Object.keys(data.copyForm.toResources)
})
const destNamespaceChanged=(destClusterId,destNamespace)=>{
    data.copyForm.toNamespace=destNamespace
    data.copyForm.toClusterId=destClusterId
}
const destClusterChanged=(destClusterId)=>{
    data.copyForm.toClusterId=destClusterId
}
const  getAllClusters=async ()=>{
    await getClusterList().then((response)=>{
        data.clusterList=response.data.data.items
    })
}
const getNamespaceListHandler=()=>{
    const params={
        clusterId:data.clusterId
    }
    getNamespaceList(params).then((response)=>{
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
const detailNode=async (row)=>{
    loading.value=true
    detailDialog.value=true
    data.detailItem=row
    await getNameSpaceDetail(data.clusterId,row.metadata.name).then((res)=>{
        data.namespaceDetailList=res.data.data.items
    })
    loading.value=false
}

const createNamespace=()=>{
    createDialog.value=true
}
const copyNamespace=(row)=>{
    activeName.value="copyDest"
    showNamespaceCopy.value=true
    data.copyForm.clusterId=data.clusterId
    data.copyForm.namespace=row.metadata.name
}
const submitCreateNamespace=()=>{

    addNamespace(data.clusterId,data.createName).then((response)=>{
        if(response.data.status==200){
            ElMessage({
                message:response.data.message,
                type:"success"
            })
            getNamespaceListHandler()
        }else{
            ElMessage({
                message:response.data.message,
                type:"error"
            })
        }
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
        if(response.data.status==200){
            ElMessage({
                message:response.data.message,
                type:"success"
            })
            getNamespaceListHandfler()
        }else{
            ElMessage({
                message:response.data.message,
                type:"error"
            })
        }
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
    (data.items||[]).filter(
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