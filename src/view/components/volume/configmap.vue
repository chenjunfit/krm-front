<template>
    <el-form  :model="newVolumeConfig" ref="formRef" :rules="rules">
        <el-tabs v-model="ActiveName" class="demo-tabs">
                <el-tab-pane label="基本配置" name="basic" style="height: 180px">
                    <el-row :gutter="20">
                        <el-col :span="5" v-if="props.method=='create'">
                            <el-form-item  label="名称" prop="name"  >
                                <el-input   v-model.trim="newVolumeConfig.name" placeholder="请输入名称"></el-input>
                            </el-form-item>
                        </el-col>
                        <el-col :span="9">
                            <el-form-item label="ConfigMap" prop="configMap.name" f >
                                <div class="flex flex-wrap gap-4 items-center">
                                    <el-select
                                        v-model="newVolumeConfig.configMap.name"
                                        placeholder="请选择configmap"
                                        size="default"
                                        value-key="name"
                                        style="width: 160px;"
                                        @visible-change="getlist"
                                    >
                                        <el-option
                                            v-for="s in mountTypeList"
                                            :key="s.metadata.name"
                                            :label="s.metadata.name"
                                            :value="s.metadata.name"
                                        />
                                    </el-select>
                                </div>
                            </el-form-item>
                        </el-col>
                        <el-col :span="5">
                            <el-form-item label="key必须存在" title="当指定item时key是否必须存在" prop="newVolumeConfig.configMap.optional" >
                                <el-switch v-model="newVolumeConfig.configMap.optional"></el-switch>
                            </el-form-item>
                        </el-col>
                        <el-col :span="5" v-if="props.method=='create'">
                            <el-form-item  label="权限" prop="defaultMode"  >
<!--                                <el-input-number :controls="false" v-model="newVolumeConfig.configMap.defaultMode" placeholder="请输入权限"></el-input-number>-->
                                <Oct2Decimal  v-model:data="newVolumeConfig.configMap.defaultMode" placeholder="请输入权限"></Oct2Decimal>

                            </el-form-item>
                        </el-col>
                    </el-row>
                </el-tab-pane>
            <el-tab-pane label="自定义挂载路径" name="mount" style="height: 180px">
                <el-table :data="newVolumeConfig.configMap.items" >
                    <el-table-column label="Key" align="center" width="180" >
                        <template #default="scope">
                            <el-form-item :prop="('configMap.items.'+scope.$index+'.key')" required :rules="rules.items.key">
                                <el-input v-model.trim="scope.row.key" ></el-input>
                            </el-form-item>
                        </template>
                    </el-table-column>
                    <el-table-column label="Path"  align="center" width="180">
                        <template #default="scope">
                            <el-form-item :prop="('configMap.items.'+scope.$index+'.key')" required :rules="rules.items.path">
                                <el-input v-model.trim="scope.row.path" ></el-input>
                            </el-form-item>
                        </template>
                    </el-table-column>
                    <el-table-column label="挂载权限"  align="center" >
                        <template #default="scope">
                            <el-form-item >
                                <Oct2Decimal v-model:data="scope.row.mode" input-width="100px" place-holder="请输入权限"></Oct2Decimal>
                            </el-form-item>
                        </template>
                    </el-table-column>
                    <el-table-column label="添加"  align="center">
                        <template #header>
                            <el-button type="primary"  @click="addItem">添加</el-button>
                        </template>
                        <template #default="scope">
                            <el-button type="warning" @click="deleteTableRow(newVolumeConfig.configMap.items,scope.row)" color="red">删除</el-button>
                        </template>
                    </el-table-column>
                </el-table>
            </el-tab-pane>
        </el-tabs>
            <el-button v-if="props.method=='create'" type="primary" @click="submit" size="default"  >创建</el-button>
    </el-form>
</template>

<script setup>
import {inject, onBeforeMount, onMounted, reactive, ref, toRefs} from "vue";
import {ElMessage} from "element-plus";
import {useItem} from '../../../store/index.js'
import {getPvcList} from "../../../api/scheduler/pvc/pvc.js";
import {getConfigMapList} from "../../../api/scheduler/configmap/configmap.js";
import StringOrNumber from "../stringOrNumber.vue";
import SchedulerConfig from "../scheduler/schedulerConfig.vue";
import ClusterNamespaceSelect from "../clusterNamespaceSelect.vue";
import Table from "../table.vue";
import Volume from "./volume.vue";
import {deleteTableRow} from "../../../utils/index.js";
import Oct2Decimal from "../oct2Decimal.vue";
const useItemer=useItem()
const formRef=ref()
const data=reactive({
    newVolumeConfig:{
        name: "",
        configMap:{
            name:"",
            items:[],
            defaultMode:420,
            optional: true
        }

    },
    mountTypeList:[],
    rules:{
        name:[
            {required:true,message:"请输入volume名称",trigger:'blur'}
        ],
        'configMap.name':[
            {required:true,message:"请选择configmap",trigger:'blur'}
        ],
        items:{
            key:[{required:true,message:"请输入Key",trigger:'blur'}],
            path:[{required:true,message:"请输入Path",trigger:'blur'}]
        }

    },

})
const {newVolumeConfig,mountTypeList,rules}=toRefs(data)
const ActiveName=ref("basic")
const props=defineProps({
    volumeConfig:{
        type:Object,
        default:{}
    },
    method:{
        type:String,
        default:"create"
    }
})
const submit=()=>{
    formRef.value.validate((valid)=>{
        if(valid){
            if(useItemer.item.spec.template.spec.volumes==undefined){
                useItemer.item.spec.template.spec.volumes=[]
            }
            for(let i=0;i<useItemer.item.spec.template.spec.volumes.length;i++){
                if(useItemer.item.spec.template.spec.volumes[i].name==data.newVolumeConfig.name){
                    ElMessage.error(data.newVolumeConfig.name+"已存在")
                    return
                }
            }
            useItemer.item.spec.template.spec.volumes.push(data.newVolumeConfig)
            closeDialog()
        }else{
            ElMessage({
                message: "请完善表单",
                type: 'error',
            })
        }
    })
}
const closeDialog=inject('closeVolumeDialog')
onMounted(()=>{
    if(props.method!='create'){
        data.newVolumeConfig=props.volumeConfig
    }
})
const getlist=()=>{
    getConfigMapList(useItemer.item.clusterId,useItemer.item.nameSpace).then((res)=>{

        data.mountTypeList=res.data.data.items
    })
}
const addItem=()=>{
    const item={
        key:"",
        path:"",
        mode:null,
    }
    data.newVolumeConfig.configMap.items.push(item)
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