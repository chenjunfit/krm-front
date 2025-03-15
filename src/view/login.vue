<template>
    <el-card style="width: 480px;margin: 0 auto">
        <h2>后台管理系统</h2>
        <el-form
            ref="loginRef"
            :model="loginInfo"
            :rules="rules"
        >
            <el-form-item  prop="username"  class="form-item">
                <el-input :prefix-icon="User" clearable placeholder="请输入用户名" v-model="loginInfo.username" />
            </el-form-item>
            <el-form-item prop="password" class="form-item">
                <el-input :prefix-icon="Lock" placeholder="请输入密码" show-password v-model="loginInfo.password" type="password" autocomplete="off"/>
            </el-form-item>
            <el-form-item >
                <el-button style="margin: 0 auto" :disabled="loginDisabled" type="primary" @click="submitForm" >
                    登录
                </el-button>
            </el-form-item>
        </el-form>
    </el-card>
</template>
<script setup>
import {reactive, ref,watch} from "vue";
import { User,Lock} from '@element-plus/icons-vue'
import { ElMessage } from 'element-plus'
import {login} from '../api/login.js'
import {TOKEN_CONFIG} from "../config/index.js";
import router from "../routers/index.js"
import request from '../api/index.js'
const loginRef = ref()

const loginInfo =reactive({
    username: "",
    password: "",
})
const rules=reactive({
    username:[
        { required: true, message: '请输入用户名', trigger: 'blur' },
    ],
    password:[
        { required: true, message: '请输入密码', trigger: 'blur' },
    ],
})
let loginDisabled=ref(true)
watch([()=>loginInfo.username,()=>loginInfo.password],()=>{
    loginRef.value.validate((valid)=>{
        if(valid){
            loginDisabled.value=false
        }
    })
})
const submitForm=()=>{
    login(loginInfo.username,loginInfo.password).then((response)=>{
        if(response.data.code==200){
            ElMessage({
                message: '登录成功',
                type: 'success',
            })
            router.replace('/index')
            const token=response.data.data.token
            window.localStorage.setItem(TOKEN_CONFIG.TOKEN_NAME,token)
        }
    })
}
</script>

<style scoped>
.form-item{
    width: 240px;
    margin: 0 auto 15px auto
}
</style>