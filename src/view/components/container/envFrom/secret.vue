<template>
    <el-form v-model="envFromItem" ref="envFromItemRef">
        <div style="display: flex">
            <el-form-item v-if="props.method=='Create'" style="margin-bottom: 10px" label="变量前缀" prop="prefix">
                <el-input v-model="envFromItem.prefix" style="width: 50%"></el-input>
            </el-form-item>
            <el-form-item style="margin-bottom: 10px" label="来源" prop="secretMapRef.name">
                <div class="flex flex-wrap gap-4 items-center">
                    <el-select
                        v-model="envFromItem.secretRef.name"
                        placeholder="请选择secret"
                        size="default"
                        value-key="name"
                        style="width: 160px;"
                        @visible-change="getlist"
                    >
                        <el-option
                            v-for="s in mountTypeList"
                            :key="s.metadata.name"
                            :label="s.metadata.name"
                            :value="s.metadata.name"
                        />
                    </el-select>
                </div>
            </el-form-item>
        </div>
        <div>
            <el-button v-if="props.method=='Create'" link type="primary" @click="submit">添加</el-button>
        </div>

    </el-form>
</template>

<script setup>
import {getConfigMapList} from "../../../../api/scheduler/configmap/configmap.js";
import {onBeforeMount, reactive, ref, toRefs} from "vue";
import {useItem} from "../../../../store/index.js";
import {getSecretList} from "../../../../api/scheduler/secret/secret.js";
const useItemer=useItem()
const props=defineProps({
    envFrom:{
        type:Array
    },
    method:{
        type:String,
        default:'Create'
    },
    envItem:{
        type:Object
    }
})

const data=reactive({
    mountTypeList:[],
    envFromItem:{
        prefix:'',
        secretRef:{
            name:'',
        }
    }
})
const {envFromItem,mountTypeList}=toRefs(data)
const envFromItemRef=ref()
const getlist=()=>{
    const param={
        clusterId:useItemer.item.clusterId,
        nameSpace:useItemer.item.nameSpace
    }
    getSecretList(param).then((res)=>{
        data.mountTypeList=res.data.data.items
    })
}
const emits=defineEmits(['closeEnvDialog'])

const submit=()=>{
    props.envFrom.unshift(data.envFromItem)
    emits('closeEnvDialog')
}
onBeforeMount(()=>{
    if(props.method=='Update'){
        data.envFromItem.secretRef.name=props.envItem.secretRef.name
    }
})
</script>

<style scoped>

</style>