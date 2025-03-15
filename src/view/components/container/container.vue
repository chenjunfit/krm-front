<template>
    <el-tabs
            v-model="editableTabsValue"
            class="demo-tabs"
            editable
            @edit="handleTabsEdit"
    >
        <el-tab-pane
                v-for="(item,index) in data.containers"
                :key="index"
                :label="item.name"
                :name="index"
        >
            <el-tabs v-model="activeName" class="demo-tabs"  tab-position="left">
                <el-tab-pane label="常用配置" name="basic">
                    <el-row :gutter="20">
                        <el-col :span="8">
                            <el-form-item label="容器名称" :prop="(props.containerType=='container'?'spec.template.spec.containers.'+index+'.name':'spec.template.spec.initContainers.'+index+'.name')" required :rules="rules.name">
                                <el-input v-model="item.name" placeholder="请输入容器名称"/>
                            </el-form-item>
                        </el-col>
                        <el-col :span="8">
                            <el-form-item label="分配终端" prop="item.tty" >
                                <el-switch style="--el-switch-on-color: green; " v-model="item.tty"  />
                            </el-form-item>
                        </el-col>
                        <el-col :span="8">
                            <el-form-item label="工作目录" prop="item.workingDir"  >
                                <el-input v-model="item.workingDir" placeholder="请输入工作目录"/>

                            </el-form-item>
                        </el-col>
                    </el-row>
                    <el-row :gutter="20">
                        <el-col :span="16">
                            <el-form-item label="镜像地址" :prop="(props.containerType=='container'?'spec.template.spec.containers.'+index+'.image':'spec.template.spec.initContainers.'+index+'.image')" required :rules="rules.image">
                                <el-input v-model="item.image" placeholder="请输入容器镜像"/>
                            </el-form-item>
                        </el-col>
                        <el-col :span="8">
                            <el-form-item label="下载策略" prop="item.imagePullPolicy" >
                                <el-select
                                    v-model="item.imagePullPolicy"
                                    placeholder="选择镜像下载策略"
                                    size="default"
                                    value-key="name"
                                    style="width: 140px"
                                >
                                    <el-option
                                        v-for="s in options.imagePullPolicy"
                                        :key="s.label"
                                        :label="s.label"
                                        :value="s.value"
                                    />
                                </el-select>
                            </el-form-item>
                        </el-col>
                    </el-row>
                    <el-row :gutter="20">
                        <el-col :span="6">
                            <el-form-item label="最小内存" prop="item.resources.requests.memory" >
                                <StringOrNumber input-width="120px"  v-model:data="item.resources.requests.memory" ></StringOrNumber>

                            </el-form-item>
                        </el-col>
                        <el-col :span="6">
                            <el-form-item label="最大内存" prop="item.resources.limits.memory" >
                                <StringOrNumber input-width="120px"  v-model:data="item.resources.limits.memory"></StringOrNumber>
                            </el-form-item>
                        </el-col>
                        <el-col :span="6">
                            <el-form-item label="最小CPU" prop="item.name" >
                                <StringOrNumber  input-width="120px"  v-model:data="item.resources.requests.cpu"></StringOrNumber>
                            </el-form-item>
                        </el-col>
                        <el-col :span="6">
                            <el-form-item label="最大CPU" prop="item.name" >
                                <StringOrNumber input-width="120px"  v-model:data="item.resources.limits.cpu"></StringOrNumber>
                            </el-form-item>
                        </el-col>
                    </el-row>
                    <el-row :gutter="20">
                        <el-col :span="12">
                            <el-form-item label="启动命令" prop="item.command" >
                                <String2list v-model:data="item.command" placeholder="对应entrypoint" input-width="100%"/>
                            </el-form-item>
                        </el-col>
                        <el-col :span="12">
                            <el-form-item label="启动参数" prop="item.args" >
                                <String2list v-model:data="item.args" placeholder="对应command" input-width="100%"/>
                            </el-form-item>
                        </el-col>
                    </el-row>

                </el-tab-pane>
                <el-tab-pane v-if="props.containerType=='container'&&props.ResourceType!='CronJob'" label="端口配置" name="port">
                    <Port v-model:ports="item.ports"></Port>
                </el-tab-pane>
                <el-tab-pane v-if="props.containerType=='container'&&props.ResourceType!='CronJob'" label="健康检查" name="health">
                    <HealthCheck :container="item" :containerIndex="index" :containerType="props.containerType" :method="props.method" ></HealthCheck>
                </el-tab-pane>
                <el-tab-pane label="环境变量" name="env">
                    <Env :env="item.env" :envFrom="item.envFrom"></Env>
                </el-tab-pane>
                <el-tab-pane label="存储挂载" name="volume">
                    <VolumeMount :volumeMounts="item.volumeMounts"></VolumeMount>
                </el-tab-pane>
