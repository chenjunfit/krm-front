import {API_CONFIG} from "../../../config/index.js";
import request from "../../index.js";
export const getPvList=(data)=>{
    return request(API_CONFIG.pvListApi,'get',data,
        5000
    )
}
export const getPv=(data)=>{
    return request(API_CONFIG.pvGetApi,'get',data,
        5000
    )
}
export const deletePv=(data)=>{
    return request(API_CONFIG.pvDeleteApi,'post',data,
        5000
    )
}
export const updatePv=(data)=>{
    return request(API_CONFIG.pvUpdateApi,'post',data,
        5000
    )
}
export const addPv=(data)=>{
    return request(API_CONFIG.pvCreateApi,'post',data,
        5000
    )
}