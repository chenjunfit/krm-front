<template>
    <el-form  :model="newVolumeConfig" ref="formRef" :rules="rules">
        <el-row :gutter="20">
            <el-col :span="8" v-if="props.method=='create'">
                <el-form-item  label="名称" prop="name"  >
                    <el-input   v-model.trim="newVolumeConfig.name" placeholder="请输入名称"></el-input>
                </el-form-item>
            </el-col>
            <el-col :span="8">
                <el-form-item label="类型" prop="type"  >
                    <div class="flex flex-wrap gap-4 items-center">
                        <el-select
                                v-model="newVolumeConfig.persistentVolumeClaim.claimName"
                                placeholder="选择类型"
                                size="default"
                                value-key="name"
                                style="width: 180px;"
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
            <el-col :span="8">
                <el-form-item label="只读挂载" prop="newVolumeConfig.persistentVolumeClaim.readonly">
                    <el-switch v-model="newVolumeConfig.persistentVolumeClaim.readonly"></el-switch>
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
import {getPvcList} from "../../../api/scheduler/pvc/pvc.js";
const useItemer=useItem()
const formRef=ref()
const data=reactive({
    newVolumeConfig:{
        name: "",
        persistentVolumeClaim:{
            claimName:"",
            readonly:false,
        }

    },
    mountTypeList:[],
    rules:{
        name:[{required:true,message:"请输入volume名称",trigger:'blur'}],
    },

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
const getlist=()=>{
    getPvcList(useItemer.item.clusterId,useItemer.item.nameSpace).then((res)=>{

        data.mountTypeList=res.data.data.items
    })
}
</script>

<style scoped>

</style>