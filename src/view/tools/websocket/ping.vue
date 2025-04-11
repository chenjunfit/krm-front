<template>
<el-input v-model="msg"></el-input>
  <el-button @click="sendMsg">发送</el-button>
  <span>接受到的消息:{{receMsg}}</span>
</template>

<script setup>
import {onBeforeMount, ref} from "vue";
import {TOKEN_CONFIG} from "../../../config/index.js";

const msg=ref("")
let ws=null
const receMsg=ref("")
const sendMsg=()=>{
  ws.send(msg.value)
}
onBeforeMount(()=>{
    const webSocketUrl=`ws://127.0.0.1:8080/api/pod/log?clusterId=test-chenjun&nameSpace=default&container=container-1&name=nginx-86bcfccc56-f4lhs`
    ws=new WebSocket(webSocketUrl,[window.localStorage.getItem(TOKEN_CONFIG.TOKEN_NAME)])
    ws.onopen=function (){console.log("链接建立时的事件")}
    ws.onmessage=function (msgContent){
       receMsg.value=msgContent.data
    }
    ws.onerror=function (){
        console.log("链接错误时的事件")
    }
    ws.onclose=function (){
        console.log("链接关闭时的事件")
        ws.close()
    }

})
</script>

<style scoped>

</style>