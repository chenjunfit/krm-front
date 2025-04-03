import request from "../../index.js";
import {API_CONFIG} from "../../../config/index.js";

export const getCronJobList=(clusterId,nameSpace)=>{
    return request(API_CONFIG.cronJobListApi,'get',{clusterId,nameSpace},
        5000
    )
}
export const getCronJob=(data)=>{
    return request(API_CONFIG.cronJobGetApi,'get',data,
        5000
    )
}
export const deleteCronJob=(data)=>{
    return request(API_CONFIG.cronJobDeleteApi,'post',data,
        5000
    )
}
export const updateCronJob=(data)=>{
    return request(API_CONFIG.cronJobUpdateApi,'post',data,
        5000
    )
}
export const addCronJob=(data)=>{
    return request(API_CONFIG.cronJobCreateApi,'post',data,
        5000
    )
}