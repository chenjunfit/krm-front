<template>
    <el-form ref="formRef"
             :model="formData"
             label-width="auto"
             style="max-width:
             600px;"
             :rules="rules"
    >
        <el-form-item label="用户名" prop="name" class="form-item">
            <el-input v-model="formData.name"  />
        </el-form-item>
        <el-form-item label="密码" prop="password" class="form-item">
            <el-input v-model="formData.password" />
        </el-form-item>
        <el-form-item>
            <span style="margin: 10px auto;" >
            <el-button type="primary" @click="onSubmit" >{{ props.method=="create" ? "添加":"更新" }}</el-button>
            <el-button @click="onClear">清空</el-button>
                </span>
        </el-form-item>
    </el-form>
</template>

<script  setup>
import {onBeforeMount, onMounted, reactive, ref, toRefs} from 'vue'
import request from '../../api/index.js'
import {API_CONFIG} from "../../config/index.js";
import {ElMessage} from "element-plus";
import {addUser,updateUser} from "../../api/user/user.js";

// do not use same name with ref
const data=reactive({
    formData:{
        name: "",
        password: "",
    }
})
const {formData} =toRefs(data)
const rules=reactive({
    name:[
        { required: true, message: '请输入用户名', trigger: 'blur' },
    ],
    password:[
        { required: true, message: '请输入密码', trigger: 'blur' },
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
                addUser(formData).then((response)=>{
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
                updateUser(formData).then((response)=>{
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
    userForm:{
        type: Object
    }
})
onMounted(()=>{
    //这么传递会影响父组件数据，单向数据流的约定
    const jsonString=JSON.stringify(props.userForm)
    data.formData=JSON.parse(jsonString)
})

</script>
<style scoped>
.form-item{
    width: 360px;
    margin: 20px auto;
}
</style>