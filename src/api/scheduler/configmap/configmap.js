import {API_CONFIG} from "../../../config/index.js";
import request from "../../index.js";
export const getConfigMapList=(clusterId,nameSpace)=>{
    return request(API_CONFIG.configMapListApi,'get',{clusterId,nameSpace},
        2000
    )
}
export const getConfigMap=(data)=>{
    return request(API_CONFIG.deploymentGetApi,'get',data,
        2000
    )
}
export const deleteConfigMap=(data)=>{
    return request(API_CONFIG.deploymentDeleteApi,'post',data,
        2000
    )
}
export const updateConfigMap=(data)=>{
    return request(API_CONFIG.deploymentUpdateApi,'post',data,
        2000
    )
}
export const addConfigMap=(data)=>{
    return request(API_CONFIG.deploymentCreateApi,'post',data,
        2000
    )
}