<template>
    <div class="auto-layout">
            <CustomEcharts
                v-for="(item,index) in items"
                :item="item"
                :key="index">

            </CustomEcharts>
    </div>

</template>

<script setup>
import CustomEcharts from "./components/customEcharts.vue";
import {onBeforeMount, reactive, toRefs} from "vue";
import {getClusterStatics} from "../api/cluster/cluster.js";
const data=reactive({
    // items:[
    //     {
    //         resourceType:"cluster",
    //         header: "集群总数",
    //         total: 25,
    //         seriesName:"集群状态",
    //         data: [
    //             { value: 10, name: 'Active' ,itemStyle: {color: '#228B22'} },
    //             { value: 2, name: 'InActive',itemStyle: {color: '#c23531'}},
    //         ]
    //     },
    //     {
    //         resourceType:"node",
    //         header: "节点总数",
    //         total: 25,
    //         seriesName:"节点分布",
    //         data: [
    //             { value: 10, name: '开发集群' },
    //             { value: 50, name: '生产集群' },
    //             { value: 10, name: '测试集群' },
    //             { value: 20, name: 'UAT集群' },
    //
    //         ]
    //     },
    //     {
    //         resourceType:"deployment",
    //         header: "deployment总数",
    //         total: 25,
    //         seriesName:"deployment分布",
    //         data: [
    //             { value: 10, name: '开发集群' },
    //             { value: 50, name: '生产集群' },
    //             { value: 10, name: '测试集群' },
    //             { value: 20, name: 'UAT集群' },
    //
    //         ]
    //     },
    //
    // ]
    items:[],
})
const {items}=toRefs(data)
onBeforeMount(async ()=>{
    await getClusterStatics().then((res)=>{
        data.items=res.data.data.items
    })
})
</script>


}
<style scoped>
.auto-layout {
    display: flex;
    flex-direction: row;
    /*自动换行*/
    flex-wrap: wrap;
    align-items: center;
    margin-left: 20px;
}
</style>