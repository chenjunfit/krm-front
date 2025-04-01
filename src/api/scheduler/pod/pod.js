import request from "../../index.js";
import {API_CONFIG} from "../../../config/index.js";

export const getPodList=(clusterId,nameSpace,fieldSelector,labelSelector)=>{
    return request(API_CONFIG.podListApi,'get',{clusterId,nameSpace,fieldSelector,labelSelector},
        2000
    )
}

export const deletePod=(clusterId,nameSpace,name,ForceDelete)=>{
    return request(API_CONFIG.podDeleteApi,'post',{clusterId,nameSpace,name,ForceDelete},
        2000
    )
}