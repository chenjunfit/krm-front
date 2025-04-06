<template>
    <el-card class="box-card" >
        <el-form :model="item" ref="itemRef" label-position="left">
            <el-tabs v-model="ActiveName" class="demo-tabs">
                <el-tab-pane label="基本配置" name="basic" style="height: 480px">
                    <el-card class="box-card">
                        <template #header>
                            <div class="auto-space-between">
                                <div >
                                    <ClusterNamespaceSelect
                                        @namespaceChangeCallback="namespaceCallBack"
                                        :clusterReadOnly="props.method=='Update'"
                                        :nameSpaceReadOnly="props.method=='Update'"
                                    />
                                </div>
                            </div>
                        </template>
                        <div><el-row :gutter="20">
                            <el-col :span="6">
                                <el-form-item label="名称" prop="metadata.name"  required :rules="data.rules.name">
                                    <el-input  :readonly="props.method=='Update'" style="width: 140px" v-model.trim="item.metadata.name" placeholder="请输入名称"></el-input>
                                </el-form-item>
                            </el-col>
                            <el-col :span="6">

                                <el-form-item label="镜像密钥" prop="" >
                                    <div class="flex flex-wrap gap-4 items-center">
                                        <el-select
                                            v-model="item.spec.template.spec.imagePullSecrets"
                                            multiple
                                            collapse-tags
                                            placeholder="选择仓库密钥"
                                            size="default"
                                            value-key="name"
                                            style="width: 140px"
                                        >
                                            <el-option
                                                v-for="s in data.registryList"
                                                :key="s.name"
                                                :label="s.name"
                                                :value="s"
                                            />
                                        </el-select>
                                    </div>
                                </el-form-item>

                            </el-col>
                            <el-col :span="6" v-if="props.ResourceType=='Deployment'||props.ResourceType=='StatefulSet'">
                                <el-form-item label="副本数" prop="" >
                                    <el-input-number  v-model="item.spec.replicas" :min="0" :max="100" ></el-input-number>
                                </el-form-item>
                            </el-col>
                            <el-col :span="6" >
                                <el-form-item label="DNS策略" prop="" >
                                    <div class="flex flex-wrap gap-4 items-center">
                                        <el-select
                                            v-model="item.spec.template.spec.dnsPolicy"
                                            placeholder="选择策略"
                                            size="default"
                                            style="width: 140px"
                                        >
                                            <el-option
                                                v-for="s in dnsOptions"
                                                :key="s.label"
                                                :label="s.label"
                                                :value="s.label"
                                            />
                                        </el-select>
                                    </div>
                                </el-form-item>

                            </el-col>
                        </el-row></div>
                        <div style="margin-top: 10px">
                            <el-row :gutter="20">
                                <slot name="strategy"></slot>
                            <el-col :span="6" v-if="props.ResourceType!='CronJob'">
                                <el-form-item label="使用宿主机网络" prop=""  >
                                    <el-switch style="--el-switch-on-color: red; " el-w v-model="item.spec.template.spec.hostNetwork" @change="hostNetworkChange" />
                                </el-form-item>
                            </el-col>

                        </el-row>
                        </div>
                        <div style="margin-top: 10px">

                            <el-row :gutter="20">
                                <el-col :span="6" v-if="props.method!='Update'">
                                    <el-form-item label="标签与注释"  prop="" >
                                        <div class="mb-2 ml-4">
                                            <el-radio-group v-model="radio">
                                                <el-radio value='true' size="large">自动生成</el-radio>
                                                <el-radio value='false' size="large">手动配置</el-radio>
                                            </el-radio-group>
                                        </div>
                                    </el-form-item>
                                </el-col>
                                <div >
                                    <el-col :span="6" v-if="props.method!='Update'&&props.ResourceType!='CronJob'">
                                        <el-form-item v-if="props.ResourceType=='Deployment'||props.ResourceType=='DaemonSet'" label="自动添加service" prop="autoCreateService" >
                                            <el-switch style="--el-switch-on-color: green; " v-model="data.autoCreateService"  />
                                        </el-form-item>
                                        <el-form-item v-else="props.ResourceType=='StatefulSet'" label="绑定service" >
                                            <el-radio-group v-model="data.autoCreateService" @change="radioChange" >
                                                <el-radio :label="true">自动生成Service</el-radio>
                                                <el-radio :label="false">选择已有Service</el-radio>
                                            </el-radio-group>
                                        </el-form-item>
                                    </el-col>
                                </div>
                                    <el-col :span="6" v-if="!data.autoCreateService&&props.ResourceType=='StatefulSet'">
                                        <el-form-item prop="spec.serviceName" required :rules="data.rules.serviceName" label="请选择Service">
                                            <el-select
                                                v-model="item.spec.serviceName"
                                                placeholder="请选择Service"
                                                @visible-change="visableChange"
                                            >
                                                <el-option
                                                    v-for="service in data.options.serviceList"
                                                    :key="service.metadata.name"
                                                    :label="service.metadata.name"
                                                    :value="service.metadata.name"
                                                >

                                                </el-option>
                                            </el-select>
                                        </el-form-item>

                                    </el-col>
                                <slot name="special"></slot>
                            </el-row>

                        </div>
                    </el-card>
                    <el-card v-if="radio=='false'" style="margin-top: 10px">
                        <el-tabs v-model="labelActiveName" class="demo-tabs" tab-position="left" >
                            <el-tab-pane label="控制器注释" name="controllerAnno" >
                                <Table :list="options.controllerAnnoList"></Table>
                            </el-tab-pane>
                            <el-tab-pane label="控制器标签" name="controllerLabel">
                                <Table :list="options.controllerLabelList"></Table>
                            </el-tab-pane>
                            <el-tab-pane v-if="props.ResourceType!='CronJob'" label="Pod注释" name="podAnno">
                                <Table :list="options.podAnnoList"></Table>
                            </el-tab-pane>
                            <el-tab-pane v-if="props.ResourceType!='CronJob'" label="Pod标签" name="podLabel">
                                <Table :read-only="props.method=='Update'" :list="options.podLabelList"></Table>
                            </el-tab-pane>
                        </el-tabs>
                    </el-card>
                </el-tab-pane>
                <el-tab-pane label="调度配置" name="affinity" style="height: 480px">
                    <SchedulerConfig :list="options.nodeSelectorList" ></SchedulerConfig>
                </el-tab-pane>
                <el-tab-pane label="存储卷配置" name="volume" style="height: 480px">
                    <Volume></Volume>
                </el-tab-pane>
                <el-tab-pane label="容器配置" name="container" style="height: 480px">
                    <Container containerType="container" :method="props.method" :ResourceType="props.ResourceType"></Container>
                </el-tab-pane>
                <el-tab-pane label="初始化容器" name="initContainer" style="height: 480px">
                    <Container containerType="init-container" :method="props.method" :ResourceType="props.ResourceType"></Container>
                </el-tab-pane>
            </el-tabs>
            <span style="display: block;margin-top: 30px;" class="span-button">
                <el-button type="primary" @click="submit('yaml')">预览</el-button>
                <el-button type="primary" @click="submit('create')">{{props.method=="Update"?"更新":"创建"}}</el-button>
            </span>
        </el-form>


    </el-card>
