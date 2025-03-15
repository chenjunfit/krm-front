<template>
<el-table border :data="props.ports" height="300px">

<el-table-column label="端口名称" align="center" prop="name">
    <template #default="scope">
        <el-form-item style="margin-bottom: 0px">
            <el-input style="width: 100%" v-model.trim="scope.row.name" placeholder="端口名称"/>
        </el-form-item>
    </template>
</el-table-column>
    <el-table-column label="程序端口" align="center" prop="containerPort" >
        <template #default="scope">
            <el-form-item style="margin-bottom: 0px">
                <el-input-number style="width: 100%" :min="1" :max="65535" :controls="false" v-model.trim="scope.row.containerPort" placeholder="端口名称"/>
            </el-form-item>
        </template>
    </el-table-column>
    <el-table-column label="协议" align="center" prop="protocol">
        <template #default="scope">
            <el-form-item style="width: 100%;margin-bottom: 0px" >
                <el-select v-model="scope.row.protocol">
                    <el-option
                            v-for="item in ['TCP','UDP','SCTP']"
                            :key="item"
                            :value="item"
                            :label="item"
                    >

                    </el-option>
                </el-select>

            </el-form-item>
        </template>
    </el-table-column>
    <el-table-column align="center">
        <template #header>
            <el-button type="primary" @click="addPort">添加</el-button>
        </template>
        <template #default="scope">
            <el-button type="warning" @click="deleteTableRow(props.ports,scope.$index)">删除</el-button>
        </template>
    </el-table-column>

</el-table>
</template>

<script setup>
import {deleteTableRow} from "../../../utils/index.js";

const props=defineProps({
    ports:{
        type:Array,
        default:[],
    }
})
const addPort=()=>{
  const port={
      name:'',
      containerPort:8080,
      protocol:"TCP"
  }
  props.ports.unshift(port)
}
</script>

<style scoped>

</style>