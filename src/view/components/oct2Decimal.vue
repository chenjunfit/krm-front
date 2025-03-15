<template>
<el-input :model-value="data"
          @change="inputChanged"
          @input="input"
          :placeholder="props.placeHolder"
          :style="{width: props.inputWidth}"
/>
</template>

<script setup>
import {onMounted, ref} from "vue";
const inputData=ref()
const props=defineProps({
    inputWidth:{
        type:String,
        default:"100%"
    },
    placeHolder:{
        type:String,
        default:"请输入内容"
    },
    data:{
        type:null

    }
})
const emits=defineEmits(['update:data'])
const input=(value)=>{
    emits('update:data',value)

}
const inputChanged=(newValue)=>{

  if(newValue.indexOf(0)==0){
      newValue=parseInt(newValue,8)

  }
  if(newValue>511){
      newValue=511
  }
    emits('update:data',Number(newValue)?Number(newValue):420)
}
</script>

<style scoped>

</style>