</template>

<script setup>
import {computed, inject, onBeforeMount, onMounted, provide, reactive, ref, toRefs, watch} from "vue";
import ClusterNamespaceSelect from "./clusterNamespaceSelect.vue";
import {getSecretList} from "../../api/scheduler/secret/secret.js";
import {ElMessage} from "element-plus";
import StringOrNumber from "./stringOrNumber.vue";
import Table from "./table.vue";
import {list2object, object2list} from "../../utils/index.js";
import {useItem} from "../../store/index.js";
import {storeToRefs} from "pinia";
import SchedulerConfig from "./scheduler/schedulerConfig.vue";
import Volume from "./volume/volume.vue";
import Container from "./container/container.vue";
import {addCluster, updateCluster} from "../../api/cluster/cluster.js";
import DialogYaml from "./dialogYaml/dialogYaml.vue";
import { getServiceList} from "../../api/scheduler/service/service.js";

const ActiveName=ref("basic")
const labelActiveName=ref("")
const radio=ref('true')
const itemRef=ref()
const useItemer=useItem()
const data=reactive({
    clusterId:"",
    nameSpace:"",
    registryList:[],
    dnsOptions:[
        {
            label:"ClusterFirst",
            value:"ClusterFirst",
        },
        {
            label:"Default",
            value:"Default",
        },
        {
            label:"None",
            value:"None",
        },
        {
            label:"ClusterFirstWithHostNet",
            value:"ClusterFirstWithHostNet",
        },
    ],
    options:{
        controllerAnnoList:[],
        controllerLabelList:[],
        podAnnoList:[],
        podLabelList:[],
        nodeSelectorList:[],
        serviceList:[],
    },
    autoCreateService:true,
    rules:{
        name:[{required:true,message:"请输入名称",trigger:'blur'}],
        serviceName:[{required:true,message:"请输入service",trigger:'blur'}],
    }

})
const {clusterId,nameSpace,secretList,dnsOptions,options}=toRefs(data)
const {item}=storeToRefs(useItem())

