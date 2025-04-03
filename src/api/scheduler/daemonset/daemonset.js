import request from "../../index.js";
import {API_CONFIG} from "../../../config/index.js";

export const getDaemonsetList=(clusterId,nameSpace)=>{
    return request(API_CONFIG.daemonsetListApi,'get',{clusterId,nameSpace},
        5000
    )
}
export const getDaemonset=(data)=>{
    return request(API_CONFIG.daemonsetGetApi,'get',data,
        5000
    )
}
export const deleteDaemonset=(data)=>{
    return request(API_CONFIG.daemonsetDeleteApi,'post',data,
        5000
    )
}
export const updateDaemonset=(data)=>{
    return request(API_CONFIG.daemonsetUpdateApi,'post',data,
        5000
    )
}
export const addDaemonset=(data)=>{
    return request(API_CONFIG.daemonsetCreateApi,'post',data,
        5000
    )
}