import request from "../../index.js";
import {API_CONFIG} from "../../../config/index.js";

export const getSecretList=(data)=>{
    return request(API_CONFIG.secretListApi,'get',data,
        5000
    )
}
export const getSecret=(data)=>{
    return request(API_CONFIG.secretGetApi,'get',data,
        5000
    )
}
export const deleteSecret=(data)=>{
    return request(API_CONFIG.secretDeleteApi,'post',data,
        5000
    )
}
export const updateSecret=(data)=>{
    return request(API_CONFIG.secretUpdateApi,'post',data,
        5000
    )
}
export const addSecret=(data)=>{
    return request(API_CONFIG.secretCreateApi,'post',data,
        5000
    )
}