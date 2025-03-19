<template>
<CreateOrEditFrame
    :method="props.method"
    :name-space-read-only="props.method=='Update'"
    :cluster-read-only="props.method=='Update'"
    @namespaceChangedRollback="namespaceChangedHandler"
>
    <template #header>
        <el-select v-if="props.method=='Create'"
                   v-model="options.proxyResourceTypeSelected"
                   style="width: 160px;margin-left: 10px"
                   placeholder="请选择代理类型"
                   @change="resourceTypeChanged"
        >
                <el-option
                    v-for="type in options.proxyResourceTypes"
                    :key="type.value"
                    :label="type.label"
                    :value="type.value"
                >

                </el-option>
        </el-select>
        <el-select v-show="props.method=='Create'&&data.options.proxyResourceTypeSelected!='ExternalName'"
                   v-model="options.item"
                   style="width: 160px;margin-left: 10px"
                   value-key="metadata.name"
                   placeholder="请选择代理资源"
                   @change="proxyResrouceChanged"
        >
            <el-option
                    v-for="t in options.items"
                    :key="t.metadata.name"
                    :label="t.metadata.name"
                    :value="t"
            >
            </el-option>
        </el-select>
    </template>
    <template #main>
        <el-form :model="item" ref="itemRef">
            <el-tabs v-model="activeName" class="demo-tabs" >
                <el-tab-pane label="基本配置" name="basic" style="height: 480px">
                    <el-row :gutter="10">
                        <el-col :span="6">
                            <el-form-item label="Service名称" prop="metadata.name" required :rules="rules.name">
                                <el-input v-model="item.metadata.name" :disabled="props.method=='Update'"/>
                            </el-form-item>
                        </el-col>
                        <el-col :span="6" v-if="options.proxyResourceTypeSelected!='ExternalName'">
                            <el-form-item label="Service类型" prop="">
                                <el-select
                                        v-model="item.spec.type"
                                        style="width: 240px;margin-left: 10px"
                                        placeholder="请选择Service类型"
                                        @change="serviceTypeChanged"
                                >
                                    <el-option
                                            v-for="type in options.serviceTypes"
                                            :key="type.value"
                                            :label="type.label"
                                            :value="type.value"

                                    >

                                    </el-option>
                                </el-select>
                            </el-form-item>
                        </el-col>
                        <el-col :span="3" v-if="options.proxyResourceTypeSelected!='ExternalName'&&item.spec.type=='ClusterIP'">
                            <el-form-item label="无头服务" prop="" >
                                <el-switch v-model="item.spec.clusterIP" active-value="None" @change="handleServiceChange"></el-switch>
                            </el-form-item>
                        </el-col>
                        <el-col :span="3" >
                            <el-form-item label="会话保持" v-if="options.proxyResourceTypeSelected!='ExternalName'" prop="" >
                                <el-switch v-model="item.spec.sessionAffinity" active-value="ClientIP" inactive-value="None" @change="handleSessionChange"></el-switch>
                            </el-form-item>
                        </el-col>
                        <el-col :span="6" >
                            <el-form-item label="会话保持时间" prop="" v-if="item.spec.sessionAffinity=='ClientIP'" style="width: 180px">
                                <el-input-number :controls="false" :min="60" v-model="item.spec.sessionAffinityConfig.clientIP.timeoutSeconds"></el-input-number>
                            </el-form-item>
                        </el-col>
                        <el-col :span="6" v-if="options.proxyResourceTypeSelected=='ExternalName'">
                            <el-form-item label="绑定外部域名" prop="spec.externalName" required :rules="rules.externalName">
                                <el-input  v-model="item.spec.externalName"></el-input>
                            </el-form-item>
                        </el-col>
                    </el-row>

                </el-tab-pane >
                <el-tab-pane v-if="options.proxyResourceTypeSelected!='ExternalName'" label="端口配置" name="ports">
                        <el-form-item>
                            <el-table :data="item.spec.ports" style="height: 480px">
                                <el-table-column label="端口名称" align="center" prop="metadata.name" >
                                    <template #default="scope">
                                        <el-input v-model.trim="scope.row.name"></el-input>
                                    </template>
                                </el-table-column>
                                <el-table-column label="协议" align="center">
                                    <template #default="scope">
                                        <el-select
                                            v-model="scope.row.protocol"
                                            placeholder="协议"
                                        >
                                            <el-option
                                                v-for="p in ['TCP','UDP','SCTP']"
                                                :key="p"
                                                :value="p"
                                                :label="p"
                                            />
                                        </el-select>
                                    </template>
                                </el-table-column>
                                <el-table-column label="程序端口" align="center">
                                    <template #default="scope">
                                        <string-or-number  :key="scope.row.port" v-model:data="scope.row.targetPort"></string-or-number>
                                    </template>
                                </el-table-column>
                                <el-table-column label="Service端口" align="center" >
                                    <template #default="scope">
                                        <el-form-item :prop="('spec.ports.'+scope.$index+'.port')" required >
                                            <el-input-number  :controls="false" :min="1" :max="65535" v-model="scope.row.port"  style="width: 120px"/>
                                        </el-form-item>
                                    </template>
                                </el-table-column>

                                <el-table-column label="NodePort端口" align="center">
                                    <template #default="scope">
                                        <el-input-number :controls="false" :disabled="item.spec.type!='NodePort'&&item.spec.type!='LoadBalancer'" :min="1" :max="65535" v-model="scope.row.nodePort" style="width: 120px"/>
                                    </template>
                                </el-table-column>
                                <el-table-column label="操作">
                                    <template #header>
                                        <el-button link type="primary" @click="addPort">添加</el-button>
                                    </template>
                                    <template #default="scope">
                                        <el-button link type="warning" @click="deleteTableRow(item.spec.ports,scope.$index)">删除</el-button>
                                    </template>
                                </el-table-column>

                            </el-table>
                        </el-form-item>
                </el-tab-pane>
                <el-tab-pane label="注释及标签配置" name="labels"  >
                    <el-tabs v-model="labelConfig" tab-position="left">
                        <el-tab-pane label="Service标签配置" name="labels">
                            <Table :list="options.labelList"></Table>
                        </el-tab-pane>
                        <el-tab-pane label="Service注释配置" name="annos">
                            <Table :list="options.annotationList"></Table>
                        </el-tab-pane>
                        <el-tab-pane label="代理的Pod标签" name="pods" v-if="data.options.proxyResourceTypeSelected!='ExternalName'">
                            <Table :list="options.podLabelList"></Table>
                        </el-tab-pane>

                    </el-tabs>
                </el-tab-pane>
            </el-tabs>
                <span style="display: block;margin-top: 30px;" class="span-button">
                    <el-button type="primary" @click="submit('yaml')">预览</el-button>
                <el-button type="primary" @click="submit">{{props.method=='Update'?'更新':'创建'}}</el-button>
                </span>
        </el-form>
    </template>
