<template>
    <el-dialog
            v-model="visiable"
            title="详情"
            width="60%"
            @before-close="closeDialog"
            destroy-on-close
    >
        <template #header="{titleId, titleClass }">
            <div class="my-header">
                <div :id="titleId" :class="titleClass">
                    <el-button type="primary" >
                        <i class="iconfont icon-bushu" style="width: 50px"/>
                        <div>{{props.clusterId}}</div>
                    </el-button>
                    <el-button type="primary" >
                        <i class="iconfont icon-rongqi" style="width: 50px"/>
                        <div>{{props.nameSpace}}</div>
                    </el-button>
                </div>

            </div>
        </template>
        <codeMirror v-model="yamlData"></codeMirror>
    </el-dialog>
</template>

<script setup>
import {computed, onUpdated, ref} from "vue";
import codeMirror from '../codeMirror.vue'
const props=defineProps({
    clusterId:{
        type: String
    },
    nameSpace:{
        type: String
    },
    yamlContent:{
        type: String
    },
    showDialog:{
        type:Boolean,
        default:false
    }

})
const yamlData=ref('')
const visiable=computed({
    get(){
        return props.showDialog
    },
    set(val){
        emits('closeDialogHandler',val)
    }
})
onUpdated(()=>{
    yamlData.value=props.yamlContent
})

const emits=defineEmits(['closeDialogHandler'])
const closeDialog=()=>{
emits('closeDialogHandler')
}
</script>

<style scoped>

</style>