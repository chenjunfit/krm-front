import request from "../../index.js";
import {API_CONFIG} from "../../../config/index.js";

export const getDaemonsetList=(clusterId,nameSpace)=>{
    return request(API_CONFIG.daemonsetListApi,'get',{clusterId,nameSpace},
        2000
    )
}
export const getDaemonset=(data)=>{
    return request(API_CONFIG.daemonsetGetApi,'get',data,
        2000
    )
}
export const deleteDaemonset=(data)=>{
    return request(API_CONFIG.daemonsetDeleteApi,'post',data,
        2000
    )
}
export const updateDaemonset=(data)=>{
    return request(API_CONFIG.daemonsetUpdateApi,'post',data,
        2000
    )
}
export const addDaemonset=(data)=>{
    return request(API_CONFIG.daemonsetCreateApi,'post',data,
        2000
    )
}