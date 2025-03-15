<template xmlns="http://www.w3.org/1999/html">
    <el-card class="box-card">
      <template #header>
          <div class="auto-space-between">
              <span>{{props.title}}</span>
              <el-select
                      v-model="options.probeHandler"
                      style="width: 20%;"
                      @change="changeProbe"

              >
                    <el-option
                        v-for="probe in options.probeHandlers"
                        :key="probe.value"
                        :label="probe.label"
                        :value="probe.value"

                    >

                    </el-option>
              </el-select>
          </div>
      </template>
        <div>
            <div v-if="options.probeHandler!=''">
                <div>
                    <el-row :gutter="20">
                        <el-col :span="8">
                            <el-form-item label="延迟检查" >
                                <el-input-number :min="0"  v-model="probeBasicConfig.initialDelaySeconds"></el-input-number>
                            </el-form-item>
                        </el-col>
                        <el-col :span="8">
                            <el-form-item label="检查间隔" >
                                <el-input-number :min="0"  v-model="probeBasicConfig.periodSeconds"></el-input-number>
                            </el-form-item>
                        </el-col>
                        <el-col :span="8">
                            <el-form-item label="超时时间" >
                                <el-input-number :min="0"  v-model="probeBasicConfig.timeoutSeconds"></el-input-number>
                            </el-form-item>
                        </el-col>
                    </el-row>
                    <el-row :gutter="20">
                        <el-col :span="8">
                            <el-form-item label="失败次数" >
                                <el-input-number :min="0"  v-model="probeBasicConfig.failureThreshold"></el-input-number>
                            </el-form-item>
                        </el-col>
                        <el-col :span="8">
                            <el-form-item label="成功次数" >
                                <el-input-number :min="0"  v-model="probeBasicConfig.successThreshold"></el-input-number>
                            </el-form-item>
                        </el-col>
                    </el-row>
                </div>
            </div>
            <div v-if="options.probeHandler!=''">
                <component
                    :containerIndex="props.containerIndex"
                    :containerType="props.containerType"
                    :probeType="props.probeType"
                    :probeConfig="probeBasicConfig"
                    :is="probeTypeComponent[options.probeHandler]"
                ></component>
            </div>
        </div>



    </el-card>
</template>

<script setup>
import {markRaw, onBeforeMount, reactive, toRefs} from "vue";
import StringOrNumber from "../stringOrNumber.vue";
import Exec from "./action/exec.vue";
import Grpc from './action/grpc.vue'
import HttpGet from "./action/httpGet.vue";
import TcpSocket from "./action/tcpSocket.vue";
const props=defineProps({
    probeType:{
        type: String,
    },
    containerIndex:{
        type:Number
    },
    containerType:{
        type: String,
    },
    title:{
        type: String,
        default:"启动探针(StartupProbe)"
    },
    probe:{
        type:Object,
    },
    method:{
        type:String,
        default: 'Create'
    }
})
let probeBasicConfig=reactive({
    initialDelaySeconds:30,
    periodSeconds:5,
    timeoutSeconds:10,
    failureThreshold:3,
    successThreshold:1,
})

const data=reactive({
    options:{
        probeHandler:"",
        probeHandlers:[
            {
                label:"关闭",
                value:""
            },
            {
                label:"执行命令",
                value:"exec"
            },
            {
                label:"调用接口",
                value:"httpGet"
            },
            {
                label:"探测端口",
                value:"tcpSocket"
            },
            {
                label:"GRPC",
                value:"grpc"
            },
        ],
        probeConfig:{
            exec:{
                command:[]
            },
            tcpSocket:{
                port:8080,
                host:''
            },
            httpGet:{
                path:"/",
                port:8080,
                host:"",
                scheme:"HTTP",
                httpHeaders:[]
            },
            grpc:{
                port:8080,
                service:'',
            }
        }
    },
    probeTypeList:['exec','grpc','tcpSocket','httpGet'],
    probeTypeComponent:{
        'exec':markRaw(Exec),
        'grpc':markRaw(Grpc),
        'tcpSocket':markRaw(TcpSocket),
        'httpGet':markRaw(HttpGet),
    }
})
const {options,probeTypeComponent,probeTypeList}=toRefs(data)
const emits=defineEmits(['changeProbeEmit'])
const changeProbe=()=>{
    Reflect.deleteProperty(probeBasicConfig,'exec')
    Reflect.deleteProperty(probeBasicConfig,'tcpSocket')
    Reflect.deleteProperty(probeBasicConfig,'grpc')
    Reflect.deleteProperty(probeBasicConfig,'httpGet')
    if(data.options.probeHandler==''){

        emits('changeProbeEmit',{})
    }else {

        probeBasicConfig[data.options.probeHandler]=data.options.probeConfig[data.options.probeHandler]
        emits('changeProbeEmit',probeBasicConfig)
    }
}
onBeforeMount(()=>{
    if(props.method=='Update'){
        const type=['exec','httpGet','tcpSocket','grpc']
        probeBasicConfig=props.probe
        data.options.probeHandler=Object.keys(props.probe).filter(item=>type.indexOf(item)!=-1)[0]
    }


})
</script>

<style scoped>

</style>