</CreateOrEditFrame>
    <DialogYaml
        :clusterId="data.clusterId"
        :nameSpace="data.nameSpace"
        :showDialog="showDialog"
        :yamlContent="yamlData"
        @closeDialogHandler="(val)=>{showDialog=val}"
    >

    </DialogYaml>
</template>

<script setup>
import {deleteTableRow, list2object, obj2yaml, object2list} from '../../utils/index.js'
import {computed, onBeforeMount, reactive, ref, toRefs} from "vue";
import CreateOrEditFrame from "../components/createOrEditFrame.vue";
import {listHandler} from "../../api/generic/generic.js";
import StringOrNumber from "../components/stringOrNumber.vue";
import Table from "../components/table.vue";
import DialogYaml from "../components/dialogYaml/dialogYaml.vue";
import {addService, updateService} from "../../api/scheduler/service/service.js";
import {useRouter} from "vue-router";
import { ElMessage, ElMessageBox } from 'element-plus'
const route=useRouter()
const props=defineProps({
    method:{
        type:String,
        default:'Create'
    },
    item:{
        type:Object
    }
})
const data=reactive({
    clusterId:"",
    nameSpace:"",
    item:{
        apiVersion:'v1',
        kind:'Service',
        metadata:{
            name:'',
            namespace:'',
            labels:[],
            annotations:[],
        },
        spec:{
            ports:[
                {
                    port:80,
                    targetPort:8080,
                    protocol:'TCP',
                    name:''
                }
            ],
            selector:[],
            type:'ClusterIP',
            sessionAffinity:'None',
            clusterIP:'None',
            externalName:'',
        }

    },
    options:{
        proxyResourceTypeSelected:"",
        proxyResourceTypes:[
            {   label:"Deployment",
                value:"Deployment",
            },
            {   label:"DaemonSet",
                value:"DaemonSet",
            },
            {   label:"StatefulSet",
                value:"StatefulSet",
            },
            {   label:"外部域名",
                value:"ExternalName",
            },
        ],
        items:[],
        item:undefined,
        serviceTypes:[
            {
                label:"NodePort",
                value:"NodePort"
            },
            {
                label:"ClusterIP",
                value:"ClusterIP"
            },
            {
                label:"LoadBalancer",
                value:"LoadBalancer"
            },

        ],
        labelList:[],
        annotationList:[],
        podLabelList:[],

    },
})
const rules=reactive({
    name:[{required:true,message:"请输入名称",trigger:'blur'}],
    externalName:[{required:true,message:"请输入代理的域名",trigger:'blur'}],
})
const {options,item}=toRefs(data)
const itemRef=ref()
const activeName=ref('basic')
const labelConfig=ref('labels')
let yamlData=ref("")
const showDialog=ref(false)
const submitHandler=(tag)=>{
    data.item.metadata.labels=list2object(data.options.labelList)
    data.item.metadata.annotations=list2object(data.options.annotationList)
    if(data.options.proxyResourceTypeSelected!='ExternalName'){
        data.item.spec.selector=list2object(data.options.podLabelList)
    }

    if(tag=='yaml'){
        showDialog.value=true
        yamlData=obj2yaml(data.item)
    }else{
        const formData={
            clusterId: data.clusterId,
            nameSpace: data.nameSpace,
            item: data.item
        }
        if(props.method!='Update'){
            addService(formData).then((response)=>{
                open(response.data.message)
            })

        }else{
            updateService(formData).then((response)=>{
                ElMessage({
                    message:response.data.message,
                    type:"success"
                })
            })
        }
    }
}
const submit=(tag)=>{
    itemRef.value.validate((valid)=>{
        if(!valid){
            ElMessage({
                message:"请完善表单数据",
                type:"warning"
            })
        }else {
            submitHandler(tag)
        }
    })


}
const namespaceChangedHandler=(clusterId,namespace)=>{
    data.clusterId=clusterId
    data.nameSpace=namespace
    data.item.metadata.namespace=namespace
    if(data.options.proxyResourceTypeSelected!='ExternalName'&&data.options.proxyResourceTypeSelected!=''){
        getResourceList()
    }
}
const getResourceList=async ()=>{
    await listHandler(data.options.proxyResourceTypeSelected,data.clusterId,data.nameSpace).then((res)=>{
        data.options.item={}
        data.options.items=res.data.data.items
    })
}
const proxyResrouceChanged=()=>{
    data.item.spec.ports=[]
    const containers=data.options.item.spec.template.spec.containers
    for(let c=0;c<containers.length;c++){
        if(!containers[c].ports){
            continue
        }
        const ports=containers[c].ports
        for(let p=0;p<ports.length;p++){
            const containerPort=ports[p]
            const servicePort={
                port:containerPort.containerPort,
                targetPort:containerPort.containerPort,
                protocol:containerPort.protocol,
                name:containerPort.name

            }
            data.item.spec.ports.unshift(servicePort)
        }

    }

    data.options.labelList=object2list(data.options.item.metadata.labels)
    data.options.annotationList=object2list(data.options.item.metadata.annotations)
    data.options.podLabelList=object2list(data.options.item.spec.template.metadata.labels)


}
//无头服务switch
const handleServiceChange=(val)=>{
    if(!val){
        delete data.item.spec.clusterIP
    }
}
// 会话保持switch
const handleSessionChange=(val)=>{
    if(val=='None'){
        data.item.spec.sessionAffinity='None'
        delete data.item.spec.sessionAffinityConfig
    }else{
        data.item.spec.sessionAffinity='ClientIP'
        data.item.spec.sessionAffinityConfig={
            clientIP:{
                timeoutSeconds:3600
            },

        }
    }
}
const  resourceTypeChanged= async ()=>{
    data.item.spec.ports=[]
   if(data.options.proxyResourceTypeSelected=="ExternalName"){
       data.options.item={}
       data.item.spec.type='ExternalName'
       const serviceSpec={
           type:'ExternalName',
           externalName:''
       }
       data.item.spec=serviceSpec
      return
   }else {
      delete data.item.spec.externalName
      await getResourceList()

   }
}
const addPort=()=>{
    if(data.item.spec.ports==null||data.item.spec.ports==undefined){
        data.item.spec.ports=[]
    }
    const port={
        port:80,
        targetPort:8080,
        protocol:'TCP',
        name:''
    }
    data.item.spec.ports.unshift(port)
}
const serviceTypeChanged=(val)=>{
    if(val=='NodePort'){
        delete data.item.spec.clusterIP
        delete data.item.spec.externalName
    }else{
        data.item.spec.ports.forEach((port)=>{
            delete port.nodePort
        })
    }
}
const open = (msg) => {
    ElMessageBox.confirm(
        msg,
        {
            confirmButtonText: '查看列表',
            cancelButtonText: '返回',

            type: 'success',

        }
    )
        .then(() => {
            route.replace({
                path:'/service/list',
                query:{
                    clusterId:data.clusterId,
                    nameSpace:data.nameSpace
                }
            })
        })
        .catch(() => {
            return
        })
}
onBeforeMount(()=>{
    if(props.method!='Create'){
        data.item=JSON.parse(JSON.stringify(props.item))
        data.options.labelList=object2list(props.item.metadata.labels)
        data.options.annotationList=object2list(props.item.metadata.annotations)
        if(data.options.proxyResourceTypeSelected!='ExternalName'){
            data.options.podLabelList=object2list(props.item.spec.selector)

        }
    }
})
</script>
<style scoped>
.btn{
    display: flex;
    justify-content: center;
}
</style>