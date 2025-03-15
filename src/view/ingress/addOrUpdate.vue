<template>
<CreateOrEditFrame
    :method="props.method"
    :name-space-read-only="props.method=='Update'"
    :cluster-read-only="props.method=='Update'"
    @namespaceChangedRollback="namespaceChangedHandler"
>
    <template #header>
        <el-select
                   v-model="options.serviceSelected"
                   style="width: 240px;margin-left: 10px"
                   value-key="metadata.name"
                   placeholder="请选择要代理的Service"
                   multiple
                   collapse-tags
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
                <el-tab-pane label="基本配置" name="basic" style="height: 360px">
                    <el-row :gutter="10">
                        <el-col :span="8">
                            <el-form-item label="Ingress名称" prop="metadata.name" required :rules="rules.name">
                                <el-input v-model="item.metadata.name"/>
                            </el-form-item>
                        </el-col>
                        <el-col :span="8" >
                            <el-form-item label="选择IngressClass" prop="" >
                                <el-select
                                    v-model="item.spec.ingressClassName"
                                    placeholder="选择IngressClass"
                                    size="default"
                                    value-key="name"
                                    style="width: 240px"
                                    @visible-change="IngressClassChanged"
                                    clearable
                                >
                                    <el-option
                                        v-for="s in data.options.ingressClassList"
                                        :key="s.metadata.name"
                                        :label="s.metadata.name"
                                        :value="s.metadata.name"
                                    />
                                </el-select>
                            </el-form-item>
                        </el-col>
                    </el-row>
                </el-tab-pane >
                <el-tab-pane  label="路由配置" name="rule" style="height: 360px">
                    <el-tabs tab-position="left" style="width: 100%">
                        <el-tab-pane name="domainConfig" label="域名配置" >
                            <el-table :data="item.spec.rules" >
                                <el-table-column prop="host" label="域名" width="140" align="center" >
                                    <template #default="scope">
                                        <el-input v-model="scope.row.host" placeholder="请输入域名"/>
                                    </template>
                                </el-table-column>
                                <el-table-column prop="http" label="路径配置" width="600" align="center" style="height: 120px">
                                    <template #default="scope">
                                        <el-table :data="scope.row.http.paths" >
                                            <el-table-column prop="path" label="路径" width="140" align="center" >
                                                <template #default="pathScope">
                                                    <el-form-item required :prop="('spec.rules.'+scope.$index+'.http.paths.'+pathScope.$index+'.path')" :rules="rules.path">
                                                        <el-input v-model="pathScope.row.path" placeholder="请输入访问路径"/>
                                                    </el-form-item>
                                                </template>
                                            </el-table-column>
                                            <el-table-column prop="backend.service.name" label="代理服务" width="160" align="center">
                                                    <template #default="pathScope">
                                                        <el-form-item  :rules="rules.serviceName" required :prop="('spec.rules.'+scope.$index+'.http.paths.'+pathScope.$index+'.backend.service.name')" >
                                                        <el-select
                                                            v-model="pathScope.row.backend.service.name"
                                                            placeholder="选择代理服务"
                                                        >
                                                            <el-option
                                                                v-for="s in data.options.items"
                                                                :key="s.metadata.name"
                                                                :value="s.metadata.name"
                                                                :label="s.metadata.name"

                                                            />
                                                        </el-select>
                                                        </el-form-item>
                                                    </template>


                                            </el-table-column>
                                            <el-table-column prop="backend.service.port.number" label="代理端口" width="120" align="center">
                                                <template #default="pathScope">
                                                    <el-form-item  :rules="rules.port" required :prop="('spec.rules.'+scope.$index+'.http.paths.'+pathScope.$index+'.backend.service.port.number')" >

                                                    <el-select
                                                        v-model="pathScope.row.backend.service.port.number"
                                                        placeholder="选择代理端口"
                                                    >
                                                        <el-option
                                                            v-for="s in getServicePort(pathScope.row.backend.service.name)"
                                                            :key="s"
                                                            :value="s"
                                                            :label="s"

                                                        />
                                                    </el-select>
                                                    </el-form-item>
                                                </template>
                                            </el-table-column>
                                            <el-table-column prop="pathType" label="匹配模式" width="100" align="center" >
                                                <template #default="pathScope">
                                                    <el-select
                                                        v-model="pathScope.row.pathType"
                                                        placeholder="选择路由匹配模式"
                                                    >
                                                        <el-option
                                                            v-for=" s in data.options.pathType"
                                                            :key="s.label"
                                                            :value="s.value"
                                                            :label="s.label"

                                                        />
                                                    </el-select>
                                                </template>
                                            </el-table-column>
                                            <el-table-column  align="center" >
                                                <template #header>
                                                    <el-button link type="primary" @click="addPath(scope.$index)">添加</el-button>
                                                </template>
                                                <template #default="pathScope">
                                                    <el-button link type="warning" @click="deleteTableRow(item.spec.rules[scope.$index].http.paths,pathScope.$index)">删除</el-button>
                                                </template>
                                            </el-table-column>
                                        </el-table>
                                    </template>
                                </el-table-column>
                                <el-table-column   align="center" >
                                    <template #header>
                                        <el-button type="primary" @click="addRule">添加</el-button>
                                    </template>
                                    <template #default="scope">
                                        <el-button type="warning" @click="deleteTableRow(item.spec.rules,scope.$index)">删除</el-button>
                                    </template>
                                </el-table-column>
                            </el-table>
                        </el-tab-pane>
                        <el-tab-pane name="https" label="证书配置">
                            <el-table :data="item.spec.tls" >
                                <el-table-column prop="" label="选择域名" align="center" >
                                    <template #default="scope">
                                        <el-select
                                            v-model="scope.row.hosts"
                                            placeholder="选择域名"
                                            multiple
                                            filterable
                                        >
                                            <el-option
                                                v-for="s in item.spec.rules"
                                                :key="s.host"
                                                :value="s.host"
                                                :label="s.host"

                                            />
                                        </el-select>
                                    </template>
                                </el-table-column>
                                <el-table-column prop="" label="选择证书" align="center" >
                                    <template #default="scope">
                                        <el-select
                                            v-model="scope.row.secretName"
                                            placeholder="选择证书"
                                            @visible-change="getTlsSecret"
                                        >
                                            <el-option
                                                v-for="s in data.options.tlsSeretList"
                                                :key="s.metadata.name"
                                                :value="s.metadata.name"
                                                :label="s.metadata.name"

                                            />
                                        </el-select>
                                    </template>
                                </el-table-column>

                                <el-table-column   align="center" >
                                    <template #header>
                                        <el-button type="primary" @click="addTls">添加</el-button>
                                    </template>
                                    <template #default="scope">
                                        <el-button type="warning" @click="deleteTableRow(item.spec.tls,scope.$index)">删除</el-button>
                                    </template>
                                </el-table-column>
                            </el-table>
                        </el-tab-pane>
                    </el-tabs>
                </el-tab-pane>
                <el-tab-pane label="注释及标签配置" name="labels" style="height: 360px" >
                    <el-tabs v-model="labelConfig" tab-position="left">
                        <el-tab-pane label="Service标签配置" name="labels">
                            <Table :list="options.labelList"></Table>
                        </el-tab-pane>
                        <el-tab-pane label="Service注释配置" name="annos">
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
import {getSecretList} from "../../api/scheduler/secret/secret.js";
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
        apiVersion:'networking.k8s.io/v1',
        kind:'Ingress',
        metadata:{
            name:'',
            namespace:'',
            labels:[],
            annotations:[],
        },
        spec:{
            rules:[],
        }

    },
    options:{
        items:[],
        serviceSelected:[],
        ingressClassList:[],
        tlsSeretList:[],
        labelList:[],
        annotationList:[],
        podLabelList:[],
        pathType:[
            {
                label:"精确匹配",
                value:"Exact"
            },
            {
                label:"前缀匹配",
                value:"Prefix"
            },
            {
                label:"取决于IngressClass",
                value:"ImplementationSpecific"
            },
        ],
        path: {
            backend: {
                service: {
                    name: "",
                    port: {
                        number: null
                    }
                }
            },
            path: "",
            pathType: ""
        }

    },
})
const rules=reactive({
    name:[{required:true,message:"请输入Ingress名称",trigger:'blur'}],
    path:[
        {required:true,message:"请输入路径",trigger:'blur'},
        {pattern:'(?=/)',message:"path必须以/开头",trigger:'blur'}
    ],
    serviceName:[
        {required:true,message:"请选择service",trigger:'blur'},
    ],
    port:[
        {required:true,message:"请选择端口",trigger:'blur'},
    ],


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
            addIngress(formData).then((response)=>{
                open(response.data.message)
            })

        }else{
            updateIngress(formData).then((response)=>{
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
    await listHandler('service',data.clusterId,data.nameSpace).then((res)=>{
        data.options.items=res.data.data.items
    })
}
const addRule=()=>{
    const rule={
        host:"",
        http: {
            paths: [
                {
                    backend: {
                        service: {
                            name: "",
                            port: {
                                number: ""
                            }
                        }
                    },
                    path: "",
                    pathType: ""
                }
            ]
        }
    }
    data.item.spec.rules.unshift(JSON.parse(JSON.stringify(rule)))
}
const addPath=(index)=>{

    data.item.spec.rules[index].http.paths.unshift(JSON.parse(JSON.stringify(data.options.path)))

}
const addTls=()=>{
    if(data.item.spec.tls==undefined){
        data.item.spec.tls=[]
    }
    const tlsConfig={
        hosts:[],
        secretName:""
    }
    data.item.spec.tls.push(tlsConfig)
}
const getServicePort=computed(()=>(serviceName)=>{
    for(let p=0;p<data.options.items.length;p++){
        if(data.options.items[p].metadata.name==serviceName){
            let ports=[]
            data.options.items[p].spec.ports.forEach((port)=>{
                if(ports.indexOf(port.port)==-1){
                    ports.push(port.port)
                }
            })
            return ports
        }
    }

})
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
                path:'/ingress/list',
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
const IngressClassChanged=(visable)=>{
    if(!visable){
        return
    }else{
        getIngressClassList(data.clusterId).then((res)=>{
            data.options.ingressClassList=res.data.data.items
        })
    }
}
const getTlsSecret=(val)=>{
    if(!val){
        return
    }
    const params={
        clusterId: data.clusterId,
        nameSpace: data.nameSpace,
        fieldSelector: "",
        labelSelector:"type=kubernetes.io/tls",
    }
    getSecretList(params).then((res)=>{
        data.options.tlsSeretList=[]
        data.options.tlsSeretList=res.data.data.items

    })
}
onBeforeMount(()=>{
    if(props.method!='Create'){
        data.item=JSON.parse(JSON.stringify(props.item))
        data.options.labelList=object2list(props.item.metadata.labels)
        data.options.annotationList=object2list(props.item.metadata.annotations)
    }
    data.item.spec.rules.forEach((rule)=>{
        rule.http.paths.forEach((path)=>{
            if(data.options.serviceSelected.indexOf(path.backend.service.name)==-1){
                data.options.serviceSelected.push(path.backend.service.name)
            }

        })
    })
})

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