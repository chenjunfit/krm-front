<template>
    <el-row :gutter="20">
        <el-col :span="8">
            <el-form-item
                label="请求端口"
                required
                :rules="rules.port"
                :prop="('spec.template.spec.containers.'+props.containerIndex+'.'+props.probeType+'.httpGet.port')"
            >
                <string-or-number v-model:data="props.probeConfig.httpGet.port" ></string-or-number>
            </el-form-item>
        </el-col>
        <el-col :span="8">
            <el-form-item
                label="请求主机"
                :prop="('spec.template.spec.containers.'+props.containerIndex+'.'+props.probeType+'.httpGet.host')"
            >
                <el-input v-model="props.probeConfig.httpGet.host"></el-input>
            </el-form-item>
        </el-col>
        <el-col :span="8">
            <el-form-item
                label="请求接口"
                :prop="('spec.template.spec.containers.'+props.containerIndex+'.'+props.probeType+'.httpGet.path')"
            >
                <el-input v-model="props.probeConfig.httpGet.path"></el-input>
            </el-form-item>
        </el-col>

    </el-row>
    <el-row :gutter="20">
        <el-col :span="8">
            <el-form-item
                label="请求协议"
                style="width: 160px"
                :prop="('spec.template.spec.containers.'+props.containerIndex+'.'+props.probeType+'.httpGet.scheme')"
            >
                <el-select v-model="props.probeConfig.httpGet.scheme">
                    <el-option
                        v-for="s in ['HTTP','HTTPS']"
                        :key="s"
                        :label="s"
                        :value="s"

                    >

                    </el-option>
                </el-select>
            </el-form-item>
        </el-col>
        <el-col :span="16">
            <el-form-item label="自定义请求头" >
               <el-table :data="props.probeConfig.httpGet.httpHeaders" border>

                    <el-table-column label="Name" align="center">
                        <template #default="scope">
                            <el-input v-model="scope.row.name"></el-input>
                        </template>
                    </el-table-column>
                   <el-table-column label="Value" align="center">
                       <template #default="scope">
                           <el-input v-model="scope.row.value"></el-input>
                       </template>
                   </el-table-column>
                   <el-table-column align="center">
                       <template #header>
                           <el-button link type="primary" @click="addHeader">添加</el-button>
                       </template>
                       <template #default="scope">
                           <el-button link type="warning" @click="deleteTableRow(props.probeConfig.httpGet.httpHeaders,scope.$index)">删除</el-button>
                       </template>
                   </el-table-column>
               </el-table>
            </el-form-item>
        </el-col>
    </el-row>

</template>

<script setup>

import String2list from "../../string2list.vue";
import {reactive} from "vue";
import StringOrNumber from "../../stringOrNumber.vue";
import {deleteTableRow} from "../../../../utils/index.js";

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
const addHeader=()=>{
    props.probeConfig.httpGet.httpHeaders.unshift({name:"",value:""})
}
</script>

<style scoped>

</style>