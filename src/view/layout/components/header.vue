<template>
    <el-header class="el-header">
        <el-button type="text">
            <el-icon :size="20" @click="change"><Fold /></el-icon>
        </el-button>
        <el-button type="text">
            <el-icon :size="20" @click="logout"><SwitchButton /></el-icon>
        </el-button>
    </el-header>
</template>

<script setup>
import {SwitchButton,Fold} from "@element-plus/icons-vue";
import {ElMessage, ElMessageBox} from "element-plus";
import {TOKEN_CONFIG} from "../../../config/index.js";
import {getUserList} from "../../../api/user/user.js";
import router from '../../../routers/index.js'
import {storeToRefs} from "pinia";
import {useIsCollapse} from "../../../store/index.js";
const isCollapse=useIsCollapse()
const change=()=>{
    isCollapse.changeIsCollapse()
}
const logout=()=>{
    ElMessageBox.confirm(
        '是否删退出登录',
        'Warning',
        {
            confirmButtonText: 'OK',
            cancelButtonText: 'Cancel',
            type: 'warning',
        }
    ).then(() => {
        ElMessage({
            message:"退出成功",
            type:"success"
        })
        window.localStorage.removeItem(TOKEN_CONFIG.TOKEN_NAME)
        router.replace("/login")

    })

}
const props=defineProps({
    fold:{
        type: Boolean,
        default: true
    }
})
</script>

<style lang="less" scoped>
.el-header{
    align-items: center;
    height: 50px;
    display: flex;
    justify-content: space-between;
}
</style>