<template>
<CreateOrEditFrame
    :method="props.method"
    :cluster-read-only="props.method=='Update'"
    :name-space-read-only="props.method=='Update'"
    @namespaceChangedRollback="namespaceChangedHandler"
>
    <template #main>
        <el-form :model="item" ref="itemRef">
            <el-tabs v-model="activeName" class="demo-tabs" >
                <el-tab-pane label="基本配置" name="basic" style="height: 360px">
                    <el-row :gutter="20">
                        <el-col :span="8">
                            <el-form-item label="PVC名称" prop="metadata.name" required :rules="rules.name" >
                                <el-input v-model="item.metadata.name" :disabled="props.method=='Update'" style="width: 160px"/>
                            </el-form-item>
                        </el-col>
                        <el-col :span="8">
                            <el-form-item label="大小" prop="spec.resources.requests.storage" required :rules="rules.capacity" >
                                <el-input v-model="item.spec.resources.requests.storage" style="width: 120px"/>
                            </el-form-item>
                        </el-col>
                        <el-col :span="8" >
                            <el-form-item label="申请类型" prop="" v-if="props.method!='Update'" >
                                <el-select
                                    v-model="options.claimTypeSelected"
                                    @change="claimTypeChanged"
                                >
                                    <el-option
                                        v-for="type in data.options.claimTypeList"
                                        :key="type.label"
                                        :value="type.value"
                                        :label="type.label"
                                    />

                                </el-select>
                            </el-form-item>
                        </el-col >

                    </el-row>
                    <el-row :gutter="20">
                        <el-col :span="8" v-if="props.method!='Update'">
                            <el-form-item label="资源类型" prop=""  >
                                <el-select
                                    v-model="item.spec.storageClassName"
                                    placeholder="请选择存储类"
                                    v-if="options.claimTypeSelected=='storageclass'"
                                >
                                    <el-option
                                        v-for="type in data.options.volumeSourceList"
                                        :key="type.metadata.name"
                                        :value="type.metadata.name"
                                        :label="type.metadata.name"
                                    />

                                </el-select>
                                <el-select
                                    v-model="item.spec.storageClassName"
                                    placeholder="请选择pv"
                                    v-if="options.claimTypeSelected=='pv'"
                                >
                                    <el-option
                                        v-for="type in data.options.volumeSourceList"
                                        :key="type.metadata.name"
                                        :value="type.metadata.name"
                                        :label="type.metadata.name"
                                    />

                                </el-select>
                            </el-form-item>
                        </el-col >
                        <el-col :span="8" v-if="props.method=='Update'">
                            <el-form-item label="资源类型" prop=""  >
                                <el-input :disabled="true" v-model="item.spec.storageClassName"/>
                            </el-form-item>
                        </el-col >
                        <el-col :span="8" >
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
                            <el-form-item label="存储类型" prop=""  >
                                <el-select
                                    v-model="item.spec.volumeMode"
                                >
                                    <el-option
                                        v-for="type in data.options.volumeType"
                                        :key="type.label"
                                        :value="type.value"
                                        :label="type.label"
                                    />

                                </el-select>
                            </el-form-item>
                        </el-col>
                    </el-row>
                </el-tab-pane >
                <el-tab-pane label="注释及标签配置" name="labels" style="height: 360px" >
                    <el-tabs v-model="labelConfig" tab-position="left">
                        <el-tab-pane label="PVC标签配置" name="labels">
                            <Table :list="options.labelList" ></Table>
                        </el-tab-pane>
                        <el-tab-pane label="PVC注释配置" name="annos">
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
import {addPvc, updatePvc} from "../../api/scheduler/pvc/pvc.js";
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
            namespace:'',
            labels:[],
            annotations:[],
        },
        spec:{
            resources:{
                requests:{
                    storage: "20Gi"
                }
            },
            storageClassName:"",
            volumeMode: "Filesystem",
            accessModes:['ReadWriteMany'],
        },
    },
    options:{
        dataList:[],
        items:[],
        labelList:[],
        annotationList:[],
        claimTypeSelected:"storageclass",
        claimTypeList:[
            {
                label:"静态申请",
                value:"pv"
            },
            {
                label:"动态申请",
                value:"storageclass"
            }
        ],
        volumeType: [
            {
                label:"文件类型",
                value:"Filesystem"
            },
            {
                label:"块存储",
                value:"Block"
            }

        ],
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
        volumeSourceList:[],
    },
})
const rules=reactive({
    name:[{required:true,message:"请输入PVC的名称",trigger:'blur'}],
    capacity:[{required:true,message:"请输入存储大小",trigger:'blur'}],

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
            nameSpace:data.nameSpace,
            item: data.item
        }
        if(props.method!='Update'){
            addPvc(formData).then((response)=>{
                open(response.data.message)
            })

        }else{

            updatePvc(formData).then((response)=>{
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
const namespaceChangedHandler=(clusterId,nameSpace)=>{
    data.clusterId=clusterId
    data.nameSpace=nameSpace
    data.item.metadata.namespace=data.nameSpace

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
                path:'/pvc/list',
                query:{
                    clusterId:data.clusterId,
                }
            })
        })
        .catch(() => {
            return
        })
}
const claimTypeChanged=(val)=>{

    if(val=='pv'){
        listHandler('persistentvolume',data.clusterId,data.nameSpace).then((res)=>{
            data.options.volumeSourceList=[]
            data.options.volumeSourceList=res.data.data.items
        })
    }else{
        listHandler('storageclass',data.clusterId,data.nameSpace).then((res)=>{
            data.options.volumeSourceList=[]
            data.options.volumeSourceList=res.data.data.items
        })
    }

}
onBeforeMount(()=>{
    if(props.method!='Create'){
        data.item=JSON.parse(JSON.stringify(props.item))
        data.options.labelList=object2list(data.item.metadata.labels)
        data.options.annotationList=object2list(data.item.metadata.annotations)
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