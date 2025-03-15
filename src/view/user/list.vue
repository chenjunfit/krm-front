<template>
    <el-card
        class="box-card"
        element-loading-text="玩命加载中"
    >
        <template #header>
            <div class="card-header">
                <span>用户列表</span>
                <el-button class="button" text @click="addUser">添加</el-button>
            </div>
            <el-table :data="data.items"
                      style="width: 100%"
                      border
                      height="400px"
                      :default-sort="{ prop: 'id', order: 'ascending' }"
            >
                <el-table-column fixed prop="id" label="Id" width="120" />
                <el-table-column prop="date" label="Date" width="150" />
                <el-table-column prop="name" label="Name" width="120" />
                <el-table-column prop="state" label="State" width="120" />
                <el-table-column prop="city" label="City" width="120" />
                <el-table-column prop="address" label="Address" width="600" />
                <el-table-column prop="zip" label="Zip" width="120" />
                <el-table-column fixed="right" label="Operations" min-width="120">
                    <template #default="scope" >
                        <el-button link type="primary" size="small" @click="handleDelete(scope)">
                            删除
                        </el-button>
                        <el-button link type="primary" size="small" @click="updateUser(scope.row)">编辑</el-button>
                    </template>
                </el-table-column>
            </el-table>
            <el-dialog
                 v-model="dialogVisible"
                :title="defaultMethod=='create'?'创建用户':'更新用户'"
                width="500"
                 @close="closeDialog"
                 destroy-on-close
            >
                <span>
                    <Add @callback="getUserList"
                         @close-dialog-emit="closeDialogEmit"
                         :userForm="userForm"
                         :method="defaultMethod"
                    >

                    </Add>
                </span>
            </el-dialog>
        </template>
    </el-card>

</template>

<script setup>
import {deleteUser, getUserList} from "../../api/user/user.js";
import Add from './add.vue'
import form from './add.vue'
import {onBeforeMount, reactive, ref, toRefs} from "vue";
import {ElMessage,ElMessageBox} from "element-plus";
const loading=ref(true)
const dialogVisible = ref(false)
const defaultMethod=ref("create")
const data=reactive({
    items:[],
    userForm:{
        name:"",
        password:""
    }
})
const {userForm}=toRefs(data)
const getUserListHandler=()=>{
    getUserList().then((response)=>{
        data.items=response.data.data.users
        loading.value=false
        dialogVisible.value=false
    })
}
onBeforeMount(getUserListHandler)
const handleDelete=(scope)=>{
    loading.value=true
    deleteUser(scope.row.id).then((response)=>{
        ElMessageBox.confirm(
            '是否删除用户'+scope.row.name,
            'Warning',
            {
                confirmButtonText: 'OK',
                cancelButtonText: 'Cancel',
                type: 'warning',
            }
        ).then(() => {
                ElMessage({
                    message:"删除用户成功",
                    type:"success"
                })
                getUserList()
            loading.value=false

        })

    })
}

const addUser=()=>{
    data.userForm={}

    defaultMethod.value="create"
    dialogVisible.value=true
}
const updateUser=(row)=>{
    defaultMethod.value="update"
    dialogVisible.value=true
    data.userForm={name:row.name,password: row.address}

}
const closeDialog=()=>{
    getUserListHandler()
}
const closeDialogEmit=()=>{
    dialogVisible.value=false
}


</script>

<style scoped>
.card-header{
    display: flex;
    align-items: center;
    justify-content: space-between;
}
</style>