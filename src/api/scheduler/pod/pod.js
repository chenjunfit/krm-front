import request from "../../index.js";
import {API_CONFIG} from "../../../config/index.js";

export const getPodList=(clusterId,nameSpace,fieldSelector,labelSelector)=>{
    return request(API_CONFIG.podListApi,'get',{clusterId,nameSpace,fieldSelector,labelSelector},
        5000
    )
}

export const deletePod=(clusterId,nameSpace,name,ForceDelete)=>{
    return request(API_CONFIG.podDeleteApi,'post',{clusterId,nameSpace,name,ForceDelete},
        5000
    )
}
export const deletePodList=(clusterId,nameSpace,deleteList,forceDelete)=>{
    console.log("deletePodlist",clusterId,nameSpace,deleteList,forceDelete)
    return request(API_CONFIG.podDeleteListApi,'post',{clusterId,nameSpace,deleteList,forceDelete},
        5000
    )
}