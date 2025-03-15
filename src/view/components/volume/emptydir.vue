<template>
    <el-form  :model="newVolumeConfig" ref="formRef" :rules="rules">
        <el-row :gutter="20">
            <el-col :span="8" v-if="props.method=='create'">
                <el-form-item  label="名称" prop="name"  >
                    <el-input   v-model.trim="newVolumeConfig.name" placeholder="请输入名称"></el-input>
                </el-form-item>
            </el-col>
            <el-col :span="8">
                <el-form-item label="类型" prop="emptyDir.type"  >
                    <div class="flex flex-wrap gap-4 items-center">
                        <el-select
                                v-model="newVolumeConfig.emptyDir.type"
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
            <el-col :span="8">
                <el-form-item label="限制大小" prop="emptyDir.sizeLimit"  >
                    <StringOrNumber place-holder="请输入限制大小" v-model:data="newVolumeConfig.emptyDir.sizeLimit" input-width='120px'/>
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
import StringOrNumber from "../stringOrNumber.vue";
const useItemer=useItem()
const formRef=ref()
const data=reactive({
    newVolumeConfig:{
        name: "",
        emptyDir:{
            type:"",
            sizeLimit:0,
        }

    },
    mountTypeList:[
        {
            label:'默认值',
            value:""
        },
        {
            label:"内存类型",
            value:"Memory"
        }

    ],
    rules:{
        name:[{required:true,message:"请输入volume名称",trigger:'blur'}],
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
onBeforeMount(()=>{
    if(props.method!='create'){
        data.newVolumeConfig=props.volumeConfig
    }
})
</script>

<style scoped>

</style>