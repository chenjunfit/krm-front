<template>
    <scheduler-frame v-if="props.ready" @submitData="submit" :method="props.method" :ResourceType="props.ResourceType">
        <template #strategy>
            <el-col :span="6">
                <el-form-item label="更新策略" prop="" >
                    <div class="flex flex-wrap gap-4 items-center">
                        <el-select
                            v-model="item.spec.updateStrategy.type"
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
                <el-form-item label="最大不可用" prop="" v-if="item.spec.updateStrategy.type=='RollingUpdate'" >
                    <StringOrNumber v-model:data="item.spec.updateStrategy.rollingUpdate.maxUnavailable"></StringOrNumber>
                </el-form-item>
            </el-col>
            <el-col :span="6">
                <el-form-item label="分段更新" prop="" v-if="item.spec.updateStrategy.type=='RollingUpdate'"  >
                    <el-input-number v-model="item.spec.updateStrategy.rollingUpdate.partition"></el-input-number>
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
import {addStatefulset, updateStatefulset} from "../../api/scheduler/statefulset/statefulset.js";
const useItemer=useItem()
const {item}=toRefs(useItem())
const showDialog=ref(false)
const props=defineProps({
    method:{
        type:String,
        default:'Create'
    },
    ready:{
        type:Boolean,
        default: false
    },
    resetItem:{
        type:Object
    },
    ResourceType:{
        type:String,
        default:"Deployment"
    }
})
let yamlData=ref("")
const submit=(tag,autoCreateService)=>{

    useItemer.item['apiVersion']='apps/v1'
    useItemer.item['kind']='StatefulSet'

    const itemTemp={
        "apiVersion":"apps/v1",
        "kind":"StatefulSet",
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
            addStatefulset(formData).then((response)=>{
                ElMessage({
                    message:response.data.message,
                    type:"success"
                })

            })

        }else{
            updateStatefulset(formData).then((response)=>{
                ElMessage({
                    message:response.data.message,
                    type:"success"
                })
            })
        }
    }

}
const changeStrategy=(val)=>{
    if(val=="OnDelete"){
        delete useItemer.item.spec.updateStrategy.rollingUpdate
    }else {
        useItemer.item.spec.updateStrategy.rollingUpdate={
            maxUnavailable:'25%',
            partition:0,
        }
    }
}
const StrategyType=[
    {
        label:"滚动更新",
        value:"RollingUpdate",
    },
    {
        label:"手动删除后重建",
        value:"OnDelete",
    },
]
onBeforeMount(()=>{
    if(props.method=='Create'){

        useItem().item.spec.updateStrategy={
            type:"RollingUpdate",
            rollingUpdate:{
                maxUnavailable:'25%',
                partition:0,
            }
        }
    }
})
</script>
<style scoped>

</style>