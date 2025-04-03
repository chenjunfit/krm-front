import request from "../../index.js";
import {API_CONFIG} from "../../../config/index.js";

export const getStatefulsetList=(clusterId,nameSpace)=>{
    return request(API_CONFIG.statefulsetListApi,'get',{clusterId,nameSpace},
        5000
    )
}
export const getStatefulset=(data)=>{
    return request(API_CONFIG.statefulsetGetApi,'get',data,
        5000
    )
}
export const deleteStatefulset=(data)=>{
    return request(API_CONFIG.statefulsetDeleteApi,'post',data,
        5000
    )
}
export const updateStatefulset=(data)=>{
    return request(API_CONFIG.statefulsetUpdateApi,'post',data,
        5000
    )
}
export const addStatefulset=(data)=>{
    return request(API_CONFIG.statefulsetCreateApi,'post',data,
        5000
    )
}