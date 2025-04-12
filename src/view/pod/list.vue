<template>
    <List Title="Pod列表">
        <template #header-options>
            <ClusterNamespaceSelect @namespaceChangeCallback="nsCallBack" >
            </ClusterNamespaceSelect>
            <el-input v-model="search"  style="margin-left: 8px;height: 32px; width: 160px" size="small" placeholder="搜索" />
        </template>
        <template #main>
            <el-table :data="filterTableData"
                      style="width: 100%"
                      border
                      :scrollbar-always-on="true"
                      @selection-change="handleSelectChange"
                      height="400px"
                      :default-sort="{ prop: 'metadata.creationTimestamp', order:'descending' }"
            >
                <el-table-column type="selection"  width="55" />
                <el-table-column fixed prop="metadata.name" align="center" label="名称" width="240">
                    <template #default="scope" >
                        <el-button link type="primary" size="small" @click="detailNode(scope.row)" >
                            {{scope.row.metadata.name}}
                        </el-button>
                    </template>
                </el-table-column>
                <el-table-column  prop="metadata.creationTimestamp" align="center" label="创建时间" sortable width="240"/>
                <el-table-column  prop="metadata.namespace" align="center" label="命名空间" width="120"/>
                <el-table-column prop="" align="center" label="状态" >
                    <template #default="scope">
                        <el-icon v-if="scope.row.status.phase=='Running'||scope.row.status.phase=='Succeeded'" color="green">{{scope.row.status.phase}}</el-icon>
                        <el-icon v-else color="red">{{scope.row.status.phase}}</el-icon>
                    </template>
                </el-table-column>
                <el-table-column  prop="" align="center" label="重启次数" width="100">
                    <template #default="scope">
                        <span v-if="!scope.row.metadata.deletionTimestamp">
                            {{getPodRestartCount(scope.row)[0]}}
                        </span>
                    </template>
                </el-table-column>
                <el-table-column prop="" align="center" label="容器状态" width="100">
                    <template #default="scope">
                        <span v-if="!scope.row.metadata.deletionTimestamp">
                            {{getPodRestartCount(scope.row)[1]}}
                        </span>
                    </template>
                </el-table-column>
                <el-table-column  prop="status.podIP" align="center" label="Pod IP"  width="120"/>
                <el-table-column  prop="spec.nodeName" align="center" label="宿主机"  width="240"/>
                <el-table-column  prop="status.hostIP" align="center" label="Host IP" width="120"  />

                <el-table-column fixed="right" align="center" label="操作" width="240">
                    <template #default="scope" >
                        <el-button v-if="!scope.row.metadata.deletionTimestamp" link type="warning" size="small" @click="deleteItem(scope.row,false)" >删除</el-button>
                        <el-button v-else link type="warning" size="small" @click="deleteItem(scope.row,true)" >强制删除</el-button>
                        <el-button  v-if="!scope.row.metadata.deletionTimestamp" link type="info"  size="small" @click="podLogs(scope.row,'log')" >查看日志</el-button>
                        <el-button  v-if="!scope.row.metadata.deletionTimestamp" link type="info" size="small" @click="podExec(scope.row,'exec')" >执行命令</el-button>
                    </template>
                </el-table-column>


            </el-table>
            <el-dialog
                v-model="detailDialog"
                title="详情"
                width="60%"
                destroy-on-close
            >
                <template #header="{titleId, titleClass }">
                    <div class="my-header">
                        <div :id="titleId" :class="titleClass">
                            <el-button type="primary" >
                                <i class="iconfont icon-bushu" style="width: 50px"/>
                                <div>{{data.clusterId}}</div>
                            </el-button>
                            <el-button type="primary" >
                                <i class="iconfont icon-rongqi" style="width: 50px"/>
                                <div>{{data.namespace}}</div>
                            </el-button>
                        </div>

                    </div>
                </template>
                <codeMirror v-model="data.yamlData"></codeMirror>
            </el-dialog>

        </template>
        <template #footer-left>
            <el-select
                v-model="data.selectedOption"
                placeholder="请选择批量操作类型"
                style="width: 200px"
            >
                <el-option
                    v-for="t in data.selectOptions"
                    :key="t.label"
                    :value="t.value"
                    :label="t.label"
                />

            </el-select>
            <el-button style="margin-left: 10px" type="warning" @click="selectionSubmit">确认</el-button>
        </template>
        <template #footer-right>
            <span>总数:</span>
            <span>{{filterTableData.length}}</span>
        </template>
    </List>
    <el-drawer
        v-model="drawer"
        direction="btt"
        :before-close="handleDrawerClose"
        :with-header="false"
        @opened="openDrawer"
    >
        <div v-if="currentOption=='log'">
            <div style="display: flex;margin-bottom: auto">
                <div>
                    <el-icon>
                        <i class="iconfont icon-rongqi"></i>
                    </el-icon>
                    {{currentPod.metadata.name}}
                    <el-radio-group
                        v-model="currentContainer"
                        style="margin-left: 20px"
                        @change="containerChanged"
                    >
                        <el-radio v-for="(c,index) in currentPod.spec.containers" :label="c.name" >
                            {{c.name}}
                        </el-radio>
                    </el-radio-group>
                </div>
            </div>
            <div>
                <el-table :data="logContent" style="width: 100%">
                    <el-table-column>
                        <template #default="scope">
                            {{scope.row}}
                        </template>
                    </el-table-column>
                </el-table>
            </div>
        </div>
        <div v-else>
            <div style="display: flex;margin-bottom: auto">
                <div>
                    <el-icon>
                        <i class="iconfont icon-rongqi"></i>
                    </el-icon>
                    {{currentPod.metadata.name}}
                    <el-radio-group
                        v-model="currentContainer"
                        style="margin-left: 20px"
                        @change="containerChanged"
                    >
                        <el-radio v-for="(c,index) in currentPod.spec.containers" :label="c.name" >
                            {{c.name}}
                        </el-radio>
                    </el-radio-group>
                </div>
            </div>
            <div id="terminal" style="text-align: left"></div>
        </div>

    </el-drawer>
