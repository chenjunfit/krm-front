<template xmlns:el-col="http://www.w3.org/1999/html">
    <el-form ref="formRef"
             :model="formData"
             label-width="140px"
             :rules="rules"
    >
        <div class="cluster-info">
            <div>
                <el-form-item label="集群ID" prop="id" required class="form-item"  >
                    <el-input :disabled="props.method=='update'" placeholder="请输入集群ID" v-model="formData.id"  />
                </el-form-item>
                <el-form-item label="集群名称" prop="displayName" class="form-item" required>
                    <el-input placeholder="请输入集群名称" v-model="formData.displayName" />
                </el-form-item>
                <el-form-item label="位置" class="form-item" required>
                    <el-col :span="9">
                        <el-form-item prop="city" >
                            <el-input placeholder="所在城市"  v-model="formData.city" />
                        </el-form-item>
                    </el-col>
                    <el-col :span="2">-</el-col>
                    <el-col :span="9">
                        <el-form-item prop="district" >
                            <el-input placeholder="所在区" v-model="formData.district" />
                        </el-form-item>
                    </el-col>
                </el-form-item>
            </div>
            <div>
                <el-form-item label-width="70px" prop="kubeconfig" required style="width: 500px" class="form-item">
                    <el-input type="textarea" :rows="6" placeholder="请输入kubeconfig" v-model="formData.kubeconfig"  />
                </el-form-item>
            </div>
        </div>
        <span style="margin: 10px auto;" >
                <el-button type="primary" @click="onSubmit" >{{ props.method=="create" ? "添加":"更新" }}</el-button>
                <el-button @click="onClear">清空</el-button>
        </span>
    </el-form>
</template>

<script  setup>
import {onBeforeMount, onMounted, reactive, ref, toRefs} from 'vue'
import {ElMessage} from "element-plus";
import {addCluster,updateCluster} from "../../api/Cluster/Cluster.js";

// do not use same name with ref
const data=reactive({
    formData:{
        id: "",
        displayName: "",
        city: "",
        district: "",
        kubeconfig: "",
    }
})
const {formData} =toRefs(data)
const rules=reactive({
    id:[
        { required: true, message: '请输入集群ID', trigger: 'blur' },
    ],
    displayName:[
        { required: true, message: '请输入集群名称', trigger: 'blur' },
    ],
    city:[
        { required: true, message: '请输入集群位置', trigger: 'blur' },
    ],

    kubeconfig:[
        { required: true, message: '请输入kubeconfig', trigger: 'blur' },
    ],
})
const formRef=ref()
const loading=ref(false)
const emits=defineEmits(["callback","closeDialogEmit"])
const onSubmit = () => {
    formRef.value.validate((valid)=>{
        if(valid){
            if(props.method=="create"){
                loading.value=true
                addCluster(formData).then((response)=>{
                    ElMessage({
                        message:response.data.message,
                        type:"success"
                    })
                    emits("callback")
                    emits("closeDialogEmit")
                    loading.value=false
                })
            }else{
                loading.value=true
                updateCluster(formData).then((response)=>{
                    ElMessage({
                        message:response.data.message,
                        type:"success"
                    })
                    emits("callback")
                    emits("closeDialogEmit")
                    loading.value=false
                })
            }
        }else {
            ElMessage({
                message:"格式错误",
                type:"warning"
            })
        }
    })

}
const onClear=()=>{
    formRef.value.resetFields()
}
const props=defineProps({
    method: {
        default:"create",
        type:String
    },
    ClusterItem:{
        type: Object
    }
})
onMounted(()=>{
    //这么传递会影响父组件数据，单向数据流的约定
    //data.formData=props.ClusterForm
    const jsonString=JSON.stringify(props.ClusterItem)
    data.formData=JSON.parse(jsonString)
})

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