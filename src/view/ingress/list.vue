<template>
    <List Title="Ingress列表">
        <template #header-options>
            <ClusterNamespaceSelect @namespaceChangeCallback="nsCallBack" >
            </ClusterNamespaceSelect>
            <el-input v-model="search"  style="margin-left: 8px;height: 32px; width: 160px" size="small" placeholder="搜索" />
        </template>
        <template #main>
            <el-table :data="filterTableData"
                      style="width: 100%"
                      border
                      :scrollbar-always-on="true"
                      height="400px"
                      :default-sort="{ prop: 'metadata.creationTimestamp', order:'descending' }"
            >
                <el-table-column fixed prop="metadata.name" align="center" label="名称" width="240">
                    <template #default="scope" >
                        <el-button link type="primary" size="small" @click="detailNode(scope.row)" >
                            {{scope.row.metadata.name}}
                        </el-button>
                    </template>
                </el-table-column>
                <el-table-column  prop="spec.ingressClassName" align="center" label="IngressClass名称" sortable width="240"/>
                <el-table-column  prop="" align="center" label="域名和路径" sortable width="240">
                    <template #default="scope">
                        <template v-for="rule in scope.row.spec.rules" style="display: block">
                            <span style="display: block" v-for="path in rule.http.paths">
                               <li style="text-align: left">{{rule.host}}{{path.path}}</li>
                            </span>
                        </template>
                    </template>
                </el-table-column>

                <el-table-column  prop="metadata.namespace" align="center" label="命名空间" width="120"/>

                <el-table-column fixed="right" align="center" label="操作" width="240">
                    <template #default="scope" >
                        <GenericOptions
                                v-if="!scope.row.metadata.deletionTimestamp"
                                :name="scope.row.metadata.name"
                                :name-space="data.nameSpace"
                                :clusterId="data.clusterId"
                                ResourceType="Ingress"
                                @deleteCallBack="getList"
                        />
                        <el-button type="primary" link @click="showTopology(scope.row)" style="font-size: 12px">拓扑图</el-button>
                    </template>
                </el-table-column>


            </el-table>
            <DialogYaml
                    :clusterId="data.clusterId"
                    :nameSpace="data.nameSpace"
                    :showDialog="detailDialog"
                    :yamlContent="data.yamlData"
                    @closeDialogHandler="(val)=>{detailDialog=val}"
            >

            </DialogYaml>
            <el-dialog
                v-model="showTopologyVisable"
                append-to-body
                width="70%"
                center
                draggable
            >
                <template #header="{titleId,titleClass}">
                    <div class="my-header">
                        <div :id="titleId" :class="titleClass" style="margin: 10px auto 0 auto">
                            <el-tag title="集群">
                                {{data.clusterId}}
                            </el-tag>
                            <el-tag title="命名空间">
                                {{data.nameSpace}}
                            </el-tag>
                            <el-tag title="资源名">
                                {{data.item.metadata.name}}
                            </el-tag>
                        </div>
                    </div>
                </template>
                <div id="mynetwork"></div>
<!--                <template #footer>-->
<!--                    <div >-->
<!--                        <el-button type="primary" @click="rollback=false">取消</el-button>-->
<!--                        <el-button  type="primary"  @click="rollbackDeployment" >确认</el-button>-->
<!--                    </div>-->
<!--                </template>-->
            </el-dialog>
        </template>
    </List>

</template>

<script setup>
import ClusterNamespaceSelect from "../components/clusterNamespaceSelect.vue";
import List from "../components/list.vue"
import {computed, onBeforeMount, onMounted, reactive, ref, toRefs} from "vue";
import {deletePod, getPodList} from "../../api/scheduler/pod/pod.js";
import {ElMessage, ElMessageBox} from "element-plus";
import {getClusterList} from "../../api/cluster/cluster.js";
import Detail from "../namespace/detail.vue";
import {Codemirror} from "vue-codemirror";
import codeMirror from "../components/codeMirror.vue"
import {yaml} from "@codemirror/legacy-modes/mode/yaml";
import {obj2yaml} from "../../utils/index.js";
import {deleteDeployment, getDeploymentList} from "../../api/scheduler/deployment/deployment.js";
import DialogYaml from "../components/dialogYaml/dialogYaml.vue";
import {useRouter} from 'vue-router'
import GenericOptions from "../components/genericOptions.vue";
import {getIngressList, getIngressTopologyApi} from "../../api/scheduler/ingress/ingress.js";
import CodeMirror from "../components/codeMirror.vue";
import { Network } from 'vis-network'
import { DataSet } from 'vis-data'


const router=useRouter()

const detailDialog=ref(false)
const showTopologyVisable=ref(false)
const data=reactive({
    clusterId:"",
    nameSpace:"",
    items:[],
    item:Object,
    yamlData:"",
})
const search = ref('')
const {clusterId,namespace,items,yamlData}=toRefs(data)
const filterTableData = computed(() =>
    (data.items||[]).filter(
        (item) =>
            !search.value ||
            item.metadata.name.toLowerCase().includes(search.value.toLowerCase())
    )
)
const showTopology= async (row)=>{
    showTopologyVisable.value=true
    data.item=row
    const param={
        clusterId: data.clusterId,
        nameSpace: data.nameSpace,
        name: row.metadata.name
    }
    var nodes =null
    var edges=null
    await getIngressTopologyApi(param).then((res)=>{
        nodes=res.data.data.nodes
        edges=res.data.data.edges
    })




    // create a network
    const container = document.getElementById("mynetwork");
    var dataIngress = {
        nodes: nodes,
        edges: edges,
    };
    const options = {
        edges:{
            arrows:{
                to: {
                    enabled: true
                }
            }
        },
        nodes:{
            shadow:true
        },
        layout:{
            hierarchical:{
                direction:"UD",
                sortMethod: "directed",
                levelSeparation:100,
            }
        }
    };
    const network = new Network(container, dataIngress, options);
}
const nsCallBack=(clusterId,nameSpace)=>{
    data.clusterId=clusterId
    data.nameSpace=nameSpace
    getList()
}
const deleteCallBack=()=>{
    getList()
}
const getList=()=>{
    getIngressList(data.clusterId,data.nameSpace).then((response)=>{
        data.items=response.data.data.items
    })
}

const detailNode=(row)=>{
    detailDialog.value=true
    const item=JSON.parse(JSON.stringify(row))
    delete item.metadata.managedFields
    const itemTemp={
        "apiVersion":"networking.k8s.io/v1",
        "kind":"Ingress",
        "metadata":item.metadata,
        "spec":item.spec
    }
    data.yamlData=obj2yaml(itemTemp)
}
</script>

<style scoped>
.el-tag{
    margin-left: 20px;
}
#mynetwork {
    width: 100%;
    height: 400px;
    border: 1px solid lightgray;
}
</style>