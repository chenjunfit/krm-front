<template>
    <div class="demo-collapse">
        <el-collapse v-model="activeNames">
            <el-collapse-item title="节点选择器"  name="nodeSelector">
                <template #title>
                    <el-button type="text" >节点选择器</el-button>
                </template>
                <Table :list="props.list" key-name="节点标签" value-name="节点标签值"></Table>

            </el-collapse-item>
        </el-collapse>
    </div>
</template>

<script  setup>
import Table from "../table.vue";
import {ref} from "vue";
const activeNames=ref(['1'])
const props=defineProps({
    list:{
        type: Array,
        default:[]
    }
})
</script>