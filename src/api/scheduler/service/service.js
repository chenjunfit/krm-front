import request from "../../index.js";
import {API_CONFIG} from "../../../config/index.js";

export const getServiceList=(clusterId,nameSpace)=>{
    return request(API_CONFIG.serviceListApi,'get',{clusterId,nameSpace},
        5000
    )
}
export const getService=(data)=>{
    return request(API_CONFIG.serviceGetApi,'get',data,
        5000
    )
}
export const deleteService=(id)=>{
    return request(API_CONFIG.serviceDeleteApi,'post',{id},
        5000
    )
}
export const updateService=(data)=>{
    return request(API_CONFIG.serviceUpdateApi,'post',data,
        5000
    )
}
export const addService=(data)=>{
    return request(API_CONFIG.serviceCreateApi,'post',data,
        5000
    )
}