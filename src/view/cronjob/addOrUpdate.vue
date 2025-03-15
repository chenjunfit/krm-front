<template>
    <scheduler-frame  @submitData="submit" :method="props.method" :ResourceType="props.ResourceType">
        <template #strategy>
            <el-col :span="6">
                <el-form-item label="调度策略" prop="">
                    <el-input v-model.trim="cronJobItem.spec.schedule"></el-input>
                </el-form-item>
            </el-col>
            <el-col :span="6">
                <el-form-item label="并发策略" prop="" >
                    <div class="flex flex-wrap gap-4 items-center">
                        <el-select
                            v-model="cronJobItem.spec.concurrencyPolicy"
                            placeholder="请选择策略"
                            size="default"
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
                <el-form-item label="重启策略" prop="" >
                    <div class="flex flex-wrap gap-4 items-center">
                        <el-select
                            v-model="cronJobItem.spec.jobTemplate.spec.template.spec.restartPolicy"
                            placeholder="请选择策略"
                            size="default"
                            style="width: 140px;"
                        >
                            <el-option
                                v-for="s in RestartStrategyType"
                                :key="s.label"
                                :label="s.label"
                                :value="s.value"
                            />
                        </el-select>
                    </div>
                </el-form-item>

            </el-col>
            <el-col :span="6">
                <el-form-item label="暂停调度" prop="" >
                    <el-switch v-model="cronJobItem.spec.suspend"></el-switch>
                </el-form-item>
            </el-col>
        </template>
        <template #special>
            <el-col :span="8">
                <el-form-item label="失败任务保留数量" prop="" >
                    <el-input-number :min="1" v-model="cronJobItem.spec.failedJobsHistoryLimit" style="width: 120px"/>
                </el-form-item>
            </el-col>
            <el-col :span="8">
                <el-form-item label="成功任务保留数量" prop="" >
                    <el-input-number :min="1" v-model="cronJobItem.spec.successfulJobsHistoryLimit" style="width: 120px"/>
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
import {addDaemonset ,updateDaemonset} from '../../api/scheduler/daemonset/daemonset.js'
import {ElMessage} from "element-plus";
import DialogYaml from "../components/dialogYaml/dialogYaml.vue";
import {obj2yaml} from '../../utils/index.js'
import {computed, onBeforeMount, onMounted, reactive, ref, toRefs} from "vue";
import StringOrNumber from "../components/stringOrNumber.vue";
const useItemer=useItem()
const {item}=toRefs(useItem())
const showDialog=ref(false)
let ready=ref(false)
const props=defineProps({
    method:{
        type:String,
        default:'Create'
    },
    resetItem:{
        type:Object
    },
    ResourceType:{
        type:String,
        default:"CronJob"
    },
    cronJobItem:{},
})
const data=reactive({
    cronJobItem:{
        "apiVersion":"batch/v1",
        "kind":"CronJob",
        "metadata":{},
        "spec":{
            schedule:"*/5 * * * *",
            concurrencyPolicy:"Allow",
            suspend:false,
            failedJobsHistoryLimit:1,
            successfulJobsHistoryLimit:3,
            jobTemplate:{
                spec:{
                    template:{
                        spec:{
                            restartPolicy:"OnFailure"
                        }
                    }
                }
            }
        },

    }
})
const {cronJobItem}=toRefs(data)
let yamlData=ref("")
const submit=(tag,autoCreateService)=>{
    useItemer.item.spec.template.spec.restartPolicy=data.cronJobItem.spec.jobTemplate.spec.template.spec.restartPolicy
    data.cronJobItem.spec.jobTemplate.spec.template=JSON.parse(JSON.stringify(useItemer.item.spec.template))
    data.cronJobItem.metadata=JSON.parse(JSON.stringify(useItemer.item.metadata))
    const formData={
        clusterId:useItemer.item.clusterId,
        nameSpace:useItemer.item.nameSpace,
        item:data.cronJobItem,
    }
    if(tag=='yaml'){
        showDialog.value=true
        yamlData=obj2yaml(data.cronJobItem)
    }else{
        if(props.method!='Update'){
            addDaemonset(formData).then((response)=>{
                ElMessage({
                    message:response.data.message,
                    type:"success"
                })

            })

        }else{
            updateDaemonset(formData).then((response)=>{
                ElMessage({
                    message:response.data.message,
                    type:"success"
                })
            })
        }
    }


}
const RestartStrategyType=[
    {
        label:"失败后重新调度",
        value:"OnFailure",
    },
    {
        label:"永不调度",
        value:"Never",
    },
]
const StrategyType=[
    {
        label:"允许并发调度",
        value:"Allow",
    },
    {
        label:"禁止并发调度",
        value:"Forbid",
    },
    {
        label:"替换上次任务",
        value:"Replace",
    },
]
onBeforeMount(()=>{
    if(props.method=='Create'){
        delete useItemer.item.spec.replicas
    }else if(props.method=='Update'){
        data.cronJobItem=props.cronJobItem
    }
})
</script>
<style scoped>

</style>