</template>

<script setup>
import ClusterNamespaceSelect from "../components/clusterNamespaceSelect.vue";
import List from "../components/list.vue"
import {computed, onMounted, reactive, ref, toRefs} from "vue";
import {deletePod, deletePodList, getPodList} from "../../api/scheduler/pod/pod.js";
import {ElMessage, ElMessageBox} from "element-plus";
import {obj2yaml} from "../../utils/index.js";
import {API_CONFIG as config, TOKEN_CONFIG} from "../../config/index.js";
import codeMirror from "../components/codeMirror.vue";
import {Terminal} from "xterm";
import { FitAddon } from 'xterm-addon-fit'
import {AttachAddon} from "xterm-addon-attach";
import 'xterm/css/xterm.css';

const detailDialog=ref(false)
const data=reactive({
    clusterId:"",
    namespace:"",
    items:[],
    yamlData:"",
    selectionList:[],
    selectedOption:"",
    selectOptions:[
        {
            label:"删除",
            value:"delete"
        },
        {
            label:"强制删除",
            value:"forceDelete"
        }
    ],
    deleteList:[],
    termOptions:{
        rendererType: "canvas", //渲染类型
        convertEol: true, //启用时，光标将设置为下一行的开头
        disableStdin: false, //是否应禁用输入
        // cursorStyle: "underline", //光标样式
        cursorBlink: true, //光标闪烁
        theme: {
            foreground: "#ECECEC", //字体
            background: "#000000", //背景色
            cursor: "help", //设置光标
            lineHeight: 20
        }
    }




})
const search = ref('')
const {clusterId,namespace,items,yamlData}=toRefs(data)
const drawer=ref(false)
let logContent=ref([])
let currentPod=ref()
let currentContainer=ref()
let currentOption=ref("")
let ws=null
let term=null
let fitAddon=null
const resizeTerm=()=>{
    if(drawer.value){
        fitAddon.fit()
        const h=window.innerHeight
        const w=window.innerWidth
        const wsMessage=JSON.stringify({
            messageType:"resize",
            rows: h,
            cols:w,
        })
        ws.send(wsMessage)
    }

}
const openDrawer=()=>{
    if(currentOption.value=="exec"){
        term.open(document.getElementById('terminal'));
        //调整窗口大小
        resizeTerm()
        term.focus()
    }
}
const containerChanged=()=>{
    if(currentOption.value=="log"){
        ws.close
        let url=`${config.podLogAPi}?clusterId=${data.clusterId}&nameSpace=${data.namespace}&name=${currentPod.value.metadata.name}&container=${currentContainer.value}`
        url=url.replace("http","ws")
        createWebSocket(url,"log")
    }else{
        //关闭老的ws
        ws.close()
        term
        let url=`${config.podExecAPi}?clusterId=${data.clusterId}&nameSpace=${data.namespace}&name=${currentPod.value.metadata.name}&container=${currentContainer.value}&defaultCommand=/bin/sh`
        url=url.replace("http","ws")
        createWebSocket(url,"exec")
        const attachaddon=new AttachAddon(ws)
        const oldSend=attachaddon._sendData
        attachaddon._sendData=(data)=>{
            const wsMessage=JSON.stringify({
                messageType:"input",
                data:data
            })
            return oldSend.call(attachaddon,wsMessage)
        }
        term.loadAddon(attachaddon)
    }

}
const createWebSocket=(url,tag)=>{
    ws=new WebSocket(url,[window.localStorage.getItem(TOKEN_CONFIG.TOKEN_NAME)])
    ws.onopen=function (){
    }
    if(tag=="log"){
        logContent.value=[]
        ws.onmessage=function (msgContent){
           logContent.value.push(msgContent.data)
        }
    }
    ws.onerror=function (){
        ElMessage.error("无法建立websocket链接")
    }
    ws.onclose=function (){

    }
}
const handleDrawerClose=()=>{
    drawer.value=false
    if(currentOption.value=="exec"){
        term.dispose()
        document.getElementById('terminal').innerHTML = '';
        term=null
        ws.close()
    }

}
const podExec=(row,tag)=>{
    currentOption.value=tag
    drawer.value=true
    currentPod.value=row
    currentContainer.value=row.spec.containers[0].name
    let url=`${config.podExecAPi}?clusterId=${data.clusterId}&nameSpace=${data.namespace}&name=${row.metadata.name}&container=${currentContainer.value}&defaultComamnd=/bin/sh`
    url=url.replace("http","ws")
    createWebSocket(url,tag)
    term = new Terminal(data.termOptions);
    fitAddon=new FitAddon()
    term.loadAddon(fitAddon)
    const attachaddon=new AttachAddon(ws)
    const oldSend=attachaddon._sendData
    attachaddon._sendData=(data)=>{
        const wsMessage=JSON.stringify({
            messageType:"input",
            data:data
        })
        return oldSend.call(attachaddon,wsMessage)
    }
    term.loadAddon(attachaddon)
}
const podLogs=(row,tag)=>{
    currentOption.value=tag
    drawer.value=true
    currentPod.value=row
    currentContainer.value=row.spec.containers[0].name
    let url=`${config.podLogAPi}?clusterId=${data.clusterId}&nameSpace=${data.namespace}&name=${row.metadata.name}&container=${currentContainer.value}`
    url=url.replace("http","ws")
    createWebSocket(url,tag)
}
const filterTableData = computed(() =>
    (data.items||[]).filter(
        (item) =>
            !search.value ||
            item.metadata.name.toLowerCase().includes(search.value.toLowerCase())
    )
)
const nsCallBack=(clusterId,nameSpace)=>{
    data.clusterId=clusterId
    data.namespace=nameSpace
    getList()
}
const getList=()=>{
getPodList(data.clusterId,data.namespace).then((response)=>{
    data.items=response.data.data.items
})
}

