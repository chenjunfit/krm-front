<template>
    <el-input v-model="inputData"
              type="textarea"
              @change="inputChanged"
              :placeholder="props.placeHolder"
              :style="{width: props.inputWidth}"
    />
</template>

<script setup>
import {onBeforeMount, onMounted, ref} from "vue";

let inputData=ref()
const props=defineProps({
    inputWidth:{
        type:String,
        default:"60px"
    },
    placeHolder:{
        type:String,
        default:"请输入内容"
    },
    data:{
        type:[Array,String]
    }
})
onMounted(()=>{
    if(props.data){
        inputData.value=props.data.join('\r\n')
    }

})
const emits=defineEmits(['update:data'])
const inputChanged=()=>{
    if (inputData.value.split("\n").length==1&&inputData.value.split("\n")[0]==''){
        emits('update:data','')
    }else{
        emits('update:data',inputData.value.split("\n"))
    }

}

</script>

<style scoped>

</style>