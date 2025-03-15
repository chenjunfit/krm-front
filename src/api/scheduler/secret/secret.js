import request from "../../index.js";
import {API_CONFIG} from "../../../config/index.js";

export const getSecretList=(data)=>{
    return request(API_CONFIG.secretListApi,'get',data,
        2000
    )
}
export const getSecret=(data)=>{
    return request(API_CONFIG.deploymentGetApi,'get',data,
        2000
    )
}
export const deleteSecret=(data)=>{
    return request(API_CONFIG.deploymentDeleteApi,'post',data,
        2000
    )
}
export const updateSecret=(data)=>{
    return request(API_CONFIG.deploymentUpdateApi,'post',data,
        2000
    )
}
export const addSecret=(data)=>{
    return request(API_CONFIG.deploymentCreateApi,'post',data,
        2000
    )
}