<template>
<el-card class="el-card" >
    <template #header>
        <div class="auto-space-between">
            <div>
              {{props.item.header}}:
                <router-link :to="{path:props.item.resourceType.toLowerCase()+'/list'}">{{props.item.total}}</router-link>
            </div>
            <div>

            </div>
        </div>

    </template>
    <div class="chart" :id="props.item.resourceType">

    </div>
</el-card>
</template>

<script setup>
import {onMounted} from "vue";
import * as echarts from "echarts";
const props=defineProps({
  item:{
      type: Object
  }
})
var option;
option = {
    title: {
        // text: props.item.header,
        // subtext: 'Fake Data',
        left: 'center'
    },
    tooltip: {
        trigger: 'item'
    },
    legend: {
        orient: 'vertical',
        left: 'left'
    },
    series: [
        {
            name: props.item.seriesName,
            type: 'pie',
            radius: '50%',
            data: props.item.data,
            emphasis: {
                itemStyle: {
                    shadowBlur: 10,
                    shadowOffsetX: 0,
                    shadowColor: 'rgba(0, 0, 0, 0.5)'
                }
            }
        }
    ]
};
onMounted(()=>{
    var chartDom = document.getElementById(props.item.resourceType);
    var myChart = echarts.init(chartDom);
    option && myChart.setOption(option);
})
</script>

<style scoped>
* {
    margin: 0;
    padding: 0;
}
.chart {
    position: relative;
    height: 400px;
    width: 400px;
    overflow: hidden;
}
/*.el-card{*/
/*    height: 480px;*/
/*    width: 480px;*/
/*}*/
</style>