const getPodRestartCount=computed(()=>(row)=>{
    let restartCount=0
    let readyCount=0
    row.status.containerStatuses.forEach(item=>{
        restartCount+=item.restartCount
        if (item.ready){
            readyCount+=1
        }
    })
    const containerTotal=row.status.containerStatuses.length
    const readyStatus=`${readyCount}/${containerTotal}`
    return [restartCount,readyStatus]
})
const deleteItem=(row,force)=>{
    deletePod(data.clusterId,data.namespace,row.metadata.name,force).then((res)=>{
        ElMessageBox.confirm(
            '是否删除Pod: '+row.metadata.name,
            'Warning',
            {
                confirmButtonText: 'OK',
                cancelButtonText: 'Cancel',
                type: 'warning',
            }
        ).then(() => {
            ElMessage({
                message:res.data.message,
                type:"success"
            })
            getList()
        })
    })
}
const detailNode=(row)=>{
    detailDialog.value=true
    const item=JSON.parse(JSON.stringify(row))
    delete item.metadata.managedFields
    const itemTemp={
        "apiVersion":"v1",
        "kind":"Pod",
        "metadata":item.metadata,
        "spec":item.spec
    }
    data.yamlData=obj2yaml(itemTemp)
}
const handleSelectChange=(selecList)=>{
    data.selectionList=selecList
}
const selectionSubmit=()=>{
    if(data.selectionList.length<2||data.selectedOption==""){
        ElMessage.warning('批量操作的数据不能小于俩个||操作不能为空')
        return
    }
    let msg=""
    if(data.selectedOption=="delete"){
        msg="你确定删除选中的pod吗"
    }else if (data.selectedOption=="forceDelete"){
        msg="你确定强制删除选中的pod吗"
    }
    data.deleteList=[]
    data.selectionList.forEach((item)=>{
        data.deleteList.push(item.metadata.name)
    })
    deletePodList(data.clusterId,data.namespace,data.deleteList,data.selectedOption=="forceDelete").then((res)=>{
        ElMessageBox.confirm(
            msg,
            'Warning',
            {
                confirmButtonText: 'OK',
                cancelButtonText: 'Cancel',
                type: 'warning',
            }
        ).then(() => {
            ElMessage({
                message:res.data.message,
                type:"success"
            })
            getList()
        })
    })
}
onMounted(()=>{
    term = new Terminal(data.termOptions);
    fitAddon=new FitAddon()
    term.loadAddon(fitAddon)
})
</script>

<style scoped>

</style>