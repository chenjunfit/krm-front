<template>
    <el-tabs v-model="activeName" class="demo-tabs" >
        <el-tab-pane label="逐个配置" name="env">
            <el-table border :data="props.env" height="300px">
                <el-table-column label="变量名称" align="center" prop="name">
                    <template #default="scope">
                        <el-form-item style="margin-bottom: 0px" >
                            <el-input style="width: 100%" v-model.trim="scope.row.name" placeholder="变量名称"/>
                        </el-form-item>

                    </template>
                </el-table-column>
                <el-table-column label="变量值" align="center" prop="value" >
                    <template #default="scope">
                        <el-form-item style="margin-bottom: 0px" v-if="scope.row.hasOwnProperty('value')">
                            <el-input  v-model.trim="scope.row.value" placeholder="变量值"/>
                        </el-form-item>
                        <span v-else>暂不支持valueFrom的功能</span>
                    </template>
                </el-table-column>
                <el-table-column align="center">
                    <template #header>
                        <el-button link type="primary" @click="addEnv">添加</el-button>
                    </template>
                    <template #default="scope">
                        <el-button link type="warning" @click="deleteTableRow(props.env,scope.$index)">删除</el-button>
                    </template>
                </el-table-column>
            </el-table>
        </el-tab-pane>
        <el-tab-pane label="批量配置" name="envFrom">
            <el-table border :data="props.envFrom" height="300px">
                <el-table-column label="变量前缀" align="center" prop="name">
                    <template #default="scope">
                        <el-form-item style="margin-bottom: 0px">
                            <el-input style="width: 100%" v-model.trim="scope.row.prefix" placeholder="变量前缀"/>
                        </el-form-item>
                    </template>
                </el-table-column>
                <el-table-column label="类型" align="center" prop="type" >
                    <template #default="scope">
                       <span>
                           {{scope.row.configMapRef?'configMap':'secret'}}
                       </span>
                    </template>
                </el-table-column>
                <el-table-column label="变量配置" align="center" prop="type" >
                    <template #default="scope">
                       <span>
                           <component
                               :is="envTypeComponent[scope.row.configMapRef?'configMap':'secret']"
                               :envItem="scope.row"
                               @closeEnvDialog="()=>{envDialog=false}"
                               method="Update"
                           ></component>
                       </span>
                    </template>
                </el-table-column>
                <el-table-column align="center">
                    <template #header>
                        <el-button link type="primary" @click="addEnvFrom">添加</el-button>
                    </template>
                    <template #default="scope">
                        <el-button link type="warning" @click="deleteTableRow(props.envFrom,scope.$index)">删除</el-button>
                    </template>
                </el-table-column>
            </el-table>
        </el-tab-pane>
    </el-tabs>
  <el-dialog
          v-model="envDialog"
          destroy-on-close
          :title="'使用'+envFromResourceType+'生成环境变量'"
  >
    <el-card>
        <template #header>
            <div class="card-header">
                <div>
                  <el-radio-group v-model="envFromResourceType" >
                      <el-radio label="configMap" >ConfigMap</el-radio>
                      <el-radio label="secret">Secret</el-radio>
                  </el-radio-group>
                </div>

            </div>
        </template>
        <component
            :is="envTypeComponent[envFromResourceType]"
            :envFrom="props.envFrom"
            @closeEnvDialog="()=>{envDialog=false}"
        >

        </component>
    </el-card>
  </el-dialog>
</template>

<script setup>
import {markRaw, reactive, ref, toRefs} from "vue";
import {deleteTableRow} from "../../../utils/index.js";
import Configmap from "./envFrom/configmap.vue";
import Secret from "./envFrom/secret.vue";

const props=defineProps({
    env:{
        type:Array
    },
    envFrom:{
        type:Array
    }
})
const activeName=ref("env")
const envDialog=ref(false)
const envFromResourceType=ref("configMap")
const envType=ref("")
const data=reactive({
    envTypeList:['configMap','secret'],
    envTypeComponent:{
        'secret':markRaw(Secret),
        'configMap':markRaw(Configmap),

    }
})
const {envTypeList,envTypeComponent}=toRefs(data)
const addEnv=()=>{

    const env={
        name:'',
        value:'',
    }
    props.env.unshift(env)
}
const addEnvFrom=()=>{
    envDialog.value=true
}

</script>

<style scoped>
.card-header{
    display: flex;
    align-items: center;
    justify-content: space-between;
}
</style>