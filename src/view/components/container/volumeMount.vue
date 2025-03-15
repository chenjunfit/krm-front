<template>
    <el-table border :data="props.volumeMounts" height="300px">

        <el-table-column label="Volume名称" align="center" prop="name">
            <template #default="scope">
                <el-form-item style="margin-bottom: 0px">
                   <el-select v-model="scope.row.name">
                       <el-option
                            v-for="volume in useItemer.item.spec.template.spec.volumes"
                            :key="volume.name"
                            :label="volume.name"
                            :value="volume.name"
                       >

                       </el-option>
                   </el-select>
                </el-form-item>
            </template>
        </el-table-column>
        <el-table-column label="挂载路径" align="center" prop="mountPath" >
            <template #default="scope">
                <el-form-item style="margin-bottom: 0px">
                    <el-input style="width: 100%"  v-model.trim="scope.row.mountPath" placeholder="请输入挂载路径"/>
                </el-form-item>
            </template>
        </el-table-column>
        <el-table-column label="挂载子路径" align="center" prop="subPath" >
            <template #default="scope">
                <el-form-item style="margin-bottom: 0px">
                    <el-input style="width: 100%"  v-model.trim="scope.row.subPath" placeholder="请输入挂载子路径"/>
                </el-form-item>
            </template>
        </el-table-column>
        <el-table-column label="只读挂载" align="center" prop="readOnly" >
            <template #default="scope">
                <el-form-item style="margin-bottom: 0px">
                    <el-switch  v-model.trim="scope.row.readOnly" />
                </el-form-item>
            </template>
        </el-table-column>
        <el-table-column align="center">
            <template #header>
                <el-button link type="primary" @click="addVolume">添加</el-button>
            </template>
            <template #default="scope">
                <el-button link type="warning" @click="deleteTableRow(props.volumeMounts,scope.$index)">删除</el-button>
            </template>
        </el-table-column>

    </el-table>
</template>

<script setup>
import {deleteTableRow} from "../../../utils/index.js";
import {useItem} from "../../../store/index.js";
import {ElMessage} from "element-plus";
const useItemer=useItem()
const props=defineProps({
    volumeMounts:{
        type:Array,
    }
})
const addVolume=()=>{
    if(useItemer.item.spec.template.spec.volumes.length==0){
        ElMessage({
            type:'warning',
            message:'必须先添加volume'
        })
        return
    }
    const volume={
        name:'',
        mountPath:'',
        subPath:'',
        readOnly:false,
    }
    if(props.volumeMounts==null||props.volumeMounts==undefined){
        props.volumeMounts=[]
    }
    props.volumeMounts.unshift(volume)
}
</script>

<style scoped>

</style>