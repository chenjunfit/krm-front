<template>
<el-form  :model="newVolumeConfig" ref="formRef" :rules="rules">
    <el-row :gutter="20">
        <el-col :span="8" v-if="props.method=='create'">
            <el-form-item  label="名称" prop="name"  >
                <el-input   v-model.trim="newVolumeConfig.name" placeholder="请输入名称"></el-input>
            </el-form-item>
        </el-col>
        <el-col :span="8">
            <el-form-item label="宿主机路径" prop="hostPath.path"  >
                <el-input  v-model.trim="newVolumeConfig.hostPath.path" placeholder="请输入宿主机路径" />
            </el-form-item>
        </el-col>
        <el-col :span="8">
            <el-form-item label="类型" prop="type"  >
                <div class="flex flex-wrap gap-4 items-center">
                    <el-select
                            v-model="newVolumeConfig.hostPath.type"
                            placeholder="选择类型"
                            size="default"
                            value-key="name"
                            style="width: 180px;"
                    >
                        <el-option
                                v-for="s in mountTypeList"
                                :key="s.label"
                                :label="s.label"
                                :value="s.value"
                        />
                    </el-select>
                </div>
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
         hostPath:{
             type:"",
             path:"",
         }

    },
    mountTypeList:[
        {
            label:'不检查(默认值)',
            value:""
        },
        {
            label:"目录不存在则创建",
            value:"DirectoryOrCreate"
        },
        {
            label:"目录不存在则无法挂载",
            value:"Directory"
        },
        {
            label:"文件不存在则创建",
            value:"FileOrCreate"
        },
        {
            label:"文件不存在则无法挂载",
            value:"File"
        },
        {
            label:"Socket类型,不存在则无法挂载",
            value:"Socket"
        },
        {
            label:"块设备,不存在则无法挂载",
            value:"BlockDevice"
        },
        {
            label:"字符设备,不存在则无法挂载",
            value:"CharDevice"
        },

    ],
    rules:{
        name:[{required:true,message:"请输入volume名称",trigger:'blur'}],
        'hostPath.path':[
            {required:true,message:"请输入宿主机路径",trigger:'blur'},
            {pattern:'(?=/)',message:"path必须以/开头",trigger:'blur'}
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