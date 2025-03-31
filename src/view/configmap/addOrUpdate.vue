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
                    <el-row :gutter="10">
                        <el-col :span="8">
                            <el-form-item label="ConfigMap名称" prop="metadata.name" required :rules="rules.name" >
                                <el-input v-model="item.metadata.name" :disabled="props.method=='Update'"/>
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
import {getSecretList} from "../../api/scheduler/secret/secret.js";
import {addConfigMap, updateConfigMap} from "../../api/scheduler/configmap/configmap.js";
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
        kind:'ConfigMap',
        metadata:{
            name:'',
            namespace:'',
            labels:[],
            annotations:[],
        },
        data:"",
        immutable:false
    },
    options:{
        dataList:[],
        items:[],
        labelList:[],
        annotationList:[],
        dataDisabled:false,

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
    data.item.data=list2object(data.options.dataList)
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
            addConfigMap(formData).then((response)=>{
                open(response.data.message)
            })

        }else{
            updateConfigMap(formData).then((response)=>{
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
    await listHandler('configmap',data.clusterId,data.nameSpace).then((res)=>{
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
                path:'/configmap/list',
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
        data.options.dataList=object2list(data.item.data)
        if(props.method=='Update'&&data.item.immutable){
            data.options.dataDisabled=true

        }
    }

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