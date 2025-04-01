<template xmlns:el-col="http://www.w3.org/1999/html">
    <el-form ref="formRef"
             :model="editItem"
             style="width: 100%"
    >
        <div>
            <el-tabs >
                <el-tab-pane label="标签配置" >
                        <el-table :data="labelList" style=";width: 100%;height: 400px">
                            <el-table-column prop="key" label="key" width="400" >
                                <template #default="scope">
                                    <el-input  v-model="scope.row.key"  placeholder="请输入标签的Key" />
                                </template>
                            </el-table-column>
                            <el-table-column prop="value" label="value" width="200" >
                                <template #default="scope">
                                    <el-input v-model:="scope.row.value" placeholder="请输入标签的Value"/>
                                </template>
                            </el-table-column>
                            <el-table-column fixed="right" width="" >
                                <template #header>
                                    <el-button type="primary" @click="addLabelRow">添加</el-button>
                                </template>
                                <template #default="scope">
                                    <el-button  type="primary" color="red" @click="deleteTableRow(labelList,scope.$index)">删除</el-button>
                                </template>
                            </el-table-column>

                        </el-table>
                </el-tab-pane>
                <el-tab-pane label="污点配置" >
                    <el-table :data="data.taintList" style="width: 100%;height: 400px;">
                        <el-table-column prop="key" label="key" width="220" >
                            <template #default="scope">
                                <el-input v-model="scope.row.key" placeholder="请输入标签的Key"/>
                            </template>
                        </el-table-column>
                        <el-table-column prop="value" label="value" width="220" >
                            <template #default="scope">
                                <el-input v-model:="scope.row.value" placeholder="请输入标签的Value"/>
                            </template>
                        </el-table-column>
                        <el-table-column prop="effect" label="effect" width="200"  >
                            <template #default="scope">
                                <el-select
                                    v-model="scope.row.effect"
                                    placeholder="Select"
                                    size="default"
                                    style="width: 150px"
                                >
                                    <el-option
                                        v-for="item in taintsOptions"
                                        :key="item.value"
                                        :label="item.label"
                                        :value="item.value"
                                    />
                                </el-select>
                            </template>
                        </el-table-column>
                        <el-table-column fixed="right" >
                            <template #header>
                                <el-button type="primary" @click="addTaintRow">添加</el-button>
                            </template>
                            <template #default="scope">
                                <el-button  type="primary" color="red" @click="deleteTableRow(data.taintList,scope.$index)">删除</el-button>
                            </template>
                        </el-table-column>

                    </el-table>

                </el-tab-pane>
            </el-tabs>

        </div>

        <div style="text-align: center" >
                <el-button type="primary" @click="onSubmit" >更新</el-button>
        </div>
    </el-form>
</template>

<script  setup>
import {onBeforeMount, onMounted, reactive, ref, toRefs} from 'vue'
import {ElMessage} from "element-plus";
import {object2list,deleteTableRow,list2object} from "../../utils/index.js";
import {getNodeList, updateNode} from "../../api/cluster/cluster.js";
// do not use same name with ref
const data=reactive({
    editItem:{
        spec:{
            taints:Object,
        }
    },
    labelList:[],
    taintList:[],
    taintsOptions:[
        {label:"禁止调度",value:"NoSchedule"},
        {label:"尽量不调度",value:"PreferNoSchedule"},
        {label:"驱逐",value:"NoExecute"},
    ]


})
const {editItem,labelList,taintsOptions} =toRefs(data)
const formRef=ref()
const loading=ref(false)
const emits=defineEmits(["callback","closeDialogEmit"])
const onSubmit = () => {
    loading.value=true
    data.editItem.metadata.labels=list2object(data.labelList)
    data.editItem.spec.taints=data.taintList
    updateNode(props.ClusterId,data.editItem.metadata.name,data.editItem).then((response)=>{
        ElMessage({
            message:response.data.message,
            type:"success"
        })
        emits("callback")
        emits("closeDialogEmit")
        loading.value=false
    })
}
const onClear=()=>{
    formRef.value.resetFields()
}
const props=defineProps({
    EditItem:{
        type: Object
    },
    ClusterId:{
        type: String
    }
})
onBeforeMount(()=>{
    //这么传递会影响父组件数据，单向数据流的约定
    data.editItem=JSON.parse(JSON.stringify(props.EditItem))
    if(data.editItem.metadata.labels!=null&&data.editItem.metadata.labels!=undefined){
        data.labelList=object2list(data.editItem.metadata.labels)
    }else{
        data.labelList=[]
    }
    if(data.editItem.spec.taints==undefined){
        data.taintList=[]
    }else {
        data.taintList=data.editItem.spec.taints
    }


})

const addLabelRow=()=>{
    const labelRow={
        key:"",
        value:""
    }
    data.labelList.unshift(labelRow)
}
const addTaintRow=()=>{
    const taintRow={
        key:"",
        value:"",
        effect:"NoExecute"
    }
    data.taintList.unshift(taintRow)
}
</script>
<style scoped>
.form-item{
    width: 360px;
    margin: 0 auto 20px 0;
}
.cluster-info{
    display: flex;
    flex-direction: row;
}
</style>