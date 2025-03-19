<template>
<CreateOrEditFrame
    :method="props.method"
    :ShowNamespace="false"
    :cluster-read-only="props.method=='Update'"
    @namespaceChangedRollback="namespaceChangedHandler"
>
    <template #main>
        <el-form :model="item" ref="itemRef">
            <el-tabs v-model="activeName" class="demo-tabs" >
                <el-tab-pane label="基本配置" name="basic" style="height: 360px">
                    <el-row :gutter="20">
                        <el-col :span="8">
                            <el-form-item label="PV名称" prop="metadata.name" required :rules="rules.name" >
                                <el-input v-model="item.metadata.name" :disabled="props.method=='Update'" style="width: 160px"/>
                            </el-form-item>
                        </el-col>
                        <el-col :span="8">
                            <el-form-item label="大小" prop="spec.capacity.storage" required :rules="rules.capacity" >
                                <el-input v-model="item.spec.capacity.storage" style="width: 120px"/>
                            </el-form-item>
                        </el-col>
                        <el-col :span="8" v-if="data.options.pvType=='nfs'">
                            <el-form-item label="存储类型" prop="" required :rules="rules.pvType" >
                                <el-select
                                    v-model="options.pvType"
                                >
                                    <el-option
                                        v-for="type in data.options.pvTypeList"
                                        :key="type"
                                        :value="type"
                                        :label="type"
                                    />

                                </el-select>
                            </el-form-item>
                        </el-col >

                    </el-row>
                    <el-row :gutter="20">
                        <el-col :span="8">
                            <el-form-item label="存储类名称" prop="spec.storageClassName" required :rules="rules.storageClassName" >
                                <el-input v-model="item.spec.storageClassName" style="width: 160px" placeholder="请输入存储类名称"/>
                            </el-form-item>
                        </el-col>
                        <el-col :span="8">
                            <el-form-item label="访问策略" prop=""  >
                                <el-select
                                    v-model="item.spec.accessModes"
                                    multiple
                                    collapse-tags
                                >
                                    <el-option
                                        v-for="type in data.options.accessModes"
                                        :key="type.label"
                                        :value="type.value"
                                        :label="type.label"
                                    />

                                </el-select>
                            </el-form-item>
                        </el-col>
                        <el-col :span="8">
                            <el-form-item label="回收策略" prop=""  >
                                <el-select
                                    v-model="item.spec.persistentVolumeReclaimPolicy"
                                    style="width: 160px"
                                >
                                    <el-option
                                        v-for="type in data.options.reclaimPolicys"
                                        :key="type.label"
                                        :value="type.value"
                                        :label="type.label"
                                    />

                                </el-select>
                            </el-form-item>
                        </el-col>
                    </el-row>
                    <el-row :gutter="20" v-if="data.options.pvType=='nfs'">
                        <el-col :span="8">
                            <el-form-item label="NFS地址" prop="spec.nfs.server" required :rules="rules.server" >
                                <el-input v-model="item.spec.nfs.server" style="width: 160px"/>
                            </el-form-item>
                        </el-col>
                        <el-col :span="8">
                            <el-form-item label="NFS路径" prop="spec.nfs.path" required :rules="rules.path" >
                                <el-input v-model="item.spec.nfs.path" style="width: 160px"/>
                            </el-form-item>
                        </el-col>
                        <el-col :span="8">
                            <el-form-item label="只读" prop="spec.nfs.readOnly"  >
                                <el-switch v-model="item.spec.nfs.readOnly" />
                            </el-form-item>
                        </el-col>
                    </el-row>
                </el-tab-pane >
                <el-tab-pane label="注释及标签配置" name="labels" style="height: 360px" >
                    <el-tabs v-model="labelConfig" tab-position="left">
                        <el-tab-pane label="PV标签配置" name="labels">
                            <Table :list="options.labelList" ></Table>
                        </el-tab-pane>
                        <el-tab-pane label="PV注释配置" name="annos">
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
import {addPv, getPvList, updatePv} from "../../api/scheduler/pv/pv.js";
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
        kind:'PersistentVolume',
        metadata:{
            name:'',
            labels:[],
            annotations:[],
        },
        spec:{
            capacity:{
                storage:"20Gi"
            },
            storageClassName:"",
            accessModes: [
                "ReadWriteOnce"
            ],
            persistentVolumeReclaimPolicy:"Retain",
            nfs:{
                server:"",
                path:"",
                readOnly:false
            }
        },
    },
    options:{
        dataList:[],
        items:[],
        labelList:[],
        pvTypeList:['nfs'],
        pvType:"nfs",
        annotationList:[],
        accessModes: [
            {
                label:"单节点读写",
                value:"ReadWriteOnce"
            },
            {
                label:"单Pod读写",
                value:"ReadWriteOncePod"
            },
            {
                label:"多节点只读",
                value:"ReadOnlyMany"
            },
            {
                label:"多节点读写",
                value:"ReadWriteMany"
            },

        ],
        reclaimPolicys:[
            {
                label:"保留",
                value:"Retain"
            },
            {
                label:"回收",
                value:"Recycle"
            },
            {
                label:"删除",
                value:"Delete"
            },
        ]
    },
})
const rules=reactive({
    name:[{required:true,message:"请输入PV的名称",trigger:'blur'}],
    capacity:[{required:true,message:"请输入存储大小",trigger:'blur'}],
    pvType:[{required:true,message:"请选择存储类型",trigger:'blur'}],
    storageClassName:[{required:true,message:"请输入存储类名称",trigger:'blur'}],
    server:[{required:true,message:"请输入NFS地址",trigger:'blur'}],
    path:[{required:true,message:"请输入NFS路径",trigger:'blur'}],

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
            item: data.item
        }
        if(props.method!='Update'){
            console.log(formData)
            addPv(formData).then((response)=>{
                open(response.data.message)
            })

        }else{

            updatePv(formData).then((response)=>{
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
const namespaceChangedHandler=(clusterId)=>{
    data.clusterId=clusterId

}
const getResourceList=async ()=>{
    const params={
        clusterId: data.clusterId
    }
    await getPvList(params).then((res)=>{
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
                path:'/pv/list',
                query:{
                    clusterId:data.clusterId,
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
        if(data.item.spec.nfs!=undefined||data.item.spec.nfs!=null){
            data.options.pvType='nfs'
        }else{
            data.options.pvType=''
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
    margin-bottom: 20px
}

.el-form-item.is-error {
    margin-bottom: 20px
}
</style>