const props=defineProps({
    ResourceType:{
        type:String,
        default:"Deployment"
    },
    method:{
        type:String,
        default:"Create"
    },
})
const emits=defineEmits(['submitData'])
const namespaceCallBack=(clusterId,nameSpace)=>{
    data.nameSpace=nameSpace
    data.clusterId=clusterId
    useItemer.item.clusterId=clusterId
    useItemer.item.nameSpace=nameSpace
    useItemer.item.metadata.namespace=nameSpace
    getRegistryList()
}
const getRegistryList=()=>{
    const params={
        clusterId: data.clusterId,
        nameSpace: data.nameSpace,
        fieldSelector: "type=kubernetes.io/dockerconfigjson",
        labelSelector:'',
    }
    getSecretList(params).then((res)=>{
        res.data.data.items.forEach((item)=>{
            data.registryList.push({
                name: item.metadata.name
            })
        })
    })}

const hostNetworkChange=(val)=>{
    if(val){
        ElMessage({
            message:"开启会占用宿主机网络和端口",
            type:"warning"
        })
    }
}

const submitHandler=(tag)=>{
    itemRef.value.validate((valid)=>{
        if(valid){
            emits('submitData',tag,data.autoCreateService)
        }else {
            ElMessage({
                message:"请完善表单数据",
                type:"warning"
            })
        }
    })
}

const submit=(tag)=>{
    let obj={}
    let controllerAnnoObj={}
    let controllerLabelObj={}
    let podAnnoObj={}
    let podLabelObj={}
    if(data.autoCreateService&&tag!='yaml'){
        let portCount=0
        useItemer.item.spec.template.spec.containers.forEach((c)=>{
            portCount+= c.ports.length
        })
        if(portCount==0){
            ElMessage.error('自动添加Service需要添加容器端口')
            return
        }
    }
    if(radio.value=='true'){
        obj={
            app:useItemer.item.metadata.name
        }

        controllerLabelObj=obj
        controllerAnnoObj=obj
        podAnnoObj=obj
        podLabelObj=obj
    }else{
        controllerAnnoObj=list2object(data.options.controllerAnnoList)
        controllerLabelObj=list2object(data.options.controllerLabelList)
        podAnnoObj=list2object(data.options.podAnnoList)
        podLabelObj=list2object(data.options.podLabelList)

    }
    useItemer.item.metadata.labels=controllerLabelObj
    useItemer.item.metadata.annotations=controllerAnnoObj
    if(props.ResourceType!='CronJob'){
        useItemer.item.spec.template.metadata.labels=podLabelObj
        useItemer.item.spec.template.metadata.annotations=podAnnoObj
        useItemer.item.spec.selector.matchLabels=podLabelObj
    }

    useItemer.item.spec.template.spec.nodeSelector=list2object(data.options.nodeSelectorList)
    if(data.autoCreateService){
        useItemer.item.spec.serviceName=useItemer.item.metadata.name
    }
    submitHandler(tag)
}
onBeforeMount(()=>{
    if(props.method!='Create'){
        radio.value='false'
        data.autoCreateService=false
    }

    data.options.controllerAnnoList=object2list(useItemer.item.metadata.annotations)
    data.options.controllerLabelList=object2list(useItemer.item.metadata.labels)
    if(props.ResourceType!='CronJob'){
        data.options.podAnnoList=object2list(useItemer.item.spec.template.metadata.annotations)
        data.options.podLabelList=object2list(useItemer.item.spec.template.metadata.labels)
    }
    data.options.nodeSelectorList=object2list(useItemer.item.spec.template.spec.nodeSelector)
})
const radioChange=(val)=>{
    if(data.autoCreateService){
        useItemer.item.spec.serviceName=""
    }
}
const visableChange=(val)=>{
    if(!val){
        return
    }
    const params={
        clusterId: data.clusterId,
        nameSpace: data.nameSpace,
        fieldSelector: "",
        labelSelector:'',
    }
    getServiceList(params.clusterId,params.nameSpace).then((res)=>{
        data.options.serviceList=[]
        res.data.data.items.forEach((item)=>{
            if(item.spec.clusterIP=="None"){
                data.options.serviceList.push(item)
            }
        })
    })
}
</script>

<style scoped>
.el-tabs--card {
    height: calc(100vh - 110px);
    /* overflow-y: auto; */
}
.el-tab-pane {
    height: calc(100vh - 110px);
    overflow-y: auto;
}
</style>