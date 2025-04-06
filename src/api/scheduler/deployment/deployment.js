import request from "../../index.js";
import {API_CONFIG} from "../../../config/index.js";

export const getDeploymentList=(clusterId,nameSpace)=>{
    return request(API_CONFIG.deploymentListApi,'get',{clusterId,nameSpace},
        5000
    )
}
export const getDeployment=(data)=>{
    return request(API_CONFIG.deploymentGetApi,'get',data,
        5000
    )
}
export const deleteDeployment=(id)=>{
    return request(API_CONFIG.deploymentDeleteApi,'post',{id},
        5000
    )
}
export const updateDeployment=(data)=>{
    return request(API_CONFIG.deploymentUpdateApi,'post',data,
        5000
    )
}
export const addDeployment=(data)=>{
    return request(API_CONFIG.deploymentCreateApi,'post',data,
        5000
    )
}
export const getReplicasetList=(clusterId,nameSpace,fieldSelector,labelSelector)=>{
    return request(API_CONFIG.replicasetListApi,'get',{clusterId,nameSpace,fieldSelector,labelSelector},
        5000
    )
}