<template>
    <el-row :gutter="20">
        <el-col :span="8">
            <el-form-item
                label="GRPC端口"
                required
                :rules="rules.port"
                :prop="('spec.template.spec.containers.'+props.containerIndex+'.'+props.probeType+'.grpc.port')"
            >
                <el-input-number :min:="1" :max="65535" :controls="false" v-model="props.probeConfig.grpc.port"/>
            </el-form-item>
        </el-col>
        <el-col :span="8">
            <el-form-item
                label="GRPC服务"
                :prop="('spec.template.spec.containers.'+props.containerIndex+'.'+props.probeType+'.grpc.service')"
            >
                <el-input v-model="props.probeConfig.grpc.service" style="width: 120px;"></el-input>
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
    port:[{required:true,message:"请输入GRPC端口",trigger:'blur'}],
})
</script>

<style scoped>

</style>