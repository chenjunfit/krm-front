<template>

<el-button link type="primary" @click="showPod" style="font-size: 12px">{{props.buttonName}}</el-button>
  <el-dialog
          v-model="visable"
          append-to-body
          width="70%"
          center
          draggable
  >
      <template #header="{titleId,titleClass}">
      <div class="my-header">
          <div :id="titleId" :class="titleClass" style="margin: 10px auto 0 auto">
              <el-tag title="集群">
                  {{props.clusterId}}
              </el-tag>
              <el-tag title="类型">
                  {{props.resourceType}}
              </el-tag>
              <el-tag title="节点">
                  {{props.resourceName}}
              </el-tag>
          </div>
      </div>
      </template>
      <div style="height: 400px;overflow: scroll" class="auto-layout" >
            <div v-for="item in items">
                <el-card style="width: 350px;height: 200px ;margin-left: 50px;margin-top: 5px" >
                    <template #header>
                        <div class="auto-space-between" style="height: 32px">
                            <div>
                                <span title="Pod名称" style="font-size: 20px">{{item.metadata.name}}</span>
                                <span style="display: block;font-size: 13px" title="创建时间">{{item.metadata.creationTimestamp}}</span>
                            </div>
                            <div>
                                <el-button v-if="!item.metadata.deletionTimestamp" type="warning" @click="deleteCurrentPod(item.metadata.namespace,item.metadata.name)">删除</el-button>
                                <el-button v-else type="warning" @click="deleteCurrentPod(item.metadata.namespace,item.metadata.name,true)">强制删除</el-button>

                            </div>
                        </div>
                    </template>
                    <div>
                        <!--     展示namespace和状态                   -->
                        <div class="auto-space-between">
                            <div>
                                <el-button :type="item.status.phase=='Running'||item.status.phase=='Succeeded'?'success':'warning'">
                                    <i class="iconfont icon-zhuangtai"></i>
                                    <span style="margin-left: 5px">{{item.status.phase}}</span>
                                </el-button>
                            </div>
                            <div>
                                <el-button type="primary">
                                    <i class="iconfont icon-deploymentunit"></i>
                                    <span style="margin-left: 5px">{{item.metadata.namespace}}</span>
                                </el-button>
                            </div>
                        </div>
                        <!--     展示容器                 -->
                        <div style="margin-top: 10px;" class="auto-layout" >
                            <div :key="c.name" v-for="(c,index) in item.spec.containers" style="margin-right: 10px;margin-bottom: 10px">

                                <el-button :type="getContainerStatus(c.name,item.status.containerStatuses)?'warning':'danger'">
                                    <i class="iconfont icon-rongqi"></i>
                                   <span style="margin-left: 5px">{{c.name}}</span>
                                </el-button>
                            </div>

                        </div>
                    </div>
                </el-card>
            </div>
      </div>
  </el-dialog>

</template>

<script setup>
import {computed, ref} from "vue";
import {deletePod, getPodList} from "../../api/scheduler/pod/pod.js";
import "../../assets/iconfont-schdule/iconfont.css"
import {ElMessage, ElMessageBox} from "element-plus";
const items=ref([])
const props=defineProps({
    buttonName:{
        type: String,
        default:"查看"
    },
    clusterId:{
        type:String
    },
    nameSpace:{
        type:String
    },
    fieldSelector:{
        type:String
    },
    labelSelector:{
        type:String
    },
    resourceType:{
        type:String
    },
    resourceName:{
        type:String
    },
})

const visable=ref(false)
const getPodListHanler=async ()=>{
    await getPodList(props.clusterId,props.nameSpace,props.fieldSelector,props.labelSelector).then((res)=>{
        items.value=res.data.data.items
    })
}
const showPod=async ()=>{
    visable.value=true
    await getPodList(props.clusterId,props.nameSpace,props.fieldSelector,props.labelSelector).then((res)=>{
        items.value=res.data.data.items
    })
}
const getContainerStatus=computed(()=> (containerName,containerStatues)=>{
    if(containerStatues==undefined){
        return false
    }
    for(let i=0;i<containerStatues.length;i++){
        const status=containerStatues[i]
        if(status.name==containerName){
            return status.ready
        }
    }
})
const deleteCurrentPod=(namespace,name,force)=>{
    ElMessageBox.confirm(
        '是否删除Pod: '+name,
        'Warning',
        {
            confirmButtonText: 'OK',
            cancelButtonText: 'Cancel',
            type: 'warning',
        }
    ).then(() => {
        deletePod(props.clusterId,namespace,name,force).then((res)=>{
            ElMessage({
                message:res.data.message,
                type:"success"
            })
            getPodListHanler()
        })

    })

}

</script>

<style scoped>
.el-tag{
    margin-left: 20px;
}
</style>