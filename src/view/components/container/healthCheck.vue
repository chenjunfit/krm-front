<template>
<Probe :containerType="props.containerType" :containerIndex="props.containerIndex" probeType="startupProbe"  title="StartupProbe" :probe="props.container.startupProbe" @changeProbeEmit="(value)=>{props.container['startupProbe']=value}" :method="props.method"></Probe>
    <Probe :containerType="props.containerType" :containerIndex="props.containerIndex" style="margin-top: 10px" probeType="livenessProbe" title="LivenessProbe" :probe="props.container.livenessProbe" @changeProbeEmit="(value)=>{props.container['livenessProbe']=value}" :method="props.method"></Probe>
    <Probe :containerType="props.containerType" :containerIndex="props.containerIndex" style="margin-top: 10px" probeType="readinessProbe" title="ReadinessProbe" :probe="props.container.readinessProbe" @changeProbeEmit="(value)=>{props.container['readinessProbe']=value}" :method="props.method"></Probe>
</template>

<script setup>
import Probe from "./probe.vue";
import {onBeforeMount, reactive} from "vue";

const props=defineProps({
    container:{
        type: Object
    },
    containerIndex:{
        type:Number
    },
    containerType:{
        type: String,
        default:"container"
    },
    probeType:{
        type:String,
    },
    method:{
        type:String,
        default: 'Create'
    }
})
onBeforeMount(()=>{
    if(props.method!='Create'){
        if(!props.container.hasOwnProperty('startupProbe')){
            props.container['startupProbe']={}
        }
        if(!props.container.hasOwnProperty('livenessProbe')){
            props.container['livenessProbe']={}
        }
        if(!props.container.hasOwnProperty('readinessProbe')){
            props.container['readinessProbe']={}
        }
    }


})
</script>

<style scoped>

</style>