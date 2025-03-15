<template>
    <el-form  :model="newVolumeConfig" ref="formRef" :rules="rules">
        <el-row :gutter="20">
            <el-col :span="6" v-if="props.method=='create'">
                <el-form-item  label="名称" prop="name"  >
                    <el-input   v-model.trim="newVolumeConfig.name" placeholder="请输入名称"></el-input>
                </el-form-item>
            </el-col>
            <el-col :span="6">
                <el-form-item label="NFS路径" prop="nfs.path"  >
                    <el-input  v-model.trim="newVolumeConfig.nfs.path" placeholder="请输入NFS路径" />
                </el-form-item>
            </el-col>
            <el-col :span="6">
                <el-form-item label="NFS地址" prop="nfs.server"  >
                    <el-input  v-model.trim="newVolumeConfig.nfs.server" placeholder="请输入NFS地址" />
                </el-form-item>
            </el-col>
            <el-col :span="6">
                <el-form-item label="只读挂载" prop="nfs.server.readonly"  >
                    <el-switch v-model="newVolumeConfig.nfs.readonly"></el-switch>
                </el-form-item>
            </el-col>
        </el-row>

        <el-button v-if="props.method=='create'" type="primary" @click="submit" size="default">创建</el-button>
    </el-form>
</template>

<script setup>
import {inject, onBeforeMount, onMounted, reactive, ref, toRefs} from "vue";
import {ElMessage} from "element-plus";
import {useItem} from '../../../store/index.js'
const useItemer=useItem()
const formRef=ref()
const data=reactive({
    newVolumeConfig:{
        name: "",
        nfs:{
            server:"",
            path:"",
            readonly:false
        }

    },
    rules:{
        name:[{required:true,message:"请输入volume名称",trigger:'blur'}],
        'nfs.path':[
            {required:true,message:"请输入NFS路径",trigger:'blur'},
            {pattern:'(?=/)',message:"path必须以/开头",trigger:'blur'}
        ],
        'nfs.server':[
            {required:true,message:"请输入NFS地址",trigger:'blur'},
        ]
    }
})
const {newVolumeConfig,mountTypeList,rules}=toRefs(data)
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
</script>

<style scoped>

</style>