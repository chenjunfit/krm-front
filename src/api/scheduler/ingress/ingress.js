import request from "../../index.js";
import {API_CONFIG} from "../../../config/index.js";

export const getIngressList=(clusterId,nameSpace)=>{
    return request(API_CONFIG.ingressListApi,'get',{clusterId,nameSpace},
        5000
    )
}
export const getIngressClassList=(clusterId)=>{
    return request(API_CONFIG.ingressClassListApi,'get',{clusterId},
        5000
    )
}
export const getIngress=(data)=>{
    return request(API_CONFIG.ingressGetApi,'get',data,
        5000
    )
}
export const deleteIngress=(id)=>{
    return request(API_CONFIG.ingressDeleteApi,'post',{id},
        5000
    )
}
export const updateIngress=(data)=>{
    return request(API_CONFIG.ingressUpdateApi,'post',data,
        5000
    )
}
export const addIngress=(data)=>{
    return request(API_CONFIG.ingressCreateApi,'post',data,
        5000
    )
}