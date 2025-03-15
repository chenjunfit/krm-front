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
                <el-tab-pane label="注释配置" >
                    <el-table :data="annotationList" style=";width: 100%;height: 400px">
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
                                <el-button type="primary" @click="addAnnotationRow">添加</el-button>
                            </template>
                            <template #default="scope">
                                <el-button  type="primary" color="red" @click="deleteTableRow(annotationList,scope.$index)">删除</el-button>
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
import {updateNamespace} from "../../api/cluster/cluster.js";
// do not use same name with ref
const data=reactive({
    editItem:{},
    labelList:[],
    annotationList:[],
})
const {editItem,labelList,annotationList} =toRefs(data)
const formRef=ref()
const loading=ref(false)
const emits=defineEmits(["callback","closeDialogEmit"])
const onSubmit = () => {
    loading.value=true
    data.editItem.metadata.labels=list2object(data.labelList)
    data.editItem.metadata.annotations=list2object(data.annotationList)
    updateNamespace(props.ClusterId,data.editItem.metadata.name,data.editItem).then((response)=>{
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
onMounted(()=>{
    //这么传递会影响父组件数据，单向数据流的约定
    data.editItem=JSON.parse(JSON.stringify(props.EditItem))
    data.labelList= object2list(data.editItem.metadata.labels)
    data.annotationList=object2list(data.editItem.metadata.annotations)
})
const addAnnotationRow=()=>{
    const annotationRow={
        key:"",
        value:""
    }
    data.annotationList.unshift(annotationRow)
}
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
    data.editItem.spec.taints.unshift(taintRow)
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