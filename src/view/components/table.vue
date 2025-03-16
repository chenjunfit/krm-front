<template>
    <el-tabs >
        <el-tab-pane  >
            <el-table :data="props.list" style=";width: 100%;height: 400px">
                <el-table-column prop="key" :label="props.keyName" :width="props.keyWidth" >
                    <template #default="scope">
                        <el-input :readonly="props.readOnly" v-model="scope.row.key"  placeholder="请输入键" />
                    </template>
                </el-table-column>
                <el-table-column prop="value" :label="props.valueName" :width="props.valueWidth" >
                    <template #default="scope">
                        <el-input :readonly="props.readOnly" :rows="props.rows" :type="props.inputType" v-model:="scope.row.value" placeholder="请输入值"/>
                    </template>
                </el-table-column>
                <el-table-column fixed="right" width="" >
                    <template #header>
                        <el-button :disabled="props.readOnly" type="primary" @click="addLabelRow">添加</el-button>
                    </template>
                    <template #default="scope">
                        <el-button :disabled="props.readOnly" type="primary" color="red" @click="deleteTableRow(props.list,scope.$index)">删除</el-button>
                    </template>
                </el-table-column>

            </el-table>
        </el-tab-pane>

    </el-tabs>
</template>

<script setup>
import {deleteTableRow} from "../../utils/index.js";
const props=defineProps({
    list:{
        type:Array,
        default:[],
    },
    keyName:{
        type:String,
        default:"key"
    },
    valueName:{
        type:String,
        default:"value"
    },
    inputType:{
        type:String,
        default:"text"
    },
    readOnly:{
        type:Boolean,
        default:false
    },
    keyWidth:{
        type:String,
        default:'240'
    },
    valueWidth:{
        type:String,
        default:'240'
    },
    rows:{
        type:null,
    }
})
const addLabelRow=()=>{
    const labelRow={
        key:"",
        value:""
    }
    props.list.unshift(labelRow)
}
</script>

<style scoped>

</style>