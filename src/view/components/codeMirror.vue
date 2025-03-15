<template>
   <Codemirror v-model="code"
               :extensions="extensions"
               :placeholder="props.placeholder"
               :style="{width: props.width,height: props.height,border:'1px dash gray'}"
               class="codemirror"
   >

   </Codemirror>
</template>

<script setup>
import {Codemirror} from "vue-codemirror";
import {StreamLanguage} from "@codemirror/language";
import {yaml} from "@codemirror/legacy-modes/mode/yaml";
import {ref} from "vue";
const extensions=[StreamLanguage.define(yaml),]
let code=ref('')
const props=defineProps({
    placeholder:{
        type:String,
        default:"请输入内容"
    },
    height:{
        type: String,
        default: "400px"
    },
    width:{
        type:String,
        default: "100%"
    }
})
</script>

<style scoped>
.codemirror{
   text-align: left;
   overflow-block: scroll;
}
</style>