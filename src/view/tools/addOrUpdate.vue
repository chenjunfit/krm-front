<template>
<CreateOrEditFrame
    :ShowNamespace="false"
    @namespaceChangedRollback="namespaceChangedHandler"
>
    <template #header>
        <el-switch style="margin-left: 20px" v-model="options.update" active-text="存在仅更新" inactive-text="创建" inline-prompt size="large"></el-switch>
    </template>
    <template #main>
        <CodeMirror v-model="yamlData" height="600px"/>
        <div style="margin-top: 10px">
            <el-button type="primary" @click="submit">创建</el-button>
        </div>
    </template>
</CreateOrEditFrame>
</template>

<script setup>
import {reactive, ref, toRefs} from "vue";
import CreateOrEditFrame from "../components/createOrEditFrame.vue";
import {useRouter} from "vue-router";
import CodeMirror from "../components/codeMirror.vue";
import {ElMessage} from "element-plus";
import {createOrUpdateByYaml} from "../../api/tools/tools.js";
const route=useRouter()
const data=reactive({
    clusterId:"",
    options:{
        update:false
    },
})
const {options}=toRefs(data)
let yamlData=ref("")
const submit=()=>{
    if(yamlData.value==""){
        ElMessage.error("请输入Yaml数据")
        return
    }else{
        const postData={
            clusterId:data.clusterId,
            yaml: yamlData.value,
            apply: data.options.update
        }
        createOrUpdateByYaml(postData).then((res)=>{
            ElMessage.success(res.data.message)
        })
    }
}
const namespaceChangedHandler=(clusterId)=>{
    data.clusterId=clusterId

}


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