<template>
    <el-row :gutter="20">
        <el-col :span="8">
            <el-form-item
                label="探测端口"
                required
                :rules="rules.port"
                :prop="('spec.template.spec.containers.'+props.containerIndex+'.'+props.probeType+'.tcpSocket.port')"
            >
                <string-or-number v-model:data="props.probeConfig.tcpSocket.port" input-width="120px"></string-or-number>
            </el-form-item>
        </el-col>
        <el-col :span="8">
            <el-form-item
                label="探测主机"
                :prop="('spec.template.spec.containers.'+props.containerIndex+'.'+props.probeType+'.tcpSocket.host')"
            >
                <el-input v-model="props.probeConfig.tcpSocket.host" style="width: 120px;"></el-input>
            </el-form-item>
        </el-col>
    </el-row>
</template>

<script setup>

import String2list from "../../string2list.vue";
import {reactive} from "vue";
import StringOrNumber from "../../stringOrNumber.vue";
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
    port:[{required:true,message:"请输入端口",trigger:'blur'}],
})
</script>

<style scoped>

</style>