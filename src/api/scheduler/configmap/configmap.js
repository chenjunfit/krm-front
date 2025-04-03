import {API_CONFIG} from "../../../config/index.js";
import request from "../../index.js";
export const getConfigMapList=(clusterId,nameSpace)=>{
    return request(API_CONFIG.configMapListApi,'get',{clusterId,nameSpace},
        5000
    )
}
export const getConfigMap=(data)=>{
    return request(API_CONFIG.configMapGetApi,'get',data,
        5000
    )
}
export const deleteConfigMap=(data)=>{
    return request(API_CONFIG.deploymentDeleteApi,'post',data,
        5000
    )
}
export const updateConfigMap=(data)=>{
    return request(API_CONFIG.configMapUpdateApi,'post',data,
        5000
    )
}
export const addConfigMap=(data)=>{
    return request(API_CONFIG.configMapCreateApi,'post',data,
        5000
    )
}