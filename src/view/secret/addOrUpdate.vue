<template>
<CreateOrEditFrame
    :method="props.method"
    :name-space-read-only="props.method=='Update'"
    :cluster-read-only="props.method=='Update'"
    @namespaceChangedRollback="namespaceChangedHandler"
>
    <template #main>
        <el-form :model="item" ref="itemRef">
            <el-tabs v-model="activeName" class="demo-tabs" >
                <el-tab-pane label="基本配置" name="basic" style="height: 360px">
                    <el-row :gutter="20">
                        <el-col :span="8">
                            <el-form-item label="Secret名称" prop="metadata.name" required :rules="rules.name" >
                                <el-input v-model="item.metadata.name" :disabled="props.method=='Update'"/>
                            </el-form-item>
                        </el-col>
                        <el-col :span="8">
                            <el-form-item label="类型" prop="type" >
                                <el-select
                                    v-model="item.type"
                                    @change="secretTypeChanged"
                                >
                                        <el-option
                                            v-for="t in data.options.secretTypeList"
                                            :key="t.label"
                                            :value="t.value"
                                            :label="t.label"
                                        />
                                </el-select>
                            </el-form-item>
                        </el-col>
                        <el-col :span="8" >
                            <el-form-item label="只读" prop="" >
                               <el-switch v-model="item.immutable" :disabled="data.options.dataDisabled"></el-switch>
                            </el-form-item>
                        </el-col>
                    </el-row>
                </el-tab-pane >
                <el-tab-pane  label="数据配置" name="rule" style="height: 360px">
                    <Table
                        :list="options.dataList"
                        inputType="textarea"
                        :rows="1"
                        :read-only="data.options.dataDisabled"
                        :key-read-only="item.type!='Opaque'"
                        :show-options="item.type=='Opaque'"
                        :value-width="(item.type!='Opaque'?'480px':'240px')"
                    />
                </el-tab-pane>
                <el-tab-pane label="注释及标签配置" name="labels" style="height: 360px" >
                    <el-tabs v-model="labelConfig" tab-position="left">
                        <el-tab-pane label="ConfigMap标签配置" name="labels">
                            <Table :list="options.labelList" ></Table>
                        </el-tab-pane>
                        <el-tab-pane label="ConfigMap注释配置" name="annos">
                            <Table :list="options.annotationList"></Table>
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
import {addIngress,  getIngressClassList, updateIngress} from "../../api/scheduler/ingress/ingress.js";
import {useRouter} from "vue-router";
import { ElMessage, ElMessageBox } from 'element-plus'
import {getServiceList} from "../../api/scheduler/service/service.js";
import {addSecret, getSecretList, updateSecret} from "../../api/scheduler/secret/secret.js";
const route=useRouter()
const props=defineProps({
    method:{
        type:String,
        default:'Create'
    },
    item:{
        type:Object
    },
    ready:{
        type: Boolean,
        default: false
    }
})
const data=reactive({
    clusterId:"",
    nameSpace:"",
    item:{
        apiVersion:'v1',
        kind:'Secret',
        metadata:{
            name:'',
            namespace:'',
            labels:[],
            annotations:[],
        },
        stringData:{},
        immutable:false,
        type:"Opaque",
    },
    dockerCfg:{
        auths:{}
    },
    options:{
        dataList:[],
        items:[],
        labelList:[],
        annotationList:[],
        dataDisabled:false,
        secretTypeList:[
            {
                label:"通用类型(默认)",
                value:"Opaque"
            },
            {
                label:"镜像仓库密钥",
                value:"kubernetes.io/dockerconfigjson"
            },
            {
                label:"域名证书",
                value:"kubernetes.io/tls"
            },
        ],
        secretTypeConfig:{
            'Opaque':[],
            'kubernetes.io/dockerconfigjson':[
                {
                    key:'address',
                    value:''
                },
                {
                    key:'username',
                    value:''
                },
                {
                    key:'password',
                    value:''
                },
                {
                    key:'email',
                    value:''
                },
            ],
            'kubernetes.io/tls':[
                {
                    key:'tls.key',
                    value:''
                },
                {
                    key:'tls.crt',
                    value:''
                }
            ]

        }
    },
})
const rules=reactive({
    name:[{required:true,message:"请输入ConfigMap名称",trigger:'blur'}],
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
    const tableData=list2object(data.options.dataList)
    if(data.item.type=='kubernetes.io/dockerconfigjson'){
        const user_pass=`${tableData.username}:${tableData.password}`
        const auth=btoa(user_pass.trim())
        //修改的时候不会修改原先的，而是新增一个
        const registryConfig={
            username:tableData.username,
            address:tableData.address,
            password:tableData.password,
            email:tableData.email,
            auth:auth
        }
        data.dockerCfg.auths[tableData.address]=registryConfig
        if(data.item.stringData==null||data.item.stringData==undefined){
            data.item.stringData={}
        }
        data.item.stringData['.dockerconfigjson']=JSON.stringify(data.dockerCfg)
    }else{
        data.item.stringData=tableData
    }
    if(tag=='yaml'){
        showDialog.value=true
        delete data.item.metadata.managedFields
        yamlData=obj2yaml(data.item)

    }else{
        const formData={
            clusterId: data.clusterId,
            nameSpace: data.nameSpace,
            item: data.item
        }
        if(props.method!='Update'){
            addSecret(formData).then((response)=>{
                open(response.data.message)
            })

        }else{
            updateSecret(formData).then((response)=>{
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
    data.options.items=[]
    getResourceList()

}
const getResourceList=async ()=>{
    await listHandler('secret',data.clusterId,data.nameSpace).then((res)=>{
        data.options.items=res.data.data.items

    })
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
                path:'/secret/list',
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
        data.options.labelList=object2list(data.item.metadata.labels)
        data.options.annotationList=object2list(data.item.metadata.annotations)
        if(data.item.type=='kubernetes.io/dockerconfigjson'){
            const dockerCfg=atob(data.item.data['.dockerconfigjson'])
            const dockerCfgObj=JSON.parse(dockerCfg)
            data.dockerCfg=dockerCfgObj
            const address=Object.keys(data.dockerCfg.auths)[0]
            const auth=data.dockerCfg.auths[address]
            const registryConfig={
                username:auth.username,
                address:address,
                email:auth.email,
                password:auth.password
            }
            data.options.dataList=object2list(registryConfig)
        }else{
            const bas64Data=data.item.data
            for(let [key,value]of Object.entries(bas64Data)){
                const o={
                    key:key,
                    value:atob(value)
                }
                data.options.dataList.push(o)
            }

        }
        if(props.method=='Update'&&data.item.immutable){
            data.options.dataDisabled=true
            delete data.item.data
        }
    }


})
const secretTypeChanged=(val)=>{
   data.options.dataList=data.options.secretTypeConfig[val]
}

</script>
<style scoped>
.btn{
    display: flex;
    justify-content: center;
}
.el-form-item {
    margin-bottom: 0px
}

.el-form-item.is-error {
    margin-bottom: 20px
}
</style>