<template>
    <el-dialog
            v-model="visiable"
            title="详情"
            width="60%"
            @before-close="closeDialog"
            destroy-on-close
    >
        <template #header="{titleId, titleClass }">
            <div class="my-header">
                <div :id="titleId" :class="titleClass">
                    <el-button type="primary" >
                        <i class="iconfont icon-bushu" style="width: 50px"/>
                        <div>{{props.clusterId}}</div>
                    </el-button>
                    <el-button type="primary" >
                        <i class="iconfont icon-rongqi" style="width: 50px"/>
                        <div>{{props.nameSpace}}</div>
                    </el-button>
                </div>

            </div>
        </template>
        <codeMirror v-model="yamlData"></codeMirror>
        <template #footer>
            <div style="text-align: center">
                <el-button  type="primary" @click="updateByYaml">更新</el-button>

            </div>
        </template>
    </el-dialog>
</template>

<script setup>
import {computed, onUpdated, ref} from "vue";
import codeMirror from '../codeMirror.vue'
import {ElMessage, ElMessageBox} from "element-plus";
import {createOrUpdateByYaml} from "../../../api/tools/tools.js";
import {getDeploymentList} from "../../../api/scheduler/deployment/deployment.js";
const props=defineProps({
    clusterId:{
        type: String
    },
    nameSpace:{
        type: String
    },
    yamlContent:{
        type: String
    },
    showDialog:{
        type:Boolean,
        default:false
    }

})
const yamlData=ref('')
const visiable=computed({
    get(){
        return props.showDialog
    },
    set(val){
        emits('closeDialogHandler',val)
    }
})
onUpdated(()=>{
    yamlData.value=props.yamlContent
})

const emits=defineEmits(['closeDialogHandler'])
const closeDialog=()=>{
emits('closeDialogHandler')
}
const updateByYaml=()=>{
    if(yamlData.value==""){
        ElMessage.error("请输入Yaml数据")
        return
    }else{
        const postData={
            clusterId:props.clusterId,
            nameSpace:props.nameSpace,
            yaml: yamlData.value,
            method: "Update"
        }
        createOrUpdateByYaml(postData).then((res)=>{
            let tmpMsg=res.data.message
            const msg= tmpMsg.replace("\n","<br/>")
            ElMessageBox.alert(msg, '', {
                confirmButtonText: 'OK',
                dangerouslyUseHTMLString: true
            }).then(()=>{
                window.location.reload();
            })

        })
    }
}
</script>

<style scoped>

</style>