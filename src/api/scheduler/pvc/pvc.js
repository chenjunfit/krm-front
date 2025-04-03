import {API_CONFIG} from "../../../config/index.js";
import request from "../../index.js";
export const getPvcList=(clusterId,nameSpace)=>{
    return request(API_CONFIG.pvcListApi,'get',{clusterId,nameSpace},
        5000
    )
}
export const getPvc=(data)=>{
    return request(API_CONFIG.pvcGetApi,'get',data,
        5000
    )
}
export const deletePv=(data)=>{
    return request(API_CONFIG.pvcDeleteApi,'post',data,
        5000
    )
}
export const updatePvc=(data)=>{
    return request(API_CONFIG.pvcUpdateApi,'post',data,
        5000
    )
}
export const addPvc=(data)=>{
    return request(API_CONFIG.pvcCreateApi,'post',data,
        5000
    )
}