<!--                <el-tab-pane v-if="props.containerType=='container'" label="生命周期" name="lifeCycle">环境变量</el-tab-pane>-->


            </el-tabs>
        </el-tab-pane>
    </el-tabs>
</template>

<script lang="ts" setup>
import {deleteTableRow} from '../../../utils/index.js'
import {onBeforeMount, reactive, ref, toRefs} from "vue";
import type { TabPaneName } from 'element-plus'
import {useItem} from '../../../store/index.js'
import {ElMessage} from "element-plus";
import StringOrNumber from "../stringOrNumber.vue";
import String2list from "../string2list.vue";
import Port from "./port.vue";
import HealthCheck from "./healthCheck.vue";
import VolumeMount from "./volumeMount.vue";
import Env from './env.vue'
const useItemer=useItem()
const activeName=ref('basic')
const props=defineProps({
    containerType:{
        type: String,
        default:"container"
    },
    method:{
        type:String,
        default: 'Create'
    },
    ResourceType:{
        type:String,
        default:'Deployment'
    }
})

let tabIndex = 0
let editableTabsValue = ref(0)
const data=reactive({
    containers:[
    ],
    container:{
        name: "",
        image: "",
        tty:false,
        workingDir:"",
        command:[],
        args:[],
        resources:{
            limits:{
                memory:"128Mi",
                cpu:"100m",
            },
            requests:{
                memory:"128Mi",
                cpu:"100m",
            }
        },
        ports:[],
        env:[],
        envFrom:[],
        volumeMounts:[],

    },
    options:{
        imagePullPolicy:[
            {"label":"总是下载",value:"Always"},
            {"label":"有了就不下载",value:"IfNotPresent"},
            {"label":"从不下载",value:"Never"},

        ]
    },
    rules:{
        name:[{required:true,message:"请输入容器名称",trigger:'blur'}],
        image:[{required:true,message:"请输入镜像名称",trigger:'blur'}],
    }
})
const {containers,container,options,rules,ports}=toRefs(data)

const handleTabsEdit = (
    targetName: TabPaneName | undefined,
    action: 'remove' | 'add'
) => {
    if (action === 'add') {
        const newTabName = ++tabIndex
        data.container.name=`${props.containerType}-${newTabName}`
        data.containers.push(JSON.parse(JSON.stringify(data.container)))
        editableTabsValue.value = data.containers.length-1
    } else if (action === 'remove') {
        if(data.containers.length==1&&props.containerType=='container'){
            ElMessage.warning('至少需要一个容器')
            return
        }
        const tabs = data.containers
        let activeName = editableTabsValue.value
        if (activeName === targetName) {
            editableTabsValue.value=0
        }else if(targetName<activeName){
            editableTabsValue.value--
        }
        deleteTableRow(data.containers,targetName)

    }
}
onBeforeMount(()=>{
        if(props.containerType=="container"){
            if(useItemer.item.spec.template.spec.containers==null||useItemer.item.spec.template.spec.containers==undefined){
                data.containers=[]
            }else{
                data.containers=useItemer.item.spec.template.spec.containers
                data.containers.forEach((item)=>{
                    if(item.resources.limits==null||item.resources.limits==undefined){
                        item.resources.limits={}
                    }
                    if(item.resources.requests==null||item.resources.requests==undefined){
                        item.resources.requests={}
                    }
                })
            }


        }else{
            if(useItemer.item.spec.template.spec.initContainers==null||useItemer.item.spec.template.spec.initContainers==undefined){
                data.containers=[]
            }else{
                data.containers=useItemer.item.spec.template.spec.initContainers
                data.containers.forEach((item)=>{
                    if(item.resources.limits==null||item.resources.limits==undefined){
                        item.resources.limits={}
                    }
                    if(item.resources.requests==null||item.resources.requests==undefined){
                        item.resources.requests={}
                    }
                })
            }
        }
        tabIndex=data.containers.length


})
</script>

<style scoped>

</style>