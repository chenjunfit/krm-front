<template>
    <scheduler-frame  @submitData="submit" :method="props.method">
        <template #strategy>
            <el-col :span="6">
                <el-form-item label="更新策略" prop="" >
                    <div class="flex flex-wrap gap-4 items-center">
                        <el-select
                            v-model="item.spec.strategy.type"
                            placeholder="请选择策略"
                            size="default"
                            @change="changeStrategy"
                            style="width: 140px;"
                        >
                            <el-option
                                v-for="s in StrategyType"
                                :key="s.label"
                                :label="s.label"
                                :value="s.value"
                            />
                        </el-select>
                    </div>
                </el-form-item>
            </el-col>
            <el-col :span="6">
                <el-form-item label="最大不可用" prop="" v-if="item.spec.strategy.type=='RollingUpdate'" >
                    <StringOrNumber defaultValue="25%" v-model:data="item.spec.strategy.rollingUpdate.maxUnavailable"></StringOrNumber>
                </el-form-item>
            </el-col>
            <el-col :span="6">
                <el-form-item defaultValue="25%" label="可超出最大值" prop="" v-if="item.spec.strategy.type=='RollingUpdate'"  >
                    <StringOrNumber v-model:data="item.spec.strategy.rollingUpdate.maxSurge"></StringOrNumber>
                </el-form-item>
            </el-col>
        </template>
    </scheduler-frame>

    <DialogYaml
            :clusterId="useItemer.item.clusterId"
            :nameSpace="useItemer.item.nameSpace"
            :showDialog="showDialog"
            :yamlContent="yamlData"
            @closeDialogHandler="(val)=>{showDialog=val}"
    >

    </DialogYaml>
</template>

<script setup>
import SchedulerFrame from "../components/schedulerFrame.vue";
import {useItem} from "../../store/index.js";
import {addDeployment ,updateDeployment} from '../../api/scheduler/deployment/deployment.js'
import {ElMessage} from "element-plus";
import DialogYaml from "../components/dialogYaml/dialogYaml.vue";
import {obj2yaml} from '../../utils/index.js'
import {computed, onBeforeMount, ref, toRefs} from "vue";
import StringOrNumber from "../components/stringOrNumber.vue";
import router from "../../routers/index.js";
const useItemer=useItem()
const showDialog=ref(false)
const {item}=toRefs(useItem())
const props=defineProps({
    method:{
        type:String,
        default:'Create'
    },
    ready: {
        type: Boolean,
        default: false
    }
})

let yamlData=ref("")
const submit=(tag,autoCreateService)=>{

    useItemer.item['apiVersion']='apps/v1'
    useItemer.item['kind']='deployment'

    const itemTemp={
        "apiVersion":"apps/v1",
        "kind":"Deployment",
        "metadata":JSON.parse(JSON.stringify(useItemer.item)).metadata,
        "spec":JSON.parse(JSON.stringify(useItemer.item)).spec
    }
    const formData={
        clusterId:useItemer.item.clusterId,
        nameSpace:useItemer.item.nameSpace,
        item:useItemer.item,
        autoCreateService
    }
    if(tag=='yaml'){
        showDialog.value=true
        yamlData=obj2yaml(itemTemp)
    }else{
        if(props.method!='Update'){
            addDeployment(formData).then((response)=>{
                if(response.data.status==200){
                    ElMessage({
                        message:response.data.message,
                        type:"success"
                    })
                    router.push({
                        path:'/deployment/list',
                        query:{
                            clusterId: useItemer.item.clusterId,
                            nameSpace:useItemer.item.nameSpace,
                            method:'GET'
                        }
                    })
                }else{
                    ElMessage({
                        message:response.data.message,
                        type:"error"
                    })
                }

            })

        }else{
            updateDeployment(formData).then((response)=>{
                if(response.data.status==200){
                    ElMessage({
                        message:response.data.message,
                        type:"success"
                    })
                }else{
                    ElMessage({
                        message:response.data.message,
                        type:"error"
                    })
                }
            })
        }
    }

}
const changeStrategy=(val)=>{
    if(val=="Recreate"){
        delete useItemer.item.spec.strategy.rollingUpdate
    }else {
        useItemer.item.spec.strategy.rollingUpdate={
            maxUnavailable:'25%',
            maxSurge:'25%',
        }
    }
}
const StrategyType=[
    {
        label:"滚动更新",
        value:"RollingUpdate",
    },
    {
        label:"删除后重建",
        value:"Recreate",
    },
]
onBeforeMount(()=>{

    if(props.method=='Create'){
        useItem().item .spec.strategy={
            type:"RollingUpdate",
                rollingUpdate:{
                maxUnavailable:'25%',
                    maxSurge:'25%',
            }
        }
    }
})
</script>
<style scoped>

</style>