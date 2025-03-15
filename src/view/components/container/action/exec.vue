<template>
    <el-form-item
        label="执行命令"
        required
        :rules="rules.command"
        :prop="('spec.template.spec.containers.'+props.containerIndex+'.'+props.probeType+'.exec.command')"
        >
        <string2list v-model:data="props.probeConfig.exec.command"  input-width="240px" ></string2list>
    </el-form-item>
</template>

<script setup>

import String2list from "../../string2list.vue";
import {reactive} from "vue";
const props=defineProps({
    probeConfig:{
        type:Object
    },
    probeType:{
        type: String,
        default:"startupProbe"
    },
    containerIndex:{
        type:Number
    },
    containerType:{
        type: String,
        default:"container"
    },
})
const rules=reactive({
    command:[
        {
            message: '请输入command',
           required:true,
            trigger: 'blur'
        }
],
})

</script>

<style scoped>

</style>