<template>
<el-input v-model="inputData"
          @change="inputChanged"
          :placeholder="props.placeHolder"
          :style="{width: props.inputWidth}"
/>
</template>

<script setup>
import {onMounted, ref} from "vue";

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
        type:[String,Number]

    },
    defaultValue:{
        type:[String,Number],
    }
})
const emits=defineEmits(['update:data'])
const inputChanged=()=>{
  emits('update:data',Number(inputData.value)?Number(inputData.value):inputData.value)
}
onMounted(()=>{
    if(props.data===''||props.data==null){
        inputData.value=props.defaultValue
    }else {
        inputData.value=props.data
    }
})
</script>

<style scoped>

</style>