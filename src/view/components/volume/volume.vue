<template>
    <el-table :data="item.spec.template.spec.volumes" style="width: 100%">
                <el-table-column prop="" label="名称"  width="140px">
                    <template #default="scope">
                        <el-input  v-model="scope.row.name"  placeholder="请输入存储卷名称" />
                    </template>
                </el-table-column>
                <el-table-column prop="" label="类型" width="160px" align="center">
                    <template #default="scope">
                        <span>{{getVolumeType(scope.row)}}</span>
                    </template>
                </el-table-column>
                <el-table-column prop="" label="Volume配置" >
                    <template #default="scope">
                        <div style="margin-top: 10px;width: 800px">
                            <component v-if="volumeTypeList.includes(getVolumeType(scope.row))" :is="volumeTypeComponent[getVolumeType(scope.row)]" method="update" :volumeConfig="scope.row"/>
                            <span  v-else>暂不支持对该类型volume进行修改</span>
                        </div>

                    </template>
                </el-table-column>
                <el-table-column align="center" fixed="right" width="80px">
                    <template #header>
                        <el-button  type="primary" @click="addVolume" >添加</el-button>
                    </template>
                    <template #default="scope">
                        <el-button  type="primary" color="red" @click="deleteTableRow(item.spec.template.spec.volumes,scope.$index)">删除</el-button>
                    </template>
                </el-table-column>

            </el-table>
    <el-dialog
                destroy-on-close
                v-model="volumeDialog"
                center
                title="添加Volume"
                style="width: 60%;"
            >
            <el-card>
                <template #header>
                    <div class="card-header">
                        <el-select v-model="volumeType" placeholder="请选择Volume类型" style="width: 20%">
                            <el-option
                                v-for="t in volumeTypeList"
                                :key="t"
                                :label="t"
                                :value="t"
                            />
                        </el-select>
                    </div>
                </template>
                <component :is="volumeTypeComponent[volumeType]" ></component>
            </el-card>
            </el-dialog>
</template>

<script setup>
import Hostpath from "./hostpath.vue";
import {deleteTableRow} from "../../../utils/index.js";
import {useItem} from "../../../store/index.js";
import {storeToRefs} from "pinia";
import {computed, markRaw, provide, reactive, ref, toRefs} from "vue";
import Secret from "./secret.vue";
import Nfs from "./nfs.vue";
import Emptydir from "./emptydir.vue";
import Configmap from "./configmap.vue";
import Pvc from "./pvc.vue";
const useItemer=useItem()
const {item}=storeToRefs(useItem())
const volumeDialog=ref(false)
const data=reactive({
    volumeTypeList:['hostPath','secret','nfs','emptyDir','configMap','persistentVolumeClaim'],
    volumeTypeComponent:{
        'hostPath':markRaw(Hostpath),
        'secret':markRaw(Secret),
        'nfs':markRaw(Nfs),
        'emptyDir':markRaw(Emptydir),
        'configMap':markRaw(Configmap),
        'persistentVolumeClaim':markRaw(Pvc),
    }
})
const {volumeTypeList,volumeTypeComponent}=toRefs(data)
const volumeType=ref('hostPath')
const addVolume=()=>{
    volumeDialog.value=true
}

const closeVolumeDialog=()=>{
    volumeDialog.value=false
}
provide('closeVolumeDialog',closeVolumeDialog)
const getVolumeType=computed(()=>(row)=>{
    const keys=Object.keys(row)
    keys.splice(keys.indexOf('name'),1)
    return keys[0]
})
</script>

<style scoped>

</style>